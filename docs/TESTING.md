# Relatório da Suite de Testes

Este documento apresenta a estrutura, a cobertura funcional por módulo e a instrução de execução para a suite de testes automatizados do backend Laravel do projeto **Economia Com História**.

---

## 1. Estatísticas Globais da Suite
* **Total de Ficheiros de Teste**: 19 (16 Feature + 3 Unit)
* **Total de Casos de Teste (Tests)**: 148
* **Total de Asserções (Assertions)**: 457
* **Status Atual**: **100% Verdes (Passando com Sucesso)**

---

## 2. Cobertura Funcional por Módulo

### 2.1 Autenticação e Perfil (`AuthenticationTest`, `ProfileTest`)
* **Testes Feature**:
  * Criação de utilizadores com roles específicas (`estudante`, `investigador`, `professor`).
  * Rejeição de registo com role de administrador (`admin`).
  * Login com credenciais válidas e rejeição de utilizadores desativados.
  * Validação de fluxos de tokens JWT (geração de bearer, refresh tokens e expiração).
  * Gestão de sessões ativas (listagem e revogação de outras sessões).
  * Atualização e consulta do perfil do utilizador, incluindo upload de avatar.
  * Alteração de palavras-passe com validação da senha anterior.

### 2.2 Controlo de Acesso (`AccessControlTest`, `DocumentAccessTest`, `QuizAccessGateTest`)
* **Testes Feature & Unit**:
  * Criação de pedidos de acesso por estudantes a níveis premium (ex: Jindungo).
  * Aprovação e rejeição de pedidos pelo administrador com registo de observações.
  * Revogação imediata de concessões de acesso ativa por administradores.
  * Bloqueio automático de leitura de documentos de nível superior ao do utilizador.
  * Bloqueio de quizzes restritos.
  * Filtro automático de visibilidade em listagens para omitir documentos proibidos.

### 2.3 Repositório de Documentos (`DocumentFavoritesTest`, `DocumentLikeGamificationTest`)
* **Testes Feature**:
  * Listagem, busca textual full-text e consulta de detalhes de documentos.
  * Marcação e remoção de documentos da lista de favoritos.
  * Incremento do contador de acessos e registo de visualizações.
  * Atribuição de gostos (like) e cálculo automático de pontos de mérito associados.

### 2.4 Quizzes e Aprendizagem (`QuizCrudTest`, `QuizAttemptQuestionsTest`, `QuizGamificationTest`)
* **Testes Feature**:
  * CRUD completo de quizzes e perguntas executados por Administradores e Professores.
  * Início de tentativas de resolução e bloqueio de tentativas simultâneas.
  * Registo passo-a-passo das respostas dadas pelo utilizador.
  * Conclusão de tentativa, cálculo da média e atribuição de pontos base e bónus (precisão e velocidade).

### 2.5 Comunidade e Fórum (`CommunityTest`)
* **Testes Feature**:
  * Criação, edição e remoção de tópicos de discussão em categorias adequadas.
  * Envio de respostas a tópicos.
  * Registo de gostos (likes) em tópicos e respostas.
  * Subscrição/Follow de tópicos para recepção de notificações de novas respostas.
  * Escolha e marcação de uma resposta como a solução oficial do tópico.

### 2.6 Notificações (`NotificationTest`, `NotificationServiceTest`)
* **Testes Feature & Unit**:
  * Criação de alertas de subida de nível, insígnias ganhas e respostas no fórum.
  * Consulta e contagem de notificações não lidas.
  * Marcar notificações como lidas individualmente ou globalmente.

### 2.7 Denúncias e Moderação (`ReportsTest`)
* **Testes Feature**:
  * Envio de relatórios de abuso ou denúncias de conteúdo inapropriado.
  * Moderação pelo administrador (marcar como sinalizado ou exclusão definitiva).

### 2.8 Classificações (`LeaderboardTest`)
* **Testes Feature**:
  * Consulta de classificações nacionais (via tabelas cache).
  * Paginação de listagens provinciais e cálculo de posições.

---

## 3. Instruções de Execução

Para rodar todos os testes integrados da aplicação, execute o seguinte comando na raiz do diretório `backend/`:

```powershell
php artisan test
```

Para rodar apenas um ficheiro de teste específico:
```powershell
php artisan test tests/Feature/AuthenticationTest.php
```

Para rodar os testes gerando o relatório de cobertura de código (caso possua o Xdebug configurado):
```powershell
php artisan test --coverage
```
