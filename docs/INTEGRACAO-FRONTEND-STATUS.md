# 🔄 Status de Integração Frontend - /me e /profile

**Data:** 02 de Junho de 2026  
**Componente Analisado:** `frontend-web/src/app/pages/profile/perfil/`  
**Status:** ✅ **PARCIALMENTE INTEGRADO - PRONTO PARA OTIMIZAÇÃO**

---

## 📊 Análise da Integração Atual

### ✅ O QUE JÁ ESTÁ FUNCIONANDO

#### ProfileService Está Sendo Utilizado ✅
```typescript
// No perfil.ts:
constructor(private router: Router, private profileService: ProfileService) {}

async loadProfile(): Promise<void> {
  const me = await this.profileService.getMe();
  const profileResponse = await this.profileService.getProfile();
  const profile = profileResponse?.profile ?? me.profile;
  // ...
}
```

**Endpoints Sendo Chamados:**
- ✅ `getMe()` - GET `/api/me`
- ✅ `getProfile()` - GET `/api/profile`

#### Dados Sendo Exibidos ✅
- ✅ `profile.display_name` - Nome de exibição
- ✅ `profile.institution` - Instituição
- ✅ `profile.bio` - Biografia
- ✅ `profile.avatar_url` - Avatar

---

### ⚠️ O QUE PRECISA SER MELHORADO

#### 1. Tratamento de Erros Incompleto
```typescript
// ATUAL - Simples demais
catch (error) {
  this.profileError = error instanceof Error ? error.message : 'Falha ao carregar o perfil.';
}

// RECOMENDADO - Mais robusto
try {
  // ... tentar getMe()
} catch (meError) {
  console.error('Erro ao carregar /me:', meError);
  try {
    // ... tentar getProfile() como fallback
  } catch (profileError) {
    this.profileError = this.getErrorMessage(profileError);
  }
}
```

#### 2. Dados Mocked Versus Dados Reais
```typescript
// ATUALMENTE - Hardcoded
stats = [
  { label: 'PONTUAÇÃO ACADÉMICA TOTAL', value: '12.450', unit: 'pts', color: '#6b0119', progress: 75 },
  // ...
];

merits: Merit[] = [
  { iconPath: '...', title: 'Mestre da Moeda', ... }
  // ... hardcoded badges
];

userContents: Content[] = [
  { id: 1, title: 'Análise do Sistema Monetário...', ... }
  // ... hardcoded conteúdos
];

// RECOMENDADO - Obter do backend
async loadStats(): Promise<void> {
  const me = await this.profileService.getMe();
  this.stats = this.mapUserLevelToStats(me.user);
}

async loadBadges(): Promise<void> {
  // Chamar endpoint para badges (a ser criado)
  const badges = await this.badgeService.getUserBadges();
  this.merits = this.mapBadgesToMerits(badges);
}

async loadUserContent(): Promise<void> {
  // Chamar endpoint para conteúdos criados
  const contents = await this.contentService.getUserContents();
  this.userContents = contents;
}
```

#### 3. Profile Editing Não Funciona
```typescript
// ATUAL - Só loga no console
editBio(): void {
  console.log('Editar bio académica');
}

// RECOMENDADO - Implementar edição real
async editBio(): Promise<void> {
  const newBio = prompt('Nova bio:');
  if (newBio) {
    try {
      await this.profileService.updateProfile({ bio: newBio });
      this.profileBio = [newBio];
    } catch (error) {
      this.profileError = 'Erro ao atualizar bio';
    }
  }
}
```

#### 4. Avatar Upload Não Implementado
```typescript
// FALTA - Implementar upload de avatar
async uploadAvatar(event: Event): Promise<void> {
  const file = (event.target as HTMLInputElement).files?.[0];
  if (file) {
    try {
      const response = await this.profileService.updateAvatar(file);
      this.profileAvatarUrl = response.avatar_url;
    } catch (error) {
      this.profileError = 'Erro ao fazer upload de avatar';
    }
  }
}
```

#### 5. Toggles de Configuração Não Salvam
```typescript
// ATUAL - Só local, sem salvar no backend
toggleSetting(settingType: string, index: number): void {
  if (settingType === 'privacy') {
    this.settings.privacy[index].checked = !this.settings.privacy[index].checked;
  }
  // ... mas não salva no backend!
}

// RECOMENDADO - Salvar no backend
async togglePrivacySetting(index: number): Promise<void> {
  const setting = this.settings.privacy[index];
  try {
    // Chamar endpoint para salvar (a ser criado)
    await this.settingsService.updatePrivacySetting(setting.key, !setting.checked);
    setting.checked = !setting.checked;
  } catch (error) {
    this.profileError = 'Erro ao atualizar configurações';
  }
}
```

---

## 🎯 Plano de Otimização

### Fase 1: Consolidar Dados Reais do /me e /profile (HOJE)

**Objetivo:** Substituir dados mocked por dados reais do backend

