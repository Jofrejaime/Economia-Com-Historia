<?php

use App\Http\Controllers\Api\AccessController;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\CommunityController;
use App\Http\Controllers\Api\DocumentController;
use App\Http\Controllers\Api\HealthController;
use App\Http\Controllers\Api\LeaderboardController;
use App\Http\Controllers\Api\NotificationController;
use App\Http\Controllers\Api\ProfileController;
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

Route::middleware(AuthenticateApiSession::class)->group(function (): void {
    Route::post('/auth/logout', [AuthController::class, 'logout']);
    Route::get('/me', [AuthController::class, 'me']);

    Route::get('/profile', [ProfileController::class, 'show']);
    Route::put('/profile', [ProfileController::class, 'update']);
    Route::post('/profile/avatar', [ProfileController::class, 'updateAvatar']);
    Route::put('/profile/password', [ProfileController::class, 'updatePassword']);

    Route::get('/access-levels', [AccessController::class, 'index']);
    Route::get('/access-requests', [AccessController::class, 'requests']);
    Route::post('/access-requests', [AccessController::class, 'storeRequest']);
    Route::get('/access-requests/{id}', [AccessController::class, 'showRequest']);
    Route::patch('/access-requests/{id}', [AccessController::class, 'reviewRequest']);
    Route::get('/access-grants', [AccessController::class, 'grants']);
    Route::post('/access-grants/{id}/revoke', [AccessController::class, 'revokeGrant']);

    Route::get('/documents', [DocumentController::class, 'index']);
    Route::post('/documents', [DocumentController::class, 'store']);
    Route::get('/documents/search', [DocumentController::class, 'search']);
    Route::get('/documents/{id}', [DocumentController::class, 'show']);
    Route::patch('/documents/{id}', [DocumentController::class, 'update']);
    Route::delete('/documents/{id}', [DocumentController::class, 'destroy']);
    Route::post('/documents/{id}/like', [DocumentController::class, 'like']);
    Route::delete('/documents/{id}/like', [DocumentController::class, 'unlike']);
    Route::post('/documents/{id}/download', [DocumentController::class, 'download']);
    Route::post('/documents/{id}/favorite', [DocumentController::class, 'favorite']);
    Route::delete('/documents/{id}/favorite', [DocumentController::class, 'unfavorite']);
    Route::post('/documents/{id}/citations', [DocumentController::class, 'createCitation']);

    Route::get('/quizzes', [QuizController::class, 'index']);
    Route::post('/quizzes', [QuizController::class, 'store']);
    Route::get('/quizzes/{id}', [QuizController::class, 'show']);
    Route::patch('/quizzes/{id}', [QuizController::class, 'update']);
    Route::delete('/quizzes/{id}', [QuizController::class, 'destroy']);
    Route::get('/quizzes/{id}/questions', [QuizController::class, 'questions']);
    Route::post('/quizzes/{id}/attempts', [QuizController::class, 'startAttempt']);
    Route::get('/quiz-attempts/{id}', [QuizController::class, 'showAttempt']);
    Route::post('/quiz-attempts/{id}/answers', [QuizController::class, 'answerAttempt']);
    Route::post('/quiz-attempts/{id}/complete', [QuizController::class, 'completeAttempt']);
    Route::get('/me/quiz-attempts', [QuizController::class, 'myAttempts']);

    Route::get('/community/categories', [CommunityController::class, 'categories']);
    Route::post('/community/categories', [CommunityController::class, 'storeCategory']);
    Route::get('/topics', [CommunityController::class, 'indexTopics']);
    Route::post('/topics', [CommunityController::class, 'storeTopic']);
    Route::get('/topics/{id}', [CommunityController::class, 'showTopic']);
    Route::patch('/topics/{id}', [CommunityController::class, 'updateTopic']);
    Route::delete('/topics/{id}', [CommunityController::class, 'destroyTopic']);
    Route::post('/topics/{id}/like', [CommunityController::class, 'likeTopic']);
    Route::delete('/topics/{id}/like', [CommunityController::class, 'unlikeTopic']);
    Route::post('/topics/{id}/follow', [CommunityController::class, 'followTopic']);
    Route::delete('/topics/{id}/follow', [CommunityController::class, 'unfollowTopic']);
    Route::get('/topics/{id}/replies', [CommunityController::class, 'topicReplies']);
    Route::post('/topics/{id}/replies', [CommunityController::class, 'storeReply']);
    Route::patch('/replies/{id}', [CommunityController::class, 'updateReply']);
    Route::delete('/replies/{id}', [CommunityController::class, 'destroyReply']);
    Route::post('/replies/{id}/like', [CommunityController::class, 'likeReply']);
    Route::delete('/replies/{id}/like', [CommunityController::class, 'unlikeReply']);
    Route::post('/replies/{id}/accept', [CommunityController::class, 'acceptReply']);

    Route::get('/leaderboard/national', [LeaderboardController::class, 'national']);
    Route::get('/leaderboard/provincial', [LeaderboardController::class, 'provincial']);
    Route::get('/leaderboard/snapshots', [LeaderboardController::class, 'snapshots']);
    Route::get('/stats/provinces', [LeaderboardController::class, 'provinceStats']);

    Route::get('/notifications', [NotificationController::class, 'index']);
    Route::patch('/notifications/{id}/read', [NotificationController::class, 'markRead']);
    Route::patch('/notifications/read-all', [NotificationController::class, 'markAllRead']);
    Route::delete('/notifications/{id}', [NotificationController::class, 'destroy']);

    Route::post('/reports', [ReportController::class, 'store']);
    Route::get('/reports', [ReportController::class, 'index']);
    Route::get('/reports/{id}', [ReportController::class, 'show']);
    Route::patch('/reports/{id}', [ReportController::class, 'update']);
    Route::post('/reports/{id}/action', [ReportController::class, 'action']);
});