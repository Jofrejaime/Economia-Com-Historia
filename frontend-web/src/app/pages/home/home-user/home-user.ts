import { Component, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { HeaderComponent } from '../../../components/header/header';
import { FooterComponent } from '../../../components/footer/footer';

@Component({
  selector: 'app-home-user',
  standalone: true,
  imports: [
    CommonModule,
    HeaderComponent,
    FooterComponent
  ],
  templateUrl: './home-user.html',
  styleUrls: ['./home-user.css']
})
export class HomeUser {
  @ViewChild('scrollContainer') scrollContainer!: ElementRef;

  categories = [
    {
      id: 1,
      name: 'Período Colonial',
      description: 'Documentos e análises do período colonial e das estruturas económicas.',
      documentCount: 47,
      color: '#6b0119',
      icon: 'M3 6h18M3 12h18M3 18h18',
      isExclusive: false
    },
    {
      id: 2,
      name: 'Economia Moderna',
      description: 'Análises pós-independência e desafios económicos contemporâneos.',
      documentCount: 38,
      color: '#1e4a6b',
      icon: 'M12 2v20M2 12h20',
      isExclusive: false
    },
    {
      id: 3,
      name: 'Documentos Exclusivos',
      description: 'Arquivos restritos disponíveis para investigadores credenciados.',
      documentCount: 23,
      color: '#8b1e2d',
      icon: 'M12 8v4l3 3M12 2a10 10 0 1010 10A10 10 0 0012 2z',
      isExclusive: true
    }
  ];

  discussions = [
    { id: 1, title: 'O impacto da descolonização na economia angolana', author: 'Dra. Maria Santos', replies: '24 respostas' },
    { id: 2, title: 'Reparação histórica e desenvolvimento', author: 'Prof. João Mendes', replies: '18 respostas' },
    { id: 3, title: 'Fontes primárias do período 1975-1992', author: 'Dr. Carlos Ferreira', replies: '12 respostas' }
  ];

  scholars = [
    { id: 1, rank: '1º', name: 'Prof. Ana Oliveira', specialty: 'História Económica', points: '2,847' },
    { id: 2, rank: '2º', name: 'Dr. Miguel Santos', specialty: 'Economia Colonial', points: '2,421' },
    { id: 3, rank: '3º', name: 'Profa. Carla Lima', specialty: 'Políticas Públicas', points: '2,156' }
  ];

  constructor(private router: Router) {}

  // Navega para a página de visualização de conteúdo
  navigateToContent(contentId: number): void {
    this.router.navigate(['/contents/view', contentId]);
  }

  // Navega para a página de categorias
  navigateToCategory(categoryId: number): void {
    this.router.navigate(['/forum/categoria', categoryId]);
  }

  // Navega para a página de discussão
  navigateToDiscussion(discussionId: number): void {
    this.router.navigate(['/forum/community/discussao', discussionId]);
  }

  // Navega para o perfil do investigador
  navigateToScholar(scholarId: number): void {
    this.router.navigate(['/auth/perfil', scholarId]);
  }

  // Navegação genérica
  navigateTo(path: string): void {
    this.router.navigate([path]);
  }
}