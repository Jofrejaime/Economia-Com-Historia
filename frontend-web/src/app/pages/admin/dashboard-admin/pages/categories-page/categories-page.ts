import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

// Interface alinhada com a tabela 'document_categories' da migration
interface Category {
  id: string;                                    // UUID
  name: string;                                  // Nome da categoria
  slug: string;                                  // Slug único
  description: string;                           // Descrição
  access_level_id: 'public' | 'jindungo' | 'restricted'; // Nível de acesso
  color_bg: string | null;                       // Cor de fundo
  color_text: string | null;                     // Cor do texto
  icon: string | null;                           // Ícone (emoji)
  parent_id: string | null;                      // Categoria parente
  sort_order: number;                            // Ordem de exibição
  is_active: boolean;                            // Status (ativo/inativo)
  // Campos calculados (não estão na tabela, mas são úteis para exibição)
  documents_count?: number;
  topics_count?: number;
  members_count?: number;
  created_at?: string;
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
    id: '',
    name: '',
    slug: '',
    description: '',
    access_level_id: 'public',
    color_bg: '#acf0e0',
    color_text: '#000000',
    icon: '📁',
    parent_id: null,
    sort_order: 0,
    is_active: true
  };

  categories: Category[] = [
    {
      id: '1',
      name: 'Análise de Políticas',
      slug: 'analise-de-politicas',
      description: 'Discussões sobre políticas económicas e fiscais angolanas.',
      access_level_id: 'public',
      color_bg: '#acf0e0',
      color_text: '#000000',
      icon: '📊',
      parent_id: null,
      sort_order: 0,
      is_active: true,
      documents_count: 234,
      topics_count: 89,
      members_count: 456
    },
    {
      id: '2',
      name: 'Jindungo',
      slug: 'jindungo',
      description: 'Conteúdos exclusivos e análises aprofundadas para membros premium.',
      access_level_id: 'jindungo',
      color_bg: '#ffd6a5',
      color_text: '#000000',
      icon: '🔥',
      parent_id: null,
      sort_order: 1,
      is_active: true,
      documents_count: 156,
      topics_count: 45,
      members_count: 234
    },
    {
      id: '3',
      name: 'Rotas Comerciais',
      slug: 'rotas-comerciais',
      description: 'História do comércio e redes económicas na África Austral.',
      access_level_id: 'public',
      color_bg: '#ffd6a5',
      color_text: '#000000',
      icon: '🚢',
      parent_id: null,
      sort_order: 2,
      is_active: true,
      documents_count: 189,
      topics_count: 67,
      members_count: 345
    },
    {
      id: '4',
      name: 'Investigação Avançada',
      slug: 'investigacao-avancada',
      description: 'Pesquisas de doutoramento e publicações científicas.',
      access_level_id: 'restricted',
      color_bg: '#ffb3ba',
      color_text: '#000000',
      icon: '🔬',
      parent_id: null,
      sort_order: 3,
      is_active: true,
      documents_count: 78,
      topics_count: 23,
      members_count: 89
    },
    {
      id: '5',
      name: 'História Fiscal',
      slug: 'historia-fiscal',
      description: 'Sistemas fiscais coloniais e pós-coloniais.',
      access_level_id: 'public',
      color_bg: '#d4c5f9',
      color_text: '#000000',
      icon: '📜',
      parent_id: null,
      sort_order: 4,
      is_active: false,
      documents_count: 201,
      topics_count: 54,
      members_count: 267
    },
    {
      id: '6',
      name: 'Sistema Monetário',
      slug: 'sistema-monetario',
      description: 'Evolução das moedas e políticas monetárias angolanas.',
      access_level_id: 'restricted',
      color_bg: '#ffb3ba',
      color_text: '#000000',
      icon: '💰',
      parent_id: null,
      sort_order: 5,
      is_active: true,
      documents_count: 112,
      topics_count: 38,
      members_count: 156
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
        (cat.description && cat.description.toLowerCase().includes(this.searchQuery.toLowerCase()));
      const matchType = this.filterType === 'todos' || cat.access_level_id === this.filterType;
      const matchStatus = this.filterStatus === 'todos' || 
        (this.filterStatus === 'active' ? cat.is_active === true : cat.is_active === false);
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

  getStatusLabel(isActive: boolean): string {
    return isActive ? 'Ativo' : 'Inativo';
  }

  getStats() {
    return {
      total: this.categories.length,
      active: this.categories.filter(c => c.is_active).length,
      public: this.categories.filter(c => c.access_level_id === 'public').length,
      restricted: this.categories.filter(c => c.access_level_id !== 'public').length
    };
  }

  // Open modal to add new category
  openAddCategoryModal(): void {
    this.editingCategory = null;
    this.categoryForm = {
      id: '',
      name: '',
      slug: '',
      description: '',
      access_level_id: 'public',
      color_bg: '#acf0e0',
      color_text: '#000000',
      icon: '📁',
      parent_id: null,
      sort_order: this.categories.length,
      is_active: true
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
    
    // Gerar slug se estiver vazio
    if (!this.categoryForm.slug) {
      this.categoryForm.slug = this.generateSlug(this.categoryForm.name);
    }
    
    if (this.editingCategory) {
      // Update existing category
      const index = this.categories.findIndex(c => c.id === this.editingCategory!.id);
      if (index !== -1) {
        this.categories[index] = { ...this.categoryForm, id: this.editingCategory.id };
      }
    } else {
      // Create new category (UUID seria gerado pelo backend)
      this.categoryForm.id = Date.now().toString();
      this.categories.push({ ...this.categoryForm });
    }
    
    this.closeCategoryModal();
  }

  // Delete category
  deleteCategory(id: string): void {
    if (confirm('Tem certeza que deseja eliminar esta categoria? Esta ação irá remover todos os conteúdos associados.')) {
      this.categories = this.categories.filter(c => c.id !== id);
    }
  }

  // Toggle category status (active/inactive)
  toggleCategoryStatus(id: string): void {
    const category = this.categories.find(c => c.id === id);
    if (category) {
      category.is_active = !category.is_active;
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

  // Generate slug from name
  private generateSlug(name: string): string {
    return name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }
}