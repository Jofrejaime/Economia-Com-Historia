import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BadgeAdminService } from '../../../../../services/badge-admin.service';
import { GamificationAdminService } from '../../../../../services/gamification-admin.service';
import { Badge, BadgePayload, BadgeStats } from '../../../../../models/badge-admin.models';
import {
  GamificationDashboard,
  Leaderboard,
  LeaderboardEntry,
  LeaderboardSnapshot,
  PointTransaction,
  QuizAttempt,
  PaginatedResult,
} from '../../../../../models/gamification-admin.models';

type BannerType = 'info' | 'success' | 'error';

@Component({
  selector: 'app-gamification-page',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './gamification-page.html',
  styleUrls: ['./gamification-page.css']
})
export class GamificationPageComponent implements OnInit {
  activeTab: 'dashboard' | 'badges' | 'leaderboard' | 'transactions' | 'attempts' = 'dashboard';

  // Loaders & Errors
  loading = false;
  saving = false;
  errorMessage = '';

  // Banner (substitui os alert())
  banner: { type: BannerType; text: string } | null = null;
  private bannerTimer: any = null;

  // Modal de confirmação (substitui os confirm())
  confirmModal: { title: string; message: string } | null = null;
  private pendingConfirm: (() => void) | null = null;

  // Tab 1: Dashboard Data
  dashboardData: GamificationDashboard | null = null;

  // Tab 2: Badges Data
  badges: Badge[] = [];
  badgeStats: BadgeStats = { total: 0, active: 0, earned: 0 };
  showBadgeModal = false;
  editingBadge: Badge | null = null;
  badgeForm: BadgePayload = this.emptyBadgeForm();

  // Badge Manual Assignment & Recalculation
  showAssignModal = false;
  selectedBadgeForAssign: Badge | null = null;
  assignUserId = '';
  assignAction: 'assign' | 'remove' = 'assign';

  // Tab 3: Leaderboard Data
  leaderboardData: Leaderboard | null = null;
  leaderboardScope: 'national' | 'provincial' | 'institutional' = 'national';
  leaderboardProvince = '';
  leaderboardInstitution = '';
  snapshots: LeaderboardSnapshot[] = [];

  // Tab 4: Point Transactions
  transactions: PointTransaction[] = [];
  txTotalCount = 0;
  txCurrentPage = 1;
  txPerPage = 10;
  txLastPage = 1;
  txSearch = '';
  txReason = '';
  txType = '';
  txDateFrom = '';
  txDateTo = '';
  txStats: any = null;
  selectedTx: PointTransaction | null = null;

  // Ajuste manual de pontos
  adjustUserId = '';
  adjustPoints: number | null = null;
  adjustDescription = '';
  adjusting = false;

  // Tab 5: Quiz Attempts
  attempts: QuizAttempt[] = [];
  attemptTotalCount = 0;
  attemptCurrentPage = 1;
  attemptPerPage = 10;
  attemptLastPage = 1;
  attemptSearch = '';
  attemptStatus = '';
  attemptMinScore = '';
  attemptMaxScore = '';
  attemptStats: any = null;
  selectedAttempt: QuizAttempt | null = null;

  constructor(
    private badgeAdminService: BadgeAdminService,
    private gamificationAdminService: GamificationAdminService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.switchTab('dashboard');
  }

  // ==========================================
  // BANNER & CONFIRM (substituem alert/confirm)
  // ==========================================
  notify(type: BannerType, text: string): void {
    clearTimeout(this.bannerTimer);
    this.banner = { type, text };
    this.cdr.detectChanges();
    this.bannerTimer = setTimeout(() => {
      this.banner = null;
      this.cdr.detectChanges();
    }, 5000);
  }

  dismissBanner(): void {
    clearTimeout(this.bannerTimer);
    this.banner = null;
    this.cdr.detectChanges();
  }

  private askConfirm(title: string, message: string, action: () => void): void {
    this.confirmModal = { title, message };
    this.pendingConfirm = action;
    this.cdr.detectChanges();
  }

  closeConfirmModal(): void {
    this.confirmModal = null;
    this.pendingConfirm = null;
    this.cdr.detectChanges();
  }

  proceedConfirm(): void {
    const action = this.pendingConfirm;
    this.confirmModal = null;
    this.pendingConfirm = null;
    action?.();
  }

