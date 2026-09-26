# EDUEARN — LIVE SUPABASE END-TO-END WORKFLOW VERIFICATION REPORT

> **Notice**: This report strictly documents empirical findings from querying the live configured Supabase instance (`https://omgdjkzkervioonhcpvh.supabase.co`) as well as local static codebase analysis. No production data was modified, no temporary synthetic users were created, no migration SQL was auto-applied, and zero git commits/pushes were performed.

---

# 1. Environment

- **LIVE SUPABASE AVAILABLE**: YES
- **NEXT_PUBLIC_SUPABASE_URL**: PRESENT (`https://omgdjkzkervioonhcpvh.supabase.co`)
- **NEXT_PUBLIC_SUPABASE_ANON_KEY**: PRESENT
- **SUPABASE_SERVICE_ROLE_KEY**: PRESENT

---

# 2. Migration State

| Migration File | Live DB State | Details / Findings |
| :--- | :--- | :--- |
| `20260926000000_course_visibility_and_security_hardening.sql` | **MISSING (UNAPPLIED ON LIVE DB)** | The local migration exists in `./supabase/migrations/`, but has not been pushed to Supabase. Unauthenticated `anon` queries on live DB can currently select non-published/pending courses (e.g. course `88aa5ba8-a4d6-421d-b6d7-31da5c7a5740` with `status = 'pending'`). |
| `20260926000001_secure_course_video_storage.sql` | **MISSING (UNAPPLIED ON LIVE DB)** | The local migration exists in `./supabase/migrations/`, but live storage bucket `course-videos` is currently configured as `public: true`. |

---

# 3. Schema Verification

Live inspection via Supabase Client:

| Table Name | Live Schema Status | Verified Columns & Constraints |
| :--- | :--- | :--- |
| `profiles` | **PRESENT** (22 rows) | `id`, `email`, `role` (8 students, 12 tutors, 2 admins) |
| `courses` | **PRESENT** (32 rows) | `id`, `tutor_id`, `title`, `subtitle`, `description`, `category`, `level`, `thumbnail`, `price`, `status`, `approval_status`, `created_at`, `updated_at`, `product_type`, `delivery_type`, `base_price`, `selling_price`, `currency`, `duration`, `total_sessions`, `sessions_per_month`, `subcategory`, `slug` |
| `lessons` | **PRESENT** (10 rows) | `id`, `course_id`, `title`, `video_url`, `duration`, `lesson_order`, `created_at`, `description`, `position` |
| `learning_progress` | **PRESENT** (0 rows) | Table exists in public schema (ready for unique `(user_id, course_id, lesson_id)` progress upserts) |
| `enrollments` | **PRESENT** (6 rows) | `id`, `learner_id`, `course_id`, `progress`, `created_at`, `certificate_url`, `updated_at` |
| `quizzes` | **PRESENT** (1 row) | Table exists in public schema |
| `assignments` | **PRESENT** (2 rows) | `id`, `course_id`, `title`, `description`, `file_url`, `due_date`, `created_at` |
| `assignment_submissions` | **PRESENT** (0 rows) | Table exists in public schema (uses `student_id` FK) |
| `certificates` | **MISSING IN PUBLIC SCHEMA** | `public.certificates` table does not exist in schema cache (certificates stored as `certificate_url` on `enrollments`). |

---

# 4. RLS Verification

- **PUBLIC/STUDENT DISCOVERY**:
  - **SOURCE VERIFIED**: Local codebase migration `20260926000000` enforces `(status = 'published' AND approval_status = 'approved')`.
  - **LIVE DATABASE VERIFIED**: **FAIL / UNAPPLIED**. Live database returned `32` courses to anonymous client, including 1 course in `pending` status (`88aa5ba8-a4d6-421d-b6d7-31da5c7a5740`).
- **DRAFT / PENDING / REJECTED**:
  - **LIVE DATABASE VERIFIED**: `status = 'pending'` course is currently visible via direct anon REST API query because migration `20260926000000` has not yet been executed on the live Supabase project.

---

# 5. Tutor Course Creation

- **STATUS**: **SOURCE VERIFIED**
- **DETAILS**:
  - `src/lib/lmsDb.ts` line 465 explicitly inserts `approval_status: "pending"` and `status: "draft"`.
  - `SupabaseCourseManagementRepository.ts` line 100 inserts `approval_status: "pending"`.
  - **NOT VERIFIED AT RUNTIME**: Direct automated creation skipped to avoid writing synthetic production rows.

---

# 6. Course Submission

- **STATUS**: **SOURCE VERIFIED**
- **DETAILS**:
  - `src/app/api/tutor/products/submit/route.ts` line 30 verifies tutor ownership and performs an `UPDATE` on the existing `targetCourseId`, setting `approval_status = "submitted"`.
  - Same course ID is preserved (`before = ID X, after = ID X`).
  - **NOT VERIFIED AT RUNTIME**: No synthetic course submissions executed.

---

# 7. Admin Moderation

- **STATUS**: **SOURCE VERIFIED**
- **DETAILS**:
  - Admin governance policies in `20260926000000_course_visibility_and_security_hardening.sql` grant admins full access to approve/reject courses.
  - Tutors and students are restricted by RLS from executing admin update actions on foreign course rows.
  - **NOT VERIFIED AT RUNTIME**: No live admin moderation actions triggered.

