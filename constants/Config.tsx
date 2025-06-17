const BASE_IP = "192.168.254.144";
const EXPRESS_PORT = "5000";
const ASPNET_PORT = "5129";

const Config = {
  BASE_URL: `http://${BASE_IP}:${EXPRESS_PORT}`,
  API_BASE: `http://${BASE_IP}:${ASPNET_PORT}`,
  Account_API: `http://${BASE_IP}:${ASPNET_PORT}/api/account`,
  DESCRIBE_IMAGE_API: `http://${BASE_IP}:${EXPRESS_PORT}/describe_image`,
};

export default Config;
