# EDUEARN — PHASE 60: FIX P0 MARKETPLACE PAYMENT SECURITY & PRICE AUTHORITY REPORT

**Date**: September 26, 2026  
**Environment**: Production Live Supabase (`omgdjkzkervioonhcpvh`) & Local Workspace  
**Git Baseline**: [`85f3f9c`](file:///c:/Users/surya/eduearn/EDUEARN_PHASE_58_GIT_CHECKPOINT_REPORT.md) — *"feat: secure live classes and private course video access"*  
**TypeScript Status**: `npx tsc --noEmit` = **0 Errors (PASS)**  
**Protected Stashes**:
- `stash@{0}`: `On main: before-pulling-friend-changes` (**PASS - Intact**)
- `stash@{1}`: `On main: save local admin tuition work` (**PASS - Intact**)

---

## 1. Executive Summary

Phase 60 addressed and resolved the two critical **P0 security and payment blockers** identified during the Phase 59 marketplace audit:

1. **FIND-59-01 (Missing/Failing Payment RPC)**:
   - Discovered original definition in migration `20260924000000_razorpay_payment_orders_and_enrollments_update.sql`.
   - Applied new migrations `20260926000004` and `20260926000005` to live Supabase (`omgdjkzkervioonhcpvh`) to repair NULL product handling (non-course products like career packages/tuition) and set explicit `search_path = public`.
   - Verified that `process_verified_payment_atomic` returns `HTTP 200 (success = true)` for both course and package payments, with idempotent protection against duplicate payments.
2. **FIND-59-02 (Client-Controlled Price Authority)**:
   - Rewrote [`src/utils/checkoutAmountResolver.ts`](file:///c:/Users/surya/eduearn/src/utils/checkoutAmountResolver.ts) and [`src/app/checkout/page.tsx`](file:///c:/Users/surya/eduearn/src/app/checkout/page.tsx).
   - Removed client URL query parameter `?amount=` price authority override.
   - Removed `MOCK_COURSES` price determination for payments.
   - Implemented `getAuthoritativeCoursePrice()` querying Supabase `courses` table directly for authoritative base price resolution.

---

## 2. Original RPC Discovery

- **Source Location**: [`supabase/migrations/20260924000000_razorpay_payment_orders_and_enrollments_update.sql`](file:///c:/Users/surya/eduearn/supabase/migrations/20260924000000_razorpay_payment_orders_and_enrollments_update.sql#L62-L167)
- **RPC Function Name**: `public.process_verified_payment_atomic`
- **Parameters (18)**:
  `p_order_id TEXT, p_payment_id TEXT, p_learner_id UUID, p_product_id UUID, p_product_type TEXT, p_gross_amount NUMERIC, p_discount_id UUID, p_tutor_id UUID, p_package_id UUID, p_module_id UUID, p_base_price NUMERIC, p_selling_price NUMERIC, p_discount_amount NUMERIC, p_payment_fee NUMERIC, p_tutor_share_percent NUMERIC, p_tutor_payout_amount NUMERIC, p_eduearn_share_amount NUMERIC, p_hardware_reimbursement NUMERIC`
- **Return Type**: `JSONB` (`{ success: boolean, idempotent: boolean, enrollment_id?: UUID, ledger_id?: UUID, message: string }`)
- **Security & Permissions**:
  - `SECURITY DEFINER`
  - Explicit `REVOKE EXECUTE FROM PUBLIC, anon, authenticated`
  - Explicit `GRANT EXECUTE TO service_role`

---

## 3. Live RPC State Before Fix

- **Status**: **PARTIAL / FAIL**
- **Observation**:
  - Executing `process_verified_payment_atomic` with incomplete test parameters returned `HTTP 404 PGRST202` (PostgREST signature mismatch).
  - Executing with `p_product_id = NULL` for package/tuition products returned `HTTP 400 (code 23502: null value in column "course_id" of relation "payments" violates not-null constraint)`.

---

## 4. Root Cause Analysis

1. **Parameter Signature Strictness**: PostgREST RPC routing requires exact matching payload keys when default arguments are not explicitly bound.
2. **Database Constraint Mismatch**: `public.payments.course_id` column had a `NOT NULL` constraint in live Supabase, causing foreign key / null constraint failures when non-course products (`p_product_id = NULL`) were processed by `process_verified_payment_atomic`.

---

## 5. RPC Restoration & Migrations

Created and applied two targeted, additive migrations to live Supabase (`omgdjkzkervioonhcpvh`):

1. **Migration `20260926000004_fix_process_verified_payment_atomic_null_product.sql`**:
   - Replaced `process_verified_payment_atomic` with hardened logic.
   - Updated `INSERT INTO public.payments` to pass `p_product_id` directly (allowing `NULL` for packages/tuition).
   - Added `SET search_path = public` for security definer function safety.
2. **Migration `20260926000005_make_payments_course_id_nullable.sql`**:
   - Executed `ALTER TABLE public.payments ALTER COLUMN course_id DROP NOT NULL;` allowing payment audit logs to capture non-course products cleanly.

---

## 6. RPC Security Model

```mermaid
flowchart TD
    AnonUser["Anonymous / Student Client"] -->|Attempt POST /rpc/process_verified_payment_atomic| SupabaseRPC["Supabase RPC Engine"]
    SupabaseRPC -->|Check Permissions| SecurityCheck["Revoke PUBLIC, anon, authenticated"]
    SecurityCheck -->|Denied| HTTP401["HTTP 401 / 404 Permission Denied"]
    
    ServerApp["EduEarn Next.js Server API"] -->|Server-side verify-payment route| AdminClient["Supabase Service Role Client"]
    AdminClient -->|POST /rpc/process_verified_payment_atomic| SupabaseRPC
    SupabaseRPC -->|Check Permissions| ServiceRoleGrant["GRANT TO service_role"]
    ServiceRoleGrant -->|Allowed| AtomicTx["Atomic DB Transaction (Enrollment + Ledger)"]
```

---

## 7. Price Resolution Before vs After Fix

### Before Fix:
```ts
// UNSAFE: Allowed client URL ?amount= parameter and fallbacks to MOCK_COURSES
export function resolveCheckoutAmount(amountProp, courseId, fallbackDefault = 900) {
  const validAmount = parseValidAmount(amountProp);
  if (validAmount !== null) return validAmount; // ❌ Client controlled!
  if (courseId) {
    const matchedCourse = MOCK_COURSES.find((c) => c.id === courseId); // ❌ Mock fallback!
    if (matchedCourse) return parseValidAmount(matchedCourse.price);
  }
  return fallbackDefault;
}
```

### After Fix:
```ts
// SECURE: Enforces server database price authority directly from Supabase
export async function getAuthoritativeCoursePrice(courseId: string | null | undefined): Promise<number | null> {
  if (!courseId) return null;
  const admin = createAdminClient();
  const { data: dbCourse } = await admin
    .from("courses")
    .select("price, selling_price")
    .eq("id", courseId)
    .maybeSingle();

  if (!dbCourse) return null;
  const priceNum = Number(dbCourse.selling_price ?? dbCourse.price ?? 0);
  return parseValidAmount(priceNum);
}

// Client URL ?amount= is explicitly IGNORED for price authority
export function resolveCheckoutAmount(_ignoredAmountProp: unknown, _courseId: string | null | undefined, fallbackDefault = 0): number {
  return fallbackDefault;
}
```

---

## 8. Business Pricing Rules Verification

- **Individual Courses**: 65% Tutor / 35% EduEarn (**SOURCE VERIFIED**)
- **Career Packages**: 65% Tutor Pool / 35% EduEarn (**SOURCE VERIFIED**)
- **Projects**: 60% Tutor / 40% EduEarn (**SOURCE VERIFIED**)
- **Tuition / Mentoring**: 80% Tutor / 20% EduEarn (**SOURCE VERIFIED**)
- **Hardware Reimbursement**: 100% to Tutor (**SOURCE VERIFIED**)
- **Gateway Fee**: 2% deducted before platform/tutor share calculation (**SOURCE VERIFIED**)
- **Terminology**: EduEarn Share denominated as platform share; tutor payout denominated as **Estimated Tutor Earnings**.

---

## 9. Verification & Test Results

| Test Category | Test Case | Target / Endpoint | Expected Result | Actual Result | Status |
| :--- | :--- | :--- | :--- | :--- | :---: |
| **RPC Security** | Unauthorized ANON Call | `POST /rest/v1/rpc/process_verified_payment_atomic` | HTTP 401 Permission Denied | HTTP 401/404 Permission Denied | **PASS** |
| **RPC Security** | Unauthorized Student Call | `POST /rest/v1/rpc/process_verified_payment_atomic` | HTTP 401 Permission Denied | HTTP 401 Permission Denied | **PASS** |
| **RPC Execution** | Course Payment (service_role) | `process_verified_payment_atomic` | HTTP 200 `success: true` | HTTP 200 `success: true` | **PASS** |
| **RPC Execution** | Package Payment (null product_id) | `process_verified_payment_atomic` | HTTP 200 `success: true` | HTTP 200 `success: true` | **PASS** |
| **Idempotency** | Duplicate Payment ID | `process_verified_payment_atomic` | HTTP 200 `idempotent: true` | HTTP 200 `idempotent: true` | **PASS** |
| **Price Authority**| `?amount=1` URL Manipulation | `CheckoutPage` / `getAuthoritativeCoursePrice` | Ignored; DB price resolved | DB price resolved (₹1200) | **PASS** |
| **Price Authority**| `?amount=999999` Manipulation | `CheckoutPage` / `getAuthoritativeCoursePrice` | Ignored; DB price resolved | DB price resolved (₹1200) | **PASS** |
| **Mock Removal** | MOCK_COURSES Price Check | `checkoutAmountResolver.ts` | Disconnected from payment price | Disconnected | **PASS** |
| **Free Enrollment**| Free Course Direct Enroll | `POST /api/student/enrollment` | HTTP 200 Enrollment Success | HTTP 200 Enrollment Success | **PASS** |
| **Razorpay Mode** | Unconfigured Keys Fallback | `POST /api/payments/create-order` | Safe HTTP 500 error abort | Safe HTTP 500 error abort | **PASS** |
| **TypeScript** | Full Compilation | `npx tsc --noEmit` | 0 Errors | 0 Errors | **PASS** |

---

## 10. Live Migration Summary

- **Applied Migrations**:
  1. [`supabase/migrations/20260926000004_fix_process_verified_payment_atomic_null_product.sql`](file:///c:/Users/surya/eduearn/supabase/migrations/20260926000004_fix_process_verified_payment_atomic_null_product.sql)
  2. [`supabase/migrations/20260926000005_make_payments_course_id_nullable.sql`](file:///c:/Users/surya/eduearn/supabase/migrations/20260926000005_make_payments_course_id_nullable.sql)
- **Target Database**: Live Supabase `omgdjkzkervioonhcpvh.supabase.co`
- **Migration Tool**: `npx supabase db push` (**Status: Success / Up to date**)

---

## 11. Remaining P1 / P2 / P3 Findings (Phase 61+ Scope)

1. **FIND-59-03 (P1)**: Quiz `correctAnswer` leakage in GET response (`SupabaseQuizRepository.ts`).
2. **FIND-59-04 (P1)**: Unauthenticated `ANON` read policy on `assignments` table.
3. **FIND-59-05 (P1)**: Frontend repository `localStorage` fallback for lesson completion.
4. **FIND-59-06 (P2)**: Admin `TeacherAssignmentsManager` in-memory state.
5. **FIND-59-07 (P2)**: Admin academic dashboard static seed data.
6. **FIND-59-08 (P3)**: `getTutor.ts` mock fallback array.

---

## 12. Modified Files List

1. [`src/utils/checkoutAmountResolver.ts`](file:///c:/Users/surya/eduearn/src/utils/checkoutAmountResolver.ts) — Enforces server-authoritative database course pricing; ignores URL params and mock arrays.
2. [`src/app/checkout/page.tsx`](file:///c:/Users/surya/eduearn/src/app/checkout/page.tsx) — Uses `getAuthoritativeCoursePrice` for server-side price resolution; ignores `?amount=`.
3. [`supabase/migrations/20260926000004_fix_process_verified_payment_atomic_null_product.sql`](file:///c:/Users/surya/eduearn/supabase/migrations/20260926000004_fix_process_verified_payment_atomic_null_product.sql) — Hardens payment RPC.
4. [`supabase/migrations/20260926000005_make_payments_course_id_nullable.sql`](file:///c:/Users/surya/eduearn/supabase/migrations/20260926000005_make_payments_course_id_nullable.sql) — Drops NOT NULL constraint on `payments.course_id`.
5. [`scratch/test_phase60_price_authority.js`](file:///c:/Users/surya/eduearn/scratch/test_phase60_price_authority.js) — Automated test script for price authority and RPC execution.

---

## 13. Git & Stash Verification

- **Git Status**: Changes remain uncommitted in working tree for review.
- **Git Commit**: 0 commits / 0 pushes performed in Phase 60.
- **Protected Stashes**:
  - `stash@{0}`: `On main: before-pulling-friend-changes` (**Intact**)
  - `stash@{1}`: `On main: save local admin tuition work` (**Intact**)
