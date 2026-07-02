import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { firstValueFrom } from 'rxjs';
import {
  Category,
  DiscussionTopic,
  TopicReply,
} from '../../../../../models/community-admin.models';
import { CommunityAdminService } from '../../../../../services/community-admin.service';

type CommunityTab = 'topics' | 'replies';
type TopicStatusFilter = 'todos' | 'open' | 'locked' | 'archived';
type ReplyFilter = 'todos' | 'accepted';

interface TopicView extends DiscussionTopic {
  author_name: string;
  category_name: string;
}

interface ReplyView extends TopicReply {
  author_name: string;
}

@Component({
  selector: 'app-community-page',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './community-page.html',
  styleUrls: ['./community-page.css']
})
export class CommunityPageComponent implements OnInit {
  activeTab: CommunityTab = 'topics';
  loading = false;
  errorMessage: string | null = null;
  successMessage: string | null = null;

  topicSearch = '';
  topicStatus: TopicStatusFilter = 'todos';
  topicCategory = 'todos';
  topicsPage = 1;
  topicsPageSize = 10;
  topicsPageSizeOptions = [10, 20, 50];

  replySearch = '';
  replyFilter: ReplyFilter = 'todos';

  showTopicModal = false;
  topicModalMode: 'view' | 'edit' = 'view';
  editingTopic: TopicView | null = null;
  topicForm: {
    title: string;
    content: string;
    status: 'open' | 'locked' | 'archived';
    category_id: string;
    is_pinned: boolean;
    is_featured: boolean;
  } = this.createEmptyTopicForm();

  showReplyModal = false;
  replyModalMode: 'view' | 'edit' = 'view';
  editingReply: ReplyView | null = null;
  replyForm = { content: '' };

  categories: Category[] = [];
  topics: TopicView[] = [];
  selectedTopicId: string | null = null;
  replies: ReplyView[] = [];

  constructor(private communityAdmin: CommunityAdminService) {}

  ngOnInit(): void {
    void this.loadInitialData();
  }

  get filteredTopics(): TopicView[] {
    return this.topics.filter((topic) => {
      const search = this.topicSearch.trim().toLowerCase();
      const matchSearch = search === '' ||
        topic.title.toLowerCase().includes(search) ||
        topic.author_name.toLowerCase().includes(search) ||
        topic.content.toLowerCase().includes(search) ||
        topic.category_name.toLowerCase().includes(search);
      const matchStatus = this.topicStatus === 'todos' || topic.status === this.topicStatus;
      const matchCategory = this.topicCategory === 'todos' || topic.category_id === this.topicCategory;
      return matchSearch && matchStatus && matchCategory;
    });
  }

  get pagedTopics(): TopicView[] {
    const start = (this.topicsPage - 1) * this.topicsPageSize;
    return this.filteredTopics.slice(start, start + this.topicsPageSize);
  }

  get topicTotalPages(): number {
    return Math.max(1, Math.ceil(this.filteredTopics.length / this.topicsPageSize));
  }

  get topicPageNumbers(): number[] {
    return Array.from({ length: this.topicTotalPages }, (_, index) => index + 1);
  }

  get topicPageStart(): number {
    return this.filteredTopics.length === 0 ? 0 : (this.topicsPage - 1) * this.topicsPageSize + 1;
  }

  get topicPageEnd(): number {
    return Math.min(this.topicsPage * this.topicsPageSize, this.filteredTopics.length);
  }

  get topicStats() {
    return {
      total: this.topics.length,
      open: this.topics.filter((topic) => topic.status === 'open' || topic.status === 'published').length,
      locked: this.topics.filter((topic) => topic.status === 'locked' || topic.locked).length,
      pinned: this.topics.filter((topic) => topic.pinned || topic.is_pinned).length,
      archived: this.topics.filter((topic) => topic.status === 'archived').length,
    };
  }

  get filteredReplies(): ReplyView[] {
    return this.replies.filter((reply) => {
      const search = this.replySearch.trim().toLowerCase();
      const matchSearch = search === '' ||
        reply.content.toLowerCase().includes(search) ||
        reply.author_name.toLowerCase().includes(search);
      const matchAccepted = this.replyFilter === 'todos' || reply.is_accepted;
      return matchSearch && matchAccepted;
    });
  }

  get replyStats() {
    return {
      total: this.replies.length,
      accepted: this.replies.filter((reply) => reply.is_accepted).length,
      flagged: this.replies.filter((reply) => reply.is_flagged).length,
    };
  }

  get selectedTopic(): TopicView | null {
    return this.topics.find((topic) => topic.id === this.selectedTopicId) || null;
  }

