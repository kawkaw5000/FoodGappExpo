import os
import uuid
import logging
from datetime import datetime, timedelta
from functools import lru_cache
import re
import difflib
from collections import defaultdict
import google.generativeai as genai
import pandas as pd
import requests
from flask import Flask, request, jsonify
from flask_cors import CORS
from dotenv import load_dotenv
import mimetypes

load_dotenv()

# -------------------------------------------------------------------
# Chat system data structures
# -------------------------------------------------------------------
conversation_history = defaultdict(list)
rate_limiter = defaultdict(list)
daily_chat_limiter = defaultdict(lambda: {"date": None, "count": 0})

# -------------------------------------------------------------------
# Logging
# -------------------------------------------------------------------
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s %(levelname)s %(name)s :: %(message)s"
)
log = logging.getLogger("meal-backend")

gemini_key = os.getenv("GEMINI_SECRET_KEY")
if not gemini_key:
    log.error("GEMINI_SECRET_KEY not set - chat will not work")
else:
    log.info("GEMINI_SECRET_KEY loaded successfully")
# -------------------------------------------------------------------
# API Keys
# -------------------------------------------------------------------
USDA_API_KEY = os.getenv("USDA_API_KEY")
API_NINJAS_KEY = os.getenv("API_NINJAS_KEY")
genai.configure(api_key=os.getenv("GEMINI_SECRET_KEY"))
if not USDA_API_KEY:
    log.error("USDA_API_KEY not set (USDA lookup disabled)")
if not API_NINJAS_KEY:
    log.error("API_NINJAS_KEY not set (API Ninjas lookup disabled)")

# -------------------------------------------------------------------
# Flask
# -------------------------------------------------------------------
app = Flask(__name__)
CORS(app)

DATA_FILE = os.getenv("FEL_CSV", "fel_data.csv")
DEFAULT_PORT = int(os.getenv("PORT", "5000"))

# -------------------------------------------------------------------
# URLs for external APIs
# -------------------------------------------------------------------
# Global rate limiter for API calls
USDA_URL = "https://api.nal.usda.gov/fdc/v1/foods/search"
NINJAS_URL = "https://api.api-ninjas.com/v1/nutrition"


# -------------------------------------------------------------------
# Chat helper functions
# -------------------------------------------------------------------
def is_nutrition_fitness_topic(message: str) -> bool:
    """Check if the message is related to nutrition/fitness topics"""
    nutrition_keywords = [
        # Food and nutrition
        'food', 'foods', 'eat', 'eating', 'meal', 'meals', 'nutrition', 'nutritional',
        'calories', 'calorie', 'protein', 'carbs', 'carbohydrates', 'fat', 'sugar',
        'vitamin', 'mineral', 'fiber', 'sodium', 'cholesterol',

        # Diet and health
        'diet', 'dieting', 'healthy', 'health', 'weight', 'bmi', 'lose weight',
        'gain weight', 'maintain weight', 'obesity', 'underweight', 'overweight',

        # Exercise and fitness
        'exercise', 'workout', 'fitness', 'gym', 'training', 'activity', 'burn calories',
        'muscle', 'strength', 'cardio', 'running', 'walking', 'sports',

        # Filipino food context
        'rice', 'adobo', 'sinigang', 'lumpia', 'pancit', 'lechon', 'bangus',
        'kangkong', 'ampalaya', 'mongo', 'pinakbet', 'taho', 'halo-halo',

        # Meal planning
        'breakfast', 'lunch', 'dinner', 'snack', 'recipe', 'cooking', 'ingredients',
        'portion', 'serving', 'grams', 'cup', 'tablespoon',

        # Health conditions
        'diabetes', 'hypertension', 'cholesterol', 'heart', 'blood pressure',
        'allergies', 'lactose', 'gluten',

        # Common fruits and vegetables that should be recognized as health topics
        'apple', 'banana', 'orange', 'mango', 'grapes', 'strawberry', 'pineapple',
        'tomato', 'carrot', 'broccoli', 'spinach', 'lettuce', 'cabbage',

        # Wellness and general health terms
        'wellness', 'wellbeing', 'tips', 'advice', 'recommend', 'suggestion',
        'good', 'best', 'better', 'should', 'can', 'how', 'what', 'why',
        'example', 'about', 'help', 'guide'
    ]

    message_lower = message.lower()
    return any(keyword in message_lower for keyword in nutrition_keywords)


def check_rate_limit(user_id: str, max_requests: int = 10, window_minutes: int = 5) -> bool:
    """Check if user has exceeded rate limit"""
    now = datetime.now()
    cutoff = now - timedelta(minutes=window_minutes)

    # Clean old requests
    rate_limiter[user_id] = [req_time for req_time in rate_limiter[user_id] if req_time > cutoff]

    # Check if under limit
    if len(rate_limiter[user_id]) >= max_requests:
        return False

    # Add current request
    rate_limiter[user_id].append(now)
    return True


