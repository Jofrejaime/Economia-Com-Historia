import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { firstValueFrom } from 'rxjs';
import {
  Document,
  DocumentCategory,
  DocumentListFilters,
  DocumentUpdatePayload,
} from '../../../../../models/document-admin.models';
import { MediaCollections } from '../../../../../models/media.models';
import { DocumentAdminService } from '../../../../../services/document-admin.service';
import { FileUploadComponent } from '../../../../../components/uploads/file-upload.component';
import { GalleryUploadComponent } from '../../../../../components/uploads/gallery-upload.component';
import { ImageUploadComponent } from '../../../../../components/uploads/image-upload.component';
import { MediaPreviewComponent } from '../../../../../components/uploads/media-preview.component';

type DocumentStatusFilter = 'todos' | 'draft' | 'published' | 'archived';

interface DocumentView extends Document {
  author_name: string;
  category_name: string;
}

@Component({
  selector: 'app-contents-page',
  standalone: true,
  imports: [CommonModule, FormsModule, FileUploadComponent, ImageUploadComponent, GalleryUploadComponent, MediaPreviewComponent],
  templateUrl: './contents-page.html',
  styleUrls: ['./contents-page.css']
})
export class ContentsPageComponent implements OnInit {
  loading = false;
  saving = false;
  errorMessage: string | null = null;
  successMessage: string | null = null;

  searchQuery = '';
  filterStatus: DocumentStatusFilter = 'todos';
  filterCategory = 'todos';
  filterMediaType = 'todos';
  filterAuthor = '';
  pageSize = 10;
  pageSizeOptions = [10, 20, 50];
  currentPage = 1;

  categories: DocumentCategory[] = [];
  documents: DocumentView[] = [];
  selectedDocumentId: string | null = null;
  selectedDocumentIds: Set<string> = new Set<string>();

  showDocumentModal = false;
  documentModalMode: 'view' | 'edit' = 'view';
  editingDocument: DocumentView | null = null;

  // Sprint 18.4 — uploads (pipeline único de media)
  coverFile: File | null = null;
  mainFile: File | null = null;
  galleryFiles: File[] = [];
  documentMedia: MediaCollections | null = null;
  uploadProgress: number | null = null;
  documentForm: DocumentUpdatePayload & {
    title: string;
    author: string;
    summary: string;
    content: string;
    document_type: string;
    media_type: string;
    academic_level: string;
    category_id: string | null;
    institution: string | null;
    publication_date: string | null;
    period_start: number | null;
    period_end: number | null;
    cover_image_url: string | null;
    pdf_url: string | null;
    status: 'draft' | 'published' | 'archived';
  } = this.createEmptyForm();

  constructor(private documentAdmin: DocumentAdminService) {}

  ngOnInit(): void {
    void this.loadInitialData();
  }

  get filteredDocuments(): DocumentView[] {
    return this.documents.filter((document) => {
      const search = this.searchQuery.trim().toLowerCase();
      const authorSearch = this.filterAuthor.trim().toLowerCase();
      const matchSearch = search === '' ||
        document.title.toLowerCase().includes(search) ||
        document.summary.toLowerCase().includes(search) ||
        (document.content || '').toLowerCase().includes(search) ||
        (document.author_display_name || document.author).toLowerCase().includes(search) ||
        (document.category_name || '').toLowerCase().includes(search);
      const matchAuthor = authorSearch === '' ||
        document.author.toLowerCase().includes(authorSearch) ||
        (document.author_display_name || '').toLowerCase().includes(authorSearch);
      const matchCategory = this.filterCategory === 'todos' || document.category_id === this.filterCategory;
      const matchStatus = this.filterStatus === 'todos' || document.status === this.filterStatus;
      const matchMediaType = this.filterMediaType === 'todos' || this.normalizeMediaType(document.media_type) === this.filterMediaType;
      return matchSearch && matchAuthor && matchCategory && matchStatus && matchMediaType;
    });
  }

