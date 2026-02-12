import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Briefcase,
  GraduationCap,
  Users,
  Loader2,
  ChevronDown,
  ChevronUp,
  Star,
  MapPin,
  User,
  BookOpen,
  Target,
} from "lucide-react";
import { useAuthStore } from "@/store/authStore";

interface LinkedChild {
  student_id: string;
  student_name: string;
  student_email: string;
  has_recommendations: boolean;
}

interface StudentProfile {
  full_name: string;
  gender: string;
  locality: string;
  category: string;
  grade: string;
  hobbies: string[];
  extracurriculars: string[];
}

interface Recommendation {
  top_careers: string[];
  recommended_colleges: { name: string; score: number }[];
  career_explanations: { career: string; explanation: string }[];
  riasec_scores?: number[];
}

const API_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";

type TabType = "overview" | "careers" | "colleges";

export function ParentRecommendationsModule() {
  const { accessToken } = useAuthStore();
  const [linkedChildren, setLinkedChildren] = useState<LinkedChild[]>([]);
  const [selectedChild, setSelectedChild] = useState<string | null>(null);
  const [recommendations, setRecommendations] = useState<Recommendation | null>(
    null
  );
  const [profile, setProfile] = useState<StudentProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingRecs, setIsLoadingRecs] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [expandedCareer, setExpandedCareer] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<TabType>("overview");

  // Fetch linked children on mount
  useEffect(() => {
    const fetchLinkedChildren = async () => {
      try {
        const response = await fetch(`${API_URL}/links/children`, {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        });

        if (!response.ok) throw new Error("Failed to fetch linked children");

        const data = await response.json();
        setLinkedChildren(data.children || []);

        // Auto-select first child
        if (data.children?.length > 0) {
          setSelectedChild(data.children[0].student_id);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load");
      } finally {
        setIsLoading(false);
      }
    };

    fetchLinkedChildren();
  }, [accessToken]);

  // Fetch recommendations and profile when child is selected
  useEffect(() => {
    if (!selectedChild) return;

    const fetchData = async () => {
      setIsLoadingRecs(true);
      try {
        // Fetch recommendations
        const recsResponse = await fetch(
          `${API_URL}/links/children/${selectedChild}/recommendations`,
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          }
        );

        if (recsResponse.ok) {
          const recsData = await recsResponse.json();
          setRecommendations(recsData.recommendations);
        } else {
          setRecommendations(null);
        }

        // Fetch student profile
        const profileResponse = await fetch(
          `${API_URL}/links/children/${selectedChild}/profile`,
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          }
        );

        if (profileResponse.ok) {
          const profileData = await profileResponse.json();
          setProfile(profileData.profile);
        } else {
          setProfile(null);
        }
      } catch (err) {
        console.error("Failed to fetch data:", err);
        setRecommendations(null);
        setProfile(null);
      } finally {
        setIsLoadingRecs(false);
      }
    };

    fetchData();
  }, [selectedChild, accessToken]);

  const selectedChildData = linkedChildren.find(
    (c) => c.student_id === selectedChild
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-500">{error}</p>
      </div>
    );
  }

  if (linkedChildren.length === 0) {
    return (
      <div className="text-center py-12">
        <Users className="w-16 h-16 text-text-secondary/30 mx-auto mb-4" />
        <h2 className="text-xl font-bold text-text mb-2">No Linked Children</h2>
        <p className="text-text-secondary max-w-md mx-auto">
          Connect with your child using their invite code from the Dashboard tab
          to view their career recommendations.
        </p>
      </div>
    );
  }

  const tabs = [
    { id: "overview" as TabType, label: "Overview", icon: Target },
    { id: "careers" as TabType, label: "Careers", icon: Briefcase },
    { id: "colleges" as TabType, label: "Colleges", icon: GraduationCap },
  ];

  return (
    <div className="space-y-6">
      {/* Child Selector */}
      <div className="bg-gradient-to-r from-primary/10 to-secondary/10 border border-border rounded-xl p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-primary/20 flex items-center justify-center">
              <span className="text-2xl font-bold text-primary">
                {(
                  selectedChildData?.student_name ||
                  selectedChildData?.student_email ||
                  "S"
                )
                  .charAt(0)
                  .toUpperCase()}
              </span>
            </div>
            <div>
              <h2 className="text-xl font-bold text-text">
                {selectedChildData?.student_name || "Your Child"}
              </h2>
              <p className="text-text-secondary text-sm">
                {selectedChildData?.student_email}
              </p>
            </div>
          </div>

          {linkedChildren.length > 1 && (
            <select
              value={selectedChild || ""}
              onChange={(e) => setSelectedChild(e.target.value)}
              className="px-4 py-2 bg-surface border border-border rounded-lg text-text"
            >
              {linkedChildren.map((child) => (
                <option key={child.student_id} value={child.student_id}>
                  {child.student_name || child.student_email}
                </option>
              ))}
            </select>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-border pb-2">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                activeTab === tab.id
                  ? "bg-primary text-white"
                  : "text-text-secondary hover:bg-surface"
              }`}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {isLoadingRecs ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      ) : (
        <>
          {/* Overview Tab */}
          {activeTab === "overview" && (
            <div className="grid gap-6 md:grid-cols-2">
              {/* Student Profile Card */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-card border border-border rounded-xl p-6"
              >
                <div className="flex items-center gap-3 mb-4">
                  <User className="w-5 h-5 text-primary" />
                  <h3 className="font-bold text-text">Student Profile</h3>
                </div>
                {profile ? (
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-text-secondary text-sm">Name</span>
                      <span className="font-medium text-text">
                        {profile.full_name || "Not set"}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-text-secondary text-sm">Grade</span>
                      <span className="font-medium text-text">
                        {profile.grade || "Not set"}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-text-secondary text-sm">
                        Location
                      </span>
                      <span className="font-medium text-text flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        {profile.locality || "Not set"}
                      </span>
                    </div>
                  </div>
                ) : (
                  <p className="text-text-secondary text-sm">
                    Profile not available
                  </p>
                )}
              </motion.div>

              {/* Interests Card */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-card border border-border rounded-xl p-6"
              >
                <div className="flex items-center gap-3 mb-4">
                  <BookOpen className="w-5 h-5 text-secondary" />
                  <h3 className="font-bold text-text">
                    Interests & Activities
                  </h3>
                </div>
                {profile?.hobbies?.length ||
                profile?.extracurriculars?.length ? (
                  <div className="space-y-3">
                    {profile.hobbies?.length > 0 && (
                      <div>
                        <p className="text-xs text-text-secondary mb-2">
                          Hobbies
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {profile.hobbies.map((hobby) => (
                            <span
                              key={hobby}
                              className="px-2 py-1 bg-primary/10 text-primary text-xs rounded-full"
                            >
                              {hobby}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                    {profile.extracurriculars?.length > 0 && (
                      <div>
                        <p className="text-xs text-text-secondary mb-2">
                          Extracurriculars
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {profile.extracurriculars.map((activity) => (
                            <span
                              key={activity}
                              className="px-2 py-1 bg-secondary/10 text-secondary text-xs rounded-full"
                            >
                              {activity}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <p className="text-text-secondary text-sm">
                    No interests recorded yet
                  </p>
                )}
              </motion.div>

              {/* Quick Stats */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-card border border-border rounded-xl p-6 md:col-span-2"
              >
                <h3 className="font-bold text-text mb-4">Assessment Summary</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center p-4 bg-surface rounded-lg">
                    <p className="text-2xl font-bold text-primary">
                      {recommendations?.top_careers?.length || 0}
                    </p>
                    <p className="text-xs text-text-secondary">
                      Career Matches
                    </p>
                  </div>
                  <div className="text-center p-4 bg-surface rounded-lg">
                    <p className="text-2xl font-bold text-secondary">
                      {recommendations?.recommended_colleges?.length || 0}
                    </p>
                    <p className="text-xs text-text-secondary">
                      Colleges Found
                    </p>
                  </div>
                  <div className="text-center p-4 bg-surface rounded-lg">
                    <p className="text-2xl font-bold text-green-500">
                      {recommendations ? "Complete" : "Pending"}
                    </p>
                    <p className="text-xs text-text-secondary">Assessment</p>
                  </div>
                  <div className="text-center p-4 bg-surface rounded-lg">
                    <p className="text-2xl font-bold text-blue-500">
                      {profile?.locality || "-"}
                    </p>
                    <p className="text-xs text-text-secondary">Region</p>
                  </div>
                </div>
              </motion.div>
            </div>
          )}

          {/* Careers Tab */}
          {activeTab === "careers" && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-card border border-border rounded-xl p-6"
            >
              <div className="flex items-center gap-3 mb-6">
                <Briefcase className="w-6 h-6 text-primary" />
                <h3 className="text-lg font-bold text-text">
                  Top Career Matches
                </h3>
              </div>

              {recommendations?.top_careers?.length ? (
                <div className="space-y-3">
                  {recommendations.top_careers.slice(0, 10).map((career, i) => {
                    const explanation =
                      recommendations.career_explanations?.find(
                        (e) => e.career === career
                      );
                    const isExpanded = expandedCareer === career;

                    return (
                      <div
                        key={career}
                        className="bg-surface border border-border rounded-lg overflow-hidden"
                      >
                        <button
                          onClick={() =>
                            setExpandedCareer(isExpanded ? null : career)
                          }
                          className="w-full p-4 flex items-center justify-between hover:bg-surface/80 transition-colors"
                        >
                          <div className="flex items-center gap-3">
                            <span className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-sm">
                              {i + 1}
                            </span>
                            <span className="font-medium text-text">
                              {career}
                            </span>
                          </div>
                          {explanation &&
                            (isExpanded ? (
                              <ChevronUp className="w-5 h-5 text-text-secondary" />
                            ) : (
                              <ChevronDown className="w-5 h-5 text-text-secondary" />
                            ))}
                        </button>
                        {isExpanded && explanation && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            className="px-4 pb-4 border-t border-border"
                          >
                            <p className="text-text-secondary text-sm pt-3">
                              {explanation.explanation}
                            </p>
                          </motion.div>
                        )}
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Briefcase className="w-12 h-12 text-text-secondary/30 mx-auto mb-4" />
                  <p className="text-text-secondary">
                    No career recommendations yet. Your child needs to complete
                    their assessment first.
                  </p>
                </div>
              )}
            </motion.div>
          )}

          {/* Colleges Tab */}
          {activeTab === "colleges" && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-card border border-border rounded-xl p-6"
            >
              <div className="flex items-center gap-3 mb-6">
                <GraduationCap className="w-6 h-6 text-secondary" />
                <h3 className="text-lg font-bold text-text">
                  Recommended Colleges
                </h3>
              </div>

              {recommendations?.recommended_colleges?.length ? (
                <div className="grid gap-3">
                  {recommendations.recommended_colleges
                    .slice(0, 10)
                    .map((college, i) => (
                      <div
                        key={college.name}
                        className="flex items-center justify-between p-4 bg-surface border border-border rounded-lg"
                      >
                        <div className="flex items-center gap-3">
                          <span className="w-8 h-8 rounded-full bg-secondary/10 text-secondary flex items-center justify-center font-bold text-sm">
                            {i + 1}
                          </span>
                          <div>
                            <span className="font-medium text-text block">
                              {college.name}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center gap-1 text-yellow-500">
                          <Star className="w-4 h-4 fill-current" />
                          <span className="text-sm font-medium">
                            {Math.round(college.score * 100)}%
                          </span>
                        </div>
                      </div>
                    ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <GraduationCap className="w-12 h-12 text-text-secondary/30 mx-auto mb-4" />
                  <p className="text-text-secondary">
                    No college recommendations yet. Your child needs to complete
                    their assessment first.
                  </p>
                </div>
              )}
            </motion.div>
          )}
        </>
      )}
    </div>
  );
}

export default ParentRecommendationsModule;
