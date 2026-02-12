import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Send,
  Bot,
  User,
  Loader2,
  Sparkles,
  GraduationCap,
  Building2,
  MapPin,
  IndianRupee,
  Home,
} from "lucide-react";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  colleges?: CollegeCard[];
  careerCards?: CareerCard[];
  timestamp: Date;
}

interface CollegeCard {
  college: string;
  course: string;
  district: string;
  fees: string;
  hostel: string;
}

interface CareerCard {
  career: string;
  courses: string[];
  colleges: string[];
}

const API_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";

export function SandboxModule() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "assistant",
      content:
        "Hello! 👋 I'm your academic assistant. Ask me anything about colleges, courses, or career paths!",
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input.trim(),
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const response = await fetch(`${API_URL}/chatbot/ask`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ question: userMessage.content }),
      });

      if (!response.ok) throw new Error("Failed to get response");

      const data = await response.json();

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content:
          typeof data.answer === "string"
            ? data.answer
            : data.answer?.summary || "Here's what I found:",
        colleges: data.answer?.colleges,
        careerCards: data.answer?.career_cards,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      console.error("Chat error:", error);
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          role: "assistant",
          content:
            "Sorry, I encountered an error. Please make sure the backend is running and try again.",
          timestamp: new Date(),
        },
      ]);
    } finally {
      setIsLoading(false);
      inputRef.current?.focus();
    }
  };

  const suggestedQuestions = [
    "What colleges offer nursing courses?",
    "Tell me about engineering careers",
    "Colleges in Srinagar with hostel",
    "What are the fee structures?",
  ];

  return (
    <div className="h-[calc(100vh-8rem)] flex flex-col bg-card/50 rounded-2xl border border-border overflow-hidden backdrop-blur-sm">
      {/* Header */}
      <div className="p-4 border-b border-border bg-gradient-to-r from-primary/10 to-secondary/10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
            <Bot className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h2 className="font-bold text-lg">Career Assistant</h2>
            <p className="text-xs text-text-secondary">
              Ask about colleges, courses, and careers
            </p>
          </div>
          <Sparkles className="w-5 h-5 text-primary ml-auto animate-pulse" />
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        <AnimatePresence mode="popLayout">
          {messages.map((message) => (
            <motion.div
              key={message.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className={`flex gap-3 ${message.role === "user" ? "justify-end" : "justify-start"}`}
            >
              {message.role === "assistant" && (
                <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
                  <Bot className="w-4 h-4 text-primary" />
                </div>
              )}

              <div
                className={`max-w-[80%] ${message.role === "user" ? "order-first" : ""}`}
              >
                <div
                  className={`p-4 rounded-2xl ${
                    message.role === "user"
                      ? "bg-primary text-white rounded-br-md"
                      : "bg-surface border border-border rounded-bl-md"
                  }`}
                >
                  <p className="text-sm whitespace-pre-wrap">
                    {message.content}
                  </p>
                </div>

                {/* College Cards */}
                {message.colleges && message.colleges.length > 0 && (
                  <div className="mt-3 space-y-2">
                    {message.colleges.map((college, idx) => (
                      <motion.div
                        key={idx}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.1 }}
                        className="p-4 bg-surface border border-border rounded-xl hover:border-primary/50 transition-colors"
                      >
                        <div className="flex items-start gap-3">
                          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                            <Building2 className="w-5 h-5 text-primary" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-semibold text-sm truncate">
                              {college.college}
                            </h4>
                            <div className="flex items-center gap-1 mt-1 text-xs text-text-secondary">
                              <GraduationCap className="w-3 h-3" />
                              <span className="truncate">{college.course}</span>
                            </div>
                            <div className="flex flex-wrap gap-2 mt-2">
                              <span className="inline-flex items-center gap-1 text-xs bg-blue-500/10 text-blue-600 dark:text-blue-400 px-2 py-1 rounded-full">
                                <MapPin className="w-3 h-3" />
                                {college.district}
                              </span>
                              <span className="inline-flex items-center gap-1 text-xs bg-green-500/10 text-green-600 dark:text-green-400 px-2 py-1 rounded-full">
                                <Home className="w-3 h-3" />
                                {college.hostel}
                              </span>
                              <span className="inline-flex items-center gap-1 text-xs bg-amber-500/10 text-amber-600 dark:text-amber-400 px-2 py-1 rounded-full">
                                <IndianRupee className="w-3 h-3" />
                                {college.fees}
                              </span>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}

                {/* Career Cards */}
                {message.careerCards && message.careerCards.length > 0 && (
                  <div className="mt-3 space-y-2">
                    {message.careerCards.map((career, idx) => (
                      <motion.div
                        key={idx}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.1 }}
                        className="p-4 bg-gradient-to-br from-primary/5 to-secondary/5 border border-primary/20 rounded-xl"
                      >
                        <h4 className="font-bold text-primary">
                          {career.career}
                        </h4>
                        <div className="mt-2">
                          <p className="text-xs text-text-secondary">
                            Courses:
                          </p>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {career.courses.slice(0, 5).map((course, i) => (
                              <span
                                key={i}
                                className="text-xs bg-surface px-2 py-1 rounded-full border border-border"
                              >
                                {course}
                              </span>
                            ))}
                          </div>
                        </div>
                        <div className="mt-2">
                          <p className="text-xs text-text-secondary">
                            Colleges:
                          </p>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {career.colleges.slice(0, 3).map((college, i) => (
                              <span
                                key={i}
                                className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full"
                              >
                                {college}
                              </span>
                            ))}
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}

                <p className="text-[10px] text-text-secondary mt-1 px-1">
                  {message.timestamp.toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
              </div>

              {message.role === "user" && (
                <div className="w-8 h-8 rounded-full bg-secondary/20 flex items-center justify-center shrink-0">
                  <User className="w-4 h-4 text-secondary" />
                </div>
              )}
            </motion.div>
          ))}
        </AnimatePresence>

        {isLoading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex gap-3"
          >
            <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
              <Bot className="w-4 h-4 text-primary" />
            </div>
            <div className="p-4 bg-surface border border-border rounded-2xl rounded-bl-md">
              <div className="flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin text-primary" />
                <span className="text-sm text-text-secondary">Thinking...</span>
              </div>
            </div>
          </motion.div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Questions (show only when few messages) */}
      {messages.length <= 2 && !isLoading && (
        <div className="px-4 pb-2">
          <p className="text-xs text-text-secondary mb-2">Try asking:</p>
          <div className="flex flex-wrap gap-2">
            {suggestedQuestions.map((question, idx) => (
              <button
                key={idx}
                onClick={() => setInput(question)}
                className="text-xs px-3 py-1.5 bg-surface border border-border rounded-full hover:border-primary hover:text-primary transition-colors"
              >
                {question}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input Area */}
      <form
        onSubmit={handleSubmit}
        className="p-4 border-t border-border bg-surface/50"
      >
        <div className="flex gap-2">
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about colleges, courses, or careers..."
            className="flex-1 px-4 py-3 bg-background border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
            disabled={isLoading}
          />
          <motion.button
            type="submit"
            disabled={!input.trim() || isLoading}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="px-4 py-3 bg-primary text-white rounded-xl hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <Send className="w-5 h-5" />
          </motion.button>
        </div>
      </form>
    </div>
  );
}
