<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class DocumentSeeder extends Seeder
{
    public function run(): void
    {
        // ──────────────────────────────────────────────────────────────
        // 1. Document Categories
        // ──────────────────────────────────────────────────────────────
        $categories = [
            [
                'id' => (string) Str::uuid(),
                'slug' => 'economia-colonial',
                'name' => 'Economia Colonial',
                'description' => 'Documentos sobre a economia durante o período colonial em Angola, incluindo comércio, exploração de recursos e políticas económicas.',
                'color_bg' => '#E8D5B7',
                'color_text' => '#4A3728',
                'icon' => '🏛️',
                'parent_id' => null,
                'sort_order' => 1,
                'created_at' => now(),
            ],
            [
                'id' => (string) Str::uuid(),
                'slug' => 'comercio-atlantico',
                'name' => 'Comércio Atlântico',
                'description' => 'Estudos sobre o comércio transatlântico, rotas comerciais e o impacto económico do tráfico de escravos.',
                'color_bg' => '#B7D5E8',
                'color_text' => '#1A3A4A',
                'icon' => '⚓',
                'parent_id' => null,
                'sort_order' => 2,
                'created_at' => now(),
            ],
            [
                'id' => (string) Str::uuid(),
                'slug' => 'industrializacao',
                'name' => 'Industrialização',
                'description' => 'Processos de industrialização em Angola, incluindo infraestrutura ferroviária, minas e manufactura.',
                'color_bg' => '#D5E8B7',
                'color_text' => '#2A4A1A',
                'icon' => '🏭',
                'parent_id' => null,
                'sort_order' => 3,
                'created_at' => now(),
            ],
            [
                'id' => (string) Str::uuid(),
                'slug' => 'politica-pos-independencia',
                'name' => 'Política Económica Pós-Independência',
                'description' => 'Análises das políticas económicas após a independência de Angola em 1975.',
                'color_bg' => '#E8B7D5',
                'color_text' => '#4A1A3A',
                'icon' => '🇦🇴',
                'parent_id' => null,
                'sort_order' => 4,
                'created_at' => now(),
            ],
            [
                'id' => (string) Str::uuid(),
                'slug' => 'agricultura-recursos',
                'name' => 'Agricultura e Recursos Naturais',
                'description' => 'Exploração agrícola, café, diamantes, petróleo e outros recursos naturais de Angola.',
                'color_bg' => '#B7E8C7',
                'color_text' => '#1A4A2A',
                'icon' => '🌾',
                'parent_id' => null,
                'sort_order' => 5,
                'created_at' => now(),
            ],
            [
                'id' => (string) Str::uuid(),
                'slug' => 'historia-monetaria',
                'name' => 'História Monetária',
                'description' => 'Evolução do sistema monetário angolano, moedas, câmbio e políticas monetárias.',
                'color_bg' => '#E8E8B7',
                'color_text' => '#4A4A1A',
                'icon' => '💰',
                'parent_id' => null,
                'sort_order' => 6,
                'created_at' => now(),
            ],
        ];

        foreach ($categories as $cat) {
            DB::table('document_categories')->insert($cat);
        }

        // ──────────────────────────────────────────────────────────────
        // 2. Tags
        // ──────────────────────────────────────────────────────────────
        $tags = [
            ['name' => 'Angola', 'slug' => 'angola'],
            ['name' => 'Colonialismo', 'slug' => 'colonialismo'],
            ['name' => 'Diamantes', 'slug' => 'diamantes'],
            ['name' => 'Petróleo', 'slug' => 'petroleo'],
            ['name' => 'Café', 'slug' => 'cafe'],
            ['name' => 'Caminho de Ferro', 'slug' => 'caminho-de-ferro'],
            ['name' => 'Benguela', 'slug' => 'benguela'],
            ['name' => 'Luanda', 'slug' => 'luanda'],
            ['name' => 'Comércio de Escravos', 'slug' => 'comercio-de-escravos'],
            ['name' => 'Independência', 'slug' => 'independencia'],
            ['name' => 'Kwanza', 'slug' => 'kwanza'],
            ['name' => 'Desenvolvimento', 'slug' => 'desenvolvimento'],
        ];

        $tagIds = [];
        foreach ($tags as $tag) {
            $tagId = (string) Str::uuid();
            $tagIds[$tag['slug']] = $tagId;
            DB::table('tags')->insert([
                'id' => $tagId,
                'name' => $tag['name'],
                'slug' => $tag['slug'],
                'created_at' => now(),
            ]);
        }

        // Get users for created_by
        $admin = DB::table('users')->where('role', 'admin')->first();
        $professor = DB::table('users')->where('role', 'professor')->first();
        $researcher = DB::table('users')->where('role', 'investigador')->first();

        if (!$admin || !$professor || !$researcher) {
            $this->command->warn('UserSeeder must run before DocumentSeeder. Skipping documents.');
            return;
        }

        // ──────────────────────────────────────────────────────────────
        // 3. Documents
        // ──────────────────────────────────────────────────────────────
        $documents = [
            [
                'title' => 'O Caminho de Ferro de Benguela: Motor do Desenvolvimento Colonial',
                'slug' => 'caminho-ferro-benguela-motor-desenvolvimento-' . Str::lower(Str::random(6)),
                'author' => 'Prof. João Pedro da Silva',
                'institution' => 'ISPTEC',
                'category_id' => $categories[2]['id'], // Industrialização
                'document_type' => 'article',
                'academic_level' => 'advanced',
                'access_level_id' => 'public',
                'publication_date' => '2024-03-15',
                'period_start' => 1899,
                'period_end' => 1975,
                'summary' => 'Análise abrangente do papel do Caminho de Ferro de Benguela no desenvolvimento económico de Angola colonial. O estudo examina como esta infraestrutura ferroviária transformou as rotas comerciais, facilitou a exportação de minérios do interior e moldou padrões de urbanização ao longo do corredor Lobito-Katanga.',
                'content' => 'O Caminho de Ferro de Benguela, inaugurado oficialmente em 1929, representou uma das maiores obras de engenharia da África colonial. Com aproximadamente 1.344 km de extensão, ligava o porto do Lobito às minas de cobre do Katanga, no então Congo Belga. A sua construção, iniciada em 1903 por Robert Williams, alterou fundamentalmente a geografia económica de Angola. Este artigo analisa o impacto desta infraestrutura em três dimensões: o comércio regional, o desenvolvimento urbano e as dinâmicas laborais.',
                'cover_image_url' => null,
                'pdf_url' => null,
                'status' => 'published',
                'created_by' => $professor->id,
                'reviewed_by' => $admin->id,
                'published_at' => '2024-03-20',
                'views_count' => 342,
                'likes_count' => 28,
                'downloads_count' => 67,
                'comments_count' => 5,
                'tags' => ['caminho-de-ferro', 'benguela', 'colonialismo', 'angola'],
            ],
            [
                'title' => 'O Tráfico Transatlântico de Escravos e a Economia de Luanda (Séculos XVII-XIX)',
                'slug' => 'trafico-transatlantico-escravos-luanda-' . Str::lower(Str::random(6)),
                'author' => 'Dra. Maria Neves dos Santos',
                'institution' => 'Universidade Agostinho Neto',
                'category_id' => $categories[1]['id'], // Comércio Atlântico
                'document_type' => 'thesis',
                'academic_level' => 'doctorate',
                'access_level_id' => 'jindungo',
                'publication_date' => '2023-11-10',
                'period_start' => 1600,
                'period_end' => 1850,
                'summary' => 'Tese de doutoramento que examina o papel de Luanda como principal porto de embarque de escravos na costa ocidental africana. Analisa as redes comerciais, os agentes económicos envolvidos e o impacto demográfico e económico de longa duração no território angolano.',
                'content' => 'Luanda, fundada em 1575, rapidamente se tornou o principal porto de embarque do tráfico transatlântico de escravos. Entre 1600 e 1850, estima-se que mais de 3 milhões de pessoas foram forçosamente embarcadas a partir dos portos angolanos. Esta tese analisa as estruturas económicas que sustentaram este comércio, desde as redes de captura no interior até às rotas marítimas para o Brasil e Caraíbas.',
                'cover_image_url' => null,
                'pdf_url' => null,
                'status' => 'published',
                'created_by' => $researcher->id,
                'reviewed_by' => $admin->id,
                'published_at' => '2023-12-01',
                'views_count' => 567,
                'likes_count' => 45,
                'downloads_count' => 123,
                'comments_count' => 12,
                'tags' => ['comercio-de-escravos', 'luanda', 'colonialismo', 'angola'],
            ],
            [
                'title' => 'A Economia do Café em Angola: Ascensão e Declínio (1830-1975)',
                'slug' => 'economia-cafe-angola-' . Str::lower(Str::random(6)),
                'author' => 'Prof. João Pedro da Silva',
                'institution' => 'ISPTEC',
                'category_id' => $categories[4]['id'], // Agricultura e Recursos
                'document_type' => 'article',
                'academic_level' => 'advanced',
                'access_level_id' => 'public',
                'publication_date' => '2024-06-22',
                'period_start' => 1830,
                'period_end' => 1975,
                'summary' => 'Estudo detalhado da cultura cafeeira em Angola, desde a sua introdução no século XIX até ao colapso pós-independência. Angola chegou a ser o quarto maior produtor mundial de café, com a produção a desempenhar um papel central na economia colonial.',
                'content' => 'A introdução do café em Angola remonta ao início do século XIX. Durante a década de 1960, Angola era o quarto maior produtor mundial de café robusta, com uma produção anual superior a 200.000 toneladas. A cultura concentrava-se nas províncias do Uíge, Cuanza Norte e Cuanza Sul.',
                'cover_image_url' => null,
                'pdf_url' => null,
                'status' => 'published',
                'created_by' => $professor->id,
                'reviewed_by' => null,
                'published_at' => '2024-07-01',
                'views_count' => 189,
                'likes_count' => 15,
                'downloads_count' => 34,
                'comments_count' => 3,
                'tags' => ['cafe', 'angola', 'colonialismo'],
            ],
            [
                'title' => 'Diamantes de Angola: Da Diamang à Endiama',
                'slug' => 'diamantes-angola-diamang-endiama-' . Str::lower(Str::random(6)),
                'author' => 'Dra. Maria Neves dos Santos',
                'institution' => 'Universidade Agostinho Neto',
                'category_id' => $categories[4]['id'], // Agricultura e Recursos
                'document_type' => 'report',
                'academic_level' => 'advanced',
                'access_level_id' => 'restricted',
                'publication_date' => '2024-01-18',
                'period_start' => 1912,
                'period_end' => 2024,
                'summary' => 'Relatório sobre a indústria diamantífera angolana, desde a criação da Companhia de Diamantes de Angola (Diamang) em 1917 até à Endiama. Analisa o impacto económico, social e ambiental da exploração de diamantes nas Lundas.',
                'content' => 'A descoberta de diamantes em Angola data de 1912, nas regiões da Lunda Norte e Lunda Sul. A Companhia de Diamantes de Angola (Diamang), fundada em 1917, deteve o monopólio da exploração durante o período colonial. Após a independência, o Estado angolano nacionalizou o sector através da criação da Endiama em 1981.',
                'cover_image_url' => null,
                'pdf_url' => null,
                'status' => 'published',
                'created_by' => $researcher->id,
                'reviewed_by' => $admin->id,
                'published_at' => '2024-02-15',
                'views_count' => 412,
                'likes_count' => 33,
                'downloads_count' => 89,
                'comments_count' => 7,
                'tags' => ['diamantes', 'angola', 'colonialismo'],
            ],
            [
                'title' => 'O Escudo Angolano e a Transição para o Kwanza',
                'slug' => 'escudo-angolano-transicao-kwanza-' . Str::lower(Str::random(6)),
                'author' => 'Prof. João Pedro da Silva',
                'institution' => 'ISPTEC',
                'category_id' => $categories[5]['id'], // História Monetária
                'document_type' => 'article',
                'academic_level' => 'intro',
                'access_level_id' => 'public',
                'publication_date' => '2024-09-05',
                'period_start' => 1914,
                'period_end' => 1977,
                'summary' => 'Artigo introdutório sobre a história monetária de Angola, desde o escudo angolano colonial até à introdução do kwanza em 1977, dois anos após a independência. Analisa as razões políticas e económicas da mudança de moeda.',
                'content' => 'O sistema monetário colonial angolano baseava-se no escudo, dividido em centavos. Com a independência em 1975, o novo governo decidiu criar uma moeda nacional que simbolizasse a soberania do país. Em 8 de janeiro de 1977, o kwanza foi introduzido, nomeado em homenagem ao rio Cuanza.',
                'cover_image_url' => null,
                'pdf_url' => null,
                'status' => 'published',
                'created_by' => $professor->id,
                'reviewed_by' => null,
                'published_at' => '2024-09-10',
                'views_count' => 95,
                'likes_count' => 8,
                'downloads_count' => 12,
                'comments_count' => 1,
                'tags' => ['kwanza', 'angola', 'independencia'],
            ],
            [
                'title' => 'Política Económica do MPLA: Do Socialismo à Economia de Mercado (1975-2002)',
                'slug' => 'politica-economica-mpla-socialismo-mercado-' . Str::lower(Str::random(6)),
                'author' => 'Dra. Maria Neves dos Santos',
                'institution' => 'Universidade Agostinho Neto',
                'category_id' => $categories[3]['id'], // Pós-Independência
                'document_type' => 'thesis',
                'academic_level' => 'doctorate',
                'access_level_id' => 'jindungo',
                'publication_date' => '2023-05-20',
                'period_start' => 1975,
                'period_end' => 2002,
                'summary' => 'Tese que analisa a transição da economia planificada socialista para o modelo de economia de mercado em Angola. Examina as reformas económicas, o impacto da guerra civil e o papel do petróleo na sustentação do Estado.',
                'content' => 'Após a independência em 1975, o MPLA adoptou um modelo económico de inspiração marxista-leninista. A economia foi centralizada, as grandes empresas nacionalizadas e o comércio exterior controlado pelo Estado. A queda do Muro de Berlim em 1989 e o fim do apoio soviético forçaram uma reorientação gradual para a economia de mercado.',
                'cover_image_url' => null,
                'pdf_url' => null,
                'status' => 'published',
                'created_by' => $researcher->id,
                'reviewed_by' => $admin->id,
                'published_at' => '2023-06-15',
                'views_count' => 678,
                'likes_count' => 52,
                'downloads_count' => 145,
                'comments_count' => 18,
                'tags' => ['independencia', 'angola', 'desenvolvimento'],
            ],
            [
                'title' => 'O Sistema Fiscal Colonial Português em Angola',
                'slug' => 'sistema-fiscal-colonial-angola-' . Str::lower(Str::random(6)),
                'author' => 'Prof. João Pedro da Silva',
                'institution' => 'ISPTEC',
                'category_id' => $categories[0]['id'], // Economia Colonial
                'document_type' => 'manuscript',
                'academic_level' => 'advanced',
                'access_level_id' => 'public',
                'publication_date' => '2024-04-12',
                'period_start' => 1850,
                'period_end' => 1961,
                'summary' => 'Manuscrito que examina a estrutura fiscal da administração colonial portuguesa em Angola, incluindo impostos sobre o comércio, trabalho forçado e tributação das populações africanas.',
                'content' => 'O sistema fiscal colonial em Angola evoluiu significativamente ao longo do tempo. No século XIX, a principal fonte de receita era o imposto sobre o comércio de escravos. Com o fim formal do tráfico, o regime colonial desenvolveu um sistema complexo de tributação que incluía o imposto de cubata, o imposto indígena e diversas taxas comerciais.',
                'cover_image_url' => null,
                'pdf_url' => null,
                'status' => 'published',
                'created_by' => $professor->id,
                'reviewed_by' => null,
                'published_at' => '2024-04-20',
                'views_count' => 156,
                'likes_count' => 11,
                'downloads_count' => 28,
                'comments_count' => 2,
                'tags' => ['colonialismo', 'angola'],
            ],
            [
                'title' => 'O Boom Petrolífero e a Economia Angolana (1956-2014)',
                'slug' => 'boom-petrolifero-angola-' . Str::lower(Str::random(6)),
                'author' => 'Dra. Maria Neves dos Santos',
                'institution' => 'Universidade Agostinho Neto',
                'category_id' => $categories[4]['id'], // Agricultura e Recursos
                'document_type' => 'report',
                'academic_level' => 'advanced',
                'access_level_id' => 'public',
                'publication_date' => '2024-08-30',
                'period_start' => 1956,
                'period_end' => 2014,
                'summary' => 'Relatório detalhado sobre a exploração petrolífera em Angola, desde a descoberta dos primeiros poços em Cabinda até ao pico de produção. Analisa a dependência económica do petróleo e os desafios da diversificação.',
                'content' => 'A exploração petrolífera em Angola começou em 1956, com a descoberta de jazidas em Cabinda pela Petrangol (futura Sonangol). A produção cresceu exponencialmente nas décadas seguintes, atingindo o pico de 1,9 milhões de barris por dia em 2008. O petróleo passou a representar mais de 90% das exportações e 75% das receitas fiscais do Estado angolano.',
                'cover_image_url' => null,
                'pdf_url' => null,
                'status' => 'published',
                'created_by' => $researcher->id,
                'reviewed_by' => $admin->id,
                'published_at' => '2024-09-15',
                'views_count' => 523,
                'likes_count' => 41,
                'downloads_count' => 98,
                'comments_count' => 14,
                'tags' => ['petroleo', 'angola', 'desenvolvimento'],
            ],
            [
                'title' => 'Rotas Comerciais do Interior de Angola nos Séculos XVIII-XIX',
                'slug' => 'rotas-comerciais-interior-angola-' . Str::lower(Str::random(6)),
                'author' => 'Prof. João Pedro da Silva',
                'institution' => 'ISPTEC',
                'category_id' => $categories[1]['id'], // Comércio Atlântico
                'document_type' => 'archive',
                'academic_level' => 'doctorate',
                'access_level_id' => 'restricted',
                'publication_date' => '2024-02-28',
                'period_start' => 1700,
                'period_end' => 1870,
                'summary' => 'Documento de arquivo que mapeia as principais rotas comerciais do interior angolano, incluindo as caravanas de longa distância dos Ovimbundu e Chokwe. Material de fonte primária digitalizado.',
                'content' => 'As rotas comerciais do interior angolano formavam uma rede complexa que ligava o planalto central aos portos costeiros de Benguela e Luanda. Os comerciantes Ovimbundu, conhecidos como pombeiros, organizavam caravanas que percorriam centenas de quilómetros transportando cera, marfim, borracha e, infelizmente, seres humanos escravizados.',
                'cover_image_url' => null,
                'pdf_url' => null,
                'status' => 'published',
                'created_by' => $professor->id,
                'reviewed_by' => $admin->id,
                'published_at' => '2024-03-10',
                'views_count' => 234,
                'likes_count' => 19,
                'downloads_count' => 56,
                'comments_count' => 4,
                'tags' => ['comercio-de-escravos', 'benguela', 'angola'],
            ],
            [
                'title' => 'Diversificação Económica em Angola: Desafios e Perspectivas (2017-2025)',
                'slug' => 'diversificacao-economica-angola-' . Str::lower(Str::random(6)),
                'author' => 'António Cabral Ferreira',
                'institution' => 'ISPTEC',
                'category_id' => $categories[3]['id'], // Pós-Independência
                'document_type' => 'article',
                'academic_level' => 'intro',
                'access_level_id' => 'public',
                'publication_date' => '2025-01-15',
                'period_start' => 2017,
                'period_end' => 2025,
                'summary' => 'Artigo introdutório que examina os esforços de diversificação económica em Angola no contexto da queda dos preços do petróleo. Analisa sectores como agricultura, pescas, turismo e tecnologia como alternativas à dependência petrolífera.',
                'content' => 'A partir de 2014, com a queda acentuada dos preços internacionais do petróleo, Angola enfrentou uma grave crise económica que expôs a vulnerabilidade do seu modelo de desenvolvimento. O Plano de Desenvolvimento Nacional 2018-2022 identificou a diversificação económica como prioridade estratégica.',
                'cover_image_url' => null,
                'pdf_url' => null,
                'status' => 'published',
                'created_by' => DB::table('users')->where('email', 'student@economia-historia.local')->value('id'),
                'reviewed_by' => $professor->id,
                'published_at' => '2025-02-01',
                'views_count' => 87,
                'likes_count' => 6,
                'downloads_count' => 9,
                'comments_count' => 2,
                'tags' => ['desenvolvimento', 'petroleo', 'angola'],
            ],
        ];

        foreach ($documents as $docData) {
            $docTags = $docData['tags'] ?? [];
            unset($docData['tags']);

            $docId = (string) Str::uuid();
            $docData['id'] = $docId;
            $docData['created_at'] = now();
            $docData['updated_at'] = now();

            DB::table('documents')->insert($docData);

            // Link tags
            foreach ($docTags as $tagSlug) {
                if (isset($tagIds[$tagSlug])) {
                    DB::table('document_tags')->insert([
                        'document_id' => $docId,
                        'tag_id' => $tagIds[$tagSlug],
                    ]);
                }
            }
        }
    }
}
