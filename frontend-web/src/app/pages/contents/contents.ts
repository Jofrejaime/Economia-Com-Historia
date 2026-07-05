import { Component, HostListener, OnDestroy, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { FooterComponent } from '../../components/footer/footer';
import { HeaderComponent } from '../../components/header/header';
import { DocumentService, Document, DocumentCategory } from '../../services/document.service';
import { AuthService } from '../../services/auth.service';

type AccessCategory = 'all' | 'public' | 'jindungo' | 'restricted';
type DropdownKey = 'access' | 'theme' | 'level' | 'format' | 'mediaType';
interface AccessOption { id: AccessCategory; label: string; }
interface SimpleOption { id: string; label: string; }

@Component({
  selector: 'app-contents',
  standalone: true,
  imports: [CommonModule, FormsModule, HeaderComponent, FooterComponent],
  templateUrl: './contents.html',
  styleUrls: ['./contents.css']
})
export class ContentsComponent implements OnInit, OnDestroy {

  searchQuery = '';
  selectedTheme: string | null = null;
  selectedLevel: string | null = null;
  selectedFormat: string | null = null;
  selectedMediaType: string | null = null;
  selectedAccessCategory: AccessCategory = 'all';

  // Único dropdown aberto de cada vez — abrir um fecha automaticamente
  // qualquer outro que estivesse aberto, em vez de 5 booleanos independentes.
  openDropdown: DropdownKey | null = null;

  displayedDocuments: Document[] = [];
  hasMore = false;
  isLoading = false;
  totalDocuments = 0;

  categories: DocumentCategory[] = [];
  themes: string[] = [];

  isAuthenticated = false;

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
    text:  'Texto',
    audio: 'Áudio',
    video: 'Vídeo',
    image: 'Imagem',
  };

  // Extraídos dinamicamente dos documentos carregados — nunca listas fixas,
  // já que o backend não expõe um endpoint de metadados/enums dedicado.
  // Construídos de forma incremental a partir de QUALQUER lista de documentos
  // que chegue com sucesso (facets dedicados OU listagem normal) — nunca
  // dependem de uma única chamada sem filtros, que pode falhar isoladamente.
  formats: SimpleOption[] = [];
  mediaTypes: SimpleOption[] = [];
  facetsLoadFailed = false;

  levels = [
    { id: 'intro',     label: 'Introdutório' },
    { id: 'advanced',  label: 'Investigação Avançada' },
    { id: 'doctorate', label: 'Arquivo de Doutoramento' },
  ];

  accessOptions: AccessOption[] = [
    { id: 'all',        label: 'Todos os Documentos' },
    { id: 'public',     label: 'Documentos Públicos' },
    { id: 'jindungo',   label: 'Jindungo' },
    { id: 'restricted', label: 'Conteúdos Restritos' },
  ];

  private searchTimer: any = null;
  // guarda o category_id vindo da query param
  private preselectedCategoryId: string | null = null;

  private seenFormatIds = new Set<string>();
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

    // lê o category_id da query param antes de carregar
    this.preselectedCategoryId = this.route.snapshot.queryParamMap.get('category_id');

    await this.loadCategories();

    // A listagem principal é o caminho garantido — carrega-se primeiro e já
    // popula os facets a partir de dados reais. loadFacets() é só um
    // "melhor esforço" complementar para descobrir tipos que não apareçam
    // na primeira página; se falhar, a página continua perfeitamente
    // funcional com o que loadDocuments() já trouxe.
    await this.loadDocuments();
    await this.loadFacets();
  }

  ngOnDestroy(): void {
    clearTimeout(this.searchTimer);
  }

  async loadCategories(): Promise<void> {
    try {
      this.categories = await this.documentService.getCategories();
      this.themes = this.categories.map(c => c.name);

      // pré-preenche o filtro de tema se vier da home
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

  /**
   * Melhor esforço: tenta obter uma amostra sem filtros para descobrir tipos
   * que possam não estar presentes nos documentos já exibidos. Se falhar
   * (ex: erro 500 no endpoint sem filtros), não é crítico — os facets já
   * mostram os tipos vindos de loadDocuments(), e apenas assinalamos
   * facetsLoadFailed para uma indicação discreta na interface, sem quebrar
   * a experiência do utilizador.
   */
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

  /** Acrescenta, sem duplicar, os document_type/media_type encontrados numa lista de documentos. */
  private mergeFacetsFromDocuments(docs: Document[]): void {
    for (const d of docs) {
      if (d.document_type && !this.seenFormatIds.has(d.document_type)) {
        this.seenFormatIds.add(d.document_type);
        this.formats.push({ id: d.document_type, label: this.documentTypeLabels[d.document_type] ?? d.document_type });
      }
      if (d.media_type && !this.seenMediaTypeIds.has(d.media_type)) {
        this.seenMediaTypeIds.add(d.media_type);
        this.mediaTypes.push({ id: d.media_type, label: this.mediaTypeLabels[d.media_type] ?? d.media_type });
      }
    }
  }

  async loadDocuments(): Promise<void> {
    if (this.isLoading) return;
    this.isLoading = true;
    this.cdr.detectChanges();

    try {
      const hasSearch = this.searchQuery.trim().length > 0;

      if (hasSearch) {
        const params: any = { q: this.searchQuery.trim() };
        if (this.selectedFormat) params.document_type = this.selectedFormat;
        if (this.selectedMediaType) params.media_type = this.selectedMediaType;
        if (this.selectedTheme) {
          const cat = this.categories.find(c => c.name === this.selectedTheme);
          if (cat) params.category_id = cat.id;
        }
        this.displayedDocuments = await this.documentService.searchDocuments(params);
      } else {
        const params: any = {};
        if (this.selectedAccessCategory !== 'all') params.access_level_id = this.selectedAccessCategory;
        if (this.selectedFormat)    params.document_type  = this.selectedFormat;
        if (this.selectedMediaType) params.media_type     = this.selectedMediaType;
        if (this.selectedLevel)     params.academic_level = this.selectedLevel;
        if (this.selectedTheme) {
          const cat = this.categories.find(c => c.name === this.selectedTheme);
          if (cat) params.category_id = cat.id;
        }
        this.displayedDocuments = await this.documentService.getDocuments(params);
      }

      this.totalDocuments = this.displayedDocuments.length;
      this.hasMore = false;

      this.mergeFacetsFromDocuments(this.displayedDocuments);
    } catch {
      this.displayedDocuments = [];
      this.totalDocuments = 0;
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

  /** Alterna um dropdown: se já estiver aberto, fecha; se outro estiver aberto, fecha-o e abre este. */
  private toggleDropdown(key: DropdownKey): void {
    this.openDropdown = this.openDropdown === key ? null : key;
  }

  isDropdownOpen(key: DropdownKey): boolean {
    return this.openDropdown === key;
  }

  toggleAccessDropdown(): void { this.toggleDropdown('access'); }
  toggleThemeDropdown(): void { this.toggleDropdown('theme'); }
  toggleLevelDropdown(): void { this.toggleDropdown('level'); }
  toggleFormatDropdown(): void { this.toggleDropdown('format'); }
  toggleMediaTypeDropdown(): void { this.toggleDropdown('mediaType'); }

  // Getters mantidos por compatibilidade com o template actual (usam o
  // estado único openDropdown por baixo, mas preservam os mesmos nomes).
  get showAccessDropdown(): boolean { return this.isDropdownOpen('access'); }
  get showThemeDropdown(): boolean { return this.isDropdownOpen('theme'); }
  get showLevelDropdown(): boolean { return this.isDropdownOpen('level'); }
  get showFormatDropdown(): boolean { return this.isDropdownOpen('format'); }
  get showMediaTypeDropdown(): boolean { return this.isDropdownOpen('mediaType'); }

  getAccessCategoryLabel(): string {
    return this.accessOptions.find(o => o.id === this.selectedAccessCategory)?.label ?? 'Todos os Documentos';
  }

  selectAccessCategory(cat: AccessCategory): void {
    this.selectedAccessCategory = cat;
    this.openDropdown = null;
    this.loadDocuments();
  }

  getSelectedThemeLabel(): string { return this.selectedTheme ?? 'Todos os Temas'; }

  selectTheme(theme: string): void {
    this.selectedTheme = this.selectedTheme === theme ? null : theme;
    this.openDropdown = null;
    this.loadDocuments();
  }

  isThemeSelected(theme: string): boolean { return this.selectedTheme === theme; }

  getSelectedLevelLabel(): string {
    return this.levels.find(l => l.id === this.selectedLevel)?.label ?? 'Todos os Níveis';
  }

  selectLevel(level: string): void {
    this.selectedLevel = this.selectedLevel === level ? null : level;
    this.openDropdown = null;
    this.loadDocuments();
  }

  getSelectedFormatLabel(): string {
    return this.formats.find(f => f.id === this.selectedFormat)?.label ?? 'Todos os Tipos';
  }

  selectFormat(format: string): void {
    this.selectedFormat = this.selectedFormat === format ? null : format;
    this.openDropdown = null;
    this.loadDocuments();
  }

  isFormatSelected(format: string): boolean { return this.selectedFormat === format; }

  getSelectedMediaTypeLabel(): string {
    return this.mediaTypes.find(m => m.id === this.selectedMediaType)?.label ?? 'Todos os Formatos';
  }

  selectMediaType(mediaType: string): void {
    this.selectedMediaType = this.selectedMediaType === mediaType ? null : mediaType;
    this.openDropdown = null;
    this.loadDocuments();
  }

  isMediaTypeSelected(mediaType: string): boolean { return this.selectedMediaType === mediaType; }

  clearFilters(): void {
    this.selectedTheme = null;
    this.selectedLevel = null;
    this.selectedFormat = null;
    this.selectedMediaType = null;
    this.selectedAccessCategory = 'all';
    this.searchQuery = '';
    this.openDropdown = null;
    this.loadDocuments();
  }

  getAccessLabel(accessLevelId: string): string {
    switch (accessLevelId) {
      case 'jindungo':   return 'Jindungo';
      case 'restricted': return 'Restrito';
      default:           return 'Público';
    }
  }

  getAccessBadgeStyle(accessLevelId: string): { bg: string; text: string } {
    switch (accessLevelId) {
      case 'jindungo':   return { bg: '#ffd6a5', text: '#4a2c00' };
      case 'restricted': return { bg: '#ffb3ba', text: '#5c0011' };
      default:           return { bg: '#d1fae5', text: '#065f46' };
    }
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

  navigateToDocument(id: string): void {
    this.router.navigate(['/contents/view', id]);
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

  @HostListener('document:click', ['$event'])
  handleClickOutside(event: Event): void {
    const target = event.target as HTMLElement;
    if (!target.closest('.contents-filter-dropdown')) {
      this.openDropdown = null;
    }
  }
}