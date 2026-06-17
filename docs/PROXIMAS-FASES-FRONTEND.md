# 🎯 Próximas Fases do Frontend - Plano Detalhado

**Última Atualização:** 02 de Junho de 2026  
**Status:** Fase 1 ✅ Completada | Fase 2 🔄 Pronta para Iniciar

---

## 📍 Onde Estamos

### ✅ Fase 1 - Consolidação de Dados (COMPLETADA)

**Arquivo:** `frontend-web/src/app/pages/profile/perfil/`

**Alcançado:**
- ✅ Dados do /me mapeados para estatísticas
- ✅ Perfil carregado dinamicamente
- ✅ Loading states implementados
- ✅ Erro handling robusto
- ✅ Feedback visual (success/error messages)
- ✅ Componente refatorizado com type-safety

---

## 🔄 Fase 2 - Edição e Upload (PRÓXIMA)

**Objetivo:** Permitir que utilizadores editem seu perfil e façam upload de avatar

**Prioridade:** 🔴 ALTA

### Tarefas

#### 2.1 Upload de Avatar
**Arquivo a Criar:** `frontend-web/src/app/pages/profile/perfil/avatar-upload.component.ts`

**Requisitos:**
```typescript
// Criar componente separado para upload
- Input file picker
- Preview da imagem antes de upload
- Validação de dimensões (100x100 a 2000x2000)
- Validação de tipo (jpg, png, webp)
- Progress bar durante upload
- Erro handling específico para upload
- Success message com nova URL do avatar

// Métodos necessários:
- selectFile(): void
- previewFile(file: File): void
- uploadFile(): Promise<void>
- validateImage(file: File): boolean
- clearError(): void
```

**Integração:**
```typescript
// No perfil.ts, adicionar:
async uploadAvatar(file: File): Promise<void> {
  try {
    const response = await this.profileService.updateAvatar(file);
    this.profileAvatarUrl = response.avatar_url;
    this.state.success = 'Avatar atualizado com sucesso!';
  } catch (error) {
    this.state.error = this.getErrorMessage(error);
  }
}
```

**Template:**
```html
<input type="file" #avatarInput hidden (change)="onAvatarSelected($event)" accept=".jpg,.png,.webp">
<button (click)="avatarInput.click()">Selecionar Avatar</button>
<div *ngIf="avatarPreview" class="preview">
  <img [src]="avatarPreview" />
  <button (click)="uploadAvatar()">Confirmar Upload</button>
</div>
<div *ngIf="uploadProgress > 0" class="progress-bar">
  <div [style.width]="uploadProgress + '%"></div>
</div>
```

---

#### 2.2 Modal/Dialog de Edição de Perfil
**Arquivo a Criar:** `frontend-web/src/app/pages/profile/perfil/profile-edit.dialog.ts`

**Requisitos:**
```typescript
// Dialog para editar:
- display_name (max 100 chars)
- bio (max 2000 chars com contador)
- institution (seleção de lista ou input)
- research_areas (multi-select com max 10)

// Validações:
- Campos obrigatórios
- Comprimento máximo
- Valores permitidos

// Métodos:
- loadCurrentData(): void
- validateForm(): boolean
- saveChanges(): Promise<void>
- cancel(): void
```

**Dados do Formulário:**
```typescript
interface ProfileEditForm {
  display_name: string;
  bio: string;
  institution: string;
  research_areas: string[];
}
```

**Integração:**
```typescript
// No perfil.ts:
async editProfile(): Promise<void> {
  const result = await this.openProfileEditDialog();
  if (result) {
    await this.updateProfile(result);
  }
}

private async openProfileEditDialog(): Promise<ProfileEditForm | null> {
  // Abrir NgBootstrap modal ou custom dialog
  // Pré-preencher com dados atuais
}
```

---

#### 2.3 Mudança de Password
**Arquivo a Criar:** `frontend-web/src/app/pages/profile/perfil/password-change.dialog.ts`

**Requisitos:**
```typescript
// Form para mudar password:
- current_password (obrigatório)
- new_password (validação de complexidade)
- confirm_password (match com new_password)

// Validações:
- Password complexo (letras maiúsculas, números, símbolos)
- Passwords não combinadas
- Atual diferente do novo

// Métodos:
- validatePasswords(): boolean
- changePassword(): Promise<void>
- cancel(): void
```

**Integração:**
```typescript
// No perfil.ts:
async changePassword(): Promise<void> {
  const result = await this.openPasswordChangeDialog();
  if (result) {
    try {
      await this.profileService.changePassword(result);
      this.state.success = 'Senha alterada com sucesso!';
    } catch (error) {
      this.state.error = this.getErrorMessage(error);
    }
  }
}
```

---

#### 2.4 Confirmação para Desativar Conta
**Arquivo a Atualizar:** `perfil.ts - método deactivateAccount()`

**Requisitos:**
```typescript
deactivateAccount(): void {
  // 1. Mostrar dialog de confirmação
  // 2. Pedir que digite "DESATIVAR" para confirmar
  // 3. Se confirmado, chamar endpoint de desativação
  // 4. Logout e redirecionar para home

  const confirmed = await this.showDeactivationConfirmDialog();
  if (confirmed) {
    try {
      await this.authService.deactivateAccount();
      await this.authService.logout();
      this.router.navigate(['/']);
    } catch (error) {
      this.state.error = this.getErrorMessage(error);
    }
  }
}
```

---

### Serviços a Atualizar/Criar

#### ProfileService
**Arquivo:** `frontend-web/src/app/services/profile.service.ts`

