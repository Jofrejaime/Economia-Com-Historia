import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface Discussion {
  id: number;
  title: string;
  author: string;
  category: string;
  replies: number;
  views: number;
  lastActivity: string;
  status: 'active' | 'locked' | 'archived';
  createdAt: string;
  content?: string;
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
    id: 0,
    title: '',
    author: '',
    category: 'Sistema Monetário',
    replies: 0,
    views: 0,
    lastActivity: new Date().toLocaleDateString('pt-PT', { day: '2-digit', month: 'short', year: 'numeric' }),
    status: 'active',
    createdAt: new Date().toLocaleDateString('pt-PT', { day: '2-digit', month: 'short', year: 'numeric' }),
    content: ''
  };
  
  // Categories for filter and form
  categoriesList = [
    'Sistema Monetário',
    'Economia Colonial',
    'Rotas Comerciais',
    'História Fiscal',
    'Política Económica',
    'Agricultura',
    'Infraestrutura',
    'Metodologia'
  ];

  discussions: Discussion[] = [
    {
      id: 1,
      title: 'Análise da Reforma Monetária de 1976',
      author: 'Dr. Manuel Costa',
      category: 'Sistema Monetário',
      replies: 24,
      views: 1245,
      lastActivity: 'Hoje',
      status: 'active',
      createdAt: '15 Mar 2024',
      content: 'Discussão sobre a transição do Escudo para o Kwanza...'
    },
    {
      id: 2,
      title: 'Impacto do Café na Economia Colonial',
      author: 'Dra. Ana Silva',
      category: 'Economia Colonial',
      replies: 18,
      views: 892,
      lastActivity: 'Ontem',
      status: 'active',
      createdAt: '10 Fev 2024',
      content: 'Análise do impacto do ciclo do café...'
    },
    {
      id: 3,
      title: 'Discussão sobre Fontes Primárias',
      author: 'Prof. Carlos Mendes',
      category: 'Metodologia',
      replies: 32,
      views: 2100,
      lastActivity: 'Há 2 dias',
      status: 'locked',
      createdAt: '05 Jan 2024',
      content: 'Metodologias para análise de fontes primárias...'
    },
    {
      id: 4,
      title: 'Rotas Comerciais do Século XIX',
      author: 'Maria João Santos',
      category: 'Rotas Comerciais',
      replies: 45,
      views: 3100,
      lastActivity: 'Há 3 dias',
      status: 'active',
      createdAt: '20 Dez 2023',
      content: 'Mapeamento das rotas comerciais...'
    }
  ];

  get filteredDiscussions(): Discussion[] {
    return this.discussions.filter(disc => {
      const matchSearch = this.searchQuery === '' ||
        disc.title.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
        disc.author.toLowerCase().includes(this.searchQuery.toLowerCase());
      const matchStatus = this.filterStatus === 'todos' || disc.status === this.filterStatus;
      const matchCategory = this.filterCategory === 'todos' || disc.category === this.filterCategory;
      return matchSearch && matchStatus && matchCategory;
    });
  }

  getStatusLabel(status: string): string {
    const labels: Record<string, string> = {
      active: 'Ativo',
      locked: 'Bloqueado',
      archived: 'Arquivado'
    };
    return labels[status] || status;
  }

  getStatusBadgeClass(status: string): string {
    const classes: Record<string, string> = {
      active: 'status-active',
      locked: 'status-locked',
      archived: 'status-archived'
    };
    return classes[status] || '';
  }

  getStats() {
    return {
      total: this.discussions.length,
      active: this.discussions.filter(d => d.status === 'active').length,
      totalReplies: this.discussions.reduce((sum, d) => sum + d.replies, 0),
      totalViews: this.discussions.reduce((sum, d) => sum + d.views, 0)
    };
  }

  getCategories(): string[] {
    return [...new Set(this.discussions.map(d => d.category))];
  }

  // Open modal to add new discussion
  openAddDiscussionModal(): void {
    this.editingDiscussion = null;
    this.discussionForm = {
      id: 0,
      title: '',
      author: '',
      category: 'Sistema Monetário',
      replies: 0,
      views: 0,
      lastActivity: new Date().toLocaleDateString('pt-PT', { day: '2-digit', month: 'short', year: 'numeric' }),
      status: 'active',
      createdAt: new Date().toLocaleDateString('pt-PT', { day: '2-digit', month: 'short', year: 'numeric' }),
      content: ''
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
    
    if (!this.discussionForm.author.trim()) {
      alert('Por favor, insira o nome do autor');
      return;
    }
    
    if (this.editingDiscussion) {
      // Update existing discussion
      const index = this.discussions.findIndex(d => d.id === this.editingDiscussion!.id);
      if (index !== -1) {
        this.discussions[index] = { ...this.discussionForm, id: this.editingDiscussion.id };
      }
    } else {
      // Create new discussion
      const newId = Math.max(...this.discussions.map(d => d.id), 0) + 1;
      this.discussionForm.id = newId;
      this.discussions.push({ ...this.discussionForm });
    }
    
    this.closeDiscussionModal();
  }

  // Delete discussion
  deleteDiscussion(id: number): void {
    if (confirm('Tem certeza que deseja eliminar esta discussão? Esta ação não pode ser desfeita.')) {
      this.discussions = this.discussions.filter(d => d.id !== id);
    }
  }

  // Lock/unlock discussion
  toggleLockDiscussion(id: number): void {
    const discussion = this.discussions.find(d => d.id === id);
    if (discussion) {
      discussion.status = discussion.status === 'locked' ? 'active' : 'locked';
    }
  }

  // Archive discussion
  archiveDiscussion(id: number): void {
    const discussion = this.discussions.find(d => d.id === id);
    if (discussion && discussion.status !== 'archived') {
      discussion.status = 'archived';
    }
  }

  // Restore discussion from archive
  restoreDiscussion(id: number): void {
    const discussion = this.discussions.find(d => d.id === id);
    if (discussion && discussion.status === 'archived') {
      discussion.status = 'active';
    }
  }

  // Increment views
  incrementViews(id: number): void {
    const discussion = this.discussions.find(d => d.id === id);
    if (discussion) {
      discussion.views++;
    }
  }
}