import { Sparkles, TrendingUp, Zap, Target } from "lucide-react";
import type { FuturisticCareerItem } from "@/api/chatbotApi";

interface FuturisticCareerCardProps {
  career: FuturisticCareerItem;
}

export function FuturisticCareerCard({ career }: FuturisticCareerCardProps) {
  return (
    <div className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-lg p-4 border border-purple-200 dark:border-purple-700 hover:shadow-lg transition-all">
      <div className="flex items-start gap-3">
        <div className="h-10 w-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center flex-shrink-0">
          <Sparkles className="h-5 w-5 text-white" />
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="font-bold text-slate-900 dark:text-white mb-2">
            {career.title}
          </h4>
          
          {career.description && (
            <p className="text-sm text-slate-600 dark:text-slate-300 mb-3">
              {career.description}
            </p>
          )}

          {career.why_suitable && (
            <div className="mb-3">
              <div className="flex items-center gap-2 text-sm font-medium text-purple-700 dark:text-purple-300 mb-1">
                <Target className="h-4 w-4" />
                <span>Why It's Suitable:</span>
              </div>
              <p className="text-sm text-slate-600 dark:text-slate-400 pl-6">
                {career.why_suitable}
              </p>
            </div>
          )}

          {career.skills_needed && career.skills_needed.length > 0 && (
            <div className="mb-3">
              <div className="flex items-center gap-2 text-sm font-medium text-blue-700 dark:text-blue-300 mb-1">
                <Zap className="h-4 w-4" />
                <span>Skills Needed:</span>
              </div>
              <div className="flex flex-wrap gap-1 pl-6">
                {career.skills_needed.map((skill, idx) => (
                  <span
                    key={idx}
                    className="text-xs bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 px-2 py-1 rounded"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          )}

          {career.future_demand && (
            <div className="mb-3">
              <div className="flex items-center gap-2 text-sm font-medium text-green-700 dark:text-green-300 mb-1">
                <TrendingUp className="h-4 w-4" />
                <span>Future Demand:</span>
              </div>
              <p className="text-sm text-slate-600 dark:text-slate-400 pl-6">
                {career.future_demand}
              </p>
            </div>
          )}

          {career.salary_potential && (
            <div className="text-sm">
              <span className="font-medium text-slate-700 dark:text-slate-300">
                Salary Potential:
              </span>{" "}
              <span className="text-slate-600 dark:text-slate-400">
                {career.salary_potential}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
