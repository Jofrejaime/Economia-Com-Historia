# Notification Endpoints

Complete guide for managing user notifications, email alerts, and invitations.

## Overview

The notification system provides two channels:
- **In-App Notifications**: Stored in database, retrieved via API
- **Email Notifications**: Sent via ReSend mailer service

### Notification Types

| Type | Delivery | Stored | User Action | Example |
|------|----------|--------|-------------|---------|
| Content Alert | Email + In-App | ✅ Yes | Mark read/delete | "New article published" |
| Access Approved | Email + In-App | ✅ Yes | Mark read/delete | "Your access was approved" |
| Access Rejected | Email + In-App | ✅ Yes | Mark read/delete | "Your request was rejected" |
| Invitation | Email | ❌ No | Click link | "You're invited to join" |

---

## Endpoints Summary

| Method | Endpoint | Auth | Purpose |
|--------|----------|------|---------|
| GET | `/notifications` | Yes | List user's notifications |
| PATCH | `/notifications/{id}/read` | Yes | Mark notification as read |
| PATCH | `/notifications/read-all` | Yes | Mark all as read |
| DELETE | `/notifications/{id}` | Yes | Delete notification |
| POST | `/notifications/send` | Yes (Admin) | Send notification to user |
| POST | `/notifications/invite` | Yes (Admin) | Send invitation email |

---

## 1. List User's Notifications

Get all notifications for the authenticated user.

### Request

```http
GET /notifications
Authorization: Bearer <token>
```

### Query Parameters

| Param | Type | Default | Description |
|-------|------|---------|-------------|
| unread_only | boolean | false | Show only unread notifications |
| type | string | all | Filter by type: `content_alert`, `access_approved`, `access_rejected`, `system` |
| per_page | integer | 20 | Results per page |
| page | integer | 1 | Page number |

### Examples

```http
# Get all notifications
GET /notifications
Authorization: Bearer <token>

# Get only unread notifications
GET /notifications?unread_only=true

# Get content alerts only
GET /notifications?type=content_alert&per_page=10
```

### Response

**Status: 200 OK**

```json
{
  "notifications": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440100",
      "user_id": "550e8400-e29b-41d4-a716-446655440000",
      "type": "content_alert",
      "subject": "New Article: Economic Growth in Angola",
      "message": "A new article has been published in the Economics section.",
      "data": {
        "article_id": "123",
        "article_title": "Economic Growth in Angola",
        "url": "/articles/123"
      },
      "read_at": null,
      "created_at": "2026-06-01T10:30:00Z"
    },
    {
      "id": "550e8400-e29b-41d4-a716-446655440101",
      "user_id": "550e8400-e29b-41d4-a716-446655440000",
      "type": "access_approved",
      "subject": "Access Approved - Jindungo Community",
      "message": "Your request for access to Jindungo Community has been approved.",
      "data": {
        "access_level_id": "jindungo",
        "access_level_name": "Jindungo Community",
        "reason": "User qualifies for access"
      },
      "read_at": "2026-06-01T11:00:00Z",
      "created_at": "2026-06-01T10:45:00Z"
    }
  ],
  "pagination": {
    "total": 2,
    "per_page": 20,
    "current_page": 1,
    "last_page": 1,
    "unread_count": 1
  }
}
```

---

## 2. Mark Notification as Read

Mark a single notification as read.

### Request

```http
PATCH /notifications/{id}/read
Authorization: Bearer <token>
```

### Parameters

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| id | string | ✅ Yes | Notification ID (UUID) |

### Response

**Status: 200 OK**

```json
{
  "message": "Notification marked as read",
  "notification": {
    "id": "550e8400-e29b-41d4-a716-446655440100",
    "read_at": "2026-06-01T12:00:00Z"
  }
}
```

---

## 3. Mark All Notifications as Read

Mark all user notifications as read.

### Request

```http
PATCH /notifications/read-all
Authorization: Bearer <token>
```

### Response

**Status: 200 OK**

```json
{
  "message": "All notifications marked as read",
  "count": 5
}
```

---

## 4. Delete Notification

Delete a single notification.

### Request

```http
DELETE /notifications/{id}
Authorization: Bearer <token>
```

### Parameters

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| id | string | ✅ Yes | Notification ID (UUID) |

### Response

**Status: 200 OK**

```json
{
  "message": "Notification deleted successfully"
}
```