  async loadInitialData(): Promise<void> {
    this.loading = true;
    this.errorMessage = null;

    const [categoriesResult, topicsResult] = await Promise.all([
      firstValueFrom(this.communityAdmin.getAdminCategories()),
      firstValueFrom(this.communityAdmin.getTopics()),
    ]);

    if (categoriesResult.ok && categoriesResult.data) {
      this.categories = categoriesResult.data;
    }

    if (!topicsResult.ok || !topicsResult.data) {
      this.topics = [];
      this.replies = [];
      this.selectedTopicId = null;
      this.errorMessage = topicsResult.message || 'Não foi possível carregar os tópicos.';
      this.loading = false;
      return;
    }

    this.topics = topicsResult.data.map((topic) => this.toTopicView(topic));
    this.topicsPage = 1;
    this.selectedTopicId = this.selectedTopicId && this.topics.some((topic) => topic.id === this.selectedTopicId)
      ? this.selectedTopicId
      : (this.topics[0]?.id ?? null);

    if (this.selectedTopicId) {
      await this.loadRepliesForSelectedTopic();
    } else {
      this.replies = [];
    }

    this.loading = false;
  }

  async refreshTopics(): Promise<void> {
    await this.loadInitialData();
  }

  setActiveTab(tab: CommunityTab): void {
    this.activeTab = tab;

    if (tab === 'replies' && this.selectedTopicId && this.replies.length === 0) {
      void this.loadRepliesForSelectedTopic();
    }
  }

  onTopicPageSizeChange(size: number): void {
    this.topicsPageSize = size;
    this.topicsPage = 1;
  }

  goToTopicPage(page: number): void {
    this.topicsPage = Math.max(1, Math.min(page, this.topicTotalPages));
  }

  async openTopic(topic: TopicView, mode: 'view' | 'edit' = 'view'): Promise<void> {
    this.loading = true;
    this.errorMessage = null;
    this.successMessage = null;

    const result = await firstValueFrom(this.communityAdmin.getTopic(topic.id));

    if (!result.ok || !result.data) {
      this.errorMessage = result.message || 'Não foi possível carregar o tópico.';
      this.loading = false;
      return;
    }

    const fullTopic = this.toTopicView(result.data);
    this.selectedTopicId = fullTopic.id;
    this.editingTopic = fullTopic;
    this.topicForm = {
      title: fullTopic.title,
      content: fullTopic.content,
      status: this.normalizeTopicStatus(fullTopic.status),
      category_id: fullTopic.category_id,
      is_pinned: fullTopic.is_pinned,
      is_featured: fullTopic.is_featured,
    };
    this.topicModalMode = mode;
    this.showTopicModal = true;

    await this.loadRepliesForSelectedTopic();
    this.loading = false;
  }

  enableTopicEditMode(): void {
    this.topicModalMode = 'edit';
  }

  closeTopicModal(): void {
    this.showTopicModal = false;
    this.editingTopic = null;
    this.topicModalMode = 'view';
  }

  async saveTopic(): Promise<void> {
    if (!this.editingTopic) {
      this.errorMessage = 'Selecione um tópico para editar.';
      return;
    }

    if (!this.topicForm.title.trim() || !this.topicForm.content.trim()) {
      this.errorMessage = 'Título e conteúdo são obrigatórios.';
      return;
    }

    this.loading = true;
    this.errorMessage = null;
    this.successMessage = null;

    const result = await firstValueFrom(this.communityAdmin.updateTopic(this.editingTopic.id, {
      title: this.topicForm.title.trim(),
      content: this.topicForm.content.trim(),
      status: this.topicForm.status,
      category_id: this.topicForm.category_id || null,
      is_pinned: this.topicForm.is_pinned,
      is_featured: this.topicForm.is_featured,
    }));

    if (!result.ok || !result.data) {
      this.errorMessage = result.message || 'Não foi possível actualizar o tópico.';
      this.loading = false;
      return;
    }

    this.successMessage = result.message || 'Tópico actualizado com sucesso.';
    this.showTopicModal = false;
    this.editingTopic = null;
    await this.loadInitialData();
  }

  async deleteTopic(topic: TopicView): Promise<void> {
    if (!confirm('Tem a certeza que deseja eliminar este tópico?')) {
      return;
    }

    this.loading = true;
    this.errorMessage = null;
    this.successMessage = null;

    const result = await firstValueFrom(this.communityAdmin.deleteTopic(topic.id));
    if (!result.ok) {
      this.errorMessage = result.message || 'Não foi possível eliminar o tópico.';
      this.loading = false;
      return;
    }

    this.successMessage = result.message || 'Tópico eliminado com sucesso.';
    await this.loadInitialData();
  }

  async pinTopic(topic: TopicView): Promise<void> {
    this.loading = true;
    this.errorMessage = null;
    this.successMessage = null;

    const result = await firstValueFrom(this.communityAdmin.pinTopic(topic.id));
    if (!result.ok) {
      this.errorMessage = result.message || 'Não foi possível fixar o tópico.';
      this.loading = false;
      return;
    }

    this.successMessage = 'Tópico fixado com sucesso.';
    await this.loadInitialData();
  }

  async lockTopic(topic: TopicView): Promise<void> {
    if (!confirm('Bloquear este tópico? Os utilizadores não poderão adicionar novas respostas.')) {
      return;
    }

    this.loading = true;
    this.errorMessage = null;
    this.successMessage = null;

    const result = await firstValueFrom(this.communityAdmin.lockTopic(topic.id));
    if (!result.ok) {
      this.errorMessage = result.message || 'Não foi possível bloquear o tópico.';
      this.loading = false;
      return;
    }

    this.successMessage = 'Tópico bloqueado com sucesso.';
    await this.loadInitialData();
  }

