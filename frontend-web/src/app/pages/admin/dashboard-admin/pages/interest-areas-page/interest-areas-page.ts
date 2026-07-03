import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { firstValueFrom } from 'rxjs';
import { InterestAreaAdminService } from '../../../../../services/interest-area-admin.service';
import { InterestArea, InterestAreaMetadata, CategoryShort } from '../../../../../models/interest-area-admin.models';

@Component({
  selector: 'app-interest-areas-page',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './interest-areas-page.html',
  styleUrls: ['./interest-areas-page.css']
})
export class InterestAreasPageComponent implements OnInit {
  searchQuery = '';
  loading = false;
  saving = false;
  errorMessage: string | null = null;
  successMessage: string | null = null;

  showAreaModal = false;
  editingArea: InterestArea | null = null;

  areaForm = {
    name: '',
    slug: '',
    description: '',
    is_active: true
  };

  areas: InterestArea[] = [];
  categories: CategoryShort[] = [];
  
  // Cache of metadata per area ID
  metadataMap: Record<string, InterestAreaMetadata> = {};
  selectedAreaMetadata: InterestAreaMetadata | null = null;
  selectedAreaId: string | null = null;

  constructor(private areaAdmin: InterestAreaAdminService) {}

  ngOnInit(): void {
    void this.loadData();
  }

  async loadData(): Promise<void> {
    this.loading = true;
    this.errorMessage = null;

    try {
      const areasResult = await firstValueFrom(this.areaAdmin.getInterestAreas({ search: this.searchQuery }));
      if (areasResult.ok && areasResult.data) {
        const resData = areasResult.data as any;
        this.areas = resData.data ?? resData ?? [];
        
        // Load metadata for each loaded area
        for (const area of this.areas) {
          void this.loadAreaMetadata(area.id);
        }
      } else {
        this.errorMessage = areasResult.message || 'Erro ao carregar áreas de interesse.';
      }

      const catResult = await firstValueFrom(this.areaAdmin.getCategories());
      if (catResult.ok && catResult.data) {
        this.categories = catResult.data;
      }
    } catch (err: any) {
      this.errorMessage = err.message || 'Erro ao carregar dados.';
    } finally {
      this.loading = false;
    }
  }

  async loadAreaMetadata(id: string): Promise<void> {
    try {
      const result = await firstValueFrom(this.areaAdmin.getInterestAreaMetadata(id));
      if (result.ok && result.data) {
        this.metadataMap[id] = result.data;
        if (this.selectedAreaId === id) {
          this.selectedAreaMetadata = result.data;
        }
      }
    } catch (e) {
      // Suppress metadata loading errors silently
    }
  }

  getAreaMetadata(id: string): InterestAreaMetadata {
    return this.metadataMap[id] || { users_count: 0, documents_count: 0, topics_count: 0 };
  }

  get selectedArea(): InterestArea | null {
    return this.areas.find(area => area.id === this.selectedAreaId) ?? null;
  }

  openAddAreaModal(): void {
    this.editingArea = null;
    this.areaForm = {
      name: '',
      slug: '',
      description: '',
      is_active: true
    };
    this.showAreaModal = true;
    this.errorMessage = null;
    this.successMessage = null;
  }

  openEditAreaModal(area: InterestArea): void {
    this.editingArea = area;
    this.areaForm = {
      name: area.name,
      slug: area.slug,
      description: area.description || '',
      is_active: area.is_active
    };
    this.showAreaModal = true;
    this.errorMessage = null;
    this.successMessage = null;
  }

  closeAreaModal(): void {
    if (this.saving) {
      return;
    }
    this.showAreaModal = false;
    this.editingArea = null;
  }

  async saveArea(): Promise<void> {
    if (!this.areaForm.name.trim()) {
      this.errorMessage = 'Por favor, insira o nome da área de interesse.';
      return;
    }

    this.saving = true;
    this.errorMessage = null;
    this.successMessage = null;

    const payload = {
      name: this.areaForm.name.trim(),
      slug: this.areaForm.slug.trim() || undefined,
      description: this.areaForm.description.trim() || null,
      is_active: this.areaForm.is_active
    };

    try {
      let result;
      if (this.editingArea) {
        result = await firstValueFrom(this.areaAdmin.updateInterestArea(this.editingArea.id, payload));
      } else {
        result = await firstValueFrom(this.areaAdmin.createInterestArea(payload));
      }

      if (result.ok && result.data) {
        this.successMessage = this.editingArea ? 'Área de interesse actualizada.' : 'Área de interesse criada.';
        this.showAreaModal = false;
        this.editingArea = null;
        await this.loadData();
      } else {
        this.errorMessage = result.message || 'Erro ao guardar área de interesse.';
      }
    } catch (err: any) {
      this.errorMessage = err.message || 'Erro de comunicação.';
    } finally {
      this.saving = false;
    }
  }

  async deleteArea(area: InterestArea): Promise<void> {
    if (!confirm(`Deseja realmente eliminar a área "${area.name}"?`)) {
      return;
    }

    this.loading = true;
    this.errorMessage = null;
    this.successMessage = null;

    try {
      const result = await firstValueFrom(this.areaAdmin.deleteInterestArea(area.id));
      if (result.ok) {
        this.successMessage = 'Área de interesse eliminada com sucesso.';
        await this.loadData();
      } else {
        this.errorMessage = result.message || 'Não foi possível eliminar a área.';
      }
    } catch (err: any) {
      this.errorMessage = err.message || 'Erro ao comunicar.';
    } finally {
      this.loading = false;
    }
  }

  viewMetadataDetails(area: InterestArea): void {
    this.selectedAreaId = area.id;
    this.selectedAreaMetadata = this.getAreaMetadata(area.id);
  }
}
