# Pessoa 1 - API Contract

## Objetivo
Manter a camada de identidade e perfil separada do domínio de conteúdo.

## Endpoints

### `GET /api/me`
Retorna o contexto autenticado do utilizador.

Payload:
- `user`: dados base do utilizador autenticado.
- `profile`: registo da tabela `user_profiles` associado ao utilizador.
- `access_grants`: permissões efetivamente atribuídas, com detalhe do nível de acesso.

### `GET /api/profile`
Retorna apenas os dados de perfil do utilizador autenticado.

### `PUT /api/profile`
Atualiza os campos editáveis do perfil.

### `POST /api/profile/avatar`
Atualiza o avatar do utilizador autenticado.

### `PUT /api/profile/password`
Atualiza a password do utilizador autenticado.

## Fora do Escopo
- Contagens de notificações.
- Estatísticas de conteúdo ou gamificação.
- Fluxos de documentos, quizzes, comunidade ou leaderboard.
