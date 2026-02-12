
import sys
import os
import asyncio
from dotenv import load_dotenv
from fastapi import HTTPException

# Add the backend directory to sys.path so we can import app modules
backend_path = r"c:\Coding\SIH_25\backend-margadarsaka\backend"
sys.path.append(backend_path)

# Load environment variables
load_dotenv(os.path.join(backend_path, ".env"))

from app.routers.timeline import sync_whatsapp, WhatsAppSyncRequest

async def test_real_integration():
    print("\n--- Testing Real Integration with N8N ---")
    webhook_url = os.getenv("N8N_WHATSAPP_WEBHOOK")
    print(f"Using Webhook URL: {webhook_url}")
    
    if not webhook_url:
        print("❌ Error: N8N_WHATSAPP_WEBHOOK not found in environment.")
        return

    payload = WhatsAppSyncRequest(
        phone_number="+918422814943", # Using the number from user's logs
        exam_id="test_exam_id",
        exam_name="JEE Main 2025 Session 1" # Using exam name from user's logs
    )
    
    try:
        print("Sending request...")
        result = await sync_whatsapp(payload)
        print(f"✅ API Success (200 OK): {result}")
    except HTTPException as e:
        print(f"✅ Caught Expected HTTPException: Status {e.status_code}, Detail: {e.detail}")
    except Exception as e:
        print(f"❌ Unhandled Exception: {type(e)} {e}")

if __name__ == "__main__":
    loop = asyncio.new_event_loop()
    asyncio.set_event_loop(loop)
    loop.run_until_complete(test_real_integration())
