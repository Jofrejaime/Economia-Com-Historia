import { Component, HostListener, OnDestroy, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { FooterComponent } from '../../components/footer/footer';
import { HeaderComponent } from '../../components/header/header';
import { DocumentService, Document, DocumentCategory } from '../../services/document.service';

type AccessCategory = 'all' | 'public' | 'jindungo' | 'restricted';
interface AccessOption { id: AccessCategory; label: string; }

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
  selectedAccessCategory: AccessCategory = 'all';

  showAccessDropdown = false;
  showThemeDropdown = false;
  showLevelDropdown = false;
  showFormatDropdown = false;

  displayedDocuments: Document[] = [];
  hasMore = false;
  isLoading = false;
  totalDocuments = 0;

  categories: DocumentCategory[] = [];
  themes: string[] = [];

  formats = [
    { id: 'manuscript', label: 'Manuscrito' },
    { id: 'article',    label: 'Artigo' },
    { id: 'report',     label: 'Relatório' },
    { id: 'thesis',     label: 'Tese' },
    { id: 'archive',    label: 'Arquivo' },
  ];

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

  constructor(
    private router: Router,
    private documentService: DocumentService,
    private cdr: ChangeDetectorRef
  ) {}

  async ngOnInit(): Promise<void> {
    await this.loadCategories();
    await this.loadDocuments();
  }

  ngOnDestroy(): void {
    clearTimeout(this.searchTimer);
  }

  async loadCategories(): Promise<void> {
    try {
      this.categories = await this.documentService.getCategories();
      this.themes = this.categories.map(c => c.name);
    } catch {
      this.themes = [];
    } finally {
      this.cdr.detectChanges();
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
        if (this.selectedTheme) {
          const cat = this.categories.find(c => c.name === this.selectedTheme);
          if (cat) params.category_id = cat.id;
        }
        this.displayedDocuments = await this.documentService.searchDocuments(params);
      } else {
        const params: any = {};
        if (this.selectedAccessCategory !== 'all') params.access_level_id = this.selectedAccessCategory;
        if (this.selectedFormat)  params.document_type  = this.selectedFormat;
        if (this.selectedLevel)   params.academic_level = this.selectedLevel;
        if (this.selectedTheme) {
          const cat = this.categories.find(c => c.name === this.selectedTheme);
          if (cat) params.category_id = cat.id;
        }
        this.displayedDocuments = await this.documentService.getDocuments(params);
      }

      this.totalDocuments = this.displayedDocuments.length;
      this.hasMore = false;
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

  getAccessCategoryLabel(): string {
    return this.accessOptions.find(o => o.id === this.selectedAccessCategory)?.label ?? 'Todos os Documentos';
  }

  selectAccessCategory(cat: AccessCategory): void {
    this.selectedAccessCategory = cat;
    this.showAccessDropdown = false;
    this.loadDocuments();
  }

  toggleAccessDropdown(): void { this.showAccessDropdown = !this.showAccessDropdown; }

  getSelectedThemeLabel(): string { return this.selectedTheme ?? 'Todos os Temas'; }

  selectTheme(theme: string): void {
    this.selectedTheme = this.selectedTheme === theme ? null : theme;
    this.showThemeDropdown = false;
    this.loadDocuments();
  }

  toggleThemeDropdown(): void { this.showThemeDropdown = !this.showThemeDropdown; }
  isThemeSelected(theme: string): boolean { return this.selectedTheme === theme; }

  getSelectedLevelLabel(): string {
    return this.levels.find(l => l.id === this.selectedLevel)?.label ?? 'Todos os Níveis';
  }

  selectLevel(level: string): void {
    this.selectedLevel = this.selectedLevel === level ? null : level;
    this.showLevelDropdown = false;
    this.loadDocuments();
  }

  toggleLevelDropdown(): void { this.showLevelDropdown = !this.showLevelDropdown; }

  getSelectedFormatLabel(): string {
    return this.formats.find(f => f.id === this.selectedFormat)?.label ?? 'Todos os Formatos';
  }

  selectFormat(format: string): void {
    this.selectedFormat = this.selectedFormat === format ? null : format;
    this.showFormatDropdown = false;
    this.loadDocuments();
  }

  toggleFormatDropdown(): void { this.showFormatDropdown = !this.showFormatDropdown; }
  isFormatSelected(format: string): boolean { return this.selectedFormat === format; }

  clearFilters(): void {
    this.selectedTheme = null;
    this.selectedLevel = null;
    this.selectedFormat = null;
    this.selectedAccessCategory = 'all';
    this.searchQuery = '';
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
    return this.formats.find(f => f.id === format)?.label ?? format;
  }

  getDocumentImage(doc: Document): string {
    return doc.cover_image_url ?? 'assets/images/document-placeholder.jpg';
  }

  navigateToDocument(id: string): void {
    this.router.navigate(['/contents/view', id]);
  }

  @HostListener('document:click', ['$event'])
  handleClickOutside(event: Event): void {
    const target = event.target as HTMLElement;
    if (!target.closest('.contents-filter-dropdown')) {
      this.showAccessDropdown = false;
      this.showThemeDropdown = false;
      this.showLevelDropdown = false;
      this.showFormatDropdown = false;
    }
  }
}