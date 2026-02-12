import { motion } from "framer-motion";
import { FileText, Check, Play, RefreshCcw } from "lucide-react";
import { useNavigate } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { useQuizStore } from "@/store/quizStore";

export function AssessmentModule() {
  const navigate = useNavigate();
  const { isQuizComplete, currentQuestionSet, reset } = useQuizStore();

  const handleStartQuiz = () => {
    reset(); // Start fresh
    navigate({ to: "/assessment/quiz" });
  };

  const handleContinueQuiz = () => {
    navigate({ to: "/assessment/quiz" });
  };

  const handleViewResults = () => {
    navigate({ to: "/assessment/results" });
  };

  const handleRetake = () => {
    reset();
    navigate({ to: "/assessment/quiz" });
  };

  // Quiz completed
  if (isQuizComplete) {
    return (
      <div className="max-w-2xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-card/90 backdrop-blur-lg border border-border rounded-2xl p-8 shadow-lg text-center"
        >
          <div className="w-16 h-16 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <Check className="w-8 h-8 text-green-600 dark:text-green-400" />
          </div>
          <h2 className="text-2xl font-bold mb-2">Assessment Completed!</h2>
          <p className="text-text-secondary mb-6">
            You've successfully completed the aptitude assessment. View your
            personalized recommendations or retake the assessment anytime.
          </p>
          <div className="flex gap-4 justify-center">
            <Button
              onClick={handleRetake}
              variant="secondary"
              className="gap-2"
            >
              <RefreshCcw size={16} />
              Retake Quiz
            </Button>
            <Button
              onClick={handleViewResults}
              variant="primary"
              className="gap-2"
            >
              <FileText size={16} />
              View Results
            </Button>
          </div>
        </motion.div>
      </div>
    );
  }

  // Quiz in progress
  if (currentQuestionSet) {
    return (
      <div className="max-w-2xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-card/90 backdrop-blur-lg border border-border rounded-2xl p-8 shadow-lg text-center"
        >
          <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <Play className="w-8 h-8 text-primary" />
          </div>
          <h2 className="text-2xl font-bold mb-2">Assessment In Progress</h2>
          <p className="text-text-secondary mb-6">
            You have an ongoing assessment. Continue where you left off or start
            over with a new set of questions.
          </p>
          <div className="flex gap-4 justify-center">
            <Button
              onClick={handleStartQuiz}
              variant="secondary"
              className="gap-2"
            >
              <RefreshCcw size={16} />
              Start Over
            </Button>
            <Button
              onClick={handleContinueQuiz}
              variant="primary"
              className="gap-2"
            >
              <Play size={16} />
              Continue
            </Button>
          </div>
        </motion.div>
      </div>
    );
  }

  // No quiz started
  return (
    <div className="max-w-2xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-card/90 backdrop-blur-lg border border-border rounded-2xl p-8 shadow-lg text-center"
      >
        <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
          <FileText className="w-8 h-8 text-primary" />
        </div>
        <h2 className="text-2xl font-bold mb-2">Aptitude Assessment</h2>
        <p className="text-text-secondary mb-6">
          Take our comprehensive aptitude assessment to discover career paths
          and colleges that match your unique strengths and interests.
        </p>
        <ul className="text-left max-w-md mx-auto mb-6 space-y-2">
          <li className="flex items-center gap-2 text-sm text-text-secondary">
            <Check size={16} className="text-primary" />
            <span>15-20 questions tailored to your profile</span>
          </li>
          <li className="flex items-center gap-2 text-sm text-text-secondary">
            <Check size={16} className="text-primary" />
            <span>AI-powered career recommendations</span>
          </li>
          <li className="flex items-center gap-2 text-sm text-text-secondary">
            <Check size={16} className="text-primary" />
            <span>Personalized college matching</span>
          </li>
        </ul>
        <Button onClick={handleStartQuiz} variant="primary" className="gap-2">
          <Play size={16} />
          Start Assessment
        </Button>
      </motion.div>
    </div>
  );
}
