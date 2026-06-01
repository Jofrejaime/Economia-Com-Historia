# Authentication Endpoints

Complete guide for user authentication, session management, and password recovery.

## Endpoints Summary

| Method | Endpoint | Auth | Purpose |
|--------|----------|------|---------|
| POST | `/auth/register` | No | Create new user account |
| POST | `/auth/login` | No | Authenticate user |
| POST | `/auth/logout` | Yes | Revoke session token |
| POST | `/auth/refresh` | Yes | Refresh token before expiry |
| POST | `/auth/forgot-password` | No | Request password reset |
| POST | `/auth/reset-password` | No | Reset password with token |
| POST | `/auth/verify-email` | No | Confirm email address |
| POST | `/auth/resend-verification` | Yes | Resend verification email |
| GET | `/me` | Yes | Get authenticated user profile |

---

## 1. Register User

Create a new user account and receive authentication token.

### Request

```http
POST /auth/register
Content-Type: application/json

{
  "name": "João Silva",
  "email": "joao@example.com",
  "password": "SecurePassword123!",
  "password_confirmation": "SecurePassword123!"
}
```

### Parameters

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| name | string | ✅ Yes | User's full name (max 255) |
| email | string | ✅ Yes | Unique email address (valid email format) |
| password | string | ✅ Yes | Password (min 8 chars, must include uppercase, number, special char) |
| password_confirmation | string | ✅ Yes | Must match password |

### Response

**Status: 201 Created**

```json
{
  "user": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "name": "João Silva",
    "email": "joao@example.com",
    "email_verified": false,
    "is_active": true,
    "role": "user",
    "created_at": "2026-06-01T10:30:00Z",
    "profile": {
      "bio": null,
      "avatar": null,
      "location": null
    }
  },
  "token": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9..."
}
```

### Errors

```json
// Validation Error
{
  "message": "The given data was invalid.",
  "errors": {
    "email": ["The email has already been taken."],
    "password": ["The password must be at least 8 characters."]
  },
  "status_code": 422
}
```

---

## 2. Login User

Authenticate with email and password.

### Request

```http
POST /auth/login
Content-Type: application/json

{
  "email": "joao@example.com",
  "password": "SecurePassword123!"
}
```

### Parameters

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| email | string | ✅ Yes | Registered email address |
| password | string | ✅ Yes | Account password |

### Response

**Status: 200 OK**

```json
{
  "user": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "name": "João Silva",
    "email": "joao@example.com",
    "email_verified": true,
    "is_active": true,
    "role": "user",
    "last_login_at": "2026-06-01T10:35:00Z"
  },
  "token": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...",
  "expires_at": "2026-07-01T10:35:00Z"
}
```

### Errors

```json
// Invalid Credentials
{
  "message": "Invalid email or password.",
  "status_code": 401
}

// Account Inactive
{
  "message": "Your account has been deactivated.",
  "status_code": 403
}
```

---

## 3. Get Current User

Retrieve authenticated user's profile and information.

### Request

```http
GET /me
Authorization: Bearer <token>
```

### Response

**Status: 200 OK**

```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "name": "João Silva",
  "email": "joao@example.com",
  "email_verified": true,
  "is_active": true,
  "role": "user",
  "created_at": "2026-06-01T10:30:00Z",
  "last_login_at": "2026-06-01T10:35:00Z",
  "profile": {
    "bio": "Interested in economics",
    "avatar": "https://...",
    "location": "Luanda, Angola"
  },
  "access_grants": [
    {
      "id": "...",
      "access_level_id": "...",
      "access_level": {
        "id": "public",
        "name": "Public",
        "description": "Free access to public content"
      },
      "granted_at": "2026-06-01T10:30:00Z"
    }
  ]
}
```

---

## 4. Refresh Token

Refresh authentication token before it expires (30-day TTL).

### Request

```http
POST /auth/refresh
Authorization: Bearer <current_token>
```

### Response

**Status: 200 OK**

```json
{
  "token": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...",
  "expires_at": "2026-07-01T10:40:00Z",
  "message": "Token refreshed successfully"
}
```

### Errors

