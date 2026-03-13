<p align="center">
  <h1 align="center">📚 VidyaSetu — Career Guidance Platform</h1>
  <p align="center">
    <strong>An AI-powered career guidance ecosystem for students in Jammu & Kashmir</strong><br/>
    Built for <em>Smart India Hackathon (SIH) 2025</em>
  </p>
</p>

---

## 🌟 Overview

**VidyaSetu** (also branded as **Margadarshaka**) is a comprehensive career guidance platform designed to help students in Jammu & Kashmir discover career paths, match with suitable colleges, and receive personalised recommendations based on aptitude assessments and preference modelling. The platform supports **multi-language** access (English, Hindi, Kashmiri & Dogri) and is composed of three independent modules:

| Module | Tech Stack | Purpose |
|--------|-----------|---------|
| **backend-vidyasetu** | Python · FastAPI · Supabase · OpenAI · Qdrant | REST API server with AI/ML services |
| **vidyasetu-app** | React Native · Expo · TypeScript · Drizzle ORM | Mobile application (Android/iOS) |
| **vidyasetu-web** | React · Vite · TailwindCSS · TanStack Router | Web dashboard & landing page |

---

## 📁 Monorepo Structure

```
vidyasetu-sih-25/
├── backend-vidyasetu/        # 🔧 Python FastAPI Backend
│   ├── backend/              #    Application source code
│   │   ├── app/              #    FastAPI application package
│   │   │   ├── auth/         #    Authentication (Supabase OAuth + JWT)
│   │   │   ├── cache/        #    Embedding cache (JSON)
│   │   │   ├── dependencies/ #    DI — CORS, DB client, auth guards
│   │   │   ├── ml_models/    #    ONNX model for predictions
│   │   │   ├── models/       #    SQLAlchemy / Pydantic models
│   │   │   ├── routers/      #    API route handlers (16 routers)
│   │   │   ├── schemas/      #    Request / response schemas
│   │   │   ├── services/     #    Business logic & AI services
│   │   │   ├── utils/        #    Helpers — LLM client, scoring, translation
│   │   │   └── main.py       #    FastAPI app entry point
│   │   ├── data/             #    RAG knowledge base & schema files
│   │   ├── scripts/          #    Utility scripts
│   │   ├── tests/            #    Test suite
│   │   ├── docker-compose.yml
│   │   └── requirements.txt  #    Python dependencies
│   ├── data/                 #    CSV seed data (colleges, courses, RIASEC, etc.)
│   ├── database_schema.sql   #    Full PostgreSQL schema
│   ├── API_DOC.md            #    API documentation
│   ├── db.md                 #    Database documentation
│   └── CHANGELOG.md          #    Version history
│
├── vidyasetu-app/            # 📱 React Native Mobile App (Expo)
│   ├── app/                  #    Expo Router screens
│   │   ├── (app)/            #    Main app screens (tabs)
│   │   │   ├── home.tsx      #    Home dashboard
│   │   │   ├── career-hub/   #    Career exploration & college details
│   │   │   ├── report/       #    Recommendation reports & reasoning
│   │   │   ├── timeline.tsx  #    Exam & event timeline
│   │   │   ├── sandbox.tsx   #    Interactive sandbox / playground
│   │   │   └── feedback.tsx  #    User feedback screen
│   │   ├── (auth)/           #    Authentication flow
│   │   │   ├── login.tsx     #    Login screen
│   │   │   ├── value-proposition.tsx   # Onboarding value prop
│   │   │   └── profile-setup/         # 3-step profile wizard
│   │   ├── (test)/           #    Assessment module
│   │   │   └── aptitude/     #    Aptitude quiz, results & short report
│   │   └── _layout.tsx       #    Root layout with i18n init
│   ├── components/           #    Reusable UI components
│   │   ├── home/             #    Home screen components (Drawer, Cards)
│   │   ├── background/       #    Background gradient components
│   │   ├── Accordion.tsx, Button.tsx, Card.tsx, etc.
│   │   ├── feedback.tsx      #    Feedback modal component
│   │   ├── profile.tsx       #    Profile display component
│   │   └── LanguageSwitcher.tsx  # Multi-language selector
│   ├── services/             #    Business logic & data layer
│   │   ├── database/         #    Local SQLite via Drizzle ORM
│   │   │   ├── schema.ts     #    Database schema definitions
│   │   │   ├── seed.ts       #    Seeding utilities
│   │   │   ├── seed-all.ts   #    Full CSV seed runner
│   │   │   ├── csv-seed.ts   #    CSV parsing & seeding
│   │   │   └── migrations.ts #    Database migrations
│   │   ├── logic/            #    Recommendation algorithms
│   │   │   ├── recommendation.pipeline.ts  # 5-stage recommendation pipeline
│   │   │   ├── riasec.recommend.ts         # RIASEC career matching
│   │   │   ├── college.recommend.ts        # College scoring & ranking
│   │   │   └── question.selector.ts        # Question selection logic
│   │   ├── sandbox/          #    Interactive sandbox features
│   │   │   ├── chatbot.ts    #    Chatbot integration
│   │   │   ├── search.ts     #    TF-IDF search engine
│   │   │   ├── text-clean.ts #    Text preprocessing utilities
│   │   │   └── utils.ts      #    Sandbox helper functions
│   │   ├── utils/            #    Utility functions
│   │   │   ├── explanation.ts #   Natural language explanations
│   │   │   ├── model2.ts     #    College scoring model (Model 2)
│   │   │   ├── score.ts      #    RIASEC score computation
│   │   │   └── translator.ts #    Multi-language translation
│   │   ├── authService.ts    #    Supabase authentication
│   │   ├── csvDataService.ts #    CSV data loader
│   │   ├── dataService.ts    #    Unified data access layer
│   │   ├── notificationService.ts  # Push notifications
│   │   └── offlineChatbot.ts #    Offline TF-IDF chatbot
│   ├── store/                #    Zustand state management
│   │   ├── aptitude.ts       #    Aptitude quiz state
│   │   ├── auth.ts           #    Authentication state
│   │   ├── chatStore.ts      #    Chat conversations state
│   │   ├── college.ts        #    College recommendations state
│   │   ├── explanation.ts    #    Explanations state
│   │   ├── languageStore.ts  #    i18n language selection
│   │   ├── profile.ts        #    User profile state
│   │   └── timelineStore.ts  #    Timeline events state
│   ├── i18n/                 #    Internationalisation (4 languages)
│   │   └── locales/          #    en, hi, ks (Kashmiri), doi (Dogri)
│   ├── data/                 #    Bundled offline data
│   │   ├── *.csv             #    Raw CSV datasets
│   │   ├── *.json            #    Pre-processed JSON data
│   │   ├── search_dictionary.json   # TF-IDF vocabulary
│   │   └── universal_index.json     # TF-IDF document index
│   ├── config/               #    App configuration
│   ├── constants/            #    Theme & constant values
│   ├── hooks/                #    Custom React hooks
│   ├── types/                #    TypeScript type definitions
│   └── package.json          #    npm dependencies
│
├── vidyasetu-web/            # 🌐 React Web Application (Vite)
│   ├── src/
│   │   ├── api/              #    API client layer (Axios)
│   │   │   ├── client.ts     #    Base Axios client
│   │   │   ├── authApi.ts    #    Authentication API
│   │   │   ├── chatbotApi.ts #    Chatbot API
│   │   │   ├── careerHubApi.ts    # Career hub API
│   │   │   ├── collegesApi.ts     # Colleges API
│   │   │   ├── forumApi.ts        # Discussion forum API
│   │   │   ├── profileApi.ts      # Profile management API
│   │   │   ├── recommendApi.ts    # Recommendations API
│   │   │   ├── roadmapsApi.ts     # Roadmaps API
│   │   │   ├── timelineApi.ts     # Timeline API
│   │   │   └── dataApi.ts         # Generic data API
│   │   ├── components/       #    React components
│   │   │   ├── landing/      #    Landing page sections
│   │   │   │   ├── Navbar.tsx
│   │   │   │   ├── HeroSection.tsx
│   │   │   │   ├── ValueProps.tsx
│   │   │   │   ├── DemoSection.tsx
│   │   │   │   ├── SampleReport.tsx
│   │   │   │   ├── TargetAudience.tsx
│   │   │   │   ├── Architecture.tsx
│   │   │   │   ├── Testimonals.tsx
│   │   │   │   ├── Footer.tsx
│   │   │   │   └── BackgroundEffects.tsx
│   │   │   ├── dashboard/    #    Dashboard modules
│   │   │   │   ├── StudentDashboard.tsx
│   │   │   │   ├── ParentDashboard.tsx
│   │   │   │   ├── CollegeDashboard.tsx
│   │   │   │   ├── AssessmentModule.tsx
│   │   │   │   ├── RecommendationsModule.tsx
│   │   │   │   ├── ParentRecommendationsModule.tsx
│   │   │   │   ├── CareerHubModule.tsx
│   │   │   │   ├── CollegesModule.tsx
│   │   │   │   ├── ChatbotModule.tsx
│   │   │   │   ├── TimelineModule.tsx
│   │   │   │   ├── SandboxModule.tsx
│   │   │   │   ├── StudentProfileModule.tsx
│   │   │   │   ├── FeedbackModule.tsx
│   │   │   │   ├── Awareness.tsx
│   │   │   │   ├── DiscussionsModule.tsx
│   │   │   │   └── forum/    #    Discussion forum components
│   │   │   │       ├── ForumLayout.tsx
│   │   │   │       ├── DiscussionListModule.tsx
│   │   │   │       ├── DiscussionThreadModule.tsx
│   │   │   │       └── CreateDiscussionModal.tsx
│   │   │   ├── ui/           #    Shadcn-style UI primitives
│   │   │   │   ├── button.tsx, select.tsx, slider.tsx
│   │   │   │   ├── bento-grid.tsx, animated-list.tsx
│   │   │   │   ├── timeline.tsx, iphone.tsx, safari.tsx
│   │   │   │   └── hero-video-dialog.tsx
│   │   │   ├── Chatbot.tsx          # Main chatbot component
│   │   │   ├── LanguageSwitcher.tsx  # Web language switcher
│   │   │   └── RouteGuard.tsx       # Auth route protection
│   │   ├── routes/           #    TanStack file-based routing
│   │   │   ├── index.tsx     #    Landing page (/)
│   │   │   ├── __root.tsx    #    Root layout
│   │   │   ├── assessment/   #    Quiz & results pages
│   │   │   ├── auth/         #    Login & profile setup
│   │   │   └── dashboard/    #    Main dashboard
│   │   ├── store/            #    Zustand state stores
│   │   │   ├── authStore.ts
│   │   │   ├── profileStore.ts
│   │   │   ├── quizStore.ts
│   │   │   └── notificationStore.ts
│   │   ├── hooks/            #    Custom React hooks
│   │   │   ├── useAuth.ts
│   │   │   ├── useChatbot.ts
│   │   │   ├── useRecommendation.ts
│   │   │   ├── useTranslate.ts
│   │   │   └── use-mobile.ts
│   │   ├── i18n/             #    Internationalisation (4 languages)
│   │   │   └── locales/      #    en, hi, ks, doi
│   │   ├── lib/              #    Utility libraries
│   │   │   ├── quiz.ts       #    Quiz question bank
│   │   │   ├── translator.ts #    Translation utilities
│   │   │   └── utils.ts      #    General helpers (cn, etc.)
│   │   ├── services/         #    Service layer
│   │   │   └── lingoDevService.ts  # LingoDev translation service
│   │   ├── data/             #    Static data
│   │   ├── types/            #    TypeScript definitions
│   │   ├── assets/           #    Static assets (images, icons)
│   │   ├── main.tsx          #    App entry point
│   │   ├── index.css         #    Global styles (TailwindCSS)
│   │   └── routeTree.gen.ts  #    Auto-generated route tree
│   ├── index.html            #    HTML entry point
│   ├── vite.config.ts        #    Vite + TailwindCSS config
│   ├── tsconfig.json         #    TypeScript config
│   └── package.json          #    npm dependencies
│
└── README.md                 # This file
```

