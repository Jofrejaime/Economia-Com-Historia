# API — Gamificação (pontos, níveis, badges)

**Versão:** 1.0.0 (Sprint 3)  
**Base URL:** `http://127.0.0.1:8000/api`  
**Autenticação:** Bearer Token

---

## Visão geral

A gamificação concentra-se no **`GamificationService`** (`app/Services/GamificationService.php`). Os controladores HTTP não criam transacções nem badges directamente — delegam no serviço.

### Tabelas

| Tabela | Papel |
|--------|--------|
| `level_definitions` | Definição dos 5 níveis (`min_points`, `max_points`, `perks`) |
| `user_levels` | Estado por utilizador: nível actual, totais, contadores de actividade |
| `point_transactions` | Histórico imutável de movimentos de pontos |
| `badges` | Definição de conquistas (`criteria_type`, `criteria_value` JSON) |
| `user_badges` | Badges ganhos (único por par `user_id` + `badge_id`) |

No **registo** (`POST /auth/register`) é criada uma linha em `user_levels` (nível 1, zeros).

---

## Níveis (`level_definitions`)

| Nível | Nome | min_points | max_points (referência) |
|-------|------|------------|-------------------------|
| 1 | Iniciante | 0 | 100 |
| 2 | Aprendiz | 101 | 250 |
| 3 | Estudioso | 251 | 500 |
| 4 | Pesquisador | 501 | 1000 |
| 5 | Mestre | 1001 | 2000 |

O nível efectivo é o **maior** `level` em que `min_points <= total_points` (não depende de `max_points` para subir de nível).

---

## Razões de transacção (`point_transactions.reason`)

Valores permitidos (alinhados com CHECK MySQL e `PointTransactionReason`):

| Razão | Uso actual |
|-------|------------|
| `quiz_completion` | Conclusão de quiz |
| `quiz_bonus_accuracy` | ≥ 80% respostas correctas |
| `quiz_bonus_speed` | Tempo ≤ metade do limite |
| `document_upload` | Reservado (futuro) |
| `topic_created` | Reservado (futuro) |
| `reply_posted` | Reservado (futuro) |
| `document_liked` | Reservado (futuro) |
| `admin_adjustment` | Ajustes manuais / deduções |

Cada transacção pode incluir `reference_id` + `reference_type` (ex. tentativa de quiz: `reference_type = quiz_attempt`).

---

## Endpoints HTTP

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| GET | `/me` | Inclui `user_level`, `level_definition`, `badges` |
| GET | `/me/point-transactions` | Histórico de pontos do utilizador |

Não existe ainda endpoint público para `awardPoints` / `deductPoints` — uso interno via serviço (quiz, futuros módulos, jobs admin).

---

## GET /me/point-transactions

**Query:**

| Parâmetro | Predefinição | Máximo |
|-----------|--------------|--------|
| `limit` | 50 | 100 |

**Request:**

```http
GET /api/me/point-transactions?limit=20
Authorization: Bearer <token>
```

**Resposta 200:**

```json
{
  "data": [
    {
      "id": "uuid",
      "user_id": "uuid",
      "points": 100,
      "reason": "quiz_completion",
      "reference_id": "attempt-uuid",
      "reference_type": "quiz_attempt",
      "description": "Quiz completed: Título (100%)",
      "created_at": "2026-06-04T12:00:00.000000Z"
    }
  ]
}
```

Ordenação: `created_at` descendente.

---

## GET /me — bloco de gamificação

Exemplo (campos relevantes):

```json
{
  "user": { "id": "...", "email": "...", "role": "estudante" },
  "profile": { "display_name": "..." },
  "access_grants": [ ... ],
  "user_level": {
    "user_id": "...",
    "current_level": 2,
    "total_points": 120,
    "weekly_points": 120,
    "monthly_points": 120,
    "quizzes_completed": 1,
    "documents_read": 0,
    "topics_created": 0,
    "replies_posted": 0
  },
  "level_definition": {
    "level": 2,
    "name": "Aprendiz",
    "min_points": 101,
    "max_points": 250,
    "color_hex": "#4CAF50",
    "perks": { "can_create_topics": false, ... }
  },
  "badges": [
    {
      "id": "badge-uuid",
      "name": "First Steps",
      "description": "Complete your first quiz",
      "icon_url": null,
      "color_hex": "#4CAF50",
      "category": "achievement",
      "earned_at": "2026-06-04T12:00:01.000000Z"
    }
  ]
}
```

