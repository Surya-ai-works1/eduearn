# EduEarn Architecture Consolidation & Workflow Integrity Report — Baseline (Phase 1)

Generated on: 2026-09-26
Environment: Next.js 15 App Router + Supabase Managed PostgreSQL

---

## 1. Executive Summary & Baseline Architecture

### Current Architectural State
The EduEarn codebase contains multiple competing implementations:
1. **Server API + Service + Repository Architecture**: `src/app/api/tutor/courses`, `courseManagementService.ts`, `SupabaseCourseManagementRepository.ts`.
2. **Direct Browser Supabase / lmsDb Mutations**: `src/lib/lmsDb.ts` directly called by client pages (`/tutor/studio/create/page.tsx`, `/tutor/studio/manage/[id]/page.tsx`).
3. **Mock Data / Development Fallbacks**: `src/constants/mockData.ts`, `src/lib/repositories/*/Mock*Repository.ts`, `src/app/student/courses/[id]/learn/page.tsx`.
4. **Legacy Express Backend**: `backend/` directory with Express routes and MongoDB models.
5. **In-Memory Admin Store**: `AcademicOperationsStore.ts` storing static seed data for admin tabs.

### Planned Target Architecture
A unified, secure, server-authoritative production workflow:
\`\`\`
UI (React Component)
  ──> Server API / Server Action (/api/tutor/courses, /api/student/...)
    ──> Authentication (Supabase SSR Auth)
      ──> Authorization (RBAC / Ownership Checks)
        ──> Service Layer (courseManagementService, etc.)
          ──> Repository Layer (SupabaseCourseManagementRepository, etc.)
            ──> Supabase Managed PostgreSQL Database & RLS
              ──> JSON Response
                ──> UI Update
\`\`\`

---

## 2. Discovered Workflow & Integrity Deficiencies

| Defect ID | Category | Discovered Issue | Files Involved | Target Fix |
| :--- | :--- | :--- | :--- | :--- |
| **DEF-01** | Course Lifecycle | `lmsDb.createCourse()` sets `approval_status: "approved"` automatically during course creation. | `src/lib/lmsDb.ts`, `SupabaseCourseManagementRepository.ts` | Force initial status to `draft` and `approval_status = "pending"` / unsubmitted. |
| **DEF-02** | Course Submission | `/api/tutor/products/submit` performs an `INSERT` creating a new course instead of updating the existing course draft. | `src/app/api/tutor/products/submit/route.ts` | Refactor endpoint to require existing `courseId`, verify tutor ownership, and update `approval_status = "submitted"`. |
| **DEF-03** | Course Visibility RLS | Public `SELECT` policy on `courses` table is `USING (true)`, exposing draft/pending/rejected courses to public reads. | `supabase/migrations/20260708000000_lms_tutor_studio_schema.sql` | Create new migration (`20260926000000`) restricting public SELECT to `status = 'published' AND approval_status = 'approved'`. |
| **DEF-04** | API Authorization | `/api/student/course/[id]` returns full course details without verifying active student enrollment or course publication state. | `src/app/api/student/course/[id]/route.ts` | Enforce server-side enrollment check before returning protected course/lesson content. |
| **DEF-05** | Lesson Progress | `markLessonComplete` increments progress by adding `step` size (`currentProgress + step`) without tracking completed lesson IDs in database. | `SupabaseCourseDetailsRepository.ts` | Record completions in `public.learning_progress` (`user_id`, `course_id`, `lesson_id`) and calculate authoritative progress percentage. |
| **DEF-06** | Fail-Closed Security | `src/app/classroom/[id]/page.tsx` sets `setIsAuthorized(true)` in `catch` block on authorization error. | `src/app/classroom/[id]/page.tsx` | Enforce fail-closed security (`setIsAuthorized(false)` and redirect) on any authorization error. |
| **DEF-07** | Video Bucket RLS | `course-videos` storage bucket has `public = true` and `Allow public read access to course-videos` policy. | `supabase/migrations/20260708000004_lms_storage_buckets.sql` | Create new migration (`20260926000001`) setting `public = false` and restricting access to authorized enrolled students/tutors/admins. |
| **DEF-08** | Duplicate Classroom | `/student/courses/[id]/learn` uses `MOCK_COURSES` and hardcoded state, competing with DB-backed `/student/course/[courseId]/lesson/[lessonId]`. | `src/app/student/courses/[id]/learn/page.tsx` | Consolidate and redirect `/student/courses/[id]/learn` to canonical DB-backed classroom workspace. |
| **DEF-09** | Assignment Query Bug | `SupabaseStudentDashboardRepository.ts` queries `assignments` with `.eq('learner_id', userId)`, but column does not exist on `assignments`. | `SupabaseStudentDashboardRepository.ts` | Query student submissions from `assignment_submissions` table via `student_id`. |

---

## 3. Planned Files for Migration & Consolidation

### Files to Modify
- `src/lib/lmsDb.ts`: Remove auto-approval in `createCourse()`.
- `src/lib/repositories/courseManagement/SupabaseCourseManagementRepository.ts`: Enforce initial `pending`/`draft` status.
- `src/app/api/tutor/courses/route.ts`: Single canonical course creation endpoint.
- `src/app/api/tutor/products/submit/route.ts`: Update existing course draft instead of inserting duplicates.
- `src/app/api/student/course/[id]/route.ts`: Add enrollment & publication server authorization checks.
- `src/app/api/student/course/[id]/complete/route.ts` & `SupabaseCourseDetailsRepository.ts`: Integrate `learning_progress` database tracking.
- `src/app/classroom/[id]/page.tsx`: Enforce fail-closed security in catch block.
- `src/app/student/courses/[id]/learn/page.tsx`: Redirect/consolidate to canonical classroom.
- `src/lib/repositories/studentDashboard/SupabaseStudentDashboardRepository.ts`: Fix assignment query schema mismatch.

### New Migrations to Create
- `supabase/migrations/20260926000000_course_visibility_and_security_hardening.sql`: Harden public RLS policies on `courses` table.
- `supabase/migrations/20260926000001_secure_course_video_storage.sql`: Set `course-videos` bucket to `public = false` and enforce RLS signed URL access.

---

## 4. Protected Git Stash Verification

- `stash@{0}`: `On main: before-pulling-friend-changes` — **PRESERVED & UNTOUCHED**
- `stash@{1}`: `On main: save local admin tuition work` — **PRESERVED & UNTOUCHED**
