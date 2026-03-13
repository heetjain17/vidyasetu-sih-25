from fastapi import APIRouter, HTTPException
from app.services.db_service import fetch_all_roadmap_templates, fetch_roadmap_by_id

router = APIRouter(prefix="/roadmaps")


@router.get("/")
def get_roadmaps():
    """Get all roadmap templates."""
    roadmaps = fetch_all_roadmap_templates()
    return {"roadmaps": roadmaps}


@router.get("/{roadmap_id}")
def get_roadmap(roadmap_id: int):
    """Get a single roadmap template by ID."""
    roadmap = fetch_roadmap_by_id(roadmap_id)
    
    if not roadmap:
        raise HTTPException(status_code=404, detail="Roadmap not found")
    
    return roadmap
