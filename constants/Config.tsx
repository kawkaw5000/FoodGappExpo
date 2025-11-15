// Railway Production URLs
const RAILWAY_ASPNET_URL = "https://foodgappbackendwebapi-production.up.railway.app";
// Optional: if you deployed Python endpoints as a separate Railway service, put its URL here.
// If left empty, the code will fall back to using the ASP.NET Railway URL (useful when
// the Python endpoints are integrated into the same backend service you already deployed).
let RAILWAY_PYTHON_URL = "https://worthy-compassion-production.up.railway.app"; // Add your Python service Railway URL here if deployed

// For local development, you can switch between Railway and local
const USE_RAILWAY = true; // Set to false for local development

// Local development URLs (keep for testing)
const BASE_IP = "192.168.254.107"; // <-- ensure this matches your PC's LAN IPv4
const EXPRESS_PORT = "5000";        // Python/Flask service port
const ASPNET_PORT = "5129";         // .NET API port

// Choose between Railway and local
// If using Railway and `RAILWAY_PYTHON_URL` is empty, fall back to the ASP.NET Railway URL
if (USE_RAILWAY && !RAILWAY_PYTHON_URL) {
  RAILWAY_PYTHON_URL = RAILWAY_ASPNET_URL;
}

const PYTHON_BASE = USE_RAILWAY
  ? RAILWAY_PYTHON_URL
  : `http://${BASE_IP}:${EXPRESS_PORT}`;

const ASPNET_BASE = USE_RAILWAY
  ? RAILWAY_ASPNET_URL
  : `http://${BASE_IP}:${EXPRESS_PORT}`;

// Centralized configuration for both Python (nutrition/meal plan) and ASP.NET (account/logging)
// const PYTHON_BASE = `http://${BASE_IP}:${EXPRESS_PORT}`.replace(/\/$/, "");

const Config = {
  // Python service base (used for meal plan + nutrition + describe image)
  // PYTHON_BASE,
  PYTHON_BASE: PYTHON_BASE.replace(/\/$/, ""),
  BASE_URL: PYTHON_BASE.replace(/\/$/, ""), // backward compatibility (old code path)
  MEALPLAN_ENDPOINT: '/get_food_recommendations',
  HEALTH_ENDPOINT: '/health',
  NUTRITION_ENDPOINT: '/get_nutritional_info',

  // Full URLs (legacy usage)
  DESCRIBE_IMAGE_API: `${PYTHON_BASE}/describe_image`,
  NUTRITION_API: `${PYTHON_BASE}/get_nutritional_info`,

  // ASP.NET base & endpoints
  API_BASE: ASPNET_BASE,
  // Account_API: `http://${BASE_IP}:${ASPNET_PORT}/api/account`,
  // LOG_FOOD_API: `http://${BASE_IP}:${ASPNET_PORT}/api/foodlogging/log`,
  Account_API: `${ASPNET_BASE}/api/account`,
  LOG_FOOD_API: `${ASPNET_BASE}/api/foodlogging/log`,
};

export default Config;
