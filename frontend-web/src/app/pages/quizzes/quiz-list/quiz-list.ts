import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { HeaderComponent } from '../../../components/header/header';
import { FooterComponent } from '../../../components/footer/footer';
import { QuizService, Quiz, LeaderboardEntry } from '../../../services/quiz.service';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-quiz-list',
  standalone: true,
  imports: [CommonModule, RouterModule, HeaderComponent, FooterComponent],
  templateUrl: './quiz-list.html',
  styleUrls: ['./quiz-list.css']
})
export class QuizListComponent implements OnInit {

  featuredQuizzes: Quiz[] = [];
  quizzes: Quiz[] = [];
  topPlayers: LeaderboardEntry[] = [];
  error: string | null = null;

  userLevel = {
    current: 1,
    name: 'Investigador',
    points: 0,
    nextLevel: 1000,
    progress: 0
  };

  constructor(
    private router: Router,
    private quizService: QuizService,
    private authService: AuthService,
    private cdr: ChangeDetectorRef
  ) {}

  async ngOnInit(): Promise<void> {
    const user = this.authService.getUser() as any;
    if (user) {
      this.userLevel = {
        current: user.level ?? 1,
        name: user.level_name ?? 'Investigador',
        points: user.total_points ?? 0,
        nextLevel: user.next_level_points ?? 1000,
        progress: user.level_progress_pct ?? 0,
      };
      this.cdr.detectChanges();
    }

    this.loadQuizzes();
    this.loadLeaderboard();
  }

  private async loadQuizzes(): Promise<void> {
    try {
      const quizzes = await this.quizService.getQuizzes();
      this.featuredQuizzes = quizzes.filter(q => q.is_featured);
      this.quizzes = quizzes.filter(q => !q.is_featured);
      this.cdr.detectChanges();
    } catch {
      this.error = 'Erro ao carregar quizzes.';
      this.cdr.detectChanges();
    }
  }

  private async loadLeaderboard(): Promise<void> {
    try {
      const leaderboard = await this.quizService.getNationalLeaderboard();
      this.topPlayers = leaderboard.slice(0, 3);
      this.cdr.detectChanges();
    } catch {
      // falha silenciosamente
    }
  }

  getDifficultyColor(difficulty: string): string {
    switch (difficulty) {
      case 'Básico': return '#22c55e';
      case 'Intermédio': return '#d4a574';
      case 'Avançado': return '#6b0119';
      default: return '#94a3b8';
    }
  }

  getAvatarUrl(name: string): string {
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=8B1E2D&color=fff&size=80`;
  }

  async startQuiz(quizId: string): Promise<void> {
    try {
      const attemptId = await this.quizService.startAttempt(quizId);
      this.router.navigate(['/quiz/pergunta'], {
        queryParams: { quiz: quizId, attempt: attemptId }
      });
    } catch (err: any) {
      if (err?.status === 409) {
        alert('Já tens uma tentativa em curso para este quiz. Completa-a primeiro.');
      } else {
        alert('Erro ao iniciar quiz. Tente novamente.');
      }
    }
  }

  goToRanking(): void {
    this.router.navigate(['/quiz/ranking']);
  }
}