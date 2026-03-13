
from fastapi import APIRouter, HTTPException, status, Depends
from app.schemas.auth import RegisterRequest, LoginRequest, AuthResponse, UserRole
from app.dependencies.db_dependency import get_supabase_client
import os

router = APIRouter()


def _extract(result, key):
    """Helper to extract from dict or object."""
    return result.get(key) if hasattr(result, "get") else getattr(result, key, None)


@router.post("/register", response_model=AuthResponse)
def register_user(data: RegisterRequest, supabase=Depends(get_supabase_client)):
    """Register with email, password, and role. Creates Supabase Auth + Users + profile entries."""
    result = supabase.auth.sign_up({"email": data.email, "password": data.password})
    error = _extract(result, "error")
    session = _extract(result, "session")
    user = _extract(result, "user")

    if error:
        raise HTTPException(status_code=400, detail=error.get("message") if isinstance(error, dict) else str(error))
    if not session or not user:
        raise HTTPException(status_code=400, detail="Registration failed. Check your email for confirmation.")

    user_id = _extract(user, "id")
    email = _extract(user, "email")

    if user_id and email:
        supabase.table("Users").insert({"u_id": user_id, "email": email, "role": data.role.value}).execute()
        if data.role == UserRole.STUDENT:
            supabase.table("StudentProfiles").insert({"user_id": user_id}).execute()
        elif data.role == UserRole.PARENT:
            supabase.table("ParentProfiles").insert({"user_id": user_id}).execute()
        elif data.role == UserRole.COLLEGE:
            supabase.table("CollegeProfiles").insert({"user_id": user_id, "college_name": ""}).execute()

    return AuthResponse(
        access_token=_extract(session, "access_token"),
        refresh_token=_extract(session, "refresh_token"),
        role=data.role,
        user_id=str(user_id)
    )


@router.post("/login", response_model=AuthResponse)
def login_user(data: LoginRequest, supabase=Depends(get_supabase_client)):
    """Login and return tokens along with role."""
    result = supabase.auth.sign_in_with_password({"email": data.email, "password": data.password})
    error = _extract(result, "error")
    session = _extract(result, "session")
    user = _extract(result, "user")

    if error:
        raise HTTPException(status_code=401, detail=error.get("message") if isinstance(error, dict) else str(error))
    if not session:
        raise HTTPException(status_code=401, detail="Login failed.")

    user_id = _extract(user, "id")
    user_role = UserRole.STUDENT
    if user_id:
        user_result = supabase.table("Users").select("role").eq("u_id", user_id).single().execute()
        if user_result.data:
            user_role = UserRole(user_result.data.get("role", "STUDENT"))

    return AuthResponse(
        access_token=_extract(session, "access_token"),
        refresh_token=_extract(session, "refresh_token"),
        role=user_role,
        user_id=str(user_id)
    )


@router.get("/me")
def get_current_user_info(token: str, supabase=Depends(get_supabase_client)):
    """Get current user info from token."""
    from jose import jwt, JWTError
    SUPABASE_JWT_SECRET = os.getenv("SUPABASE_JWT_SECRET")
    try:
        payload = jwt.decode(token, SUPABASE_JWT_SECRET, algorithms=["HS256"])
        user_id = payload.get("sub")
        email = payload.get("email")
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid token")

    user_result = supabase.table("Users").select("role").eq("u_id", user_id).single().execute()
    if not user_result.data:
        raise HTTPException(status_code=404, detail="User not found")
    return {"user_id": user_id, "email": email, "role": user_result.data.get("role", "STUDENT")}


@router.get("/oauth/{provider}")
def oauth_login(provider: str, role: UserRole = UserRole.STUDENT):
    """Get Supabase OAuth URL for a provider (google, github)."""
    SUPABASE_URL = os.getenv("SUPABASE_URL", "")
    if provider.lower() not in ("google", "github"):
        raise HTTPException(status_code=400, detail="Unsupported OAuth provider.")
    return {
        "url": f"{SUPABASE_URL}/auth/v1/authorize?provider={provider.lower()}",
        "note": "Set role after OAuth callback using /auth/set-role"
    }


@router.post("/set-role")
def set_user_role(user_id: str, role: UserRole, supabase=Depends(get_supabase_client)):
    """Set role for a user (used after OAuth registration)."""
    result = supabase.table("Users").update({"role": role.value}).eq("u_id", user_id).execute()
    if not result.data:
        raise HTTPException(status_code=404, detail="User not found")

    profile_table = {"STUDENT": "StudentProfiles", "PARENT": "ParentProfiles", "COLLEGE": "CollegeProfiles"}.get(role.value)
    if profile_table:
        existing = supabase.table(profile_table).select("id").eq("user_id", user_id).execute()
        if not existing.data:
            row = {"user_id": user_id}
            if role == UserRole.COLLEGE:
                row["college_name"] = ""
            supabase.table(profile_table).insert(row).execute()

    return {"message": f"Role set to {role.value}", "role": role.value}


@router.post("/signout")
def signout(supabase=Depends(get_supabase_client)):
    """Sign out the current user."""
    try:
        supabase.auth.sign_out()
        return {"message": "Signed out successfully."}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
