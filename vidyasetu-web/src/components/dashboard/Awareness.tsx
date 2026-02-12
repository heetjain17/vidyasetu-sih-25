import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  BookOpen,
  HelpCircle,
  Lightbulb,
  TrendingUp,
  Briefcase,
  Award,
  CheckCircle2,
  ChevronRight,
  Mountain,
  Microscope,
  MessageSquare,
  Calendar,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { HeroVideoDialog } from "../ui/hero-video-dialog";
import {
  MYTH_KEYS,
  CAREER_PATHS,
  PARENT_ACTIONS,
  SCHOLARSHIPS,
  QUIZ_QUESTIONS,
} from "@/data/parentDashboardData";
import { useNavigate } from "@tanstack/react-router";
import { TimelineModule } from "./TimelineModule";
import { DiscussionsModule } from "./DiscussionsModule";

const HeroSection = () => {
  const { t } = useTranslation();

  return (
    <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-teal-700 via-cyan-800 to-slate-900 text-white p-8 md:p-12">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center relative z-10">
        <div className="space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/20 text-sm font-medium text-blue-200">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
            </span>
            For Parents
          </div>
          <h1 className="text-3xl md:text-5xl font-bold leading-tight">
            {t("parent.hero.title")}
          </h1>
          <p className="text-lg text-blue-100 max-w-xl">
            {t("parent.hero.subtitle")}
          </p>
          <div className="flex flex-wrap gap-4 pt-4">
            <button className="px-6 py-3 bg-white text-indigo-900 rounded-full font-bold hover:bg-blue-50 transition-colors flex items-center gap-2">
              <BookOpen size={20} />
              {t("parent.hero.guide")}
            </button>
          </div>
        </div>

        <div className="relative">
          <HeroVideoDialog
            className="w-full rounded-xl shadow-2xl border-4 border-white/10"
            animationStyle="from-right"
            videoSrc="https://www.youtube.com/embed/dQw4w9WgXcQ" // Placeholder
            thumbnailSrc="https://images.unsplash.com/photo-1544717305-2782549b5136?w=1920&h=1080&fit=crop"
            thumbnailAlt="Parent Guide"
          />
        </div>
      </div>
    </section>
  );
};

const FlipCard = ({ myth, fact }: { myth: string; fact: string }) => {
  const [isFlipped, setIsFlipped] = useState(false);

  return (
    <div
      className="h-48 cursor-pointer group perspective-1000"
      onClick={() => setIsFlipped(!isFlipped)}
    >
      <motion.div
        initial={false}
        animate={{ rotateY: isFlipped ? 180 : 0 }}
        transition={{ duration: 0.6, type: "spring" }}
        style={{ transformStyle: "preserve-3d" }}
        className="relative w-full h-full"
      >
        {/* Front - Myth */}
        <div className="absolute inset-0 backface-hidden rounded-xl bg-card border border-border p-6 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-center items-center text-center">
          <div className="mb-3 px-3 py-1 bg-red-100 text-red-600 rounded-full text-xs font-bold uppercase tracking-wider">
            Myth
          </div>
          <p className="font-medium text-lg text-text">{myth}</p>
          <div className="mt-4 text-xs text-text-secondary flex items-center gap-1">
            <Lightbulb size={12} /> Tap to reveal fact
          </div>
        </div>

        {/* Back - Fact */}
        <div
          className="absolute inset-0 backface-hidden rounded-xl bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 p-6 shadow-sm flex flex-col justify-center items-center text-center"
          style={{ transform: "rotateY(180deg)" }}
        >
          <div className="mb-3 px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-bold uppercase tracking-wider">
            Fact
          </div>
          <p className="font-medium text-lg text-green-800 dark:text-green-300">
            {fact}
          </p>
        </div>
      </motion.div>
    </div>
  );
};

const MythsSection = () => {
  const { t } = useTranslation();

  return (
    <section>
      <div className="flex items-center gap-3 mb-6">
        <HelpCircle className="text-orange-500" size={28} />
        <h2 className="text-2xl font-bold">{t("parent.myths.title")}</h2>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {MYTH_KEYS.map((item) => (
          <FlipCard key={item.id} myth={t(item.myth)} fact={t(item.fact)} />
        ))}
      </div>
    </section>
  );
};

