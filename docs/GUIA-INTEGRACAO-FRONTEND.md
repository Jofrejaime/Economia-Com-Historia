# 🚀 Guia de Integração - Frontend Angular com Backend

**Data:** 02 de Junho de 2026  
**Frontend:** Angular 21.2.14  
**Backend:** Laravel 11  
**Status:** ✅ Pronto para Integração

---

## 📋 Índice

1. [Configuração Inicial](#configuração-inicial)
2. [Serviços Disponíveis](#serviços-disponíveis)
3. [Componentes de Exemplo](#componentes-de-exemplo)
4. [Fluxos de Autenticação](#fluxos-de-autenticação)
5. [Tratamento de Erros](#tratamento-de-erros)
6. [Checklist de Integração](#checklist-de-integração)

---

## 🔧 Configuração Inicial

### 1️⃣ Verificar Ambiente

**Arquivo:** `src/environments/environment.development.ts`

```typescript
export const environment = {
  production: false,
  apiBaseUrl: 'http://127.0.0.1:8000',
};
```

✅ **Status:** Já configurado

### 2️⃣ Verificar Proxy

**Arquivo:** `proxy.conf.json`

```json
{
  "/api": {
    "target": "http://127.0.0.1:8000",
    "secure": false,
    "changeOrigin": true,
    "logLevel": "debug"
  }
}
```

✅ **Status:** Já configurado

### 3️⃣ Executar com Proxy

```bash
# Comando para rodar com proxy (desenvolvimento)
ng serve --proxy-config proxy.conf.json

# Ou adicionar ao angular.json (serve configuration)
```

---

## 🛠️ Serviços Disponíveis

### AuthService

**Localização:** `src/app/services/auth.service.ts`

**Métodos Disponíveis:**

| Método | Parâmetros | Retorno | Descrição |
|--------|-----------|---------|-----------|
| login() | email, password | Observable<LoginResult> | Autenticar utilizador |
| register() | payload | Observable<RegisterResult> | Registar novo utilizador |
| forgotPassword() | email | Observable<ForgotPasswordResult> | Solicitar reset |
| resetPassword() | payload | Observable<ResetPasswordResult> | Redefinir password |
| setSession() | token, user | void | Guardar sessão |
| clearSession() | - | void | Limpar sessão |
| getToken() | - | string \| null | Obter token |
| getUser() | - | unknown \| null | Obter utilizador |
| isAuthenticated() | - | boolean | Verificar autenticação |
| me() | - | Promise<unknown> | Dados completos do utilizador |
| refresh() | - | Promise<string> | Renovar token |
| logout() | syncServer? | Promise<void> | Fazer logout |

**Exemplo de Uso:**

```typescript
import { AuthService } from './services/auth.service';

export class LoginComponent {
  constructor(private auth: AuthService) {}

  async login(email: string, password: string) {
    const result = await this.auth.login(email, password).toPromise();
    
    if (result?.ok) {
      this.auth.setSession(result.token!, result.user);
      console.log('Login bem-sucedido!');
    } else {
      console.error(result?.message);
    }
  }
}
```

---

### ProfileService

**Localização:** `src/app/services/profile.service.ts`

**Métodos Disponíveis:**

| Método | Parâmetros | Retorno | Descrição |
|--------|-----------|---------|-----------|
| getMe() | - | Promise<MeResponse> | Dados completos (user + profile + grants) |
| getProfile() | - | Promise<{profile}> | Apenas perfil |
| updateProfile() | payload | Promise<{message, profile}> | Atualizar perfil |
| updateAvatar() | avatar: File | Promise<{message, avatar_url}> | Upload avatar |
| updatePassword() | payload | Promise<{message}> | Alterar password |

**Exemplo de Uso:**

```typescript
import { ProfileService } from './services/profile.service';

export class ProfileComponent implements OnInit {
  profile: any;

  constructor(private profileService: ProfileService) {}

  async ngOnInit() {
    const response = await this.profileService.getMe();
    this.profile = response.profile;
  }

  async updateProfile() {
    await this.profileService.updateProfile({
      display_name: 'Novo Nome',
      bio: 'Minha bio',
    });
  }
}
```

---

## 💻 Componentes de Exemplo

### 1️⃣ Componente de Login

```typescript
import { Component } from '@angular/core';
import { AuthService } from './services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  template: `
    <form (ngSubmit)="onSubmit()">
      <input [(ngModel)]="email" name="email" type="email" placeholder="Email" />
      <input [(ngModel)]="password" name="password" type="password" placeholder="Password" />
      <button [disabled]="isLoading" type="submit">Login</button>
      <p *ngIf="error" class="error">{{ error }}</p>
    </form>
  `,
})
export class LoginComponent {
  email = '';
  password = '';
  isLoading = false;
  error: string | null = null;

  constructor(private auth: AuthService, private router: Router) {}

  async onSubmit() {
    this.isLoading = true;
    this.error = null;

    try {
      const result = await this.auth.login(this.email, this.password).toPromise();

      if (result?.ok && result.token) {
        this.auth.setSession(result.token, result.user);
        this.router.navigate(['/dashboard']);
      } else {
        this.error = result?.message || 'Erro ao fazer login';
      }
    } catch (err) {
      this.error = 'Erro de conexão';
    } finally {
      this.isLoading = false;
    }
  }
}
```

---

### 2️⃣ Componente de Perfil

```typescript
import { Component, OnInit } from '@angular/core';
import { ProfileService } from './services/profile.service';
import { AuthService } from './services/auth.service';

@Component({
  selector: 'app-profile',
  template: `
    <div *ngIf="!isLoading && profile">
      <!-- Avatar -->
      <div class="avatar-section">
        <img [src]="profile.avatar_url || '/default-avatar.png'" alt="Avatar" />
        <input type="file" #avatarInput (change)="uploadAvatar($event)" accept="image/*" />
        <button (click)="avatarInput.click()" [disabled]="isLoading">Alterar Avatar</button>
      </div>

      <!-- Formulário -->
      <form (ngSubmit)="save()">
        <input [(ngModel)]="profile.display_name" name="display_name" placeholder="Nome de Exibição" />
        <textarea [(ngModel)]="profile.bio" name="bio" placeholder="Bio"></textarea>
        <button [disabled]="isLoading" type="submit">Guardar</button>
      </form>

      <p *ngIf="error" class="error">{{ error }}</p>
      <p *ngIf="success" class="success">Perfil atualizado!</p>
    </div>

    <div *ngIf="isLoading">Carregando...</div>
  `,
})
export class ProfileComponent implements OnInit {
  profile: any;
  isLoading = false;
  error: string | null = null;
  success: string | null = null;

  constructor(
    private profileService: ProfileService,
    private auth: AuthService
  ) {}

  async ngOnInit() {
    await this.load();
  }

  async load() {
    this.isLoading = true;

    try {
      const response = await this.profileService.getMe();
      this.profile = response.profile;
    } catch (err) {
      this.error = err instanceof Error ? err.message : 'Erro ao carregar perfil';
    } finally {
      this.isLoading = false;
    }
  }

  async save() {
    this.isLoading = true;
    this.error = null;
    this.success = null;

    try {
      await this.profileService.updateProfile({
        display_name: this.profile.display_name,
        bio: this.profile.bio,
      });

      this.success = 'Perfil atualizado com sucesso!';
    } catch (err) {
      this.error = err instanceof Error ? err.message : 'Erro ao guardar';
    } finally {
      this.isLoading = false;
    }
  }

  async uploadAvatar(event: any) {
    const file = event.target.files[0];
    if (!file) return;

    this.isLoading = true;
    this.error = null;

    try {
      const response = await this.profileService.updateAvatar(file);
      this.profile.avatar_url = response.avatar_url;
      this.success = 'Avatar atualizado!';
    } catch (err) {
      this.error = err instanceof Error ? err.message : 'Erro ao atualizar avatar';
    } finally {
      this.isLoading = false;
    }
  }
}
```

---

### 3️⃣ Guard de Autenticação

```typescript
import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { AuthService } from './services/auth.service';

@Injectable({ providedIn: 'root' })
export class AuthGuard implements CanActivate {
  constructor(private auth: AuthService, private router: Router) {}

  canActivate(): boolean {
    if (this.auth.isAuthenticated()) {
      return true;
    }

    this.router.navigate(['/login']);
    return false;
  }
}
```

**Uso nas rotas:**

```typescript
export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: 'profile', component: ProfileComponent, canActivate: [AuthGuard] },
  { path: 'dashboard', component: DashboardComponent, canActivate: [AuthGuard] },
];
```

---

## 🔄 Fluxos de Autenticação

### Fluxo de Login

```
1. Utilizador entra email + password
   ↓
2. Frontend chama: auth.login(email, password)
   ↓
3. Backend valida credenciais
   ↓
4. Backend retorna token + user
   ↓
5. Frontend chama: auth.setSession(token, user)
   ↓
6. Frontend redireciona para dashboard
   ↓
7. Utilizador autenticado ✅
```

### Fluxo de Verificação de Sessão

```
1. App inicia
   ↓
2. Guard chama: auth.isAuthenticated()
   ↓
3. Se não há token, redireciona para login
   ↓
4. Se há token, chama: auth.me()
   ↓
5. Se me() falha com 401, chama: auth.refresh()
   ↓
6. Se refresh falha, logout automático
   ↓
7. Se me() sucede, permite acesso ✅
```

### Fluxo de Logout

```
1. Utilizador clica "Logout"
   ↓
2. Frontend chama: auth.logout()
   ↓
3. Backend revoga token na BD
   ↓
4. Frontend limpa localStorage
   ↓
5. Frontend redireciona para login
   ↓
6. Sessão encerrada ✅
```

---

## ❌ Tratamento de Erros

### Erros Comuns

```typescript
// 401 - Token expirado/inválido
if (error.status === 401) {
  this.auth.logout();
  this.router.navigate(['/login']);
}

// 422 - Validação falhou
if (error.status === 422) {
  console.error('Erros de validação:', error.error.errors);
}

// 500 - Erro do servidor
if (error.status === 500) {
  console.error('Erro do servidor');
}
```

### Implementar Retry Automático

```typescript
// Em auth.service.ts - adicionar interceptor
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent } from '@angular/common/http';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  constructor(private auth: AuthService) {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const token = this.auth.getToken();

    if (token) {
      req = req.clone({
        setHeaders: {
          Authorization: `Bearer ${token}`,
        },
      });
    }

    return next.handle(req).pipe(
      catchError((error) => {
        if (error.status === 401) {
          // Token expirado, fazer logout
          this.auth.logout();
        }
        return throwError(() => error);
      })
    );
  }
}
```

---

## ✅ Checklist de Integração

### Frontend Setup
- [ ] Verificar environment.ts (apiBaseUrl)
- [ ] Verificar proxy.conf.json
- [ ] Importar HttpClientModule no app.ts
- [ ] Adicionar AuthGuard às rotas protegidas
- [ ] Implementar AuthInterceptor

### Serviços
- [ ] AuthService disponível
- [ ] ProfileService disponível
- [ ] Ambos injetados com providedIn: 'root'

### Componentes
- [ ] Login component implementado
- [ ] Profile component implementado
- [ ] Dashboard component protegido
- [ ] Navbar com logout

### Testes
- [ ] Testar login com dados válidos
- [ ] Testar login com dados inválidos
- [ ] Testar visualizar perfil
- [ ] Testar atualizar perfil
- [ ] Testar upload avatar
- [ ] Testar logout
- [ ] Testar renovação de token
- [ ] Testar redirecionamento automático

### Backend
- [ ] Backend rodando em http://127.0.0.1:8000
- [ ] Seeders executados (`php artisan migrate:fresh --seed`)
- [ ] Storage link criado (`php artisan storage:link`)
- [ ] Email configurado (Resend API key)

---

## 📝 Dados de Teste

Após executar seeders, use estes logins:

```
Email: student@economia-historia.local
Password: Student@123456

Email: professor@economia-historia.local
Password: Professor@123456

Email: admin@economia-historia.local
Password: Admin@123456
```

---

## 🚀 Próximos Passos

1. **Verificar Backend**
   ```bash
   cd backend
   php artisan migrate:fresh --seed
   php artisan storage:link
   ```

2. **Iniciar Frontend**
   ```bash
   cd frontend-web
   ng serve --proxy-config proxy.conf.json
   ```

3. **Abrir no Browser**
   ```
   http://localhost:4200
   ```

4. **Testar Login**
   - Email: student@economia-historia.local
   - Password: Student@123456

---

## 🎯 Documentação Relacionada

- 📖 [API de Autenticação](./docs/api/authentication.md)
- 👤 [API de Perfis](./docs/api/profiles.md)
- 🔐 [Guia de Upload de Avatar](./docs/meeting-notes/guia-upload-avatar.md)

---

**Status:** ✅ Pronto para Integração  
**Última Atualização:** 02/06/2026
