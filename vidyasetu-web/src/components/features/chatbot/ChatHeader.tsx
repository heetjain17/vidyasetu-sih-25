import { X, Trash2, Rocket, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

interface ChatHeaderProps {
  onClose: () => void;
  onClearChat: () => void;
  isFuturisticMode: boolean;
  onToggleFuturisticMode: () => void;
}

export function ChatHeader({
  onClose,
  onClearChat,
  isFuturisticMode,
  onToggleFuturisticMode,
}: ChatHeaderProps) {
  return (
    <div className="flex items-center justify-between p-4 bg-slate-800 text-white rounded-t-lg">
      <div className="flex items-center gap-2">
        <div className="h-8 w-8 rounded-full bg-blue-500 flex items-center justify-center">
          <MessageCircle className="h-5 w-5" />
        </div>
        <div>
          <h3 className="font-semibold">VidyaSetu Assistant</h3>
          <p className="text-xs text-slate-300">Ask me anything!</p>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <button
          onClick={onToggleFuturisticMode}
          className={cn(
            "p-2 rounded-lg transition-colors",
            isFuturisticMode
              ? "bg-purple-600 hover:bg-purple-700"
              : "bg-slate-700 hover:bg-slate-600"
          )}
          title={isFuturisticMode ? "Normal Mode" : "Futuristic Careers Mode"}
        >
          {isFuturisticMode ? (
            <Sparkles className="h-4 w-4" />
          ) : (
            <Rocket className="h-4 w-4" />
          )}
        </button>
        <button
          onClick={onClearChat}
          className="p-2 rounded-lg bg-slate-700 hover:bg-slate-600 transition-colors"
          title="Clear chat"
        >
          <Trash2 className="h-4 w-4" />
        </button>
        <button
          onClick={onClose}
          className="p-2 rounded-lg bg-slate-700 hover:bg-slate-600 transition-colors"
          title="Close chat"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

import { MessageCircle } from "lucide-react";
