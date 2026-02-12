// config/api.ts
// API configuration for mobile app

// ⚠️ UPDATE THIS WITH YOUR LOCAL IP!
// Android emulator: 10.0.2.2
// iOS simulator: localhost
// Physical device: Your computer's IP (run ipconfig to find it)
const DEV_API_URL = "http://10.6.0.175:8000";

export const API_BASE_URL = DEV_API_URL;

export const API_ENDPOINTS = {
  auth: {
    register: "/auth/register",
    login: "/auth/login",
    signout: "/auth/signout",
    me: "/auth/me",
  },
  feedback: {
    submit: "/feedback/",
    get: "/feedback/",
  },
};
