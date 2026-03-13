import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useQuery, useMutation } from "@tanstack/react-query";
import {
  MessageSquare,
  ThumbsUp,
  ThumbsDown,
  Plus,
  Loader2,
  User,
  Clock,
} from "lucide-react";
import {
  getDiscussions,
  voteDiscussion,
  getMyDiscussionVote,
  type Discussion,
} from "@/api/forumApi";

interface DiscussionListModuleProps {
  selectedTag: string | null;
  onSelectDiscussion: (id: number) => void;
  onCreateDiscussion: () => void;
}

export const DiscussionListModule: React.FC<DiscussionListModuleProps> = ({
  selectedTag,
  onSelectDiscussion,
  onCreateDiscussion,
}) => {
  // Local vote state for optimistic updates
  const [localVotes, setLocalVotes] = useState<Record<number, number | null>>(
    {}
  );
  const [voteDeltas, setVoteDeltas] = useState<Record<number, number>>({});

  // Discussions list query
  const { data: discussions = [], isLoading } = useQuery({
    queryKey: ["discussions", selectedTag],
    queryFn: () => getDiscussions(selectedTag || undefined),
    staleTime: 60 * 1000,
  });

  // Fetch initial vote states
  useEffect(() => {
    if (discussions.length > 0) {
      const fetchVotes = async () => {
        const votes: Record<number, number | null> = {};
        await Promise.all(
          discussions.map(async (d) => {
            try {
              const res = await getMyDiscussionVote(d.id);
              votes[d.id] = res.value;
            } catch {
              votes[d.id] = null;
            }
          })
        );
        setLocalVotes((prev) => ({ ...prev, ...votes }));
      };
      fetchVotes();
    }
  }, [discussions]);

  const voteDiscussionMutation = useMutation({
    mutationFn: ({ id, value }: { id: number; value: 1 | -1 }) =>
      voteDiscussion(id, value),
    onMutate: async ({ id, value }) => {
      const currentVote = localVotes[id] ?? null;
      let newVote: number | null;
      let delta: number;

      if (currentVote === value) {
        newVote = null;
        delta = -value;
      } else if (currentVote === null) {
        newVote = value;
        delta = value;
      } else {
        newVote = value;
        delta = value * 2;
      }

      setLocalVotes((prev) => ({ ...prev, [id]: newVote }));
      setVoteDeltas((prev) => ({ ...prev, [id]: (prev[id] || 0) + delta }));
    },
    onError: (_, { id }) => {
      setLocalVotes((prev) => ({ ...prev, [id]: null }));
      setVoteDeltas((prev) => ({ ...prev, [id]: 0 }));
    },
  });

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const getDisplayVote = (discId: number) => localVotes[discId] ?? null;
  const getDisplayVoteCount = (disc: Discussion) =>
    disc.votes + (voteDeltas[disc.id] || 0);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="animate-spin text-primary" size={40} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold mb-2">
            {selectedTag
              ? `${selectedTag.replace(/-/g, " ")} Discussions`
              : "All Discussions"}
          </h2>
          <p className="text-text-secondary">
            Join the conversation and share your knowledge.
          </p>
        </div>
        <button
          onClick={onCreateDiscussion}
          className="flex items-center gap-2 px-6 py-3 bg-primary text-text font-bold rounded-xl hover:opacity-90 transition-transform shadow-lg shadow-primary/20"
        >
          <Plus size={20} />
          New Discussion
        </button>
      </div>

      <div className="space-y-4">
        {discussions.length === 0 ? (
          <div className="text-center py-20 text-text-secondary bg-card border border-border rounded-2xl">
            <MessageSquare size={64} className="mx-auto mb-4 opacity-50" />
            <h3 className="text-xl font-bold mb-2">No discussions found</h3>
            <p>Be the first to start a conversation in this topic!</p>
          </div>
        ) : (
          discussions.map((disc) => {
            const myVote = getDisplayVote(disc.id);
            const displayVotes = getDisplayVoteCount(disc);

            return (
              <motion.div
                key={disc.id}
                whileHover={{ scale: 1.01 }}
                onClick={() => onSelectDiscussion(disc.id)}
                className="bg-card border border-border rounded-xl p-6 cursor-pointer hover:border-primary/50 transition-all shadow-sm hover:shadow-md"
              >
                <div className="flex gap-4">
                  {/* Voting Column */}
                  <div className="flex flex-col items-center gap-1 min-w-[3rem]">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        voteDiscussionMutation.mutate({
                          id: disc.id,
                          value: 1,
                        });
                      }}
                      className={`p-2 rounded-lg transition-all duration-150 ${
                        myVote === 1
                          ? "bg-green-500 text-white scale-110 shadow-lg shadow-green-500/30"
                          : "hover:bg-green-100 dark:hover:bg-green-900/30 hover:text-green-600"
                      }`}
                    >
                      <ThumbsUp size={18} />
                    </button>
                    <span
                      className={`font-bold transition-colors ${
                        displayVotes > 0
                          ? "text-green-600 dark:text-green-400"
                          : displayVotes < 0
                            ? "text-red-600 dark:text-red-400"
                            : "text-text-secondary"
                      }`}
                    >
                      {displayVotes}
                    </span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        voteDiscussionMutation.mutate({
                          id: disc.id,
                          value: -1,
                        });
                      }}
                      className={`p-2 rounded-lg transition-all duration-150 ${
                        myVote === -1
                          ? "bg-red-500 text-white scale-110 shadow-lg shadow-red-500/30"
                          : "hover:bg-red-100 dark:hover:bg-red-900/30 hover:text-red-600"
                      }`}
                    >
                      <ThumbsDown size={18} />
                    </button>
                  </div>

                  {/* Content Column */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-4">
                      <h3 className="text-lg font-bold mb-2 hover:text-primary transition-colors line-clamp-2">
                        {disc.title}
                      </h3>
                      {disc.tags && disc.tags.length > 0 && (
                        <div className="flex gap-2 flex-wrap justify-end">
                          {disc.tags.slice(0, 2).map((tag) => (
                            <span
                              key={tag}
                              className="px-2 py-1 bg-secondary/10 text-secondary text-xs rounded-full whitespace-nowrap"
                            >
                              {tag}
                            </span>
                          ))}
                          {disc.tags.length > 2 && (
                            <span className="px-2 py-1 bg-surface text-text-secondary text-xs rounded-full">
                              +{disc.tags.length - 2}
                            </span>
                          )}
                        </div>
                      )}
                    </div>

                    <p className="text-text-secondary line-clamp-2 mb-4 text-sm leading-relaxed">
                      {disc.content}
                    </p>

                    <div className="flex items-center gap-4 text-xs text-text-secondary font-medium">
                      <span className="flex items-center gap-1.5 ">
                        <div className="w-5 h-5 bg-gradient-to-br from-primary to-secondary rounded-full flex items-center justify-center text-[10px] text-white font-bold">
                          {disc.user_id.charAt(0).toUpperCase()}
                        </div>
                        {disc.user_id === "chatbot"
                          ? "AI Assistant"
                          : `User ${disc.user_id.substring(0, 6)}`}
                      </span>
                      <span className="flex items-center gap-1.5">
                        <Clock size={14} />
                        {formatDate(disc.created_at)}
                      </span>
                      <span className="flex items-center gap-1.5 px-2 py-1 bg-surface rounded-md">
                        <MessageSquare size={14} />
                        {disc.comment_count} comments
                      </span>
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })
        )}
      </div>
    </div>
  );
};
