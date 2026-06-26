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

## Sprint 12 - Consolidacao do Dominio

- [ ] O contrato de visibilidade da Community ficou congelado no frontend como `PUBLIC`, `CATEGORY` e `INVITE_ONLY`, mas o backend continua a mapear internamente `RESTRICTED` e `PRIVATE` ate a proximas sprints.
- [ ] Clarificar a regra de administracao sobre conteudo de terceiros. O frontend admin ainda suporta edicao de topics e replies por compatibilidade, mas a regra alvo continua a ser remover, arquivar, bloquear e mover categoria sem editar conteudo de terceiros.
- [ ] Remover ou formalizar `comments_count` em Documents no backend. O frontend ja deixou de depender do campo, mas o schema continua a expô-lo.
- [ ] Definir oficialmente o suporte a media em Documents. O contrato de frontend continua focado em PDF e preview por imagem; IMAGE, VIDEO e AUDIO permanecem dependentes de evolucao da API.
- [ ] Confirmar se o contrato de Reports deve continuar com `GET /reports` para denuncias do proprio utilizador e `GET /reports/pending` para fila administrativa, ou se sera criado um contrato unico de moderacao.
- [ ] Confirmar se os estados `review` e `resolved` podem continuar como legado no resumo administrativo enquanto o frontend consome `archived` e `reviewed`.

O que ainda vejo como dívida técnica

Existem três pontos que eu manteria registados para futuras sprints.

1. Mapping temporário de Community

Hoje existe um adaptador:

PUBLIC
↓

backend antigo

↓

frontend novo

Esse adaptador é aceitável nesta fase.

No entanto, ele deve desaparecer quando o backend deixar de usar os valores antigos.

Eu manteria isto como:

Sprint de limpeza técnica (Technical Debt)

e não como backlog funcional.

2. Reports

O contrato ficou congelado.

Mas ainda existe uma diferença importante:

Frontend:

pending
reviewed
dismissed
actioned

Backend ainda possui algumas respostas derivadas do resumo administrativo.

Não é um problema imediato.

Mas numa sprint futura eu faria:

ReportResource

↓

Todas as respostas

↓

Mesmo contrato JSON
3. CommunityService

Agora existem envelopes tipados.

Excelente.

O próximo passo natural será substituir respostas "manuais" por Resources do Laravel.

Hoje isso não bloqueia nada.

O roadmap agora fica muito mais limpo

Eu seguiria exatamente esta ordem.

Sprint 13

Media e Conteúdos

vídeos
áudio
thumbnails
preview
pinned documents
Sprint 14

Quiz Experience

leaderboard após quiz
conteúdos relacionados
continuar estudo
recomendações
Sprint 15

Community

convites completos
gestão de membros
moderação
notificações em tempo real (quando integrarem o Laravel Reverb)
Sprint 16

Reports

paginação server-side
filtros
dashboard
métricas
Sprint 17

Technical Debt

remover mapeamentos temporários
remover compatibilidade legada
introduzir FormRequest
introduzir JsonResource
reduzir lógica nos controllers
Minha avaliação

Até aqui, a evolução do projeto foi consistente:

Sprint 9 → estabilização do backend e testes.
Sprint 10 → documentação OpenAPI/Swagger.
Sprint 11 → integração do painel administrativo.
Sprint 12 → consolidação do domínio e tópicos privados.
P0 → congelamento do contrato entre backend e frontend.

Com esse P0 concluído, a arquitetura está suficientemente estável para começar a adicionar funcionalidades novas sem gerar retrabalho constante entre as equipas. Eu passaria agora para funcionalidades de negócio (media, experiência do utilizador e colaboração) em vez de continuar a mexer na base do sistema.