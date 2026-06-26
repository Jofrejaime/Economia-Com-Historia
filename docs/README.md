# Documentacao

Diretorio central de documentacao tecnica, funcional e de arquitetura.

## Estrutura base

- api — referência de endpoints (`authentication`, `access-control`, `documents`, `gamification`, `quizzes`, …)
- sprints — resumos de entrega por sprint (`SPRINT-2-…`, `SPRINT-3-…`)
- architecture
- diagrams
- uml
- database
- reports
- design-guide
- meeting-notes

## Objetivo

Manter decisoes, diagramas e especificacoes sincronizados com o codigo.

## Contrato Oficial do Domínio

- Community:
  - `PUBLIC` - qualquer utilizador autenticado pode ver.
  - `CATEGORY` - segue o acesso definido pela categoria.
  - `INVITE_ONLY` - apenas owner, moderadores e membros convidados.
- Documents:
  - Sem comentarios de documento.
  - Workflow oficial: `draft`, `published`, `archived`.
- Reports:
  - Estados oficiais: `pending`, `reviewed`, `dismissed`, `actioned`.
- Access Control:
  - `Access Requests` sao os pedidos pendentes.
  - `Access Grants` sao as concessoes activas.
- Quizzes:
  - Fluxo oficial: Categoria -> Conteudo -> Quiz -> Resultado -> Leaderboard.
