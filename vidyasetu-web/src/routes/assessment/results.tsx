import { createFileRoute, useNavigate } from "@tanstack/react-router"
import { useEffect, useRef } from "react"
import { motion } from "framer-motion"
import {
  ArrowRight,
  Briefcase,
  GraduationCap,
  Loader2,
  RefreshCcw,
  Sparkles,
  CheckCircle,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { useQuizStore, getTopCareers, getTopColleges } from "@/store/quizStore"
import { useProfileStore } from "@/store/profileStore"
import { useAuthenticatedRecommendation } from "@/hooks/useRecommendation"
import { buildRecommenderRequest } from "@/lib/quiz"

export const Route = createFileRoute("/assessment/results")({
  component: ResultsComponent,
})

function ResultsComponent() {
  const navigate = useNavigate()

  // Quiz store
  const {
    isQuizComplete,
    finalScores,
    recommendations,
    isLoadingRecommendations,
    computeScores,
    setRecommendations,
    setLoadingRecommendations,
    reset,
  } = useQuizStore()

  // Profile store
  const { getStudentActual, getStudentPreferences } = useProfileStore()

  // Recommendation mutation (uses authenticated endpoint to save to DB)
  const recommendMutation = useAuthenticatedRecommendation()

  // Track if we've already triggered the API call
  const hasTriggeredRef = useRef(false)

  // Auto-trigger recommendations when quiz is complete
  useEffect(() => {
    const savedTheme = localStorage.getItem("theme")
    if (savedTheme === "dark") {
      document.documentElement.classList.add("dark")
    }

    if (isQuizComplete && !finalScores) {
      computeScores()
    }

    if (finalScores && !recommendations && !isLoadingRecommendations && !hasTriggeredRef.current) {
      hasTriggeredRef.current = true
      setLoadingRecommendations(true)

      const request = buildRecommenderRequest(
        finalScores,
        getStudentActual(),
        getStudentPreferences()
      )

      console.log("🚀 Sending recommendation request:", request)

      recommendMutation.mutate(request, {
        onSuccess: (data) => {
          console.log("✅ Recommendations received:", data)
          setRecommendations(data)
        },
        onError: (error) => {
          console.error("❌ Failed to fetch recommendations:", error)
          setLoadingRecommendations(false)
          hasTriggeredRef.current = false
        },
      })
    }
  }, [
    isQuizComplete,
    finalScores,
    recommendations,
    isLoadingRecommendations,
    computeScores,
    setRecommendations,
    setLoadingRecommendations,
    getStudentActual,
    getStudentPreferences,
  ])

  // Get top 3 for summary
  const topCareers = getTopCareers(recommendations, 3)
  const topColleges = getTopColleges(recommendations, 3)

  // Loading state
  if (isLoadingRecommendations || recommendMutation.isPending) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="text-center max-w-md">
          <div className="relative mb-6">
            <Loader2 className="w-16 h-16 animate-spin text-primary mx-auto" />
            <Sparkles
              className="absolute top-0 right-1/3 text-primary/50 animate-pulse"
              size={20}
            />
          </div>
          <h2 className="text-2xl font-bold mb-3">Analyzing Your Responses</h2>
          <p className="text-text-secondary mb-6">
            Our AI is generating personalized recommendations...
          </p>
          <div className="space-y-2 text-left bg-surface/50 rounded-lg p-4 border border-border">
            <div className="flex items-center gap-2 text-sm text-text-secondary">
              <div className="w-2 h-2 rounded-full bg-green-500"></div>
              <span>Computing aptitude scores</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-text-secondary">
              <div className="w-2 h-2 rounded-full bg-primary animate-pulse"></div>
              <span>Matching careers & colleges...</span>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // No quiz completed
  if (!isQuizComplete) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="text-center max-w-md">
          <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <Sparkles className="w-10 h-10 text-primary" />
          </div>
          <h2 className="text-2xl font-bold mb-3">No Assessment Complete</h2>
          <p className="text-text-secondary mb-6">
            Complete the aptitude assessment to receive your recommendations.
          </p>
          <Button onClick={() => navigate({ to: "/assessment" })} variant="primary">
            Start Assessment
          </Button>
        </div>
      </div>
    )
  }

  const handleRetake = () => {
    reset()
    navigate({ to: "/assessment/quiz" })
  }

  const handleViewDetails = () => {
    navigate({ to: "/dashboard", search: { tab: "recommendations" } })
  }

  return (
    <div className="min-h-screen bg-background p-4 relative overflow-hidden">
      {/* Content */}
      <div className="max-w-2xl mx-auto relative z-10 py-12">
        {/* Success Animation */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", duration: 0.6 }}
          className="text-center mb-8"
        >
          <div className="w-24 h-24 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-12 h-12 text-green-500" />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold mb-3">Assessment Complete! 🎉</h1>
          <p className="text-text-secondary max-w-md mx-auto">
            We've analyzed your responses and generated personalized career and college
            recommendations.
          </p>
        </motion.div>

        {/* Quick Summary Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="grid md:grid-cols-2 gap-4 mb-8"
        >
          {/* Top Careers */}
          <div className="bg-card/90 backdrop-blur-lg border border-border rounded-xl p-5">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
                <Briefcase className="text-primary" size={16} />
              </div>
              <h3 className="font-bold">Top 3 Careers</h3>
            </div>
            <ul className="space-y-2">
              {topCareers.map((career, i) => (
                <li key={career} className="flex items-center gap-2 text-sm">
                  <span className="w-5 h-5 bg-primary/20 text-primary rounded-full flex items-center justify-center text-xs font-bold">
                    {i + 1}
                  </span>
                  <span className="text-text-secondary">{career}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Top Colleges */}
          <div className="bg-card/90 backdrop-blur-lg border border-border rounded-xl p-5">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-secondary/10 rounded-lg flex items-center justify-center">
                <GraduationCap className="text-secondary" size={16} />
              </div>
              <h3 className="font-bold">Top 3 Colleges</h3>
            </div>
            <ul className="space-y-2">
              {topColleges.map((college, i) => (
                <li key={college.name} className="flex items-center gap-2 text-sm">
                  <span className="w-5 h-5 bg-secondary/20 text-secondary rounded-full flex items-center justify-center text-xs font-bold">
                    {i + 1}
                  </span>
                  <span className="text-text-secondary truncate">{college.name}</span>
                </li>
              ))}
            </ul>
          </div>
        </motion.div>

        {/* Action Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="flex flex-col gap-3"
        >
          <Button onClick={handleViewDetails} variant="primary" size="lg" className="w-full gap-2">
            See Detailed Report
            <ArrowRight size={18} />
          </Button>
          <Button
            onClick={handleRetake}
            variant="ghost"
            size="sm"
            className="gap-2 text-text-secondary"
          >
            <RefreshCcw size={14} />
            Retake Assessment
          </Button>
        </motion.div>
      </div>
    </div>
  )
}
