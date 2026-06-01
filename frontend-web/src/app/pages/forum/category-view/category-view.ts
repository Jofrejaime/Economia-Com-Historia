import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { HeaderComponent } from '../../../components/header/header';
import { FooterComponent } from '../../../components/footer/footer';

type AccessType = 'public' | 'jindungo' | 'restricted';
type RequestStatus = 'none' | 'pending' | 'approved';

interface Category {
  id: number;
  name: string;
  description: string;
  accessType: AccessType;
  members: number;
  topics: number;
  color: { bg: string; text: string };
  requestStatus: RequestStatus;
  backgroundImage: string;
}

@Component({
  selector: 'app-category-view',
  standalone: true,
  imports: [CommonModule, RouterModule, HeaderComponent, FooterComponent],
  templateUrl: './category-view.html',
  styleUrls: ['./category-view.css']
})
export class CategoryViewComponent {
  categories: Category[] = [
    {
      id: 1,
      name: 'Análise de Políticas',
      description: 'Discussões sobre políticas económicas e fiscais angolanas. Explore reformas monetárias, estratégias de desenvolvimento e impactos macroeconómicos.',
      accessType: 'public',
      members: 234,
      topics: 89,
      color: { bg: '#acf0e0', text: '#003a32' },
      requestStatus: 'none',
      backgroundImage: 'https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=400&q=80'
    },
    {
      id: 2,
      name: 'Jindungo',
      description: 'Conteúdos exclusivos e análises aprofundadas para membros premium. Acesso a pesquisas inéditas, dados históricos raros e discussões com especialistas renomados.',
      accessType: 'jindungo',
      members: 156,
      topics: 45,
      color: { bg: '#ffd6a5', text: '#4a2c00' },
      requestStatus: 'none',
      backgroundImage: 'https://images.unsplash.com/photo-1505664194779-8beaceb93744?w=400&q=80'
    },
    {
      id: 3,
      name: 'Rotas Comerciais',
      description: 'História do comércio e redes económicas na África Austral. Análise de fluxos comerciais históricos e impacto nas economias regionais.',
      accessType: 'public',
      members: 189,
      topics: 67,
      color: { bg: '#ffd6a5', text: '#4a2c00' },
      requestStatus: 'none',
      backgroundImage: 'https://images.unsplash.com/photo-1526726538690-5cbf956ae2fd?w=400&q=80'
    },
    {
      id: 4,
      name: 'Investigação Avançada',
      description: 'Pesquisas de doutoramento e publicações científicas. Ambiente dedicado para investigadores com projectos académicos em desenvolvimento.',
      accessType: 'restricted',
      members: 78,
      topics: 23,
      color: { bg: '#ffb3ba', text: '#5c0011' },
      requestStatus: 'none',
      backgroundImage: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=400&q=80'
    },
    {
      id: 5,
      name: 'História Fiscal',
      description: 'Sistemas fiscais coloniais e pós-coloniais. Documentação de políticas tributárias e evolução da administração fiscal em Angola.',
      accessType: 'public',
      members: 201,
      topics: 54,
      color: { bg: '#d4c5f9', text: '#2d1b69' },
      requestStatus: 'none',
      backgroundImage: 'https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=400&q=80'
    },
    {
      id: 6,
      name: 'Sistema Monetário',
      description: 'Evolução das moedas e políticas monetárias. Estudo das reformas cambiais e gestão de reservas ao longo da história económica angolana.',
      accessType: 'restricted',
      members: 112,
      topics: 38,
      color: { bg: '#ffb3ba', text: '#5c0011' },
      requestStatus: 'none',
      backgroundImage: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=400&q=80'
    },
  ];

  constructor(private router: Router) {}

  handleRequestAccess(categoryId: number, accessType: AccessType): void {
    this.categories = this.categories.map(cat =>
      cat.id === categoryId
        ? {
            ...cat,
            requestStatus: accessType === 'public' ? 'approved' : 'pending'
          }
        : cat
    );
  }

  navigateTo(path: string): void {
    this.router.navigate([path]);
  }

  getAccessBadge(accessType: AccessType): { label: string; bg: string; text: string } {
    switch(accessType) {
      case 'jindungo': return { label: 'Jindungo', bg: '#ffd6a5', text: '#4a2c00' };
      case 'restricted': return { label: 'Restrito', bg: '#ffb3ba', text: '#5c0011' };
      default: return { label: 'Público', bg: '#d1fae5', text: '#065f46' };
    }
  }

  getStatusIcon(status: RequestStatus): string {
    switch(status) {
      case 'pending': return '⏳';
      case 'approved': return '✓';
      default: return '';
    }
  }

  getStatusText(status: RequestStatus): string {
    switch(status) {
      case 'pending': return 'Aguardando Aprovação';
      case 'approved': return 'Acesso Concedido';
      default: return '';
    }
  }

  getStatusColor(status: RequestStatus): { bg: string; text: string; border: string } {
    switch(status) {
      case 'pending': return { bg: '#ffd6a5', text: '#4a2c00', border: '#ffd6a5' };
      case 'approved': return { bg: '#acf0e0', text: '#003a32', border: '#acf0e0' };
      default: return { bg: '', text: '', border: '' };
    }
  }

  canNavigate(category: Category): boolean {
    return category.requestStatus === 'approved';
  }
}