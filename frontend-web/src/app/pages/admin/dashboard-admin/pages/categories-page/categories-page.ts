import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface Category {
  id: number;
  name: string;
  description: string;
  type: 'public' | 'jindungo' | 'restricted';
  documents: number;
  topics: number;
  members: number;
  status: 'active' | 'inactive';
  color: string;
  icon?: string;
}

@Component({
  selector: 'app-categories-page',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './categories-page.html',
  styleUrls: ['./categories-page.css']
})
export class CategoriesPageComponent {
  searchQuery = '';
  filterType = 'todos';
  filterStatus = 'todos';
  
  // Modal control
  showCategoryModal = false;
  editingCategory: Category | null = null;
  
  // Form data for new/edit category
  categoryForm: Category = {
    id: 0,
    name: '',
    description: '',
    type: 'public',
    documents: 0,
    topics: 0,
    members: 0,
    status: 'active',
    color: '#acf0e0',
    icon: '📁'
  };

  categories: Category[] = [
    {
      id: 1,
      name: 'Análise de Políticas',
      description: 'Discussões sobre políticas económicas e fiscais angolanas.',
      type: 'public',
      documents: 234,
      topics: 89,
      members: 456,
      status: 'active',
      color: '#acf0e0',
      icon: '📊'
    },
    {
      id: 2,
      name: 'Jindungo',
      description: 'Conteúdos exclusivos e análises aprofundadas para membros premium.',
      type: 'jindungo',
      documents: 156,
      topics: 45,
      members: 234,
      status: 'active',
      color: '#ffd6a5',
      icon: '🔥'
    },
    {
      id: 3,
      name: 'Rotas Comerciais',
      description: 'História do comércio e redes económicas na África Austral.',
      type: 'public',
      documents: 189,
      topics: 67,
      members: 345,
      status: 'active',
      color: '#ffd6a5',
      icon: '🚢'
    },
    {
      id: 4,
      name: 'Investigação Avançada',
      description: 'Pesquisas de doutoramento e publicações científicas.',
      type: 'restricted',
      documents: 78,
      topics: 23,
      members: 89,
      status: 'active',
      color: '#ffb3ba',
      icon: '🔬'
    },
    {
      id: 5,
      name: 'História Fiscal',
      description: 'Sistemas fiscais coloniais e pós-coloniais.',
      type: 'public',
      documents: 201,
      topics: 54,
      members: 267,
      status: 'inactive',
      color: '#d4c5f9',
      icon: '📜'
    },
    {
      id: 6,
      name: 'Sistema Monetário',
      description: 'Evolução das moedas e políticas monetárias angolanas.',
      type: 'restricted',
      documents: 112,
      topics: 38,
      members: 156,
      status: 'active',
      color: '#ffb3ba',
      icon: '💰'
    }
  ];

  // Opções de cores para o select
  colorOptions = [
    { value: '#acf0e0', name: 'Verde água' },
    { value: '#ffd6a5', name: 'Laranja claro' },
    { value: '#d4c5f9', name: 'Lavanda' },
    { value: '#ffb3ba', name: 'Rosa claro' },
    { value: '#bae1ff', name: 'Azul claro' },
    { value: '#c7ceea', name: 'Azul acinzentado' },
    { value: '#d1fae5', name: 'Verde menta' }
  ];

  // Opções de ícones
  iconOptions = [
    { value: '📊', name: 'Gráfico' },
    { value: '🔥', name: 'Fogo' },
    { value: '🚢', name: 'Navio' },
    { value: '🔬', name: 'Microscópio' },
    { value: '📜', name: 'Pergaminho' },
    { value: '💰', name: 'Moeda' },
    { value: '📚', name: 'Livros' },
    { value: '🏛️', name: 'Prédio' },
    { value: '🌍', name: 'Mundo' },
    { value: '📈', name: 'Gráfico crescente' }
  ];

  get filteredCategories(): Category[] {
    return this.categories.filter(cat => {
      const matchSearch = this.searchQuery === '' ||
        cat.name.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
        cat.description.toLowerCase().includes(this.searchQuery.toLowerCase());
      const matchType = this.filterType === 'todos' || cat.type === this.filterType;
      const matchStatus = this.filterStatus === 'todos' || cat.status === this.filterStatus;
      return matchSearch && matchType && matchStatus;
    });
  }

  getTypeLabel(type: string): string {
    const types: Record<string, string> = {
      public: 'Público',
      jindungo: 'Jindungo',
      restricted: 'Restrito'
    };
    return types[type] || type;
  }

  getTypeBadgeClass(type: string): string {
    const classes: Record<string, string> = {
      public: 'type-public',
      jindungo: 'type-jindungo',
      restricted: 'type-restricted'
    };
    return classes[type] || '';
  }

  getStatusLabel(status: string): string {
    return status === 'active' ? 'Ativo' : 'Inativo';
  }

  getStatusBadgeClass(status: string): string {
    return status === 'active' ? 'status-active' : 'status-inactive';
  }

  getStats() {
    return {
      total: this.categories.length,
      active: this.categories.filter(c => c.status === 'active').length,
      public: this.categories.filter(c => c.type === 'public').length,
      restricted: this.categories.filter(c => c.type !== 'public').length
    };
  }

  // Open modal to add new category
  openAddCategoryModal(): void {
    this.editingCategory = null;
    this.categoryForm = {
      id: 0,
      name: '',
      description: '',
      type: 'public',
      documents: 0,
      topics: 0,
      members: 0,
      status: 'active',
      color: '#acf0e0',
      icon: '📁'
    };
    this.showCategoryModal = true;
  }

  // Open modal to edit category
  openEditCategoryModal(category: Category): void {
    this.editingCategory = { ...category };
    this.categoryForm = { ...category };
    this.showCategoryModal = true;
  }

  // Close modal
  closeCategoryModal(): void {
    this.showCategoryModal = false;
    this.editingCategory = null;
  }

  // Save category (create or update)
  saveCategory(): void {
    if (!this.categoryForm.name.trim()) {
      alert('Por favor, insira o nome da categoria');
      return;
    }
    
    if (!this.categoryForm.description.trim()) {
      alert('Por favor, insira a descrição da categoria');
      return;
    }
    
    if (this.editingCategory) {
      // Update existing category
      const index = this.categories.findIndex(c => c.id === this.editingCategory!.id);
      if (index !== -1) {
        this.categories[index] = { ...this.categoryForm, id: this.editingCategory.id };
      }
    } else {
      // Create new category
      const newId = Math.max(...this.categories.map(c => c.id), 0) + 1;
      this.categoryForm.id = newId;
      this.categories.push({ ...this.categoryForm });
    }
    
    this.closeCategoryModal();
  }

  // Delete category
  deleteCategory(id: number): void {
    if (confirm('Tem certeza que deseja eliminar esta categoria? Esta ação irá remover todos os conteúdos associados.')) {
      this.categories = this.categories.filter(c => c.id !== id);
    }
  }

  // Toggle category status (active/inactive)
  toggleCategoryStatus(id: number): void {
    const category = this.categories.find(c => c.id === id);
    if (category) {
      category.status = category.status === 'active' ? 'inactive' : 'active';
    }
  }

  // Get type icon
  getTypeIcon(type: string): string {
    const icons: Record<string, string> = {
      public: '🌐',
      jindungo: '🔥',
      restricted: '🔒'
    };
    return icons[type] || '📁';
  }
}