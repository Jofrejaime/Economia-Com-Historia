import { CommonModule } from '@angular/common';
import { Component, HostListener, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { HeaderComponent } from '../../../components/header/header';
import { FooterComponent } from '../../../components/footer/footer';
import { MarkdownPipe } from '../../../pipes/markdown.pipe';
import { CommunityService } from '../../../services/community.service';
import { DiscussionTopic, TopicReply } from '../../../models/community.models';

interface Reply {
  id: string;
  parentId: string | null;
  authorId: string;
  author: string;
  authorInitials: string;
  authorRole: string;
  authorPosts: number;
  avatar: string;
  timeAgo: string;
  date: string;
  content: string;
  likes: number;
  isLiked: boolean;
}

interface RelatedTopic {
  id: string;
  title: string;
  replies: number;
  views: number;
}

@Component({
  selector: 'app-discussion-thread',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    HeaderComponent,
    FooterComponent,
    MarkdownPipe
  ],
  templateUrl: './discussion-thread.html',
  styleUrls: ['./discussion-thread.css']
})
export class DiscussionThreadComponent implements OnInit {
  replyText = '';
  showReplyForm = false;

  showReplyFormForReply: { [key: string]: boolean } = {};
  replyReplyText: { [key: string]: string } = {};

  showReportDiscussionModal = false;
  showReportReplyModal = false;
  reportDiscussionReason = '';
  reportDiscussionDescription = '';
  reportReplyReason = '';
  reportReplyDescription = '';
  selectedReplyIndex: number | null = null;
  selectedReply: Reply | null = null;

  showDiscussionMenu = false;
  showReplyMenuIndex: number | null = null;
  showDeleteDiscussionModal = false;
  showDeleteReplyModal = false;
  deleteReplyIndex: number | null = null;

  loading = false;
  discussionId: string | null = null;
  relatedSourceTopics: DiscussionTopic[] = [];

  discussion = {
    id: '',
    authorId: '',
    author: 'Utilizador',
    authorInitials: 'U',
    authorRole: 'Membro da Comunidade',
    authorPosts: 0,
    avatar: '#8b1e2d',
    categoryId: '',
    category: 'CATEGORIA',
    categoryColor: { bg: '#acf0e0', text: '#003a32' },
    timeAgo: 'há instantes',
    date: '',
    title: 'A carregar...',
    content: '',
    replies: 0,
    views: 0,
    likes: 0,
    isLiked: false,
    isPinned: false,
  };

