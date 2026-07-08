import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { AdminApiService } from '../../../../../services/admin-api.service';

interface KpiCard {
  label: string;
  value: string;
  leftBorderColor?: string;
  valueColor?: string;
  variant: {
    type: 'trend' | 'alert' | 'progress' | 'avatar' | 'simple';
    badge?: string;
    badgeLabel?: string;
    positive?: boolean;
    subValue?: string;
    progress?: number;
    avatarColors?: string[];
    subtext?: string;
  };
}

interface RecentActivity {
  icon: string;
  title: string;
  description: string;
  time: string;
  type: 'button' | 'badge';
  buttonText?: string;
  buttonOutline?: boolean;
  badgeText?: string;
  badgeClass?: string;
  route?: string;
}

interface CategoriesSummary {
  total: number;
  free: number;
  requires_subscription: number;
}

@Component({
  selector: 'app-overview-page',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './overview-page.html',
  styleUrls: ['./overview-page.css']
})
export class OverviewPageComponent implements OnInit {
  currentYear = new Date().getFullYear();
  loading = false;
  errorMessage: string | null = null;

  kpiCards: KpiCard[] = [
    {
      label: 'TOTAL UTILIZADORES',
      value: '0',
      variant: {
        type: 'trend',
        badge: '+0%',
        badgeLabel: 'vs. mês passado',
        positive: true
      }
    },
    {
      label: 'PEDIDOS DE ACESSO',
      value: '0',
      leftBorderColor: '#ba1a1a',
      variant: {
        type: 'alert',
        badge: 'PENDENTES'
      }
    },
    {
      label: 'CONTEÚDO PUBLICADO',
      value: '0',
      variant: {
        type: 'progress',
        subValue: '/ 0 em revisão',
        progress: 0
      }
    },
    {
      label: 'TÓPICOS ATIVOS (48H)',
      value: '0',
      valueColor: '#fbbf24',
      variant: {
        type: 'avatar',
        avatarColors: ['#cbd5e1', '#94a3b8', '#6b0119']
      }
    },
    {
      label: 'NOVOS MEMBROS',
      value: '0',
      variant: {
        type: 'simple',
        subtext: 'hoje'
      }
    }
  ];

  categoriesSummary: CategoriesSummary | null = null;

  recentActivities: RecentActivity[] = [];

  footerLinks = {
    administracao: ['Manual do Curador', 'Auditoria de Acessos', 'Protocolos de Segurança'],
    institucional: ['Repositório Central', 'Parcerias Académicas', 'Publicações'],
    legal: ['Política de Privacidade', 'Termos de Utilização', 'Direitos de Propriedade']
  };

  constructor(private adminApi: AdminApiService, private cdr: ChangeDetectorRef) {}

  ngOnInit(): void {
    void this.loadSummary();
  }

  async loadSummary(): Promise<void> {
    this.loading = true;
    this.errorMessage = null;
    this.cdr.detectChanges();

    const result = await firstValueFrom(this.adminApi.getSummary());

    if (!result) {
      this.errorMessage = 'Não foi possível carregar o resumo administrativo.';
      this.loading = false;
      this.cdr.detectChanges();
      return;
    }

    if (!result.ok || !result.data) {
      this.errorMessage = result.message || 'Não foi possível carregar o resumo administrativo.';
      this.loading = false;
      this.cdr.detectChanges();
      return;
    }

    const data = result.data;
    const publishedDocuments = data.documents.published;
    const archivedDocuments = data.documents.archived;
    const openTopics = data.community.topics_open;

    this.kpiCards = [
      {
        label: 'TOTAL UTILIZADORES',
        value: this.formatNumber(data.users.total),
        variant: {
          type: 'trend',
          badge: `+${this.formatPercent(data.users.new_today, data.users.total)}%`,
          badgeLabel: 'hoje',
          positive: data.users.new_today >= 0
        }
      },
      {
        label: 'CONTEÚDO PUBLICADO',
        value: this.formatNumber(publishedDocuments),
        variant: {
          type: 'progress',
          subValue: ` / ${this.formatNumber(archivedDocuments)} arquivados`,
          progress: this.calculateProgress(publishedDocuments, publishedDocuments + archivedDocuments)
        }
      },
      {
        label: 'TÓPICOS ATIVOS (48H)',
        value: this.formatNumber(openTopics),
        valueColor: '#fbbf24',
        variant: {
          type: 'avatar',
          avatarColors: ['#cbd5e1', '#94a3b8', '#6b0119']
        }
      },
      {
        label: 'NOVOS MEMBROS',
        value: this.formatNumber(data.users.new_today),
        variant: {
          type: 'simple',
          subtext: 'hoje'
        }
      }
    ];

    this.categoriesSummary = (data as any).categories ?? null;

    this.recentActivities = data.recent_activity.map((item: Record<string, unknown>): RecentActivity => ({
      icon: (item['icon'] as string) || 'neutral',
      title: (item['title'] as string) || 'Atividade',
      description: (item['description'] as string) || '',
      time: this.formatRelativeTime(item['time'] as string | undefined),
      type: (item['type'] as 'button' | 'badge') || 'button',
      buttonText: item['buttonText'] as string | undefined,
      buttonOutline: item['buttonOutline'] as boolean | undefined,
      badgeText: item['badgeText'] as string | undefined,
      badgeClass: item['badgeClass'] as string | undefined,
      route: item['route'] as string | undefined,
    }));

    this.loading = false;
    this.cdr.detectChanges();
  }

  getIconClass(icon: string): string {
    switch(icon) {
      case 'bordeaux': return 'icon-bordeaux';
      case 'success': return 'icon-success';
      case 'warning': return 'icon-warning';
      default: return 'icon-neutral';
    }
  }

  getBadgeClass(badgeClass: string): string {
    return badgeClass === 'success' ? 'badge-success' : 'badge-neutral';
  }

  private formatNumber(value: number): string {
    return new Intl.NumberFormat('pt-PT').format(value);
  }

  private formatPercent(part: number, total: number): string {
    if (total === 0) {
      return '0.0';
    }

    return ((part / total) * 100).toFixed(1);
  }

  private calculateProgress(value: number, total: number): number {
    if (total <= 0) {
      return 0;
    }

    return Math.max(0, Math.min(100, Math.round((value / total) * 100)));
  }

  private formatRelativeTime(value?: string): string {
    if (!value) {
      return 'agora';
    }

    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
      return 'agora';
    }

    const diffMinutes = Math.max(0, Math.floor((Date.now() - date.getTime()) / 60000));
    if (diffMinutes < 60) {
      return `há ${diffMinutes} min`;
    }

    const diffHours = Math.floor(diffMinutes / 60);
    return `há ${diffHours} h`;
  }
}