```json
// Token Expired
{
  "message": "Token has expired.",
  "status_code": 401
}
```

---

## 5. Logout

Revoke current session token.

### Request

```http
POST /auth/logout
Authorization: Bearer <token>
```

### Response

**Status: 200 OK**

```json
{
  "message": "Logged out successfully"
}
```

---

## 6. Forgot Password

Request a password reset token via email.

### Request

```http
POST /auth/forgot-password
Content-Type: application/json

{
  "email": "joao@example.com"
}
```

### Parameters

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| email | string | ✅ Yes | Registered email address |

### Response

**Status: 200 OK**

```json
{
  "message": "If an account exists with this email, a password reset link has been sent."
}
```

**Email Content:**

User receives email with reset link:
```
https://app.economia-historia.ao/reset-password?token=abc123def456&email=joao@example.com
```

---

## 7. Reset Password

Reset password using token from email.

### Request

```http
POST /auth/reset-password
Content-Type: application/json

{
  "email": "joao@example.com",
  "token": "abc123def456",
  "password": "NewPassword123!",
  "password_confirmation": "NewPassword123!"
}
```

### Parameters

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| email | string | ✅ Yes | Associated email address |
| token | string | ✅ Yes | Token from reset email |
| password | string | ✅ Yes | New password (min 8 chars) |
| password_confirmation | string | ✅ Yes | Must match password |

### Response

**Status: 200 OK**

```json
{
  "message": "Password reset successfully"
}
```

### Errors

```json
// Invalid Token
{
  "message": "The password reset link is invalid or expired.",
  "status_code": 422
}
```

---

## 8. Verify Email

Confirm email address using verification token.

### Request

```http
POST /auth/verify-email
Content-Type: application/json

{
  "token": "verification_token_from_email"
}
```

### Parameters

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| token | string | ✅ Yes | Verification token sent to email |

### Response

**Status: 200 OK**

```json
{
  "message": "Email verified successfully",
  "user": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "email": "joao@example.com",
    "email_verified": true
  }
}
```

---

## 9. Resend Verification Email

Resend verification email to current user.

### Request

```http
POST /auth/resend-verification
Authorization: Bearer <token>
```

### Response

**Status: 200 OK**

```json
{
  "message": "Verification email sent successfully"
}
```

### Errors

```json
// Already Verified
{
  "message": "Email is already verified.",
  "status_code": 422
}
```

---

## Token Management

### Token Storage

**Web (Angular/React):**
```javascript
// Store in localStorage
localStorage.setItem('auth_token', response.token);

// Retrieve for requests
const token = localStorage.getItem('auth_token');
```

**Mobile (React Native):**
```javascript
// Store in SecureStore (Expo)
import * as SecureStore from 'expo-secure-store';

await SecureStore.setItemAsync('auth_token', response.token);
const token = await SecureStore.getItemAsync('auth_token');
```

### Token Expiry Handling

All tokens expire after 30 days. Implement automatic refresh:

1. Store `expires_at` timestamp
2. Check if token expires in next 24 hours
3. Call refresh endpoint proactively
4. Update stored token
5. If refresh fails, prompt re-login

### Token Revocation

Calling logout immediately revokes the token. All pending requests with that token are rejected with 401.

---

## Best Practices

✅ **DO:**
- Store tokens securely (SecureStore for mobile, encrypted localStorage for web)
- Implement automatic token refresh before expiry
- Clear token on logout
- Include token in all protected requests
- Handle 401 errors by prompting re-login
- Use HTTPS in production

❌ **DON'T:**
- Store tokens in plain localStorage on web (use httpOnly cookies if possible)
- Expose tokens in URL parameters
- Share tokens between users
- Store tokens in git/version control
- Send tokens without HTTPS

---

## Error Codes

| Code | Error | Solution |
|------|-------|----------|
| 401 | Unauthorized | Token missing, invalid, or expired - login again |
| 403 | Forbidden | Token revoked - login again |
| 422 | Validation Failed | Check error details for specific field errors |
| 429 | Too Many Requests | Wait before trying again |

**Last Updated:** June 1, 2026