---

## 🧠 Core Features

### 🎯 Career Recommendation Engine
- **RIASEC-based aptitude assessment** — 7-dimension scoring (Logical, Quantitative, Analytical, Verbal, Spatial, Creativity, Entrepreneurial)
- **5-stage recommendation pipeline**:
  1. Career recommendations via RIASEC score matching
  2. Career → Course mapping
  3. Course → College mapping
  4. College scoring & ranking (locality, financial, eligibility, cultural, quality)
  5. Natural language explanation generation
- **Multi-factor college scoring** — considers distance (Haversine), fees, scholarships, hostel availability, gender-specific seats, campus facilities, and student preferences

### 💬 AI Chatbot (Dual Mode)
- **Online (RAG) mode** — OpenAI GPT-4o-mini with Qdrant vector search, query rewriting, intent classification, context building, and guardrails for hallucination prevention
- **Offline mode** — TF-IDF-based search with pattern matching using bundled pre-computed document vectors and vocabulary dictionary

### 👥 Multi-Role Authentication
- **Student** — take assessments, receive recommendations, manage profile
- **Parent** — link to students via invite codes, view child's recommendations
- **College** — manage institution profile (admin), view analytics
- JWT-based authentication via Supabase Auth with OAuth support (Google, GitHub)

### 🌐 Multilingual Support
- **4 languages**: English, Hindi, Kashmiri (ks) & Dogri (doi)
- Runtime translation via OpenAI + deep-translator
- Fully translated UI across all screens in both mobile and web apps

