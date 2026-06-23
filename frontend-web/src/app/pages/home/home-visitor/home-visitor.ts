import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { HeaderComponent } from '../../../components/header/header';
import { FooterComponent } from '../../../components/footer/footer';

@Component({
  selector: 'app-home-visitor',
  standalone: true,
  imports: [CommonModule, RouterModule, HeaderComponent, FooterComponent],
  templateUrl: './home-visitor.html',
  styleUrls: ['./home-visitor.css']
})
export class HomeVisitorComponent {
  
  // ===== DADOS PARA CONTEÚDOS EM DESTAQUE =====
  featuredContents = [
    {
      id: 1,
      title: 'A Transição: Do Escudo ao Kwanza',
      description: 'Uma análise profunda da reforma monetária de 1977 que moldou a soberania económica da nação.',
      category: 'História Monetária',
      date: '15 Jun 2026',
      views: '1.2k',
      image: 'https://images.unsplash.com/photo-1604594849809-dfedbc827105?w=400&q=80'
    },
    {
      id: 2,
      title: 'Caminho de Ferro de Benguela: Análise de Impacto Fiscal',
      description: 'Mapeamento do corredor de exportação do Copperbelt até à costa atlântica e seu impacto económico.',
      category: 'Infraestrutura',
      date: '10 Jun 2026',
      views: '856',
      image: 'https://images.unsplash.com/photo-1557318041-1ce374d55ebf?w=400&q=80'
    },
    {
      id: 3,
      title: 'Política Pós-Independência e Economia Planeada',
      description: 'Análise das estruturas de economia planeada do final dos anos 70 e 80 em Angola.',
      category: 'Economia Moderna',
      date: '05 Jun 2026',
      views: '634',
      image: 'https://images.unsplash.com/photo-1586953208448-b95a79798f07?w=400&q=80'
    },
    {
      id: 4,
      title: 'O Ciclo do Café em Angola (1970-1980)',
      description: 'Como Angola se tornou o terceiro maior produtor mundial de café na década de 1970.',
      category: 'Agricultura',
      date: '01 Jun 2026',
      views: '423',
      image: 'https://images.unsplash.com/photo-1447069387593-a5de0862481e?w=400&q=80'
    }
  ];

  // ===== DADOS PARA RANKING DE INVESTIGADORES =====
  leaderboard = [
    {
      name: 'Dra. Ana Oliveira',
      specialty: 'História Económica',
      points: '2,847'
    },
    {
      name: 'Dr. Miguel Santos',
      specialty: 'Economia Colonial',
      points: '2,421'
    },
    {
      name: 'Profa. Carla Lima',
      specialty: 'Políticas Públicas',
      points: '2,156'
    },
    {
      name: 'Dr. João Ferreira',
      specialty: 'Economia Agrícola',
      points: '1,893'
    },
    {
      name: 'Dra. Maria Silva',
      specialty: 'História Monetária',
      points: '1,654'
    }
  ];

  // ===== DADOS PARA DISCUSSÕES RECENTES =====
  recentDiscussions = [
    {
      id: 1,
      title: 'Reforma Monetária de 1976: A Transição do Kwanza',
      author: 'João Manuel',
      authorInitials: 'JM',
      avatarColor: '#6B0119',
      replies: 12,
      timeAgo: '2 horas'
    },
    {
      id: 2,
      title: 'Documentos Fundadores do BNA e Política Fiscal Inicial',
      author: 'Isabel Fernandes',
      authorInitials: 'IF',
      avatarColor: '#8B1E2D',
      replies: 8,
      timeAgo: '5 horas'
    },
    {
      id: 3,
      title: 'Fontes Primárias do Período 1975-1992',
      author: 'Carlos Ferreira',
      authorInitials: 'CF',
      avatarColor: '#6B0119',
      replies: 5,
      timeAgo: '1 dia'
    }
  ];

  constructor(private router: Router) {}

  navigateTo(path: string): void {
    this.router.navigate([path]);
  }
}