
from fastapi import APIRouter, HTTPException, status, Depends
from app.schemas.auth import RegisterRequest, LoginRequest, AuthResponse, UserRole
from supabase import create_client, Client
import os

router = APIRouter()

# Supabase config (use env vars in production)
SUPABASE_URL = os.getenv("SUPABASE_URL", "<your-supabase-url>")
SUPABASE_KEY = os.getenv("SUPABASE_KEY", "<your-supabase-anon-key>")
supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)


# Registration endpoint (with role support)
@router.post("/register", response_model=AuthResponse)
def register_user(data: RegisterRequest):
    """
    Register a new user with email, password, and role.
    Creates entry in both Supabase auth and custom Users table.
    """
    result = supabase.auth.sign_up({"email": data.email, "password": data.password})

    # supabase client may return either a dict-like response or a pydantic AuthResponse
    if hasattr(result, "get"):
        error = result.get("error")
        session = result.get("session")
        user = result.get("user")
    else:
        error = None
        session = getattr(result, "session", None)
        user = getattr(result, "user", None)

    if error:
        # error may be a dict or object with message
        msg = error.get("message") if isinstance(error, dict) else str(error)
        raise HTTPException(status_code=400, detail=msg)

    if not session or not user:
        raise HTTPException(status_code=400, detail="Registration failed. Check your email for confirmation.")

    # Extract user info
    if isinstance(user, dict):
        user_id = user.get("id")
        email = user.get("email")
    else:
        user_id = getattr(user, "id", None)
        email = getattr(user, "email", None)

    # Create entry in custom Users table WITH ROLE
    if user_id and email:
        supabase.table("Users").insert({
            "u_id": user_id, 
            "email": email,
            "role": data.role.value  # Store role from request
        }).execute()
        
        # Create the appropriate profile table entry based on role
        if data.role == UserRole.STUDENT:
            supabase.table("StudentProfiles").insert({
                "user_id": user_id
            }).execute()
        elif data.role == UserRole.PARENT:
            supabase.table("ParentProfiles").insert({
                "user_id": user_id
            }).execute()
        elif data.role == UserRole.COLLEGE:
            supabase.table("CollegeProfiles").insert({
                "user_id": user_id,
                "college_name": ""  # Will be filled during onboarding
            }).execute()

    # Extract session tokens
    if isinstance(session, dict):
        access_token = session["access_token"]
        refresh_token = session.get("refresh_token")
    else:
        access_token = getattr(session, "access_token", None)
        refresh_token = getattr(session, "refresh_token", None)

    return AuthResponse(
        access_token=access_token,
        refresh_token=refresh_token,
        role=data.role,
        user_id=str(user_id)
    )


# Login endpoint (with role support)
@router.post("/login", response_model=AuthResponse)
def login_user(data: LoginRequest):
    """
    Login user and return tokens along with their role.
    Fetches role from custom Users table.
    """
    result = supabase.auth.sign_in_with_password({"email": data.email, "password": data.password})

    if hasattr(result, "get"):
        error = result.get("error")
        session = result.get("session")
        user = result.get("user")
    else:
        error = None
        session = getattr(result, "session", None)
        user = getattr(result, "user", None)

    if error:
        msg = error.get("message") if isinstance(error, dict) else str(error)
        raise HTTPException(status_code=401, detail=msg)

    if not session:
        raise HTTPException(status_code=401, detail="Login failed.")

    # Extract user ID
    if isinstance(user, dict):
        user_id = user.get("id")
    else:
        user_id = getattr(user, "id", None)

    # Fetch role from Users table
    user_role = UserRole.STUDENT  # Default
    if user_id:
        user_result = supabase.table("Users").select("role").eq("u_id", user_id).single().execute()
        if user_result.data:
            role_str = user_result.data.get("role", "STUDENT")
            user_role = UserRole(role_str)

    # Extract session tokens
    if isinstance(session, dict):
        access_token = session["access_token"]
        refresh_token = session.get("refresh_token")
    else:
        access_token = getattr(session, "access_token", None)
        refresh_token = getattr(session, "refresh_token", None)

    return AuthResponse(
        access_token=access_token,
        refresh_token=refresh_token,
        role=user_role,
        user_id=str(user_id)
    )


# Get current user info
@router.get("/me")
def get_current_user_info(token: str):
    """
    Get current user's info from token.
    Returns user_id, email, and role.
    """
    from jose import jwt, JWTError
    
    SUPABASE_JWT_SECRET = os.getenv("SUPABASE_JWT_SECRET")
    
    try:
        payload = jwt.decode(token, SUPABASE_JWT_SECRET, algorithms=["HS256"])
        user_id = payload.get("sub")
        email = payload.get("email")
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid token")
    
    # Fetch role from Users table
    user_result = supabase.table("Users").select("role").eq("u_id", user_id).single().execute()
    if not user_result.data:
        raise HTTPException(status_code=404, detail="User not found")
    
    role = user_result.data.get("role", "STUDENT")
    
    return {
        "user_id": user_id,
        "email": email,
        "role": role
    }


# OAuth login endpoints (Google, GitHub)
@router.get("/oauth/{provider}")
def oauth_login(provider: str, role: UserRole = UserRole.STUDENT):
    """
    Returns the Supabase OAuth URL for the given provider (google, github).
    The frontend should redirect the user to this URL.
    Note: Role will need to be set after OAuth callback.
    """
    provider = provider.lower()
    if provider not in ("google", "github"):
        raise HTTPException(status_code=400, detail="Unsupported OAuth provider.")
    oauth_url = f"{SUPABASE_URL}/auth/v1/authorize?provider={provider}"
    return {"url": oauth_url, "note": "Set role after OAuth callback using /auth/set-role"}


# Set role for OAuth users (call after OAuth callback)
@router.post("/set-role")
def set_user_role(user_id: str, role: UserRole):
    """
    Set role for a user (used after OAuth registration).
    Also creates the appropriate profile table entry.
    """
    # Update role in Users table
    result = supabase.table("Users").update({"role": role.value}).eq("u_id", user_id).execute()
    
    if not result.data:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Create profile entry if it doesn't exist
    if role == UserRole.STUDENT:
        existing = supabase.table("StudentProfiles").select("id").eq("user_id", user_id).execute()
        if not existing.data:
            supabase.table("StudentProfiles").insert({"user_id": user_id}).execute()
    elif role == UserRole.PARENT:
        existing = supabase.table("ParentProfiles").select("id").eq("user_id", user_id).execute()
        if not existing.data:
            supabase.table("ParentProfiles").insert({"user_id": user_id}).execute()
    elif role == UserRole.COLLEGE:
        existing = supabase.table("CollegeProfiles").select("id").eq("user_id", user_id).execute()
        if not existing.data:
            supabase.table("CollegeProfiles").insert({
                "user_id": user_id,
                "college_name": ""
            }).execute()
    
    return {"message": f"Role set to {role.value}", "role": role.value}


# Sign out endpoint
@router.post("/signout")
def signout(token: str):
    """
    Signs out the user by revoking the refresh token (or access token).
    The frontend should provide the user's token (usually from Authorization header).
    """
    try:
        result = supabase.auth.sign_out()
        return {"message": "Signed out successfully."}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
