import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { firstValueFrom } from 'rxjs';
import { DocumentCategory } from '../../../../../models/document-admin.models';
import { DocumentAdminService } from '../../../../../services/document-admin.service';
import { CommunityAdminService } from '../../../../../services/community-admin.service';
import { Category as ForumCategory } from '../../../../../models/community-admin.models';
import { ImageUploadComponent } from '../../../../../components/uploads/image-upload.component';
import { MediaObject } from '../../../../../models/media.models';

type CategoryType = 'document' | 'forum';

interface CategoryFormState {
  slug: string;
  name: string;
  description: string;
  color_bg: string | null;
  color_text: string | null;
  icon: string | null;
  cover_image_url: string | null;
  is_active: boolean;
  sort_order: number;
  // Só para categorias de documentos: restrita = exige subscrição.
  requires_subscription: boolean;
}

@Component({
  selector: 'app-categories-page',
  standalone: true,
  imports: [CommonModule, FormsModule, ImageUploadComponent],
  templateUrl: './categories-page.html',
  styleUrls: ['./categories-page.css']
})
export class CategoriesPageComponent implements OnInit {
  searchQuery = '';
  loading = false;
  saving = false;
  errorMessage: string | null = null;
  successMessage: string | null = null;

  // Tipo de categoria em gestão: documentos ou fórum (comunidade)
  categoryType: CategoryType = 'document';

  showCategoryModal = false;
  editingCategory: any | null = null;

  categoryForm: CategoryFormState = this.createEmptyForm();

  categories: DocumentCategory[] = [];
  forumCategories: ForumCategory[] = [];

  colorOptions = [
    { value: '#acf0e0', name: 'Verde água' },
    { value: '#ffd6a5', name: 'Laranja claro' },
    { value: '#d4c5f9', name: 'Lavanda' },
    { value: '#ffb3ba', name: 'Rosa claro' },
    { value: '#bae1ff', name: 'Azul claro' },
    { value: '#c7ceea', name: 'Azul acinzentado' },
    { value: '#d1fae5', name: 'Verde menta' },
  ];

  constructor(
    private documentAdmin: DocumentAdminService,
    private community: CommunityAdminService
  ) {}

  ngOnInit(): void {
    void this.loadCurrentType();
  }

  get isForum(): boolean {
    return this.categoryType === 'forum';
  }

  switchType(type: CategoryType): void {
    if (this.categoryType === type) {
      return;
    }
    this.categoryType = type;
    this.searchQuery = '';
    this.errorMessage = null;
    this.successMessage = null;
    void this.loadCurrentType();
  }

  private loadCurrentType(): Promise<void> {
    return this.isForum ? this.loadForumCategories() : this.loadCategories();
  }

  get filteredCategories(): any[] {
    const source: any[] = this.isForum ? this.forumCategories : this.categories;
    const search = this.searchQuery.trim().toLowerCase();
    return source.filter((cat) =>
      search === '' ||
      cat.name.toLowerCase().includes(search) ||
      (cat.description || '').toLowerCase().includes(search) ||
      cat.slug.toLowerCase().includes(search)
    );
  }

