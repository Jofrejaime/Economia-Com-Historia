import { Component, OnInit, HostListener, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule, ActivatedRoute } from '@angular/router';
import { HeaderComponent } from '../../../components/header/header';
import { FooterComponent } from '../../../components/footer/footer';
import { MarkdownPipe } from '../../../pipes/markdown.pipe';
import { CommunityService, TopicDetail, TopicReply } from '../../../services/community.service';
import { AuthService } from '../../../services/auth.service';

interface RelatedTopic {
  id: string;
  title: string;
  replies: number;
  views: number;
}

@Component({
  selector: 'app-discussion-thread',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, HeaderComponent, FooterComponent, MarkdownPipe],
  templateUrl: './discussion-thread.html',
  styleUrls: ['./discussion-thread.css']
})
export class DiscussionThreadComponent implements OnInit {

  topic: TopicDetail | null = null;
  replies: TopicReply[] = [];
  error: string | null = null;
  isAuthenticated = false;

  replyText = '';
  showReplyForm = false;

  showReplyFormForReply: { [key: number]: boolean } = {};
  replyReplyText: { [key: number]: string } = {};

  // Modais
  showReportDiscussionModal = false;
  showReportReplyModal = false;
  reportDiscussionReason = '';
  reportDiscussionDescription = '';
  reportReplyReason = '';
  reportReplyDescription = '';
  selectedReplyIndex: number | null = null;
  selectedReply: TopicReply | null = null;

  showDiscussionMenu = false;
  showReplyMenuIndex: number | null = null;

  showDeleteDiscussionModal = false;
  showDeleteReplyModal = false;
  deleteReplyIndex: number | null = null;

