# schemas/ — Pydantic Request/Response Models

All models are re-exported from `__init__.py` for convenient importing.

| File | Models |
|---|---|
| `auth.py` | `UserRole`, `RegisterRequest`, `LoginRequest`, `AuthResponse` |
| `profile.py` | `StudentProfileUpdate/Response`, `ParentProfileUpdate/Response`, `CollegeProfileUpdate/Response` |
| `recommendation.py` | `ScoresSchema`, `StudentActualSchema`, `StudentPreferencesSchema`, `RecommenderRequest`, `TranslateRequest` |
| `links.py` | `ConnectRequest`, `LinkResponse`, `LinkedStudentResponse`, `PendingRequestResponse` |
| `timeline.py` | `WhatsAppSyncRequest`, `CalendarSyncRequest` |
| `feedback.py` | `FeedbackCreate` |
| `chatbot.py` | `ChatRequest`, `ChatResponse`, `HealthResponse` |

> Note: Forum schemas live in `app/routers/discussion_forum_schemas.py` (co-located by convention for this module).
