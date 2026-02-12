import os.path
import datetime
from google.auth.transport.requests import Request
from google.oauth2 import service_account
from google_auth_oauthlib.flow import InstalledAppFlow
from googleapiclient.discovery import build
from googleapiclient.errors import HttpError

# If modifying these scopes, delete the file token.json.
SCOPES = ['https://www.googleapis.com/auth/calendar']

def get_calendar_service():
    """Shows basic usage of the Google Calendar API.
    """
    creds = None
    # The file token.json stores the user's access and refresh tokens, and is
    # created automatically when the authorization flow completes for the first
    # time.
    
    # We are using Service Account, so the flow is different. 
    # But usually service accounts are easier.
    
    service_account_file = os.getenv('GOOGLE_APPLICATION_CREDENTIALS')
    if not service_account_file:
         # Fallback to looking in current directory
         if os.path.exists("service_account.json"):
             service_account_file = "service_account.json"
         else:
             raise Exception("GOOGLE_APPLICATION_CREDENTIALS not set and service_account.json not found.")

    creds = service_account.Credentials.from_service_account_file(
        service_account_file, scopes=SCOPES)

    service = build('calendar', 'v3', credentials=creds)
    return service

def ensure_exam_calendar(service, exam_name):
    """
    Checks if a calendar with the given exam_name exists. 
    If yes, returns its ID.
    If no, creates it and returns the new ID.
    """
    page_token = None
    while True:
        calendar_list = service.calendarList().list(pageToken=page_token).execute()
        for calendar_list_entry in calendar_list['items']:
            if calendar_list_entry.get('summary') == exam_name:
                return calendar_list_entry['id']
        page_token = calendar_list.get('nextPageToken')
        if not page_token:
            break

    # If not found, create new
    calendar = {
        'summary': exam_name,
        'timeZone': 'Asia/Kolkata' # Defaulting to IST as per user context
    }
    created_calendar = service.calendars().insert(body=calendar).execute()
    return created_calendar['id']

def add_events_to_calendar(service, calendar_id, events):
    """
    Adds events to the specified calendar.
    Events list is expected to be a list of timeline event objects (from timeline_structure.json).
    Structure: { 'title': str, 'date': str (ISO), 'description': str, ... }
    """
    existing_events = service.events().list(calendarId=calendar_id).execute().get('items', [])
    existing_summaries = {e['summary'] for e in existing_events if 'summary' in e}

    for evt in events:
        summary = evt.get('title')
        if summary in existing_summaries:
            continue # Skip if already exists
            
        description = evt.get('description', '')
        start_time = evt.get('date') # e.g., "2024-11-01T10:00:00Z" or "2024-11-01"
        
        if not start_time:
            continue
        
        # Detect if this is a date-only (all-day) or dateTime event
        # Date-only format: "YYYY-MM-DD" (10 chars, no 'T')
        # DateTime format: "YYYY-MM-DDTHH:MM:SS..." (has 'T')
        
        is_all_day = 'T' not in start_time
        
        if is_all_day:
            # All-day event - use 'date' field
            start_date = start_time[:10]  # Just YYYY-MM-DD
            # End date for all-day events is exclusive, so next day
            try:
                dt = datetime.datetime.strptime(start_date, "%Y-%m-%d")
                end_dt = dt + datetime.timedelta(days=1)
                end_date = end_dt.strftime("%Y-%m-%d")
            except:
                end_date = start_date
            
            event_body = {
                'summary': summary,
                'description': description,
                'start': {'date': start_date},
                'end': {'date': end_date},
            }
        else:
            # Timed event - use 'dateTime' field
            try:
                dt = datetime.datetime.fromisoformat(start_time.replace("Z", "+00:00"))
                end_dt = dt + datetime.timedelta(hours=1)
                # Format back to ISO with Z for UTC
                start_formatted = dt.strftime("%Y-%m-%dT%H:%M:%S") + "Z"
                end_formatted = end_dt.strftime("%Y-%m-%dT%H:%M:%S") + "Z"
            except Exception as e:
                print(f"Date parsing error for {start_time}: {e}")
                continue
            
            event_body = {
                'summary': summary,
                'description': description,
                'start': {'dateTime': start_formatted, 'timeZone': 'UTC'},
                'end': {'dateTime': end_formatted, 'timeZone': 'UTC'},
            }
        
        service.events().insert(calendarId=calendar_id, body=event_body).execute()

def share_calendar_with_user(service, calendar_id, email):
    """
    Shares the calendar with the given email as a reader.
    Also makes the calendar publicly readable so it appears properly.
    """
    # First, share with specific user
    user_rule = {
        'scope': {
            'type': 'user',
            'value': email,
        },
        'role': 'reader'
    }
    
    # Also make calendar public so it's discoverable
    public_rule = {
        'scope': {
            'type': 'default',  # Makes it public
        },
        'role': 'reader'
    }
    
    try:
        service.acl().insert(calendarId=calendar_id, body=user_rule, sendNotifications=True).execute()
        print(f"✅ Shared calendar with {email}")
    except HttpError as e:
        if 'already exists' in str(e).lower():
            print(f"ℹ️ User {email} already has access")
        else:
            print(f"ACL Insert Warning for user: {e}")
    
    try:
        service.acl().insert(calendarId=calendar_id, body=public_rule).execute()
        print(f"✅ Made calendar public")
    except HttpError as e:
        if 'already exists' in str(e).lower():
            print(f"ℹ️ Calendar is already public")
        else:
            print(f"ACL Insert Warning for public: {e}")
    
    return True

def get_calendar_link(calendar_id):
    """
    Returns the public subscription URL for the calendar.
    Users can add this to their Google Calendar.
    """
    # URL to view the calendar in Google Calendar
    view_url = f"https://calendar.google.com/calendar/embed?src={calendar_id}"
    # URL to add/subscribe to the calendar
    add_url = f"https://calendar.google.com/calendar/r?cid={calendar_id}"
    return {
        "view_url": view_url,
        "add_url": add_url
    }

