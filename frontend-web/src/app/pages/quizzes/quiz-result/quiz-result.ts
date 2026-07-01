import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule, ActivatedRoute } from '@angular/router';
import { HeaderComponent } from '../../../components/header/header';
import { FooterComponent } from '../../../components/footer/footer';
import { QuizService, QuizAttempt } from '../../../services/quiz.service';

@Component({
  selector: 'app-quiz-result',
  standalone: true,
  imports: [CommonModule, RouterModule, HeaderComponent, FooterComponent],
  templateUrl: './quiz-result.html',
  styleUrls: ['./quiz-result.css']
})
export class QuizResultComponent implements OnInit {

  attempt: QuizAttempt | null = null;
  error: string | null = null;
  isLoadingNext = false;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private quizService: QuizService,
    private cdr: ChangeDetectorRef
  ) {}

  async ngOnInit(): Promise<void> {
    const attemptId = this.route.snapshot.queryParamMap.get('attempt');
    if (!attemptId) {
      this.router.navigate(['/quiz']);
      return;
    }
    this.loadResult(attemptId);
  }

  private async loadResult(attemptId: string): Promise<void> {
    try {
      this.attempt = await this.quizService.getAttempt(attemptId);
    } catch {
      this.error = 'Erro ao carregar resultado.';
    } finally {
      this.cdr.detectChanges();
    }
  }

  get score(): number {
    return this.attempt?.score ?? 0;
  }

  get performance(): string {
    switch (this.attempt?.performance_rating) {
      case 'excellent':          return 'Excelente';
      case 'good':                return 'Bom';
      case 'average':             return 'Satisfatório';
      case 'needs_improvement':   return 'Precisa de Melhorar';
      case 'poor':                 return 'Insuficiente';
      default:                     return this.performanceFromScore();
    }
  }

  private performanceFromScore(): string {
    if (this.score >= 90) return 'Excelente';
    if (this.score >= 70) return 'Bom';
    if (this.score >= 50) return 'Satisfatório';
    return 'Precisa de Melhorar';
  }

  get pointsEarned(): number {
    return this.attempt?.points_earned ?? 0;
  }

  get bonusPoints(): number {
    return this.attempt?.bonus_points ?? 0;
  }

  get correctAnswers(): number {
    return this.attempt?.correct_answers ?? 0;
  }

  get totalQuestions(): number {
    return this.attempt?.total_questions ?? 0;
  }

  get timeSpent(): string {
    const secs = this.attempt?.time_spent_secs ?? 0;
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}m ${s}s`;
  }

  goToQuizList(): void {
    this.router.navigate(['/quiz']);
  }

  async nextQuiz(): Promise<void> {
    if (this.isLoadingNext || !this.attempt) return;

    this.isLoadingNext = true;
    this.cdr.detectChanges();

    try {
      const quizzes = await this.quizService.getQuizzes();

      if (quizzes.length === 0) {
        this.router.navigate(['/quiz']);
        return;
      }

      const currentIndex = quizzes.findIndex(q => q.id === this.attempt!.quiz_id);
      const nextIndex = currentIndex === -1 || currentIndex === quizzes.length - 1
        ? 0
        : currentIndex + 1;
      const nextQuiz = quizzes[nextIndex];

      const newAttemptId = await this.quizService.startAttempt(nextQuiz.id);

      this.router.navigate(['/quiz/pergunta'], {
        queryParams: { quiz: nextQuiz.id, attempt: newAttemptId }
      });
    } catch {
      alert('Erro ao iniciar o próximo quiz.');
      this.isLoadingNext = false;
      this.cdr.detectChanges();
    }
  }

  goToRanking(): void {
    this.router.navigate(['/quiz/ranking']);
  }
}