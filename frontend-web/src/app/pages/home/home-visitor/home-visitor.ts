import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { HeaderComponent } from '../../../components/header/header';
import { FooterComponent } from '../../../components/footer/footer';
import { DocumentService } from '../../../services/document.service';
import { CommunityService } from '../../../services/community.service';
import { QuizService } from '../../../services/quiz.service';

interface FeaturedContent {
  id: string; title: string; description: string;
  category: string; date: string; views: string; image: string;
}

interface LeaderboardRow {
  name: string; specialty: string; points: string;
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
  isLoading = false;

  constructor(
    private router: Router,
    private documentService: DocumentService,
    private communityService: CommunityService,
    private quizService: QuizService,
    private cdr: ChangeDetectorRef
  ) {}

  async ngOnInit(): Promise<void> {
    this.loadContents();
    this.loadLeaderboard();
  }

  private async loadContents(): Promise<void> {
    try {
      const docs = await this.documentService.getDocuments().catch(() => ({ data: [] } as any));
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
    } catch {}
    finally { this.cdr.detectChanges(); }
  }

  private async loadLeaderboard(): Promise<void> {
    try {
      const scholars = await this.quizService.getNationalLeaderboard().catch(() => []);
      this.leaderboard = scholars.slice(0, 5).map((s: any) => ({
        name: s.display_name,
        specialty: s.province ?? '—',
        points: this.formatNumber(s.total_points ?? 0),
      }));
    } catch {}
    finally { this.cdr.detectChanges(); }
  }

  private formatDate(dateStr: string | null): string {
    if (!dateStr) return '—';
    return new Date(dateStr).toLocaleDateString('pt-PT', { day: '2-digit', month: 'short', year: 'numeric' });
  }

  private formatViews(n: number): string {
    return n >= 1000 ? `${(n / 1000).toFixed(1)}k` : `${n}`;
  }

  private formatNumber(n: number): string {
    return n.toLocaleString('pt-PT');
  }

  navigateTo(path: string): void {
    this.router.navigate([path]);
  }
}