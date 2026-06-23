# Referência Completa da API

Esta é a referência detalhada de todos os endpoints do backend do portal **Economia Com História**. Cada endpoint indica os requisitos de autenticação, roles, payloads esperados e respostas de sucesso e erro.

---

## 1. Módulo de Autenticação (`/api/auth/*` e `/api/me`)

### Registo de Utilizador
* **Método**: `POST`
* **Endpoint**: `/api/auth/register`
* **Autenticação**: Não (Pública)
* **Role**: Pública
* **Request**:
  ```json
  {
    "email": "estudante@economia.org",
    "password": "Kh7#m9$Pq2!z",
    "password_confirmation": "Kh7#m9$Pq2!z",
    "display_name": "António Silva",
    "full_name": "António João da Silva",
    "institution": "ISPTEC",
    "province": "Luanda",
    "role": "estudante"
  }
  ```
  *(Nota: O campo `role` pode ser `estudante`, `investigador` ou `professor`)*.
* **Response (201 Created)**:
  ```json
  {
    "message": "Registered successfully. Please verify your email.",
    "token": "d7a8fbc8d...80_char_token...",
    "user": {
      "id": "3f9c62ea-b827-4a0b-bc11-094389df0bcf",
      "email": "estudante@economia.org",
      "email_verified": false,
      "is_active": true,
      "role": "estudante",
      "created_at": "2026-06-23T12:00:00.000000Z",
      "updated_at": "2026-06-23T12:00:00.000000Z"
    },
    "verification_token": "a1b2c3d4..."
  }
  ```
* **Erros Possíveis**:
  * `422 Unprocessable Content`: Email duplicado ou senha fraca (exige 8+ chars, maiúsculas, minúsculas, números e símbolos).

---

### Login de Utilizador
* **Método**: `POST`
* **Endpoint**: `/api/auth/login`
* **Autenticação**: Não (Pública)
* **Request**:
  ```json
  {
    "email": "estudante@economia.org",
    "password": "Kh7#m9$Pq2!z"
  }
  ```
* **Response (200 OK)**:
  ```json
  {
    "message": "Login successful.",
    "token": "d7a8fbc8d...80_char_token...",
    "user": {
      "id": "3f9c62ea-b827-4a0b-bc11-094389df0bcf",
      "email": "estudante@economia.org",
      "email_verified": true,
      "is_active": true,
      "role": "estudante"
    },
    "profile": {
      "display_name": "António Silva",
      "full_name": "António João da Silva",
      "avatar_url": "https://avatar-host.com/default.png",
      "institution": "ISPTEC",
      "province": "Luanda"
    }
  }
  ```
* **Erros Possíveis**:
  * `422 Unprocessable Content`: Credenciais inválidas.
  * `403 Forbidden`: Utilizador inativo ou email não verificado (quando exigido em config).

---

### Obter Dados do Utilizador Autenticado
* **Método**: `GET`
* **Endpoint**: `/api/me`
* **Autenticação**: Sim
* **Response (200 OK)**:
  ```json
  {
    "user": {
      "id": "3f9c62ea-b827-4a0b-bc11-094389df0bcf",
      "email": "estudante@economia.org",
      "role": "estudante"
    },
    "profile": {
      "display_name": "António Silva",
      "avatar_url": "https://avatar-host.com/default.png",
      "province": "Luanda"
    },
    "access_grants": [
      {
        "id": "e83921ba-...",
        "access_level_id": "jindungo",
        "access_level_name": "Jindungo",
        "granted_at": "2026-06-23T12:15:00.000000Z"
      }
    ],
    "user_level": {
      "current_level": 2,
      "total_points": 120,
      "weekly_points": 30,
      "monthly_points": 80,
      "quizzes_completed": 3,
      "documents_read": 5,
      "topics_created": 1,
      "replies_posted": 2
    },
    "level_definition": {
      "level": 2,
      "name": "Explorador da Economia",
      "points_required": 100,
      "color_hex": "#27ae60"
    },
    "badges": [
      {
        "id": "quiz-master-1",
        "name": "Quiz Mestre",
        "description": "Completou 3 quizzes perfeitos",
        "icon_url": "https://host.com/badges/quiz.png",
        "color_hex": "#ffd700",
        "category": "quizzes",
        "earned_at": "2026-06-23T12:10:00.000000Z"
      }
    ]
  }
  ```

---

### Refresh de Token
* **Método**: `POST`
* **Endpoint**: `/api/auth/refresh`
* **Autenticação**: Não (Envia token de refresh no header `Authorization` ou `X-Session-Token`)
* **Response (200 OK)**:
  ```json
  {
    "message": "Token refreshed.",
    "token": "new_80_char_token..."
  }
  ```
