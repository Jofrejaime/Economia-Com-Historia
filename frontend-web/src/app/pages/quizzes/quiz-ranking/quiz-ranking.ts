import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { HeaderComponent } from '../../../components/header/header';
import { FooterComponent } from '../../../components/footer/footer';

interface RankPlayer {
  id: number;
  name: string;
  community: string;
  points: number;
  level: number;
}

@Component({
  selector: 'app-ranking',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, HeaderComponent, FooterComponent],
  templateUrl: './quiz-ranking.html',
  styleUrls: ['./quiz-ranking.css']
})
export class RankingComponent {
  searchTerm = '';
  selectedCommunity = '';

  players: RankPlayer[] = [
    { id: 1, name: 'Dra. Ana Oliveira', community: 'Investigadores', points: 2847, level: 5 },
    { id: 2, name: 'Dr. Miguel Santos', community: 'Investigadores', points: 2421, level: 4 },
    { id: 3, name: 'Profa. Carla Lima', community: 'Docentes', points: 2156, level: 4 },
    { id: 4, name: 'Dr. João Costa', community: 'Investigadores', points: 1890, level: 3 },
    { id: 5, name: 'Maria Fernandes', community: 'Estudantes', points: 1654, level: 3 },
    { id: 6, name: 'Prof. António Silva', community: 'Docentes', points: 1432, level: 2 },
    { id: 7, name: 'Sofia Rodrigues', community: 'Estudantes', points: 1200, level: 2 },
    { id: 8, name: 'Dr. Pedro Santos', community: 'Investigadores', points: 987, level: 2 },
    { id: 9, name: 'Ana Pereira', community: 'Estudantes', points: 765, level: 1 },
    { id: 10, name: 'Prof. Luís Mendes', community: 'Docentes', points: 654, level: 1 },
  ];

  constructor(private router: Router) {}

  get filteredRanking(): RankPlayer[] {
    return this.players
      .filter(p => {
        const matchName = p.name.toLowerCase().includes(this.searchTerm.toLowerCase());
        const matchCommunity = this.selectedCommunity ? p.community === this.selectedCommunity : true;
        return matchName && matchCommunity;
      })
      .sort((a, b) => b.points - a.points);
  }

  goBack(): void {
    this.router.navigate(['/quiz']);
  }

  goToProfile(playerId: number): void {
    this.router.navigate(['/auth/perfil', playerId]);
  }
}