  replies: Reply[] = [];
  relatedTopics: RelatedTopic[] = [];

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private communityService: CommunityService,
  ) {}

  async ngOnInit(): Promise<void> {
    this.discussionId = this.route.snapshot.paramMap.get('id');

    if (!this.discussionId) {
      await this.router.navigate(['/forum/community']);
      return;
    }

    await this.loadTopic();
  }

  async loadTopic(): Promise<void> {
    if (!this.discussionId) {
      return;
    }

    this.loading = true;

    const [topicResult, repliesResult, topicsResult] = await Promise.all([
      firstValueFrom(this.communityService.getTopic(this.discussionId)),
      firstValueFrom(this.communityService.getReplies(this.discussionId)),
      firstValueFrom(this.communityService.getTopics({ per_page: 12 })),
    ]);

    if (!topicResult.ok || !topicResult.data) {
      this.loading = false;
      await this.router.navigate(['/forum/community']);
      return;
    }

    this.discussion = this.toDiscussionView(topicResult.data);
    this.replies = repliesResult.ok && repliesResult.data ? repliesResult.data.map((reply) => this.toReplyView(reply)) : [];
    this.relatedSourceTopics = topicsResult.ok && topicsResult.data ? (topicsResult.data.data ?? []).filter((topic) => topic.id !== this.discussionId) : [];
    this.relatedTopics = this.relatedSourceTopics.slice(0, 3).map((topic) => ({
      id: topic.id,
      title: topic.title,
      replies: topic.replies_count,
      views: topic.views_count,
    }));
    this.loading = false;
  }

  navigateToDiscussion(topicId: string): void {
    this.router.navigate(['/forum/community/discussao', topicId]);
  }

  getReplyAuthor(parentId: string): string {
    const parent = this.replies.find((reply) => reply.id === parentId);
    return parent ? parent.author : 'utilizador';
  }

  async handleSubmitReply(event: Event): Promise<void> {
    event.preventDefault();

    if (!this.discussionId || !this.replyText.trim()) {
      return;
    }

    this.loading = true;
    const result = await firstValueFrom(this.communityService.createReply(this.discussionId, { content: this.replyText.trim() }));

    if (result.ok) {
      this.replyText = '';
      this.showReplyForm = false;
      await this.loadTopic();
      return;
    }

    this.loading = false;
  }

  toggleReplyForm(index: number): void {
    this.showReplyFormForReply[index] = !this.showReplyFormForReply[index];
    if (this.showReplyFormForReply[index]) {
      this.replyReplyText[index] = '';
    }
  }

  async handleReplyToReply(index: number, text: string): Promise<void> {
    if (!this.discussionId || !text.trim()) {
      return;
    }

    const parentReply = this.replies[index];
    if (!parentReply) {
      return;
    }

    this.loading = true;
    const result = await firstValueFrom(this.communityService.createReply(this.discussionId, {
      content: text.trim(),
      parent_reply_id: parentReply.id,
    }));

    if (result.ok) {
      this.showReplyFormForReply[index] = false;
      this.replyReplyText[index] = '';
      await this.loadTopic();
      return;
    }

    this.loading = false;
  }

  async toggleLikeDiscussion(): Promise<void> {
    if (!this.discussionId) {
      return;
    }

    const result = this.discussion.isLiked
      ? await firstValueFrom(this.communityService.unlikeTopic(this.discussionId))
      : await firstValueFrom(this.communityService.likeTopic(this.discussionId));

    if (result.ok) {
      this.discussion.isLiked = !this.discussion.isLiked;
      this.discussion.likes += this.discussion.isLiked ? 1 : -1;
    }
  }

  async toggleLikeReply(index: number): Promise<void> {
    const reply = this.replies[index];
    if (!reply) {
      return;
    }

    const result = reply.isLiked
      ? await firstValueFrom(this.communityService.unlikeReply(reply.id))
      : await firstValueFrom(this.communityService.likeReply(reply.id));

    if (result.ok) {
      reply.isLiked = !reply.isLiked;
      reply.likes += reply.isLiked ? 1 : -1;
    }
  }

  shareDiscussion(): void {
    void navigator.clipboard?.writeText(window.location.href);
  }

  toggleDiscussionMenu(event: Event): void {
    event.stopPropagation();
    this.showDiscussionMenu = !this.showDiscussionMenu;
    this.showReplyMenuIndex = null;
  }

  editDiscussion(): void {
    this.showDiscussionMenu = false;
  }

  openDeleteDiscussionModal(): void {
    this.showDiscussionMenu = false;
    this.showDeleteDiscussionModal = true;
  }

  closeDeleteDiscussionModal(): void {
    this.showDeleteDiscussionModal = false;
  }

  async confirmDeleteDiscussion(): Promise<void> {
    if (!this.discussionId) {
      return;
    }

    const result = await firstValueFrom(this.communityService.deleteTopic(this.discussionId));
    if (result.ok) {
      this.showDeleteDiscussionModal = false;
      await this.router.navigate(['/forum/community']);
    }
  }

  toggleReplyMenu(index: number, event: Event): void {
    event.stopPropagation();
    this.showReplyMenuIndex = this.showReplyMenuIndex === index ? null : index;
    this.showDiscussionMenu = false;
  }

  editReply(index: number): void {
    this.showReplyMenuIndex = null;
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
    if (this.deleteReplyIndex === null) {
      return;
    }

    const reply = this.replies[this.deleteReplyIndex];
    if (!reply) {
      return;
    }

    const result = await firstValueFrom(this.communityService.deleteReply(reply.id));
    if (result.ok) {
      this.showDeleteReplyModal = false;
      this.deleteReplyIndex = null;
      await this.loadTopic();
    }
  }

  @HostListener('document:click', ['$event'])
  handleClickOutside(event: Event): void {
    const target = event.target as HTMLElement;

    if (!target.closest('.discussion-menu-wrapper')) {
      this.showDiscussionMenu = false;
    }

    if (!target.closest('.reply-menu-wrapper')) {
      this.showReplyMenuIndex = null;
    }
  }

  openReportDiscussionModal(): void {
    this.showReportDiscussionModal = true;
    this.reportDiscussionReason = '';
    this.reportDiscussionDescription = '';
  }

  closeReportDiscussionModal(): void {
    this.showReportDiscussionModal = false;
    this.reportDiscussionReason = '';
    this.reportDiscussionDescription = '';
  }

  submitReportDiscussion(): void {
    if (!this.reportDiscussionReason) {
      return;
    }

    alert('Denúncia registada localmente. O contrato de reports será ligado numa fase seguinte.');
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
    this.reportReplyReason = '';
    this.reportReplyDescription = '';
  }

  submitReportReply(): void {
    if (!this.reportReplyReason || this.selectedReplyIndex === null) {
      return;
    }

    alert('Denúncia registada localmente. O contrato de reports será ligado numa fase seguinte.');
    this.closeReportReplyModal();
  }

  navigateTo(path: string): void {
    this.router.navigate([path]);
  }

  private toDiscussionView(topic: DiscussionTopic) {
    const authorName = topic.author?.display_name || topic.author?.full_name || topic.author?.email || 'Utilizador';
    const categoryName = topic.category?.name || 'Categoria';
    const color = this.pickColor(topic.category?.color_bg, topic.category?.color_text);

    return {
      id: topic.id,
      authorId: topic.author_id,
      author: authorName,
      authorInitials: this.initialsFromName(authorName),
      authorRole: topic.author?.role || 'Membro da Comunidade',
      authorPosts: topic.replies_count,
      avatar: '#8b1e2d',
      categoryId: topic.category_id,
      category: categoryName.toUpperCase(),
      categoryColor: color,
      timeAgo: this.formatRelativeTime(topic.created_at),
      date: this.formatDate(topic.created_at),
      title: topic.title,
      content: topic.content,
      replies: topic.replies_count,
      views: topic.views_count,
      likes: topic.likes_count,
      isLiked: false,
      isPinned: topic.is_pinned,
    };
  }

  private toReplyView(reply: TopicReply): Reply {
    const authorName = reply.author?.display_name || reply.author?.full_name || reply.author?.email || 'Utilizador';

    return {
      id: reply.id,
      parentId: reply.parent_reply_id,
      authorId: reply.author_id,
      author: authorName,
      authorInitials: this.initialsFromName(authorName),
      authorRole: reply.is_accepted ? 'Resposta aceita' : 'Membro da Comunidade',
      authorPosts: 0,
      avatar: '#6b0119',
      timeAgo: this.formatRelativeTime(reply.created_at),
      date: this.formatDate(reply.created_at),
      content: reply.content,
      likes: reply.likes_count,
      isLiked: false,
    };
  }

  private initialsFromName(value: string): string {
    return value
      .split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase() ?? '')
      .join('') || 'U';
  }

  private pickColor(bg?: string | null, text?: string | null): { bg: string; text: string } {
    return {
      bg: bg || '#acf0e0',
      text: text || '#003a32',
    };
  }

  private formatRelativeTime(value: string): string {
    const created = new Date(value);
    const diffHours = Math.floor((Date.now() - created.getTime()) / (1000 * 60 * 60));

    if (diffHours < 1) {
      return 'há instantes';
    }

    if (diffHours < 24) {
      return `há ${diffHours} hora(s)`;
    }

    const diffDays = Math.floor(diffHours / 24);
    return `há ${diffDays} dia(s)`;
  }

  private formatDate(value: string): string {
    return new Intl.DateTimeFormat('pt-PT', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date(value));
  }
}
