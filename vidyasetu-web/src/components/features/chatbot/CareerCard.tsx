import { Briefcase, BookOpen, GraduationCap } from "lucide-react";
import type { CareerCard as CareerCardType } from "@/api/chatbotApi";

interface CareerCardProps {
  career: CareerCardType;
}

export function CareerCard({ career }: CareerCardProps) {
  return (
    <div className="bg-white dark:bg-slate-800 rounded-lg p-4 border border-slate-200 dark:border-slate-700 hover:shadow-md transition-shadow">
      <div className="flex items-start gap-3">
        <div className="h-10 w-10 rounded-full bg-purple-100 dark:bg-purple-900 flex items-center justify-center flex-shrink-0">
          <Briefcase className="h-5 w-5 text-purple-600 dark:text-purple-400" />
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="font-semibold text-slate-900 dark:text-white mb-2">
            {career.career}
          </h4>
          {career.courses && career.courses.length > 0 && (
            <div className="mb-2">
              <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400 mb-1">
                <BookOpen className="h-4 w-4 flex-shrink-0" />
                <span className="font-medium">Courses:</span>
              </div>
              <div className="flex flex-wrap gap-1">
                {career.courses.map((course, idx) => (
                  <span
                    key={idx}
                    className="text-xs bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 px-2 py-1 rounded"
                  >
                    {course}
                  </span>
                ))}
              </div>
            </div>
          )}
          {career.colleges && career.colleges.length > 0 && (
            <div>
              <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400 mb-1">
                <GraduationCap className="h-4 w-4 flex-shrink-0" />
                <span className="font-medium">Colleges:</span>
              </div>
              <div className="flex flex-wrap gap-1">
                {career.colleges.slice(0, 3).map((college, idx) => (
                  <span
                    key={idx}
                    className="text-xs bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 px-2 py-1 rounded"
                  >
                    {college}
                  </span>
                ))}
                {career.colleges.length > 3 && (
                  <span className="text-xs text-slate-500 dark:text-slate-400 px-2 py-1">
                    +{career.colleges.length - 3} more
                  </span>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
