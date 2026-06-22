import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface Badge {
  id: string;
  name: string;
  description: string;
  color_hex: string | null;
  category: string | null;
  criteria_type: string;
  criteria_value: number;
  is_active: boolean;
}

@Component({
  selector: 'app-badges-page',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './badges-page.html',
  styleUrls: ['./badges-page.css']
})
export class BadgesPageComponent {
  showBadgeModal = false;
  editingBadge: Badge | null = null;

  badgeForm: Badge = {
    id: '',
    name: '',
    description: '',
    color_hex: '#8b1e2d',
    category: 'Geral',
    criteria_type: 'points',
    criteria_value: 100,
    is_active: true
  };

  badges: Badge[] = [
    { id: '1', name: 'Arquivista Imperial', description: 'Especialista em arquivos históricos.', color_hex: '#8b1e2d', category: 'Especial', criteria_type: 'points', criteria_value: 1500, is_active: true },
    { id: '2', name: 'Crónicas do Kwanza', description: 'Domina a história monetária.', color_hex: '#f59e0b', category: 'Académico', criteria_type: 'quizzes', criteria_value: 10, is_active: true },
    { id: '3', name: 'Diamante Angolano', description: 'Investigador dedicado.', color_hex: '#3b82f6', category: 'Conquista', criteria_type: 'documents', criteria_value: 50, is_active: true }
  ];

  userBadges: { badge_id: string }[] = [
    { badge_id: '1' },
    { badge_id: '2' },
    { badge_id: '1' }
  ];

  get activeBadges(): number {
    return this.badges.filter(b => b.is_active).length;
  }

  openAddBadgeModal(): void {
    this.editingBadge = null;
    this.badgeForm = {
      id: '',
      name: '',
      description: '',
      color_hex: '#8b1e2d',
      category: 'Geral',
      criteria_type: 'points',
      criteria_value: 100,
      is_active: true
    };
    this.showBadgeModal = true;
  }

  openEditBadgeModal(badge: Badge): void {
    this.editingBadge = { ...badge };
    this.badgeForm = { ...badge };
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
    if (this.editingBadge) {
      const index = this.badges.findIndex(b => b.id === this.editingBadge!.id);
      if (index !== -1) this.badges[index] = { ...this.badgeForm, id: this.editingBadge.id };
    } else {
      this.badgeForm.id = Date.now().toString();
      this.badges.push({ ...this.badgeForm });
    }
    this.closeBadgeModal();
  }

  toggleBadgeStatus(id: string): void {
    const badge = this.badges.find(b => b.id === id);
    if (badge) badge.is_active = !badge.is_active;
  }

  deleteBadge(id: string): void {
    if (confirm('Eliminar este badge?')) {
      this.badges = this.badges.filter(b => b.id !== id);
    }
  }
}