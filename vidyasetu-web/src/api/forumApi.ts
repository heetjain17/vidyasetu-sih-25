import { apiClient } from "./client";

// Types
export interface Discussion {
  id: number;
  title: string;
  content: string;
  user_id: string;
  created_at: string;
  votes: number;
  comment_count: number;
  tags: string[]; // Added tags
  topics?: string[]; // Backwards compatibility if needed
}

export interface DiscussionDetail extends Discussion {
  comments: Comment[];
}

export interface Comment {
  id: number;
  discussion_id: number;
  user_id: string;
  content: string;
  created_at: string;
  votes: number;
}

export interface VoteResult {
  action: "created" | "updated" | "removed";
  value: number;
}

export interface Tag {
  id: number;
  name: string;
}

// API Functions

/**
 * Get all discussions (optionally filtered by tag)
 */
export const getDiscussions = async (tag?: string): Promise<Discussion[]> => {
  const params = tag ? `?tag=${encodeURIComponent(tag)}` : "";
  const response = await apiClient.get(`/forum/discussions${params}`);
  return response.data;
};

/**
 * Get a single discussion with comments
 */
export const getDiscussion = async (id: number): Promise<DiscussionDetail> => {
  const response = await apiClient.get(`/forum/discussions/${id}`);
  return response.data;
};

/**
 * Create a new discussion
 */
export const createDiscussion = async (
  title: string,
  content: string,
  tags: string[] = []
): Promise<Discussion> => {
  const response = await apiClient.post("/forum/discussions", {
    title,
    content,
    tags,
  });
  return response.data;
};

/**
 * Delete a discussion
 */
export const deleteDiscussion = async (id: number): Promise<void> => {
  await apiClient.delete(`/forum/discussions/${id}`);
};

/**
 * Add a comment to a discussion
 */
export const addComment = async (
  discussionId: number,
  content: string
): Promise<Comment> => {
  const response = await apiClient.post(
    `/forum/discussions/${discussionId}/comments`, // Fixed trailing slash
    { content }
  );
  return response.data;
};

/**
 * Delete a comment
 */
export const deleteComment = async (commentId: number): Promise<void> => {
  await apiClient.delete(`/forum/comments/${commentId}`);
};

/**
 * Vote on a discussion (1 for upvote, -1 for downvote)
 */
export const voteDiscussion = async (
  discussionId: number,
  value: 1 | -1
): Promise<VoteResult> => {
  const response = await apiClient.post(
    `/forum/discussions/${discussionId}/vote`,
    { value }
  );
  return response.data;
};

/**
 * Vote on a comment (1 for upvote, -1 for downvote)
 */
export const voteComment = async (
  commentId: number,
  value: 1 | -1
): Promise<VoteResult> => {
  const response = await apiClient.post(`/forum/comments/${commentId}/vote`, {
    value,
  });
  return response.data;
};

/**
 * Get user's current vote on a discussion
 */
export const getMyDiscussionVote = async (
  discussionId: number
): Promise<{ value: number | null }> => {
  const response = await apiClient.get(
    `/forum/discussions/${discussionId}/my-vote`
  );
  return response.data;
};

/**
 * Get user's current vote on a comment
 */
export const getMyCommentVote = async (
  commentId: number
): Promise<{ value: number | null }> => {
  const response = await apiClient.get(`/forum/comments/${commentId}/my-vote`);
  return response.data;
};

/**
 * Get all available tags
 */
export const getTags = async (): Promise<Tag[]> => {
  const response = await apiClient.get("/forum/tags");
  return response.data;
};

/**
 * Seed predefined tags (admin/setup utility)
 */
export const seedTags = async (): Promise<{
  message: string;
  total_predefined: number;
}> => {
  const response = await apiClient.post("/forum/tags/seed/");
  return response.data;
};

/**
 * Get discussions by tag
 */
export const getDiscussionsByTag = async (
  tagName: string
): Promise<Discussion[]> => {
  const response = await apiClient.get(`/forum/tags/${tagName}/discussions/`);
  return response.data;
};
