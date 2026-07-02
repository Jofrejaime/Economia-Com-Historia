import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule, ActivatedRoute } from '@angular/router';
import { HeaderComponent } from '../../../components/header/header';
import { FooterComponent } from '../../../components/footer/footer';
import {
  DocumentService,
  DocumentDetail,
  Document,
  RelatedQuiz,
  RelatedTopic,
} from '../../../services/document.service';
import { AuthService } from '../../../services/auth.service';

type MediaKind = 'text' | 'image' | 'audio' | 'video' | 'pdf';

@Component({
  selector: 'app-contents-view',
  standalone: true,
  imports: [CommonModule, RouterModule, HeaderComponent, FooterComponent],
  templateUrl: './contents-view.html',
  styleUrls: ['./contents-view.css']
})
export class ContentsViewComponent implements OnInit {
  doc: DocumentDetail | null = null;
  error: string | null = null;
  isAuthenticated = false;

  // Relacionados — carregados em paralelo, sem bloquear o render do documento principal
  relatedContents: Document[] = [];
  relatedQuizzes: RelatedQuiz[] = [];
  relatedTopics: RelatedTopic[] = [];
  loadingRelated = true;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private documentService: DocumentService,
    private authService: AuthService,
    private cdr: ChangeDetectorRef
  ) {}

  async ngOnInit(): Promise<void> {
    this.isAuthenticated = this.authService.isAuthenticated();
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) {
      this.router.navigate(['/contents']);
      return;
    }
    await this.loadDocument(id);
  }

  private async loadDocument(id: string): Promise<void> {
    try {
      this.doc = await this.documentService.getDocument(id);
      this.cdr.detectChanges();
      // Não bloqueia o ecrã principal à espera dos relacionados
      this.loadRelated(id);
    } catch (err: any) {
      this.error = err?.message ?? 'Erro ao carregar documento.';
      this.cdr.detectChanges();
    }
  }

  private async loadRelated(id: string): Promise<void> {
    this.loadingRelated = true;
    try {
      const [quizzes, topics, contents] = await Promise.all([
        this.documentService.getRelatedQuizzes(id),
        this.documentService.getRelatedTopics(id),
        this.loadRelatedContents(id),
      ]);
      this.relatedQuizzes = quizzes;
      this.relatedTopics = topics;
      this.relatedContents = contents;
    } finally {
      this.loadingRelated = false;
      this.cdr.detectChanges();
    }
  }

  /** Conteúdos relacionados = mesma categoria, excluindo o próprio documento. */
  private async loadRelatedContents(id: string): Promise<Document[]> {
    if (!this.doc?.category_id) return [];
    try {
      const docs = await this.documentService.getDocuments({ category_id: this.doc.category_id });
      return docs.filter(d => d.id !== id).slice(0, 4);
    } catch {
      return [];
    }
  }

  // ─── Tipo de media (para renderização condicional na secção "Conteúdo") ──

  get mediaKind(): MediaKind {
    const type = (this.doc?.media_type ?? '').toUpperCase();
    if (type === 'AUDIO') return 'audio';
    if (type === 'VIDEO') return 'video';
    if (type === 'PDF') return 'pdf';
    if (type === 'IMAGE') return 'image';
    return 'text';
  }

  get mediaUrl(): string | null {
    return this.doc?.media_url ?? this.doc?.pdf_url ?? null;
  }

  // ─── Acções sobre o documento (já existentes) ─────────────────────────────

  async toggleLike(): Promise<void> {
    if (!this.doc) return;
    if (!this.isAuthenticated) {
      this.router.navigate(['/auth/login']);
      return;
    }
    try {
      if (this.doc.is_liked) {
        await this.documentService.unlikeDocument(this.doc.id);
        this.doc.is_liked = false;
        this.doc.likes_count--;
      } else {
        await this.documentService.likeDocument(this.doc.id);
        this.doc.is_liked = true;
        this.doc.likes_count++;
      }
      this.cdr.detectChanges();
    } catch {}
  }

  async toggleFavorite(): Promise<void> {
    if (!this.doc) return;
    if (!this.isAuthenticated) {
      this.router.navigate(['/auth/login']);
      return;
    }
    try {
      if (this.doc.is_favorited) {
        await this.documentService.unfavoriteDocument(this.doc.id);
        this.doc.is_favorited = false;
      } else {
        await this.documentService.favoriteDocument(this.doc.id);
        this.doc.is_favorited = true;
      }
      this.cdr.detectChanges();
    } catch {}
  }

  async onDownload(): Promise<void> {
    if (!this.doc) return;
    if (!this.isAuthenticated) {
      this.router.navigate(['/auth/login']);
      return;
    }
    try {
      const pdfUrl = await this.documentService.downloadDocument(this.doc.id);
      const url = pdfUrl ?? this.doc.pdf_url;
      if (url) window.open(url, '_blank');
    } catch {}
  }

  // ─── Navegação para relacionados ──────────────────────────────────────────

  navigateToDocument(id: string): void {
    this.router.navigate(['/contents/view', id]);
  }

  /**
   * ⚠️ Assunção: QuestionQuizComponent (rota /quiz/pergunta) lê o quiz a
   * realizar a partir do query param "quizId". Se o componente usar outro
   * mecanismo (ex.: estado do router, serviço de "quiz actual"), ajustar aqui.
   */
  navigateToQuiz(quizId: string): void {
    if (!this.isAuthenticated) {
      this.router.navigate(['/auth/login']);
      return;
    }
    this.router.navigate(['/quiz/pergunta'], { queryParams: { quizId } });
  }

  navigateToTopic(topicId: string): void {
    this.router.navigate(['/forum/community/discussao', topicId]);
  }

  /**
   * ⚠️ Assunção: CreateTopicComponent lê o query param "documentId" e, se
   * presente, submete via POST /documents/{id}/topics em vez de POST /topics.
   * Se o componente ainda não tratar este caso, é a peça que falta lá.
   */
  navigateToCreateTopicForDocument(): void {
    if (!this.isAuthenticated) {
      this.router.navigate(['/auth/login']);
      return;
    }
    if (!this.doc) return;
    this.router.navigate(['/forum/comunidade/criar-topico'], {
      queryParams: { documentId: this.doc.id },
    });
  }

  navigateTo(path: string): void {
    this.router.navigate([path]);
  }

  // ─── Helpers de apresentação (já existentes) ──────────────────────────────

  hasDocumentImage(): boolean {
    return !!this.doc?.cover_image_url?.trim();
  }

  getDocumentImage(): string {
    return this.doc?.cover_image_url ?? '';
  }

  getAcademicLevelLabel(): string {
    switch (this.doc?.academic_level) {
      case 'intro':     return 'Introdutório';
      case 'advanced':  return 'Investigação Avançada';
      case 'doctorate': return 'Arquivo de Doutoramento';
      default:          return '—';
    }
  }

  getDifficultyLabel(difficulty: string): string {
    return difficulty || '—';
  }

  formatDate(date: string | null): string {
    if (!date) return '—';
    return new Date(date).toLocaleDateString('pt-PT', {
      day: 'numeric', month: 'long', year: 'numeric'
    });
  }

  formatTimeAgo(dateStr: string): string {
    const diff  = Date.now() - new Date(dateStr).getTime();
    const days  = Math.floor(diff / 86_400_000);
    const hours = Math.floor(diff / 3_600_000);
    if (days > 0)  return `há ${days} dia${days > 1 ? 's' : ''}`;
    if (hours > 0) return `há ${hours} hora${hours > 1 ? 's' : ''}`;
    return 'há instantes';
  }
}