  getStats() {
    const list: any[] = this.isForum ? this.forumCategories : this.categories;
    return {
      total: list.length,
      topics: this.isForum
        ? this.forumCategories.reduce((sum, c) => sum + (c.topics_count ?? 0), 0)
        : null,
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

  async loadForumCategories(): Promise<void> {
    this.loading = true;
    this.errorMessage = null;

    const result = await firstValueFrom(this.community.getAdminCategories());

    if (!result.ok || !result.data) {
      this.forumCategories = [];
      this.errorMessage = result.message || 'Não foi possível carregar as categorias do fórum.';
      this.loading = false;
      return;
    }

    this.forumCategories = result.data;
    this.loading = false;
  }

  openAddCategoryModal(): void {
    this.editingCategory = null;
    this.categoryForm = this.createEmptyForm();
    this.showCategoryModal = true;
    this.errorMessage = null;
    this.successMessage = null;
  }

  openEditCategoryModal(category: any): void {
    this.editingCategory = category;
    this.categoryForm = {
      slug: category.slug,
      name: category.name,
      description: category.description || '',
      color_bg: category.color_bg || '#acf0e0',
      color_text: category.color_text || '#000000',
      icon: category.icon || null,
      cover_image_url: category.cover_image_url || null,
      is_active: category.is_active ?? true,
      sort_order: category.sort_order || 0,
      requires_subscription: category.requires_subscription ?? false,
    };
    this.showCategoryModal = true;
    this.errorMessage = null;
    this.successMessage = null;
  }

  onCategoryCoverChange(media: MediaObject | null): void {
    this.categoryForm.cover_image_url = media?.url ?? null;
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

    // try/finally garante que o botão sai sempre do estado "A guardar...",
    // mesmo que o recarregamento da lista falhe.
    try {
      const result = this.isForum
        ? await this.saveForumCategory()
        : await this.saveDocumentCategory();

      if (!result.ok || !result.data) {
        this.errorMessage = result.message || 'Não foi possível salvar a categoria.';
        return;
      }

      this.successMessage = this.editingCategory ? 'Categoria actualizada com sucesso.' : 'Categoria criada com sucesso.';
      this.showCategoryModal = false;
      this.editingCategory = null;
      await this.loadCurrentType();
    } finally {
      this.saving = false;
    }
  }

  private saveDocumentCategory() {
    const payload: Partial<DocumentCategory> = {
      slug: this.categoryForm.slug.trim() || this.generateSlug(this.categoryForm.name),
      name: this.categoryForm.name.trim(),
      description: this.categoryForm.description.trim() || null,
      color_bg: this.categoryForm.color_bg,
      color_text: this.categoryForm.color_text,
      icon: this.categoryForm.icon,
      sort_order: this.categoryForm.sort_order,
      requires_subscription: this.categoryForm.requires_subscription,
    };

    return firstValueFrom(
      this.editingCategory
        ? this.documentAdmin.updateCategory(this.editingCategory.id, payload)
        : this.documentAdmin.createCategory(payload)
    );
  }

  private saveForumCategory() {
    const payload: any = {
      slug: this.categoryForm.slug.trim() || this.generateSlug(this.categoryForm.name),
      name: this.categoryForm.name.trim(),
      description: this.categoryForm.description.trim() || null,
      color_bg: this.categoryForm.color_bg,
      color_text: this.categoryForm.color_text,
      cover_image_url: this.categoryForm.cover_image_url || null,
      sort_order: this.categoryForm.sort_order,
      is_active: this.categoryForm.is_active,
    };

    return firstValueFrom(
      this.editingCategory
        ? this.community.updateAdminCategory(this.editingCategory.id, payload)
        : this.community.createAdminCategory(payload)
    );
  }

  async deleteCategory(category: any): Promise<void> {
    if (!confirm(`Tem a certeza que deseja eliminar a categoria "${category.name}"?`)) {
      return;
    }

    this.loading = true;
    this.errorMessage = null;
    this.successMessage = null;

    const result = await firstValueFrom(
      this.isForum
        ? this.community.deleteAdminCategory(category.id)
        : this.documentAdmin.deleteCategory(category.id)
    );

    if (!result.ok) {
      this.errorMessage = result.message || 'Não foi possível eliminar a categoria.';
      this.loading = false;
      return;
    }

    this.successMessage = 'Categoria eliminada com sucesso.';
    await this.loadCurrentType();
    this.loading = false;
  }

  private createEmptyForm(): CategoryFormState {
    return {
      slug: '',
      name: '',
      description: '',
      color_bg: '#acf0e0',
      color_text: '#000000',
      icon: null,
      cover_image_url: null,
      is_active: true,
      sort_order: 0,
      requires_subscription: false,
    };
  }

  private generateSlug(name: string): string {
    return name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[̀-ͯ]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }
}
