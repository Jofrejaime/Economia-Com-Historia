import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

// Interface alinhada com a tabela 'quiz_options' da migration
interface QuizOption {
  id: string;                                    // UUID
  option_key: string;                            // 'A', 'B', 'C', 'D'
  text: string;                                  // Texto da opção
  is_correct: boolean;                           // É correta?
  explanation?: string;                          // Explicação
}

// Interface alinhada com a tabela 'quiz_questions' da migration
interface QuizQuestion {
  id: string;                                    // UUID
  quiz_id?: string;                              // FK para quizzes
  question_order: number;                        // Ordem da pergunta
  title: string;                                 // Enunciado
  subtitle?: string;                             // Subtítulo
  module_label?: string;                         // Rótulo do módulo
  question_type: 'multiple_choice' | 'true_false'; // Tipo
  points: number;                                // Pontuação
  hint_title?: string;                           // Título da dica
  hint_quote?: string;                           // Citação da dica
  expert_name?: string;                          // Nome do especialista
  expert_role?: string;                          // Função do especialista
  reading_title?: string;                        // Título da leitura
  reading_text?: string;                         // Texto da leitura
  options: QuizOption[];                         // Opções de resposta
  explanation?: string;                          // Explicação (campo extra)
  created_at?: string;
}

// Interface alinhada com a tabela 'quizzes' da migration
interface Quiz {
  id: string;                                    // UUID
  title: string;                                 // Título
  module: string;                                // Módulo
  description: string;                           // Descrição
  cover_image_url: string | null;                // URL da imagem de capa
  difficulty: 'Básico' | 'Intermédio' | 'Avançado'; // Dificuldade
  base_points: number;                           // Pontos base
  time_limit_secs: number | null;                // Limite de tempo (segundos)
  access_level_id: 'public' | 'jindungo' | 'restricted'; // Nível de acesso
  is_featured: boolean;                          // Destaque
  status: 'published' | 'draft' | 'archived';    // Status
  category_id: string | null;                    // FK para document_categories
  created_by: string;                            // FK para users
  published_at: string | null;                   // Data de publicação
  completions_count: number;                     // Conclusões
  attempts_count: number;                        // Tentativas
  avg_score: number;                             // Média de pontuação
  created_at: string;                            // Data de criação
  updated_at: string;                            // Data de atualização
  questions: QuizQuestion[];                     // Perguntas (não está na tabela, é relacional)
}

// Interface para categorias
interface DocumentCategory {
  id: string;
  name: string;
  slug: string;
}

@Component({
  selector: 'app-quizzes-manager-page',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './quizzes-manager-page.html',
  styleUrls: ['./quizzes-manager-page.css']
})
export class QuizzesManagerPageComponent {
  searchQuery = '';
  filterDifficulty = 'todos';
  filterStatus = 'todos';
  showModal = false;
  editingQuiz: Quiz | null = null;
  activeTab: 'details' | 'questions' = 'details';
  
  // Número de perguntas selecionado
  selectedQuestionCount = 3;
  questionCountOptions = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
  
  // Array de perguntas para preenchimento em lote
  batchQuestions: QuizQuestion[] = [];
  
  // Lista de categorias
  categoriesList: DocumentCategory[] = [
    { id: '1', name: 'Economia Colonial', slug: 'economia-colonial' },
    { id: '2', name: 'Sistema Monetário', slug: 'sistema-monetario' },
    { id: '3', name: 'Rotas Comerciais', slug: 'rotas-comerciais' },
    { id: '4', name: 'História Fiscal', slug: 'historia-fiscal' }
  ];
  
  newQuiz: Quiz = {
    id: '',
    title: '',
    module: '',
    description: '',
    cover_image_url: null,
    difficulty: 'Básico',
    base_points: 100,
    time_limit_secs: null,
    access_level_id: 'public',
    is_featured: false,
    status: 'draft',
    category_id: null,
    created_by: '',
    published_at: null,
    completions_count: 0,
    attempts_count: 0,
    avg_score: 0,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    questions: []
  };

