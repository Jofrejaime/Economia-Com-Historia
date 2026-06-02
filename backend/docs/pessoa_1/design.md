# Pessoa 1 - Design

Branch: `pessoa_1`

## Scope
Esta frente cobre apenas a camada core do backend: autenticação, utilizadores, middleware de segurança, permissões e migrações de identidade.

## Arquitetura de Alto Nível
- A camada de API recebe pedidos e devolve respostas JSON.
- O controller de autenticação centraliza cadastro, login, logout e refresh.
- O middleware `AuthenticateApiSession` protege rotas autenticadas.
- O modelo `User` serve como entidade base para identidade e perfil.
- As migrações constroem a base de identidade, verificação e acesso.

## Entidades Principais
- `users`: identidade principal do utilizador.
- `user_profiles`: dados estendidos do perfil.
- `user_sessions`: sessões e controlo de autenticação.
- `verification_tokens`: confirmação de email e recuperação de conta.
- `access_levels`: níveis e permissões de acesso.
- `user_access_requests`: pedidos feitos pelos utilizadores.
- `user_access_grants`: permissões efetivamente atribuídas.

## Fluxos-Chave
1. Registo cria o utilizador e prepara a verificação de email.
2. Login emite o contexto de sessão/autenticação para a API.
3. Refresh mantém a sessão válida sem obrigar a novo login.
4. Regras de autorização bloqueiam rotas protegidas sem permissões.
5. Pedidos de acesso são criados, revistos e transformados em grants.

## Decisões de Design
- Separar autenticação, perfil e permissões para reduzir acoplamento.
- Guardar tokens e sessões em tabelas próprias para facilitar revogação e auditoria.
- Manter os níveis de acesso como dados, não como lógica fixa no controller.
- Validar requests de forma consistente para JSON e form-data.

## Riscos
- Erros no parsing de request podem bloquear registo e reset de password.
- Rotas protegidas dependem de uma regra clara de sessão/autorização.
- Migrações de segurança precisam ser consistentes com os testes de API.