### Errors

```json
// Not Found
{
  "message": "The specified notification was not found.",
  "status_code": 404
}
```

---

## 5. Send Notification (Admin)

Send a notification to a user (admin only).

### Request

```http
POST /notifications/send
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "user_id": "550e8400-e29b-41d4-a716-446655440000",
  "subject": "New Article Published",
  "message": "A new article about economic history has been published.",
  "type": "content_alert",
  "data": {
    "article_id": "456",
    "article_title": "Economic History of Angola",
    "url": "/articles/456"
  }
}
```

### Parameters

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| user_id | string | ✅ Yes | Recipient user ID |
| subject | string | ✅ Yes | Notification subject |
| message | string | ✅ Yes | Notification message |
| type | string | ✅ Yes | Notification type (see types below) |
| data | object | ❌ No | Additional context data (varies by type) |

### Notification Types

#### content_alert

Sent when new content is published.

```json
{
  "type": "content_alert",
  "data": {
    "article_id": "456",
    "article_title": "Title",
    "url": "/articles/456"
  }
}
```

#### access_approved

Sent when access request is approved.

```json
{
  "type": "access_approved",
  "data": {
    "access_level_id": "jindungo",
    "access_level_name": "Jindungo Community",
    "reason": "Approved by admin"
  }
}
```

#### access_rejected

Sent when access request is rejected.

```json
{
  "type": "access_rejected",
  "data": {
    "access_level_id": "restricted",
    "access_level_name": "Restricted",
    "reason": "Does not meet criteria"
  }
}
```

#### system

General system notification.

```json
{
  "type": "system",
  "data": {
    "priority": "high",
    "action_url": "/notifications/123"
  }
}
```

### Response

**Status: 201 Created**

```json
{
  "message": "Notification sent successfully",
  "notification": {
    "id": "550e8400-e29b-41d4-a716-446655440102",
    "user_id": "550e8400-e29b-41d4-a716-446655440000",
    "type": "content_alert",
    "subject": "New Article Published",
    "message": "A new article about economic history has been published.",
    "read_at": null,
    "created_at": "2026-06-01T12:15:00Z"
  }
}
```

**Email Sent to User:**

```
Subject: New Article Published

A new article about economic history has been published.

Article: Economic History of Angola
https://app.economia-historia.ao/articles/456

---
View all notifications: https://app.economia-historia.ao/notifications
```

### Errors

```json
// User Not Found
{
  "message": "The specified user was not found.",
  "status_code": 404
}

// Unauthorized (non-admin)
{
  "message": "You do not have permission to send notifications.",
  "status_code": 403
}
```

---

## 6. Send Invitation Email (Admin)

Send an invitation email to a non-registered user.

### Request

```http
POST /notifications/invite
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "recipient_email": "newuser@example.com",
  "recipient_name": "Maria Silva",
  "message": "You are invited to join Economia com História platform.",
  "action_url": "https://app.economia-historia.ao/register?invite=abc123"
}
```

### Parameters

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| recipient_email | string | ✅ Yes | Email address to send to |
| recipient_name | string | ✅ Yes | Recipient's name |
| message | string | ✅ Yes | Custom invitation message |
| action_url | string | ✅ Yes | Registration/join link |

### Response

**Status: 201 Created**

```json
{
  "message": "Invitation email sent successfully",
  "recipient": {
    "email": "newuser@example.com",
    "name": "Maria Silva",
    "sent_at": "2026-06-01T12:20:00Z"
  }
}
```

**Email Content:**

```
Subject: You're Invited to Economia com História

Hi Maria Silva,

You are invited to join Economia com História platform.

[Join Now Button]
https://app.economia-historia.ao/register?invite=abc123

---
Best regards,
Economia com História Team
```

### Errors

```json
// Invalid Email
{
  "message": "The recipient email address is invalid.",
  "status_code": 422
}

// Already Registered
{
  "message": "This email is already registered.",
  "status_code": 409
}
```

---

## Email Configuration

### SMTP Settings (Backend)

Located in `.env`:

```bash
MAIL_MAILER=resend
MAIL_FROM_ADDRESS="onboarding@resend.dev"
MAIL_FROM_NAME="Economia com História"
RESEND_API_KEY=your_resend_api_key_here
```

### Email Templates

Located in `resources/views/emails/`:

- `invite.blade.php` - Invitation email template
- Other notification templates auto-generated

