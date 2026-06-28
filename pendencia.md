# Pendencias

## Painel Administrativo

- [ ] Integrar `categorias` com o backend real.
- [ ] Integrar `comunidade` com o backend real, incluindo moderacao e criacao de topicos com controlo de visibilidade.
- [ ] Integrar `configuracoes` com persistencia real no backend.
- [ ] Completar a moderacao de denuncias com historico real no backend.
- [ ] Rever e alinhar os textos e labels do painel para os estados reais da API.

## Backend

- [ ] Criar endpoints de `community/categories` para atualizar e remover categorias.
- [ ] Criar endpoints/admin de listagem para topicos da comunidade com filtros por categoria, autor, status e flagged.
- [ ] Criar endpoints/admin de listagem para respostas da comunidade com filtros por accepted e flagged.
- [ ] Criar endpoints/admin para listar conteudo sinalizado de documentos com workflow editorial completo.
- [ ] Criar um endpoint para listagem completa do historico de denuncias.
- [ ] Rever se `deleteUser` precisa de limpar relacoes dependentes alem da remocao simples.
- [ ] Confirmar se a resposta de `access-requests` deve devolver mais metadados do utilizador.
- [ ] Criar endpoint de administracao para persistir configuracoes do painel, se essa secao deixar de ser mock.

## Frontend

- [ ] Remover `toPromise()` restante onde ainda houver e normalizar para `firstValueFrom`.
- [ ] Rever os avisos do build sobre imports nao usados em `home-visitor`.
- [ ] Rever `content-card` apontado como ficheiro compilado mas nao usado.
- [ ] Verificar se o painel admin precisa de feedback global reutilizavel para sucesso e erro.

## Documents Admin

- [ ] Implementar paginacao real em `GET /documents` no backend, para substituir a paginacao client-side temporaria.
- [ ] Adicionar filtro por `author` no backend de documentos, se for necessario que a pesquisa seja totalmente server-side.
- [ ] Formalizar no swagger a resposta de listagem de documentos como envelope estavel, porque hoje a API devolve `data` com array simples e sem metadados de paginacao.
- [ ] Definir oficialmente o suporte a media em Documents. O contrato actual continua focado em PDF e preview por imagem; `IMAGE`, `VIDEO` e `AUDIO` dependem de evolucao futura da API.

## Concluido

- [x] Remocao definitiva das referencias a comentarios de documentos.
- [x] O unico dominio oficial de discussao da plataforma passa a ser Community.

## Reports & Moderation

- [ ] Criar listagem administrativa global de reports, porque `GET /reports` devolve apenas as denuncias do utilizador autenticado e nao a fila completa de moderacao.
- [ ] Adicionar paginacao, ordenacao e filtros server-side em `GET /reports/pending` ou num endpoint administrativo equivalente.
- [ ] Expor contagem real de `actioned` no resumo administrativo.
- [ ] Clarificar no swagger os campos de `GET /reports/{id}` para preview e moderacao administrativa.

## Qualidade

- [ ] Adicionar testes especificos para a API administrativa.
- [ ] Adicionar testes de componente para os fluxos principais do painel admin.
- [ ] Validar o fluxo completo do admin no browser apos a integracao das proximas paginas.

## Sprint 13 — Domain Simplification (Categories ≠ Authorization) [CONCLUÍDO]

- [x] Refatoração do domínio de Community para desassociar autorização de categorias.
- [x] O campo `access_level_id` das categorias de comunidade passa a ser nullable e sem qualquer efeito nas políticas de acesso a tópicos.
- [x] A visibilidade do tópico passa a ditar totalmente as permissões de acesso:
  - `PUBLIC`: Aberto a todos.
  - `CATEGORY`: Restrito a utilizadores que sejam explicitamente membros da categoria (`category_members`), eliminando verificação por `AccessLevel` ou `AccessGrant`.
  - `INVITE_ONLY` (antigo `PRIVATE`): Apenas autores e membros convidados.
- [x] Swagger documentado sem a herança de acesso pelas categorias.

## Observacoes de roadmap

1. Mapping temporario de Community.
2. Reports com contrato de moderacao ainda dividido.
3. CommunityService ainda pode evoluir para Resources do Laravel numa sprint futura.

## Prioridade sugerida

- Sprint 13: Media e Conteudos.
- Sprint 14: Quiz Experience.
- Sprint 15: Community.
- Sprint 16: Reports.
- Sprint 17: Technical Debt.
