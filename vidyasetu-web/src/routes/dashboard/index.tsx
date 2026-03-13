import { CareerHubModule } from "@/components/dashboard/CareerHubModule"
import darkBgLogo from "@/assets/darkbg_icon.png"
import lightBgLogo from "@/assets/lightbg_icon.png"
import { TimelineModule } from "@/components/dashboard/TimelineModule"
import { RecommendationsModule } from "@/components/dashboard/RecommendationsModule"
import { ParentRecommendationsModule } from "@/components/dashboard/ParentRecommendationsModule"
import { AssessmentModule } from "@/components/dashboard/AssessmentModule"
import { CollegesModule } from "@/components/dashboard/CollegesModule"
import { ParentDashboardModule } from "@/components/dashboard/ParentDashboard"
import { ParentDashboardModule as AwarenessModule } from "@/components/dashboard/Awareness"
import { CollegeDashboard } from "@/components/dashboard/CollegeDashboard"
import { DiscussionsModule } from "@/components/dashboard/DiscussionsModule"
import { SandboxModule } from "@/components/dashboard/SandboxModule"
import { ChatbotModule } from "@/components/dashboard/ChatbotModule"
import { StudentDashboard } from "@/components/dashboard/StudentDashboard"
import { StudentProfileModule } from "@/components/dashboard/StudentProfileModule"
import { FeedbackModule } from "@/components/dashboard/FeedbackModule"
import { createFileRoute, useNavigate } from "@tanstack/react-router"
import { motion, AnimatePresence } from "framer-motion"
import {
  Bell,
  BookOpen,
  Briefcase,
  Calendar,
  Compass,
  FileText,
  GraduationCap,
  LayoutDashboard,
  LogOut,
  Menu,
  MessageSquare,
  Bot,
  Moon,
  Sun,
  User,
  Users,
  Wrench,
  X,
  ClipboardCheck,
} from "lucide-react"
import { useState, useEffect, useRef } from "react"
import { useAuthStore } from "@/store/authStore"
import { useProfileStore } from "@/store/profileStore"
import { useQuizStore } from "@/store/quizStore"
import { useNotificationStore } from "@/store/notificationStore"
import { useSignout } from "@/hooks/useAuth"
import { useTranslation } from "react-i18next"
import LanguageSwitcher from "@/components/LanguageSwitcher"

export const Route = createFileRoute("/dashboard/")({
  component: RouteComponent,
  validateSearch: (search: Record<string, unknown>) => {
    return {
      tab: (search.tab as string) || undefined,
    }
  },
})

