# CHANGELOG

All notable changes to the EduEarn platform are documented here.

---

## [Unreleased] - 2026-08-04

### Added
- **Dedicated Navigation Headers separation**: Split monolithic marketplace navbar into three isolated sub-headers: `PublicHeader.tsx`, `StudentHeader.tsx`, and `TutorHeader.tsx` to completely isolate guest, student, and tutor interfaces.
- **Enterprise Operations Console tabs**: Added new administrative tab views for the admin dashboard: `CertificatesTab.tsx`, `ReportsTab.tsx`, `SecurityTab.tsx`, and `SystemHealthTab.tsx`.
- **Top Navigation AppHeader**: Upgraded admin console dashboard header with platform logo, theme toggling, global search integration, and user profile menus.
- **Broad search indexing**: Expanded `GlobalSearchIndex` to search Users, Students, Tutors, Courses, Categories, Payments, Certificates, Organizations, Audit Logs, Tickets, and Reports.

### Fixed
- **Admin Landing Page Separation**: Replaced generic public marketplace landing sections (explore buttons, trending skills, categories) with 12 executive KPI stats cards, action handlers, timeline feeds, and recent audit logs.
- **Root Admin Auto-Redirection**: Implemented client-side redirection checks on the main landing index page to route authenticated admins directly to `/admin/dashboard`.

## [Unreleased] - 2026-08-03

### Added
- **Unified Permission Resolver (`src/utils/rbacResolver.ts`)**: Centralized route access control logic and permission mapping rules for all roles.
- **Collapsible Authentication Debug Inspector (`src/components/ui/DevBadge.tsx`)**: Upgraded developer overlay containing pathname route logs, active storage/cookie details, and last repair times.
- **Programmatic Stress Test Suite (`scripts/verify-auth-recovery.ts`)**: Added automated regression testing covering 12 authentication recovery scenarios.

### Fixed
- **Authentication Dev-Mode Overwrite Bug**: Fixed a bug where page refreshes inside development mode reset active administrator sessions back to the default tutor profile.
- **Next.js Middleware Build Conflict**: Resolved duplicate middleware definition error by deleting `src/middleware.ts` and consolidating Edge runtime rules directly under the custom `src/proxy.ts` delegator.
- **Stale Dev-Mode Session States**: Upgraded session repair to delete redundant local storage variables (`eduearn_mock_session`, `eduearn_role`, etc.) and mirror credentials to document cookies dynamically.
- **Multi-Role Route Access**: Updated route guards to support `super-admin` alongside standard admin access configurations.

### Changed
- **Unified Zustand Store Listener**: Enabled state modifications in the Zustand `useAuth` hook to automatically propagate session changes to both local storage and Edge middleware cookies in dev mode.
- **Route Guard Access Delegates**: Refactored `RequireAuth`, `RequireLearner`, `RequireTutor`, and `RequireAdmin` to retrieve route decisions from the central `resolveRouteDecision` engine.
