# Error Handling & Status Codes

Complete guide for handling errors, status codes, and error responses in the API.

## HTTP Status Codes

### 2xx Success

| Code | Name | When Used |
|------|------|-----------|
| 200 | OK | Successful request, returning data |
| 201 | Created | Resource successfully created |
| 204 | No Content | Successful request, no content returned |

### 4xx Client Errors

| Code | Name | When Used | Example |
|------|------|-----------|---------|
| 400 | Bad Request | Malformed request syntax | Missing required headers |
| 401 | Unauthorized | Missing/invalid authentication | Invalid token or expired |
| 403 | Forbidden | User lacks permission | No access to resource |
| 404 | Not Found | Resource doesn't exist | Unknown user ID |
| 409 | Conflict | Request conflicts with existing state | Duplicate access request |
| 422 | Unprocessable Entity | Validation error on input | Invalid email format |
| 429 | Too Many Requests | Rate limit exceeded | Too many login attempts |

### 5xx Server Errors

| Code | Name | When Used |
|------|------|-----------|
| 500 | Internal Server Error | Unexpected server error |
| 503 | Service Unavailable | Server temporarily unavailable |

---

## Error Response Format

All error responses follow a consistent JSON structure:

### Standard Error Response

```json
{
  "message": "Human-readable error description",
  "errors": {
    "field_name": [
      "First error message",
      "Second error message"
    ]
  },
  "status_code": 422
}
```

### Simple Error Response

For non-validation errors:

```json
{
  "message": "Error description",
  "status_code": 401
}
```

---

## Common Error Scenarios

### 1. Missing Authentication Token

**Request:**
```http
GET /me
```

**Response: 401 Unauthorized**
```json
{
  "message": "Unauthorized - Missing or invalid token",
  "status_code": 401
}
```

**Fix:**
```http
GET /me
Authorization: Bearer <token>
```

---

### 2. Expired Token

**Request:**
```http
GET /me
Authorization: Bearer expired_token_here
```

**Response: 401 Unauthorized**
```json
{
  "message": "Token has expired. Please refresh or login again.",
  "status_code": 401
}
```

**Fix:**
```http
POST /auth/refresh
Authorization: Bearer expired_token_here
```

---

### 3. Insufficient Permissions

**Request:**
```http
PATCH /access-requests/123
Authorization: Bearer <user_token>
Body: { "status": "approved" }
```

**Response: 403 Forbidden**
```json
{
  "message": "You do not have permission to review access requests.",
  "status_code": 403
}
```

**Fix:**
Use admin token instead of regular user token.

---

### 4. Validation Errors

**Request:**
```http
POST /auth/register
Content-Type: application/json

{
  "name": "João",
  "email": "invalid-email",
  "password": "short"
}
```

**Response: 422 Unprocessable Entity**
```json
{
  "message": "The given data was invalid.",
  "errors": {
    "email": [
      "The email field must be a valid email."
    ],
    "password": [
      "The password must be at least 8 characters."
    ]
  },
  "status_code": 422
}
```

**Fix:**
Correct all validation errors before resubmitting.

---

### 5. Resource Not Found

**Request:**
```http
GET /notifications/invalid_id
Authorization: Bearer <token>
```

**Response: 404 Not Found**
```json
{
  "message": "The specified notification was not found.",
  "status_code": 404
}
```

**Fix:**
Verify the resource ID exists before requesting.

---

### 6. Conflict - Duplicate Request

**Request:**
```http
POST /access-requests
Content-Type: application/json

{
  "access_level_id": "jindungo"
}
```

**Response: 409 Conflict** (user already has pending request)
```json
{
  "message": "You already have an active request for this access level.",
  "status_code": 409
}
```

**Fix:**
Check user's existing requests before creating new one:
```http
GET /access-requests?status=pending
```

---

### 7. Rate Limiting

**Request:**
```
Multiple login attempts in short time
```

