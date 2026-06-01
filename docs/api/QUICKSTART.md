# Quick Start Guide

Fast reference for setting up and integrating the API.

## 5-Minute Setup

### 1. Backend Requirements

```bash
# Install dependencies
composer install
npm install

# Setup environment
cp .env.example .env
php artisan key:generate

# Database setup
php artisan migrate --seed

# Start server
php artisan serve
```

**Default URL:** http://localhost:8000/api

### 2. Test Backend Health

```bash
# Check if API is running
curl http://localhost:8000/api

# Register a test user
curl -X POST http://localhost:8000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "password": "TestPass123!",
    "password_confirmation": "TestPass123!"
  }'

# Login
curl -X POST http://localhost:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "TestPass123!"
  }'
```

---

## Frontend Integration Checklist

### Angular Web

- [ ] Install Angular 17+
- [ ] Copy `auth.service.ts` and `auth.interceptor.ts`
- [ ] Update environment URLs
- [ ] Setup AuthGuard in routing
- [ ] Add HTTP interceptor to AppModule
- [ ] Create login component
- [ ] Test login flow
- [ ] Verify token storage
- [ ] Test protected routes

### React Native

- [ ] Setup Expo or React Native CLI
- [ ] Install `axios`, `expo-secure-store`, `async-storage`
- [ ] Create `AuthContext`
- [ ] Create `RootNavigator`
- [ ] Copy service files
- [ ] Setup `AuthProvider` in App.js
- [ ] Create login screen
- [ ] Test authentication
- [ ] Verify token storage (SecureStore)

---

## Common Issues & Solutions

### "401 Unauthorized" on Protected Routes

**Problem:** Token not included in request
**Solution:**
```javascript
// Angular - verify interceptor is registered
// React Native - verify token is in SecureStore
const token = await SecureStore.getItemAsync('auth_token');
console.log('Token:', token);
```

### "CORS Error" in Browser

**Problem:** Frontend domain blocked by API
**Solution:**
```php
// Add to config/cors.php
'allowed_origins' => ['http://localhost:3000', 'http://localhost:4200'],
```

### Token Expired - 401 Error

**Problem:** Token lifespan exceeded
**Solution:**
```javascript
// Setup automatic refresh 24 hours before expiry
if (expiryDate - now < 24 * 60 * 60 * 1000) {
  await refreshToken();
}
```

### "Cannot POST /api/auth/register"

**Problem:** Wrong API URL or route not defined
**Solution:**
```bash
# Verify routes are registered
php artisan route:list | grep auth

# Check API base path
echo http://localhost:8000/api/auth/register
```

### Validation Error 422

**Problem:** Invalid input data
**Solution:**
```javascript
// Check error response format
{
  "message": "Validation failed",
  "errors": {
    "email": ["Email already exists"],
    "password": ["Password must be at least 8 characters"]
  }
}

// Fix each field error before resubmitting
```

### "Connection refused" or "Network error"

**Problem:** Backend not running or wrong URL
**Solution:**
```bash
# Check backend is running
ps aux | grep "php artisan serve"

# Verify API URL
echo $API_URL  # Should output http://localhost:8000/api

# Test connectivity
curl -I http://localhost:8000/api/health
```

### Tokens Not Persisting

**Problem:** Storage issues
**Solution:**

**Angular (localStorage):**
```javascript
// Verify token is saved
console.log(localStorage.getItem('auth_token'));

// Check browser DevTools → Application → Storage
```

**React Native (SecureStore):**
```javascript
// Verify token is stored
try {
  const token = await SecureStore.getItemAsync('economia_token');
  console.log('Token exists:', !!token);
} catch (error) {
  console.error('SecureStore error:', error);
}
```

---

## API Testing with Postman

### Import Collection

Create new collection with these endpoints:

#### 1. Register
```
POST http://localhost:8000/api/auth/register
Body (JSON):
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "SecurePass123!",
  "password_confirmation": "SecurePass123!"
}
Response: 201 Created with token
```

#### 2. Login
```
POST http://localhost:8000/api/auth/login
Body (JSON):
{
  "email": "john@example.com",
  "password": "SecurePass123!"
}
Response: 200 OK with token
```

#### 3. Get Current User
```
GET http://localhost:8000/api/me
Headers:
  Authorization: Bearer <token_from_login>
Response: 200 OK with user data
```

#### 4. List Access Levels
```
GET http://localhost:8000/api/access-levels
Headers:
  Authorization: Bearer <token>
Response: 200 OK with 3 levels (public, jindungo, restricted)
```

#### 5. Request Access
```
POST http://localhost:8000/api/access-requests
Headers:
  Authorization: Bearer <token>
Body (JSON):
{
  "access_level_id": "jindungo"
}
Response: 201 Created with request details
```

---

## Database Schema Reference

### Key Tables

#### users
```sql
- id (UUID)
- name (string)
- email (string, unique)
- password_hash (string)
- email_verified (boolean)
- is_active (boolean)
- role (string)
- created_at, updated_at
```

