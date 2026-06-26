<?php

use App\Http\Controllers\Api\AccessController;
use App\Http\Controllers\Api\AdminController;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\CommunityController;
use App\Http\Controllers\Api\DocumentController;
use App\Http\Controllers\Api\GamificationController;
use App\Http\Controllers\Api\HealthController;
use App\Http\Controllers\Api\LeaderboardController;
use App\Http\Controllers\Api\NotificationController;
use App\Http\Controllers\Api\ProfileController;
use App\Http\Controllers\Api\UserController;
use App\Http\Controllers\Api\QuizController;
use App\Http\Controllers\Api\ReportController;
use App\Http\Middleware\AuthenticateApiSession;
use Illuminate\Support\Facades\Route;

Route::get('/health', HealthController::class);

Route::prefix('auth')->group(function (): void {
    Route::post('/register', [AuthController::class, 'register']);
    Route::post('/login', [AuthController::class, 'login']);
    Route::post('/refresh', [AuthController::class, 'refresh']);
    Route::post('/forgot-password', [AuthController::class, 'forgotPassword']);
    Route::post('/reset-password', [AuthController::class, 'resetPassword']);
    Route::post('/verify-email', [AuthController::class, 'verifyEmail']);
    Route::post('/resend-verification', [AuthController::class, 'resendVerification']);
});

// ─── Authenticated routes (any logged-in user) ─────────────────────────────
Route::middleware(AuthenticateApiSession::class)->group(function (): void {
    Route::middleware('role:admin')->prefix('admin')->group(function (): void {
        Route::get('/dashboard/summary', [AdminController::class, 'summary']);
        Route::get('/users', [AdminController::class, 'users']);
        Route::patch('/users/{id}', [AdminController::class, 'updateUser']);
        Route::delete('/users/{id}', [AdminController::class, 'deleteUser']);
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

    // Access — own requests/grants
    Route::get('/access-levels', [AccessController::class, 'index']);
    Route::get('/access-requests', [AccessController::class, 'requests']);
    Route::post('/access-requests', [AccessController::class, 'storeRequest']);
    Route::get('/access-requests/{id}', [AccessController::class, 'showRequest']);
    Route::get('/access-grants', [AccessController::class, 'grants']);

    // Documents — read + interactions
    Route::get('/document-categories', [DocumentController::class, 'categories']);
    Route::get('/documents', [DocumentController::class, 'index']);
    Route::get('/documents/search', [DocumentController::class, 'search']);
    Route::get('/documents/{id}', [DocumentController::class, 'show']);
    Route::post('/documents/{id}/like', [DocumentController::class, 'like']);
    Route::delete('/documents/{id}/like', [DocumentController::class, 'unlike']);
    Route::post('/documents/{id}/download', [DocumentController::class, 'download']);
    Route::post('/documents/{id}/favorite', [DocumentController::class, 'favorite']);
    Route::delete('/documents/{id}/favorite', [DocumentController::class, 'unfavorite']);
    Route::post('/documents/{id}/citations', [DocumentController::class, 'createCitation']);

    // Quizzes — read + attempt
    Route::get('/quizzes', [QuizController::class, 'index']);
    Route::get('/quizzes/{id}', [QuizController::class, 'show']);
    Route::get('/quizzes/{id}/questions', [QuizController::class, 'questions']);
    Route::get('/quizzes/{id}/documents', [QuizController::class, 'relatedDocuments']);
    Route::post('/quizzes/{id}/attempts', [QuizController::class, 'startAttempt']);
    Route::get('/quiz-attempts/{id}', [QuizController::class, 'showAttempt']);
    Route::post('/quiz-attempts/{id}/answers', [QuizController::class, 'answerAttempt']);
    Route::post('/quiz-attempts/{id}/complete', [QuizController::class, 'completeAttempt']);
    Route::get('/me/quiz-attempts', [QuizController::class, 'myAttempts']);

    // Community — read + interactions
    Route::get('/community/categories', [CommunityController::class, 'categories']);
    Route::get('/topics', [CommunityController::class, 'indexTopics']);
    Route::get('/topics/{id}', [CommunityController::class, 'showTopic']);
    Route::post('/topics/{id}/like', [CommunityController::class, 'likeTopic']);
    Route::delete('/topics/{id}/like', [CommunityController::class, 'unlikeTopic']);
    Route::post('/topics/{id}/follow', [CommunityController::class, 'followTopic']);
    Route::delete('/topics/{id}/follow', [CommunityController::class, 'unfollowTopic']);
    Route::get('/topics/{id}/replies', [CommunityController::class, 'topicReplies']);

    // Topics/Replies — create (any authenticated user)
    Route::post('/topics', [CommunityController::class, 'storeTopic']);
    Route::patch('/topics/{id}', [CommunityController::class, 'updateTopic']);
    Route::delete('/topics/{id}', [CommunityController::class, 'destroyTopic']);
    Route::get('/topics/{id}/members', [CommunityController::class, 'topicMembers']);
    Route::post('/topics/{id}/members', [CommunityController::class, 'storeTopicMember']);
    Route::patch('/topics/{id}/members/{user}', [CommunityController::class, 'updateTopicMember']);
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
        Route::post('/quizzes', [QuizController::class, 'store']);
        Route::patch('/quizzes/{id}', [QuizController::class, 'update']);
        Route::delete('/quizzes/{id}', [QuizController::class, 'destroy']);
    });

    // ─── Admin only ─────────────────────────────────────────────────────
    Route::middleware('role:admin')->group(function (): void {
        // Access management
        Route::patch('/access-requests/{id}', [AccessController::class, 'reviewRequest']);
        Route::post('/access-grants/{id}/revoke', [AccessController::class, 'revokeGrant']);

        // Community management
        Route::post('/community/categories', [CommunityController::class, 'storeCategory']);

        // Notifications — send to others
        Route::post('/notifications/send', [NotificationController::class, 'send']);
        Route::post('/notifications/invite', [NotificationController::class, 'sendInvite']);

        // Reports — moderation
        Route::patch('/reports/{id}', [ReportController::class, 'update']);
        Route::post('/reports/{id}/action', [ReportController::class, 'action']);
    });
});
