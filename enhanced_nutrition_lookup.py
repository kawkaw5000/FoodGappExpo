# Enhanced Unified Lookup with Micronutrients Enrichment
# Add this improved version to your maintest.py

def unified_lookup_enhanced(food: str, grams: float):
    """
    Enhanced lookup that always tries to get micronutrients from external APIs
    even when macronutrients come from FEL database
    """
    food_norm = normalize_text(food)
    sources = []
    micronutrients_source = None

    # 1. Try FEL first for macronutrients
    fel_data = lookup_fel(food_norm)
    if fel_data and any([fel_data["Protein"], fel_data["Fat"], fel_data["Carbs"]]):
        sources.append(fel_data["lookup_path"])
        portion = fel_data.get("Portion", 100) or 100
        scale = grams / portion
        
        base = {
            "Protein": fel_data["Protein"] * scale,
            "Fat": fel_data["Fat"] * scale,
            "Carbs": fel_data["Carbs"] * scale,
            "Calories": fel_data["Calories"] * scale,
            "Sugar": fel_data["Sugar"] * scale,
            "MicroNutrients": fel_data["MicroNutrients"]
        }
        
        # If FEL doesn't have micronutrients, try external APIs
        if not base["MicroNutrients"] or base["MicroNutrients"].strip() == "":
            log.info("FEL has macros for %s but no micronutrients, trying external APIs", food)
            
            # Try USDA for micronutrients
            usda_data = lookup_usda(food_norm, grams)
            if usda_data and usda_data.get("MicroNutrients"):
                base["MicroNutrients"] = usda_data["MicroNutrients"]
                micronutrients_source = "USDA"
                log.info("Got micronutrients for %s from USDA: %s", food, base["MicroNutrients"])
            else:
                # Try API Ninjas for micronutrients
                nin_data = lookup_api_ninjas(food_norm, grams)
                if nin_data and nin_data.get("MicroNutrients"):
                    base["MicroNutrients"] = nin_data["MicroNutrients"]
                    micronutrients_source = "API_Ninjas"
                    log.info("Got micronutrients for %s from API Ninjas: %s", food, base["MicroNutrients"])
    else:
        # No FEL data, use external APIs completely
        usda_data = lookup_usda(food_norm, grams)
        if usda_data:
            sources.append("USDA")
            base = usda_data
        else:
            nin_data = lookup_api_ninjas(food_norm, grams)
            if nin_data:
                sources.append("API_Ninjas")
                base = nin_data
            else:
                sources.append("None")
                base = {"Protein": 0, "Fat": 0, "Carbs": 0, "Calories": 0, "Sugar": 0, "MicroNutrients": ""}

    # Compute calories with Atwater if missing or zero
    if base["Calories"] <= 0:
        base["Calories"] = calculate_atwater_kcal(base["Protein"], base["Fat"], base["Carbs"])
        sources.append("Atwater")

    # Add micronutrients source to sources list
    if micronutrients_source:
        sources.append(f"Micro:{micronutrients_source}")

    result = {
        "NutrientLogId": str(uuid.uuid4()),
        "FoodId": food_norm,
        "FoodCategoryId": "Unknown",
        "Calories": round(base["Calories"], 2),
        "Protein": round(base["Protein"], 2),
        "Fat": round(base["Fat"], 2),
        "Carbs": round(base["Carbs"], 2),
        "Sugar": round(base["Sugar"], 2),
        "MicroNutrients": base["MicroNutrients"],
        "UserId": "Unknown",
        "FoodGramAmount": float(grams),
        "Source": "+".join(sources),
        "LookupPath": sources[0] if sources else "None"
    }

    log.info("Final result for %s: Macros from %s, Micros: '%s'", 
             food, sources[0] if sources else "None", result["MicroNutrients"])

    return result


# Alternative: Add default micronutrients for common foods
def add_default_micronutrients(food_name: str, base_data: dict):
    """
    Add basic micronutrients for common foods that don't have data
    """
    food_lower = food_name.lower()
    
    default_micros = {
        "chicken": "Protein: High, Iron: 0.9g, Zinc: 1.3g",
        "egg": "Choline: 0.3g, Selenium: 0.03g, Vitamin B12: 0.6g",
        "rice": "Manganese: 1.1g, Thiamine: 0.4g, Niacin: 1.6g",
        "beef": "Iron: 2.6g, Zinc: 4.8g, Vitamin B12: 2.6g",
        "pork": "Thiamine: 0.7g, Selenium: 0.04g, Phosphorus: 2.0g",
        "fish": "Omega-3: 1.2g, Selenium: 0.04g, Vitamin D: 0.01g",
        "milk": "Calcium: 1.2g, Vitamin B12: 0.5g, Riboflavin: 0.2g",
        "banana": "Potassium: 3.6g, Vitamin B6: 0.4g, Vitamin C: 0.09g",
        "apple": "Fiber: 2.4g, Vitamin C: 0.05g, Potassium: 1.1g",
        "bread": "Thiamine: 0.5g, Folate: 0.04g, Iron: 3.6g"
    }
    
    for food_key, micros in default_micros.items():
        if food_key in food_lower:
            if not base_data.get("MicroNutrients") or base_data["MicroNutrients"].strip() == "":
                base_data["MicroNutrients"] = micros
                log.info("Added default micronutrients for %s: %s", food_name, micros)
                break
    
    return base_data
