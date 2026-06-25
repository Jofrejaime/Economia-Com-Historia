import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { firstValueFrom } from 'rxjs';
import { Category, CategoryCreatePayload } from '../../../../../models/community-admin.models';
import { CommunityAdminService } from '../../../../../services/community-admin.service';

type CategoryFilter = 'todos' | 'public' | 'jindungo' | 'restricted';

@Component({
  selector: 'app-categories-page',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './categories-page.html',
  styleUrls: ['./categories-page.css']
})
export class CategoriesPageComponent implements OnInit {
  searchQuery = '';
  filterType: CategoryFilter = 'todos';
  filterStatus = 'todos';
  loading = false;
  saving = false;
  errorMessage: string | null = null;
  successMessage: string | null = null;

  showCategoryModal = false;
  editingCategory: Category | null = null;

  categoryForm: {
    slug: string;
    name: string;
    description: string;
    access_level_id: 'public' | 'jindungo' | 'restricted';
    color_bg: string | null;
    color_text: string | null;
    cover_image_url: string | null;
    sort_order: number;
    is_active: boolean;
  } = this.createEmptyForm();

  categories: Category[] = [];

  colorOptions = [
    { value: '#acf0e0', name: 'Verde água' },
    { value: '#ffd6a5', name: 'Laranja claro' },
    { value: '#d4c5f9', name: 'Lavanda' },
    { value: '#ffb3ba', name: 'Rosa claro' },
    { value: '#bae1ff', name: 'Azul claro' },
    { value: '#c7ceea', name: 'Azul acinzentado' },
    { value: '#d1fae5', name: 'Verde menta' },
  ];

  iconOptions = [
    { value: '📊', name: 'Gráfico' },
    { value: '🔥', name: 'Fogo' },
    { value: '🚢', name: 'Navio' },
    { value: '🔬', name: 'Microscópio' },
    { value: '📜', name: 'Pergaminho' },
    { value: '💰', name: 'Moeda' },
    { value: '📚', name: 'Livros' },
    { value: '🏛️', name: 'Prédio' },
    { value: '🌍', name: 'Mundo' },
    { value: '📈', name: 'Gráfico crescente' },
  ];

  constructor(private communityAdmin: CommunityAdminService) {}

  ngOnInit(): void {
    void this.loadCategories();
  }

  get filteredCategories(): Category[] {
    return this.categories.filter((cat) => {
      const search = this.searchQuery.trim().toLowerCase();
      const matchSearch = search === '' ||
        cat.name.toLowerCase().includes(search) ||
        (cat.description || '').toLowerCase().includes(search) ||
        cat.slug.toLowerCase().includes(search);
      const matchType = this.filterType === 'todos' || cat.access_level_id === this.filterType;
      const matchStatus = this.filterStatus === 'todos' ||
        (this.filterStatus === 'active' ? cat.is_active === true : cat.is_active === false);
      return matchSearch && matchType && matchStatus;
    });
  }

  getStats() {
    return {
      total: this.categories.length,
      active: this.categories.filter((c) => c.is_active).length,
      public: this.categories.filter((c) => c.access_level_id === 'public').length,
      restricted: this.categories.filter((c) => c.access_level_id === 'restricted').length,
    };
  }

  async loadCategories(): Promise<void> {
    this.loading = true;
    this.errorMessage = null;

    const result = await firstValueFrom(this.communityAdmin.getCategories());

    if (!result.ok || !result.data) {
      this.categories = [];
      this.errorMessage = result.message || 'Não foi possível carregar as categorias.';
      this.loading = false;
      return;
    }

    this.categories = result.data;
    this.loading = false;
  }

  openAddCategoryModal(): void {
    this.editingCategory = null;
    this.categoryForm = this.createEmptyForm();
    this.showCategoryModal = true;
    this.errorMessage = null;
    this.successMessage = null;
  }

  openEditCategoryModal(category: Category): void {
    this.editingCategory = category;
    this.categoryForm = {
      slug: category.slug,
      name: category.name,
      description: category.description || '',
      access_level_id: category.access_level_id === 'jindungo' ? 'jindungo' : category.access_level_id === 'restricted' ? 'restricted' : 'public',
      color_bg: category.color_bg,
      color_text: category.color_text,
      cover_image_url: category.cover_image_url,
      sort_order: category.sort_order,
      is_active: category.is_active,
    };
    this.showCategoryModal = true;
    this.errorMessage = null;
    this.successMessage = null;
  }

  closeCategoryModal(): void {
    if (this.saving) {
      return;
    }

    this.showCategoryModal = false;
    this.editingCategory = null;
  }

  async saveCategory(): Promise<void> {
    if (!this.categoryForm.name.trim()) {
      this.errorMessage = 'Por favor, insira o nome da categoria.';
      return;
    }

    if (!this.categoryForm.description.trim()) {
      this.errorMessage = 'Por favor, insira a descrição da categoria.';
      return;
    }

    this.saving = true;
    this.errorMessage = null;
    this.successMessage = null;

    const payload: CategoryCreatePayload = {
      slug: this.categoryForm.slug.trim() || this.generateSlug(this.categoryForm.name),
      name: this.categoryForm.name.trim(),
      description: this.categoryForm.description.trim(),
      access_level_id: this.categoryForm.access_level_id,
      color_bg: this.categoryForm.color_bg,
      color_text: this.categoryForm.color_text,
      cover_image_url: this.categoryForm.cover_image_url,
      sort_order: this.categoryForm.sort_order,
    };

    const result = await firstValueFrom(this.communityAdmin.createCategory(payload));

    if (!result.ok || !result.data) {
      this.errorMessage = result.message || 'Não foi possível criar a categoria.';
      this.saving = false;
      return;
    }

    this.successMessage = result.message || 'Categoria criada com sucesso.';
    this.showCategoryModal = false;
    await this.loadCategories();
    this.saving = false;
  }

  deleteCategory(): void {
    this.errorMessage = 'A remoção de categorias ainda não está disponível na API.';
  }

  getTypeLabel(type: string): string {
    const types: Record<string, string> = {
      public: 'Público',
      jindungo: 'Jindungo',
      restricted: 'Restrito',
    };
    return types[type] || type;
  }

  getStatusLabel(isActive: boolean): string {
    return isActive ? 'Ativo' : 'Inativo';
  }

  getTypeIcon(type: string): string {
    const icons: Record<string, string> = {
      public: '🌐',
      jindungo: '🔥',
      restricted: '🔒',
    };
    return icons[type] || '📁';
  }

  private createEmptyForm() {
    return {
      slug: '',
      name: '',
      description: '',
      access_level_id: 'public' as const,
      color_bg: '#acf0e0',
      color_text: '#000000',
      cover_image_url: null as string | null,
      sort_order: 0,
      is_active: true,
    };
  }

  private generateSlug(name: string): string {
    return name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }
}
