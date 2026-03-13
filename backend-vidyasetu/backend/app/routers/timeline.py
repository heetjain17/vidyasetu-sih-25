from fastapi import APIRouter, HTTPException, BackgroundTasks
from typing import List, Optional
import requests
import os
from app.schemas.timeline import WhatsAppSyncRequest, CalendarSyncRequest

router = APIRouter(prefix="/timeline")

# --- Helper Functions ---

def trigger_whatsapp_n8n(phone: str, exam_name: str):
    """
    Placeholder: Triggers n8n webhook for WhatsApp notification.
    """
    n8n_webhook = os.getenv("N8N_WHATSAPP_WEBHOOK")
    if not n8n_webhook:
        print(f"⚠️ Mocking WhatsApp send to {phone} for {exam_name} (No N8N_WEBHOOK set)")
        return
    
    try:
        # Send payload with type='subscription_confirmation' so n8n sends the welcome message
        response = requests.post(n8n_webhook, json={
            "user_phone": phone, 
            "exam_name": exam_name,
            "type": "subscription_confirmation" 
        }, timeout=10)
        response.raise_for_status() # Raise exception for 4xx/5xx errors
    except Exception as e:
        print(f"Failed to trigger WhatsApp n8n: {e}")
        raise e

# --- Endpoints ---

@router.get("/")
async def get_timeline():
    """
    Fetch all exam timelines and events.
    """
    from app.services.db_service import fetch_timeline_events
    return fetch_timeline_events()

@router.post("/sync/whatsapp")
async def sync_whatsapp(payload: WhatsAppSyncRequest):
    """
    Subscribe to exam updates via WhatsApp.
    Triggers an n8n workflow to send the message.
    """
    try:
        trigger_whatsapp_n8n(payload.phone_number, payload.exam_name)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to subscribe: {str(e)}")
    
    # improved logging for demo
    print(f"✅ WhatsApp subscription received for {payload.phone_number} -> {payload.exam_name}")
    
    return {
        "status": "success",
        "message": f"WhatsApp updates enabled for {payload.exam_name}",
        "recipient": payload.phone_number
    }

@router.post("/sync/calendar")
async def sync_calendar(payload: CalendarSyncRequest):
    """
    Sync exam schedule to Google Calendar.
    Directly creates/updates a Google Calendar and shares it with the user.
    """
    from app.services.google_calendar import get_calendar_service, ensure_exam_calendar, add_events_to_calendar, share_calendar_with_user, get_calendar_link
    
    try:
        service = get_calendar_service()
        
        # 1. Ensure Calendar exists or create it
        calendar_id = ensure_exam_calendar(service, payload.exam_name)
        
        # 2. Add events to the calendar
        add_events_to_calendar(service, calendar_id, payload.events)
        
        # 3. Share with the user
        share_calendar_with_user(service, calendar_id, payload.email)
        
        # 4. Get calendar links
        links = get_calendar_link(calendar_id)
        
        print(f"✅ Calendar synced and shared: {payload.email} -> {payload.exam_name}")
        
        return {
            "status": "success",
            "message": f"Calendar for '{payload.exam_name}' created/updated and shared with {payload.email}",
            "calendar_id": calendar_id,
            "event_count": len(payload.events),
            "add_to_google_calendar_url": links["add_url"],
            "view_calendar_url": links["view_url"]
        }
        
    except Exception as e:
        print(f"❌ Calendar sync failed: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to sync calendar: {str(e)}")

