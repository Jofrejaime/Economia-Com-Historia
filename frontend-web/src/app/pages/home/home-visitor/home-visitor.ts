import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { HeaderComponent } from '../../../components/header/header';
import { FooterComponent } from '../../../components/footer/footer';
import { DocumentService } from '../../../services/document.service';
import { CommunityService } from '../../../services/community.service';
import { QuizService } from '../../../services/quiz.service';

interface FeaturedContent {
  id: string;
  title: string;
  description: string;
  category: string;
  date: string;
  views: string;
  image: string;
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

  constructor(
    private router: Router,
    private documentService: DocumentService,
    private communityService: CommunityService,
    private quizService: QuizService
  ) {}

  async ngOnInit(): Promise<void> {
    try {
      const [docs, scholars, topics] = await Promise.all([
        this.documentService.getDocuments().catch(() => ({ data: [] } as any)),
        this.quizService.getNationalLeaderboard().catch(() => []),
        this.communityService.getTopics().catch(() => []),
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
        image: d.cover_image_url ?? 'assets/images/default-doc.jpg',
      }));

      // Ranking (primeiros 5)
      this.leaderboard = scholars.slice(0, 5).map((s: any) => ({
        name: s.display_name,
        specialty: s.province ?? '—',
        points: this.formatNumber(s.total_points ?? 0),
      }));

      // Discussões recentes (primeiras 3)
      this.recentDiscussions = topics.slice(0, 3).map((t: any) => ({
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

  navigateTo(path: string): void {
    this.router.navigate([path]);
  }
}