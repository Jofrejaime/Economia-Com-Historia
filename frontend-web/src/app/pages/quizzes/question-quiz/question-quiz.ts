import { Component, OnInit, OnDestroy } from '@angular/core';
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
  isLoading = true;
  isSubmitting = false;
  error: string | null = null;

  // Feedback de resposta
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
    private quizService: QuizService
  ) {}

  async ngOnInit(): Promise<void> {
    this.quizId = this.route.snapshot.queryParamMap.get('quiz') ?? '';
    this.attemptId = this.route.snapshot.queryParamMap.get('attempt') ?? '';

    if (!this.quizId || !this.attemptId) {
      this.router.navigate(['/quiz']);
      return;
    }

    try {
      this.questions = await this.quizService.getQuestions(this.quizId);
      if (this.questions.length === 0) {
        this.error = 'Este quiz não tem perguntas.';
      }
    } catch {
      this.error = 'Erro ao carregar perguntas.';
    } finally {
      this.isLoading = false;
      this.questionStartTime = Date.now();
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
    // Não permite trocar depois de responder
    if (!this.isSubmitting && !this.answered) {
      this.selectedOptionId = optionId;
    }
  }

  // Classe visual de cada opção após responder
  getOptionState(optionId: string): 'correct' | 'wrong' | 'selected' | 'normal' {
    if (!this.answered) {
      return this.selectedOptionId === optionId ? 'selected' : 'normal';
    }
    // Já respondeu
    if (this.correctOptionId && optionId === this.correctOptionId) {
      return 'correct';
    }
    if (optionId === this.selectedOptionId && !this.isCorrect) {
      return 'wrong';
    }
    return 'normal';
  }

  // Primeiro clique em "Avançar" = submeter resposta e mostrar feedback
  async submitAnswer(): Promise<void> {
    if (!this.selectedOptionId || !this.question || this.isSubmitting || this.answered) return;

    this.isSubmitting = true;
    const timeSpent = Math.round((Date.now() - this.questionStartTime) / 1000);

    try {
      const res: any = await this.quizService.answerAttempt(
        this.attemptId,
        this.question.id,
        this.selectedOptionId,
        timeSpent
      );
      this.isCorrect = !!res?.is_correct;
      this.correctOptionId = res?.correct_option_id ?? null;
      this.answered = true;
    } catch {
      alert('Erro ao registar resposta. Tente novamente.');
    } finally {
      this.isSubmitting = false;
    }
  }

  // Segundo clique = avançar para a próxima pergunta (ou finalizar)
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
  }

  // Handler único do botão
  async handleNext(): Promise<void> {
    if (!this.answered) {
      await this.submitAnswer();
    } else {
      await this.proceed();
    }
  }

  private async finishQuiz(): Promise<void> {
    this.isSubmitting = true;
    try {
      await this.quizService.completeAttempt(this.attemptId);
      this.router.navigate(['/quiz/resultado'], {
        queryParams: { attempt: this.attemptId }
      });
    } catch {
      alert('Erro ao finalizar quiz.');
      this.isSubmitting = false;
    }
  }

  // Texto do botão consoante o estado
  get buttonLabel(): string {
    if (this.isSubmitting) return 'Aguarde...';
    if (!this.answered) return 'Confirmar';
    if (this.isLastQuestion) return 'Finalizar';
    return 'Próxima pergunta';
  }
}