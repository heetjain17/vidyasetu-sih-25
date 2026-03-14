import { useState, useRef, useEffect } from "react"
import { useChatbot, type ChatMessage } from "../hooks/useChatbot"
import { useTranslation } from "react-i18next"
import { translateText } from "@/api/recommendApi"
import {
  MessageCircle,
  X,
  Send,
  Trash2,
  Loader2,
  School,
  Briefcase,
  MapPin,
  BookOpen,
  GraduationCap,
  Building,
  Rocket, // NEW: For Futuristic Mode
  Sparkles, // NEW: For Futuristic UI
} from "lucide-react"

// Styles for the chatbot
const styles = {
  // Floating button
  floatingButton: {
    position: "fixed" as const,
    bottom: "24px",
    right: "24px",
    width: "60px",
    height: "60px",
    borderRadius: "50%",
    background: "#1e293b",
    border: "none",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    boxShadow: "0 4px 20px rgba(30, 41, 59, 0.3)",
    transition: "transform 0.2s, box-shadow 0.2s",
    zIndex: 1000,
  },
  floatingButtonHover: {
    transform: "scale(1.1)",
    boxShadow: "0 6px 25px rgba(30, 41, 59, 0.4)",
  },
  // Chat window
  chatWindow: {
    position: "fixed" as const,
    bottom: "100px",
    right: "24px",
    width: "420px",
    maxWidth: "calc(100vw - 48px)",
    height: "650px",
    maxHeight: "calc(100vh - 150px)",
    background: "white",
    borderRadius: "20px",
    boxShadow: "0 10px 40px rgba(0, 0, 0, 0.15)",
    display: "flex",
    flexDirection: "column" as const,
    overflow: "hidden",
    zIndex: 1000,
  },
  // Header
  header: {
    background: "#1e293b",
    color: "white",
    padding: "16px 20px",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
  },
  headerTitle: {
    margin: 0,
    fontSize: "18px",
    fontWeight: 600,
    display: "flex",
    alignItems: "center",
    gap: "10px",
  },
  headerButtons: {
    display: "flex",
    gap: "8px",
  },
  iconButton: {
    background: "rgba(255, 255, 255, 0.2)",
    border: "none",
    borderRadius: "8px",
    padding: "8px",
    cursor: "pointer",
    color: "white",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    transition: "background 0.2s",
  },
  // Sandbox Toggle
  sandboxToggle: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "10px 20px",
    background: "#f1f5f9",
    borderBottom: "1px solid #e2e8f0",
  },
  toggleLabel: {
    fontSize: "13px",
    fontWeight: 600,
    color: "#475569",
    display: "flex",
    alignItems: "center",
    gap: "6px",
  },
  toggleSwitch: {
    position: "relative" as const,
    width: "44px",
    height: "24px",
    background: "#cbd5e1",
    borderRadius: "12px",
    cursor: "pointer",
    transition: "background 0.3s",
  },
  toggleSwitchActive: {
    background: "#8b5cf6", // Purple for futuristic mode
  },
  toggleThumb: {
    position: "absolute" as const,
    top: "2px",
    left: "2px",
    width: "20px",
    height: "20px",
    background: "white",
    borderRadius: "50%",
    transition: "transform 0.3s",
    boxShadow: "0 2px 4px rgba(0,0,0,0.2)",
  },
  toggleThumbActive: {
    transform: "translateX(20px)",
  },

  // Messages area
  messagesArea: {
    flex: 1,
    overflowY: "auto" as const,
    padding: "16px",
    display: "flex",
    flexDirection: "column" as const,
    gap: "16px",
    background: "#f8fafc",
  },
  // Message bubbles
  messageBubble: {
    maxWidth: "90%",
    padding: "14px 18px",
    borderRadius: "18px",
    fontSize: "14px",
    lineHeight: 1.6,
    wordBreak: "break-word" as const,
  },
  userMessage: {
    alignSelf: "flex-end" as const,
    background: "#1e293b",
    color: "white",
    borderBottomRightRadius: "6px",
  },
  assistantMessage: {
    alignSelf: "flex-start" as const,
    background: "white",
    color: "#1e293b",
    borderBottomLeftRadius: "6px",
    boxShadow: "0 2px 12px rgba(0, 0, 0, 0.08)",
  },
  // Futuristic Message Style
  futuristicMessage: {
    background: "linear-gradient(135deg, #f3e8ff 0%, #ffffff 100%)",
    border: "1px solid #d8b4fe",
  },

  streamingDot: {
    display: "inline-block",
    width: "8px",
    height: "8px",
    background: "#3b82f6",
    borderRadius: "50%",
    marginLeft: "6px",
    animation: "pulse 1s ease-in-out infinite",
  },
  // Input area
  inputArea: {
    padding: "16px",
    background: "white",
    borderTop: "1px solid #e2e8f0",
    display: "flex",
    gap: "12px",
  },
  input: {
    flex: 1,
    padding: "14px 18px",
    border: "2px solid #e2e8f0",
    borderRadius: "14px",
    fontSize: "14px",
    outline: "none",
    transition: "border-color 0.2s, box-shadow 0.2s",
    fontFamily: "inherit",
    color: "#1e293b",
    background: "white",
  },
  sendButton: {
    background: "#1e293b",
    border: "none",
    borderRadius: "14px",
    padding: "14px 18px",
    cursor: "pointer",
    color: "white",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    transition: "transform 0.2s, opacity 0.2s",
  },
  // Cards Container
  cardsContainer: {
    display: "flex",
    flexDirection: "column" as const,
    gap: "10px",
    marginTop: "14px",
  },
  cardsHeader: {
    display: "flex",
    alignItems: "center",
    gap: "6px",
    fontSize: "12px",
    fontWeight: 600,
    color: "#475569",
    textTransform: "uppercase" as const,
    letterSpacing: "0.5px",
    marginBottom: "4px",
  },
  // College Card
  collegeCard: {
    background: "#f0fdf4",
    border: "1px solid #86efac",
    borderRadius: "14px",
    padding: "14px 16px",
    fontSize: "13px",
  },
  collegeCardTitle: {
    fontWeight: 600,
    color: "#166534",
    display: "flex",
    alignItems: "center",
    gap: "8px",
    marginBottom: "8px",
    fontSize: "14px",
  },
  collegeCardDetails: {
    display: "flex",
    flexDirection: "column" as const,
    gap: "4px",
  },
  collegeCardDetail: {
    display: "flex",
    alignItems: "center",
    gap: "6px",
    color: "#15803d",
    fontSize: "12px",
  },
  // Career Card
  careerCard: {
    background: "#fef3c7",
    border: "1px solid #fbbf24",
    borderRadius: "14px",
    padding: "14px 16px",
    fontSize: "13px",
  },
  careerCardTitle: {
    fontWeight: 600,
    color: "#92400e",
    display: "flex",
    alignItems: "center",
    gap: "8px",
    marginBottom: "10px",
    fontSize: "14px",
  },
  careerCardSection: {
    marginBottom: "8px",
  },
  careerCardLabel: {
    fontSize: "11px",
    fontWeight: 600,
    color: "#b45309",
    textTransform: "uppercase" as const,
    marginBottom: "4px",
  },
  careerCardItems: {
    display: "flex",
    flexWrap: "wrap" as const,
    gap: "4px",
  },
  careerCardTag: {
    background: "rgba(245, 158, 11, 0.2)",
    color: "#92400e",
    padding: "4px 8px",
    borderRadius: "6px",
    fontSize: "11px",
    fontWeight: 500,
  },
  // Futuristic Career Card (NEW)
  futuristicCard: {
    background: "linear-gradient(135deg, #1e1b4b 0%, #312e81 100%)",
    color: "white",
    borderRadius: "14px",
    padding: "16px",
    fontSize: "13px",
    boxShadow: "0 4px 15px rgba(49, 46, 129, 0.2)",
    border: "1px solid #6366f1",
  },
  futuristicCardTitle: {
    fontSize: "15px",
    fontWeight: 700,
    color: "#a5b4fc",
    display: "flex",
    alignItems: "center",
    gap: "8px",
    marginBottom: "8px",
  },
  futuristicCardDesc: {
    color: "#e0e7ff",
    marginBottom: "10px",
    lineHeight: 1.4,
  },
  futuristicTag: {
    background: "rgba(99, 102, 241, 0.3)",
    color: "#c7d2fe",
    padding: "3px 8px",
    borderRadius: "4px",
    fontSize: "11px",
    marginRight: "6px",
    marginBottom: "4px",
    display: "inline-block",
  },
  // Welcome message
  welcomeMessage: {
    textAlign: "center" as const,
    color: "#64748b",
    padding: "40px 24px",
  },
  // Message content with formatting
  messageContent: {
    whiteSpace: "pre-wrap" as const,
  },
}

