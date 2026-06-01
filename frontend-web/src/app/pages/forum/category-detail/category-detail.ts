import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { HeaderComponent } from '../../../components/header/header';
import { FooterComponent } from '../../../components/footer/footer';

interface Discussion {
  id: number;
  authorInitials: string;
  authorName: string;
  title: string;
  category: string;
  subcategory: string;
  date: string;
  replies: number;
  views: number;
}

interface ReferenceDoc {
  title: string;
  format: string;
}

@Component({
  selector: 'app-category-detail',
  standalone: true,
  imports: [CommonModule, RouterModule, HeaderComponent, FooterComponent],
  templateUrl: './category-detail.html',
  styleUrls: ['./category-detail.css']
})
export class CategoryDetailComponent {
  categoryName = 'História Monetária';
  categoryDescription = 'Explore a evolução do sistema financeiro angolano, desde os primeiros zimbos até à implementação do Kwanza moderno. Uma jornada analítica pelos arquivos da nossa soberania económica.';
  
  curator = {
    name: 'Dr. Carlos Lopes',
    role: 'Especialista em Economia Política',
    quote: '"A nossa moeda é o reflexo da nossa história política e social. Preservar este arquivo é garantir a integração económica das futuras gerações."'
  };

  discussions: Discussion[] = [
    {
      id: 1,
      authorInitials: 'AM',
      authorName: 'Dr. Antonio Manuel',
      title: 'A Reforma de 1976: O Nascimento do Kwanza',
      category: 'ANÁLISE MONETÁRIA',
      subcategory: 'PASS-INFORMAÇÕES',
      date: '12 de Out, 2023',
      replies: 42,
      views: 1200
    },
    {
      id: 2,
      authorInitials: 'LC',
      authorName: 'Prof. Luis Costa',
      title: 'Moedas Coloniais em Angola: Circulação e Valor',
      category: 'ARQUIVOS COLONIAIS',
      subcategory: 'NUMISMÁTICA',
      date: '05 de Out, 2023',
      replies: 18,
      views: 840
    },
    {
      id: 3,
      authorInitials: 'SF',
      authorName: 'Sara Francisco',
      title: 'Impacto da Desvalorização em 1991: Memórias do Novo Kwanza',
      category: 'INFLAÇÃO',
      subcategory: 'ESTATUTO ORAL',
      date: '28 de Set, 2023',
      replies: 56,
      views: 2500
    }
  ];

  referenceDocs: ReferenceDoc[] = [
    { title: 'Relatório Anual BNA (1977)', format: 'PDF + ZIMB' },
    { title: 'Estatutos do Banco de Angola', format: 'PDF + ASW' },
    { title: 'História do Escudo em Angola', format: 'ARTIGO ACADÉMICO' }
  ];

  stats = {
    documents: 154,
    results: 2100
  };

  constructor(private router: Router) {}

  navigateTo(path: string): void {
    this.router.navigate([path]);
  }

  startNewDiscussion(): void {
    this.router.navigate(['/forum/comunidade/criar-topico']);
  }

  viewDiscussion(id: number): void {
    this.router.navigate(['/forum/community/discussao', id]);
  }
}