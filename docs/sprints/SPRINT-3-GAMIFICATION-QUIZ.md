# Sprint 3 — Gamification Foundation + Quiz (mínimo)

**Data de conclusão:** 4 de junho de 2026  
**Âmbito:** backend Laravel (`backend/`)

---

## Objetivo

Implementar o motor de gamificação (pontos, níveis, badges) num único serviço e ligar apenas o fluxo de conclusão de quiz, sem duplicar lógica nos controladores nem alterar Community, Notifications, Leaderboard ou Reports.

---

## Entregas

| Área | Componente | Estado |
|------|------------|--------|
| Serviço | `app/Services/GamificationService.php` | ✅ |
| DTO | `app/Services/Gamification/GamificationResult.php` | ✅ |
| Razões de pontos | `app/Support/PointTransactionReason.php` | ✅ |
| Histórico | `GET /api/me/point-transactions` | ✅ |
| Quiz | `answerAttempt`, `completeAttempt` | ✅ |
| Testes | `GamificationTest`, `QuizGamificationTest` | ✅ |

**Fora de âmbito (por regra):** Community, Notifications, Leaderboard, Reports; pontos por documentos/comunidade (razões existem na BD, API ainda não exposta).

---

## GamificationService — API interna

| Método | Função |
|--------|--------|
| `awardPoints()` | Pontos positivos + transacção + nível + badges |
| `deductPoints()` | Penalização via `admin_adjustment` (valor negativo na transacção) |
| `calculateLevel(totalPoints)` | Definição de nível (maior `level` com `min_points <= total`) |
| `updateLevel(user)` | Sincroniza `current_level` e corre `evaluateBadges()` |
| `evaluateBadges(user)` | Atribui badges em falta; respeita `uq_user_badges` |
| `recordQuizCompletion(...)` | Entrada única para quiz concluído |
| `incrementCounters(user, array)` | `quizzes_completed`, `documents_read`, `topics_created`, `replies_posted` |
| `pointTransactionHistory(user, limit)` | Histórico ordenado por data |
| `reconcileUserPoints(user)` | Alinha `user_levels.total_points` com soma de transacções |

Todas as alterações de saldo passam por `applyPointsChange()` dentro de transacção DB.

---

## Fluxo quiz → gamificação

```
POST /quiz-attempts/{id}/complete
  QuizController (nota, score, status)
    → GamificationService::recordQuizCompletion()
         → incrementCounters(quizzes_completed +1)
         → point_transactions (completion, bónus)
         → user_levels (total, weekly, monthly, nível)
         → user_badges (evaluateBadges)
```

O `QuizController` **não** calcula pontos nem badges — apenas pontuação da tentativa (`score`, `correct_answers`, `performance_rating`).

Documentação de endpoints: [`docs/api/quizzes.md`](../api/quizzes.md)  
Documentação de gamificação: [`docs/api/gamification.md`](../api/gamification.md).

---

## Pontuação no quiz

Dado `base_points` do quiz e `accuracy = correct / total * 100`:

| Componente | Condição | Fórmula |
|------------|----------|---------|
| Conclusão | sempre (mín. 1 pt) | `round(base_points * accuracy/100)` |
| Bónus precisão | accuracy ≥ 80% | `round(base_points * 0.2)` |
| Bónus velocidade | `time_spent_secs <= time_limit_secs / 2` | `round(base_points * 0.1)` |

Razões em `point_transactions`: `quiz_completion`, `quiz_bonus_accuracy`, `quiz_bonus_speed`.

Campos na tentativa: `points_earned`, `bonus_points` (actualizados pelo serviço).

---

## Badges — critérios implementados

| `criteria_type` | Campo em `user_levels` |
|-----------------|-------------------------|
| `quiz_completed` | `quizzes_completed` ≥ `count` |
| `topic_created` | `topics_created` ≥ `count` |
| `documents_read` | `documents_read` ≥ `count` |
| `level_reached` | `current_level` ≥ `level` |

Outros tipos no seed (`reply_accepted`, `document_uploaded`, `interactions`) ficam para sprints futuras quando existirem contadores ou eventos.

---

## Leitura em `/me`

`GET /api/me` já devolve `user_level`, `level_definition` e `badges` (sem alteração nesta sprint além do consumo dos novos dados).

---

## Testes

```bash
cd backend
php artisan test --filter=Gamification
php artisan test --filter=QuizGamification
```

Suite completa: **66 testes** (inclui Sprint 1 e 2).

---

## Próximos passos (plano)

- Sprint 4: fechar Documents (favoritos, pontos opcionais `document_liked`)
- Sprint 5+: gate em Quiz listagem, CRUD professor; Community com `incrementCounters` + `awardPoints`
- Notifications: `level_up`, `badge_earned` após eventos de gamificação
