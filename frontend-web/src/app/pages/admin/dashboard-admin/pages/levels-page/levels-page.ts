import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminApiService, LevelDefinitionRecord } from '../../../../../services/admin-api.service';

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
export class LevelsPageComponent implements OnInit {
  activeTab: 'levels' | 'users' | 'transactions' = 'levels';
  showLevelModal = false;
  editingLevel: Level | null = null;

  levels: Level[] = [];

  userLevels: UserLevel[] = [
    { display_name: 'Dr. Manuel Costa', current_level: 4, total_points: 850, quizzes_completed: 12, documents_read: 45 },
    { display_name: 'Dra. Ana Silva', current_level: 5, total_points: 1200, quizzes_completed: 18, documents_read: 67 },
    { display_name: 'Prof. Carlos Mendes', current_level: 3, total_points: 450, quizzes_completed: 6, documents_read: 23 }
  ];

  transactions: Transaction[] = [
    { id: '1', user_name: 'Dr. Manuel Costa', points: 50, reason: 'Quiz concluído', created_at: '2024-06-15T10:30:00Z' },
    { id: '2', user_name: 'Dra. Ana Silva', points: 30, reason: 'Documento lido', created_at: '2024-06-14T14:20:00Z' }
  ];

  constructor(private adminApi: AdminApiService) {}

  ngOnInit(): void {
    this.loadLevelDefinitions();
  }

  loadLevelDefinitions(): void {
    this.adminApi.listLevelDefinitions().subscribe({
      next: (res) => {
        if (res.ok && res.data) {
          this.levels = res.data.map(l => ({
            level: l.level,
            name: l.name,
            min_points: l.min_points,
            max_points: l.max_points,
            color_hex: l.color_hex,
            perks: l.perks,
          }));
        }
      },
      error: (err) => console.error('Erro ao carregar níveis:', err)
    });
  }

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
    this.loadLevelDefinitions();
    alert('Dados recarregados do servidor!');
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

    const payload: Partial<LevelDefinitionRecord> = {
      name: this.editingLevel.name,
      min_points: this.editingLevel.min_points,
      max_points: this.editingLevel.max_points,
      color_hex: this.editingLevel.color_hex,
      perks: this.editingLevel.perks
    };

    this.adminApi.updateLevelDefinition(this.editingLevel.level, payload).subscribe({
      next: (res) => {
        if (res.ok) {
          alert(`Nível ${this.editingLevel!.level} atualizado com sucesso!`);
          this.loadLevelDefinitions();
          this.closeLevelModal();
        } else {
          alert(`Erro ao atualizar nível: ${res.message}`);
        }
      },
      error: (err) => {
        console.error('Erro ao salvar nível:', err);
        alert('Ocorreu um erro ao salvar o nível.');
      }
    });
  }
}