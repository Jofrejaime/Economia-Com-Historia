import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../environments/environment';
import { AuthService } from './auth.service';

export interface AppNotification {
  id: string;
  type: string;
  title: string;
  message: string;
  reference_id: string | null;
  reference_type: string | null;
  is_read: boolean;
  read_at: string | null;
  created_at: string;
}

@Injectable({ providedIn: 'root' })
export class NotificationService {
  private readonly base = `${environment.apiBaseUrl}/api`;

  constructor(private http: HttpClient, private auth: AuthService) {}

  private get headers(): Record<string, string> {
    const token = this.auth.getToken();
    return token ? this.auth.getAuthHeaders(token) : { Accept: 'application/json' };
  }

  async getNotifications(): Promise<AppNotification[]> {
    const res = await firstValueFrom(
      this.http.get<{ data: AppNotification[] }>(`${this.base}/notifications`, {
        headers: this.headers,
      })
    );
    return res.data;
  }

  async markRead(id: string): Promise<void> {
    await firstValueFrom(
      this.http.patch(`${this.base}/notifications/${id}/read`, {}, { headers: this.headers })
    );
  }

  async markAllRead(): Promise<void> {
    await firstValueFrom(
      this.http.patch(`${this.base}/notifications/read-all`, {}, { headers: this.headers })
    );
  }

  async deleteNotification(id: string): Promise<void> {
    await firstValueFrom(
      this.http.delete(`${this.base}/notifications/${id}`, { headers: this.headers })
    );
  }
}