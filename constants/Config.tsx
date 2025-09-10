const BASE_IP = "192.168.254.148"; // <-- ensure this matches your PC's LAN IPv4
const EXPRESS_PORT = "5000";        // Python/Flask service port
const ASPNET_PORT = "5129";         // .NET API port

// Centralized configuration for both Python (nutrition/meal plan) and ASP.NET (account/logging)
const PYTHON_BASE = `http://${BASE_IP}:${EXPRESS_PORT}`.replace(/\/$/, "");

const Config = {
  // Python service base (used for meal plan + nutrition + describe image)
  PYTHON_BASE,
  BASE_URL: PYTHON_BASE, // backward compatibility (old code path)
  MEALPLAN_ENDPOINT: '/get_food_recommendations',
  HEALTH_ENDPOINT: '/health',
  NUTRITION_ENDPOINT: '/get_nutritional_info',

  // Full URLs (legacy usage)
  DESCRIBE_IMAGE_API: `${PYTHON_BASE}/describe_image`,
  NUTRITION_API: `${PYTHON_BASE}/get_nutritional_info`,

  // ASP.NET base & endpoints
  API_BASE: `http://${BASE_IP}:${ASPNET_PORT}`,
  Account_API: `http://${BASE_IP}:${ASPNET_PORT}/api/account`,
  LOG_FOOD_API: `http://${BASE_IP}:${ASPNET_PORT}/api/foodlogging/log`,
};

export default Config;
