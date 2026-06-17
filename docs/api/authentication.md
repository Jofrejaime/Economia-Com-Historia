# 🔐 API de Autenticação - Documentação Completa

**Versão:** 1.0.0  
**Base URL:** `http://127.0.0.1:8000/api`  
**Autenticação:** Bearer Token (JWT)

---

## 📋 Índice

1. [Endpoints Públicos](#endpoints-públicos)
2. [Endpoints Protegidos](#endpoints-protegidos)
3. [Modelos de Dados](#modelos-de-dados)
4. [Códigos de Erro](#códigos-de-erro)
5. [Exemplos de Uso](#exemplos-de-uso)

---

## 🔓 Endpoints Públicos

### POST /auth/register - Registar Novo Utilizador

**Descrição:** Cria uma nova conta de utilizador com perfil associado.

**Request:**
```http
POST /api/auth/register HTTP/1.1
Host: 127.0.0.1:8000
Content-Type: application/json

{
  "email": "student@example.com",
  "password": "MyPassword123!",
  "password_confirmation": "MyPassword123!",
  "display_name": "João Silva",
  "full_name": "João Pedro da Silva",
  "institution": "ISPTEC",
  "province": "Luanda",
  "role": "estudante"
}
```

**Validações:**
| Campo | Tipo | Validação |
|-------|------|-----------|
| email | string | required, email, unique, max:255 |
| password | string | required, min:8, mixedCase, numbers, symbols, uncompromised, confirmed |
| display_name | string | required, max:100 |
| full_name | string | nullable, max:255 |
| institution | string | nullable, max:255 |
| province | string | nullable, in:list_of_18_provinces |
| role | string | nullable, in:estudante,investigador,professor (admin não permitido no registo público) |

**Response (201 Created):**
```json
{
  "message": "Registered successfully.",
  "token": "xyz123abc...",
  "verification_token": "verification_token_123...",
  "user": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "email": "student@example.com",
    "email_verified": false,
    "is_active": true,
    "role": "estudante",
    "created_at": "2024-06-02T10:00:00Z",
    "updated_at": "2024-06-02T10:00:00Z"
  }
}
```

**Response (422 Validation Error):**
```json
{
  "message": "The email field must be a valid email address.",
  "errors": {
    "email": ["The email field must be a valid email address."],
    "password": ["The password field must contain at least one uppercase character."]
  }
}
```

---

### POST /auth/login - Autenticar Utilizador

**Descrição:** Autentica um utilizador e retorna token de sessão.

**Request:**
```http
POST /api/auth/login HTTP/1.1
Host: 127.0.0.1:8000
Content-Type: application/json

{
  "email": "student@example.com",
  "password": "MyPassword123!"
}
```

**Response (200 OK):**
```json
{
  "message": "Login successful.",
  "token": "xyz123abc...",
  "user": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "email": "student@example.com",
    "email_verified": true,
    "is_active": true,
    "role": "estudante",
    "last_login_at": "2024-06-02T15:30:00Z"
  }
}
```

**Response (422 Invalid Credentials):**
```json
{
  "message": "Invalid credentials."
}
```

---

### POST /auth/forgot-password - Solicitar Reset de Password

**Descrição:** Envia email com link de reset de password.

**Request:**
```http
POST /api/auth/forgot-password HTTP/1.1
Host: 127.0.0.1:8000
Content-Type: application/json

{
  "email": "student@example.com"
}
```

**Response (200 OK):**
```json
{
  "message": "If this email exists, a reset link has been sent."
}
```

⚠️ **Nota:** Retorna sempre mensagem genérica por segurança (prevenção de email enumeration).

---

### POST /auth/reset-password - Redefinir Password

**Descrição:** Redefine password usando token de reset.

**Request:**
```http
POST /api/auth/reset-password HTTP/1.1
Host: 127.0.0.1:8000
Content-Type: application/json

{
  "token": "reset_token_123...",
  "password": "NewPassword456!",
  "password_confirmation": "NewPassword456!"
}
```

**Response (200 OK):**
```json
{
  "message": "Password reset successfully."
}
```

**Response (422 Invalid Token):**
```json
{
  "message": "Invalid or expired token."
}
```

---

### POST /auth/verify-email - Verificar Email

**Descrição:** Verifica email usando token de verificação.

**Request:**
```http
POST /api/auth/verify-email HTTP/1.1
Host: 127.0.0.1:8000
Content-Type: application/json

{
  "token": "verification_token_123..."
}
```

**Response (200 OK):**
```json
{
  "message": "Email verified successfully."
}
```

---

### POST /auth/resend-verification - Reenviar Email de Verificação

**Descrição:** Reenvia email de verificação com link para o frontend (`FRONTEND_URL/auth/verify-email?token=...`). O campo `verification_token` só aparece na resposta em `local`/`testing` ou se `AUTH_EXPOSE_VERIFICATION_TOKEN=true`.

**Request:**
```http
POST /api/auth/resend-verification HTTP/1.1
Host: 127.0.0.1:8000
Content-Type: application/json

{
  "email": "student@example.com"
}
```

**Response (200 OK):**
```json
{
  "message": "If the account exists, a verification email was sent."
}
```

**Nota:** No registo (`POST /auth/register`) é enviado o mesmo email de verificação. Tipos de token na BD: `email_verification`, `password_reset`, `invite`.

---

## 🔒 Endpoints Protegidos

**Autenticação Requerida:** Todos os endpoints requerem header:
```http
Authorization: Bearer {token}
```

### GET /auth/sessions - Listar Sessões Activas

**Descrição:** Lista sessões do utilizador autenticado (marca `is_current` na sessão do token usado).

**Response (200 OK):** `{ "data": [ { "id", "ip_address", "user_agent", "expires_at", "created_at", "is_current" } ] }`

---

### DELETE /auth/sessions/{id} - Revogar Sessão

**Descrição:** Revoga uma sessão própria por ID.

---

### DELETE /auth/sessions/others - Revogar Outras Sessões

**Descrição:** Revoga todas as sessões excepto a do token actual. Resposta: `{ "message", "revoked_count" }`.

---

### POST /auth/logout - Logout

**Descrição:** Faz logout do utilizador e revoga token de sessão.

**Request:**
```http
POST /api/auth/logout HTTP/1.1
Host: 127.0.0.1:8000
Authorization: Bearer xyz123abc...
```

**Response (200 OK):**
```json
{
  "message": "Logged out."
}
```

---

### POST /auth/refresh - Renovar Token

**Descrição:** Renova token de sessão expirado.

**Request:**
```http
POST /api/auth/refresh HTTP/1.1
Host: 127.0.0.1:8000
Authorization: Bearer xyz123abc...
```

**Response (200 OK):**
```json
{
  "message": "Token refreshed.",
  "token": "new_token_xyz123abc..."
}
```

---

### GET /me - Obter Dados Completos do Utilizador

**Descrição:** Retorna dados do utilizador autenticado, incluindo perfil e access grants.

**Request:**
```http
GET /api/me HTTP/1.1
Host: 127.0.0.1:8000
Authorization: Bearer xyz123abc...
```

**Response (200 OK):**
```json
{
  "user": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "email": "student@example.com",
    "email_verified": true,
    "is_active": true,
    "role": "estudante",
    "created_at": "2024-06-02T10:00:00Z",
    "updated_at": "2024-06-02T10:00:00Z",
    "last_login_at": "2024-06-02T15:30:00Z"
  },
  "profile": {
    "id": "uuid",
    "user_id": "550e8400-e29b-41d4-a716-446655440000",
    "display_name": "João Silva",
    "full_name": "João Pedro da Silva",
    "institution": "ISPTEC",
    "province": "Luanda",
    "bio": "Estudante de economia",
    "website_url": "https://joao.com",
    "research_areas": ["Economia", "História"],
    "avatar_url": "http://127.0.0.1:8000/storage/avatars/.../xyz.jpg",
    "created_at": "2024-06-02T10:00:00Z",
    "updated_at": "2024-06-02T10:00:00Z"
  },
  "access_grants": [
    {
      "id": "uuid",
      "user_id": "550e8400-e29b-41d4-a716-446655440000",
      "access_level_id": "public",
      "granted_at": "2024-06-02T10:00:00Z",
      "access_level_name": "Público",
      "access_level_description": "Acesso automático ao solicitar"
    }
  ]
}
```

---

## 📊 Modelos de Dados

### User Model
```typescript
interface User {
  id: string;                    // UUID
  email: string;                 // Email único
  email_verified: boolean;       // Verificado?
  is_active: boolean;            // Ativo?
  role: 'estudante' | 'investigador' | 'professor' | 'admin';
  created_at: string;            // ISO 8601
  updated_at: string;            // ISO 8601
  last_login_at: string | null;  // ISO 8601
}
```

### Profile Model
```typescript
interface Profile {
  id: string;                           // UUID
  user_id: string;                      // FK User
  display_name: string;                 // Nome de exibição
  full_name: string | null;             // Nome completo
  institution: string | null;           // Instituição
  province: string | null;              // Província
  bio: string | null;                   // Biografia (max 2000)
  website_url: string | null;           // URL (validado)
  research_areas: string[] | null;      // Áreas de pesquisa (max 10)
  avatar_url: string | null;            // URL do avatar
  created_at: string;                   // ISO 8601
  updated_at: string;                   // ISO 8601
}
```

### AccessGrant Model
```typescript
interface AccessGrant {
  id: string;                          // UUID
  user_id: string;                     // FK User
  access_level_id: string;             // FK AccessLevel
  granted_at: string;                  // ISO 8601
  access_level_name: string;           // Nome do nível
  access_level_description: string;    // Descrição
}
```

---

## ❌ Códigos de Erro

### 400 Bad Request
```json
{
  "message": "Solicitação inválida"
}
```

### 401 Unauthenticated
```json
{
  "message": "Unauthenticated."
}
```

### 422 Validation Error
```json
{
  "message": "Erro de validação",
  "errors": {
    "field": ["mensagem de erro"]
  }
}
```

### 404 Not Found
```json
{
  "message": "Recurso não encontrado"
}
```

### 500 Server Error
```json
{
  "message": "Erro interno do servidor"
}
```

---

## 💻 Exemplos de Uso

### JavaScript/TypeScript (Fetch)

```typescript
// Login
const response = await fetch('http://127.0.0.1:8000/api/auth/login', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    email: 'student@example.com',
    password: 'MyPassword123!',
  }),
});

const data = await response.json();
localStorage.setItem('token', data.token);

// Usar token em requisições protegidas
const meResponse = await fetch('http://127.0.0.1:8000/api/me', {
  headers: {
    'Authorization': `Bearer ${data.token}`,
  },
});

const meData = await meResponse.json();
console.log(meData.user);
```

### Angular (Service)

```typescript
// auth.service.ts já existe no projeto
import { AuthService } from './services/auth.service';

export class LoginComponent {
  constructor(private auth: AuthService) {}

  async login() {
    const result = await this.auth.login('student@example.com', 'MyPassword123!');
    
    if (result.ok) {
      this.auth.setSession(result.token!, result.user);
      console.log('Login bem-sucedido!');
    } else {
      console.error(result.message);
    }
  }
}
```

---

## 🔐 Segurança

### Boas Práticas Implementadas
- ✅ Password hashing com bcrypt
- ✅ Password complexity validation
- ✅ Token expiration (30 dias)
- ✅ Session tracking (IP, User-Agent)
- ✅ Email verification
- ✅ Password reset com token temporário (1 hora)
- ✅ Logout revoga todas as outras sessões

### Recomendações para Frontend
- ✅ Guardar token em localStorage/sessionStorage
- ✅ Enviar token em header Authorization
- ✅ Tratar erros 401 (sessão expirada)
- ✅ Renovar token se expirado
- ✅ Fazer logout ao sair

---

## 📝 Províncias Angolanas Válidas

```
Bengo, Benguela, Bié, Cabinda, Cuando Cubango,
Cuanza Norte, Cuanza Sul, Cunene, Huambo, Huíla,
Luanda, Lunda Norte, Lunda Sul, Malanje, Moxico,
Namibe, Uíge, Zaire
```

---

**Última Atualização:** 02/06/2026  
**Status:** ✅ Completo
