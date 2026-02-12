# Discussion Forum Service - Supabase Implementation
from app.dependencies.db_dependency import get_supabase_client
from datetime import datetime
from typing import List, Optional, Tuple


def get_supabase():
    """Get Supabase client instance"""
    return get_supabase_client()


# ============================================================
# Discussions
# ============================================================

def create_discussion(user_id: str, title: str, content: str, tags: List[str] = None) -> dict:
    """Create a new discussion thread with optional tags"""
    supabase = get_supabase()
    
    data = {
        "title": title,
        "content": content,
        "user_id": user_id,
        "created_at": datetime.utcnow().isoformat()
    }
    
    result = supabase.table("discussions").insert(data).execute()
    
    if not result.data:
        raise Exception("Failed to create discussion")
    
    discussion = result.data[0]
    discussion_id = discussion["id"]
    
    # Handle tags if provided
    if tags:
        for tag_name in tags:
            tag_name = tag_name.strip().lower()
            if not tag_name:
                continue
                
            # Get tag ID (only predefined tags work)
            tag_id = _get_tag_id(tag_name)
            
            # Link discussion to tag (skip if tag doesn't exist)
            if tag_id:
                _link_discussion_to_tag(discussion_id, tag_id)
        
        # Add tags to the response
        discussion["tags"] = get_tags_for_discussion(discussion_id)
    else:
        discussion["tags"] = []
    
    return discussion


def get_all_discussions() -> List[dict]:
    """Get all discussions with vote counts and tags"""
    supabase = get_supabase()
    
    result = supabase.table("discussions").select("*").order("created_at", desc=True).execute()
    
    if not result.data:
        return []
    
    # Add vote counts and tags for each discussion
    discussions = []
    for disc in result.data:
        disc["votes"] = get_discussion_vote_count(disc["id"])
        disc["comment_count"] = get_comment_count(disc["id"])
        disc["tags"] = get_tags_for_discussion(disc["id"])
        discussions.append(disc)
    
    return discussions


def get_discussion_by_id(discussion_id: int) -> Optional[dict]:
    """Get a single discussion by ID with its comments and tags"""
    supabase = get_supabase()
    
    result = supabase.table("discussions").select("*").eq("id", discussion_id).execute()
    
    if not result.data:
        return None
    
    disc = result.data[0]
    disc["votes"] = get_discussion_vote_count(discussion_id)
    disc["comments"] = get_comments_for_discussion(discussion_id)
    disc["tags"] = get_tags_for_discussion(discussion_id)
    
    return disc


def delete_discussion(discussion_id: int, user_id: str) -> bool:
    """Delete a discussion (only by owner)"""
    supabase = get_supabase()
    
    result = supabase.table("discussions").delete().eq("id", discussion_id).eq("user_id", user_id).execute()
    
    return len(result.data) > 0 if result.data else False


# ============================================================
# Comments
# ============================================================

def create_comment(user_id: str, discussion_id: int, content: str) -> dict:
    """Create a new comment on a discussion"""
    supabase = get_supabase()
    
    data = {
        "discussion_id": discussion_id,
        "user_id": user_id,
        "content": content,
        "created_at": datetime.utcnow().isoformat()
    }
    
    result = supabase.table("comments").insert(data).execute()
    
    if not result.data:
        raise Exception("Failed to create comment")
    
    return result.data[0]


def check_chatbot_mention(content: str) -> Tuple[bool, str]:
    """
    Check if the comment mentions @AI.
    Returns (has_mention, question_for_bot).
    Extracts the question text after @AI mention.
    """
    import re
    
    # Pattern to match @AI (case insensitive) followed by the question
    pattern = r'@AI\s*(.*)'
    match = re.search(pattern, content, re.IGNORECASE | re.DOTALL)
    
    if match:
        question = match.group(1).strip()
        return True, question
    
    return False, ""


def get_comments_for_discussion(discussion_id: int) -> List[dict]:
    """Get all comments for a discussion with vote counts"""
    supabase = get_supabase()
    
    result = supabase.table("comments").select("*").eq("discussion_id", discussion_id).order("created_at").execute()
    
    if not result.data:
        return []
    
    # Add vote counts
    comments = []
    for comment in result.data:
        comment["votes"] = get_comment_vote_count(comment["id"])
        comments.append(comment)
    
    return comments


