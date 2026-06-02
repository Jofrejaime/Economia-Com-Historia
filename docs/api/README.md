# API Documentation - Economia com História

> Complete API reference for the Economia com História platform. This documentation covers authentication, access control, notifications, and integration guidelines for frontend clients.

**Version:** 1.0.0  
**Last Updated:** June 1, 2026  
**Status:** Production Ready

## Table of Contents

1. [Overview](#overview)
2. [Base URL](#base-url)
3. [Authentication](#authentication)
4. [Access Control](#access-control)
5. [Endpoints](#endpoints)
6. [Error Handling](#error-handling)
7. [Integration Guides](#integration-guides)

## Overview

The Economia com História API is a RESTful service providing:
- **User Management**: Registration, authentication, session management
- **Access Control**: Permission-based access with auto-grant and manual approval workflows
- **Notifications**: Real-time notifications and email alerts
- **Email Services**: Powered by ReSend mailer

### Key Features

- ✅ Token-based authentication with session expiry (30 days)
- ✅ Role-based access control with 3 access levels
- ✅ Email verification and password recovery
- ✅ Automatic and manual access approvals
- ✅ Notification system with email delivery
- ✅ Comprehensive error handling

## Base URL

```
http://localhost:8000/api
https://api.economia-historia.ao/api  (production)
```

## Authentication

The API uses **Bearer Token** authentication via HTTP headers.

### Request Format

```
Authorization: Bearer <token>
```

Or using session header:

```
X-Session-Token: <token>
```

### Token Lifecycle

1. **Obtain Token**: Register or login to receive a token
2. **Use Token**: Include token in every protected request
3. **Refresh Token**: Call refresh endpoint before expiry (30-day TTL)
4. **Revoke Token**: Logout to immediately revoke token

**See:** [Authentication Endpoints](./authentication.md)

## Access Control

The system implements 3-tier access levels:

| Level | Name | Auto-Grant | Approval | Description |
|-------|------|-----------|----------|-------------|
| public | Public | ✅ Yes | None | Free access to public content |
| jindungo | Jindungo | ❌ No | Required | Community restricted content |
| restricted | Restricted | ❌ No | Required | Admin-only content |

**See:** [Access Control Endpoints](./access-control.md)

## Endpoints

### Authentication & Auth
- `POST /auth/register` - User registration
- `POST /auth/login` - User login
- `POST /auth/logout` - Logout and revoke token
- `POST /auth/refresh` - Refresh token before expiry
- `POST /auth/forgot-password` - Request password reset
- `POST /auth/reset-password` - Reset password with token
- `POST /auth/verify-email` - Verify email address
- `POST /auth/resend-verification` - Resend verification email
- `GET /me` - Get current authenticated user

**See:** [Authentication Endpoints](./authentication.md)

### Access Control
- `GET /access-levels` - List all access levels
- `GET /access-requests` - List user's access requests
- `POST /access-requests` - Request access to a level
- `GET /access-requests/{id}` - Get request details
- `PATCH /access-requests/{id}` - Update request status (admin)
- `GET /access-grants` - List user's granted access
- `POST /access-grants/{id}/revoke` - Revoke access grant

**See:** [Access Control Endpoints](./access-control.md)

### Notifications
- `GET /notifications` - List user's notifications
- `PATCH /notifications/{id}/read` - Mark notification as read
- `PATCH /notifications/read-all` - Mark all as read
- `DELETE /notifications/{id}` - Delete notification
- `POST /notifications/send` - Send notification (admin)
- `POST /notifications/invite` - Send invite email (admin)

**See:** [Notification Endpoints](./notifications.md)

## Error Handling

All errors follow a standard JSON format:

```json
{
  "message": "Error description",
  "errors": {
    "field_name": ["Specific error message"]
  },
  "status_code": 422
}
```

### Common Status Codes

| Code | Meaning | Example |
|------|---------|---------|
| 200 | Success | Login successful |
| 201 | Created | User registered |
| 400 | Bad Request | Invalid input format |
| 401 | Unauthorized | Missing or invalid token |
| 403 | Forbidden | No permission for resource |
| 404 | Not Found | Resource doesn't exist |
| 409 | Conflict | Duplicate access request |
| 422 | Unprocessable Entity | Validation failed |
| 429 | Too Many Requests | Rate limited |
| 500 | Server Error | Internal server error |

**See:** [Error Handling Guide](./error-handling.md)

## Integration Guides

### Frontend Technologies

- **Angular Web**: [Integration Guide](./integration-angular.md)
- **React Native Mobile**: [Integration Guide](./integration-react-native.md)

### Quick Start

1. **Register a user**: `POST /auth/register`
2. **Login**: `POST /auth/login` → receive token
3. **Store token**: Save in localStorage (web) or SecureStore (mobile)
4. **Add to headers**: Include token in all protected requests
5. **Handle expiry**: Catch 401 and refresh token
6. **Logout**: `POST /auth/logout` to revoke token

### Environment Variables

```bash
# Web (Angular / React)
VITE_API_URL=http://localhost:8000
VITE_API_BASE_PATH=/api

# Mobile (React Native)
API_URL=http://localhost:8000/api
STORAGE_KEY=economia_token
```

## Support & Contacts

- **Technical Issues**: Contact development team
- **API Changes**: Monitor this documentation for updates
- **Bug Reports**: Submit via project GitHub issues

---

**Last Updated:** June 1, 2026 | **Maintained By:** Backend Team (Pessoa 1)