  switchTab(tab: 'dashboard' | 'badges' | 'leaderboard' | 'transactions' | 'attempts'): void {
    this.activeTab = tab;
    this.errorMessage = '';
    this.cdr.detectChanges();

    if (tab === 'dashboard') {
      this.loadDashboard();
    } else if (tab === 'badges') {
      this.loadBadges();
    } else if (tab === 'leaderboard') {
      this.loadLeaderboard();
      this.loadSnapshots();
    } else if (tab === 'transactions') {
      this.txCurrentPage = 1;
      this.loadTransactions();
    } else if (tab === 'attempts') {
      this.attemptCurrentPage = 1;
      this.loadAttempts();
    }
  }

  // ==========================================
  // TAB 1: DASHBOARD METHODS
  // ==========================================
  loadDashboard(): void {
    this.loading = true;
    this.cdr.detectChanges();

    this.gamificationAdminService.getDashboard().subscribe({
      next: result => {
        this.loading = false;
        if (result.ok && result.data) {
          this.dashboardData = result.data;
        } else {
          this.errorMessage = result.message ?? 'Erro ao carregar dashboard de gamificação';
        }
        this.cdr.detectChanges();
      },
      error: () => {
        this.loading = false;
        this.errorMessage = 'Erro de comunicação com o servidor.';
        this.cdr.detectChanges();
      },
    });

    // O card "Total de Badges" usa badgeStats — carrega as stats em paralelo,
    // sem afetar o loading principal do dashboard.
    this.badgeAdminService.getBadges().subscribe({
      next: result => {
        if (result.ok) {
          const list = result.data ?? [];
          this.badgeStats = result.stats ?? {
            total: list.length,
            active: list.filter(b => b.is_active).length,
            earned: 0,
          };
          this.cdr.detectChanges();
        }
      },
      error: () => { /* silencioso: o card fica a 0 e o resto do dashboard funciona */ },
    });
  }

  // ==========================================
  // TAB 2: BADGES METHODS
  // ==========================================
  loadBadges(): void {
    this.loading = true;
    this.cdr.detectChanges();

    this.badgeAdminService.getBadges().subscribe({
      next: result => {
        this.loading = false;
        if (result.ok) {
          this.badges = result.data ?? [];
          this.badgeStats = result.stats ?? {
            total: this.badges.length,
            active: this.badges.filter(b => b.is_active).length,
            earned: 0
          };
        } else {
          this.errorMessage = result.message ?? 'Erro ao carregar badges';
        }
        this.cdr.detectChanges();
      },
      error: () => {
        this.loading = false;
        this.errorMessage = 'Erro de comunicação com o servidor.';
        this.cdr.detectChanges();
      },
    });
  }

  openAddBadgeModal(): void {
    this.editingBadge = null;
    this.badgeForm = this.emptyBadgeForm();
    this.showBadgeModal = true;
    this.cdr.detectChanges();
  }

  openEditBadgeModal(badge: Badge): void {
    this.editingBadge = badge;
    this.badgeForm = {
      name: badge.name,
      description: badge.description,
      icon_url: badge.icon_url,
      color_hex: badge.color_hex ?? '#8b1e2d',
      category: badge.category ?? 'Geral',
      criteria_type: badge.criteria_type,
      criteria_value: badge.criteria_value,
      is_active: badge.is_active,
    };
    this.showBadgeModal = true;
    this.cdr.detectChanges();
  }

  closeBadgeModal(): void {
    this.showBadgeModal = false;
    this.editingBadge = null;
    this.cdr.detectChanges();
  }

  saveBadge(): void {
    if (!this.badgeForm.name.trim() || !this.badgeForm.description.trim()) {
      this.notify('error', 'Preencha os campos obrigatórios (nome e descrição).');
      return;
    }

    this.saving = true;
    this.cdr.detectChanges();

    const request$ = this.editingBadge
      ? this.badgeAdminService.updateBadge(this.editingBadge.id, this.badgeForm)
      : this.badgeAdminService.createBadge(this.badgeForm);

    request$.subscribe({
      next: result => {
        this.saving = false;
        if (result.ok) {
          this.closeBadgeModal();
          this.notify('success', this.editingBadge ? 'Badge atualizado com sucesso.' : 'Badge criado com sucesso.');
          this.loadBadges();
        } else {
          this.notify('error', result.message ?? 'Erro ao guardar badge');
        }
        this.cdr.detectChanges();
      },
      error: () => {
        this.saving = false;
        this.notify('error', 'Erro de comunicação com o servidor.');
      },
    });
  }

