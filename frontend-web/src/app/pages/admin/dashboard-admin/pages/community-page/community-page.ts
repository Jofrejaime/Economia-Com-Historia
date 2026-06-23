import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

// Interface alinhada com a tabela 'discussion_topics' da migration
interface Discussion {
  id: string;                                    // UUID
  title: string;                                 // Título
  content: string;                               // Conteúdo (longText)
  status: 'open' | 'locked' | 'archived';        // Status
  is_pinned: boolean;                            // Fixado no topo
  is_featured: boolean;                          // Destaque
  category_id: string | null;                    // FK para community_categories
  author_id: string;                             // FK para users
  replies_count: number;                         // Contagem de respostas
  views_count: number;                           // Contagem de visualizações
  likes_count: number;                           // Contagem de gostos
  followers_count: number;                       // Contagem de seguidores
  last_reply_at: string | null;                  // Última resposta
  created_at: string;                            // Data de criação
  updated_at: string;                            // Data de atualização
  // Campos calculados/relacionados
  author_name?: string;
  category_name?: string;
}

// Interface para categorias da comunidade (community_categories)
interface CommunityCategory {
  id: string;
  name: string;
  slug: string;
  description?: string;
  members_count?: number;
  topics_count?: number;
}

@Component({
  selector: 'app-community-page',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './community-page.html',
  styleUrls: ['./community-page.css']
})
export class CommunityPageComponent {
  searchQuery = '';
  filterStatus = 'todos';
  filterCategory = 'todos';
  
  // Modal control
  showDiscussionModal = false;
  editingDiscussion: Discussion | null = null;
  
  // Form data
  discussionForm: Discussion = {
    id: '',
    title: '',
    content: '',
    status: 'open',
    is_pinned: false,
    is_featured: false,
    category_id: null,
    author_id: '',
    replies_count: 0,
    views_count: 0,
    likes_count: 0,
    followers_count: 0,
    last_reply_at: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    author_name: '',
    category_name: ''
  };
  
  // Categories list (from community_categories)
  categoriesList: CommunityCategory[] = [
    { id: '1', name: 'Sistema Monetário', slug: 'sistema-monetario', topics_count: 12 },
    { id: '2', name: 'Economia Colonial', slug: 'economia-colonial', topics_count: 18 },
    { id: '3', name: 'Rotas Comerciais', slug: 'rotas-comerciais', topics_count: 8 },
    { id: '4', name: 'História Fiscal', slug: 'historia-fiscal', topics_count: 6 },
    { id: '5', name: 'Política Económica', slug: 'politica-economica', topics_count: 10 },
    { id: '6', name: 'Agricultura', slug: 'agricultura', topics_count: 5 },
    { id: '7', name: 'Infraestrutura', slug: 'infraestrutura', topics_count: 7 },
    { id: '8', name: 'Metodologia', slug: 'metodologia', topics_count: 4 }
  ];

  // Users (mock para autor)
  users = [
    { id: 'user-1', name: 'Dr. Manuel Costa' },
    { id: 'user-2', name: 'Dra. Ana Silva' },
    { id: 'user-3', name: 'Prof. Carlos Mendes' },
    { id: 'user-4', name: 'Maria João Santos' }
  ];

  discussions: Discussion[] = [
    {
      id: '1',
      title: 'Análise da Reforma Monetária de 1976',
      content: 'Discussão sobre a transição do Escudo para o Kwanza...',
      status: 'open',
      is_pinned: true,
      is_featured: false,
      category_id: '1',
      author_id: 'user-1',
      replies_count: 24,
      views_count: 1245,
      likes_count: 45,
      followers_count: 32,
      last_reply_at: new Date().toISOString(),
      created_at: '2024-03-15T10:00:00Z',
      updated_at: '2024-03-15T10:00:00Z',
      author_name: 'Dr. Manuel Costa',
      category_name: 'Sistema Monetário'
    },
    {
      id: '2',
      title: 'Impacto do Café na Economia Colonial',
      content: 'Análise do impacto do ciclo do café...',
      status: 'open',
      is_pinned: false,
      is_featured: true,
      category_id: '2',
      author_id: 'user-2',
      replies_count: 18,
      views_count: 892,
      likes_count: 32,
      followers_count: 21,
      last_reply_at: '2024-03-14T08:00:00Z',
      created_at: '2024-02-10T14:30:00Z',
      updated_at: '2024-03-14T08:00:00Z',
      author_name: 'Dra. Ana Silva',
      category_name: 'Economia Colonial'
    },
    {
      id: '3',
      title: 'Discussão sobre Fontes Primárias',
      content: 'Metodologias para análise de fontes primárias...',
      status: 'locked',
      is_pinned: false,
      is_featured: false,
      category_id: '8',
      author_id: 'user-3',
      replies_count: 32,
      views_count: 2100,
      likes_count: 56,
      followers_count: 43,
      last_reply_at: '2024-03-12T09:00:00Z',
      created_at: '2024-01-05T11:00:00Z',
      updated_at: '2024-03-12T09:00:00Z',
      author_name: 'Prof. Carlos Mendes',
      category_name: 'Metodologia'
    },
    {
      id: '4',
      title: 'Rotas Comerciais do Século XIX',
      content: 'Mapeamento das rotas comerciais...',
      status: 'open',
      is_pinned: false,
      is_featured: false,
      category_id: '3',
      author_id: 'user-4',
      replies_count: 45,
      views_count: 3100,
      likes_count: 78,
      followers_count: 56,
      last_reply_at: '2024-03-11T16:00:00Z',
      created_at: '2023-12-20T09:00:00Z',
      updated_at: '2024-03-11T16:00:00Z',
      author_name: 'Maria João Santos',
      category_name: 'Rotas Comerciais'
    }
  ];

