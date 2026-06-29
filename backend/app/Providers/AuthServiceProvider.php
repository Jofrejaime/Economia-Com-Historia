<?php

namespace App\Providers;

use App\Models\DiscussionTopic;
use App\Models\Document;
use App\Policies\DiscussionTopicPolicy;
use App\Policies\DocumentPolicy;
use Illuminate\Foundation\Support\Providers\AuthServiceProvider as ServiceProvider;
use Illuminate\Support\Facades\Gate;

class AuthServiceProvider extends ServiceProvider
{
    protected $policies = [
        DiscussionTopic::class => DiscussionTopicPolicy::class,
        Document::class        => DocumentPolicy::class,
    ];

    public function boot(): void
    {
        $this->registerPolicies();

        Gate::policy(DiscussionTopic::class, DiscussionTopicPolicy::class);
        Gate::policy(Document::class, DocumentPolicy::class);
    }
}
