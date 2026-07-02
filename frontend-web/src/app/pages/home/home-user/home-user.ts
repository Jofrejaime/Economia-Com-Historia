import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { HeaderComponent } from '../../../components/header/header';
import { FooterComponent } from '../../../components/footer/footer';
import { DocumentService, Document, DocumentCategory } from '../../../services/document.service';
import { QuizService, LeaderboardEntry } from '../../../services/quiz.service';
import { CommunityService, DiscussionTopic } from '../../../services/community.service';
import { AuthService } from '../../../services/auth.service';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-home-user',
  standalone: true,
  imports: [CommonModule, HeaderComponent, FooterComponent],
  templateUrl: './home-user.html',
  styleUrls: ['./home-user.css']
})
export class HomeUser implements OnInit {

  documents: Document[] = [];
  categories: DocumentCategory[] = [];
  discussions: DiscussionTopic[] = [];
  scholars: LeaderboardEntry[] = [];
  featuredDocument: Document | null = null;

  constructor(
    private router: Router,
    private documentService: DocumentService,
    private quizService: QuizService,
    private communityService: CommunityService,
    private authService: AuthService,
    private cdr: ChangeDetectorRef
  ) {}

  async ngOnInit(): Promise<void> {
    this.loadDocs();
    this.loadDiscussions();
    this.loadLeaderboard();
  }

  private async loadDocs(): Promise<void> {
    try {
      const [docs, cats] = await Promise.all([
        this.documentService.getDocuments(),
        this.documentService.getCategories(),
      ]);
      this.documents = docs.slice(0, 4);
      this.featuredDocument = docs[0] ?? null;
      this.categories = cats;
    } catch {
      // falha silenciosa
    } finally {
      this.cdr.detectChanges();
    }
  }

  private async loadDiscussions(): Promise<void> {
    try {
      const topicsResult = await firstValueFrom(this.communityService.getTopics());
      this.discussions = topicsResult.ok && topicsResult.data
        ? topicsResult.data.data.slice(0, 3)
        : [];
    } catch {
      // falha silenciosa
    } finally {
      this.cdr.detectChanges();
    }
  }

  private async loadLeaderboard(): Promise<void> {
    try {
      const leaderboard = await this.quizService.getNationalLeaderboard();
      this.scholars = leaderboard.slice(0, 3);
    } catch {
      // falha silenciosa
    } finally {
      this.cdr.detectChanges();
    }
  }

  hasDocumentImage(doc: Document): boolean {
    return !!doc.cover_image_url?.trim();
  }

  getDocumentImage(doc: Document): string {
    return doc.cover_image_url ?? '';
  }

  hasFeaturedImage(): boolean {
    return !!this.featuredDocument?.cover_image_url?.trim();
  }

  getFeaturedImage(): string {
    return this.featuredDocument?.cover_image_url ?? '';
  }

  getFormatLabel(type: string): string {
    const labels: Record<string, string> = {
      manuscript: 'MANUSCRITO',
      article: 'ARTIGO',
      report: 'RELATÓRIO',
      thesis: 'TESE',
      archive: 'ARQUIVO',
    };
    return labels[type] ?? type.toUpperCase();
  }

  formatReplies(count: number): string {
    return count === 1 ? '1 resposta' : `${count} respostas`;
  }

  getInitials(name: string): string {
    return name.split(' ').map(n => n[0]).filter(Boolean).slice(0, 2).join('').toUpperCase();
  }

  getAvatarColor(name: string): string {
    return name.charCodeAt(0) % 2 === 0 ? '#8b1e2d' : '#6b0119';
  }

  navigateToContent(id: string): void { this.router.navigate(['/contents/view', id]); }
  navigateToCategory(id: string): void {
    this.router.navigate(['/contents'], { queryParams: { category_id: id } });
  }
  navigateToDiscussion(id: string): void { this.router.navigate(['/forum/community/discussao', id]); }
  navigateTo(path: string): void { this.router.navigate([path]); }
}