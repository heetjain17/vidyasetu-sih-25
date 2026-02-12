import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { Brain, CheckCircle2, Clock, Target } from "lucide-react";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/assessment/")({
  component: AssessmentIndex,
});

function AssessmentIndex() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-2xl w-full"
      >
        {/* Header */}
        <div className="text-center mb-12">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2 }}
            className="w-20 h-20 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-6"
          >
            <Brain size={40} className="text-primary" />
          </motion.div>
          <h1 className="text-4xl font-bold mb-4">
            Career Aptitude Assessment
          </h1>
          <p className="text-xl text-text-secondary">
            Discover careers that match your personality and interests
          </p>
        </div>

        {/* Features */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          {[
            { icon: Clock, label: "5-10 minutes", desc: "Quick assessment" },
            {
              icon: Target,
              label: "Personalized",
              desc: "Tailored results",
            },
            {
              icon: CheckCircle2,
              label: "Science-backed",
              desc: "RIASEC model",
            },
          ].map((feature, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 + i * 0.1 }}
              className="bg-card border border-border rounded-xl p-4 text-center"
            >
              <feature.icon size={24} className="text-primary mx-auto mb-2" />
              <p className="font-semibold text-sm">{feature.label}</p>
              <p className="text-xs text-text-secondary">{feature.desc}</p>
            </motion.div>
          ))}
        </div>

        {/* Instructions */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="bg-card border border-border rounded-xl p-6 mb-8"
        >
          <h3 className="font-bold text-lg mb-4">How it works:</h3>
          <ol className="space-y-3 text-text-secondary">
            <li className="flex gap-3">
              <span className="text-primary font-bold">1.</span>
              <span>Answer questions about your interests and preferences</span>
            </li>
            <li className="flex gap-3">
              <span className="text-primary font-bold">2.</span>
              <span>Our AI analyzes your responses using the RIASEC model</span>
            </li>
            <li className="flex gap-3">
              <span className="text-primary font-bold">3.</span>
              <span>Get personalized career recommendations and roadmaps</span>
            </li>
          </ol>
        </motion.div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="space-y-3"
        >
          <Link to="/assessment/quiz">
            <Button variant="primary" size="lg" className="w-full">
              Start Assessment
            </Button>
          </Link>

          <div className="text-center pt-4">
            <Link
              to="/dashboard"
              search={{ tab: undefined }}
              className="text-text-secondary hover:text-primary underline underline-offset-4 text-sm transition-colors"
            >
              Skip assessment and go to Dashboard →
            </Link>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}
