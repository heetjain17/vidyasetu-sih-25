import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { getTags } from "@/api/forumApi";
import { Hash, Loader2, MessageSquare } from "lucide-react";

interface ForumLayoutProps {
  children: React.ReactNode;
  selectedTag: string | null;
  onSelectTag: (tag: string | null) => void;
}

export const ForumLayout: React.FC<ForumLayoutProps> = ({
  children,
  selectedTag,
  onSelectTag,
}) => {
  const { data: tags = [], isLoading } = useQuery({
    queryKey: ["forum-tags"],
    queryFn: getTags,
    staleTime: 5 * 60 * 1000,
  });

  return (
    <div className="flex flex-col md:flex-row gap-6 min-h-[calc(100vh-100px)]">
      {/* Sidebar - Tags */}
      <div className="w-full md:w-64 flex-shrink-0">
        <div className="bg-card border border-border rounded-xl p-4 sticky top-6">
          <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
            <Hash size={20} />
            Topics
          </h3>

          <div className="space-y-1">
            <button
              onClick={() => onSelectTag(null)}
              className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                selectedTag === null
                  ? "bg-primary/10 text-primary"
                  : "text-text-secondary hover:bg-surface hover:text-text"
              }`}
            >
              All Discussions
            </button>

            {isLoading ? (
              <div className="flex justify-center p-4">
                <Loader2 className="animate-spin text-primary" size={20} />
              </div>
            ) : tags.length === 0 ? (
              <p className="text-text-secondary text-sm p-2">
                No tags available
              </p>
            ) : (
              tags.map((tag) => (
                <button
                  key={tag.id}
                  onClick={() => onSelectTag(tag.name)}
                  className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center justify-between group ${
                    selectedTag === tag.name
                      ? "bg-primary/10 text-primary"
                      : "text-text-secondary hover:bg-surface hover:text-text"
                  }`}
                >
                  <span>{tag.name.replace(/-/g, " ")}</span>
                  {selectedTag === tag.name && <Hash size={14} />}
                </button>
              ))
            )}
          </div>

          <div className="mt-8 p-4 bg-surface rounded-lg">
            <h4 className="font-bold text-sm mb-2 flex items-center gap-2">
              <MessageSquare size={16} />
              Community Rules
            </h4>
            <ul className="text-xs text-text-secondary space-y-2 list-disc pl-4">
              <li>Be respectful to others</li>
              <li>No spam or self-promotion</li>
              <li>Stay on topic</li>
              <li>Use @AI for chatbot help</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 min-w-0">{children}</div>
    </div>
  );
};
