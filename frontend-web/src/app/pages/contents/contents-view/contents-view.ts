import { Component, OnInit, ChangeDetectorRef, DestroyRef } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CommonModule } from '@angular/common';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { Router, RouterModule, ActivatedRoute } from '@angular/router';
import { HeaderComponent } from '../../../components/header/header';
import { FooterComponent } from '../../../components/footer/footer';
import {
  DocumentService,
  DocumentDetail,
  DocumentMediaItem,
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

  // ─── Acesso negado (403 do backend) ───────────────────────────────────────
  // O denyDocumentAccess() do backend devolve { message, subscription_required }.
  // O acesso a documentos restritos é sempre por subscrição por-documento
  // (POST /documents/{id}/subscribe → admin aprova).
  accessDenied = false;
  subscriptionRequired = false;
  accessRequesting = false;
  accessRequestDone = false;
  accessRequestError: string | null = null;
  private docId: string | null = null;

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
    private sanitizer: DomSanitizer,
    private cdr: ChangeDetectorRef,
    private destroyRef: DestroyRef
  ) {}

  ngOnInit(): void {
    this.isAuthenticated = this.authService.isAuthenticated();

    // Ao navegar entre dois documentos (ex.: a partir de "Conteúdos
    // Relacionados"), a rota /contents/view/:id é a mesma configuração —
    // o Angular reaproveita esta instância do componente em vez de a
    // recriar, pelo que ngOnInit() só corre uma vez. Sem esta subscrição a
    // paramMap, um clique num relacionado mudava o URL mas nunca recarregava
    // o documento novo. takeUntilDestroyed() precisa do DestroyRef explícito
    // porque ngOnInit() não é um contexto de injecção (ao contrário do
    // construtor) — sem isto, lançava NG0203 e o componente nunca chegava a
    // renderizar.
    this.route.paramMap.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((params) => {
      const id = params.get('id');
      if (!id) {
        this.router.navigate(['/contents']);
        return;
      }
      this.resetForNewDocument();
      void this.loadDocument(id);
    });
  }

  /** Limpa o estado do documento anterior antes de carregar o seguinte. */
  private resetForNewDocument(): void {
    this.doc = null;
    this.error = null;
    this.accessDenied = false;
    this.subscriptionRequired = false;
    this.accessRequesting = false;
    this.accessRequestDone = false;
    this.accessRequestError = null;
    this.relatedContents = [];
    this.relatedQuizzes = [];
    this.relatedTopics = [];
    this.loadingRelated = true;
    this.cdr.detectChanges();
  }

  private async loadDocument(id: string): Promise<void> {
    this.docId = id;
    try {
      this.doc = await this.documentService.getDocument(id);
      this.cdr.detectChanges();
      // Não bloqueia o ecrã principal à espera dos relacionados
      this.loadRelated(id);
    } catch (err: any) {
      if (err?.status === 403) {
        // Sem acesso — apanha tanto entradas pela listagem como deep links
        // (link partilhado, favoritos, histórico do browser).
        this.accessDenied = true;
        this.subscriptionRequired = err?.error?.subscription_required === true;

        // Se for subscrição e o utilizador estiver autenticado, verifica em
        // background se já existe um pedido pendente — evita pedido duplicado
        // e mostra logo o estado "pedido enviado".
        if (this.subscriptionRequired && this.isAuthenticated) {
          this.checkExistingSubscription(id);
        }
      } else if (err?.status === 404) {
        this.error = 'Documento não encontrado.';
      } else {
        this.error = 'Erro ao carregar documento.';
      }
      this.cdr.detectChanges();
    }
  }

  private async checkExistingSubscription(id: string): Promise<void> {
    try {
      const res = await this.documentService.getSubscriptionStatus(id);
      if (String(res?.status ?? '').toUpperCase() === 'PENDING') {
        this.accessRequestDone = true;
        this.cdr.detectChanges();
      }
    } catch { /* sem status conhecido — mantém o fluxo normal */ }
  }

  /**
   * Envia o pedido de subscrição do documento (fluxo do 403 restrito).
   */
  async requestAccess(): Promise<void> {
    if (!this.docId || this.accessRequesting) return;

    // Visitantes têm de iniciar sessão antes de pedir acesso
    if (!this.isAuthenticated) {
      this.router.navigate(['/auth/login']);
      return;
    }

    this.accessRequesting = true;
    this.accessRequestError = null;
    this.cdr.detectChanges();

    try {
      // O backend nunca devolve erro para duplicados: responde 200 com
      // already_exists quando já há pedido ACTIVE/PENDING.
      await this.documentService.subscribeDocument(this.docId);
      this.accessRequestDone = true;
    } catch (err: any) {
      if (err?.status === 409 || err?.status === 422) {
        // já tinha um pedido — trata como sucesso
        this.accessRequestDone = true;
      } else {
        this.accessRequestError = err?.error?.message
          ?? 'Erro ao enviar o pedido de acesso. Tente novamente.';
      }
    } finally {
      this.accessRequesting = false;
      this.cdr.detectChanges();
    }
  }

  /** Label para o cartão de acesso negado. */
  getRequiredAccessLabel(): string {
    return 'com Subscrição';
  }

  goBackToContents(): void {
    this.router.navigate(['/contents']);
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

  /**
   * URL do PDF já sanitizado para uso no `src` de um <iframe>. O Angular
   * bloqueia strings simples em contexto de resource URL (iframe/embed) e
   * lança durante o change detection — o que era apanhado pelo catch do
   * loadDocument e mostrava "Erro ao carregar documento" em qualquer PDF.
   */
  get safeMediaUrl(): SafeResourceUrl | null {
    const url = this.mediaUrl;
    return url ? this.sanitizer.bypassSecurityTrustResourceUrl(url) : null;
  }

  /**
   * Divide o conteúdo em parágrafos (por linhas em branco ou quebras simples),
   * para leitura com separação real de parágrafos em vez de um bloco único.
   */
  get contentParagraphs(): string[] {
    return (this.doc?.content ?? '')
      .split(/\n{2,}|\r?\n/)
      .map(p => p.trim())
      .filter(p => p.length > 0);
  }

  // ─── Galeria de fotos (slides) ────────────────────────────────────────────
  // Lightbox: índice da imagem aberta em ecrã cheio (-1 = fechado).
  lightboxIndex = -1;

  get galleryImages(): DocumentMediaItem[] {
    return this.doc?.gallery ?? [];
  }

  openLightbox(index: number): void {
    this.lightboxIndex = index;
  }

  closeLightbox(): void {
    this.lightboxIndex = -1;
  }

  lightboxPrev(): void {
    const n = this.galleryImages.length;
    if (n === 0) return;
    this.lightboxIndex = (this.lightboxIndex - 1 + n) % n;
  }

  lightboxNext(): void {
    const n = this.galleryImages.length;
    if (n === 0) return;
    this.lightboxIndex = (this.lightboxIndex + 1) % n;
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