import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useQuizStore } from "@/store/quizStore";
import { getRandomQuestionSet, calculateProgress } from "@/lib/quiz";

export const Route = createFileRoute("/assessment/quiz")({
  component: QuizComponent,
});

function QuizComponent() {
  const navigate = useNavigate();
  const [selectedOption, setSelectedOption] = useState<string | null>(null);

  // Quiz store
  const {
    currentQuestionSet,
    currentQuestionIndex,
    setQuestionSet,
    saveAnswer,
    getAnswer,
    nextQuestion,
    previousQuestion,
    completeQuiz,
  } = useQuizStore();

  // Apply saved theme on mount and initialize quiz
  useEffect(() => {
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }

    // Initialize random question set if not already set
    if (!currentQuestionSet) {
      const { set, index } = getRandomQuestionSet();
      setQuestionSet(set, index);
    }
  }, [currentQuestionSet, setQuestionSet]);

  // Restore answer when navigating back
  useEffect(() => {
    const savedAnswer = getAnswer(currentQuestionIndex);
    setSelectedOption(savedAnswer?.optionId || null);
  }, [currentQuestionIndex, getAnswer]);

  // Loading state
  if (!currentQuestionSet) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  const questions = currentQuestionSet.questions;
  const currentQuestion = questions[currentQuestionIndex];
  const progress = calculateProgress(currentQuestionIndex, questions.length);

  const handleNext = () => {
    if (!selectedOption) return;

    const chosenOption = currentQuestion.data.options.find(
      (o) => o.id === selectedOption
    );
    if (!chosenOption) return;

    // Save answer with vector
    saveAnswer(currentQuestionIndex, selectedOption, chosenOption.vector);

    // Navigate
    if (currentQuestionIndex < questions.length - 1) {
      nextQuestion();
      setSelectedOption(null);
    } else {
      // Quiz complete - navigate to results
      completeQuiz();
      navigate({ to: "/assessment/results" });
    }
  };

  const handleBack = () => {
    if (currentQuestionIndex > 0) {
      previousQuestion();
    } else {
      navigate({ to: "/assessment" });
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4 relative overflow-hidden">
      {/* Animated Background Effects */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        {/* Gradient mesh */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-secondary/5" />

        {/* Floating orbs */}
        <motion.div
          animate={{
            x: [0, 100, 0],
            y: [0, -50, 0],
            scale: [1, 1.2, 1],
          }}
          transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-20 right-20 w-96 h-96 bg-primary/10 rounded-full blur-[100px]"
        />
        <motion.div
          animate={{
            x: [0, -80, 0],
            y: [0, 60, 0],
            scale: [1, 1.3, 1],
          }}
          transition={{
            duration: 15,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 2,
          }}
          className="absolute bottom-40 left-10 w-80 h-80 bg-secondary/10 rounded-full blur-[100px]"
        />

        {/* Dot grid pattern */}
        <div
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage: `radial-gradient(circle, currentColor 1px, transparent 1px)`,
            backgroundSize: "40px 40px",
          }}
        />
      </div>

      {/* Compact Quiz Container */}
      <div className="w-full max-w-2xl relative z-10">
        {/* Header Card */}
        <div className="bg-card/90 backdrop-blur-lg border border-border rounded-t-2xl p-4 shadow-lg">
          <div className="flex items-center justify-between mb-3">
            <button
              onClick={handleBack}
              className="p-2 hover:bg-surface rounded-lg transition-colors"
            >
              <ArrowLeft size={20} />
            </button>
            <h1 className="text-lg font-bold">Aptitude Assessment</h1>
            <div className="w-10" />
          </div>

          {/* Progress */}
          <div>
            <p className="text-xs text-text-secondary mb-2 font-medium">
              Question {currentQuestionIndex + 1} of {questions.length}
            </p>
            <div className="w-full bg-surface rounded-full h-1.5 overflow-hidden shadow-inner">
              <motion.div
                className="h-full bg-gradient-to-r from-primary to-secondary"
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.3 }}
              />
            </div>
          </div>
        </div>

        {/* Question & Options Card */}
        <div className="bg-card/90 backdrop-blur-lg border-x border-border p-6 shadow-lg">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentQuestionIndex}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              {/* Question */}
              <h2 className="text-xl font-bold text-text mb-4">
                {currentQuestion.data.text}
              </h2>

              {/* Options - Compact */}
              <div className="space-y-2">
                {currentQuestion.data.options.map((option) => (
                  <motion.button
                    key={option.id}
                    onClick={() => setSelectedOption(option.id)}
                    whileHover={{ scale: 1.01, x: 4 }}
                    whileTap={{ scale: 0.99 }}
                    className={`w-full text-left p-3 rounded-lg border-2 transition-all relative ${
                      selectedOption === option.id
                        ? "border-primary bg-primary/10 shadow-md shadow-primary/20"
                        : "border-border bg-card hover:border-primary/50"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      {/* Simple radio circle */}
                      <div
                        className={`w-4 h-4 rounded-full border-2 flex-shrink-0 transition-all ${
                          selectedOption === option.id
                            ? "border-primary bg-primary"
                            : "border-border bg-surface"
                        }`}
                      >
                        {selectedOption === option.id && (
                          <div className="w-full h-full rounded-full bg-white scale-50" />
                        )}
                      </div>
                      <p
                        className={`text-sm transition-colors ${
                          selectedOption === option.id
                            ? "text-primary font-medium"
                            : "text-text"
                        }`}
                      >
                        {option.text}
                      </p>
                    </div>

                    {/* Glow effect on selected */}
                    {selectedOption === option.id && (
                      <motion.div
                        layoutId="selected-glow"
                        className="absolute inset-0 rounded-lg bg-primary/5 -z-10"
                        transition={{ type: "spring", duration: 0.5 }}
                      />
                    )}
                  </motion.button>
                ))}
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Bottom Action Card */}
        <div className="bg-card/90 backdrop-blur-lg border border-border rounded-b-2xl p-4 shadow-lg">
          <Button
            onClick={handleNext}
            disabled={!selectedOption}
            variant="primary"
            className="w-full shadow-lg shadow-primary/20"
            size="default"
          >
            {currentQuestionIndex === questions.length - 1
              ? "Finish Assessment"
              : "Next Question"}
          </Button>
        </div>
      </div>
    </div>
  );
}
