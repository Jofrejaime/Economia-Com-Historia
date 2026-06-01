import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { HeaderComponent } from '../../../components/header/header';
import { FooterComponent } from '../../../components/footer/footer';

interface Answer {
  question: number;
  correct: boolean;
  time: string;
}

interface QuizResult {
  score: number;
  correctAnswers: number;
  totalQuestions: number;
  timeSpent: string;
  pointsEarned: number;
  bonusPoints: number;
  levelProgress: {
    before: number;
    after: number;
    nextLevel: number;
    percentage: number;
  };
  performance: string;
  badge: {
    earned: boolean;
    name: string;
    description: string;
  };
  answers: Answer[];
}

@Component({
  selector: 'app-quiz-result',
  standalone: true,
  imports: [CommonModule, RouterModule, HeaderComponent, FooterComponent],
  templateUrl: './quiz-result.html',
  styleUrls: ['./quiz-result.css']
})
export class QuizResultComponent {
  result: QuizResult = {
    score: 85,
    correctAnswers: 13,
    totalQuestions: 15,
    timeSpent: "18m 42s",
    pointsEarned: 130,
    bonusPoints: 20,
    levelProgress: {
      before: 2450,
      after: 2600,
      nextLevel: 3000,
      percentage: 87
    },
    performance: "Excelente",
    badge: {
      earned: true,
      name: "Especialista em Café Colonial",
      description: "Dominou o conhecimento sobre o ciclo do café em Angola"
    },
    answers: [
      { question: 1, correct: true, time: "45s" },
      { question: 2, correct: true, time: "52s" },
      { question: 3, correct: false, time: "1m 12s" },
      { question: 4, correct: true, time: "38s" },
      { question: 5, correct: true, time: "1m 05s" },
      { question: 6, correct: true, time: "42s" },
      { question: 7, correct: true, time: "56s" },
      { question: 8, correct: true, time: "48s" },
      { question: 9, correct: true, time: "1m 18s" },
      { question: 10, correct: false, time: "1m 32s" },
      { question: 11, correct: true, time: "39s" },
      { question: 12, correct: true, time: "44s" },
      { question: 13, correct: true, time: "51s" },
      { question: 14, correct: true, time: "47s" },
      { question: 15, correct: true, time: "53s" }
    ]
  };

  constructor(private router: Router) {}

  getProgressWidth(): string {
    return this.result.levelProgress.percentage + '%';
  }

  goToQuizList(): void {
    this.router.navigate(['/quiz']);
  }

  nextQuiz(): void {
    this.router.navigate(['/quiz/pergunta']);
  }
}