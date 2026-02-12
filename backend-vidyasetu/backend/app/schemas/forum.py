"""
Discussion forum schemas.
"""
from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime


class BasePost(BaseModel):
    """Base schema for forum posts"""
    title: str
    content: str
    category: str


class PostCreate(BasePost):
    """Schema for creating a new post"""
    pass


class PostUpdate(BaseModel):
    """Schema for updating a post"""
    title: Optional[str] = None
    content: Optional[str] = None
    category: Optional[str] = None


class CommentCreate(BaseModel):
    """Schema for creating a comment"""
    content: str
    parent_id: Optional[str] = None  # For nested comments


class CommentOut(BaseModel):
    """Response schema for a comment"""
    id: str
    post_id: str
    author_id: str
    author_name: Optional[str] = None
    content: str
    parent_id: Optional[str] = None
    created_at: str
    updated_at: Optional[str] = None
    upvotes: int = 0
    downvotes: int = 0


class PostOut(BasePost):
    """Response schema for a post"""
    id: str
    author_id: str
    author_name: Optional[str] = None
    created_at: str
    updated_at: Optional[str] = None
    upvotes: int = 0
    downvotes: int = 0
    comment_count: int = 0
    comments: Optional[List[CommentOut]] = None


class VoteRequest(BaseModel):
    """Schema for voting on posts/comments"""
    vote_type: str  # "up" or "down"
