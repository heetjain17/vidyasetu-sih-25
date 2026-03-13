import { useState, useRef, useEffect } from "react"
import { useChatbot } from "../hooks/useChatbot"
import { useTranslation } from "react-i18next"
import {
  FloatingButton,
  ChatHeader,
  ChatMessage,
  ChatInput,
  CollegeCard,
  CareerCard,
  FuturisticCareerCard,
} from "./features/chatbot"
import { Sparkles } from "lucide-react"

export function Chatbot() {
  const { t } = useTranslation()
  const [isOpen, setIsOpen] = useState(false)
  const [isFuturisticMode, setIsFuturisticMode] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const { messages, isLoading, sendMessage, clearMessages } = useChatbot()

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSend = async (message: string) => {
    if (!message.trim() || isLoading) return

    if (isFuturisticMode) {
      await sendMessage(message, true)
    } else {
      await sendMessage(message)
    }
  }

  const handleClearChat = () => {
    clearMessages()
  }

  const toggleFuturisticMode = () => {
    setIsFuturisticMode(!isFuturisticMode)
  }

  if (!isOpen) {
    return <FloatingButton onClick={() => setIsOpen(true)} isOpen={false} />
  }

  return (
    <>
      <FloatingButton onClick={() => setIsOpen(false)} isOpen={true} />

      <div className="fixed bottom-[100px] right-6 w-[420px] max-w-[calc(100vw-48px)] h-[650px] max-h-[calc(100vh-150px)] bg-white dark:bg-slate-900 rounded-[20px] shadow-md flex flex-col overflow-hidden z-[999]">
        <ChatHeader
          onClose={() => setIsOpen(false)}
          onClearChat={handleClearChat}
          isFuturisticMode={isFuturisticMode}
          onToggleFuturisticMode={toggleFuturisticMode}
        />

        {/* Futuristic Mode Toggle Banner */}
        {isFuturisticMode && (
          <div className="px-5 py-2.5 bg-linear-to-r from-purple-100 to-pink-100 dark:from-purple-900 dark:to-pink-900 border-b border-purple-200 dark:border-purple-700">
            <div className="flex items-center gap-2 text-xs font-semibold text-purple-700 dark:text-purple-300">
              <Sparkles className="h-4 w-4" />
              <span>{t("chatbot.futuristicModeActive", "Futuristic Career Mode Active")}</span>
            </div>
          </div>
        )}

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4 bg-slate-50 dark:bg-slate-800">
          {messages.length === 0 && (
            <div className="flex-1 flex items-center justify-center text-center p-8">
              <div className="max-w-sm">
                <h3 className="text-lg font-semibold text-slate-700 dark:text-slate-300 mb-2">
                  {t("chatbot.welcome", "Welcome to VidyaSetu AI Assistant")}
                </h3>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  {t(
                    "chatbot.welcomeMessage",
                    "Ask me about colleges, careers, or your educational journey!"
                  )}
                </p>
              </div>
            </div>
          )}

          {messages.map((message) => (
            <div key={message.id}>
              <ChatMessage message={message} />

              {/* Render College Cards */}
              {message.colleges && message.colleges.length > 0 && (
                <div className="mt-3 space-y-2">
                  <div className="text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wide flex items-center gap-1.5">
                    <span>{t("chatbot.suggestedColleges", "Suggested Colleges")}</span>
                  </div>
                  {message.colleges.map((college, idx) => (
                    <CollegeCard key={idx} college={college} />
                  ))}
                </div>
              )}

              {/* Render Career Cards */}
              {message.careerCards && message.careerCards.length > 0 && (
                <div className="mt-3 space-y-2">
                  <div className="text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wide flex items-center gap-1.5">
                    <span>{t("chatbot.relatedCareers", "Related Careers")}</span>
                  </div>
                  {message.careerCards.map((career, idx) => (
                    <CareerCard key={idx} career={career} />
                  ))}
                </div>
              )}

              {/* Render Futuristic Career Cards */}
              {message.futuristicCareers && message.futuristicCareers.length > 0 && (
                <div className="mt-3 space-y-2">
                  <div className="text-xs font-semibold text-purple-600 dark:text-purple-400 uppercase tracking-wide flex items-center gap-1.5">
                    <Sparkles className="h-3.5 w-3.5" />
                    <span>{t("chatbot.futuristicCareers", "Futuristic Career Paths")}</span>
                  </div>
                  {message.futuristicCareers.map((career, idx) => (
                    <FuturisticCareerCard key={idx} career={career} />
                  ))}
                </div>
              )}
            </div>
          ))}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <ChatInput
          onSend={handleSend}
          disabled={isLoading}
          placeholder={
            isFuturisticMode
              ? t("chatbot.futuristicPlaceholder", "Ask about future careers...")
              : t("chatbot.placeholder", "Ask about colleges, careers...")
          }
        />
      </div>
    </>
  )
}
