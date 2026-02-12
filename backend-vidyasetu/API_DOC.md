# API & Database Documentation

## Backend Base URL
```
https://your-backend.up.railway.app
```

## Database Schema (Supabase)


### users
| column | type | description |
|--------|------|-------------|
| id | uuid | Primary key (user id) |
| name | text | User's display name |
| email | text | User email address |

### careers
| column | type | description |
|--------|------|-------------|
| id | uuid | Primary key |
| career_name | text | Name of the career |
| r | int | RIASEC: Realistic score |
| i | int | RIASEC: Investigative score |
| a | int | RIASEC: Artistic score |
| s | int | RIASEC: Social score |
| e | int | RIASEC: Enterprising score |
| c | int | RIASEC: Conventional score |

### college_list
| column | type | description |
|--------|------|-------------|
| id | uuid | Primary key |
| name | text | College name |
| district | text | District |
| website | text | College website |

### courses
| column | type | description |
|--------|------|-------------|
| id | uuid | Primary key |
| career | uuid | Foreign key → careers.id |
| course | text | Course name |

### course_college
| column | type | description |
|--------|------|-------------|
| id | uuid | Primary key |
| course_name | text | Foreign key → courses.course |
| college_name | text | Foreign key → college_list.name |

### roadmap
| column | type | description |
|--------|------|-------------|
| id | uuid | Primary key |
| course | text | Foreign key → courses.course |
| years | int | Duration in years |
| internships | int | Number of internships |
| placements | int | Number of placements |
| upscaling | text | Upskilling info |

### college_facilities
| column | type | description |
|--------|------|-------------|
| id | uuid | Primary key |
| college_name | text | Foreign key → college_list.name |
| ... | ... | Add facility columns as needed |

#### Relationships
- `courses.career` → `careers.id` (many-to-one)
- `courses.course` → `roadmap.course` (one-to-one or one-to-many, depending on roadmap design)
- `courses.course` → `course_college.course_name` (one-to-many)
- `course_college.college_name` → `college_list.name` (many-to-one)
- `college_facilities.college_name` → `college_list.name` (many-to-one)

## API Endpoints


### Auth
- `POST /auth/register` — Register new user
- `POST /auth/login` — Login user
- `GET /auth/oauth/google` — Get Google OAuth URL
- `GET /auth/oauth/github` — Get GitHub OAuth URL
- `POST /auth/signout` — Sign out user

### Users (CRUD)
- `POST /users/` — Create user
- `GET /users/` — List all users
- `GET /users/{user_id}` — Get user by ID
- `PUT /users/{user_id}` — Update user by ID
- `DELETE /users/{user_id}` — Delete user by ID

### Data (Read-only)
- `GET /data/careers` — List all careers
- `GET /data/college-list` — List all colleges
- `GET /data/courses` — List all courses
- `GET /data/course-college` — List all course-college mappings
- `GET /data/roadmap` — List all roadmaps
- `GET /data/college-facilities` — List all college facilities

## Authentication Flow
- Register/login via `/auth/register` or `/auth/login`.
- Use returned JWT token in `Authorization: Bearer <token>` header for protected endpoints.
- OAuth: Get URL from `/auth/oauth/google` or `/auth/oauth/github`, redirect user, then handle callback.

## Example Request
```json
POST /auth/register
{
  "email": "user@example.com",
  "password": "yourpassword"
}
```

(Add more examples as needed)

---
Update this file as your backend evolves. Share it with your frontend developer for smooth integration.
