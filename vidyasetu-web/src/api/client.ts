import axios from "axios"

// API base URL - defaults to localhost for development
const API_BASE_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000"

// Create axios instance with base configuration
export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 120000, // 120 second timeout (recommendation API is slow)
})

// Request interceptor - adds auth token if available
apiClient.interceptors.request.use(
  (config) => {
    const authData = sessionStorage.getItem("auth-storage")
    if (authData) {
      try {
        const parsed = JSON.parse(authData)
        const token = parsed?.state?.accessToken
        const userId = parsed?.state?.user?.id
        if (token) {
          config.headers.Authorization = `Bearer ${token}`
        }
        // Add user ID header for forum endpoints
        if (userId) {
          config.headers["X-User-Id"] = userId
        }
      } catch {
        // Invalid JSON, ignore
      }
    }
    return config
  },
  (error) => Promise.reject(error)
)

// Response interceptor - handle common errors
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    // Log error details in development
    if (import.meta.env.DEV) {
      console.error("[API Error]:", {
        url: error.config?.url,
        method: error.config?.method,
        status: error.response?.status,
        message: error.message,
        data: error.response?.data,
      })
    }

    // Handle network errors
    if (!error.response) {
      console.error("Network Error: Cannot reach the server")
      error.message = "Cannot connect to server. Please check your internet connection."
      return Promise.reject(error)
    }

    // Handle authentication errors
    if (error.response?.status === 401) {
      console.warn("Authentication failed - clearing session")
      sessionStorage.removeItem("auth-storage")

      // Only redirect if not already on auth page
      if (!window.location.pathname.includes("/auth")) {
        window.location.href = "/auth"
      }
    }

    // Handle timeout errors
    if (error.code === "ECONNABORTED") {
      error.message = "Request timeout. Please try again."
    }

    // Enhance error message with response data
    if (error.response?.data?.detail) {
      error.message = error.response.data.detail
    } else if (error.response?.data?.message) {
      error.message = error.response.data.message
    }

    return Promise.reject(error)
  }
)

export default apiClient
