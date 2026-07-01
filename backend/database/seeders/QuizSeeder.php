<?php

namespace Database\Seeders;

use App\Enums\DocumentStatus;
use App\Enums\QuizStatus;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class QuizSeeder extends Seeder
{
    public function run(): void
    {
        $professor = DB::table('users')->where('role', 'professor')->first();
        $admin = DB::table('users')->where('role', 'admin')->first();

        if (!$professor || !$admin) {
            $this->command->warn('UserSeeder must run before QuizSeeder. Skipping quizzes.');
            return;
        }

        // Optionally link to a document category
        $industrializacao = DB::table('document_categories')->where('slug', 'industrializacao')->first();
        $comercio = DB::table('document_categories')->where('slug', 'comercio-atlantico')->first();
        $posIndep = DB::table('document_categories')->where('slug', 'politica-pos-independencia')->first();

        $quizzes = [
            // ──────── Quiz 1: Caminho de Ferro de Benguela ────────
            [
                'title' => 'Caminho de Ferro de Benguela',
                'module' => 'Módulo 3 — Industrialização',
                'description' => 'Teste os seus conhecimentos sobre a história e impacto do Caminho de Ferro de Benguela na economia colonial angolana.',
                'difficulty' => 'Básico',
                'base_points' => 100,
                'time_limit_secs' => 600,
                'access_level_id' => 'public',
                'is_featured' => true,
                'status' => QuizStatus::PUBLISHED->value,
                'category_id' => $industrializacao?->id,
                'created_by' => $professor->id,
                'published_at' => '2024-04-01',
                'attempts_count' => 45,
                'completions_count' => 38,
                'avg_score' => 72.50,
                'questions' => [
                    [
                        'question_order' => 1,
                        'title' => 'Em que ano foi inaugurado oficialmente o Caminho de Ferro de Benguela?',
                        'subtitle' => 'Considere a data de inauguração completa do trajecto.',
                        'module_label' => 'Cronologia',
                        'question_type' => 'multiple_choice',
                        'points' => 10,
                        'hint_title' => 'Dica Histórica',
                        'hint_quote' => '"A linha férrea de Benguela, uma das maiores obras de engenharia da África colonial, levou mais de duas décadas para ser concluída."',
                        'expert_name' => 'Prof. João Silva',
                        'expert_role' => 'Historiador Económico',
                        'reading_title' => null,
                        'reading_text' => null,
                        'options' => [
                            ['key' => 'A', 'text' => '1903', 'is_correct' => false, 'explanation' => '1903 foi o ano em que a construção foi iniciada por Robert Williams.'],
                            ['key' => 'B', 'text' => '1912', 'is_correct' => false, 'explanation' => 'Em 1912 a linha já alcançava o planalto central, mas ainda não estava completa.'],
                            ['key' => 'C', 'text' => '1929', 'is_correct' => true, 'explanation' => 'Correto! O Caminho de Ferro de Benguela foi inaugurado oficialmente em 1929, ligando o Lobito ao Katanga.'],
                            ['key' => 'D', 'text' => '1931', 'is_correct' => false, 'explanation' => '1931 foi quando os primeiros comboios de carga começaram a operar regularmente.'],
                        ],
                    ],
                    [
                        'question_order' => 2,
                        'title' => 'Qual era o principal porto de partida do Caminho de Ferro de Benguela?',
                        'subtitle' => null,
                        'module_label' => 'Geografia',
                        'question_type' => 'multiple_choice',
                        'points' => 10,
                        'hint_title' => null,
                        'hint_quote' => null,
                        'expert_name' => null,
                        'expert_role' => null,
                        'reading_title' => null,
                        'reading_text' => null,
                        'options' => [
                            ['key' => 'A', 'text' => 'Luanda', 'is_correct' => false, 'explanation' => 'Luanda tinha o seu próprio sistema ferroviário (Caminho de Ferro de Luanda).'],
                            ['key' => 'B', 'text' => 'Lobito', 'is_correct' => true, 'explanation' => 'Correto! O porto do Lobito era o ponto de partida da linha férrea de Benguela.'],
                            ['key' => 'C', 'text' => 'Benguela', 'is_correct' => false, 'explanation' => 'Embora a linha se chame "de Benguela", o porto principal era no Lobito, cidade vizinha.'],
                            ['key' => 'D', 'text' => 'Namibe', 'is_correct' => false, 'explanation' => 'Namibe (ex-Moçâmedes) tinha o seu próprio caminho de ferro para o interior.'],
                        ],
                    ],
                    [
                        'question_order' => 3,
                        'title' => 'Quem foi o empresário que iniciou a construção do Caminho de Ferro de Benguela?',
                        'subtitle' => null,
                        'module_label' => 'Personalidades',
                        'question_type' => 'multiple_choice',
                        'points' => 10,
                        'hint_title' => 'Dica',
                        'hint_quote' => '"Era um empresário escocês com interesses mineiros no Katanga."',
                        'expert_name' => null,
                        'expert_role' => null,
                        'reading_title' => null,
                        'reading_text' => null,
                        'options' => [
                            ['key' => 'A', 'text' => 'Cecil Rhodes', 'is_correct' => false, 'explanation' => 'Cecil Rhodes estava ligado à exploração mineira na África do Sul e Rodésia.'],
                            ['key' => 'B', 'text' => 'Robert Williams', 'is_correct' => true, 'explanation' => 'Correto! Robert Williams, engenheiro e empresário escocês, obteve a concessão em 1902.'],
                            ['key' => 'C', 'text' => 'Norton de Matos', 'is_correct' => false, 'explanation' => 'Norton de Matos foi Governador-Geral de Angola, não o construtor da linha.'],
                            ['key' => 'D', 'text' => 'Henrique de Paiva Couceiro', 'is_correct' => false, 'explanation' => 'Paiva Couceiro foi Governador de Angola no início do século XX.'],
                        ],
                    ],
                    [
                        'question_order' => 4,
                        'title' => 'Qual era a extensão aproximada do Caminho de Ferro de Benguela?',
                        'subtitle' => null,
                        'module_label' => 'Dados Técnicos',
                        'question_type' => 'multiple_choice',
                        'points' => 10,
                        'hint_title' => null,
                        'hint_quote' => null,
                        'expert_name' => null,
                        'expert_role' => null,
                        'reading_title' => null,
                        'reading_text' => null,
                        'options' => [
                            ['key' => 'A', 'text' => '800 km', 'is_correct' => false, 'explanation' => 'A linha era significativamente mais longa.'],
                            ['key' => 'B', 'text' => '1.344 km', 'is_correct' => true, 'explanation' => 'Correto! A linha tinha aproximadamente 1.344 km do Lobito à fronteira com o Congo.'],
                            ['key' => 'C', 'text' => '2.100 km', 'is_correct' => false, 'explanation' => 'Este valor é excessivo para o trajecto Lobito-fronteira.'],
                            ['key' => 'D', 'text' => '500 km', 'is_correct' => false, 'explanation' => '500 km cobriria apenas uma fração do trajecto total.'],
                        ],
                    ],
                    [
                        'question_order' => 5,
                        'title' => 'Qual era o principal produto transportado pelo Caminho de Ferro de Benguela?',
                        'subtitle' => 'Produto mineral exportado pelo corredor Lobito-Katanga.',
                        'module_label' => 'Economia',
                        'question_type' => 'multiple_choice',
                        'points' => 10,
                        'hint_title' => 'Contexto',
                        'hint_quote' => '"O Katanga, no Congo Belga, era conhecido mundialmente pela riqueza dos seus minérios."',
                        'expert_name' => null,
                        'expert_role' => null,
                        'reading_title' => null,
                        'reading_text' => null,
                        'options' => [
                            ['key' => 'A', 'text' => 'Diamantes', 'is_correct' => false, 'explanation' => 'Os diamantes eram extraídos nas Lundas, não transportados por esta linha.'],
                            ['key' => 'B', 'text' => 'Petróleo', 'is_correct' => false, 'explanation' => 'O petróleo é transportado por oleodutos, não por via férrea.'],
                            ['key' => 'C', 'text' => 'Cobre', 'is_correct' => true, 'explanation' => 'Correto! O cobre do Katanga era o principal produto transportado para exportação pelo porto do Lobito.'],
                            ['key' => 'D', 'text' => 'Café', 'is_correct' => false, 'explanation' => 'O café era produzido no norte de Angola, não ao longo desta rota.'],
                        ],
                    ],
                ],
            ],

            // ──────── Quiz 2: Comércio de Escravos no Atlântico ────────
            [
                'title' => 'O Comércio de Escravos no Atlântico',
                'module' => 'Módulo 2 — Comércio Atlântico',
                'description' => 'Avalie os seus conhecimentos sobre o tráfico transatlântico de escravos e o seu impacto na economia angolana.',
                'difficulty' => 'Intermédio',
                'base_points' => 150,
                'time_limit_secs' => 900,
                'access_level_id' => 'public',
                'is_featured' => true,
                'status' => QuizStatus::PUBLISHED->value,
                'category_id' => $comercio?->id,
                'created_by' => $professor->id,
                'published_at' => '2024-05-01',
                'attempts_count' => 32,
                'completions_count' => 25,
                'avg_score' => 65.80,
                'questions' => [
                    [
                        'question_order' => 1,
                        'title' => 'Quantas pessoas se estima que foram embarcadas forçosamente a partir dos portos angolanos entre 1600 e 1850?',
                        'subtitle' => null,
                        'module_label' => 'Dados Demográficos',
                        'question_type' => 'multiple_choice',
                        'points' => 15,
                        'hint_title' => null,
                        'hint_quote' => null,
                        'expert_name' => 'Dra. Maria Neves',
                        'expert_role' => 'Investigadora em Economia Africana',
                        'reading_title' => null,
                        'reading_text' => null,
                        'options' => [
                            ['key' => 'A', 'text' => 'Cerca de 500.000', 'is_correct' => false, 'explanation' => 'Este número é inferior à realidade documentada.'],
                            ['key' => 'B', 'text' => 'Mais de 3 milhões', 'is_correct' => true, 'explanation' => 'Correto! Estima-se que mais de 3 milhões de pessoas foram embarcadas a partir de portos angolanos.'],
                            ['key' => 'C', 'text' => 'Cerca de 1 milhão', 'is_correct' => false, 'explanation' => 'Angola foi o maior ponto de embarque; o número era significativamente superior.'],
                            ['key' => 'D', 'text' => 'Mais de 10 milhões', 'is_correct' => false, 'explanation' => '10 milhões é uma estimativa para todo o continente africano.'],
                        ],
                    ],
                    [
                        'question_order' => 2,
                        'title' => 'Qual era o principal destino dos escravos embarcados em Luanda?',
                        'subtitle' => null,
                        'module_label' => 'Rotas Atlânticas',
                        'question_type' => 'multiple_choice',
                        'points' => 15,
                        'hint_title' => null,
                        'hint_quote' => null,
                        'expert_name' => null,
                        'expert_role' => null,
                        'reading_title' => null,
                        'reading_text' => null,
                        'options' => [
                            ['key' => 'A', 'text' => 'Brasil', 'is_correct' => true, 'explanation' => 'Correto! O Brasil era o principal destino, com destaque para o Rio de Janeiro e a Bahia.'],
                            ['key' => 'B', 'text' => 'Cuba', 'is_correct' => false, 'explanation' => 'Cuba recebia escravos, mas não era o destino principal de Luanda.'],
                            ['key' => 'C', 'text' => 'Estados Unidos', 'is_correct' => false, 'explanation' => 'Os EUA recebiam escravos principalmente da Costa do Ouro e Senegâmbia.'],
                            ['key' => 'D', 'text' => 'Portugal', 'is_correct' => false, 'explanation' => 'Portugal recebia poucos escravos directamente; as colónias americanas eram o destino.'],
                        ],
                    ],
                    [
                        'question_order' => 3,
                        'title' => 'Qual grupo étnico angolano era conhecido por organizar caravanas comerciais de longa distância?',
                        'subtitle' => null,
                        'module_label' => 'Actores Comerciais',
                        'question_type' => 'multiple_choice',
                        'points' => 15,
                        'hint_title' => null,
                        'hint_quote' => null,
                        'expert_name' => null,
                        'expert_role' => null,
                        'reading_title' => null,
                        'reading_text' => null,
                        'options' => [
                            ['key' => 'A', 'text' => 'Bakongo', 'is_correct' => false, 'explanation' => 'Os Bakongo eram mais activos no comércio do norte de Angola.'],
                            ['key' => 'B', 'text' => 'Ovimbundu', 'is_correct' => true, 'explanation' => 'Correto! Os Ovimbundu do planalto central eram os maiores organizadores de caravanas comerciais.'],
                            ['key' => 'C', 'text' => 'Mbundu', 'is_correct' => false, 'explanation' => 'Os Mbundu eram importantes no comércio em torno de Luanda.'],
                            ['key' => 'D', 'text' => 'Herero', 'is_correct' => false, 'explanation' => 'Os Herero eram predominantemente pastoralistas no sul de Angola.'],
                        ],
                    ],
                    [
                        'question_order' => 4,
                        'title' => 'Em que ano Portugal aboliu oficialmente o tráfico de escravos?',
                        'subtitle' => null,
                        'module_label' => 'Legislação',
                        'question_type' => 'multiple_choice',
                        'points' => 15,
                        'hint_title' => 'Contexto',
                        'hint_quote' => '"A pressão britânica foi determinante para a abolição formal do tráfico."',
                        'expert_name' => null,
                        'expert_role' => null,
                        'reading_title' => null,
                        'reading_text' => null,
                        'options' => [
                            ['key' => 'A', 'text' => '1836', 'is_correct' => false, 'explanation' => 'Em 1836 foi proibido o tráfico para norte do equador, mas não completamente.'],
                            ['key' => 'B', 'text' => '1858', 'is_correct' => false, 'explanation' => '1858 decretou o fim da escravatura num prazo de 20 anos.'],
                            ['key' => 'C', 'text' => '1869', 'is_correct' => true, 'explanation' => 'Correto! Em 1869, o decreto aboliu legalmente a escravatura em todos os territórios portugueses.'],
                            ['key' => 'D', 'text' => '1878', 'is_correct' => false, 'explanation' => '1878 era o prazo final, mas a abolição formal ocorreu em 1869.'],
                        ],
                    ],
                    [
                        'question_order' => 5,
                        'title' => 'Como se chamavam os comerciantes intermediários que operavam entre o interior e os portos costeiros?',
                        'subtitle' => null,
                        'module_label' => 'Vocabulário Histórico',
                        'question_type' => 'multiple_choice',
                        'points' => 15,
                        'hint_title' => null,
                        'hint_quote' => null,
                        'expert_name' => null,
                        'expert_role' => null,
                        'reading_title' => null,
                        'reading_text' => null,
                        'options' => [
                            ['key' => 'A', 'text' => 'Pombeiros', 'is_correct' => true, 'explanation' => 'Correto! Os pombeiros eram comerciantes africanos que serviam de intermediários entre o interior e os portos.'],
                            ['key' => 'B', 'text' => 'Sobas', 'is_correct' => false, 'explanation' => 'Sobas eram chefes tradicionais, não comerciantes itinerantes.'],
                            ['key' => 'C', 'text' => 'Funantes', 'is_correct' => false, 'explanation' => 'Funantes era um termo usado na Guiné-Bissau, não em Angola.'],
                            ['key' => 'D', 'text' => 'Jagas', 'is_correct' => false, 'explanation' => 'Jagas referia-se a grupos guerreiros invasores, não a comerciantes.'],
                        ],
                    ],
                ],
            ],

            // ──────── Quiz 3: Economia Pós-Independência ────────
            [
                'title' => 'Angola Pós-Independência: Economia e Transição',
                'module' => 'Módulo 4 — Pós-Independência',
                'description' => 'Desafie-se com questões sobre a evolução económica de Angola desde a independência até aos dias de hoje.',
                'difficulty' => 'Avançado',
                'base_points' => 200,
                'time_limit_secs' => 1200,
                'access_level_id' => 'public',
                'is_featured' => false,
                'status' => QuizStatus::PUBLISHED->value,
                'category_id' => $posIndep?->id,
                'created_by' => $professor->id,
                'published_at' => '2024-07-01',
                'attempts_count' => 18,
                'completions_count' => 12,
                'avg_score' => 58.30,
                'questions' => [
                    [
                        'question_order' => 1,
                        'title' => 'Qual foi o modelo económico adoptado por Angola após a independência em 1975?',
                        'subtitle' => null,
                        'module_label' => 'Sistemas Económicos',
                        'question_type' => 'multiple_choice',
                        'points' => 20,
                        'hint_title' => null,
                        'hint_quote' => null,
                        'expert_name' => null,
                        'expert_role' => null,
                        'reading_title' => 'Contexto Histórico',
                        'reading_text' => 'A independência de Angola ocorreu a 11 de Novembro de 1975. O MPLA, apoiado pela União Soviética e Cuba, assumiu o poder em Luanda e definiu a orientação ideológica do novo Estado.',
                        'options' => [
                            ['key' => 'A', 'text' => 'Economia de mercado liberal', 'is_correct' => false, 'explanation' => 'Angola não adoptou o modelo liberal após a independência.'],
                            ['key' => 'B', 'text' => 'Economia planificada de inspiração marxista-leninista', 'is_correct' => true, 'explanation' => 'Correto! O MPLA adoptou um modelo económico socialista de inspiração soviética.'],
                            ['key' => 'C', 'text' => 'Economia mista social-democrata', 'is_correct' => false, 'explanation' => 'O modelo inicial era mais radical do que uma economia mista.'],
                            ['key' => 'D', 'text' => 'Capitalismo de Estado', 'is_correct' => false, 'explanation' => 'O capitalismo de Estado veio mais tarde, na transição dos anos 1990.'],
                        ],
                    ],
                    [
                        'question_order' => 2,
                        'title' => 'Em que ano foi introduzida a moeda Kwanza em Angola?',
                        'subtitle' => null,
                        'module_label' => 'Política Monetária',
                        'question_type' => 'multiple_choice',
                        'points' => 20,
                        'hint_title' => null,
                        'hint_quote' => null,
                        'expert_name' => null,
                        'expert_role' => null,
                        'reading_title' => null,
                        'reading_text' => null,
                        'options' => [
                            ['key' => 'A', 'text' => '1975', 'is_correct' => false, 'explanation' => 'Em 1975 ainda circulava o escudo angolano.'],
                            ['key' => 'B', 'text' => '1977', 'is_correct' => true, 'explanation' => 'Correto! O Kwanza foi introduzido a 8 de janeiro de 1977.'],
                            ['key' => 'C', 'text' => '1980', 'is_correct' => false, 'explanation' => 'A mudança ocorreu dois anos após a independência.'],
                            ['key' => 'D', 'text' => '1992', 'is_correct' => false, 'explanation' => 'Em 1992 houve uma reforma monetária (Novo Kwanza), mas não a introdução original.'],
                        ],
                    ],
                    [
                        'question_order' => 3,
                        'title' => 'Qual empresa estatal foi criada para gerir o sector petrolífero angolano?',
                        'subtitle' => null,
                        'module_label' => 'Sector Petrolífero',
                        'question_type' => 'multiple_choice',
                        'points' => 20,
                        'hint_title' => null,
                        'hint_quote' => null,
                        'expert_name' => null,
                        'expert_role' => null,
                        'reading_title' => null,
                        'reading_text' => null,
                        'options' => [
                            ['key' => 'A', 'text' => 'Petrangol', 'is_correct' => false, 'explanation' => 'A Petrangol existia no período colonial; foi nacionalizada.'],
                            ['key' => 'B', 'text' => 'Sonangol', 'is_correct' => true, 'explanation' => 'Correto! A Sonangol foi criada em 1976 para gerir o sector petrolífero nacional.'],
                            ['key' => 'C', 'text' => 'Endiama', 'is_correct' => false, 'explanation' => 'A Endiama é a empresa nacional de diamantes, não de petróleo.'],
                            ['key' => 'D', 'text' => 'Taag', 'is_correct' => false, 'explanation' => 'A TAAG é a companhia aérea nacional de Angola.'],
                        ],
                    ],
                    [
                        'question_order' => 4,
                        'title' => 'Qual a percentagem aproximada das exportações angolanas que o petróleo representava no pico (2008)?',
                        'subtitle' => null,
                        'module_label' => 'Dependência Petrolífera',
                        'question_type' => 'multiple_choice',
                        'points' => 20,
                        'hint_title' => null,
                        'hint_quote' => null,
                        'expert_name' => null,
                        'expert_role' => null,
                        'reading_title' => null,
                        'reading_text' => null,
                        'options' => [
                            ['key' => 'A', 'text' => 'Cerca de 50%', 'is_correct' => false, 'explanation' => 'A dependência era muito mais elevada.'],
                            ['key' => 'B', 'text' => 'Cerca de 70%', 'is_correct' => false, 'explanation' => 'Ainda abaixo da realidade.'],
                            ['key' => 'C', 'text' => 'Mais de 90%', 'is_correct' => true, 'explanation' => 'Correto! O petróleo representava mais de 90% das exportações e 75% das receitas fiscais.'],
                            ['key' => 'D', 'text' => 'Cerca de 60%', 'is_correct' => false, 'explanation' => 'A dependência era significativamente superior a 60%.'],
                        ],
                    ],
                    [
                        'question_order' => 5,
                        'title' => 'Que evento internacional acelerou a transição de Angola para a economia de mercado?',
                        'subtitle' => null,
                        'module_label' => 'Contexto Internacional',
                        'question_type' => 'multiple_choice',
                        'points' => 20,
                        'hint_title' => 'Contexto Geopolítico',
                        'hint_quote' => '"O colapso do bloco soviético teve consequências profundas para os estados africanos alinhados com Moscovo."',
                        'expert_name' => null,
                        'expert_role' => null,
                        'reading_title' => null,
                        'reading_text' => null,
                        'options' => [
                            ['key' => 'A', 'text' => 'A crise petrolífera de 1973', 'is_correct' => false, 'explanation' => 'A crise de 1973 beneficiou os produtores de petróleo como Angola.'],
                            ['key' => 'B', 'text' => 'A queda do Muro de Berlim (1989)', 'is_correct' => true, 'explanation' => 'Correto! O fim da Guerra Fria e o colapso do bloco soviético forçaram a reorientação económica.'],
                            ['key' => 'C', 'text' => 'A criação da União Europeia (1993)', 'is_correct' => false, 'explanation' => 'A UE teve influência limitada na política económica angolana.'],
                            ['key' => 'D', 'text' => 'Os ataques de 11 de Setembro (2001)', 'is_correct' => false, 'explanation' => 'O 11 de Setembro não teve impacto directo na política económica angolana.'],
                        ],
                    ],
                ],
            ],
        ];

        foreach ($quizzes as $quizData) {
            $questions = $quizData['questions'];
            unset($quizData['questions']);

            $quizId = (string) Str::uuid();
            $quizData['id'] = $quizId;
            $quizData['created_at'] = now();
            $quizData['updated_at'] = now();

            DB::table('quizzes')->insert($quizData);

            foreach ($questions as $questionData) {
                $options = $questionData['options'];
                unset($questionData['options']);

                $questionId = (string) Str::uuid();
                $questionData['id'] = $questionId;
                $questionData['quiz_id'] = $quizId;
                $questionData['created_at'] = now();

                DB::table('quiz_questions')->insert($questionData);

                foreach ($options as $option) {
                    DB::table('quiz_options')->insert([
                        'id' => (string) Str::uuid(),
                        'question_id' => $questionId,
                        'option_key' => $option['key'],
                        'text' => $option['text'],
                        'is_correct' => $option['is_correct'],
                        'explanation' => $option['explanation'],
                    ]);
                }
            }
        }

        // ─── N:N quiz_documents — 3 Cenários da Sprint 17 ────────────────────────
        // Cenário 1: Documento -> Quiz (1:1)
        // O documento de comércio está associado a exatamente 1 quiz (quizEscravos)
        // Cenário 2: Documento -> Quiz, Quiz (1:2 - um documento associado a dois quizzes)
        // O primeiro documento de industrialização estará associado a quizCFB e também a quizEscravos
        // Cenário 3: Quiz independente (sem documentos)
        // O quiz de Pós-Independência não terá nenhuma associação em quiz_documents

        $quizCFB      = DB::table('quizzes')->where('title', 'Caminho de Ferro de Benguela')->first();
        $quizEscravos = DB::table('quizzes')->where('title', 'O Comércio de Escravos no Atlântico')->first();

        $docIndustrializacao1 = null;
        if ($industrializacao) {
            $docsIndustrializacao = DB::table('documents')
                ->where('category_id', $industrializacao->id)
                ->where('status', DocumentStatus::PUBLISHED->value)
                ->orderBy('created_at')
                ->take(2)
                ->pluck('id');

            if ($docsIndustrializacao->isNotEmpty() && $quizCFB) {
                $docIndustrializacao1 = $docsIndustrializacao[0];
                foreach ($docsIndustrializacao as $sort => $docId) {
                    DB::table('quiz_documents')->insertOrIgnore([
                        'quiz_id'     => $quizCFB->id,
                        'document_id' => $docId,
                        'sort_order'  => $sort,
                        'created_at'  => now(),
                        'updated_at'  => now(),
                    ]);
                }
            }
        }

        if ($comercio && $quizEscravos) {
            $docComercio = DB::table('documents')
                ->where('category_id', $comercio->id)
                ->where('status', DocumentStatus::PUBLISHED->value)
                ->orderBy('created_at')
                ->value('id');

            if ($docComercio) {
                // Link Cenário 1 (docComercio -> quizEscravos)
                DB::table('quiz_documents')->insertOrIgnore([
                    'quiz_id'     => $quizEscravos->id,
                    'document_id' => $docComercio,
                    'sort_order'  => 0,
                    'created_at'  => now(),
                    'updated_at'  => now(),
                ]);
            }
        }

        // Link Cenário 2 (docIndustrializacao1 -> quizEscravos também)
        if ($docIndustrializacao1 && $quizEscravos) {
            DB::table('quiz_documents')->insertOrIgnore([
                'quiz_id'     => $quizEscravos->id,
                'document_id' => $docIndustrializacao1,
                'sort_order'  => 1, // sort_order subsequente para o quizEscravos
                'created_at'  => now(),
                'updated_at'  => now(),
            ]);
        }
    }
}
