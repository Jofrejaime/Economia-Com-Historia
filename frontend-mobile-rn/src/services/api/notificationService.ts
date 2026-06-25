import { httpClient } from '../http/client';
import { API_ENDPOINTS } from '../../constants/api';
import type { Notification, PaginatedResponse } from '../../types/api';

export const notificationService = {
  async list(page = 1): Promise<PaginatedResponse<Notification>> {
    const { data } = await httpClient.get(API_ENDPOINTS.NOTIFICATIONS.LIST, {
      params: { page },
    });
    return data;
  },

  async markAsRead(id: string): Promise<void> {
    await httpClient.patch(API_ENDPOINTS.NOTIFICATIONS.MARK_READ(id));
  },

  async markAllAsRead(): Promise<void> {
    await httpClient.patch(API_ENDPOINTS.NOTIFICATIONS.MARK_ALL_READ);
  },

  async delete(id: string): Promise<void> {
    await httpClient.delete(API_ENDPOINTS.NOTIFICATIONS.DELETE(id));
  },
};
