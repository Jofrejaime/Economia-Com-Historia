import { Component, OnInit } from '@angular/core';
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
    private gamificationAdminService: GamificationAdminService
  ) {}

  ngOnInit(): void {
    this.switchTab('dashboard');
  }

  switchTab(tab: 'dashboard' | 'badges' | 'leaderboard' | 'transactions' | 'attempts'): void {
    this.activeTab = tab;
    this.errorMessage = '';
    
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
    this.gamificationAdminService.getDashboard().subscribe(result => {
      this.loading = false;
      if (result.ok && result.data) {
        this.dashboardData = result.data;
      } else {
        this.errorMessage = result.message ?? 'Erro ao carregar dashboard de gamificação';
      }
    });
  }

  // ==========================================
  // TAB 2: BADGES METHODS
  // ==========================================
  loadBadges(): void {
    this.loading = true;
    this.badgeAdminService.getBadges().subscribe(result => {
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
    });
  }

  openAddBadgeModal(): void {
    this.editingBadge = null;
    this.badgeForm = this.emptyBadgeForm();
    this.showBadgeModal = true;
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
  }

  closeBadgeModal(): void {
    this.showBadgeModal = false;
    this.editingBadge = null;
  }

  saveBadge(): void {
    if (!this.badgeForm.name.trim() || !this.badgeForm.description.trim()) {
      alert('Preencha os campos obrigatórios.');
      return;
    }

    this.saving = true;
    const request$ = this.editingBadge
      ? this.badgeAdminService.updateBadge(this.editingBadge.id, this.badgeForm)
      : this.badgeAdminService.createBadge(this.badgeForm);

    request$.subscribe(result => {
      this.saving = false;
      if (result.ok) {
        this.closeBadgeModal();
        this.loadBadges();
      } else {
        alert(result.message ?? 'Erro ao guardar badge');
      }
    });
  }

  toggleBadgeStatus(badge: Badge): void {
    this.badgeAdminService.toggleStatus(badge.id).subscribe(result => {
      if (result.ok) {
        this.loadBadges();
      } else {
        alert(result.message ?? 'Erro ao alternar status do badge');
      }
    });
  }

  deleteBadge(badge: Badge): void {
    if (!confirm(`Tem a certeza que deseja eliminar o badge "${badge.name}"?`)) {
      return;
    }
    this.badgeAdminService.deleteBadge(badge.id).subscribe(result => {
      if (result.ok) {
        this.loadBadges();
      } else {
        alert(result.message ?? 'Erro ao eliminar badge');
      }
    });
  }

  openAssignModal(badge: Badge, action: 'assign' | 'remove'): void {
    this.selectedBadgeForAssign = badge;
    this.assignAction = action;
    this.assignUserId = '';
    this.showAssignModal = true;
  }

  closeAssignModal(): void {
    this.showAssignModal = false;
    this.selectedBadgeForAssign = null;
  }

  submitAssignment(): void {
    if (!this.assignUserId.trim()) {
      alert('Introduza o ID do utilizador (UUID).');
      return;
    }
    if (!this.selectedBadgeForAssign) return;

    this.saving = true;
    const request$ = this.assignAction === 'assign'
      ? this.badgeAdminService.assignBadge(this.selectedBadgeForAssign.id, this.assignUserId.trim())
      : this.badgeAdminService.removeBadge(this.selectedBadgeForAssign.id, this.assignUserId.trim());

    request$.subscribe(result => {
      this.saving = false;
      if (result.ok) {
        alert(result.message ?? 'Operação concluída com sucesso.');
        this.closeAssignModal();
        this.loadBadges();
      } else {
        alert(result.message ?? 'Erro na operação');
      }
    });
  }

  recalculateBadge(badge: Badge): void {
    if (!confirm(`Recalcular utilizadores elegíveis para o badge "${badge.name}"? Esta operação analisa todo o histórico de pontos e quizzes.`)) {
      return;
    }
    this.loading = true;
    this.badgeAdminService.recalculateBadge(badge.id).subscribe(result => {
      this.loading = false;
      if (result.ok) {
        alert(result.message ?? 'Recálculo de elegibilidade concluído com sucesso.');
        this.loadBadges();
      } else {
        alert(result.message ?? 'Erro ao recalcular elegibilidade');
      }
    });
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
    const filters: any = { scope: this.leaderboardScope };
    if (this.leaderboardProvince) filters.province = this.leaderboardProvince;
    if (this.leaderboardInstitution) filters.institution = this.leaderboardInstitution;

    this.gamificationAdminService.getLeaderboard(filters).subscribe(result => {
      this.loading = false;
      if (result.ok && result.data) {
        this.leaderboardData = result.data;
      } else {
        this.errorMessage = result.message ?? 'Erro ao carregar leaderboard';
      }
    });
  }

  refreshLeaderboardCache(): void {
    this.loading = true;
    this.gamificationAdminService.refreshLeaderboard().subscribe(result => {
      this.loading = false;
      if (result.ok) {
        alert(result.message ?? 'Cache do Leaderboard recalculada com sucesso.');
        this.loadLeaderboard();
      } else {
        alert(result.message ?? 'Erro ao atualizar cache');
      }
    });
  }

  loadSnapshots(): void {
    this.gamificationAdminService.getSnapshots(20).subscribe(result => {
      if (result.ok && result.data) {
        this.snapshots = result.data;
      }
    });
  }

  // ==========================================
  // TAB 4: POINT TRANSACTIONS METHODS
  // ==========================================
  loadTransactions(): void {
    this.loading = true;
    const filters: any = {
      page: this.txCurrentPage,
      per_page: this.txPerPage,
    };
    if (this.txSearch.trim()) filters.search = this.txSearch.trim();
    if (this.txReason.trim()) filters.reason = this.txReason.trim();
    if (this.txType) filters.type = this.txType;
    if (this.txDateFrom) filters.date_from = this.txDateFrom;
    if (this.txDateTo) filters.date_to = this.txDateTo;

    this.gamificationAdminService.getPointTransactions(filters).subscribe(result => {
      this.loading = false;
      if (result.ok && result.data) {
        this.transactions = result.data.data;
        this.txTotalCount = result.data.meta.total;
        this.txLastPage = result.data.meta.last_page;
        this.txStats = result.data.stats;
      } else {
        this.errorMessage = result.message ?? 'Erro ao carregar transações';
      }
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

    this.gamificationAdminService.exportPointTransactions(filters).subscribe(result => {
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
      } else {
        alert(result.message ?? 'Erro ao exportar CSV.');
      }
    });
  }

  submitAdjustPoints(): void {
    const points = Number(this.adjustPoints);
    if (!this.adjustUserId.trim()) {
      alert('Introduza o ID do utilizador (UUID).');
      return;
    }
    if (!Number.isInteger(points) || points === 0) {
      alert('Introduza um número inteiro diferente de zero (positivo credita, negativo debita).');
      return;
    }

    this.adjusting = true;
    this.gamificationAdminService
      .adjustPoints(this.adjustUserId.trim(), points, this.adjustDescription.trim() || undefined)
      .subscribe(result => {
        this.adjusting = false;
        if (result.ok) {
          alert(result.message ?? 'Pontos ajustados com sucesso.');
          this.adjustUserId = '';
          this.adjustPoints = null;
          this.adjustDescription = '';
          this.txCurrentPage = 1;
          this.loadTransactions();
        } else {
          alert(result.message ?? 'Erro ao ajustar pontos.');
        }
      });
  }

  viewTxDetails(tx: PointTransaction): void {
    this.selectedTx = tx;
  }

  closeTxDetails(): void {
    this.selectedTx = null;
  }

  // ==========================================
  // TAB 5: QUIZ ATTEMPTS METHODS
  // ==========================================
  loadAttempts(): void {
    this.loading = true;
    const filters: any = {
      page: this.attemptCurrentPage,
      per_page: this.attemptPerPage,
    };
    if (this.attemptSearch.trim()) filters.search = this.attemptSearch.trim();
    if (this.attemptStatus) filters.status = this.attemptStatus;
    if (this.attemptMinScore) filters.min_score = this.attemptMinScore;
    if (this.attemptMaxScore) filters.max_score = this.attemptMaxScore;

    this.gamificationAdminService.getQuizAttempts(filters).subscribe(result => {
      this.loading = false;
      if (result.ok && result.data) {
        this.attempts = result.data.data;
        this.attemptTotalCount = result.data.meta.total;
        this.attemptLastPage = result.data.meta.last_page;
        this.attemptStats = result.data.stats;
      } else {
        this.errorMessage = result.message ?? 'Erro ao carregar tentativas de quiz';
      }
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
    this.gamificationAdminService.getQuizAttempt(attempt.id).subscribe(result => {
      this.loading = false;
      if (result.ok && result.data) {
        this.selectedAttempt = result.data;
      } else {
        alert(result.message ?? 'Erro ao carregar respostas da tentativa');
      }
    });
  }

  closeAttemptDetails(): void {
    this.selectedAttempt = null;
  }
}