#### user_sessions
```sql
- id (UUID)
- user_id (UUID, FK)
- token (string)
- expires_at (datetime)
- revoked_at (datetime)
```

#### access_levels
```sql
- id (UUID)
- name (string)
- description (text)
- auto_grant (boolean)
- created_at
```

#### user_access_requests
```sql
- id (UUID)
- user_id (UUID, FK)
- access_level_id (UUID, FK)
- status (enum: pending, approved, rejected)
- requested_at, reviewed_at
```

#### user_access_grants
```sql
- id (UUID)
- user_id (UUID, FK)
- access_level_id (UUID, FK)
- granted_at
- revoked_at (nullable)
```

#### notifications
```sql
- id (UUID)
- user_id (UUID, FK)
- type (string)
- subject (string)
- message (text)
- read_at (nullable)
- created_at
```

---

## File Structure Reference

### Backend (Laravel)
```
backend/
├── app/
│   ├── Http/
│   │   ├── Controllers/Api/
│   │   │   ├── AuthController.php
│   │   │   ├── AccessController.php
│   │   │   └── NotificationController.php
│   │   └── Middleware/
│   │       └── AuthenticateApiSession.php
│   └── Models/
│       ├── User.php
│       └── Notification.php
├── database/
│   ├── migrations/
│   └── seeders/
├── routes/
│   └── api.php
└── .env
```

### Frontend (Angular)
```
frontend-web/
├── src/
│   ├── app/
│   │   ├── services/
│   │   │   ├── auth.service.ts
│   │   │   ├── access.service.ts
│   │   │   └── notification.service.ts
│   │   ├── interceptors/
│   │   │   └── auth.interceptor.ts
│   │   ├── guards/
│   │   │   └── auth.guard.ts
│   │   └── components/
│   ├── environments/
│   │   ├── environment.ts
│   │   └── environment.prod.ts
│   └── app.module.ts
└── angular.json
```

### Mobile (React Native)
```
frontend-mobile/
├── src/
│   ├── services/
│   │   ├── authService.js
│   │   ├── accessService.js
│   │   └── notificationService.js
│   ├── context/
│   │   └── AuthContext.js
│   ├── navigation/
│   │   └── RootNavigator.js
│   ├── screens/
│   │   ├── auth/
│   │   └── app/
│   └── config/
│       └── env.js
├── App.js
├── package.json
└── app.json
```

---

## Environment Variables Reference

### Backend (.env)
```bash
APP_NAME="Economia com História"
APP_URL=http://localhost:8000
API_URL=http://localhost:8000

DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=economia_historia_angola
DB_USERNAME=root
DB_PASSWORD=

MAIL_MAILER=resend
MAIL_FROM_ADDRESS="onboarding@resend.dev"
RESEND_API_KEY=your_key_here
```

### Frontend Web (.env)
```
VITE_API_URL=http://localhost:8000
VITE_API_BASE_PATH=/api
```

### Mobile (.env)
```
API_URL=http://localhost:8000/api
STORAGE_KEY_TOKEN=economia_token
```

---

## Performance Tips

1. **Token Refresh**: Refresh tokens 24 hours before expiry
2. **Pagination**: Always use pagination for list endpoints (default 15-20 items)
3. **Caching**: Cache user data locally to reduce API calls
4. **Lazy Loading**: Load notifications and access levels on-demand
5. **Error Retry**: Implement exponential backoff for network errors
6. **Batch Operations**: Combine multiple requests when possible

---

## Security Checklist

- [ ] Use HTTPS in production
- [ ] Store tokens in secure storage (SecureStore for mobile, httpOnly cookies for web)
- [ ] Validate all inputs on both frontend and backend
- [ ] Implement rate limiting for authentication endpoints
- [ ] Use CSRF tokens for form submissions
- [ ] Sanitize user-generated content
- [ ] Keep dependencies updated
- [ ] Enable CORS only for trusted domains
- [ ] Use environment variables for sensitive config
- [ ] Implement logging for security events

---

## Support Resources

- **Documentation**: `/docs/api/` directory
- **Code Examples**: Integration guides for Angular and React Native
- **Database**: Schema in `database/migrations/`
- **API Reference**: Comprehensive endpoint documentation
- **Error Handling**: Detailed error codes and solutions

---

## Next Steps

1. **Setup Backend**: Follow backend installation steps
2. **Test API**: Use Postman collection to verify endpoints
3. **Choose Frontend**: Select Angular (web) or React Native (mobile)
4. **Integrate Services**: Copy service files to your project
5. **Setup Authentication**: Implement AuthService and interceptors
6. **Build UI**: Create screens/components
7. **Test End-to-End**: Verify full authentication flow
8. **Deploy**: Move to production with updated environment variables

---

**Last Updated:** June 1, 2026  
**Version:** 1.0.0  
**Status:** Production Ready
