import { useState, useRef, useEffect } from "react";
import { useChatbot, type ChatMessage } from "@/hooks/useChatbot";
import { translateText } from "@/api/recommendApi";
import {
  Send,
  Trash2,
  Loader2,
  School,
  Briefcase,
  MapPin,
  BookOpen,
  GraduationCap,
  Building,
  Bot,
  Rocket, // NEW
  Sparkles, // NEW
} from "lucide-react";
import { useTranslation } from "react-i18next";

// Format message content with better line breaks
function formatContent(content: string): string {
  return content.replace(/\n\n/g, "\n").replace(/\* /g, "• ").trim();
}

// College Card Component
function CollegeCardDisplay({
  college,
}: {
  college: {
    college: string;
    district?: string;
    course?: string;
    hostel?: string;
    fees?: string;
  };
}) {
  return (
    <div className="bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-xl p-4">
      <div className="flex items-center gap-2 font-semibold text-emerald-700 dark:text-emerald-400 mb-2">
        <School size={16} />
        {college.college}
      </div>
      <div className="space-y-1 text-sm text-emerald-600 dark:text-emerald-500">
        {college.district && college.district !== "J&K" && (
          <div className="flex items-center gap-2">
            <MapPin size={12} />
            {college.district}
          </div>
        )}
        {college.course && (
          <div className="flex items-center gap-2">
            <BookOpen size={12} />
            {college.course}
          </div>
        )}
        {college.hostel && college.hostel !== "Check with college" && (
          <div className="flex items-center gap-2">
            <Building size={12} />
            Hostel: {college.hostel}
          </div>
        )}
      </div>
    </div>
  );
}

