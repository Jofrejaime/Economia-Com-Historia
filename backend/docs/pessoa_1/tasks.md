# Pessoa 1 - Tasks

Branch: `pessoa_1`

## Task Breakdown
1. Implementar ou rever o fluxo de autenticação: registo, login, logout, refresh token e recuperação de conta.
2. Garantir gestão de utilizadores e perfis na base do sistema.
3. Implementar middleware de segurança e autorização para rotas protegidas.
4. Criar e validar níveis de acesso, pedidos de acesso e atribuição de permissões.
5. Estruturar as migrações ligadas à identidade e segurança.
6. Cobrir com testes as rotas de autenticação e proteção da API.

## Áreas Prioritárias
- `app/Http/Controllers/Api/AuthController.php`
- `app/Http/Middleware/AuthenticateApiSession.php`
- `app/Models/User.php`
- Migrações de `users`, `user_profiles`, `user_sessions`, `verification_tokens`, `access_levels`, `user_access_requests`, `user_access_grants`

## Ordem Sugerida
- Começar pela autenticação e recuperação de conta.
- Depois estabilizar perfil e segurança de API.
- Por fim fechar permissões, pedidos de acesso e testes.

## Done When
- O cadastro, login e refresh funcionam de ponta a ponta.
- A verificação de email e reset de password estão operacionais.
- As rotas protegidas respeitam as regras de autorização definidas.
- A base de dados suporta o módulo sem inconsistências nas migrações principais.