### 📚 Career Hub
- Explore career paths with detailed descriptions
- Browse courses and their associated colleges
- Career roadmap templates with semester plans, internships, exams & certifications

### 📅 Timeline & Events
- Upcoming exam schedules and important dates
- Google Calendar sync integration
- Event tracking and reminders

### 💬 Discussion Forum
- Community discussions for students, parents, and counsellors
- Thread-based conversations with real-time updates
- Moderation support

### 📊 Dashboard
- Role-specific dashboards (Student, Parent, College)
- Recommendation summaries and analytics
- Profile completion tracking and notifications

---

## 🔧 Tech Stack Details

### Backend (`backend-vidyasetu`)
| Category | Technology |
|----------|-----------|
| Framework | FastAPI 0.122 |
| Database | Supabase (PostgreSQL) |
| Auth | Supabase Auth + JWT (PyJWT, python-jose) |
| AI/LLM | OpenAI GPT-4o-mini, Google Generative AI |
| Vector DB | Qdrant (for RAG chatbot) |
| Embeddings | OpenAI text-embedding-3-small |
| ML | ONNX Runtime (prediction model) |
| NLP | LangChain (Core, Ollama, OpenAI, Qdrant) |
| Translation | deep-translator |
| Caching | Redis |
| Data Processing | Pandas, NumPy |
| Containerisation | Docker Compose |