**Response: 429 Too Many Requests**
```json
{
  "message": "Too many login attempts. Please try again in 15 minutes.",
  "headers": {
    "Retry-After": "900"
  },
  "status_code": 429
}
```

**Fix:**
Wait for the duration specified in `Retry-After` header.

---

### 8. Server Error

**Request:**
```
Any request during server maintenance/outage
```

**Response: 500 Internal Server Error**
```json
{
  "message": "An unexpected error occurred. Please try again later.",
  "status_code": 500
}
```

**Fix:**
- Retry after a few seconds
- If error persists, contact support
- Check system status page

---

## Frontend Error Handling

### Angular Example

```typescript
// HTTP Interceptor for error handling
import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpErrorResponse } from '@angular/common/http';
import { catchError, throwError } from 'rxjs';

@Injectable()
export class ErrorInterceptor implements HttpInterceptor {
  constructor(private authService: AuthService, private router: Router) {}

  intercept(request: HttpRequest<any>, next: HttpHandler) {
    return next.handle(request).pipe(
      catchError((error: HttpErrorResponse) => {
        switch (error.status) {
          case 401:
            // Token expired or invalid
            this.authService.logout();
            this.router.navigate(['/login']);
            break;
          
          case 403:
            // Forbidden
            this.router.navigate(['/forbidden']);
            break;
          
          case 404:
            // Not found
            console.error('Resource not found', error);
            break;
          
          case 422:
            // Validation error - extract field errors
            if (error.error.errors) {
              Object.keys(error.error.errors).forEach(field => {
                console.error(`${field}: ${error.error.errors[field].join(', ')}`);
              });
            }
            break;
          
          case 429:
            // Rate limited
            alert('Too many attempts. Please try again later.');
            break;
          
          case 500:
            // Server error
            alert('Server error. Please try again later.');
            break;
        }
        
        return throwError(() => error);
      })
    );
  }
}

// Service method with error handling
login(email: string, password: string): Observable<any> {
  return this.http.post('/auth/login', { email, password }).pipe(
    tap(response => {
      localStorage.setItem('auth_token', response.token);
    }),
    catchError(error => {
      let message = 'Login failed';
      if (error.status === 401) {
        message = 'Invalid email or password';
      } else if (error.status === 422) {
        message = error.error.errors ? 
          Object.values(error.error.errors).flat().join(', ') : 
          error.error.message;
      }
      return throwError(() => new Error(message));
    })
  );
}

// Component usage
loginForm.onSubmit = () => {
  this.authService.login(email, password).subscribe({
    next: (response) => {
      this.router.navigate(['/dashboard']);
    },
    error: (error) => {
      this.errorMessage = error.message;
    }
  });
};
```

### React Native Example

```javascript
import * as SecureStore from 'expo-secure-store';

const handleApiError = async (error, navigation) => {
  if (error.response) {
    const status = error.response.status;
    const data = error.response.data;
    
    switch (status) {
      case 401:
        // Token expired or invalid
        await SecureStore.deleteItemAsync('auth_token');
        navigation.navigate('Login');
        showAlert('Session expired. Please login again.');
        break;
      
      case 403:
        showAlert('You do not have permission to access this resource.');
        break;
      
      case 404:
        showAlert('Resource not found.');
        break;
      
      case 422:
        // Validation errors
        if (data.errors) {
          const errorMessages = Object.keys(data.errors)
            .map(field => data.errors[field].join(', '))
            .join('\n');
          showAlert('Validation Error:\n' + errorMessages);
        } else {
          showAlert(data.message);
        }
        break;
      
      case 429:
        showAlert('Too many requests. Please try again later.');
        break;
      
      case 500:
        showAlert('Server error. Please try again later.');
        break;
      
      default:
        showAlert(data.message || 'An error occurred');
    }
  } else if (error.request) {
    showAlert('No response from server. Check your connection.');
  } else {
    showAlert('Error: ' + error.message);
  }
};

// API call with error handling
const login = async (email, password, navigation) => {
  try {
    const response = await axios.post(`${API_URL}/auth/login`, {
      email,
      password
    });
    
    await SecureStore.setItemAsync('auth_token', response.data.token);
    navigation.navigate('Home');
  } catch (error) {
    handleApiError(error, navigation);
  }
};

// Form submission
const handleLoginPress = async () => {
  if (!email || !password) {
    showAlert('Please fill in all fields');
    return;
  }
  
  setLoading(true);
  try {
    await login(email, password, navigation);
  } finally {
    setLoading(false);
  }
};
```

