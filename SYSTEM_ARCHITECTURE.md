# EduEarn Enterprise System Architecture

This document describes the design patterns and structural layouts governing the multi-role SaaS EduEarn platform.

---

## 1. Multi-Tenant Organization Isolation

Each enterprise customer in EduEarn belongs to a dedicated organization mapped inside local state configurations.
- **Tenant Context**: Managed dynamically in [Organizations Tab](file:///C:/Users/Sahiti/Downloads/eduearn-main/eduearn-main/src/app/admin/dashboard/components/organizations/OrganizationsTab.tsx).
- **Domains & Security**: Enforces DNS and SSL validation checklists mapping individual sub-regions.

---

## 2. Authorization Security Matrix (RBAC)

EduEarn isolates roles using a centralized permissions system.
- **Authoritative Resolver**: [rbacResolver.ts](file:///C:/Users/Sahiti/Downloads/eduearn-main/eduearn-main/src/utils/rbacResolver.ts) governs both server-side middleware and client-side guards.
- **Role Permissions**:
  - `admin` & `super-admin`: Complete read/write configuration access.
  - `tutor`: Course manager, quiz evaluations, resource uploads.
  - `student`: Learning paths, assignments submissions, payment checkouts.

---

## 3. Server Middleware Routing Policy

Next.js compiles [proxy.ts](file:///C:/Users/Sahiti/Downloads/eduearn-main/eduearn-main/src/proxy.ts) directly as the edge middleware handler.
- **Session Parsing**: Inspects mirrored dev cookies (`eduearn_dev_role` and `eduearn_dev_user`) to synchronize active permissions on Edge runtimes.
- **Fallback Redirects**: Automatically forwards unauthorized access attempts to `/login` or `/forbidden`.

---

## 4. Observability & Logging Architecture

Logs are captured and dispatched via [logger.ts](file:///C:/Users/Sahiti/Downloads/eduearn-main/eduearn-main/src/lib/logger.ts).
- **Development**: Prints pretty-formatted readable console strings.
- **Production**: Prints structured stringified JSON objects for ingestion by log monitors (AWS CloudWatch, Datadog).
