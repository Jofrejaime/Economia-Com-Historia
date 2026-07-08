import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { HeaderComponent } from '../../../components/header/header';
import { FooterComponent } from '../../../components/footer/footer';
import { AuthService } from '../../../services/auth.service';
import { ToastService } from '../../../services/toast.service';

interface NotificationPref {
  key: string;
  label: string;
  description: string;
  enabled: boolean;
}

const STORAGE_KEY = 'notification_preferences';

@Component({
  selector: 'app-notification-preferences',
  standalone: true,
  imports: [CommonModule, RouterModule, HeaderComponent, FooterComponent],
  templateUrl: './notification-preferences.html',
  styleUrls: ['./notification-preferences.css']
})
export class NotificationPreferencesComponent implements OnInit {

  // Tipos alinhados com os que o NotificationService do backend envia
  preferences: NotificationPref[] = [
    {
      key: 'topic_reply',
      label: 'Respostas aos meus tópicos',
      description: 'Receber uma notificação quando alguém responde a um tópico que criei.',
      enabled: true,
    },
    {
      key: 'reply_reply',
      label: 'Respostas às minhas mensagens',
      description: 'Receber uma notificação quando alguém responde diretamente a uma mensagem minha.',
      enabled: true,
    },
    {
      key: 'topic_invitation',
      label: 'Convites para tópicos privados',
      description: 'Receber uma notificação quando for convidado(a) para uma discussão por convite.',
      enabled: true,
    },
    {
      key: 'reply_accepted',
      label: 'Respostas aceites',
      description: 'Receber uma notificação quando uma resposta minha for marcada como solução.',
      enabled: true,
    },
    {
      key: 'badge_awarded',
      label: 'Badges e conquistas',
      description: 'Receber uma notificação quando ganhar um novo badge ou subir de nível.',
      enabled: true,
    },
    {
      key: 'admin_announcements',
      label: 'Comunicações da plataforma',
      description: 'Receber avisos e novidades enviados pela administração do arquivo.',
      enabled: true,
    },
  ];

  saved = false;

  constructor(
    private router: Router,
    private authService: AuthService,
    private toastService: ToastService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    // Página exclusiva de utilizadores autenticados
    if (!this.authService.isAuthenticated()) {
      this.router.navigate(['/auth/login']);
      return;
    }
    this.loadPreferences();
  }

  /**
   * Carrega as preferências guardadas.
   * NOTA: por agora persistem no localStorage do browser, porque o backend
   * ainda não expõe um endpoint de preferências de notificação por
   * utilizador. Quando existir (ex: GET/PUT /api/profile/notification-preferences),
   * basta substituir loadPreferences() e persist() por chamadas HTTP —
   * a estrutura { key: enabled } já está pronta para isso.
   */
  private loadPreferences(): void {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const saved: Record<string, boolean> = JSON.parse(raw);
        this.preferences = this.preferences.map(p => ({
          ...p,
          enabled: saved[p.key] ?? p.enabled,
        }));
      }
    } catch { /* usa os defaults */ }
    this.cdr.detectChanges();
  }

  private persist(): void {
    const map: Record<string, boolean> = {};
    for (const p of this.preferences) {
      map[p.key] = p.enabled;
    }
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(map));
    } catch { /* storage indisponível — mantém só em memória */ }
  }

  togglePreference(pref: NotificationPref): void {
    pref.enabled = !pref.enabled;
    this.persist();
    this.saved = true;
    this.cdr.detectChanges();

    setTimeout(() => {
      this.saved = false;
      this.cdr.detectChanges();
    }, 2000);
  }

  enableAll(): void {
    this.preferences = this.preferences.map(p => ({ ...p, enabled: true }));
    this.persist();
    this.toastService.success('Todas as notificações foram ativadas.');
    this.cdr.detectChanges();
  }

  disableAll(): void {
    this.preferences = this.preferences.map(p => ({ ...p, enabled: false }));
    this.persist();
    this.toastService.success('Todas as notificações foram desativadas.');
    this.cdr.detectChanges();
  }

  goBack(): void {
    this.router.navigate(['/auth/perfil']);
  }
}