import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { HeaderComponent } from '../../../components/header/header';
import { FooterComponent } from '../../../components/footer/footer';

interface Quiz {
  id: number;
  title: string;
  module: string;
  description?: string;
  questions: number;
  difficulty: string;
  points: number;
  completed: boolean;
  image?: string | null;
}

@Component({
  selector: 'app-quiz-list',
  standalone: true,
  imports: [CommonModule, RouterModule, HeaderComponent, FooterComponent],
  templateUrl: './quiz-list.html',
  styleUrls: ['./quiz-list.css']
})
export class QuizListComponent {
  userLevel = {
    current: 3,
    name: "Investigador Avançado",
    points: 2450,
    nextLevel: 3000,
    progress: 82
  };

  featuredQuizzes: Quiz[] = [
    {
      id: 1,
      title: "O Ciclo do Café em Angola",
      module: "MÓDULO IV: ANGOLA COLONIAL",
      description: "Análise do impacto econômico e social do café entre 1950-1970",
      questions: 15,
      difficulty: "Avançado",
      points: 150,
      completed: false
    },
    {
      id: 2,
      title: "Reformas Monetárias Pós-Independência",
      module: "MÓDULO V: ANGOLA INDEPENDENTE",
      description: "A transição do Escudo para o Kwanza em 1977",
      questions: 12,
      difficulty: "Intermédio",
      points: 120,
      completed: true
    }
  ];

  quizzes: Quiz[] = [
    {
      id: 3,
      title: "Infraestruturas Coloniais",
      module: "MÓDULO III",
      questions: 10,
      difficulty: "Básico",
      points: 100,
      completed: false
    },
    {
      id: 4,
      title: "Economia do Petróleo",
      module: "MÓDULO VI",
      questions: 18,
      difficulty: "Avançado",
      points: 180,
      completed: false
    },
    {
      id: 5,
      title: "Comércio Transatlântico",
      module: "MÓDULO II",
      questions: 14,
      difficulty: "Intermédio",
      points: 140,
      completed: true
    },
    {
      id: 6,
      title: "Desenvolvimento Urbano",
      module: "MÓDULO IV",
      questions: 12,
      difficulty: "Básico",
      points: 120,
      completed: false
    }
  ];

  constructor(private router: Router) {}

  getDifficultyColor(difficulty: string): string {
    switch(difficulty) {
      case 'Básico': return '#22c55e';
      case 'Intermédio': return '#d4a574';
      case 'Avançado': return '#6b0119';
      default: return '#94a3b8';
    }
  }

  // Método chamado quando clica no card do quiz
  startQuiz(quizId: number): void {
    console.log('Iniciando quiz:', quizId);
    // Navegar para a página de pergunta do quiz
    this.router.navigate(['/quiz/pergunta']);
  }
}