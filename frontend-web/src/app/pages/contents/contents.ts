import { Component, ElementRef, HostListener, ViewChild, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { FooterComponent } from '../../components/footer/footer';
import { HeaderComponent } from '../../components/header/header';

type Theme = string;
type Level = 'intro' | 'advanced' | 'doctorate';
type Format = string;
type AccessCategory = 'all' | 'public' | 'jindungo' | 'restricted';

interface AccessOption {
  id: AccessCategory;
  label: string;
  badge?: string;
  badgeColor?: string;
  badgeTextColor?: string;
}

interface Document {
  id: number;
  title: string;
  description: string;
  type: string;
  date: string;
  imageUrl: string;
  accessLevel: string;
}

@Component({
  selector: 'app-contents',
  standalone: true,
  imports: [CommonModule, FormsModule, HeaderComponent, FooterComponent],
  templateUrl: './contents.html',
  styleUrls: ['./contents.css']
})
export class ContentsComponent implements OnInit, OnDestroy {
  @ViewChild('dropdownRef') dropdownRef!: ElementRef;
  @ViewChild('scrollAnchor') scrollAnchor!: ElementRef;

  searchQuery = '';
  selectedThemes: Theme[] = [];
  selectedLevel: Level | null = null;
  selectedFormats: Format[] = [];
  selectedAccessCategory: AccessCategory = 'all';
  
  showAccessDropdown = false;
  showThemeDropdown = false;
  showLevelDropdown = false;
  showFormatDropdown = false;

  // ===== INFINITE SCROLL =====
  displayedDocuments: Document[] = [];
  currentPage = 0;
  pageSize = 4;
  hasMore = true;
  private observer: IntersectionObserver | null = null;

  themes: Theme[] = [
    'Infraestrutura Colonial',
    'Café e Agricultura',
    'Política Pós-Independência',
    'Mineração e Indústria Extrativa'
  ];

  formats: Format[] = [
    'Manuscritos',
    'Revistas Estatísticas',
    'Registos Fotográficos',
    'Correspondência Oficial'
  ];

  levels = [
    { id: 'intro' as Level, label: 'Introdutório' },
    { id: 'advanced' as Level, label: 'Investigação Avançada' },
    { id: 'doctorate' as Level, label: 'Arquivo de Doutoramento' }
  ];

  accessOptions: AccessOption[] = [
    { id: 'all', label: 'Todos os Documentos' },
    { id: 'public', label: 'Documentos Públicos' },
    { id: 'jindungo', label: 'Jindungo', badge: 'Privado', badgeColor: '#ffd6a5', badgeTextColor: '#4a2c00' },
    { id: 'restricted', label: 'Conteúdos Restritos', badge: 'Privado', badgeColor: '#ffb3ba', badgeTextColor: '#5c0011' }
  ];

  allDocuments: Document[] = [
    {
      id: 1,
      title: 'O Ciclo do Café em Angola (1950-1975)',
      description: 'Análise detalhada da produção e exportação do café durante o período colonial.',
      type: 'Revistas Estatísticas',
      date: '1972',
      imageUrl: 'https://images.unsplash.com/photo-1442512595331-e89e73853f31?w=400&q=80',
      accessLevel: 'public'
    },
    {
      id: 2,
      title: 'Infraestrutura Ferroviária Colonial',
      description: 'Mapas e documentos sobre a construção do Caminho de Ferro de Benguela.',
      type: 'Manuscritos',
      date: '1965',
      imageUrl: 'https://images.unsplash.com/photo-1557318041-1ce374d55ebf?w=400&q=80',
      accessLevel: 'public'
    },
    {
      id: 3,
      title: 'Políticas Económicas Pós-Independência',
      description: 'Documentos oficiais sobre a reforma agrária e nacionalizações.',
      type: 'Correspondência Oficial',
      date: '1978',
      imageUrl: 'https://images.unsplash.com/photo-1591696205602-2f950c417cb9?w=400&q=80',
      accessLevel: 'jindungo'
    },
    {
      id: 4,
      title: 'Registos Fotográficos da Agricultura',
      description: 'Colecção de fotografias históricas das plantações de café e algodão.',
      type: 'Registos Fotográficos',
      date: '1960',
      imageUrl: 'https://images.unsplash.com/photo-1464226184884-fa280b87c399?w=400&q=80',
      accessLevel: 'public'
    },
    {
      id: 5,
      title: 'Arquivo de Doutoramento: Economia Colonial',
      description: 'Teses e pesquisas avançadas sobre o impacto económico do colonialismo.',
      type: 'Manuscritos',
      date: '2020',
      imageUrl: 'https://images.unsplash.com/photo-1457369804613-52c61a468e7d?w=400&q=80',
      accessLevel: 'restricted'
    },
    {
      id: 6,
      title: 'Estatísticas de Exportação 1960-1975',
      description: 'Dados detalhados sobre exportações de café, diamantes e petróleo.',
      type: 'Revistas Estatísticas',
      date: '1976',
      imageUrl: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400&q=80',
      accessLevel: 'public'
    }
  ];

  constructor(private router: Router) {}

  ngOnInit(): void {
    this.loadMoreDocuments();
    setTimeout(() => {
      this.setupInfiniteScroll();
    }, 500);
  }

  ngOnDestroy(): void {
    if (this.observer) {
      this.observer.disconnect();
    }
  }

  // ===== INFINITE SCROLL =====
  setupInfiniteScroll(): void {
    this.observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && this.hasMore) {
          this.loadMoreDocuments();
        }
      },
      { threshold: 0.1, rootMargin: '0px 0px 100px 0px' }
    );

    if (this.scrollAnchor) {
      this.observer?.observe(this.scrollAnchor.nativeElement);
    }
  }

  getFilteredDocuments(): Document[] {
    return this.allDocuments.filter(doc => {
      if (this.searchQuery && !doc.title.toLowerCase().includes(this.searchQuery.toLowerCase()) &&
          !doc.description.toLowerCase().includes(this.searchQuery.toLowerCase())) {
        return false;
      }
      if (this.selectedAccessCategory === 'public' && doc.accessLevel !== 'public') return false;
      if (this.selectedAccessCategory === 'jindungo' && doc.accessLevel !== 'jindungo') return false;
      if (this.selectedAccessCategory === 'restricted' && doc.accessLevel !== 'restricted') return false;
      if (this.selectedThemes.length > 0 && !this.selectedThemes.some(t => 
          doc.title.includes(t) || doc.description.includes(t))) {
        return false;
      }
      if (this.selectedFormats.length > 0 && !this.selectedFormats.includes(doc.type)) {
        return false;
      }
      return true;
    });
  }

  loadMoreDocuments(): void {
    if (!this.hasMore) return;

    const filtered = this.getFilteredDocuments();
    const start = this.currentPage * this.pageSize;
    const end = start + this.pageSize;
    const newDocs = filtered.slice(start, end);

    if (newDocs.length > 0) {
      this.displayedDocuments = [...this.displayedDocuments, ...newDocs];
      this.currentPage++;
      this.hasMore = end < filtered.length;
    } else {
      this.hasMore = false;
    }
  }

  resetAndReload(): void {
    this.displayedDocuments = [];
    this.currentPage = 0;
    this.hasMore = true;
    this.loadMoreDocuments();
  }

  // ===== FILTROS =====
  getAccessCategoryLabel(): string {
    const option = this.accessOptions.find(opt => opt.id === this.selectedAccessCategory);
    return option ? option.label : 'Todos os Documentos';
  }

  selectAccessCategory(category: AccessCategory): void {
    this.selectedAccessCategory = category;
    this.showAccessDropdown = false;
    this.resetAndReload();
  }

  toggleAccessDropdown(): void {
    this.showAccessDropdown = !this.showAccessDropdown;
  }

  getSelectedThemeLabel(): string {
    return this.selectedThemes.length > 0 ? this.selectedThemes[0] : 'Todos os Temas';
  }

  selectTheme(theme: Theme): void {
    if (this.selectedThemes.includes(theme)) {
      this.selectedThemes = [];
    } else {
      this.selectedThemes = [theme];
    }
    this.showThemeDropdown = false;
    this.resetAndReload();
  }

  toggleThemeDropdown(): void {
    this.showThemeDropdown = !this.showThemeDropdown;
  }

  isThemeSelected(theme: Theme): boolean {
    return this.selectedThemes.includes(theme);
  }

  getSelectedLevelLabel(): string {
    const level = this.levels.find(l => l.id === this.selectedLevel);
    return level ? level.label : 'Todos os Níveis';
  }

  selectLevel(level: Level): void {
    this.selectedLevel = this.selectedLevel === level ? null : level;
    this.showLevelDropdown = false;
    this.resetAndReload();
  }

  toggleLevelDropdown(): void {
    this.showLevelDropdown = !this.showLevelDropdown;
  }

  getSelectedFormatLabel(): string {
    return this.selectedFormats.length > 0 ? this.selectedFormats[0] : 'Todos os Formatos';
  }

  selectFormat(format: Format): void {
    if (this.selectedFormats.includes(format)) {
      this.selectedFormats = [];
    } else {
      this.selectedFormats = [format];
    }
    this.showFormatDropdown = false;
    this.resetAndReload();
  }

  toggleFormatDropdown(): void {
    this.showFormatDropdown = !this.showFormatDropdown;
  }

  isFormatSelected(format: Format): boolean {
    return this.selectedFormats.includes(format);
  }

  getAccessLabel(accessLevel: string): string {
    switch(accessLevel) {
      case 'jindungo': return 'Jindungo';
      case 'restricted': return 'Restrito';
      default: return 'Público';
    }
  }

  getAccessBadgeStyle(accessLevel: string): { bg: string; text: string } {
    switch(accessLevel) {
      case 'jindungo': return { bg: '#ffd6a5', text: '#4a2c00' };
      case 'restricted': return { bg: '#ffb3ba', text: '#5c0011' };
      default: return { bg: '#d1fae5', text: '#065f46' };
    }
  }

  clearFilters(): void {
    this.selectedThemes = [];
    this.selectedLevel = null;
    this.selectedFormats = [];
    this.selectedAccessCategory = 'all';
    this.searchQuery = '';
    this.resetAndReload();
  }

  navigateToDocument(docId: number): void {
    this.router.navigate(['/contents/view', docId]);
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