  quizzes: Quiz[] = [
    {
      id: '1',
      title: 'O Ciclo do Café em Angola',
      module: 'MÓDULO IV: ANGOLA COLONIAL',
      description: 'Análise do impacto económico e social do café entre 1950-1970',
      cover_image_url: null,
      difficulty: 'Avançado',
      base_points: 100,
      time_limit_secs: 1800,
      access_level_id: 'public',
      is_featured: true,
      status: 'published',
      category_id: '1',
      created_by: 'user-1',
      published_at: '2024-01-15T10:00:00Z',
      completions_count: 234,
      attempts_count: 567,
      avg_score: 78.5,
      created_at: '2024-01-10T08:00:00Z',
      updated_at: '2024-01-15T10:00:00Z',
      questions: [
        {
          id: 'q1',
          question_order: 1,
          title: 'Qual foi o principal impacto do ciclo do café na estrutura social angolana?',
          question_type: 'multiple_choice',
          points: 10,
          options: [
            { id: 'o1', option_key: 'A', text: 'Declínio imediato das infraestruturas ferroviárias', is_correct: false },
            { id: 'o2', option_key: 'B', text: 'Aceleração do processo de urbanização e consolidação de uma nova burguesia', is_correct: true },
            { id: 'o3', option_key: 'C', text: 'Abolição total do trabalho forçado', is_correct: false },
            { id: 'o4', option_key: 'D', text: 'Dependência exclusiva da extração diamantífera', is_correct: false }
          ],
          explanation: 'O café transformou Angola no quarto maior produtor mundial nos anos 60.',
          created_at: '2024-01-10T08:00:00Z'
        }
      ]
    }
  ];

  // Inicializar o batch de perguntas quando o número muda
  initBatchQuestions(): void {
    this.batchQuestions = [];
    const optionKeys = ['A', 'B', 'C', 'D'];
    for (let i = 0; i < this.selectedQuestionCount; i++) {
      const options: QuizOption[] = optionKeys.map(key => ({
        id: '',
        option_key: key,
        text: '',
        is_correct: false
      }));
      
      this.batchQuestions.push({
        id: '',
        question_order: i + 1,
        title: '',
        question_type: 'multiple_choice',
        points: 10,
        options: options,
        explanation: ''
      });
    }
  }

  // Adicionar todas as perguntas do batch
  addBatchQuestions(): void {
    for (const question of this.batchQuestions) {
      if (!question.title.trim()) {
        alert('Por favor, preencha todas as perguntas');
        return;
      }
      
      const hasCorrectOption = question.options.some(opt => opt.is_correct && opt.text.trim());
      if (!hasCorrectOption) {
        alert(`A pergunta "${question.title || (this.batchQuestions.indexOf(question) + 1)}" não tem uma opção correta selecionada`);
        return;
      }
      
      const newQuestion: QuizQuestion = {
        id: 'q_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4),
        question_order: this.newQuiz.questions.length + 1,
        title: question.title,
        question_type: question.question_type,
        points: question.points || 10,
        options: question.options.map(opt => ({
          id: 'o_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4),
          option_key: opt.option_key,
          text: opt.text,
          is_correct: opt.is_correct
        })),
        explanation: question.explanation
      };
      this.newQuiz.questions.push(newQuestion);
    }
    
    this.batchQuestions = [];
    this.selectedQuestionCount = 3;
  }

  get filteredQuizzes(): Quiz[] {
    return this.quizzes.filter(quiz => {
      const matchSearch = this.searchQuery === '' ||
        quiz.title.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
        (quiz.module && quiz.module.toLowerCase().includes(this.searchQuery.toLowerCase()));
      const matchDifficulty = this.filterDifficulty === 'todos' || quiz.difficulty === this.filterDifficulty;
      const matchStatus = this.filterStatus === 'todos' || quiz.status === this.filterStatus;
      return matchSearch && matchDifficulty && matchStatus;
    });
  }