def check_daily_chat_limit(user_id: str, max_daily_chats: int = 10) -> tuple[bool, int]:
    """Check if user has exceeded daily chat limit. Returns (can_chat, remaining_chats)"""
    today = datetime.now().date().isoformat()
    user_data = daily_chat_limiter[user_id]

    # Reset counter if new day
    if user_data["date"] != today:
        user_data["date"] = today
        user_data["count"] = 0

    can_chat = user_data["count"] < max_daily_chats

    if can_chat:
        user_data["count"] += 1
        remaining = max_daily_chats - user_data["count"]
    else:
        remaining = 0

    return can_chat, remaining


def get_ai_nutrition_response(message: str, user_id: str) -> str:
    """Get AI response for nutrition/fitness questions using Gemini"""
    try:
        # Build context from conversation history
        history = conversation_history[user_id][-5:]  # Last 5 exchanges
        context = ""
        if history:
            context = "Previous conversation:\n"
            for entry in history:
                context += f"User: {entry['user']}\nAI: {entry['ai']}\n"
            context += "\nCurrent question:\n"

        # Enhanced system prompt for Filipino nutrition focus
        system_prompt = """You're a friendly nutrition buddy! Talk like you're chatting with a friend about food and health. 

Be conversational, warm, and straight to the point. Use simple English language and keep it short - just 2-3 sentences max. 

Focus on Filipino foods and eating habits, but always respond in English. Give practical tips that Filipinos can actually follow. No need to be formal or list things - just chat naturally!

Examples of your tone:
- "Pork adobo is pretty high in sodium, so maybe have it with extra rice and vegetables to balance it out!"
- "For breakfast, try tapsilog but go easy on the garlic rice - maybe half a cup is good."
- "That's a lot of calories! Consider smaller portions or add more vegetables to fill you up."

Keep it real, keep it simple, keep it short, and always respond in English only!"""

        full_prompt = f"{system_prompt}\n\n{context}User: {message}\n\nAI:"

        model = genai.GenerativeModel("gemini-2.5-flash")
        response = model.generate_content(full_prompt)

        # Store in conversation history
        conversation_history[user_id].append({
            'user': message,
            'ai': response.text,
            'timestamp': datetime.now().isoformat()
        })

        # Keep only last 10 exchanges per user
        if len(conversation_history[user_id]) > 10:
            conversation_history[user_id] = conversation_history[user_id][-10:]

        return response.text.strip()

    except Exception as e:
        log.error(f"AI response generation failed: {e}")
        return "I'm having trouble generating a response right now. Please try asking about specific Filipino foods, meal planning, or nutrition questions."


# -------------------------------------------------------------------
# Helpers
# -------------------------------------------------------------------
def safe_float(v, d=0.0):
    try:
        return float(v)
    except Exception:
        return d


def calculate_atwater_kcal(protein_g: float, fat_g: float, carbs_g: float) -> float:
    """Atwater 4-4-9 formula for calorie calculation"""
    return round((safe_float(protein_g) * 4.0) + (safe_float(carbs_g) * 4.0) + (safe_float(fat_g) * 9.0), 2)


def normalize_text(s: str) -> str:
    if s is None:
        return ""
    s = str(s).lower()
    s = re.sub(r"[^\w\s]", " ", s)  # Remove punctuation
    s = re.sub(r"\s+", " ", s).strip()
    return s


# -------------------------------------------------------------------
# Load FEL dataset (normalize columns)
# -------------------------------------------------------------------
@lru_cache(maxsize=1)
def load_dataset(path: str):
    if not os.path.exists(path):
        log.error("Dataset file not found: %s", path)
        return pd.DataFrame()
    try:
        df = pd.read_csv(path)
        cols = {c.lower().strip(): c for c in df.columns}

        # Normalize Food column
        food_col = cols.get("food") or cols.get("foodid") or df.columns[0]
        df["Food_raw"] = df[food_col].astype(str)
        df["Food"] = df["Food_raw"].apply(normalize_text)

        # Portion
        portion_col = cols.get("foodgramamount")
        df["Portion(g)"] = df[portion_col].apply(lambda v: safe_float(v, 100)) if portion_col else 100.0

        # Nutrient columns
        def find_col(cands):
            for c in cands:
                if c in cols:
                    return cols[c]
            return None

        cho_col = find_col(["carbs"])
        pro_col = find_col(["protein"])
        fat_col = find_col(["fat"])
        energy_col = find_col(["calories"])
        sugar_col = find_col(["sugar"])
        micronutrients_col = find_col(["micronutrients"])

        df["CHO(g)"] = df[cho_col].apply(lambda v: safe_float(v, 0)) if cho_col else 0.0
        df["PRO(g)"] = df[pro_col].apply(lambda v: safe_float(v, 0)) if pro_col else 0.0
        df["FAT(g)"] = df[fat_col].apply(lambda v: safe_float(v, 0)) if fat_col else 0.0
        df["Energy(kcal)"] = df[energy_col].apply(lambda v: safe_float(v, 0)) if energy_col else 0.0
        df["Sugar(g)"] = df[sugar_col].apply(lambda v: safe_float(v, 0)) if sugar_col else 0.0
        df["MicroNutrients"] = df[micronutrients_col].fillna("").astype(str) if micronutrients_col else ""

        # Category
        cat_col = find_col(["foodcategoryid"])
        df["Category"] = df[cat_col].astype(str) if cat_col else "Unknown"

        # Source
        src_col = find_col(["source"])
        df["Source"] = df[src_col].astype(str) if src_col else "FEL"

        log.info("Loaded FEL dataset rows=%d", len(df))
        return df
    except Exception as e:
        log.exception("Failed to load dataset: %s", e)
        return pd.DataFrame()