### Mobile App (`vidyasetu-app`)
| Category | Technology |
|----------|-----------|
| Framework | Expo 54 (React Native 0.81) |
| Routing | Expo Router 6 |
| Language | TypeScript 5.9 |
| State Management | Zustand 5 |
| Local Database | Drizzle ORM + expo-sqlite |
| Offline Search | Custom TF-IDF engine |
| Animations | React Native Reanimated 4 |
| i18n | i18next + react-i18next |
| Icons | Lucide React Native |
| Notifications | expo-notifications |

### Web App (`vidyasetu-web`)
| Category | Technology |
|----------|-----------|
| Build Tool | Vite 7 |
| Framework | React 19 |
| Routing | TanStack Router with auto code-splitting |
| Styling | TailwindCSS 4 |
| State Management | Zustand 5 |
| Data Fetching | TanStack React Query (5-min stale time) |
| HTTP Client | Axios |
| Animations | Framer Motion 12 |
| UI Components | Radix UI primitives, CVA, tailwind-merge |
| Forms | React Hook Form 7 |
| i18n | i18next + browser language detector |
| Icons | Lucide React |

---

## 🗄️ Database Schema

The application uses **Supabase (PostgreSQL)** with the following tables:

| Table | Purpose |
|-------|---------|
| `Users` | Core user table with roles (STUDENT / PARENT / COLLEGE) |
| `StudentProfiles` | Student academic, personal & preference data |
| `ParentProfiles` | Parent personal info & relationship details |
| `CollegeProfiles` | College info, verification & contact details |
| `ParentStudentLinks` | Parent-student linking (invite code system) |
| `QuizResults` | 7-dimension aptitude + 6-dimension RIASEC scores |
| `Recommendations` | Career & college recommendations with explanations |
| `Notifications` | In-app notification system |
| `CollegeList` | Master college data (pre-seeded from CSV) |
| `RIASEC` | Career-RIASEC mapping weights |
| `career_to_course` | Career → Course junction |
| `course_to_college` | Course → College junction |
| `Courses` | Course master data |

