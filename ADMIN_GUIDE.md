# EduEarn - Enterprise Administration Guide

Operational manual for SaaS administrators managing organizations, roles, and settings.

---

## 1. Feature Flags Controls

Admin Console -> Settings -> Releases & History
- Toggle critical feature flags dynamically:
  - **Gemini AI assistant**: Toggles co-pilot workflow builders.
  - **Stripe/Razorpay Payments**: Activates checkout processes.
  - **PDF Certificate issuance**: Enables verification certificates generator.

---

## 2. Managing Tenant Organizations

Admin Console -> Settings -> Organizations tab
- **Create Org**: Add custom sub-domain paths and choose tenant subscription plan.
- **Suspend Org**: Terminate tenant dashboard access instantly under emergency locks.

---

## 3. Auditing Security Integrity

Admin Console -> Settings -> Security Audit Center
- Reviews checks for expired user sessions, duplicate user permissions, orphaned profiles, and weak password policies.
- Severity levels range from **CRITICAL** (e.g. key credentials missing) to **LOW**.