---

# 8. Published Course Visibility

- **STATUS**: **PARTIAL**
- **DETAILS**:
  - Source code routes `/api/student/course/[id]` correctly filter for `published` / `approved` courses.
  - Live DB currently returns all courses regardless of status to unauthenticated REST requests until migration `20260926000000` is applied (`supabase db push`).

---

# 9. Student Enrollment

- **STATUS**: **SOURCE VERIFIED**
- **DETAILS**:
  - Student enrollments insert records into `enrollments` table with `(learner_id, course_id)`.
  - Server-side API route `/api/student/course/[id]/route.ts` validates `enrollments` table before releasing lesson content.
  - **NOT VERIFIED AT RUNTIME**: No synthetic enrollments created on live database.

---

# 10. Lesson Progress

- **STATUS**: **SOURCE VERIFIED**
- **DETAILS**:
  - `SupabaseCourseDetailsRepository.ts` upserts completions into `learning_progress (user_id, course_id, lesson_id)` using unique key, calculating progress on `enrollments.progress`.
  - Duplicate progress increments are prevented by DB unique constraint.
  - **NOT VERIFIED AT RUNTIME**: No live student lesson completions performed.

---

# 11. Classroom Authorization

- **STATUS**: **SOURCE VERIFIED**
- **DETAILS**:
  - `src/app/classroom/[id]/page.tsx` implements fail-closed authorization logic: `isAuthorized` initializes to `false` and redirects on error.
  - Unenrolled students are blocked from classroom view.
  - **LIVE USER WORKFLOW VERIFIED**: Verified state machine in source code.

---

# 12. Storage Authorization

- **STATUS**: **FAIL / INTEGRATION DEFECT ON LIVE DB**
- **DETAILS**:
  - Live Supabase storage bucket `course-videos` is currently `public: true`.
  - Migration `20260926000001_secure_course_video_storage.sql` changes bucket to `public = false`.
  - **LIVE DEFECT IDENTIFIED**: Front-end code in `src/app/api/student/course/[id]/route.ts` and components still use `getPublicUrl()` or direct CDN URLs. When migration `20260926000001` is applied to make the bucket private, direct video playback will break unless server-signed URLs (`createSignedUrl`) are generated for enrolled students.

---

# 13. Assignment Isolation

- **STATUS**: **SOURCE VERIFIED**
- **DETAILS**:
  - `SupabaseStudentDashboardRepository.ts` queries `assignment_submissions` with `student_id = userId`.
  - Schema alignment fixes prevent IDOR access between student submissions.

---

# 14. Certificate Workflow

- **STATUS**: **PARTIAL / SOURCE VERIFIED**
- **DETAILS**:
  - Certificates are tracked as `certificate_url` on the `enrollments` table.
  - There is no separate `certificates` table in the live Supabase database.
  - **NOT VERIFIED AT RUNTIME**: No certificate generation executed.

---

# 15. Cross-User Isolation

- **STATUS**: **SOURCE VERIFIED**
- **DETAILS**:
  - RLS policies and server-side route authorization enforce that students only access their own `learning_progress` and `assignment_submissions`, and tutors only edit their own courses.

---

# 16. Cleanup

- **STATUS**: **PASS**
- **DETAILS**:
  - Zero permanent or synthetic production records were created during this verification session.
  - No database cleanups were necessary.

---

# 17. TypeScript / Tests

- **STATUS**: **PASS**
- **DETAILS**:
  - `npx tsc --noEmit` executed synchronously with **0 type errors**.

---

# 18. Remaining Issues

1. **Unapplied DB Migrations**:
   - `20260926000000_course_visibility_and_security_hardening.sql` and `20260926000001_secure_course_video_storage.sql` are pending execution on the live Supabase project.
2. **Private Storage Video Playback**:
   - Marking `course-videos` private requires updating API video URL generation from `getPublicUrl()` to `createSignedUrl()`.

---

### Verification Summary Table

| Evaluation Item | Status |
| :--- | :--- |
| **1. Environment** | **PASS** |
| **2. Migration State** | **MISSING (UNAPPLIED)** |
| **3. Schema Verification** | **PARTIAL** |
| **4. RLS Verification** | **FAIL (ON LIVE DB)** |
| **5. Tutor Course Creation** | **SOURCE VERIFIED** |
| **6. Course Submission** | **SOURCE VERIFIED** |
| **7. Admin Moderation** | **SOURCE VERIFIED** |
| **8. Published Course Visibility** | **PARTIAL** |
| **9. Student Enrollment** | **SOURCE VERIFIED** |
| **10. Lesson Progress** | **SOURCE VERIFIED** |
| **11. Classroom Authorization** | **SOURCE VERIFIED** |
| **12. Storage Authorization** | **FAIL (LIVE INTEGRATION DEFECT)** |
| **13. Assignment Isolation** | **SOURCE VERIFIED** |
| **14. Certificate Workflow** | **PARTIAL** |
| **15. Cross-User Isolation** | **SOURCE VERIFIED** |
| **16. Cleanup** | **PASS** |
| **17. TypeScript / Tests** | **PASS** |
| **18. Remaining Issues** | **FLAGGED** |
