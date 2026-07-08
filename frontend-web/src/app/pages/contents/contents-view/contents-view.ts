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

  // ─── Acesso negado (403 do backend) ───────────────────────────────────────
  // O denyDocumentAccess() do backend devolve:
  //   { message, subscription_required, required_access_level_id }
  // subscription_required = true  → categoria com requires_subscription →
  //   o pedido certo é POST /documents/{id}/subscribe;
  // subscription_required = false → bloqueio por nível de acesso →
  //   o pedido certo é POST /access-requests (required_access_level_id).
  accessDenied = false;
  subscriptionRequired = false;
  requiredAccessLevelId: string | null = null;
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
        this.requiredAccessLevelId = err?.error?.required_access_level_id ?? null;

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
   * Envia o pedido correcto conforme o mecanismo indicado pelo 403:
   * subscrição de documento ou access request de nível de acesso.
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
      if (this.subscriptionRequired) {
        // O backend nunca devolve erro para duplicados: responde 200 com
        // already_exists quando já há pedido ACTIVE/PENDING.
        await this.documentService.subscribeDocument(this.docId);
      } else if (this.requiredAccessLevelId) {
        await this.documentService.requestAccessLevel(this.requiredAccessLevelId);
      } else {
        this.accessRequestError = 'Não foi possível determinar o tipo de acesso necessário.';
        return;
      }
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

  /** Label do nível de acesso em falta — para o cartão de acesso negado. */
  getRequiredAccessLabel(): string {
    switch (this.requiredAccessLevelId) {
      case 'jindungo':   return 'Jindungo';
      case 'restricted': return 'Restrito';
      default:           return this.subscriptionRequired ? 'com Subscrição' : 'Condicionado';
    }
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