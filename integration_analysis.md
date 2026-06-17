# 🏗️ Análise de Integração e Mocks: Economia com História

Este documento apresenta o resultado de uma análise exaustiva do repositório, comparando o estado de desenvolvimento do **Frontend Web (Angular)** e do **Backend (Laravel)**. O foco está em identificar o que já está totalmente integrado, o que está implementado no backend mas ainda não mapeado no frontend, e quais áreas ainda operam sob mock data (dados fictícios), estabelecendo uma estratégia clara para eliminar os mocks de forma segura e progressiva.

---

## 📊 Resumo Executivo do Status de Integração

O projeto encontra-se em um estágio avançado da **Fase 2 de Integração**. A fundação do sistema (Autenticação, Sessões e Gestão de Perfil) está robusta e conectada de forma dinâmica aos endpoints de produção. A próxima grande etapa consiste em estender a integração para os módulos de conteúdo e gamificação (Documentos, Fórum, Quizzes) e painel administrativo, que atualmente dependem de dados estáticos/mocks no frontend.

| Módulo / Funcionalidade | Status Frontend (Angular) | Status Backend (Laravel) | Nível de Integração | Próxima Ação Necessária |
| :--- | :--- | :--- | :---: | :--- |
| **Autenticação & Sessão** | ✅ Completo | ✅ Completo | **100%** | Nenhuma (Manutenção e testes) |
| **Perfil Académico** | ✅ Completo (Display, Bio, Avatar) | ✅ Completo | **100%** | Nenhuma (Manutenção e testes) |
| **Painel de Estatísticas** | ✅ Completo (Lido de `/api/me`) | ✅ Completo | **100%** | Nenhuma (Manutenção e testes) |
| **Controle de Acessos** | ❌ 100% Mockado | ✅ Completo | **0%** | Integrar com `AccessController` |
| **Conteúdos / Documentos** | ❌ 100% Mockado | ⚠️ Parcial (Leituras Ok, Escritas 501) | **10%** | Criar `DocumentService` e implementar seeders |
| **Fórum / Comunidade** | ❌ 100% Mockado | ⚠️ Parcial (Leituras Ok, Ações 501) | **5%** | Criar `CommunityService` e implementar seeders |
| **Quizzes / Desafios** | ❌ 100% Mockado | ⚠️ Parcial (Tentativas Ok, Respostas 501) | **5%** | Criar `QuizService` e implementar seeders |
| **Leaderboard / Ranking** | ❌ 100% Mockado | ⚠️ Parcial (Nacional Ok, Provincial 501) | **0%** | Mapear `/api/leaderboard/*` no dashboard/home |
| **Notificações** | ❌ 100% Mockado | ✅ Completo | **0%** | Desenhar widget de notificações |
| **Painel de Moderação** | ❌ 100% Mockado | ⚠️ Parcial (Listagem Ok, Ações 501) | **0%** | Conectar frontend com `ReportController` |

---

## 🔍 Detalhamento das Integrações Realizadas

