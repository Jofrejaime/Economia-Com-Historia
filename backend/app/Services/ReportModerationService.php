<?php

namespace App\Services;

use App\Events\Domain\Moderation\ModerationActionTaken;

class ReportModerationService
{
    // Sprint 18.9 (EDA) — não cria notificações diretamente; emite eventos de
    // domínio tratados pelo ModerationNotificationListener.
    public function __construct(
        private readonly ReportService $reportService,
    ) {}

    public function contentExists(string $contentType, string $contentId): bool
    {
        return $this->reportService->contentExists($contentType, $contentId);
    }

    public function hasPendingReport(string $reporterId, string $contentType, string $contentId): bool
    {
        return $this->reportService->hasPendingReport($reporterId, $contentType, $contentId);
    }

    public function flagContent(object $report): void
    {
        // Just flag the content
        $this->reportService->performHide($report->content_type, $report->content_id);
    }

    public function deleteContent(object $report): void
    {
        // Just delete the content
        $this->reportService->performDelete($report->content_type, $report->content_id);
    }

    public function warnUser(object $report): ?string
    {
        $ownerId = $this->reportService->getContentOwnerId($report->content_type, $report->content_id);

        // Notificação via evento (EDA) — o dono é notificado pelo
        // ModerationNotificationListener.
        ModerationActionTaken::dispatch($report->id, null, [
            'owner_id'     => $ownerId,
            'action'       => 'warn',
            'content_type' => $report->content_type,
            'reason'       => null,
        ]);

        return $ownerId;
    }

    public function dismissReport(object $report): void
    {
        // No action needed here for legacy compatibility, controller handles status 'actioned'
    }
}
