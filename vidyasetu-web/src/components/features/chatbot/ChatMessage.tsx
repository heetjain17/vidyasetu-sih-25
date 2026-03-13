import { User, Bot } from "lucide-react"
import { cn } from "@/lib/utils"
import type { ChatMessage as ChatMessageType } from "@/hooks/useChatbot"

interface ChatMessageProps {
  message: ChatMessageType
}

function formatMessage(content: string) {
  // Convert markdown-style formatting to HTML
  let formatted = content
    // Bold text: **text** -> <strong>text</strong>
    .replace(/\*\*([^*]+)\*\*/g, '<strong class="font-bold">$1</strong>')
    // Bullet points: • or - at start of line
    .replace(
      /^[•\-]\s+(.+)$/gm,
      '<div class="flex gap-2 my-1"><span class="text-primary">•</span><span>$1</span></div>'
    )
    // Line breaks
    .replace(/\n\n/g, '<div class="h-3"></div>')
    .replace(/\n/g, "<br/>")

  return formatted
}

export function ChatMessage({ message }: ChatMessageProps) {
  const isUser = message.role === "user"

  return (
    <div className={cn("flex gap-3 mb-4", isUser && "flex-row-reverse")}>
      <div
        className={cn(
          "h-8 w-8 rounded-full flex items-center justify-center shrink-0",
          isUser ? "bg-blue-500" : "bg-slate-700"
        )}
      >
        {isUser ? <User className="h-5 w-5 text-white" /> : <Bot className="h-5 w-5 text-white" />}
      </div>
      <div
        className={cn(
          "max-w-[80%] rounded-lg p-3",
          isUser
            ? "bg-blue-500 text-white"
            : "bg-slate-100 text-slate-900 dark:bg-slate-800 dark:text-white"
        )}
      >
        {isUser ? (
          <p className="text-sm whitespace-pre-wrap wrap-break-word">{message.content}</p>
        ) : (
          <div
            className="text-sm leading-relaxed"
            dangerouslySetInnerHTML={{ __html: formatMessage(message.content) }}
          />
        )}
      </div>
    </div>
  )
}
