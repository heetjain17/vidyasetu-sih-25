# Discussion Forum Pydantic Schemas
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime


# ============================================================
# Discussion Schemas
# ============================================================

class DiscussionCreate(BaseModel):
    title: str
    content: str
    tags: List[str] = []  # Optional list of tag names


class DiscussionOut(BaseModel):
    id: int
    title: str
    content: str
    user_id: str
    created_at: datetime
    votes: int = 0
    comment_count: int = 0
    tags: List[str] = []  # Tag names

    class Config:
        from_attributes = True


class DiscussionDetail(DiscussionOut):
    comments: List["CommentOut"] = []


# ============================================================
# Comment Schemas
# ============================================================

class CommentCreate(BaseModel):
    content: str


class CommentOut(BaseModel):
    id: int
    discussion_id: int
    user_id: str
    content: str
    created_at: datetime
    votes: int = 0

    class Config:
        from_attributes = True


# ============================================================
# Vote Schemas
# ============================================================

class VoteCreate(BaseModel):
    value: int  # 1 for upvote, -1 for downvote


class VoteResult(BaseModel):
    action: str  # "created", "updated", or "removed"
    value: int


# Update forward refs
DiscussionDetail.model_rebuild()
