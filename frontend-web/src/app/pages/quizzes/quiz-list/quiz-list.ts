import { Component, OnInit, ChangeDetectorRef, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { HeaderComponent } from '../../../components/header/header';
import { FooterComponent } from '../../../components/footer/footer';
import { QuizService, Quiz, LeaderboardEntry } from '../../../services/quiz.service';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-quiz-list',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, HeaderComponent, FooterComponent],
  templateUrl: './quiz-list.html',
  styleUrls: ['./quiz-list.css']
})
export class QuizListComponent implements OnInit {

  allQuizzes: Quiz[] = [];
  featuredQuizzes: Quiz[] = [];
  topPlayers: LeaderboardEntry[] = [];
  error: string | null = null;

  // Filtros
  searchQuery = '';
  selectedDifficulty: string | null = null;
  showDifficultyDropdown = false;
  private searchTimer: any = null;

  difficulties: { id: string; label: string }[] = [];
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
    this.allQuizzes = quizzes;
    this.featuredQuizzes = quizzes.filter(q => q.is_featured);

    // extrai dificuldades únicas da API, ordenadas
    const seen = new Set<string>();
    this.difficulties = quizzes
      .map(q => q.difficulty)
      .filter(d => d && !seen.has(d) && seen.add(d))
      .map(d => ({ id: d, label: d }));

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
    } catch {}
  }

  // ===== FILTROS =====
  get filteredQuizzes(): Quiz[] {
    return this.allQuizzes
      .filter(q => !q.is_featured)
      .filter(q => {
        const matchSearch = this.searchQuery.trim().length === 0
          || q.title.toLowerCase().includes(this.searchQuery.toLowerCase())
          || (q.module ?? '').toLowerCase().includes(this.searchQuery.toLowerCase());
        const matchDifficulty = !this.selectedDifficulty || q.difficulty === this.selectedDifficulty;
        return matchSearch && matchDifficulty;
      });
  }

  get totalFiltered(): number {
    return this.filteredQuizzes.length;
  }

  onSearchInput(): void {
    clearTimeout(this.searchTimer);
    this.searchTimer = setTimeout(() => this.cdr.detectChanges(), 300);
  }

  getSelectedDifficultyLabel(): string {
    return this.difficulties.find(d => d.id === this.selectedDifficulty)?.label ?? 'Todos os Níveis';
  }

  selectDifficulty(id: string): void {
    this.selectedDifficulty = this.selectedDifficulty === id ? null : id;
    this.showDifficultyDropdown = false;
    this.cdr.detectChanges();
  }

  toggleDifficultyDropdown(): void {
    this.showDifficultyDropdown = !this.showDifficultyDropdown;
  }

  clearFilters(): void {
    this.searchQuery = '';
    this.selectedDifficulty = null;
    this.showDifficultyDropdown = false;
    this.cdr.detectChanges();
  }

  @HostListener('document:click', ['$event'])
  handleClickOutside(event: Event): void {
    const target = event.target as HTMLElement;
    if (!target.closest('.quizzes-filter-dropdown')) {
      this.showDifficultyDropdown = false;
    }
  }

  // ===== UTILITÁRIOS =====
  getDifficultyColor(difficulty: string): string {
    switch (difficulty) {
      case 'Básico':     return '#22c55e';
      case 'Intermédio': return '#d4a574';
      case 'Avançado':   return '#6b0119';
      default:           return '#94a3b8';
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