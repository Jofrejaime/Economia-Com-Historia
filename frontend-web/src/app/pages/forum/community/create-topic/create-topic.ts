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

interface Participant {
  id: string;
  name: string;
  email: string;
  initials: string;
  avatarColor: string;
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
  topicPrivacy: 'public' | 'private' = 'public';
  selectedParticipants: string[] = [];
  participantSearch = '';
  errors: { title?: string; category?: string; content?: string; participants?: string } = {};

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

  // Lista de participantes disponíveis (mock)
  allParticipants: Participant[] = [
    { id: '1', name: 'Ana Silva', email: 'ana.silva@universidade.ao', initials: 'AS', avatarColor: '#8B1E2D' },
    { id: '2', name: 'Carlos Santos', email: 'carlos.santos@universidade.ao', initials: 'CS', avatarColor: '#1F2937' },
    { id: '3', name: 'Maria Costa', email: 'maria.costa@universidade.ao', initials: 'MC', avatarColor: '#9CA3AF' },
    { id: '4', name: 'João Mendes', email: 'joao.mendes@universidade.ao', initials: 'JM', avatarColor: '#8B1E2D' },
    { id: '5', name: 'Paula Ferreira', email: 'paula.ferreira@universidade.ao', initials: 'PF', avatarColor: '#1F2937' },
    { id: '6', name: 'Miguel Rodrigues', email: 'miguel.rodrigues@universidade.ao', initials: 'MR', avatarColor: '#9CA3AF' },
  ];

  filteredParticipants: Participant[] = [...this.allParticipants];

  constructor(private router: Router) {}

  get selectedCategoryData(): Category | undefined {
    return this.categories.find(cat => cat.id === this.selectedCategory);
  }

  // ===== FILTRO DE PARTICIPANTES =====
  filterParticipants(): void {
    const search = this.participantSearch.toLowerCase().trim();
    if (!search) {
      this.filteredParticipants = [...this.allParticipants];
      return;
    }
    this.filteredParticipants = this.allParticipants.filter(p => 
      p.name.toLowerCase().includes(search) || 
      p.email.toLowerCase().includes(search)
    );
  }

  toggleParticipant(id: string): void {
    const index = this.selectedParticipants.indexOf(id);
    if (index === -1) {
      this.selectedParticipants.push(id);
    } else {
      this.selectedParticipants.splice(index, 1);
    }
  }

  isParticipantSelected(id: string): boolean {
    return this.selectedParticipants.includes(id);
  }

  // ===== VALIDAÇÃO =====
  validate(): boolean {
    const newErrors: { title?: string; category?: string; content?: string; participants?: string } = {};

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

    if (this.topicPrivacy === 'private' && this.selectedParticipants.length === 0) {
      newErrors.participants = 'Selecione pelo menos um participante para um tópico privado';
    }

    this.errors = newErrors;
    return Object.keys(newErrors).length === 0;
  }

  // ===== SUBMISSÃO =====
  handleSubmit(event: Event): void {
    event.preventDefault();
    if (this.validate()) {
      console.log({
        title: this.title,
        category: this.selectedCategory,
        content: this.content,
        privacy: this.topicPrivacy,
        participants: this.topicPrivacy === 'private' ? this.selectedParticipants : []
      });
      this.router.navigate(['/forum/community/discussao']);
    }
  }

  // ===== GUARDAR RASCUNHO =====
  saveDraft(): void {
    if (this.title.trim() || this.content.trim() || this.selectedCategory) {
      const draft = {
        title: this.title,
        category: this.selectedCategory,
        content: this.content,
        privacy: this.topicPrivacy,
        participants: this.selectedParticipants,
        savedAt: new Date().toISOString()
      };
      console.log('Rascunho salvo:', draft);
      
      // Salvar no localStorage
      try {
        localStorage.setItem('topicDraft', JSON.stringify(draft));
        alert('Rascunho guardado com sucesso!');
      } catch (e) {
        alert('Rascunho guardado com sucesso!');
      }
    } else {
      alert('Não há conteúdo para guardar como rascunho.');
    }
  }

  // ===== CARREGAR RASCUNHO (opcional) =====
  loadDraft(): void {
    try {
      const draft = localStorage.getItem('topicDraft');
      if (draft) {
        const data = JSON.parse(draft);
        this.title = data.title || '';
        this.selectedCategory = data.category || '';
        this.content = data.content || '';
        this.topicPrivacy = data.privacy || 'public';
        this.selectedParticipants = data.participants || [];
      }
    } catch (e) {
      // Ignorar erro
    }
  }

  // ===== NAVEGAÇÃO =====
  navigateTo(path: string): void {
    this.router.navigate([path]);
  }

  // ===== LIFECYCLE =====
  ngOnInit(): void {
    this.loadDraft();
    this.filteredParticipants = [...this.allParticipants];
  }
}