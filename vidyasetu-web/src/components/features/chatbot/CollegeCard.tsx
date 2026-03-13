import { School, MapPin, BookOpen, Home, DollarSign } from "lucide-react"
import type { CollegeCard as CollegeCardType } from "@/api/chatbotApi"

interface CollegeCardProps {
  college: CollegeCardType
}

export function CollegeCard({ college }: CollegeCardProps) {
  return (
    <div className="bg-white dark:bg-slate-800 rounded-lg p-4 border border-slate-200 dark:border-slate-700 hover:shadow-md transition-shadow">
      <div className="flex items-start gap-3">
        <div className="h-10 w-10 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center shrink-0">
          <School className="h-5 w-5 text-blue-600 dark:text-blue-400" />
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="font-semibold text-slate-900 dark:text-white mb-2 truncate">
            {college.college}
          </h4>
          <div className="space-y-1 text-sm text-slate-600 dark:text-slate-400">
            {college.district && (
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 shrink-0" />
                <span className="truncate">{college.district}</span>
              </div>
            )}
            {college.course && (
              <div className="flex items-center gap-2">
                <BookOpen className="h-4 w-4 shrink-0" />
                <span className="truncate">{college.course}</span>
              </div>
            )}
            {college.hostel && (
              <div className="flex items-center gap-2">
                <Home className="h-4 w-4 shrink-0" />
                <span className="truncate">Hostel: {college.hostel}</span>
              </div>
            )}
            {college.fees && (
              <div className="flex items-center gap-2">
                <DollarSign className="h-4 w-4 shrink-0" />
                <span className="truncate">Fees: {college.fees}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