  // Tópicos relacionados (mock — não há endpoint para isso)
  relatedTopics: RelatedTopic[] = [];

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private communityService: CommunityService,
    private authService: AuthService,
    private cdr: ChangeDetectorRef
  ) {}

  async ngOnInit(): Promise<void> {
    this.isAuthenticated = this.authService.isAuthenticated();
    const topicId = this.route.snapshot.paramMap.get('id');
    if (!topicId) {
      this.router.navigate(['/forum/community']);
      return;
    }
    this.loadData(topicId);
  }

  private async loadData(topicId: string): Promise<void> {
    try {
      const [topic, replies] = await Promise.all([
        this.communityService.getTopic(topicId),
        this.communityService.getReplies(topicId),
      ]);
      this.topic = topic;
      this.replies = replies;
    } catch {
      this.error = 'Erro ao carregar discussão.';
    } finally {
      this.cdr.detectChanges();
    }
  }

  // ===== GETTERS para o template =====
  get discussionTitle(): string { return this.topic?.title ?? '—'; }
  get discussionContent(): string { return this.topic?.content ?? ''; }
  get discussionAuthor(): string { return this.topic?.author?.display_name ?? '—'; }
  get discussionAuthorInitials(): string {
    const name = this.topic?.author?.display_name ?? '?';
    return name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase();
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

  getReplyAuthorInitials(reply: TopicReply): string {
    const name = reply.author?.display_name ?? '?';
    return name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase();
  }

  getReplyAvatarColor(reply: TopicReply): string {
    const id = reply.author_id ?? '';
    return id.charCodeAt(0) % 2 === 0 ? '#8b1e2d' : '#6b0119';
  }

  getParentAuthor(parentId: string | null): string {
    if (!parentId) return '';
    const parent = this.replies.find(r => r.id === parentId);
    return parent?.author?.display_name ?? '—';
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
  async handleSubmitReply(event: Event): Promise<void> {
    event.preventDefault();
    if (!this.replyText.trim() || !this.topic) return;
    try {
      const newReply = await this.communityService.postReply(this.topic.id, this.replyText);
      this.replies.push(newReply);
      this.replyText = '';
      this.showReplyForm = false;
      if (this.topic) this.topic.replies_count++;
      this.cdr.detectChanges();
    } catch {
      alert('Erro ao publicar resposta.');
    }
  }

  async handleReplyToReply(index: number, text: string): Promise<void> {
    if (!text?.trim() || !this.topic) return;
    const parentReply = this.replies[index];
    try {
      const newReply = await this.communityService.postReply(this.topic.id, text, parentReply.id);
      this.replies.splice(index + 1, 0, newReply);
      this.showReplyFormForReply[index] = false;
      this.replyReplyText[index] = '';
      if (this.topic) this.topic.replies_count++;
      this.cdr.detectChanges();
    } catch {
      alert('Erro ao publicar resposta.');
    }
  }

  toggleReplyForm(index: number): void {
    this.showReplyFormForReply[index] = !this.showReplyFormForReply[index];
    if (this.showReplyFormForReply[index]) this.replyReplyText[index] = '';
  }

  // ===== LIKES =====
  async toggleLikeDiscussion(): Promise<void> {
    if (!this.topic || !this.isAuthenticated) return;
    try {
      if (this.topic.is_liked) {
        await this.communityService.unlikeTopic(this.topic.id);
        this.topic.is_liked = false;
        this.topic.likes_count--;
      } else {
        await this.communityService.likeTopic(this.topic.id);
        this.topic.is_liked = true;
        this.topic.likes_count++;
      }
      this.cdr.detectChanges();
    } catch {}
  }

  async toggleLikeReply(index: number): Promise<void> {
    if (!this.isAuthenticated) return;
    const reply = this.replies[index];
    try {
      if (reply.is_liked) {
        await this.communityService.unlikeReply(reply.id);
        reply.is_liked = false;
        reply.likes_count--;
      } else {
        await this.communityService.likeReply(reply.id);
        reply.is_liked = true;
        reply.likes_count++;
      }
      this.cdr.detectChanges();
    } catch {}
  }

  // ===== MENU =====
  toggleDiscussionMenu(event: Event): void {
    event.stopPropagation();
    this.showDiscussionMenu = !this.showDiscussionMenu;
    this.showReplyMenuIndex = null;
  }

  editDiscussion(): void {
    this.showDiscussionMenu = false;
  }

  toggleReplyMenu(index: number, event: Event): void {
    event.stopPropagation();
    this.showReplyMenuIndex = this.showReplyMenuIndex === index ? null : index;
    this.showDiscussionMenu = false;
  }

  editReply(index: number): void {
    this.showReplyMenuIndex = null;
  }

  // ===== ELIMINAR =====
  openDeleteDiscussionModal(): void {
    this.showDiscussionMenu = false;
    this.showDeleteDiscussionModal = true;
  }

  closeDeleteDiscussionModal(): void {
    this.showDeleteDiscussionModal = false;
  }

  async confirmDeleteDiscussion(): Promise<void> {
    if (!this.topic) return;
    try {
      await this.communityService.deleteTopic(this.topic.id);
      this.showDeleteDiscussionModal = false;
      this.router.navigate(['/forum/community']);
    } catch {
      alert('Erro ao eliminar discussão.');
    }
  }

  openDeleteReplyModal(index: number): void {
    this.showReplyMenuIndex = null;
    this.deleteReplyIndex = index;
    this.showDeleteReplyModal = true;
  }

  closeDeleteReplyModal(): void {
    this.showDeleteReplyModal = false;
    this.deleteReplyIndex = null;
  }

  async confirmDeleteReply(): Promise<void> {
    if (this.deleteReplyIndex === null) return;
    const reply = this.replies[this.deleteReplyIndex];
    try {
      await this.communityService.deleteReply(reply.id);
      this.replies.splice(this.deleteReplyIndex, 1);
      if (this.topic) this.topic.replies_count--;
      this.showDeleteReplyModal = false;
      this.deleteReplyIndex = null;
      this.cdr.detectChanges();
    } catch {
      alert('Erro ao eliminar resposta.');
    }
  }

  // ===== DENÚNCIAS =====
  openReportDiscussionModal(): void {
    this.showReportDiscussionModal = true;
    this.reportDiscussionReason = '';
    this.reportDiscussionDescription = '';
  }

  closeReportDiscussionModal(): void {
    this.showReportDiscussionModal = false;
  }

  submitReportDiscussion(): void {
    if (!this.reportDiscussionReason) return;
    alert('Denúncia enviada com sucesso! A equipa de moderação irá analisar.');
    this.closeReportDiscussionModal();
  }

  openReportReplyModal(index: number): void {
    this.selectedReplyIndex = index;
    this.selectedReply = this.replies[index];
    this.showReportReplyModal = true;
    this.reportReplyReason = '';
    this.reportReplyDescription = '';
  }

  closeReportReplyModal(): void {
    this.showReportReplyModal = false;
    this.selectedReplyIndex = null;
    this.selectedReply = null;
  }

  submitReportReply(): void {
    if (!this.reportReplyReason) return;
    alert('Denúncia enviada com sucesso! A equipa de moderação irá analisar.');
    this.closeReportReplyModal();
  }

  shareDiscussion(): void {
    navigator.clipboard?.writeText(window.location.href).catch(() => {});
  }

  // ===== CLICK FORA =====
  @HostListener('document:click', ['$event'])
  handleClickOutside(event: Event): void {
    const target = event.target as HTMLElement;
    if (!target.closest('.discussion-menu-wrapper')) this.showDiscussionMenu = false;
    if (!target.closest('.reply-menu-wrapper')) this.showReplyMenuIndex = null;
  }

  navigateToDiscussion(id: string): void {
    this.router.navigate(['/forum/community/discussao', id]);
  }

  navigateTo(path: string): void {
    this.router.navigate([path]);
  }
}