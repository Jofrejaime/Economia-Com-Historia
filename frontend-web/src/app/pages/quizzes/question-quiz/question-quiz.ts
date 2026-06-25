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

  selectOption(optionId: string): void {
    if (!this.isSubmitting) {
      this.selectedOptionId = optionId;
    }
  }

  async nextQuestion(): Promise<void> {
    if (!this.selectedOptionId || !this.question || this.isSubmitting) return;

    this.isSubmitting = true;
    const timeSpent = Math.round((Date.now() - this.questionStartTime) / 1000);

    try {
      await this.quizService.answerAttempt(
        this.attemptId,
        this.question.id,
        this.selectedOptionId,
        timeSpent
      );

      if (this.currentIndex < this.questions.length - 1) {
        this.currentIndex++;
        this.selectedOptionId = null;
        this.questionStartTime = Date.now();
      } else {
        await this.finishQuiz(timeSpent);
      }
    } catch {
      alert('Erro ao registar resposta. Tente novamente.');
    } finally {
      this.isSubmitting = false;
    }
  }

  private async finishQuiz(lastQuestionTime: number): Promise<void> {
    try {
      const result = await this.quizService.completeAttempt(this.attemptId);
      this.router.navigate(['/quiz/resultado'], {
        queryParams: { attempt: this.attemptId }
      });
    } catch {
      alert('Erro ao finalizar quiz.');
    }
  }
}