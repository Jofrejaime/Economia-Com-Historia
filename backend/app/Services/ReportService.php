<?php

namespace App\Services;

use App\Events\Domain\Moderation\ModerationActionTaken;
use App\Events\Domain\Moderation\ReportResolved;
use App\Models\Report;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;

class ReportService
{
    // Sprint 18.9 (EDA) — este service atualiza a BD e emite eventos de domínio.
    // Não cria notificações diretamente; o ModerationNotificationListener trata
    // de avisar o autor da denúncia e o dono do conteúdo.

    public function list(array $filters = [], ?User $currentUser = null)
    {
        $query = Report::query()
            ->with(['reporter.profile', 'reviewedBy.profile'])
            ->orderByDesc('created_at');

        if ($currentUser && $currentUser->role !== 'admin') {
            $query->where('reporter_id', $currentUser->id);
        }

        if (isset($filters['status'])) {
            $query->where('status', $filters['status']);
        }

        if (isset($filters['content_type'])) {
            $query->where('content_type', $filters['content_type']);
        }

        if (isset($filters['reporter_id'])) {
            $query->where('reporter_id', $filters['reporter_id']);
        }

        if (isset($filters['search'])) {
            $search = $filters['search'];
            $query->where(function ($q) use ($search) {
                $q->where('description', 'like', "%{$search}%")
                  ->orWhere('reason', 'like', "%{$search}%")
                  ->orWhere('content_type', 'like', "%{$search}%");
            });
        }

        return $query->paginate($filters['per_page'] ?? 15);
    }

    public function find(string $id, ?User $currentUser = null): ?Report
    {
        $report = Report::with(['reporter.profile', 'reviewedBy.profile'])->find($id);
        if (!$report) {
            return null;
        }

        if ($currentUser && $currentUser->role !== 'admin' && $report->reporter_id !== $currentUser->id) {
            throw new \Illuminate\Auth\Access\AuthorizationException('Forbidden.');
        }

        return $report;
    }

    public function create(array $data, User $reporter): Report
    {
        $contentType = $data['content_type'];
        $contentId = $data['content_id'];

        if (!$this->contentExists($contentType, $contentId)) {
            throw new \Illuminate\Database\Eloquent\ModelNotFoundException('The specified content does not exist.');
        }

        if ($this->hasPendingReport($reporter->id, $contentType, $contentId)) {
            throw new \DomainException('You already have a pending report for this content.', 409);
        }

        return Report::create([
            'id'           => (string) Str::uuid(),
            'reporter_id'  => $reporter->id,
            'content_type' => $contentType,
            'content_id'   => $contentId,
            'reason'       => $data['reason'],
            'description'  => $data['description'] ?? null,
            'status'       => 'pending',
            'created_at'   => now(),
        ]);
    }

    public function review(string $id, array $data, User $moderator): Report
    {
        $report = Report::find($id);
        if (!$report) {
            throw new \Illuminate\Database\Eloquent\ModelNotFoundException('Report not found.');
        }

        $report->update([
            'status'       => $data['status'],
            'reviewed_by'  => $moderator->id,
            'reviewed_at'  => now(),
            'action_taken' => $data['action_taken'] ?? null,
        ]);

        $this->notifyReporter($report, ($data['status'] ?? '') !== 'dismissed', $moderator);

        Log::info('Revisão de denúncia', [
            'admin_id'    => $moderator->id,
            'report_id'   => $report->id,
            'new_values'  => ['status' => $data['status']],
        ]);

        return $report;
    }

    /**
     * Notifica o autor da denúncia sobre o desfecho — antes só o dono do
     * conteúdo era avisado das sanções; quem denunciou ficava sem retorno.
     */
    private function notifyReporter(Report $report, bool $actionTaken, User $moderator): void
    {
        // Notificação via evento (EDA) — as guardas (self, inexistente) ficam
        // no ModerationNotificationListener.
        ReportResolved::dispatch($report->id, $moderator->id, [
            'reporter_id'  => $report->reporter_id,
            'action_taken' => $actionTaken,
        ]);
    }

