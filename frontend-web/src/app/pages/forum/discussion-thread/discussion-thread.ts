import { Component, OnInit, HostListener, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule, ActivatedRoute } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { HeaderComponent } from '../../../components/header/header';
import { FooterComponent } from '../../../components/footer/footer';
import { MarkdownPipe } from '../../../pipes/markdown.pipe';
import { CommunityService, DiscussionTopic, TopicReply } from '../../../services/community.service';
import { AuthService } from '../../../services/auth.service';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import { TopicVisibility } from '../../../services/community.service';

interface TopicMemberRow {
  user_id: string;
  display_name: string;
}

@Component({
  selector: 'app-discussion-thread',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, HeaderComponent, FooterComponent, MarkdownPipe],
  templateUrl: './discussion-thread.html',
  styleUrls: ['./discussion-thread.css']
})
export class DiscussionThreadComponent implements OnInit {

  topic: DiscussionTopic | null = null;
  replies: TopicReply[] = [];
  error: string | null = null;
  isAuthenticated = false;
  currentUserId: string | null = null;

  replyText = '';
  showReplyForm = false;
  showReplyFormForReply: { [key: number]: boolean } = {};
  replyReplyText: { [key: number]: string } = {};

  showReportDiscussionModal = false;
  showReportReplyModal = false;
  reportDiscussionReason = '';
  reportDiscussionDescription = '';
  reportReplyReason = '';
  reportReplyDescription = '';
  selectedReplyIndex: number | null = null;
  selectedReply: TopicReply | null = null;
  reportSubmitting = false;
  reportSubmitError: string | null = null;

  showDiscussionMenu = false;
  showReplyMenuIndex: number | null = null;

  showDeleteDiscussionModal = false;
  showDeleteReplyModal = false;
  deleteReplyIndex: number | null = null;

  // Edição da discussão
  isEditingDiscussion = false;
  editTitle = '';
  editContent = '';
  editVisibility: TopicVisibility = 'PUBLIC';
  editSaving = false;
  editError: string | null = null;

  // Gestão de membros (apenas quando visibility = INVITE_ONLY)
  topicMembers: TopicMemberRow[] = [];
  private originalTopicMembers: TopicMemberRow[] = [];
  memberSearchQuery = '';
  memberSearchResults: { id: string; display_name: string | null; full_name: string | null; institution: string | null }[] = [];
  memberSearchLoading = false;
  private memberSearchTimer: any = null;

  // Edição de respostas
  editingReplyIndex: number | null = null;
  editReplyText = '';

