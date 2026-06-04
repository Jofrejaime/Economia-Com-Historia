# Access Control Endpoints

Complete guide for managing user access levels, permissions, and approval workflows.

## Overview

The access control system uses a 3-tier model with two approval mechanisms:

### Access Levels

| ID | Name | Auto-Grant | Approval | Purpose |
|---|------|-----------|----------|---------|
| public | Public | ✅ Yes | None | Free access to public content |
| jindungo | Jindungo Community | ❌ No | Required | Community restricted content (manual review) |
| restricted | Restricted | ❌ No | Required | Admin-only content (manual approval) |

### Workflows

**Auto-Grant Access:**
```
User requests "public" level → Access granted immediately → User can access content
```

**Manual Approval Access:**
```
User requests "jindungo" level → Admin reviews → 
  Approved: Access granted, user notified
  Rejected: Request denied, user notified
```

---

## Endpoints Summary

| Method | Endpoint | Auth | Purpose |
|--------|----------|------|---------|
| GET | `/access-levels` | Yes | List all access levels |
| POST | `/access-requests` | Yes | Request access to a level |
| GET | `/access-requests` | Yes | List requests (`scope=mine` default; admin `scope=all`; optional `status`) |
| GET | `/access-requests/{id}` | Yes | Get specific request details |
| PATCH | `/access-requests/{id}` | Yes | Review/approve/reject request (admin) |
| GET | `/access-grants` | Yes | List grants (`scope=mine` default; admin `scope=all`) |
| POST | `/access-grants/{id}/revoke` | Yes | Revoke user's access (admin) |

### Document access (Sprint 2)

Protected documents use `AccessGateService` on `GET /documents`, `/documents/search`, `/documents/{id}`, download, like, favorite, and citation. Users need an active grant for `jindungo` / `restricted`, may always see `public`, see their own uploads, and admins bypass checks.

`GET /document-categories` lists thematic categories.

---

## 1. List Access Levels

Get all available access levels in the system.

### Request

```http
GET /access-levels
Authorization: Bearer <token>
```

### Response

**Status: 200 OK**

```json
{
  "access_levels": [
    {
      "id": "public",
      "name": "Public",
      "description": "Free access to public content",
      "auto_grant": true,
      "requires_approval": false,
      "created_at": "2026-06-01T00:00:00Z"
    },
    {
      "id": "jindungo",
      "name": "Jindungo Community",
      "description": "Community restricted content",
      "auto_grant": false,
      "requires_approval": true,
      "created_at": "2026-06-01T00:00:00Z"
    },
    {
      "id": "restricted",
      "name": "Restricted",
      "description": "Admin-only content",
      "auto_grant": false,
      "requires_approval": true,
      "created_at": "2026-06-01T00:00:00Z"
    }
  ],
  "total": 3
}
```

---

## 2. Request Access Level

Request access to a specific access level.

### Request

```http
POST /access-requests
Authorization: Bearer <token>
Content-Type: application/json

{
  "access_level_id": "jindungo"
}
```

### Parameters

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| access_level_id | string | ✅ Yes | ID of the access level to request |

### Response

**Auto-Grant Level (public):**

```json
{
  "message": "Access granted immediately",
  "access_grant": {
    "id": "550e8400-e29b-41d4-a716-446655440001",
    "user_id": "...",
    "access_level_id": "public",
    "granted_at": "2026-06-01T10:40:00Z",
    "revoked_at": null
  }
}
```

**Manual-Approval Level (jindungo/restricted):**

```json
{
  "message": "Access request created",
  "access_request": {
    "id": "550e8400-e29b-41d4-a716-446655440002",
    "user_id": "...",
    "access_level_id": "jindungo",
    "status": "pending",
    "reason": null,
    "requested_at": "2026-06-01T10:40:00Z",
    "reviewed_at": null,
    "reviewed_by": null
  }
}
```

### Errors

```json
// Duplicate Request
{
  "message": "You already have an active request for this access level.",
  "status_code": 409
}

// Already Granted
{
  "message": "You already have access to this level.",
  "status_code": 409
}

// Invalid Level
{
  "message": "The specified access level does not exist.",
  "status_code": 404
}
```

---

## 3. List User's Access Requests

Get all access requests made by the current user.

### Request

```http
GET /access-requests
Authorization: Bearer <token>
```

### Query Parameters

