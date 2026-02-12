
import sys
import os
import asyncio
from dotenv import load_dotenv

# Add backend to path
backend_path = r"c:\Coding\SIH_25\backend-margadarsaka\backend"
sys.path.append(backend_path)

# Load env including GOOGLE_APPLICATION_CREDENTIALS
load_dotenv(os.path.join(backend_path, ".env"))

from app.routers.timeline import sync_calendar, CalendarSyncRequest

async def test_calendar_sync():
    print("\n--- Testing Google Calendar Sync ---")
    
    # Mock data
    test_email = "heetjain17@gmail.com" # Assuming user's email based on logs or generic test
    test_exam_name = "Test Exam: JEE Mock 2025"
    test_events = [
        {"title": "Test Registration", "date": "2025-01-01T10:00:00Z", "description": "Start of registration"},
        {"title": "Test Exam", "date": "2025-02-01T09:00:00Z", "description": "Exam day"}
    ]
    
    payload = CalendarSyncRequest(
        email=test_email,
        exam_id="mock_id",
        exam_name=test_exam_name,
        events=test_events
    )
    
    try:
        print(f"Creating/Syncing calendar '{test_exam_name}' for {test_email}...")
        result = await sync_calendar(payload)
        print("✅ SUCCESS!")
        print(result)
    except Exception as e:
        print(f"❌ FAILED: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    loop = asyncio.new_event_loop()
    asyncio.set_event_loop(loop)
    loop.run_until_complete(test_calendar_sync())
