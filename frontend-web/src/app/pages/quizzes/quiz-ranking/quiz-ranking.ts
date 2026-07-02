import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { HeaderComponent } from '../../../components/header/header';
import { FooterComponent } from '../../../components/footer/footer';
import { QuizService, LeaderboardEntry } from '../../../services/quiz.service';

@Component({
  selector: 'app-ranking',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, HeaderComponent, FooterComponent],
  templateUrl: './quiz-ranking.html',
  styleUrls: ['./quiz-ranking.css']
})
export class RankingComponent implements OnInit {

  searchTerm = '';
  selectedProvince = '';
  players: LeaderboardEntry[] = [];
  isLoading = false;
  error: string | null = null;

  provinces = [
    'Luanda', 'Bengo', 'Benguela', 'Bié', 'Cabinda', 'Cuando Cubango',
    'Cuanza Norte', 'Cuanza Sul', 'Cunene', 'Huambo', 'Huíla', 'Kuando Kubango',
    'Kwanza Norte', 'Kwanza Sul', 'Malanje', 'Moxico', 'Namibe', 'Uíge', 'Zaire'
  ].sort();

  constructor(
    private router: Router,
    private quizService: QuizService,
    private cdr: ChangeDetectorRef
  ) {}

  async ngOnInit(): Promise<void> {
    this.loadRanking();
  }

  async onProvinceChange(): Promise<void> {
    this.loadRanking();
  }

  private async loadRanking(): Promise<void> {
    this.isLoading = true;
    this.error = null;
    this.cdr.detectChanges();

    try {
      this.players = this.selectedProvince
        ? await this.quizService.getProvincialLeaderboard(this.selectedProvince)
        : await this.quizService.getNationalLeaderboard();
    } catch {
      this.error = 'Erro ao carregar ranking.';
      this.players = [];
    } finally {
      this.isLoading = false;
      this.cdr.detectChanges();
    }
  }

  get filteredRanking(): LeaderboardEntry[] {
    if (!this.searchTerm.trim()) return this.players;
    const term = this.searchTerm.toLowerCase();
    return this.players.filter(p => p.display_name.toLowerCase().includes(term));
  }

  getInitials(name: string): string {
    return name.split(' ').map(n => n[0]).filter(Boolean).slice(0, 2).join('').toUpperCase();
  }

  getAvatarColor(name: string): string {
    return name.charCodeAt(0) % 2 === 0 ? '#8b1e2d' : '#6b0119';
  }

  goBack(): void {
    this.router.navigate(['/quiz']);
  }
}