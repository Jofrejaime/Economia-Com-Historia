<?php

use App\Http\Controllers\Api\AdminController;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\CommunityController;
use App\Http\Controllers\Api\DocumentController;
use App\Http\Controllers\Api\AdminDocumentSubscriptionController;
use App\Http\Controllers\Api\GamificationController;
use App\Http\Controllers\Api\HealthController;
use App\Http\Controllers\Api\LeaderboardController;
use App\Http\Controllers\Api\NotificationController;
use App\Http\Controllers\Api\ProfileController;
use App\Http\Controllers\Api\UserController;
use App\Http\Controllers\Api\QuizController;
use App\Http\Controllers\Api\QuizAdminController;
use App\Http\Controllers\Api\ReportController;
use App\Http\Controllers\Api\SettingsController;
use App\Http\Controllers\Api\LevelDefinitionController;
use App\Http\Controllers\Api\DocumentCategoryController;
use App\Http\Controllers\Api\TagController;
use App\Http\Controllers\Api\UserAdminController;
use App\Http\Controllers\Api\MediaController;
use App\Http\Middleware\AuthenticateApiSession;
use App\Http\Middleware\OptionalAuthenticateApiSession;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\BadgeController;
use App\Http\Controllers\Api\CommunityCategoryAdminController;
use App\Http\Controllers\Api\TopicAdminController;
use App\Http\Controllers\Api\ReportAdminController;
use App\Http\Controllers\Api\GamificationAdminController;
use App\Http\Controllers\Api\ProvinceController;
use App\Http\Controllers\Api\InterestAreaController;

Route::get('/health', HealthController::class);

Route::prefix('auth')->group(function (): void {
    Route::post('/register', [AuthController::class, 'register'])->middleware('throttle:auth');
    Route::post('/login', [AuthController::class, 'login'])->middleware('throttle:auth');
    Route::post('/refresh', [AuthController::class, 'refresh']);
    Route::post('/forgot-password', [AuthController::class, 'forgotPassword'])->middleware('throttle:auth');
    Route::post('/reset-password', [AuthController::class, 'resetPassword'])->middleware('throttle:auth');
    Route::post('/verify-email', [AuthController::class, 'verifyEmail']);
    Route::post('/resend-verification', [AuthController::class, 'resendVerification']);
});

// ─── Rotas públicas (visitante) — autenticação opcional ────────────────────
Route::middleware(OptionalAuthenticateApiSession::class)->group(function (): void {
    // Conteúdos — página inicial + view completa do conteúdo
    Route::get('/document-categories', [DocumentController::class, 'categories']);
    Route::get('/documents', [DocumentController::class, 'index']);
    Route::get('/documents/search', [DocumentController::class, 'search']);
    Route::get('/documents/{id}', [DocumentController::class, 'show']);

    // Comunidade — página inicial, discussões e categorias
    Route::get('/community/categories', [CommunityController::class, 'categories']);
    Route::get('/topics', [CommunityController::class, 'indexTopics']);
    Route::get('/topics/{id}', [CommunityController::class, 'showTopic']);
    Route::get('/topics/{id}/replies', [CommunityController::class, 'topicReplies']);

    // Quizzes — listagem e detalhes são públicos (tentativa exige sessão)
    Route::get('/quizzes', [QuizController::class, 'index']);
    Route::get('/quizzes/{id}', [QuizController::class, 'show']);
    Route::get('/quizzes/{id}/questions', [QuizController::class, 'questions']);
    Route::get('/quizzes/{id}/documents', [QuizController::class, 'relatedDocuments']);

    // Províncias e Áreas de Interesse públicas
    Route::get('/provinces', [ProvinceController::class, 'publicList']);
    Route::get('/interest-areas', [InterestAreaController::class, 'publicList']);

    // Ranking — pré-visualização pública (top 3); o ranking completo
    // (/leaderboard/national) continua a exigir sessão.
    Route::get('/leaderboard/top', [LeaderboardController::class, 'top']);
});

