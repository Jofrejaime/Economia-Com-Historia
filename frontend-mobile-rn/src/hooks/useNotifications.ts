import { useContext } from 'react';
import { NotificationContext, NotificationContextType } from '../context/NotificationContext';

/**
 * Hook para acessar contexto de notificações
 * @throws Erro se usado fora de NotificationProvider
 * @returns Contexto de notificações com todas as ações disponíveis
 *
 * @example
 * const { notifications, markAsRead, unreadCount } = useNotifications();
 */
export const useNotifications = (): NotificationContextType => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error(
      'useNotifications deve ser usado dentro de NotificationProvider. ' +
      'Certifique-se de que <NotificationProvider> está envolvendo sua aplicação.'
    );
  }
  return context;
};

export default useNotifications;
