import { Injectable, NgZone } from '@angular/core';
import Echo from 'laravel-echo';
import Pusher from 'pusher-js';
import { Subject, Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { AuthService } from './auth.service';
import { AppNotification } from './notification.service';

/**
 * Ligação em tempo real ao Reverb (Sprint 19.0).
 *
 * Subscreve o canal privado do utilizador (`App.Models.User.{id}`) e emite as
 * notificações recebidas via `notification.created`. A autorização do canal
 * passa pelo endpoint POST /api/broadcasting/auth, protegido pela auth de token
 * da plataforma (envia o Bearer token nos headers do pedido de auth).
 *
 * É tolerante a falhas: se o servidor Reverb não estiver a correr, a app
 * continua a funcionar normalmente (as notificações aparecem ao recarregar).
 */
@Injectable({ providedIn: 'root' })
export class RealtimeService {
  private echo: Echo<'reverb'> | null = null;
  private currentUserId: string | null = null;
  private readonly incoming$ = new Subject<AppNotification>();

  constructor(private auth: AuthService, private zone: NgZone) {}

  /** Stream de notificações recebidas em tempo real. */
  get notifications$(): Observable<AppNotification> {
    return this.incoming$.asObservable();
  }

  /**
   * Liga ao canal privado do utilizador autenticado. Idempotente: se já estiver
   * ligado ao mesmo utilizador, não faz nada.
   */
  connect(): void {
    const token = this.auth.getToken();
    const userId = (this.auth.getUser() as { id?: string } | null)?.id ?? null;

    if (!token || !userId) return;
    if (this.echo && this.currentUserId === userId) return;

    this.disconnect();
    this.currentUserId = userId;

    try {
      // laravel-echo precisa do Pusher acessível globalmente.
      (window as unknown as { Pusher: typeof Pusher }).Pusher = Pusher;

      this.echo = new Echo({
        broadcaster: 'reverb',
        key: environment.reverb.key,
        wsHost: environment.reverb.host,
        wsPort: environment.reverb.port,
        wssPort: environment.reverb.port,
        forceTLS: environment.reverb.scheme === 'https',
        enabledTransports: ['ws', 'wss'],
        // Autorização dos canais privados via a nossa auth de token.
        authEndpoint: `${environment.apiBaseUrl}/api/broadcasting/auth`,
        auth: {
          headers: { Authorization: `Bearer ${token}` },
        },
      });

      this.echo
        .private(`App.Models.User.${userId}`)
        .listen('.notification.created', (payload: AppNotification) => {
          // O callback do Echo corre fora do Angular zone — reentrar para que
          // a UI (contador/sino) atualize.
          this.zone.run(() => this.incoming$.next(payload));
        });
    } catch {
      // Falha a ligar (servidor Reverb em baixo) — silenciosa; a app segue.
      this.echo = null;
      this.currentUserId = null;
    }
  }

  /** Fecha a ligação (ex.: no logout). */
  disconnect(): void {
    try {
      if (this.currentUserId) {
        this.echo?.leave(`App.Models.User.${this.currentUserId}`);
      }
      this.echo?.disconnect();
    } catch {
      /* noop */
    }
    this.echo = null;
    this.currentUserId = null;
  }
}