def get_comment_count(discussion_id: int) -> int:
    """Get count of comments for a discussion"""
    supabase = get_supabase()
    
    result = supabase.table("comments").select("id", count="exact").eq("discussion_id", discussion_id).execute()
    
    return result.count or 0


def delete_comment(comment_id: int, user_id: str) -> bool:
    """Delete a comment (only by owner)"""
    supabase = get_supabase()
    
    result = supabase.table("comments").delete().eq("id", comment_id).eq("user_id", user_id).execute()
    
    return len(result.data) > 0 if result.data else False


# ============================================================
# Voting - Discussions
# ============================================================

def vote_on_discussion(user_id: str, discussion_id: int, value: int) -> dict:
    """
    Vote on a discussion. value: 1 for upvote, -1 for downvote
    Updates existing vote if user already voted.
    """
    supabase = get_supabase()
    
    # Check if user already voted
    existing = supabase.table("discussion_votes").select("*").eq("discussion_id", discussion_id).eq("user_id", user_id).execute()
    
    if existing.data:
        # Update existing vote
        if existing.data[0]["value"] == value:
            # Same vote - remove it (toggle off)
            supabase.table("discussion_votes").delete().eq("id", existing.data[0]["id"]).execute()
            return {"action": "removed", "value": 0}
        else:
            # Different vote - update
            supabase.table("discussion_votes").update({"value": value}).eq("id", existing.data[0]["id"]).execute()
            return {"action": "updated", "value": value}
    else:
        # Create new vote
        data = {
            "discussion_id": discussion_id,
            "user_id": user_id,
            "value": value,
            "created_at": datetime.utcnow().isoformat()
        }
        supabase.table("discussion_votes").insert(data).execute()
        return {"action": "created", "value": value}


def get_discussion_vote_count(discussion_id: int) -> int:
    """Get net vote count for a discussion"""
    supabase = get_supabase()
    
    result = supabase.table("discussion_votes").select("value").eq("discussion_id", discussion_id).execute()
    
    if not result.data:
        return 0
    
    return sum(v["value"] for v in result.data)


# ============================================================
# Voting - Comments
# ============================================================

def vote_on_comment(user_id: str, comment_id: int, value: int) -> dict:
    """
    Vote on a comment. value: 1 for upvote, -1 for downvote
    Updates existing vote if user already voted.
    """
    supabase = get_supabase()
    
    # Check if user already voted
    existing = supabase.table("comment_votes").select("*").eq("comment_id", comment_id).eq("user_id", user_id).execute()
    
    if existing.data:
        if existing.data[0]["value"] == value:
            supabase.table("comment_votes").delete().eq("id", existing.data[0]["id"]).execute()
            return {"action": "removed", "value": 0}
        else:
            supabase.table("comment_votes").update({"value": value}).eq("id", existing.data[0]["id"]).execute()
            return {"action": "updated", "value": value}
    else:
        data = {
            "comment_id": comment_id,
            "user_id": user_id,
            "value": value,
            "created_at": datetime.utcnow().isoformat()
        }
        supabase.table("comment_votes").insert(data).execute()
        return {"action": "created", "value": value}


def get_comment_vote_count(comment_id: int) -> int:
    """Get net vote count for a comment"""
    supabase = get_supabase()
    
    result = supabase.table("comment_votes").select("value").eq("comment_id", comment_id).execute()
    
    if not result.data:
        return 0
    
    return sum(v["value"] for v in result.data)


# ============================================================
# User's vote status
# ============================================================

def get_user_vote_on_discussion(user_id: str, discussion_id: int) -> Optional[int]:
    """Get user's current vote on a discussion (1, -1, or None)"""
    supabase = get_supabase()
    
    result = supabase.table("discussion_votes").select("value").eq("discussion_id", discussion_id).eq("user_id", user_id).execute()
    
    return result.data[0]["value"] if result.data else None


def get_user_vote_on_comment(user_id: str, comment_id: int) -> Optional[int]:
    """Get user's current vote on a comment (1, -1, or None)"""
    supabase = get_supabase()
    
    result = supabase.table("comment_votes").select("value").eq("comment_id", comment_id).eq("user_id", user_id).execute()
    
    return result.data[0]["value"] if result.data else None


