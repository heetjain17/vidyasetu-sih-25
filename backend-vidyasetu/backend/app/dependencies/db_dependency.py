import os
from supabase import create_client, Client

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")

def get_supabase_client() -> Client:
	"""
	Dependency that returns a Supabase client instance for use in FastAPI routes.
	"""
	return create_client(SUPABASE_URL, SUPABASE_KEY)
