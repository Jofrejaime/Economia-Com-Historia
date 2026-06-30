import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NotificationService, AppNotification } from '../../../../../services/notification.service';
import { AdminApiService, AdminUser } from '../../../../../services/admin-api.service';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-notifications-page',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './notifications-page.html',
  styleUrls: ['./notifications-page.css']
})
export class NotificationsPageComponent implements OnInit {
  searchQuery = '';
  filterRead = 'todos';
  showSendModal = false;
  error: string | null = null;
  isSending = false;

  notifications: AppNotification[] = [];
  users: AdminUser[] = [];

  newNotification = {
    title: '',
    message: '',
    type: 'info' as 'info' | 'success' | 'warning' | 'achievement',
    user_id: ''
  };

  constructor(
    private notificationService: NotificationService,
    private adminApi: AdminApiService,
    private cdr: ChangeDetectorRef
  ) {}

  async ngOnInit(): Promise<void> {
    this.loadNotifications();
    this.loadUsers();
  }

  private async loadNotifications(): Promise<void> {
    try {
      this.notifications = await this.notificationService.getNotifications();
    } catch {
      this.error = 'Erro ao carregar notificações.';
    } finally {
      this.cdr.detectChanges();
    }
  }

  private async loadUsers(): Promise<void> {
    const result = await firstValueFrom(this.adminApi.listUsers());
    if (result.ok && result.data) {
      this.users = result.data;
    }
    this.cdr.detectChanges();
  }

  get filteredNotifications(): AppNotification[] {
    return this.notifications.filter(n => {
      const matchSearch = this.searchQuery === '' ||
        n.title.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
        n.message.toLowerCase().includes(this.searchQuery.toLowerCase());
      const matchRead = this.filterRead === 'todos' ||
        (this.filterRead === 'unread' ? !n.is_read : n.is_read);
      return matchSearch && matchRead;
    });
  }

  getStats() {
    return {
      total: this.notifications.length,
      unread: this.notifications.filter(n => !n.is_read).length,
      read: this.notifications.filter(n => n.is_read).length,
    };
  }

  async markAsRead(id: string): Promise<void> {
    try {
      await this.notificationService.markRead(id);
      const notif = this.notifications.find(n => n.id === id);
      if (notif) {
        notif.is_read = true;
        notif.read_at = new Date().toISOString();
      }
      this.cdr.detectChanges();
    } catch {
      alert('Erro ao marcar como lida.');
    }
  }

  async deleteNotification(id: string): Promise<void> {
    if (!confirm('Eliminar esta notificação?')) return;
    try {
      await this.notificationService.deleteNotification(id);
      this.notifications = this.notifications.filter(n => n.id !== id);
      this.cdr.detectChanges();
    } catch {
      alert('Erro ao eliminar notificação.');
    }
  }

  openSendNotificationModal(): void {
    this.newNotification = { title: '', message: '', type: 'info', user_id: '' };
    this.showSendModal = true;
  }

  closeSendModal(): void {
    this.showSendModal = false;
  }

  async sendNotification(): Promise<void> {
    if (!this.newNotification.title.trim() || !this.newNotification.message.trim()) {
      alert('Preencha todos os campos obrigatórios');
      return;
    }

    if (!this.newNotification.user_id) {
      alert('Selecione um destinatário. O envio em massa não está disponível.');
      return;
    }

    this.isSending = true;
    this.cdr.detectChanges();

    try {
      await this.notificationService.send({
        user_id: this.newNotification.user_id,
        type: this.newNotification.type,
        title: this.newNotification.title,
        message: this.newNotification.message,
      });
      this.closeSendModal();
      this.loadNotifications();
    } catch (err: any) {
      alert(err?.error?.message ?? 'Erro ao enviar notificação.');
    } finally {
      this.isSending = false;
      this.cdr.detectChanges();
    }
  }
}