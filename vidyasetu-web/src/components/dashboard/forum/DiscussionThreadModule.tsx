import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  MessageSquare,
  ThumbsUp,
  ThumbsDown,
  Send,
  Loader2,
  User,
  Clock,
  ArrowLeft,
  Bot,
} from "lucide-react";
import {
  getDiscussion,
  addComment,
  voteDiscussion,
  voteComment,
  getMyDiscussionVote,
  getMyCommentVote,
  type DiscussionDetail,
} from "@/api/forumApi";

interface DiscussionThreadModuleProps {
  discussionId: number;
  onBack: () => void;
}

export const DiscussionThreadModule: React.FC<DiscussionThreadModuleProps> = ({
  discussionId,
  onBack,
}) => {
  const queryClient = useQueryClient();
  const [newComment, setNewComment] = useState("");
  const [localVotes, setLocalVotes] = useState<Record<number, number | null>>(
    {}
  );
  const [localCommentVotes, setLocalCommentVotes] = useState<
    Record<number, number | null>
  >({});
  const [voteDeltas, setVoteDeltas] = useState<Record<number, number>>({});
  const [commentVoteDeltas, setCommentVoteDeltas] = useState<
    Record<number, number>
  >({});

  // Discussion detail query
  const { data: discussion, isLoading } = useQuery({
    queryKey: ["discussion", discussionId],
    queryFn: () => getDiscussion(discussionId),
    staleTime: 60 * 1000,
  });

  // Fetch vote states
  useEffect(() => {
    if (discussion) {
      const fetchVotes = async () => {
        try {
          const res = await getMyDiscussionVote(discussion.id);
          setLocalVotes((prev) => ({ ...prev, [discussion.id]: res.value }));
        } catch {}

        await Promise.all(
          discussion.comments.map(async (c) => {
            try {
              const res = await getMyCommentVote(c.id);
              setLocalCommentVotes((prev) => ({ ...prev, [c.id]: res.value }));
            } catch {}
          })
        );
      };
      fetchVotes();
    }
  }, [discussion]);

  const commentMutation = useMutation({
    mutationFn: ({
      discussionId,
      content,
    }: {
      discussionId: number;
      content: string;
    }) => addComment(discussionId, content),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["discussion", discussionId] });
      setNewComment("");
    },
  });

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

  const voteCommentMutation = useMutation({
    mutationFn: ({ commentId, value }: { commentId: number; value: 1 | -1 }) =>
      voteComment(commentId, value),
    onMutate: async ({ commentId, value }) => {
      const currentVote = localCommentVotes[commentId] ?? null;
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

      setLocalCommentVotes((prev) => ({ ...prev, [commentId]: newVote }));
      setCommentVoteDeltas((prev) => ({
        ...prev,
        [commentId]: (prev[commentId] || 0) + delta,
      }));
    },
    onError: (_, { commentId }) => {
      setLocalCommentVotes((prev) => ({ ...prev, [commentId]: null }));
      setCommentVoteDeltas((prev) => ({ ...prev, [commentId]: 0 }));
    },
  });

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getDisplayVote = (discId: number) => localVotes[discId] ?? null;
  const getDisplayVoteCount = (disc: DiscussionDetail) =>
    disc.votes + (voteDeltas[disc.id] || 0);

  if (isLoading || !discussion) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="animate-spin text-primary" size={40} />
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6"
    >
      <button
        onClick={onBack}
        className="flex items-center gap-2 px-4 py-2 text-text-secondary hover:text-text transition-colors bg-surface rounded-lg hover:bg-surface/80"
      >
        <ArrowLeft size={18} />
        Back to Discussions
      </button>

      {/* Main Discussion */}
      <div className="bg-card border border-border rounded-2xl p-8 shadow-sm">
        <div className="flex gap-6">
          <div className="flex flex-col items-center gap-2">
            <button
              onClick={() =>
                voteDiscussionMutation.mutate({ id: discussion.id, value: 1 })
              }
              className={`p-3 rounded-xl transition-all duration-150 ${
                getDisplayVote(discussion.id) === 1
                  ? "bg-green-500 text-white scale-110 shadow-lg"
                  : "hover:bg-green-100 hover:text-green-600"
              }`}
            >
              <ThumbsUp size={24} />
            </button>
            <span
              className={`text-2xl font-bold transition-colors ${
                getDisplayVoteCount(discussion) > 0
                  ? "text-green-600"
                  : getDisplayVoteCount(discussion) < 0
                    ? "text-red-600"
                    : "text-text-secondary"
              }`}
            >
              {getDisplayVoteCount(discussion)}
            </span>
            <button
              onClick={() =>
                voteDiscussionMutation.mutate({ id: discussion.id, value: -1 })
              }
              className={`p-3 rounded-xl transition-all duration-150 ${
                getDisplayVote(discussion.id) === -1
                  ? "bg-red-500 text-white scale-110 shadow-lg"
                  : "hover:bg-red-100 hover:text-red-600"
              }`}
            >
              <ThumbsDown size={24} />
            </button>
          </div>

          <div className="flex-1">
            <div className="flex flex-wrap gap-2 mb-3">
              {discussion.tags &&
                discussion.tags.map((tag) => (
                  <span
                    key={tag}
                    className="px-3 py-1 bg-secondary/10 text-secondary text-xs font-bold uppercase rounded-full tracking-wider"
                  >
                    {tag}
                  </span>
                ))}
            </div>
            <h1 className="text-3xl font-bold mb-4 leading-tight">
              {discussion.title}
            </h1>
            <div className="prose dark:prose-invert max-w-none text-text-secondary whitespace-pre-wrap mb-8 leading-relaxed">
              {discussion.content}
            </div>

            <div className="flex items-center gap-6 text-sm text-text-secondary border-t border-border pt-4">
              <span className="flex items-center gap-2 font-medium">
                <div className="w-6 h-6 bg-gradient-to-br from-primary to-secondary rounded-full flex items-center justify-center text-[10px] text-white font-bold">
                  {discussion.user_id.charAt(0).toUpperCase()}
                </div>
                {discussion.user_id}
              </span>
              <span className="flex items-center gap-2">
                <Clock size={16} />
                {formatDate(discussion.created_at)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Comments Section */}
      <div className="bg-card border border-border rounded-2xl p-8 shadow-sm">
        <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
          <MessageSquare />
          {discussion.comments?.length || 0} Comments
        </h3>

        <div className="flex gap-4 mb-10">
          <textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Write a comment... use @AI to ask the chatbot!"
            rows={3}
            className="flex-1 px-4 py-3 border border-border rounded-xl bg-surface focus:ring-2 focus:ring-primary outline-none resize-none transition-shadow"
          />
          <button
            onClick={() =>
              commentMutation.mutate({
                discussionId: discussion.id,
                content: newComment,
              })
            }
            disabled={commentMutation.isPending || !newComment.trim()}
            className="px-6 py-3 bg-primary text-text font-bold rounded-xl disabled:opacity-50 flex items-center gap-2 h-fit hover:opacity-90 transition-transform shadow-lg shadow-primary/20"
          >
            {commentMutation.isPending ? (
              <Loader2 className="animate-spin" size={20} />
            ) : (
              <Send size={20} />
            )}
          </button>
        </div>

        <div className="space-y-6">
          {discussion.comments?.length === 0 ? (
            <p className="text-center text-text-secondary py-12 bg-surface rounded-xl border border-dashed border-border">
              No comments yet. Be the first to reply!
            </p>
          ) : (
            discussion.comments?.map((comment) => {
              const myCommentVote = localCommentVotes[comment.id] ?? null;
              const displayCommentVotes =
                comment.votes + (commentVoteDeltas[comment.id] || 0);
              const isChatbot = comment.user_id === "chatbot";

              return (
                <div
                  key={comment.id}
                  className={`flex gap-4 p-6 rounded-xl border transition-all ${
                    isChatbot
                      ? "bg-primary/5 border-primary/20 shadow-sm"
                      : "bg-surface border-border hover:border-primary/30"
                  }`}
                >
                  <div className="flex flex-col items-center gap-1">
                    {!isChatbot && (
                      <>
                        <button
                          onClick={() =>
                            voteCommentMutation.mutate({
                              commentId: comment.id,
                              value: 1,
                            })
                          }
                          className={`p-1.5 rounded-lg transition-all ${
                            myCommentVote === 1
                              ? "bg-green-500 text-white"
                              : "hover:bg-green-100 hover:text-green-600"
                          }`}
                        >
                          <ThumbsUp size={14} />
                        </button>
                        <span
                          className={`text-sm font-bold ${displayCommentVotes > 0 ? "text-green-600" : displayCommentVotes < 0 ? "text-red-600" : "text-text-secondary"}`}
                        >
                          {displayCommentVotes}
                        </span>
                        <button
                          onClick={() =>
                            voteCommentMutation.mutate({
                              commentId: comment.id,
                              value: -1,
                            })
                          }
                          className={`p-1.5 rounded-lg transition-all ${
                            myCommentVote === -1
                              ? "bg-red-500 text-white"
                              : "hover:bg-red-100 hover:text-red-600"
                          }`}
                        >
                          <ThumbsDown size={14} />
                        </button>
                      </>
                    )}
                    {isChatbot && (
                      <Bot className="text-primary mt-2" size={24} />
                    )}
                  </div>
                  <div className="flex-1 w-full overflow-hidden">
                    <div className="flex items-center justify-between mb-2">
                      <span
                        className={`text-sm font-bold flex items-center gap-2 ${isChatbot ? "text-primary" : "text-text"}`}
                      >
                        {isChatbot
                          ? "AI Assistant"
                          : `User ${comment.user_id.substring(0, 8)}...`}
                        {isChatbot && (
                          <span className="px-2 py-0.5 bg-primary/20 text-primary text-[10px] rounded-full">
                            BOT
                          </span>
                        )}
                      </span>
                      <span className="flex items-center gap-1 text-xs text-text-secondary">
                        <Clock size={12} />
                        {formatDate(comment.created_at)}
                      </span>
                    </div>
                    <div className="prose dark:prose-invert max-w-none text-sm text-text-secondary whitespace-pre-wrap leading-relaxed">
                      {isChatbot ? (
                        // Render chatbot response with special formatting if needed (markdown)
                        <div
                          dangerouslySetInnerHTML={{
                            __html: comment.content
                              .replace(/\n/g, "<br/>")
                              .replace(/\*\*(.*?)\*\*/g, "<b>$1</b>")
                              .replace(/\*(.*?)\*/g, "<i>$1</i>"),
                          }}
                        />
                      ) : (
                        comment.content
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </motion.div>
  );
};
