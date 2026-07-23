# 💻 EduEarn - Developer Guide

This document describes the architectural patterns, coding guidelines, and directory structures of the EduEarn application to assist developers when extending the platform.

---

## 🏛️ Architecture Overview

EduEarn is built with a **Feature-Based Architecture**. Code is structured by business capability rather than technical role (e.g. putting all components in one folder, hooks in another). Each major capability resides in `src/features/[feature-name]`.

```
src/
├── app/                  # App Router pages and route definitions
├── components/           # Reusable global design system UI components
├── config/               # Platform static configurations (theme, metadata, site)
├── constants/            # Global mock lists and data
├── features/             # Business features (auth, payments, AI, classroom)
│   └── [feature]/
│       ├── components/   # Feature-specific components
│       ├── services/     # Feature-specific services/APIs
│       ├── hooks/        # Feature-specific hooks
│       └── utils/        # Feature-specific utilities
├── hooks/                # Global custom React hooks
├── lib/                  # Third-party wrappers (supabase, etc.)
├── providers/            # Global React providers
├── styles/               # CSS modules and styles (globals.css)
└── utils/                # Global utilities (formatting, validations)
```

---

## 🔑 Environment Variables

The application consumes the following environment variables. All variables starting with `NEXT_PUBLIC_` are exposed to the client bundle.

| Variable Name | Required | Purpose |
| --- | --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | Optional | Endpoint URL for the Supabase project instance. |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Optional | Public anonymous key for database and auth access. |
| `GEMINI_API_KEY` | Optional | Secret API key to call Google Gemini LLM API model endpoints. |
| `NEXT_PUBLIC_APP_URL` | Yes | Local or production domain url used to build canonical URLs. |
| `NEXT_PUBLIC_RAZORPAY_KEY_ID` | Optional | Key ID for Razorpay overlay simulator orders. |

*In the absence of Supabase configuration values, the application defaults to using local client storage and memory services.*

---

## 🛠️ Key Coding Guidelines

1. **Keep Client Components Lean**: Use Server Components where possible. Mark components with `"use client"` only when incorporating browser APIs, local states, or event listeners.
2. **Reuse the Design System**: Do not write ad-hoc CSS or create duplicate inputs and buttons. Leverage the primitives in `src/components/ui/` and tokens inside `globals.css` (e.g., `var(--primary)`, `glassmorphism`, `bg-hero-gradient`).
3. **TypeScript Strictly**: Always declare correct interfaces and types. Avoid using `any` type casting.
4. **Clean up Resources**: In custom hooks and effects (especially streams, Web sockets, and intervals), always return cleanups to prevent memory leaks.
5. **Lint Safety**: Run `npm run lint` and verify zero warnings before opening PRs.
