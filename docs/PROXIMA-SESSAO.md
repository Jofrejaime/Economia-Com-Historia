# 📋 Próxima Sessão - Quick Reference

**Última Atualização:** 02 de Junho de 2026  
**Status:** Pronto para Fase 2 do Frontend

---

## ✅ O Que Foi Feito Esta Sessão

### Frontend Phase 1 ✅ COMPLETADO

1. **Refatorização do perfil.ts**
   - State management centralizado
   - Métodos implementados
   - Type-safe interfaces
   - Error handling robusto

2. **Atualização do perfil.html**
   - Dados dinâmicos
   - Loading/Error/Success states
   - Botões conectados
   - Conteúdos mapeados

3. **Documentação**
   - PERFIL-COMPONENT-REFACTORED.md
   - PROXIMAS-FASES-FRONTEND.md
   - STATUS-FINAL-FASE-1-FRONTEND.md
   - VISAO-GERAL-PROJETO.md

---

## 🚀 Próxima Sessão - O Que Fazer

### PRIORIDADE 1: Avatar Upload (02-03/06)

**Arquivo:** `frontend-web/src/app/pages/profile/perfil/`

**Criar:**
```
avatar-upload.component.ts
avatar-upload.component.html
```

**O Que Implementar:**
1. Input file picker (hidden)
2. Preview da imagem antes de upload
3. Validação de dimensões (100x100 a 2000x2000)
4. Upload button
5. Progress bar
6. Success/error messages

**Integração com perfil.ts:**
```typescript
async uploadAvatar(file: File): Promise<void> {
  try {
    const response = await this.profileService.updateAvatar(file);
    this.profileAvatarUrl = response.avatar_url;
    this.state.success = 'Avatar atualizado!';
  } catch (error) {
    this.state.error = this.getErrorMessage(error);
  }
}
```

**Tempo Estimado:** 2-3 horas

---

### PRIORIDADE 2: Profile Edit Dialog (02-03/06)

**Arquivo:** `frontend-web/src/app/pages/profile/perfil/`

**Criar:**
```
profile-edit.dialog.ts
profile-edit.dialog.html
```

**Campos:**
- display_name (max 100)
- bio (max 2000 com contador)
- institution (seleção)
- research_areas (multi-select max 10)

**Integração com perfil.ts:**
```typescript
async editProfile(): Promise<void> {
  const result = await this.openProfileEditDialog();
  if (result) {
    await this.updateProfile(result);
  }
}

private async openProfileEditDialog(): Promise<any | null> {
  // Abrir modal com NgBootstrap
  // Pré-preencher dados atuais
}
```

**Tempo Estimado:** 2 horas

---

### PRIORIDADE 3: Integração com Backend (04-05/06)

**Requisitos:**
- Backend deve ter `PUT /api/profile` pronto
- Backend deve ter `POST /api/profile/avatar` pronto
- Backend deve ter `PUT /api/profile/password` pronto

**Verficar com:** Jofre (Pessoa 1)

---

## 📋 Checklist Antes de Começar

- [ ] Ler `docs/PROXIMAS-FASES-FRONTEND.md` (completo)
- [ ] Decidir library para modals (NgBootstrap é recomendado)
- [ ] Clonar repositório com último código
- [ ] Verificar que backend endpoints estarão prontos
- [ ] Setup ambiente local (npm install, ng serve)
- [ ] Testar que perfil.ts compila sem erros
- [ ] Criar feature branch para Fase 2

---

## 🔧 Decisões a Tomar

### 1. Modal Library
**Opções:**
- NgBootstrap (recomendado - já usado em projeto)
- Angular Material
- Custom (não recomendado - muito trabalho)

**Recomendação:** NgBootstrap
- Integração simples
- Bootstrap-based (match design atual)
- Documentação excelente

### 2. Form Validation
**Opções:**
- Template-driven forms (simples)
- Reactive Forms (mais poder)

**Recomendação:** Reactive Forms
- Validação complexa (max 2000 chars com contador)
- Better testability

### 3. Project Structure
**Proposta:**
```
perfil/
├── perfil.ts
├── perfil.html
├── perfil.css
├── avatar-upload.component.ts
├── avatar-upload.component.html
├── profile-edit.dialog.ts
├── profile-edit.dialog.html
├── password-change.dialog.ts
├── password-change.dialog.html
├── models/
│   ├── profile-edit-form.interface.ts
│   └── password-change-form.interface.ts
└── services/ (se necessário)
```

---

## 🔗 Links Essenciais

### Leitura Obrigatória
1. `docs/PROXIMAS-FASES-FRONTEND.md` - Plano detalhado (30 min)
2. `docs/meeting-notes/PERFIL-COMPONENT-REFACTORED.md` - Mudanças (20 min)
3. `docs/GUIA-INTEGRACAO-FRONTEND.md` - Integração (20 min)

### Referência
1. `frontend-web/src/app/pages/profile/perfil/perfil.ts` - Código atual
2. `backend/app/Http/Controllers/Api/ProfileController.php` - O que backend faz
3. `docs/api/profiles.md` - API reference

