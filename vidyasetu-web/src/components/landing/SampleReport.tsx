import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Briefcase,
  GraduationCap,
  ChevronRight,
  Star,
  MapPin,
  TrendingUp,
  X,
  Sparkles,
} from "lucide-react";
import { useTranslation } from "react-i18next";

// Sample data for the report preview
const sampleCareers = [
  {
    title: "Software Engineer",
    match: 94,
    trait: "Problem Solving",
    color: "from-blue-500 to-cyan-500",
  },
  {
    title: "Data Scientist",
    match: 89,
    trait: "Analytical Skills",
    color: "from-purple-500 to-pink-500",
  },
  {
    title: "UX Designer",
    match: 85,
    trait: "Creativity",
    color: "from-orange-500 to-amber-500",
  },
];

const sampleColleges = [
  {
    name: "NIT Srinagar",
    location: "Srinagar",
    score: 92,
    type: "Government",
  },
  {
    name: "Islamic University of Science & Technology",
    location: "Awantipora",
    score: 88,
    type: "Government",
  },
  {
    name: "Cluster University Srinagar",
    location: "Srinagar",
    score: 84,
    type: "Government",
  },
];

export const SampleReport: React.FC = () => {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"careers" | "colleges">("careers");

  return (
    <section className="py-20 relative">
      <div className="container mx-auto px-6">
        {/* Section Header */}
        <div className="text-center mb-12">
          <motion.span
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-secondary font-bold tracking-wider uppercase text-sm mb-2 block"
          >
            {t("landing.report.tagline", "See before you start")}
          </motion.span>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-3xl md:text-5xl font-bold mb-4"
          >
            {t("landing.report.title", "Your personalized report awaits.")}
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-xl text-text-secondary max-w-2xl mx-auto"
          >
            {t(
              "landing.report.subtitle",
              "Get detailed career matches and college recommendations based on your unique profile."
            )}
          </motion.p>
        </div>

        {/* Report Preview Card */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-4xl mx-auto"
        >
          <div className="relative bg-card rounded-2xl border border-border shadow-2xl overflow-hidden">
            {/* Card Header */}
            <div className="bg-gradient-to-r from-primary/10 to-secondary/10 px-6 py-4 border-b border-border flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-bold text-lg">
                    {t("landing.report.cardTitle", "Sample Career Report")}
                  </h3>
                  <p className="text-sm text-text-secondary">
                    {t(
                      "landing.report.cardSubtitle",
                      "Preview of your results"
                    )}
                  </p>
                </div>
              </div>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsOpen(true)}
                className="px-4 py-2 bg-primary text-background rounded-lg font-semibold text-sm flex items-center gap-2 hover:bg-primary/90 transition-colors"
              >
                {t("landing.report.viewFull", "View Full")}
                <ChevronRight size={16} />
              </motion.button>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-border">
              <button
                onClick={() => setActiveTab("careers")}
                className={`flex-1 px-6 py-3 font-semibold text-sm flex items-center justify-center gap-2 transition-colors ${
                  activeTab === "careers"
                    ? "text-primary border-b-2 border-primary bg-primary/5"
                    : "text-text-secondary hover:text-text"
                }`}
              >
                <Briefcase size={18} />
                {t("landing.report.careers", "Top Careers")}
              </button>
              <button
                onClick={() => setActiveTab("colleges")}
                className={`flex-1 px-6 py-3 font-semibold text-sm flex items-center justify-center gap-2 transition-colors ${
                  activeTab === "colleges"
                    ? "text-primary border-b-2 border-primary bg-primary/5"
                    : "text-text-secondary hover:text-text"
                }`}
              >
                <GraduationCap size={18} />
                {t("landing.report.colleges", "Top Colleges")}
              </button>
            </div>

            {/* Content */}
            <div className="p-6">
              <AnimatePresence mode="wait">
                {activeTab === "careers" ? (
                  <motion.div
                    key="careers"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    className="space-y-4"
                  >
                    {sampleCareers.map((career, index) => (
                      <motion.div
                        key={career.title}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="flex items-center gap-4 p-4 bg-surface rounded-xl border border-border hover:border-primary/30 transition-colors group"
                      >
                        <div
                          className={`w-12 h-12 rounded-xl bg-gradient-to-br ${career.color} flex items-center justify-center text-white font-bold shadow-lg`}
                        >
                          #{index + 1}
                        </div>
                        <div className="flex-1">
                          <h4 className="font-bold text-lg group-hover:text-primary transition-colors">
                            {career.title}
                          </h4>
                          <p className="text-sm text-text-secondary flex items-center gap-1">
                            <TrendingUp size={14} className="text-green-500" />
                            {t("landing.report.topTrait", "Top trait:")}{" "}
                            {career.trait}
                          </p>
                        </div>
                        <div className="text-right">
                          <div className="text-2xl font-bold text-primary">
                            {career.match}%
                          </div>
                          <div className="text-xs text-text-secondary">
                            {t("landing.report.match", "match")}
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </motion.div>
                ) : (
                  <motion.div
                    key="colleges"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    className="space-y-4"
                  >
                    {sampleColleges.map((college, index) => (
                      <motion.div
                        key={college.name}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="flex items-center gap-4 p-4 bg-surface rounded-xl border border-border hover:border-secondary/30 transition-colors group"
                      >
                        <div className="w-12 h-12 rounded-xl bg-secondary/20 flex items-center justify-center">
                          <GraduationCap className="w-6 h-6 text-secondary" />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-bold text-lg group-hover:text-secondary transition-colors">
                            {college.name}
                          </h4>
                          <div className="flex items-center gap-3 text-sm text-text-secondary">
                            <span className="flex items-center gap-1">
                              <MapPin size={14} />
                              {college.location}
                            </span>
                            <span className="px-2 py-0.5 bg-green-500/10 text-green-600 rounded-full text-xs font-medium">
                              {college.type}
                            </span>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="flex items-center gap-1 text-amber-500">
                            <Star size={16} fill="currentColor" />
                            <span className="font-bold">{college.score}</span>
                          </div>
                          <div className="text-xs text-text-secondary">
                            {t("landing.report.score", "score")}
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Footer CTA */}
            <div className="px-6 py-4 bg-gradient-to-r from-primary/5 to-secondary/5 border-t border-border text-center">
              <p className="text-text-secondary text-sm">
                {t(
                  "landing.report.footerText",
                  "Take the quiz to get your personalized report with detailed explanations"
                )}
              </p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Full Report Modal */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setIsOpen(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-card rounded-2xl border border-border shadow-2xl max-w-2xl w-full max-h-[80vh] overflow-y-auto"
            >
              {/* Modal Header */}
              <div className="sticky top-0 bg-card px-6 py-4 border-b border-border flex items-center justify-between z-10">
                <div>
                  <h3 className="font-bold text-xl">
                    {t("landing.report.modalTitle", "Sample Report Preview")}
                  </h3>
                  <p className="text-sm text-text-secondary">
                    {t(
                      "landing.report.modalSubtitle",
                      "This is what your report will look like"
                    )}
                  </p>
                </div>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-2 hover:bg-surface rounded-lg transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Modal Content */}
              <div className="p-6 space-y-8">
                {/* Careers Section */}
                <div>
                  <h4 className="font-bold text-lg mb-4 flex items-center gap-2">
                    <Briefcase className="text-primary" size={20} />
                    {t("landing.report.careerMatches", "Career Matches")}
                  </h4>
                  <div className="space-y-3">
                    {sampleCareers.map((career) => (
                      <div
                        key={career.title}
                        className="flex items-center gap-4 p-4 bg-surface rounded-xl"
                      >
                        <div
                          className={`w-10 h-10 rounded-lg bg-gradient-to-br ${career.color} flex items-center justify-center text-white font-bold text-sm`}
                        >
                          {career.match}%
                        </div>
                        <div className="flex-1">
                          <h5 className="font-semibold">{career.title}</h5>
                          <p className="text-sm text-text-secondary">
                            {t("landing.report.basedOn", "Based on your")}{" "}
                            {career.trait.toLowerCase()}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Colleges Section */}
                <div>
                  <h4 className="font-bold text-lg mb-4 flex items-center gap-2">
                    <GraduationCap className="text-secondary" size={20} />
                    {t("landing.report.collegeMatches", "College Matches")}
                  </h4>
                  <div className="space-y-3">
                    {sampleColleges.map((college) => (
                      <div
                        key={college.name}
                        className="flex items-center gap-4 p-4 bg-surface rounded-xl"
                      >
                        <div className="w-10 h-10 rounded-lg bg-secondary/20 flex items-center justify-center">
                          <Star className="text-secondary" size={18} />
                        </div>
                        <div className="flex-1">
                          <h5 className="font-semibold">{college.name}</h5>
                          <p className="text-sm text-text-secondary">
                            {college.location} • {college.type}
                          </p>
                        </div>
                        <div className="font-bold text-secondary">
                          {college.score}%
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="sticky bottom-0 bg-card px-6 py-4 border-t border-border">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setIsOpen(false)}
                  className="w-full py-3 bg-primary text-background rounded-xl font-bold text-lg hover:bg-primary/90 transition-colors"
                >
                  {t("landing.report.getYours", "Get Your Personalized Report")}
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
};
