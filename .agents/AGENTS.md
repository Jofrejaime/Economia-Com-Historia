# AGENTS.md — Economia-Com-Historia Platform
> **Mandatory reading for every agent before any implementation task.**
> These rules were established by the project owner and cannot be overridden without explicit user approval.

---

## Contrato de API — Decisão Permanente

| Decisão | Detalhe |
|---|---|
| **Prefix oficial** | `/api/admin/*` |
| **Prefix eliminado** | `/api/v1/admin/*` — **foi removido em 02/07/2026 antes da Sprint 18.1** |
| **Frontend Angular** | Consome exclusivamente `/api/admin/*` para todas as operações administrativas de Quizzes e demais domínios |
| **Regra imutável** | Nenhum PR pode reintroduzir o prefix `v1/admin` |

---

## Princípios de Desenvolvimento (P1–P8)

### P1 — Domínio, não tabela
Não criar CRUD baseado em tabelas. Criar administração baseada em **agregados de domínio**.
- Exemplo correto: "Gestão de Utilizadores" = agregado `users + user_profiles + user_levels + user_badges`
- Exemplo errado: CRUD direto na tabela `users`

### P2 — Categoria A completa
Toda entidade **Categoria A** deve possuir obrigatoriamente:
listagem · detalhe · pesquisa · filtros · paginação · criação · edição · eliminação · registo de auditoria.

### P3 — Categoria B é visualização
Entidades **Categoria B** (ex.: `point_transactions`, `quiz_attempts`) **nunca** terão CRUD completo.
Apenas visualização e ferramentas administrativas de auditoria.

### P4 — Categoria C permanece interna
Entidades **Categoria C** **nunca** terão interface administrativa.
São geridas exclusivamente por código (migrations, seeders, eventos).

### P5 — Checklist de nova entidade
Toda nova entidade criada deve possuir **todos** os seguintes artefactos:
- [ ] Migration
- [ ] Model
- [ ] Seeder
- [ ] Factory
- [ ] Swagger (OpenAPI annotation)
- [ ] Testes Feature (≥ 1 por método de controller)
- [ ] Painel Admin (Angular)

> **PR sem qualquer um destes artefactos é rejeitado.**

### P6 — Frontend só via endpoint
Nenhuma sprint pode introduzir lógica administrativa diretamente no Frontend.
Todo comportamento deve possuir endpoint documentado no Swagger **antes** de ser consumido pelo Angular.

### P7 — Sempre Resources
Nenhuma página administrativa pode consumir diretamente tabelas ou arrays brutos.
Toda resposta da API deve passar por um **Laravel Resource**.
Adicionar o Resource é parte da definição de "feito".

### P8 — Tudo ou nada
Nenhuma entidade pode ficar "meio administrável".
Ou é totalmente administrável (Categoria A completa) ou permanece interna.
**Implementações parciais bloqueiam o merge.**

---

## Critérios Globais de Conclusão (Definition of Done)

- [ ] Todas as entidades Categoria A possuem CRUD completo com listagem, detalhe, pesquisa, filtros, paginação, criação, edição, eliminação e auditoria.
- [ ] Todas as entidades Categoria B possuem visualização e auditoria adequadas no painel.
- [ ] Todas as entidades Categoria C permanecem corretamente isoladas e sem interface administrativa.
- [ ] Todas as novas entidades Categoria D (Provinces, InterestAreas, Settings, LevelDefinitions) estão implementadas e integradas.
- [ ] Todos os endpoints administrativos estão documentados no Swagger (OpenAPI).
- [ ] Todos os módulos administrativos possuem cobertura de testes Feature (≥ 1 teste por método de controller).
- [ ] Não existem operações administrativas possíveis sem endpoint correspondente (zero lógica de negócio exclusivamente no Angular).
- [ ] O painel Angular cobre 100% das operações administrativas suportadas pela API.

---

## Estado Atual — Concluído antes de Sprint 18.1