### Documentação Externa
1. NgBootstrap Modals: https://ng-bootstrap.github.io/#/modals/examples
2. Angular Reactive Forms: https://angular.io/guide/reactive-forms
3. File Upload Best Practices: https://developer.mozilla.org/en-US/docs/Web/API/File

---

## 👥 Comunicação

### Contactos
- **Jofre (Backend):** Confirmar endpoints prontos para 04/06
- **Tech Lead:** Validar decisões de library antes de começar
- **QA:** Avisar testes E2E de Fase 2 para 05/06

### Daily Standup
- **Segunda (03/06):** Avatar Upload + Profile Edit Dialog
- **Terça (04/06):** Backend integration + Password Change Dialog
- **Quarta (05/06):** Testes + Polish

---

## ⚠️ Armadilhas Comuns a Evitar

### 1. File Upload Size
❌ **Errado:** Fazer upload sem validação
✅ **Certo:** Validar tamanho antes (max 5MB)

### 2. Image Dimensions
❌ **Errado:** Confiar só no backend
✅ **Certo:** Validar no frontend + backend

### 3. Form State
❌ **Errado:** Deixar form dirty e não perguntar
✅ **Certo:** Implementar "Unsaved Changes" warning

### 4. Error Messages
❌ **Errado:** Mensagens genéricas do backend
✅ **Certo:** Traduzir para português claro

### 5. Loading States
❌ **Errado:** Upload sem progress bar
✅ **Certo:** Mostrar progresso visual

---

## 📊 Métricas de Sucesso

### Phase 2 Completa Quando:
- ✅ Avatar pode ser upado e salvo
- ✅ Perfil pode ser editado (todos os campos)
- ✅ Password pode ser mudada
- ✅ Settings toggles salvam (privacy/notifications)
- ✅ Tudo testado com dados reais
- ✅ Sem erros no console
- ✅ Responsive em mobile

### Code Quality
- ✅ Sem erros de compilação TypeScript
- ✅ Sem warnings não tratados
- ✅ Code style consistente
- ✅ Métodos bem documentados
- ✅ Interfaces tipadas

---

## 🎯 Fim de Semana Check

### Até Sexta (05/06)
- [ ] Avatar upload funciona
- [ ] Profile edit funciona
- [ ] Password change funciona
- [ ] Settings toggles salvam
- [ ] Tudo testado manualmente
- [ ] Documentação atualizada
- [ ] Code review aprovado

### Até Segunda (08/06)
- [ ] Phase 3 (Dados Reais) iniciada
- [ ] Badges carregando do backend
- [ ] Conteúdos carregando do backend
- [ ] Outras páginas começam

---

## 🚀 Comandos para Começar

```bash
# Clonar/atualizar código
git clone <repo>
cd frontend-web
npm install

# Servir localmente
ng serve

# Compilar sem erros
ng build

# Testes (se tiver)
ng test

# Criar feature branch
git checkout -b feature/phase-2-edit-upload
```

---

## 💡 Pro Tips

1. **Use ng generate** para criar componentes:
   ```bash
   ng generate component pages/profile/perfil/avatar-upload
   ng generate component pages/profile/perfil/profile-edit-dialog
   ```

2. **Teste com dados reais** do seeder:
   ```
   student@economia-historia.local / Student@123456
   ```

3. **Chrome DevTools** é teu amigo:
   - Network tab para ver uploads
   - Console para erros
   - Elements para debug CSS

4. **Commit frequentemente** (não esperar tudo pronto)

5. **Se travar**, procura na documentação antes de pedir ajuda

---

## 📞 Em Caso de Dúvida

### Pergunta: "O backend está pronto para Phase 2?"
**Resposta:** Contactar Jofre. Verificar `docs/PROXIMAS-FASES-FRONTEND.md` seção "Dependências Esperadas do Backend"

### Pergunta: "Qual library usar para modals?"
**Resposta:** NgBootstrap (recomendado, decision já em PROXIMAS-FASES-FRONTEND.md)

### Pergunta: "Como fazer upload seguro?"
**Resposta:** Ler `docs/GUIA-INTEGRACAO-FRONTEND.md` seção de avatar upload

### Pergunta: "Que testes devo fazer?"
**Resposta:** Manual testing checklist está em `PROXIMAS-FASES-FRONTEND.md`

---

## 📅 Próximas Datas Importantes

```
03/06 (Terça)  - Avatar Upload entregue
04/06 (Quarta) - Profile Edit Dialog + Password entregue
05/06 (Quinta) - Phase 2 completa + testes
08/06 (Domingo) - Phase 3 iniciada
12/06 (Quinta) - Phase 3 completa
19/06 (Quinta) - Sprint 3 (polish) iniciada
30/06 (Segunda) - Projeto completo
```

---

## ✨ Motivação

Excelente trabalho completar Phase 1! O projeto está no bom caminho.

**Backend (Pessoa 1):** 100% ✅  
**Frontend Phase 1:** 100% ✅  
**Próximo:** Frontend Phases 2-3 + Backend Pessoa 2

Vamos lá! 🚀

---

**Document:** PROXIMA-SESSAO.md  
**Versão:** 1.0  
**Última Atualização:** 02/06/2026 às 16:00

