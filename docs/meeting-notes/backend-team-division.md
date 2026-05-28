# Divisao do Backend entre 2 Pessoas

Este documento separa o trabalho do backend em duas frentes para evitar conflito de areas e permitir desenvolvimento paralelo.

## Pessoa 1 ( Jofre Jaime )- Core e Autenticacao

Responsabilidades principais:

- Autenticacao, registo, login, logout, refresh token e recuperacao de conta.
- Gestao de utilizadores e perfis.
- Middleware de seguranca e autorizacao.
- Niveis de acesso, pedidos de acesso e atribuicao de permissões.
- Base das migracoes ligadas a identidade e seguranca.
- Testes das rotas de autenticao e protecao de API.

Areas de codigo:

- `app/Http/Controllers/Api/AuthController.php`
- `app/Http/Middleware/AuthenticateApiSession.php`
- `app/Models/User.php`
- migracoes de `users`, `user_profiles`, `user_sessions`, `verification_tokens`, `access_levels`, `user_access_requests`, `user_access_grants`

Entregas esperadas:

- Fluxo de cadastro totalmente funcional.
- Fluxo de login e refresh totalmente funcional.
- Verificacao de email e reset de password implementados.
- Regras de acesso consistentes para rotas protegidas.

## Pessoa 2 ( Abel Canas ) - Conteudo e Funcionalidades do Sistema

Responsabilidades principais:

- Documentos, categorias, etiquetas, favoritos, likes, downloads e citacoes.
- Quizzes, perguntas, opcoes, tentativas e respostas.
- Comunidade, topicos, replies, likes, seguidores e membros de categoria.
- Leaderboard, snapshots, cache e rotinas de atualizacao.
- Notificacoes e reportes/moderacao.
- Seeds e dados de exemplo para areas funcionais.

Areas de codigo:

- `app/Http/Controllers/Api/DocumentController.php`
- `app/Http/Controllers/Api/QuizController.php`
- `app/Http/Controllers/Api/CommunityController.php`
- `app/Http/Controllers/Api/LeaderboardController.php`
- `app/Http/Controllers/Api/NotificationController.php`
- `app/Http/Controllers/Api/ReportController.php`
- migracoes de `document_*`, `quiz_*`, `community_*`, `leaderboard_*`, `notifications`, `content_reports`

Entregas esperadas:

- CRUD base para documentos e comunidade.
- Fluxo completo de quizzes com tentativas e pontuacao.
- Leaderboard a funcionar com refresh consistente.
- Sistema de notificacoes e moderacao operacional.

## Regras de Trabalho

- Cada pessoa trabalha apenas nas suas rotas, controladores e migracoes principais.
- Se for necessario tocar em areas partilhadas, abrir primeiro uma nota curta no `docs/meeting-notes`.
- O contrato entre as duas partes deve ficar sempre em `routes/api.php` e na documentacao de `docs/api`.
- Antes de fazer merge, validar em conjunto: migracoes, autenticao e um fluxo funcional de cada modulo.

## Divisao Recomendada por Sprint

1. Sprint 1: autenticacao, usuarios e base de seguranca.
2. Sprint 2: documentos, quizzes e comunidade.
3. Sprint 3: leaderboard, notificacoes, reportes e testes finais.

## Nota Final

Esta divisao assume que a Pessoa 1 fica mais perto da base tecnica e a Pessoa 2 mais perto das funcionalidades de negocio. Se quiser, isto pode ser ajustado para refletir a experiencia de cada pessoa.