---

## Error Recovery Strategies

### 1. Automatic Token Refresh

When receiving 401 error:

```javascript
const refreshToken = async () => {
  try {
    const response = await fetch(`${API_URL}/auth/refresh`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${currentToken}`
      }
    });
    
    if (response.ok) {
      const data = await response.json();
      localStorage.setItem('auth_token', data.token);
      // Retry original request
      return retryOriginalRequest();
    } else {
      // Refresh failed, need to login again
      navigation.navigate('Login');
    }
  } catch (error) {
    navigation.navigate('Login');
  }
};
```

### 2. Retry with Exponential Backoff

For network errors:

```javascript
const retryWithBackoff = async (fn, maxRetries = 3, delay = 1000) => {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      if (i === maxRetries - 1) throw error;
      await new Promise(resolve => setTimeout(resolve, delay));
      delay *= 2; // Exponential backoff
    }
  }
};

// Usage
const fetchNotifications = async () => {
  return retryWithBackoff(async () => {
    const response = await fetch(`${API_URL}/notifications`);
    if (!response.ok) throw new Error(response.statusText);
    return response.json();
  });
};
```

### 3. Form Validation Feedback

Show field-specific errors:

```javascript
// Angular template
<form [formGroup]="loginForm" (ngSubmit)="onSubmit()">
  <input formControlName="email" placeholder="Email">
  <p class="error" *ngIf="loginForm.get('email')?.errors">
    {{ loginForm.get('email')?.errors | json }}
  </p>
  
  <input formControlName="password" placeholder="Password">
  <p class="error" *ngIf="loginForm.get('password')?.errors">
    {{ loginForm.get('password')?.errors | json }}
  </p>
  
  <button type="submit">Login</button>
</form>

// React Native
<TextInput
  placeholder="Email"
  value={email}
  onChangeText={setEmail}
  style={[styles.input, emailError && styles.inputError]}
/>
{emailError && <Text style={styles.errorText}>{emailError}</Text>}
```

---

## Debugging Tips

### 1. Use Network Inspector

Browser DevTools or Postman to inspect:
- Request headers (Authorization, Content-Type)
- Request body (JSON formatting)
- Response status codes
- Response headers (Retry-After, etc.)

### 2. Log API Calls

```javascript
// Axios interceptor for logging
axios.interceptors.request.use(config => {
  console.log('API Request:', config.method.toUpperCase(), config.url);
  console.log('Headers:', config.headers);
  console.log('Body:', config.data);
  return config;
});

axios.interceptors.response.use(
  response => {
    console.log('API Response:', response.status, response.data);
    return response;
  },
  error => {
    console.error('API Error:', error.response?.status, error.response?.data);
    return Promise.reject(error);
  }
);
```

### 3. Check Environment Variables

```bash
# Verify API URL is correct
echo $VITE_API_URL
echo $API_URL

# Test API connectivity
curl -I http://localhost:8000/api
```

---

## Support

**When reporting errors:**
1. Include HTTP status code
2. Provide full error response JSON
3. List steps to reproduce
4. Attach API request details
5. Check server logs for more details

**Server Logs Location:**
```bash
# Laravel logs
storage/logs/laravel.log

# Tail logs in real-time
tail -f storage/logs/laravel.log
```

---

**Last Updated:** June 1, 2026
