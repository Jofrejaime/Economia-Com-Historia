import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { firstValueFrom } from 'rxjs';
import { ProvinceAdminService } from '../../../../../services/province-admin.service';
import { Province, ProvinceStats } from '../../../../../models/province-admin.models';

@Component({
  selector: 'app-provinces-page',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './provinces-page.html',
  styleUrls: ['./provinces-page.css']
})
export class ProvincesPageComponent implements OnInit {
  searchQuery = '';
  loading = false;
  saving = false;
  errorMessage: string | null = null;
  successMessage: string | null = null;

  showProvinceModal = false;
  editingProvince: Province | null = null;

  provinceForm = {
    name: '',
    code: '',
    is_active: true
  };

  provinces: Province[] = [];
  stats: ProvinceStats[] = [];

  constructor(private provinceAdmin: ProvinceAdminService) {}

  ngOnInit(): void {
    void this.loadData();
  }

  async loadData(): Promise<void> {
    this.loading = true;
    this.errorMessage = null;

    try {
      const provincesResult = await firstValueFrom(this.provinceAdmin.getProvinces({ search: this.searchQuery }));
      if (provincesResult.ok && provincesResult.data) {
        // Handle pagination
        const resData = provincesResult.data as any;
        this.provinces = resData.data ?? resData ?? [];
      } else {
        this.errorMessage = provincesResult.message || 'Erro ao carregar províncias.';
      }

      const statsResult = await firstValueFrom(this.provinceAdmin.getProvinceStatistics());
      if (statsResult.ok && statsResult.data) {
        this.stats = statsResult.data;
      }
    } catch (err: any) {
      this.errorMessage = err.message || 'Erro de rede ao carregar dados.';
    } finally {
      this.loading = false;
    }
  }

  get filteredProvinces(): Province[] {
    return this.provinces;
  }

  openAddProvinceModal(): void {
    this.editingProvince = null;
    this.provinceForm = {
      name: '',
      code: '',
      is_active: true
    };
    this.showProvinceModal = true;
    this.errorMessage = null;
    this.successMessage = null;
  }

  openEditProvinceModal(province: Province): void {
    this.editingProvince = province;
    this.provinceForm = {
      name: province.name,
      code: province.code,
      is_active: province.is_active
    };
    this.showProvinceModal = true;
    this.errorMessage = null;
    this.successMessage = null;
  }

  closeProvinceModal(): void {
    if (this.saving) {
      return;
    }
    this.showProvinceModal = false;
    this.editingProvince = null;
  }

  async saveProvince(): Promise<void> {
    if (!this.provinceForm.name.trim()) {
      this.errorMessage = 'Por favor, insira o nome da província.';
      return;
    }
    if (!this.provinceForm.code.trim()) {
      this.errorMessage = 'Por favor, insira o código ISO (ex: AO-LUA).';
      return;
    }

    this.saving = true;
    this.errorMessage = null;
    this.successMessage = null;

    const payload = {
      name: this.provinceForm.name.trim(),
      code: this.provinceForm.code.trim().toUpperCase(),
      is_active: this.provinceForm.is_active
    };

    try {
      let result;
      if (this.editingProvince) {
        result = await firstValueFrom(this.provinceAdmin.updateProvince(this.editingProvince.id, payload));
      } else {
        result = await firstValueFrom(this.provinceAdmin.createProvince(payload));
      }

      if (result.ok && result.data) {
        this.successMessage = this.editingProvince ? 'Província actualizada com sucesso.' : 'Província criada com sucesso.';
        this.showProvinceModal = false;
        this.editingProvince = null;
        await this.loadData();
      } else {
        this.errorMessage = result.message || 'Não foi possível salvar a província.';
      }
    } catch (err: any) {
      this.errorMessage = err.message || 'Erro ao comunicar com o servidor.';
    } finally {
      this.saving = false;
    }
  }

  async deleteProvince(province: Province): Promise<void> {
    if (!confirm(`Tem a certeza que deseja eliminar a província "${province.name}"?`)) {
      return;
    }

    this.loading = true;
    this.errorMessage = null;
    this.successMessage = null;

    try {
      const result = await firstValueFrom(this.provinceAdmin.deleteProvince(province.id));
      if (result.ok) {
        this.successMessage = 'Província eliminada com sucesso.';
        await this.loadData();
      } else {
        this.errorMessage = result.message || 'Não foi possível eliminar a província.';
      }
    } catch (err: any) {
      this.errorMessage = err.message || 'Erro ao comunicar com o servidor.';
    } finally {
      this.loading = false;
    }
  }

  getUserCount(provinceName: string): number {
    const found = this.stats.find(s => s.name.toLowerCase() === provinceName.toLowerCase());
    return found ? found.total_users : 0;
  }
}