fel = load_dataset(DATA_FILE)


# -------------------------------------------------------------------
# FEL lookup with caching
# -------------------------------------------------------------------
@lru_cache(maxsize=256)
def lookup_fel(food: str):
    food_norm = normalize_text(food)
    match_row, lookup_path = fel_find_match(food_norm)
    if match_row is None:
        log.warning("No FEL match found for %s", food_norm)
        return None
    return {
        "Protein": float(match_row.get("PRO(g)", 0)),
        "Fat": float(match_row.get("FAT(g)", 0)),
        "Carbs": float(match_row.get("CHO(g)", 0)),
        "Calories": float(match_row.get("Energy(kcal)", 0)),
        "Sugar": float(match_row.get("Sugar(g)", 0)),  # Add Sugar support
        "Portion": float(match_row.get("Portion(g)", 100)),
        "MicroNutrients": str(match_row.get("MicroNutrients", "")),  # Add MicroNutrients support
        "lookup_path": lookup_path
    }


# -------------------------------------------------------------------
# FEL matching: exact -> token-set -> contains -> fuzzy
# -------------------------------------------------------------------
def fel_find_match(name: str):
    if fel is None or fel.empty or not name:
        log.error("FEL dataset unavailable or empty for match lookup")
        return None, None
    q = normalize_text(name)

    # Exact match
    exact = fel[fel["Food"] == q]
    if not exact.empty:
        return exact.iloc[0], "FEL-exact"

    # Token-set match
    q_tokens = set(q.split())
    for _, row in fel.iterrows():
        toks = set(str(row["Food"]).split())
        if q_tokens and (q_tokens.issubset(toks) or toks.issubset(q_tokens)):
            return row, "FEL-tokenset"

    # Contains (substring)
    contains = fel[fel["Food"].str.contains(q, na=False)]
    if not contains.empty:
        return contains.iloc[0], "FEL-contains"

    # Fuzzy match
    choices = fel["Food"].dropna().astype(str).unique().tolist()
    close = difflib.get_close_matches(q, choices, n=1, cutoff=0.75)
    if close:
        matched = fel[fel["Food"] == close[0]]
        if not matched.empty:
            return matched.iloc[0], "FEL-fuzzy"

    log.warning("No match found for %s after all methods", q)
    return None, None


# -------------------------------------------------------------------
# External API Fallbacks (caching)
# -------------------------------------------------------------------
external_cache = {}  # key: (food, grams_rounded) -> dict


def cache_key(food_name: str, grams: float):
    return (normalize_text(food_name), int(round(grams)))


def cached_return(food_name: str, grams: float):
    return external_cache.get(cache_key(food_name, grams))


def store_cache(food_name: str, grams: float, value: dict):
    external_cache[cache_key(food_name, grams)] = value


def normalize_external_item(food_name: str, grams: float, src: str, calories=0, protein=0, fat=0, carbs=0, sugar=0,
                            micronutrients=""):
    return {
        "NutrientLogId": str(uuid.uuid4()),
        "FoodCategoryId": src,
        "FoodId": normalize_text(food_name),
        "Calories": round(calories, 2),
        "Protein": round(protein, 2),
        "Fat": round(fat, 2),
        "Carbs": round(carbs, 2),
        "Sugar": round(sugar, 2),  # Add Sugar field
        "MicroNutrients": micronutrients,  # Add MicroNutrients field
        "UserId": "Unknown",
        "FoodGramAmount": float(grams),
        "Source": src
    }


