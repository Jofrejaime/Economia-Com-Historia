import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface Level {
  level: number;
  name: string;
  min_points: number;
  max_points: number | null;
  color_hex: string | null;
  perks: string[] | null;
  perks_input?: string;
}

interface UserLevel {
  display_name: string;
  current_level: number;
  total_points: number;
  quizzes_completed: number;
  documents_read: number;
}

interface Transaction {
  id: string;
  user_name: string;
  points: number;
  reason: string;
  created_at: string;
}

@Component({
  selector: 'app-levels-page',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './levels-page.html',
  styleUrls: ['./levels-page.css']
})
export class LevelsPageComponent {
  activeTab: 'levels' | 'users' | 'transactions' = 'levels';
  showLevelModal = false;
  editingLevel: Level | null = null;

  levels: Level[] = [
    { level: 1, name: 'Iniciante', min_points: 0, max_points: 100, color_hex: '#94a3b8', perks: null },
    { level: 2, name: 'Aprendiz', min_points: 101, max_points: 300, color_hex: '#3b82f6', perks: ['Acesso a conteúdos básicos'] },
    { level: 3, name: 'Conhecedor', min_points: 301, max_points: 600, color_hex: '#8b5cf6', perks: ['Pode criar tópicos'] },
    { level: 4, name: 'Especialista', min_points: 601, max_points: 1000, color_hex: '#f59e0b', perks: ['Acesso a conteúdos restritos'] },
    { level: 5, name: 'Mestre', min_points: 1001, max_points: 1500, color_hex: '#ef4444', perks: ['Badge exclusivo'] },
    { level: 6, name: 'Arquivista', min_points: 1501, max_points: null, color_hex: '#8b1e2d', perks: ['Acesso total', 'Badge de Honra'] }
  ];

  userLevels: UserLevel[] = [
    { display_name: 'Dr. Manuel Costa', current_level: 4, total_points: 850, quizzes_completed: 12, documents_read: 45 },
    { display_name: 'Dra. Ana Silva', current_level: 5, total_points: 1200, quizzes_completed: 18, documents_read: 67 },
    { display_name: 'Prof. Carlos Mendes', current_level: 3, total_points: 450, quizzes_completed: 6, documents_read: 23 }
  ];

  transactions: Transaction[] = [
    { id: '1', user_name: 'Dr. Manuel Costa', points: 50, reason: 'Quiz concluído', created_at: '2024-06-15T10:30:00Z' },
    { id: '2', user_name: 'Dra. Ana Silva', points: 30, reason: 'Documento lido', created_at: '2024-06-14T14:20:00Z' }
  ];

  get totalPoints(): number {
    return this.userLevels.reduce((sum, u) => sum + u.total_points, 0);
  }

  get avgPoints(): number {
    return this.userLevels.length > 0 ? Math.round(this.totalPoints / this.userLevels.length) : 0;
  }

  getLevelColor(level: number): string {
    return this.levels.find(l => l.level === level)?.color_hex || '#8b1e2d';
  }

  getLevelProgress(user: UserLevel): number {
    const current = this.levels.find(l => l.level === user.current_level);
    const next = this.levels.find(l => l.level === user.current_level + 1);
    if (!current || !next) return 100;
    const progress = ((user.total_points - current.min_points) / (next.min_points - current.min_points)) * 100;
    return Math.min(Math.max(progress, 0), 100);
  }

  refreshData(): void {
    alert('Dados recarregados!');
  }

  openEditLevelModal(level: Level): void {
    this.editingLevel = { 
      ...level, 
      perks_input: level.perks ? level.perks.join(', ') : '' 
    };
    this.showLevelModal = true;
  }

  closeLevelModal(): void {
    this.showLevelModal = false;
    this.editingLevel = null;
  }

  saveLevel(): void {
    if (!this.editingLevel) return;
    
    if (!this.editingLevel.name.trim()) {
      alert('Por favor, insira o nome do nível');
      return;
    }

    if (this.editingLevel.perks_input?.trim()) {
      this.editingLevel.perks = this.editingLevel.perks_input
        .split(',')
        .map(p => p.trim())
        .filter(p => p.length > 0);
    } else {
      this.editingLevel.perks = null;
    }

    const index = this.levels.findIndex(l => l.level === this.editingLevel!.level);
    if (index !== -1) {
      this.levels[index] = { ...this.editingLevel };
    }

    this.closeLevelModal();
    alert(`Nível ${this.editingLevel.level} atualizado com sucesso!`);
  }
}