  get pagedDocuments(): DocumentView[] {
    const start = (this.currentPage - 1) * this.pageSize;
    return this.filteredDocuments.slice(start, start + this.pageSize);
  }

  get totalPages(): number {
    return Math.max(1, Math.ceil(this.filteredDocuments.length / this.pageSize));
  }

  get pageNumbers(): number[] {
    return Array.from({ length: this.totalPages }, (_, index) => index + 1);
  }

  get pageStart(): number {
    return this.filteredDocuments.length === 0 ? 0 : (this.currentPage - 1) * this.pageSize + 1;
  }

  get pageEnd(): number {
    return Math.min(this.currentPage * this.pageSize, this.filteredDocuments.length);
  }

  getStats() {
    return {
      total: this.documents.length,
      draft: this.documents.filter((document) => document.status === 'draft').length,
      published: this.documents.filter((document) => document.status === 'published').length,
      archived: this.documents.filter((document) => document.status === 'archived').length,
    };
  }

  async loadInitialData(): Promise<void> {
    this.loading = true;
    this.errorMessage = null;

    const [documentsResult, categoriesResult] = await Promise.allSettled([
      firstValueFrom(this.documentAdmin.getDocuments(this.getServerFilters())),
      firstValueFrom(this.documentAdmin.getCategories()),
    ]);

    if (categoriesResult.status === 'fulfilled' && categoriesResult.value.ok && categoriesResult.value.data) {
      this.categories = categoriesResult.value.data;
    }

    if (documentsResult.status !== 'fulfilled' || !documentsResult.value.ok || !documentsResult.value.data) {
      this.documents = [];
      this.selectedDocumentId = null;
      this.errorMessage = documentsResult.status === 'fulfilled'
        ? (documentsResult.value.message || 'Não foi possível carregar os documentos.')
        : 'Não foi possível carregar os documentos.';
      this.loading = false;
      return;
    }

    this.documents = documentsResult.value.data.data.map((document: Document) => this.toDocumentView(document));
    this.currentPage = 1;
    this.selectedDocumentId = this.selectedDocumentId && this.documents.some((document) => document.id === this.selectedDocumentId)
      ? this.selectedDocumentId
      : (this.documents[0]?.id ?? null);

    this.loading = false;
  }

  async refreshDocuments(): Promise<void> {
    await this.loadInitialData();
  }

  onSearchChange(): void {
    this.currentPage = 1;
    void this.loadInitialData();
  }

  onFilterChange(): void {
    this.currentPage = 1;
    void this.loadInitialData();
  }

  onPageSizeChange(size: number): void {
    this.pageSize = size;
    this.currentPage = 1;
  }

  goToPage(page: number): void {
    this.currentPage = Math.max(1, Math.min(page, this.totalPages));
  }

  async openDocument(document: DocumentView, mode: 'view' | 'edit' = 'view'): Promise<void> {
    this.loading = true;
    this.errorMessage = null;
    this.successMessage = null;

    const result = await firstValueFrom(this.documentAdmin.getDocument(document.id));

    if (!result.ok || !result.data) {
      this.errorMessage = result.message || 'Não foi possível carregar o documento.';
      this.loading = false;
      return;
    }

    const detailedDocument = this.toDocumentView(result.data);
    this.selectedDocumentId = detailedDocument.id;
    this.editingDocument = detailedDocument;
    this.documentMedia = result.data.media ?? null;
    this.resetFileSelection();
    this.documentForm = {
      title: detailedDocument.title,
      author: detailedDocument.author,
      summary: detailedDocument.summary,
      content: detailedDocument.content || '',
      document_type: detailedDocument.document_type,
      media_type: detailedDocument.media_type || 'TEXT',
      academic_level: detailedDocument.academic_level,
      category_id: detailedDocument.category_id,
      institution: detailedDocument.institution,
      publication_date: detailedDocument.publication_date,
      period_start: detailedDocument.period_start,
      period_end: detailedDocument.period_end,
      cover_image_url: detailedDocument.cover_image_url,
      pdf_url: detailedDocument.pdf_url,
      status: detailedDocument.status === 'published' || detailedDocument.status === 'archived' ? detailedDocument.status : 'draft',
    };
    this.documentModalMode = mode;
    this.showDocumentModal = true;
    this.loading = false;
  }

