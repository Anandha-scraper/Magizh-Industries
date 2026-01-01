const getApiBaseUrl = () => {
  if (import.meta.env.PROD) {
    // In production, API is served from same origin (App Hosting)
    return '/api';
  }
  // Development: use Vite proxy (routes /api to backend)
  return '/api';
};

export const API_BASE_URL = getApiBaseUrl();
