"""Discussion Forum Service — Supabase Implementation."""
from app.dependencies.db_dependency import get_supabase_client
from datetime import datetime
from typing import List, Optional, Tuple


# ============================================================
# Discussions
# ============================================================

def create_discussion(user_id: str, title: str, content: str, tags: List[str] = None) -> dict:
    """Create a new discussion thread with optional tags."""
    supabase = get_supabase_client()
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

    if tags:
        for tag_name in tags:
            tag_name = tag_name.strip().lower()
            if not tag_name:
                continue
            tag_id = _get_tag_id(tag_name)
            if tag_id:
                _link_discussion_to_tag(discussion_id, tag_id)
        discussion["tags"] = get_tags_for_discussion(discussion_id)
    else:
        discussion["tags"] = []

    return discussion


def get_all_discussions() -> List[dict]:
    """Get all discussions with vote counts and tags."""
    supabase = get_supabase_client()
    result = supabase.table("discussions").select("*").order("created_at", desc=True).execute()
    if not result.data:
        return []

    discussions = []
    for disc in result.data:
        disc["votes"] = get_discussion_vote_count(disc["id"])
        disc["comment_count"] = get_comment_count(disc["id"])
        disc["tags"] = get_tags_for_discussion(disc["id"])
        discussions.append(disc)
    return discussions


def get_discussion_by_id(discussion_id: int) -> Optional[dict]:
    """Get a single discussion by ID with its comments and tags."""
    supabase = get_supabase_client()
    result = supabase.table("discussions").select("*").eq("id", discussion_id).execute()
    if not result.data:
        return None

    disc = result.data[0]
    disc["votes"] = get_discussion_vote_count(discussion_id)
    disc["comments"] = get_comments_for_discussion(discussion_id)
    disc["tags"] = get_tags_for_discussion(discussion_id)
    return disc


def delete_discussion(discussion_id: int, user_id: str) -> bool:
    """Delete a discussion (only by owner)."""
    supabase = get_supabase_client()
    result = supabase.table("discussions").delete().eq("id", discussion_id).eq("user_id", user_id).execute()
    return len(result.data) > 0 if result.data else False


# ============================================================
# Comments
# ============================================================

def create_comment(user_id: str, discussion_id: int, content: str) -> dict:
    """Create a new comment on a discussion."""
    supabase = get_supabase_client()
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
    """Check if the comment mentions @AI. Returns (has_mention, question_for_bot)."""
    import re
    match = re.search(r'@AI\s*(.*)', content, re.IGNORECASE | re.DOTALL)
    if match:
        return True, match.group(1).strip()
    return False, ""


def get_comments_for_discussion(discussion_id: int) -> List[dict]:
    """Get all comments for a discussion with vote counts."""
    supabase = get_supabase_client()
    result = supabase.table("comments").select("*").eq("discussion_id", discussion_id).order("created_at").execute()
    if not result.data:
        return []
    comments = []
    for comment in result.data:
        comment["votes"] = get_comment_vote_count(comment["id"])
        comments.append(comment)
    return comments


def get_comment_count(discussion_id: int) -> int:
    """Get count of comments for a discussion."""
    supabase = get_supabase_client()
    result = supabase.table("comments").select("id", count="exact").eq("discussion_id", discussion_id).execute()
    return result.count or 0


def delete_comment(comment_id: int, user_id: str) -> bool:
    """Delete a comment (only by owner)."""
    supabase = get_supabase_client()
    result = supabase.table("comments").delete().eq("id", comment_id).eq("user_id", user_id).execute()
    return len(result.data) > 0 if result.data else False


# ============================================================
# Voting — Discussions
# ============================================================

def vote_on_discussion(user_id: str, discussion_id: int, value: int) -> dict:
    """Vote on a discussion. value: 1 for upvote, -1 for downvote. Toggles if same vote."""
    supabase = get_supabase_client()
    existing = supabase.table("discussion_votes").select("*").eq("discussion_id", discussion_id).eq("user_id", user_id).execute()
    if existing.data:
        row = existing.data[0]
        if row["value"] == value:
            supabase.table("discussion_votes").delete().eq("id", row["id"]).execute()
            return {"action": "removed", "value": 0}
        supabase.table("discussion_votes").update({"value": value}).eq("id", row["id"]).execute()
        return {"action": "updated", "value": value}
    supabase.table("discussion_votes").insert({
        "discussion_id": discussion_id, "user_id": user_id,
        "value": value, "created_at": datetime.utcnow().isoformat()
    }).execute()
    return {"action": "created", "value": value}


def get_discussion_vote_count(discussion_id: int) -> int:
    """Get net vote count for a discussion."""
    supabase = get_supabase_client()
    result = supabase.table("discussion_votes").select("value").eq("discussion_id", discussion_id).execute()
    return sum(v["value"] for v in result.data) if result.data else 0


# ============================================================
# Voting — Comments
# ============================================================