  enableEditMode(): void {
    this.documentModalMode = 'edit';
  }

  closeDocumentModal(): void {
    this.showDocumentModal = false;
    this.editingDocument = null;
    this.documentModalMode = 'view';
    this.documentMedia = null;
    this.resetFileSelection();
  }

  openCreateDocumentModal(): void {
    this.editingDocument = null;
    this.documentForm = this.createEmptyForm();
    this.documentModalMode = 'edit';
    this.showDocumentModal = true;
    this.errorMessage = null;
    this.successMessage = null;
    this.documentMedia = null;
    this.resetFileSelection();
  }

  private resetFileSelection(): void {
    this.coverFile = null;
    this.mainFile = null;
    this.galleryFiles = [];
    this.uploadProgress = null;
  }

  onCoverFileChange(file: File | null): void {
    this.coverFile = file;
    if (file === null) {
      this.documentForm.cover_image_url = null;
    }
  }

  onMainFileChange(file: File | null): void {
    this.mainFile = file;
    if (file === null) {
      this.documentForm.pdf_url = null;
    }
  }

  async saveDocument(): Promise<void> {
    if (!this.documentForm.title.trim() || !this.documentForm.author.trim() || !this.documentForm.summary.trim()) {
      this.errorMessage = 'Título, autor e resumo são obrigatórios.';
      return;
    }


    this.saving = true;
    this.errorMessage = null;
    this.successMessage = null;

    const payload = {
      title: this.documentForm.title.trim(),
      author: this.documentForm.author.trim(),
      summary: this.documentForm.summary.trim(),
      content: this.documentForm.content.trim() || null,
      document_type: this.documentForm.document_type,
      media_type: this.documentForm.media_type,
      academic_level: this.documentForm.academic_level,
      category_id: this.documentForm.category_id || null,
      institution: this.documentForm.institution || null,
      publication_date: this.documentForm.publication_date || null,
      period_start: this.documentForm.period_start,
      period_end: this.documentForm.period_end,
      cover_image_url: this.documentForm.cover_image_url || null,
      pdf_url: this.documentForm.pdf_url || null,
      status: this.documentForm.status,
    };

    const hasFiles = this.coverFile !== null || this.mainFile !== null || this.galleryFiles.length > 0;

    // try/finally garante que o botão sai sempre do estado "A guardar..." e a
    // barra de progresso é limpa, mesmo que o recarregamento da lista falhe.
    try {
      let result;
      if (hasFiles) {
        // Sprint 18.4 — envio multipart com progresso; os ficheiros passam
        // pelo pipeline único do MediaService no backend.
        this.uploadProgress = 0;
        result = await new Promise<any>((resolve) => {
          this.documentAdmin.saveDocumentWithFiles(
            this.editingDocument?.id ?? null,
            payload as unknown as Record<string, unknown>,
            { file: this.mainFile, cover_image: this.coverFile, gallery: this.galleryFiles },
          ).subscribe({
            next: (event) => {
              if (event.state === 'progress') {
                // -1 = evento sem percentagem útil (ver serviço); ignorar.
                if (event.progress >= 0) this.uploadProgress = event.progress;
              } else {
                resolve(event.result);
              }
            },
            // Sem este handler, um erro no observable deixava a Promise (e o
            // modal) presa para sempre em "A guardar...".
            error: () => resolve({ ok: false, message: 'Não foi possível enviar os ficheiros. Verifique a ligação e tente novamente.' }),
          });
        });
      } else if (this.editingDocument) {
        result = await firstValueFrom(this.documentAdmin.updateDocument(this.editingDocument.id, payload));
      } else {
        result = await firstValueFrom(this.documentAdmin.createDocument(payload));
      }

      if (!result.ok || !result.data) {
        this.errorMessage = result.message || 'Não foi possível salvar o documento.';
        return;
      }

      this.successMessage = this.editingDocument ? 'Documento actualizado com sucesso.' : 'Documento criado com sucesso.';
      this.showDocumentModal = false;
      this.editingDocument = null;
      this.resetFileSelection();
      await this.loadInitialData();
    } finally {
      this.saving = false;
      this.uploadProgress = null;
    }
  }

