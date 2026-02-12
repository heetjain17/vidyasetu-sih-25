import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Users,
  Link2,
  GraduationCap,
  CheckCircle2,
  Briefcase,
  ChevronRight,
  Loader2,
} from "lucide-react";
import { useAuthStore } from "@/store/authStore";
import { useNavigate } from "@tanstack/react-router";

interface LinkedChild {
  student_id: string;
  student_name: string;
  student_email: string;
  has_recommendations: boolean;
}

const API_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";

/**
 * Parent Dashboard - View linked students and their recommendations
 */
export function ParentDashboard() {
  const navigate = useNavigate();
  const { accessToken } = useAuthStore();
  const [inviteCode, setInviteCode] = useState("");
  const [isConnecting, setIsConnecting] = useState(false);
  const [connectError, setConnectError] = useState<string | null>(null);
  const [connectSuccess, setConnectSuccess] = useState(false);
  const [linkedChildren, setLinkedChildren] = useState<LinkedChild[]>([]);
  const [isLoadingChildren, setIsLoadingChildren] = useState(true);

  // Fetch linked children on mount
  useEffect(() => {
    const fetchLinkedChildren = async () => {
      try {
        const response = await fetch(`${API_URL}/links/children`, {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        });

        if (response.ok) {
          const data = await response.json();
          setLinkedChildren(data.children || []);
        }
      } catch (err) {
        console.error("Failed to fetch linked children:", err);
      } finally {
        setIsLoadingChildren(false);
      }
    };

    fetchLinkedChildren();
  }, [accessToken, connectSuccess]);

  const handleConnect = async () => {
    if (!inviteCode.trim() || inviteCode.length !== 6) {
      setConnectError("Please enter a valid 6-character invite code");
      return;
    }

    setIsConnecting(true);
    setConnectError(null);

    try {
      const response = await fetch(`${API_URL}/links/connect`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ invite_code: inviteCode }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || "Failed to connect");
      }

      setConnectSuccess(true);
      setInviteCode("");
      // Refetch children list
      setIsLoadingChildren(true);
    } catch (error) {
      setConnectError(
        error instanceof Error ? error.message : "Failed to connect"
      );
    } finally {
      setIsConnecting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-text mb-2">Parent Dashboard</h1>
        <p className="text-text-secondary">
          Connect with your children and view their career recommendations
        </p>
      </div>

      {/* Quick Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-card border border-border rounded-xl p-5"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <Users className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold text-text">
                {isLoadingChildren ? "-" : linkedChildren.length}
              </p>
              <p className="text-xs text-text-secondary">Linked Students</p>
            </div>
          </div>
        </motion.div>
        {/* 
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-card border border-border rounded-xl p-5"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-green-500/10 flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5 text-green-500" />
            </div>
            <div>
              <p className="text-2xl font-bold text-text">
                {isLoadingChildren
                  ? "-"
                  : linkedChildren.filter((c) => c.has_recommendations).length}
              </p>
              <p className="text-xs text-text-secondary">
                With Recommendations
              </p>
            </div>
          </div>
        </motion.div> */}

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-card border border-border rounded-xl p-5 cursor-pointer hover:border-primary/50 transition-colors"
          onClick={() =>
            navigate({ to: "/dashboard", search: { tab: "recommendations" } })
          }
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
              <Briefcase className="w-5 h-5 text-blue-500" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-text">
                View Recommendations
              </p>
              <p className="text-xs text-text-secondary">See career paths</p>
            </div>
            <ChevronRight className="w-5 h-5 text-text-secondary" />
          </div>
        </motion.div>
      </div>

      {/* Connect with Student Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-card border border-border rounded-xl p-6"
      >
        <h2 className="text-lg font-semibold text-text mb-4 flex items-center gap-2">
          <Link2 className="w-5 h-5 text-primary" />
          Connect with Your Child
        </h2>
        <p className="text-text-secondary text-sm mb-4">
          Ask your child to generate an invite code from their dashboard, then
          enter it below to connect.
        </p>

        {connectSuccess && (
          <div className="mb-4 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-green-500" />
            <span className="text-sm text-green-700 dark:text-green-300">
              Connected successfully! You can now view your child's
              recommendations.
            </span>
          </div>
        )}

        {connectError && (
          <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
            <span className="text-sm text-red-700 dark:text-red-300">
              {connectError}
            </span>
          </div>
        )}

        <div className="flex gap-3">
          <input
            type="text"
            value={inviteCode}
            onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
            placeholder="Enter 6-digit invite code"
            className="flex-1 px-4 py-2 border border-border rounded-lg bg-surface text-text placeholder:text-text-secondary/50 focus:outline-none focus:ring-2 focus:ring-primary uppercase tracking-widest text-center font-mono"
            maxLength={6}
          />
          <button
            onClick={handleConnect}
            disabled={isConnecting || inviteCode.length !== 6}
            className="px-6 py-2 bg-primary text-white rounded-lg font-medium hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isConnecting ? "Connecting..." : "Connect"}
          </button>
        </div>
      </motion.div>

      {/* Linked Students List */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="bg-card border border-border rounded-xl p-6"
      >
        <h2 className="text-lg font-semibold text-text mb-4 flex items-center gap-2">
          <GraduationCap className="w-5 h-5 text-secondary" />
          Linked Students
        </h2>

        {isLoadingChildren ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin text-primary" />
          </div>
        ) : linkedChildren.length === 0 ? (
          <div className="text-center py-8">
            <GraduationCap className="w-12 h-12 text-text-secondary/30 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-text mb-2">
              No Linked Students
            </h3>
            <p className="text-text-secondary text-sm max-w-md mx-auto">
              Once you connect with your child using their invite code, you'll
              be able to view their career recommendations and progress here.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {linkedChildren.map((child) => (
              <div
                key={child.student_id}
                onClick={() =>
                  navigate({
                    to: "/dashboard",
                    search: { tab: "recommendations" },
                  })
                }
                className="flex items-center justify-between p-4 bg-surface border border-border rounded-lg hover:border-primary/50 cursor-pointer transition-colors group"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <span className="text-primary font-bold">
                      {(child.student_name || child.student_email || "S")
                        .charAt(0)
                        .toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <p className="font-medium text-text">
                      {child.student_name || "Student"}
                    </p>
                    <p className="text-xs text-text-secondary">
                      {child.student_email}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {child.has_recommendations ? (
                    <span className="px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-xs font-medium rounded-full">
                      Has Recommendations
                    </span>
                  ) : (
                    <span className="px-2 py-1 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 text-xs font-medium rounded-full">
                      Pending Assessment
                    </span>
                  )}
                  <ChevronRight className="w-5 h-5 text-text-secondary group-hover:text-primary transition-colors" />
                </div>
              </div>
            ))}
          </div>
        )}
      </motion.div>
    </div>
  );
}

export { ParentDashboard as ParentDashboardModule };
export default ParentDashboard;
