# 🧠 EduEarn - Master Development Prompt

# Purpose

This document is the permanent instruction manual for every AI assistant, developer, or automation tool working on EduEarn.

Before writing, modifying, or generating any code, this document and all files inside the `/docs` folder must be read and followed.

These documents define the product vision, architecture, business logic, design language, and development standards.

Do not ignore or overwrite these guidelines.

---

# Read These Documents First

Always read the following documentation before implementing any feature:

1. 01_PROJECT_VISION.md
2. 02_BRANDING_AND_DESIGN_SYSTEM.md
3. 03_TECH_STACK_AND_ARCHITECTURE.md
4. 04_FEATURES_AND_MODULES.md
5. 05_USER_ROLES_AND_PERMISSIONS.md
6. 06_DATABASE_SCHEMA.md
7. 07_AI_FEATURES.md
8. 08_BUSINESS_RULES.md
9. 09_DEVELOPMENT_ROADMAP.md
10. 10_UI_UX_GUIDELINES.md

These files are the single source of truth.

Never contradict them.

---

# Product Identity

Project Name

EduEarn

Tagline

Learn.

Teach.

Earn.

Mission

Create India's most trusted AI-powered learning marketplace where anyone can learn and students & young professionals can teach and earn.

---

# Core Philosophy

Anyone can learn.

Students and young professionals (16–24 during initial launch) can become AI-verified tutors.

Education should create opportunities.

Knowledge should generate income.

The platform should promote peer learning, community growth, and lifelong education.

---

# Development Principles

Always build production-ready code.

Never build demo-quality code.

Think like a Senior Software Engineer and Product Architect.

Prioritize scalability, maintainability, accessibility, security, and performance.

Every feature must be reusable.

Avoid duplicated logic.

Never hardcode values.

Write modular code.

Keep the project clean and organized.

---

# UI/UX Principles

Follow the Branding & Design System.

Follow the UI/UX Guidelines.

Maintain visual consistency across the entire application.

The experience should feel like a funded SaaS startup.

Take inspiration from:

* Stripe
* Linear
* Apple
* Framer
* Notion
* Coursera

Do not copy Udemy or Edureka.

---

# Technology Stack

Frontend

* Next.js 15
* TypeScript
* Tailwind CSS v4
* shadcn/ui
* Framer Motion
* Lucide React

Backend

* Supabase
* PostgreSQL

Authentication

* Supabase Auth

Storage

* Supabase Storage

State Management

* Zustand

Server State

* TanStack Query

Validation

* React Hook Form
* Zod

Charts

* Recharts

Deployment

* Vercel

AI

* Google Gemini
* OpenAI (Optional)

Payments

* Razorpay

Live Classes

* Agora

Do not replace these technologies unless explicitly instructed.

---

# Folder Structure

Follow a feature-based architecture.

Keep components reusable.

Separate UI, business logic, API services, hooks, and utilities.

Avoid monolithic files.

---

# Coding Standards

Use TypeScript everywhere.

Prefer Server Components where appropriate.

Keep Client Components minimal.

Use descriptive variable names.

Write clean, readable code.

Use ESLint and Prettier conventions.

No unused imports.

No dead code.

No console.log in production.

No magic numbers.

No duplicated styles.

---

# UI Components

Build reusable components only.

Every component must support:

* Responsive layouts
* Accessibility
* Dark mode (where applicable)
* Loading states
* Empty states
* Error states

---

# Security

Implement secure authentication.

Protect routes.

Use Row Level Security.

Validate all inputs.

Never expose secrets.

Store sensitive values in environment variables.

Follow least-privilege access.

---

# Performance

Optimize images.

Lazy load heavy components.

Use code splitting.

Minimize bundle size.

Avoid unnecessary re-renders.

Maintain excellent Core Web Vitals.

---

# AI Features

AI should assist—not replace—human learning.

Follow the AI feature specifications.

Ensure AI responses are safe, helpful, and relevant.

---

# Documentation

Whenever a new feature is introduced:

* Update the relevant documentation.
* Keep the docs synchronized with the codebase.
* Do not allow the implementation to drift away from the documented architecture.

---

# Workflow Rules

Implement only one phase at a time.

Finish the current module before moving to the next.

Test each module.

Refactor when necessary.

Keep commits small and meaningful.

---

# If Requirements Are Missing

Do not guess.

Use the existing documentation first.

If information is still missing, request clarification before implementing.

---

# Output Expectations

Every implementation should include:

* File names
* Folder locations
* Complete production-ready code
* Clear explanations
* Setup instructions
* Verification steps
* Error handling
* Responsive behavior
* Accessibility considerations

---

# Final Objective

EduEarn is not a college project.

EduEarn is a startup.

Every decision should contribute to building a scalable, secure, modern, AI-powered education platform capable of serving millions of learners while maintaining a premium user experience.

Build every module with the mindset that it will be used in production by real users.

Never compromise on code quality, architecture, design consistency, accessibility, performance, or security.

The goal is to create an education platform that users trust, enjoy, and recommend.

Learn.

Teach.

Earn.
