import { Component, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { HeaderComponent } from '../../../components/header/header';
import { FooterComponent } from '../../../components/footer/footer';
import { MarkdownPipe } from '../../../pipes/markdown.pipe';

interface Reply {
  id: number;
  parentId: number | null;
  authorId: number;
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
  id: number;
  title: string;
  replies: number;
  views: number;
}

@Component({
  selector: 'app-discussion-thread',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    HeaderComponent,
    FooterComponent,
    MarkdownPipe
  ],
  templateUrl: './discussion-thread.html',
  styleUrls: ['./discussion-thread.css']
})
export class DiscussionThreadComponent {
  replyText = '';
  showReplyForm = false;
  
  showReplyFormForReply: { [key: number]: boolean } = {};
  replyReplyText: { [key: number]: string } = {};

  // Controles para denúncia
  showReportDiscussionModal = false;
  showReportReplyModal = false;
  reportDiscussionReason = '';
  reportDiscussionDescription = '';
  reportReplyReason = '';
  reportReplyDescription = '';
  selectedReplyIndex: number | null = null;
  selectedReply: Reply | null = null;

  // Menu da discussão
  showDiscussionMenu = false;

  // Menu das respostas
  showReplyMenuIndex: number | null = null;

  // Modais de confirmação para eliminar
  showDeleteDiscussionModal = false;
  showDeleteReplyModal = false;
  deleteReplyIndex: number | null = null;

  discussion = {
    id: 1,
    authorId: 1,
    author: 'Jofre Jaime',
    authorInitials: 'JJ',
    authorRole: 'Investigador Sénior',
    authorPosts: 127,
    avatar: '#8b1e2d',
    categoryId: 1,
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
      parentId: null,
      authorId: 2,
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
      parentId: null,
      authorId: 3,
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
      parentId: 1,
      authorId: 4,
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
    {
      id: 4,
      parentId: 2,
      authorId: 5,
      author: 'Carlos Mendes',
      authorInitials: 'CM',
      authorRole: 'Arquivista',
      authorPosts: 56,
      avatar: '#8b1e2d',
      timeAgo: 'há 15 min',
      date: '10 Mai 2026, 16:15',
      content: `@Manuel Santos, excelente observação sobre a documentação de Moxico!

Confirmo que muitos documentos foram realmente transferidos em 1978. No arquivo, encontrei uma listagem de documentos transferidos que pode ajudar a localizar o que procura.

Posso disponibilizar a listagem digitalizada. O código de referência é: ARQ-BNA-1978-TRANSF-001.`,
      likes: 5,
      isLiked: false,
    },
  ];

  relatedTopics: RelatedTopic[] = [
    { id: 2, title: 'Documentos Fundadores do BNA e Política Fiscal Inicial', replies: 18, views: 612 },
    { id: 3, title: 'Política Fiscal no Período Pós-Colonial (1975-1985)', replies: 24, views: 891 },
    { id: 4, title: 'Sistema Monetário Angolano (1975-1985): Desafios e Reformas', replies: 15, views: 543 },
  ];

  constructor(private router: Router) {}

  // ===== NAVEGAÇÃO PARA TÓPICOS RELACIONADOS =====
  navigateToDiscussion(topicId: number): void {
    this.router.navigate(['/forum/community/discussao', topicId]);
  }

  // ===== OBTÉM AUTOR DA RESPOSTA PAI =====
  getReplyAuthor(parentId: number): string {
    const parent = this.replies.find(r => r.id === parentId);
    return parent ? parent.author : 'usuário';
  }

  // ===== RESPOSTAS =====
  handleSubmitReply(event: Event): void {
    event.preventDefault();
    if (!this.replyText.trim()) return;

    const newReply: Reply = {
      id: this.replies.length + 1,
      parentId: null,
      authorId: 0,
      author: 'Utilizador Atual',
      authorInitials: 'UA',
      authorRole: 'Membro da Comunidade',
      authorPosts: 0,
      avatar: '#8B1E2D',
      timeAgo: 'agora mesmo',
      date: new Date().toLocaleString(),
      content: this.replyText,
      likes: 0,
      isLiked: false,
    };

    this.replies.unshift(newReply);
    this.replyText = '';
    this.showReplyForm = false;
  }

  toggleReplyForm(index: number): void {
    this.showReplyFormForReply[index] = !this.showReplyFormForReply[index];
    if (this.showReplyFormForReply[index]) {
      this.replyReplyText[index] = '';
    }
  }

  handleReplyToReply(index: number, text: string): void {
    if (!text || !text.trim()) return;

    const parentReply = this.replies[index];
    const newReply: Reply = {
      id: this.replies.length + 1,
      parentId: parentReply.id,
      authorId: 0,
      author: 'Utilizador Atual',
      authorInitials: 'UA',
      authorRole: 'Membro da Comunidade',
      authorPosts: 0,
      avatar: '#8B1E2D',
      timeAgo: 'agora mesmo',
      date: new Date().toLocaleString(),
      content: `@${parentReply.author}: ${text}`,
      likes: 0,
      isLiked: false,
    };

    const insertIndex = this.replies.findIndex(r => r.id === parentReply.id);
    if (insertIndex !== -1) {
      this.replies.splice(insertIndex + 1, 0, newReply);
    } else {
      this.replies.push(newReply);
    }
    
    this.showReplyFormForReply[index] = false;
    this.replyReplyText[index] = '';
  }

