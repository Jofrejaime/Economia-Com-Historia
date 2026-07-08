<?php

namespace App\Services;

use App\Enums\DocumentStatus;
use Illuminate\Support\Facades\DB;

class DashboardService
{
    public function __construct(
        private readonly DocumentStatisticsService     $documentStats,
        private readonly SubscriptionStatisticsService $subscriptionStats,
        private readonly CategoryStatisticsService     $categoryStats,
    ) {}

    public function summary(): array
    {
        $today = now()->toDateString();

        return [
            'users' => [
                'total'     => DB::table('users')->count(),
                'active'    => DB::table('users')->where('is_active', true)->where('email_verified', true)->count(),
                'new_today' => DB::table('users')->whereDate('created_at', $today)->count(),
                'admins'    => DB::table('users')->where('role', 'admin')->count(),
            ],
            'documents'     => $this->documentStats->summary(),
            'categories'    => $this->categoryStats->summary(),
            'subscriptions' => $this->subscriptionStats->summary(),
            'community' => [
                'topics_open'     => DB::table('discussion_topics')->where('status', 'open')->count(),
                'topics_locked'   => DB::table('discussion_topics')->where('status', 'locked')->count(),
                'topics_archived' => DB::table('discussion_topics')->where('status', 'archived')->count(),
                'replies'         => DB::table('topic_replies')->count(),
            ],
            'moderation' => [
                'reports_pending'   => DB::table('content_reports')->where('status', 'pending')->count(),
                'reports_resolved'  => DB::table('content_reports')->where('status', 'resolved')->count(),
                'reports_dismissed' => DB::table('content_reports')->where('status', 'dismissed')->count(),
            ],
            'recent_activity' => $this->buildRecentActivity(),
        ];
    }

    private function buildRecentActivity(): array
    {
        $activities = [];

        $documents = DB::table('documents as d')
            ->orderByDesc('d.created_at')
            ->limit(1)
            ->get();

        foreach ($documents as $document) {
            $activities[] = [
                'icon'        => 'success',
                'title'       => 'Documento actualizado',
                'description' => $document->title.' foi registado com estado '.$document->status.'.',
                'time'        => $document->created_at,
                'type'        => 'badge',
                'badgeText'   => strtoupper($document->status),
                'badgeClass'  => $document->status === DocumentStatus::PUBLISHED->value ? 'success' : 'neutral',
            ];
        }

        $topics = DB::table('discussion_topics as dt')
            ->leftJoin('user_profiles as up', 'up.user_id', '=', 'dt.author_id')
            ->orderByDesc('dt.created_at')
            ->limit(1)
            ->get();

        foreach ($topics as $topic) {
            $activities[] = [
                'icon'          => 'warning',
                'title'         => 'Novo tópico no fórum',
                'description'   => $topic->title.' foi criado por '.($topic->display_name ?? 'Utilizador').'.',
                'time'          => $topic->created_at,
                'type'          => 'button',
                'buttonText'    => 'Ver discussão',
                'route'         => '/admin/dashboard/comunidade',
                'buttonOutline' => true,
            ];
        }

        $users = DB::table('users as u')
            ->leftJoin('user_profiles as up', 'up.user_id', '=', 'u.id')
            ->orderByDesc('u.created_at')
            ->limit(1)
            ->get();

        foreach ($users as $user) {
            $activities[] = [
                'icon'        => 'neutral',
                'title'       => 'Novo utilizador registado',
                'description' => ($user->display_name ?? $user->email).' juntou-se ao sistema.',
                'time'        => $user->created_at,
                'type'        => 'badge',
                'badgeText'   => 'PROCESSADO',
                'badgeClass'  => 'neutral',
            ];
        }

        return array_slice($activities, 0, 4);
    }
}
