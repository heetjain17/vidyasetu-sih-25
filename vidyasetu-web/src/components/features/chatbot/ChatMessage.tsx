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
    .replace(/\*\*([^*]+)\*\*/g, '<strong class="font-bold text-primary">$1</strong>')
    // Handle incomplete bold markers at end
    .replace(/\*\*([^*]+)$/g, '<strong class="font-bold text-primary">$1</strong>')
    // Italic text: *text* -> <em>text</em>
    .replace(/\*([^*]+)\*/g, '<em class="italic">$1</em>')
    // Headers: ### Text
    .replace(/^###\s+(.+)$/gm, '<h3 class="text-lg font-bold mt-4 mb-2">$1</h3>')
    .replace(/^##\s+(.+)$/gm, '<h2 class="text-xl font-bold mt-4 mb-2">$1</h2>')
    .replace(/^#\s+(.+)$/gm, '<h1 class="text-2xl font-bold mt-4 mb-2">$1</h1>')
    // Numbered lists: 1. Text or 1) Text
    .replace(
      /^(\d+)[.)]\s+(.+)$/gm,
      '<div class="flex gap-2 my-1 ml-4"><span class="font-semibold text-primary">$1.</span><span>$2</span></div>'
    )
    // Bullet points with nested indentation
    .replace(
      /^    [•\-\*]\s+(.+)$/gm,
      '<div class="flex gap-2 my-1 ml-8"><span class="text-primary text-xs">◦</span><span class="text-sm">$1</span></div>'
    )
    .replace(
      /^  [•\-\*]\s+(.+)$/gm,
      '<div class="flex gap-2 my-1 ml-4"><span class="text-primary">•</span><span>$1</span></div>'
    )
    .replace(
      /^[•\-\*]\s+(.+)$/gm,
      '<div class="flex gap-2 my-1"><span class="text-primary">•</span><span>$1</span></div>'
    )
    // Paragraphs (double line breaks)
    .replace(/\n\n/g, '<div class="h-3"></div>')
    // Single line breaks
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
