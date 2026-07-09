import { Component, HostListener, OnDestroy, OnInit, AfterViewInit, ViewChild, ElementRef, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { FooterComponent } from '../../components/footer/footer';
import { HeaderComponent } from '../../components/header/header';
import { DocumentService, Document, DocumentCategory, PageMeta } from '../../services/document.service';
import { AuthService } from '../../services/auth.service';

type DropdownKey = 'theme' | 'mediaType';

interface SimpleOption { id: string; label: string; }

@Component({
  selector: 'app-contents',
  standalone: true,
  imports: [CommonModule, FormsModule, HeaderComponent, FooterComponent],
  templateUrl: './contents.html',
  styleUrls: ['./contents.css']
})
export class ContentsComponent implements OnInit, AfterViewInit, OnDestroy {

  @ViewChild('scrollAnchor') scrollAnchor?: ElementRef<HTMLElement>;
  private intersectionObserver?: IntersectionObserver;

  searchQuery = '';
  selectedTheme: string | null = null;
  selectedMediaType: string | null = null;

  // Único dropdown aberto de cada vez — abrir um fecha automaticamente
  // qualquer outro que estivesse aberto, em vez de 5 booleanos independentes.
  openDropdown: DropdownKey | null = null;

  displayedDocuments: Document[] = [];
  hasMore = false;
  isLoading = false;
  totalDocuments = 0;
  private currentPage = 1;

  categories: DocumentCategory[] = [];
  themes: string[] = [];

  isAuthenticated = false;

  // ─── Modal de pedido de subscrição (categorias restritas) ────────────────
  accessModalDoc: Document | null = null;
  accessRequesting = false;
  accessRequestDone = false;
  accessRequestError: string | null = null;

  // Labels amigáveis para valores conhecidos; qualquer document_type/media_type
  // que apareça nos dados mas não esteja aqui usa o próprio valor como label.
  private documentTypeLabels: Record<string, string> = {
    manuscript: 'Manuscrito',
    article:    'Artigo',
    report:     'Relatório',
    thesis:     'Tese',
    archive:    'Arquivo',
  };

  private mediaTypeLabels: Record<string, string> = {
    TEXT:  'Texto',
    PDF:   'Texto',
    VIDEO: 'Vídeo',
    AUDIO: 'Podcast',
    IMAGE: 'Imagem',
  };

  mediaTypes: SimpleOption[] = [];
  facetsLoadFailed = false;

  private searchTimer: any = null;
  private preselectedCategoryId: string | null = null;

  private seenMediaTypeIds = new Set<string>();

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private documentService: DocumentService,
    private authService: AuthService,
    private cdr: ChangeDetectorRef
  ) {}

  async ngOnInit(): Promise<void> {
    this.isAuthenticated = this.authService.isAuthenticated();
    this.preselectedCategoryId = this.route.snapshot.queryParamMap.get('category_id');

    await this.loadCategories();
    await this.loadDocuments();
    await this.loadFacets();
  }

  ngAfterViewInit(): void {
    if (!this.scrollAnchor) return;

    this.intersectionObserver = new IntersectionObserver((entries) => {
      if (entries[0]?.isIntersecting && this.hasMore && !this.isLoading) {
        void this.loadMoreDocuments();
      }
    });
    this.intersectionObserver.observe(this.scrollAnchor.nativeElement);
  }

  ngOnDestroy(): void {
    clearTimeout(this.searchTimer);
    this.intersectionObserver?.disconnect();
  }

  async loadCategories(): Promise<void> {
    try {
      this.categories = await this.documentService.getCategories();
      this.themes = this.categories.map(c => c.name);

      if (this.preselectedCategoryId) {
        const cat = this.categories.find(c => c.id === this.preselectedCategoryId);
        if (cat) {
          this.selectedTheme = cat.name;
        }
        this.preselectedCategoryId = null;
      }
    } catch {
      this.themes = [];
    } finally {
      this.cdr.detectChanges();
    }
  }

  private async loadFacets(): Promise<void> {
    try {
      const sample = await this.documentService.getDocuments();
      this.mergeFacetsFromDocuments(sample);
      this.facetsLoadFailed = false;
    } catch {
      this.facetsLoadFailed = true;
    } finally {
      this.cdr.detectChanges();
    }
  }

  private mergeFacetsFromDocuments(docs: Document[]): void {
    for (const d of docs) {
      const type = d.media_type || 'TEXT';
      if (!this.seenMediaTypeIds.has(type)) {
        this.seenMediaTypeIds.add(type);
        this.mediaTypes.push({ id: type, label: this.mediaTypeLabels[type] ?? type });
      }
    }
  }

  /** Busca uma página de resultados, decidindo internamente pesquisa vs listagem/filtros. */
  private async fetchPage(page: number): Promise<{ data: Document[]; meta: PageMeta }> {
    const hasSearch = this.searchQuery.trim().length > 0;

    if (hasSearch) {
      const params: any = { q: this.searchQuery.trim(), page };
      if (this.selectedMediaType) params.media_type = this.selectedMediaType;
      if (this.selectedTheme) {
        const cat = this.categories.find(c => c.name === this.selectedTheme);
        if (cat) params.category_id = cat.id;
      }
      return this.documentService.searchDocumentsPage(params);
    }

    const params: any = { page };
    if (this.selectedMediaType) params.media_type = this.selectedMediaType;
    if (this.selectedTheme) {
      const cat = this.categories.find(c => c.name === this.selectedTheme);
      if (cat) params.category_id = cat.id;
    }
    return this.documentService.getDocumentsPage(params);
  }

  /** Carrega a primeira página — chamado ao mudar filtros/pesquisa, substitui a lista actual. */
  async loadDocuments(): Promise<void> {
    if (this.isLoading) return;
    this.isLoading = true;
    this.cdr.detectChanges();

    try {
      const { data, meta } = await this.fetchPage(1);

      this.displayedDocuments = data;
      this.currentPage = meta.current_page;
      this.totalDocuments = meta.total;
      this.hasMore = meta.current_page < meta.last_page;

      this.mergeFacetsFromDocuments(data);
    } catch {
      this.displayedDocuments = [];
      this.totalDocuments = 0;
      this.hasMore = false;
    } finally {
      this.isLoading = false;
      this.cdr.detectChanges();
    }
  }

  /** Acrescenta a página seguinte — chamado pelo IntersectionObserver do scroll infinito. */
  async loadMoreDocuments(): Promise<void> {
    if (this.isLoading || !this.hasMore) return;
    this.isLoading = true;
    this.cdr.detectChanges();

    try {
      const { data, meta } = await this.fetchPage(this.currentPage + 1);

      this.displayedDocuments = [...this.displayedDocuments, ...data];
      this.currentPage = meta.current_page;
      this.totalDocuments = meta.total;
      this.hasMore = meta.current_page < meta.last_page;

      this.mergeFacetsFromDocuments(data);
    } catch {
      // Mantém a lista já carregada; simplesmente não avança mais.
      this.hasMore = false;
    } finally {
      this.isLoading = false;
      this.cdr.detectChanges();
    }
  }

  onSearchInput(): void {
    clearTimeout(this.searchTimer);
    this.searchTimer = setTimeout(() => this.loadDocuments(), 400);
  }

  // ─── Gestão centralizada dos dropdowns (mutuamente exclusivos) ───────────

  private toggleDropdown(key: DropdownKey): void {
    this.openDropdown = this.openDropdown === key ? null : key;
    this.cdr.detectChanges();
  }

  isDropdownOpen(key: DropdownKey): boolean {
    return this.openDropdown === key;
  }

  toggleThemeDropdown(): void { this.toggleDropdown('theme'); }
  toggleMediaTypeDropdown(): void { this.toggleDropdown('mediaType'); }

  get showThemeDropdown(): boolean { return this.isDropdownOpen('theme'); }
  get showMediaTypeDropdown(): boolean { return this.isDropdownOpen('mediaType'); }

  getSelectedThemeLabel(): string { return this.selectedTheme ?? 'Todos os Temas'; }

  selectTheme(theme: string): void {
    this.selectedTheme = this.selectedTheme === theme ? null : theme;
    this.openDropdown = null;
    this.loadDocuments();
  }

  isThemeSelected(theme: string): boolean { return this.selectedTheme === theme; }

  getSelectedMediaTypeLabel(): string {
    return this.mediaTypes.find(m => m.id === this.selectedMediaType)?.label ?? 'Todos os Tipos';
  }

  selectMediaType(mediaType: string): void {
    this.selectedMediaType = this.selectedMediaType === mediaType ? null : mediaType;
    this.openDropdown = null;
    this.loadDocuments();
  }

  isMediaTypeSelected(mediaType: string): boolean { return this.selectedMediaType === mediaType; }

  clearFilters(): void {
    this.selectedTheme = null;
    this.selectedMediaType = null;
    this.searchQuery = '';
    this.openDropdown = null;
    this.loadDocuments();
  }

  /**
   * Badge/label por documento — decidido pela categoria: restrita
   * (requires_subscription) → "Subscrição"; caso contrário "Público".
   */
  getDocBadge(doc: Document): { label: string; bg: string; text: string } {
    if (doc.category?.requires_subscription === true) {
      return { label: 'Subscrição', bg: '#e0d4f7', text: '#3b1f6b' };
    }
    return { label: 'Público', bg: '#d1fae5', text: '#065f46' };
  }

  getFormatLabel(format: string): string {
    return this.documentTypeLabels[format] ?? format;
  }

  getMediaTypeLabel(mediaType: string | null): string {
    if (!mediaType) return '';
    return this.mediaTypeLabels[mediaType] ?? mediaType;
  }

  hasDocumentImage(doc: Document): boolean {
    return !!doc.cover_image_url?.trim();
  }

  getDocumentImage(doc: Document): string {
    return doc.cover_image_url ?? '';
  }

  // ==========================================
  // ACESSO A CONTEÚDOS RESTRITOS (subscrição)
  // ==========================================

  /**
   * Um documento precisa de subscrição quando a sua categoria é restrita
   * (requires_subscription) e o utilizador ainda não tem acesso.
   */
  private needsAccessRequest(doc: Document): boolean {
    if (doc.category?.requires_subscription !== true) {
      return false;
    }
    const anyDoc = doc as any;
    if (anyDoc.has_access === true || anyDoc.is_subscribed === true) {
      return false;
    }
    const role = (this.authService.getUser() as any)?.role;
    if (role === 'admin') return false;

    return true;
  }

  navigateToDocument(id: string): void {
    const doc = this.displayedDocuments.find(d => d.id === id);

    if (doc && this.needsAccessRequest(doc)) {
      this.openAccessModal(doc);
      return;
    }

    this.router.navigate(['/contents/view', id]);
  }

  openAccessModal(doc: Document): void {
    this.accessModalDoc = doc;
    this.accessRequesting = false;
    this.accessRequestDone = false;
    this.accessRequestError = null;
    this.cdr.detectChanges();

    // Se autenticado, verifica em background se já existe pedido/subscrição
    // (GET /documents/{id}/subscription). Não bloqueia a abertura do modal.
    if (this.isAuthenticated) {
      this.documentService.getSubscriptionStatus(doc.id)
        .then((res) => {
          const status = String(res?.status ?? '').toLowerCase();
          if (status === 'pending') {
            // já pediu — mostra diretamente o estado "pedido enviado"
            this.accessRequestDone = true;
          } else if (status === 'active') {
            // já tem subscrição ativa — fecha o modal e entra direto no conteúdo
            (doc as any).is_subscribed = true;
            this.closeAccessModal();
            this.router.navigate(['/contents/view', doc.id]);
            return;
          }
          this.cdr.detectChanges();
        })
        .catch(() => { /* sem status conhecido — mantém o fluxo normal */ });
    }
  }

  closeAccessModal(): void {
    this.accessModalDoc = null;
    this.accessRequesting = false;
    this.accessRequestDone = false;
    this.accessRequestError = null;
    this.cdr.detectChanges();
  }

  async requestAccess(): Promise<void> {
    if (!this.accessModalDoc || this.accessRequesting) return;

    // Visitantes têm de iniciar sessão antes de pedir acesso
    if (!this.isAuthenticated) {
      this.closeAccessModal();
      this.router.navigate(['/auth/login']);
      return;
    }

    this.accessRequesting = true;
    this.accessRequestError = null;
    this.cdr.detectChanges();

    try {
      // Acesso a documentos restritos é sempre por subscrição por-documento.
      // O backend nunca devolve erro para duplicados: responde 200 com
      // already_exists quando já há pedido ACTIVE/PENDING.
      await this.documentService.subscribeDocument(this.accessModalDoc.id);
      this.accessRequestDone = true;
      // Marca localmente para não voltar a pedir nesta sessão
      (this.accessModalDoc as any).is_subscribed = true;
    } catch (err: any) {
      if (err?.status === 409 || err?.status === 422) {
        // já tinha um pedido — trata como sucesso (relevante sobretudo para
        // access requests duplicados; a subscrição não devolve erro nesse caso)
        this.accessRequestDone = true;
        (this.accessModalDoc as any).is_subscribed = true;
      } else {
        this.accessRequestError = err?.error?.message ?? 'Erro ao enviar o pedido de acesso. Tente novamente.';
      }
    } finally {
      this.accessRequesting = false;
      this.cdr.detectChanges();
    }
  }

  async toggleLike(event: Event, doc: Document): Promise<void> {
    event.stopPropagation();
    if (!this.isAuthenticated) {
      this.router.navigate(['/auth/login']);
      return;
    }
    try {
      if (doc.is_liked) {
        await this.documentService.unlikeDocument(doc.id);
        doc.is_liked = false;
        doc.likes_count = Math.max(0, (doc.likes_count ?? 1) - 1);
      } else {
        await this.documentService.likeDocument(doc.id);
        doc.is_liked = true;
        doc.likes_count = (doc.likes_count ?? 0) + 1;
      }
      this.cdr.detectChanges();
    } catch {}
  }

  async toggleFavorite(event: Event, doc: Document): Promise<void> {
    event.stopPropagation();
    if (!this.isAuthenticated) {
      this.router.navigate(['/auth/login']);
      return;
    }
    try {
      if (doc.is_favorited) {
        await this.documentService.unfavoriteDocument(doc.id);
        doc.is_favorited = false;
      } else {
        await this.documentService.favoriteDocument(doc.id);
        doc.is_favorited = true;
      }
      this.cdr.detectChanges();
    } catch {}
  }

  goToSaved(): void {
    if (!this.isAuthenticated) {
      this.router.navigate(['/auth/login']);
      return;
    }
    this.router.navigate(['/contents/saved']);
  }

  hasActiveFilters(): boolean {
    return !!(this.searchQuery.trim() || this.selectedTheme || this.selectedMediaType);
  }

  @HostListener('document:click', ['$event'])
  handleClickOutside(event: Event): void {
    const target = event.target as HTMLElement;
    if (!target.closest('.contents-filter-dropdown') && this.openDropdown !== null) {
      this.openDropdown = null;
      this.cdr.detectChanges();
    }
  }
}