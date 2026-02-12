import { create } from "zustand";
import { chatbotReply } from "@/services/offlineChatbot";

export type Message = {
  id: string;
  text: string;
  sender: "user" | "bot";
  timestamp: number;
};

type ChatStore = {
  messages: Message[];
  isLoading: boolean;
  sendMessage: (text: string) => Promise<void>;
  clearChat: () => void;
};

export const useChatStore = create<ChatStore>((set, get) => ({
  messages: [
    {
      id: "welcome",
      text: "Hello! I am your career guide assistant. Ask me anything about colleges in J&K.",
      sender: "bot",
      timestamp: Date.now(),
    },
  ],
  isLoading: false,

  sendMessage: async (text: string) => {
    if (!text.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: text.trim(),
      sender: "user",
      timestamp: Date.now(),
    };

    set((state) => ({
      messages: [...state.messages, userMessage],
      isLoading: true,
    }));

    try {
      // Simulate a small delay for better UX
      await new Promise((resolve) => setTimeout(resolve, 500));

      const replyText = await chatbotReply(text);

      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: replyText,
        sender: "bot",
        timestamp: Date.now(),
      };

      set((state) => ({
        messages: [...state.messages, botMessage],
        isLoading: false,
      }));
    } catch (error) {
      console.error("Chatbot error:", error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: "Sorry, I encountered an error processing your request.",
        sender: "bot",
        timestamp: Date.now(),
      };
      set((state) => ({
        messages: [...state.messages, errorMessage],
        isLoading: false,
      }));
    }
  },

  clearChat: () => {
    set({
      messages: [
        {
          id: "welcome",
          text: "Hello! I am your career guide assistant. Ask me anything about colleges in J&K.",
          sender: "bot",
          timestamp: Date.now(),
        },
      ],
      isLoading: false,
    });
  },
}));