// Add CSS animation for streaming dot and input focus
const styleSheet = document.createElement("style")
styleSheet.textContent = `
  @keyframes pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.4; }
  }
  .chatbot-input:focus {
    border-color: #3b82f6 !important;
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1) !important;
  }
  .chatbot-icon-btn:hover {
    background: rgba(255, 255, 255, 0.3) !important;
  }
  .futuristic-mode-active .chatbot-input:focus {
    border-color: #8b5cf6 !important;
    box-shadow: 0 0 0 3px rgba(139, 92, 246, 0.2) !important;
  }
`
document.head.appendChild(styleSheet)

// Format message content with better line breaks
function formatContent(content: string): string {
  return content.replace(/\n\n/g, "\n").replace(/\* /g, "• ").trim()
}

// College Card Component
function CollegeCardDisplay({
  college,
}: {
  college: {
    college: string
    district?: string
    course?: string
    hostel?: string
    fees?: string
  }
}) {
  return (
    <div style={styles.collegeCard}>
      <div style={styles.collegeCardTitle}>
        <School size={16} color="#166534" />
        {college.college}
      </div>
      <div style={styles.collegeCardDetails}>
        {college.district && college.district !== "J&K" && (
          <div style={styles.collegeCardDetail}>
            <MapPin size={12} />
            {college.district}
          </div>
        )}
        {college.course && (
          <div style={styles.collegeCardDetail}>
            <BookOpen size={12} />
            {college.course}
          </div>
        )}
        {college.hostel && college.hostel !== "Check with college" && (
          <div style={styles.collegeCardDetail}>
            <Building size={12} />
            Hostel: {college.hostel}
          </div>
        )}
      </div>
    </div>
  )
}

