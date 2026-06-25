import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { HeaderComponent } from '../../components/header/header';
import { FooterComponent } from '../../components/footer/footer';

interface Notification {
  id: string;
  type: 'info' | 'success' | 'warning' | 'achievement';
  title: string;
  message: string;
  is_read: boolean;
  created_at: string;
}

interface NotificationGroup {
  label: string;
  notifications: Notification[];
}

type FilterType = 'all' | 'unread' | 'system' | 'achievement';

@Component({
  selector: 'app-user-notifications',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    HeaderComponent,
    FooterComponent
  ],
  templateUrl: './user-notifications.html',
  styleUrls: ['./user-notifications.css']
})
export class UserNotificationsComponent implements OnInit {
  notifications: Notification[] = [];
  activeFilter: FilterType = 'all';

  readonly filters: { key: FilterType; label: string }[] = [
    { key: 'all',         label: 'Todas'       },
    { key: 'unread',      label: 'Não lidas'   },
    { key: 'system',      label: 'Sistema'     },
    { key: 'achievement', label: 'Conquistas'  }
  ];

  ngOnInit(): void {
    this.loadNotifications();
  }

  // ─── Contadores ──────────────────────────────────────────────

  get unreadCount(): number {
    return this.notifications.filter(n => !n.is_read).length;
  }

  get hasUnread(): boolean {
    return this.unreadCount > 0;
  }

  // ─── Filtros ─────────────────────────────────────────────────

  setFilter(filter: FilterType): void {
    this.activeFilter = filter;
  }

  get filteredNotifications(): Notification[] {
    switch (this.activeFilter) {
      case 'unread':
        return this.notifications.filter(n => !n.is_read);
      case 'system':
        return this.notifications.filter(n => n.type === 'info' || n.type === 'warning');
      case 'achievement':
        return this.notifications.filter(n => n.type === 'achievement');
      default:
        return this.notifications;
    }
  }

  // ─── Agrupamento temporal ────────────────────────────────────

  get groupedNotifications(): NotificationGroup[] {
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekStart  = new Date(todayStart);
    weekStart.setDate(weekStart.getDate() - 7);

    const groups: NotificationGroup[] = [
      { label: 'Hoje',        notifications: [] },
      { label: 'Esta semana', notifications: [] },
      { label: 'Anteriores',  notifications: [] }
    ];

    for (const notif of this.filteredNotifications) {
      const date = new Date(notif.created_at);
      if (date >= todayStart) {
        groups[0].notifications.push(notif);
      } else if (date >= weekStart) {
        groups[1].notifications.push(notif);
      } else {
        groups[2].notifications.push(notif);
      }
    }

    return groups.filter(g => g.notifications.length > 0);
  }

  // ─── Hora relativa ───────────────────────────────────────────

  getRelativeTime(dateStr: string): string {
    const diff = Date.now() - new Date(dateStr).getTime();
    const minutes = Math.floor(diff / 60_000);
    const hours   = Math.floor(diff / 3_600_000);
    const days    = Math.floor(diff / 86_400_000);

    if (minutes < 1)  return 'agora mesmo';
    if (minutes < 60) return `há ${minutes} min`;
    if (hours   < 24) return `há ${hours}h`;
    if (days    === 1) return 'ontem';
    if (days    < 7)  return `há ${days} dias`;

    return new Date(dateStr).toLocaleDateString('pt-PT', {
      day: '2-digit', month: 'short'
    });
  }

  // ─── Acções ──────────────────────────────────────────────────

  markAsRead(id: string): void {
    const notif = this.notifications.find(n => n.id === id);
    if (notif) notif.is_read = true;
  }

  markAllAsRead(): void {
    this.notifications.forEach(n => (n.is_read = true));
  }

  // ─── Utilitários de tipo ─────────────────────────────────────

  getTypeBg(type: string): string {
    const colors: Record<string, string> = {
      info:        'rgba(59,130,246,0.1)',
      success:     'rgba(34,197,94,0.1)',
      warning:     'rgba(245,158,11,0.1)',
      achievement: 'rgba(168,85,247,0.1)'
    };
    return colors[type] ?? 'rgba(0,0,0,0.05)';
  }

  getTypeIconColor(type: string): string {
    const colors: Record<string, string> = {
      info:        '#3B82F6',
      success:     '#22C55E',
      warning:     '#F59E0B',
      achievement: '#A855F7'
    };
    return colors[type] ?? '#6B7280';
  }

  getTypeTag(type: string): string {
    const tags: Record<string, string> = {
      info:        'Informação',
      success:     'Sucesso',
      warning:     'Aviso',
      achievement: 'Conquista'
    };
    return tags[type] ?? 'Sistema';
  }

  // ─── Dados de exemplo ────────────────────────────────────────

  loadNotifications(): void {
    const now = new Date();
    const todayMinus = (h: number) =>
      new Date(now.getTime() - h * 3_600_000).toISOString();

    this.notifications = [
      {
        id: '1',
        type: 'achievement',
        title: 'Conquista desbloqueada: Arquivista Imperial',
        message: 'Atingiu 1500 pontos no arquivo. Continue a explorar o acervo histórico.',
        is_read: false,
        created_at: todayMinus(0.2)
      },
      {
        id: '2',
        type: 'success',
        title: 'Artigo publicado com sucesso',
        message: 'O seu artigo "Análise da Reforma Monetária" está agora disponível no arquivo.',
        is_read: false,
        created_at: todayMinus(2)
      },
      {
        id: '3',
        type: 'warning',
        title: 'Aviso de moderação',
        message: 'O seu comentário foi sinalizado. Por favor, reveja as regras da comunidade.',
        is_read: false,
        created_at: todayMinus(5)
      },
      {
        id: '4',
        type: 'info',
        title: 'Novos documentos disponíveis',
        message: 'Foram adicionados 5 documentos ao arquivo. Consulte a secção de Conteúdos.',
        is_read: true,
        created_at: todayMinus(50)
      },
      {
        id: '5',
        type: 'success',
        title: 'Pedido de acesso aprovado',
        message: 'O seu acesso ao Fundo Colonial 1950–1975 foi aprovado pelo administrador.',
        is_read: true,
        created_at: todayMinus(120)
      }
    ];
  }
}