- ✅ Bug do QuizService Angular corrigido: `createQuiz`/`updateQuiz`/`deleteQuiz` apontam para `/api/admin/quizzes`
- ✅ Grupo de rotas duplicado `v1/admin` (22 registos) removido de `routes/api.php`
- ✅ Contrato oficial definido: `/api/admin/*`

---

## Roadmap Sprint 18.x

| Sprint | Tema | Dias | Prioridade | Foco Principal |
|---|---|---|---|---|
| **18.1** | Fundações Técnicas & Correções | 2–3 | 🔴 Alta | 3 Artisan Commands, Scheduler, bug quiz, dead code |
| **18.2** | Configuração Global & Domínio D | 3–4 | 🔴 Alta | Settings, Level Definitions, Access Levels |
| **18.3** | Domínio de Utilizadores | 3–4 | 🔴 Alta | UserAdminService, Resources, 0→3 testes admin |
| **18.4** | Domínio de Documentos | 4–5 | 🔴 Alta | DocumentSearchService, Tags, 10→18 testes |
| **18.5** | Domínio de Comunidade | 4–5 | 🔴 Alta | CommunityCategoryService, TopicService, fixes |
| **18.6** | Moderação & Acesso | 3–4 | 🟡 Média | AccessRequestService, ReportService, revoke |
| **18.7** | Gamificação | 3–4 | 🟡 Média | BadgeService, 0→5 testes badges, DI ocultas |
| **18.8** | Regiões & Encerramento | 2–3 | 🔴 Alta | Provinces, InterestAreas, gate final |

### Sprint 18.1 — Detalhes de Entregáveis

1. **3 Artisan Commands** criados e agendados:
   - `leaderboard:refresh-national`
   - `gamification:reset-periodic-points`
   - `leaderboard:snapshot-daily`
2. **Laravel Scheduler** configurado para executar os 3 commands
3. **BadgeController** 100% coberto por testes (hoje: 0/5 métodos testados)
4. **AdminController** `users`, `updateUser`, `deleteUser` cobertos por testes (hoje: 0/3)
5. **Dead code** em `CommunityController::createTopic` removido
6. **Import ausente** de `Document` em `CommunityController` corrigido

---

## Stack Técnica

| Camada | Tecnologia |
|---|---|
| Backend | Laravel 13 (PHP 8.3) |
| Base de dados | MySQL (prod) / SQLite in-memory (testes) |
| ORM | Eloquent + Laravel Resources |
| Auth | Token personalizado via `user_sessions` |
| Frontend | Angular (painel admin) + React Native (mobile) |
| Documentação API | L5-Swagger (OpenAPI 3) |
| Testes | PHPUnit 12 via `php artisan test` |

---

## Regras de Implementação para Agentes

1. **Sempre verificar** `routes/api.php` antes de adicionar qualquer rota — usar exclusivamente o grupo `prefix('admin')` para operações administrativas.
2. **Sempre criar Laravel Resource** antes de retornar dados de qualquer endpoint novo.
3. **Sempre adicionar anotação Swagger** no controller antes de marcar endpoint como concluído.
4. **Sempre executar** `php artisan test` antes de reportar tarefa como concluída.
5. **Nunca** usar `Route::prefix('v1/admin')` — este prefix foi eliminado e é proibido.
6. **Verbos PATCH** são o padrão para transições de estado (publish, review, archive). Verbos POST redundantes para as mesmas acções não devem ser adicionados.

---

## Módulo 14 — Inventário de Entidades com Prioridade

> A sequência de sprints foi ordenada por esta tabela. Agentes devem consultar esta tabela antes de iniciar qualquer sprint para validar categoria, prioridade e sprint atribuída.