// Career Card Component
function CareerCardDisplay({
  career,
}: {
  career: { career: string; courses: string[]; colleges: string[] }
}) {
  return (
    <div style={styles.careerCard}>
      <div style={styles.careerCardTitle}>
        <Briefcase size={16} color="#92400e" />
        {career.career}
      </div>

      {career.courses.length > 0 && (
        <div style={styles.careerCardSection}>
          <div style={styles.careerCardLabel}>Courses</div>
          <div style={styles.careerCardItems}>
            {career.courses.slice(0, 4).map((course, idx) => (
              <span key={idx} style={styles.careerCardTag}>
                {course}
              </span>
            ))}
          </div>
        </div>
      )}

      {career.colleges.length > 0 && (
        <div style={styles.careerCardSection}>
          <div style={styles.careerCardLabel}>Colleges</div>
          <div style={styles.careerCardItems}>
            {career.colleges.slice(0, 3).map((college, idx) => (
              <span key={idx} style={styles.careerCardTag}>
                {college}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

// Futuristic Career Card (NEW)
function FuturisticCardDisplay({ career }: { career: any }) {
  return (
    <div style={styles.futuristicCard}>
      <div style={styles.futuristicCardTitle}>
        <Rocket size={16} color="#a5b4fc" />
        {career.title}
      </div>
      <div style={styles.futuristicCardDesc}>{career.description}</div>
      <div>
        {career.skills_needed?.slice(0, 3).map((skill: string, idx: number) => (
          <span key={idx} style={styles.futuristicTag}>
            {skill}
          </span>
        ))}
      </div>
      {career.salary_potential && (
        <div
          style={{
            marginTop: "8px",
            fontSize: "12px",
            color: "#fbbf24",
            fontWeight: 600,
          }}
        >
          💰 Potential: {career.salary_potential}
        </div>
      )}
    </div>
  )
}

// Message Component with Translation
function Message({ message }: { message: ChatMessage }) {
  const isUser = message.role === "user"
  const { i18n } = useTranslation()
  const [translatedContent, setTranslatedContent] = useState(message.content)
  const [isTranslating, setIsTranslating] = useState(false)

  // Translate assistant messages when language changes
  useEffect(() => {
    const currentLang = i18n.language || "en"

    // Only translate assistant messages, skip if English or streaming
    if (isUser || currentLang === "en" || message.isStreaming) {
      setTranslatedContent(message.content)
      return
    }

    // Language mapping for backend API
    const langMap: Record<string, "hindi" | "urdu" | "kashmiri" | "dogri"> = {
      hi: "hindi",
      ur: "urdu",
      ks: "kashmiri",
      doi: "dogri",
    }

    const apiLang = langMap[currentLang]
    if (!apiLang) {
      setTranslatedContent(message.content)
      return
    }

    // Translate the message using backend API
    const doTranslate = async () => {
      setIsTranslating(true)
      try {
        const translated = await translateText(message.content, apiLang)
        setTranslatedContent(translated)
      } catch (error) {
        setTranslatedContent(message.content)
      } finally {
        setIsTranslating(false)
      }
    }

    doTranslate()
  }, [i18n.language, message.content, message.isStreaming, isUser])

  return (
    <div
      style={{
        ...styles.messageBubble,
        ...(isUser ? styles.userMessage : styles.assistantMessage),
        ...(message.isFuturistic ? styles.futuristicMessage : {}), // Apply futuristic style
      }}
    >
      <div style={styles.messageContent}>
        {isTranslating ? (
          <span style={{ opacity: 0.7 }}>Translating...</span>
        ) : (
          formatContent(translatedContent)
        )}
      </div>
      {message.isStreaming && <span style={styles.streamingDot} />}

      {/* College Cards */}
      {message.colleges && message.colleges.length > 0 && (
        <div style={styles.cardsContainer}>
          <div style={styles.cardsHeader}>
            <GraduationCap size={14} />
            Colleges Found
          </div>
          {message.colleges.slice(0, 5).map((college, idx) => (
            <CollegeCardDisplay key={idx} college={college} />
          ))}
        </div>
      )}

      {/* Career Cards */}
      {message.careerCards && message.careerCards.length > 0 && (
        <div style={styles.cardsContainer}>
          <div style={styles.cardsHeader}>
            <Briefcase size={14} />
            Career Paths
          </div>
          {message.careerCards.slice(0, 3).map((career, idx) => (
            <CareerCardDisplay key={idx} career={career} />
          ))}
        </div>
      )}

      {/* Futuristic Cards (NEW) */}
      {message.futuristicCareers && message.futuristicCareers.length > 0 && (
        <div style={styles.cardsContainer}>
          <div style={styles.cardsHeader} style={{ color: "#7c3aed" }}>
            <Rocket size={14} />
            Future Careers
          </div>
          {message.futuristicCareers.slice(0, 3).map((career, idx) => (
            <FuturisticCardDisplay key={idx} career={career} />
          ))}
        </div>
      )}
    </div>
  )
}

// Main Chatbot Component
export function Chatbot() {
  const [isOpen, setIsOpen] = useState(false)
  const [inputValue, setInputValue] = useState("")
  const [isHovered, setIsHovered] = useState(false)
  const [isSandboxMode, setIsSandboxMode] = useState(false) // NEW: Sandbox Mode State
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const { messages, isLoading, sendMessage, clearMessages } = useChatbot()

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  const handleSend = () => {
    if (inputValue.trim() && !isLoading) {
      sendMessage(inputValue.trim(), isSandboxMode) // Pass mode
      setInputValue("")
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <>
      {/* Floating Button */}
      {!isOpen && (
        <button
          style={{
            ...styles.floatingButton,
            ...(isHovered ? styles.floatingButtonHover : {}),
            background: isSandboxMode ? "#7c3aed" : "#1e293b", // Purple if futuristic
          }}
          onClick={() => setIsOpen(true)}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          aria-label="Open chat"
        >
          {isSandboxMode ? (
            <Rocket size={28} color="white" />
          ) : (
            <MessageCircle size={28} color="white" />
          )}
        </button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div style={styles.chatWindow}>
          {/* Header */}
          <div
            style={{
              ...styles.header,
              background: isSandboxMode ? "linear-gradient(to right, #4c1d95, #7c3aed)" : "#1e293b",
            }}
          >
            <h3 style={styles.headerTitle}>
              {isSandboxMode ? <Rocket size={22} /> : <GraduationCap size={22} />}
              {isSandboxMode ? "Future Guide" : "Career Guide"}
            </h3>
            <div style={styles.headerButtons}>
              <button
                style={styles.iconButton}
                className="chatbot-icon-btn"
                onClick={clearMessages}
                title="Clear chat"
              >
                <Trash2 size={18} />
              </button>
              <button
                style={styles.iconButton}
                className="chatbot-icon-btn"
                onClick={() => setIsOpen(false)}
                title="Close"
              >
                <X size={18} />
              </button>
            </div>
          </div>

          {/* Sandbox Toggle (NEW) */}
          <div style={styles.sandboxToggle}>
            <div style={styles.toggleLabel}>
              <Sparkles size={16} color={isSandboxMode ? "#7c3aed" : "#64748b"} />
              Sandbox Mode
            </div>
            <div
              style={{
                ...styles.toggleSwitch,
                ...(isSandboxMode ? styles.toggleSwitchActive : {}),
              }}
              onClick={() => setIsSandboxMode(!isSandboxMode)}
            >
              <div
                style={{
                  ...styles.toggleThumb,
                  ...(isSandboxMode ? styles.toggleThumbActive : {}),
                }}
              />
            </div>
          </div>

          {/* Messages */}
          <div
            style={styles.messagesArea}
            className={isSandboxMode ? "futuristic-mode-active" : ""}
          >
            {messages.length === 0 ? (
              <div style={styles.welcomeMessage}>
                {isSandboxMode ? (
                  <Rocket
                    size={52}
                    color="#7c3aed"
                    style={{ marginBottom: "16px", opacity: 0.8 }}
                  />
                ) : (
                  <GraduationCap
                    size={52}
                    color="#1e293b"
                    style={{ marginBottom: "16px", opacity: 0.8 }}
                  />
                )}

                <p
                  style={{
                    margin: 0,
                    fontWeight: 600,
                    color: isSandboxMode ? "#7c3aed" : "#1e293b",
                    fontSize: "16px",
                  }}
                >
                  {isSandboxMode ? "Welcome to the Future! 🚀" : "Hi! I'm your Career Guide 👋"}
                </p>
                <p
                  style={{
                    margin: "10px 0 20px",
                    fontSize: "14px",
                    lineHeight: 1.5,
                  }}
                >
                  {isSandboxMode
                    ? "Ask me about emerging careers in AI, Space, Metaverse & more!"
                    : "Ask me about colleges, courses, or careers in Jammu & Kashmir!"}
                </p>
                <div
                  style={{
                    display: "flex",
                    flexWrap: "wrap",
                    gap: "8px",
                    justifyContent: "center",
                  }}
                >
                  {(isSandboxMode
                    ? ["🚀 Space Careers", "🤖 AI Jobs", "🧬 Biotech future"]
                    : ["🏫 Engineering colleges", "💼 Career in IT", "📚 BCA courses"]
                  ).map((suggestion) => (
                    <button
                      key={suggestion}
                      onClick={() => {
                        const query = suggestion.replace(/^[^\s]+\s/, "")
                        sendMessage(query, isSandboxMode)
                      }}
                      style={{
                        background: isSandboxMode ? "#f3e8ff" : "#f1f5f9",
                        border: isSandboxMode ? "1px solid #d8b4fe" : "1px solid #e2e8f0",
                        borderRadius: "20px",
                        padding: "8px 14px",
                        fontSize: "12px",
                        cursor: "pointer",
                        color: isSandboxMode ? "#6b21a8" : "#475569",
                        transition: "all 0.2s",
                      }}
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              messages.map((msg) => <Message key={msg.id} message={msg} />)
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div style={styles.inputArea}>
            <input
              type="text"
              placeholder={
                isSandboxMode ? "Ask about future careers..." : "Ask about colleges or careers..."
              }
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={handleKeyPress}
              style={styles.input}
              className="chatbot-input"
              disabled={isLoading}
            />
            <button
              style={{
                ...styles.sendButton,
                opacity: isLoading || !inputValue.trim() ? 0.6 : 1,
                cursor: isLoading ? "not-allowed" : "pointer",
                background: isSandboxMode ? "#7c3aed" : "#1e293b",
              }}
              onClick={handleSend}
              disabled={isLoading || !inputValue.trim()}
            >
              {isLoading ? (
                <Loader2 size={20} style={{ animation: "spin 1s linear infinite" }} />
              ) : (
                <Send size={20} />
              )}
            </button>
          </div>
        </div>
      )}
    </>
  )
}

export default Chatbot
