import React, { createContext, useState, useCallback, useEffect, ReactNode } from 'react';
import NotificationService, { Notification, NotificationPreferences } from '../services/api/notificationService';

export interface NotificationContextType {
  // Estado
  notifications: Notification[];
  unreadCount: number;
  loading: boolean;
  error: string | null;
  preferences: NotificationPreferences | null;

  // Actions
  fetchNotifications: (page?: number, limit?: number) => Promise<void>;
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  deleteNotification: (id: string) => Promise<void>;
  deleteAllNotifications: () => Promise<void>;
  fetchPreferences: () => Promise<void>;
  updatePreferences: (preferences: Partial<NotificationPreferences>) => Promise<void>;
  clearError: () => void;
  reset: () => void;
}

export const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

interface NotificationProviderProps {
  children: ReactNode;
}

export function NotificationProvider({ children }: NotificationProviderProps) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [preferences, setPreferences] = useState<NotificationPreferences | null>(null);

  // ============ FETCH NOTIFICATIONS ============
  const fetchNotifications = useCallback(async (page = 1, limit = 20) => {
    setLoading(true);
    setError(null);
    try {
      const response = await NotificationService.fetchNotifications(page, limit);
      setNotifications(response.notifications);
      setUnreadCount(response.unreadCount);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao buscar notificações';
      setError(message);
      console.error('NotificationContext - fetchNotifications error:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // ============ MARK AS READ ============
  const markAsRead = useCallback(async (id: string) => {
    try {
      await NotificationService.markAsRead(id);
      // Atualizar estado local imediatamente para melhor UX
      setNotifications((prev) =>
        prev.map((notif) =>
          notif.id === id ? { ...notif, isNew: false } : notif
        )
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao marcar como lido';
      setError(message);
      console.error('NotificationContext - markAsRead error:', err);
    }
  }, []);

  // ============ MARK ALL AS READ ============
  const markAllAsRead = useCallback(async () => {
    try {
      await NotificationService.markAllAsRead();
      setNotifications((prev) =>
        prev.map((notif) => ({ ...notif, isNew: false }))
      );
      setUnreadCount(0);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao marcar todos como lidos';
      setError(message);
      console.error('NotificationContext - markAllAsRead error:', err);
    }
  }, []);

  // ============ DELETE NOTIFICATION ============
  const deleteNotification = useCallback(async (id: string) => {
    try {
      await NotificationService.deleteNotification(id);
      setNotifications((prev) => {
        const notif = prev.find((n) => n.id === id);
        if (notif?.isNew) {
          setUnreadCount((count) => Math.max(0, count - 1));
        }
        return prev.filter((n) => n.id !== id);
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao deletar notificação';
      setError(message);
      console.error('NotificationContext - deleteNotification error:', err);
    }
  }, []);

  // ============ DELETE ALL NOTIFICATIONS ============
  const deleteAllNotifications = useCallback(async () => {
    try {
      await NotificationService.deleteAllNotifications();
      setNotifications([]);
      setUnreadCount(0);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao deletar notificações';
      setError(message);
      console.error('NotificationContext - deleteAllNotifications error:', err);
    }
  }, []);

  // ============ FETCH PREFERENCES ============
  const fetchPreferences = useCallback(async () => {
    try {
      const prefs = await NotificationService.fetchPreferences();
      setPreferences(prefs);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao buscar preferências';
      setError(message);
      console.error('NotificationContext - fetchPreferences error:', err);
    }
  }, []);

  // ============ UPDATE PREFERENCES ============
  const updatePreferences = useCallback(async (newPrefs: Partial<NotificationPreferences>) => {
    try {
      const updated = await NotificationService.updatePreferences(newPrefs);
      setPreferences(updated);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao atualizar preferências';
      setError(message);
      console.error('NotificationContext - updatePreferences error:', err);
    }
  }, []);

  // ============ CLEAR ERROR ============
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // ============ RESET ============
  const reset = useCallback(() => {
    setNotifications([]);
    setUnreadCount(0);
    setLoading(false);
    setError(null);
    setPreferences(null);
  }, []);

  // ============ FETCH ON MOUNT ============
  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  const value: NotificationContextType = {
    notifications,
    unreadCount,
    loading,
    error,
    preferences,
    fetchNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    deleteAllNotifications,
    fetchPreferences,
    updatePreferences,
    clearError,
    reset,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
}
