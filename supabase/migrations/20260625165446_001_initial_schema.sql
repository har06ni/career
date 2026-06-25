-- Users table
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  role TEXT NOT NULL,
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Student profiles table
CREATE TABLE student_profiles (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id),
  college TEXT,
  degree TEXT,
  graduation_year INTEGER,
  skills TEXT NOT NULL DEFAULT '[]',
  bio TEXT,
  resume_url TEXT,
  projects TEXT NOT NULL DEFAULT '[]',
  certifications TEXT NOT NULL DEFAULT '[]',
  experience TEXT NOT NULL DEFAULT '[]',
  linkedin_url TEXT,
  github_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Company profiles table
CREATE TABLE company_profiles (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id),
  company_name TEXT NOT NULL,
  industry TEXT,
  website TEXT,
  description TEXT,
  logo_url TEXT,
  location TEXT,
  size TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Mentor profiles table
CREATE TABLE mentor_profiles (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id),
  company TEXT,
  title TEXT,
  experience INTEGER,
  skills TEXT NOT NULL DEFAULT '[]',
  bio TEXT,
  rating TEXT,
  sessions_completed INTEGER NOT NULL DEFAULT 0,
  price_per_session TEXT,
  availability TEXT NOT NULL DEFAULT '[]',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Jobs table
CREATE TABLE jobs (
  id SERIAL PRIMARY KEY,
  company_id INTEGER NOT NULL REFERENCES company_profiles(id),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  skills TEXT NOT NULL DEFAULT '[]',
  salary TEXT,
  location TEXT,
  experience_level TEXT,
  job_type TEXT,
  is_remote BOOLEAN NOT NULL DEFAULT FALSE,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Applications table
CREATE TABLE applications (
  id SERIAL PRIMARY KEY,
  job_id INTEGER NOT NULL REFERENCES jobs(id),
  student_id INTEGER NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  cover_letter TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Sessions table (mentorship sessions)
CREATE TABLE sessions (
  id SERIAL PRIMARY KEY,
  student_id INTEGER NOT NULL,
  mentor_id INTEGER NOT NULL,
  scheduled_at TIMESTAMPTZ NOT NULL,
  duration INTEGER NOT NULL DEFAULT 60,
  topic TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  price TEXT,
  meeting_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Courses table
CREATE TABLE courses (
  id SERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT NOT NULL,
  instructor TEXT,
  thumbnail_url TEXT,
  duration TEXT,
  level TEXT,
  rating TEXT,
  enrollment_count INTEGER NOT NULL DEFAULT 0,
  skills TEXT NOT NULL DEFAULT '[]',
  is_free BOOLEAN NOT NULL DEFAULT TRUE,
  price TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Course enrollments table
CREATE TABLE course_enrollments (
  id SERIAL PRIMARY KEY,
  course_id INTEGER NOT NULL REFERENCES courses(id),
  student_id INTEGER NOT NULL,
  progress INTEGER NOT NULL DEFAULT 0,
  completed BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- AI reports table
CREATE TABLE ai_reports (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL,
  career_score INTEGER NOT NULL DEFAULT 0,
  recommendations TEXT NOT NULL DEFAULT '{}',
  skill_gap TEXT NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE student_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE company_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE mentor_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE course_enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_reports ENABLE ROW LEVEL SECURITY;

-- RLS policies for users (public read for profile viewing, own write)
CREATE POLICY "users_select_all" ON users FOR SELECT TO authenticated USING (true);
CREATE POLICY "users_insert_own" ON users FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "users_update_own" ON users FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

-- RLS policies for student_profiles
CREATE POLICY "student_profiles_select_all" ON student_profiles FOR SELECT TO authenticated USING (true);
CREATE POLICY "student_profiles_insert_own" ON student_profiles FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "student_profiles_update_own" ON student_profiles FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

-- RLS policies for company_profiles
CREATE POLICY "company_profiles_select_all" ON company_profiles FOR SELECT TO authenticated USING (true);
CREATE POLICY "company_profiles_insert_own" ON company_profiles FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "company_profiles_update_own" ON company_profiles FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

-- RLS policies for mentor_profiles
CREATE POLICY "mentor_profiles_select_all" ON mentor_profiles FOR SELECT TO authenticated USING (true);
CREATE POLICY "mentor_profiles_insert_own" ON mentor_profiles FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "mentor_profiles_update_own" ON mentor_profiles FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

-- RLS policies for jobs
CREATE POLICY "jobs_select_all" ON jobs FOR SELECT TO authenticated USING (true);
CREATE POLICY "jobs_insert_company" ON jobs FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "jobs_update_company" ON jobs FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "jobs_delete_company" ON jobs FOR DELETE TO authenticated USING (true);

-- RLS policies for applications
CREATE POLICY "applications_select_own" ON applications FOR SELECT TO authenticated USING (true);
CREATE POLICY "applications_insert_student" ON applications FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "applications_update_own" ON applications FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

-- RLS policies for sessions
CREATE POLICY "sessions_select_own" ON sessions FOR SELECT TO authenticated USING (true);
CREATE POLICY "sessions_insert_student" ON sessions FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "sessions_update_own" ON sessions FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

-- RLS policies for courses (public read, authenticated write)
CREATE POLICY "courses_select_all" ON courses FOR SELECT TO authenticated USING (true);
CREATE POLICY "courses_insert_admin" ON courses FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "courses_update_admin" ON courses FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

-- RLS policies for course_enrollments
CREATE POLICY "enrollments_select_own" ON course_enrollments FOR SELECT TO authenticated USING (true);
CREATE POLICY "enrollments_insert_student" ON course_enrollments FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "enrollments_update_own" ON course_enrollments FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

-- RLS policies for ai_reports
CREATE POLICY "ai_reports_select_own" ON ai_reports FOR SELECT TO authenticated USING (true);
CREATE POLICY "ai_reports_insert_own" ON ai_reports FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "ai_reports_update_own" ON ai_reports FOR UPDATE TO authenticated USING (true) WITH CHECK (true);