---

## 🔌 API Endpoints

The backend exposes the following route groups:

| Prefix | Tag | Description |
|--------|-----|-------------|
| `/auth` | 🔐 Authentication | Register, login, OAuth, sign out |
| `/profile` | 👤 Profiles | Get/update student, parent, college profiles |
| `/links` | 🔗 Parent-Student Links | Generate invite codes, link/unlink |
| `/recommend` | 🎯 Recommendations | Get career & college recommendations, save results |
| `/recommend/translate` | 🎯 Recommendations | On-demand text translation |
| `/chatbot` | 💬 Chatbot | RAG-based Q&A with streaming support |
| `/colleges` | 🏫 Colleges | Browse, search, filter colleges |
| `/college-admin` | 🏫 College Admin | College dashboard management |
| `/career-hub` | 📚 Career Hub | Career exploration and futuristic careers |
| `/timeline` | Timeline | Exam dates and important events |
| `/forum` | Forum | Discussion threads and replies |
| `/data` | Data | Raw data access endpoints |
| `/feedback` | 📝 Feedback | User feedback submission |
| `/predict` | Predict | ML model predictions |
| `/roadmaps` | Roadmaps | Career roadmap templates |
| `/users` | Users | User management |
| `/health` | Health | System health check |

---

## 📂 Key File Summaries

### Backend — `backend-vidyasetu/`

| File | Description |
|------|-------------|
| `backend/app/main.py` | FastAPI app entry point — registers 16 routers, configures CORS & JWT auth |
| `backend/app/auth/router.py` | Registration, login, OAuth, sign out with Supabase Auth |
| `backend/app/services/openai_chatbot.py` | **1098-line** RAG chatbot: embedding, vector search, intent classification, context building, guardrails, streaming |
| `backend/app/services/recommender2_db.py` | College recommendation engine with multi-factor scoring (locality, financial, eligibility, cultural, quality) |
| `backend/app/services/db_service.py` | Data access layer — colleges, careers, courses, roadmaps, timeline, study materials |
| `backend/app/services/chatbot_guardrails.py` | Guardrails for response validation and hallucination prevention |
| `backend/app/services/futuristic_career_generator.py` | AI-generated futuristic career suggestions |
| `backend/app/services/google_calendar.py` | Google Calendar sync for timeline events |
| `backend/app/services/discussion_forum_service.py` | Forum CRUD with threaded discussions |
| `backend/app/routers/recommend.py` | API endpoints for recommendations with save & translate support |
| `backend/app/routers/chatbot.py` | Chatbot API with sync and streaming endpoints |
| `backend/app/routers/college_admin.py` | College administration dashboard API |
| `backend/app/utils/translation.py` | Multi-language translation via deep-translator |
| `backend/app/utils/llm_client.py` | Unified LLM client (OpenAI/Google) |
| `backend/app/utils/score_model2.py` | College scoring model utilities |
| `database_schema.sql` | Full PostgreSQL schema with 8 core tables |
| `data/*.csv` | Seed data: 6 CSV files (colleges, courses, RIASEC, career mappings) |