  get filteredDiscussions(): Discussion[] {
    return this.discussions.filter(disc => {
      const matchSearch = this.searchQuery === '' ||
        disc.title.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
        (disc.author_name && disc.author_name.toLowerCase().includes(this.searchQuery.toLowerCase()));
      const matchStatus = this.filterStatus === 'todos' || disc.status === this.filterStatus;
      const matchCategory = this.filterCategory === 'todos' || disc.category_id === this.filterCategory;
      return matchSearch && matchStatus && matchCategory;
    });
  }

  getStatusLabel(status: string): string {
    const labels: Record<string, string> = {
      open: 'Aberto',
      locked: 'Bloqueado',
      archived: 'Arquivado'
    };
    return labels[status] || status;
  }

  getStats() {
    return {
      total: this.discussions.length,
      active: this.discussions.filter(d => d.status === 'open').length,
      totalReplies: this.discussions.reduce((sum, d) => sum + d.replies_count, 0),
      totalViews: this.discussions.reduce((sum, d) => sum + d.views_count, 0)
    };
  }

  getCategories(): string[] {
    return this.categoriesList.map(c => c.name);
  }

  // Get category name by ID
  getCategoryName(categoryId: string | null): string {
    if (!categoryId) return 'Sem categoria';
    const cat = this.categoriesList.find(c => c.id === categoryId);
    return cat ? cat.name : 'Sem categoria';
  }

  // Get author name by ID
  getAuthorName(authorId: string): string {
    const user = this.users.find(u => u.id === authorId);
    return user ? user.name : 'Utilizador desconhecido';
  }

  // Open modal to add new discussion
  openAddDiscussionModal(): void {
    this.editingDiscussion = null;
    this.discussionForm = {
      id: '',
      title: '',
      content: '',
      status: 'open',
      is_pinned: false,
      is_featured: false,
      category_id: null,
      author_id: '',
      replies_count: 0,
      views_count: 0,
      likes_count: 0,
      followers_count: 0,
      last_reply_at: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      author_name: '',
      category_name: ''
    };
    this.showDiscussionModal = true;
  }

  // Open modal to edit discussion
  openEditDiscussionModal(discussion: Discussion): void {
    this.editingDiscussion = { ...discussion };
    this.discussionForm = { ...discussion };
    this.showDiscussionModal = true;
  }

  // Close modal
  closeDiscussionModal(): void {
    this.showDiscussionModal = false;
    this.editingDiscussion = null;
  }

  // Save discussion (create or update)
  saveDiscussion(): void {
    if (!this.discussionForm.title.trim()) {
      alert('Por favor, insira o título da discussão');
      return;
    }
    
    if (!this.discussionForm.content.trim()) {
      alert('Por favor, insira o conteúdo da discussão');
      return;
    }
    
    // Definir author_id (mock)
    if (!this.discussionForm.author_id) {
      this.discussionForm.author_id = 'user-1';
      this.discussionForm.author_name = 'Dr. Manuel Costa';
    }
    
    // Definir category_name
    if (this.discussionForm.category_id) {
      const cat = this.categoriesList.find(c => c.id === this.discussionForm.category_id);
      this.discussionForm.category_name = cat ? cat.name : 'Sem categoria';
    }
    
    if (this.editingDiscussion) {
      const index = this.discussions.findIndex(d => d.id === this.editingDiscussion!.id);
      if (index !== -1) {
        this.discussions[index] = { ...this.discussionForm, id: this.editingDiscussion.id };
      }
    } else {
      this.discussionForm.id = Date.now().toString();
      this.discussions.push({ ...this.discussionForm });
    }
    
    this.closeDiscussionModal();
  }

  // Delete discussion
  deleteDiscussion(id: string): void {
    if (confirm('Tem certeza que deseja eliminar esta discussão? Esta ação não pode ser desfeita.')) {
      this.discussions = this.discussions.filter(d => d.id !== id);
    }
  }

  // Lock/unlock discussion
  toggleLockDiscussion(id: string): void {
    const discussion = this.discussions.find(d => d.id === id);
    if (discussion) {
      discussion.status = discussion.status === 'locked' ? 'open' : 'locked';
    }
  }

  // Archive discussion
  archiveDiscussion(id: string): void {
    const discussion = this.discussions.find(d => d.id === id);
    if (discussion && discussion.status !== 'archived') {
      discussion.status = 'archived';
    }
  }

  // Restore discussion from archive
  restoreDiscussion(id: string): void {
    const discussion = this.discussions.find(d => d.id === id);
    if (discussion && discussion.status === 'archived') {
      discussion.status = 'open';
    }
  }
}