| Param | Type | Default | Description |
|-------|------|---------|-------------|
| status | string | all | Filter by status: `pending`, `approved`, `rejected` |
| per_page | integer | 15 | Results per page |
| page | integer | 1 | Page number |

### Example

```http
GET /access-requests?status=pending&per_page=10&page=1
Authorization: Bearer <token>
```

### Response

**Status: 200 OK**

```json
{
  "access_requests": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440002",
      "user_id": "550e8400-e29b-41d4-a716-446655440000",
      "access_level_id": "jindungo",
      "access_level": {
        "id": "jindungo",
        "name": "Jindungo Community",
        "description": "Community restricted content"
      },
      "status": "pending",
      "reason": null,
      "requested_at": "2026-06-01T10:40:00Z",
      "reviewed_at": null,
      "reviewed_by": null
    },
    {
      "id": "550e8400-e29b-41d4-a716-446655440003",
      "user_id": "550e8400-e29b-41d4-a716-446655440000",
      "access_level_id": "restricted",
      "access_level": {
        "id": "restricted",
        "name": "Restricted",
        "description": "Admin-only content"
      },
      "status": "approved",
      "reason": "Qualified administrator",
      "requested_at": "2026-05-28T08:00:00Z",
      "reviewed_at": "2026-05-28T09:15:00Z",
      "reviewed_by": "admin_user_id"
    }
  ],
  "pagination": {
    "total": 2,
    "per_page": 15,
    "current_page": 1,
    "last_page": 1
  }
}
```

---

## 4. Get Access Request Details

Retrieve details of a specific access request.

### Request

```http
GET /access-requests/{id}
Authorization: Bearer <token>
```

### Parameters

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| id | string | ✅ Yes | Request ID (UUID) |

### Response

**Status: 200 OK**

```json
{
  "id": "550e8400-e29b-41d4-a716-446655440002",
  "user_id": "550e8400-e29b-41d4-a716-446655440000",
  "user": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "name": "João Silva",
    "email": "joao@example.com"
  },
  "access_level_id": "jindungo",
  "access_level": {
    "id": "jindungo",
    "name": "Jindungo Community",
    "description": "Community restricted content"
  },
  "status": "pending",
  "reason": null,
  "requested_at": "2026-06-01T10:40:00Z",
  "reviewed_at": null,
  "reviewed_by": null
}
```

### Errors

```json
// Not Found
{
  "message": "The specified access request was not found.",
  "status_code": 404
}
```

---

## 5. Review Access Request (Admin)

Approve or reject an access request (admin only).

### Request

```http
PATCH /access-requests/{id}
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "status": "approved",
  "reason": "User qualifies for access"
}
```

### Parameters

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| status | string | ✅ Yes | New status: `approved`, `rejected` |
| reason | string | ❌ No | Reason for approval/rejection |

### Response

**Status: 200 OK**

```json
{
  "message": "Access request updated",
  "access_request": {
    "id": "550e8400-e29b-41d4-a716-446655440002",
    "status": "approved",
    "reason": "User qualifies for access",
    "requested_at": "2026-06-01T10:40:00Z",
    "reviewed_at": "2026-06-01T11:00:00Z",
    "reviewed_by": "admin_id"
  },
  "access_grant": {
    "id": "550e8400-e29b-41d4-a716-446655440010",
    "user_id": "550e8400-e29b-41d4-a716-446655440000",
    "access_level_id": "jindungo",
    "granted_at": "2026-06-01T11:00:00Z",
    "revoked_at": null
  }
}
```

**User receives notification email:**
```
Subject: Access Approved - Jindungo Community

Your request for access to "Jindungo Community" has been approved.
Reason: User qualifies for access

You can now access restricted content at: https://app.economia-historia.ao/community
```

### Errors

```json
// Unauthorized (non-admin)
{
  "message": "You do not have permission to review access requests.",
  "status_code": 403
}

// Already Reviewed
{
  "message": "This request has already been reviewed.",
  "status_code": 409
}
```

---

## 6. List User's Access Grants

Get all access levels granted to the current user.

### Request

```http
GET /access-grants
Authorization: Bearer <token>
```

### Query Parameters

| Param | Type | Default | Description |
|-------|------|---------|-------------|
| per_page | integer | 15 | Results per page |
| page | integer | 1 | Page number |

### Response

**Status: 200 OK**

