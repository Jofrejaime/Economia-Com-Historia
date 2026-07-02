import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { HeaderComponent } from '../../components/header/header';
import { FooterComponent } from '../../components/footer/footer';
import { NotificationService, AppNotification } from '../../services/notification.service';

interface NotificationGroup {
  label: string;
  notifications: AppNotification[];
}

type FilterType = 'all' | 'unread' | 'system' | 'achievement';
type VisualType = 'info' | 'success' | 'warning' | 'achievement';

@Component({
  selector: 'app-user-notifications',
  standalone: true,
  imports: [CommonModule, RouterModule, HeaderComponent, FooterComponent],
  templateUrl: './user-notifications.html',
  styleUrls: ['./user-notifications.css']
})
export class UserNotificationsComponent implements OnInit {
  notifications: AppNotification[] = [];
  activeFilter: FilterType = 'all';

  readonly filters: { key: FilterType; label: string }[] = [
    { key: 'all',         label: 'Todas'      },
    { key: 'unread',      label: 'Não lidas'  },
    { key: 'system',      label: 'Sistema'    },
    { key: 'achievement', label: 'Conquistas' }
  ];

  constructor(
    private notificationService: NotificationService,
    private cdr: ChangeDetectorRef
  ) {}

  async ngOnInit(): Promise<void> {
    this.loadNotifications();
  }

  async loadNotifications(): Promise<void> {
    try {
      this.notifications = await this.notificationService.getNotifications();
    } catch {
      this.notifications = [];
    } finally {
      this.cdr.detectChanges();
    }
  }

  getVisualType(rawType: string): VisualType {
    switch (rawType) {
      case 'reply_accepted': case 'access_approved': case 'document_published': return 'success';
      case 'moderation_warning': case 'report_action': return 'warning';
      case 'achievement': case 'badge_earned': case 'level_up': return 'achievement';
      default: return 'info';
    }
  }

  get unreadCount(): number { return this.notifications.filter(n => !n.is_read).length; }
  get hasUnread(): boolean { return this.unreadCount > 0; }

  setFilter(filter: FilterType): void {
    this.activeFilter = filter;
    this.cdr.detectChanges();
  }

  get filteredNotifications(): AppNotification[] {
    switch (this.activeFilter) {
      case 'unread': return this.notifications.filter(n => !n.is_read);
      case 'system': return this.notifications.filter(n => { const v = this.getVisualType(n.type); return v === 'info' || v === 'warning'; });
      case 'achievement': return this.notifications.filter(n => this.getVisualType(n.type) === 'achievement');
      default: return this.notifications;
    }
  }

  get groupedNotifications(): NotificationGroup[] {
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekStart = new Date(todayStart);
    weekStart.setDate(weekStart.getDate() - 7);
    const groups: NotificationGroup[] = [
      { label: 'Hoje', notifications: [] },
      { label: 'Esta semana', notifications: [] },
      { label: 'Anteriores', notifications: [] }
    ];
    for (const notif of this.filteredNotifications) {
      const date = new Date(notif.created_at);
      if (date >= todayStart) groups[0].notifications.push(notif);
      else if (date >= weekStart) groups[1].notifications.push(notif);
      else groups[2].notifications.push(notif);
    }
    return groups.filter(g => g.notifications.length > 0);
  }

  getRelativeTime(dateStr: string): string {
    const diff = Date.now() - new Date(dateStr).getTime();
    const minutes = Math.floor(diff / 60_000);
    const hours = Math.floor(diff / 3_600_000);
    const days = Math.floor(diff / 86_400_000);
    if (minutes < 1) return 'agora mesmo';
    if (minutes < 60) return `há ${minutes} min`;
    if (hours < 24) return `há ${hours}h`;
    if (days === 1) return 'ontem';
    if (days < 7) return `há ${days} dias`;
    return new Date(dateStr).toLocaleDateString('pt-PT', { day: '2-digit', month: 'short' });
  }

  async markAsRead(id: string): Promise<void> {
    try {
      await this.notificationService.markRead(id);
      const notif = this.notifications.find(n => n.id === id);
      if (notif) notif.is_read = true;
      this.cdr.detectChanges();
    } catch {}
  }

  async markAllAsRead(): Promise<void> {
    try {
      await this.notificationService.markAllRead();
      this.notifications.forEach(n => (n.is_read = true));
      this.cdr.detectChanges();
    } catch {}
  }

  async deleteNotification(event: Event, id: string): Promise<void> {
    event.stopPropagation();
    try {
      await this.notificationService.deleteNotification(id);
      this.notifications = this.notifications.filter(n => n.id !== id);
      this.cdr.detectChanges();
    } catch {}
  }

  getTypeBg(rawType: string): string {
    const colors: Record<VisualType, string> = { info: 'rgba(59,130,246,0.1)', success: 'rgba(34,197,94,0.1)', warning: 'rgba(245,158,11,0.1)', achievement: 'rgba(168,85,247,0.1)' };
    return colors[this.getVisualType(rawType)];
  }

  getTypeIconColor(rawType: string): string {
    const colors: Record<VisualType, string> = { info: '#3B82F6', success: '#22C55E', warning: '#F59E0B', achievement: '#A855F7' };
    return colors[this.getVisualType(rawType)];
  }

  getTypeTag(rawType: string): string {
    const tags: Record<VisualType, string> = { info: 'Informação', success: 'Sucesso', warning: 'Aviso', achievement: 'Conquista' };
    return tags[this.getVisualType(rawType)];
  }
}