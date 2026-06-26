# Pendencias

## Painel Administrativo

- [ ] Integrar `categorias` com o backend real.
- [ ] Integrar `comunidade` com o backend real, incluindo moderacao e criacao de topicos com controlo de visibilidade.
- [ ] Adicionar suporte a topico `privado`/`publico` na modelagem e na UI do admin, com toggle na criacao e moderacao.
- [ ] Integrar `configuracoes` com persistencia real no backend.
- [ ] Completar a moderacao de denuncias com historico real no backend.
- [ ] Rever e alinhar os textos/labels do painel para os estados reais da API.

## Backend

- [ ] Criar endpoints de `community/categories` para atualizar e remover categorias.
- [ ] Criar endpoints/admin de listagem para topicos da comunidade com filtros por categoria, autor, status e flagged.
- [ ] Criar endpoints/admin de listagem para respostas da comunidade com filtros por accepted e flagged.
- [ ] Criar endpoints/admin para listar conteudo sinalizado de documentos com workflow editorial completo.
- [ ] Criar um endpoint para listagem completa do historico de denuncias.
- [ ] Garantir que a API de topicos devolve e valida a visibilidade para o frontend admin.
- [ ] Rever se `deleteUser` precisa de limpar relacoes dependentes alem da remocao simples.
- [ ] Confirmar se a resposta de `access-requests` deve devolver mais metadados do utilizador.
- [ ] Criar endpoint de administracao para persistir configuracoes do painel, se essa secao deixar de ser mock.

## Frontend

- [ ] Remover `toPromise()` restante onde ainda houver e normalizar para `firstValueFrom`.
- [ ] Rever os avisos do build sobre imports nao usados em `home-visitor`.
- [ ] Rever `content-card` apontado como ficheiro compilado mas nao usado.
- [ ] Verificar se o painel admin precisa de feedback global reutilizavel para sucesso/erro.

## Documents Admin

- [ ] Implementar paginacao real em `GET /documents` no backend, para substituir a paginacao client-side temporaria.
- [ ] Adicionar filtro por `author` no backend de documentos, se for necessario que a pesquisa seja totalmente server-side.
- [ ] Formalizar no swagger a resposta de listagem de documentos como envelope estavel, porque hoje a API devolve `data` com array simples e sem metadados de paginacao.

## Reports & Moderation

- [ ] Criar listagem administrativa global de reports, porque `GET /reports` devolve apenas as denuncias do utilizador autenticado e nao a fila completa de moderacao.
- [ ] Adicionar paginacao, ordenacao e filtros server-side em `GET /reports/pending` ou num endpoint administrativo equivalente.
- [ ] Expor contagem real de `actioned` no resumo administrativo.
- [ ] Alinhar o contrato do resumo de reports, porque a API expoe `reports_resolved` mas o frontend de moderacao usa o estado `reviewed`.
- [ ] Clarificar no swagger os campos de `GET /reports/{id}` para preview e moderacao administrativa.

## Qualidade

- [ ] Adicionar testes especificos para a API administrativa.
- [ ] Adicionar testes de componente para os fluxos principais do painel admin.
- [ ] Validar o fluxo completo do admin no browser apos a integracao das proximas paginas.
