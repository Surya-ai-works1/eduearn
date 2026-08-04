# EduEarn Platform API Reference Manual

Internal system endpoint definitions for diagnostic checking and monitoring.

---

## 1. System Health Status API

- **Endpoint**: `/api/system/health`
- **Method**: `GET`
- **Headers**:
  - `Cache-Control: no-store, max-age=0, must-revalidate`

### Response Payload Structure:
```json
{
  "status": "healthy",
  "database": {
    "status": "connected",
    "latencyMs": 12,
    "databaseSizeGb": 1.1
  },
  "storage": {
    "status": "active",
    "provider": "Supabase S3 Bucket",
    "usedPercentage": 35.8
  },
  "memory": {
    "rss": "120 MB",
    "heapTotal": "80 MB",
    "heapUsed": "45 MB",
    "external": "5 MB"
  },
  "uptime": "1200 seconds",
  "environment": "production",
  "buildVersion": "v1.4.5",
  "commitHash": "ee89b9d4c0b29ff78e123689c104ab4",
  "apiLatencyMs": 14,
  "connectedServices": {
    "supabase": "online",
    "stripe": "online",
    "razorpay": "online",
    "brevoSMTP": "online",
    "firebaseMessaging": "online"
  },
  "lastBackup": {
    "timestamp": "2026-08-03 04:00:00 AM",
    "integrity": "verified",
    "size": "3.2 GB"
  },
  "deploymentMode": "SaaS Tenant-Isolated Multi-Region"
}
```
---

## 2. API Request Tester Endpoint

- **Endpoint**: `/api/health`
- **Method**: `GET`
- **Response**:
  ```json
  {
    "status": "healthy",
    "code": 200
  }
  ```
