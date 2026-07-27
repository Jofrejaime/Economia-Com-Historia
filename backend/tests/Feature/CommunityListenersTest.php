<?php

namespace Tests\Feature;

use App\Events\Domain\Community\ReplyAccepted;
use App\Events\Domain\Community\TopicMemberInvited;
use App\Events\Domain\Community\TopicMemberRemoved;
use App\Events\Domain\Community\TopicReplied;
use App\Listeners\Community\CommunityNotificationListener;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

/**
 * Fase 1 (EDA) — valida o CommunityNotificationListener por invocação direta.
 * Sob RefreshDatabase os eventos ShouldDispatchAfterCommit não são entregues,
 * por isso o listener é testado diretamente (o disparo é coberto por
 * NotificationTest/CommunityTest via Event::assertDispatched).
 */
class CommunityListenersTest extends TestCase
{
    use RefreshDatabase;

    private function listener(): CommunityNotificationListener
    {
        return app(CommunityNotificationListener::class);
    }

    public function test_replied_notifies_topic_author(): void
    {
        $author = User::factory()->create();
        $replier = User::factory()->create();

        $this->listener()->handleReplied(new TopicReplied('topic-1', $replier->id, [
            'topic_title'      => 'Economia colonial',
            'topic_author_id'  => $author->id,
            'reply_id'         => 'reply-1',
            'parent_reply_id'  => null,
            'parent_author_id' => null,
        ]));

        $this->assertDatabaseHas('notifications', [
            'user_id' => $author->id,
            'type'    => 'topic_reply',
            'title'   => 'Nova resposta no seu tópico',
        ]);
    }

    public function test_replied_does_not_notify_when_author_replies_to_own_topic(): void
    {
        $author = User::factory()->create();

        $this->listener()->handleReplied(new TopicReplied('topic-1', $author->id, [
            'topic_title'      => 'Meu tópico',
            'topic_author_id'  => $author->id,
            'reply_id'         => 'reply-1',
            'parent_reply_id'  => null,
            'parent_author_id' => null,
        ]));

        $this->assertDatabaseMissing('notifications', [
            'user_id' => $author->id,
            'type'    => 'topic_reply',
        ]);
    }

    public function test_replied_notifies_parent_reply_author(): void
    {
        $author = User::factory()->create();
        $parentAuthor = User::factory()->create();
        $replier = User::factory()->create();

        $this->listener()->handleReplied(new TopicReplied('topic-1', $replier->id, [
            'topic_title'      => 'Tópico',
            'topic_author_id'  => $author->id,
            'reply_id'         => 'reply-2',
            'parent_reply_id'  => 'reply-1',
            'parent_author_id' => $parentAuthor->id,
        ]));

        $this->assertDatabaseHas('notifications', [
            'user_id' => $parentAuthor->id,
            'type'    => 'reply_reply',
        ]);
    }

    public function test_reply_accepted_notifies_reply_author(): void
    {
        $replyAuthor = User::factory()->create();
        $accepter = User::factory()->create();

        $this->listener()->handleReplyAccepted(new ReplyAccepted('topic-1', $accepter->id, [
            'topic_title'     => 'Tópico',
            'reply_id'        => 'reply-1',
            'reply_author_id' => $replyAuthor->id,
        ]));

        $this->assertDatabaseHas('notifications', [
            'user_id' => $replyAuthor->id,
            'type'    => 'reply_accepted',
            'title'   => 'A sua resposta foi aceite',
        ]);
    }

    public function test_member_invited_notifies_with_inviter_name_and_not_topic_id(): void
    {
        $invited = User::factory()->create();
        $inviter = User::factory()->create();

        $this->listener()->handleMemberInvited(new TopicMemberInvited('topic-xyz', $inviter->id, [
            'topic_title'     => 'Fórum Privado',
            'invited_user_id' => $invited->id,
            'inviter_name'    => 'Prof. Muto',
        ]));

        $notification = \Illuminate\Support\Facades\DB::table('notifications')
            ->where('user_id', $invited->id)
            ->where('type', 'topic_invitation')
            ->first();

        $this->assertNotNull($notification);
        $this->assertSame('topic-xyz', $notification->reference_id);
        $this->assertSame('discussion_topic', $notification->reference_type);
        $this->assertStringContainsString('Prof. Muto', $notification->message);
        $this->assertStringNotContainsString('topic-xyz', $notification->message);
    }

    public function test_member_removed_notifies_removed_user(): void
    {
        $removed = User::factory()->create();
        $remover = User::factory()->create();

        $this->listener()->handleMemberRemoved(new TopicMemberRemoved('topic-1', $remover->id, [
            'topic_title'     => 'Fórum Privado',
            'removed_user_id' => $removed->id,
        ]));

        $this->assertDatabaseHas('notifications', [
            'user_id' => $removed->id,
            'type'    => 'topic_removed',
            'title'   => 'Removido de um fórum privado',
        ]);
    }
}
