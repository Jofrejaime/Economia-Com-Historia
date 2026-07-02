<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class QuizDocumentSeeder extends Seeder
{
    public function run(): void
    {
        $quizzes = DB::table('quizzes')
            ->where('status', 'published')
            ->whereNotNull('category_id')
            ->get(['id', 'category_id']);

        $existing = DB::table('quiz_documents')
            ->get(['quiz_id', 'document_id'])
            ->map(fn ($r) => $r->quiz_id . '|' . $r->document_id)
            ->flip();

        $inserts = [];

        foreach ($quizzes as $quiz) {
            $docs = DB::table('documents')
                ->where('status', 'published')
                ->where('category_id', $quiz->category_id)
                ->orderBy('created_at')
                ->limit(4)
                ->get(['id']);

            foreach ($docs as $sort => $doc) {
                $key = $quiz->id . '|' . $doc->id;
                if ($existing->has($key)) {
                    continue;
                }
                $inserts[] = [
                    'quiz_id'     => $quiz->id,
                    'document_id' => $doc->id,
                    'sort_order'  => $sort,
                    'created_at'  => now(),
                    'updated_at'  => now(),
                ];
            }
        }

        if (!empty($inserts)) {
            DB::table('quiz_documents')->insert($inserts);
        }

        $this->command->info('QuizDocumentSeeder: ' . count($inserts) . ' ligações criadas.');
    }
}