  async deleteDocument(document: DocumentView): Promise<void> {
    if (!confirm('Tem a certeza que deseja eliminar este documento?')) {
      return;
    }

    this.loading = true;
    this.errorMessage = null;
    this.successMessage = null;

    const result = await firstValueFrom(this.documentAdmin.deleteDocument(document.id));

    if (!result.ok) {
      this.errorMessage = result.message || 'Não foi possível eliminar o documento.';
      this.loading = false;
      return;
    }

    this.successMessage = result.message || 'Documento eliminado com sucesso.';
    await this.loadInitialData();
  }

  getStatusLabel(status: string): string {
    const labels: Record<string, string> = {
      draft: 'Rascunho',
      published: 'Publicado',
      archived: 'Arquivado',
    };
    return labels[status] || status;
  }

  getStatusIcon(status: string): string {
    const icons: Record<string, string> = {
      draft: '📝',
      published: '✓',
      archived: '🗂️',
    };
    return icons[status] || '📄';
  }

  /** Normaliza o media_type para os 3 tipos de conteúdo do domínio (Texto/Vídeo/Podcast). */
  normalizeMediaType(mediaType: string | null | undefined): 'TEXT' | 'VIDEO' | 'AUDIO' {
    const t = (mediaType || 'TEXT').toUpperCase();
    if (t === 'VIDEO') return 'VIDEO';
    if (t === 'AUDIO') return 'AUDIO';
    return 'TEXT'; // TEXT, PDF, IMAGE ou vazio → tratados como conteúdo de leitura
  }

  getMediaTypeLabel(mediaType: string | null | undefined): string {
    const labels: Record<string, string> = { TEXT: 'Texto', VIDEO: 'Vídeo', AUDIO: 'Podcast' };
    return labels[this.normalizeMediaType(mediaType)];
  }

  getCategoryOptions(): DocumentCategory[] {
    return this.categories;
  }

  goToReports(): void {
    window.location.href = '/admin/dashboard/denuncias';
  }

  private getServerFilters(): DocumentListFilters {
    return {
      search: this.searchQuery.trim() || undefined,
      status: this.filterStatus,
      category_id: this.filterCategory,
    };
  }

  private toDocumentView(document: Document): DocumentView {
    return {
      ...document,
      author_name: document.author_display_name || document.author,
      category_name: document.category_name || this.getCategoryName(document.category_id),
    };
  }

  private getCategoryName(categoryId: string | null): string {
    if (!categoryId) {
      return 'Sem categoria';
    }

    return this.categories.find((category) => category.id === categoryId)?.name || 'Sem categoria';
  }

  private createEmptyForm() {
    return {
      title: '',
      author: '',
      summary: '',
      content: '',
      document_type: 'article',
      media_type: 'TEXT',
      academic_level: 'intro',
      category_id: null as string | null,
      institution: null as string | null,
      publication_date: null as string | null,
      period_start: null as number | null,
      period_end: null as number | null,
      cover_image_url: null as string | null,
      pdf_url: null as string | null,
      status: 'draft' as const,
    };
  }

  // ===== SELECTION AND BULK ACTIONS =====

  toggleSelectDocument(id: string): void {
    if (this.selectedDocumentIds.has(id)) {
      this.selectedDocumentIds.delete(id);
    } else {
      this.selectedDocumentIds.add(id);
    }
  }

  toggleSelectAll(event: any): void {
    const checked = event.target.checked;
    if (checked) {
      this.pagedDocuments.forEach(doc => this.selectedDocumentIds.add(doc.id));
    } else {
      this.pagedDocuments.forEach(doc => this.selectedDocumentIds.delete(doc.id));
    }
  }