---

## Frontend Integration Examples

### Angular

```typescript
// Get all unread notifications
getNotifications(unreadOnly = false): Observable<any> {
  const params = new HttpParams();
  if (unreadOnly) {
    params = params.set('unread_only', 'true');
  }
  return this.http.get(`${this.apiUrl}/notifications`, { params });
}

// Mark notification as read
markAsRead(notificationId: string): Observable<any> {
  return this.http.patch(`${this.apiUrl}/notifications/${notificationId}/read`, {});
}

// Mark all as read
markAllAsRead(): Observable<any> {
  return this.http.patch(`${this.apiUrl}/notifications/read-all`, {});
}

// Delete notification
deleteNotification(notificationId: string): Observable<any> {
  return this.http.delete(`${this.apiUrl}/notifications/${notificationId}`);
}

// In component
ngOnInit() {
  this.notificationService.getNotifications(true).subscribe(response => {
    this.unreadNotifications = response.notifications;
    this.unreadCount = response.pagination.unread_count;
  });
}

markAsRead(notificationId: string) {
  this.notificationService.markAsRead(notificationId).subscribe(() => {
    this.loadNotifications();
  });
}
```

### React Native

```javascript
// Get notifications
const getNotifications = async (unreadOnly = false) => {
  const response = await fetch(
    `${API_URL}/notifications?unread_only=${unreadOnly}`,
    {
      headers: {
        'Authorization': `Bearer ${await SecureStore.getItemAsync('auth_token')}`
      }
    }
  );
  return response.json();
};

// Mark as read
const markAsRead = async (notificationId) => {
  const response = await fetch(
    `${API_URL}/notifications/${notificationId}/read`,
    {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${await SecureStore.getItemAsync('auth_token')}`
      }
    }
  );
  return response.json();
};

// In component
useEffect(() => {
  const loadNotifications = async () => {
    try {
      const response = await getNotifications(true);
      setNotifications(response.notifications);
      setUnreadCount(response.pagination.unread_count);
    } catch (error) {
      console.error('Failed to load notifications', error);
    }
  };
  
  loadNotifications();
}, []);

const handleMarkAsRead = async (notificationId) => {
  await markAsRead(notificationId);
  loadNotifications(); // Reload
};
```

---

## Best Practices

✅ **DO:**
- Store notifications in database for persistent history
- Show unread count in UI badge
- Allow marking notifications as read individually or all at once
- Send emails for important events (access approved/rejected)
- Include action URLs in notifications
- Implement real-time notifications via WebSockets (future)
- Regularly clean up old notifications (30+ days)

❌ **DON'T:**
- Send notifications without user consent
- Overload users with too many notifications
- Store sensitive data in notification data field
- Expose admin API endpoints to regular users
- Send duplicate notifications

---

## Notification Center UI Recommendations

### Mobile (React Native)

```
┌─────────────────────────┐
│     Notifications       │
├─────────────────────────┤
│ ○ New Article Published │  ← Unread (dot)
│   "Economic Growth..."  │
│   Today at 10:30 AM     │
├─────────────────────────┤
│ • Access Approved       │  ← Read
│   "Jindungo Community"  │
│   Today at 11:00 AM     │
├─────────────────────────┤
│   Mark all as read      │  ← Action
└─────────────────────────┘
```

### Web (Angular)

```
Notifications                     [Mark all as read]
┌─────────────────────────────────────────────────┐
│ ⊘ Unread (3)                                   │
│                                                 │
│ ○ New Article: "Economic Growth in Angola"     │
│   Published 2 hours ago          [Delete] [>]  │
│                                                 │
│ ○ Your access to Jindungo was approved          │
│   1 hour ago                     [Delete] [>]   │
│                                                 │
├─────────────────────────────────────────────────┤
│ Read (5)                                        │
│                                                 │
│ • System Update: Platform maintenance           │
│   2 days ago                     [Delete]       │
└─────────────────────────────────────────────────┘
```

---

## Error Codes

| Code | Error | Solution |
|------|-------|----------|
| 401 | Unauthorized | Token missing or invalid |
| 403 | Forbidden | User lacks admin permissions |
| 404 | Not Found | Notification or user not found |
| 409 | Conflict | Email already registered or duplicate |
| 422 | Invalid Data | Check email format and required fields |

**Last Updated:** June 1, 2026
