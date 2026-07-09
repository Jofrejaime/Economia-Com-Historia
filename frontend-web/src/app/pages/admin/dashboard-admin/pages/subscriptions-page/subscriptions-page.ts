import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { firstValueFrom } from 'rxjs';
import {
  SubscriptionAdminService,
  AdminSubscription,
  SubscriptionStatus,
} from '../../../../../services/subscription-admin.service';

type StatusFilter = 'todos' | SubscriptionStatus;

@Component({
  selector: 'app-subscriptions-page',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './subscriptions-page.html',
  styleUrls: ['./subscriptions-page.css'],
})
export class SubscriptionsPageComponent implements OnInit {
  loading = false;
  actingId: string | null = null;
  errorMessage: string | null = null;
  successMessage: string | null = null;

  searchQuery = '';
  filterStatus: StatusFilter = 'PENDING';

  subscriptions: AdminSubscription[] = [];

  constructor(private subscriptionsAdmin: SubscriptionAdminService) {}

  ngOnInit(): void {
    void this.load();
  }

  get filtered(): AdminSubscription[] {
    const search = this.searchQuery.trim().toLowerCase();
    return this.subscriptions.filter((s) => {
      const matchStatus = this.filterStatus === 'todos' || s.status === this.filterStatus;
      const matchSearch =
        search === '' ||
        s.user_email.toLowerCase().includes(search) ||
        (s.user_display_name || '').toLowerCase().includes(search) ||
        s.document_title.toLowerCase().includes(search) ||
        (s.category_name || '').toLowerCase().includes(search);
      return matchStatus && matchSearch;
    });
  }

  get stats() {
    return {
      total: this.subscriptions.length,
      pending: this.subscriptions.filter((s) => s.status === 'PENDING').length,
      active: this.subscriptions.filter((s) => s.status === 'ACTIVE').length,
      rejected: this.subscriptions.filter((s) => s.status === 'REJECTED').length,
    };
  }

  async load(): Promise<void> {
    this.loading = true;
    this.errorMessage = null;

    const result = await firstValueFrom(this.subscriptionsAdmin.list());
    if (!result.ok || !result.data) {
      this.subscriptions = [];
      this.errorMessage = result.message || 'Não foi possível carregar os pedidos de subscrição.';
      this.loading = false;
      return;
    }

    this.subscriptions = result.data;
    this.loading = false;
  }

  async approve(sub: AdminSubscription): Promise<void> {
    await this.act(sub, () => this.subscriptionsAdmin.approve(sub.id), 'Pedido aprovado.');
  }

  async reject(sub: AdminSubscription): Promise<void> {
    if (!confirm(`Rejeitar o pedido de ${sub.user_email} para "${sub.document_title}"?`)) return;
    await this.act(sub, () => this.subscriptionsAdmin.reject(sub.id), 'Pedido rejeitado.');
  }

  async cancel(sub: AdminSubscription): Promise<void> {
    if (!confirm(`Cancelar o acesso de ${sub.user_email} a "${sub.document_title}"?`)) return;
    await this.act(sub, () => this.subscriptionsAdmin.cancel(sub.id), 'Subscrição cancelada.');
  }

  private async act(
    sub: AdminSubscription,
    action: () => ReturnType<SubscriptionAdminService['approve']>,
    successMsg: string,
  ): Promise<void> {
    this.actingId = sub.id;
    this.errorMessage = null;
    this.successMessage = null;

    const result = await firstValueFrom(action());
    if (!result.ok) {
      this.errorMessage = result.message || 'Não foi possível concluir a operação.';
      this.actingId = null;
      return;
    }

    this.successMessage = result.message || successMsg;
    this.actingId = null;
    await this.load();
  }

  getStatusLabel(status: string): string {
    const labels: Record<string, string> = {
      PENDING: 'Pendente',
      ACTIVE: 'Aprovada',
      REJECTED: 'Rejeitada',
      CANCELLED: 'Cancelada',
    };
    return labels[status] || status;
  }

  formatDate(value: string | null | undefined): string {
    if (!value) return '—';
    const d = new Date(value);
    return isNaN(d.getTime()) ? '—' : d.toLocaleDateString('pt-AO', { year: 'numeric', month: 'short', day: 'numeric' });
  }
}
