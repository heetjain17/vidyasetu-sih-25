import { AxiosError } from "axios";

export interface ApiError {
  message: string;
  status?: number;
  code?: string;
  details?: unknown;
}

/**
 * Extract user-friendly error message from various error types
 */
export function getErrorMessage(error: unknown): string {
  // Network errors
  if (error instanceof Error && error.message === "Network Error") {
    return "Unable to connect to the server. Please check your internet connection and try again.";
  }

  // Axios errors
  if (error instanceof AxiosError) {
    // No response from server
    if (!error.response) {
      return "Cannot reach the server. Please check if the backend is running and your internet connection is stable.";
    }

    // Server responded with error
    const status = error.response.status;
    const data = error.response.data;

    // Extract message from response
    if (data?.detail) {
      return typeof data.detail === "string" ? data.detail : "An error occurred";
    }
    if (data?.message) {
      return data.message;
    }

    // Status-based messages
    switch (status) {
      case 400:
        return "Invalid request. Please check your input and try again.";
      case 401:
        return "Your session has expired. Please log in again.";
      case 403:
        return "You don't have permission to perform this action.";
      case 404:
        return "The requested resource was not found.";
      case 409:
        return "This action conflicts with existing data.";
      case 422:
        return "Validation error. Please check your input.";
      case 429:
        return "Too many requests. Please wait a moment and try again.";
      case 500:
        return "Server error. Please try again later.";
      case 502:
      case 503:
      case 504:
        return "The server is temporarily unavailable. Please try again later.";
      default:
        return `An error occurred (${status}). Please try again.`;
    }
  }

  // Timeout errors
  if (error instanceof Error && error.message.includes("timeout")) {
    return "Request timed out. The server is taking too long to respond.";
  }

  // Generic errors
  if (error instanceof Error) {
    return error.message;
  }

  // Unknown errors
  return "An unexpected error occurred. Please try again.";
}

/**
 * Parse error into structured format
 */
export function parseError(error: unknown): ApiError {
  const message = getErrorMessage(error);
  
  if (error instanceof AxiosError) {
    return {
      message,
      status: error.response?.status,
      code: error.code,
      details: error.response?.data,
    };
  }

  return { message };
}

/**
 * Log error to console in development
 */
export function logError(error: unknown, context?: string): void {
  if (import.meta.env.DEV) {
    console.error(`[Error${context ? ` - ${context}` : ""}]:`, error);
  }
}

/**
 * Check if error is a network error
 */
export function isNetworkError(error: unknown): boolean {
  if (error instanceof Error && error.message === "Network Error") {
    return true;
  }
  if (error instanceof AxiosError && !error.response) {
    return true;
  }
  return false;
}

/**
 * Check if error is an authentication error
 */
export function isAuthError(error: unknown): boolean {
  if (error instanceof AxiosError) {
    return error.response?.status === 401;
  }
  return false;
}

/**
 * Handle error with optional callback
 */
export function handleError(
  error: unknown,
  options?: {
    context?: string;
    onError?: (error: ApiError) => void;
    showToast?: boolean;
  }
): ApiError {
  const parsedError = parseError(error);
  
  // Log in development
  logError(error, options?.context);

  // Call custom error handler
  if (options?.onError) {
    options.onError(parsedError);
  }

  return parsedError;
}