def lookup_usda(food_name: str, grams: float):
    if not USDA_API_KEY:
        return None
    try:
        params = {"query": food_name, "api_key": USDA_API_KEY, "pageSize": 1}
        r = requests.get(USDA_URL, params=params, timeout=7)
        if r.status_code != 200:
            log.warning("USDA lookup status %s for %s", r.status_code, food_name)
            return None
        foods = r.json().get("foods", [])
        if not foods:
            return None
        f = foods[0]

        # Log the food description to see what we're getting
        food_desc = f.get("description", "Unknown")
        log.info("USDA found: %s for query: %s", food_desc, food_name)

        nutrients = {n.get("nutrientName").lower(): n.get("value") for n in f.get("foodNutrients", []) if
                     "nutrientName" in n}

        protein = safe_float(nutrients.get("protein", 0))
        fat = safe_float(nutrients.get("total lipid (fat)", 0))
        carbs = safe_float(nutrients.get("carbohydrate, by difference", 0))

        # Enhanced sugar extraction with debugging
        sugar = 0
        sugar_candidates = [
            "sugars, total including nlea",
            "sugars, total",
            "sugars, added",
            "total sugars",
            "sugar",
            "sugars"
        ]

        for candidate in sugar_candidates:
            sugar = safe_float(nutrients.get(candidate, 0))
            if sugar > 0:
                log.info("Found sugar for %s using field '%s': %s", food_name, candidate, sugar)
                break

        # USDA values are per 100g, so we need to scale to requested grams
        scale = grams / 100.0
        log.info("USDA scaling for %s: %s grams / 100g = %s factor", food_name, grams, scale)
        log.info("USDA raw values (per 100g): cal=%.2f prot=%.2f fat=%.2f carbs=%.2f sugar=%.2f",
                 calculate_atwater_kcal(protein, fat, carbs), protein, fat, carbs, sugar)

        # Build micronutrients string with proper scaling
        micronutrients_list = []
        micro_map = {
            "fiber, total dietary": ("Fiber", "g"),
            "sodium, na": ("Sodium", "mg"),
            "vitamin c, total ascorbic acid": ("Vit C", "mg"),
            "vitamin a, rae": ("Vit A", "mcg"),
            "calcium, ca": ("Calcium", "mg"),
            "iron, fe": ("Iron", "mg"),
            "potassium, k": ("Potassium", "mg"),
            "cholesterol": ("Cholesterol", "mg")
        }

        for usda_name, (friendly_name, unit) in micro_map.items():
            val = safe_float(nutrients.get(usda_name, 0))
            if val > 0:
                scaled_val = val * scale
                if scaled_val >= 0.1:
                    micronutrients_list.append(f"{friendly_name}: {scaled_val:.1f}{unit}")

        micronutrients = ", ".join(micronutrients_list)

        calories = calculate_atwater_kcal(protein, fat, carbs)
        scaled_values = {
            "calories": calories * scale,
            "protein": protein * scale,
            "fat": fat * scale,
            "carbs": carbs * scale,
            "sugar": sugar * scale
        }

        log.info("USDA scaled values for %sg: cal=%.2f prot=%.2f fat=%.2f carbs=%.2f sugar=%.2f",
                 grams, scaled_values["calories"], scaled_values["protein"],
                 scaled_values["fat"], scaled_values["carbs"], scaled_values["sugar"])

        return normalize_external_item(
            food_name, grams, "USDA",
            scaled_values["calories"], scaled_values["protein"], scaled_values["fat"],
            scaled_values["carbs"], scaled_values["sugar"], micronutrients
        )
    except Exception as e:
        log.warning("USDA lookup failed for %s: %s", food_name, e)
        return None


def lookup_api_ninjas(food_name: str, grams: float):
    if not API_NINJAS_KEY:
        return None
    try:
        r = requests.get(
            NINJAS_URL,
            params={"query": f"{int(grams)} g {food_name}"},
            headers={"X-Api-Key": API_NINJAS_KEY},
            timeout=7
        )
        if r.status_code != 200:
            log.warning("API Ninjas lookup status %s for %s", r.status_code, food_name)
            return None
        arr = r.json()
        if not arr:
            return None
        d = arr[0]
        protein = safe_float(d.get("protein_g"), 0)
        fat = safe_float(d.get("fat_total_g"), 0)
        carbs = safe_float(d.get("carbohydrates_total_g"), 0)
        sugar = safe_float(d.get("sugar_g"), 0)

        # FIXED: API Ninjas already returns values for the requested portion size, no additional scaling needed
        micronutrients_list = []
        micro_data = [
            ("Fiber", d.get("fiber_g"), "g"),
            ("Sodium", d.get("sodium_mg"), "mg"),
            ("Potassium", d.get("potassium_mg"), "mg"),
            ("Vit A", d.get("vitamin_a_mcg"), "mcg"),
            ("Vit C", d.get("vitamin_c_mg"), "mg"),
            ("Calcium", d.get("calcium_mg"), "mg"),
            ("Iron", d.get("iron_mg"), "mg"),
            ("Cholesterol", d.get("cholesterol_mg"), "mg")
        ]
        for name, val, unit in micro_data:
            val = safe_float(val, 0)
            if val > 0:
                micronutrients_list.append(f"{name}: {val:.1f}{unit}")
        micronutrients = ", ".join(micronutrients_list)
        log.info("Micronutrients for %s (%sg): %s", food_name, grams, micronutrients)

        calories = calculate_atwater_kcal(protein, fat, carbs)
        return normalize_external_item(food_name, grams, "API_Ninjas", calories, protein, fat, carbs, sugar,
                                       micronutrients)
    except Exception as e:
        log.warning("API Ninjas lookup failed for %s: %s", food_name, e)
        return None


def external_fallback(food_name: str, grams: float):
    cached = cached_return(food_name, grams)
    if cached:
        return cached
    for fn in (lookup_usda, lookup_api_ninjas):
        item = fn(food_name, grams)
        if item:
            store_cache(food_name, grams, item)
            return item
    log.warning("No external data found for %s", food_name)
    empty = normalize_external_item(food_name, grams, "None", 0, 0, 0, 0)
    empty["Note"] = "No external data"
    store_cache(food_name, grams, empty)
    return empty


