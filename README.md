# Economia com Historia

Estrutura inicial do projeto, organizada para desenvolvimento paralelo entre frontend web, mobile e backend.

## Modulos principais

- frontend-web: aplicacao Angular
- frontend-mobile: aplicacao Flutter
- backend: API Laravel
- docs: documentacao tecnica e funcional
- database: scripts e artefatos de base de dados
- uploads: armazenamento local de multimedia
- shared: design system e ativos compartilhados

## Como usar esta base

1. Entrar no modulo desejado.
2. Seguir o README local do modulo.
3. Implementar por fases (UI -> API -> Integracao -> Testes).

## Convencoes iniciais

- Versionamento de API em /api/v1
- Foco inicial em PostgreSQL Full Text Search
- Uploads separados por tipo de ficheiro
- Documentacao tecnica centralizada em docs

## Arquitetura Oficial

### Community
* **Categoria:** Serve exclusivamente para **Organização** de tópicos. A coluna `access_level_id` foi desativada da lógica de autorização e marcada como legado.
* **Tópico:** Responsável pela sua própria **Autorização** através da propriedade `visibility`:
  * `PUBLIC`: Qualquer utilizador autenticado pode visualizar e responder a discussões.
  * `CATEGORY`: Acesso restrito a utilizadores explicitamente associados à tabela `category_members` (membros da categoria correspondente). Qualquer utilizador pertencente à categoria pode visualizar, responder e criar tópicos associados.
  * `INVITE_ONLY` (anteriormente `PRIVATE`): Tópico restrito aos autores/owners, moderadores e utilizadores adicionados como membros do tópico em `discussion_topic_members`.

### Documents
* **Categoria:** Serve exclusivamente para **Organização** temática de conteúdos.
* **Documento:** Responsável pela sua própria **Autorização** (Subscription):
  * `FREE`
  * `JINDUNGO`
  * `PREMIUM`

### Access Control
* **Access Levels / Plataforma:** Destinados exclusivamente a permissões administrativas globais, roles corporativas, funcionalidades e categorias de gestão. Nunca controlam acesso direto a conteúdos (documentos) ou fóruns (tópicos).
