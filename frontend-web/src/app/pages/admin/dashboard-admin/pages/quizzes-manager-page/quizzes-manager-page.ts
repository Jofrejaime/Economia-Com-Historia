import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { QuizService, Quiz, QuizPayload, QuizQuestionInput, QuizOptionInput } from '../../../../../services/quiz.service';
import { DocumentService, DocumentCategory, Document } from '../../../../../services/document.service';
import { ImageUploadComponent } from '../../../../../components/uploads/image-upload.component';
import { MediaObject } from '../../../../../models/media.models';

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
  imports: [CommonModule, FormsModule, ImageUploadComponent],
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

  // ── Edição de uma pergunta já adicionada ──
  editingQuestionIndex: number | null = null;
  questionEditForm: BatchQuestion | null = null;

  categoriesList: DocumentCategory[] = [];
  documentsList: Document[] = [];
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
    this.loadDocuments();
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
      documents: [],
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

  onQuizCoverChange(media: MediaObject | null): void {
    this.newQuiz.cover_image_url = media?.url ?? null;
  }

  isQuizDocumentSelected(docId: string): boolean {
    return (this.newQuiz.documents ?? []).includes(docId);
  }

  toggleQuizDocument(docId: string): void {
    const docs = this.newQuiz.documents ?? [];
    this.newQuiz.documents = docs.includes(docId)
      ? docs.filter(id => id !== docId)
      : [...docs, docId];
  }

  private async loadDocuments(): Promise<void> {
    try {
      this.documentsList = await this.documentService.getDocuments({ per_page: 50 });
    } catch {
      this.documentsList = [];
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

  // ─────────────────────────────────────────────────────────
  // EDIÇÃO DE PERGUNTA JÁ ADICIONADA
  // ─────────────────────────────────────────────────────────

  editQuestion(index: number): void {
    const question = this.pendingQuestions[index];
    if (!question) return;

    // Garante 4 opções (A-D) mesmo que a pergunta original tenha menos
    const optionKeys = ['A', 'B', 'C', 'D'];
    const options: QuizOptionInput[] = optionKeys.map((key) => {
      const existing = question.options.find(o => o.option_key === key);
      return existing
        ? { ...existing }
        : { option_key: key, text: '', is_correct: false };
    });

    this.questionEditForm = {
      title: question.title,
      question_type: question.question_type ?? 'multiple_choice',
      points: question.points ?? 10,
      options,
      explanation: question.options.find(o => o.explanation)?.explanation ?? '',
    };

    this.editingQuestionIndex = index;
    this.cdr.detectChanges();
  }

  updateEditOptionCorrect(optionKey: string, isChecked: boolean): void {
    if (!this.questionEditForm) return;

    if (isChecked) {
      this.questionEditForm.options.forEach(opt => {
        opt.is_correct = opt.option_key === optionKey;
      });
    } else {
      const option = this.questionEditForm.options.find(opt => opt.option_key === optionKey);
      if (option) option.is_correct = false;
    }
  }

  saveEditedQuestion(): void {
    if (this.editingQuestionIndex === null || !this.questionEditForm) return;

    if (!this.questionEditForm.title.trim()) {
      alert('Por favor, preencha o texto da pergunta');
      return;
    }

    const hasCorrectOption = this.questionEditForm.options.some(opt => opt.is_correct && opt.text.trim());
    if (!hasCorrectOption) {
      alert('Selecione uma opção correta com texto preenchido');
      return;
    }

    const index = this.editingQuestionIndex;
    const original = this.pendingQuestions[index];

    this.pendingQuestions[index] = {
      ...original,
      title: this.questionEditForm.title,
      question_type: this.questionEditForm.question_type,
      points: this.questionEditForm.points || 10,
      options: this.questionEditForm.options.map(opt => ({
        option_key: opt.option_key,
        text: opt.text,
        is_correct: opt.is_correct,
        explanation: this.questionEditForm!.explanation || undefined,
      })),
    };

    this.newQuiz.questions = [...this.pendingQuestions];
    this.cancelEditQuestion();
  }

  cancelEditQuestion(): void {
    this.editingQuestionIndex = null;
    this.questionEditForm = null;
    this.cdr.detectChanges();
  }

  // ─────────────────────────────────────────────────────────

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
    this.cancelEditQuestion();
    this.initBatchQuestions();
    this.showModal = true;
  }

  async openEditModal(quiz: Quiz): Promise<void> {
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
      documents: [],
    };
    this.pendingQuestions = [];
    this.cancelEditQuestion();
    this.activeTab = 'details';
    this.showModal = true;
    this.cdr.detectChanges();

    try {
      const relatedDocs = await this.quizService.getRelatedDocuments(quiz.id);
      this.newQuiz.documents = relatedDocs.map(d => d.id);

      const questions = await this.quizService.getQuestions(quiz.id);
      this.pendingQuestions = questions.map((q, index) => ({
        question_order: q.question_order ?? index + 1,
        title: q.title,
        subtitle: q.subtitle ?? undefined,
        module_label: q.module_label ?? undefined,
        question_type: q.question_type,
        points: q.points,
        hint_title: q.hint_title ?? undefined,
        hint_quote: q.hint_quote ?? undefined,
        expert_name: q.expert_name ?? undefined,
        expert_role: q.expert_role ?? undefined,
        reading_title: q.reading_title ?? undefined,
        reading_text: q.reading_text ?? undefined,
        options: q.options.map(opt => ({
          option_key: opt.option_key,
          text: opt.option_text,
          is_correct: opt.is_correct ?? false,
          explanation: opt.explanation ?? undefined,
        })),
      }));
    } catch {
      alert('Erro ao carregar perguntas do questionário.');
    } finally {
      this.cdr.detectChanges();
    }
  }

  closeModal(): void {
    this.showModal = false;
    this.editingQuiz = null;
    this.batchQuestions = [];
    this.pendingQuestions = [];
    this.cancelEditQuestion();
  }

  removeQuestion(index: number): void {
    if (confirm('Tem certeza que deseja remover esta pergunta?')) {
      if (this.editingQuestionIndex === index) {
        this.cancelEditQuestion();
      }
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