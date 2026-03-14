import { useCallback } from "react";
import { handleError, getErrorMessage, isNetworkError } from "@/utils/errorHandler";
import { useToast } from "@/hooks/use-toast";

export function useErrorHandler() {
  const { toast } = useToast();

  const showError = useCallback(
    (error: unknown, context?: string) => {
      const errorMessage = getErrorMessage(error);
      const isNetwork = isNetworkError(error);

      toast({
        variant: "destructive",
        title: isNetwork ? "Connection Error" : "Error",
        description: errorMessage,
        duration: 5000,
      });

      // Log error
      handleError(error, { context });
    },
    [toast]
  );

  const showSuccess = useCallback(
    (message: string) => {
      toast({
        title: "Success",
        description: message,
        duration: 3000,
      });
    },
    [toast]
  );

  return { showError, showSuccess };
}
