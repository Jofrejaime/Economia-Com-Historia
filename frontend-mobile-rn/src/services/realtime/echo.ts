import Echo from "laravel-echo";
// Build compatível com React Native (usa o WebSocket do RN, sem DOM).
import Pusher from "pusher-js/react-native";
import { APP_CONFIG } from "../../constants/config";
import type { Notification } from "../../types/api";

/**
 * Ligação em tempo real ao Reverb (Sprint 19.0) para o mobile.
 *
 * Subscreve o canal privado do utilizador (`App.Models.User.{id}`) e chama
 * `onNotification` quando chega um evento `notification.created`. A autorização
 * do canal passa pelo endpoint POST /api/broadcasting/auth (Bearer token).
 *
 * Tolerante a falhas: se o Reverb não estiver acessível, a app funciona
 * normalmente (as notificações aparecem no fetch/refresh habitual).
 */
let echo: Echo<"reverb"> | null = null;
let connectedUserId: string | null = null;

export function connectRealtime(
  userId: string,
  token: string,
  onNotification: (notification: Notification) => void,
): void {
  if (!userId || !token) return;
  if (echo && connectedUserId === userId) return;

  disconnectRealtime();
  connectedUserId = userId;

  try {
    echo = new Echo({
      broadcaster: "reverb",
      Pusher,
      key: APP_CONFIG.reverb.key,
      wsHost: APP_CONFIG.reverb.host,
      wsPort: APP_CONFIG.reverb.port,
      wssPort: APP_CONFIG.reverb.port,
      forceTLS: APP_CONFIG.reverb.scheme === "https",
      enabledTransports: ["ws", "wss"],
      // apiBaseUrl já inclui "/api".
      authEndpoint: `${APP_CONFIG.apiBaseUrl}/broadcasting/auth`,
      auth: { headers: { Authorization: `Bearer ${token}` } },
    });

    echo
      .private(`App.Models.User.${userId}`)
      .listen(".notification.created", (payload: Notification) => {
        onNotification(payload);
      });
  } catch {
    echo = null;
    connectedUserId = null;
  }
}

export function disconnectRealtime(): void {
  try {
    if (connectedUserId) {
      echo?.leave(`App.Models.User.${connectedUserId}`);
    }
    echo?.disconnect();
  } catch {
    /* noop */
  }
  echo = null;
  connectedUserId = null;
}
