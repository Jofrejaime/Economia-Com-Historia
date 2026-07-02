<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class CommunitySeeder extends Seeder
{
    public function run(): void
    {
        $admin = DB::table('users')->where('role', 'admin')->first();
        $professor = DB::table('users')->where('role', 'professor')->first();
        $researcher = DB::table('users')->where('role', 'investigador')->first();
        $student1 = DB::table('users')->where('email', 'student@economia-historia.local')->first();
        $student2 = DB::table('users')->where('email', 'student2@economia-historia.local')->first();

        if (!$admin || !$professor || !$researcher || !$student1 || !$student2) {
            $this->command->warn('UserSeeder must run before CommunitySeeder. Skipping community data.');
            return;
        }

        // ──────────────────────────────────────────────────────────────
        // 1. Community Categories
        // ──────────────────────────────────────────────────────────────
        $categories = [
            [
                'id'              => (string) Str::uuid(),
                'slug'            => 'discussao-geral',
                'name'            => 'Discussão Geral',
                'description'     => 'Espaço aberto para discussões gerais sobre história económica de Angola e temas relacionados.',
                'color_bg'        => '#E3F2FD',
                'color_text'      => '#1565C0',
                'cover_image_url' => null,
                'sort_order'      => 1,
                'is_active'       => true,
                'created_at'      => now(),
                'members_count'   => 5,
                'topics_count'    => 3,
            ],
            [
                'id'              => (string) Str::uuid(),
                'slug'            => 'pesquisa-academica',
                'name'            => 'Pesquisa Académica',
                'description'     => 'Partilha de metodologias, fontes e resultados de investigação em história económica.',
                'color_bg'        => '#F3E5F5',
                'color_text'      => '#7B1FA2',
                'cover_image_url' => null,
                'sort_order'      => 2,
                'is_active'       => true,
                'created_at'      => now(),
                'members_count'   => 3,
                'topics_count'    => 2,
            ],
            [
                'id'              => (string) Str::uuid(),
                'slug'            => 'fontes-primarias',
                'name'            => 'Fontes Primárias',
                'description'     => 'Discussão e partilha de documentos de arquivo, fontes primárias e materiais históricos originais.',
                'color_bg'        => '#FFF3E0',
                'color_text'      => '#E65100',
                'cover_image_url' => null,
                'sort_order'      => 3,
                'is_active'       => true,
                'created_at'      => now(),
                'members_count'   => 2,
                'topics_count'    => 2,
            ],
            [
                'id'              => (string) Str::uuid(),
                'slug'            => 'metodologia',
                'name'            => 'Metodologia',
                'description'     => 'Discussão sobre métodos de pesquisa histórica, análise quantitativa e ferramentas digitais para história económica.',
                'color_bg'        => '#E8F5E9',
                'color_text'      => '#2E7D32',
                'cover_image_url' => null,
                'sort_order'      => 4,
                'is_active'       => true,
                'created_at'      => now(),
                'members_count'   => 4,
                'topics_count'    => 1,
            ],
        ];

        foreach ($categories as $cat) {
            DB::table('community_categories')->insert($cat);
        }

        // Add members to categories
        $allUsers = [$admin, $professor, $researcher, $student1, $student2];
        foreach ($categories as $cat) {
            foreach ($allUsers as $user) {
                DB::table('category_members')->insert([
                    'id' => (string) Str::uuid(),
                    'category_id' => $cat['id'],
                    'user_id' => $user->id,
                    'joined_at' => now(),
                ]);
            }
        }

        // ──────────────────────────────────────────────────────────────
        // 2. Discussion Topics
        // ──────────────────────────────────────────────────────────────
        $docs = DB::table('documents')->limit(3)->pluck('id');
        $docA = $docs[0] ?? null;
        $docB = $docs[1] ?? null;

        $topics = [
            // Discussão Geral
            [
                'category_id' => $categories[0]['id'],
                'author_id' => $student1->id,
                'title' => 'Qual foi o verdadeiro impacto do Caminho de Ferro de Benguela nas comunidades locais?',
                'content' => "Estou a estudar o CFB para o meu trabalho final e gostaria de saber a vossa opinião. A maioria dos textos foca no impacto económico macro (exportação de cobre, desenvolvimento portuário), mas pouco se diz sobre como as comunidades locais ao longo da linha foram afectadas.\n\nAlguém tem fontes sobre:\n- Deslocamento de populações para construção\n- Impacto nas rotas comerciais tradicionais\n- Trabalho forçado na construção\n\nAgradeço qualquer contribuição!",
                'status' => 'open',
                'is_pinned' => true,
                'is_featured' => true,
                'created_at' => now()->subDays(15),
                'updated_at' => now()->subDays(2),
                'last_reply_at' => now()->subDays(2),
                'replies_count' => 3,
                'views_count' => 145,
                'likes_count' => 8,
                'followers_count' => 4,
            ],
            [
                'category_id' => $categories[0]['id'],
                'author_id' => $student2->id,
                'title' => 'Recomendações de livros sobre história económica de Angola',
                'content' => "Olá a todos!\n\nSou nova na plataforma e estou a começar a minha pesquisa sobre a história económica de Angola. Alguém pode recomendar livros essenciais para começar? Tenho interesse particular no período pós-independência.\n\nObrigada!",
                'status' => 'open',
                'is_pinned' => false,
                'is_featured' => false,
                'created_at' => now()->subDays(10),
                'updated_at' => now()->subDays(5),
                'last_reply_at' => now()->subDays(5),
                'replies_count' => 2,
                'views_count' => 89,
                'likes_count' => 5,
                'followers_count' => 3,
            ],
            [
                'category_id' => $categories[0]['id'],
                'author_id' => $professor->id,
                'title' => 'Seminário Online: "A Economia do Café em Angola" — 15 de Julho',
                'content' => "Caros colegas e estudantes,\n\nTenho o prazer de anunciar um seminário online sobre a economia do café em Angola, que se realizará no dia 15 de Julho às 14h (hora de Luanda).\n\nTemas abordados:\n- A introdução do café em Angola (séc. XIX)\n- O apogeu da produção (1950-1970)\n- O colapso pós-independência\n- Perspectivas de recuperação\n\nA participação é gratuita. Inscrevam-se respondendo a este tópico.",
                'status' => 'open',
                'is_pinned' => true,
                'is_featured' => false,
                'created_at' => now()->subDays(5),
                'updated_at' => now()->subDays(1),
                'last_reply_at' => now()->subDays(1),
                'replies_count' => 4,
                'views_count' => 234,
                'likes_count' => 15,
                'followers_count' => 8,
            ],

            // Pesquisa Académica
            [
                'category_id' => $categories[1]['id'],
                'author_id' => $researcher->id,
                'title' => 'Bases de dados de comércio atlântico: quais utilizam?',
                'content' => "Para quem trabalha com dados quantitativos do comércio atlântico, que bases de dados utilizam? Conheço:\n\n1. **Trans-Atlantic Slave Trade Database** (slavevoyages.org)\n2. **African Economic History Network datasets**\n3. **Angolan colonial trade statistics** (Arquivo Histórico Ultramarino)\n\nExistem outros repositórios específicos para Angola? Partilhem as vossas fontes!",
                'status' => 'open',
                'is_pinned' => false,
                'is_featured' => true,
                'created_at' => now()->subDays(20),
                'updated_at' => now()->subDays(8),
                'last_reply_at' => now()->subDays(8),
                'replies_count' => 2,
                'views_count' => 178,
                'likes_count' => 12,
                'followers_count' => 6,
            ],
            [
                'category_id' => $categories[1]['id'],
                'author_id' => $professor->id,
                'title' => 'Chamada para artigos: Revista de História Económica Angolana',
                'content' => "A Revista de História Económica Angolana abre chamada para artigos para o número especial sobre industrialização em Angola.\n\nTemas prioritários:\n- Infraestrutura colonial (caminhos de ferro, portos)\n- Indústria extractiva (diamantes, petróleo)\n- Tentativas de industrialização pós-independência\n\nPrazo de submissão: 30 de Setembro de 2024\nFormato: artigos de 5.000-8.000 palavras, com resumo em português e inglês.",
                'status' => 'open',
                'is_pinned' => true,
                'is_featured' => false,
                'created_at' => now()->subDays(7),
                'updated_at' => now()->subDays(3),
                'last_reply_at' => now()->subDays(3),
                'replies_count' => 1,
                'views_count' => 120,
                'likes_count' => 9,
                'followers_count' => 5,
            ],

            // Fontes Primárias
            [
                'category_id' => $categories[2]['id'],
                'author_id' => $researcher->id,
                'title' => 'Relatórios da Diamang digitalizados — acesso e análise',
                'content' => "Consegui aceder a uma colecção de relatórios anuais da Companhia de Diamantes de Angola (Diamang) dos anos 1940-1960. Os documentos estão parcialmente digitalizados e contêm dados detalhados sobre:\n\n- Produção anual de diamantes (em quilates)\n- Número de trabalhadores e condições laborais\n- Investimentos em infraestrutura\n- Receitas e lucros\n\nAlguém tem interesse em colaborar na análise destes dados?",
                'status' => 'open',
                'is_pinned' => false,
                'is_featured' => true,
                'created_at' => now()->subDays(12),
                'updated_at' => now()->subDays(4),
                'last_reply_at' => now()->subDays(4),
                'replies_count' => 2,
                'views_count' => 156,
                'likes_count' => 18,
                'followers_count' => 7,
            ],
            [
                'category_id' => $categories[2]['id'],
                'author_id' => $professor->id,
                'title' => 'Mapas coloniais do sistema ferroviário angolano',
                'content' => "Partilho aqui informação sobre uma colecção de mapas coloniais do sistema ferroviário angolano que encontrei no Arquivo Histórico Ultramarino em Lisboa.\n\nA colecção inclui:\n- Mapas topográficos do traçado do CFB (1910-1920)\n- Plantas das estações ferroviárias\n- Mapas de rotas comerciais alternativas\n\nOs originais estão em formato grande (A0), mas consegui fotografias de alta resolução.",
                'status' => 'open',
                'is_pinned' => false,
                'is_featured' => false,
                'created_at' => now()->subDays(25),
                'updated_at' => now()->subDays(18),
                'last_reply_at' => now()->subDays(18),
                'replies_count' => 1,
                'views_count' => 98,
                'likes_count' => 7,
                'followers_count' => 3,
            ],

            // Metodologia
            [
                'category_id' => $categories[3]['id'],
                'author_id' => $student1->id,
                'title' => 'Como citar fontes primárias do Arquivo Histórico de Angola?',
                'content' => "Estou a preparar o meu trabalho final e tenho dificuldades com a citação correcta de fontes primárias do Arquivo Histórico de Angola.\n\nExemplo: tenho um relatório do governador de Benguela de 1920. Como devo citar isto em formato APA e ABNT?\n\nAlguém pode ajudar com exemplos concretos?",
                'status' => 'open',
                'is_pinned' => false,
                'is_featured' => false,
                'created_at' => now()->subDays(3),
                'updated_at' => now()->subDays(1),
                'last_reply_at' => now()->subDays(1),
                'replies_count' => 2,
                'views_count' => 67,
                'likes_count' => 3,
                'followers_count' => 2,
            ],
            // Contextuais (Sprint 17.3)
            [
                'category_id' => $categories[0]['id'],
                'document_id' => $docA,
                'author_id' => $student1->id,
                'title' => 'Dúvida sobre o primeiro capítulo',
                'content' => 'Gostaria de discutir a abordagem do autor no primeiro capítulo deste documento.',
                'status' => 'open',
                'is_pinned' => false,
                'is_featured' => false,
                'created_at' => now()->subDays(2),
                'updated_at' => now()->subDays(2),
                'last_reply_at' => now()->subDays(2),
                'replies_count' => 0,
                'views_count' => 10,
                'likes_count' => 2,
                'followers_count' => 1,
            ],
            [
                'category_id' => $categories[0]['id'],
                'document_id' => $docA,
                'author_id' => $professor->id,
                'title' => 'Metodologia utilizada na página 45',
                'content' => 'A metodologia parece divergir das fontes primárias. Opiniões?',
                'status' => 'open',
                'is_pinned' => false,
                'is_featured' => false,
                'created_at' => now()->subDays(1),
                'updated_at' => now()->subDays(1),
                'last_reply_at' => now()->subDays(1),
                'replies_count' => 0,
                'views_count' => 5,
                'likes_count' => 1,
                'followers_count' => 1,
            ],
            [
                'category_id' => $categories[1]['id'],
                'document_id' => $docB,
                'author_id' => $researcher->id,
                'title' => 'Análise estatística em anexo',
                'content' => 'Os dados estatísticos deste documento são surpreendentes.',
                'status' => 'open',
                'is_pinned' => false,
                'is_featured' => false,
                'created_at' => now()->subDays(5),
                'updated_at' => now()->subDays(5),
                'last_reply_at' => now()->subDays(5),
                'replies_count' => 0,
                'views_count' => 12,
                'likes_count' => 3,
                'followers_count' => 2,
            ],
            [
                'category_id' => $categories[1]['id'],
                'document_id' => $docB,
                'author_id' => $student2->id,
                'title' => 'Pergunta sobre as conclusões',
                'content' => 'Não percebi bem a conclusão apresentada na última secção.',
                'status' => 'open',
                'is_pinned' => false,
                'is_featured' => false,
                'created_at' => now()->subDays(4),
                'updated_at' => now()->subDays(4),
                'last_reply_at' => now()->subDays(4),
                'replies_count' => 0,
                'views_count' => 8,
                'likes_count' => 1,
                'followers_count' => 1,
            ],
            [
                'category_id' => $categories[1]['id'],
                'document_id' => $docB,
                'author_id' => $professor->id,
                'title' => 'Relevância para a economia atual',
                'content' => 'Como podemos relacionar este texto com o contexto contemporâneo?',
                'status' => 'open',
                'is_pinned' => true,
                'is_featured' => false,
                'created_at' => now()->subDays(3),
                'updated_at' => now()->subDays(3),
                'last_reply_at' => now()->subDays(3),
                'replies_count' => 0,
                'views_count' => 20,
                'likes_count' => 5,
                'followers_count' => 4,
            ],
            [
                'category_id' => $categories[1]['id'],
                'document_id' => $docB,
                'author_id' => $student1->id,
                'title' => 'Comparação com outras obras',
                'content' => 'Este documento lembra-me muito a obra do autor X.',
                'status' => 'open',
                'is_pinned' => false,
                'is_featured' => false,
                'created_at' => now()->subDays(2),
                'updated_at' => now()->subDays(2),
                'last_reply_at' => now()->subDays(2),
                'replies_count' => 0,
                'views_count' => 7,
                'likes_count' => 0,
                'followers_count' => 0,
            ],
            [
                'category_id' => $categories[1]['id'],
                'document_id' => $docB,
                'author_id' => $researcher->id,
                'title' => 'Limitações deste estudo',
                'content' => 'Acho que a amostra utilizada neste documento foi muito reduzida.',
                'status' => 'open',
                'is_pinned' => false,
                'is_featured' => false,
                'created_at' => now()->subDays(1),
                'updated_at' => now()->subDays(1),
                'last_reply_at' => now()->subDays(1),
                'replies_count' => 0,
                'views_count' => 15,
                'likes_count' => 4,
                'followers_count' => 2,
            ],
        ];

        $topicIds = [];
        foreach ($topics as $topicData) {
            $topicId = (string) Str::uuid();
            $topicIds[] = $topicId;

            DB::table('discussion_topics')->insert(array_merge($topicData, [
                'id' => $topicId,
            ]));
        }

        // ──────────────────────────────────────────────────────────────
        // 3. Topic Replies
        // ──────────────────────────────────────────────────────────────
        $replies = [
            // Replies to Topic 1 (CFB impacto)
            [
                'topic_id' => $topicIds[0],
                'author_id' => $professor->id,
                'content' => "Excelente pergunta, António! O impacto do CFB nas comunidades locais é um tema pouco estudado mas muito importante.\n\nRecomendo consultar:\n- **Clarence-Smith, W.G.** \"O Terceiro Império Português\" - tem um capítulo sobre trabalho forçado na construção ferroviária\n- **Arquivo Histórico Ultramarino**, Caixa 3456 - relatórios dos administradores de circunscrição ao longo da linha\n\nO trabalho forçado (contratado) foi extensivamente usado na construção, especialmente entre 1903-1920.",
                'is_accepted' => false,
                'is_flagged' => false,
                'created_at' => now()->subDays(14),
                'updated_at' => now()->subDays(14),
                'likes_count' => 5,
            ],
            [
                'topic_id' => $topicIds[0],
                'author_id' => $researcher->id,
                'content' => "Posso complementar a resposta do Prof. João. Na minha tese de doutoramento, estudei o impacto nas rotas comerciais dos Ovimbundu.\n\nO CFB efectivamente destruiu as caravanas de longa distância que eram o principal meio de comércio no planalto central. Aldeias que antes eram pontos de paragem importantes tornaram-se marginalizadas.\n\nTenho dados quantitativos sobre o declínio do comércio caravaneiro entre 1910-1940 que posso partilhar.",
                'is_accepted' => false,
                'is_flagged' => false,
                'created_at' => now()->subDays(12),
                'updated_at' => now()->subDays(12),
                'likes_count' => 7,
            ],
            [
                'topic_id' => $topicIds[0],
                'author_id' => $student2->id,
                'content' => "Muito obrigada pelas referências! Estou a trabalhar num tema semelhante para a minha monografia. Dra. Maria, seria possível aceder a esses dados quantitativos?",
                'is_accepted' => false,
                'is_flagged' => false,
                'created_at' => now()->subDays(2),
                'updated_at' => now()->subDays(2),
                'likes_count' => 1,
            ],

            // Replies to Topic 2 (Recomendações livros)
            [
                'topic_id' => $topicIds[1],
                'author_id' => $professor->id,
                'content' => "Bem-vinda à plataforma, Carla! Para história económica de Angola, recomendo:\n\n**Essenciais:**\n1. David Birmingham - \"Portugal and Africa\" (1966)\n2. W.G. Clarence-Smith - \"Slaves, Peasants and Capitalists in Southern Angola\" (1979)\n3. Tony Hodges - \"Angola: Anatomy of an Oil State\" (2004)\n\n**Pós-independência:**\n4. Ricardo Soares de Oliveira - \"Magnificent and Beggar Land\" (2015)\n5. Didier Péclard - \"Les incertitudes de la nation en Angola\" (2015)\n\nBoa pesquisa!",
                'is_accepted' => true,
                'is_flagged' => false,
                'created_at' => now()->subDays(9),
                'updated_at' => now()->subDays(9),
                'likes_count' => 10,
            ],
            [
                'topic_id' => $topicIds[1],
                'author_id' => $researcher->id,
                'content' => "Adicionaria à excelente lista do Prof. João:\n\n- **José Eduardo Agualusa** - embora ficção, \"A Sociedade dos Sonhadores Involuntários\" oferece contexto social\n- **Fernando Florêncio** - \"No Reino da Toupeira\" (2010) - sobre estruturas de poder tradicionais\n\nPara fontes em português, o catálogo do CEIC (Centro de Estudos e Investigação Científica) da UCA tem publicações recentes muito boas.",
                'is_accepted' => false,
                'is_flagged' => false,
                'created_at' => now()->subDays(5),
                'updated_at' => now()->subDays(5),
                'likes_count' => 6,
            ],

            // Replies to Topic 3 (Seminário café)
            [
                'topic_id' => $topicIds[2],
                'author_id' => $student1->id,
                'content' => "Excelente iniciativa, Professor! Gostaria de me inscrever. Posso apresentar um breve resumo do meu trabalho sobre o impacto do CFB no transporte de café?",
                'is_accepted' => false,
                'is_flagged' => false,
                'created_at' => now()->subDays(4),
                'updated_at' => now()->subDays(4),
                'likes_count' => 2,
            ],
            [
                'topic_id' => $topicIds[2],
                'author_id' => $student2->id,
                'content' => "Inscrita! Muito interessada no tema da recuperação da produção de café. Angola está a investir novamente neste sector?",
                'is_accepted' => false,
                'is_flagged' => false,
                'created_at' => now()->subDays(3),
                'updated_at' => now()->subDays(3),
                'likes_count' => 1,
            ],
            [
                'topic_id' => $topicIds[2],
                'author_id' => $researcher->id,
                'content' => "Inscrevo-me também! Tenho dados sobre a exportação de café angolano no período 1950-1975 que podem complementar a apresentação.",
                'is_accepted' => false,
                'is_flagged' => false,
                'created_at' => now()->subDays(2),
                'updated_at' => now()->subDays(2),
                'likes_count' => 3,
            ],
            [
                'topic_id' => $topicIds[2],
                'author_id' => $professor->id,
                'content' => "Obrigado pelo interesse! António, sim, a tua contribuição seria muito valiosa. Carla, vamos abordar os esforços recentes de recuperação na parte final do seminário. Dra. Maria, seria óptimo contar com esses dados.\n\nEnviarei o link de acesso por email uma semana antes do evento.",
                'is_accepted' => false,
                'is_flagged' => false,
                'created_at' => now()->subDays(1),
                'updated_at' => now()->subDays(1),
                'likes_count' => 4,
            ],

            // Replies to Topic 4 (Bases de dados)
            [
                'topic_id' => $topicIds[3],
                'author_id' => $professor->id,
                'content' => "Para além das que mencionaste, recomendo:\n\n- **CLIO-INFRA** (clio-infra.eu) — dados históricos globais incluindo indicadores africanos\n- **Maddison Project Database** — PIB histórico por país\n- **African Economic History Working Paper Series** — contém datasets complementares\n\nPara Angola especificamente, os relatórios estatísticos coloniais (Anuário Estatístico) estão parcialmente digitalizados na Biblioteca Nacional de Portugal.",
                'is_accepted' => false,
                'is_flagged' => false,
                'created_at' => now()->subDays(18),
                'updated_at' => now()->subDays(18),
                'likes_count' => 8,
            ],
            [
                'topic_id' => $topicIds[3],
                'author_id' => $student1->id,
                'content' => "Obrigado pela partilha! Não conhecia o CLIO-INFRA. Vou explorar esses dados para o meu trabalho comparativo.",
                'is_accepted' => false,
                'is_flagged' => false,
                'created_at' => now()->subDays(8),
                'updated_at' => now()->subDays(8),
                'likes_count' => 1,
            ],

            // Reply to Topic 5 (Chamada artigos)
            [
                'topic_id' => $topicIds[4],
                'author_id' => $researcher->id,
                'content' => "Estou a preparar um artigo sobre a indústria diamantífera para submissão. Posso incluir co-autores? Temos dados novos sobre a Diamang que ainda não foram publicados.",
                'is_accepted' => false,
                'is_flagged' => false,
                'created_at' => now()->subDays(3),
                'updated_at' => now()->subDays(3),
                'likes_count' => 4,
            ],

            // Replies to Topic 6 (Relatórios Diamang)
            [
                'topic_id' => $topicIds[5],
                'author_id' => $professor->id,
                'content' => "Excelentes materiais, Dra. Maria! Tenho interesse em colaborar na análise dos dados de produção e força de trabalho. Podemos organizar um encontro virtual para discutir a metodologia?",
                'is_accepted' => false,
                'is_flagged' => false,
                'created_at' => now()->subDays(10),
                'updated_at' => now()->subDays(10),
                'likes_count' => 3,
            ],
            [
                'topic_id' => $topicIds[5],
                'author_id' => $student2->id,
                'content' => "Que material fantástico! Seria possível usar estes dados para a minha monografia sobre a economia colonial nas Lundas?",
                'is_accepted' => false,
                'is_flagged' => false,
                'created_at' => now()->subDays(4),
                'updated_at' => now()->subDays(4),
                'likes_count' => 1,
            ],

            // Reply to Topic 7 (Mapas coloniais)
            [
                'topic_id' => $topicIds[6],
                'author_id' => $researcher->id,
                'content' => "Muito interessante, Professor! Esses mapas complementariam perfeitamente a minha investigação sobre rotas comerciais. Teria possibilidade de digitalizar e partilhar na plataforma?",
                'is_accepted' => false,
                'is_flagged' => false,
                'created_at' => now()->subDays(18),
                'updated_at' => now()->subDays(18),
                'likes_count' => 2,
            ],

            // Replies to Topic 8 (Citação fontes)
            [
                'topic_id' => $topicIds[7],
                'author_id' => $professor->id,
                'content' => "Para fontes primárias do Arquivo Histórico de Angola, o formato correcto é:\n\n**APA:**\nRelatório do Governador de Benguela (1920). [Título do documento]. Arquivo Histórico de Angola, Fundo [nome], Caixa [nº], Pasta [nº].\n\n**ABNT:**\nANGOLA. Governo do Distrito de Benguela. **Título do documento**. Benguela, 1920. Arquivo Histórico de Angola, Fundo [nome], Caixa [nº].\n\nO importante é incluir sempre a localização exacta no arquivo (fundo, caixa, pasta/documento).",
                'is_accepted' => true,
                'is_flagged' => false,
                'created_at' => now()->subDays(2),
                'updated_at' => now()->subDays(2),
                'likes_count' => 6,
            ],
            [
                'topic_id' => $topicIds[7],
                'author_id' => $researcher->id,
                'content' => "Complementando a resposta do Professor, para fontes do Arquivo Histórico Ultramarino (Lisboa), o formato é semelhante mas deve-se adicionar \"AHU\" como abreviatura reconhecida:\n\nAHU, Angola, Caixa [nº], Doc. [nº], [data].\n\nNa plataforma temos a funcionalidade de citação automática que pode ajudar!",
                'is_accepted' => false,
                'is_flagged' => false,
                'created_at' => now()->subDays(1),
                'updated_at' => now()->subDays(1),
                'likes_count' => 3,
            ],
        ];

        foreach ($replies as $replyData) {
            DB::table('topic_replies')->insert(array_merge($replyData, [
                'id' => (string) Str::uuid(),
                'parent_reply_id' => null,
            ]));
        }

        // ──────────────────────────────────────────────────────────────
        // 4. Topic Likes (some sample likes)
        // ──────────────────────────────────────────────────────────────
        $likePairs = [
            [$topicIds[0], $professor->id],
            [$topicIds[0], $researcher->id],
            [$topicIds[0], $student2->id],
            [$topicIds[2], $student1->id],
            [$topicIds[2], $student2->id],
            [$topicIds[2], $researcher->id],
            [$topicIds[3], $professor->id],
            [$topicIds[3], $student1->id],
            [$topicIds[5], $professor->id],
            [$topicIds[5], $student1->id],
            [$topicIds[5], $student2->id],
        ];

        foreach ($likePairs as [$topicId, $userId]) {
            DB::table('topic_likes')->insert([
                'id' => (string) Str::uuid(),
                'topic_id' => $topicId,
                'user_id' => $userId,
                'created_at' => now(),
            ]);
        }

        // ──────────────────────────────────────────────────────────────
        // 5. Topic Followers
        // ──────────────────────────────────────────────────────────────
        $followerPairs = [
            [$topicIds[0], $professor->id],
            [$topicIds[0], $researcher->id],
            [$topicIds[0], $student2->id],
            [$topicIds[2], $student1->id],
            [$topicIds[2], $student2->id],
            [$topicIds[2], $researcher->id],
            [$topicIds[2], $admin->id],
            [$topicIds[3], $professor->id],
            [$topicIds[3], $student1->id],
            [$topicIds[5], $professor->id],
            [$topicIds[5], $student1->id],
        ];

        foreach ($followerPairs as [$topicId, $userId]) {
            DB::table('topic_followers')->insert([
                'id' => (string) Str::uuid(),
                'topic_id' => $topicId,
                'user_id' => $userId,
                'created_at' => now(),
            ]);
        }
    }
}
