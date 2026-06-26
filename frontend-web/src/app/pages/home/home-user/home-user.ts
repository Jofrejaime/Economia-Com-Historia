import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { HeaderComponent } from '../../../components/header/header';
import { FooterComponent } from '../../../components/footer/footer';
import { DocumentService, Document, DocumentCategory } from '../../../services/document.service';
import { QuizService, LeaderboardEntry } from '../../../services/quiz.service';
import { CommunityService, DiscussionTopic } from '../../../services/community.service';
import { AuthService } from '../../../services/auth.service';

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
    this.loadLeaderboard();
    this.loadDiscussions();
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
    } catch {}
    finally { this.cdr.detectChanges(); }
  }

  private async loadLeaderboard(): Promise<void> {
    try {
      const leaderboard = await this.quizService.getNationalLeaderboard();
      this.scholars = leaderboard.slice(0, 3);
    } catch {}
    finally { this.cdr.detectChanges(); }
  }

  private async loadDiscussions(): Promise<void> {
    try {
      const topics = await this.communityService.getTopics();
      this.discussions = topics.slice(0, 3);
    } catch {}
    finally { this.cdr.detectChanges(); }
  }

  getDocumentImage(doc: Document): string {
    return doc.cover_image_url ?? 'assets/images/document-placeholder.jpg';
  }

  getFeaturedImage(): string {
    return this.featuredDocument?.cover_image_url
      ?? 'https://images.unsplash.com/photo-1447069387593-a5de0862481e?w=1536&q=80';
  }

  getFormatLabel(type: string): string {
    const labels: Record<string, string> = {
      manuscript: 'MANUSCRITO', article: 'ARTIGO',
      report: 'RELATÓRIO', thesis: 'TESE', archive: 'ARQUIVO',
    };
    return labels[type] ?? type.toUpperCase();
  }

  formatReplies(count: number): string {
    return count === 1 ? '1 resposta' : `${count} respostas`;
  }

  getAvatarUrl(name: string): string {
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=8B1E2D&color=fff&size=48`;
  }

  navigateToContent(id: string): void { this.router.navigate(['/contents/view', id]); }
  navigateToCategory(id: string): void { this.router.navigate(['/forum/categoria', id]); }
  navigateToDiscussion(id: string): void { this.router.navigate(['/forum/community/discussao', id]); }
  navigateTo(path: string): void { this.router.navigate([path]); }
}