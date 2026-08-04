# EduEarn SaaS Platform - Operations & Systems Guide

Operational guide for system administrators, site reliability engineers, and DevOps.

---

## 1. Backups Verification Checklist

The platform verifies the backup state of eight critical sub-systems:
- **Database Backup**: Tarball schema exports containing records directory.
- **Storage Subfolders Backup**: Media archives for videos and sub-paths.
- **Settings Config Backup**: Declarative feature flags backup.
- **RBAC Security Backup**: Permissions maps backup.
- **BI Financial Reports Backup**: Monthly billing receipts reports.
- **Organization Tenant Backup**: Tenant settings backup.
- **Student Certificates Backup**: Digital credentials hash backup.
- **User Identity Directory Backup**: Login profiles credentials backup.

---

## 2. Maintenance Routines

Trigger the following commands in the **Maintenance Tools** tab of the Admin Console:
1. **Purge Redis Cache**: Clears Redis cache tables and resets local storage buffers.
2. **Optimize DB Indexes**: Vacuum Postgres databases to reduce storage fragmentation.
3. **Rebuild Search Index**: Index key symbols for the global command selector search bar.

---

## 3. Real-time Latency Observability

Monitor API responses and email dispatch health trends:
- **Alert Levels**: Latencies exceeding 250ms must trigger alerts.
- **Email Delivery Logs**: Inspect SMTP queues to identify failed Brevo connections.