### Mobile App — `vidyasetu-app/`

| File | Description |
|------|-------------|
| `app/_layout.tsx` | Root layout — initialises i18n, optional DB init |
| `app/(app)/home.tsx` | Main home screen with recommendation summary & navigation |
| `app/(app)/career-hub/index.tsx` | Career exploration hub — careers, courses, colleges |
| `app/(app)/career-hub/college.tsx` | Detailed college information view |
| `app/(app)/career-hub/careers.tsx` | Career listing and details |
| `app/(app)/timeline.tsx` | Exam and event timeline display |
| `app/(app)/sandbox.tsx` | Interactive playground / sandbox features |
| `app/(app)/report/index.tsx` | Full recommendation report |
| `app/(app)/report/reasoning.tsx` | AI-generated reasoning explanations |
| `app/(auth)/login.tsx` | Authentication screen with Supabase integration |
| `app/(auth)/profile-setup/*` | 3-step profile setup wizard |
| `app/(test)/aptitude/*` | Aptitude quiz flow: instructions → quiz → short report |
| `services/logic/recommendation.pipeline.ts` | **Core file** — 5-stage recommendation pipeline (RIASEC → Courses → Colleges → Scoring → Explanations) |
| `services/logic/riasec.recommend.ts` | RIASEC career matching, career→course and course→college mapping |
| `services/logic/college.recommend.ts` | College scoring and ranking algorithm |
| `services/offlineChatbot.ts` | Fully offline chatbot with TF-IDF search and pattern matching |
| `services/utils/score.ts` | RIASEC score computation from aptitude answers |
| `services/utils/explanation.ts` | Natural language explanation generator |
| `services/utils/model2.ts` | College scoring model (Model 2) |
| `services/authService.ts` | Supabase authentication service |
| `services/csvDataService.ts` | CSV data loading and parsing |
| `services/database/schema.ts` | SQLite schema definitions (Drizzle ORM) |
| `store/*.ts` | 8 Zustand stores managing global state |
| `components/profile.tsx` | User profile display component |
| `components/feedback.tsx` | Feedback collection modal |
| `data/*.json` | Pre-computed data: search dictionary, universal index, colleges, careers, courses |

### Web App — `vidyasetu-web/`

