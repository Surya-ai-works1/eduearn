# EduEarn Enterprise SaaS Platform - Deployment Guide

This guide details steps required to build and deploy the EduEarn Next.js application into production.

---

## 1. Environment Configurations Setup

1. Copy `.env.example` template into your local deployment environment:
   ```bash
   cp .env.example .env.production
   ```
2. Furnish production secrets for **Supabase**, **Stripe**, **Razorpay**, and **Brevo SMTP**.

---

## 2. Command Line Operations

- **Build Output Bundles**:
  ```bash
  npm run build
  ```
- **Local Verification Audit**:
  ```bash
  npm run verify
  ```
- **Launch Production server**:
  ```bash
  npm start
  ```

---

## 3. CDN & Edge Routing Rules

Ensure your hosting provider (Vercel, AWS Amplify, Cloudflare Pages) exposes Edge Routing support.
- **Middleware Entrypoint**: Vercel/Next.js will automatically bundle `src/proxy.ts` to manage Edge Middlewares.
- **Cookies Sync**: Secure cookie policies must be active to allow middleware authentication checks.