  getStatusLabel(status: string): string {
    const labels: Record<string, string> = {
      published: 'Publicado',
      draft: 'Rascunho',
      archived: 'Arquivado'
    };
    return labels[status] || status;
  }

  getDifficultyBadgeClass(difficulty: string): string {
    const classes: Record<string, string> = {
      'Básico': 'difficulty-basic',
      'Intermédio': 'difficulty-intermediate',
      'Avançado': 'difficulty-advanced'
    };
    return classes[difficulty] || '';
  }

  getOptionLetter(optionKey: string): string {
    return optionKey || '?';
  }

  getStats() {
    return {
      total: this.quizzes.length,
      published: this.quizzes.filter(q => q.status === 'published').length,
      draft: this.quizzes.filter(q => q.status === 'draft').length,
      avgCompletions: this.quizzes.length > 0 
        ? Math.round(this.quizzes.reduce((sum, q) => sum + q.completions_count, 0) / this.quizzes.length)
        : 0
    };
  }

  openCreateModal(): void {
    this.editingQuiz = null;
    this.activeTab = 'details';
    this.newQuiz = {
      id: '',
      title: '',
      module: '',
      description: '',
      cover_image_url: null,
      difficulty: 'Básico',
      base_points: 100,
      time_limit_secs: null,
      access_level_id: 'public',
      is_featured: false,
      status: 'draft',
      category_id: null,
      created_by: '',
      published_at: null,
      completions_count: 0,
      attempts_count: 0,
      avg_score: 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      questions: []
    };
    this.initBatchQuestions();
    this.showModal = true;
  }

  openEditModal(quiz: Quiz): void {
    this.editingQuiz = { ...quiz };
    this.newQuiz = { ...quiz, questions: quiz.questions ? [...quiz.questions] : [] };
    this.activeTab = 'details';
    this.showModal = true;
  }

  closeModal(): void {
    this.showModal = false;
    this.editingQuiz = null;
    this.batchQuestions = [];
  }

  removeQuestion(index: number): void {
    if (confirm('Tem certeza que deseja remover esta pergunta?')) {
      this.newQuiz.questions.splice(index, 1);
      // Reordenar as perguntas
      this.newQuiz.questions.forEach((q, i) => q.question_order = i + 1);
    }
  }

  saveQuiz(): void {
    if (!this.newQuiz.title.trim()) {
      alert('Por favor, insira o título do questionário');
      return;
    }
    
    if (this.newQuiz.questions.length === 0) {
      alert('Por favor, adicione pelo menos uma pergunta');
      return;
    }
    
    if (this.editingQuiz) {
      const index = this.quizzes.findIndex(q => q.id === this.editingQuiz!.id);
      if (index !== -1) {
        this.quizzes[index] = { ...this.newQuiz, id: this.editingQuiz.id };
      }
    } else {
      this.newQuiz.id = 'q_' + Date.now() + '_' + Math.random().toString(36).substr(2, 6);
      this.quizzes.push({ ...this.newQuiz });
    }
    this.closeModal();
  }

  deleteQuiz(id: string): void {
    if (confirm('Tem certeza que deseja eliminar este questionário?')) {
      this.quizzes = this.quizzes.filter(q => q.id !== id);
    }
  }

  toggleStatus(quiz: Quiz): void {
    quiz.status = quiz.status === 'published' ? 'draft' : 'published';
    if (quiz.status === 'published') {
      quiz.published_at = new Date().toISOString();
    } else {
      quiz.published_at = null;
    }
  }

  updateOptionCorrect(questionIndex: number, optionKey: string, isChecked: boolean): void {
    if (isChecked) {
      this.batchQuestions[questionIndex].options.forEach(opt => {
        opt.is_correct = opt.option_key === optionKey;
      });
    } else {
      const option = this.batchQuestions[questionIndex].options.find(opt => opt.option_key === optionKey);
      if (option) option.is_correct = false;
    }
  }
}