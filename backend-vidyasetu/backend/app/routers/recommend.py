from fastapi import APIRouter, Depends, HTTPException
from typing import Optional
from app.services.recommender_db import run_recommender_db
from app.utils.translation import translate_text
from app.dependencies.db_dependency import get_supabase_client
from app.dependencies.auth_dependency import get_current_user, get_student_user, get_parent_user, CurrentUser
from app.schemas.auth import UserRole
from app.schemas.recommendation import ScoresSchema, StudentActualSchema, StudentPreferencesSchema, RecommenderRequest, TranslateRequest
from datetime import datetime

router = APIRouter()


# ========== Helper function to save recommendations ==========

def save_recommendations_to_db(
    user_id: str,
    scores: dict,
    result: dict,
    supabase
) -> str:
    """Save quiz results and recommendations to database."""
    
    # 1. Save/Update Quiz Results
    quiz_data = {
        "user_id": user_id,
        "score_logical": scores.get("Logical_reasoning", 0),
        "score_quant": scores.get("Quantitative_reasoning", 0),
        "score_analytical": scores.get("Analytical_reasoning", 0),
        "score_verbal": scores.get("Verbal_reasoning", 0),
        "score_spatial": scores.get("Spatial_reasoning", 0),
        "score_creativity": scores.get("Creativity", 0),
        "score_entrepreneurial": scores.get("Enter", 0),
        "riasec_realistic": result.get("riasec_scores", [0]*6)[0] if result.get("riasec_scores") else 0,
        "riasec_investigative": result.get("riasec_scores", [0]*6)[1] if result.get("riasec_scores") else 0,
        "riasec_artistic": result.get("riasec_scores", [0]*6)[2] if result.get("riasec_scores") else 0,
        "riasec_social": result.get("riasec_scores", [0]*6)[3] if result.get("riasec_scores") else 0,
        "riasec_enterprising": result.get("riasec_scores", [0]*6)[4] if result.get("riasec_scores") else 0,
        "riasec_conventional": result.get("riasec_scores", [0]*6)[5] if result.get("riasec_scores") else 0,
        "is_complete": True,
        "completed_at": datetime.utcnow().isoformat(),
        "updated_at": datetime.utcnow().isoformat()
    }
    
    # Check if quiz result exists
    existing_quiz = supabase.table("QuizResults").select("id").eq("user_id", user_id).execute()
    
    if existing_quiz.data:
        quiz_result = supabase.table("QuizResults").update(quiz_data).eq("user_id", user_id).execute()
        quiz_id = existing_quiz.data[0]["id"]
    else:
        quiz_result = supabase.table("QuizResults").insert(quiz_data).execute()
        quiz_id = quiz_result.data[0]["id"] if quiz_result.data else None
    
    # 2. Save Recommendations
    rec_data = {
        "user_id": user_id,
        "quiz_result_id": quiz_id,
        "top_careers": result.get("top_careers", []),
        "career_explanations": result.get("career_explanations", []),
        "career_courses": result.get("career_courses", []),
        "recommended_colleges": result.get("recommended_colleges", []),
        "college_explanations": result.get("college_explanations", {}),
        "riasec_scores": result.get("riasec_scores", []),
        "updated_at": datetime.utcnow().isoformat()
    }
    
    # Check if recommendations exist
    existing_rec = supabase.table("Recommendations").select("id").eq("user_id", user_id).execute()
    
    if existing_rec.data:
        supabase.table("Recommendations").update(rec_data).eq("user_id", user_id).execute()
    else:
        rec_data["created_at"] = datetime.utcnow().isoformat()
        supabase.table("Recommendations").insert(rec_data).execute()
    
    return quiz_id


# ========== Endpoints ==========

@router.post("/", summary="Get recommendations (public)")
async def recommend(payload: RecommenderRequest):
    """
    Career and College Recommender Endpoint (Public - no auth required)
    
    Returns recommendations with English explanations only.
    Use /recommend/translate for on-demand translation.
    
    Note: Use /recommend/full for authenticated users to save results.
    """
    scores_dict = payload.scores.model_dump()
    student_actual_dict = payload.student_actual.model_dump()
    student_preferences_dict = payload.student_preferences.model_dump()
    
    result = await run_recommender_db(
        scores=scores_dict,
        student_actual=student_actual_dict,
        student_preferences=student_preferences_dict,
    )
    return result


@router.post("/full", summary="Get & save recommendations (authenticated)")
async def recommend_and_save(
    payload: RecommenderRequest,
    user: CurrentUser = Depends(get_student_user),
    supabase = Depends(get_supabase_client)
):
    """
    Career and College Recommender Endpoint (Authenticated)
    
    - Generates recommendations
    - Saves quiz results to QuizResults table
    - Saves recommendations to Recommendations table
    - Returns the same response as /recommend
    
    Only for STUDENT role.
    """
    
    scores_dict = payload.scores.model_dump()
    student_actual_dict = payload.student_actual.model_dump()
    student_preferences_dict = payload.student_preferences.model_dump()
    
    # Get recommendations
    result = await run_recommender_db(
        scores=scores_dict,
        student_actual=student_actual_dict,
        student_preferences=student_preferences_dict,
    )
    
    # Save to database
    try:
        quiz_id = save_recommendations_to_db(user.user_id, scores_dict, result, supabase)
        result["saved"] = True
        result["quiz_id"] = quiz_id
    except Exception as e:
        result["saved"] = False
        result["save_error"] = str(e)
    
    return result


@router.get("/saved", summary="Get saved recommendations")
def get_saved_recommendations(
    user: CurrentUser = Depends(get_current_user),
    supabase = Depends(get_supabase_client)
):
    """
    Get the current user's saved recommendations.
    Works for both STUDENT and PARENT roles.
    
    - STUDENT: Gets their own recommendations
    - PARENT: Use /links/children/{student_id}/recommendations instead
    """
    if user.role != UserRole.STUDENT:
        raise HTTPException(
            status_code=400, 
            detail="Use /links/children/{student_id}/recommendations for parent access"
        )
    
    result = supabase.table("Recommendations").select("*").eq(
        "user_id", user.user_id
    ).order("created_at", desc=True).limit(1).execute()
    
    if not result.data:
        return {"message": "No saved recommendations found", "recommendations": None}
    
    return {"recommendations": result.data[0]}


@router.get("/quiz-results", summary="Get saved quiz results")
def get_quiz_results(
    user: CurrentUser = Depends(get_student_user),
    supabase = Depends(get_supabase_client)
):
    """
    Get the current student's quiz results (aptitude scores).
    """
    result = supabase.table("QuizResults").select("*").eq(
        "user_id", user.user_id
    ).order("created_at", desc=True).limit(1).execute()
    
    if not result.data:
        return {"message": "No quiz results found", "quiz_results": None}
    
    return {"quiz_results": result.data[0]}


@router.post("/translate", summary="Translate text")
async def translate(payload: TranslateRequest):
    """
    On-demand translation endpoint.
    
    Translates text to hindi, urdu, or kashmiri.
    Use this when user switches language in the UI.
    """
    if payload.target_language.lower() == "english":
        return {"translation": payload.text}
    
    translation = translate_text(payload.text, payload.target_language)
    return {"translation": translation}
