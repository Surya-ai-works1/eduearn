# EduEarn Platform Release Notes

Deployment release histories and rollback guidelines.

---

## Release v1.4.5 (Active - 2026-08-03)

SaaS platform production observability release.

### Highlights:
- **Centralized logger.ts**: Supports pretty development trace logs and stringified JSON production outputs.
- **Diagnostics Health API**: Added `/api/system/health` to return memory and services health checkups.
- **Settings tab overhaul**: Displays real-time SVG monitor widgets, backup checkpoints verification table, environment variable audit warnings, and deployment readiness checklists.
- **Integrated verify.ts script**: Automates build, routing, rbac, and storage integrity validation checks.

### Database Updates:
- Enforced new unique system flags mappings schema v45.

### Rollback Plan:
1. Rebuild application container using base build tag v1.4.2.
2. Rollback SQL migrations database structures back to v42 schema settings.
3. Purge Redis cache memory.
