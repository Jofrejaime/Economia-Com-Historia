<?php

namespace App\Providers;

use App\Models\DiscussionTopic;
use App\Policies\DiscussionTopicPolicy;
use Illuminate\Foundation\Support\Providers\AuthServiceProvider as ServiceProvider;
use Illuminate\Support\Facades\Gate;

class AuthServiceProvider extends ServiceProvider
{
    protected $policies = [
        DiscussionTopic::class => DiscussionTopicPolicy::class,
    ];

    public function boot(): void
    {
        $this->registerPolicies();

        Gate::policy(DiscussionTopic::class, DiscussionTopicPolicy::class);
    }
}
