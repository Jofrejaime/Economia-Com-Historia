import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { HeaderComponent } from '../../../components/header/header';
import { FooterComponent } from '../../../components/footer/footer';
import { DocumentService } from '../../../services/document.service';
import { CommunityService } from '../../../services/community.service';
import { QuizService } from '../../../services/quiz.service';
import { firstValueFrom } from 'rxjs';

interface FeaturedContent {
  id: string;
  title: string;
  description: string;
  category: string;
  date: string;
  views: string;
  image: string;
  document_type: string;
  requires_subscription: boolean;
}

interface LeaderboardRow {
  name: string;
  specialty: string;
  points: string;
}

interface RecentDiscussion {
  id: string;
  title: string;
  author: string;
  authorInitials: string;
  avatarColor: string;
  replies: number;
  timeAgo: string;
}

@Component({
  selector: 'app-home-visitor',
  standalone: true,
  imports: [CommonModule, RouterModule, HeaderComponent, FooterComponent],
  templateUrl: './home-visitor.html',
  styleUrls: ['./home-visitor.css']
})
export class HomeVisitorComponent implements OnInit {
  featuredContents: FeaturedContent[] = [];
  leaderboard: LeaderboardRow[] = [];
  recentDiscussions: RecentDiscussion[] = [];
  isLoading = true;

  // ─── Modal de pedido de subscrição (categorias restritas) ────────────────
  accessModalDoc: FeaturedContent | null = null;
  accessRequesting = false;
  accessRequestDone = false;
  accessRequestError: string | null = null;

  constructor(
    private router: Router,
    private documentService: DocumentService,
    private communityService: CommunityService,
    private quizService: QuizService,
    private cdr: ChangeDetectorRef
  ) {}

  async ngOnInit(): Promise<void> {
    try {
      const [docs, scholars, topicsResult] = await Promise.all([
        this.documentService.getDocuments().catch(() => ({ data: [] } as any)),
        this.quizService.getNationalLeaderboardTop().catch(() => []),
        firstValueFrom(this.communityService.getTopics()).catch(() => ({ ok: false, data: null } as any)),
      ]);

      // Documentos em destaque (primeiros 4)
      const docList = Array.isArray(docs) ? docs : (docs?.data ?? []);
      this.featuredContents = docList.slice(0, 4).map((d: any) => ({
        id: d.id,
        title: d.title,
        description: d.summary ?? '',
        category: d.category_name ?? '—',
        date: this.formatDate(d.published_at ?? d.publication_date),
        views: this.formatViews(d.views_count ?? 0),
        image: d.cover_image_url ?? '',
        document_type: d.document_type ?? '',
        requires_subscription: d.category_requires_subscription === true,
      }));

      // Ranking (primeiros 5)
      this.leaderboard = scholars.slice(0, 5).map((s: any) => ({
        name: s.display_name,
        specialty: s.province ?? '—',
        points: this.formatNumber(s.total_points ?? 0),
      }));

      // Discussões recentes (primeiras 3)
      const topicList = topicsResult?.ok && topicsResult?.data ? topicsResult.data.data : [];
      this.recentDiscussions = topicList.slice(0, 3).map((t: any) => ({
        id: t.id,
        title: t.title,
        author: t.author?.display_name ?? '—',
        authorInitials: this.getInitials(t.author?.display_name ?? '?'),
        avatarColor: this.getAvatarColor(t.author_id ?? ''),
        replies: t.replies_count ?? 0,
        timeAgo: this.formatTimeAgo(t.created_at),
      }));
    } catch {
      // mantém arrays vazios
    } finally {
      this.isLoading = false;
      this.cdr.detectChanges();
    }
  }

  private formatDate(dateStr: string | null): string {
    if (!dateStr) return '—';
    return new Date(dateStr).toLocaleDateString('pt-PT', {
      day: '2-digit', month: 'short', year: 'numeric'
    });
  }

  private formatViews(n: number): string {
    return n >= 1000 ? `${(n / 1000).toFixed(1)}k` : `${n}`;
  }

  private formatNumber(n: number): string {
    return n.toLocaleString('pt-PT');
  }

  private getInitials(name: string): string {
    return name.split(' ').map(p => p[0]).slice(0, 2).join('').toUpperCase();
  }

  private getAvatarColor(id: string): string {
    return id.charCodeAt(0) % 2 === 0 ? '#8B1E2D' : '#6B0119';
  }

  private formatTimeAgo(dateStr: string): string {
    const diff  = Date.now() - new Date(dateStr).getTime();
    const hours = Math.floor(diff / 3_600_000);
    const days  = Math.floor(diff / 86_400_000);
    if (days > 0) return `${days} dia${days > 1 ? 's' : ''}`;
    if (hours > 0) return `${hours} hora${hours > 1 ? 's' : ''}`;
    return 'agora mesmo';
  }

  // ==========================================
  // ACESSO A CONTEÚDOS JINDUNGO / RESTRITOS
  // ==========================================

  /** Badge por conteúdo, decidido pela categoria (restrita → "Subscrição"). */
  getContentBadge(content: FeaturedContent): { label: string; bg: string; text: string } {
    if (content.requires_subscription === true) {
      return { label: 'Subscrição', bg: '#e0d4f7', text: '#3b1f6b' };
    }
    return { label: 'Público', bg: '#d1fae5', text: '#065f46' };
  }

  private needsAccessRequest(content: FeaturedContent): boolean {
    return content.requires_subscription === true;
  }

  navigateToContent(id: string): void {
    const content = this.featuredContents.find(c => c.id === id);

    if (content && this.needsAccessRequest(content)) {
      this.openAccessModal(content);
      return;
    }

    this.router.navigate(['/contents/view', id]);
  }

  openAccessModal(content: FeaturedContent): void {
    this.accessModalDoc = content;
    this.accessRequesting = false;
    this.accessRequestDone = false;
    this.accessRequestError = null;
    this.cdr.detectChanges();
    // Visitante não autenticado — não há verificação de status a fazer aqui,
    // o pedido só pode ser feito depois de iniciar sessão.
  }

  closeAccessModal(): void {
    this.accessModalDoc = null;
    this.accessRequesting = false;
    this.accessRequestDone = false;
    this.accessRequestError = null;
    this.cdr.detectChanges();
  }

  requestAccess(): void {
    // Visitante tem sempre de iniciar sessão antes de pedir acesso
    this.closeAccessModal();
    this.router.navigate(['/auth/login']);
  }

  navigateTo(path: string): void {
    this.router.navigate([path]);
  }
}