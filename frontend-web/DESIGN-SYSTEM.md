# Design System - Arquivo Económico de Angola

## 🎯 Propósito

Esta aplicação é uma plataforma educacional focada em ensinar história económica e social de Angola através de conteúdo educacional estruturado. O objetivo NÃO é entretenimento, mas aprendizado, reflexão e pensamento crítico.

## 🎨 Estilo Visual

- **Tom**: Sério, credível e académico
- **Estética**: Limpa e moderna
- **Princípios**: Legibilidade forte, minimalismo, hierarquia clara

### O que EVITAR:
- Desenhos animados
- Ilustrações decorativas
- Avatares gerados
- Personagens AI
- Uso excessivo de cores

### O que USAR:
- Fotografia real de pessoas
- Contextos da vida real (estudantes, trabalhadores, atividade económica)
- Espaçamento generoso
- Separação clara entre seções

---

## 🎨 Cores

### Cores Primárias
```css
--primary: #8B1E2D;           /* Bordeaux/Vermelho principal */
--primary-dark: #7f1d1d;      /* Variante escura do primário */
--primary-darker: #6b0119;    /* Variante mais escura */
```

### Cores de Fundo
```css
--background-default: #FFFFFF;  /* Branco padrão */
--background-subtle: #F5F5F5;   /* Cinza muito claro */
--background-accent: #f8f9ff;   /* Azul muito claro (fundo de página) */
--background-blue: #eff4ff;     /* Azul suave para cards */
--background-blue-dark: #dee9fc; /* Azul para inputs */
--background-footer: #f1f5f9;   /* Cinza para footer */
```

### Cores de Texto
```css
--text-primary: #1F2937;       /* Texto principal escuro */
--text-primary-alt: #0f172a;   /* Texto principal alternativo */
--text-secondary: #4B5563;     /* Texto secundário */
--text-secondary-alt: #475569; /* Texto secundário alternativo */
--text-muted: #9CA3AF;         /* Texto esmaecido */
--text-muted-alt: #64748b;     /* Texto esmaecido alternativo */
--text-body: #574142;          /* Texto de corpo */
--text-tertiary: #94a3b8;      /* Texto terciário */
```

### Cores de Borda
```css
--border-default: #E5E7EB;     /* Borda padrão */
--border-light: #e2e8f0;       /* Borda clara */
```

---

## 📝 Tipografia

### Famílias de Fonte
```css
--font-heading: 'IBM Plex Sans', sans-serif;  /* Títulos */
--font-body: 'Source Sans 3', sans-serif;     /* Corpo de texto */
```

### Tamanhos de Fonte
```css
--text-xs: 12px;    /* Extra pequeno */
--text-sm: 14px;    /* Pequeno */
--text-md: 16px;    /* Médio (base) */
--text-lg: 18px;    /* Grande */
--text-xl: 24px;    /* Extra grande */
--text-2xl: 32px;   /* 2x extra grande */
--text-3xl: 48px;   /* 3x extra grande */
--text-4xl: 60px;   /* 4x extra grande */
```

### Pesos de Fonte
```css
--weight-regular: 400;
--weight-medium: 500;
--weight-semibold: 600;
--weight-bold: 700;
```

### Alturas de Linha
```css
--leading-normal: 1.5;
--leading-relaxed: 1.7;
```

### Hierarquia de Títulos
```tsx
// H1 - Títulos principais de página
<h1 className="font-['IBM_Plex_Sans'] font-bold text-[48px] leading-[48px] tracking-[-2.4px] text-[#8b1e2d]">

// H2 - Títulos de seção
<h2 className="font-['IBM_Plex_Sans'] font-bold text-[30px] leading-[36px] tracking-[-0.6px] text-[#6b0119]">

// H3 - Títulos de sub-seção
<h3 className="font-['IBM_Plex_Sans'] font-bold text-[24px] leading-[32px] tracking-[-0.48px] text-[#121c2a]">

// H4 - Títulos de card/componente
<h4 className="font-['IBM_Plex_Sans'] font-bold text-[20px] leading-[28px] tracking-[-0.4px] text-[#121c2a]">

// Corpo de texto
<p className="font-['Source_Sans_3'] text-[16px] leading-[24px] text-[#574142]">

// Texto pequeno
<span className="font-['Source_Sans_3'] text-[14px] leading-[20px] text-[#64748b]">

// Labels uppercase
<span className="font-['Source_Sans_3'] font-bold text-[11px] leading-[16.5px] tracking-[1.1px] uppercase text-[#7f1d1d]">
```

