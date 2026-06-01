import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HeaderComponent } from '../../../components/header/header'; // ajuste o caminho
import { FooterComponent } from '../../../components/footer/footer'; // quando tiver o footer

@Component({
  selector: 'app-home-user',
  standalone: true,  // se for standalone component
  imports: [
    CommonModule,
    HeaderComponent,  // importa o header aqui
    FooterComponent  // quando tiver o footer
  ],
  templateUrl: './home-user.html',  // ou template inline
  styleUrls: ['./home-user.css']
})
export class HomeUser {
  categories = [
    {
      name: 'Período Colonial',
      description: 'Documentos e análises do período colonial e das estruturas económicas.',
      documentCount: 47,
      color: '#6b0119',
      icon: 'M3 6h18M3 12h18M3 18h18',
      isExclusive: false
    },
    {
      name: 'Economia Moderna',
      description: 'Análises pós-independência e desafios económicos contemporâneos.',
      documentCount: 38,
      color: '#1e4a6b',
      icon: 'M12 2v20M2 12h20',
      isExclusive: false
    },
    {
      name: 'Documentos Exclusivos',
      description: 'Arquivos restritos disponíveis para investigadores credenciados.',
      documentCount: 23,
      color: '#8b1e2d',
      icon: 'M12 8v4l3 3M12 2a10 10 0 1010 10A10 10 0 0012 2z',
      isExclusive: true
    }
  ];

  discussions = [
    { title: 'O impacto da descolonização na economia angolana', author: 'Dra. Maria Santos', replies: '24 respostas' },
    { title: 'Reparação histórica e desenvolvimento', author: 'Prof. João Mendes', replies: '18 respostas' },
    { title: 'Fontes primárias do período 1975-1992', author: 'Dr. Carlos Ferreira', replies: '12 respostas' }
  ];

  scholars = [
    { rank: '1º', name: 'Prof. Ana Oliveira', specialty: 'História Económica', points: '2,847' },
    { rank: '2º', name: 'Dr. Miguel Santos', specialty: 'Economia Colonial', points: '2,421' },
    { rank: '3º', name: 'Profa. Carla Lima', specialty: 'Políticas Públicas', points: '2,156' }
  ];
}