function RouteComponent() {
  const navigate = useNavigate()
  const { tab } = Route.useSearch()
  const [activeTab, setActiveTab] = useState(tab || "dashboard")
  const [isSidebarOpen, setSidebarOpen] = useState(false)
  const [theme, setTheme] = useState<"light" | "dark">(() => {
    // Initialize theme from localStorage or system preference
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("theme") as "light" | "dark" | null
      if (saved) return saved
      if (window.matchMedia("(prefers-color-scheme: dark)").matches) return "dark"
    }
    return "light"
  })

  // Stores
  const { isAuthenticated, logout, role } = useAuthStore()
  const { t } = useTranslation()
  const { profile } = useProfileStore()
  const { isQuizComplete, recommendations } = useQuizStore()
  const { notifications, markAsRead, markAllAsRead, getUnreadCount } = useNotificationStore()
  const signoutMutation = useSignout()

  // Notification dropdown
  const [showNotifications, setShowNotifications] = useState(false)
  const unreadCount = getUnreadCount()
  const notificationRef = useRef<HTMLDivElement>(null)

  // User dropdown
  const [showUserDropdown, setShowUserDropdown] = useState(false)
  const userDropdownRef = useRef<HTMLDivElement>(null)

  // Invite code state for parent linking
  const [inviteCode, setInviteCode] = useState<string | null>(null)
  const [inviteCodeExpires, setInviteCodeExpires] = useState<string | null>(null)
  const [isGeneratingCode, setIsGeneratingCode] = useState(false)
  const { accessToken } = useAuthStore()

  // Initialize theme on mount
  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark")
  }, [])

  // Close notification dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
        setShowNotifications(false)
      }
    }

    if (showNotifications) {
      document.addEventListener("mousedown", handleClickOutside)
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [showNotifications])

  // Close user dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userDropdownRef.current && !userDropdownRef.current.contains(event.target as Node)) {
        setShowUserDropdown(false)
      }
    }

    if (showUserDropdown) {
      document.addEventListener("mousedown", handleClickOutside)
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [showUserDropdown])

  // Handle tab from URL search param
  useEffect(() => {
    if (tab) {
      setActiveTab(tab)
    }
  }, [tab])

  // Auth check - redirect if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      navigate({ to: "/auth" })
    }
  }, [isAuthenticated, navigate])

  const toggleTheme = () => {
    const newTheme = theme === "light" ? "dark" : "light"
    setTheme(newTheme)
    document.documentElement.classList.toggle("dark", newTheme === "dark")
    localStorage.setItem("theme", newTheme)
  }

  const handleLogout = () => {
    // Sign out from backend
    signoutMutation.mutate()
    // Clear auth store
    logout()
    // Clear profile store
    useProfileStore.getState().clearProfile()
    // Clear quiz store
    useQuizStore.getState().clearQuiz()
    // Clear sessionStorage to ensure fresh state
    sessionStorage.removeItem("auth-storage")
    sessionStorage.removeItem("profile-storage")
    sessionStorage.removeItem("quiz-storage")
    // Navigate to auth page
    navigate({ to: "/auth" })
  }

  // Generate invite code for parent linking
  const API_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000"

  const generateInviteCode = async () => {
    setIsGeneratingCode(true)
    try {
      const response = await fetch(`${API_URL}/profile/student/invite-code`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
      })

      if (!response.ok) throw new Error("Failed to generate code")

      const data = await response.json()
      setInviteCode(data.invite_code)
      setInviteCodeExpires(data.expires_at)
    } catch (error) {
      console.error("Failed to generate invite code:", error)
    } finally {
      setIsGeneratingCode(false)
    }
  }

  // Calculate stats from store data
  const careerMatches = recommendations?.top_careers?.length || 0
  const collegesShortlisted = recommendations?.recommended_colleges?.length || 0

  // Role-based sidebar items
  const studentSidebarItems = [
    {
      id: "dashboard",
      label: t("dashboard.sidebar.dashboard"),
      icon: LayoutDashboard,
    },
    {
      id: "assessment",
      label: t("dashboard.sidebar.assessment"),
      icon: FileText,
    },
    {
      id: "recommendations",
      label: t("dashboard.sidebar.recommendations"),
      icon: Compass,
    },
    {
      id: "colleges",
      label: t("dashboard.sidebar.colleges"),
      icon: GraduationCap,
    },
    {
      id: "career-hub",
      label: t("dashboard.sidebar.careerHub"),
      icon: Briefcase,
    },
    { id: "timeline", label: t("dashboard.sidebar.timeline"), icon: Calendar },
    {
      id: "discussions",
      label: t("dashboard.sidebar.discussions"),
      icon: MessageSquare,
    },
    {
      id: "chatbot",
      label: t("dashboard.sidebar.chatbot"),
      icon: Bot,
    },
    {
      id: "feedback",
      label: t("dashboard.sidebar.feedback"),
      icon: ClipboardCheck,
    },
  ]

  const parentSidebarItems = [
    {
      id: "dashboard",
      label: t("dashboard.sidebar.dashboard"),
      icon: LayoutDashboard,
    },
    {
      id: "recommendations",
      label: t("dashboard.sidebar.recommendations"),
      icon: Compass,
    },
    {
      id: "awareness",
      label: t("dashboard.sidebar.awareness"),
      icon: BookOpen,
    },
    {
      id: "colleges",
      label: t("dashboard.sidebar.colleges"),
      icon: GraduationCap,
    },
    {
      id: "career-hub",
      label: t("dashboard.sidebar.careerHub"),
      icon: Briefcase,
    },
    { id: "timeline", label: t("dashboard.sidebar.timeline"), icon: Calendar },
    {
      id: "discussions",
      label: t("dashboard.sidebar.discussions"),
      icon: MessageSquare,
    },
    {
      id: "feedback",
      label: t("dashboard.sidebar.feedback"),
      icon: ClipboardCheck,
    },
  ]

  const collegeSidebarItems = [
    {
      id: "dashboard",
      label: t("dashboard.sidebar.dashboard"),
      icon: LayoutDashboard,
    },
    {
      id: "feedback",
      label: t("dashboard.sidebar.feedback"),
      icon: ClipboardCheck, // Using ClipboardCheck as defined in imports
    },
  ]

  // Select sidebar items based on role
  const sidebarItems =
    role === "PARENT"
      ? parentSidebarItems
      : role === "COLLEGE"
        ? collegeSidebarItems
        : studentSidebarItems

  return (
    <div className="min-h-screen bg-background flex relative overflow-hidden">
      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {isSidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSidebarOpen(false)}
            className="fixed inset-0 bg-black/50 z-40 md:hidden"
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <motion.aside
        className={`fixed top-0 left-0 h-screen w-64 bg-card/95 backdrop-blur-sm border-r border-border z-50 flex flex-col transition-transform duration-300 shadow-md ${isSidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}`}
      >
        <div className="p-6 border-b border-border flex items-center justify-between">
          <div className="flex items-center gap-2">
            <img
              src={theme === "dark" ? darkBgLogo : lightBgLogo}
              alt="Margadarshaka Logo"
              className="h-10 w-auto"
            />
          </div>
          <button className="md:hidden" onClick={() => setSidebarOpen(false)}>
            <X size={20} />
          </button>
        </div>

        <nav className="flex-grow p-4 space-y-2 overflow-y-auto">
          {sidebarItems.map((item) => (
            <button
              key={item.id}
              onClick={() => {
                setActiveTab(item.id)
                setSidebarOpen(false)
                navigate({ to: "/dashboard", search: { tab: item.id } })
              }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all ${
                activeTab === item.id
                  ? "bg-primary text-text shadow-md"
                  : "text-text-secondary hover:bg-surface hover:text-text"
              }`}
            >
              <item.icon size={20} />
              {item.label}
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-border">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
          >
            <LogOut size={20} />
            {t("dashboard.logout")}
          </button>
        </div>
      </motion.aside>

      {/* Main Content - offset by sidebar width on desktop */}
      <div className="flex-grow flex flex-col min-w-0 md:ml-64">
        {/* Top Header */}
        <header className="h-16 bg-card/80 backdrop-blur-lg border-b border-border flex items-center justify-between px-6 sticky top-0 z-30 shadow-sm">
          <div className="flex items-center gap-4">
            <button className="md:hidden" onClick={() => setSidebarOpen(true)}>
              <Menu size={24} />
            </button>
            <h2 className="text-xl font-bold capitalize hidden sm:block">
              {activeTab.replace("-", " ")}
            </h2>
          </div>

          <div className="flex items-center gap-4">
            {/* <div className="relative hidden sm:block">
              <Search
                className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary"
                size={16}
              />
              <input
                type="text"
                placeholder="Search..."
                className="bg-surface border border-border rounded-full py-2 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 w-64 transition-all"
              />
            </div> */}

            {/* Theme Toggle */}
            <motion.button
              onClick={toggleTheme}
              whileHover={{ scale: 1.1, rotate: 15 }}
              whileTap={{ scale: 0.9 }}
              className="p-2 rounded-full hover:bg-surface transition-colors focus:outline-none"
            >
              {theme === "dark" ? <Sun size={20} className="text-primary" /> : <Moon size={20} />}
            </motion.button>

            {/* Language Switcher */}
            <LanguageSwitcher />

            {/* Notifications */}
            <div className="relative" ref={notificationRef}>
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="p-2 rounded-full hover:bg-surface relative"
              >
                <Bell size={20} />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-card"></span>
                )}
              </button>

              <AnimatePresence>
                {showNotifications && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    className="absolute right-0 top-12 w-80 bg-card border border-border rounded-xl shadow-lg z-50 overflow-hidden"
                  >
                    <div className="p-4 border-b border-border flex justify-between items-center">
                      <h3 className="font-bold">{t("dashboard.notifications.title")}</h3>
                      {unreadCount > 0 && (
                        <button
                          onClick={() => markAllAsRead()}
                          className="text-xs text-primary hover:underline"
                        >
                          {t("dashboard.notifications.markAllRead")}
                        </button>
                      )}
                    </div>
                    <div className="max-h-80 overflow-y-auto">
                      {notifications.length === 0 ? (
                        <div className="p-8 text-center text-text-secondary">
                          <Bell size={32} className="mx-auto mb-2 opacity-50" />
                          <p>{t("dashboard.notifications.empty")}</p>
                        </div>
                      ) : (
                        notifications.slice(0, 10).map((notif) => (
                          <div
                            key={notif.id}
                            onClick={() => {
                              markAsRead(notif.id)
                              setActiveTab("timeline")
                              setShowNotifications(false)
                            }}
                            className={`p-4 border-b border-border cursor-pointer hover:bg-surface transition-colors ${
                              !notif.read ? "bg-primary/5" : ""
                            }`}
                          >
                            <div className="flex items-start gap-3">
                              {!notif.read && (
                                <span className="w-2 h-2 bg-primary rounded-full mt-2 shrink-0"></span>
                              )}
                              <div className={notif.read ? "ml-5" : ""}>
                                <p className="font-medium text-sm">{notif.examName}</p>
                                <p className="text-xs text-text-secondary mt-1">{notif.message}</p>
                                <p className="text-xs text-text-secondary mt-2">
                                  {new Date(notif.createdAt).toLocaleDateString()}
                                </p>
                              </div>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* User Dropdown */}
            <div className="relative" ref={userDropdownRef}>
              <button
                onClick={() => setShowUserDropdown(!showUserDropdown)}
                className="w-8 h-8 rounded-full bg-secondary/20 flex items-center justify-center text-secondary font-bold hover:bg-secondary/30 transition-colors"
              >
                <User size={16} />
              </button>

              <AnimatePresence>
                {showUserDropdown && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    className="absolute right-0 top-12 w-56 bg-card border border-border rounded-xl shadow-lg z-50 overflow-hidden"
                  >
                    <div className="p-3 border-b border-border">
                      <p className="font-medium text-sm truncate">
                        {profile.fullName || "Student"}
                      </p>
                      <p className="text-xs text-text-secondary truncate">{role}</p>
                    </div>
                    <div className="p-2">
                      <button
                        onClick={() => {
                          setActiveTab("profile")
                          setShowUserDropdown(false)
                          navigate({
                            to: "/dashboard",
                            search: { tab: "profile" },
                          })
                        }}
                        className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm hover:bg-surface transition-colors"
                      >
                        <User size={16} />
                        {t("dashboard.myProfile")}
                      </button>
                      <button
                        onClick={() => {
                          handleLogout()
                          setShowUserDropdown(false)
                        }}
                        className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                      >
                        <LogOut size={16} />
                        {t("dashboard.logout")}
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </header>

        {/*Dashboard Content Area */}
        <main className="flex-grow p-6 overflow-y-auto relative z-10">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="max-w-6xl mx-auto"
          >
            {activeTab === "dashboard" && role === "PARENT" && <ParentDashboardModule />}

            {activeTab === "dashboard" && role === "COLLEGE" && <CollegeDashboard />}

            {activeTab === "dashboard" && role !== "PARENT" && role !== "COLLEGE" && (
              <StudentDashboard onTabChange={setActiveTab} />
            )}

            {activeTab === "career-hub" && <CareerHubModule />}

            {activeTab === "timeline" && <TimelineModule />}

            {activeTab === "recommendations" && role === "PARENT" && (
              <ParentRecommendationsModule />
            )}

            {activeTab === "recommendations" && role !== "PARENT" && <RecommendationsModule />}

            {activeTab === "assessment" && <AssessmentModule />}

            {activeTab === "colleges" && <CollegesModule />}

            {activeTab === "awareness" && <AwarenessModule />}

            {activeTab === "parent-dashboard" && <ParentDashboardModule />}

            {activeTab === "discussions" && <DiscussionsModule />}

            {activeTab === "chatbot" && <ChatbotModule />}

            {activeTab === "sandbox" && <SandboxModule />}

            {activeTab === "profile" && <StudentProfileModule />}

            {activeTab === "feedback" && <FeedbackModule />}

            {activeTab !== "dashboard" &&
              activeTab !== "parent-dashboard" &&
              activeTab !== "career-hub" &&
              activeTab !== "timeline" &&
              activeTab !== "recommendations" &&
              activeTab !== "assessment" &&
              activeTab !== "colleges" &&
              activeTab !== "awareness" &&
              activeTab !== "discussions" &&
              activeTab !== "chatbot" &&
              activeTab !== "sandbox" &&
              activeTab !== "profile" &&
              activeTab !== "feedback" && (
                <div className="flex flex-col items-center justify-center h-96 text-center">
                  <div className="w-24 h-24 bg-surface rounded-full flex items-center justify-center mb-6">
                    <Wrench size={40} className="text-text-secondary" />
                  </div>
                  <h2 className="text-2xl font-bold mb-2">{t("dashboard.construction.title")}</h2>
                  <p className="text-text-secondary max-w-md">
                    {t("dashboard.construction.message")}
                  </p>
                </div>
              )}
          </motion.div>
        </main>
      </div>
    </div>
  )
}
