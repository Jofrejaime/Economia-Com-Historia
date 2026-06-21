import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface Notification {
  id: string;
  user_id: string;
  user_name?: string;
  type: 'info' | 'success' | 'warning' | 'achievement';
  title: string;
  message: string;
  is_read: boolean;
  read_at: string | null;
  created_at: string;
}

interface User {
  id: string;
  name: string;
}

@Component({
  selector: 'app-notifications-page',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './notifications-page.html',
  styleUrls: ['./notifications-page.css']
})
export class NotificationsPageComponent {
  searchQuery = '';
  filterRead = 'todos';
  showSendModal = false;

  newNotification = {
    title: '',
    message: '',
    type: 'info' as 'info' | 'success' | 'warning' | 'achievement',
    user_id: ''
  };

  users: User[] = [
    { id: '1', name: 'Dr. Manuel Costa' },
    { id: '2', name: 'Dra. Ana Silva' },
    { id: '3', name: 'Prof. Carlos Mendes' }
  ];

  notifications: Notification[] = [
    {
      id: '1',
      user_id: '1',
      user_name: 'Dr. Manuel Costa',
      type: 'achievement',
      title: 'Badge Conquistado',
      message: 'Parabéns! Você conquistou o badge "Arquivista Imperial" por alcançar 1500 pontos.',
      is_read: false,
      read_at: null,
      created_at: '2024-06-15T10:30:00Z'
    },
    {
      id: '2',
      user_id: '2',
      user_name: 'Dra. Ana Silva',
      type: 'success',
      title: 'Conteúdo Publicado',
      message: 'O seu artigo "Análise da Reforma Monetária" foi publicado com sucesso.',
      is_read: true,
      read_at: '2024-06-14T14:00:00Z',
      created_at: '2024-06-14T10:00:00Z'
    }
  ];

  get filteredNotifications(): Notification[] {
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
      read: this.notifications.filter(n => n.is_read).length
    };
  }

  markAsRead(id: string): void {
    const notif = this.notifications.find(n => n.id === id);
    if (notif) {
      notif.is_read = true;
      notif.read_at = new Date().toISOString();
    }
  }

  deleteNotification(id: string): void {
    if (confirm('Eliminar esta notificação?')) {
      this.notifications = this.notifications.filter(n => n.id !== id);
    }
  }

  openSendNotificationModal(): void {
    this.newNotification = { title: '', message: '', type: 'info', user_id: '' };
    this.showSendModal = true;
  }

  closeSendModal(): void {
    this.showSendModal = false;
  }

  sendNotification(): void {
    if (!this.newNotification.title.trim() || !this.newNotification.message.trim()) {
      alert('Preencha todos os campos obrigatórios');
      return;
    }
    
    const newNotif: Notification = {
      id: Date.now().toString(),
      user_id: this.newNotification.user_id || '',
      user_name: this.newNotification.user_id ? 
        this.users.find(u => u.id === this.newNotification.user_id)?.name : 'Todos',
      type: this.newNotification.type,
      title: this.newNotification.title,
      message: this.newNotification.message,
      is_read: false,
      read_at: null,
      created_at: new Date().toISOString()
    };
    
    this.notifications.unshift(newNotif);
    this.closeSendModal();
  }
}