import { Component, ElementRef, HostListener, ViewChild } from '@angular/core';
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
export class ContentsComponent {
  @ViewChild('dropdownRef') dropdownRef!: ElementRef;

  searchQuery = '';
  selectedThemes: Theme[] = ['Café e Agricultura'];
  selectedLevel: Level = 'advanced';
  selectedFormats: Format[] = ['Revistas Estatísticas'];
  selectedAccessCategory: AccessCategory = 'all';
  showAccessDropdown = false;
  showFormatDropdown = false;  // ← Novo

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

  documents: Document[] = [
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

  navigateToDocument(docId: number): void {
    this.router.navigate(['/contents/view', docId]);
  }

  getAccessCategoryLabel(): string {
    const option = this.accessOptions.find(opt => opt.id === this.selectedAccessCategory);
    return option ? option.label : 'Todos os Documentos';
  }

  selectAccessCategory(category: AccessCategory): void {
    this.selectedAccessCategory = category;
    this.showAccessDropdown = false;
  }

  toggleAccessDropdown(): void {
    this.showAccessDropdown = !this.showAccessDropdown;
  }

  isThemeSelected(theme: Theme): boolean {
    return this.selectedThemes.includes(theme);
  }

  toggleTheme(theme: Theme): void {
    if (this.selectedThemes.includes(theme)) {
      this.selectedThemes = this.selectedThemes.filter(t => t !== theme);
    } else {
      this.selectedThemes = [...this.selectedThemes, theme];
    }
  }

  setSelectedLevel(level: Level): void {
    this.selectedLevel = level;
  }

  isFormatSelected(format: Format): boolean {
    return this.selectedFormats.includes(format);
  }

  toggleFormat(format: Format): void {
    if (this.selectedFormats.includes(format)) {
      this.selectedFormats = this.selectedFormats.filter(f => f !== format);
    } else {
      this.selectedFormats = [format];
    }
  }

  getAccessLabel(accessLevel: string): string {
    switch(accessLevel) {
      case 'jindungo': return 'Jindungo';
      case 'restricted': return 'Restrito';
      default: return 'Público';
    }
  }

// Novo método para limpar filtros
  clearFilters(): void {
    this.selectedThemes = [];
    this.selectedLevel = 'advanced';
    this.selectedFormats = [];
    this.selectedAccessCategory = 'all';
    this.searchQuery = '';
  }

  // Novo método para toggle do formato
  toggleFormatDropdown(): void {
    this.showFormatDropdown = !this.showFormatDropdown;
  }

  // Novo método para selecionar formato
  selectFormat(format: Format): void {
    this.selectedFormats = [format];
    this.showFormatDropdown = false;
  }

  // Novo método para obter label do formato selecionado
  getSelectedFormatLabel(): string {
    return this.selectedFormats.length > 0 ? this.selectedFormats[0] : 'Selecionar formato';
  }

  getAccessBadgeStyle(accessLevel: string): { bg: string; text: string } {
    switch(accessLevel) {
      case 'jindungo': return { bg: '#ffd6a5', text: '#4a2c00' };
      case 'restricted': return { bg: '#ffb3ba', text: '#5c0011' };
      default: return { bg: '#d1fae5', text: '#065f46' };
    }
  }

  filterDocuments(): Document[] {
    return this.documents.filter(doc => {
      if (this.searchQuery && !doc.title.toLowerCase().includes(this.searchQuery.toLowerCase()) &&
          !doc.description.toLowerCase().includes(this.searchQuery.toLowerCase())) {
        return false;
      }
      if (this.selectedAccessCategory === 'public' && doc.accessLevel !== 'public') return false;
      if (this.selectedAccessCategory === 'jindungo' && doc.accessLevel !== 'jindungo') return false;
      if (this.selectedAccessCategory === 'restricted' && doc.accessLevel !== 'restricted') return false;
      return true;
    });
  }

  @HostListener('document:click', ['$event'])
  handleClickOutside(event: Event): void {
    if (this.dropdownRef && !this.dropdownRef.nativeElement.contains(event.target)) {
      this.showAccessDropdown = false;
    }
  }
}