---

## 📏 Espaçamento

```css
--spacing-xs: 4px;
--spacing-sm: 8px;
--spacing-md: 16px;
--spacing-lg: 24px;
--spacing-xl: 32px;
--spacing-2xl: 48px;
--spacing-3xl: 64px;
--spacing-4xl: 96px;
```

---

## 🔲 Border Radius

```css
--radius-sm: 4px;
--radius-md: 8px;
--radius-lg: 12px;
--radius-xl: 16px;
```

---

## 🧱 Componentes

### Botão Primário
```tsx
<button className="bg-[#8b1e2d] text-white font-['Source_Sans_3'] font-semibold text-base px-8 py-4 rounded-md hover:bg-[#7f1d1d] transition-colors">
  Texto do Botão
</button>
```

### Botão Secundário
```tsx
<button className="border border-[rgba(107,1,25,0.2)] text-[#6b0119] font-['Source_Sans_3'] font-bold text-xs uppercase tracking-wider px-6 py-3 rounded hover:bg-[rgba(107,1,25,0.05)] transition-colors">
  Texto do Botão
</button>
```

### Card Básico
```tsx
<div className="bg-white rounded-lg shadow-sm p-8">
  {/* Conteúdo */}
</div>
```

### Card com Acento
```tsx
<div className="bg-[#eff4ff] rounded-lg p-8 border-l-4 border-[#6b0119]">
  {/* Conteúdo */}
</div>
```

### Input de Pesquisa
```tsx
<input
  type="text"
  placeholder="Pesquisar arquivo..."
  className="bg-[#dee9fc] rounded px-10 py-2 w-64 font-['Source_Sans_3'] text-sm text-[#6b7280] placeholder:text-[#6b7280] focus:outline-none focus:ring-2 focus:ring-[#8b1e2d] focus:ring-opacity-20"
/>
```

---

## 📱 Layout

### Container Principal
```tsx
<div className="max-w-[1536px] mx-auto px-12">
  {/* Conteúdo */}
</div>
```

### Grid de 12 colunas
```tsx
<div className="grid grid-cols-12 gap-12">
  <div className="col-span-8">{/* Conteúdo principal */}</div>
  <div className="col-span-4">{/* Sidebar */}</div>
</div>
```

---

## 🗺️ Estrutura de Navegação

### Navegação Principal (5 abas)
1. **Início** (`/`) - Página inicial
2. **Conteúdos** (`/arquivo`) - Lista de conteúdos históricos
3. **Comunidade** (`/comunidade`) - Fórum e discussões
4. **Quiz** (`/quiz`) - Questionários opcionais
5. **Perfil** (`/perfil`) - Perfil do utilizador

---

## ⚠️ Regras UX

1. **Conteúdo em primeiro lugar** - O conteúdo deve sempre ser o foco principal
2. **Hierarquia visual forte** - Manter hierarquia clara em todos os elementos
3. **Evitar desordem** - Minimalismo e clareza
4. **Priorizar legibilidade** - Legibilidade sobre decoração
5. **Consistência** - Garantir consistência em todas as telas

---

## 📐 Páginas de Referência

As seguintes páginas são **MODELOS DE REFERÊNCIA** e definem o padrão de design:

1. **Página Inicial (Desktop)** - `/imports/PaginaInicialDesktop`
2. **Perfil do Investigador (Desktop)** - `/imports/PerfilDoInvestigadorDesktop`
3. **Arquivo de Conteúdos (Desktop)** - `/imports/ArquivoDeConteudosDesktop`

Todas as futuras implementações devem seguir **APENAS** estes padrões de estilo.

---

## 🎯 Objetivo Final

Criar uma plataforma educacional amigável e moderna que incentive leitura, compreensão e discussão - não apenas interação ou gamificação.