// Career Card Component
function CareerCardDisplay({
  career,
}: {
  career: { career: string; courses: string[]; colleges: string[] };
}) {
  return (
    <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl p-4">
      <div className="flex items-center gap-2 font-semibold text-amber-700 dark:text-amber-400 mb-3">
        <Briefcase size={16} />
        {career.career}
      </div>

      {career.courses.length > 0 && (
        <div className="mb-2">
          <div className="text-xs font-semibold text-amber-600 dark:text-amber-500 uppercase mb-1">
            Courses
          </div>
          <div className="flex flex-wrap gap-1">
            {career.courses.slice(0, 4).map((course, idx) => (
              <span
                key={idx}
                className="bg-amber-100 dark:bg-amber-800/30 text-amber-700 dark:text-amber-400 px-2 py-1 rounded text-xs"
              >
                {course}
              </span>
            ))}
          </div>
        </div>
      )}

      {career.colleges.length > 0 && (
        <div>
          <div className="text-xs font-semibold text-amber-600 dark:text-amber-500 uppercase mb-1">
            Colleges
          </div>
          <div className="flex flex-wrap gap-1">
            {career.colleges.slice(0, 3).map((college, idx) => (
              <span
                key={idx}
                className="bg-amber-100 dark:bg-amber-800/30 text-amber-700 dark:text-amber-400 px-2 py-1 rounded text-xs"
              >
                {college}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// Futuristic Career Card (NEW)
function FuturisticCardDisplay({ career }: { career: any }) {
  return (
    <div className="bg-gradient-to-br from-indigo-900 to-indigo-800 text-white border border-indigo-500 rounded-xl p-4 shadow-lg">
      <div className="flex items-center gap-2 font-bold text-indigo-200 mb-2">
        <Rocket size={16} />
        {career.title}
      </div>
      <div className="text-sm text-indigo-100 mb-3 leading-relaxed opacity-90">
        {career.description}
      </div>
      <div className="flex flex-wrap gap-1 mb-2">
        {career.skills_needed?.slice(0, 3).map((skill: string, idx: number) => (
          <span
            key={idx}
            className="bg-indigo-500/30 text-indigo-200 px-2 py-1 rounded text-xs"
          >
            {skill}
          </span>
        ))}
      </div>
      {career.salary_potential && (
        <div className="mt-2 text-xs font-semibold text-amber-300">
          💰 {career.salary_potential}
        </div>
      )}
    </div>
  );
}

// Message Component with Translation
function Message({ message }: { message: ChatMessage }) {
  const isUser = message.role === "user";
  const { i18n } = useTranslation();
  const [translatedContent, setTranslatedContent] = useState(message.content);
  const [isTranslating, setIsTranslating] = useState(false);

  useEffect(() => {
    const currentLang = i18n.language || "en";

    if (isUser || currentLang === "en" || message.isStreaming) {
      setTranslatedContent(message.content);
      return;
    }

    const langMap: Record<string, "hindi" | "urdu" | "kashmiri" | "dogri"> = {
      hi: "hindi",
      ur: "urdu",
      ks: "kashmiri",
      doi: "dogri",
    };

    const apiLang = langMap[currentLang];
    if (!apiLang) {
      setTranslatedContent(message.content);
      return;
    }

    const doTranslate = async () => {
      setIsTranslating(true);
      try {
        const translated = await translateText(message.content, apiLang);
        setTranslatedContent(translated);
      } catch (error) {
        console.error("Chat translation error:", error);
        setTranslatedContent(message.content);
      } finally {
        setIsTranslating(false);
      }
    };

    doTranslate();
  }, [i18n.language, message.content, message.isStreaming, isUser]);

  return (
    <div
      className={`max-w-[85%] p-4 rounded-2xl ${
        isUser
          ? "ml-auto bg-primary text-primary-foreground rounded-br-md"
          : message.isFuturistic
            ? "mr-auto bg-gradient-to-br from-indigo-50 to-white dark:from-indigo-900/10 dark:to-background border border-indigo-200 dark:border-indigo-800 shadow-sm rounded-bl-md"
            : "mr-auto bg-card border border-border shadow-sm rounded-bl-md"
      }`}
    >
      <div className="whitespace-pre-wrap text-sm leading-relaxed">
        {isTranslating ? (
          <span className="opacity-70">Translating...</span>
        ) : (
          formatContent(translatedContent)
        )}
      </div>
      {message.isStreaming && (
        <span className="inline-block w-2 h-2 bg-blue-500 rounded-full ml-1 animate-pulse" />
      )}

      {/* College Cards */}
      {message.colleges && message.colleges.length > 0 && (
        <div className="mt-4 space-y-2">
          <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground uppercase">
            <GraduationCap size={14} />
            Colleges Found
          </div>
          <div className="grid gap-2">
            {message.colleges.slice(0, 5).map((college, idx) => (
              <CollegeCardDisplay key={idx} college={college} />
            ))}
          </div>
        </div>
      )}

      {/* Career Cards */}
      {message.careerCards && message.careerCards.length > 0 && (
        <div className="mt-4 space-y-2">
          <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground uppercase">
            <Briefcase size={14} />
            Career Paths
          </div>
          <div className="grid gap-2">
            {message.careerCards.slice(0, 3).map((career, idx) => (
              <CareerCardDisplay key={idx} career={career} />
            ))}
          </div>
        </div>
      )}

      {/* Futuristic Cards (NEW) */}
      {message.futuristicCareers && message.futuristicCareers.length > 0 && (
        <div className="mt-4 space-y-2">
          <div className="flex items-center gap-2 text-xs font-semibold text-indigo-600 dark:text-indigo-400 uppercase">
            <Rocket size={14} />
            Future Careers
          </div>
          <div className="grid gap-2">
            {message.futuristicCareers.slice(0, 3).map((career, idx) => (
              <FuturisticCardDisplay key={idx} career={career} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// Main Chatbot Module Component
export function ChatbotModule() {
  const [inputValue, setInputValue] = useState("");
  const [isSandboxMode, setIsSandboxMode] = useState(false); // NEW
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { messages, isLoading, sendMessage, clearMessages } = useChatbot();

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = () => {
    if (inputValue.trim() && !isLoading) {
      sendMessage(inputValue.trim(), isSandboxMode); // Pass mode
      setInputValue("");
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div
      className={`h-[calc(100vh-8rem)] flex flex-col rounded-2xl border shadow-lg overflow-hidden transition-colors duration-500 ${
        isSandboxMode
          ? "bg-slate-50 border-indigo-200 dark:bg-slate-900 dark:border-indigo-900"
          : "bg-card border-border"
      }`}
    >
      {/* Header */}
      <div
        className={`
        px-6 py-4 flex items-center justify-between transition-colors duration-500
        ${
          isSandboxMode
            ? "bg-gradient-to-r from-indigo-900 via-purple-900 to-indigo-900 text-white"
            : "bg-primary text-primary-foreground"
        }
      `}
      >
        <div className="flex flex-col">
          <h3 className="text-lg font-semibold flex items-center gap-3">
            {isSandboxMode ? (
              <Rocket size={24} className="text-amber-300" />
            ) : (
              <Bot size={24} />
            )}
            {isSandboxMode ? "Future Guide" : "Career Guide"}
          </h3>
          {/* Toggle inside header for better visibility/access */}
          <div className="flex items-center gap-2 mt-1 -ml-1">
            <button
              onClick={() => setIsSandboxMode(!isSandboxMode)}
              className={`flex items-center gap-2 px-2 py-1 rounded-full text-xs font-medium transition-colors ${
                isSandboxMode
                  ? "bg-white/10 text-white hover:bg-white/20 border border-white/20"
                  : "bg-black/20 text-white/90 hover:bg-black/30"
              }`}
            >
              <Sparkles
                size={12}
                className={isSandboxMode ? "text-amber-300" : ""}
              />
              {isSandboxMode ? "Sandbox Mode: ON" : "Sandbox Mode"}
            </button>
          </div>
        </div>

        <button
          onClick={clearMessages}
          className="p-2 rounded-lg hover:bg-white/20 transition-colors"
          title="Clear chat"
        >
          <Trash2 size={18} />
        </button>
      </div>

      {/* Messages */}
      <div
        className={`flex-1 overflow-y-auto p-6 space-y-4 ${
          isSandboxMode ? "bg-indigo-50/50 dark:bg-slate-900/50" : "bg-surface"
        }`}
      >
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center text-muted-foreground">
            {isSandboxMode ? (
              <Rocket
                size={64}
                className="mb-4 opacity-80 text-indigo-600 animate-pulse"
              />
            ) : (
              <Bot size={64} className="mb-4 opacity-50" />
            )}

            <p
              className={`text-xl font-semibold mb-2 ${
                isSandboxMode
                  ? "text-indigo-700 dark:text-indigo-400"
                  : "text-foreground"
              }`}
            >
              {isSandboxMode
                ? "Welcome to the Future! 🚀"
                : "Hi! I'm your Career Guide 👋"}
            </p>
            <p className="text-sm mb-6 max-w-md">
              {isSandboxMode
                ? "Ask me about emerging careers in AI, Space, Metaverse & more!"
                : "Ask me about colleges, courses, or careers in Jammu & Kashmir!"}
            </p>
            <div className="flex flex-wrap gap-2 justify-center max-w-lg">
              {(isSandboxMode
                ? ["🚀 Space Careers", "🤖 AI Jobs", "🧬 Biotech future"]
                : [
                    "🏫 Engineering colleges",
                    "💼 Career in IT",
                    "📚 BCA courses",
                  ]
              ).map((suggestion) => (
                <button
                  key={suggestion}
                  onClick={() => {
                    const query = suggestion.replace(/^[^\s]+\s/, "");
                    sendMessage(query, isSandboxMode);
                  }}
                  className={`border rounded-full px-4 py-2 text-sm transition-colors ${
                    isSandboxMode
                      ? "bg-white border-indigo-200 text-indigo-700 hover:bg-indigo-50"
                      : "bg-surface hover:bg-primary/10 border-border"
                  }`}
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
      <div
        className={`p-4 border-t flex gap-3 ${
          isSandboxMode
            ? "bg-white dark:bg-slate-900 border-indigo-100 dark:border-indigo-900"
            : "bg-card border-border"
        }`}
      >
        <input
          type="text"
          placeholder={
            isSandboxMode
              ? "Ask about future careers..."
              : "Ask about colleges or careers..."
          }
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyPress={handleKeyPress}
          className={`flex-1 px-4 py-3 border-2 rounded-xl text-sm focus:outline-none transition-colors ${
            isSandboxMode
              ? "bg-indigo-50/50 border-indigo-200 focus:border-indigo-500 text-indigo-900 placeholder:text-indigo-400"
              : "bg-surface border-border focus:border-primary"
          }`}
          disabled={isLoading}
        />
        <button
          onClick={handleSend}
          disabled={isLoading || !inputValue.trim()}
          className={`px-5 py-3 rounded-xl flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed hover:opacity-90 transition-opacity ${
            isSandboxMode
              ? "bg-indigo-600 text-white shadow-indigo-200"
              : "bg-primary text-primary-foreground"
          }`}
        >
          {isLoading ? (
            <Loader2 size={20} className="animate-spin" />
          ) : (
            <Send size={20} />
          )}
        </button>
      </div>
    </div>
  );
}

export default ChatbotModule;
