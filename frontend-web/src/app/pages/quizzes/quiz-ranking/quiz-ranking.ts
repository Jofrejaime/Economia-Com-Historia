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
  error: string | null = null;

  constructor(
    private router: Router,
    private quizService: QuizService,
    private cdr: ChangeDetectorRef
  ) {}

  async ngOnInit(): Promise<void> {
    this.loadRanking();
  }

  private async loadRanking(): Promise<void> {
    try {
      this.players = await this.quizService.getNationalLeaderboard();
    } catch {
      this.error = 'Erro ao carregar ranking.';
    } finally {
      this.cdr.detectChanges();
    }
  }

  get filteredRanking(): LeaderboardEntry[] {
    return this.players.filter(p => {
      const matchName = p.display_name.toLowerCase().includes(this.searchTerm.toLowerCase());
      const matchProvince = this.selectedProvince ? p.province === this.selectedProvince : true;
      return matchName && matchProvince;
    });
  }

  getAvatarUrl(name: string): string {
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=8B1E2D&color=fff&size=48`;
  }

  goBack(): void {
    this.router.navigate(['/quiz']);
  }
}