  toggleBadgeStatus(badge: Badge): void {
    this.badgeAdminService.toggleStatus(badge.id).subscribe({
      next: result => {
        if (result.ok) {
          this.notify('success', `Badge "${badge.name}" ${badge.is_active ? 'desativado' : 'ativado'}.`);
          this.loadBadges();
        } else {
          this.notify('error', result.message ?? 'Erro ao alternar status do badge');
        }
      },
      error: () => this.notify('error', 'Erro de comunicação com o servidor.'),
    });
  }

  deleteBadge(badge: Badge): void {
    this.askConfirm(
      'Eliminar Badge',
      `Tem a certeza que deseja eliminar o badge "${badge.name}"? Esta ação não pode ser desfeita.`,
      () => {
        this.badgeAdminService.deleteBadge(badge.id).subscribe({
          next: result => {
            if (result.ok) {
              this.notify('success', `Badge "${badge.name}" eliminado.`);
              this.loadBadges();
            } else {
              this.notify('error', result.message ?? 'Erro ao eliminar badge');
            }
          },
          error: () => this.notify('error', 'Erro de comunicação com o servidor.'),
        });
      }
    );
  }

  openAssignModal(badge: Badge, action: 'assign' | 'remove'): void {
    this.selectedBadgeForAssign = badge;
    this.assignAction = action;
    this.assignUserId = '';
    this.showAssignModal = true;
    this.cdr.detectChanges();
  }

  closeAssignModal(): void {
    this.showAssignModal = false;
    this.selectedBadgeForAssign = null;
    this.cdr.detectChanges();
  }

  submitAssignment(): void {
    if (!this.assignUserId.trim()) {
      this.notify('error', 'Introduza o ID do utilizador (UUID).');
      return;
    }
    if (!this.selectedBadgeForAssign) return;

    this.saving = true;
    this.cdr.detectChanges();

    const request$ = this.assignAction === 'assign'
      ? this.badgeAdminService.assignBadge(this.selectedBadgeForAssign.id, this.assignUserId.trim())
      : this.badgeAdminService.removeBadge(this.selectedBadgeForAssign.id, this.assignUserId.trim());

    request$.subscribe({
      next: result => {
        this.saving = false;
        if (result.ok) {
          this.notify('success', result.message ?? 'Operação concluída com sucesso.');
          this.closeAssignModal();
          this.loadBadges();
        } else {
          this.notify('error', result.message ?? 'Erro na operação');
        }
        this.cdr.detectChanges();
      },
      error: () => {
        this.saving = false;
        this.notify('error', 'Erro de comunicação com o servidor.');
      },
    });
  }

  recalculateBadge(badge: Badge): void {
    this.askConfirm(
      'Recalcular Elegibilidade',
      `Recalcular utilizadores elegíveis para o badge "${badge.name}"? Esta operação analisa todo o histórico de pontos e quizzes.`,
      () => {
        this.loading = true;
        this.cdr.detectChanges();

        this.badgeAdminService.recalculateBadge(badge.id).subscribe({
          next: result => {
            this.loading = false;
            if (result.ok) {
              this.notify('success', result.message ?? 'Recálculo de elegibilidade concluído com sucesso.');
              this.loadBadges();
            } else {
              this.notify('error', result.message ?? 'Erro ao recalcular elegibilidade');
            }
            this.cdr.detectChanges();
          },
          error: () => {
            this.loading = false;
            this.notify('error', 'Erro de comunicação com o servidor.');
          },
        });
      }
    );
  }

  private emptyBadgeForm(): BadgePayload {
    return {
      name: '',
      description: '',
      icon_url: null,
      color_hex: '#8b1e2d',
      category: 'Geral',
      criteria_type: 'points',
      criteria_value: 100,
      is_active: true,
    };
  }

