import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { QuizService, Quiz, QuizPayload, QuizQuestionInput, QuizOptionInput } from '../../../../../services/quiz.service';
import { DocumentService, DocumentCategory } from '../../../../../services/document.service';

interface BatchQuestion {
  title: string;
  question_type: string;
  points: number;
  options: QuizOptionInput[];
  explanation: string;
}

@Component({
  selector: 'app-quizzes-manager-page',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './quizzes-manager-page.html',
  styleUrls: ['./quizzes-manager-page.css']
})
export class QuizzesManagerPageComponent implements OnInit {
  searchQuery = '';
  filterDifficulty = 'todos';
  filterStatus = 'todos';
  showModal = false;
  editingQuiz: Quiz | null = null;
  activeTab: 'details' | 'questions' = 'details';
  error: string | null = null;
  isSaving = false;

  selectedQuestionCount = 3;
  questionCountOptions = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

  batchQuestions: BatchQuestion[] = [];
  pendingQuestions: QuizQuestionInput[] = [];

  categoriesList: DocumentCategory[] = [];
  quizzes: Quiz[] = [];

  newQuiz: QuizPayload = this.emptyQuiz();

  constructor(
    private quizService: QuizService,
    private documentService: DocumentService,
    private cdr: ChangeDetectorRef
  ) {}

  async ngOnInit(): Promise<void> {
    this.loadQuizzes();
    this.loadCategories();
  }

  private emptyQuiz(): QuizPayload {
    return {
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
      questions: [],
    };
  }

  private async loadQuizzes(): Promise<void> {
    try {
      this.quizzes = await this.quizService.getQuizzes();
    } catch {
      this.error = 'Erro ao carregar questionários.';
    } finally {
      this.cdr.detectChanges();
    }
  }

  private async loadCategories(): Promise<void> {
    try {
      this.categoriesList = await this.documentService.getCategories();
    } catch {
      this.categoriesList = [];
    } finally {
      this.cdr.detectChanges();
    }
  }

  initBatchQuestions(): void {
    this.batchQuestions = [];
    const optionKeys = ['A', 'B', 'C', 'D'];
    for (let i = 0; i < this.selectedQuestionCount; i++) {
      this.batchQuestions.push({
        title: '',
        question_type: 'multiple_choice',
        points: 10,
        options: optionKeys.map(key => ({ option_key: key, text: '', is_correct: false })),
        explanation: '',
      });
    }
  }

  addBatchQuestions(): void {
    for (const question of this.batchQuestions) {
      if (!question.title.trim()) {
        alert('Por favor, preencha todas as perguntas');
        return;
      }
      const hasCorrectOption = question.options.some(opt => opt.is_correct && opt.text.trim());
      if (!hasCorrectOption) {
        alert(`A pergunta "${question.title}" não tem uma opção correta selecionada`);
        return;
      }

      this.pendingQuestions.push({
        question_order: this.pendingQuestions.length + 1,
        title: question.title,
        question_type: question.question_type,
        points: question.points || 10,
        options: question.options.map(opt => ({
          option_key: opt.option_key,
          text: opt.text,
          is_correct: opt.is_correct,
          explanation: question.explanation || undefined,
        })),
      });
    }

    this.newQuiz.questions = [...this.pendingQuestions];
    this.batchQuestions = [];
    this.selectedQuestionCount = 3;
    this.cdr.detectChanges();
  }

  get filteredQuizzes(): Quiz[] {
    return this.quizzes.filter(quiz => {
      const matchSearch = this.searchQuery === '' ||
        quiz.title.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
        (quiz.module ?? '').toLowerCase().includes(this.searchQuery.toLowerCase());
      const matchDifficulty = this.filterDifficulty === 'todos' || quiz.difficulty === this.filterDifficulty;
      const matchStatus = this.filterStatus === 'todos' || quiz.status === this.filterStatus;
      return matchSearch && matchDifficulty && matchStatus;
    });
  }

  getStatusLabel(status: string): string {
    const labels: Record<string, string> = { published: 'Publicado', draft: 'Rascunho', archived: 'Arquivado' };
    return labels[status] ?? status;
  }