const PathsSection = () => {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState(CAREER_PATHS[0].id);

  return (
    <section>
      <div className="flex items-center gap-3 mb-6">
        <TrendingUp className="text-blue-500" size={28} />
        <h2 className="text-2xl font-bold">{t("parent.paths.title")}</h2>
      </div>

      <div className="bg-card border border-border rounded-xl p-6">
        <div className="flex flex-wrap gap-2 mb-6 border-b border-border pb-4">
          {CAREER_PATHS.map((path) => (
            <button
              key={path.id}
              onClick={() => setActiveTab(path.id)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                activeTab === path.id
                  ? "bg-primary text-white"
                  : "bg-surface text-text-secondary hover:bg-surface/80"
              }`}
            >
              {t(path.title)}
            </button>
          ))}
        </div>

        <AnimatePresence mode="wait">
          {CAREER_PATHS.map(
            (path) =>
              activeTab === path.id && (
                <motion.div
                  key={path.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                >
                  <h3 className="text-lg font-semibold mb-2 text-primary">
                    {t(path.title)} Streams
                  </h3>
                  <p className="text-text-secondary mb-4">
                    Leads to careers in:
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {t(path.careers)
                      .split(", ")
                      .map((career, i) => (
                        <span
                          key={i}
                          className="px-3 py-1.5 bg-background border border-border rounded-full text-sm font-medium"
                        >
                          {career}
                        </span>
                      ))}
                  </div>
                </motion.div>
              )
          )}
        </AnimatePresence>
      </div>
    </section>
  );
};

const ActionsSection = () => {
  const { t } = useTranslation();
  return (
    <section>
      <div className="flex items-center gap-3 mb-6">
        <CheckCircle2 className="text-green-500" size={28} />
        <h2 className="text-2xl font-bold">{t("parent.actions.title")}</h2>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {PARENT_ACTIONS.map((action) => (
          <div
            key={action.id}
            className="bg-card border border-border rounded-xl p-6 hover:border-primary/50 transition-colors"
          >
            <h3 className="font-bold text-lg mb-2 text-primary">
              {t(action.title)}
            </h3>
            <p className="text-text-secondary">{t(action.desc)}</p>
          </div>
        ))}
      </div>
    </section>
  );
};

const ScholarshipsSection = () => {
  const { t } = useTranslation();
  return (
    <section>
      <div className="flex items-center gap-3 mb-6">
        <Award className="text-yellow-500" size={28} />
        <h2 className="text-2xl font-bold">{t("parent.scholarships.title")}</h2>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {SCHOLARSHIPS.map((sch) => (
          <div
            key={sch.id}
            className={`p-4 rounded-xl flex items-center justify-between cursor-pointer hover:shadow-md transition-all ${sch.color}`}
          >
            <span className="font-bold">{t(sch.title)}</span>
            <ChevronRight size={18} className="opacity-60" />
          </div>
        ))}
      </div>
    </section>
  );
};

const StoriesSection = () => {
  const [expandedStory, setExpandedStory] = useState<number | null>(null);

  const inspirationalStories = [
    {
      id: 1,
      name: "Sonam Wangchuk",
      title: "Engineer, Educator & Innovator",
      tagline: "The Real-Life Phunsukh Wangdu from 3 Idiots",
      icon: Mountain,
      iconBg: "bg-cyan-100 dark:bg-cyan-900/30",
      iconColor: "text-cyan-600 dark:text-cyan-400",
      quote:
        "The biggest revolutions are born from the smallest ideas—if you dare to act on them.",
      story: `Sonam Wangchuk grew up in a small Ladakhi village with no proper school and many hardships. He didn't understand the language when he first joined school and was even labelled "slow"—yet he refused to give up.

With courage and curiosity, he completed Mechanical Engineering from NIT Srinagar and later studied Earthen Architecture in France.

Instead of choosing a comfortable job, he chose to transform education. He founded SECMOL, built a solar-powered campus, reformed Ladakh's schooling system, and invented the world-famous Ice Stupa to solve water shortages.

His courage and innovation earned him global respect, including the Ramon Magsaysay Award.`,
      lesson:
        "If Sonam Wangchuk could rise from a remote village to inspire the world, your child too has the power to shape their future—and their country—with courage, creativity, and compassion.",
      achievements: [
        "Ramon Magsaysay Award",
        "Founded SECMOL",
        "Invented Ice Stupa",
        "Reformed Ladakh's Education",
      ],
      accentColor: "text-cyan-600 dark:text-cyan-400",
    },
    {
      id: 2,
      name: "Dr. Tirath Das Dogra",
      title: "Forensic Scientist & Educator",
      tagline: "Pioneer of Modern Forensics in India",
      icon: Microscope,
      iconBg: "bg-purple-100 dark:bg-purple-900/30",
      iconColor: "text-purple-600 dark:text-purple-400",
      quote:
        "Science must stand on the pillars of truth, integrity, and justice.",
      story: `Dr. Tirath Das Dogra, one of India's finest forensic scientists, rose from a small village near Jammu to become a pioneer at AIIMS Delhi.

With his MD in Forensic Medicine, he built India's first Toxicology Lab and DNA Profiling Lab, transforming the nation's crime investigation system.

Known for his honesty and courage, he handled some of India's toughest cases while always putting truth first. As a teacher, author, and Vice-Chancellor, he inspired thousands of students to pursue science with purpose.`,
      lesson:
        "When your child learns with integrity and serves with courage, they can become a force the country trusts.",
      achievements: [
        "Built India's First DNA Lab",
        "AIIMS Pioneer",
        "Vice-Chancellor",
        "Forensic Medicine Expert",
      ],
      accentColor: "text-purple-600 dark:text-purple-400",
    },
  ];

  return (
    <section>
      <div className="flex items-center gap-3 mb-6">
        <Briefcase className="text-purple-500" size={28} />
        <h2 className="text-2xl font-bold">Inspirational Stories</h2>
      </div>
      <p className="text-text-secondary mb-8">
        Real stories of Indians who rose from humble beginnings to inspire the
        nation
      </p>

      <div className="flex flex-col lg:flex-row gap-6 items-start">
        {inspirationalStories.map((story) => {
          const IconComponent = story.icon;
          return (
            <motion.div
              key={story.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-card border border-border rounded-2xl overflow-hidden flex-1"
            >
              {/* Header */}
              <div className="bg-surface/80 backdrop-blur-sm border-b border-border p-6">
                <div className="flex items-center gap-4">
                  <div
                    className={`w-14 h-14 rounded-xl ${story.iconBg} flex items-center justify-center`}
                  >
                    <IconComponent className={`w-7 h-7 ${story.iconColor}`} />
                  </div>
                  <div>
                    <h3 className={`text-xl font-bold ${story.accentColor}`}>
                      {story.name}
                    </h3>
                    <p className="text-text-secondary text-sm">{story.title}</p>
                    <p className="text-text-secondary/60 text-xs mt-1">
                      {story.tagline}
                    </p>
                  </div>
                </div>
              </div>

              {/* Quote */}
              <div className="px-6 py-4 bg-surface/50 border-b border-border">
                <p className="italic text-text-secondary text-sm">
                  "{story.quote}"
                </p>
              </div>

              {/* Content */}
              <div className="p-6">
                {/* Story */}
                <div
                  className={`${expandedStory === story.id ? "" : "line-clamp-4"} text-text-secondary text-sm whitespace-pre-line mb-4`}
                >
                  {story.story}
                </div>

                <button
                  onClick={() =>
                    setExpandedStory(
                      expandedStory === story.id ? null : story.id
                    )
                  }
                  className="text-primary text-sm font-medium hover:underline mb-4"
                >
                  {expandedStory === story.id ? "Show less" : "Read full story"}
                </button>

                {/* Achievements */}
                <div className="flex flex-wrap gap-2 mb-4">
                  {story.achievements.map((achievement) => (
                    <span
                      key={achievement}
                      className="px-2 py-1 bg-primary/10 text-primary text-xs rounded-full font-medium"
                    >
                      {achievement}
                    </span>
                  ))}
                </div>

                {/* Lesson */}
                <div className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                  <p className="text-sm font-medium text-green-800 dark:text-green-300">
                    💡 <span className="font-bold">Lesson for Parents:</span>{" "}
                    {story.lesson}
                  </p>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
};

const QuizSection = () => {
  const { t } = useTranslation();
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [showResult, setShowResult] = useState(false);

  const handleAnswer = (qId: number, option: string) => {
    setAnswers((prev) => ({ ...prev, [qId]: option }));
  };

  const isComplete = QUIZ_QUESTIONS.every((q) => answers[q.id]);

  return (
    <section className="bg-surface border border-border rounded-2xl p-8">
      <h2 className="text-2xl font-bold mb-6 text-center">
        {t("parent.quiz.title")}
      </h2>

      {!showResult ? (
        <div className="space-y-6 max-w-2xl mx-auto">
          {QUIZ_QUESTIONS.map((q) => (
            <div key={q.id} className="space-y-3">
              <p className="font-medium text-lg">{t(q.text)}</p>
              <div className="flex gap-3">
                {q.options.map((opt) => {
                  const optLabel = t(opt);
                  return (
                    <button
                      key={opt}
                      onClick={() => handleAnswer(q.id, optLabel)}
                      className={`px-4 py-2 rounded-lg border transition-all ${
                        answers[q.id] === optLabel
                          ? "bg-primary text-white border-primary"
                          : "bg-background border-border hover:bg-surface"
                      }`}
                    >
                      {optLabel}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}

          <button
            onClick={() => setShowResult(true)}
            disabled={!isComplete}
            className={`w-full py-3 rounded-xl font-bold transition-all ${
              isComplete
                ? "bg-primary text-white shadow-lg hover:bg-primary/90"
                : "bg-border text-text-secondary cursor-not-allowed"
            }`}
          >
            {t("parent.quiz.submit")}
          </button>
        </div>
      ) : (
        <div className="text-center space-y-4 py-8">
          <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 size={32} />
          </div>
          <h3 className="text-2xl font-bold text-green-700 dark:text-green-400">
            {t("parent.quiz.result")}
          </h3>
          <p className="text-text-secondary max-w-lg mx-auto">
            Thank you for taking the time! Based on your answers, we recommend
            exploring the "Courses" section to understand more about available
            opportunities.
          </p>
          <button
            onClick={() => {
              setShowResult(false);
              setAnswers({});
            }}
            className="px-6 py-2 border border-border rounded-lg hover:bg-surface"
          >
            Retake Quiz
          </button>
        </div>
      )}
    </section>
  );
};

const CTASection = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  return (
    <section className="text-center space-y-6 py-12">
      <h2 className="text-3xl font-bold">{t("parent.cta.title")}</h2>
      <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
        <button
          onClick={() =>
            navigate({ to: "/dashboard", search: { tab: "career-hub" } })
          }
          className="px-8 py-4 bg-primary text-white rounded-full font-bold text-lg shadow-xl hover:bg-primary/90 transition-all hover:scale-105"
        >
          {t("parent.cta.explore")}
        </button>
        <button
          onClick={() =>
            navigate({ to: "/dashboard", search: { tab: "colleges" } })
          }
          className="px-8 py-4 bg-white dark:bg-card border border-border rounded-full font-bold text-lg shadow-sm hover:shadow-md transition-all"
        >
          {t("parent.cta.findColleges")}
        </button>
      </div>
    </section>
  );
};

export const ParentDashboardModule: React.FC = () => {
  return (
    <div className="space-y-12 pb-20">
      {/* <HeroSection /> */}
      <MythsSection />
      <PathsSection />
      <ActionsSection />
      <ScholarshipsSection />
      <StoriesSection />

      {/* Exam Timeline Section */}
      <section>
        <div className="flex items-center gap-3 mb-6">
          <Calendar className="text-blue-500" size={28} />
          <h2 className="text-2xl font-bold">Exam Timelines</h2>
        </div>
        <p className="text-text-secondary mb-6">
          Stay updated with important exam dates and deadlines for your child's
          future
        </p>
        <TimelineModule />
      </section>

      {/* Community Forum Section */}
      <section>
        <div className="flex items-center gap-3 mb-6">
          <MessageSquare className="text-indigo-500" size={28} />
          <h2 className="text-2xl font-bold">Parent Community Forum</h2>
        </div>
        <p className="text-text-secondary mb-6">
          Connect with other parents, share experiences, and get advice on
          guiding your child's career
        </p>
        <DiscussionsModule />
      </section>

      <CTASection />
    </div>
  );
};
