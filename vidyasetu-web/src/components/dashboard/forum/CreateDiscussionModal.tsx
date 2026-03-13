import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Loader2, X, Info } from "lucide-react";
import { createDiscussion, getTags } from "@/api/forumApi";

interface CreateDiscussionModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CreateDiscussionModal: React.FC<CreateDiscussionModalProps> = ({
  isOpen,
  onClose,
}) => {
  const queryClient = useQueryClient();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);

  // Fetch available tags
  const { data: tags = [] } = useQuery({
    queryKey: ["forum-tags"],
    queryFn: getTags,
    staleTime: 5 * 60 * 1000,
  });

  const createMutation = useMutation({
    mutationFn: ({
      title,
      content,
      tags,
    }: {
      title: string;
      content: string;
      tags: string[];
    }) => createDiscussion(title, content, tags),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["discussions"] });
      queryClient.invalidateQueries({ queryKey: ["forum-tags"] }); // Refresh tag counts if backend supported it
      setTitle("");
      setContent("");
      setSelectedTags([]);
      onClose();
    },
    onError: (err: any) =>
      setError(err.message || "Failed to create discussion"),
  });

  const toggleTag = (tagName: string) => {
    if (selectedTags.includes(tagName)) {
      setSelectedTags((prev) => prev.filter((t) => t !== tagName));
    } else {
      if (selectedTags.length < 3) {
        setSelectedTags((prev) => [...prev, tagName]);
      }
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        />

        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="bg-card w-full max-w-lg rounded-xl border border-border shadow-lg overflow-hidden relative z-10"
        >
          <div className="p-4 border-b border-border flex justify-between items-center">
            <h2 className="text-lg font-bold">Start a New Discussion</h2>
            <button
              onClick={onClose}
              className="p-1.5 hover:bg-surface rounded-full transition-colors"
            >
              <X size={18} />
            </button>
          </div>

          <div className="p-5 space-y-4 max-h-[80vh] overflow-y-auto">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 p-3 rounded-lg flex justify-between items-center text-xs">
                <span>{error}</span>
                <button onClick={() => setError(null)}>
                  <X size={14} />
                </button>
              </div>
            )}

            <div>
              <label className="block text-sm font-semibold mb-1.5 text-text">
                Title
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="What's your question or topic?"
                className="w-full px-3 py-2 border border-border rounded-lg bg-surface focus:ring-2 focus:ring-primary outline-none text-base font-medium"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold mb-1.5 text-text">
                Content
              </label>
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Describe your question or share your thoughts in detail..."
                rows={4}
                className="w-full px-3 py-2 border border-border rounded-lg bg-surface focus:ring-2 focus:ring-primary outline-none resize-none leading-relaxed text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2 text-text flex justify-between">
                <span>Select Tags (Max 3)</span>
                <span className="text-secondary text-xs font-normal">
                  {selectedTags.length}/3 selected
                </span>
              </label>
              <div className="flex flex-wrap gap-2">
                {tags.map((tag) => (
                  <button
                    key={tag.id}
                    onClick={() => toggleTag(tag.name)}
                    className={`px-2.5 py-1 rounded-full text-xs font-medium border transition-all ${
                      selectedTags.includes(tag.name)
                        ? "bg-primary text-text border-primary shadow-sm scale-105"
                        : "bg-surface text-text-secondary border-border hover:border-primary/50"
                    }`}
                  >
                    {tag.name.replace(/-/g, " ")}
                  </button>
                ))}
              </div>
              {selectedTags.length === 0 && (
                <p className="text-xs text-text-secondary mt-2 flex items-center gap-1">
                  <Info size={12} />
                  Selecting tags helps others find your discussion.
                </p>
              )}
            </div>
          </div>

          <div className="p-4 border-t border-border bg-surface/30 flex justify-end gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-text-secondary text-sm font-medium hover:text-text transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={() =>
                createMutation.mutate({ title, content, tags: selectedTags })
              }
              disabled={
                createMutation.isPending || !title.trim() || !content.trim()
              }
              className="px-6 py-2 bg-primary text-text text-sm font-bold rounded-lg disabled:opacity-50 flex items-center gap-2 shadow-md hover:opacity-90 transition-transform"
            >
              {createMutation.isPending ? (
                <Loader2 className="animate-spin" size={16} />
              ) : (
                "Post Discussion"
              )}
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
