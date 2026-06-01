import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { HeaderComponent } from '../../../../components/header/header';
import { FooterComponent } from '../../../../components/footer/footer';

interface Category {
  id: string;
  name: string;
  description: string;
  color: { bg: string; text: string };
}

@Component({
  selector: 'app-create-topic',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, HeaderComponent, FooterComponent],
  templateUrl: './create-topic.html',
  styleUrls: ['./create-topic.css']
})
export class CreateTopicComponent {
  title = '';
  selectedCategory = '';
  content = '';
  showPreview = false;
  errors: { title?: string; category?: string; content?: string } = {};

  categories: Category[] = [
    {
      id: 'policy-analysis',
      name: 'Análise de Políticas',
      description: 'Discussões sobre políticas económicas e fiscais',
      color: { bg: '#acf0e0', text: '#003a32' },
    },
    {
      id: 'trade-routes',
      name: 'Rotas Comerciais',
      description: 'História e impacto das rotas comerciais',
      color: { bg: '#ffd6a5', text: '#4a2c00' },
    },
    {
      id: 'fiscal-history',
      name: 'História Fiscal',
      description: 'Evolução dos sistemas fiscais angolanos',
      color: { bg: '#d4c5f9', text: '#2d1b69' },
    },
    {
      id: 'monetary-system',
      name: 'Sistema Monetário',
      description: 'Desenvolvimento e reformas monetárias',
      color: { bg: '#ffb3ba', text: '#5c0011' },
    },
    {
      id: 'banking',
      name: 'Sistema Bancário',
      description: 'Instituições bancárias e regulação',
      color: { bg: '#bae1ff', text: '#003a5d' },
    },
    {
      id: 'sources',
      name: 'Fontes e Arquivos',
      description: 'Partilha de fontes primárias e documentação',
      color: { bg: '#c7ceea', text: '#1e2952' },
    },
  ];

  constructor(private router: Router) {}

  get selectedCategoryData(): Category | undefined {
    return this.categories.find(cat => cat.id === this.selectedCategory);
  }

  validate(): boolean {
    const newErrors: { title?: string; category?: string; content?: string } = {};

    if (!this.title.trim()) {
      newErrors.title = 'O título é obrigatório';
    } else if (this.title.length < 10) {
      newErrors.title = 'O título deve ter pelo menos 10 caracteres';
    } else if (this.title.length > 150) {
      newErrors.title = 'O título não pode exceder 150 caracteres';
    }

    if (!this.selectedCategory) {
      newErrors.category = 'Por favor, selecione uma categoria';
    }

    if (!this.content.trim()) {
      newErrors.content = 'O conteúdo é obrigatório';
    } else if (this.content.length < 50) {
      newErrors.content = 'O conteúdo deve ter pelo menos 50 caracteres para uma discussão significativa';
    }

    this.errors = newErrors;
    return Object.keys(newErrors).length === 0;
  }

  handleSubmit(event: Event): void {
    event.preventDefault();
    if (this.validate()) {
      console.log({
        title: this.title,
        category: this.selectedCategory,
        content: this.content,
      });
      this.router.navigate(['/forum/community/discussao']);
    }
  }

  handleSaveDraft(): void {
    if (this.title.trim() || this.content.trim()) {
      console.log('Rascunho salvo:', { title: this.title, category: this.selectedCategory, content: this.content });
      alert('Rascunho guardado com sucesso!');
    }
  }

  navigateTo(path: string): void {
    this.router.navigate([path]);
  }
}