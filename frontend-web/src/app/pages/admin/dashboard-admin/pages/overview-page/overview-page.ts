import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-overview-page',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './overview-page.html',
  styleUrls: ['./overview-page.css']
})
export class OverviewPageComponent {
  currentYear = new Date().getFullYear();

  // KPI Cards Data
  kpiCards = [
    {
      label: 'TOTAL UTILIZADORES',
      value: '2,842',
      variant: {
        type: 'trend',
        badge: '+12%',
        badgeLabel: 'vs. mês passado',
        positive: true
      }
    },
    {
      label: 'PEDIDOS DE ACESSO',
      value: '12',
      leftBorderColor: '#ba1a1a',
      variant: {
        type: 'alert',
        badge: 'PENDENTES'
      }
    },
    {
      label: 'CONTEÚDO PUBLICADO',
      value: '12,4k',
      variant: {
        type: 'progress',
        subValue: '/ 158 em revisão',
        progress: 88
      }
    },
    {
      label: 'TÓPICOS ATIVOS (48H)',
      value: '42',
      valueColor: '#fbbf24',
      variant: {
        type: 'avatar',
        avatarColors: ['#cbd5e1', '#94a3b8', '#6b0119']
      }
    },
    {
      label: 'NOVOS MEMBROS',
      value: '18',
      variant: {
        type: 'simple',
        subtext: 'hoje'
      }
    }
  ];

  // Activity Data
  activityData = {
    categories: ['ECONOMIA COLONIAL', 'PÓS-INDEPENDÊNCIA'],
    months: ['JAN', 'FEV', 'MAR', 'ABR', 'MAI'],
    values: [120, 160, 140, 180, 150]
  };

  // Goals Data
  goals = [
    { name: 'Digitalização 1970-1975', percent: 82, color: '#6b0119' },
    { name: 'Indexação de Metadados', percent: 64, color: '#fbbf24' },
    { name: 'Verificação de Qualidade', percent: 95, color: '#22c55e' }
  ];

  // Recent Activity Data
  recentActivities = [
    {
      icon: 'bordeaux',
      title: 'Novo pedido de acesso de investigador',
      description: 'Dr. Arnaldo Neto (Univ. Namibe) solicitou acesso ao Acervo Colonial.',
      time: 'Há 5 min',
      type: 'button',
      buttonText: 'Analisar'
    },
    {
      icon: 'success',
      title: 'Documento Publicado',
      description: '"Relatório de Exportação Diamang 1968" aprovado e visível no portal.',
      time: 'Há 22 min',
      type: 'badge',
      badgeText: 'SUCESSO',
      badgeClass: 'success'
    },
    {
      icon: 'warning',
      title: 'Novo tópico no fórum',
      description: 'Discussão iniciada sobre: "Papel da moeda Kwanza na transição (1976)".',
      time: 'Há 1 hora',
      type: 'button',
      buttonText: 'Ver Discussão',
      buttonOutline: true
    },
    {
      icon: 'neutral',
      title: 'Novo utilizador registado',
      description: 'Maria João submeteu registo como Estudante de Graduação.',
      time: 'Há 3 horas',
      type: 'badge',
      badgeText: 'PROCESSADO',
      badgeClass: 'neutral'
    }
  ];

  // Footer Links
  footerLinks = {
    administracao: ['Manual do Curador', 'Auditoria de Acessos', 'Protocolos de Segurança'],
    institucional: ['Repositório Central', 'Parcerias Académicas', 'Publicações'],
    legal: ['Política de Privacidade', 'Termos de Utilização', 'Direitos de Propriedade']
  };

  getIconClass(icon: string): string {
    switch(icon) {
      case 'bordeaux': return 'icon-bordeaux';
      case 'success': return 'icon-success';
      case 'warning': return 'icon-warning';
      default: return 'icon-neutral';
    }
  }

  getBadgeClass(badgeClass: string): string {
    return badgeClass === 'success' ? 'badge-success' : 'badge-neutral';
  }
}