  isAllSelected(): boolean {
    const paged = this.pagedDocuments;
    if (paged.length === 0) return false;
    return paged.every(doc => this.selectedDocumentIds.has(doc.id));
  }

  isDocumentSelected(id: string): boolean {
    return this.selectedDocumentIds.has(id);
  }

  clearSelection(): void {
    this.selectedDocumentIds.clear();
  }

  async bulkPublish(): Promise<void> {
    if (this.selectedDocumentIds.size === 0) return;
    this.loading = true;
    this.errorMessage = null;
    this.successMessage = null;
    try {
      const ids = Array.from(this.selectedDocumentIds);
      await Promise.all(ids.map(id => firstValueFrom(this.documentAdmin.publishDocument(id))));
      this.successMessage = `${ids.length} documentos publicados com sucesso.`;
      this.selectedDocumentIds.clear();
      await this.loadInitialData();
    } catch (e: any) {
      this.errorMessage = e.message || 'Erro ao publicar documentos.';
    } finally {
      this.loading = false;
    }
  }

  async bulkUnpublish(): Promise<void> {
    if (this.selectedDocumentIds.size === 0) return;
    this.loading = true;
    this.errorMessage = null;
    this.successMessage = null;
    try {
      const ids = Array.from(this.selectedDocumentIds);
      await Promise.all(ids.map(id => firstValueFrom(this.documentAdmin.unpublishDocument(id))));
      this.successMessage = `${ids.length} documentos despublicados com sucesso.`;
      this.selectedDocumentIds.clear();
      await this.loadInitialData();
    } catch (e: any) {
      this.errorMessage = e.message || 'Erro ao despublicar documentos.';
    } finally {
      this.loading = false;
    }
  }

  async bulkPin(): Promise<void> {
    if (this.selectedDocumentIds.size === 0) return;
    this.loading = true;
    this.errorMessage = null;
    this.successMessage = null;
    try {
      const ids = Array.from(this.selectedDocumentIds);
      await Promise.all(ids.map(id => firstValueFrom(this.documentAdmin.pinDocument(id))));
      this.successMessage = `${ids.length} documentos destacados com sucesso.`;
      this.selectedDocumentIds.clear();
      await this.loadInitialData();
    } catch (e: any) {
      this.errorMessage = e.message || 'Erro ao destacar documentos.';
    } finally {
      this.loading = false;
    }
  }

  async bulkUnpin(): Promise<void> {
    if (this.selectedDocumentIds.size === 0) return;
    this.loading = true;
    this.errorMessage = null;
    this.successMessage = null;
    try {
      const ids = Array.from(this.selectedDocumentIds);
      await Promise.all(ids.map(id => firstValueFrom(this.documentAdmin.unpinDocument(id))));
      this.successMessage = `${ids.length} documentos desafixados com sucesso.`;
      this.selectedDocumentIds.clear();
      await this.loadInitialData();
    } catch (e: any) {
      this.errorMessage = e.message || 'Erro ao desafixar documentos.';
    } finally {
      this.loading = false;
    }
  }

  async bulkDelete(): Promise<void> {
    if (this.selectedDocumentIds.size === 0) return;
    if (!confirm(`Tem a certeza que deseja eliminar permanentemente os ${this.selectedDocumentIds.size} documentos selecionados?`)) {
      return;
    }
    this.loading = true;
    this.errorMessage = null;
    this.successMessage = null;
    try {
      const ids = Array.from(this.selectedDocumentIds);
      await Promise.all(ids.map(id => firstValueFrom(this.documentAdmin.deleteDocument(id))));
      this.successMessage = `${ids.length} documentos eliminados com sucesso.`;
      this.selectedDocumentIds.clear();
      await this.loadInitialData();
    } catch (e: any) {
      this.errorMessage = e.message || 'Erro ao eliminar documentos.';
    } finally {
      this.loading = false;
    }
  }
}