# ============================================================
# Tags (Predefined)
# ============================================================

# Predefined tags for the forum - users can only select from these
PREDEFINED_TAGS = [
    "career-guidance",
    "college-admission", 
    "course-selection",
    "scholarship",
    "entrance-exam",
    "placement",
    "hostel",
    "fees",
    "bca",
    "mba",
    "engineering",
    "medical",
    "arts",
    "commerce",
    "science",
    "general",
    "help",
    "discussion"
]


def seed_predefined_tags() -> int:
    """
    Seed the database with predefined tags.
    Returns the number of tags inserted.
    Call this once during app startup or manually.
    """
    supabase = get_supabase()
    inserted = 0
    
    for tag_name in PREDEFINED_TAGS:
        # Check if tag already exists
        existing = supabase.table("tags").select("id").eq("name", tag_name).execute()
        
        if not existing.data:
            # Insert the tag
            result = supabase.table("tags").insert({"name": tag_name}).execute()
            if result.data:
                inserted += 1
    
    return inserted


def _get_tag_id(tag_name: str) -> Optional[int]:
    """Get tag ID by name. Returns None if tag doesn't exist (predefined tags only)."""
    supabase = get_supabase()
    tag_name = tag_name.strip().lower()
    
    if not tag_name:
        return None
    
    # Only get existing tags - don't create new ones
    existing = supabase.table("tags").select("id").eq("name", tag_name).execute()
    
    if existing.data:
        return existing.data[0]["id"]
    
    return None  # Tag doesn't exist


def _link_discussion_to_tag(discussion_id: int, tag_id: int) -> bool:
    """Link a discussion to a tag (create discussion_tags entry)"""
    supabase = get_supabase()
    
    # Check if link already exists
    existing = supabase.table("discussion_tags").select("id").eq("discussion_id", discussion_id).eq("tag_id", tag_id).execute()
    
    if existing.data:
        return True  # Already linked
    
    # Create link
    result = supabase.table("discussion_tags").insert({
        "discussion_id": discussion_id,
        "tag_id": tag_id
    }).execute()
    
    return bool(result.data)


def get_tags_for_discussion(discussion_id: int) -> List[str]:
    """Get all tag names for a discussion"""
    supabase = get_supabase()
    
    # Get tag IDs for this discussion
    tag_links = supabase.table("discussion_tags").select("tag_id").eq("discussion_id", discussion_id).execute()
    
    if not tag_links.data:
        return []
    
    tag_ids = [t["tag_id"] for t in tag_links.data]
    
    # Get tag names
    tags = supabase.table("tags").select("name").in_("id", tag_ids).execute()
    
    if not tags.data:
        return []
    
    return [t["name"] for t in tags.data]


def get_all_tags() -> List[dict]:
    """Get all available predefined tags for the dropdown"""
    supabase = get_supabase()
    
    result = supabase.table("tags").select("*").order("name").execute()
    
    return result.data if result.data else []


def get_discussions_by_tag(tag_name: str) -> List[dict]:
    """Get all discussions with a specific tag"""
    supabase = get_supabase()
    
    # Get tag ID
    tag_result = supabase.table("tags").select("id").eq("name", tag_name.lower()).execute()
    
    if not tag_result.data:
        return []
    
    tag_id = tag_result.data[0]["id"]
    
    # Get discussion IDs with this tag
    links = supabase.table("discussion_tags").select("discussion_id").eq("tag_id", tag_id).execute()
    
    if not links.data:
        return []
    
    discussion_ids = [l["discussion_id"] for l in links.data]
    
    # Get discussions
    discussions = supabase.table("discussions").select("*").in_("id", discussion_ids).order("created_at", desc=True).execute()
    
    if not discussions.data:
        return []
    
    # Add vote counts and tags
    result = []
    for disc in discussions.data:
        disc["votes"] = get_discussion_vote_count(disc["id"])
        disc["comment_count"] = get_comment_count(disc["id"])
        disc["tags"] = get_tags_for_discussion(disc["id"])
        result.append(disc)
    
    return result
