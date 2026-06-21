import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { HeaderComponent } from '../../components/header/header'; // AJUSTAR O CAMINHO
import { FooterComponent } from '../../components/footer/footer'; // AJUSTAR O CAMINHO

interface Notification {
  id: string;
  type: 'info' | 'success' | 'warning' | 'achievement';
  title: string;
  message: string;
  is_read: boolean;
  created_at: string;
}

@Component({
  selector: 'app-user-notifications',
  standalone: true,
  imports: [
    CommonModule, 
    RouterModule,
    HeaderComponent,  // ADICIONAR
    FooterComponent   // ADICIONAR
  ],
  templateUrl: './user-notifications.html',
  styleUrls: ['./user-notifications.css']
})
export class UserNotificationsComponent implements OnInit {
  notifications: Notification[] = [];

  ngOnInit(): void {
    this.loadNotifications();
  }

  get unreadCount(): number {
    return this.notifications.filter(n => !n.is_read).length;
  }

  get hasUnread(): boolean {
    return this.unreadCount > 0;
  }

  loadNotifications(): void {
    // Em produção: buscar do backend
    this.notifications = [
      {
        id: '1',
        type: 'achievement',
        title: '🏅 Badge Conquistado!',
        message: 'Parabéns! Você conquistou o badge "Arquivista Imperial" por alcançar 1500 pontos.',
        is_read: false,
        created_at: '2024-06-15T10:30:00Z'
      },
      {
        id: '2',
        type: 'success',
        title: 'Conteúdo Publicado',
        message: 'O seu artigo "Análise da Reforma Monetária" foi publicado com sucesso.',
        is_read: false,
        created_at: '2024-06-14T10:00:00Z'
      },
      {
        id: '3',
        type: 'warning',
        title: 'Aviso de Moderação',
        message: 'O seu comentário foi sinalizado por linguagem inadequada. Por favor, reveja as regras da comunidade.',
        is_read: true,
        created_at: '2024-06-12T16:45:00Z'
      },
      {
        id: '4',
        type: 'info',
        title: 'Novos Conteúdos Disponíveis',
        message: 'Foram adicionados 5 novos documentos ao arquivo. Consulte a secção "Conteúdos" para mais informações.',
        is_read: true,
        created_at: '2024-06-10T08:00:00Z'
      }
    ];
  }

  markAsRead(id: string): void {
    const notif = this.notifications.find(n => n.id === id);
    if (notif) {
      notif.is_read = true;
    }
  }

  markAllAsRead(): void {
    this.notifications.forEach(n => n.is_read = true);
  }

  getTypeIcon(type: string): string {
    const icons: Record<string, string> = {
      info: 'ℹ️',
      success: '✅',
      warning: '⚠️',
      achievement: '🏅'
    };
    return icons[type] || '📌';
  }

  getTypeBg(type: string): string {
    const colors: Record<string, string> = {
      info: 'rgba(59,130,246,0.1)',
      success: 'rgba(34,197,94,0.1)',
      warning: 'rgba(245,158,11,0.1)',
      achievement: 'rgba(139,30,45,0.1)'
    };
    return colors[type] || 'rgba(0,0,0,0.05)';
  }
}