```typescript
// 1. Mapear resposta do /me para stats
private mapUserDataToStats(userData: any): any[] {
  return [
    {
      label: 'PONTUAÇÃO ACADÉMICA TOTAL',
      value: userData.user_levels?.total_points || '0',
      progress: (userData.user_levels?.current_level || 1) * 20
    },
    {
      label: 'QUESTIONÁRIOS CONCLUÍDOS',
      value: userData.user_levels?.quizzes_completed || '0',
      unit: 'de 200 marcos'
    },
    {
      label: 'NÍVEL ATUAL',
      value: userData.user_levels?.current_level || '1',
      subtext: `de 5`
    },
    // ...
  ];
}

// 2. Usar dados reais do profile
private mapProfileData(profile: any): void {
  this.profileName = profile.display_name || 'Sem nome';
  this.profileStatus = profile.institution ? `INSTITUIÇÃO: ${profile.institution}` : 'UTILIZADOR AUTENTICADO';
  this.profileBio = [profile.bio || 'Bio não preenchida'];
  this.profileAvatarUrl = profile.avatar_url || 'default-avatar.png';
}
```

---

### Fase 2: Implementar Edição e Upload (AMANHÃ)

**Objetivo:** Permitir editar perfil e fazer upload de avatar

```typescript
// 1. Implementar dialog de edição
async editProfile(): Promise<void> {
  // Abrir modal com formulário
  const result = await this.openProfileEditDialog();
  
  if (result) {
    try {
      await this.profileService.updateProfile(result);
      await this.loadProfile(); // Recarregar dados
    } catch (error) {
      this.profileError = 'Erro ao atualizar perfil';
    }
  }
}

// 2. Implementar upload de avatar
onAvatarSelected(event: Event): void {
  const file = (event.target as HTMLInputElement).files?.[0];
  if (file) {
    this.uploadAvatarFile(file);
  }
}

async uploadAvatarFile(file: File): Promise<void> {
  try {
    const response = await this.profileService.updateAvatar(file);
    this.profileAvatarUrl = response.avatar_url;
    this.success = 'Avatar atualizado com sucesso!';
  } catch (error) {
    this.profileError = 'Erro ao fazer upload: ' + error.message;
  }
}
```

---

### Fase 3: Badges e Conteúdos Reais (PRÓXIMA SEMANA)

**Objetivo:** Carregar badges e conteúdos do backend

Esperar implementação de:
- [ ] `GET /api/badges` - Listar badges do utilizador
- [ ] `GET /api/me/contents` - Listar conteúdos criados
- [ ] `GET /api/me/statistics` - Estatísticas detalhadas

---

## 📝 Melhorias Recomendadas Imediatas

### 1. Adicionar Loading State Adequado

```typescript
// Adicionar propriedades
isLoadingProfile = false;
isLoadingStats = false;
isLoadingBadges = false;

// Usar em template
<div *ngIf="isLoadingProfile" class="skeleton-loader">
  Carregando perfil...
</div>
```

### 2. Melhorar Tratamento de Erros

```typescript
// Criar método utilitário
private getErrorMessage(error: any): string {
  if (error.status === 401) {
    return 'Sessão expirada. Por favor, faça login novamente.';
  }
  if (error.status === 404) {
    return 'Perfil não encontrado.';
  }
  if (error.status === 500) {
    return 'Erro do servidor. Tente novamente mais tarde.';
  }
  return error.message || 'Erro ao carregar dados.';
}
```

### 3. Adicionar Validação de Dados

```typescript
// Validar resposta do backend
private validateProfileData(profile: any): boolean {
  return profile && 
         profile.display_name &&
         profile.user_id &&
         typeof profile.display_name === 'string';
}
```

### 4. Implementar Refresh Manual

```typescript
// Botão "Atualizar" no template
<button (click)="refreshProfile()">Atualizar Dados</button>

// Método
async refreshProfile(): Promise<void> {
  this.isLoadingProfile = true;
  try {
    await this.loadProfile();
  } finally {
    this.isLoadingProfile = false;
  }
}
```

---

## 🔗 Serviços a Criar

Para funcionalidade completa, faltam estes endpoints no frontend:

### BadgeService
```typescript
getBadges(): Promise<Badge[]>
getUserBadges(): Promise<UserBadge[]>
```

### ContentService
```typescript
getUserContents(): Promise<Content[]>
getContentDetails(id: string): Promise<Content>
createContent(data: any): Promise<Content>
updateContent(id: string, data: any): Promise<Content>
deleteContent(id: string): Promise<void>
```

### SettingsService
```typescript
getSettings(): Promise<UserSettings>
updatePrivacySetting(key: string, value: boolean): Promise<void>
updateNotificationSetting(key: string, value: boolean): Promise<void>
```

---

## ✅ Checklist de Otimização

