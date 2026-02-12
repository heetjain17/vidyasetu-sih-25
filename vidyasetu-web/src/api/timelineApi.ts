import { apiClient } from "./client";

// Types
export interface TimelineEvent {
  id: string;
  title: string;
  date: string;
  status: "Past" | "Ongoing" | "Upcoming";
  description?: string;
}

export interface ExamTimeline {
  id: string;
  exam_name: string;
  category: string;
  description: string;
  format?: string;
  website?: string;
  events: TimelineEvent[];
}

export interface CalendarSyncRequest {
  email: string;
  exam_id: string;
  exam_name: string;
  events: { title: string; date: string; description?: string }[];
}

export interface CalendarSyncResponse {
  status: string;
  message: string;
  calendar_id: string;
  event_count: number;
  add_to_google_calendar_url: string;
  view_calendar_url: string;
}

export interface WhatsAppSyncRequest {
  phone_number: string;
  exam_id: string;
  exam_name: string;
}

// API Functions

/**
 * Fetch all exam timelines from the backend
 */
export const fetchTimelines = async (): Promise<ExamTimeline[]> => {
  const response = await apiClient.get("/timeline/");
  return response.data;
};

/**
 * Sync exam events to Google Calendar
 * Returns a link for the user to manually add the calendar
 */
export const syncToGoogleCalendar = async (
  request: CalendarSyncRequest
): Promise<CalendarSyncResponse> => {
  const response = await apiClient.post("/timeline/sync/calendar", request);
  return response.data;
};

/**
 * Subscribe to WhatsApp notifications for an exam
 */
export const subscribeWhatsApp = async (
  request: WhatsAppSyncRequest
): Promise<{ status: string; message: string }> => {
  const response = await apiClient.post("/timeline/sync/whatsapp", request);
  return response.data;
};