---

## GamificationService — referência para backend

### awardPoints

```php
$result = $gamification->awardPoints(
    user: $user,
    points: 50,
    reason: PointTransactionReason::ADMIN_ADJUSTMENT,
    referenceId: null,
    referenceType: null,
    description: 'Bónus de evento',
);
```

- `points` deve ser **> 0**.
- Actualiza `total_points`, `weekly_points`, `monthly_points`, recalcula nível, pode atribuir badges.

### deductPoints

```php
$result = $gamification->deductPoints($user, 30, 'Correcção de pontos');
```

- Grava transacção negativa com razão `admin_adjustment`.
- Falha com `InvalidArgumentException` se o saldo ficar negativo.

### calculateLevel / updateLevel

```php
$definition = $gamification->calculateLevel(150); // level 2
$result = $gamification->updateLevel($user);       // sync + evaluateBadges
```

### evaluateBadges

Percorre `badges` activos; ignora se já existe em `user_badges`; avalia critério; insere nova linha.

Critérios **implementados:**

| criteria_type | criteria_value (exemplo) |
|---------------|---------------------------|
| `quiz_completed` | `{"count": 1}` |
| `topic_created` | `{"count": 1}` |
| `documents_read` | `{"count": 25}` |
| `level_reached` | `{"level": 3}` |

### recordQuizCompletion

Chamado apenas a partir de `QuizController::completeAttempt`:

```php
$result = $gamification->recordQuizCompletion(
    $user,
    $attemptId,
    $quizId,
    $correctAnswers,
    $totalQuestions,
    $timeSpentSecs,
);
```

Devolve `GamificationResult` com:

| Campo | Descrição |
|-------|-----------|
| `points_delta` | Soma de todos os pontos ganhos nesta conclusão |
| `total_points` | Saldo após operação |
| `current_level` | Nível após operação |
| `level_changed` | `true` se subiu ou desceu de nível |
| `previous_level` | Nível anterior (se mudou) |
| `transactions` | Lista de objectos `point_transactions` criados |
| `badges_earned` | Badges atribuídos nesta passagem |

### incrementCounters

```php
$gamification->incrementCounters($user, [
    'topics_created' => 1,
]);
```

Campos permitidos: `quizzes_completed`, `documents_read`, `topics_created`, `replies_posted`.

### reconcileUserPoints

Uso administrativo / manutenção: redefine `total_points` como `SUM(point_transactions.points)` e actualiza nível.

---

## Integridade de saldos

- Cada movimento cria **uma** linha em `point_transactions`.
- `user_levels.total_points` é incrementado/decrementado na mesma transacção DB.
- `weekly_points` e `monthly_points` só aumentam com pontos positivos (não descontam em deduções).
- `reconcileUserPoints()` corrige divergências entre soma histórica e saldo cacheado.

---

## Fluxo com quiz

Ver [Quizzes](./quizzes.md). Resumo:

```
completeAttempt → recordQuizCompletion
  → incrementCounters(quizzes_completed)
  → transacções de pontos
  → updateLevel → evaluateBadges
```

Resposta HTTP de `completeAttempt` inclui chave `gamification` com `toArray()` do resultado.

---

## Badges (seed)

O `BadgesSeeder` define conquistas como *First Steps* (`quiz_completed` count 1), *Quiz Master* (10 quizzes), etc. Tipos ainda não ligados a eventos (`reply_accepted`, `document_uploaded`) permanecem no seed mas não são avaliados até existir contador ou chamada explícita.

---

## O que ainda não está ligado

| Funcionalidade | Estado |
|----------------|--------|
| Notificações `level_up` / `badge_earned` | Não implementado (Sprint 7) |
| Leaderboard refresh após pontos | Não implementado |
| Pontos por like de documento / tópico | Razão na BD; sem endpoint |
| API admin para `awardPoints` / `deductPoints` | Apenas serviço interno |

---

## Testes

- `tests/Feature/GamificationTest.php`
- `tests/Feature/QuizGamificationTest.php`
- `tests/Unit/Services/GamificationServiceTest.php`

Resumo da sprint: [`docs/sprints/SPRINT-3-GAMIFICATION-QUIZ.md`](../sprints/SPRINT-3-GAMIFICATION-QUIZ.md)

**Última actualização:** 4 de junho de 2026