### 1. Autenticação e Gestão de Sessão (100% Integrado)
A camada de autenticação foi completamente implementada no frontend através do serviço [auth.service.ts](file:///C:/Users/BeeFlex%20Studio/Documents/ISPTEC/3%20%C2%BA%20ano/2%C2%BA%20Semestre/ESII/Economia-Com-Historia/frontend-web/src/app/services/auth.service.ts).
- **Frontend**: Utiliza requisições HTTP para gerir o ciclo de vida da sessão via `localStorage` (`session_token`, `user`). Suporta rota de login, registo, redefinição de password (`forgot-password` / `reset-password`), e renovação automática de tokens via `/api/auth/refresh`.
- **Backend**: Processado no [AuthController.php](file:///C:/Users/BeeFlex%20Studio/Documents/ISPTEC/3%20%C2%BA%20ano/2%C2%BA%20Semestre/ESII/Economia-Com-Historia/backend/app/Http/Controllers/Api/AuthController.php), validando sessões, gerindo tokens de acesso e tokens de verificação de e-mail.

### 2. Perfil Académico e Atualizações (100% Integrado)
A tela de perfil em [perfil.ts](file:///C:/Users/BeeFlex%20Studio/Documents/ISPTEC/3%20%C2%BA%20ano/2%C2%BA%20Semestre/ESII/Economia-Com-Historia/frontend-web/src/app/pages/profile/perfil/perfil.ts) está totalmente dinâmica.
- **Leitura**: Carrega dados do perfil (bio, display name, província, instituição, áreas de investigação) e as estatísticas do usuário (pontos, questionários respondidos, nível atual) chamando o serviço [profile.service.ts](file:///C:/Users/BeeFlex%20Studio/Documents/ISPTEC/3%20%C2%BA%20ano/2%C2%BA%20Semestre/ESII/Economia-Com-Historia/frontend-web/src/app/services/profile.service.ts) (endpoint `/api/me`).
- **Edição**: Envia payloads estruturados para salvar alterações de perfil via `PUT /api/profile`.
- **Avatar Upload**: A seleção de avatar faz validações de tamanho (máximo 5MB) e formato no frontend, executa o upload enviando `FormData` para o backend (`POST /api/profile/avatar`), que salva o ficheiro no storage público e retorna a URL absoluta.
- **Alteração de Password**: Modal de segurança integrado a `PUT /api/profile/password`, invalidando outras sessões ativas do utilizador após a troca da palavra-passe.

---

## 🚧 Mapeamento dos Mocks Restantes (O que falta integrar)

### 🏡 1. Página Inicial do Utilizador (HomeUser)
- **O que está mockado**: As categorias de períodos históricos, as discussões recentes do fórum e o ranking de investigadores que aparecem em [home-user.ts](file:///C:/Users/BeeFlex%20Studio/Documents/ISPTEC/3%20%C2%BA%20ano/2%C2%BA%20Semestre/ESII/Economia-Com-Historia/frontend-web/src/app/pages/home/home-user/home-user.ts) são puramente estáticos.
- **Pontes para o Backend**: 
  - Categorias devem vir de `/api/community/categories` ou `/api/documents` (por temas).
  - Discussões em destaque devem vir de `/api/topics` (tópicos mais populares).
  - Ranking de investigadores deve vir de `/api/leaderboard/national`.

### 📚 2. Acervo de Documentos (Contents)
- **O que está mockado**: Toda a listagem de arquivos e filtros por formato, tema ou nível de acesso em [contents.ts](file:///C:/Users/BeeFlex%20Studio/Documents/ISPTEC/3%20%C2%BA%20ano/2%C2%BA%20Semestre/ESII/Economia-Com-Historia/frontend-web/src/app/pages/contents/contents.ts) baseia-se em um array local de 6 documentos mockados. O componente [contents-view.ts](file:///C:/Users/BeeFlex%20Studio/Documents/ISPTEC/3%20%C2%BA%20ano/2%C2%BA%20Semestre/ESII/Economia-Com-Historia/frontend-web/src/app/pages/contents/contents-view/contents-view.ts) é completamente vazio de lógica, servindo apenas para exibir um HTML estático de 20KB.
- **Pontes para o Backend**:
  - A listagem geral de documentos deve bater no endpoint `/api/documents`.
  - A caixa de pesquisa deve chamar `/api/documents/search?q=TERMO`.
  - Visualizações individuais do documento devem bater em `/api/documents/{id}`.
- **Pendências no Backend**: Os endpoints do [DocumentController.php](file:///C:/Users/BeeFlex%20Studio/Documents/ISPTEC/3%20%C2%BA%20ano/2%C2%BA%20Semestre/ESII/Economia-Com-Historia/backend/app/Http/Controllers/Api/DocumentController.php) para **likes, downloads, favoritos e citações** ainda estão em estado `501 Not Implemented`.

### 💬 3. Fórum e Comunidade (Forum)
- **O que está mockado**: As categorias (Análise de Políticas, Jindungo, Rotas, etc.), discussões recentes e lista de respostas em [community.ts](file:///C:/Users/BeeFlex%20Studio/Documents/ISPTEC/3%20%C2%BA%20ano/2%C2%BA%20Semestre/ESII/Economia-Com-Historia/frontend-web/src/app/pages/forum/community/community.ts) são mockados locais.
- **Pontes para o Backend**:
  - Listar categorias → `/api/community/categories`.
  - Listar tópicos ativos → `/api/topics`.
  - Ver discussões e respostas → `/api/topics/{id}/replies`.
- **Pendências no Backend**: Apenas a leitura de fóruns e tópicos funciona no backend. Ações de escrita essenciais no [CommunityController.php](file:///C:/Users/BeeFlex%20Studio/Documents/ISPTEC/3%20%C2%BA%20ano/2%C2%BA%20Semestre/ESII/Economia-Com-Historia/backend/app/Http/Controllers/Api/CommunityController.php) como **criar tópicos, dar likes, seguir tópicos, criar respostas e aceitar resposta correta** retornam `501`.

### 🏆 4. Questionários e Gamificação (Quizzes)
- **O que está mockado**: Toda a lista de questionários e suas perguntas associadas em [quiz-list.ts](file:///C:/Users/BeeFlex%20Studio/Documents/ISPTEC/3%20%C2%BA%20ano/2%C2%BA%20Semestre/ESII/Economia-Com-Historia/frontend-web/src/app/pages/quizzes/quiz-list/quiz-list.ts) e subcomponentes operam com dados mockados. A pontuação é avaliada e gerida apenas em memória local.
- **Pontes para o Backend**:
  - Listagem de quizzes → `/api/quizzes`.
  - Ver perguntas de um quiz → `/api/quizzes/{id}/questions`.
  - Iniciar tentativa → `/api/quizzes/{id}/attempts` (método `POST`).
- **Pendências no Backend**: O processamento de respostas e a conclusão de tentativas em [QuizController.php](file:///C:/Users/BeeFlex%20Studio/Documents/ISPTEC/3%20%C2%BA%20ano/2%C2%BA%20Semestre/ESII/Economia-Com-Historia/backend/app/Http/Controllers/Api/QuizController.php) (`answerAttempt` e `completeAttempt`) estão retornam `501`.

### 🛡️ 5. Painel Administrativo e Pedidos de Acesso (Admin Dashboard)
- **O que está mockado**: As subpáginas do painel administrativo (como `/admin/dashboard/pedidos`) tratam todos os pedidos de acesso ("Jindungo" e "Restrito") de forma local. Ao clicar em aprovar/rejeitar, o componente move os dados temporariamente entre arrays locais em memória.
- **Pontes para o Backend**:
  - Listar pedidos pendentes e históricos → `/api/access-requests`.
  - Revisar pedido (Aprovar/Rejeitar) → `PATCH /api/access-requests/{id}` (passando status e notas de revisão).
  - Listar níveis de acesso → `/api/access-levels`.
  - Gerir concessões ativas → `/api/access-grants`.
- **Status de Integração**: Embora o backend tenha o [AccessController.php](file:///C:/Users/BeeFlex%20Studio/Documents/ISPTEC/3%20%C2%BA%20ano/2%C2%BA%20Semestre/ESII/Economia-Com-Historia/backend/app/Http/Controllers/Api/AccessController.php) 100% funcional com lógica transacional e concessão automática ou manual, **nenhuma chamada HTTP está configurada no frontend do painel admin**.

---

## ⚙️ Diferenças de Design e Arquitetura no Backend

Ao analisar as entranhas do `/backend`, destacam-se duas escolhas de design cruciais:

1. **Uso Direto do Query Builder (Sem Models Eloquent)**: 
   Com exceção da classe [User.php](file:///C:/Users/BeeFlex%20Studio/Documents/ISPTEC/3%20%C2%BA%20ano/2%C2%BA%20Semestre/ESII/Economia-Com-Historia/backend/app/Models/User.php), o backend manipula tabelas de dados utilizando a fachada `DB::table('nome_tabela')` diretamente nos controladores. 
   - *Impacto na Integração*: É necessário seguir este padrão ao expandir endpoints, garantindo transações explícitas (`DB::transaction(...)`) para operações complexas, como as encontradas na aprovação de acessos.
2. **Ausência de Seeders de Conteúdo**:
   O ficheiro [DatabaseSeeder.php](file:///C:/Users/BeeFlex%20Studio/Documents/ISPTEC/3%20%C2%BA%20ano/2%C2%BA%20Semestre/ESII/Economia-Com-Historia/backend/database/seeders/DatabaseSeeder.php) está com as chamadas para `DocumentSeeder`, `QuizSeeder` e `CommunitySeeder` comentadas porque tais arquivos não foram criados. A base de dados inicial contém apenas definições de nível de acesso e usuários, mas carece de conteúdos para que a integração funcione visualmente no frontend sem mocks.

---

## 🚀 Plano de Ação Sugerido: Remoção Gradual dos Mocks

Para prosseguirem com as integrações sem causar instabilidade no sistema, sugere-se a seguinte ordem de prioridades:

### 📍 Prioridade 1: Integração de Pedidos de Acesso no Painel Admin (Tempo: ~4h)
*O backend está 100% pronto para esta funcionalidade.*
1. Criar `AccessService` no Angular para mapear as chamadas de `/api/access-requests` e `/api/access-grants`.
2. Substituir a inicialização do [RequestsPageComponent](file:///C:/Users/BeeFlex%20Studio/Documents/ISPTEC/3%20%C2%BA%20ano/2%C2%BA%20Semestre/ESII/Economia-Com-Historia/frontend-web/src/app/pages/admin/dashboard-admin/pages/request-page/request-page.ts) para buscar as solicitações reais do backend.
3. Vincular os botões de Aprovar/Rejeitar para enviar a requisição HTTP correspondente.

### 📍 Prioridade 2: Seeders de Conteúdo no Backend (Tempo: ~3h)
*Para ver dados reais fluírem, a base de dados local precisa de dados.*
1. Criar os seeders `DocumentSeeder.php`, `QuizSeeder.php` e `CommunitySeeder.php` preenchendo as tabelas `documents`, `quizzes`, `quiz_questions`, `community_categories`, e `discussion_topics` com conteúdos representativos de Angola colonial/pós-independência.
2. Ativar as chamadas no `DatabaseSeeder.php` e reexecutar as migrations (`php artisan migrate:fresh --seed`).

### 📍 Prioridade 3: Serviços de Visualização (Documentos, Fórum, Quizzes) (Tempo: ~6h)
1. Criar `DocumentService` no Angular para buscar a lista e detalhes do acervo de documentos e conectá-lo a [contents.ts](file:///C:/Users/BeeFlex%20Studio/Documents/ISPTEC/3%20%C2%BA%20ano/2%C2%BA%20Semestre/ESII/Economia-Com-Historia/frontend-web/src/app/pages/contents/contents.ts).
2. Criar `CommunityService` no Angular para ligar as categorias e tópicos na página de fórum.
3. Criar `QuizService` no Angular para alimentar a listagem de questionários do utilizador.
4. *Nota*: Manter as operações de escrita mockadas no frontend nesta etapa (pois o backend retorna 501).

### 📍 Prioridade 4: Substituição dos Endpoints Placeholder (501) no Backend (Tempo: ~8h)
1. Implementar a lógica de salvamento e votação no `CommunityController` (likes, replies e aceitação de respostas).
2. Concluir o fluxo de respostas no `QuizController` (calcular o score do quiz na rota de conclusão e atribuir os pontos e badges correspondentes ao utilizador de forma transacional).
3. Concluir as interações de documentos (likes, favoritos e downloads) no `DocumentController`.
4. Uma vez que o backend finalize cada rota, atualizar imediatamente o frontend correspondente para consumir a API real.