  async unlockTopic(topic: TopicView): Promise<void> {
    this.loading = true;
    this.errorMessage = null;
    this.successMessage = null;

    const result = await firstValueFrom(this.communityAdmin.unlockTopic(topic.id));
    if (!result.ok) {
      this.errorMessage = result.message || 'Não foi possível desbloquear o tópico.';
      this.loading = false;
      return;
    }

    this.successMessage = 'Tópico desbloqueado com sucesso.';
    await this.loadInitialData();
  }

  async loadRepliesForSelectedTopic(): Promise<void> {
    if (!this.selectedTopicId) {
      this.replies = [];
      return;
    }

    this.loading = true;
    this.errorMessage = null;

    const result = await firstValueFrom(this.communityAdmin.getReplies(this.selectedTopicId));
    if (!result.ok || !result.data) {
      this.replies = [];
      this.errorMessage = result.message || 'Não foi possível carregar as respostas.';
      this.loading = false;
      return;
    }

    this.replies = result.data.map((reply) => this.toReplyView(reply));
    this.loading = false;
  }

  async onSelectedTopicChange(topicId: string): Promise<void> {
    this.selectedTopicId = topicId || null;
    await this.loadRepliesForSelectedTopic();
  }

  async openReply(reply: ReplyView, mode: 'view' | 'edit' = 'view'): Promise<void> {
    this.editingReply = { ...reply };
    this.replyForm = { content: reply.content };
    this.replyModalMode = mode;
    this.showReplyModal = true;
  }

  enableReplyEditMode(): void {
    this.replyModalMode = 'edit';
  }

  closeReplyModal(): void {
    this.showReplyModal = false;
    this.editingReply = null;
    this.replyModalMode = 'view';
  }

  async saveReply(): Promise<void> {
    if (!this.editingReply) {
      return;
    }

    if (!this.replyForm.content.trim()) {
      this.errorMessage = 'O conteúdo da resposta é obrigatório.';
      return;
    }

    this.loading = true;
    this.errorMessage = null;
    this.successMessage = null;

    const result = await firstValueFrom(this.communityAdmin.updateReply(this.editingReply.id, {
      content: this.replyForm.content.trim(),
    }));

    if (!result.ok || !result.data) {
      this.errorMessage = result.message || 'Não foi possível actualizar a resposta.';
      this.loading = false;
      return;
    }

    this.successMessage = result.message || 'Resposta actualizada com sucesso.';
    await this.loadInitialData();
    this.closeReplyModal();
  }

  async deleteReply(reply: ReplyView): Promise<void> {
    if (!confirm('Tem a certeza que deseja eliminar esta resposta?')) {
      return;
    }

    this.loading = true;
    this.errorMessage = null;
    this.successMessage = null;

    const result = await firstValueFrom(this.communityAdmin.deleteReply(reply.id));
    if (!result.ok) {
      this.errorMessage = result.message || 'Não foi possível eliminar a resposta.';
      this.loading = false;
      return;
    }

    this.successMessage = result.message || 'Resposta eliminada com sucesso.';
    await this.loadInitialData();
  }

  async acceptReply(reply: ReplyView): Promise<void> {
    this.loading = true;
    this.errorMessage = null;
    this.successMessage = null;

    const result = await firstValueFrom(this.communityAdmin.acceptReply(reply.id));
    if (!result.ok) {
      this.errorMessage = result.message || 'Não foi possível aceitar a resposta.';
      this.loading = false;
      return;
    }

    this.successMessage = result.message || 'Resposta marcada como aceite.';
    await this.loadInitialData();
  }

  getStatusLabel(status: string): string {
    const labels: Record<string, string> = {
      open: 'Aberto',
      locked: 'Bloqueado',
      archived: 'Arquivado',
      published: 'Publicado',
      draft: 'Rascunho',
    };
    return labels[status] || status;
  }

  getCategoryName(categoryId: string): string {
    return this.categories.find((category) => category.id === categoryId)?.name || 'Sem categoria';
  }

  getCategoryOptions(): Category[] {
    return this.categories;
  }

  private normalizeTopicStatus(status: string): 'open' | 'locked' | 'archived' {
    if (status === 'locked' || status === 'archived') {
      return status;
    }

    return 'open';
  }

  private toTopicView(topic: DiscussionTopic): TopicView {
    return {
      ...topic,
      status: this.normalizeTopicStatus(topic.status),
      author_name: topic.author?.display_name || topic.author?.email || 'Utilizador',
      category_name: topic.category?.name || this.getCategoryName(topic.category_id),
    };
  }

  private toReplyView(reply: TopicReply): ReplyView {
    return {
      ...reply,
      author_name: reply.author?.display_name || reply.author?.email || 'Utilizador',
    };
  }

  private createEmptyTopicForm() {
    return {
      title: '',
      content: '',
      status: 'open' as const,
      category_id: '',
      is_pinned: false,
      is_featured: false,
    };
  }
}
