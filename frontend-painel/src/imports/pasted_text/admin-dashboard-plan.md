Dashboard Admin — "Economia com História"
1. VISÃO GERAL (Página Inicial do Admin)
A primeira página seria um painel de métricas em tempo real, com cards de sumário no topo:

Total de Utilizadores registados na plataforma
Pedidos de Acesso Pendentes (número destacado com badge vermelho — os Jindungo 🔥 e Restritos 🔒 que ainda não foram aprovados)
Conteúdos Publicados vs Em Revisão
Tópicos Activos na comunidade nas últimas 48h
Novos Membros esta semana
Abaixo dos cards, haveria dois blocos:

Um feed de actividade recente (últimos pedidos, últimos conteúdos criados, últimos registos)
Um gráfico de acesso por categoria mostrando quais categorias têm mais pedidos pendentes
2. GESTÃO DE PEDIDOS DE ACESSO (Centro de Notificações)
Esta seria provavelmente a secção mais crítica. Quando um utilizador clica em "Solicitar Acesso" numa categoria Jindungo ou Restrita (como se vê no CategoryView.tsx), o admin recebe uma notificação.

A secção teria:

Fila de Pedidos Pendentes, organizada por tipo:

🔥 Pedidos Jindungo — lista de utilizadores que pediram acesso premium. Para cada um: nome, foto de perfil, data do pedido, e botões "Aprovar" / "Rejeitar"
🔒 Pedidos Restritos — idem, mas com campo extra para o admin adicionar uma nota de justificação antes de aprovar, dado que estas categorias (ex: "Investigação Avançada", "Sistema Monetário") requerem validação mais criteriosa
Ao aprovar, o estado do utilizador naquela categoria mudaria de 'pending' → 'approved' (reflectindo a lógica já existente no CategoryView.tsx), e o utilizador receberia uma notificação no sino do header.

Historial de Decisões — lista de todos os pedidos já processados, com filtro por data, categoria e decisão tomada.

3. GESTÃO DE UTILIZADORES
Uma tabela com todos os membros registados, com as colunas:

Avatar + Nome + Email
Data de registo
Categorias com acesso (badges visuais: verde para Público, laranja para Jindungo, vermelho para Restrito)
Nível de actividade (posts, visualizações, likes dados)
Acções: Ver perfil / Revogar acesso a categorias / Suspender conta
O admin poderia clicar num utilizador específico e ver um painel detalhado:

Todas as categorias a que tem acesso e como foi concedido
Historial de pedidos de acesso feitos
Conteúdos que criou (ligados à feature de "Criar Conteúdo" do Dashboard.tsx)
Tópicos que iniciou na comunidade
Botão "Gerir Permissões" que abre um modal para dar ou revogar acesso a categorias específicas manualmente, sem necessitar que o utilizador faça pedido
4. GESTÃO DE CATEGORIAS
Lista de todas as categorias existentes (Análise de Políticas, Jindungo, Rotas Comerciais, Investigação Avançada, História Fiscal, Sistema Monetário — as mesmas do CategoryView.tsx), com:

Card de cada categoria com o mesmo design visual já existente (imagem de fundo, gradiente, ícone, badge de tipo de acesso)
Estatísticas: número de membros com acesso, número de tópicos, número de pedidos pendentes
Botão "Editar": permite mudar nome, descrição, imagem de fundo, e alterar o tipo de acesso (ex: tornar uma categoria Restrita em Pública)
Botão "Ver Membros": lista todos os utilizadores com acesso àquela categoria
Botão "Criar Nova Categoria": abre um formulário para definir nome, descrição, imagem, tipo de acesso e nível académico associado
5. GESTÃO DE CONTEÚDOS (Arquivo)
Uma versão administrativa do Dashboard.tsx, com os mesmos filtros (Tema, Nível Académico, Formato, Categoria de Acesso) mas com poderes de edição:

Listagem de todos os conteúdos com estado: Publicado, Em Revisão, Arquivado
Para cada conteúdo: título, autor, data, tipo de acesso, categoria, número de visualizações
Acções por conteúdo: Editar / Alterar nível de acesso / Mover de categoria / Despublicar / Eliminar
Secção separada para conteúdos "Em Revisão" — criados por utilizadores mas que aguardam aprovação do admin antes de aparecerem no arquivo público
Estatísticas de consumo: quais os documentos mais visualizados, por tema e por formato
6. MODERAÇÃO DA COMUNIDADE
Baseado no que existe no CommunityHome.tsx e DiscussionThread.tsx:

Lista de todos os tópicos com indicação dos mais activos, mais reportados e fixados
Para cada tópico: botão para Fixar (pin), Mover de categoria, Fechar discussão ou Eliminar
Fila de Reportes — quando utilizadores reportam mensagens inadequadas, aparecem aqui para o admin decidir: ignorar, apagar resposta ou suspender utilizador
Estatísticas da comunidade: tópicos criados por semana, utilizadores mais activos, categorias com mais actividade
7. SISTEMA DE NOTIFICAÇÕES DO ADMIN
No header do painel admin (o sino que já existe no SystemHeader.tsx mas sem funcionalidade activa), o admin receberia notificações para:

🔔 Novo pedido de acesso (Jindungo ou Restrito)
🔔 Novo conteúdo submetido para revisão
🔔 Tópico reportado na comunidade
🔔 Novo utilizador registado
8. NAVEGAÇÃO DO PAINEL ADMIN
O painel teria um sidebar lateral fixo (diferente do header público da plataforma), com secções:

Visão Geral
Pedidos de Acesso ← com badge numérico de pendentes
Utilizadores
Categorias
Conteúdos
Comunidade
Configurações (nome da plataforma, regras do arquivo, textos de email de aprovação/rejeição)
O acesso ao painel admin seria protegido — uma rota /admin que verificaria se o utilizador tem role de administrador antes de renderizar, caso contrário redirecciona para /inicio.

Em resumo: o painel admin seria o espelho de gestão de tudo o que o utilizador comum vê e interage — com foco especial no fluxo de aprovação de acessos às categorias premium e restritas, que é o coração do sistema de controlo de acesso já desenhado na aplicação.