# -------------------------------------------------------------------
# Unified lookup
# -------------------------------------------------------------------
def unified_lookup(food: str, grams: float):
    food_norm = normalize_text(food)
    sources = []

    log.info("Unified lookup for '%s' (%sg edible portion)", food_norm, grams)

    # 1. FEL lookup first (prioritize Philippine standards)
    fel_data = lookup_fel(food_norm)
    if fel_data and any([fel_data["Protein"], fel_data["Fat"], fel_data["Carbs"]]):
        sources.append(fel_data["lookup_path"])
        portion = fel_data.get("Portion", 100) or 100

        # FEL data is per 100g, scale to requested grams
        scale = grams / 100.0
        log.info("FEL scaling for %s: %s grams / 100g FEL base = %s factor", food_norm, grams, scale)

        base = {
            "Protein": round(fel_data["Protein"] * scale, 2),
            "Fat": round(fel_data["Fat"] * scale, 2),
            "Carbs": round(fel_data["Carbs"] * scale, 2),
            "Calories": round(fel_data["Calories"] * scale, 2),
            "Sugar": round(fel_data["Sugar"] * scale, 2),
            "MicroNutrients": fel_data["MicroNutrients"]
        }

        log.info("FEL scaled values for %sg: cal=%.2f prot=%.2f fat=%.2f carbs=%.2f",
                 grams, base["Calories"], base["Protein"], base["Fat"], base["Carbs"])

        # If FEL doesn't have micronutrients, try external APIs
        if not base["MicroNutrients"] or base["MicroNutrients"].strip() == "":
            log.info("FEL missing micronutrients for %s, trying external APIs", food_norm)
            usda_data = lookup_usda(food_norm, grams)
            if usda_data and usda_data.get("MicroNutrients"):
                base["MicroNutrients"] = usda_data["MicroNutrients"]
                sources.append("USDA-micro")
            else:
                nin_data = lookup_api_ninjas(food_norm, grams)
                if nin_data and nin_data.get("MicroNutrients"):
                    base["MicroNutrients"] = nin_data["MicroNutrients"]
                    sources.append("Ninjas-micro")

    else:
        log.info("No FEL match for %s, trying external APIs", food_norm)
        # 2. USDA lookup as fallback
        usda_data = lookup_usda(food_norm, grams)
        if usda_data:
            sources.append("USDA")
            base = usda_data
        else:
            # 3. API Ninjas lookup as last resort
            nin_data = lookup_api_ninjas(food_norm, grams)
            if nin_data:
                sources.append("API_Ninjas")
                base = nin_data
            else:
                sources.append("None")
                base = {"Protein": 0, "Fat": 0, "Carbs": 0, "Calories": 0, "Sugar": 0, "MicroNutrients": ""}

    # Ensure calories are calculated if missing
    if base["Calories"] <= 0:
        base["Calories"] = round(calculate_atwater_kcal(base["Protein"], base["Fat"], base["Carbs"]), 2)
        sources.append("Atwater")

    result = {
        "NutrientLogId": str(uuid.uuid4()),
        "FoodId": food_norm,
        "FoodCategoryId": "Unknown",
        "Calories": base["Calories"],
        "Protein": base["Protein"],
        "Fat": base["Fat"],
        "Carbs": base["Carbs"],
        "Sugar": base["Sugar"],
        "MicroNutrients": base["MicroNutrients"],
        "UserId": "Unknown",
        "FoodGramAmount": float(grams),
        "Source": "+".join(sources),
        "LookupPath": sources[0] if sources else "None"
    }

    log.info("Final result for %s (%sg): cal=%.2f prot=%.2f fat=%.2f carbs=%.2f sugar=%.2f src=%s",
             food_norm, grams, result["Calories"], result["Protein"], result["Fat"],
             result["Carbs"], result["Sugar"], result["Source"])

    return result


# -------------------------------------------------------------------
# Scale row function
# -------------------------------------------------------------------
def scale_row(row, grams=100.0):
    portion = safe_float(row.get("Portion(g)", 100), 100)
    factor = grams / portion
    return {
        "NutrientLogId": str(uuid.uuid4()),
        "FoodCategoryId": row.get("Category", "Unknown"),
        "FoodId": str(row.get("Food_raw", "unknown")).lower(),
        "Calories": round(safe_float(row.get("Energy(kcal)", 0)) * factor, 2),
        "Protein": round(safe_float(row.get("PRO(g)", 0)) * factor, 2),
        "Fat": round(safe_float(row.get("FAT(g)", 0)) * factor, 2),
        "Carbs": round(safe_float(row.get("CHO(g)", 0)) * factor, 2),
        "Sugar": round(safe_float(row.get("Sugar(g)", 0)) * factor, 2),  # Add Sugar scaling
        "MicroNutrients": str(row.get("MicroNutrients", "")),  # Add MicroNutrients
        "UserId": "Unknown",
        "FoodGramAmount": grams,
        "Source": "FEL"
    }