    /** Emite a notificação (via evento) ao dono do conteúdo alvo de uma ação. */
    private function notifyContentOwner(Report $report, string $action, ?string $ownerId, User $moderator, ?string $reason): void
    {
        if ($ownerId === null) {
            return;
        }

        ModerationActionTaken::dispatch($report->id, $moderator->id, [
            'owner_id'     => $ownerId,
            'action'       => $action,
            'content_type' => $report->content_type,
            'reason'       => $reason,
        ]);
    }

    public function dismiss(string $id, ?string $reason, User $moderator): Report
    {
        $report = Report::find($id);
        if (!$report) {
            throw new \Illuminate\Database\Eloquent\ModelNotFoundException('Report not found.');
        }

        DB::transaction(function () use ($report, $reason, $moderator) {
            $report->update([
                'status'       => 'dismissed',
                'reviewed_by'  => $moderator->id,
                'reviewed_at'  => now(),
                'action_taken' => 'Dismissed: ' . ($reason ?? 'No action taken.'),
            ]);

            $this->notifyReporter($report, false, $moderator);

            Log::info('Denúncia arquivada (dismiss)', [
                'admin_id'  => $moderator->id,
                'report_id' => $report->id,
                'reason'    => $reason,
            ]);
        });

        return $report->fresh();
    }

    public function warnUser(string $id, ?string $reason, User $moderator): Report
    {
        $report = Report::find($id);
        if (!$report) {
            throw new \Illuminate\Database\Eloquent\ModelNotFoundException('Report not found.');
        }

        return DB::transaction(function () use ($report, $reason, $moderator) {
            $report->update([
                'status'       => 'resolved',
                'reviewed_by'  => $moderator->id,
                'reviewed_at'  => now(),
                'action_taken' => 'Warning sent: ' . ($reason ?? 'Behave properly.'),
            ]);

            $ownerId = $this->getContentOwnerId($report->content_type, $report->content_id);
            $this->notifyContentOwner($report, 'warn', $ownerId, $moderator, $reason);

            $this->notifyReporter($report, true, $moderator);

            Log::info('Aviso de utilizador registado', [
                'admin_id'    => $moderator->id,
                'target_user' => $ownerId,
                'report_id'   => $report->id,
                'reason'      => $reason,
            ]);

            return $report;
        });
    }

    public function deleteContent(string $id, ?string $reason, User $moderator): Report
    {
        $report = Report::find($id);
        if (!$report) {
            throw new \Illuminate\Database\Eloquent\ModelNotFoundException('Report not found.');
        }

        return DB::transaction(function () use ($report, $reason, $moderator) {
            $ownerId = $this->getContentOwnerId($report->content_type, $report->content_id);

            // O owner_id é capturado no evento antes da eliminação; a notificação
            // (afterCommit) usa esse id mesmo que o conteúdo já não exista.
            $this->notifyContentOwner($report, 'delete', $ownerId, $moderator, $reason);

            // Perform deletion
            $this->performDelete($report->content_type, $report->content_id);

            $report->update([
                'status'       => 'resolved',
                'reviewed_by'  => $moderator->id,
                'reviewed_at'  => now(),
                'action_taken' => 'Content deleted: ' . ($reason ?? 'Deleted by admin.'),
            ]);

            $this->notifyReporter($report, true, $moderator);

            Log::info('Remoção de conteúdo denunciado', [
                'admin_id'    => $moderator->id,
                'target_user' => $ownerId,
                'report_id'   => $report->id,
                'reason'      => $reason,
            ]);

            return $report;
        });
    }

    public function hideContent(string $id, ?string $reason, User $moderator): Report
    {
        $report = Report::find($id);
        if (!$report) {
            throw new \Illuminate\Database\Eloquent\ModelNotFoundException('Report not found.');
        }

        return DB::transaction(function () use ($report, $reason, $moderator) {
            $ownerId = $this->getContentOwnerId($report->content_type, $report->content_id);

            // Perform hide
            $this->performHide($report->content_type, $report->content_id);

            $report->update([
                'status'       => 'resolved',
                'reviewed_by'  => $moderator->id,
                'reviewed_at'  => now(),
                'action_taken' => 'Content hidden: ' . ($reason ?? 'Hidden by admin.'),
            ]);

            $this->notifyContentOwner($report, 'hide', $ownerId, $moderator, $reason);

            $this->notifyReporter($report, true, $moderator);

            Log::info('Ocultação de conteúdo denunciado', [
                'admin_id'    => $moderator->id,
                'target_user' => $ownerId,
                'report_id'   => $report->id,
                'reason'      => $reason,
            ]);

            return $report;
        });
    }

