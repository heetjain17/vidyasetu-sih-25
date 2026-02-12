-- ============================================================
-- MARGADARSHAKA DATABASE SCHEMA
-- Multi-Role Authentication System
-- ============================================================
-- SAFE TO RUN: Only drops Users table, preserves all other tables
-- Existing tables NOT affected: CollegeList, RIASEC, career_to_course, 
--                               course_to_college, Courses, etc.
-- ============================================================

-- ============================================================
-- STEP 1: DROP ONLY THE USERS TABLE
-- ============================================================
DROP TABLE IF EXISTS public."Users" CASCADE;

-- ============================================================
-- STEP 2: CREATE NEW USERS TABLE WITH ROLE
-- ============================================================
CREATE TABLE public."Users" (
  u_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL UNIQUE,
  role TEXT NOT NULL DEFAULT 'STUDENT' CHECK (role IN ('STUDENT', 'PARENT', 'COLLEGE')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_users_role ON public."Users"(role);
CREATE INDEX idx_users_email ON public."Users"(email);

-- ============================================================
-- STEP 3: STUDENT PROFILES TABLE
-- ============================================================
CREATE TABLE public."StudentProfiles" (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES public."Users"(u_id) ON DELETE CASCADE,
  
  -- Personal Info
  full_name TEXT,
  gender TEXT CHECK (gender IN ('Male', 'Female', 'Other')),
  date_of_birth DATE,
  phone TEXT,
  
  -- Location & Category
  locality TEXT,
  district TEXT,
  state TEXT,
  category TEXT CHECK (category IN ('General', 'OBC', 'SC', 'ST', 'EWS')),
  
  -- Academic Info
  grade TEXT,
  board TEXT,
  school_name TEXT,
  
  -- Financial
  budget INTEGER DEFAULT 100000,
  
  -- Interests
  extracurriculars TEXT[],
  hobbies TEXT[],
  
  -- Preferences (0-5 scale)
  importance_locality INTEGER DEFAULT 3 CHECK (importance_locality BETWEEN 0 AND 5),
  importance_financial INTEGER DEFAULT 3 CHECK (importance_financial BETWEEN 0 AND 5),
  importance_eligibility INTEGER DEFAULT 3 CHECK (importance_eligibility BETWEEN 0 AND 5),
  importance_events_hobbies INTEGER DEFAULT 3 CHECK (importance_events_hobbies BETWEEN 0 AND 5),
  importance_quality INTEGER DEFAULT 3 CHECK (importance_quality BETWEEN 0 AND 5),
  
  -- Status
  is_profile_complete BOOLEAN DEFAULT FALSE,
  onboarding_step INTEGER DEFAULT 0,
  
  -- Invite Code for Parent Linking
  invite_code TEXT UNIQUE,
  invite_code_expires_at TIMESTAMPTZ,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_student_profiles_user ON public."StudentProfiles"(user_id);
CREATE INDEX idx_student_profiles_invite ON public."StudentProfiles"(invite_code);

-- ============================================================
-- STEP 4: PARENT PROFILES TABLE
-- ============================================================
CREATE TABLE public."ParentProfiles" (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES public."Users"(u_id) ON DELETE CASCADE,
  
  -- Personal Info
  full_name TEXT,
  phone TEXT,
  
  -- Relationship
  relationship TEXT CHECK (relationship IN ('Father', 'Mother', 'Guardian', 'Other')),
  
  -- Location
  city TEXT,
  state TEXT,
  
  -- Status
  is_profile_complete BOOLEAN DEFAULT FALSE,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_parent_profiles_user ON public."ParentProfiles"(user_id);

-- ============================================================
-- STEP 5: COLLEGE PROFILES TABLE
-- ============================================================
CREATE TABLE public."CollegeProfiles" (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES public."Users"(u_id) ON DELETE CASCADE,
  
  -- College Info
  college_name TEXT NOT NULL,
  aishe_code TEXT,
  
  -- Contact Person
  contact_name TEXT,
  designation TEXT,
  contact_email TEXT,
  contact_phone TEXT,
  
  -- Verification
  is_verified BOOLEAN DEFAULT FALSE,
  verification_document_url TEXT,
  
  -- Status
  is_profile_complete BOOLEAN DEFAULT FALSE,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_college_profiles_user ON public."CollegeProfiles"(user_id);

-- ============================================================
-- STEP 6: PARENT-STUDENT LINKS TABLE
-- ============================================================
CREATE TABLE public."ParentStudentLinks" (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  parent_id UUID NOT NULL REFERENCES public."Users"(u_id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES public."Users"(u_id) ON DELETE CASCADE,
  
  -- Link Status
  status TEXT DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'ACCEPTED', 'REJECTED', 'REVOKED')),
  
  -- Timestamps
  requested_at TIMESTAMPTZ DEFAULT NOW(),
  responded_at TIMESTAMPTZ,
  
  -- Constraints
  UNIQUE(parent_id, student_id)
);

CREATE INDEX idx_parent_links_parent ON public."ParentStudentLinks"(parent_id);
CREATE INDEX idx_parent_links_student ON public."ParentStudentLinks"(student_id);
CREATE INDEX idx_parent_links_status ON public."ParentStudentLinks"(status);

-- ============================================================
-- STEP 7: QUIZ RESULTS TABLE
-- ============================================================
CREATE TABLE public."QuizResults" (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public."Users"(u_id) ON DELETE CASCADE,
  
  -- Aptitude Scores (7 dimensions)
  score_logical FLOAT DEFAULT 0,
  score_quant FLOAT DEFAULT 0,
  score_analytical FLOAT DEFAULT 0,
  score_verbal FLOAT DEFAULT 0,
  score_spatial FLOAT DEFAULT 0,
  score_creativity FLOAT DEFAULT 0,
  score_entrepreneurial FLOAT DEFAULT 0,
  
  -- RIASEC Scores (computed, 6 dimensions)
  riasec_realistic FLOAT DEFAULT 0,
  riasec_investigative FLOAT DEFAULT 0,
  riasec_artistic FLOAT DEFAULT 0,
  riasec_social FLOAT DEFAULT 0,
  riasec_enterprising FLOAT DEFAULT 0,
  riasec_conventional FLOAT DEFAULT 0,
  
  -- Quiz Answers (for retake/review)
  answers JSONB,
  
  -- Status
  is_complete BOOLEAN DEFAULT FALSE,
  completed_at TIMESTAMPTZ,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_quiz_results_user ON public."QuizResults"(user_id);
CREATE INDEX idx_quiz_results_complete ON public."QuizResults"(is_complete);

-- ============================================================
-- STEP 8: RECOMMENDATIONS TABLE
-- ============================================================
CREATE TABLE public."Recommendations" (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public."Users"(u_id) ON DELETE CASCADE,
  quiz_result_id UUID REFERENCES public."QuizResults"(id) ON DELETE SET NULL,
  
  -- Career Recommendations
  top_careers TEXT[],
  career_explanations JSONB,
  career_courses JSONB,
  
  -- College Recommendations
  recommended_colleges JSONB,
  college_explanations JSONB,
  
  -- RIASEC used for recommendations
  riasec_scores FLOAT[],
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_recommendations_user ON public."Recommendations"(user_id);
CREATE INDEX idx_recommendations_quiz ON public."Recommendations"(quiz_result_id);

-- ============================================================
-- STEP 9: NOTIFICATIONS TABLE
-- ============================================================
CREATE TABLE public."Notifications" (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public."Users"(u_id) ON DELETE CASCADE,
  
  -- Notification Details
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  message TEXT,
  metadata JSONB,
  
  -- Status
  read BOOLEAN DEFAULT FALSE,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_notifications_user ON public."Notifications"(user_id);
CREATE INDEX idx_notifications_read ON public."Notifications"(read);

-- ============================================================
-- DONE! 
-- Tables created: Users, StudentProfiles, ParentProfiles, 
--                 CollegeProfiles, ParentStudentLinks, 
--                 QuizResults, Recommendations, Notifications
-- 
-- Existing tables preserved: CollegeList, RIASEC, 
--                            career_to_course, course_to_college, Courses
-- ============================================================