  // ==========================================
  // TAB 3: LEADERBOARD METHODS
  // ==========================================
  loadLeaderboard(): void {
    this.loading = true;
    this.cdr.detectChanges();

    const filters: any = { scope: this.leaderboardScope };
    if (this.leaderboardProvince) filters.province = this.leaderboardProvince;
    if (this.leaderboardInstitution) filters.institution = this.leaderboardInstitution;

    this.gamificationAdminService.getLeaderboard(filters).subscribe({
      next: result => {
        this.loading = false;
        if (result.ok && result.data) {
          this.leaderboardData = result.data;
        } else {
          this.errorMessage = result.message ?? 'Erro ao carregar leaderboard';
        }
        this.cdr.detectChanges();
      },
      error: () => {
        this.loading = false;
        this.errorMessage = 'Erro de comunicação com o servidor.';
        this.cdr.detectChanges();
      },
    });
  }

  refreshLeaderboardCache(): void {
    this.loading = true;
    this.cdr.detectChanges();

    this.gamificationAdminService.refreshLeaderboard().subscribe({
      next: result => {
        this.loading = false;
        if (result.ok) {
          this.notify('success', result.message ?? 'Cache do Leaderboard recalculada com sucesso.');
          this.loadLeaderboard();
        } else {
          this.notify('error', result.message ?? 'Erro ao atualizar cache');
        }
        this.cdr.detectChanges();
      },
      error: () => {
        this.loading = false;
        this.notify('error', 'Erro de comunicação com o servidor.');
      },
    });
  }

  loadSnapshots(): void {
    this.gamificationAdminService.getSnapshots(20).subscribe({
      next: result => {
        if (result.ok && result.data) {
          this.snapshots = result.data;
          this.cdr.detectChanges();
        }
      },
      error: () => { /* snapshots são complementares; não bloqueiam a tab */ },
    });
  }

  // ==========================================
  // TAB 4: POINT TRANSACTIONS METHODS
  // ==========================================
  loadTransactions(): void {
    this.loading = true;
    this.cdr.detectChanges();

    const filters: any = {
      page: this.txCurrentPage,
      per_page: this.txPerPage,
    };
    if (this.txSearch.trim()) filters.search = this.txSearch.trim();
    if (this.txReason.trim()) filters.reason = this.txReason.trim();
    if (this.txType) filters.type = this.txType;
    if (this.txDateFrom) filters.date_from = this.txDateFrom;
    if (this.txDateTo) filters.date_to = this.txDateTo;

    this.gamificationAdminService.getPointTransactions(filters).subscribe({
      next: result => {
        this.loading = false;
        if (result.ok && result.data) {
          this.transactions = result.data.data;
          this.txTotalCount = result.data.meta.total;
          this.txLastPage = result.data.meta.last_page;
          this.txStats = result.data.stats;
        } else {
          this.errorMessage = result.message ?? 'Erro ao carregar transações';
        }
        this.cdr.detectChanges();
      },
      error: () => {
        this.loading = false;
        this.errorMessage = 'Erro de comunicação com o servidor.';
        this.cdr.detectChanges();
      },
    });
  }

  txPagePrev(): void {
    if (this.txCurrentPage > 1) {
      this.txCurrentPage--;
      this.loadTransactions();
    }
  }

  txPageNext(): void {
    if (this.txCurrentPage < this.txLastPage) {
      this.txCurrentPage++;
      this.loadTransactions();
    }
  }

  filterTransactions(): void {
    this.txCurrentPage = 1;
    this.loadTransactions();
  }

  resetTxFilters(): void {
    this.txSearch = '';
    this.txReason = '';
    this.txType = '';
    this.txDateFrom = '';
    this.txDateTo = '';
    this.txCurrentPage = 1;
    this.loadTransactions();
  }

  exportTransactions(): void {
    const filters: any = {};
    if (this.txSearch.trim()) filters.search = this.txSearch.trim();
    if (this.txReason.trim()) filters.reason = this.txReason.trim();
    if (this.txType) filters.type = this.txType;
    if (this.txDateFrom) filters.date_from = this.txDateFrom;
    if (this.txDateTo) filters.date_to = this.txDateTo;

    this.gamificationAdminService.exportPointTransactions(filters).subscribe({
      next: result => {
        if (result.ok && result.data && result.data.csv) {
          const blob = new Blob([result.data.csv], { type: 'text/csv;charset=utf-8;' });
          const url = URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.setAttribute('href', url);
          link.setAttribute('download', `transacoes_pontos_${new Date().toISOString().slice(0,10)}.csv`);
          link.style.visibility = 'hidden';
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          this.notify('success', 'CSV exportado com sucesso.');
        } else {
          this.notify('error', result.message ?? 'Erro ao exportar CSV.');
        }
      },
      error: () => this.notify('error', 'Erro de comunicação com o servidor.'),
    });
  }

