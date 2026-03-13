import { MessageCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface FloatingButtonProps {
  onClick: () => void;
  isOpen: boolean;
}

export function FloatingButton({ onClick, isOpen }: FloatingButtonProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "fixed bottom-6 right-6 h-14 w-14 rounded-full bg-slate-800 shadow-lg transition-all hover:opacity-90 hover:shadow-md z-50 flex items-center justify-center",
        isOpen && "scale-0"
      )}
      aria-label="Open chatbot"
    >
      <MessageCircle className="h-6 w-6 text-white" />
    </button>
  );
}
