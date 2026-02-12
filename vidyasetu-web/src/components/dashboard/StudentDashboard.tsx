import { useState } from "react";
import { motion } from "framer-motion";
import {
  Compass,
  GraduationCap,
  Briefcase,
  Users,
  Copy,
  RefreshCw,
  CheckCircle,
  Target,
  TrendingUp,
  Sparkles,
  ArrowRight,
  MessageSquare,
} from "lucide-react";
import { useNavigate } from "@tanstack/react-router";
import { useProfileStore } from "@/store/profileStore";
import { useQuizStore } from "@/store/quizStore";
import { useAuthStore } from "@/store/authStore";

const API_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";

interface StudentDashboardProps {
  onTabChange: (tab: string) => void;
}

export function StudentDashboard({ onTabChange }: StudentDashboardProps) {
  const navigate = useNavigate();
  const { profile } = useProfileStore();
  const { isQuizComplete, recommendations } = useQuizStore();
  const { accessToken } = useAuthStore();

  // Parent invite code
  const [inviteCode, setInviteCode] = useState<string | null>(null);
  const [inviteCodeExpires, setInviteCodeExpires] = useState<string | null>(
    null
  );
  const [isGeneratingCode, setIsGeneratingCode] = useState(false);
  const [copied, setCopied] = useState(false);

  const careerMatches = recommendations?.top_careers?.length || 0;
  const collegesShortlisted =
    recommendations?.recommended_colleges?.length || 0;

  const generateInviteCode = async () => {
    if (!accessToken) return;
    setIsGeneratingCode(true);
    try {
      const res = await fetch(`${API_URL}/profile/student/invite-code`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      });
      if (res.ok) {
        const data = await res.json();
        setInviteCode(data.invite_code);
        setInviteCodeExpires(data.expires_at);
      }
    } catch (err) {
      console.error("Failed to generate invite code", err);
    } finally {
      setIsGeneratingCode(false);
    }
  };

  const copyCode = () => {
    if (inviteCode) {
      navigator.clipboard.writeText(inviteCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const quickActions = [
    {
      label: "Take Assessment",
      icon: Target,
      color: "from-blue-500 to-cyan-500",
      action: () => navigate({ to: "/assessment/quiz" }),
      show: !isQuizComplete,
    },
    {
      label: "View Recommendations",
      icon: Compass,
      color: "from-purple-500 to-pink-500",
      action: () => onTabChange("recommendations"),
      show: isQuizComplete,
    },
    {
      label: "Explore Colleges",
      icon: GraduationCap,
      color: "from-green-500 to-emerald-500",
      action: () => onTabChange("colleges"),
      show: true,
    },
    {
      label: "Career Hub",
      icon: Briefcase,
      color: "from-orange-500 to-amber-500",
      action: () => onTabChange("career-hub"),
      show: true,
    },
    {
      label: "AI Assistant",
      icon: MessageSquare,
      color: "from-indigo-500 to-violet-500",
      action: () => onTabChange("sandbox"),
      show: true,
    },
  ].filter((a) => a.show);

  const stats = [
    {
      label: "Career Matches",
      value: careerMatches,
      icon: Briefcase,
      color: "text-blue-500",
      bgColor: "bg-blue-500/10",
    },
    {
      label: "Colleges Found",
      value: collegesShortlisted,
      icon: GraduationCap,
      color: "text-purple-500",
      bgColor: "bg-purple-500/10",
    },
    {
      label: "Profile Status",
      value: profile.isProfileComplete ? "Complete" : "Incomplete",
      icon: profile.isProfileComplete ? CheckCircle : Target,
      color: profile.isProfileComplete ? "text-green-500" : "text-amber-500",
      bgColor: profile.isProfileComplete
        ? "bg-green-500/10"
        : "bg-amber-500/10",
    },
  ];

  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-8 md:p-10"
      >
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wMyI+PHBhdGggZD0iTTM2IDM0djItSDI0di0yaDEyek0zNiAyNHYySDI0di0yaDEyeiIvPjwvZz48L2c+PC9zdmc+')] opacity-50" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-amber-400" />
              <span className="text-amber-400 text-sm font-medium">
                {isQuizComplete ? "Assessment Complete" : "Get Started"}
              </span>
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-white">
              Welcome back, {profile.fullName || "Student"}!
            </h1>
            <p className="text-slate-400 max-w-lg">
              {isQuizComplete
                ? "Your personalized career recommendations are ready. Explore colleges and career paths tailored just for you."
                : "Take our aptitude assessment to discover career paths and colleges that match your potential."}
            </p>
          </div>

          <div className="flex-shrink-0">
            <button
              onClick={() =>
                isQuizComplete
                  ? onTabChange("recommendations")
                  : navigate({ to: "/assessment/quiz" })
              }
              className="group px-6 py-3 bg-gradient-to-r from-amber-500 to-orange-500 text-white font-semibold rounded-xl hover:shadow-lg hover:shadow-amber-500/25 transition-all flex items-center gap-2"
            >
              {isQuizComplete ? "View Recommendations" : "Start Assessment"}
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>

        <Compass className="absolute -right-10 -bottom-10 w-64 h-64 text-white/5 rotate-12" />
      </motion.div>

      {/* Stats Grid */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-1 md:grid-cols-3 gap-4"
      >
        {stats.map((stat, i) => (
          <div
            key={i}
            className="bg-card border border-border rounded-2xl p-6 flex items-center gap-4 hover:border-primary/50 transition-colors"
          >
            <div
              className={`w-14 h-14 rounded-xl ${stat.bgColor} flex items-center justify-center`}
            >
              <stat.icon className={`w-7 h-7 ${stat.color}`} />
            </div>
            <div>
              <div className="text-2xl font-bold">{stat.value}</div>
              <div className="text-text-secondary text-sm">{stat.label}</div>
            </div>
          </div>
        ))}
      </motion.div>

      {/* Quick Actions */}

      {/* Bottom Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Next Steps */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-card border border-border rounded-2xl p-6"
        >
          <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-primary" />
            Recommended Next Steps
          </h3>
          <ul className="space-y-3">
            {[
              {
                text: "Complete your profile for better recommendations",
                done: profile.isProfileComplete,
              },
              { text: "Take the aptitude assessment", done: isQuizComplete },
              { text: "Explore top career matches", done: careerMatches > 0 },
              { text: "Explore Careers and Colleges", done: false },
            ].map((task, i) => (
              <li
                key={i}
                className={`flex items-center gap-3 p-3 rounded-lg border transition-colors ${
                  task.done
                    ? "bg-green-500/5 border-green-500/20"
                    : "bg-surface border-border hover:border-primary/50 cursor-pointer"
                }`}
              >
                <div
                  className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                    task.done
                      ? "bg-green-500 border-green-500"
                      : "border-text-secondary"
                  }`}
                >
                  {task.done && <CheckCircle className="w-3 h-3 text-white" />}
                </div>
                <span
                  className={`text-sm ${task.done ? "text-text-secondary line-through" : "font-medium"}`}
                >
                  {task.text}
                </span>
              </li>
            ))}
          </ul>
        </motion.div>

        {/* Parent Link */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-card border border-border rounded-2xl p-6"
        >
          <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
            <Users className="w-5 h-5 text-primary" />
            Link with Parent
          </h3>
          <p className="text-sm text-text-secondary mb-4">
            Generate a code to share with your parent so they can view your
            career recommendations.
          </p>

          {inviteCode ? (
            <div className="space-y-4">
              <div className="p-4 bg-gradient-to-br from-primary/10 to-primary/5 rounded-xl border border-primary/20 text-center">
                <p className="text-xs text-text-secondary mb-2">
                  Your Invite Code
                </p>
                <p className="text-3xl font-mono font-bold text-primary tracking-[0.3em]">
                  {inviteCode}
                </p>
                {inviteCodeExpires && (
                  <p className="text-xs text-text-secondary mt-2">
                    Expires: {new Date(inviteCodeExpires).toLocaleString()}
                  </p>
                )}
              </div>
              <div className="flex gap-2">
                <button
                  onClick={copyCode}
                  className="flex-1 px-4 py-2 bg-surface border border-border rounded-lg hover:border-primary transition-colors text-sm font-medium flex items-center justify-center gap-2"
                >
                  {copied ? (
                    <CheckCircle className="w-4 h-4 text-green-500" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                  {copied ? "Copied!" : "Copy Code"}
                </button>
                <button
                  onClick={generateInviteCode}
                  disabled={isGeneratingCode}
                  className="px-4 py-2 bg-surface border border-border rounded-lg hover:border-primary transition-colors disabled:opacity-50"
                >
                  <RefreshCw
                    className={`w-4 h-4 ${isGeneratingCode ? "animate-spin" : ""}`}
                  />
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={generateInviteCode}
              disabled={isGeneratingCode}
              className="w-full px-6 py-3 bg-gradient-to-r from-primary to-primary/80 text-white font-semibold rounded-xl hover:shadow-lg hover:shadow-primary/25 transition-all disabled:opacity-50"
            >
              {isGeneratingCode ? "Generating..." : "Generate Invite Code"}
            </button>
          )}
        </motion.div>
      </div>
    </div>
  );
}