* **Erros Possíveis**:
  * `422 Unprocessable Content`: Token em falta ou inválido.
  * `401 Unauthorized`: Sessão expirada na base de dados.

---

## 2. Perfil de Utilizador (`/api/profile/*`)

### Obter Perfil
* **Método**: `GET`
* **Endpoint**: `/api/profile`
* **Autenticação**: Sim
* **Response (200 OK)**:
  ```json
  {
    "id": "...",
    "display_name": "António Silva",
    "full_name": "António João da Silva",
    "biography": "Estudante de Economia interessado na história colonial.",
    "institution": "ISPTEC",
    "province": "Luanda",
    "avatar_url": "https://..."
  }
  ```

---

### Atualizar Perfil
* **Método**: `PUT`
* **Endpoint**: `/api/profile`
* **Autenticação**: Sim
* **Request**:
  ```json
  {
    "display_name": "António Silva Editado",
    "biography": "Nova biografia do estudante.",
    "province": "Benguela",
    "institution": "UMinho"
  }
  ```
* **Response (200 OK)**:
  ```json
  {
    "message": "Profile updated successfully.",
    "profile": {
      "display_name": "António Silva Editado",
      "biography": "Nova biografia do estudante.",
      "province": "Benguela",
      "institution": "UMinho"
    }
  }
  ```

---

### Atualizar Password
* **Método**: `PUT`
* **Endpoint**: `/api/profile/password`
* **Autenticação**: Sim
* **Request**:
  ```json
  {
    "current_password": "Kh7#m9$Pq2!z",
    "password": "NewSecurePass123!",
    "password_confirmation": "NewSecurePass123!"
  }
  ```
* **Response (200 OK)**:
  ```json
  {
    "message": "Password updated successfully."
  }
  ```
* **Erros**:
  * `422 Unprocessable Content`: Senha atual incorreta ou validação falhou.

---

## 3. Gestão de Níveis de Acesso e Pedidos (`/api/access-*`)

### Criar Pedido de Acesso
* **Método**: `POST`
* **Endpoint**: `/api/access-requests`
* **Autenticação**: Sim
* **Request**:
  ```json
  {
    "access_level_id": "jindungo",
    "justification": "Necessito de consultar arquivos coloniais de Benguela para a minha tese académica."
  }
  ```
* **Response (201 Created)**:
  ```json
  {
    "message": "Access request submitted.",
    "data": {
      "id": "a9a8a7a6-...",
      "user_id": "3f9c62ea-...",
      "access_level_id": "jindungo",
      "justification": "Necessito de consultar...",
      "status": "pending",
      "created_at": "2026-06-23T12:20:00.000000Z"
    }
  }
  ```

---

### Rever Pedido de Acesso (Exclusivo Admin)
* **Método**: `PATCH`
* **Endpoint**: `/api/access-requests/{id}`
* **Autenticação**: Sim
* **Role**: Admin
* **Request**:
  ```json
  {
    "status": "approved",
    "notes": "Justificação sólida. Aprovado para duração de 6 meses."
  }
  ```
* **Response (200 OK)**:
  ```json
  {
    "message": "Access request approved.",
    "request": {
      "id": "a9a8a7a6-...",
      "status": "approved",
      "reviewed_at": "2026-06-23T12:25:00.000000Z"
    }
  }
  ```

---

## 4. Repositório de Documentos (`/api/documents/*`)

### Listar Documentos
* **Método**: `GET`
* **Endpoint**: `/api/documents`
* **Query Params** (Opcionais): `category_id`, `document_type`, `academic_level`, `access_level_id`, `status`
* **Response (200 OK)**:
  ```json
  {
    "data": [
      {
        "id": "e9b27e8a-...",
        "title": "O Caminho de Ferro de Benguela e o seu impacto",
        "author": "Dr. Jaime Jofre",
        "summary": "Estudo aprofundado sobre o impacto macroeconómico...",
        "document_type": "article",
        "academic_level": "advanced",
        "access_level_id": "public",
        "category_name": "Economia Colonial",
        "likes_count": 15,
        "views_count": 142,
        "pdf_url": "https://economia-com-historia.ao/storage/cfb.pdf"
      }
    ]
  }
  ```

---

### Gostar de um Documento
* **Método**: `POST`
* **Endpoint**: `/api/documents/{id}/like`
* **Autenticação**: Sim
* **Response (200 OK)**:
  ```json
  {
    "message": "Document liked.",
    "gamification": {
      "points_awarded": 5,
      "current_level": 2,
      "badges_earned": []
    }
  }
  ```

