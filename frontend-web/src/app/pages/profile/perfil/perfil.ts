import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { HeaderComponent } from '../../../components/header/header';
import { FooterComponent } from '../../../components/footer/footer';
import { ContentCardComponent } from '../../auth/content-card/content-card';

interface Merit {
  iconPath: string;
  iconViewBox: string;
  title: string;
  description: string[];
  id?: string;
  progress?: string;
  isActive: boolean;
}

interface Content {
  id: number;
  title: string;
  type: string;
  date: string;
  views: number;
  category: string;
  description: string;
  author: string;
}

@Component({
  selector: 'app-perfil',
  standalone: true,
  imports: [CommonModule, RouterModule, HeaderComponent, FooterComponent, ContentCardComponent],
  templateUrl: './perfil.html',
  styleUrls: ['./perfil.css']
})
export class PerfilComponent {
  // Dados do perfil
  profileName = 'Dr. José Ndele';
  profileStatus = 'ESTATUTO ACADÉMICO: INVESTIGADOR SÉNIOR';
  profileBio = [
    'Principal contribuidor do Repositório de Moeda do Século XIX. Especialista em transições',
    'macroeconómicas do centro comercial de Luanda. Atualmente a perseguir a distinção',
    '"Arquivo de Ouro".'
  ];
  

  // Estatísticas
  stats = [
    { label: 'PONTUAÇÃO ACADÉMICA TOTAL', value: '12.450', unit: 'pts', color: '#6b0119', progress: 75 },
    { label: 'QUESTIONÁRIOS CONCLUÍDOS', value: '142', unit: 'de 200 marcos históricos', color: '#8b1e2d', progress: 71 },
    { label: 'POSIÇÃO GLOBAL DE PERÍODO', value: '#12', subtext: 'MELHORES DO PERÍODO', rankBadge: 'Quadro do Sector XX', color: 'white', bgColor: '#8b1e2d', progress: null },
    { label: 'CERTIFICAÇÕES PARA A ÊNFASE', value: '28', unit: 'validações do arquivo', color: '#574142', progress: null }
  ];

  // Méritos e Distinções
   merits: Merit[] = [
    {
      iconPath: 'M12 2L15 8.5L22 9.5L17 14L18.5 21L12 17.5L5.5 21L7 14L2 9.5L9 8.5L12 2Z',
      iconViewBox: '0 0 24 24',
      title: 'Mestre da Moeda',
      description: ['Atribuído por completar o percurso completo da história monetária do século XVIII.'],
      id: 'AEA-4492-X',
      isActive: true
    },
    {
      iconPath: 'M4 4H20V20H4V4Z M8 8H16V16H8V8Z',
      iconViewBox: '0 0 24 24',
      title: 'Arquivista Principal',
      description: ['Reconhecido por contribuir com mais de 20 fontes primárias para o repositório.'],
      id: 'AEA-1102-A',
      isActive: true
    },
    {
      iconPath: 'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2Z M12 6V12L16 14',
      iconViewBox: '0 0 24 24',
      title: 'Ligação Institucional',
      description: ['Estabelecer 5 ligações institucionais dentro da rede do Arquivo.'],
      progress: 'EM PROGRESSO: 3/5',
      isActive: false
    },
    {
      iconPath: 'M9 12L11 14L15 10M21 12C21 16.97 16.97 21 12 21C7.03 21 3 16.97 3 12C3 7.03 7.03 3 12 3C16.97 3 21 7.03 21 12Z',
      iconViewBox: '0 0 24 24',
      title: 'Verificador de Factos Prata',
      description: ['Rever 50 submissões da comunidade com uma taxa de verificação de 95%.'],
      progress: 'EM PROGRESSO: 12/50',
      isActive: false
    }
  ];

  // Configurações de conta
  settings = {
    privacy: [
      { label: 'Perfil Académico Público', checked: true },
      { label: 'Autenticação de Dois Factores', checked: false }
    ],
    notifications: [
      { label: 'Atualizações do Arquivo', checked: true },
      { label: 'Menções de Pares', checked: true }
    ]
  };

  // Conteúdos criados
  userContents: Content[] = [
    {
      id: 1,
      title: 'Análise do Sistema Monetário de Luanda no Século XVIII',
      type: 'Artigo Académico',
      date: '15 de Março, 2026',
      views: 1245,
      category: 'História Económica',
      description: 'Estudo detalhado sobre as transformações monetárias e econômicas do sistema de comércio em Luanda durante o século XVIII.',
      author: 'Dr. José Ndele'
    },
    {
      id: 2,
      title: 'Transições Macroeconómicas no Centro Comercial',
      type: 'Documento de Pesquisa',
      date: '2 de Fevereiro, 2026',
      views: 892,
      category: 'Economia',
      description: 'Análise das mudanças estruturais nos principais centros de comércio e seu impacto na economia regional.',
      author: 'Dr. José Ndele'
    },
    {
      id: 3,
      title: 'Repositório de Moeda do Século XIX - Vol. 3',
      type: 'Compilação Histórica',
      date: '10 de Janeiro, 2026',
      views: 2103,
      category: 'Numismática',
      description: 'Terceiro volume da compilação histórica de moedas circuladas em território angolano no século XIX.',
      author: 'Dr. José Ndele'
    },
    {
      id: 4,
      title: 'Influências Comerciais nas Políticas Monetárias Coloniais',
      type: 'Artigo Académico',
      date: '18 de Dezembro, 2025',
      views: 756,
      category: 'História Económica',
      description: 'Investigação sobre como as rotas comerciais influenciaram as decisões de política monetária durante o período colonial.',
      author: 'Dr. José Ndele'
    },
    {
      id: 5,
      title: 'Metodologia de Catalogação para Arquivos Históricos',
      type: 'Guia Metodológico',
      date: '5 de Novembro, 2025',
      views: 1567,
      category: 'Arquivologia',
      description: 'Guia completo para catalogação e preservação de documentos históricos em arquivos digitais e físicos.',
      author: 'Dr. José Ndele'
    },
    {
      id: 6,
      title: 'Redes Comerciais do Atlântico Sul: Uma Perspectiva Angolana',
      type: 'Artigo Académico',
      date: '22 de Outubro, 2025',
      views: 1834,
      category: 'História Comercial',
      description: 'Mapeamento das principais rotas e redes comerciais que conectavam Angola ao comércio transatlântico.',
      author: 'Dr. José Ndele'
    },
  ];

  constructor(private router: Router) {}

  navigateTo(path: string): void {
    this.router.navigate([path]);
  }

  editBio(): void {
    console.log('Editar bio académica');
  }

  downloadPortfolio(): void {
    console.log('Descarregar portfólio');
  }

  deactivateAccount(): void {
    console.log('Desativar conta');
  }

  toggleSetting(settingType: string, index: number): void {
    if (settingType === 'privacy') {
      this.settings.privacy[index].checked = !this.settings.privacy[index].checked;
    } else if (settingType === 'notifications') {
      this.settings.notifications[index].checked = !this.settings.notifications[index].checked;
    }
  }
}