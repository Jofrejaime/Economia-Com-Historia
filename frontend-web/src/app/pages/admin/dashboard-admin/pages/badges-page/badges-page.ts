import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Observable } from 'rxjs';
import { BadgeAdminService } from '../../../../../services/badge-admin.service';
import { ApiResult, Badge, BadgePayload, BadgeStats } from '../../../../../models/badge-admin.models';

@Component({
  selector: 'app-badges-page',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './badges-page.html',
  styleUrls: ['./badges-page.css']
})
export class BadgesPageComponent implements OnInit {
  badges: Badge[] = [];
  stats: BadgeStats = { total: 0, active: 0, earned: 0 };
  loading = false;
  errorMessage = '';

  showBadgeModal = false;
  editingBadge: Badge | null = null;
  saving = false;

  badgeForm: BadgePayload = this.emptyForm();

  constructor(private badgeAdminService: BadgeAdminService) {}

  ngOnInit(): void {
    this.loadBadges();
  }

  loadBadges(): void {
    this.loading = true;
    this.errorMessage = '';

    this.badgeAdminService.getBadges().subscribe((result: ApiResult<Badge[]>) => {
      this.loading = false;

      if (!result.ok) {
        this.errorMessage = result.message ?? 'Erro ao carregar badges';
        return;
      }

      this.badges = result.data ?? [];
      this.stats = result.stats ?? { total: this.badges.length, active: this.activeBadges, earned: 0 };
    });
  }

  get activeBadges(): number {
    return this.badges.filter(b => b.is_active).length;
  }

  get userBadgesCount(): number {
    return this.stats.earned ?? this.badges.reduce((sum, b) => sum + (b.earned_count ?? 0), 0);
  }

  openAddBadgeModal(): void {
    this.editingBadge = null;
    this.badgeForm = this.emptyForm();
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
      alert('Preencha todos os campos obrigatórios');
      return;
    }

    this.saving = true;

    const request$: Observable<ApiResult<Badge>> = this.editingBadge
      ? this.badgeAdminService.updateBadge(this.editingBadge.id, this.badgeForm)
      : this.badgeAdminService.createBadge(this.badgeForm);

    request$.subscribe((result: ApiResult<Badge>) => {
      this.saving = false;

      if (!result.ok) {
        alert(result.message ?? 'Erro ao guardar badge');
        return;
      }

      this.closeBadgeModal();
      this.loadBadges();
    });
  }

  toggleBadgeStatus(id: string): void {
    this.badgeAdminService.toggleStatus(id).subscribe((result: ApiResult<Badge>) => {
      if (!result.ok) {
        alert(result.message ?? 'Erro ao alternar estado');
        return;
      }
      this.loadBadges();
    });
  }

  deleteBadge(id: string): void {
    if (!confirm('Eliminar este badge?')) {
      return;
    }

    this.badgeAdminService.deleteBadge(id).subscribe((result: ApiResult<null>) => {
      if (!result.ok) {
        alert(result.message ?? 'Erro ao eliminar badge');
        return;
      }
      this.loadBadges();
    });
  }

  private emptyForm(): BadgePayload {
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
}