# Add this to your backend after the rate_limiter declaration (around line 21)
daily_chat_limiter = defaultdict(lambda: {"date": None, "count": 0})

def check_daily_chat_limit(user_id: str, max_daily_chats: int = 3) -> tuple[bool, int]:
    """Check if user has exceeded daily chat limit. Returns (can_chat, remaining_chats)"""
    today = datetime.now().date().isoformat()
    user_data = daily_chat_limiter[user_id]
    
    # Reset counter if new day
    if user_data["date"] != today:
        user_data["date"] = today
        user_data["count"] = 0
    
    remaining = max_daily_chats - user_data["count"]
    can_chat = user_data["count"] < max_daily_chats
    
    if can_chat:
        user_data["count"] += 1
    
    return can_chat, max(0, remaining - (1 if can_chat else 0))

# Replace your existing /api/chat endpoint with this updated version:
@app.route('/api/chat', methods=['POST'])
def api_chat():
    """Chat endpoint with topic filtering, AI responses, and daily limits"""
    data = request.get_json(silent=True) or {}
    message = data.get('message', '').strip()
    user_id = data.get('userId', 'anonymous')

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
            "response": "You've used all 3 free chats for today. Your chat limit will reset tomorrow at midnight. Keep exploring our meal planning and nutrition tracking features!",
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
            response["suggestion"] = "Want detailed nutritional analysis? Try the /get_nutritional_info endpoint with specific foods and portions."

        if any(word in message.lower() for word in ['meal plan', 'diet plan', 'recommend']):
            response["suggestion"] = "Need a complete meal plan? Use the /get_food_recommendations endpoint with your height and weight."

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
