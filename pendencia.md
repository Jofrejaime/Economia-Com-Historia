# Pendências

## Painel Administrativo

- [ ] Integrar `categorias` com o backend real.
- [ ] Integrar `comunidade` com o backend real, incluindo moderação e criação de tópicos com controlo de visibilidade.
- [ ] Adicionar suporte a tópico `privado`/`publico` na modelagem e na UI do admin, com toggle na criação e moderação.
- [ ] Integrar `configurações` com persistência real no backend.
- [ ] Completar a moderação de denúncias com histórico real no backend.
- [ ] Rever e alinhar os textos/labels do painel para os estados reais da API.

## Backend

- [ ] Criar endpoints de `community/categories` para atualizar e remover categorias.
- [ ] Criar endpoints/admin de listagem para tópicos da comunidade com filtros por categoria, autor, status e flagged.
- [ ] Criar endpoints/admin de listagem para respostas da comunidade com filtros por accepted e flagged.
- [ ] Criar endpoints/admin para listar conteúdo sinalizado de documentos com workflow editorial completo.
- [ ] Criar um endpoint para listagem completa do histórico de denúncias.
- [ ] Adicionar um campo de visibilidade na tabela de `discussion_topics` para distinguir `privado` e `publico`.
- [ ] Garantir que a API de tópicos devolve e valida essa visibilidade para o frontend admin.
- [ ] Rever se `deleteUser` precisa de limpar relações dependentes além da remoção simples.
- [ ] Confirmar se a resposta de `access-requests` deve devolver mais metadados do utilizador.
- [ ] Criar endpoint de administração para persistir configurações do painel, se essa secção deixar de ser mock.

## Frontend

- [ ] Remover `toPromise()` restante onde ainda houver e normalizar para `firstValueFrom`.
- [ ] Rever os avisos do build sobre imports não usados em `home-visitor`.
- [ ] Rever `content-card` apontado como ficheiro compilado mas não usado.
- [ ] Verificar se o painel admin precisa de feedback global reutilizável para sucesso/erro.

## Qualidade

- [ ] Adicionar testes específicos para a API administrativa.
- [ ] Adicionar testes de componente para os fluxos principais do painel admin.
- [ ] Validar o fluxo completo do admin no browser após a integração das próximas páginas.
