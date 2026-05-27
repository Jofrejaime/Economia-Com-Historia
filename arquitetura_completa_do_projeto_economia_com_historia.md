# 🏗️ Economia com História — Estrutura Completa do Projeto (100% Open Source)

---

# 📘 Visão Geral da Arquitetura

A plataforma **Economia com História** será construída com:

- Frontend Web → Angular
- Frontend Mobile → Flutter
- Backend API → PHP Laravel
- Base de Dados → PostgreSQL
- Object Storage → MinIO
- CDN/Proxy → Nginx
- Pesquisa → Meilisearch (Open Source)
- Queue/Jobs → Redis + Laravel Queues

A arquitetura foi pensada para:

- Alto volume multimédia
- Escalabilidade
- Desenvolvimento gradual
- Trabalho paralelo da equipa
- Integração contínua entre frontend e backend

---

# 🧠 Estrutura Organizacional da Equipa

## ⚙️ Backend

Responsáveis:
- Jofre
- Abel Canas

Responsabilidades:
- API REST
- Autenticação
- Upload de ficheiros
- Integração MinIO
- Processamento de PDFs
- Pesquisa
- Regras de negócio
- Dashboard administrativo

---

## 🎨 Frontend

### Painel Administrativo
Responsáveis:
- Lúcio Vitorino
- Cris Mazebo

### Cliente Desktop
Responsável:
- Cris Mazebo

### Cliente Mobile
Responsável:
- Lúcio Vitorino

---

# 🚀 Estratégia de Desenvolvimento

## ✔ Desenvolvimento Faseado

Fluxo obrigatório:

```txt
Tela criada
   ↓
Verifica se API existe
   ↓
Se existir → integrar imediatamente
   ↓
Se não existir → backend cria rota
   ↓
Frontend integra
   ↓
Testes
```

---

# 📁 Estrutura Geral do Repositório

```txt
EconomiaComHistoria/
│
├── frontend-web/
├── frontend-mobile/
├── backend/
├── docs/
├── database/
├── uploads/
├── README.md
└── .gitignore
```

---

# 🌐 FRONTEND WEB (Angular)

```txt
frontend-web/
│
├── src/
│   ├── app/
│   │   ├── components/
│   │   ├── pages/
│   │   │   ├── auth/
│   │   │   ├── home/
│   │   │   ├── themes/
│   │   │   ├── contents/
│   │   │   ├── quizzes/
│   │   │   ├── forum/
│   │   │   └── profile/
│   │   │
│   │   ├── services/
│   │   ├── models/
│   │   ├── guards/
│   │   └── app-routing.module.ts
│   │
│   ├── assets/
│   └── environments/
│
├── angular.json
├── package.json
└── README.md
```

---

# 📱 FRONTEND MOBILE (Flutter)

```txt
frontend-mobile/
│
├── lib/
│   ├── pages/
│   ├── services/
│   ├── models/
│   ├── widgets/
│   └── main.dart
│
├── assets/
├── pubspec.yaml
└── README.md
```

---

# ⚙️ BACKEND (Laravel)

```txt
backend/
│
├── app/
│   ├── Http/
│   │   ├── Controllers/
│   │   ├── Middleware/
│   │   └── Requests/
│   │
│   ├── Models/
│   ├── Services/
│   └── Helpers/
│
├── database/
│   ├── migrations/
│   └── seeders/
│
├── routes/
│   └── api.php
│
├── storage/
├── public/
├── tests/
├── artisan
├── composer.json
└── README.md
```

---

# ☁️ STORAGE E MULTIMÉDIA

```txt
uploads/
│
├── images/
├── pdfs/
├── audio/
└── videos/
```

---

# 🔎 PESQUISA

Nesta fase inicial:

```txt
PostgreSQL Full Text Search
```

Sem necessidade de Meilisearch.

---

# 📄 DOCUMENTAÇÃO

```txt
docs/
│
├── api/
├── architecture/
├── diagrams/
├── uml/
├── database/
├── reports/
├── design-guide/
└── meeting-notes/
```

---

# 🎨 DESIGN SYSTEM

```txt
shared/
│
├── design-system/
│   ├── colors.md
│   ├── typography.md
│   ├── spacing.md
│   ├── buttons.md
│   ├── cards.md
│   ├── forms.md
│   ├── responsive-rules.md
│   └── accessibility.md
│
└── assets/
```

---

# ⚙️ INFRAESTRUTURA

```txt
Hospedagem Frontend → Vercel
Hospedagem Backend  → Railway
Base de Dados       → Neon/Supabase
```

---

# 🧠 PROCESSAMENTO DE PDFs

Fluxo:

```txt
Upload PDF
   ↓
Validação
   ↓
Compressão
   ↓
MinIO
   ↓
Queue Job
   ├── Gera thumbnail
   ├── Extrai texto
   ├── Indexa no Meilisearch
   └── Atualiza BD
```

---

# 🔥 ESTRATÉGIA DE INTEGRAÇÃO

## ✔ Regra principal

Frontend nunca deve esperar o backend terminar tudo.

Fluxo:

```txt
Backend cria rota
   ↓
Swagger/Postman atualizado
   ↓
Frontend integra imediatamente
   ↓
Testes contínuos
```

---

# 📌 API VERSIONING

```txt
/api/v1/auth
/api/v1/themes
/api/v1/contents
/api/v1/quizzes
/api/v1/forum
/api/v1/search
/api/v1/uploads
```

---

# 🧪 TESTES

```txt
backend/tests/
frontend-web/src/tests/
frontend-mobile/test/
```

Tipos:
- Unit Tests
- Integration Tests
- API Tests
- UI Tests

---

# 🔐 SEGURANÇA

## Obrigatório

- JWT Authentication
- Password Hashing
- Rate Limiting
- Upload Validation
- File Type Validation
- Role Permissions
- CORS
- CSRF Protection

---

# 🚀 ESCALABILIDADE FUTURA

Arquitetura preparada para:

- Gamificação
- Rankings
- AI Search
- Recomendações
- Live Classes
- Streaming
- Mobile Offline Mode
- Analytics avançado

---

# 💰 CUSTO DO PROJETO

## Ambiente Académico

```txt
Frontend Angular        → Gratuito
Frontend Flutter        → Gratuito
Laravel                 → Gratuito
PostgreSQL              → Gratuito
MinIO                   → Gratuito
Meilisearch             → Gratuito
Redis                   → Gratuito
Docker                  → Gratuito
Nginx                   → Gratuito
Linux Server            → Gratuito/local
```

## ✔ Resultado

O projeto pode ser desenvolvido:

- sem custos
- totalmente open source
- sem dependência de serviços pagos
- com deploy local ou VPS gratuita

---

# 🏆 CONCLUSÃO

A arquitetura proposta:

- suporta alto volume multimédia
- permite desenvolvimento paralelo
- facilita manutenção
- reduz retrabalho
- melhora integração entre equipas
- é escalável para produção real

A stack Laravel + Angular + Flutter é suficiente para suportar a plataforma de forma profissional e organizada.

