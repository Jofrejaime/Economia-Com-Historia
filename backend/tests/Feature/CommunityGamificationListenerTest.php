<?php

namespace Tests\Feature;

use App\Events\Domain\Community\ReplyAccepted;
use App\Events\Domain\Community\TopicCreated;
use App\Events\Domain\Community\TopicReplied;
use App\Listeners\Community\CommunityGamificationListener;
use App\Models\User;
use Database\Seeders\BadgesSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
use Tests\TestCase;

/**
 * Fase 2 (EDA) — valida o CommunityGamificationListener por invocação direta.
 * Os pontos deixaram de ser atribuídos no CommunityController.
 */
class CommunityGamificationListenerTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(BadgesSeeder::class);
    }

    private function listener(): CommunityGamificationListener
    {
        return app(CommunityGamificationListener::class);
    }

    private function points(string $userId): int
    {
        return (int) (DB::table('user_levels')->where('user_id', $userId)->value('total_points') ?? 0);
    }

    public function test_topic_created_awards_20_points_to_author(): void
    {
        $author = User::factory()->create();

        $this->listener()->handleTopicCreated(new TopicCreated('topic-1', $author->id, [
            'topic_title' => 'Economia colonial',
        ]));

        $this->assertSame(20, $this->points($author->id));
        $this->assertDatabaseHas('point_transactions', [
            'user_id' => $author->id,
            'reason'  => 'topic_created',
        ]);
    }

    public function test_replied_awards_10_points_to_reply_author(): void
    {
        $replier = User::factory()->create();

        $this->listener()->handleReplied(new TopicReplied('topic-1', $replier->id, [
            'topic_title'      => 'Tópico',
            'topic_author_id'  => (string) \Illuminate\Support\Str::uuid(),
            'reply_id'         => 'reply-1',
            'parent_reply_id'  => null,
            'parent_author_id' => null,
        ]));

        $this->assertSame(10, $this->points($replier->id));
    }

    public function test_reply_accepted_awards_50_points_to_reply_author(): void
    {
        $replyAuthor = User::factory()->create();
        $accepter = User::factory()->create(['role' => 'admin']);

        $this->listener()->handleReplyAccepted(new ReplyAccepted('topic-1', $accepter->id, [
            'topic_title'     => 'Tópico',
            'reply_id'        => 'reply-1',
            'reply_author_id' => $replyAuthor->id,
        ]));

        $this->assertSame(50, $this->points($replyAuthor->id));
        // O aceitante não recebe pontos.
        $this->assertSame(0, $this->points($accepter->id));
    }
}
