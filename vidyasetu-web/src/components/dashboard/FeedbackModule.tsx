import { useState, useMemo } from "react";
import { useMutation } from "@tanstack/react-query";
import { motion } from "framer-motion";
import {
  MessageSquare,
  Send,
  CheckCircle,
  User,
  Users,
  GraduationCap,
} from "lucide-react";
import { useAuthStore } from "@/store/authStore";

const API_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";

type RoleType = "Student" | "Parent" | "SPOC" | "College";
type RatingType = "Yes" | "Somewhat" | "No";

interface FeedbackData {
  role: RoleType;
  question1_answer: RatingType;
  question2_answer: RatingType;
  suggestions: string;
}

// Dynamic questions based on role
const ROLE_QUESTIONS: Record<
  RoleType,
  { question1: string; question2: string; icon: typeof User; label: string }
> = {
  Student: {
    question1: "Were the recommendations useful?",
    question2: "Were the recommendations accurate?",
    icon: GraduationCap,
    label: "Student",
  },
  Parent: {
    question1: "Is your child's progress clearly shown?",
    question2: "Are the recommendations helpful for supporting your child?",
    icon: Users,
    label: "Parent",
  },
  SPOC: {
    question1: "How is the editing feature working for you?",
    question2: "What additional data fields should we add?",
    icon: User,
    label: "SPOC",
  },
  College: {
    question1: "Is the claim verification process seamless?",
    question2: "Does the dashboard provide sufficient student insights?",
    icon: GraduationCap,
    label: "College Admin",
  },
};

export function FeedbackModule() {
  const { accessToken, role } = useAuthStore();
  const [submitted, setSubmitted] = useState(false);

  // Auto-detect role from auth store
  const userRole = useMemo((): RoleType => {
    const userRoleStr = role?.toUpperCase();
    if (userRoleStr === "PARENT") return "Parent";
    if (userRoleStr === "SPOC") return "SPOC";
    if (userRoleStr === "COLLEGE") return "College";
    return "Student"; // Default to Student
  }, [role]);

  const [formData, setFormData] = useState<FeedbackData>({
    role: userRole,
    question1_answer: "Yes",
    question2_answer: "Yes",
    suggestions: "",
  });

  const questions = ROLE_QUESTIONS[userRole];
  const RoleIcon = questions.icon;

  const submitMutation = useMutation({
    mutationFn: async (data: FeedbackData) => {
      // Map to backend expected format
      const payload = {
        role: userRole,
        recommendations_useful: data.question1_answer,
        recommendations_accurate: data.question2_answer,
        suggestions: data.suggestions,
      };
      const res = await fetch(`${API_URL}/feedback/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error("Failed to submit feedback");
      return res.json();
    },
    onSuccess: () => {
      setSubmitted(true);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    submitMutation.mutate(formData);
  };

  if (submitted) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-xl mx-auto text-center py-16"
      >
        <div className="w-20 h-20 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mx-auto mb-6">
          <CheckCircle className="w-10 h-10 text-green-600 dark:text-green-400" />
        </div>
        <h2 className="text-2xl font-bold mb-2">
          Thank you for your feedback!
        </h2>
        <p className="text-text-secondary">
          Your feedback helps us improve our platform.
        </p>
      </motion.div>
    );
  }

  const ratings: RatingType[] = ["Yes", "Somewhat", "No"];

  return (
    <div className="max-w-2xl mx-auto">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
          <MessageSquare className="w-8 h-8 text-primary" />
        </div>
        <h1 className="text-2xl font-bold mb-2">Share Your Feedback</h1>
        <p className="text-text-secondary">
          Help us improve by sharing your experience
        </p>
        {/* Role Badge */}
        <div className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/30">
          <RoleIcon className="w-4 h-4 text-primary" />
          <span className="text-sm font-medium text-primary">
            Feedback as {questions.label}
          </span>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Dynamic Question 1 */}
        <motion.div
          key={`q1-${formData.role}`}
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-card border border-border rounded-xl p-6"
        >
          <label className="block text-sm font-semibold mb-4">
            {questions.question1}
          </label>
          <div className="flex gap-3">
            {ratings.map((rating) => (
              <button
                key={rating}
                type="button"
                onClick={() =>
                  setFormData({ ...formData, question1_answer: rating })
                }
                className={`flex-1 py-3 px-4 rounded-xl border-2 font-medium transition-all ${
                  formData.question1_answer === rating
                    ? rating === "Yes"
                      ? "border-green-500 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400"
                      : rating === "Somewhat"
                        ? "border-amber-500 bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400"
                        : "border-red-500 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400"
                    : "border-border hover:border-primary/50"
                }`}
              >
                {rating}
              </button>
            ))}
          </div>
        </motion.div>

        {/* Dynamic Question 2 */}
        <motion.div
          key={`q2-${formData.role}`}
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-card border border-border rounded-xl p-6"
        >
          <label className="block text-sm font-semibold mb-4">
            {questions.question2}
          </label>
          <div className="flex gap-3">
            {ratings.map((rating) => (
              <button
                key={rating}
                type="button"
                onClick={() =>
                  setFormData({ ...formData, question2_answer: rating })
                }
                className={`flex-1 py-3 px-4 rounded-xl border-2 font-medium transition-all ${
                  formData.question2_answer === rating
                    ? rating === "Yes"
                      ? "border-green-500 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400"
                      : rating === "Somewhat"
                        ? "border-amber-500 bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400"
                        : "border-red-500 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400"
                    : "border-border hover:border-primary/50"
                }`}
              >
                {rating}
              </button>
            ))}
          </div>
        </motion.div>

        {/* Suggestions */}
        <div className="bg-card border border-border rounded-xl p-6">
          <label className="block text-sm font-semibold mb-4">
            {formData.role === "SPOC"
              ? "Any specific data fields or features you'd like?"
              : "Any suggestions for improvement?"}
          </label>
          <textarea
            value={formData.suggestions}
            onChange={(e) =>
              setFormData({ ...formData, suggestions: e.target.value })
            }
            placeholder="Share your thoughts..."
            rows={4}
            className="w-full px-4 py-3 bg-surface border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all resize-none"
          />
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={submitMutation.isPending}
          className="w-full py-4 px-6 bg-primary text-white font-semibold rounded-xl hover:bg-primary/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {submitMutation.isPending ? (
            "Submitting..."
          ) : (
            <>
              <Send className="w-5 h-5" />
              Submit Feedback
            </>
          )}
        </button>

        {submitMutation.isError && (
          <p className="text-center text-red-500 text-sm">
            Failed to submit feedback. Please try again.
          </p>
        )}
      </form>
    </div>
  );
}
