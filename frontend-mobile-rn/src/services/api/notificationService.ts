import { httpClient } from '../http/client';
import { API_ENDPOINTS } from '../../constants/api';

export interface Notification {
  id: string;
  type: 'content' | 'security' | 'achievement' | 'community' | 'system';
  title: string;
  description: string;
  time: string;
  isNew: boolean;
  icon: string;
  data?: Record<string, any>;
}

export interface NotificationPreferences {
  emailNotifications: boolean;
  pushNotifications: boolean;
  contentNotifications: boolean;
  communityNotifications: boolean;
  achievementNotifications: boolean;
}

/**
 * NotificationService - Gerencia todas as operações relacionadas a notificações
 * Centraliza chamadas à API e lógica de negócio
 */
export class NotificationService {
  /**
   * Busca lista de notificações do usuário
   */
  static async fetchNotifications(
    page: number = 1,
    limit: number = 20
  ): Promise<{ notifications: Notification[]; total: number; unreadCount: number }> {
    try {
      const { data } = await httpClient.get(API_ENDPOINTS.NOTIFICATIONS.LIST, {
        params: { page, limit },
      });
      return data;
    } catch (error) {
      console.error('Erro ao buscar notificações:', error);
      throw error;
    }
  }

  /**
   * Busca uma notificação específica
   */
  static async fetchNotification(id: string): Promise<Notification> {
    try {
      const { data } = await httpClient.get(API_ENDPOINTS.NOTIFICATIONS.DETAIL(id));
      return data;
    } catch (error) {
      console.error(`Erro ao buscar notificação ${id}:`, error);
      throw error;
    }
  }

  /**
   * Marca uma notificação como lida
   */
  static async markAsRead(id: string): Promise<void> {
    try {
      await httpClient.patch(API_ENDPOINTS.NOTIFICATIONS.MARK_READ(id));
    } catch (error) {
      console.error(`Erro ao marcar notificação ${id} como lida:`, error);
      throw error;
    }
  }

  /**
   * Marca todas as notificações como lidas
   */
  static async markAllAsRead(): Promise<void> {
    try {
      await httpClient.patch(API_ENDPOINTS.NOTIFICATIONS.MARK_ALL_READ);
    } catch (error) {
      console.error('Erro ao marcar todas as notificações como lidas:', error);
      throw error;
    }
  }

  /**
   * Deleta uma notificação
   */
  static async deleteNotification(id: string): Promise<void> {
    try {
      await httpClient.delete(API_ENDPOINTS.NOTIFICATIONS.DELETE(id));
    } catch (error) {
      console.error(`Erro ao deletar notificação ${id}:`, error);
      throw error;
    }
  }

  /**
   * Deleta todas as notificações
   */
  static async deleteAllNotifications(): Promise<void> {
    try {
      await httpClient.delete(API_ENDPOINTS.NOTIFICATIONS.DELETE_ALL);
    } catch (error) {
      console.error('Erro ao deletar todas as notificações:', error);
      throw error;
    }
  }

  /**
   * Busca preferências de notificações do usuário
   */
  static async fetchPreferences(): Promise<NotificationPreferences> {
    try {
      const { data } = await httpClient.get(API_ENDPOINTS.NOTIFICATIONS.PREFERENCES);
      return data;
    } catch (error) {
      console.error('Erro ao buscar preferências de notificações:', error);
      throw error;
    }
  }

  /**
   * Atualiza preferências de notificações do usuário
   */
  static async updatePreferences(preferences: Partial<NotificationPreferences>): Promise<NotificationPreferences> {
    try {
      const { data } = await httpClient.patch(
        API_ENDPOINTS.NOTIFICATIONS.UPDATE_PREFERENCES,
        preferences
      );
      return data;
    } catch (error) {
      console.error('Erro ao atualizar preferências de notificações:', error);
      throw error;
    }
  }

  /**
   * Conta notificações não lidas
   */
  static async getUnreadCount(): Promise<number> {
    try {
      const { data } = await httpClient.get(`${API_ENDPOINTS.NOTIFICATIONS.LIST}/unread-count`);
      return data.count;
    } catch (error) {
      console.error('Erro ao contar notificações não lidas:', error);
      throw error;
    }
  }

  /**
   * Subscreve a notificações em tempo real (WebSocket)
   * TODO: Implementar com WebSocket quando backend estiver pronto
   */
  static subscribeToRealtime(
    onNotification: (notification: Notification) => void,
    onError: (error: Error) => void
  ): () => void {
    console.warn('Real-time notifications não implementado ainda');
    return () => {};
  }
}

export default NotificationService;
