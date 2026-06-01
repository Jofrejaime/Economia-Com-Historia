<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Mail\InviteMail;
use App\Models\User;
use App\Notifications\ContentNotification;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Str;

class NotificationController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        return response()->json([
            'data' => DB::table('notifications')
                ->where('user_id', $request->user()->id)
                ->orderByDesc('created_at')
                ->limit(50)
                ->get(),
        ]);
    }

    public function send(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'user_id' => ['nullable', 'uuid', 'exists:users,id'],
            'email' => ['nullable', 'email'],
            'title' => ['required', 'string', 'max:255'],
            'message' => ['required', 'string'],
            'action_url' => ['nullable', 'url'],
            'send_email' => ['sometimes', 'boolean'],
            'reference_id' => ['nullable', 'uuid'],
            'reference_type' => ['nullable', 'string', 'max:50'],
        ]);

        $targetUser = null;

        if (! empty($validated['user_id'])) {
            $targetUser = User::find($validated['user_id']);
        } elseif (! empty($validated['email'])) {
            $targetUser = User::query()->where('email', $validated['email'])->first();
        } else {
            $targetUser = $request->user();
        }

        if ($targetUser === null) {
            return response()->json(['message' => 'Target user not found.'], 404);
        }

        $notificationData = [
            'id' => (string) Str::uuid(),
            'user_id' => $targetUser->id,
            'type' => 'content_notification',
            'title' => $validated['title'],
            'message' => $validated['message'],
            'reference_id' => $validated['reference_id'] ?? null,
            'reference_type' => $validated['reference_type'] ?? null,
            'is_read' => false,
            'created_at' => now(),
        ];

        DB::table('notifications')->insert($notificationData);

        if ($request->boolean('send_email', true)) {
            $targetUser->notify(new ContentNotification(
                $validated['title'], 
                $validated['message'], 
                $validated['action_url'] ?? null,
            ));
        }

        return response()->json([
            'message' => 'Notification sent.',
            'notification' => $notificationData,
        ]);
    }

    public function sendInvite(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'email' => ['required', 'email'],
            'recipient_name' => ['required', 'string', 'max:100'],
            'subject' => ['required', 'string', 'max:255'],
            'message' => ['required', 'string'],
            'action_url' => ['nullable', 'url'],
        ]);

        Mail::mailer('resend')->to($validated['email'])->send(new InviteMail(
            $validated['subject'], 
            $validated['recipient_name'], 
            $validated['message'], 
            $validated['action_url'] ?? null,
        ));

        return response()->json(['message' => 'Invite email sent.']);
    }

    public function markRead(string $id): JsonResponse
    {
        DB::table('notifications')
            ->where('id', $id)
            ->update(['is_read' => true, 'read_at' => now()]);

        return response()->json(['message' => 'Notification marked as read.', 'id' => $id]);
    }

    public function markAllRead(Request $request): JsonResponse
    {
        DB::table('notifications')
            ->where('user_id', $request->user()->id)
            ->where('is_read', false)
            ->update(['is_read' => true, 'read_at' => now()]);

        return response()->json(['message' => 'All notifications marked as read.']);
    }

    public function destroy(string $id): JsonResponse
    {
        DB::table('notifications')->where('id', $id)->delete();

        return response()->json(['message' => 'Notification deleted.', 'id' => $id]);
    }
}
