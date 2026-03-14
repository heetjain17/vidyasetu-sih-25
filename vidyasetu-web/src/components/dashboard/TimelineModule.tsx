import React, { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  Calendar,
  Clock,
  CheckCircle,
  AlertCircle,
  MessageCircle,
  CalendarPlus,
  ExternalLink,
  Bookmark,
  Globe,
  FileText,
  Loader2,
  X,
  Copy,
  Check,
} from "lucide-react"
import { type ExamTimeline } from "@/api/timelineApi"
import { syncToGoogleCalendar, subscribeWhatsApp, fetchTimelines } from "@/api/timelineApi"
import { useNotificationStore } from "@/store/notificationStore"

export const TimelineModule: React.FC = () => {
  // Timeline data from API
  const [timelineData, setTimelineData] = useState<ExamTimeline[]>([])
  const [dataLoading, setDataLoading] = useState(true)
  const [dataError, setDataError] = useState<string | null>(null)

  const [selectedExamId, setSelectedExamId] = useState<string | null>(null)
  const [following, setFollowing] = useState<string[]>([])

  // Modal states
  const [showCalendarModal, setShowCalendarModal] = useState(false)
  const [showWhatsAppModal, setShowWhatsAppModal] = useState(false)
  const [calendarLink, setCalendarLink] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)

  // Form states
  const [email, setEmail] = useState("")
  const [phoneNumber, setPhoneNumber] = useState("")

  // Fetch timeline data from API on mount
  useEffect(() => {
    const loadTimelines = async () => {
      try {
        setDataLoading(true)
        const data = await fetchTimelines()
        setTimelineData(data)
        if (data.length > 0) {
          setSelectedExamId(data[0].id)
        }
      } catch (err: any) {
        setDataError(err.message || "Failed to load timeline data")
      } finally {
        setDataLoading(false)
      }
    }
    loadTimelines()
  }, [])

  const selectedExam = timelineData.find((e) => e.id === selectedExamId)

  const toggleFollow = (id: string, e: React.MouseEvent) => {
    e.stopPropagation()
    const { addNotification } = useNotificationStore.getState()

    if (following.includes(id)) {
      setFollowing(following.filter((fid) => fid !== id))
    } else {
      setFollowing([...following, id])

      // Find the exam and add notifications for upcoming events
      const exam = timelineData.find((ex) => ex.id === id)
      if (exam) {
        const upcomingEvents = exam.events.filter((ev) => ev.status === "Upcoming")
        if (upcomingEvents.length > 0) {
          addNotification({
            examId: exam.id,
            examName: exam.exam_name,
            message: `You're now tracking ${exam.exam_name}. ${upcomingEvents.length} upcoming event(s).`,
            date: new Date().toISOString(),
          })
        }
      }
    }
  }

  // Handle Google Calendar sync
  const handleCalendarSync = async () => {
    if (!selectedExam || !email) return

    setIsLoading(true)
    setError(null)

    try {
      const response = await syncToGoogleCalendar({
        email,
        exam_id: selectedExam.id,
        exam_name: selectedExam.exam_name,
        events: selectedExam.events.map((e) => ({
          title: e.title,
          date: e.date,
          description: e.description,
        })),
      })

      setCalendarLink(response.add_to_google_calendar_url)
      setSuccess("Calendar created successfully!")
    } catch (err: any) {
      setError(err.response?.data?.detail || "Failed to sync calendar")
    } finally {
      setIsLoading(false)
    }
  }

  // Handle WhatsApp subscription
  const handleWhatsAppSubscribe = async () => {
    if (!selectedExam || !phoneNumber) return

    setIsLoading(true)
    setError(null)

    try {
      await subscribeWhatsApp({
        phone_number: phoneNumber,
        exam_id: selectedExam.id,
        exam_name: selectedExam.exam_name,
      })

      setSuccess("Subscribed to WhatsApp updates!")
      setTimeout(() => {
        setShowWhatsAppModal(false)
        setSuccess(null)
      }, 2000)
    } catch (err: any) {
      setError(err.response?.data?.detail || "Failed to subscribe")
    } finally {
      setIsLoading(false)
    }
  }

  const copyToClipboard = () => {
    if (calendarLink) {
      navigator.clipboard.writeText(calendarLink)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const resetModals = () => {
    setShowCalendarModal(false)
    setShowWhatsAppModal(false)
    setCalendarLink(null)
    setError(null)
    setSuccess(null)
    setEmail("")
    setPhoneNumber("")
  }

  // Helper to determine overall status based on latest event
  const getExamStatus = (exam: ExamTimeline) => {
    const hasOngoing = exam.events.some((e) => e.status === "Ongoing")
    if (hasOngoing) return "Ongoing"

    const hasUpcoming = exam.events.some((e) => e.status === "Upcoming")
    if (hasUpcoming) return "Upcoming"

    return "Past"
  }

  const getLastEventDate = (exam: ExamTimeline) => {
    // Sort events by date and get the appropriate one or just the latest
    // For mock, just taking the last one or first upcoming
    const upcoming = exam.events.find((e) => e.status === "Upcoming")
    return upcoming ? new Date(upcoming.date).toLocaleDateString() : "TBD"
  }

  return (
    <div className="space-y-6">
      <div className="mb-6">
        <h2 className="text-3xl font-bold mb-2">Exam Timeline & Reminders</h2>
        <p className="text-text-secondary">
          Track important dates, admit cards, and results for your target exams.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Exam List */}
        <div className="lg:col-span-5 flex flex-col gap-4 h-fit">
          {dataLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="animate-spin text-primary" size={32} />
              <span className="ml-3 text-text-secondary">Loading exams...</span>
            </div>
          ) : dataError ? (
            <div className="bg-red-50 border border-red-200 text-red-600 p-4 rounded-lg">
              {dataError}
            </div>
          ) : timelineData.length === 0 ? (
            <div className="text-center py-12 text-text-secondary">
              No exams found. Please check your backend connection.
            </div>
          ) : (
            [...timelineData]
              .sort((a, b) => {
                const aFollowed = following.includes(a.id) ? 0 : 1
                const bFollowed = following.includes(b.id) ? 0 : 1
                return aFollowed - bFollowed
              })
              .map((exam) => {
                const status = getExamStatus(exam)
                return (
                  <motion.div
                    key={exam.id}
                    onClick={() => setSelectedExamId(exam.id)}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className={`p-5 rounded-xl border cursor-pointer transition-all relative overflow-hidden shrink-0 ${
                      selectedExamId === exam.id
                        ? "bg-card border-primary shadow-lg ring-1 ring-primary"
                        : "bg-card border-border hover:border-primary/50"
                    }`}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <span className="px-2 py-1 rounded text-xs font-bold bg-surface border border-border text-text-secondary">
                        {exam.category}
                      </span>
                      <button
                        onClick={(e) => toggleFollow(exam.id, e)}
                        className={`p-1.5 rounded-full transition-colors ${
                          following.includes(exam.id)
                            ? "bg-primary/20 text-primary"
                            : "hover:bg-surface text-text-secondary"
                        }`}
                      >
                        <Bookmark
                          size={18}
                          fill={following.includes(exam.id) ? "currentColor" : "none"}
                        />
                      </button>
                    </div>

                    <h3 className="text-lg font-bold mb-1">{exam.exam_name}</h3>

                    <div className="flex flex-wrap items-center gap-4 text-sm text-text-secondary mt-3">
                      <div className="flex items-center gap-1">
                        <Calendar size={14} /> {getLastEventDate(exam)}
                      </div>
                      <div
                        className={`flex items-center gap-1 font-medium ${
                          status === "Upcoming"
                            ? "text-amber-500"
                            : status === "Ongoing"
                              ? "text-green-500"
                              : "text-text-secondary"
                        }`}
                      >
                        <Clock size={14} /> {status}
                      </div>
                    </div>

                    {selectedExamId === exam.id && (
                      <motion.div
                        layoutId="active-indicator"
                        className="absolute left-0 top-0 bottom-0 w-1 bg-primary"
                      />
                    )}
                  </motion.div>
                )
              })
          )}
        </div>

        {/* Right Column: Detailed View */}
        <div className="lg:col-span-7 bg-card border border-border rounded-2xl shadow-sm p-6 lg:p-8 flex flex-col h-auto relative">
          <AnimatePresence mode="wait">
            {selectedExam ? (
              <motion.div
                key={selectedExam.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-8"
              >
                {/* Header */}
                <div>
                  <div className="flex items-start justify-between mb-4">
                    <h2 className="text-2xl font-bold text-primary">{selectedExam.exam_name}</h2>
                    <span
                      className={`px-3 py-1 rounded-full text-sm font-bold flex items-center gap-1 ${
                        getExamStatus(selectedExam) === "Upcoming"
                          ? "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"
                          : "bg-surface text-text-secondary"
                      }`}
                    >
                      {getExamStatus(selectedExam) === "Upcoming" && <AlertCircle size={14} />}
                      {getExamStatus(selectedExam)}
                    </span>
                  </div>
                  <p className="text-text-secondary leading-relaxed mb-4">
                    {selectedExam.description}
                  </p>

                  {/* New Fields: Format & Website */}
                  <div className="flex flex-col sm:flex-row gap-4 text-sm">
                    {selectedExam.format && (
                      <div className="flex items-start gap-2 text-text-secondary bg-surface p-3 rounded-lg border border-border flex-1">
                        <FileText size={16} className="mt-0.5 text-primary shrink-0" />
                        <div>
                          <span className="font-bold text-text block mb-1">Format</span>
                          {selectedExam.format}
                        </div>
                      </div>
                    )}

                    {selectedExam.website && (
                      <div className="flex items-start gap-2 text-text-secondary bg-surface p-3 rounded-lg border border-border flex-1">
                        <Globe size={16} className="mt-0.5 text-primary shrink-0" />
                        <div>
                          <span className="font-bold text-text block mb-1">Official Website</span>
                          <a
                            href={selectedExam.website}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-primary hover:underline flex items-center gap-1"
                          >
                            Visit Site <ExternalLink size={12} />
                          </a>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Timeline */}
                <div>
                  <h3 className="font-bold text-lg mb-6 flex items-center gap-2">
                    <Clock className="text-secondary" size={20} /> Exam Schedule
                  </h3>
                  <div className="relative space-y-12 before:absolute before:left-[11px] before:top-2 before:bottom-12 before:w-0.5 before:bg-border">
                    {selectedExam.events.map((item) => (
                      <div key={item.id} className="relative pl-8">
                        <div
                          className={`absolute left-0 top-1 w-6 h-6 rounded-full border-2 flex items-center justify-center bg-card z-10 ${
                            item.status === "Past"
                              ? "border-green-500 text-green-500"
                              : item.status === "Ongoing"
                                ? "border-amber-500 text-amber-500"
                                : "border-primary text-primary"
                          }`}
                        >
                          {item.status === "Past" ? (
                            <CheckCircle size={14} />
                          ) : (
                            <div className="w-2 h-2 bg-current rounded-full" />
                          )}
                        </div>
                        <div>
                          <div className="font-bold text-base">{item.title}</div>
                          <div className="text-text-secondary text-sm flex gap-2 items-center">
                            <span>
                              {new Date(item.date).toLocaleDateString(undefined, {
                                year: "numeric",
                                month: "short",
                                day: "numeric",
                              })}
                            </span>
                            <span className="text-xs px-1.5 py-0.5 bg-surface border rounded capitalize">
                              {item.status}
                            </span>
                          </div>
                          {item.description && (
                            <p className="text-xs text-text-secondary mt-1">{item.description}</p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Integration Actions */}
                <div className="pt-8 border-t border-border mt-auto">
                  <h3 className="font-bold text-lg mb-4">Never miss a deadline</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* WhatsApp Button - Commented out */}
                    {/* <motion.button
                      onClick={() => setShowWhatsAppModal(true)}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="flex items-center justify-center gap-3 px-6 py-4 bg-[#25D366] text-white font-bold rounded-xl shadow-lg hover:bg-[#20bd5a] transition-colors"
                    >
                      <MessageCircle size={24} />
                      <div className="text-left">
                        <div className="text-xs opacity-90">Get updates on</div>
                        <div className="text-base">WhatsApp</div>
                      </div>
                    </motion.button> */}

                    <motion.button
                      onClick={() => setShowCalendarModal(true)}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="flex items-center justify-center gap-3 px-6 py-4 bg-[#4285F4] text-white font-bold rounded-xl shadow-lg hover:bg-[#3367d6] transition-colors"
                    >
                      <CalendarPlus size={24} />
                      <div className="text-left">
                        <div className="text-xs opacity-90">Sync to</div>
                        <div className="text-base">Google Calendar</div>
                      </div>
                    </motion.button>
                  </div>
                  <p className="text-xs text-text-secondary text-center mt-4">
                    By subscribing, you agree to receive automated notifications regarding{" "}
                    {selectedExam.exam_name}.
                  </p>
                </div>

                {/* WhatsApp Modal - Commented out
                <AnimatePresence>
                  {showWhatsAppModal && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
                      onClick={() => resetModals()}
                    >
                      ... modal content ...
                    </motion.div>
                  )}
                </AnimatePresence>
                */}

                {/* Google Calendar Modal */}
                <AnimatePresence>
                  {showCalendarModal && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
                      onClick={() => resetModals()}
                    >
                      <motion.div
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.9, opacity: 0 }}
                        onClick={(e) => e.stopPropagation()}
                        className="bg-card border border-border rounded-2xl p-6 max-w-md w-full shadow-lg"
                      >
                        <div className="flex items-center justify-between mb-4">
                          <h3 className="text-xl font-bold flex items-center gap-2">
                            <CalendarPlus className="text-[#4285F4]" /> Google Calendar
                          </h3>
                          <button
                            onClick={() => resetModals()}
                            className="p-1 hover:bg-surface rounded"
                          >
                            <X size={20} />
                          </button>
                        </div>

                        {calendarLink ? (
                          <div className="space-y-4">
                            <div className="text-center py-4">
                              <Check size={48} className="mx-auto text-green-500 mb-4" />
                              <p className="text-lg font-medium text-green-600 mb-2">
                                Calendar Created!
                              </p>
                              <p className="text-text-secondary text-sm">
                                Click the button below to add it to your Google Calendar.
                              </p>
                            </div>

                            <a
                              href={calendarLink}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="w-full py-3 bg-[#4285F4] text-white font-bold rounded-lg hover:bg-[#3367d6] flex items-center justify-center gap-2"
                            >
                              <ExternalLink size={20} />
                              Add to Google Calendar
                            </a>

                            <div className="flex items-center gap-2">
                              <input
                                type="text"
                                value={calendarLink}
                                readOnly
                                className="flex-1 px-3 py-2 border border-border rounded-lg bg-surface text-sm text-text-secondary truncate"
                              />
                              <button
                                onClick={copyToClipboard}
                                className="px-3 py-2 border border-border rounded-lg hover:bg-surface flex items-center gap-1"
                              >
                                {copied ? (
                                  <Check size={16} className="text-green-500" />
                                ) : (
                                  <Copy size={16} />
                                )}
                                {copied ? "Copied!" : "Copy"}
                              </button>
                            </div>
                          </div>
                        ) : (
                          <>
                            <p className="text-text-secondary mb-4">
                              Enter your email to create a calendar for{" "}
                              <strong>{selectedExam.exam_name}</strong>.
                            </p>

                            {error && (
                              <div className="bg-red-50 border border-red-200 text-red-600 p-3 rounded-lg mb-4 text-sm">
                                {error}
                              </div>
                            )}

                            <input
                              type="email"
                              placeholder="your.email@gmail.com"
                              value={email}
                              onChange={(e) => setEmail(e.target.value)}
                              className="w-full px-4 py-3 border border-border rounded-lg bg-surface focus:ring-2 focus:ring-[#4285F4] focus:border-[#4285F4] outline-none mb-4"
                            />

                            <button
                              onClick={handleCalendarSync}
                              disabled={isLoading || !email}
                              className="w-full py-3 bg-[#4285F4] text-white font-bold rounded-lg hover:bg-[#3367d6] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                            >
                              {isLoading ? <Loader2 className="animate-spin" size={20} /> : null}
                              {isLoading ? "Creating Calendar..." : "Create Calendar"}
                            </button>
                          </>
                        )}
                      </motion.div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-center opacity-50">
                <Calendar size={64} className="mb-4 text-text-secondary" />
                <h3 className="text-xl font-bold mb-2">Select an Exam</h3>
                <p className="text-text-secondary max-w-xs">
                  Click on an exam card from the list to view its complete timeline and set
                  reminders.
                </p>
              </div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}
