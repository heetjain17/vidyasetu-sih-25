from fastapi import APIRouter, HTTPException, Depends, BackgroundTasks
from typing import List, Optional
from app.dependencies.auth_dependency import get_current_user
from app.routers.discussion_forum_schemas import (
    DiscussionCreate, DiscussionOut, DiscussionDetail,
    CommentCreate, CommentOut, VoteCreate, VoteResult
)
import app.services.discussion_forum_service as service
from app.services.chatbot_service import rag_answer

router = APIRouter(
    prefix="/forum",
    tags=["Discussion Forum"]
)


# ============================================================
# Discussions
# ============================================================

@router.post("/discussions", response_model=DiscussionOut)
def create_discussion(
    discussion: DiscussionCreate,
    current_user: dict = Depends(get_current_user)
):
    try:
        user_id = current_user.user_id
        return service.create_discussion(user_id, discussion.title, discussion.content, discussion.tags)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/discussions", response_model=List[DiscussionOut])
def get_discussions(tag: Optional[str] = None):
    try:
        if tag:
            return service.get_discussions_by_tag(tag)
        return service.get_all_discussions()
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/discussions/{discussion_id}", response_model=DiscussionDetail)
def get_discussion(discussion_id: int):
    discussion = service.get_discussion_by_id(discussion_id)
    if not discussion:
        raise HTTPException(status_code=404, detail="Discussion not found")
    return discussion


@router.delete("/discussions/{discussion_id}")
def delete_discussion(
    discussion_id: int,
    current_user: dict = Depends(get_current_user)
):
    try:
        user_id = current_user.user_id
        success = service.delete_discussion(discussion_id, user_id)
        if not success:
            raise HTTPException(status_code=403, detail="Not authorized or discussion not found")
        return {"message": "Discussion deleted successfully"}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ============================================================
# Comments & Chatbot
# ============================================================

def _create_chatbot_reply(discussion_id: int, question: str):
    """
    Background task to create a chatbot reply.
    Uses the RAG system from chatbot.py to generate an answer.
    """
    try:
        # Get answer from chatbot (uses Ollama/Llama3 + Qdrant)
        answer_dict, sources = rag_answer(question)
        answer = answer_dict.get("answer", "I couldn't generate a response. Please try again.")
        
        # Format the response with sources if available
        response_content = f"Chatbot:\n\n{answer}"
        
        if sources and len(sources) > 0:
            # Add a hint about sources without overwhelming the comment
            source_types = set()
            for src in sources[:5]:
                if isinstance(src, dict):
                    src_type = src.get("type", "")
                    if src_type:
                        source_types.add(src_type.replace("_", " ").title())
            
            if source_types:
                response_content += f"\n\n*Sources: {', '.join(source_types)}*"
        
        # Create the bot's reply as a regular comment with user_id="chatbot"
        # Since we don't have a real chatbot user, we'll use a system ID or modify service to allow system comments
        # For now, assuming table allows arbitrary user_ids or there is a "chatbot" user
        service.create_comment(
            user_id="chatbot",  # Ensure this user exists in auth or table
            discussion_id=discussion_id,
            content=response_content
        )
        
    except Exception as e:
        # If chatbot fails, create an error reply
        print(f"Chatbot reply error: {e}")
        # Optionally log or post error message


@router.post("/discussions/{discussion_id}/comments", response_model=CommentOut)
def add_comment(
    discussion_id: int,
    comment: CommentCreate,
    background_tasks: BackgroundTasks,
    current_user: dict = Depends(get_current_user)
):
    try:
        user_id = current_user.user_id
        new_comment = service.create_comment(user_id, discussion_id, comment.content)
        
        # Check for Chatbot mention
        has_mention, question = service.check_chatbot_mention(comment.content)
        if has_mention and question:
            # Schedule background task to reply
            background_tasks.add_task(_create_chatbot_reply, discussion_id, question)
            
        return new_comment
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.delete("/comments/{comment_id}")
def delete_comment(
    comment_id: int,
    current_user: dict = Depends(get_current_user)
):
    try:
        user_id = current_user.user_id
        success = service.delete_comment(comment_id, user_id)
        if not success:
            raise HTTPException(status_code=403, detail="Not authorized or comment not found")
        return {"message": "Comment deleted successfully"}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ============================================================
# Voting
# ============================================================

@router.post("/discussions/{discussion_id}/vote", response_model=VoteResult)
def vote_discussion(
    discussion_id: int,
    vote: VoteCreate,
    current_user: dict = Depends(get_current_user)
):
    try:
        user_id = current_user.user_id
        if vote.value not in [1, -1]:
            raise HTTPException(status_code=400, detail="Vote value must be 1 or -1")
            
        return service.vote_on_discussion(user_id, discussion_id, vote.value)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/comments/{comment_id}/vote", response_model=VoteResult)
def vote_comment(
    comment_id: int,
    vote: VoteCreate,
    current_user: dict = Depends(get_current_user)
):
    try:
        user_id = current_user.user_id
        if vote.value not in [1, -1]:
            raise HTTPException(status_code=400, detail="Vote value must be 1 or -1")
            
        return service.vote_on_comment(user_id, comment_id, vote.value)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/discussions/{discussion_id}/my-vote")
def get_my_discussion_vote(
    discussion_id: int,
    current_user: dict = Depends(get_current_user)
):
    user_id = current_user.user_id
    vote = service.get_user_vote_on_discussion(user_id, discussion_id)
    return {"vote": vote}


@router.get("/comments/{comment_id}/my-vote")
def get_my_comment_vote(
    comment_id: int,
    current_user: dict = Depends(get_current_user)
):
    user_id = current_user.user_id
    vote = service.get_user_vote_on_comment(user_id, comment_id)
    return {"vote": vote}


# ============================================================
# Tags
# ============================================================

@router.get("/tags")
def get_tags():
    """Get all available tags"""
    return service.get_all_tags()


@router.post("/tags/seed/")
def seed_tags():
    """
    Seed the database with predefined tags.
    Call this once to initialize tags. Safe to call multiple times.
    """
    count = service.seed_predefined_tags()
    return {"message": f"Seeded {count} new tags", "total_predefined": len(service.PREDEFINED_TAGS)}


@router.get("/tags/{tag_name}/discussions/", response_model=List[DiscussionOut])
def get_discussions_by_tag(tag_name: str):
    """Get all discussions with a specific tag"""
    return service.get_discussions_by_tag(tag_name)

