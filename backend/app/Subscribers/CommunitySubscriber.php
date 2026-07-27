<?php

namespace App\Subscribers;

use App\Events\Domain\Community\ReplyAccepted;
use App\Events\Domain\Community\TopicCreated;
use App\Events\Domain\Community\TopicMemberInvited;
use App\Events\Domain\Community\TopicMemberRemoved;
use App\Events\Domain\Community\TopicReplied;
use App\Listeners\AuditLogListener;
use App\Listeners\Community\CommunityGamificationListener;
use App\Listeners\Community\CommunityNotificationListener;

/**
 * Liga os eventos do domínio Comunidade aos seus listeners.
 *
 * Registado em AppServiceProvider via Event::subscribe(). Único ponto que
 * conhece o mapeamento evento → infraestrutura. A Fase 2 acrescenta aqui os
 * listeners de cache/estatísticas/gamificação para os eventos de ciclo de vida
 * (TopicCreated/Deleted, ReplyCreated…).
 *
 * @return array<class-string, list<string>>
 */
class CommunitySubscriber
{
    public function subscribe(): array
    {
        $audit = AuditLogListener::class . '@handle';
        $notify = CommunityNotificationListener::class;
        $gamify = CommunityGamificationListener::class;

        return [
            TopicCreated::class => [$gamify . '@handleTopicCreated', $audit],
            TopicReplied::class => [$notify . '@handleReplied', $gamify . '@handleReplied', $audit],
            ReplyAccepted::class => [$notify . '@handleReplyAccepted', $gamify . '@handleReplyAccepted', $audit],
            TopicMemberInvited::class => [$notify . '@handleMemberInvited', $audit],
            TopicMemberRemoved::class => [$notify . '@handleMemberRemoved', $audit],
        ];
    }
}
