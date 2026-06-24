# 🎨 Identidade Visual do Header - Padronização Completa

**Status**: ✅ Implementado em todas as 6 telas  
**Data**: 23 de Junho de 2026

---

## 📐 Especificação Visual

### Cores
```
Background (StatusBar): #8B1E2D (primário/vermelho-marrom)
Texto (Título):         #FFFFFF (branco)
Ícone (Voltar):         #FFFFFF (branco)
Borda inferior:         rgba(0,0,0,0.15) (sombra leve)
```

### Tipografia
```
Tamanho:    18px
Peso:       700 (bold)
Espaçamento: -0.4px (letter-spacing)
Cor:        Branco em fundo primário
```

### Dimensões
```
Altura do Header:     48px (+ padding 12px top/bottom = ~72px total)
Padding horizontal:   16px
Ícone voltar:         20px (tamanho)
Espaço entre ícone e título: 12px
```

### Efeitos
```
Sombra (iOS):    shadowOpacity: 0.1, shadowRadius: 2
Sombra (Android): elevation: 2
BorderBottom:      1px (rgba(0,0,0,0.15))
```

---

## 🎯 Layout Padrão

```
┌──────────────────────────────────────────────────────┐
│  ← │  Título da Página                            │  │
│     │                                               │  │
└──────────────────────────────────────────────────────┘
     40px   flex center (título)                   40px
```

**Componentes:**
- **Left (40px)**: Botão voltar ou spacer vazio
- **Center (flex)**: Título da página (centralizado)
- **Right (40px)**: Elemento customizado ou vazio

---

## ✅ Telas Implementadas (6/6)

### 1. **ContentScreen** - Conteúdos
```jsx
<StatusBar barStyle="light-content" backgroundColor={appTheme.colors.primary} />
<HeaderBar title="Conteúdos" showBackButton={true} />
```
- Tema: Secundária (com botão voltar)
- Header: ← Conteúdos
- Visual: ✅ Completo

### 2. **ArticleScreen** - Artigos
```jsx
<StatusBar barStyle="light-content" backgroundColor={appTheme.colors.primary} />
<HeaderBar title={content.title} showBackButton={true} />
```
- Tema: Secundária (com botão voltar)
- Header: ← Título do Artigo
- Visual: ✅ Completo

### 3. **NotificationsScreen** - Notificações
```jsx
<StatusBar barStyle="light-content" backgroundColor={appTheme.colors.primary} />
<HeaderBar title="Notificações" showBackButton={true} />
```
- Tema: Secundária (com botão voltar)
- Header: ← Notificações
- Visual: ✅ Completo

### 4. **PodcastScreen** - Podcasts
```jsx
<StatusBar barStyle="light-content" backgroundColor={appTheme.colors.primary} />
<HeaderBar title="Kwanza: História e Desafios da Moeda Nacional" showBackButton={true} />
```
- Tema: Secundária (com botão voltar)
- Header: ← Título do Podcast
- Visual: ✅ Completo

### 5. **ProfileScreen** - Perfil
```jsx
<StatusBar barStyle="light-content" backgroundColor={appTheme.colors.primary} />
<HeaderBar title="Perfil" showBackButton={false} />
```
- Tema: Principal (sem botão voltar)
- Header: Perfil
- Visual: ✅ Completo

### 6. **PersonalInfoScreen** - Informação Pessoal
```jsx
<StatusBar barStyle="light-content" backgroundColor={appTheme.colors.primary} />
<HeaderBar title="Informação Pessoal" showBackButton={true} />
```
- Tema: Secundária (com botão voltar)
- Header: ← Informação Pessoal
- Visual: ✅ Completo

---

## 🔄 Fluxo de Aplicação da Identidade

### Quando Usar `showBackButton={true}`
✅ Páginas secundárias/detalhe:
- Conteúdos, Artigos, Podcasts
- Perfil, Informação Pessoal
- Notificações
- Quiz, Resultados
- Discussões de Tópicos
- Etc.

### Quando Usar `showBackButton={false}`
✅ Páginas principais (tabs):
- Dashboard/Início
- Comunidade
- Lista de Quizzes
- Exploração

---

## 📱 Comparativo Visual

### Antes (Inconsistente)
```
ContentScreen:
┌──────────────────────────────────┐
│ ← Voltar | Conteúdos           │ ← Diferentes estilos
│ [Search Bar] [Filter]           │

ArticleScreen:
┌──────────────────────────────────┐
│ ← | App Title |  ⋮              │
│ [Guardar] [Partilhar]            │

ProfileScreen:
┌──────────────────────────────────┐
│ ≡ Economia com História 🔍      │
```

### Depois (Padronizado) ✅
```
Todas as telas secundárias:
┌──────────────────────────────────┐
│ ← Título da Página               │ ← Mesma cor, mesmo estilo
└──────────────────────────────────┘

Páginas principais:
┌──────────────────────────────────┐
│ Título da Página                 │ ← Sem voltar
└──────────────────────────────────┘
```

---

## 🛠️ Especificações Técnicas

### Componente: `src/components/HeaderBar.tsx`

**Props:**
```typescript
interface HeaderBarProps {
  title: string;                    // Obrigatório
  showBackButton?: boolean;         // Default: true
  onBackPress?: () => void;         // Default: navigation.goBack()
  backgroundColor?: string;         // Default: appTheme.colors.primary
  rightElement?: React.ReactNode;   // Elemento custom à direita
}
```

**Cores Dinâmicas:**
```typescript
const isDarkBackground = backgroundColor === appTheme.colors.primary;
const iconColor = isDarkBackground ? 'white' : appTheme.colors.primary;
const titleColor = isDarkBackground ? 'white' : appTheme.colors.textPrimary;
```

**Estilos:**
- Sombra em iOS (shadowColor, shadowOffset, shadowOpacity, shadowRadius)
- Elevação em Android (elevation: 2)
- Border bottom com opacidade para consistência

---

## ✨ Benefícios da Padronização

### Visual
✅ Identidade visual consistente em todas as telas  
✅ Reconhecimento imediato da marca  
✅ Experiência de usuário previsível  

### Código
✅ Componente reutilizável (HeaderBar)  
✅ StatusBar centralizado (mesma cor)  
✅ Menos duplicação de estilos  
✅ Fácil manutenção  

### Produto
✅ Profissionalismo aumentado  
✅ Interface limpa e minimalista  
✅ Navegação clara  
✅ Foco no conteúdo  

---

## 📋 Checklist de Consistência

- [x] HeaderBar com background primário (#8B1E2D)
- [x] Ícone voltar em branco
- [x] Título em branco
- [x] Font size 18px, bold
- [x] Espaçamento consistente (16px padding, 12px margens)
- [x] Sombra e border leves para separação visual
- [x] StatusBar em light-content + background primário
- [x] 6 telas com implementação consistente
- [x] Sem erros TypeScript
- [x] Responsividade mantida

---

## 🔗 Próximas Fases

**Fase 2**: Padronizar as 8 telas pendentes com o mesmo padrão:
1. NotificationPreferencesScreen
2. PrivacyScreen
3. SupportScreen
4. CreateTopicScreen
5. TopicDiscussionScreen
6. QuizScreen
7. CommunityScreen
8. QuizListScreen

**Implementação**: Seguir exatamente o padrão das 6 telas implementadas.

---

**Versão**: 1.0  
**Desenvolvedor**: Assistente IA  
**Revisado**: 23 de Junho de 2026
