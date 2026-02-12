import axios from "axios";

// API base URL - defaults to localhost for development
const API_BASE_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";

// Create axios instance with base configuration
export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 120000, // 120 second timeout (recommendation API is slow)
});

// Request interceptor - adds auth token if available
apiClient.interceptors.request.use(
  (config) => {
    const authData = sessionStorage.getItem("auth-storage");
    if (authData) {
      try {
        const parsed = JSON.parse(authData);
        const token = parsed?.state?.accessToken;
        const userId = parsed?.state?.user?.id;
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        // Add user ID header for forum endpoints
        if (userId) {
          config.headers["X-User-Id"] = userId;
        }
      } catch {
        // Invalid JSON, ignore
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor - handle common errors
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Clear auth on unauthorized
      sessionStorage.removeItem("auth-storage");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

export default apiClient;