# -------------------------------------------------------------------
# Health
# -------------------------------------------------------------------
@app.route("/health")
def health():
    return jsonify({
        "status": "ok",
        "dataset_loaded": False if fel is None or fel.empty else True,
        "rows": int(len(fel)) if (fel is not None and not fel.empty) else 0,
        "external": {
            "usda": bool(USDA_API_KEY),
            "api_ninjas": bool(API_NINJAS_KEY)
        },
        "time": datetime.now(datetime.UTC).isoformat()
    })


# -------------------------------------------------------------------
# BMI helpers and recommendation endpoint
# -------------------------------------------------------------------
def bmi_category(bmi: float):
    if bmi < 18.5:
        return "Underweight", [5]
    if bmi < 24.9:
        return "Normal", [6]
    if bmi < 29.9:
        return "Overweight", [7]
    return "Obese", [8]


def get_meal_calorie_targets():
    """Return calorie targets for each meal type to total 1500 calories/day"""
    return {
        "breakfast": 300,
        "lunch": 500,
        "dinner": 500,
        "snack": 200
    }


def find_appropriate_portion(food_row, target_calories):
    """
    Calculate appropriate portion size to hit target calories for a meal.
    Returns (portion_grams, actual_calories)
    """
    # Get base nutrition per 100g from FEL
    base_calories = safe_float(food_row.get("Energy(kcal)", 0))
    if base_calories <= 0:
        return 100.0, 0  # fallback

    # Calculate needed grams to hit target calories
    base_portion = safe_float(food_row.get("Portion(g)", 100))
    calories_per_gram = base_calories / base_portion
    target_grams = target_calories / calories_per_gram

    # Keep portions reasonable (50g - 400g)
    target_grams = max(50, min(400, target_grams))
    actual_calories = target_grams * calories_per_gram

    return round(target_grams, 1), round(actual_calories, 1)


@app.route("/get_food_recommendations", methods=["POST"])
def get_food_recommendations():
    if fel is None or fel.empty:
        return jsonify({"error": "Dataset not available"}), 500

    data = request.get_json(silent=True) or {}
    try:
        weight = float(data.get("weight"))
        height_cm = float(data.get("height_cm"))
    except:
        return jsonify({"error": "Invalid or missing weight/height_cm"}), 400

    # Check for max_results parameter
    max_results = data.get("max_results")

    if max_results == 4:
        # Single day meal plan (4 meals: breakfast, lunch, dinner, snack)
        num_days = 1
    else:
        # Get number of days requested (default 7 for weekly meal plan)
        num_days = int(data.get("days", 7))
        if num_days <= 0:
            num_days = 7

    bmi = round(weight / ((height_cm / 100) ** 2), 2)
    category, cat_ids = bmi_category(bmi)

    # Use broader food selection for variety
    pool = fel.copy()
    if pool.empty:
        return jsonify({"error": "No food data available"}), 500

    meal_targets = get_meal_calorie_targets()
    meal_types = ["breakfast", "lunch", "dinner", "snack"]
    recommendations = []

    total_target_calories = sum(meal_targets.values()) * num_days

    # Generate meals for each day
    for day in range(num_days):
        daily_recommendations = []
        daily_actual_calories = 0

        for meal_type in meal_types:
            target_calories = meal_targets[meal_type]

            # Sample a random food from the pool
            sampled_food = pool.sample(n=1).iloc[0]
            food_name = str(sampled_food.get("Food_raw", "unknown"))

            # Calculate appropriate portion for target calories
            portion_grams, actual_calories = find_appropriate_portion(sampled_food, target_calories)

            # Get full nutritional info using the calculated portion (includes Sugar and MicroNutrients)
            item = unified_lookup(food_name, portion_grams)

            # Add meal planning metadata
            item.update({
                "MealType": meal_type,
                "DayIndex": day,
                "TargetCalories": target_calories,
                "ActualCalories": actual_calories,
                "RecommendedPortion": f"{portion_grams}g"
            })

            daily_recommendations.append(item)
            daily_actual_calories += actual_calories

        # Add daily summary
        daily_summary = {
            "Day": day + 1,
            "TotalCalories": round(daily_actual_calories, 1),
            "TargetCalories": sum(meal_targets.values()),
            "CalorieVariance": round(daily_actual_calories - sum(meal_targets.values()), 1)
        }

        recommendations.extend(daily_recommendations)

    # Calculate totals
    total_actual_calories = sum(item.get("ActualCalories", item.get("Calories", 0)) for item in recommendations)
    total_sugar = sum(item.get("Sugar", 0) for item in recommendations)

    # Update response based on max_results
    if max_results == 4:
        response_data = {
            "prompt": "Single day Filipino meal plan with 4 meals (breakfast, lunch, dinner, snack). All nutritional calculations use the Philippine FEL database and standards whenever possible.",
            "bmi": bmi,
            "bmi_category": category,
            "target_plan": {
                "daily_target_calories": 1500,
                "days": 1,
                "total_target_calories": 1500,
                "meal_breakdown": meal_targets
            },
            "actual_plan": {
                "total_actual_calories": round(total_actual_calories, 1),
                "total_sugar": round(total_sugar, 1),
                "daily_average": round(total_actual_calories, 1),
                "daily_sugar_average": round(total_sugar, 1),
                "variance_from_target": round(total_actual_calories - 1500, 1)
            },
            "foods": recommendations,  # Use "foods" array for consistency
            "meta": {
                "total_meals": 4,
                "days_generated": 1,
                "meals_per_day": 4,
                "includes_sugar": True,
                "includes_micronutrients": True,
                "max_results": max_results
            }
        }
    else:
        response_data = {
            "prompt": "All nutritional calculations use the Philippine FEL database and standards whenever possible. Meal portions calculated to target 1500 calories per day. Sugar and micronutrients included where available.",
            "bmi": bmi,
            "bmi_category": category,
            "target_plan": {
                "daily_target_calories": 1500,
                "days": num_days,
                "total_target_calories": 1500 * num_days,
                "meal_breakdown": meal_targets
            },
            "actual_plan": {
                "total_actual_calories": round(total_actual_calories, 1),
                "total_sugar": round(total_sugar, 1),
                "daily_average": round(total_actual_calories / num_days, 1),
                "daily_sugar_average": round(total_sugar / num_days, 1),
                "variance_from_target": round(total_actual_calories - (1500 * num_days), 1)
            },
            "recommendations": recommendations,
            "meta": {
                "total_meals": len(recommendations),
                "days_generated": num_days,
                "meals_per_day": 4,
                "includes_sugar": True,
                "includes_micronutrients": True
            }
        }

    return jsonify(response_data)