  // Discussões relacionadas (mesma categoria) — sidebar
  relatedTopics: { id: string; title: string; replies: number; views: number }[] = [];

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private communityService: CommunityService,
    private authService: AuthService,
    private http: HttpClient,
    private cdr: ChangeDetectorRef
  ) {}

  async ngOnInit(): Promise<void> {
    this.isAuthenticated = this.authService.isAuthenticated();
    this.currentUserId = (this.authService.getUser() as any)?.id ?? null;
    const topicId = this.route.snapshot.paramMap.get('id');
    if (!topicId) { this.router.navigate(['/forum/community']); return; }
    this.loadData(topicId);
  }

  private async loadData(topicId: string): Promise<void> {
    try {
      const [topicResult, repliesResult] = await Promise.all([
        firstValueFrom(this.communityService.getTopic(topicId)),
        firstValueFrom(this.communityService.getReplies(topicId)),
      ]);

      if (topicResult.ok && topicResult.data) {
        this.topic = topicResult.data;
      } else if ((topicResult as any).status === 403) {
        this.error = 'Esta discussão é privada. Apenas membros convidados podem aceder.';
      } else {
        this.error = topicResult.message ?? 'Erro ao carregar discussão.';
      }

      if (repliesResult.ok && repliesResult.data) {
        this.replies = repliesResult.data;
      }
    } catch {
      this.error = 'Erro ao carregar discussão.';
    } finally {
      this.cdr.detectChanges();
    }

    // Carrega as relacionadas depois do render principal (não bloqueia a página)
    if (this.topic) {
      void this.loadRelatedTopics();
    }
  }

  // ===== DISCUSSÕES RELACIONADAS (mesma categoria) =====
  private async loadRelatedTopics(): Promise<void> {
    if (!this.topic) return;

    try {
      const token = this.authService.getToken();
      const headers = token ? this.authService.getAuthHeaders(token) : {};

      // Pede tópicos filtrando por categoria no servidor; se o indexTopics
      // ignorar o parâmetro, o filtro client-side abaixo garante o resultado.
      const res: any = await firstValueFrom(
        this.http.get(
          `${environment.apiBaseUrl}/api/topics?category_id=${this.topic.category_id}&per_page=12`,
          { headers }
        )
      );

      const list: any[] = Array.isArray(res) ? res : (res?.data?.data ?? res?.data ?? []);

      this.relatedTopics = list
        .filter(t =>
          t.id !== this.topic!.id &&                      // exclui a discussão atual
          t.category_id === this.topic!.category_id &&    // garante mesma categoria
          t.visibility !== 'INVITE_ONLY'                  // nunca sugerir privadas
        )
        .slice(0, 5)
        .map(t => ({
          id: t.id,
          title: t.title,
          replies: t.replies_count ?? 0,
          views: t.views_count ?? 0,
        }));

      this.cdr.detectChanges();
    } catch {
      this.relatedTopics = []; // a sidebar simplesmente não mostra o cartão
    }
  }

  // ===== GETTERS =====
  get discussionTitle(): string { return this.topic?.title ?? '—'; }
  get discussionContent(): string { return this.topic?.content ?? ''; }
  get discussionAuthor(): string { return this.topic?.author?.display_name ?? '—'; }
  get discussionAuthorInitials(): string {
    const name = this.topic?.author?.display_name ?? '?';
    return name.split(' ').map((n: string) => n[0]).slice(0, 2).join('').toUpperCase();
  }
  get discussionAvatarColor(): string {
    const id = this.topic?.author_id ?? '';
    return id.charCodeAt(0) % 2 === 0 ? '#8b1e2d' : '#6b0119';
  }
  get discussionCategoryName(): string { return this.topic?.category?.name ?? '—'; }
  get discussionCategoryBg(): string { return this.topic?.category?.color_bg ?? '#E5E7EB'; }
  get discussionCategoryText(): string { return this.topic?.category?.color_text ?? '#1F2937'; }
  get discussionDate(): string {
    if (!this.topic?.created_at) return '—';
    return new Date(this.topic.created_at).toLocaleDateString('pt-PT', {
      day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
    });
  }
  get discussionLikes(): number { return this.topic?.likes_count ?? 0; }
  get discussionViews(): number { return this.topic?.views_count ?? 0; }
  get discussionIsLiked(): boolean { return this.topic?.is_liked ?? false; }
  get discussionIsPinned(): boolean { return this.topic?.is_pinned ?? false; }

  // ===== AGRUPAMENTO DE RESPOSTAS (nested dentro do mesmo cartão) =====
  get topLevelReplies(): TopicReply[] {
    return this.replies.filter(r => r.parent_reply_id === null);
  }

  childRepliesOf(parentId: string): TopicReply[] {
    return this.replies.filter(r => r.parent_reply_id === parentId);
  }

  getReplyIndex(reply: TopicReply): number {
    return this.replies.indexOf(reply);
  }

  // ===== PERMISSÕES =====
  get isTopicOwner(): boolean {
    return !!this.currentUserId && this.topic?.author_id === this.currentUserId;
  }

  isReplyOwner(reply: TopicReply): boolean {
    return !!this.currentUserId && reply.author_id === this.currentUserId;
  }

  canEditReply(reply: TopicReply): boolean {
    return this.isReplyOwner(reply);
  }

  canDeleteReply(reply: TopicReply): boolean {
    return this.isReplyOwner(reply) || this.isTopicOwner;
  }

  get isInviteOnly(): boolean {
    return this.topic?.visibility === 'INVITE_ONLY';
  }

  // ===== EDIÇÃO DA DISCUSSÃO =====
  async startEditDiscussion(): Promise<void> {
    if (!this.topic || !this.isTopicOwner) return;
    this.editTitle = this.topic.title;
    this.editContent = this.topic.content ?? '';
    this.editVisibility = this.topic.visibility as TopicVisibility;
    this.editError = null;
    this.showDiscussionMenu = false;
    this.isEditingDiscussion = true;
    if (this.editVisibility === 'INVITE_ONLY') {
      await this.loadTopicMembers();
    }
    this.cdr.detectChanges();
  }

  cancelEditDiscussion(): void {
    this.isEditingDiscussion = false;
    this.editError = null;
    this.memberSearchResults = [];
    this.memberSearchQuery = '';
    this.cdr.detectChanges();
  }

  setEditVisibility(v: TopicVisibility): void {
    this.editVisibility = v;
    if (v === 'INVITE_ONLY' && this.topicMembers.length === 0) {
      this.loadTopicMembers();
    }
    this.cdr.detectChanges();
  }

  private async loadTopicMembers(): Promise<void> {
    if (!this.topic) return;
    try {
      const result = await firstValueFrom(this.communityService.getTopicMembers(this.topic.id));
      const rows: TopicMemberRow[] = (result.ok && result.data ? result.data : [])
        .filter((m: any) => (m.user_id ?? m.user?.id) !== this.topic?.author_id)
        .map((m: any) => ({
          user_id: m.user_id ?? m.user?.id,
          display_name: m.user?.display_name ?? m.display_name ?? 'Utilizador',
        }));
      this.topicMembers = rows;
      this.originalTopicMembers = rows.map(r => ({ ...r }));
      this.cdr.detectChanges();
    } catch {
      this.topicMembers = [];
      this.originalTopicMembers = [];
    }
  }

  onMemberSearchInput(value: string): void {
    this.memberSearchQuery = value;
    clearTimeout(this.memberSearchTimer);
    if (value.trim().length < 2) {
      this.memberSearchResults = [];
      this.cdr.detectChanges();
      return;
    }
    this.memberSearchTimer = setTimeout(() => this.searchMembers(), 400);
  }

  async searchMembers(): Promise<void> {
    const q = this.memberSearchQuery.trim();
    if (q.length < 2) return;
    this.memberSearchLoading = true;
    this.cdr.detectChanges();
    try {
      const token = this.authService.getToken();
      const headers = token ? this.authService.getAuthHeaders(token) : {};
      const results = await firstValueFrom(
        this.http.get<any[]>(`${environment.apiBaseUrl}/api/users/search?q=${encodeURIComponent(q)}`, { headers })
      );
      const existingIds = new Set(this.topicMembers.map(m => m.user_id));
      this.memberSearchResults = (results ?? []).filter(u => !existingIds.has(u.id));
    } catch {
      this.memberSearchResults = [];
    } finally {
      this.memberSearchLoading = false;
      this.cdr.detectChanges();
    }
  }

  addTopicMember(user: { id: string; display_name: string | null; full_name: string | null }): void {
    this.topicMembers = [
      ...this.topicMembers,
      { user_id: user.id, display_name: user.display_name || user.full_name || 'Utilizador' },
    ];
    this.memberSearchResults = this.memberSearchResults.filter(u => u.id !== user.id);
    this.cdr.detectChanges();
  }

  removeTopicMember(userId: string): void {
    this.topicMembers = this.topicMembers.filter(m => m.user_id !== userId);
    this.cdr.detectChanges();
  }

  private get memberHeaders(): Record<string, string> {
    const token = this.authService.getToken();
    return token ? this.authService.getAuthHeaders(token) : { Accept: 'application/json' };
  }

  // Sincroniza this.topicMembers com o backend: adiciona novos e remove excluídos
  private async syncTopicMembers(topicId: string): Promise<void> {
    const before = new Set(this.originalTopicMembers.map(m => m.user_id));
    const after = new Set(this.topicMembers.map(m => m.user_id));

    const toAdd = this.topicMembers.filter(m => !before.has(m.user_id));
    const toRemove = this.originalTopicMembers.filter(m => !after.has(m.user_id));

    const requests: Promise<any>[] = [];

    for (const m of toAdd) {
      requests.push(firstValueFrom(
        this.http.post(`${environment.apiBaseUrl}/api/topics/${topicId}/members`,
          { user_id: m.user_id },
          { headers: this.memberHeaders }
        )
      ));
    }

    for (const m of toRemove) {
      requests.push(firstValueFrom(
        this.http.delete(`${environment.apiBaseUrl}/api/topics/${topicId}/members/${m.user_id}`,
          { headers: this.memberHeaders }
        )
      ));
    }

    if (requests.length > 0) {
      await Promise.allSettled(requests);
    }
  }

  async saveEditDiscussion(): Promise<void> {
    if (!this.topic) return;
    if (!this.editTitle.trim() || this.editTitle.trim().length < 10) {
      this.editError = 'O título deve ter pelo menos 10 caracteres.';
      this.cdr.detectChanges();
      return;
    }
    if (!this.editContent.trim() || this.editContent.trim().length < 50) {
      this.editError = 'O conteúdo deve ter pelo menos 50 caracteres.';
      this.cdr.detectChanges();
      return;
    }
    if (this.editVisibility === 'INVITE_ONLY' && this.topicMembers.length === 0) {
      this.editError = 'Adicione pelo menos um membro para tópicos por convite.';
      this.cdr.detectChanges();
      return;
    }

    this.editSaving = true;
    this.editError = null;
    this.cdr.detectChanges();

    try {
      const result = await firstValueFrom(
        this.communityService.updateTopic(this.topic.id, {
          title: this.editTitle.trim(),
          content: this.editContent.trim(),
          visibility: this.editVisibility,
        })
      );

      if (!result.ok || !result.data) {
        this.editError = result.message ?? 'Erro ao guardar alterações.';
        this.editSaving = false;
        this.cdr.detectChanges();
        return;
      }

      if (this.editVisibility === 'INVITE_ONLY') {
        await this.syncTopicMembers(this.topic.id);
      }

      this.topic = { ...this.topic, ...result.data };
      this.isEditingDiscussion = false;
      this.editSaving = false;
      this.cdr.detectChanges();
    } catch {
      this.editError = 'Erro ao guardar alterações.';
      this.editSaving = false;
      this.cdr.detectChanges();
    }
  }

  // ===== EDIÇÃO DE RESPOSTAS =====
  startEditReply(index: number): void {
    this.showReplyMenuIndex = null;
    this.editingReplyIndex = index;
    this.editReplyText = this.replies[index].content;
    this.cdr.detectChanges();
  }

  cancelEditReply(): void {
    this.editingReplyIndex = null;
    this.editReplyText = '';
    this.cdr.detectChanges();
  }

  async saveEditReply(index: number): Promise<void> {
    const reply = this.replies[index];
    if (!this.editReplyText.trim()) return;
    try {
      const result = await firstValueFrom(
        this.communityService.updateReply(reply.id, { content: this.editReplyText.trim() })
      );
      if (result.ok) {
        this.replies[index] = { ...reply, content: this.editReplyText.trim() };
      }
      this.editingReplyIndex = null;
      this.cdr.detectChanges();
    } catch {
      this.error = 'Erro ao guardar a resposta.';
      this.cdr.detectChanges();
      setTimeout(() => { this.error = null; this.cdr.detectChanges(); }, 4000);
    }
  }

  getReplyAuthorInitials(reply: TopicReply): string {
    const name = reply.author?.display_name ?? '?';
    return name.split(' ').map((n: string) => n[0]).slice(0, 2).join('').toUpperCase();
  }

  getReplyAvatarColor(reply: TopicReply): string {
    const id = reply.author_id ?? '';
    return id.charCodeAt(0) % 2 === 0 ? '#8b1e2d' : '#6b0119';
  }

  getParentAuthor(parentId: string | null): string {
    if (!parentId) return '';
    return this.replies.find(r => r.id === parentId)?.author?.display_name ?? '—';
  }

  formatTimeAgo(dateStr: string): string {
    const diff  = Date.now() - new Date(dateStr).getTime();
    const mins  = Math.floor(diff / 60000);
    const hours = Math.floor(mins / 60);
    const days  = Math.floor(hours / 24);
    if (days > 0)  return `há ${days} dia${days > 1 ? 's' : ''}`;
    if (hours > 0) return `há ${hours} hora${hours > 1 ? 's' : ''}`;
    if (mins > 0)  return `há ${mins} min`;
    return 'agora mesmo';
  }

  // ===== RESPOSTAS =====

  /** Visitantes podem ler, mas qualquer interação leva à página de login. */
  private requireLogin(): boolean {
    if (this.isAuthenticated) return true;
    this.router.navigate(['/auth/login']);
    return false;
  }

  openReplyForm(): void {
    if (!this.requireLogin()) return;
    this.showReplyForm = !this.showReplyForm;
    this.cdr.detectChanges();
  }

  async handleSubmitReply(event: Event): Promise<void> {
    event.preventDefault();
    if (!this.requireLogin()) return;
    if (!this.replyText.trim() || !this.topic) return;
    try {
      const result = await firstValueFrom(
        this.communityService.createReply(this.topic.id, { content: this.replyText })
      );
      if (result.ok && result.data) {
        this.replies.push(result.data);
        this.replyText = '';
        this.showReplyForm = false;
        if (this.topic) this.topic.replies_count++;
        this.cdr.detectChanges();
      }
    } catch {
      this.error = 'Erro ao publicar resposta.';
      this.cdr.detectChanges();
      setTimeout(() => { this.error = null; this.cdr.detectChanges(); }, 4000);
    }
  }

  async handleReplyToReply(index: number, text: string): Promise<void> {
    if (!this.requireLogin()) return;
    if (!text?.trim() || !this.topic) return;
    const parentReply = this.replies[index];
    try {
      const result = await firstValueFrom(
        this.communityService.createReply(this.topic.id, {
          content: text,
          parent_reply_id: parentReply.id
        })
      );
      if (result.ok && result.data) {
        this.replies.splice(index + 1, 0, result.data);
        this.showReplyFormForReply[index] = false;
        this.replyReplyText[index] = '';
        if (this.topic) this.topic.replies_count++;
        this.cdr.detectChanges();
      }
    } catch {
      this.error = 'Erro ao publicar resposta.';
      this.cdr.detectChanges();
      setTimeout(() => { this.error = null; this.cdr.detectChanges(); }, 4000);
    }
  }

  toggleReplyForm(index: number): void {
    if (!this.requireLogin()) return;
    this.showReplyFormForReply[index] = !this.showReplyFormForReply[index];
    if (this.showReplyFormForReply[index]) this.replyReplyText[index] = '';
    this.cdr.detectChanges();
  }

  // ===== LIKES =====
  async toggleLikeDiscussion(): Promise<void> {
    if (!this.requireLogin()) return;
    if (!this.topic) return;
    try {
      if (this.topic.is_liked) {
        await firstValueFrom(this.communityService.unlikeTopic(this.topic.id));
        this.topic.is_liked = false;
        this.topic.likes_count--;
      } else {
        await firstValueFrom(this.communityService.likeTopic(this.topic.id));
        this.topic.is_liked = true;
        this.topic.likes_count++;
      }
      this.cdr.detectChanges();
    } catch {}
  }

  async toggleLikeReply(index: number): Promise<void> {
    if (!this.requireLogin()) return;
    const reply = this.replies[index];
    try {
      if (reply.is_liked) {
        await firstValueFrom(this.communityService.unlikeReply(reply.id));
        reply.is_liked = false;
        reply.likes_count--;
      } else {
        await firstValueFrom(this.communityService.likeReply(reply.id));
        reply.is_liked = true;
        reply.likes_count++;
      }
      this.cdr.detectChanges();
    } catch {}
  }

  // ===== MENUS =====
  toggleDiscussionMenu(event: Event): void {
    event.stopPropagation();
    this.showDiscussionMenu = !this.showDiscussionMenu;
    this.showReplyMenuIndex = null;
    this.cdr.detectChanges();
  }

  toggleReplyMenu(index: number, event: Event): void {
    event.stopPropagation();
    this.showReplyMenuIndex = this.showReplyMenuIndex === index ? null : index;
    this.showDiscussionMenu = false;
    this.cdr.detectChanges();
  }

  // ===== ELIMINAR DISCUSSÃO =====
  openDeleteDiscussionModal(): void {
    this.showDiscussionMenu = false;
    this.showDeleteDiscussionModal = true;
    this.cdr.detectChanges();
  }

  closeDeleteDiscussionModal(): void {
    this.showDeleteDiscussionModal = false;
    this.cdr.detectChanges();
  }

  async confirmDeleteDiscussion(): Promise<void> {
    if (!this.topic) return;
    try {
      await firstValueFrom(this.communityService.deleteTopic(this.topic.id));
      this.showDeleteDiscussionModal = false;
      this.router.navigate(['/forum/community']);
    } catch {
      this.showDeleteDiscussionModal = false;
      this.error = 'Erro ao eliminar discussão.';
      this.cdr.detectChanges();
      setTimeout(() => { this.error = null; this.cdr.detectChanges(); }, 4000);
    }
  }

  // ===== ELIMINAR RESPOSTA =====
  openDeleteReplyModal(index: number): void {
    this.showReplyMenuIndex = null;
    this.deleteReplyIndex = index;
    this.showDeleteReplyModal = true;
    this.cdr.detectChanges();
  }

  closeDeleteReplyModal(): void {
    this.showDeleteReplyModal = false;
    this.deleteReplyIndex = null;
    this.cdr.detectChanges();
  }

  async confirmDeleteReply(): Promise<void> {
    if (this.deleteReplyIndex === null) return;
    const reply = this.replies[this.deleteReplyIndex];
    try {
      await firstValueFrom(this.communityService.deleteReply(reply.id));
      this.replies.splice(this.deleteReplyIndex, 1);
      if (this.topic) this.topic.replies_count--;
      this.showDeleteReplyModal = false;
      this.deleteReplyIndex = null;
      this.cdr.detectChanges();
    } catch {
      this.showDeleteReplyModal = false;
      this.deleteReplyIndex = null;
      this.error = 'Erro ao eliminar resposta.';
      this.cdr.detectChanges();
      setTimeout(() => { this.error = null; this.cdr.detectChanges(); }, 4000);
    }
  }

  // ===== DENÚNCIAS =====
  openReportDiscussionModal(): void {
    if (!this.requireLogin()) return;
    this.showReportDiscussionModal = true;
    this.reportDiscussionReason = '';
    this.reportDiscussionDescription = '';
    this.reportSubmitError = null;
    this.cdr.detectChanges();
  }

  closeReportDiscussionModal(): void {
    this.showReportDiscussionModal = false;
    this.reportSubmitError = null;
    this.cdr.detectChanges();
  }

  async submitReportDiscussion(): Promise<void> {
    if (!this.reportDiscussionReason || !this.topic) return;

    this.reportSubmitting = true;
    this.reportSubmitError = null;
    this.cdr.detectChanges();

    try {
      const result = await firstValueFrom(
        this.communityService.reportContent({
          content_type: 'topic',
          content_id: this.topic.id,
          reason: this.reportDiscussionReason as any,
          description: this.reportDiscussionDescription || undefined,
        })
      );

      if (result.ok) {
        this.closeReportDiscussionModal();
      } else {
        this.reportSubmitError = result.status === 409
          ? 'Já tem uma denúncia pendente para este conteúdo.'
          : (result.message ?? 'Erro ao enviar denúncia.');
      }
    } catch {
      this.reportSubmitError = 'Erro ao enviar denúncia.';
    } finally {
      this.reportSubmitting = false;
      this.cdr.detectChanges();
    }
  }

  openReportReplyModal(index: number): void {
    if (!this.requireLogin()) return;
    this.selectedReplyIndex = index;
    this.selectedReply = this.replies[index];
    this.showReportReplyModal = true;
    this.reportReplyReason = '';
    this.reportReplyDescription = '';
    this.reportSubmitError = null;
    this.cdr.detectChanges();
  }

  closeReportReplyModal(): void {
    this.showReportReplyModal = false;
    this.selectedReplyIndex = null;
    this.selectedReply = null;
    this.reportSubmitError = null;
    this.cdr.detectChanges();
  }

  async submitReportReply(): Promise<void> {
    if (!this.reportReplyReason || !this.selectedReply) return;

    this.reportSubmitting = true;
    this.reportSubmitError = null;
    this.cdr.detectChanges();

    try {
      const result = await firstValueFrom(
        this.communityService.reportContent({
          content_type: 'reply',
          content_id: this.selectedReply.id,
          reason: this.reportReplyReason as any,
          description: this.reportReplyDescription || undefined,
        })
      );

      if (result.ok) {
        this.closeReportReplyModal();
      } else {
        this.reportSubmitError = result.status === 409
          ? 'Já tem uma denúncia pendente para este conteúdo.'
          : (result.message ?? 'Erro ao enviar denúncia.');
      }
    } catch {
      this.reportSubmitError = 'Erro ao enviar denúncia.';
    } finally {
      this.reportSubmitting = false;
      this.cdr.detectChanges();
    }
  }

  shareDiscussion(): void {
    navigator.clipboard?.writeText(window.location.href).catch(() => {});
  }

  @HostListener('document:click', ['$event'])
  handleClickOutside(event: Event): void {
    const target = event.target as HTMLElement;
    let changed = false;
    if (!target.closest('.discussion-menu-wrapper') && this.showDiscussionMenu) {
      this.showDiscussionMenu = false;
      changed = true;
    }
    if (!target.closest('.reply-menu-wrapper') && this.showReplyMenuIndex !== null) {
      this.showReplyMenuIndex = null;
      changed = true;
    }
    if (changed) this.cdr.detectChanges();
  }

  navigateToDiscussion(id: string): void {
    // Recarrega a página da discussão com o novo id (navegar para a mesma
    // rota com outro parâmetro não re-executa o ngOnInit por defeito).
    this.router.navigate(['/forum/community/discussao', id]).then(() => {
      window.location.reload();
    });
  }

  navigateTo(path: string): void {
    this.router.navigate([path]);
  }
}