---

### Gerar Citação
* **Método**: `POST`
* **Endpoint**: `/api/documents/{id}/citations`
* **Request**:
  ```json
  {
    "citation_format": "apa"
  }
  ```
* **Response (200 OK)**:
  ```json
  {
    "message": "Citation created.",
    "citation": "Dr. Jaime Jofre (2026). O Caminho de Ferro de Benguela e o seu impacto.",
    "format": "apa"
  }
  ```

---

## 5. Módulo de Quizzes (`/api/quizzes/*` e `/api/quiz-attempts/*`)

### Iniciar Tentativa de Quiz
* **Método**: `POST`
* **Endpoint**: `/api/quizzes/{id}/attempts`
* **Response (201 Created)**:
  ```json
  {
    "message": "Attempt started.",
    "attempt_id": "f5f5f5f5-..."
  }
  ```

---

### Responder a Pergunta do Quiz
* **Método**: `POST`
* **Endpoint**: `/api/quiz-attempts/{id}/answers`
* **Request**:
  ```json
  {
    "question_id": "q1-uuid...",
    "selected_option": "A"
  }
  ```
* **Response (200 OK)**:
  ```json
  {
    "message": "Answer recorded."
  }
  ```

---

### Concluir Tentativa de Quiz
* **Método**: `POST`
* **Endpoint**: `/api/quiz-attempts/{id}/complete`
* **Response (200 OK)**:
  ```json
  {
    "message": "Quiz attempt completed.",
    "score": 80.0,
    "correct_answers": 4,
    "total_questions": 5,
    "points_earned": 50,
    "gamification": {
      "points_awarded": 50,
      "level_up": false,
      "badges_earned": [
        {
          "id": "badge-123",
          "name": "Conquistador Ferroviário"
        }
      ]
    }
  }
  ```

---

## 6. Fórum e Comunidade (`/api/topics/*` e `/api/replies/*`)

### Criar Tópico de Discussão
* **Método**: `POST`
* **Endpoint**: `/api/topics`
* **Request**:
  ```json
  {
    "category_id": "c1-uuid...",
    "title": "Qual foi a principal moeda antes do Kwanza?",
    "content": "Gostaria de iniciar um debate sobre o Zimbo e as outras moedas utilizadas no comércio angolano."
  }
  ```
* **Response (201 Created)**:
  ```json
  {
    "message": "Topic created.",
    "id": "t9t9t9t9-..."
  }
  ```

---

### Aceitar Resposta Como Solução
* **Método**: `POST`
* **Endpoint**: `/api/replies/{id}/accept`
* **Autenticação**: Sim (Apenas dono do tópico ou admin)
* **Response (200 OK)**:
  ```json
  {
    "message": "Reply accepted as solution.",
    "gamification": {
      "points_awarded": 15,
      "current_level": 3
    }
  }
  ```

---

## 7. Leaderboards e Estatísticas (`/api/leaderboard/*` e `/api/stats/*`)

### Ranking Nacional
* **Método**: `GET`
* **Endpoint**: `/api/leaderboard/national`
* **Response (200 OK)**:
  ```json
  {
    "data": [
      {
        "position": 1,
        "display_name": "Prof. Manuel Cordeiro",
        "province": "Huambo",
        "total_points": 1420,
        "avatar_url": "https://..."
      },
      {
        "position": 2,
        "display_name": "António Silva",
        "province": "Luanda",
        "total_points": 120,
        "avatar_url": "https://..."
      }
    ]
  }
  ```

---

## 8. Módulo de Notificações (`/api/notifications/*`)

### Marcar Todas Como Lidas
* **Método**: `PATCH`
* **Endpoint**: `/api/notifications/read-all`
* **Response (200 OK)**:
  ```json
  {
    "message": "All notifications marked as read."
  }
  ```

---

## 9. Módulo de Denúncias e Moderação (`/api/reports/*`)

### Registar Denúncia (Report)
* **Método**: `POST`
* **Endpoint**: `/api/reports`
* **Request**:
  ```json
  {
    "content_type": "reply",
    "content_id": "rep-uuid-123",
    "reason": "spam",
    "details": "Esta resposta é uma publicidade enganosa não relacionada com o tema do comércio colonial."
  }
  ```
* **Response (201 Created)**:
  ```json
  {
    "message": "Report submitted successfully.",
    "report": {
      "id": "rep-999-...",
      "content_type": "reply",
      "reason": "spam",
      "status": "pending"
    }
  }
  ```
