import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AccessLevelRecord, AdminApiService } from '../../../../../services/admin-api.service';

interface EditableAccessLevel extends AccessLevelRecord {
  isNew?: boolean;
}

@Component({
  selector: 'app-access-levels-page',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './access-levels-page.html',
  styleUrls: ['./access-levels-page.css']
})
export class AccessLevelsPageComponent implements OnInit {
  levels: AccessLevelRecord[] = [];
  loading = false;
  error: string | null = null;

  showModal = false;
  editingLevel: EditableAccessLevel | null = null;
  saving = false;

  constructor(private adminApi: AdminApiService) {}

  ngOnInit(): void {
    this.loadAccessLevels();
  }

  loadAccessLevels(): void {
    this.loading = true;
    this.error = null;

    this.adminApi.listAccessLevels().subscribe({
      next: (res) => {
        this.loading = false;
        if (res.ok && res.data) {
          this.levels = res.data;
        } else {
          this.error = res.message || 'Erro ao carregar níveis de acesso.';
        }
      },
      error: () => {
        this.loading = false;
        this.error = 'Erro ao carregar níveis de acesso.';
      }
    });
  }

  refreshData(): void {
    this.loadAccessLevels();
  }

  get autoGrantCount(): number {
    return this.levels.filter(l => l.auto_grant).length;
  }

  get approvalRequiredCount(): number {
    return this.levels.filter(l => l.requires_approval).length;
  }

  openCreateModal(): void {
    this.editingLevel = {
      id: '',
      name: '',
      description: '',
      icon: '',
      color_bg: '#e5e7eb',
      color_text: '#1f2937',
      requires_approval: false,
      auto_grant: false,
      isNew: true,
    };
    this.showModal = true;
  }

  openEditModal(level: AccessLevelRecord): void {
    this.editingLevel = { ...level, isNew: false };
    this.showModal = true;
  }

  closeModal(): void {
    this.showModal = false;
    this.editingLevel = null;
  }

  saveLevel(): void {
    if (!this.editingLevel) return;

    if (this.editingLevel.isNew && !this.editingLevel.id.trim()) {
      alert('Por favor, insira o identificador do nível (ex: gold).');
      return;
    }

    if (!this.editingLevel.name.trim()) {
      alert('Por favor, insira o nome do nível.');
      return;
    }

    this.saving = true;

    const payload = {
      name: this.editingLevel.name,
      description: this.editingLevel.description,
      icon: this.editingLevel.icon,
      color_bg: this.editingLevel.color_bg,
      color_text: this.editingLevel.color_text,
      requires_approval: this.editingLevel.requires_approval,
      auto_grant: this.editingLevel.auto_grant,
    };

    const request$ = this.editingLevel.isNew
      ? this.adminApi.createAccessLevel({ id: this.editingLevel.id, ...payload })
      : this.adminApi.updateAccessLevel(this.editingLevel.id, payload);

    request$.subscribe({
      next: (res) => {
        this.saving = false;
        if (res.ok) {
          this.loadAccessLevels();
          this.closeModal();
        } else {
          alert(`Erro ao guardar nível de acesso: ${res.message}`);
        }
      },
      error: () => {
        this.saving = false;
        alert('Ocorreu um erro ao guardar o nível de acesso.');
      }
    });
  }

  deleteLevel(level: AccessLevelRecord): void {
    if (!confirm(`Tem a certeza que deseja eliminar o nível "${level.name}"? Esta ação não pode ser desfeita.`)) {
      return;
    }

    this.adminApi.deleteAccessLevel(level.id).subscribe({
      next: (res) => {
        if (res.ok) {
          this.loadAccessLevels();
        } else {
          alert(res.message || 'Não foi possível eliminar este nível de acesso.');
        }
      },
      error: () => {
        alert('Ocorreu um erro ao eliminar o nível de acesso.');
      }
    });
  }
}