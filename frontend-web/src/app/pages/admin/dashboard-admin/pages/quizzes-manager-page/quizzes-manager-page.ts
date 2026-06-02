import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface Option {
  id: number;
  text: string;
  isCorrect: boolean;
}

interface Question {
  id: number;
  text: string;
  options: Option[];
  explanation?: string;
  points?: number;
}

interface Quiz {
  id: number;
  title: string;
  module: string;
  description: string;
  questions: Question[];
  difficulty: 'Básico' | 'Intermédio' | 'Avançado';
  totalPoints: number;
  status: 'published' | 'draft' | 'archived';
  completions: number;
  avgScore: number;
  createdAt: string;
  timeLimit?: number;
  passingScore?: number;
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
  batchQuestions: Question[] = [];
  
  newQuiz: Quiz = {
    id: 0,
    title: '',
    module: '',
    description: '',
    questions: [],
    difficulty: 'Básico',
    totalPoints: 0,
    status: 'draft',
    completions: 0,
    avgScore: 0,
    createdAt: new Date().toLocaleDateString('pt-PT', { day: '2-digit', month: 'short', year: 'numeric' }),
    timeLimit: 30,
    passingScore: 70
  };

  quizzes: Quiz[] = [
    {
      id: 1,
      title: 'O Ciclo do Café em Angola',
      module: 'MÓDULO IV: ANGOLA COLONIAL',
      description: 'Análise do impacto económico e social do café entre 1950-1970',
      questions: [
        {
          id: 1,
          text: 'Qual foi o principal impacto do ciclo do café na estrutura social angolana?',
          options: [
            { id: 1, text: 'Declínio imediato das infraestruturas ferroviárias', isCorrect: false },
            { id: 2, text: 'Aceleração do processo de urbanização e consolidação de uma nova burguesia', isCorrect: true },
            { id: 3, text: 'Abolição total do trabalho forçado', isCorrect: false },
            { id: 4, text: 'Dependência exclusiva da extração diamantífera', isCorrect: false }
          ],
          explanation: 'O café transformou Angola no quarto maior produtor mundial nos anos 60.',
          points: 10
        }
      ],
      difficulty: 'Avançado',
      totalPoints: 10,
      status: 'published',
      completions: 234,
      avgScore: 78,
      createdAt: '15 Jan 2024',
      timeLimit: 30,
      passingScore: 70
    }
  ];

  // Inicializar o batch de perguntas quando o número muda
  initBatchQuestions(): void {
    this.batchQuestions = [];
    for (let i = 0; i < this.selectedQuestionCount; i++) {
      this.batchQuestions.push({
        id: 0,
        text: '',
        options: [
          { id: 1, text: '', isCorrect: false },
          { id: 2, text: '', isCorrect: false },
          { id: 3, text: '', isCorrect: false },
          { id: 4, text: '', isCorrect: false }
        ],
        explanation: '',
        points: 10
      });
    }
  }

  // Adicionar todas as perguntas do batch
  addBatchQuestions(): void {
    for (const question of this.batchQuestions) {
      if (!question.text.trim()) {
        alert('Por favor, preencha todas as perguntas');
        return;
      }
      
      const hasCorrectOption = question.options.some(opt => opt.isCorrect && opt.text.trim());
      if (!hasCorrectOption) {
        alert(`A pergunta "${question.text || (this.batchQuestions.indexOf(question) + 1)}" não tem uma opção correta selecionada`);
        return;
      }
      
      const newQuestion: Question = {
        id: Date.now() + Math.random(),
        text: question.text,
        options: question.options.map(opt => ({ ...opt })),
        explanation: question.explanation,
        points: question.points
      };
      this.newQuiz.questions.push(newQuestion);
    }
    
    this.updateTotalPoints();
    this.batchQuestions = [];
    this.selectedQuestionCount = 3;
  }

  get filteredQuizzes(): Quiz[] {
    return this.quizzes.filter(quiz => {
      const matchSearch = this.searchQuery === '' ||
        quiz.title.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
        quiz.module.toLowerCase().includes(this.searchQuery.toLowerCase());
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

  getStatusBadgeClass(status: string): string {
    const classes: Record<string, string> = {
      published: 'status-published',
      draft: 'status-draft',
      archived: 'status-archived'
    };
    return classes[status] || '';
  }

  getDifficultyBadgeClass(difficulty: string): string {
    const classes: Record<string, string> = {
      'Básico': 'difficulty-basic',
      'Intermédio': 'difficulty-intermediate',
      'Avançado': 'difficulty-advanced'
    };
    return classes[difficulty] || '';
  }

  getOptionLetter(optionId: number): string {
    const letters = ['A', 'B', 'C', 'D', 'E', 'F'];
    return letters[optionId - 1] || String(optionId);
  }

  getStats() {
    return {
      total: this.quizzes.length,
      published: this.quizzes.filter(q => q.status === 'published').length,
      draft: this.quizzes.filter(q => q.status === 'draft').length,
      avgCompletions: Math.round(this.quizzes.reduce((sum, q) => sum + q.completions, 0) / this.quizzes.length)
    };
  }

  openCreateModal(): void {
    this.editingQuiz = null;
    this.activeTab = 'details';
    this.newQuiz = {
      id: 0,
      title: '',
      module: '',
      description: '',
      questions: [],
      difficulty: 'Básico',
      totalPoints: 0,
      status: 'draft',
      completions: 0,
      avgScore: 0,
      createdAt: new Date().toLocaleDateString('pt-PT', { day: '2-digit', month: 'short', year: 'numeric' }),
      timeLimit: 30,
      passingScore: 70
    };
    this.initBatchQuestions();
    this.showModal = true;
  }

  openEditModal(quiz: Quiz): void {
    this.editingQuiz = { ...quiz };
    this.newQuiz = { ...quiz };
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
      this.updateTotalPoints();
    }
  }

  updateTotalPoints(): void {
    this.newQuiz.totalPoints = this.newQuiz.questions.reduce((sum, q) => sum + (q.points || 0), 0);
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
      const newId = Math.max(...this.quizzes.map(q => q.id), 0) + 1;
      this.newQuiz.id = newId;
      this.quizzes.push({ ...this.newQuiz });
    }
    this.closeModal();
  }

  deleteQuiz(id: number): void {
    if (confirm('Tem certeza que deseja eliminar este questionário?')) {
      this.quizzes = this.quizzes.filter(q => q.id !== id);
    }
  }

  toggleStatus(quiz: Quiz): void {
    quiz.status = quiz.status === 'published' ? 'draft' : 'published';
  }

  updateOptionCorrect(questionIndex: number, optionId: number, isChecked: boolean): void {
    if (isChecked) {
      this.batchQuestions[questionIndex].options.forEach(opt => {
        opt.isCorrect = opt.id === optionId;
      });
    } else {
      const option = this.batchQuestions[questionIndex].options.find(opt => opt.id === optionId);
      if (option) option.isCorrect = false;
    }
  }

  // Para o preview das perguntas já adicionadas
  updateExistingOptionCorrect(question: Question, optionId: number, isChecked: boolean): void {
    if (isChecked) {
      question.options.forEach(opt => {
        opt.isCorrect = opt.id === optionId;
      });
    } else {
      const option = question.options.find(opt => opt.id === optionId);
      if (option) option.isCorrect = false;
    }
  }
}