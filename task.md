# Onboarding, RC1 Stability, Sparky AI, & Supabase Migration Checklist

## Authentication & Email Verification Flow
- `[/]` Read email dynamically from URL query parameter or user state in `verify-email/page.tsx` to remove the `"name@college.edu"` placeholder.
- `[/]` Replace mock resend verification with a live action calling `supabase.auth.resend`.
- `[/]` Add verification status checker (`I've Verified My Email`) calling `supabase.auth.getUser()`.
- `[/]` Implement unverified email check and redirect guard inside middleware `src/proxy.ts`.
- `[/]` Implement dynamic confirmed email auto-bypass logic inside middleware and page mount hooks.
- `[/]` Update redirects in `signUp` and `resend` to point to `/complete-profile` instead of invalid `/verify-email/success` path.
- `[/]` Run `npm run lint` -> 0 errors.
- `[/]` Run `npx tsc --noEmit` -> 0 errors.
- `[/]` Run `npm run build` -> build completed successfully.

## Hostname, CORS, & CSRF Alias Resolution
- `[/]` Update CSRF verification inside `src/proxy.ts` to respect client's `x-forwarded-host` header.
- `[/]` Configure CSRF matcher to bypass mismatches between Vercel deployments and alias domains (`.vercel.app` checks).
- `[/]` Update Express backend CORS origin setup inside `backend/index.js` to dynamically allow any `.vercel.app` subdomains.
- `[/]` Run `npm run lint` -> 0 errors.
- `[/]` Run `npx tsc --noEmit` -> 0 errors.
- `[/]` Run `npm run build` -> build completed successfully.

## Git Configuration & Commit Author Fixes
- `[x]` Force push the amended commit to origin main branch: `git push --force`.
- `[x]` Verify amended author and committer headers: `git log -1 --pretty=full`.

## Onboarding Profile Diagnostics & Debugging
- `[x]` Fix TypeErrors on authData check by adding safe optional chaining `!authData?.user`.
- `[x]` Wrap entire `completeProfile` store action in global try/catch block to guarantee Promise resolution.
- `[x]` Make avatar file upload non-blocking to prevent bucket permission errors from aborting onboarding.
- `[x]` Reset bypass cookies and mock state values unconditionally inside `logout()`.
- `[x]` Add tracing `console.log("handleSaveProfile() started")` and step values dump in `page.tsx`.
- `[x]` Add tracing `console.log("completeProfile() started")` and log before/after every async point in `useAuth.ts`.
- `[x]` Add unconditional console logging inside `completeProfile()` for storage check, upload payload, auth update, and upsert payload.
- `[x]` Capture and log database upsert constraints (`dbErr.code`, `dbErr.details`, `dbErr.hint`).
- `[x]` Extract and return verbose error details on database save failure to surface inside complete-profile toasts.
- `[x]` Verify that profiles table contains matching columns (`id`, `role`, `full_name`, `display_name`, `bio`, `avatar_url`, `country`, `language`, `skills`, `interests`, `email`, `updated_at`).
- `[x]` Run `npm run lint` -> 0 errors.
- `[x]` Run `npx tsc --noEmit` -> 0 errors.
- `[x]` Run `npm run build` -> build completed successfully.

## Supabase Database Migration
- `[x]` Update environment configuration keys in `.env.local` to point to the new project database reference.
- `[x]` Dynamically verify and initialize the required public storage buckets: `avatars`, `course-thumbnails`, `course-resources`, `assignments`, `certificates`, `community`.
- `[x]` Create a single unified setup SQL migration script `setup_database.sql` to initialize all DDL schemas, triggers, and master seed categories.

## Sparky AI Restoration
- `[x]` Allow Global Sparky Assistant on Landing page `/` and Admin dashboard `/admin` via blacklist updates.
- `[x]` Implement dynamic, context-aware smartGreetings for Tutor, Admin, Category, Student, and default pages.
- `[x]` Configure quick actions chips for Tutors, Admins, Students, and Categories.
- `[x]` Add a retry resubmission button for failed messages.
- `[x]` Lazy load the global assistant component using Next.js `dynamic()` imports to save bundle size and prevent SSR hydration warnings.

## Phase 4A — Onboarding Critical Bug Fixes
- `[x]` Update `completeProfile` signature to return detailed `{ success, error }` results.
- `[x]` Upsert complete profile details (display name, email, bio, role, interests, skills, etc.) correctly into `public.profiles`.
- `[x]` Implement development-mode Supabase and Storage error logging.
- `[x]` Surface exact backend errors in user toasts instead of generic messages.
- `[x]` Implement immediate profile avatar upload with validations (JPG, PNG, WEBP; <2MB) and loaders.
- `[x]` Verify Supabase Storage bucket configurations and paths dynamically.

## Phase 4B — Onboarding UX Improvements
- `[x]` Limit bio to 300 characters, add character counter, and disable "Continue" until bio is at least 10 characters.
- `[x]` Render selected role's benefits/permissions dynamically in Step 3.
- `[x]` Load interests dynamically from Admin, build live filter search, and require at least 3 selections.

## Phase RC1 — Final Stability Audit
- `[x]` Fix all 38 React Hook and image optimization warnings in frontend pages.
- `[x]` Fix all 11 ESM export and formatting warnings in backend files.
- `[x]` Validate keyboard accessibility and ARIA labels.
- `[x]` Verify layout responsiveness and clean grid bounds.
- `[x]` Run `npm run lint` -> 0 errors, 0 warnings.
- `[x]` Run `npx tsc --noEmit` -> 0 errors.
- `[x]` Run `npm run build` -> build completed successfully.
