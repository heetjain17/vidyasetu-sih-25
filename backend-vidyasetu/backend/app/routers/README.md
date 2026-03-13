# routers/ — API Endpoint Handlers

Each file = one feature domain. All routers are registered in `app/main.py`.

| File | Prefix | Auth | Description |
|---|---|---|---|
| `auth/router.py` | `/auth` | Public | Register, login, OAuth, signout |
| `profiles.py` | `/profile` | Any | Role-based profile CRUD |
| `links.py` | `/links` | Parent/Student | Parent-student account linking |
| `recommend.py` | `/recommend` | Student (full) | RIASEC-based career/college recommendations |
| `colleges.py` | `/colleges` | Public | College search and details |
| `career_hub.py` | `/career-hub` | Public | Roadmaps, study materials, scholarships |
| `chatbot.py` | `/chatbot` | Public | WebSocket & REST RAG chatbot |
| `discussion_forum.py` | `/forum` | Any | Community discussions, comments, votes |
| `timeline.py` | `/timeline` | Public | Exam timeline, WhatsApp/Calendar sync |
| `college_admin.py` | — | College | College profile management |
| `feedback.py` | `/feedback` | Any | Submit/view recommendation feedback |
| `data.py` | `/data` | Public | Raw table data endpoints (debug) |
| `users.py` | `/users` | Public | Admin user CRUD |
| `roadmaps.py` | `/roadmaps` | Public | Career roadmap templates |
| `health.py` | `/health` | Public | Health check |
| `predict.py` | `/predict` | Public | **DEPRECATED** — Use `/recommend/` |

## Notes
- Inline Pydantic schemas belong in `app/schemas/`, not in routers.
- Use `Depends(get_current_user)` for auth, `Depends(get_supabase_client)` for DB access.
