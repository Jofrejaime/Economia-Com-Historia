# 👤 API de Perfis - Documentação Completa

**Versão:** 1.0.0  
**Base URL:** `http://127.0.0.1:8000/api`  
**Autenticação:** Bearer Token (Obrigatório)

---

## 📋 Índice

1. [GET /profile](#get-profile)
2. [PUT /profile](#put-profile)
3. [POST /profile/avatar](#post-profileavatar)
4. [PUT /profile/password](#put-profilepassword)
5. [Validações](#validações)
6. [Exemplos Angular](#exemplos-angular)

---

## 🔒 GET /profile - Obter Perfil

**Descrição:** Retorna o perfil do utilizador autenticado.

**Request:**
```http
GET /api/profile HTTP/1.1
Host: 127.0.0.1:8000
Authorization: Bearer xyz123abc...
```

**Response (200 OK):**
```json
{
  "profile": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "user_id": "550e8400-e29b-41d4-a716-446655440001",
    "display_name": "João Silva",
    "full_name": "João Pedro da Silva",
    "institution": "ISPTEC",
    "province": "Luanda",
    "bio": "Estudante de economia com foco em história",
    "website_url": "https://joao-silva.com",
    "research_areas": ["Economia", "História", "Desenvolvimento"],
    "avatar_url": "http://127.0.0.1:8000/storage/avatars/.../abc123.jpg",
    "created_at": "2024-06-02T10:00:00Z",
    "updated_at": "2024-06-02T15:30:00Z"
  }
}
```

**Response (404 Not Found):**
```json
{
  "message": "Profile not found."
}
```

---

## 🔒 PUT /profile - Atualizar Perfil

**Descrição:** Atualiza dados do perfil do utilizador. Todos os campos são opcionais.

**Request:**
```http
PUT /api/profile HTTP/1.1
Host: 127.0.0.1:8000
Authorization: Bearer xyz123abc...
Content-Type: application/json

{
  "display_name": "João Pedro Silva",
  "full_name": "João Pedro da Silva Santos",
  "institution": "Universidade Agostinho Neto",
  "province": "Benguela",
  "bio": "Investigador em história económica",
  "website_url": "https://novo-site.com",
  "research_areas": ["História Económica", "Economia Colonial", "Comércio Atlântico"]
}
```

**Validações:**
| Campo | Validação |
|-------|-----------|
| display_name | string, max:100 |
| full_name | nullable, string, max:255 |
| institution | nullable, string, max:255 |
| province | nullable, string, in:18_provincias |
| bio | nullable, string, max:2000 |
| website_url | nullable, string, url, max:500 |
| research_areas | nullable, array, max:10 items |
| research_areas.* | string, max:100 cada |

**Response (200 OK):**
```json
{
  "message": "Profile updated successfully.",
  "profile": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "user_id": "550e8400-e29b-41d4-a716-446655440001",
    "display_name": "João Pedro Silva",
    "full_name": "João Pedro da Silva Santos",
    "institution": "Universidade Agostinho Neto",
    "province": "Benguela",
    "bio": "Investigador em história económica",
    "website_url": "https://novo-site.com",
    "research_areas": ["História Económica", "Economia Colonial", "Comércio Atlântico"],
    "avatar_url": "...",
    "updated_at": "2024-06-02T16:00:00Z"
  }
}
```

**Response (422 Validation Error):**
```json
{
  "message": "The website url field must be a valid URL.",
  "errors": {
    "website_url": ["The website url field must be a valid URL."],
    "province": ["The selected province is invalid."]
  }
}
```

---

## 🔒 POST /profile/avatar - Upload de Avatar

**Descrição:** Faz upload de novo avatar. Deleta avatar antigo automaticamente.

**Request:**
```http
POST /api/profile/avatar HTTP/1.1
Host: 127.0.0.1:8000
Authorization: Bearer xyz123abc...
Content-Type: multipart/form-data

[File: avatar]
```

**Validações:**
| Campo | Validação |
|-------|-----------|
| avatar | required, image, mimes:jpeg,png,gif,webp, max:5120KB, dimensions:100-2000px |

**Response (200 OK):**
```json
{
  "message": "Avatar uploaded successfully.",
  "avatar_url": "http://127.0.0.1:8000/storage/avatars/.../xyz789.jpg"
}
```

**Response (422 Validation Error):**
```json
{
  "message": "The avatar field has invalid image dimensions.",
  "errors": {
    "avatar": [
      "The avatar field has invalid image dimensions.",
      "The avatar field must not be greater than 5120 kilobytes."
    ]
  }
}
```

**Possíveis Erros:**
- ❌ Arquivo não é imagem
- ❌ Formato não suportado (não é JPEG, PNG, GIF ou WebP)
- ❌ Arquivo > 5MB
- ❌ Imagem < 100x100px
- ❌ Imagem > 2000x2000px

---

## 🔒 PUT /profile/password - Mudar Password

**Descrição:** Altera a password do utilizador. Revoga todas as outras sessões.

**Request:**
```http
PUT /api/profile/password HTTP/1.1
Host: 127.0.0.1:8000
Authorization: Bearer xyz123abc...
Content-Type: application/json

{
  "current_password": "OldPassword123!",
  "password": "NewPassword456!",
  "password_confirmation": "NewPassword456!"
}
```

**Validações:**
| Campo | Validação |
|-------|-----------|
| current_password | required, string |
| password | required, min:8, mixedCase, numbers, symbols, uncompromised, confirmed |

**Requisitos de Password:**
- ✅ Mínimo 8 caracteres
- ✅ Maiúsculas (A-Z)
- ✅ Minúsculas (a-z)
- ✅ Números (0-9)
- ✅ Símbolos (!@#$%^&*)
- ✅ Não estar em vazamentos conhecidos

**Response (200 OK):**
```json
{
  "message": "Password changed successfully. Other sessions have been revoked."
}
```

**Response (422 - Password Atual Errada):**
```json
{
  "message": "Current password is incorrect.",
  "errors": {
    "current_password": ["The current password is incorrect."]
  }
}
```

**Response (422 - Password Inválida):**
```json
{
  "message": "The password field must contain at least one uppercase character.",
  "errors": {
    "password": [
      "The password field must contain at least one uppercase character.",
      "The password field must contain at least one number.",
      "The password field must contain at least one symbol."
    ]
  }
}
```

---

## ✅ Validações

### Províncias Angolanas (18)
```
Bengo, Benguela, Bié, Cabinda, Cuando Cubango,
Cuanza Norte, Cuanza Sul, Cunene, Huambo, Huíla,
Luanda, Lunda Norte, Lunda Sul, Malanje, Moxico,
Namibe, Uíge, Zaire
```

### Dimensões de Avatar
- Mínimo: 100x100 pixels
- Máximo: 2000x2000 pixels
- Formatos: JPEG, PNG, GIF, WebP
- Tamanho máximo: 5MB

### Research Areas
- Máximo 10 itens
- Cada item máximo 100 caracteres

### Bio
- Máximo 2000 caracteres

---

## 💻 Exemplos Angular

### Usando ProfileService (já existe)

```typescript
import { ProfileService } from './services/profile.service';

export class ProfileComponent implements OnInit {
  profile: any;
  isLoading = false;
  error: string | null = null;

  constructor(private profileService: ProfileService) {}

  ngOnInit() {
    this.loadProfile();
  }

  async loadProfile() {
    this.isLoading = true;
    this.error = null;

    try {
      const response = await this.profileService.getProfile();
      this.profile = response.profile;
    } catch (error) {
      this.error = error instanceof Error ? error.message : 'Erro ao carregar perfil';
    } finally {
      this.isLoading = false;
    }
  }

  async updateProfile() {
    this.isLoading = true;
    this.error = null;

    try {
      const response = await this.profileService.updateProfile({
        display_name: this.profile.display_name,
        bio: this.profile.bio,
        website_url: this.profile.website_url,
        research_areas: this.profile.research_areas,
      });

      this.profile = response.profile;
      console.log('Perfil atualizado com sucesso!');
    } catch (error) {
      this.error = error instanceof Error ? error.message : 'Erro ao atualizar perfil';
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
      console.log('Avatar atualizado com sucesso!');
    } catch (error) {
      this.error = error instanceof Error ? error.message : 'Erro ao atualizar avatar';
    } finally {
      this.isLoading = false;
    }
  }

  async changePassword() {
    const currentPassword = prompt('Password atual:');
    const newPassword = prompt('Nova password:');
    const confirmPassword = prompt('Confirmar nova password:');

    if (!currentPassword || !newPassword || confirmPassword !== newPassword) {
      this.error = 'Dados inválidos';
      return;
    }

    this.isLoading = true;
    this.error = null;

    try {
      await this.profileService.updatePassword({
        current_password: currentPassword,
        password: newPassword,
        password_confirmation: confirmPassword,
      });

      console.log('Password alterada com sucesso!');
      alert('Password alterada! Outras sessões foram revogadas.');
    } catch (error) {
      this.error = error instanceof Error ? error.message : 'Erro ao alterar password';
    } finally {
      this.isLoading = false;
    }
  }
}
```

### Template HTML

```html
<div *ngIf="isLoading" class="spinner">Carregando...</div>

<div *ngIf="error" class="alert alert-error">{{ error }}</div>

<div *ngIf="profile && !isLoading" class="profile-form">
  <!-- Avatar -->
  <div class="avatar-section">
    <img [src]="profile.avatar_url || '/default-avatar.png'" alt="Avatar" />
    <input type="file" #avatarInput (change)="uploadAvatar($event)" accept="image/*" />
    <button (click)="avatarInput.click()">Alterar Avatar</button>
  </div>

  <!-- Display Name -->
  <div class="form-group">
    <label>Nome de Exibição</label>
    <input [(ngModel)]="profile.display_name" type="text" />
  </div>

  <!-- Full Name -->
  <div class="form-group">
    <label>Nome Completo</label>
    <input [(ngModel)]="profile.full_name" type="text" />
  </div>

  <!-- Institution -->
  <div class="form-group">
    <label>Instituição</label>
    <input [(ngModel)]="profile.institution" type="text" />
  </div>

  <!-- Province -->
  <div class="form-group">
    <label>Província</label>
    <select [(ngModel)]="profile.province">
      <option value="">Selecione...</option>
      <option value="Bengo">Bengo</option>
      <option value="Benguela">Benguela</option>
      <option value="Bié">Bié</option>
      <option value="Cabinda">Cabinda</option>
      <!-- ... outras províncias -->
    </select>
  </div>

  <!-- Bio -->
  <div class="form-group">
    <label>Biografia (máx. 2000 caracteres)</label>
    <textarea [(ngModel)]="profile.bio" maxlength="2000"></textarea>
    <small>{{ profile.bio?.length || 0 }}/2000</small>
  </div>

  <!-- Website -->
  <div class="form-group">
    <label>Website</label>
    <input [(ngModel)]="profile.website_url" type="url" />
  </div>

  <!-- Research Areas -->
  <div class="form-group">
    <label>Áreas de Pesquisa (máx. 10)</label>
    <div *ngFor="let area of profile.research_areas">
      <input [(ngModel)]="area" type="text" />
    </div>
    <button (click)="profile.research_areas.push('')" [disabled]="profile.research_areas.length >= 10">
      Adicionar Área
    </button>
  </div>

  <!-- Buttons -->
  <div class="actions">
    <button (click)="updateProfile()" [disabled]="isLoading">Guardar Perfil</button>
    <button (click)="changePassword()" [disabled]="isLoading">Alterar Password</button>
  </div>
</div>
```

---

## 🔐 Segurança

### Implementado
- ✅ Token obrigatório em todas as rotas
- ✅ Password verification antes de alterar
- ✅ Avatar uploaded com nome aleatório
- ✅ Validação de tipos de arquivo
- ✅ Limite de tamanho

### Recomendações
- ✅ Usar HTTPS em produção
- ✅ Validar dados no frontend também
- ✅ Mostrar feedback visual ao utilizador
- ✅ Tratar erros adequadamente

---

**Última Atualização:** 02/06/2026  
**Status:** ✅ Completo