### Imediato (Hoje)
- [ ] Mapear dados reais do `/me` para stats
- [ ] Mapear dados do `/profile` para exibição
- [ ] Melhorar tratamento de erros
- [ ] Adicionar loading states

### Curto Prazo (Esta Semana)
- [ ] Implementar edição de bio
- [ ] Implementar upload de avatar
- [ ] Adicionar validação de dados
- [ ] Implementar refresh manual

### Médio Prazo (Próximas 2 Semanas)
- [ ] Criar BadgeService
- [ ] Carregar badges reais
- [ ] Criar ContentService
- [ ] Carregar conteúdos reais
- [ ] Criar SettingsService

### Longo Prazo (Futuro)
- [ ] Implementar edição de preferências
- [ ] Implementar desativação de conta
- [ ] Implementar download de portfólio

---

## 💻 Código de Exemplo - Implementação Melhorada

```typescript
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProfileService } from '../../../services/profile.service';

interface UiState {
  isLoadingProfile: boolean;
  isLoadingStats: boolean;
  error: string | null;
  success: string | null;
}

@Component({
  selector: 'app-perfil',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div *ngIf="state.error" class="error-alert">
      {{ state.error }}
      <button (click)="clearError()">✕</button>
    </div>

    <div *ngIf="state.success" class="success-alert">
      {{ state.success }}
    </div>

    <div *ngIf="state.isLoadingProfile" class="loading">
      Carregando perfil...
    </div>

    <div *ngIf="!state.isLoadingProfile && profile">
      <div class="profile-header">
        <img [src]="profile.avatar_url" alt="Avatar" />
        <div class="profile-info">
          <h1>{{ profile.display_name }}</h1>
          <p>{{ profile.institution }}</p>
          <p>{{ profile.bio }}</p>
          <button (click)="editProfile()">Editar Perfil</button>
        </div>
      </div>

      <div class="stats">
        <div *ngFor="let stat of stats" class="stat-card">
          <p>{{ stat.label }}</p>
          <p class="value">{{ stat.value }}</p>
        </div>
      </div>
    </div>
  `
})
export class PerfilComponent implements OnInit {
  profile: any;
  stats: any[] = [];
  state: UiState = {
    isLoadingProfile: true,
    isLoadingStats: false,
    error: null,
    success: null
  };

  constructor(private profileService: ProfileService) {}

  ngOnInit(): void {
    this.loadProfile();
  }

  async loadProfile(): Promise<void> {
    this.state.isLoadingProfile = true;
    this.state.error = null;

    try {
      const me = await this.profileService.getMe();
      this.profile = me.profile;
      this.mapStats(me.user);
    } catch (error) {
      this.state.error = this.getErrorMessage(error);
    } finally {
      this.state.isLoadingProfile = false;
    }
  }

  private mapStats(user: any): void {
    this.stats = [
      {
        label: 'PONTUAÇÃO TOTAL',
        value: user.total_points || 0
      },
      {
        label: 'NÍVEL',
        value: user.current_level || 1
      }
    ];
  }

  async editProfile(): Promise<void> {
    const newBio = prompt('Nova bio:', this.profile.bio);
    if (newBio && newBio !== this.profile.bio) {
      try {
        await this.profileService.updateProfile({ bio: newBio });
        this.profile.bio = newBio;
        this.state.success = 'Perfil atualizado!';
        setTimeout(() => this.clearSuccess(), 3000);
      } catch (error) {
        this.state.error = 'Erro ao atualizar perfil';
      }
    }
  }

  private getErrorMessage(error: any): string {
    if (error?.status === 401) return 'Sessão expirada';
    if (error?.status === 404) return 'Perfil não encontrado';
    return error?.message || 'Erro ao carregar perfil';
  }

  clearError(): void {
    this.state.error = null;
  }

  clearSuccess(): void {
    this.state.success = null;
  }
}
```

---

## 📊 Status Final

| Aspecto | Status | Observação |
|---------|--------|-----------|
| `/me` Endpoint | ✅ Integrado | Sendo chamado em loadProfile() |
| `/profile` Endpoint | ✅ Integrado | Sendo chamado em loadProfile() |
| Exibição de Dados | ✅ Parcial | Só básicos, mocks para o resto |
| Edição de Perfil | ❌ Não | Placehold, não funciona |
| Upload de Avatar | ❌ Não | Placehold, não funciona |
| Conteúdos Reais | ❌ Não | Hardcoded |
| Badges Reais | ❌ Não | Hardcoded |
| Estatísticas Reais | ⚠️ Parcial | Hardcoded, poderia usar /me |

---

## 🎯 Próximo Passo

**Recomendação:** Implementar a Fase 1 (Consolidar Dados Reais) hoje mesmo.

Tempo estimado: **2-3 horas**

Resultado: Componente funcional com dados reais do backend para exibição.

---

**Status:** ✅ **PRONTO PARA OTIMIZAÇÃO**  
**Última Atualização:** 02/06/2026