// ─── Authenticated routes (any logged-in user) ─────────────────────────────
Route::middleware(AuthenticateApiSession::class)->group(function (): void {
    // Autorização de canais privados do Reverb (tempo real). Corre pelo
    // middleware de token da plataforma — o utilizador é resolvido a partir do
    // Bearer/X-Session-Token e o Broadcast::auth valida os canais de
    // routes/channels.php. O Echo (web/mobile) aponta authEndpoint para aqui.
    Route::post('/broadcasting/auth', function (\Illuminate\Http\Request $request) {
        return \Illuminate\Support\Facades\Broadcast::auth($request);
    });

    Route::middleware('role:admin')->prefix('admin')->group(function (): void {
        Route::get('/dashboard/summary', [AdminController::class, 'summary']);

        // Users Management
        Route::get('/users', [UserAdminController::class, 'index']);
        Route::get('/users/{id}', [UserAdminController::class, 'show']);
        Route::post('/users', [UserAdminController::class, 'store']);
        Route::patch('/users/{id}', [UserAdminController::class, 'update']);
        Route::delete('/users/{id}', [UserAdminController::class, 'destroy']);
        Route::get('/users/{id}/profile', [UserAdminController::class, 'profile']);
        Route::get('/users/{id}/sessions', [UserAdminController::class, 'sessions']);

        // Document subscription management
        Route::get('/document-subscriptions', [AdminDocumentSubscriptionController::class, 'index']);
        Route::patch('/document-subscriptions/{id}/approve', [AdminDocumentSubscriptionController::class, 'approve']);
        Route::patch('/document-subscriptions/{id}/reject', [AdminDocumentSubscriptionController::class, 'reject']);
        Route::patch('/document-subscriptions/{id}/cancel', [AdminDocumentSubscriptionController::class, 'cancel']);

        // Quizzes Dashboard
        Route::get('/quizzes/dashboard', [QuizAdminController::class, 'dashboard']);

        // Quizzes — State transitions
        Route::patch('/quizzes/{id}/publish', [QuizAdminController::class, 'publish']);
        Route::post('/quizzes/{id}/publish', [QuizAdminController::class, 'publish']);
        Route::patch('/quizzes/{id}/review', [QuizAdminController::class, 'review']);
        Route::post('/quizzes/{id}/review', [QuizAdminController::class, 'review']);
        Route::patch('/quizzes/{id}/archive', [QuizAdminController::class, 'archive']);
        Route::post('/quizzes/{id}/archive', [QuizAdminController::class, 'archive']);

        // Quiz documents N:N list
        Route::get('/quizzes/{id}/documents', [QuizAdminController::class, 'documents']);
        // Document quizzes N:N list (admin version)
        Route::get('/documents/{id}/quizzes', [QuizAdminController::class, 'documentQuizzes']);

        // Quizzes — management (admin only)
        Route::get('/quizzes', [QuizAdminController::class, 'index']);
        Route::get('/quizzes/{id}', [QuizAdminController::class, 'show']);
        Route::post('/quizzes', [QuizAdminController::class, 'store']);
        Route::patch('/quizzes/{id}', [QuizAdminController::class, 'update']);
        Route::delete('/quizzes/{id}', [QuizAdminController::class, 'destroy']);
        Route::post('/quizzes/{id}/documents', [QuizAdminController::class, 'syncDocuments']);
        Route::delete('/quizzes/{id}/documents/{documentId}', [QuizAdminController::class, 'detachDocument']);

        // Settings management
        Route::get('/settings', [SettingsController::class, 'index']);
        Route::get('/settings/{key}', [SettingsController::class, 'show']);
        Route::patch('/settings/{key}', [SettingsController::class, 'update']);

        // Level Definitions management
        Route::get('/level-definitions', [LevelDefinitionController::class, 'index']);
        Route::get('/level-definitions/{level}', [LevelDefinitionController::class, 'show']);
        Route::post('/level-definitions', [LevelDefinitionController::class, 'store']);
        Route::patch('/level-definitions/{level}', [LevelDefinitionController::class, 'update']);
        Route::delete('/level-definitions/{level}', [LevelDefinitionController::class, 'destroy']);

        // Documents Management (Admin)
        Route::get('/documents', [DocumentController::class, 'index']);
        Route::post('/documents', [DocumentController::class, 'store']);
        Route::patch('/documents/{id}', [DocumentController::class, 'update']);
        Route::delete('/documents/{id}', [DocumentController::class, 'destroy']);
        Route::patch('/documents/{id}/publish', [DocumentController::class, 'publish']);
        Route::patch('/documents/{id}/unpublish', [DocumentController::class, 'unpublish']);
        Route::patch('/documents/{id}/pin', [DocumentController::class, 'pin']);
        Route::patch('/documents/{id}/unpin', [DocumentController::class, 'unpin']);

        // Categories Management (Admin)
        Route::get('/document-categories', [DocumentCategoryController::class, 'index']);
        Route::get('/document-categories/{id}', [DocumentCategoryController::class, 'show']);
        Route::post('/document-categories', [DocumentCategoryController::class, 'store']);
        Route::patch('/document-categories/{id}', [DocumentCategoryController::class, 'update']);
        Route::delete('/document-categories/{id}', [DocumentCategoryController::class, 'destroy']);

        // Tags Management (Admin)
        Route::get('/tags', [TagController::class, 'index']);
        Route::get('/tags/{id}', [TagController::class, 'show']);
        Route::post('/tags', [TagController::class, 'store']);
        Route::patch('/tags/{id}', [TagController::class, 'update']);
        Route::delete('/tags/{id}', [TagController::class, 'destroy']);

        // Community Categories Management (Admin)
        Route::get('/community/categories', [CommunityCategoryAdminController::class, 'index']);
        Route::post('/community/categories', [CommunityCategoryAdminController::class, 'store']);
        Route::patch('/community/categories/{id}', [CommunityCategoryAdminController::class, 'update']);
        Route::delete('/community/categories/{id}', [CommunityCategoryAdminController::class, 'destroy']);

        // Topics Management (Admin)
        Route::get('/topics', [TopicAdminController::class, 'index']);
        Route::get('/topics/{id}', [TopicAdminController::class, 'show']);
        Route::patch('/topics/{id}', [TopicAdminController::class, 'update']);
        Route::delete('/topics/{id}', [TopicAdminController::class, 'destroy']);
        Route::patch('/topics/{id}/pin', [TopicAdminController::class, 'pin']);
        Route::patch('/topics/{id}/unpin', [TopicAdminController::class, 'unpin']);
        Route::patch('/topics/{id}/lock', [TopicAdminController::class, 'lock']);
        Route::patch('/topics/{id}/unlock', [TopicAdminController::class, 'unlock']);

        // Notifications — send to others (Admin)
        Route::post('/notifications/send', [NotificationController::class, 'send']);
        Route::post('/notifications/invite', [NotificationController::class, 'sendInvite']);

        // Reports Admin (Sprint 18.6)
        Route::get('/reports', [ReportAdminController::class, 'index']);
        Route::get('/reports/{id}', [ReportAdminController::class, 'show']);
        Route::patch('/reports/{id}', [ReportAdminController::class, 'update']);
        Route::post('/reports/{id}/action', [ReportAdminController::class, 'action']);

        // Badges Admin (Sprint 18.7)
        Route::get('/badges', [BadgeController::class, 'index']);
        Route::post('/badges', [BadgeController::class, 'store']);
        Route::patch('/badges/{id}', [BadgeController::class, 'update']);
        Route::post('/badges/{id}/toggle-status', [BadgeController::class, 'toggleStatus']);
        Route::post('/badges/{id}/recalculate', [BadgeController::class, 'recalculate']);
        Route::post('/badges/{id}/assign', [BadgeController::class, 'assign']);
        Route::post('/badges/{id}/remove', [BadgeController::class, 'remove']);
        Route::delete('/badges/{id}', [BadgeController::class, 'destroy']);

        // Gamification Admin (Sprint 18.7)
        Route::get('/gamification/dashboard', [GamificationAdminController::class, 'dashboard']);
        Route::post('/gamification/adjust-points', [GamificationAdminController::class, 'adjustPoints']);
        Route::get('/leaderboard', [GamificationAdminController::class, 'leaderboard']);
        Route::post('/leaderboard/refresh', [GamificationAdminController::class, 'refreshLeaderboard']);
        Route::get('/leaderboard/snapshots', [GamificationAdminController::class, 'snapshots']);
        Route::get('/point-transactions', [GamificationAdminController::class, 'pointTransactions']);
        Route::get('/point-transactions/export', [GamificationAdminController::class, 'exportPointTransactions']);
        Route::get('/point-transactions/{id}', [GamificationAdminController::class, 'showPointTransaction']);
        Route::get('/quiz-attempts', [GamificationAdminController::class, 'quizAttempts']);
        Route::get('/quiz-attempts/{id}', [GamificationAdminController::class, 'showQuizAttempt']);

        // Provinces Management (Admin)
        Route::get('/provinces/statistics', [ProvinceController::class, 'stats']);
        Route::get('/provinces', [ProvinceController::class, 'index']);
        Route::get('/provinces/{id}', [ProvinceController::class, 'show']);
        Route::post('/provinces', [ProvinceController::class, 'store']);
        Route::patch('/provinces/{id}', [ProvinceController::class, 'update']);
        Route::delete('/provinces/{id}', [ProvinceController::class, 'destroy']);

        // Interest Areas Management (Admin)
        Route::get('/interest-areas/categories', [InterestAreaController::class, 'categories']);
        Route::get('/interest-areas/{id}/metadata', [InterestAreaController::class, 'metadata']);
        Route::get('/interest-areas', [InterestAreaController::class, 'index']);
        Route::get('/interest-areas/{id}', [InterestAreaController::class, 'show']);
        Route::post('/interest-areas', [InterestAreaController::class, 'store']);
        Route::patch('/interest-areas/{id}', [InterestAreaController::class, 'update']);
        Route::delete('/interest-areas/{id}', [InterestAreaController::class, 'destroy']);
    });

    Route::post('/auth/logout', [AuthController::class, 'logout']);
    Route::get('/auth/sessions', [AuthController::class, 'sessions']);
    Route::delete('/auth/sessions/others', [AuthController::class, 'destroyOtherSessions']);
    Route::delete('/auth/sessions/{id}', [AuthController::class, 'destroySession']);
    Route::get('/me', [AuthController::class, 'me']);
    Route::get('/me/point-transactions', [GamificationController::class, 'pointTransactions']);
    Route::get('/me/favorites', [DocumentController::class, 'myFavorites']);
    Route::get('/users/search', [UserController::class, 'search']);

    // Profile
    Route::get('/profile', [ProfileController::class, 'show']);
    Route::put('/profile', [ProfileController::class, 'update']);
    Route::post('/profile/avatar', [ProfileController::class, 'updateAvatar']);
    Route::put('/profile/password', [ProfileController::class, 'updatePassword']);

    Route::get('/badges', [BadgeController::class, 'index']);

    // Documents — interações
    Route::post('/documents/{id}/like', [DocumentController::class, 'like']);
    Route::delete('/documents/{id}/like', [DocumentController::class, 'unlike']);
    Route::post('/documents/{id}/favorite', [DocumentController::class, 'favorite']);
    Route::delete('/documents/{id}/favorite', [DocumentController::class, 'unfavorite']);
    Route::post('/documents/{id}/citations', [DocumentController::class, 'createCitation']);
    Route::get('/documents/{id}/quizzes', [DocumentController::class, 'relatedQuizzes']);
    Route::get('/documents/{id}/topics', [CommunityController::class, 'documentTopics']);
    Route::post('/documents/{id}/topics', [CommunityController::class, 'storeTopicForDocument']);

    // Documents — subscription management
    Route::get('/documents/{id}/subscription', [DocumentController::class, 'subscriptionStatus']);
    Route::post('/documents/{id}/subscribe', [DocumentController::class, 'subscribe']);
    Route::delete('/documents/{id}/subscription', [DocumentController::class, 'cancelSubscription']);

    // Quizzes — tentativa
    Route::post('/quizzes/{id}/attempts', [QuizController::class, 'startAttempt']);
    Route::get('/quiz-attempts/{id}', [QuizController::class, 'showAttempt']);
    Route::post('/quiz-attempts/{id}/answers', [QuizController::class, 'answerAttempt']);
    Route::post('/quiz-attempts/{id}/complete', [QuizController::class, 'completeAttempt']);
    Route::get('/me/quiz-attempts', [QuizController::class, 'myAttempts']);

    // Community — interações
    Route::post('/topics/{id}/like', [CommunityController::class, 'likeTopic']);
    Route::delete('/topics/{id}/like', [CommunityController::class, 'unlikeTopic']);
    Route::post('/topics/{id}/follow', [CommunityController::class, 'followTopic']);
    Route::delete('/topics/{id}/follow', [CommunityController::class, 'unfollowTopic']);

    // Topics/Replies — create
    Route::post('/topics', [CommunityController::class, 'storeTopic']);
    Route::patch('/topics/{id}', [CommunityController::class, 'updateTopic']);
    Route::delete('/topics/{id}', [CommunityController::class, 'destroyTopic']);
    Route::get('/topics/{id}/members', [CommunityController::class, 'topicMembers']);
    Route::post('/topics/{id}/members', [CommunityController::class, 'storeTopicMember']);
    Route::delete('/topics/{id}/members/{user}', [CommunityController::class, 'destroyTopicMember']);
    Route::post('/topics/{id}/join', [CommunityController::class, 'joinTopic']);
    Route::post('/topics/{id}/leave', [CommunityController::class, 'leaveTopic']);
    Route::post('/topics/{id}/replies', [CommunityController::class, 'storeReply']);
    Route::patch('/replies/{id}', [CommunityController::class, 'updateReply']);
    Route::delete('/replies/{id}', [CommunityController::class, 'destroyReply']);
    Route::post('/replies/{id}/like', [CommunityController::class, 'likeReply']);
    Route::delete('/replies/{id}/like', [CommunityController::class, 'unlikeReply']);
    Route::post('/replies/{id}/accept', [CommunityController::class, 'acceptReply']);

    // Leaderboard — read
    Route::get('/leaderboard/national', [LeaderboardController::class, 'national']);
    Route::get('/leaderboard/provincial', [LeaderboardController::class, 'provincial']);
    Route::get('/leaderboard/snapshots', [LeaderboardController::class, 'snapshots']);
    Route::get('/stats/provinces', [LeaderboardController::class, 'provinceStats']);

    // Notifications — own
    Route::get('/notifications', [NotificationController::class, 'index']);
    Route::patch('/notifications/{id}/read', [NotificationController::class, 'markRead']);
    Route::patch('/notifications/read-all', [NotificationController::class, 'markAllRead']);
    Route::delete('/notifications/{id}', [NotificationController::class, 'destroy']);

    // Reports — create own
    Route::post('/reports', [ReportController::class, 'store']);
    Route::get('/reports', [ReportController::class, 'index']);
    Route::get('/reports/pending', [ReportController::class, 'pending']);
    Route::get('/reports/{id}', [ReportController::class, 'show']);

    // ─── Admin + Professor: content creation ────────────────────────────
    Route::middleware('role:admin,professor')->group(function (): void {
        Route::post('/documents', [DocumentController::class, 'store']);
        Route::patch('/documents/{id}', [DocumentController::class, 'update']);
        Route::delete('/documents/{id}', [DocumentController::class, 'destroy']);

        // Media — pipeline único de uploads
        Route::post('/media/uploads', [MediaController::class, 'store']);
        Route::delete('/media/{id}', [MediaController::class, 'destroy']);
    });

    // ─── Admin only (Legacy/Mobile compatibility) ───────────────────────────
    Route::middleware('role:admin')->group(function (): void {
        // Documents — pin management
        Route::post('/documents/{id}/pin', [DocumentController::class, 'pin']);
        Route::delete('/documents/{id}/pin', [DocumentController::class, 'unpin']);

        // Notifications — send to others
        Route::post('/notifications/send', [NotificationController::class, 'send']);
        Route::post('/notifications/invite', [NotificationController::class, 'sendInvite']);

        // Reports — moderation
        Route::patch('/reports/{id}', [ReportController::class, 'update']);
        Route::post('/reports/{id}/action', [ReportController::class, 'action']);

        // Badges — management
        Route::post('/badges', [BadgeController::class, 'store']);
        Route::patch('/badges/{id}', [BadgeController::class, 'update']);
        Route::patch('/badges/{id}/toggle', [BadgeController::class, 'toggleStatus']);
        Route::delete('/badges/{id}', [BadgeController::class, 'destroy']);
    });
});
