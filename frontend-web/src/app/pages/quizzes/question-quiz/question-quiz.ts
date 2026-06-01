import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { HeaderComponent } from '../../../components/header/header';
import { FooterComponent } from '../../../components/footer/footer';
import { ActivatedRoute } from '@angular/router';

interface Option {
  id: string;
  text: string;
  isCorrect?: boolean;
}

@Component({
  selector: 'app-question-quiz',
  standalone: true,
  imports: [CommonModule, RouterModule, HeaderComponent, FooterComponent],
  templateUrl: './question-quiz.html',
  styleUrls: ['./question-quiz.css']
})
export class QuestionQuizComponent {
  selectedOption: string | null = null;
  currentQuestion = 4;
  totalQuestions = 15;

  question = {
    module: "MÓDULO IV: ANGOLA COLONIAL",
    title: "O impacto do Ciclo do Café na estrutura social angolana (1950-1970)",
    subtitle: "Considere as transformações demográficas e o surgimento de novas elites económicas durante o auge da produção cafeeira no Planalto Central.",
    options: [
      {
        id: 'A',
        text: "Provocou o declínio imediato das infraestruturas ferroviárias devido ao foco exclusivo na exportação marítima."
      },
      {
        id: 'B',
        text: "Acelerou o processo de urbanização e consolidou uma nova burguesia agrária e administrativa no corredor do Lobito.",
        isCorrect: true
      },
      {
        id: 'C',
        text: "Resultou na abolição total do trabalho forçado em todas as explorações agrícolas do norte do país."
      },
      {
        id: 'D',
        text: "Não teve qualquer impacto significativo, permanecendo Angola dependente apenas da extração diamantífera."
      }
    ],
    hint: {
      title: "Dica do Pesquisador",
      quote: '"O café transformou Angola no quarto maior produtor mundial nos anos 60. Note como a rede ferroviária, especialmente o CFB, foi redesenhada para drenar esta riqueza para o Porto do Lobito, criando centros urbanos vibrantes que antes eram meros postos administrativos."',
      expert: {
        name: "DR. ALBERTO MENDES",
        role: "Especialista em História Económica"
      }
    },
    reading: {
      title: "Leitura Recomendada",
      text: 'Consulte o Capítulo 12: "A Era do Ouro Negro Agrícola" no arquivo digital.'
    }
  };

  constructor(private router: Router) {}

  get progress(): number {
    return (this.currentQuestion / this.totalQuestions) * 100;
  }

  selectOption(optionId: string): void {
    this.selectedOption = optionId;
  }

  nextQuestion(): void {
    if (this.selectedOption) {
      this.router.navigate(['/quiz/resultado']);
    }
  }

  getOptionClass(optionId: string): string {
    return this.selectedOption === optionId
      ? 'bg-white border-2 border-[#6f0008] shadow-[0px_4px_24px_-4px_rgba(27,28,27,0.06)]'
      : 'bg-[#f5f3f1] border-2 border-transparent hover:border-[rgba(224,191,187,0.4)]';
  }

  getRadioButtonClass(optionId: string): string {
    return this.selectedOption === optionId
      ? 'border-[#6f0008] bg-[#6f0008]'
      : 'border-[#e0bfbb] bg-transparent';
  }
}