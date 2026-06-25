import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { HeaderComponent } from '../../../components/header/header';
import { FooterComponent } from '../../../components/footer/footer';

type TabType = 'recent' | 'popular' | 'pinned';

interface Discussion {
  id: number;
  author: string;
  authorInitials: string;
  avatar: string;
  category: string;
  categoryColor: { bg: string; text: string };
  timeAgo: string;
  title: string;
  excerpt: string;
  replies: number;
  views: number;
  likes: number;
  isPinned: boolean;
  isPrivate: boolean;
}

interface Category {
  id: number;
  name: string;
  description: string;
  accessType: 'public' | 'jindungo' | 'restricted';
  members: number;
  topics: number;
  color: { bg: string; text: string };
  backgroundImage: string;
}

@Component({
  selector: 'app-community',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    HeaderComponent,
    FooterComponent
  ],
  templateUrl: './community.html',
  styleUrls: ['./community.css']
})
export class CommunityComponent {
  activeTab: TabType = 'recent';

  discussions: Discussion[] = [
    {
      id: 1,
      author: 'Jofre Jaime',
      authorInitials: 'JJ',
      avatar: '#8b1e2d',
      category: 'ANÁLISE DE POLÍTICAS',
      categoryColor: { bg: '#acf0e0', text: '#003a32' },
      timeAgo: 'há 2 horas',
      title: 'Análise da Reforma Monetária de 1976: A Transição do Kwanza',
      excerpt: 'Procuro fontes primárias sobre a logística da troca de moeda em 1976 nas províncias do leste. O arquivo contém contagens regionais específicas de Moxico?',
      replies: 12,
      views: 487,
      likes: 23,
      isPinned: false,
      isPrivate: false,
    },
    {
      id: 2,
      author: 'Ana Correia',
      authorInitials: 'AC',
      avatar: '#6b0119',
      category: 'ROTAS COMERCIAIS',
      categoryColor: { bg: '#ffd6a5', text: '#4a2c00' },
      timeAgo: 'há 5 horas',
      title: 'Impacto das Linhas de Crédito Garantidas por Petróleo (1990-2000)',
      excerpt: 'Estou a investigar como as linhas de crédito garantidas por petróleo moldaram a política económica durante a década de 90. Existem relatórios do BNA sobre este período?',
      replies: 8,
      views: 234,
      likes: 15,
      isPinned: true,
      isPrivate: true,
    },
    {
      id: 3,
      author: 'Manuel Santos',
      authorInitials: 'MS',
      avatar: '#8b1e2d',
      category: 'HISTÓRIA FISCAL',
      categoryColor: { bg: '#d4c5f9', text: '#2d1b69' },
      timeAgo: 'há 8 horas',
      title: 'Documentos Fundadores do BNA e Política Fiscal Inicial',
      excerpt: 'Procuro documentação sobre a criação do Banco Nacional de Angola em 1975. Alguém tem acesso aos decretos originais?',
      replies: 18,
      views: 612,
      likes: 34,
      isPinned: false,
      isPrivate: false,
    },
    {
      id: 4,
      author: 'Isabel Fernandes',
      authorInitials: 'IF',
      avatar: '#6b0119',
      category: 'SISTEMA MONETÁRIO',
      categoryColor: { bg: '#ffb3ba', text: '#5c0011' },
      timeAgo: 'há 1 dia',
      title: 'Mudanças Monetárias Durante o Período de Transição (1982-1985)',
      excerpt: 'Estudo sobre as mudanças no sistema monetário angolano durante a transição económica. Que documentos recomendam para este período?',
      replies: 24,
      views: 891,
      likes: 42,
      isPinned: false,
      isPrivate: true,
    },
  ];

  categories: Category[] = [
    {
      id: 1,
      name: 'Análise de Políticas',
      description: 'Discussões sobre políticas económicas e fiscais',
      accessType: 'public',
      members: 234,
      topics: 89,
      color: { bg: '#acf0e0', text: '#003a32' },
      backgroundImage: 'https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=400&q=80'
    },
    {
      id: 2,
      name: 'Jindungo',
      description: 'Conteúdos exclusivos e análises aprofundadas',
      accessType: 'jindungo',
      members: 156,
      topics: 45,
      color: { bg: '#ffd6a5', text: '#4a2c00' },
      backgroundImage: 'https://images.unsplash.com/photo-1505664194779-8beaceb93744?w=400&q=80'
    },
    {
      id: 3,
      name: 'Rotas Comerciais',
      description: 'História do comércio e redes económicas',
      accessType: 'public',
      members: 189,
      topics: 67,
      color: { bg: '#ffd6a5', text: '#4a2c00' },
      backgroundImage: 'https://images.unsplash.com/photo-1526726538690-5cbf956ae2fd?w=400&q=80'
    },
    {
      id: 4,
      name: 'Investigação Avançada',
      description: 'Pesquisas de doutoramento e publicações científicas',
      accessType: 'restricted',
      members: 78,
      topics: 23,
      color: { bg: '#ffb3ba', text: '#5c0011' },
      backgroundImage: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=400&q=80'
    },
  ];

  featuredResearches = [
    { date: '12 Mar 1975', title: 'Os documentos fundadores do BNA e a política fiscal inicial.' },
    { date: '08 Fev 1982', title: 'Mudanças monetárias durante o período de transição.' },
    { date: '22 Nov 1990', title: 'Linhas de crédito garantidas por petróleo: Uma análise histórica.' },
  ];

  constructor(private router: Router) {}

  get filteredDiscussions(): Discussion[] {
    if (this.activeTab === 'pinned') {
      return this.discussions.filter(d => d.isPinned);
    }
    if (this.activeTab === 'popular') {
      return this.discussions.filter(d => d.views > 500);
    }
    return this.discussions;
  }

  setActiveTab(tab: TabType): void {
    this.activeTab = tab;
  }

  getAccessBadge(accessType: string): { label: string; bg: string; text: string } {
    switch(accessType) {
      case 'jindungo': return { label: 'Jindungo', bg: '#ffd6a5', text: '#4a2c00' };
      case 'restricted': return { label: 'Restrito', bg: '#ffb3ba', text: '#5c0011' };
      default: return { label: 'Público', bg: '#d1fae5', text: '#065f46' };
    }
  }

  getTotalMembers(): number {
    return this.categories.reduce((total, cat) => total + cat.members, 0);
  }

  getTotalTopics(): number {
    return this.categories.reduce((total, cat) => total + cat.topics, 0);
  }

  requestAccess(discussionId: number): void {
    const discussion = this.discussions.find(d => d.id === discussionId);
    if (discussion) {
      alert(`Pedido de acesso enviado para a discussão: "${discussion.title}"\n\nO autor será notificado e poderá aprovar o seu pedido.`);
    }
  }

  navigateTo(path: string): void {
    this.router.navigate([path]);
  }
}