# -------------------------------------------------------------------
# Nutritional info endpoint
# -------------------------------------------------------------------
@app.route("/get_nutritional_info", methods=["POST"])
def get_nutritional_info():
    data = request.get_json(silent=True) or {}
    items = data.get("items", [])
    include_sources = request.args.get("include_sources") == "1"

    results = []
    alerts = []

    log.info("Incoming nutritional query items=%s", items)

    for raw in items:
        name = str(raw.get("foodName", "unknown")).strip().lower()
        edible_grams = safe_float(raw.get("grams"), 100)  # This is already the edible portion

        log.info("Processing %s with %s edible grams", name, edible_grams)

        # Use edible grams directly for nutritional lookup
        item = unified_lookup(name, edible_grams)
        item["OriginalName"] = name

        # Alerts for high values based on edible portion
        if item["Calories"] > 800:
            alerts.append(f"High calories: {item['FoodId']} ({item['Calories']} kcal)")
        if item["Fat"] > 30:
            alerts.append(f"High fat: {item['FoodId']} ({item['Fat']}g)")

        results.append(item)

        log.info(
            "Computed %s edible_grams=%.2f src=%s cal=%.2f prot=%.2f fat=%.2f carbs=%.2f sugar=%.2f",
            item["FoodId"],
            edible_grams,
            item["Source"],
            item["Calories"],
            item["Protein"],
            item["Fat"],
            item["Carbs"],
            item["Sugar"]
        )

    response = {
        "foods": results,
        "body_goal_note": "Philippines FEL standard used where available. External fallbacks applied only if no FEL match. All calculations based on edible portion."
    }
    if alerts:
        response["realtime_alert"] = True
        response["alert_reason"] = alerts
    if include_sources:
        response["sources_used"] = {
            "USDA": bool(USDA_API_KEY),
            "api_ninjas": bool(API_NINJAS_KEY)
        }

    return jsonify(response)


