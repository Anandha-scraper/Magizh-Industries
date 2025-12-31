const getApiBaseUrl = () => {
  // Use environment variable for production API URL
  if (import.meta.env.PROD) {
    return import.meta.env.VITE_API_URL || 'https://us-central1-magizh-industries-d36e0.cloudfunctions.net';
  }
  return 'http://localhost:5000';
};

export const API_BASE_URL = getApiBaseUrl();
