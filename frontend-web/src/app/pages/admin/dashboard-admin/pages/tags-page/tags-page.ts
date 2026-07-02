import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { firstValueFrom } from 'rxjs';
import { DocumentAdminService, TagRecord } from '../../../../../services/document-admin.service';

@Component({
  selector: 'app-tags-page',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './tags-page.html',
  styleUrls: ['./tags-page.css']
})
export class TagsPageComponent implements OnInit {
  searchQuery = '';
  loading = false;
  saving = false;
  errorMessage: string | null = null;
  successMessage: string | null = null;

  showTagModal = false;
  editingTag: TagRecord | null = null;

  tagForm = {
    name: ''
  };

  tags: TagRecord[] = [];

  constructor(private documentAdmin: DocumentAdminService) {}

  ngOnInit(): void {
    void this.loadTags();
  }

  get filteredTags(): TagRecord[] {
    return this.tags.filter((tag) => {
      const search = this.searchQuery.trim().toLowerCase();
      return search === '' ||
        tag.name.toLowerCase().includes(search) ||
        tag.slug.toLowerCase().includes(search);
    });
  }

  async loadTags(): Promise<void> {
    this.loading = true;
    this.errorMessage = null;

    const result = await firstValueFrom(this.documentAdmin.getTags({ q: this.searchQuery }));

    if (!result.ok || !result.data) {
      this.tags = [];
      this.errorMessage = result.message || 'Não foi possível carregar as tags.';
      this.loading = false;
      return;
    }

    // Backend responds with Envelope of tags array or Paginated response. Let's handle both.
    this.tags = result.data.data ?? result.data ?? [];
    this.loading = false;
  }

  openAddTagModal(): void {
    this.editingTag = null;
    this.tagForm = { name: '' };
    this.showTagModal = true;
    this.errorMessage = null;
    this.successMessage = null;
  }

  openEditTagModal(tag: TagRecord): void {
    this.editingTag = tag;
    this.tagForm = {
      name: tag.name
    };
    this.showTagModal = true;
    this.errorMessage = null;
    this.successMessage = null;
  }

  closeTagModal(): void {
    if (this.saving) {
      return;
    }
    this.showTagModal = false;
    this.editingTag = null;
  }

  async saveTag(): Promise<void> {
    if (!this.tagForm.name.trim()) {
      this.errorMessage = 'Por favor, insira o nome da tag.';
      return;
    }

    this.saving = true;
    this.errorMessage = null;
    this.successMessage = null;

    const payload = {
      name: this.tagForm.name.trim()
    };

    let result;
    if (this.editingTag) {
      result = await firstValueFrom(this.documentAdmin.updateTag(this.editingTag.id, payload));
    } else {
      result = await firstValueFrom(this.documentAdmin.createTag(payload));
    }

    if (!result.ok || !result.data) {
      this.errorMessage = result.message || 'Não foi possível salvar a tag.';
      this.saving = false;
      return;
    }

    this.successMessage = this.editingTag ? 'Tag actualizada com sucesso.' : 'Tag criada com sucesso.';
    this.showTagModal = false;
    this.editingTag = null;
    await this.loadTags();
    this.saving = false;
  }

  async deleteTag(tag: TagRecord): Promise<void> {
    if (!confirm(`Tem a certeza que deseja eliminar a tag "${tag.name}"?`)) {
      return;
    }

    this.loading = true;
    this.errorMessage = null;
    this.successMessage = null;

    // Try normal deletion first. If 409 Conflict, ask for forced confirmation.
    const result = await firstValueFrom(this.documentAdmin.deleteTag(tag.id, false));

    if (!result.ok) {
      if (result.status === 409) {
        // Tag is in use! Show interactive confirm box.
        const forceConfirm = confirm(
          `Esta tag está a ser usada por documentos. Deseja eliminá-la de qualquer forma? Os vínculos nos documentos serão removidos.`
        );
        if (forceConfirm) {
          const forceResult = await firstValueFrom(this.documentAdmin.deleteTag(tag.id, true));
          if (forceResult.ok) {
            this.successMessage = 'Tag em uso eliminada com sucesso.';
            await this.loadTags();
          } else {
            this.errorMessage = forceResult.message || 'Erro ao forçar eliminação da tag.';
          }
        }
      } else {
        this.errorMessage = result.message || 'Não foi possível eliminar a tag.';
      }
      this.loading = false;
      return;
    }

    this.successMessage = 'Tag eliminada com sucesso.';
    await this.loadTags();
    this.loading = false;
  }
}