# -------------------------------------------------------------------
# Chat endpoint with topic filtering and AI responses
# -------------------------------------------------------------------
@app.route('/api/chat', methods=['POST'])
def api_chat():
    """Chat endpoint with topic filtering, AI responses, and daily limits"""
    log.info("🔥 CHAT REQUEST RECEIVED!")  # DEBUG: Check if requests reach backend
    data = request.get_json(silent=True) or {}
    message = data.get('message', '').strip()
    user_id = data.get('userId', 'anonymous')
    log.info(f"📨 Request data: message='{message}', userId='{user_id}'")

    if not message:
        return jsonify({
            "error": "Message is required",
            "isOnTopic": False,
            "timestamp": datetime.now().isoformat()
        }), 400

    # Check daily chat limit first
    can_chat, remaining = check_daily_chat_limit(user_id)
    if not can_chat:
        return jsonify({
            "response": "You've used all 10 free chats for today. Your chat limit will reset tomorrow at midnight. Keep exploring our meal planning and nutrition tracking features!",
            "isOnTopic": True,
            "remainingChats": 0,
            "dailyLimitReached": True,
            "timestamp": datetime.now().isoformat()
        }), 429

    # Rate limiting check (existing)
    if not check_rate_limit(user_id):
        return jsonify({
            "response": "You've reached the maximum number of requests. Please wait a few minutes before asking again.",
            "isOnTopic": False,
            "remainingChats": remaining,
            "timestamp": datetime.now().isoformat()
        }), 429

    # Topic validation
    is_on_topic = is_nutrition_fitness_topic(message)
    log.info(f"Message: '{message}' | Topic check: {is_on_topic} | User: {user_id}")

    if not is_on_topic:
        off_topic_responses = [
            "I specialize in Filipino nutrition, meal planning, and fitness advice. Could you ask me about food nutrition, healthy recipes, or wellness tips instead?",
            "I'm here to help with nutrition and health questions! Try asking about Filipino foods, meal planning, or fitness advice.",
            "Let's focus on nutrition and wellness! I can help you with food analysis, meal recommendations, or health-related questions.",
            "I'm your Filipino nutrition assistant! Ask me about local foods, healthy eating, exercise, or meal planning."
        ]

        response = {
            "response": off_topic_responses[hash(message) % len(off_topic_responses)],
            "isOnTopic": False,
            "remainingChats": remaining,
            "timestamp": datetime.now().isoformat()
        }
        return jsonify(response)

    # Generate AI response for on-topic questions
    try:
        ai_response = get_ai_nutrition_response(message, user_id)

        response = {
            "response": ai_response,
            "isOnTopic": True,
            "remainingChats": remaining,
            "timestamp": datetime.now().isoformat()
        }

        # Add helpful context for certain question types
        if any(word in message.lower() for word in ['calorie', 'nutrition', 'protein', 'carbs']):
            response[
                "suggestion"] = "Want detailed nutritional analysis? Try the /get_nutritional_info endpoint with specific foods and portions."

        if any(word in message.lower() for word in ['meal plan', 'diet plan', 'recommend']):
            response[
                "suggestion"] = "Need a complete meal plan? Use the /get_food_recommendations endpoint with your height and weight."

        # Add remaining chats warning
        if remaining == 1:
            response["warning"] = "⚠️ You have 1 free chat remaining today. Make it count!"
        elif remaining == 0:
            response["warning"] = "✋ That was your last free chat for today! Your limit resets tomorrow."

        return jsonify(response)

    except Exception as e:
        log.exception("Error in chat endpoint")
        return jsonify({
            "response": "I encountered an error processing your nutrition question. Please try again or rephrase your question.",
            "isOnTopic": True,
            "remainingChats": remaining,
            "timestamp": datetime.now().isoformat(),
            "error": "processing_error"
        }), 500


# -------------------------------------------------------------------
# Optional chat history endpoints
# -------------------------------------------------------------------
@app.route('/api/chat/history/<user_id>', methods=['GET'])
def get_chat_history(user_id):
    """Get conversation history for a user"""
    history = conversation_history.get(user_id, [])
    return jsonify({
        "userId": user_id,
        "history": history,
        "totalExchanges": len(history)
    })


@app.route('/api/chat/clear/<user_id>', methods=['DELETE'])
def clear_chat_history(user_id):
    """Clear conversation history for a user"""
    if user_id in conversation_history:
        del conversation_history[user_id]
    if user_id in rate_limiter:
        del rate_limiter[user_id]

    return jsonify({
        "message": f"Chat history cleared for user {user_id}",
        "timestamp": datetime.now().isoformat()
    })


# -------------------------------------------------------------------
# Gemini Describe Image
# -------------------------------------------------------------------
@app.route('/describe_image', methods=['POST'])
def api_describe_image():
    if 'file' not in request.files:
        return jsonify({"error": "No file part"}), 400

    file = request.files['file']
    if file.filename == "":
        return jsonify({"error": "No selected file"}), 400

    upload_dir = "uploads"
    os.makedirs(upload_dir, exist_ok=True)
    file_path = os.path.join(upload_dir, file.filename)
    file.save(file_path)

    try:
        # Detect MIME type dynamically
        mime_type, _ = mimetypes.guess_type(file_path)
        if not mime_type:
            mime_type = "image/jpeg"

        uploaded_file = genai.upload_file(file_path, mime_type=mime_type)

        # Use safer, simpler prompt
        prompt = (
            "Identify the food in this image. Respond only in the format: Food Name - Category. "
            "If it is not food, respond: No food detected."
        )

        model = genai.GenerativeModel("gemini-2.5-flash")  # or "gemini-1.5-flash" if you want
        result = model.generate_content([uploaded_file, "\n\n", prompt])

        return jsonify({"description": result.text})

    except Exception as e:
        log.exception("Error in /describe_image")
        return jsonify({"error": str(e)}), 500


# -------------------------------------------------------------------
# Errors
# -------------------------------------------------------------------
@app.errorhandler(404)
def not_found(_):
    return jsonify({"error": "Not found"}), 404


@app.errorhandler(500)
def internal_err(e):
    log.exception("Unhandled error: %s", e)
    return jsonify({"error": "Internal server error"}), 500


# -------------------------------------------------------------------
if __name__ == "__main__":
    log.info("Starting server on 0.0.0.0:%d (dataset_loaded=%s)", DEFAULT_PORT, fel is not None)
    app.run(host="0.0.0.0", port=DEFAULT_PORT, debug=True)