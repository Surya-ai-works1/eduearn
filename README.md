# 🚀 EduEarn — Learn. Teach. Earn.

EduEarn is India's most trusted AI-powered learning marketplace where **anyone can learn** and **young students can teach and earn**. 

Unlike traditional learning platforms, EduEarn establishes a peer-learning ecosystem that empowers young students (ages 16–24) to monetize their knowledge, while providing learners of all ages access to affordable, premium, and personalized education.

---

## 🎨 Core Tagline
> **Learn. Teach. Earn.**
> *One platform where anyone can learn, students can teach, and everyone can grow.*

---

## 💡 Key Feature Modules

1. **AI Verified Tutors**: Tutors must complete profiles, submit identity verification documents, and clear the automated **AI Tutor Assessment** evaluating communication, style, and subject competence before hosting classes.
2. **Recorded Course Marketplace**: Browse and purchase dynamic courses in programming, UI/UX, mathematics, music, cooking, finance, and languages.
3. **Live Virtual Classroom**: Join fully interactive classrooms equipped with video streaming, synchronized bottom call toolbars, live chat streams, and a collaborative whiteboard.
4. **Payments & Wallet**: Safe transactions processing using simulated payment gateways, coupon codes, refund queues, tax invoices, and tutor balance withdrawal requests.
5. **AI Study Assistant**: Personalized chatbot helping students clarify concept doubts, generate mock quizzes, and compile learning roadmaps.

---

## 💻 Technology Stack

- **Frontend**: Next.js 15 (App Router), TypeScript, Tailwind CSS v4, shadcn/ui, Framer Motion, Zustand.
- **Backend/DB**: Supabase (Auth, PostgreSQL DB, Storage, Edge Functions).
- **AI Engine**: Google Gemini API model bindings.
- **Payment Gateway**: Razorpay Overlay checkout simulator.

---

## 📂 Codebase Folder Structure

The codebase is organized using a **Feature-Based Architecture**:
- `src/app/`: App router page routes.
- `src/components/`: Reusable global design UI layout components.
- `src/features/`: Isolated business capabilities (auth, AI, payments, classroom).
- `src/providers/`: Context providers (Auth, Theme, Notifications).
- `src/utils/`: Global utility helpers (formatting, variables check, logging).

---

## 📖 Developer Guides & Documentation

To learn more about setting up and deploying the platform, check out the documentation files inside the `/docs` folder:

* **[Installation Guide](./docs/INSTALLATION_GUIDE.md)**: Steps to get the project running locally.
* **[Developer Guide](./docs/DEVELOPER_GUIDE.md)**: Coding principles, environment variables, and structure rules.
* **[Deployment Guide](./docs/DEPLOYMENT_GUIDE.md)**: Setup checklists for production on Vercel and Supabase.
* **[Contributing Guide](./docs/CONTRIBUTING_GUIDE.md)**: Branch naming conventions, formatting protocols, and PR checklist.
* **[Database Schema](./docs/_DATABASE_SCHEMA.md)**: Database tables, fields, and relationships.
* **[AI Architecture](./docs/AI_FEATURES.md)**: AI features, models, rules, and assistant setups.
* **[Business Rules](./docs/BUSINESS_RULES.md)**: Guidelines governing student, tutor, and payment models.

---

## 🚀 Running Locally

```bash
# Install packages
npm install

# Run dev server
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) inside your web browser.
