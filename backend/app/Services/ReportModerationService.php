<?php

namespace App\Services;

class ReportModerationService
{
    public function __construct(
        private readonly ReportService $reportService,
        private readonly NotificationService $notificationService
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
        if ($ownerId) {
            $owner = \App\Models\User::find($ownerId);
            if ($owner) {
                $this->notificationService->send(
                    $owner,
                    'user_warning',
                    'Aviso de Moderação',
                    "Você recebeu um aviso de moderação relativo ao seu conteúdo de tipo {$report->content_type}.",
                    $report->id,
                    'report'
                );
            }
        }
        return $ownerId;
    }

    public function dismissReport(object $report): void
    {
        // No action needed here for legacy compatibility, controller handles status 'actioned'
    }
}
