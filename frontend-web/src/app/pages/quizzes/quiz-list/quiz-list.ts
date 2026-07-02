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
    this.loadUserLevel();
    this.loadQuizzes();
    this.loadLeaderboard();
  }

  private async loadUserLevel(): Promise<void> {
    try {
      const user = this.authService.getUser() as any;
      if (!user) return;

      const userLevels = user.user_levels || {};
      const currentLevel = userLevels.current_level ?? 1;
      const totalPoints = userLevels.total_points ?? 0;

      this.userLevel = {
        current: currentLevel,
        name: this.getLevelName(currentLevel),
        points: totalPoints,
        nextLevel: this.getNextLevelThreshold(currentLevel),
        progress: this.getLevelProgress(currentLevel, totalPoints),
      };
      this.cdr.detectChanges();
    } catch {
      // Mantém os valores por defeito
    }
  }

  private getLevelName(level: number): string {
    const names: Record<number, string> = {
      1: 'Iniciante',
      2: 'Aprendiz',
      3: 'Investigador',
      4: 'Mestre',
      5: 'Arquivista'
    };
    return names[level] ?? 'Investigador';
  }

  private getNextLevelThreshold(level: number): number {
    const thresholds: Record<number, number> = { 1: 250, 2: 750, 3: 1500, 4: 3000, 5: 3000 };
    return thresholds[level] ?? 1000;
  }

  private getLevelProgress(level: number, points: number): number {
    const next = this.getNextLevelThreshold(level);
    return Math.min(100, Math.round((points / next) * 100));
  }

  private async loadQuizzes(): Promise<void> {
    try {
      const quizzes = await this.quizService.getQuizzes();
      this.allQuizzes = quizzes;
      this.featuredQuizzes = quizzes.filter(q => q.is_featured);

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

  getInitials(name: string): string {
    return name.split(' ').map(n => n[0]).filter(Boolean).slice(0, 2).join('').toUpperCase();
  }

  getAvatarColor(name: string): string {
    return name.charCodeAt(0) % 2 === 0 ? '#8b1e2d' : '#6b0119';
  }

  async startQuiz(quizId: string): Promise<void> {
    if (!this.authService.getUser()) {
      this.router.navigate(['/auth/login']);
      return;
    }

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