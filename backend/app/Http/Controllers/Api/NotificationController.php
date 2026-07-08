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
    /**
     * @OA\Get(
     *      path="/notifications",
     *      operationId="indexNotifications",
     *      tags={"Notifications"},
     *      summary="Listar notificações",
     *      description="Lista as notificações recebidas pelo utilizador autenticado.",
     *      security={{"bearer_token": {}, "session_token": {}}},
     *      @OA\Response(
     *          response=200,
     *          description="Notificações obtidas com sucesso",
     *          @OA\JsonContent(
     *              @OA\Property(property="data", type="array", @OA\Items(type="object"))
     *          )
     *      ),
     *      @OA\Response(
     *          response=401,
     *          description="Não autenticado"
     *      )
     * )
     */
    public function index(Request $request): JsonResponse
    {
        $notifications = DB::table('notifications')
            ->where('user_id', $request->user()->id)
            ->orderByDesc('created_at')
            ->limit(50)
            ->get()
            ->map(function ($n) {
                $n->data = isset($n->data) && $n->data !== null ? json_decode($n->data, true) : null;
                return $n;
            });

        return response()->json(['data' => $notifications]);
    }

    /**
     * @OA\Post(
     *      path="/notifications/send",
     *      operationId="sendNotification",
     *      tags={"Notifications"},
     *      summary="Enviar notificação para um utilizador (Apenas Admin)",
     *      description="Envia uma notificação interna (e opcionalmente por email) para o utilizador alvo.",
     *      security={{"bearer_token": {}, "session_token": {}}},
     *      @OA\RequestBody(
     *          required=true,
     *          @OA\JsonContent(
     *              required={"title", "message"},
     *              @OA\Property(property="user_id", type="string", format="uuid", nullable=true),
     *              @OA\Property(property="email", type="string", format="email", nullable=true),
     *              @OA\Property(property="title", type="string", maxLength=255, example="Novo Conteúdo Disponível"),
     *              @OA\Property(property="message", type="string", example="Foi publicado um novo documento sobre economia colonial."),
     *              @OA\Property(property="action_url", type="string", format="url", nullable=true),
     *              @OA\Property(property="send_email", type="boolean", default=true),
     *              @OA\Property(property="reference_id", type="string", format="uuid", nullable=true),
     *              @OA\Property(property="reference_type", type="string", maxLength=50, nullable=true)
     *          )
     *      ),
     *      @OA\Response(
     *          response=201,
     *          description="Notificação enviada",
     *          @OA\JsonContent(
     *              @OA\Property(property="message", type="string", example="Notification sent."),
     *              @OA\Property(property="notification", type="object")
     *          )
     *      ),
     *      @OA\Response(
     *          response=401,
     *          description="Não autenticado"
     *      ),
     *      @OA\Response(
     *          response=403,
     *          description="Acesso proibido (Requer admin)"
     *      ),
     *      @OA\Response(
     *          response=404,
     *          description="Utilizador alvo não encontrado"
     *      )
     * )
     */
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
        ], 201);
    }

    /**
     * @OA\Post(
     *      path="/notifications/invite",
     *      operationId="sendInvite",
     *      tags={"Notifications"},
     *      summary="Enviar email de convite (Apenas Admin)",
     *      description="Envia um convite por email externo usando o mailer configurado.",
     *      security={{"bearer_token": {}, "session_token": {}}},
     *      @OA\RequestBody(
     *          required=true,
     *          @OA\JsonContent(
     *              required={"email", "recipient_name", "subject", "message"},
     *              @OA\Property(property="email", type="string", format="email", example="convidado@exemplo.com"),
     *              @OA\Property(property="recipient_name", type="string", maxLength=100, example="José Carlos"),
     *              @OA\Property(property="subject", type="string", maxLength=255, example="Convite para a Plataforma Economia Com História"),
     *              @OA\Property(property="message", type="string", example="Junte-se a nós para explorar..."),
     *              @OA\Property(property="action_url", type="string", format="url", nullable=true)
     *          )
     *      ),
     *      @OA\Response(
     *          response=200,
     *          description="Email enviado",
     *          @OA\JsonContent(
     *              @OA\Property(property="message", type="string", example="Invite email sent.")
     *          )
     *      ),
     *      @OA\Response(
     *          response=401,
     *          description="Não autenticado"
     *      ),
     *      @OA\Response(
     *          response=403,
     *          description="Acesso proibido (Requer admin)"
     *      )
     * )
     */
    public function sendInvite(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'email' => ['required', 'email'],
            'recipient_name' => ['required', 'string', 'max:100'],
            'subject' => ['required', 'string', 'max:255'],
            'message' => ['required', 'string'],
            'action_url' => ['nullable', 'url'],
        ]);

        Mail::to($validated['email'])->send(new InviteMail(
            $validated['subject'], 
            $validated['recipient_name'], 
            $validated['message'], 
            $validated['action_url'] ?? null,
        ));

        return response()->json(['message' => 'Invite email sent.']);
    }

    /**
     * @OA\Patch(
     *      path="/notifications/{id}/read",
     *      operationId="markRead",
     *      tags={"Notifications"},
     *      summary="Marcar notificação como lida",
     *      description="Marca uma notificação específica do utilizador autenticado como lida.",
     *      security={{"bearer_token": {}, "session_token": {}}},
     *      @OA\Parameter(
     *          name="id",
     *          in="path",
     *          required=true,
     *          description="ID da notificação",
     *          @OA\Schema(type="string")
     *      ),
     *      @OA\Response(
     *          response=200,
     *          description="Marcada como lida com sucesso",
     *          @OA\JsonContent(
     *              @OA\Property(property="message", type="string", example="Notification marked as read."),
     *              @OA\Property(property="id", type="string")
     *          )
     *      ),
     *      @OA\Response(
     *          response=401,
     *          description="Não autenticado"
     *      ),
     *      @OA\Response(
     *          response=404,
     *          description="Notificação não encontrada"
     *      )
     * )
     */
    public function markRead(string $id, Request $request): JsonResponse
    {
        $notification = DB::table('notifications')
            ->where('id', $id)
            ->where('user_id', $request->user()->id)
            ->first();

        if ($notification === null) {
            return response()->json(['message' => 'Notification not found.'], 404);
        }

        DB::table('notifications')
            ->where('id', $id)
            ->update(['is_read' => true, 'read_at' => now()]);

        return response()->json(['message' => 'Notification marked as read.', 'id' => $id]);
    }

    /**
     * @OA\Patch(
     *      path="/notifications/read-all",
     *      operationId="markAllRead",
     *      tags={"Notifications"},
     *      summary="Marcar todas como lidas",
     *      description="Marca todas as notificações pendentes do utilizador como lidas.",
     *      security={{"bearer_token": {}, "session_token": {}}},
     *      @OA\Response(
     *          response=200,
     *          description="Todas marcadas como lidas",
     *          @OA\JsonContent(
     *              @OA\Property(property="message", type="string", example="All notifications marked as read.")
     *          )
     *      ),
     *      @OA\Response(
     *          response=401,
     *          description="Não autenticado"
     *      )
     * )
     */
    public function markAllRead(Request $request): JsonResponse
    {
        DB::table('notifications')
            ->where('user_id', $request->user()->id)
            ->where('is_read', false)
            ->update(['is_read' => true, 'read_at' => now()]);

        return response()->json(['message' => 'All notifications marked as read.']);
    }

    /**
     * @OA\Delete(
     *      path="/notifications/{id}",
     *      operationId="destroyNotification",
     *      tags={"Notifications"},
     *      summary="Eliminar notificação",
     *      description="Apaga uma notificação específica.",
     *      security={{"bearer_token": {}, "session_token": {}}},
     *      @OA\Parameter(
     *          name="id",
     *          in="path",
     *          required=true,
     *          description="ID da notificação",
     *          @OA\Schema(type="string")
     *      ),
     *      @OA\Response(
     *          response=200,
     *          description="Notificação eliminada com sucesso",
     *          @OA\JsonContent(
     *              @OA\Property(property="message", type="string", example="Notification deleted."),
     *              @OA\Property(property="id", type="string")
     *          )
     *      ),
     *      @OA\Response(
     *          response=401,
     *          description="Não autenticado"
     *      ),
     *      @OA\Response(
     *          response=404,
     *          description="Notificação não encontrada"
     *      )
     * )
     */
    public function destroy(string $id, Request $request): JsonResponse
    {
        $notification = DB::table('notifications')
            ->where('id', $id)
            ->where('user_id', $request->user()->id)
            ->first();

        if ($notification === null) {
            return response()->json(['message' => 'Notification not found.'], 404);
        }

        DB::table('notifications')->where('id', $id)->delete();

        return response()->json(['message' => 'Notification deleted.', 'id' => $id]);
    }
}