  // ===== LIKES =====
  toggleLikeDiscussion(): void {
    this.discussion.isLiked = !this.discussion.isLiked;
    this.discussion.likes += this.discussion.isLiked ? 1 : -1;
  }

  toggleLikeReply(index: number): void {
    this.replies[index].isLiked = !this.replies[index].isLiked;
    this.replies[index].likes += this.replies[index].isLiked ? 1 : -1;
  }

  // ===== AÇÕES =====
  shareDiscussion(): void {
    console.log('Partilhar discussão');
  }

  // ===== MENU DA DISCUSSÃO =====
  toggleDiscussionMenu(event: Event): void {
    event.stopPropagation();
    this.showDiscussionMenu = !this.showDiscussionMenu;
    this.showReplyMenuIndex = null;
  }

  editDiscussion(): void {
    console.log('Editar discussão:', this.discussion.id);
    this.showDiscussionMenu = false;
  }

  // ===== MODAL DE CONFIRMAÇÃO PARA ELIMINAR DISCUSSÃO =====
  openDeleteDiscussionModal(): void {
    this.showDiscussionMenu = false;
    this.showDeleteDiscussionModal = true;
  }

  closeDeleteDiscussionModal(): void {
    this.showDeleteDiscussionModal = false;
  }

  confirmDeleteDiscussion(): void {
    console.log('Excluir discussão:', this.discussion.id);
    this.showDeleteDiscussionModal = false;
    // Aqui você pode adicionar a lógica de redirecionamento após eliminar
    // this.router.navigate(['/forum/community']);
  }

  // ===== MENU DAS RESPOSTAS =====
  toggleReplyMenu(index: number, event: Event): void {
    event.stopPropagation();
    this.showReplyMenuIndex = this.showReplyMenuIndex === index ? null : index;
    this.showDiscussionMenu = false;
  }

  editReply(index: number): void {
    console.log('Editar resposta:', this.replies[index].id);
    this.showReplyMenuIndex = null;
  }

  // ===== MODAL DE CONFIRMAÇÃO PARA ELIMINAR RESPOSTA =====
  openDeleteReplyModal(index: number): void {
    this.showReplyMenuIndex = null;
    this.deleteReplyIndex = index;
    this.showDeleteReplyModal = true;
  }

  closeDeleteReplyModal(): void {
    this.showDeleteReplyModal = false;
    this.deleteReplyIndex = null;
  }

  confirmDeleteReply(): void {
    if (this.deleteReplyIndex !== null) {
      console.log('Excluir resposta:', this.replies[this.deleteReplyIndex].id);
      this.replies.splice(this.deleteReplyIndex, 1);
      this.showDeleteReplyModal = false;
      this.deleteReplyIndex = null;
    }
  }

  // ===== FECHAR MENUS AO CLICAR FORA =====
  @HostListener('document:click', ['$event'])
  handleClickOutside(event: Event): void {
    const target = event.target as HTMLElement;
    
    if (!target.closest('.discussion-menu-wrapper')) {
      this.showDiscussionMenu = false;
    }
    
    if (!target.closest('.reply-menu-wrapper')) {
      this.showReplyMenuIndex = null;
    }
  }

  // ===== DENÚNCIAS =====
  openReportDiscussionModal(): void {
    this.showReportDiscussionModal = true;
    this.reportDiscussionReason = '';
    this.reportDiscussionDescription = '';
  }

  closeReportDiscussionModal(): void {
    this.showReportDiscussionModal = false;
    this.reportDiscussionReason = '';
    this.reportDiscussionDescription = '';
  }

  submitReportDiscussion(): void {
    if (!this.reportDiscussionReason) return;
    
    console.log('Denúncia de Discussão:', {
      discussionId: this.discussion.id,
      title: this.discussion.title,
      reason: this.reportDiscussionReason,
      description: this.reportDiscussionDescription
    });
    
    alert('Denúncia enviada com sucesso! A equipa de moderação irá analisar.');
    this.closeReportDiscussionModal();
  }

  openReportReplyModal(index: number): void {
    this.selectedReplyIndex = index;
    this.selectedReply = this.replies[index];
    this.showReportReplyModal = true;
    this.reportReplyReason = '';
    this.reportReplyDescription = '';
  }

  closeReportReplyModal(): void {
    this.showReportReplyModal = false;
    this.selectedReplyIndex = null;
    this.selectedReply = null;
    this.reportReplyReason = '';
    this.reportReplyDescription = '';
  }

  submitReportReply(): void {
    if (!this.reportReplyReason || this.selectedReplyIndex === null) return;
    
    console.log('Denúncia de Resposta:', {
      replyId: this.selectedReply?.id,
      author: this.selectedReply?.author,
      content: this.selectedReply?.content,
      reason: this.reportReplyReason,
      description: this.reportReplyDescription
    });
    
    alert('Denúncia enviada com sucesso! A equipa de moderação irá analisar.');
    this.closeReportReplyModal();
  }

  // ===== NAVEGAÇÃO GERAL =====
  navigateTo(path: string): void {
    this.router.navigate([path]);
  }
}