def vote_on_comment(user_id: str, comment_id: int, value: int) -> dict:
    """Vote on a comment. value: 1 for upvote, -1 for downvote. Toggles if same vote."""
    supabase = get_supabase_client()
    existing = supabase.table("comment_votes").select("*").eq("comment_id", comment_id).eq("user_id", user_id).execute()
    if existing.data:
        row = existing.data[0]
        if row["value"] == value:
            supabase.table("comment_votes").delete().eq("id", row["id"]).execute()
            return {"action": "removed", "value": 0}
        supabase.table("comment_votes").update({"value": value}).eq("id", row["id"]).execute()
        return {"action": "updated", "value": value}
    supabase.table("comment_votes").insert({
        "comment_id": comment_id, "user_id": user_id,
        "value": value, "created_at": datetime.utcnow().isoformat()
    }).execute()
    return {"action": "created", "value": value}


def get_comment_vote_count(comment_id: int) -> int:
    """Get net vote count for a comment."""
    supabase = get_supabase_client()
    result = supabase.table("comment_votes").select("value").eq("comment_id", comment_id).execute()
    return sum(v["value"] for v in result.data) if result.data else 0


# ============================================================
# User Vote Status
# ============================================================

def get_user_vote_on_discussion(user_id: str, discussion_id: int) -> Optional[int]:
    """Get user's current vote on a discussion (1, -1, or None)."""
    supabase = get_supabase_client()
    result = supabase.table("discussion_votes").select("value").eq("discussion_id", discussion_id).eq("user_id", user_id).execute()
    return result.data[0]["value"] if result.data else None


def get_user_vote_on_comment(user_id: str, comment_id: int) -> Optional[int]:
    """Get user's current vote on a comment (1, -1, or None)."""
    supabase = get_supabase_client()
    result = supabase.table("comment_votes").select("value").eq("comment_id", comment_id).eq("user_id", user_id).execute()
    return result.data[0]["value"] if result.data else None


# ============================================================
# Tags (Predefined)
# ============================================================

PREDEFINED_TAGS = [
    "career-guidance", "college-admission", "course-selection", "scholarship",
    "entrance-exam", "placement", "hostel", "fees", "bca", "mba",
    "engineering", "medical", "arts", "commerce", "science", "general",
    "help", "discussion"
]


def seed_predefined_tags() -> int:
    """Seed the database with predefined tags. Safe to call multiple times."""
    supabase = get_supabase_client()
    inserted = 0
    for tag_name in PREDEFINED_TAGS:
        existing = supabase.table("tags").select("id").eq("name", tag_name).execute()
        if not existing.data:
            result = supabase.table("tags").insert({"name": tag_name}).execute()
            if result.data:
                inserted += 1
    return inserted


def _get_tag_id(tag_name: str) -> Optional[int]:
    """Get tag ID by name. Returns None if tag doesn't exist."""
    supabase = get_supabase_client()
    tag_name = tag_name.strip().lower()
    if not tag_name:
        return None
    existing = supabase.table("tags").select("id").eq("name", tag_name).execute()
    return existing.data[0]["id"] if existing.data else None


def _link_discussion_to_tag(discussion_id: int, tag_id: int) -> bool:
    """Link a discussion to a tag."""
    supabase = get_supabase_client()
    existing = supabase.table("discussion_tags").select("id").eq("discussion_id", discussion_id).eq("tag_id", tag_id).execute()
    if existing.data:
        return True
    result = supabase.table("discussion_tags").insert({"discussion_id": discussion_id, "tag_id": tag_id}).execute()
    return bool(result.data)


def get_tags_for_discussion(discussion_id: int) -> List[str]:
    """Get all tag names for a discussion."""
    supabase = get_supabase_client()
    tag_links = supabase.table("discussion_tags").select("tag_id").eq("discussion_id", discussion_id).execute()
    if not tag_links.data:
        return []
    tag_ids = [t["tag_id"] for t in tag_links.data]
    tags = supabase.table("tags").select("name").in_("id", tag_ids).execute()
    return [t["name"] for t in tags.data] if tags.data else []


def get_all_tags() -> List[dict]:
    """Get all available predefined tags."""
    supabase = get_supabase_client()
    result = supabase.table("tags").select("*").order("name").execute()
    return result.data if result.data else []


def get_discussions_by_tag(tag_name: str) -> List[dict]:
    """Get all discussions with a specific tag."""
    supabase = get_supabase_client()
    tag_result = supabase.table("tags").select("id").eq("name", tag_name.lower()).execute()
    if not tag_result.data:
        return []

    tag_id = tag_result.data[0]["id"]
    links = supabase.table("discussion_tags").select("discussion_id").eq("tag_id", tag_id).execute()
    if not links.data:
        return []

    discussion_ids = [l["discussion_id"] for l in links.data]
    discussions = supabase.table("discussions").select("*").in_("id", discussion_ids).order("created_at", desc=True).execute()
    if not discussions.data:
        return []

    result = []
    for disc in discussions.data:
        disc["votes"] = get_discussion_vote_count(disc["id"])
        disc["comment_count"] = get_comment_count(disc["id"])
        disc["tags"] = get_tags_for_discussion(disc["id"])
        result.append(disc)
    return result
