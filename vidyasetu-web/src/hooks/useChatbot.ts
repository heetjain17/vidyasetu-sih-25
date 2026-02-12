import { useState, useCallback, useRef } from "react";
import {
  askChatbot,
  getChatbotWebSocketUrl,
  generateFuturisticCareers,
  type CollegeCard,
  type CareerCard,
  type FuturisticCareerItem,
} from "../api/chatbotApi";

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  isStreaming?: boolean;
  colleges?: CollegeCard[];
  careerCards?: CareerCard[];
  futuristicCareers?: FuturisticCareerItem[];
  sources?: Record<string, unknown>[];
  isFuturistic?: boolean;
}

interface StreamMessage {
  type: "token" | "complete" | "error";
  content?: string;
  answer?: string;
  sources?: Record<string, unknown>[];
  colleges?: CollegeCard[];
  career_cards?: CareerCard[];
}

export function useChatbot() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const wsRef = useRef<WebSocket | null>(null);
  const currentMessageRef = useRef<string>("");

  // Connect to WebSocket
  const connect = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN) return;

    try {
      const ws = new WebSocket(getChatbotWebSocketUrl());

      ws.onopen = () => {
        setIsConnected(true);
        console.log("Chatbot WebSocket connected");
      };

      ws.onmessage = (event) => {
        try {
          const data: StreamMessage = JSON.parse(event.data);

          if (data.type === "token" && data.content) {
            currentMessageRef.current += data.content;
            setMessages((prev) => {
              const newMessages = [...prev];
              const lastMsg = newMessages[newMessages.length - 1];
              if (lastMsg?.role === "assistant" && lastMsg.isStreaming) {
                lastMsg.content = currentMessageRef.current;
              }
              return [...newMessages];
            });
          } else if (data.type === "complete") {
            setMessages((prev) => {
              const newMessages = [...prev];
              const lastMsg = newMessages[newMessages.length - 1];
              if (lastMsg?.role === "assistant") {
                lastMsg.content = data.answer || currentMessageRef.current;
                lastMsg.isStreaming = false;
                lastMsg.colleges = data.colleges;
                lastMsg.careerCards = data.career_cards;
                lastMsg.sources = data.sources;
              }
              return [...newMessages];
            });
            setIsLoading(false);
            currentMessageRef.current = "";
          } else if (data.type === "error") {
            setMessages((prev) => {
              const newMessages = [...prev];
              const lastMsg = newMessages[newMessages.length - 1];
              if (lastMsg?.role === "assistant") {
                lastMsg.content = data.content || "An error occurred.";
                lastMsg.isStreaming = false;
              }
              return [...newMessages];
            });
            setIsLoading(false);
            currentMessageRef.current = "";
          }
        } catch (e) {
          console.error("Failed to parse WebSocket message:", e);
        }
      };

      ws.onclose = () => {
        setIsConnected(false);
        console.log("Chatbot WebSocket disconnected");
      };

      ws.onerror = () => {
        console.log("WebSocket error, will use REST fallback");
        setIsConnected(false);
      };

      wsRef.current = ws;
    } catch {
      console.log("WebSocket not available, using REST");
      setIsConnected(false);
    }
  }, []);

  // Disconnect WebSocket
  const disconnect = useCallback(() => {
    wsRef.current?.close();
    wsRef.current = null;
    setIsConnected(false);
  }, []);

  // Send message via WebSocket or REST fallback
  // Now supports Sandbox Mode!
  const sendMessage = useCallback(
    async (question: string, isSandboxMode: boolean = false) => {
      if (!question.trim()) return;

      const userMessage: ChatMessage = {
        id: Date.now().toString(),
        role: "user",
        content: question,
      };

      setMessages((prev) => [...prev, userMessage]);
      setIsLoading(true);

      if (isSandboxMode) {
        // 🚀 SANDBOX MODE (Futuristic Careers)
        try {
          const response = await generateFuturisticCareers(question);

          const assistantMessage: ChatMessage = {
            id: (Date.now() + 1).toString(),
            role: "assistant",
            content:
              response.answer_text ||
              "I found some futuristic careers for you!",
            isStreaming: false,
            futuristicCareers: response.careers,
            isFuturistic: true,
          };
          setMessages((prev) => [...prev, assistantMessage]);
        } catch (error) {
          console.error("Futuristic API error:", error);
          const errorMessage: ChatMessage = {
            id: (Date.now() + 1).toString(),
            role: "assistant",
            content:
              "Sorry, I couldn't generate futuristic suggestions right now.",
            isStreaming: false,
          };
          setMessages((prev) => [...prev, errorMessage]);
        } finally {
          setIsLoading(false);
        }
        return;
      }

      // STANDARD MODE (WebSocket / REST)
      if (wsRef.current?.readyState === WebSocket.OPEN) {
        const assistantMessage: ChatMessage = {
          id: (Date.now() + 1).toString(),
          role: "assistant",
          content: "",
          isStreaming: true,
        };
        setMessages((prev) => [...prev, assistantMessage]);
        currentMessageRef.current = "";
        wsRef.current.send(JSON.stringify({ question }));
      } else {
        // REST fallback
        try {
          const response = await askChatbot(question);
          const assistantMessage: ChatMessage = {
            id: (Date.now() + 1).toString(),
            role: "assistant",
            content: response.answer,
            isStreaming: false,
            colleges: response.colleges,
            careerCards: response.career_cards,
            sources: response.sources,
          };
          setMessages((prev) => [...prev, assistantMessage]);
        } catch (error) {
          console.error("Chatbot API error:", error);
          const errorMessage: ChatMessage = {
            id: (Date.now() + 1).toString(),
            role: "assistant",
            content: "Sorry, I encountered an error. Please try again.",
            isStreaming: false,
          };
          setMessages((prev) => [...prev, errorMessage]);
        } finally {
          setIsLoading(false);
        }
      }
    },
    []
  );

  // Clear chat history
  const clearMessages = useCallback(() => {
    setMessages([]);
  }, []);

  return {
    messages,
    isLoading,
    isConnected,
    sendMessage,
    clearMessages,
    connect,
    disconnect,
  };
}