  getDifficultyBadgeClass(difficulty: string): string {
    const classes: Record<string, string> = {
      'Básico': 'difficulty-basic',
      'Intermédio': 'difficulty-intermediate',
      'Avançado': 'difficulty-advanced',
    };
    return classes[difficulty] ?? '';
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
        ? Math.round(this.quizzes.reduce((sum, q) => sum + (q.completions_count ?? 0), 0) / this.quizzes.length)
        : 0,
    };
  }

  openCreateModal(): void {
    this.editingQuiz = null;
    this.activeTab = 'details';
    this.newQuiz = this.emptyQuiz();
    this.pendingQuestions = [];
    this.initBatchQuestions();
    this.showModal = true;
  }

  openEditModal(quiz: Quiz): void {
    this.editingQuiz = quiz;
    this.newQuiz = {
      title: quiz.title,
      module: quiz.module,
      description: quiz.description,
      cover_image_url: quiz.cover_image_url,
      difficulty: quiz.difficulty,
      base_points: quiz.base_points,
      time_limit_secs: quiz.time_limit_secs,
      access_level_id: quiz.access_level_id,
      is_featured: quiz.is_featured,
      status: quiz.status,
      category_id: quiz.category_id,
      questions: [],
    };
    this.pendingQuestions = [];
    this.activeTab = 'details';
    this.showModal = true;
  }

  closeModal(): void {
    this.showModal = false;
    this.editingQuiz = null;
    this.batchQuestions = [];
    this.pendingQuestions = [];
  }

  removeQuestion(index: number): void {
    if (confirm('Tem certeza que deseja remover esta pergunta?')) {
      this.pendingQuestions.splice(index, 1);
      this.pendingQuestions.forEach((q, i) => q.question_order = i + 1);
      this.newQuiz.questions = [...this.pendingQuestions];
    }
  }

  async saveQuiz(): Promise<void> {
    if (!this.newQuiz.title?.trim()) {
      alert('Por favor, insira o título do questionário');
      return;
    }

    // Para edição, perguntas são opcionais (mantém as existentes se nenhuma nova for adicionada)
    if (!this.editingQuiz && this.pendingQuestions.length === 0) {
      alert('Por favor, adicione pelo menos uma pergunta');
      return;
    }

    this.isSaving = true;
    this.cdr.detectChanges();

    try {
      const payload: QuizPayload = { ...this.newQuiz };
      if (this.pendingQuestions.length > 0) {
        payload.questions = this.pendingQuestions;
      } else {
        delete payload.questions;
      }

      if (this.editingQuiz) {
        const updated = await this.quizService.updateQuiz(this.editingQuiz.id, payload);
        const idx = this.quizzes.findIndex(q => q.id === this.editingQuiz!.id);
        if (idx !== -1) this.quizzes[idx] = updated;
      } else {
        const created = await this.quizService.createQuiz(payload);
        this.quizzes.unshift(created);
      }

      this.closeModal();
    } catch (err: any) {
      alert(err?.error?.message ?? 'Erro ao guardar questionário.');
    } finally {
      this.isSaving = false;
      this.cdr.detectChanges();
    }
  }

  async deleteQuiz(id: string): Promise<void> {
    if (!confirm('Tem certeza que deseja eliminar este questionário?')) return;
    try {
      await this.quizService.deleteQuiz(id);
      this.quizzes = this.quizzes.filter(q => q.id !== id);
      this.cdr.detectChanges();
    } catch (err: any) {
      alert(err?.error?.message ?? 'Erro ao eliminar questionário.');
    }
  }

  async toggleStatus(quiz: Quiz): Promise<void> {
    const newStatus = quiz.status === 'published' ? 'draft' : 'published';
    try {
      const updated = await this.quizService.updateQuiz(quiz.id, {
        title: quiz.title,
        module: quiz.module,
        description: quiz.description,
        difficulty: quiz.difficulty,
        base_points: quiz.base_points,
        access_level_id: quiz.access_level_id,
        is_featured: quiz.is_featured,
        status: newStatus,
      });
      const idx = this.quizzes.findIndex(q => q.id === quiz.id);
      if (idx !== -1) this.quizzes[idx] = updated;
      this.cdr.detectChanges();
    } catch (err: any) {
      alert(err?.error?.message ?? 'Erro ao atualizar status.');
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