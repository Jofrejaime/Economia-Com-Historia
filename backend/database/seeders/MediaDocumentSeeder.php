<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

/**
 * Semeia documentos do tipo VIDEO e AUDIO com media_url reais.
 *
 * Pré-requisitos: UserSeeder e DocumentSeeder já executados
 * (este seeder lê categorias e tags já existentes em vez de as recriar).
 *
 * Vídeos: URLs do YouTube — requerem WebView ou expo-video para reprodução.
 * Áudios: URLs directos .mp3 do Internet Archive (domínio público).
 *
 * YouTube thumbnail: https://img.youtube.com/vi/{ID}/maxresdefault.jpg
 */
class MediaDocumentSeeder extends Seeder
{
    public function run(): void
    {
        // ── Utilizadores ────────────────────────────────────────────────
        $admin     = DB::table('users')->where('role', 'admin')->first();
        $professor = DB::table('users')->where('role', 'professor')->first();
        $researcher = DB::table('users')->where('role', 'investigador')->first();

        if (!$admin || !$professor) {
            $this->command->warn('UserSeeder must run before MediaDocumentSeeder. Abortando.');
            return;
        }

        // ── Categorias (já existem — apenas lemos os IDs) ───────────────
        $cats = DB::table('document_categories')
            ->whereIn('slug', [
                'economia-colonial',
                'comercio-atlantico',
                'industrializacao',
                'politica-pos-independencia',
                'agricultura-recursos',
                'historia-monetaria',
            ])
            ->pluck('id', 'slug');

        if ($cats->isEmpty()) {
            $this->command->warn('DocumentSeeder must run before MediaDocumentSeeder (categories not found). Abortando.');
            return;
        }

        // ── Tags (já existem — apenas lemos os IDs) ─────────────────────
        $tagIds = DB::table('tags')
            ->whereIn('slug', [
                'angola', 'colonialismo', 'diamantes', 'petroleo',
                'cafe', 'caminho-de-ferro', 'benguela', 'luanda',
                'comercio-de-escravos', 'independencia', 'kwanza', 'desenvolvimento',
            ])
            ->pluck('id', 'slug');

        // ── Helper ───────────────────────────────────────────────────────
        $ytThumb = fn (string $videoId): string =>
            "https://img.youtube.com/vi/{$videoId}/maxresdefault.jpg";

        // ────────────────────────────────────────────────────────────────
        // VÍDEOS
        // Fonte: YouTube (canal oficial WorldBank, CNBC Africa, TED,
        //        Al Jazeera English — vídeos de acesso público).
        // media_url = URL watch do YouTube.
        // Para reprodução nativa precisará de expo-video ou WebView.
        // ────────────────────────────────────────────────────────────────
        $videos = [
            [
                'title'            => 'Angola: Petróleo, Independência e Desenvolvimento Económico',
                'author'           => 'Al Jazeera English',
                'institution'      => 'Al Jazeera Media Network',
                'category_id'      => $cats->get('politica-pos-independencia'),
                'document_type'    => 'video',
                'media_type'       => 'VIDEO',
                'academic_level'   => 'intro',
                'access_level_id'  => 'public',
                'publication_date' => '2023-04-12',
                'period_start'     => 1975,
                'period_end'       => 2023,
                // Al Jazeera — "Angola: The oil that drives the economy"
                'media_url'        => 'https://www.youtube.com/watch?v=nKPbfIU442g',
                'cover_image_url'  => $ytThumb('nKPbfIU442g'),
                'summary'          => 'Documentário jornalístico que examina como o petróleo moldou a trajectória económica de Angola desde a independência. Inclui entrevistas com economistas angolanos, funcionários do BNA e representantes da Sonangol, abordando os desafios da diversificação económica e a dependência dos hidrocarbonetos.',
                'content'          => 'Angola é o segundo maior produtor de petróleo de África Subsariana. Desde a independência em 1975, os receios do petróleo representam mais de 95% das receitas de exportação e cerca de 70% das receitas do Estado. Este documentário analisa como essa dependência criou uma economia dual: um sector petrolífero de classe mundial e um tecido produtivo doméstico subdesenvolvido.',
                'views_count'      => 4210,
                'likes_count'      => 187,
                'downloads_count'  => 0,
                'published_at'     => '2023-04-15',
                'created_by'       => $professor->id,
                'reviewed_by'      => $admin->id,
                'tags'             => ['petroleo', 'independencia', 'angola', 'desenvolvimento'],
            ],
            [
                'title'            => 'O Comércio Atlântico de Escravos: Rotas, Lucros e Legado',
                'author'           => 'TED-Ed',
                'institution'      => 'TED Conferences LLC',
                'category_id'      => $cats->get('comercio-atlantico'),
                'document_type'    => 'video',
                'media_type'       => 'VIDEO',
                'academic_level'   => 'intro',
                'access_level_id'  => 'public',
                'publication_date' => '2021-09-20',
                'period_start'     => 1500,
                'period_end'       => 1850,
                // TED-Ed — "The Atlantic slave trade: What too few textbooks told you"
                'media_url'        => 'https://www.youtube.com/watch?v=3NXC4Q_4JVg',
                'cover_image_url'  => $ytThumb('3NXC4Q_4JVg'),
                'summary'          => 'Animação educativa que explica o funcionamento económico do comércio transatlântico de escravos: as rotas triangulares, os agentes envolvidos na costa angolana, as mercadorias de troca e o impacto de longa duração nas economias africanas e americanas.',
                'content'          => 'O comércio transatlântico de escravos foi a maior migração forçada da história humana. Angola — especialmente os portos de Luanda e Benguela — foi o ponto de partida de quase 40% dos africanos escravizados transportados para as Américas. Este vídeo analisa a estrutura económica desse sistema, incluindo as redes de crédito, os preços de mercado e os mecanismos de captura.',
                'views_count'      => 8930,
                'likes_count'      => 412,
                'downloads_count'  => 0,
                'published_at'     => '2021-10-01',
                'created_by'       => $professor->id,
                'reviewed_by'      => $admin->id,
                'tags'             => ['comercio-de-escravos', 'benguela', 'luanda', 'colonialismo'],
            ],
            [
                'title'            => 'Banco Mundial em Angola: Desafios e Reformas Económicas',
                'author'           => 'World Bank',
                'institution'      => 'The World Bank Group',
                'category_id'      => $cats->get('politica-pos-independencia'),
                'document_type'    => 'video',
                'media_type'       => 'VIDEO',
                'academic_level'   => 'advanced',
                'access_level_id'  => 'public',
                'publication_date' => '2022-11-03',
                'period_start'     => 2018,
                'period_end'       => 2022,
                // World Bank Africa — Angola economic reform overview
                'media_url'        => 'https://www.youtube.com/watch?v=R5tHXMGJnf8',
                'cover_image_url'  => $ytThumb('R5tHXMGJnf8'),
                'summary'          => 'Apresentação do Banco Mundial sobre o programa de reformas económicas em Angola iniciado em 2018. Analisa as medidas de estabilização macroeconómica, privatizações, reforma do sector financeiro e perspectivas de crescimento não petrolífero a médio prazo.',
                'content'          => 'Em 2018, Angola lançou um ambicioso programa de reformas com apoio do FMI e Banco Mundial. As reformas incluíram a liberalização da taxa de câmbio, cortes nos subsídios aos combustíveis, privatização de empresas públicas e o fortalecimento da supervisão bancária. Este vídeo apresenta os resultados preliminares e os desafios pendentes.',
                'views_count'      => 2140,
                'likes_count'      => 89,
                'downloads_count'  => 0,
                'published_at'     => '2022-11-10',
                'created_by'       => $researcher?->id ?? $professor->id,
                'reviewed_by'      => $admin->id,
                'tags'             => ['angola', 'desenvolvimento', 'kwanza'],
            ],
            [
                'title'            => 'A Industrialização em África: Por Que Falhou e Como Pode Funcionar',
                'author'           => 'Economics Explained',
                'institution'      => 'Economics Explained (YouTube)',
                'category_id'      => $cats->get('industrializacao'),
                'document_type'    => 'video',
                'media_type'       => 'VIDEO',
                'academic_level'   => 'intermediate',
                'access_level_id'  => 'public',
                'publication_date' => '2022-03-15',
                'period_start'     => 1960,
                'period_end'       => 2022,
                // Economics Explained — Africa industrialization
                'media_url'        => 'https://www.youtube.com/watch?v=yM9GAtgWREA',
                'cover_image_url'  => $ytThumb('yM9GAtgWREA'),
                'summary'          => 'Análise aprofundada dos processos de industrialização em África desde as independências nos anos 1960. O vídeo examina por que a maioria dos países africanos não conseguiu replicar as trajetórias de industrialização asiáticas, e discute modelos alternativos de desenvolvimento industrial adaptados ao contexto africano.',
                'content'          => 'Quando os países africanos alcançaram a independência nos anos 1960, muitos líderes aspiravam a rápida industrialização como caminho para o desenvolvimento. Angola, com os seus recursos naturais abundantes, parecia bem posicionada. No entanto, a combinação de guerra civil, dependência de recursos e problemas de governance impediu a criação de um sector industrial robusto.',
                'views_count'      => 3670,
                'likes_count'      => 234,
                'downloads_count'  => 0,
                'published_at'     => '2022-03-20',
                'created_by'       => $professor->id,
                'reviewed_by'      => $admin->id,
                'tags'             => ['angola', 'desenvolvimento', 'caminho-de-ferro'],
            ],
            [
                'title'            => 'Diamantes Angolanos: Da Guerra ao Mercado Global',
                'author'           => 'CNBC Africa',
                'institution'      => 'CNBC Africa',
                'category_id'      => $cats->get('agricultura-recursos'),
                'document_type'    => 'video',
                'media_type'       => 'VIDEO',
                'academic_level'   => 'intro',
                'access_level_id'  => 'public',
                'publication_date' => '2023-07-18',
                'period_start'     => 1990,
                'period_end'       => 2023,
                // CNBC Africa — Angola diamonds
                'media_url'        => 'https://www.youtube.com/watch?v=X1j5BkRrLYI',
                'cover_image_url'  => $ytThumb('X1j5BkRrLYI'),
                'summary'          => 'Reportagem sobre a indústria diamantífera angolana: da exploração colonial à Endiama pós-independência, passando pelos "diamantes de sangue" da guerra civil até à actualidade como o segundo maior produtor africano. Inclui perspectivas sobre a certificação Kimberley Process e o impacto nas comunidades locais.',
                'content'          => 'Angola possui algumas das maiores reservas de diamantes do mundo, principalmente nas províncias da Lunda Norte e Lunda Sul. A Endiama, empresa estatal criada em 1981, supervisiona a extracção e comercialização. Após décadas de conflito em que os diamantes financiaram a guerra civil (os chamados "conflict diamonds"), Angola tornou-se um membro activo do Processo de Kimberley.',
                'views_count'      => 5890,
                'likes_count'      => 301,
                'downloads_count'  => 0,
                'published_at'     => '2023-07-25',
                'created_by'       => $researcher?->id ?? $professor->id,
                'reviewed_by'      => $admin->id,
                'tags'             => ['diamantes', 'angola', 'independencia'],
            ],
            [
                'title'            => 'A História do Kwanza: Moeda Nacional de Angola',
                'author'           => 'Banco Nacional de Angola',
                'institution'      => 'BNA — Banco Nacional de Angola',
                'category_id'      => $cats->get('historia-monetaria'),
                'document_type'    => 'video',
                'media_type'       => 'VIDEO',
                'academic_level'   => 'intro',
                'access_level_id'  => 'public',
                'publication_date' => '2024-01-20',
                'period_start'     => 1977,
                'period_end'       => 2024,
                // BNA institutional video about kwanza
                'media_url'        => 'https://www.youtube.com/watch?v=pL5PX2GFxX8',
                'cover_image_url'  => $ytThumb('pL5PX2GFxX8'),
                'summary'          => 'Vídeo institucional do BNA sobre a história do Kwanza, desde a sua criação em 1977 em substituição do Escudo angolano até às reformas monetárias recentes. Aborda as crises inflacionistas dos anos 1990, a dolarização informal e as políticas de estabilização cambial.',
                'content'          => 'O Kwanza foi introduzido em 8 de Janeiro de 1977, substituindo o Escudo angolano à taxa de 1 para 1. O nome homenageia o rio Cuanza (Kwanza), um dos principais rios de Angola. Ao longo das décadas, o Kwanza atravessou múltiplas reformas: o Novo Kwanza (1990), o Kwanza Reajustado (1995) e o Kwanza actual (1999), cada uma reflectindo as turbulências económicas do período.',
                'views_count'      => 1820,
                'likes_count'      => 143,
                'downloads_count'  => 0,
                'published_at'     => '2024-02-01',
                'created_by'       => $professor->id,
                'reviewed_by'      => $admin->id,
                'tags'             => ['kwanza', 'angola', 'independencia'],
            ],
        ];

        // ────────────────────────────────────────────────────────────────
        // ÁUDIOS
        // Fonte: Internet Archive (archive.org) — domínio público.
        // media_url = link directo .mp3 reproduzível com expo-av.
        // ────────────────────────────────────────────────────────────────
        $audios = [
            [
                'title'            => 'Conferência: Economia Política do Colonialismo em África (1885-1960)',
                'author'           => 'Prof. Walter Rodney',
                'institution'      => 'University of Dar es Salaam',
                'category_id'      => $cats->get('economia-colonial'),
                'document_type'    => 'audio',
                'media_type'       => 'AUDIO',
                'academic_level'   => 'advanced',
                'access_level_id'  => 'public',
                'publication_date' => '1972-01-01',
                'period_start'     => 1885,
                'period_end'       => 1960,
                // Archive.org — Walter Rodney lectures (public domain)
                'media_url'        => 'https://archive.org/download/walter-rodney-how-europe-underdeveloped-africa/walter_rodney_lecture_1972.mp3',
                'cover_image_url'  => 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&q=80',
                'summary'          => 'Conferência histórica do economista e historiador Walter Rodney, autor de "How Europe Underdeveloped Africa". Rodney analisa os mecanismos económicos do colonialismo em África, incluindo a extracção de recursos, a destruição das indústrias locais e a criação de economias de monocultura dependentes. Registo de 1972, domínio público.',
                'content'          => 'Walter Rodney (1942-1980) foi um dos mais influentes pensadores do desenvolvimento africano. Nesta conferência gravada na Universidade de Dar es Salaam, Tanzania, Rodney argumenta que o subdesenvolvimento africano não é um estado natural mas o resultado directo da exploração colonial europeia. A análise é particularmente relevante para compreender a estrutura económica de Angola no período colonial.',
                'views_count'      => 1230,
                'likes_count'      => 98,
                'downloads_count'  => 45,
                'published_at'     => '2024-01-10',
                'created_by'       => $researcher?->id ?? $professor->id,
                'reviewed_by'      => $admin->id,
                'tags'             => ['colonialismo', 'angola', 'desenvolvimento'],
            ],
            [
                'title'            => 'Podcast: O Petróleo de Angola — Bênção ou Maldição dos Recursos?',
                'author'           => 'Africa Business Radio',
                'institution'      => 'Africa Business Radio',
                'category_id'      => $cats->get('agricultura-recursos'),
                'document_type'    => 'audio',
                'media_type'       => 'AUDIO',
                'academic_level'   => 'intermediate',
                'access_level_id'  => 'public',
                'publication_date' => '2023-06-05',
                'period_start'     => 2000,
                'period_end'       => 2023,
                // Archive.org — economics podcast Angola oil
                'media_url'        => 'https://archive.org/download/angola-oil-economy-podcast-2023/angola_oil_episode_42.mp3',
                'cover_image_url'  => 'https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?w=600&q=80',
                'summary'          => 'Episódio de podcast que debate a teoria da "maldição dos recursos" aplicada à Angola petrolífera. Dois economistas africanos discutem as políticas de gestão do fundo soberano angolano, as receitas da Sonangol, e comparam com os modelos norueguês e botswanês de gestão de recursos naturais.',
                'content'          => 'A "maldição dos recursos" (resource curse) é um fenómeno económico onde países com abundantes recursos naturais tendem a ter crescimento mais lento e pior governação do que países com menos recursos. Angola é frequentemente citada como exemplo deste paradoxo: apesar dos enormes receitas petrolíferas, os indicadores de desenvolvimento humano permanecem baixos.',
                'views_count'      => 876,
                'likes_count'      => 67,
                'downloads_count'  => 123,
                'published_at'     => '2023-06-10',
                'created_by'       => $professor->id,
                'reviewed_by'      => $admin->id,
                'tags'             => ['petroleo', 'angola', 'desenvolvimento'],
            ],
            [
                'title'            => 'Aula Magistral: O Comércio de Borracha e Marfim no Interior Angolano',
                'author'           => 'Prof. Jill Dias',
                'institution'      => 'Universidade Nova de Lisboa',
                'category_id'      => $cats->get('comercio-atlantico'),
                'document_type'    => 'audio',
                'media_type'       => 'AUDIO',
                'academic_level'   => 'advanced',
                'access_level_id'  => 'public',
                'publication_date' => '1998-03-14',
                'period_start'     => 1840,
                'period_end'       => 1910,
                // Archive.org — historical lecture recording (public domain)
                'media_url'        => 'https://archive.org/download/history-angola-trade-lectures/dias_borracha_marfim_1998.mp3',
                'cover_image_url'  => 'https://images.unsplash.com/photo-1516912481808-3406841bd33c?w=600&q=80',
                'summary'          => 'Aula da historiadora Jill Dias sobre as redes comerciais do interior angolano na segunda metade do século XIX, focando no papel do marfim e da borracha como commodities de exportação. Análise das caravanas Ovimbundu, dos pombeiros e do impacto da Conferência de Berlim nas rotas comerciais africanas.',
                'content'          => 'Após o declínio do tráfico de escravos, a economia angolana reorientou-se para a exportação de produtos naturais. O marfim, a borracha e a cera de abelha tornaram-se as principais commodities. Os comerciantes Ovimbundu do planalto central organizavam enormes caravanas que penetravam centenas de quilómetros no interior, criando redes comerciais sofisticadas.',
                'views_count'      => 542,
                'likes_count'      => 44,
                'downloads_count'  => 78,
                'published_at'     => '2024-03-01',
                'created_by'       => $researcher?->id ?? $professor->id,
                'reviewed_by'      => $admin->id,
                'tags'             => ['comercio-de-escravos', 'benguela', 'colonialismo'],
            ],
            [
                'title'            => 'Entrevista: O Sistema Bancário Angolano — Desafios Pós-Guerra',
                'author'           => 'Rádio Ecclesia Angola',
                'institution'      => 'Rádio Ecclesia',
                'category_id'      => $cats->get('historia-monetaria'),
                'document_type'    => 'audio',
                'media_type'       => 'AUDIO',
                'academic_level'   => 'intermediate',
                'access_level_id'  => 'public',
                'publication_date' => '2005-09-22',
                'period_start'     => 2002,
                'period_end'       => 2010,
                // Archive.org — Angola banking reform radio interview
                'media_url'        => 'https://archive.org/download/radio-ecclesia-economia-angola/ecclesia_banca_angola_2005.mp3',
                'cover_image_url'  => 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=600&q=80',
                'summary'          => 'Entrevista radiofónica com economistas angolanos sobre os desafios de reconstruir o sistema bancário após o fim da guerra civil em 2002. Discute-se a hiperinflação dos anos 1990, a reforma do BNA, a introdução da supervisão bancária moderna e os esforços para reduzir a dolarização da economia.',
                'content'          => 'Com o fim da guerra civil em 2002, Angola enfrentou o enorme desafio de reconstruir as suas instituições financeiras. O sistema bancário era rudimentar, a inflação atingira 268% em 1999, e a dolarização informal era generalizada. Esta entrevista documenta o processo de reforma iniciado sob a governação do presidente José Eduardo dos Santos.',
                'views_count'      => 389,
                'likes_count'      => 31,
                'downloads_count'  => 56,
                'published_at'     => '2024-05-15',
                'created_by'       => $researcher?->id ?? $professor->id,
                'reviewed_by'      => $admin->id,
                'tags'             => ['kwanza', 'angola', 'independencia'],
            ],
            [
                'title'            => 'Lição de História: O Café Angolano e o Trabalho Forçado (1930-1960)',
                'author'           => 'Prof. René Pélissier',
                'institution'      => 'Université Paris-Nanterre',
                'category_id'      => $cats->get('economia-colonial'),
                'document_type'    => 'audio',
                'media_type'       => 'AUDIO',
                'academic_level'   => 'advanced',
                'access_level_id'  => 'jindungo',
                'publication_date' => '1982-05-10',
                'period_start'     => 1930,
                'period_end'       => 1962,
                // Archive.org — colonial Angola lecture
                'media_url'        => 'https://archive.org/download/angola-historia-economica/pelissier_cafe_contrato_1982.mp3',
                'cover_image_url'  => 'https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=600&q=80',
                'summary'          => 'Gravação histórica de uma lição do historiador René Pélissier sobre o sistema de trabalho forçado (contrato) nas plantações de café angolanas durante o Estado Novo português. Analisa as leis do trabalho indígena, as condições de vida dos trabalhadores e a resistência organizada que precedeu a luta de libertação.',
                'content'          => 'O "contrato" era um sistema de trabalho forçado legalizado pelo Estatuto do Indigenato português. Os africanos que não provassem ter emprego fixo ou terra própria eram obrigados a trabalhar nas fazendas de café, muitas vezes em condições próximas da escravidão. René Pélissier, na sua obra monumental sobre Angola, documentou extensamente este sistema e a sua importância para compreender o conflito colonial.',
                'views_count'      => 678,
                'likes_count'      => 55,
                'downloads_count'  => 89,
                'published_at'     => '2024-04-20',
                'created_by'       => $professor->id,
                'reviewed_by'      => $admin->id,
                'tags'             => ['cafe', 'colonialismo', 'angola'],
            ],
        ];

        // ── Inserir todos os documentos ──────────────────────────────────
        foreach (array_merge($videos, $audios) as $docData) {
            $docTags = $docData['tags'] ?? [];
            unset($docData['tags']);

            $docId = (string) Str::uuid();

            DB::table('documents')->insert(array_merge($docData, [
                'id'           => $docId,
                'slug'         => Str::slug($docData['title']) . '-' . Str::lower(Str::random(6)),
                'pdf_url'      => null,
                'status'       => 'published',
                'is_pinned'    => false,
                'created_at'   => now(),
                'updated_at'   => now(),
            ]));

            foreach ($docTags as $tagSlug) {
                $tagId = $tagIds->get($tagSlug);
                if ($tagId) {
                    DB::table('document_tags')->insert([
                        'document_id' => $docId,
                        'tag_id'      => $tagId,
                    ]);
                }
            }

            $label = strtoupper($docData['media_type']);
            $this->command->line("  [{$label}] {$docData['title']}");
        }

        $this->command->info('MediaDocumentSeeder: ' . count($videos) . ' vídeos e ' . count($audios) . ' áudios inseridos com sucesso.');
    }
}
