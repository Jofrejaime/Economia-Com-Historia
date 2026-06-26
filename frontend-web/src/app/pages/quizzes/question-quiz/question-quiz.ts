import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule, ActivatedRoute } from '@angular/router';
import { HeaderComponent } from '../../../components/header/header';
import { FooterComponent } from '../../../components/footer/footer';
import { QuizService, QuizQuestion } from '../../../services/quiz.service';

@Component({
  selector: 'app-question-quiz',
  standalone: true,
  imports: [CommonModule, RouterModule, HeaderComponent, FooterComponent],
  templateUrl: './question-quiz.html',
  styleUrls: ['./question-quiz.css']
})
export class QuestionQuizComponent implements OnInit, OnDestroy {

  questions: QuizQuestion[] = [];
  currentIndex = 0;
  selectedOptionId: string | null = null;
  isLoading = false;
  isSubmitting = false;
  error: string | null = null;

  answered = false;
  isCorrect = false;
  correctOptionId: string | null = null;

  quizId = '';
  attemptId = '';
  questionStartTime = Date.now();
  private timerInterval: any = null;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private quizService: QuizService,
    private cdr: ChangeDetectorRef
  ) {}

  async ngOnInit(): Promise<void> {
    this.quizId = this.route.snapshot.queryParamMap.get('quiz') ?? '';
    this.attemptId = this.route.snapshot.queryParamMap.get('attempt') ?? '';

    if (!this.quizId || !this.attemptId) {
      this.router.navigate(['/quiz']);
      return;
    }

    this.loadQuestions();
  }

  private async loadQuestions(): Promise<void> {
    try {
      this.questions = await this.quizService.getQuestions(this.quizId);
      if (this.questions.length === 0) {
        this.error = 'Este quiz não tem perguntas.';
      }
      this.questionStartTime = Date.now();
    } catch {
      this.error = 'Erro ao carregar perguntas.';
    } finally {
      this.cdr.detectChanges();
    }
  }

  ngOnDestroy(): void {
    if (this.timerInterval) clearInterval(this.timerInterval);
  }

  get question(): QuizQuestion | null {
    return this.questions[this.currentIndex] ?? null;
  }

  get currentQuestion(): number {
    return this.currentIndex + 1;
  }

  get totalQuestions(): number {
    return this.questions.length;
  }

  get isLastQuestion(): boolean {
    return this.currentIndex === this.questions.length - 1;
  }

  selectOption(optionId: string): void {
    if (!this.isSubmitting && !this.answered) {
      this.selectedOptionId = optionId;
      this.cdr.detectChanges();
    }
  }

  getOptionState(optionId: string): 'correct' | 'wrong' | 'selected' | 'normal' {
    if (!this.answered) {
      return this.selectedOptionId === optionId ? 'selected' : 'normal';
    }
    if (this.correctOptionId && optionId === this.correctOptionId) {
      return 'correct';
    }
    if (optionId === this.selectedOptionId && !this.isCorrect) {
      return 'wrong';
    }
    return 'normal';
  }

  async submitAnswer(): Promise<void> {
    if (!this.selectedOptionId || !this.question || this.isSubmitting || this.answered) return;

    this.isSubmitting = true;
    this.cdr.detectChanges();

    const timeSpent = Math.round((Date.now() - this.questionStartTime) / 1000);

    try {
  const res: any = await this.quizService.answerAttempt(
    this.attemptId,
    this.question.id,
    this.selectedOptionId,
    timeSpent
  );
  this.isCorrect = !!res?.is_correct;

  if (this.isCorrect) {
    // quando acerta, a opção seleccionada é a correcta
    this.correctOptionId = this.selectedOptionId;
  } else {
    // quando erra, o backend pode (ou não) devolver a correcta
    this.correctOptionId = res?.correct_option_id ?? null;
  }

  this.answered = true;
} catch {
  alert('Erro ao registar resposta. Tente novamente.');
} finally {
      this.isSubmitting = false;
      this.cdr.detectChanges();
    }
  }

  async proceed(): Promise<void> {
    if (this.isLastQuestion) {
      await this.finishQuiz();
      return;
    }
    this.currentIndex++;
    this.selectedOptionId = null;
    this.answered = false;
    this.isCorrect = false;
    this.correctOptionId = null;
    this.questionStartTime = Date.now();
    this.cdr.detectChanges();
  }

  async handleNext(): Promise<void> {
    if (!this.answered) {
      await this.submitAnswer();
    } else {
      await this.proceed();
    }
  }

  private async finishQuiz(): Promise<void> {
    this.isSubmitting = true;
    this.cdr.detectChanges();
    try {
      await this.quizService.completeAttempt(this.attemptId);
      this.router.navigate(['/quiz/resultado'], {
        queryParams: { attempt: this.attemptId }
      });
    } catch {
      alert('Erro ao finalizar quiz.');
      this.isSubmitting = false;
      this.cdr.detectChanges();
    }
  }

  get buttonLabel(): string {
    if (this.isSubmitting) return 'Aguarde...';
    if (!this.answered) return 'Confirmar';
    if (this.isLastQuestion) return 'Finalizar';
    return 'Próxima pergunta';
  }
}