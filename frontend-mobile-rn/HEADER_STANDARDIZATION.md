# Padronização de Headers - Guia de Implementação

## ✅ Telas Já Padronizadas

- [x] **ContentScreen** - Página de conteúdos (com barra de pesquisa separada)
- [x] **ArticleScreen** - Página de artigos
- [x] **NotificationsScreen** - Página de notificações

---

## 📋 Telas Pendentes de Padronização

### Páginas Secundárias (com botão voltar)

Todas as páginas abaixo devem usar:
```tsx
<HeaderBar title="Título da Página" showBackButton={true} />
```

Remover estrutura antiga de header e usar o novo componente.

| Tela | Arquivo | Status |
|------|---------|--------|
| Podcast | `PodcastScreen.tsx` | ⏳ Pendente |
| Perfil | `ProfileScreen.tsx` | ⏳ Pendente |
| Info Pessoal | `PersonalInfoScreen.tsx` | ⏳ Pendente |
| Preferências Notificação | `NotificationPreferencesScreen.tsx` | ⏳ Pendente |
| Privacidade | `PrivacyScreen.tsx` | ⏳ Pendente |
| Suporte | `SupportScreen.tsx` | ⏳ Pendente |
| Criar Tópico | `CreateTopicScreen.tsx` | ⏳ Pendente |
| Discussão Tópico | `TopicDiscussionScreen.tsx` | ⏳ Pendente |
| Quiz | `QuizScreen.tsx` | ⏳ Pendente |
| Quiz Resultado | `QuizResultScreen.tsx` | ⏳ Pendente |
| Quiz Feedback | `QuizFeedbackScreen.tsx` | ⏳ Pendente |
| Gerenciar Membros | `ManageMembersScreen.tsx` | ⏳ Pendente |
| Permissão Jindungo | `JindungoPermissionScreen.tsx` | ⏳ Pendente |
| Login Prompt | `LoginPromptScreen.tsx` | ⏳ Pendente |

### Páginas Principais (sem botão voltar)

Todas as páginas abaixo devem usar:
```tsx
<HeaderBar title="Título da Página" showBackButton={false} />
```

| Tela | Arquivo | Status | Notas |
|------|---------|--------|-------|
| Comunidade | `CommunityScreen.tsx` | ⏳ Pendente | Tab principal |
| Lista Quiz | `QuizListScreen.tsx` | ⏳ Pendente | Tab principal |
| Dashboard | `DashboardScreen.tsx` | ✅ Já tem header customizado | Manter como está |

---

## 🔧 Instruções de Implementação

### Passo 1: Importar HeaderBar
```tsx
import { HeaderBar } from "../../components/HeaderBar";
```

### Passo 2: Remover Header Antigo
Procurar por padrões como:
```tsx
<View style={styles.header}>
  <TouchableOpacity onPress={() => navigation.goBack()}>
    <Feather name="arrow-left" ... />
    <Text>Voltar</Text>
  </TouchableOpacity>
  <Text style={styles.title}>Título</Text>
  {/* Remover elementos extras: buttons, icons, menus, etc */}
</View>
```

### Passo 3: Adicionar HeaderBar
```tsx
<ScreenContainer>
  <HeaderBar 
    title="Sua Página" 
    showBackButton={true}  // ou false para páginas principais
  />
  
  {/* Resto do conteúdo da página */}
</ScreenContainer>
```

### Passo 4: Limpar Estilos Antigos
Remover do `StyleSheet` todos os estilos antigos de header:
- `header`
- `headerTop`
- `backButton`
- `backButtonText`
- `appTitle`
- `moreButton`
- `actionRow`
- `actionBtn`
- `actionBtnText`
- Outros estilos relacionados ao header

---

## 💡 Exemplo Prático - ProfileScreen

### Antes:
```tsx
<View style={styles.header}>
  <TouchableOpacity onPress={() => navigation.goBack()}>
    <Ionicons name="arrow-back" size={24} />
  </TouchableOpacity>
  <Text style={styles.title}>Perfil</Text>
  <TouchableOpacity style={styles.editButton}>
    <Ionicons name="create-outline" size={24} />
  </TouchableOpacity>
</View>
```

### Depois:
```tsx
import { HeaderBar } from "../../components/HeaderBar";

// ... no render:
<ScreenContainer>
  <HeaderBar title="Perfil" showBackButton={true} />
  
  {/* Resto do conteúdo */}
</ScreenContainer>
```

---

## 🎨 Especificações do HeaderBar

### Props:
- **title** (obrigatório): String com título da página
- **showBackButton** (padrão: true): Boolean para mostrar botão voltar
- **onBackPress**: Função customizada ao clicar voltar (padrão: navigation.goBack())
- **backgroundColor** (padrão: white): Cor de fundo
- **rightElement** (opcional): Componente React para elemento à direita

### Layout:
```
┌─────────────────────────────────────────────┐
│ ← │ Título da Página                    [Icon]│
└─────────────────────────────────────────────┘
```

### Estilos:
- Altura: 48px (+ padding)
- Borda inferior: 1px (borderColor: colors.border)
- Fonte: 18px, bold, textPrimary
- Ícone voltar: color.primary, size 20

---

## ✨ Benefícios da Padronização

✅ **Consistência Visual** - Todos os headers com mesmo padrão  
✅ **Manutenção Centralizada** - Alterações no HeaderBar afetam todas as telas  
✅ **Código Limpo** - Menos código duplicado  
✅ **UX Previsível** - Usuários sabem onde está o botão de voltar  
✅ **Responsividade** - Componente adapta automaticamente  

---

## 📝 Checklist de Implementação

Para cada tela a padronizar:

- [ ] Importar `HeaderBar`
- [ ] Remover estrutura antiga de header (View, TouchableOpacity, Text)
- [ ] Adicionar `<HeaderBar title="..." showBackButton={true/false} />`
- [ ] Remover estilos antigos do StyleSheet
- [ ] Testar navegação (botão voltar funciona)
- [ ] Validar ausência de erros TypeScript
- [ ] Revisar alinhamento e espaçamento visual

---

## 🔗 Referências

- Componente: [src/components/HeaderBar.tsx](../../components/HeaderBar.tsx)
- Exemplos: 
  - [ContentScreen.tsx](../main/ContentScreen.tsx)
  - [ArticleScreen.tsx](../main/ArticleScreen.tsx)
  - [NotificationsScreen.tsx](../main/NotificationsScreen.tsx)

---

**Data de Criação**: 23 de Junho de 2026
**Versão**: 1.0
**Status**: Em Progresso ⏳
