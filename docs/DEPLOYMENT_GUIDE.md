# 🚀 EduEarn - Deployment Guide

This guide details the steps to deploy the EduEarn platform to production hosting environments.

---

## 💻 Vercel Deployment

EduEarn is fully optimized for deployment on the **Vercel Platform**.

### Steps to Deploy:
1. **Import the Project**: Link your GitHub repository to your Vercel account.
2. **Configure Build Settings**:
   - **Framework Preset**: Next.js
   - **Build Command**: `npm run build`
   - **Output Directory**: `.next`
3. **Configure Environment Variables**:
   Add the production credentials in the project settings panel:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `GEMINI_API_KEY`
   - `NEXT_PUBLIC_APP_URL` (Use your production domain, e.g. `https://eduearn.com`)
4. **Deploy**: Click deploy. Vercel will build the optimized production bundles and host them on edge nodes.

---

## 🗄️ Supabase Production Configuration

To transition the backend from Offline Mock mode to a live database, follow these steps inside your Supabase project dashboard:

### 1. Database Schema
Execute the queries outlined in `docs/_DATABASE_SCHEMA.md` to create the tables:
- `users`, `learners`, `tutors`, `courses`, `lessons`, `enrollments`, `live_classes`, `payments`, `ai_assessments`.

### 2. Row Level Security (RLS)
Enable RLS on all tables and configure policies to protect user details:
- **Profiles / Users**: Only allow users to modify their own profiles.
- **Tutor Earnings & Withdrawals**: Only allow tutors to view their own balances.
- **Enrollments**: Ensure only enrolled learners can view paid course lessons.

### 3. Authentication Redirects
In your Supabase Auth settings, configure the allowed redirect URLs:
- Add `https://your-domain.com/auth/callback` to the redirect whitelist.
- This ensures OAuth and email confirmation flows complete securely.

---

## 🛡️ Production Security Checklist
- [ ] Enforce HTTPS on the domain redirect.
- [ ] Ensure `vercel.json` and `next.config.ts` headers are active (disallow Clickjacking, nosniff, etc.).
- [ ] Turn on Row Level Security policies on all Supabase tables.
- [ ] Verify that all Gemini and Razorpay production keys are encrypted and stored in environment panels (never committed in codebase).
- [ ] Monitor rate-limit hits via CDN edge logs.
