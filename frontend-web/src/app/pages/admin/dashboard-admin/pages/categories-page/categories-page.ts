import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { firstValueFrom } from 'rxjs';
import { DocumentCategory } from '../../../../../models/document-admin.models';
import { DocumentAdminService } from '../../../../../services/document-admin.service';

@Component({
  selector: 'app-categories-page',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './categories-page.html',
  styleUrls: ['./categories-page.css']
})
export class CategoriesPageComponent implements OnInit {
  searchQuery = '';
  loading = false;
  saving = false;
  errorMessage: string | null = null;
  successMessage: string | null = null;

  showCategoryModal = false;
  editingCategory: DocumentCategory | null = null;

  categoryForm: {
    slug: string;
    name: string;
    description: string;
    color_bg: string | null;
    color_text: string | null;
    icon: string | null;
    sort_order: number;
  } = this.createEmptyForm();

  categories: DocumentCategory[] = [];

  colorOptions = [
    { value: '#acf0e0', name: 'Verde água' },
    { value: '#ffd6a5', name: 'Laranja claro' },
    { value: '#d4c5f9', name: 'Lavanda' },
    { value: '#ffb3ba', name: 'Rosa claro' },
    { value: '#bae1ff', name: 'Azul claro' },
    { value: '#c7ceea', name: 'Azul acinzentado' },
    { value: '#d1fae5', name: 'Verde menta' },
  ];

  constructor(private documentAdmin: DocumentAdminService) {}

  ngOnInit(): void {
    void this.loadCategories();
  }

  get filteredCategories(): DocumentCategory[] {
    return this.categories.filter((cat) => {
      const search = this.searchQuery.trim().toLowerCase();
      return search === '' ||
        cat.name.toLowerCase().includes(search) ||
        (cat.description || '').toLowerCase().includes(search) ||
        cat.slug.toLowerCase().includes(search);
    });
  }

  getStats() {
    return {
      total: this.categories.length,
    };
  }

  async loadCategories(): Promise<void> {
    this.loading = true;
    this.errorMessage = null;

    const result = await firstValueFrom(this.documentAdmin.getCategories());

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

  openEditCategoryModal(category: DocumentCategory): void {
    this.editingCategory = category;
    this.categoryForm = {
      slug: category.slug,
      name: category.name,
      description: category.description || '',
      color_bg: category.color_bg || '#acf0e0',
      color_text: category.color_text || '#000000',
      icon: category.icon || null,
      sort_order: category.sort_order || 0,
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

    this.saving = true;
    this.errorMessage = null;
    this.successMessage = null;

    const payload: Partial<DocumentCategory> = {
      slug: this.categoryForm.slug.trim() || this.generateSlug(this.categoryForm.name),
      name: this.categoryForm.name.trim(),
      description: this.categoryForm.description.trim() || null,
      color_bg: this.categoryForm.color_bg,
      color_text: this.categoryForm.color_text,
      icon: this.categoryForm.icon,
      sort_order: this.categoryForm.sort_order,
    };

    let result;
    if (this.editingCategory) {
      result = await firstValueFrom(this.documentAdmin.updateCategory(this.editingCategory.id, payload));
    } else {
      result = await firstValueFrom(this.documentAdmin.createCategory(payload));
    }

    if (!result.ok || !result.data) {
      this.errorMessage = result.message || 'Não foi possível salvar a categoria.';
      this.saving = false;
      return;
    }

    this.successMessage = this.editingCategory ? 'Categoria actualizada com sucesso.' : 'Categoria criada com sucesso.';
    this.showCategoryModal = false;
    this.editingCategory = null;
    await this.loadCategories();
    this.saving = false;
  }

  async deleteCategory(category: DocumentCategory): Promise<void> {
    if (!confirm(`Tem a certeza que deseja eliminar a categoria "${category.name}"?`)) {
      return;
    }

    this.loading = true;
    this.errorMessage = null;
    this.successMessage = null;

    const result = await firstValueFrom(this.documentAdmin.deleteCategory(category.id));

    if (!result.ok) {
      this.errorMessage = result.message || 'Não foi possível eliminar a categoria.';
      this.loading = false;
      return;
    }

    this.successMessage = 'Categoria eliminada com sucesso.';
    await this.loadCategories();
    this.loading = false;
  }

  private createEmptyForm() {
    return {
      slug: '',
      name: '',
      description: '',
      color_bg: '#acf0e0',
      color_text: '#000000',
      icon: null as string | null,
      sort_order: 0,
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
