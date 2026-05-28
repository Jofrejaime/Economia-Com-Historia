# Pessoa 1 - Requirements

Branch: `pessoa_1`

## Objetivo
Concentrar o backend da pessoa 1 na base do sistema: autenticação, utilizadores, segurança e permissões.

## Responsabilidades Funcionais
- O sistema deve permitir registo, login, logout, refresh token e recuperação de conta.
- O sistema deve suportar verificação de email e reset de password.
- O sistema deve permitir gestão de utilizadores e perfis.
- O sistema deve suportar middleware de segurança e autorização para rotas protegidas.
- O sistema deve suportar níveis de acesso, pedidos de acesso e atribuição de permissões.
- O sistema deve incluir a base das migrações ligadas à identidade e segurança.
- O sistema deve cobrir testes das rotas de autenticação e proteção de API.

## Areas de Codigo
- `app/Http/Controllers/Api/AuthController.php`
- `app/Http/Middleware/AuthenticateApiSession.php`
- `app/Models/User.php`
- Migrações de `users`, `user_profiles`, `user_sessions`, `verification_tokens`, `access_levels`, `user_access_requests`, `user_access_grants`

## Entregas Esperadas
- Fluxo de cadastro totalmente funcional.
- Fluxo de login e refresh totalmente funcional.
- Verificação de email e reset de password implementados.
- Regras de acesso consistentes para rotas protegidas.

## Critérios de Aceitação
- As rotas de autenticação funcionam sem regressões em pedidos JSON e form-data.
- O utilizador autenticado consegue aceder às rotas protegidas apenas quando autorizado.
- As migrações de identidade e segurança permitem estruturar a base do módulo sem conflitos.
- Os testes cobrem os fluxos principais de autenticação e proteção da API.