| File | Description |
|------|-------------|
| `src/main.tsx` | App entry — TanStack Router + React Query + i18n |
| `src/routes/index.tsx` | Landing page with animated sections (Hero, ValueProps, Demo, Architecture, etc.) |
| `src/routes/auth/index.tsx` | Login page with role selection |
| `src/routes/auth/profile.tsx` | Profile setup form |
| `src/routes/assessment/*` | Assessment flow: intro → quiz → results |
| `src/routes/dashboard/index.tsx` | Role-based dashboard routing (Student/Parent/College) |
| `src/components/landing/*` | 10 landing page sections with Framer Motion animations |
| `src/components/dashboard/StudentDashboard.tsx` | Student dashboard with modules |
| `src/components/dashboard/ParentDashboard.tsx` | Parent dashboard with linked student view |
| `src/components/dashboard/CollegeDashboard.tsx` | College admin analytics dashboard |
| `src/components/dashboard/RecommendationsModule.tsx` | Career & college recommendations display |
| `src/components/dashboard/CareerHubModule.tsx` | Career exploration hub |
| `src/components/dashboard/CollegesModule.tsx` | College explorer with filters |
| `src/components/dashboard/ChatbotModule.tsx` | Web chatbot interface |
| `src/components/dashboard/TimelineModule.tsx` | Timeline events display |
| `src/components/dashboard/SandboxModule.tsx` | Interactive sandbox |
| `src/components/dashboard/forum/*` | Discussion forum (list, threads, create) |
| `src/components/Chatbot.tsx` | Full-featured chatbot with streaming support |
| `src/components/RouteGuard.tsx` | Auth-based route protection |
| `src/api/client.ts` | Axios client with base URL config |
| `src/api/*.ts` | 11 typed API modules covering all backend endpoints |
| `src/store/*.ts` | 4 Zustand stores (auth, profile, quiz, notifications) |
| `src/hooks/*.ts` | 5 custom hooks (auth, chatbot, recommendations, translate, mobile) |
| `src/lib/*.ts` | Quiz questions, translator, utility functions |
| `src/i18n/locales/*.ts` | Translation files (English, Hindi, Kashmiri, Dogri) |

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** ≥ 18.x
- **Python** ≥ 3.10
- **Expo CLI** (for mobile app)
- **Supabase** account (for database & auth)
- **OpenAI API key** (for chatbot & translations)

### Backend Setup

```bash
cd backend-vidyasetu/backend

# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Setup environment variables
cp .env.example .env
# Edit .env with your Supabase URL, key, OpenAI key, etc.

# Run the database schema
# Execute database_schema.sql on your Supabase instance

# Start the server
uvicorn app.main:app --reload --port 8000
```

### Mobile App Setup

```bash
cd vidyasetu-app

# Install dependencies
npm install

# Start Expo development server
npx expo start

# Or run on specific platform
npx expo start --android
npx expo start --ios
```

### Web App Setup

```bash
cd vidyasetu-web

# Install dependencies
npm install

# Setup environment variables
cp .env.example .env
# Set VITE_API_URL to your backend URL

# Start development server
npm run dev
```

---

## 🔑 Environment Variables

### Backend
| Variable | Description |
|----------|-------------|
| `SUPABASE_URL` | Supabase project URL |
| `SUPABASE_KEY` | Supabase anon/service key |
| `OPENAI_API_KEY` | OpenAI API key |
| `OPENAI_MODEL` | LLM model (default: `gpt-4o-mini`) |
| `OPENAI_EMBED_MODEL` | Embedding model (default: `text-embedding-3-small`) |
| `QDRANT_URL` | Qdrant vector DB URL |
| `REDIS_URL` | Redis cache URL |

### Web App
| Variable | Description |
|----------|-------------|
| `VITE_API_URL` | Backend API base URL |

---

## 📐 Architecture