  submitAdjustPoints(): void {
    const points = Number(this.adjustPoints);
    if (!this.adjustUserId.trim()) {
      this.notify('error', 'Introduza o ID do utilizador (UUID).');
      return;
    }
    if (!Number.isInteger(points) || points === 0) {
      this.notify('error', 'Introduza um número inteiro diferente de zero (positivo credita, negativo debita).');
      return;
    }

    this.adjusting = true;
    this.cdr.detectChanges();

    this.gamificationAdminService
      .adjustPoints(this.adjustUserId.trim(), points, this.adjustDescription.trim() || undefined)
      .subscribe({
        next: result => {
          this.adjusting = false;
          if (result.ok) {
            this.notify('success', result.message ?? 'Pontos ajustados com sucesso.');
            this.adjustUserId = '';
            this.adjustPoints = null;
            this.adjustDescription = '';
            this.txCurrentPage = 1;
            this.loadTransactions();
          } else {
            this.notify('error', result.message ?? 'Erro ao ajustar pontos.');
          }
          this.cdr.detectChanges();
        },
        error: () => {
          this.adjusting = false;
          this.notify('error', 'Erro de comunicação com o servidor.');
        },
      });
  }

  viewTxDetails(tx: PointTransaction): void {
    this.selectedTx = tx;
    this.cdr.detectChanges();
  }

  closeTxDetails(): void {
    this.selectedTx = null;
    this.cdr.detectChanges();
  }

  // ==========================================
  // TAB 5: QUIZ ATTEMPTS METHODS
  // ==========================================
  loadAttempts(): void {
    this.loading = true;
    this.cdr.detectChanges();

    const filters: any = {
      page: this.attemptCurrentPage,
      per_page: this.attemptPerPage,
    };
    if (this.attemptSearch.trim()) filters.search = this.attemptSearch.trim();
    if (this.attemptStatus) filters.status = this.attemptStatus;
    if (this.attemptMinScore) filters.min_score = this.attemptMinScore;
    if (this.attemptMaxScore) filters.max_score = this.attemptMaxScore;

    this.gamificationAdminService.getQuizAttempts(filters).subscribe({
      next: result => {
        this.loading = false;
        if (result.ok && result.data) {
          this.attempts = result.data.data;
          this.attemptTotalCount = result.data.meta.total;
          this.attemptLastPage = result.data.meta.last_page;
          this.attemptStats = result.data.stats;
        } else {
          this.errorMessage = result.message ?? 'Erro ao carregar tentativas de quiz';
        }
        this.cdr.detectChanges();
      },
      error: () => {
        this.loading = false;
        this.errorMessage = 'Erro de comunicação com o servidor.';
        this.cdr.detectChanges();
      },
    });
  }

  attemptPagePrev(): void {
    if (this.attemptCurrentPage > 1) {
      this.attemptCurrentPage--;
      this.loadAttempts();
    }
  }

  attemptPageNext(): void {
    if (this.attemptCurrentPage < this.attemptLastPage) {
      this.attemptCurrentPage++;
      this.loadAttempts();
    }
  }

  filterAttempts(): void {
    this.attemptCurrentPage = 1;
    this.loadAttempts();
  }

  resetAttemptFilters(): void {
    this.attemptSearch = '';
    this.attemptStatus = '';
    this.attemptMinScore = '';
    this.attemptMaxScore = '';
    this.attemptCurrentPage = 1;
    this.loadAttempts();
  }

  viewAttemptDetails(attempt: QuizAttempt): void {
    this.loading = true;
    this.cdr.detectChanges();

    this.gamificationAdminService.getQuizAttempt(attempt.id).subscribe({
      next: result => {
        this.loading = false;
        if (result.ok && result.data) {
          this.selectedAttempt = result.data;
        } else {
          this.notify('error', result.message ?? 'Erro ao carregar respostas da tentativa');
        }
        this.cdr.detectChanges();
      },
      error: () => {
        this.loading = false;
        this.notify('error', 'Erro de comunicação com o servidor.');
      },
    });
  }

  closeAttemptDetails(): void {
    this.selectedAttempt = null;
    this.cdr.detectChanges();
  }
}