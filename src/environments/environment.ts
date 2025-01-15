const API_BASE_URL = "https://5fcc-102-156-92-104.ngrok-free.app";
const AUTH_SERVICE_ENDPOINT = "AUTHENTIFICATION-SERVICE01"

export const environment = {
  production: false,
  apiUrl: API_BASE_URL,
  auth: {
    loginUrl: `${API_BASE_URL}/${AUTH_SERVICE_ENDPOINT}/login`,
    registerUrl: `${API_BASE_URL}/api/auth/signup`
  },
  invoice: {
    baseUrl: `${API_BASE_URL}/api/factures`
  },
  product: {
    baseUrl: `${API_BASE_URL}/api/produits`
  },
  client: {
    baseUrl: `${API_BASE_URL}/api/clients`
  }
};