    public function restoreContent(string $id, ?string $reason, User $moderator): Report
    {
        $report = Report::find($id);
        if (!$report) {
            throw new \Illuminate\Database\Eloquent\ModelNotFoundException('Report not found.');
        }

        return DB::transaction(function () use ($report, $reason, $moderator) {
            $ownerId = $this->getContentOwnerId($report->content_type, $report->content_id);

            // Perform restore
            $this->performRestore($report->content_type, $report->content_id);

            $report->update([
                'status'       => 'resolved',
                'reviewed_by'  => $moderator->id,
                'reviewed_at'  => now(),
                'action_taken' => 'Content restored: ' . ($reason ?? 'Restored by admin.'),
            ]);

            $this->notifyContentOwner($report, 'restore', $ownerId, $moderator, $reason);

            Log::info('Restauração de conteúdo', [
                'admin_id'    => $moderator->id,
                'target_user' => $ownerId,
                'report_id'   => $report->id,
                'reason'      => $reason,
            ]);

            return $report;
        });
    }

    public function statistics(): array
    {
        return [
            'total'     => Report::count(),
            'pending'   => Report::where('status', 'pending')->count(),
            'resolved'  => Report::where('status', 'resolved')->count(),
            'dismissed' => Report::where('status', 'dismissed')->count(),
        ];
    }

    public function contentExists(string $contentType, string $contentId): bool
    {
        return match ($contentType) {
            'document' => DB::table('documents')->where('id', $contentId)->exists(),
            'topic'    => DB::table('discussion_topics')->where('id', $contentId)->exists(),
            'reply'    => DB::table('topic_replies')->where('id', $contentId)->exists(),
            'user'     => DB::table('users')->where('id', $contentId)->exists(),
            default    => false,
        };
    }

    public function hasPendingReport(string $reporterId, string $contentType, string $contentId): bool
    {
        return Report::where('reporter_id', $reporterId)
            ->where('content_type', $contentType)
            ->where('content_id', $contentId)
            ->where('status', 'pending')
            ->exists();
    }

    public function getContentOwnerId(string $contentType, string $contentId): ?string
    {
        return match ($contentType) {
            'document' => DB::table('documents')->where('id', $contentId)->value('created_by'),
            'topic'    => DB::table('discussion_topics')->where('id', $contentId)->value('author_id'),
            'reply'    => DB::table('topic_replies')->where('id', $contentId)->value('author_id'),
            'user'     => $contentId,
            default    => null,
        };
    }

    public function performDelete(string $contentType, string $contentId): void
    {
        match ($contentType) {
            'document' => DB::table('documents')->where('id', $contentId)->delete(),
            'topic'    => DB::table('discussion_topics')->where('id', $contentId)->delete(),
            'reply'    => DB::table('topic_replies')->where('id', $contentId)->delete(),
            'user'     => DB::table('users')->where('id', $contentId)->update(['is_active' => false]),
            default    => null,
        };
    }

    public function performHide(string $contentType, string $contentId): void
    {
        match ($contentType) {
            'document' => DB::table('documents')->where('id', $contentId)->update(['status' => 'flagged']),
            'topic'    => DB::table('discussion_topics')->where('id', $contentId)->update(['status' => 'flagged', 'hidden' => true]),
            'reply'    => DB::table('topic_replies')->where('id', $contentId)->update(['is_flagged' => true, 'hidden' => true]),
            'user'     => DB::table('users')->where('id', $contentId)->update(['is_active' => false]),
            default    => null,
        };
    }

    public function performRestore(string $contentType, string $contentId): void
    {
        match ($contentType) {
            'document' => DB::table('documents')->where('id', $contentId)->update(['status' => 'published']),
            'topic'    => DB::table('discussion_topics')->where('id', $contentId)->update(['status' => 'published', 'hidden' => false]),
            'reply'    => DB::table('topic_replies')->where('id', $contentId)->update(['is_flagged' => false, 'hidden' => false]),
            'user'     => DB::table('users')->where('id', $contentId)->update(['is_active' => true]),
            default    => null,
        };
    }
}
