# Fluxos Funcionais do Sistema

Este documento descreve as principais jornadas de utilizador e fluxos transacionais do backend do portal **Economia Com História**. Cada fluxo é ilustrado com diagramas Mermaid para facilitar a integração dos frontends (Angular e React Native).

---

## 1. Fluxos de Perfis (User Roles)

### 1.1 Utilizador Não Logado (Visitante)
O visitante tem acesso apenas a rotas públicas. O seu objetivo é conhecer o portal, registar-se ou recuperar credenciais se necessário.

```mermaid
sequenceDiagram
    autonumber
    actor Visitante as Visitante
    participant API as Backend (Laravel)
    participant DB as Base de Dados

    Note over Visitante, API: Caso 1: Registo de Nova Conta
    Visitante->>API: POST /api/auth/register {email, password, display_name, role}
    API->>DB: Inserir em users, user_profiles e user_levels (nível 1)
    API->>DB: Criar token de verificação de email
    API-->>Visitante: Devolve token JWT temporário + verification_token

    Note over Visitante, API: Caso 2: Login de Sessão
    Visitante->>API: POST /api/auth/login {email, password}
    API->>DB: Validar credenciais & gerar token de sessão
    API-->>Visitante: Devolve token JWT + dados do utilizador e perfil
```

---

### 1.2 Estudante
O estudante consome conteúdos (documentos, quizzes) e participa na comunidade. O seu acesso a documentos restritos depende do seu nível ou de concessões explícitas.

```mermaid
flowchart TD
    A[Estudante Autenticado] --> B{Ações Disponíveis}
    B --> C[Consultar Documentos]
    B --> D[Responder a Quizzes]
    B --> E[Participar no Fórum]
    B --> F[Pedir Nível de Acesso]

    C --> C1[GET /api/documents]
    C1 --> C2{Nível do Doc?}
    C2 -- Público/Autorizado --> C3[Ver PDF e Gostar]
    C2 -- Restrito --> C4[Bloqueado: Solicitar Acesso]

    D --> D1[POST /api/quizzes/{id}/attempts]
    D1 --> D2[POST /api/quiz-attempts/{id}/answers]
    D2 --> D3[POST /api/quiz-attempts/{id}/complete]
    D3 --> D4[Ganhar Pontos e Subir Nível]
```

---

### 1.3 Professor
O professor gere o conhecimento. Cria, edita e remove documentos e quizzes no portal, além de interagir como utilizador.

```mermaid
sequenceDiagram
    autonumber
    actor Prof as Professor (Owner)
    participant API as Backend (Laravel)
    participant DB as Base de Dados

    Prof->>API: POST /api/documents {title, category_id, access_level_id, pdf_url, ...}
    API->>DB: Inserir em 'documents' (status: draft)
    API-->>Prof: 201 Created (document_id)

    Prof->>API: PATCH /api/documents/{id} {status: 'published'}
    API->>DB: Atualizar status e definir 'published_at'
    API-->>Prof: 200 OK (Documento publicado)
```

---

### 1.4 Administrador
O administrador controla as permissões, modera a comunidade, audita as denúncias e envia notificações globais.

```mermaid
flowchart LR
    Admin[Administrador] --> Access[Gerir Pedidos de Acesso]
    Admin --> Community[Criar Categorias de Fórum]
    Admin --> Moderation[Moderar Denúncias / Reports]
    Admin --> GlobalNotify[Enviar Notificações Globais]
```

---

## 2. Fluxos Transacionais por Funcionalidade

### 2.1 Comunidade (Fórum)
Fluxo de criação de debate, resposta, solução aceite e distribuição de méritos.

```mermaid
sequenceDiagram
    autonumber
    actor UserA as Estudante A (Autor)
    actor UserB as Estudante B (Respondente)
    participant API as Backend (Laravel)
    participant DB as Base de Dados
    participant Service as Gamification & Notification Services

    UserA->>API: POST /api/topics {category_id, title, content}
    API->>DB: Gravar tópico na tabela 'discussion_topics'
    API-->>UserA: 201 Created (topic_id)

    UserB->>API: POST /api/topics/{id}/replies {content}
    API->>DB: Gravar resposta na tabela 'topic_replies'
    API->>Service: Notificar autor do tópico e seguidores
    API-->>UserB: 201 Created (reply_id)

    UserA->>API: POST /api/replies/{reply_id}/accept
    API->>DB: Definir reply.is_accepted = true
    API->>Service: Atribuir 15 pontos ao Respondente (UserB)
    API->>Service: Enviar notificação de solução aceite ao UserB
    API-->>UserA: 200 OK
```

---

### 2.2 Quizzes (Resolução e Gamificação)
Como o estudante resolve testes de conhecimento e o motor do backend calcula pontos.

```mermaid
sequenceDiagram
    autonumber
    actor User as Estudante
    participant API as Backend (Laravel)
    participant Attempt as QuizAttemptService
    participant Gamify as GamificationService
    participant DB as Base de Dados

    User->>API: POST /api/quizzes/{id}/attempts
    API->>Attempt: Iniciar tentativa
    Attempt->>DB: Inserir em 'quiz_attempts' (status: in_progress)
    API-->>User: 201 Created (attempt_id)

    loop Cada Pergunta
        User->>API: POST /api/quiz-attempts/{attempt_id}/answers {question_id, selected_option}
        API->>DB: Inserir/Atualizar em 'quiz_attempt_answers'
        API-->>User: 200 OK
    end

    User->>API: POST /api/quiz-attempts/{attempt_id}/complete
    API->>Attempt: Calcular pontuação e percentagem de acerto
    API->>Gamify: Avaliar regras de pontuação (ex: 10 pts por resposta correta)
    Gamify->>DB: Atualizar 'user_levels' (total_points)
    Gamify->>DB: Registar conquista em 'user_badges' (se aplicável)
    API-->>User: 200 OK (Score, Pontos Ganhos, Insígnias Desbloqueadas)
```

---

### 2.3 Controlo de Acesso (Solicitação e Concessão)
Processo pelo qual um utilizador ganha direitos a documentos restritos e é notificado.

```mermaid
sequenceDiagram
    autonumber
    actor User as Estudante
    actor Admin as Administrador
    participant API as Backend (Laravel)
    participant Gate as AccessGateService
    participant DB as Base de Dados

    User->>API: POST /api/access-requests {access_level_id, justification}
    API->>DB: Inserir em 'access_requests' (status: pending)
    API-->>User: 201 Created (request_id)

    Admin->>API: PATCH /api/access-requests/{request_id} {status: 'approved', notes: '...'}
    API->>Gate: Conceder Acesso
    Gate->>DB: Inserir em 'user_access_grants' (user_id, access_level_id)
    Gate->>DB: Inserir notificação de aprovação na tabela 'notifications'
    API-->>Admin: 200 OK
```