| Entidade | Categoria | Prioridade | Sprint | Justificação |
|---|---|---|---|---|
| Scheduler (Artisan Commands) | Infra | 🔴 Alta | 18.1 | Leaderboard e reset de pontos nunca são invocados — impacto crítico em produção |
| Rate Limiting | Infra | 🔴 Alta | 18.1 | Risco de abuso em todos os endpoints públicos |
| Rotas duplicadas (quiz) | Bug | 🔴 Alta | 18.1 | createQuiz/updateQuiz/deleteQuiz no Angular devolvem 404 em produção |
| Dead code CommunityController | Bug | 🔴 Alta | 18.1 | Código inacessível + variável undefined — risco de erro fatal em runtime |
| Settings | D | 🔴 Alta | 18.2 | Fundação necessária para configurar auto-grant, limites e parâmetros globais |
| Level Definitions | D | 🔴 Alta | 18.2 | Tabela já existente, sem gestão administrativa — afeta gamificação |
| Access Levels | A | 🟢 Baixa | 18.2 | Já funcional; adicionar gestão admin completa |
| Users | A | 🔴 Alta | 18.3 | AdminController::users/updateUser/deleteUser sem testes — pré-condição para qualquer gestão |
| User Profiles | B | 🔴 Alta | 18.3 | Visualização admin do perfil completo (agregado com levels, badges, points) |
| User Sessions | B | 🟡 Média | 18.3 | Auditoria de sessões ativas — segurança |
| Documents | A | 🔴 Alta | 18.4 | 10 métodos sem cobertura; store/update/destroy nunca testados via endpoint |
| Document Categories | A | 🔴 Alta | 18.4 | Dependência direta de Documents |
| Document Subscriptions | B | 🟡 Média | 18.4 | Já bem coberto; adicionar visualização admin centralizada |
| Tags | D | 🟡 Média | 18.4 | Gestão de tags de documentos — Categoria D sem admin |
| Community Categories | A | 🔴 Alta | 18.5 | Apenas storeCategory existe; faltam update, destroy e listagem admin |
| Discussion Topics | A | 🔴 Alta | 18.5 | CommunityController: joinTopic/leaveTopic sem testes; dead import de Document |
| Topic Replies | B | 🟡 Média | 18.5 | Visualização e moderação — não CRUD completo (Categoria B) |
| Reports | A | 🔴 Alta | 18.6 | Fluxo de moderação já funcional; completar visualização admin e auditoria |
| Access Requests | A | 🟡 Média | 18.6 | revokeGrant sem teste; AccessRequestService em falta |
| Access Grants | B | 🟡 Média | 18.6 | Visualização e revogação — não CRUD completo |
| Badges | A | 🟡 Média | 18.7 | BadgeController 0% testado — bloqueia toda expansão de gamificação |
| Point Transactions | B | 🟡 Média | 18.7 | Visualização apenas — never CRUD (Categoria B) |
| Quiz Attempts | B | 🟡 Média | 18.7 | showAttempt e myAttempts sem testes; visualização admin |
| Leaderboard | B | 🔴 Alta | 18.7 | Após scheduler da 18.1; snapshots e ranking provincial |
| Provinces | D | 🔴 Alta | 18.8 | Gestão de províncias angolanas — fundação de ranking provincial |
| Interest Areas | D | 🔴 Alta | 18.8 | Áreas de interesse de utilizadores — Categoria D sem admin |
| Quizzes (admin view) | A | 🔴 Alta | 18.8 | QuizAdminController 100% testado; adicionar vistas admin completas no painel |

### Legenda de Categorias

| Categoria | Descrição |
|---|---|
| **A** | Entidade totalmente administrável — CRUD completo + auditoria (P2) |
| **B** | Entidade de visualização/auditoria apenas — sem CRUD (P3) |
| **C** | Entidade interna — sem interface administrativa (P4) |
| **D** | Nova entidade de configuração/domínio a implementar (P5 aplicável) |
| **Infra** | Componente de infraestrutura — não é entidade de domínio |
| **Bug** | Correção obrigatória antes de avançar para sprints seguintes |
