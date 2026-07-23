# ⚙️ EduEarn - Installation & Setup Guide

This guide describes how to set up and run the EduEarn development environment locally.

---

## 🛠️ Prerequisites

To run EduEarn, you will need the following tools installed on your local machine:

1. **Node.js**: Version 18.0.0 or higher.
2. **npm** (comes with Node.js) or **pnpm** (recommended for speed).
3. **Supabase Account** (Optional): Required only for live backend integrations. If omitted, the platform automatically starts in **Offline Mock Mode**, resolving all database actions in client memory.
4. **Google Gemini API Key** (Optional): Required for live AI recommendations, assessment grading, and study assistant chats. If omitted, the AI components return preset high-fidelity mock responses.

---

## 🚀 Getting Started

Follow these steps to initialize and start the project locally:

### 1. Clone the Codebase
Navigate to your desired workspace and download the repository:
```bash
git clone https://github.com/your-username/eduearn.git
cd eduearn
```

### 2. Install Dependencies
Run the installation script to fetch all required libraries (React 19/Next.js 15 App Router, Tailwind CSS v4, Framer Motion, Lucide React, Zustand, etc.):
```bash
npm install
```

### 3. Configure Environment Variables
Copy the template configuration file to configure your endpoints:
```bash
cp .env.example .env.local
```

Inside `.env.local`, specify your variables (see the [Environment Variables Guide](./docs/DEVELOPER_GUIDE.md#environment-variables) for descriptions):
```env
NEXT_PUBLIC_SUPABASE_URL=your-supabase-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
GEMINI_API_KEY=your-google-gemini-api-key
NEXT_PUBLIC_APP_URL=http://localhost:3000
```
*Note: If `NEXT_PUBLIC_SUPABASE_URL` is left empty, the application automatically redirects network endpoints to high-fidelity client mock databases.*

### 4. Run the Development Server
Launch the local Turbopack build worker:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) inside your web browser to access the landing page.

---

## 🧪 Verification & QA

Before committing code, verify compilation and formatting checks pass cleanly:

### 1. Linter Checks
Runs ESLint rules to audit variable usage, imports, and styling formatting:
```bash
npm run lint
```

### 2. Type Checking
Verifies TypeScript compilation safety across all components:
```bash
npx tsc --noEmit
```

### 3. Production Build
Validates static site rendering (SSG) compilation and builds:
```bash
npm run build
```
