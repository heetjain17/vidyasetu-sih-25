import { useEffect } from "react";
import { useNavigate } from "@tanstack/react-router";
import { useAuthStore } from "@/store/authStore";
import { useProfileStore } from "@/store/profileStore";
import { useQuizStore } from "@/store/quizStore";
import { Loader2 } from "lucide-react";

// =====================================================
// Route Guard Component
// =====================================================

interface RouteGuardProps {
  children: React.ReactNode;
  requireAuth?: boolean;
  requireProfile?: boolean;
  requireQuiz?: boolean;
  redirectTo?: string;
}

/**
 * RouteGuard enforces the app flow:
 * Auth → Profile → Quiz → Results → Dashboard
 */
export function RouteGuard({
  children,
  requireAuth = false,
  requireProfile = false,
  requireQuiz = false,
  redirectTo,
}: RouteGuardProps) {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuthStore();
  const { profile } = useProfileStore();
  const { isQuizComplete } = useQuizStore();

  useEffect(() => {
    // Check auth requirement
    if (requireAuth && !isAuthenticated) {
      navigate({ to: "/auth" });
      return;
    }

    // Check profile requirement (only if authenticated)
    if (requireProfile && isAuthenticated && !profile.isProfileComplete) {
      navigate({ to: "/auth/profile" });
      return;
    }

    // Check quiz requirement (only if profile complete)
    if (requireQuiz && profile.isProfileComplete && !isQuizComplete) {
      navigate({ to: "/assessment/quiz" });
      return;
    }

    // Custom redirect
    if (redirectTo) {
      navigate({ to: redirectTo });
    }
  }, [
    isAuthenticated,
    profile.isProfileComplete,
    isQuizComplete,
    requireAuth,
    requireProfile,
    requireQuiz,
    redirectTo,
    navigate,
  ]);

  return <>{children}</>;
}

// =====================================================
// Helper Hook for Flow Navigation
// =====================================================

/**
 * Hook to get the next step in the user flow
 */
export function useFlowNavigation() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuthStore();
  const { profile } = useProfileStore();
  const { isQuizComplete, recommendations } = useQuizStore();

  const getNextStep = (): string => {
    if (!isAuthenticated) return "/auth";
    if (!profile.isProfileComplete) return "/auth/profile";
    if (!isQuizComplete) return "/assessment/quiz";
    if (!recommendations) return "/assessment/results";
    return "/dashboard";
  };

  const navigateToNextStep = () => {
    const nextStep = getNextStep();
    navigate({ to: nextStep });
  };

  const getFlowStatus = () => ({
    isAuthenticated,
    isProfileComplete: profile.isProfileComplete,
    isQuizComplete,
    hasRecommendations: !!recommendations,
  });

  return {
    getNextStep,
    navigateToNextStep,
    getFlowStatus,
  };
}

// =====================================================
// Loading Screen Component
// =====================================================

export function LoadingScreen({
  message = "Loading...",
}: {
  message?: string;
}) {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="text-center">
        <Loader2 className="w-10 h-10 animate-spin text-primary mx-auto mb-4" />
        <p className="text-text-secondary">{message}</p>
      </div>
    </div>
  );
}
