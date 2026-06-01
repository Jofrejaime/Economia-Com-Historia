import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { HeaderComponent } from '../../../components/header/header';
import { FooterComponent } from '../../../components/footer/footer';

interface Reply {
  id: number;
  author: string;
  authorInitials: string;
  authorRole: string;
  authorPosts: number;
  avatar: string;
  timeAgo: string;
  date: string;
  content: string;
  likes: number;
  isLiked: boolean;
}

interface RelatedTopic {
  title: string;
  replies: number;
  views: number;
}

@Component({
  selector: 'app-discussion-thread',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, HeaderComponent, FooterComponent],
  templateUrl: './discussion-thread.html',
  styleUrls: ['./discussion-thread.css']
})
export class DiscussionThreadComponent {
  replyText = '';
  showReplyForm = false;

  discussion = {
    id: 1,
    author: 'Jofre Jaime',
    authorInitials: 'JJ',
    authorRole: 'Investigador Sénior',
    authorPosts: 127,
    avatar: '#8b1e2d',
    category: 'ANÁLISE DE POLÍTICAS',
    categoryColor: { bg: '#acf0e0', text: '#003a32' },
    timeAgo: 'há 2 horas',
    date: '10 Mai 2026, 14:30',
    title: 'Análise da Reforma Monetária de 1976: A Transição do Kwanza',
    content: `Procuro fontes primárias sobre a logística da troca de moeda em 1976 nas províncias do leste. Especificamente, estou interessado em:

**Questões principais:**

1. Documentação sobre a implementação regional da reforma monetária
2. Relatórios de contagens regionais, especialmente de Moxico e Cuando Cubango
3. Correspondência entre o Banco Nacional de Angola e autoridades provinciais
4. Dados estatísticos sobre a circulação monetária durante o período de transição

Tenho consultado os arquivos do BNA mas a documentação para estas províncias específicas parece estar incompleta ou mal catalogada. Alguém da comunidade teve acesso a fontes primárias deste período?

Também estou interessado em saber se existem relatórios internos sobre os desafios logísticos enfrentados durante a implementação da reforma nas zonas rurais.

Agradeço antecipadamente qualquer orientação ou referências bibliográficas.`,
    replies: 12,
    views: 487,
    likes: 23,
    isLiked: false,
    isPinned: false,
  };

  replies: Reply[] = [
    {
      id: 1,
      author: 'Ana Correia',
      authorInitials: 'AC',
      authorRole: 'Professora Associada',
      authorPosts: 89,
      avatar: '#6b0119',
      timeAgo: 'há 1 hora',
      date: '10 Mai 2026, 15:30',
      content: `Olá Jofre, excelente questão de investigação!

Trabalhei recentemente com documentação similar para o meu estudo sobre políticas monetárias pós-coloniais. Posso sugerir algumas fontes que podem ser úteis:

1. **Arquivo Histórico do BNA** - Sala 3, Estante 12-B: Contém relatórios trimestrais de 1975-1977. Verifique especialmente o relatório Q4/1976.

2. **Biblioteca Nacional** - Secção de Economia: Tem uma colecção de correspondências oficiais entre Luanda e as províncias. Código de catalogação: ECO-MON-1976.

3. Também recomendo contactar a Dra. Isabel Fernandes na Universidade Agostinho Neto - ela tem investigado extensivamente este período.

Espero que ajude!`,
      likes: 15,
      isLiked: false,
    },
    {
      id: 2,
      author: 'Manuel Santos',
      authorInitials: 'MS',
      authorRole: 'Estudante de Doutoramento',
      authorPosts: 34,
      avatar: '#8b1e2d',
      timeAgo: 'há 45 min',
      date: '10 Mai 2026, 15:45',
      content: `Complementando a resposta da Ana, também sugiro verificar os arquivos digitalizados do Ministério das Finanças desse período.

Encontrei alguns documentos interessantes sobre a logística de distribuição da nova moeda. Posso partilhar as referências se precisar.

Uma observação: muita da documentação de Moxico foi transferida para Luanda em 1978 devido ao conflito armado, por isso pode estar arquivada sob códigos diferentes dos esperados.`,
      likes: 8,
      isLiked: true,
    },
    {
      id: 3,
      author: 'Isabel Fernandes',
      authorInitials: 'IF',
      authorRole: 'Investigadora Principal',
      authorPosts: 203,
      avatar: '#6b0119',
      timeAgo: 'há 30 min',
      date: '10 Mai 2026, 16:00',
      content: `Obrigada pela menção, Ana! 👋

Jofre, realmente tenho alguns documentos que podem interessar. Inclusive, tenho cópias digitalizadas de relatórios internos do BNA de 1976 que incluem dados de Moxico.

Podes contactar-me através do email institucional (ifernandes@uan.ao) e posso partilhar os PDFs.

Também estou a organizar um seminário sobre este tema no próximo mês - seria óptimo ter a tua perspectiva nesta discussão.`,
      likes: 19,
      isLiked: false,
    },
  ];

  relatedTopics: RelatedTopic[] = [
    { title: 'Documentos Fundadores do BNA', replies: 18, views: 612 },
    { title: 'Política Fiscal no Período Pós-Colonial', replies: 24, views: 891 },
    { title: 'Sistema Monetário Angolano (1975-1985)', replies: 15, views: 543 },
  ];

  constructor(private router: Router) {}

  handleSubmitReply(event: Event): void {
    event.preventDefault();
    if (!this.replyText.trim()) return;

    console.log('Nova resposta:', this.replyText);
    this.replyText = '';
    this.showReplyForm = false;
  }

  navigateTo(path: string): void {
    this.router.navigate([path]);
  }
}