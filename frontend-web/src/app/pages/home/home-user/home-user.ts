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

  isAuthenticated = false;

  // ─── Modal de pedido de subscrição (categorias restritas) ────────────────
  accessModalDoc: Document | null = null;
  accessRequesting = false;
  accessRequestDone = false;
  accessRequestError: string | null = null;

  private documentTypeLabelsMap: Record<string, string> = {
    manuscript: 'Manuscrito',
    article:    'Artigo',
    report:     'Relatório',
    thesis:     'Tese',
    archive:    'Arquivo',
  };

  constructor(
    private router: Router,
    private documentService: DocumentService,
    private quizService: QuizService,
    private communityService: CommunityService,
    private authService: AuthService,
    private cdr: ChangeDetectorRef
  ) {}

  async ngOnInit(): Promise<void> {
    this.isAuthenticated = this.authService.isAuthenticated();
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

  /** Rótulo do tipo de conteúdo, derivado do ficheiro (media_type): Texto/Vídeo/Podcast. */
  getContentTypeLabel(mediaType: string | null | undefined): string {
    const t = (mediaType || 'TEXT').toUpperCase();
    if (t === 'VIDEO') return 'VÍDEO';
    if (t === 'AUDIO') return 'PODCAST';
    if (t === 'IMAGE') return 'IMAGEM';
    return 'TEXTO';
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

  // ==========================================
  // ACESSO A CONTEÚDOS JINDUNGO / RESTRITOS
  // ==========================================

  /** Badge por documento, decidido pela categoria (restrita → "Subscrição"). */
  getDocBadge(doc: Document): { label: string; bg: string; text: string } {
    if (doc.category?.requires_subscription === true) {
      return { label: 'Subscrição', bg: '#e0d4f7', text: '#3b1f6b' };
    }
    return { label: 'Público', bg: '#d1fae5', text: '#065f46' };
  }

  private needsAccessRequest(doc: Document): boolean {
    if (doc.category?.requires_subscription !== true) {
      return false;
    }
    const anyDoc = doc as any;
    if (anyDoc.has_access === true || anyDoc.is_subscribed === true) {
      return false;
    }
    const role = (this.authService.getUser() as any)?.role;
    if (role === 'admin') return false;

    return true;
  }

  navigateToContent(id: string): void {
    const doc =
      this.documents.find(d => d.id === id) ??
      (this.featuredDocument?.id === id ? this.featuredDocument : null);

    if (doc && this.needsAccessRequest(doc)) {
      this.openAccessModal(doc);
      return;
    }

    this.router.navigate(['/contents/view', id]);
  }

  openAccessModal(doc: Document): void {
    this.accessModalDoc = doc;
    this.accessRequesting = false;
    this.accessRequestDone = false;
    this.accessRequestError = null;
    this.cdr.detectChanges();

    if (this.isAuthenticated) {
      this.documentService.getSubscriptionStatus(doc.id)
        .then((res: any) => {
          const status = String(res?.data?.status ?? res?.status ?? '').toLowerCase();
          if (status === 'pending') {
            this.accessRequestDone = true;
          } else if (status === 'approved' || status === 'active') {
            (doc as any).is_subscribed = true;
            this.closeAccessModal();
            this.router.navigate(['/contents/view', doc.id]);
            return;
          }
          this.cdr.detectChanges();
        })
        .catch(() => { /* sem status conhecido — mantém o fluxo normal */ });
    }
  }

  closeAccessModal(): void {
    this.accessModalDoc = null;
    this.accessRequesting = false;
    this.accessRequestDone = false;
    this.accessRequestError = null;
    this.cdr.detectChanges();
  }

  async requestAccess(): Promise<void> {
    if (!this.accessModalDoc || this.accessRequesting) return;

    if (!this.isAuthenticated) {
      this.closeAccessModal();
      this.router.navigate(['/auth/login']);
      return;
    }

    this.accessRequesting = true;
    this.accessRequestError = null;
    this.cdr.detectChanges();

    try {
      await this.documentService.subscribeDocument(this.accessModalDoc.id);
      this.accessRequestDone = true;
      (this.accessModalDoc as any).is_subscribed = true;
    } catch (err: any) {
      if (err?.status === 409) {
        this.accessRequestDone = true;
        (this.accessModalDoc as any).is_subscribed = true;
      } else {
        this.accessRequestError = err?.error?.message ?? 'Erro ao enviar o pedido de acesso. Tente novamente.';
      }
    } finally {
      this.accessRequesting = false;
      this.cdr.detectChanges();
    }
  }

  navigateToCategory(id: string): void {
    this.router.navigate(['/contents'], { queryParams: { category_id: id } });
  }
  navigateToDiscussion(id: string): void { this.router.navigate(['/forum/community/discussao', id]); }
  navigateTo(path: string): void { this.router.navigate([path]); }
}