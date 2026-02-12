import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import {
  BookOpen,
  Briefcase,
  GraduationCap,
  Award,
  Search,
  ExternalLink,
  Clock,
  ChevronLeft,
  ChevronRight,
  Building2,
  FileText,
  TrendingUp,
  Sparkles,
  X,
} from "lucide-react";
import {
  getCourses,
  getRoadmaps,
  getScholarships,
  type StudyMaterial,
  type CareerRoadmap,
  type Scholarship,
} from "@/api/careerHubApi";

// Tab types
type TabType = "courses" | "roadmaps" | "scholarships";

// Color palettes for roadmap cards
const ROADMAP_COLORS = [
  {
    bg: "from-blue-500 to-cyan-500",
    light: "bg-blue-50 dark:bg-blue-900/20",
    border: "border-blue-200 dark:border-blue-800",
    text: "text-blue-600 dark:text-blue-400",
  },
  {
    bg: "from-purple-500 to-pink-500",
    light: "bg-purple-50 dark:bg-purple-900/20",
    border: "border-purple-200 dark:border-purple-800",
    text: "text-purple-600 dark:text-purple-400",
  },
  {
    bg: "from-green-500 to-emerald-500",
    light: "bg-green-50 dark:bg-green-900/20",
    border: "border-green-200 dark:border-green-800",
    text: "text-green-600 dark:text-green-400",
  },
  {
    bg: "from-orange-500 to-amber-500",
    light: "bg-orange-50 dark:bg-orange-900/20",
    border: "border-orange-200 dark:border-orange-800",
    text: "text-orange-600 dark:text-orange-400",
  },
  {
    bg: "from-rose-500 to-red-500",
    light: "bg-rose-50 dark:bg-rose-900/20",
    border: "border-rose-200 dark:border-rose-800",
    text: "text-rose-600 dark:text-rose-400",
  },
  {
    bg: "from-indigo-500 to-violet-500",
    light: "bg-indigo-50 dark:bg-indigo-900/20",
    border: "border-indigo-200 dark:border-indigo-800",
    text: "text-indigo-600 dark:text-indigo-400",
  },
];