**Métodos a Adicionar:**
```typescript
updateProfile(updates: {
  display_name?: string;
  bio?: string;
  institution?: string;
  research_areas?: string[];
}): Promise<any>

updateAvatar(file: File): Promise<{ avatar_url: string }>

changePassword(data: {
  current_password: string;
  new_password: string;
  password_confirmation: string;
}): Promise<any>

updateSettings(settings: any): Promise<any>
```

#### AuthService
**Arquivo:** `frontend-web/src/app/services/auth.service.ts`

**Métodos a Adicionar:**
```typescript
deactivateAccount(): Promise<any>
logout(): Promise<void>
```

---

## 📊 Dependências Esperadas do Backend

Para Fase 2 funcionar, backend deve ter:

### Endpoints Necessários

```
✅ PUT /api/profile
   - Atualizar display_name, bio, institution, research_areas
   - Validação no backend
   - Retorna perfil atualizado

✅ POST /api/profile/avatar
   - Receber file multipart/form-data
   - Validar dimensões (100x100 a 2000x2000)
   - Validar tamanho (max 5MB)
   - Validar tipo (jpg, png, webp)
   - Salvar arquivo
   - Retorna { avatar_url: string }

✅ PUT /api/profile/password
   - Receber { current_password, new_password, password_confirmation }
   - Validar senha atual
   - Aplicar validação de complexidade
   - Atualizar senha
   - Invalidar sessões antigas (logout de outros devices)

✅ POST /api/auth/deactivate
   - Desativar conta (soft delete)
   - Logout automático
```

### Status do Backend (Pessoa 1 - Jofre)

**Backend Current Status:**
- ✅ `/me` - Implementado e retorna user_levels
- ✅ `/profile` - Implementado
- ✅ `PUT /profile` - Precisa implementar
- ✅ `POST /profile/avatar` - Precisa implementar (com validações)
- ⚠️ `PUT /profile/password` - Precisa verificar se está completo
- ❌ `POST /auth/deactivate` - Precisa implementar

**Ação:** Contactar Pessoa 1 para verificar status e priorizar implementação

---

## 🗓️ Timeline Recomendada

### Hoje (02/06)
- ✅ Fase 1 Completada
- 📋 Planejar Fase 2 (FEITO - este documento)

### Amanhã (03/06)
- [ ] Avatar upload component (2-3h)
- [ ] Profile edit dialog (2h)
- [ ] Integração com perfil.ts (1h)
- [ ] Testes básicos

### Quinta (04/06)
- [ ] Password change dialog (1h)
- [ ] Deactivate account flow (1h)
- [ ] Testes com dados reais
- [ ] Verificar backend readiness

### Sexta (05/06)
- [ ] Settings backend integration
- [ ] Polish e UX improvements
- [ ] Testes E2E
- [ ] Documentation

---

## 🔗 Próximas Fases Após Fase 2

### Fase 3 - Dados Reais (Próxima Semana)
**Objetivo:** Carregar badges e conteúdos reais do backend

**Tarefas:**
- [ ] Criar BadgeService
- [ ] GET /api/badges - listar badges do utilizador
- [ ] Mapear badges para merits array
- [ ] Criar ContentService
- [ ] GET /api/me/contents - listar conteúdos criados
- [ ] Mapear conteúdos para userContents array

### Fase 4 - Settings (2 Semanas)
**Objetivo:** Implementar salvamento de preferências

**Tarefas:**
- [ ] Criar SettingsService
- [ ] PUT /api/settings - salvar preferências
- [ ] Sincronização com toggles
- [ ] Persistência no backend

### Fase 5 - Polish (3 Semanas)
**Objetivo:** Melhorias de UX e performance

**Tarefas:**
- [ ] Skeleton loaders
- [ ] Cache local
- [ ] Animações suaves
- [ ] Breadcrumbs
- [ ] Accessibility improvements

---

## 📝 Notas de Implementação

### Best Practices
1. **Validação no Frontend E Backend:** Não confiar só no frontend
2. **Feedback Visual:** Sempre mostrar loading, error, success
3. **Error Handling:** Mensagens específicas por cenário
4. **Type Safety:** Usar interfaces para todos os dados
5. **Component Reusability:** Dialogs como componentes separados

### Libs Recomendadas
- **NgBootstrap:** Para modals/dialogs
- **Reactive Forms:** Para validação complexa
- **Ng-Zorro ou PrimeNG:** Componentes UI prontos

### Estrutura Sugerida
```
frontend-web/src/app/pages/profile/perfil/
├── perfil.ts (componente principal)
├── perfil.html (template)
├── perfil.css (estilos)
├── avatar-upload.component.ts (novo)
├── avatar-upload.component.html (novo)
├── profile-edit.dialog.ts (novo)
├── profile-edit.dialog.html (novo)
├── password-change.dialog.ts (novo)
├── password-change.dialog.html (novo)
└── models/ (novo)
    ├── profile-edit-form.interface.ts
    └── password-change-form.interface.ts
```

---

## 🔍 Checklist Antes de Começar Fase 2

- [ ] Backend confirmou endpoints estarão prontos até amanhã
- [ ] Alguém revisou este documento e concorda com plano
- [ ] Dependências do ProfileService foram listadas
- [ ] Estrutura de pastas foi decidida
- [ ] NgBootstrap/dialog library foi escolhida
- [ ] Testes serão implementados
- [ ] Code review será feito antes de merge

---

## 📞 Contactos

**Questões sobre Backend:** Contactar Jofre Jaime  
**Questões sobre Frontend:** Contactar equipa frontend  
**Questões sobre Architecture:** Rever com tech lead

---

**Status:** 🟡 **PRONTA PARA INICIAR**  
**Próximo Checkpoint:** Amanhã (03/06) - Relatório de progresso de Fase 2