```
┌─────────────────────────────────────────────────────────┐
│                      CLIENTS                            │
│  ┌──────────────┐  ┌──────────────┐                     │
│  │ Mobile App   │  │  Web App     │                     │
│  │ (Expo/RN)    │  │  (Vite/React)│                     │
│  │              │  │              │                     │
│  │ • Offline    │  │ • TanStack   │                     │
│  │   chatbot    │  │   Router     │                     │
│  │ • Local DB   │  │ • React      │                     │
│  │   (SQLite)   │  │   Query      │                     │
│  │ • RIASEC     │  │ • Framer     │                     │
│  │   scoring    │  │   Motion     │                     │
│  └──────┬───────┘  └──────┬───────┘                     │
│         │                 │                             │
│         └────────┬────────┘                             │
│                  │ HTTP/REST                            │
│                  ▼                                      │
│  ┌──────────────────────────────┐                       │
│  │    FastAPI Backend           │                       │
│  │    (backend-vidyasetu)       │                       │
│  │                              │                       │
│  │  ┌────────┐  ┌────────────┐  │                       │
│  │  │ Auth   │  │ Recommend  │  │                       │
│  │  │ Module │  │ Engine     │  │                       │
│  │  └────┬───┘  └─────┬──────┘  │                       │
│  │       │            │         │                       │
│  │  ┌────┴───┐  ┌─────┴──────┐  │                       │
│  │  │ RAG    │  │ College    │  │                       │
│  │  │Chatbot │  │ Recommender│  │                       │
│  │  └────┬───┘  └───────────-┘  │                       │
│  └───────┼──────────────────────┘                       │
│          │                                              │
│    ┌─────┼──────────────────────────────────┐           │
│    │     ▼          EXTERNAL SERVICES       │           │
│    │  ┌────────┐  ┌──────────┐  ┌────────┐  │           │
│    │  │Supabase│  │ OpenAI   │  │ Qdrant │  │           │
│    │  │(DB+Auth│  │ (GPT +   │  │(Vector │  │           │
│    │  │)       │  │Embeddings│  │  DB)   │  │           │
│    │  └────────┘  └──────────┘  └────────┘  │           │
│    │  ┌────────┐  ┌──────────┐              │           │
│    │  │ Redis  │  │ Google   │              │           │
│    │  │(Cache) │  │ Calendar │              │           │
│    │  └────────┘  └──────────┘              │           │
│    └────────────────────────────────────────┘           │
└─────────────────────────────────────────────────────────┘
```

---

## 🌍 Supported Languages

| Code | Language | Mobile | Web |
|------|----------|--------|-----|
| `en` | English | ✅ | ✅ |
| `hi` | Hindi | ✅ | ✅ |
| `ks` | Kashmiri | ✅ | ✅ |
| `doi` | Dogri | ✅ | ✅ |

---

## 👥 User Roles

| Role | Capabilities |
|------|-------------|
| **Student** | Take aptitude assessments, get career & college recommendations, explore career hub, use chatbot, view timeline, manage profile |
| **Parent** | Link to student via invite code, view child's recommendations, get awareness content |
| **College** | Manage institution profile, view analytics dashboard, respond to queries |

---

## 📝 Data Sources

The platform uses curated datasets specific to **Jammu & Kashmir**:

- **CollegeList_rows.csv** — 100+ colleges with details (AISHE code, district, management, facilities)
- **RIASEC_rows.csv** — Career-to-RIASEC score mapping matrix
- **Courses_rows.csv** — Course catalog with stream classification
- **career_to_course_rows.csv** — Career to recommended courses mapping
- **course_to_college_rows.csv** — Course to offering colleges mapping
- **roadmap_templates_rows.csv** — Career roadmap templates with semester plans

---

## 📊 Recommendation Algorithm

The recommendation engine uses a **weighted multi-factor scoring model**:

```
Final Score = w₁ × Locality + w₂ × Financial + w₃ × Eligibility + w₄ × Cultural + w₅ × Quality
```

Where weights (w₁–w₅) are derived from the student's preference settings (0–5 scale), normalised to sum to 1.

### Scoring Dimensions

| Dimension | Factors Considered |
|-----------|-------------------|
| **Locality** | Haversine distance between student and college, hostel availability |
| **Financial** | Annual fees vs budget, scholarship availability, category-specific fees |
| **Eligibility** | Seat availability, gender-specific seats, category reservation |
| **Cultural** | Student hobbies vs college events (cosine similarity of embeddings) |
| **Quality** | Placement rate, infrastructure rating, facilities (library, labs, sports, medical) |

---

## 🛡️ Security

- **JWT-based authentication** with Supabase Auth
- **Role-based access control** (RBAC) for all protected endpoints
- **Chatbot guardrails** preventing hallucination and off-topic responses
- **Input validation** via Pydantic schemas
- **CORS configuration** for cross-origin requests
- **OAuth support** (Google, GitHub) for social login

---

## 📄 License

This project was developed as part of the **Smart India Hackathon (SIH) 2025** initiative.

---

<p align="center">
  Made with ❤️ for the students of Jammu & Kashmir
</p>