export function CareerHubModule() {
  const [activeTab, setActiveTab] = useState<TabType>("courses");
  const [searchQuery, setSearchQuery] = useState("");
  const [coursePage, setCoursePage] = useState(1);
  const [roadmapPage, setRoadmapPage] = useState(1);

  const ITEMS_PER_PAGE = 16;

  // Queries
  const coursesQuery = useQuery({
    queryKey: ["courses", coursePage, searchQuery],
    queryFn: () =>
      getCourses(coursePage, ITEMS_PER_PAGE, searchQuery || undefined),
  });

  const roadmapsQuery = useQuery({
    queryKey: ["roadmaps", roadmapPage, searchQuery],
    queryFn: () =>
      getRoadmaps(roadmapPage, ITEMS_PER_PAGE, searchQuery || undefined),
  });

  const scholarshipsQuery = useQuery({
    queryKey: ["scholarships"],
    queryFn: getScholarships,
  });

  const tabs = [
    {
      id: "courses" as TabType,
      label: "Courses",
      icon: BookOpen,
      count: coursesQuery.data?.total,
    },
    {
      id: "roadmaps" as TabType,
      label: "Roadmaps",
      icon: TrendingUp,
      count: roadmapsQuery.data?.total,
    },
    {
      id: "scholarships" as TabType,
      label: "Scholarships",
      icon: Award,
      count: scholarshipsQuery.data?.total,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-primary" />
            Career Hub
          </h1>
          <p className="text-text-secondary text-sm mt-1">
            Explore courses, career roadmaps, and scholarship opportunities
          </p>
        </div>

        {/* Search */}
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary" />
          <input
            type="text"
            placeholder={`Search ${activeTab}...`}
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCoursePage(1);
              setRoadmapPage(1);
            }}
            className="w-full pl-10 pr-10 py-2.5 bg-surface border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-surface rounded"
            >
              <X className="w-4 h-4 text-text-secondary" />
            </button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-border pb-2">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-lg font-medium text-sm transition-all ${
              activeTab === tab.id
                ? "bg-primary text-white shadow-md"
                : "text-text-secondary hover:bg-surface"
            }`}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
            {tab.count !== undefined && (
              <span
                className={`px-1.5 py-0.5 rounded-full text-xs ${
                  activeTab === tab.id ? "bg-white/20" : "bg-surface"
                }`}
              >
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
        >
          {activeTab === "courses" && (
            <CoursesSection
              data={coursesQuery.data}
              isLoading={coursesQuery.isLoading}
              page={coursePage}
              setPage={setCoursePage}
            />
          )}
          {activeTab === "roadmaps" && (
            <RoadmapsSection
              data={roadmapsQuery.data}
              isLoading={roadmapsQuery.isLoading}
              page={roadmapPage}
              setPage={setRoadmapPage}
            />
          )}
          {activeTab === "scholarships" && (
            <ScholarshipsSection
              data={scholarshipsQuery.data}
              isLoading={scholarshipsQuery.isLoading}
            />
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

// ============================================================
// Courses Section
// ============================================================

interface CoursesSectionProps {
  data?: { data: StudyMaterial[]; total: number; pages: number };
  isLoading: boolean;
  page: number;
  setPage: (page: number) => void;
}

function CoursesSection({
  data,
  isLoading,
  page,
  setPage,
}: CoursesSectionProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <div
            key={i}
            className="bg-card border border-border rounded-xl p-4 animate-pulse"
          >
            <div className="h-4 bg-surface rounded w-3/4 mb-3" />
            <div className="h-3 bg-surface rounded w-1/2 mb-2" />
            <div className="h-3 bg-surface rounded w-1/3" />
          </div>
        ))}
      </div>
    );
  }

  if (!data?.data.length) {
    return (
      <div className="text-center py-16">
        <BookOpen className="w-12 h-12 text-text-secondary mx-auto mb-4" />
        <h3 className="text-lg font-semibold">No courses found</h3>
        <p className="text-text-secondary text-sm">
          Try adjusting your search query
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {data.data.map((course, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.03 }}
            className="group bg-card border border-border rounded-xl p-4 hover:border-primary/50 hover:shadow-lg transition-all"
          >
            <div className="flex items-start justify-between mb-3">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <GraduationCap className="w-5 h-5 text-primary" />
              </div>
              {course.link && (
                <a
                  href={course.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 rounded-lg hover:bg-surface opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <ExternalLink className="w-4 h-4 text-text-secondary" />
                </a>
              )}
            </div>
            <h3 className="font-semibold text-sm mb-2 line-clamp-2">
              {course.courses}
            </h3>
            {course.duration && (
              <div className="flex items-center gap-1 text-xs text-text-secondary">
                <Clock className="w-3 h-3" />
                {course.duration}
              </div>
            )}
            {course.materials && (
              <p className="text-xs text-text-secondary mt-2 line-clamp-2">
                {course.materials}
              </p>
            )}
          </motion.div>
        ))}
      </div>

      {/* Pagination */}
      {data.pages > 1 && (
        <div className="flex items-center justify-center gap-2 pt-4">
          <button
            onClick={() => setPage(Math.max(1, page - 1))}
            disabled={page === 1}
            className="p-2 rounded-lg border border-border hover:bg-surface disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="text-sm">
            Page {page} of {data.pages}
          </span>
          <button
            onClick={() => setPage(Math.min(data.pages, page + 1))}
            disabled={page === data.pages}
            className="p-2 rounded-lg border border-border hover:bg-surface disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
}

// ============================================================
// Roadmaps Section
// ============================================================

interface RoadmapsSectionProps {
  data?: { data: CareerRoadmap[]; total: number; pages: number };
  isLoading: boolean;
  page: number;
  setPage: (page: number) => void;
}

function RoadmapsSection({
  data,
  isLoading,
  page,
  setPage,
}: RoadmapsSectionProps) {
  // Helper to split data by '/' and trim
  const splitData = (text: string | null | undefined): string[] => {
    if (!text) return [];
    return text
      .split("/")
      .map((item) => item.trim())
      .filter(Boolean);
  };

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 gap-6">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="bg-card border border-border rounded-2xl p-6 animate-pulse"
          >
            <div className="h-8 bg-surface rounded w-1/3 mb-6" />
            <div className="grid grid-cols-4 gap-4">
              {Array.from({ length: 4 }).map((_, j) => (
                <div key={j} className="space-y-2">
                  <div className="h-4 bg-surface rounded w-1/2" />
                  <div className="flex flex-wrap gap-2">
                    <div className="h-6 bg-surface rounded w-16" />
                    <div className="h-6 bg-surface rounded w-20" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (!data?.data.length) {
    return (
      <div className="text-center py-16">
        <TrendingUp className="w-12 h-12 text-text-secondary mx-auto mb-4" />
        <h3 className="text-lg font-semibold">No roadmaps found</h3>
        <p className="text-text-secondary text-sm">
          Try adjusting your search query
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {data.data.map((roadmap, index) => {
        const colors = ROADMAP_COLORS[index % ROADMAP_COLORS.length];
        const industries = splitData(roadmap.industry);
        const exams = splitData(roadmap.government_exams);
        const companies = splitData(roadmap.company_names);
        const education = splitData(roadmap.higher_education);

        return (
          <motion.div
            key={roadmap.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className="bg-card border border-border rounded-2xl overflow-hidden hover:shadow-xl transition-all"
          >
            {/* Header with Course Name */}
            <div className={`${colors.light} border-b-2 ${colors.border} p-4`}>
              <div className="flex items-center gap-3">
                <div
                  className={`w-10 h-10 rounded-xl ${colors.light} border-2 ${colors.border} flex items-center justify-center`}
                >
                  <GraduationCap className={`w-5 h-5 ${colors.text}`} />
                </div>
                <h3 className={`font-bold text-lg ${colors.text}`}>
                  {roadmap.courses}
                </h3>
              </div>
            </div>

            {/* Journey Timeline */}
            <div className="p-5">
              <div className="flex flex-col lg:flex-row gap-4 lg:gap-0">
                {/* Step 1: Industries */}
                <div className="flex-1 relative">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-8 h-8 rounded-full bg-blue-500 text-white flex items-center justify-center text-sm font-bold shrink-0">
                      1
                    </div>
                    <div className="flex items-center gap-2">
                      <Building2 className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                      <span className="font-semibold text-sm text-blue-700 dark:text-blue-400">
                        Industries
                      </span>
                    </div>
                    <div className="hidden lg:block flex-1 h-0.5 bg-gradient-to-r from-blue-400 to-amber-400" />
                  </div>
                  <div className="flex flex-wrap gap-1.5 ml-11">
                    {industries.length > 0 ? (
                      industries.slice(0, 3).map((item, i) => (
                        <span
                          key={i}
                          className="px-2 py-1 rounded-md text-xs bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 border border-blue-200 dark:border-blue-800"
                        >
                          {item}
                        </span>
                      ))
                    ) : (
                      <span className="text-xs text-text-secondary italic">
                        —
                      </span>
                    )}
                    {industries.length > 3 && (
                      <span className="text-xs text-blue-600">
                        +{industries.length - 3}
                      </span>
                    )}
                  </div>
                </div>

                {/* Step 2: Exams */}
                <div className="flex-1 relative">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-8 h-8 rounded-full bg-amber-500 text-white flex items-center justify-center text-sm font-bold shrink-0">
                      2
                    </div>
                    <div className="flex items-center gap-2">
                      <FileText className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                      <span className="font-semibold text-sm text-amber-700 dark:text-amber-400">
                        Govt. Exams
                      </span>
                    </div>
                    <div className="hidden lg:block flex-1 h-0.5 bg-gradient-to-r from-amber-400 to-emerald-400" />
                  </div>
                  <div className="flex flex-wrap gap-1.5 ml-11">
                    {exams.length > 0 ? (
                      exams.slice(0, 3).map((item, i) => (
                        <span
                          key={i}
                          className="px-2 py-1 rounded-md text-xs bg-amber-50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800"
                        >
                          {item}
                        </span>
                      ))
                    ) : (
                      <span className="text-xs text-text-secondary italic">
                        —
                      </span>
                    )}
                    {exams.length > 3 && (
                      <span className="text-xs text-amber-600">
                        +{exams.length - 3}
                      </span>
                    )}
                  </div>
                </div>

                {/* Step 3: Companies */}
                <div className="flex-1 relative">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-8 h-8 rounded-full bg-emerald-500 text-white flex items-center justify-center text-sm font-bold shrink-0">
                      3
                    </div>
                    <div className="flex items-center gap-2">
                      <Briefcase className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                      <span className="font-semibold text-sm text-emerald-700 dark:text-emerald-400">
                        Companies
                      </span>
                    </div>
                    <div className="hidden lg:block flex-1 h-0.5 bg-gradient-to-r from-emerald-400 to-violet-400" />
                  </div>
                  <div className="flex flex-wrap gap-1.5 ml-11">
                    {companies.length > 0 ? (
                      companies.slice(0, 3).map((item, i) => (
                        <span
                          key={i}
                          className="px-2 py-1 rounded-md text-xs bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800"
                        >
                          {item}
                        </span>
                      ))
                    ) : (
                      <span className="text-xs text-text-secondary italic">
                        —
                      </span>
                    )}
                    {companies.length > 3 && (
                      <span className="text-xs text-emerald-600">
                        +{companies.length - 3}
                      </span>
                    )}
                  </div>
                </div>

                {/* Step 4: Higher Education */}
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-8 h-8 rounded-full bg-violet-500 text-white flex items-center justify-center text-sm font-bold shrink-0">
                      4
                    </div>
                    <div className="flex items-center gap-2">
                      <TrendingUp className="w-4 h-4 text-violet-600 dark:text-violet-400" />
                      <span className="font-semibold text-sm text-violet-700 dark:text-violet-400">
                        Higher Studies
                      </span>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-1.5 ml-11">
                    {education.length > 0 ? (
                      education.slice(0, 3).map((item, i) => (
                        <span
                          key={i}
                          className="px-2 py-1 rounded-md text-xs bg-violet-50 dark:bg-violet-900/30 text-violet-700 dark:text-violet-400 border border-violet-200 dark:border-violet-800"
                        >
                          {item}
                        </span>
                      ))
                    ) : (
                      <span className="text-xs text-text-secondary italic">
                        —
                      </span>
                    )}
                    {education.length > 3 && (
                      <span className="text-xs text-violet-600">
                        +{education.length - 3}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        );
      })}

      {/* Pagination */}
      {data.pages > 1 && (
        <div className="flex items-center justify-center gap-2 pt-4">
          <button
            onClick={() => setPage(Math.max(1, page - 1))}
            disabled={page === 1}
            className="p-2 rounded-lg border border-border hover:bg-surface disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="text-sm">
            Page {page} of {data.pages}
          </span>
          <button
            onClick={() => setPage(Math.min(data.pages, page + 1))}
            disabled={page === data.pages}
            className="p-2 rounded-lg border border-border hover:bg-surface disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
}

// ============================================================
// Scholarships Section
// ============================================================

interface ScholarshipsSectionProps {
  data?: { data: Scholarship[]; total: number };
  isLoading: boolean;
}

function ScholarshipsSection({ data, isLoading }: ScholarshipsSectionProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <div
            key={i}
            className="bg-card border border-border rounded-xl p-4 animate-pulse"
          >
            <div className="h-5 bg-surface rounded w-3/4 mb-2" />
            <div className="h-4 bg-surface rounded w-1/2" />
          </div>
        ))}
      </div>
    );
  }

  if (!data?.data.length) {
    return (
      <div className="text-center py-16">
        <Award className="w-12 h-12 text-text-secondary mx-auto mb-4" />
        <h3 className="text-lg font-semibold">No scholarships available</h3>
        <p className="text-text-secondary text-sm">
          Check back later for updates
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {data.data.map((scholarship, index) => (
        <motion.div
          key={scholarship.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.05 }}
          className="bg-amber-50 dark:bg-amber-900/20 border-2 border-amber-300 dark:border-amber-700 rounded-xl p-5 hover:shadow-lg transition-all"
        >
          {/* Header */}
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-amber-100 dark:bg-amber-800/50 border border-amber-300 dark:border-amber-600 flex items-center justify-center">
                <Award className="w-5 h-5 text-amber-600 dark:text-amber-400" />
              </div>
              <h3 className="font-bold text-amber-800 dark:text-amber-300">
                {scholarship.scheme}
              </h3>
            </div>
            {scholarship.link && (
              <a
                href={scholarship.link}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 rounded-lg hover:bg-amber-100 dark:hover:bg-amber-800/50 transition-colors"
              >
                <ExternalLink className="w-4 h-4 text-amber-600 dark:text-amber-400" />
              </a>
            )}
          </div>

          {/* Eligibility */}
          {scholarship.eligibility && (
            <div className="mb-3">
              <p className="text-xs font-semibold text-amber-700 dark:text-amber-400 uppercase tracking-wide mb-1">
                Eligibility
              </p>
              <p className="text-sm text-text">{scholarship.eligibility}</p>
            </div>
          )}

          {/* Benefit */}
          {scholarship.benefit && (
            <div>
              <p className="text-xs font-semibold text-amber-700 dark:text-amber-400 uppercase tracking-wide mb-1">
                Benefit
              </p>
              <p className="text-sm text-text">{scholarship.benefit}</p>
            </div>
          )}
        </motion.div>
      ))}
    </div>
  );
}