```json
{
  "access_grants": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440001",
      "user_id": "550e8400-e29b-41d4-a716-446655440000",
      "access_level_id": "public",
      "access_level": {
        "id": "public",
        "name": "Public",
        "description": "Free access to public content"
      },
      "granted_at": "2026-06-01T10:30:00Z",
      "revoked_at": null,
      "reason": "Auto-grant on registration"
    },
    {
      "id": "550e8400-e29b-41d4-a716-446655440010",
      "user_id": "550e8400-e29b-41d4-a716-446655440000",
      "access_level_id": "jindungo",
      "access_level": {
        "id": "jindungo",
        "name": "Jindungo Community",
        "description": "Community restricted content"
      },
      "granted_at": "2026-06-01T11:00:00Z",
      "revoked_at": null,
      "reason": "User qualifies for access"
    }
  ],
  "pagination": {
    "total": 2,
    "per_page": 15,
    "current_page": 1,
    "last_page": 1
  }
}
```

---

## 7. Revoke Access Grant (Admin)

Revoke a user's access to a level (admin only).

### Request

```http
POST /access-grants/{id}/revoke
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "reason": "Violation of community guidelines"
}
```

### Parameters

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| reason | string | ❌ No | Reason for revocation |

### Response

**Status: 200 OK**

```json
{
  "message": "Access revoked successfully",
  "access_grant": {
    "id": "550e8400-e29b-41d4-a716-446655440010",
    "user_id": "550e8400-e29b-41d4-a716-446655440000",
    "access_level_id": "jindungo",
    "granted_at": "2026-06-01T11:00:00Z",
    "revoked_at": "2026-06-01T12:00:00Z",
    "reason": "Violation of community guidelines"
  }
}
```

**User receives notification email:**
```
Subject: Access Revoked - Jindungo Community

Your access to "Jindungo Community" has been revoked.
Reason: Violation of community guidelines

If you believe this is a mistake, please contact support.
```

---

## Integration Flow Examples

### Scenario 1: Auto-Grant Access (Public)

```
1. User requests "public" access level
   POST /access-requests
   { "access_level_id": "public" }

2. Server immediately grants access
   Returns access_grant with granted_at

3. User can now access public content
   Authorization: Bearer <token>
   GET /content/public/123
```

### Scenario 2: Manual-Approval Access

```
1. User requests "jindungo" access level
   POST /access-requests
   { "access_level_id": "jindungo" }

2. Request stored as "pending"
   User notified via email

3. Admin reviews requests
   GET /access-requests?status=pending

4. Admin approves
   PATCH /access-requests/{id}
   { "status": "approved" }

5. User receives approval email
   Can now access jindungo content

6. User checks grants
   GET /access-grants
   Returns both "public" and "jindungo"
```

### Scenario 3: Access Revocation

```
1. Admin views user's grants
   GET /access-grants

2. Admin revokes "jindungo" access
   POST /access-grants/{id}/revoke
   { "reason": "Violation of guidelines" }

3. Grant marked as revoked
   revoked_at timestamp set

4. User can no longer access content at that level
   GET /content/jindungo/123 → 403 Forbidden
```

---

## Best Practices

✅ **DO:**
- Always check access grants before displaying content
- Show user their current access levels
- Allow users to request additional access
- Notify users of approval/rejection decisions
- Maintain audit trail of access changes
- Validate tokens on every protected request

❌ **DON'T:**
- Cache access levels indefinitely
- Display content without checking grants
- Allow users to modify own access grants
- Expose admin review interface to users
- Grant access without verification

---

## Permissions & Authorization

### Protected Routes Example

In backend controllers:

```php
// Check if user has access level
if (!$user->hasAccessLevel('jindungo')) {
    return response()->json(['message' => 'Forbidden'], 403);
}

// Or use middleware
Route::middleware(['auth', 'access:jindungo'])->group(function () {
    Route::get('/content/community', ...);
});
```

In frontend:

```javascript
// Angular
if (user.access_grants.some(g => g.access_level_id === 'jindungo')) {
    showCommunityContent();
}

// React Native
const hasAccess = user.access_grants?.some(g => g.access_level_id === 'jindungo');
if (hasAccess) {
    renderCommunityContent();
}
```

---

## Error Codes

| Code | Error | Solution |
|------|-------|----------|
| 403 | Forbidden | User lacks required access level |
| 404 | Not Found | Request or level doesn't exist |
| 409 | Conflict | Duplicate request or already granted |
| 422 | Invalid Data | Check required fields and values |

**Last Updated:** June 1, 2026
