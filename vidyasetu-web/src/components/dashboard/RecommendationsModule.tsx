import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  BookOpen,
  Briefcase,
  ChevronDown,
  ChevronUp,
  GraduationCap,
  Languages,
  Loader2,
  RefreshCcw,
  Sparkles,
  Star,
  TrendingUp,
} from "lucide-react";
import { useNavigate } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { useQuizStore } from "@/store/quizStore";
import { translateText } from "@/api/recommendApi";

export function RecommendationsModule() {
  const navigate = useNavigate();
  const { i18n } = useTranslation();
  const [expandedCareer, setExpandedCareer] = useState<number | null>(0);
  const [expandedCollege, setExpandedCollege] = useState<number | null>(0);
  const [expandedCourse, setExpandedCourse] = useState<number | null>(0);
  const [activeTab, setActiveTab] = useState<
    "careers" | "colleges" | "courses"
  >("careers");
  const [isTranslating, setIsTranslating] = useState(false);
  const [currentLang, setCurrentLang] = useState(i18n.language);

  const {
    recommendations,
    isQuizComplete,
    isLoadingRecommendations,
    reset,
    setCareerTranslation,
    setCollegeTranslation,
    getCareerTranslation,
    getCollegeTranslation,
  } = useQuizStore();

  // Get data from recommendations
  const careerExplanations = recommendations?.career_explanations || [];
  const collegeExplanations = recommendations?.college_explanations || {};
  const recommendedColleges = recommendations?.recommended_colleges || [];
  const riasecScores = recommendations?.riasec_scores || [];
  const careerCourses = recommendations?.career_courses || [];

  // Normalize RIASEC scores for display - scale relative to max score
  // This makes the highest trait appear as 100% and others relative to it
  const maxScore = Math.max(...riasecScores, 0.001); // prevent division by zero
  const normalizedRiasecScores = riasecScores.map((score) => score / maxScore);

  // RIASEC labels
  const riasecLabels = ["R", "I", "A", "S", "E", "C"];
  const riasecFull = [
    "Realistic",
    "Investigative",
    "Artistic",
    "Social",
    "Enterprising",
    "Conventional",
  ];

  // Language mapping
  const langMap: Record<string, "hindi" | "urdu" | "kashmiri" | "dogri"> = {
    hi: "hindi",
    ur: "urdu",
    ks: "kashmiri",
    doi: "dogri",
  };

  // Translate explanations when language changes
  const translateExplanations = useCallback(
    async (targetLang: string) => {
      if (targetLang === "en" || !recommendations) return;

      const apiLang = langMap[targetLang];
      if (!apiLang) return;

      // Check if we already have translations cached in store
      const needsCareerTranslation = careerExplanations.some(
        (c) => !getCareerTranslation(c.career, targetLang)
      );
      const needsCollegeTranslation = recommendedColleges
        .slice(0, 3)
        .some(
          (c) =>
            collegeExplanations[c.name] &&
            !getCollegeTranslation(c.name, targetLang)
        );

      if (!needsCareerTranslation && !needsCollegeTranslation) {
        return; // All translations already cached
      }

      setIsTranslating(true);

      try {
        // Translate career explanations
        for (const career of careerExplanations) {
          if (!getCareerTranslation(career.career, targetLang)) {
            const translated = await translateText(career.explanation, apiLang);
            setCareerTranslation(career.career, targetLang, translated);
          }
        }

        // Translate college explanations (top 3)
        const collegesToTranslate = recommendedColleges.slice(0, 3);
        for (const college of collegesToTranslate) {
          const explanation = collegeExplanations[college.name];
          if (explanation && !getCollegeTranslation(college.name, targetLang)) {
            const translated = await translateText(explanation, apiLang);
            setCollegeTranslation(college.name, targetLang, translated);
          }
        }
      } catch (error) {
        console.error("Translation error:", error);
      } finally {
        setIsTranslating(false);
      }
    },
    [
      recommendations,
      careerExplanations,
      collegeExplanations,
      recommendedColleges,
      getCareerTranslation,
      getCollegeTranslation,
      setCareerTranslation,
      setCollegeTranslation,
    ]
  );

  // Watch for language changes
  useEffect(() => {
    if (i18n.language !== currentLang) {
      setCurrentLang(i18n.language);
      if (i18n.language !== "en" && recommendations) {
        translateExplanations(i18n.language);
      }
    }
  }, [i18n.language, currentLang, recommendations, translateExplanations]);

  // Get translated or original explanation
  const getCareerExplanation = (
    career: string,
    originalExplanation: string
  ) => {
    if (currentLang === "en") return originalExplanation;
    return getCareerTranslation(career, currentLang) || originalExplanation;
  };

  const getCollegeExplanationText = (collegeName: string) => {
    const original =
      collegeExplanations[collegeName] ||
      `This college is a strong match for your profile.`;
    if (currentLang === "en") return original;
    return getCollegeTranslation(collegeName, currentLang) || original;
  };

  // Loading state
  if (isLoadingRecommendations) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-center">
        <Loader2 className="w-10 h-10 animate-spin text-primary mb-4" />
        <p className="text-text-secondary">Loading your recommendations...</p>
      </div>
    );
  }

  // No quiz completed
  if (!isQuizComplete || !recommendations) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-center">
        <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
          <Sparkles className="w-8 h-8 text-primary" />
        </div>
        <h3 className="text-xl font-bold mb-2">No Recommendations Yet</h3>
        <p className="text-text-secondary mb-6 max-w-md">
          Complete the aptitude assessment to get personalized career and
          college recommendations.
        </p>
        <Button
          onClick={() => navigate({ to: "/assessment" })}
          variant="primary"
        >
          Start Assessment
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Translation Loading Banner */}
      <AnimatePresence>
        {isTranslating && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="bg-primary/10 border border-primary/20 rounded-xl p-4 flex items-center gap-3"
          >
            <Languages className="text-primary animate-pulse" size={20} />
            <div className="flex-1">
              <p className="font-medium text-sm">Translating explanations...</p>
              <p className="text-xs text-text-secondary">
                Please wait while we translate to your language
              </p>
            </div>
            <Loader2 className="w-5 h-5 animate-spin text-primary" />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header with Retake */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles className="text-primary" size={20} />
          <h3 className="font-bold text-lg">Your Recommendations</h3>
        </div>
        <Button
          onClick={() => {
            reset();
            navigate({ to: "/assessment/quiz" });
          }}
          variant="ghost"
          size="sm"
          className="gap-2 text-sm"
        >
          <RefreshCcw size={14} />
          Retake
        </Button>
      </div>

      {/* RIASEC Mini Profile */}
      <div className="bg-surface border border-border rounded-xl p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <TrendingUp className="text-primary" size={16} />
            <span className="font-medium text-sm">RIASEC Profile</span>
          </div>
          {/* Info tooltip */}
          <div className="relative group">
            <button className="p-1 rounded-full hover:bg-card transition-colors">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="text-text-secondary"
              >
                <circle cx="12" cy="12" r="10" />
                <path d="M12 16v-4" />
                <path d="M12 8h.01" />
              </svg>
            </button>
            {/* Tooltip popup */}
            <div className="absolute right-0 top-8 w-64 bg-card border border-border rounded-xl p-3 shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50">
              <p className="text-xs font-medium text-text mb-2">
                What does RIASEC mean?
              </p>
              <div className="space-y-1.5 text-xs text-text-secondary">
                <div>
                  <span className="font-bold text-primary">R</span> - Realistic
                  (hands-on, practical)
                </div>
                <div>
                  <span className="font-bold text-primary">I</span> -
                  Investigative (analytical, curious)
                </div>
                <div>
                  <span className="font-bold text-primary">A</span> - Artistic
                  (creative, expressive)
                </div>
                <div>
                  <span className="font-bold text-primary">S</span> - Social
                  (helping, teaching)
                </div>
                <div>
                  <span className="font-bold text-primary">E</span> -
                  Enterprising (leading, persuading)
                </div>
                <div>
                  <span className="font-bold text-primary">C</span> -
                  Conventional (organizing, detail-oriented)
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          {riasecLabels.map((label, i) => {
            const normalizedHeight = normalizedRiasecScores[i] || 0;
            const isMax = normalizedHeight >= 0.99; // Highlight the strongest trait

            return (
              <div
                key={label}
                className="flex-1 text-center"
                title={riasecFull[i]}
              >
                <div
                  className={`text-xs mb-1 transition-colors ${isMax ? "text-secondary font-bold" : "text-text-secondary"}`}
                >
                  {label}
                </div>
                <div className="h-20 bg-border rounded-lg overflow-hidden flex flex-col-reverse relative">
                  <motion.div
                    initial={{ height: 0 }}
                    animate={{ height: `${normalizedHeight * 100}%` }}
                    transition={{ duration: 0.8, delay: i * 0.1 }}
                    className={`rounded-lg ${isMax ? "bg-gradient-to-t from-primary to-secondary" : "bg-gradient-to-t from-primary via-primary to-secondary/40"}`}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Tab Switcher */}
      <div className="flex gap-2">
        <button
          onClick={() => setActiveTab("careers")}
          className={`flex-1 py-2.5 px-3 rounded-lg font-medium text-sm transition-all flex items-center justify-center gap-2 ${
            activeTab === "careers"
              ? "bg-primary text-white"
              : "bg-surface border border-border text-text-secondary hover:bg-surface/80"
          }`}
        >
          <Briefcase size={16} />
          Careers ({careerExplanations.length})
        </button>
        <button
          onClick={() => setActiveTab("colleges")}
          className={`flex-1 py-2.5 px-3 rounded-lg font-medium text-sm transition-all flex items-center justify-center gap-2 ${
            activeTab === "colleges"
              ? "bg-secondary text-white"
              : "bg-surface border border-border text-text-secondary hover:bg-surface/80"
          }`}
        >
          <GraduationCap size={16} />
          Colleges ({Math.min(recommendedColleges.length, 5)})
        </button>
        <button
          onClick={() => setActiveTab("courses")}
          className={`flex-1 py-2.5 px-3 rounded-lg font-medium text-sm transition-all flex items-center justify-center gap-2 ${
            activeTab === "courses"
              ? "bg-gradient-to-r from-amber-500 to-orange-500 text-white"
              : "bg-surface border border-border text-text-secondary hover:bg-surface/80"
          }`}
        >
          <BookOpen size={16} />
          Courses ({careerCourses.reduce((acc, c) => acc + c.courses.length, 0)}
          )
        </button>
      </div>

      {/* Career Tab */}
      <AnimatePresence mode="wait">
        {activeTab === "careers" && (
          <motion.div
            key="careers"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="space-y-3"
          >
            {careerExplanations.map((item, index) => (
              <div
                key={item.career}
                className="bg-surface border border-border rounded-xl overflow-hidden"
              >
                <button
                  onClick={() =>
                    setExpandedCareer(expandedCareer === index ? null : index)
                  }
                  className="w-full p-4 flex items-center justify-between hover:bg-card/50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <span className="w-8 h-8 bg-primary/20 text-primary rounded-full flex items-center justify-center font-bold text-sm">
                      {index + 1}
                    </span>
                    <div className="text-left">
                      <h4 className="font-bold">{item.career}</h4>
                      <p className="text-text-secondary text-xs">
                        Click to see details
                      </p>
                    </div>
                  </div>
                  {expandedCareer === index ? (
                    <ChevronUp className="text-primary" size={20} />
                  ) : (
                    <ChevronDown className="text-text-secondary" size={20} />
                  )}
                </button>

                <AnimatePresence>
                  {expandedCareer === index && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      className="border-t border-border"
                    >
                      <div className="p-4 bg-card/30">
                        <div className="flex items-start gap-2">
                          <Star
                            className="text-yellow-500 mt-0.5 flex-shrink-0"
                            size={16}
                          />
                          <p className="text-text-secondary text-sm leading-relaxed">
                            {isTranslating &&
                            currentLang !== "en" &&
                            !getCareerTranslation(item.career, currentLang) ? (
                              <span className="flex items-center gap-2">
                                <Loader2 className="w-4 h-4 animate-spin" />
                                Translating...
                              </span>
                            ) : (
                              getCareerExplanation(
                                item.career,
                                item.explanation
                              )
                            )}
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </motion.div>
        )}

        {/* Colleges Tab */}
        {activeTab === "colleges" && (
          <motion.div
            key="colleges"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-3"
          >
            {recommendedColleges.slice(0, 5).map((college, index) => (
              <div
                key={college.name}
                className="bg-surface border border-border rounded-xl overflow-hidden"
              >
                <button
                  onClick={() =>
                    setExpandedCollege(expandedCollege === index ? null : index)
                  }
                  className="w-full p-4 flex items-center justify-between hover:bg-card/50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <span className="w-8 h-8 bg-secondary/20 text-secondary rounded-full flex items-center justify-center font-bold text-sm">
                      {index + 1}
                    </span>
                    <div className="text-left">
                      <h4 className="font-bold text-sm">{college.name}</h4>
                      <div className="flex items-center gap-1 mt-0.5">
                        <Star size={12} className="text-yellow-500" />
                        <span className="text-xs text-text-secondary">
                          {Math.round(college.score * 100)}% match
                        </span>
                      </div>
                    </div>
                  </div>
                  {expandedCollege === index ? (
                    <ChevronUp className="text-secondary" size={20} />
                  ) : (
                    <ChevronDown className="text-text-secondary" size={20} />
                  )}
                </button>

                <AnimatePresence>
                  {expandedCollege === index && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      className="border-t border-border"
                    >
                      <div className="p-4 bg-card/30">
                        <div className="flex items-start gap-2">
                          <GraduationCap
                            className="text-secondary mt-0.5 flex-shrink-0"
                            size={16}
                          />
                          <p className="text-text-secondary text-sm leading-relaxed">
                            {isTranslating &&
                            currentLang !== "en" &&
                            collegeExplanations[college.name] &&
                            !getCollegeTranslation(
                              college.name,
                              currentLang
                            ) ? (
                              <span className="flex items-center gap-2">
                                <Loader2 className="w-4 h-4 animate-spin" />
                                Translating...
                              </span>
                            ) : (
                              getCollegeExplanationText(college.name)
                            )}
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </motion.div>
        )}

        {/* Courses Tab */}
        {activeTab === "courses" && (
          <motion.div
            key="courses"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-3"
          >
            {careerCourses.length === 0 ? (
              <div className="text-center py-8 text-text-secondary">
                <BookOpen className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>No courses found for your recommended careers.</p>
              </div>
            ) : (
              careerCourses.map((item, index) => (
                <div
                  key={item.career}
                  className="bg-surface border border-border rounded-xl overflow-hidden"
                >
                  <button
                    onClick={() =>
                      setExpandedCourse(expandedCourse === index ? null : index)
                    }
                    className="w-full p-4 flex items-center justify-between hover:bg-card/50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <span className="w-8 h-8 bg-gradient-to-br from-amber-500/20 to-orange-500/20 text-amber-600 rounded-full flex items-center justify-center font-bold text-sm">
                        {index + 1}
                      </span>
                      <div className="text-left">
                        <h4 className="font-bold">{item.career}</h4>
                        <p className="text-text-secondary text-xs">
                          {item.courses.length} course
                          {item.courses.length !== 1 ? "s" : ""} available
                        </p>
                      </div>
                    </div>
                    {expandedCourse === index ? (
                      <ChevronUp className="text-amber-500" size={20} />
                    ) : (
                      <ChevronDown className="text-text-secondary" size={20} />
                    )}
                  </button>

                  <AnimatePresence>
                    {expandedCourse === index && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="border-t border-border"
                      >
                        <div className="p-4 bg-card/30">
                          <div className="grid gap-2">
                            {item.courses.map((course, courseIndex) => (
                              <div
                                key={courseIndex}
                                className="flex items-center gap-3 p-3 bg-surface rounded-lg border border-border/50 hover:border-amber-500/30 transition-colors"
                              >
                                <div className="w-8 h-8 bg-gradient-to-br from-amber-500/10 to-orange-500/10 rounded-lg flex items-center justify-center">
                                  <BookOpen className="w-4 h-4 text-amber-600" />
                                </div>
                                <div className="flex-1">
                                  <p className="font-medium text-sm">
                                    {course}
                                  </p>
                                  <p className="text-xs text-text-secondary">
                                    Related to {item.career}
                                  </p>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ))
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
