<?php

namespace App\Services;

use Illuminate\Support\Facades\DB;

class ReportModerationService
{
    /**
     * Verify if content exists based on type and ID.
     */
    public function contentExists(string $contentType, string $contentId): bool
    {
        return match ($contentType) {
            'document' => DB::table('documents')->where('id', $contentId)->exists(),
            'topic' => DB::table('discussion_topics')->where('id', $contentId)->exists(),
            'reply' => DB::table('topic_replies')->where('id', $contentId)->exists(),
            'user' => DB::table('users')->where('id', $contentId)->exists(),
            default => false,
        };
    }

    /**
     * Check if user has already reported this content with pending status.
     */
    public function hasPendingReport(string $reporterId, string $contentType, string $contentId): bool
    {
        return DB::table('content_reports')
            ->where('reporter_id', $reporterId)
            ->where('content_type', $contentType)
            ->where('content_id', $contentId)
            ->where('status', 'pending')
            ->exists();
    }

    /**
     * Flag content as inappropriate.
     */
    public function flagContent(object $report): void
    {
        match ($report->content_type) {
            'document' => DB::table('documents')
                ->where('id', $report->content_id)
                ->update(['status' => 'flagged', 'updated_at' => now()]),
            'topic' => DB::table('discussion_topics')
                ->where('id', $report->content_id)
                ->update(['status' => 'flagged', 'updated_at' => now()]),
            'reply' => DB::table('topic_replies')
                ->where('id', $report->content_id)
                ->update(['is_flagged' => true, 'updated_at' => now()]),
            default => null,
        };
    }

    /**
     * Delete reported content.
     */
    public function deleteContent(object $report): void
    {
        match ($report->content_type) {
            'document' => DB::table('documents')
                ->where('id', $report->content_id)
                ->delete(),
            'topic' => DB::table('discussion_topics')
                ->where('id', $report->content_id)
                ->delete(),
            'reply' => DB::table('topic_replies')
                ->where('id', $report->content_id)
                ->delete(),
            'user' => DB::table('users')
                ->where('id', $report->content_id)
                ->update(['is_active' => false]),
            default => null,
        };
    }

    /**
     * Warn content author/creator.
     */
    public function warnUser(object $report): ?string
    {
        $userId = match ($report->content_type) {
            'document' => DB::table('documents')
                ->where('id', $report->content_id)
                ->value('created_by'),
            'topic' => DB::table('discussion_topics')
                ->where('id', $report->content_id)
                ->value('author_id'),
            'reply' => DB::table('topic_replies')
                ->where('id', $report->content_id)
                ->value('author_id'),
            'user' => $report->content_id,
            default => null,
        };

        return $userId;
    }

    /**
     * Dismiss report (no action taken).
     */
    public function dismissReport(object $report): void
    {
        // Report status is already updated to 'actioned' in controller
        // This method is here for consistency and future expansion
    }
}
