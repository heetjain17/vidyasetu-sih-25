import { useCallback } from "react"
import { handleError, getErrorMessage, isNetworkError } from "@/utils/errorHandler"

/**
 * Hook for consistent error handling across the app
 * Note: Currently uses console logging. Integrate with toast library when available.
 */
export function useErrorHandler() {
  const showError = useCallback((error: unknown, context?: string) => {
    const errorMessage = getErrorMessage(error)
    const isNetwork = isNetworkError(error)

    // TODO: Replace with toast notification when toast library is integrated
    if (isNetwork) {
      alert(`Connection Error: ${errorMessage}`)
    }

    // Log error with context
    handleError(error, { context })
  }, [])

  const showSuccess = useCallback((_message: string) => {
    // TODO: Replace with toast notification when toast library is integrated
  }, [])

  return { showError, showSuccess }
}
