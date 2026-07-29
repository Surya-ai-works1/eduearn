-- Supabase Database Schema for EduEarn Assignment Management System
-- Enable UUID extension if not enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Assignments Table
CREATE TABLE IF NOT EXISTS assignments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    course_id TEXT NOT NULL,
    course_title TEXT NOT NULL,
    batch TEXT NOT NULL DEFAULT 'Batch A',
    title TEXT NOT NULL CHECK (char_length(title) > 0),
    description TEXT,
    max_marks INTEGER NOT NULL CHECK (max_marks >= 0),
    difficulty TEXT NOT NULL CHECK (difficulty IN ('Easy', 'Medium', 'Hard')),
    submission_types TEXT[] NOT NULL DEFAULT '{PDF}',
    attachment_url TEXT,
    due_date TIMESTAMP WITH TIME ZONE NOT NULL,
    allow_late_submission BOOLEAN NOT NULL DEFAULT FALSE,
    late_penalty INTEGER NOT NULL DEFAULT 0 CHECK (late_penalty >= 0 AND late_penalty <= 100),
    status TEXT NOT NULL CHECK (status IN ('published', 'draft', 'closed')) DEFAULT 'published',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 2. Assignment Submissions Table
CREATE TABLE IF NOT EXISTS assignment_submissions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    assignment_id UUID NOT NULL REFERENCES assignments(id) ON DELETE CASCADE,
    student_id TEXT NOT NULL,
    student_name TEXT NOT NULL,
    student_email TEXT NOT NULL,
    submitted_at TIMESTAMP WITH TIME ZONE,
    file_url TEXT,
    file_type TEXT,
    is_late BOOLEAN NOT NULL DEFAULT FALSE,
    status TEXT NOT NULL CHECK (status IN ('Submitted', 'Late Submission', 'Not Submitted', 'Graded', 'Review Pending')) DEFAULT 'Not Submitted',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 3. Assignment Grades Table
CREATE TABLE IF NOT EXISTS assignment_grades (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    submission_id UUID NOT NULL REFERENCES assignment_submissions(id) ON DELETE CASCADE,
    marks NUMERIC(5, 2) NOT NULL CHECK (marks >= 0),
    feedback TEXT,
    private_notes TEXT,
    status TEXT NOT NULL CHECK (status IN ('draft', 'published')) DEFAULT 'published',
    graded_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Indices for query optimization
CREATE INDEX IF NOT EXISTS idx_assignments_course ON assignments(course_id);
CREATE INDEX IF NOT EXISTS idx_submissions_assignment ON assignment_submissions(assignment_id);
CREATE INDEX IF NOT EXISTS idx_grades_submission ON assignment_grades(submission_id);
