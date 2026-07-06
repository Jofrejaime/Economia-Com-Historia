import { CommonModule } from '@angular/common';
import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { HeaderComponent } from '../../../components/header/header';
import { FooterComponent } from '../../../components/footer/footer';
import { CommunityCategory, CommunityService, DiscussionTopic } from '../../../services/community.service';
import { HostListener } from '@angular/core';
import { AuthService } from '../../../services/auth.service';

type TabType = 'recent' | 'popular' | 'pinned';

@Component({
  selector: 'app-community',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, HeaderComponent, FooterComponent],
  templateUrl: './community.html',
  styleUrls: ['./community.css']
})
export class CommunityComponent implements OnInit {
  activeTab: TabType = 'recent';
  categories: CommunityCategory[] = [];
  discussions: DiscussionTopic[] = [];
  error: string | null = null;
  currentUserId: string | null = null;
  openCardMenuId: string | null = null;
  showDeleteCardModal = false;
  deleteCardTargetId: string | null = null;

  // As 3 discussões com mais visualizações, calculadas a partir dos tópicos
  // vindos do backend em loadData() — sem dados mockados.
  featuredResearches: { id: string; date: string; title: string }[] = [];

  constructor(
    private router: Router,
    private communityService: CommunityService,
    private cdr: ChangeDetectorRef,
    private authService: AuthService
  ) {}

  async ngOnInit(): Promise<void> {
    this.currentUserId = (this.authService.getUser() as any)?.id ?? null;
    this.loadData();
  }

  private async loadData(): Promise<void> {
    try {
      const [categoriesResult, topicsResult] = await Promise.all([
        firstValueFrom(this.communityService.getCategories()),
        firstValueFrom(this.communityService.getTopics()),
      ]);

      this.categories = categoriesResult.ok && categoriesResult.data ? categoriesResult.data : [];

      const topics = topicsResult.ok && topicsResult.data ? topicsResult.data.data : [];
      this.discussions = topics;

      // Pesquisas em destaque = top 3 por visualizações, APENAS entre as
      // discussões que este utilizador pode ver (nunca destacar privadas).
      this.featuredResearches = [...topics]
        .filter(t => this.canSeeTopic(t))
        .sort((a, b) => (b.views_count ?? 0) - (a.views_count ?? 0))
        .slice(0, 3)
        .map(t => ({
          id: t.id,
          date: this.formatDate(t.created_at),
          title: t.title,
        }));
    } catch {
      this.error = 'Erro ao carregar a comunidade.';
    } finally {
      this.cdr.detectChanges();
    }
  }

  /**
   * Uma discussão INVITE_ONLY só é visível para o autor ou para membros
   * convidados (se o backend enviar essa informação no tópico: is_member).
   * NOTA: isto é apenas a camada visual — a barreira real é o backend
   * filtrar/negar no indexTopics e showTopic.
   */
  private canSeeTopic(d: DiscussionTopic): boolean {
    if (d.visibility !== 'INVITE_ONLY') return true;
    if (this.currentUserId && d.author_id === this.currentUserId) return true;
    return !!(d as any).is_member;
  }

  get filteredDiscussions(): DiscussionTopic[] {
    const visible = this.discussions.filter(d => this.canSeeTopic(d));
    if (this.activeTab === 'pinned') return visible.filter(d => d.is_pinned);
    if (this.activeTab === 'popular') return [...visible].sort((a, b) => b.views_count - a.views_count);
    return [...visible].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }

  get totalTopics(): number { return this.categories.reduce((t, c) => t + (c.topics_count ?? 0), 0); }

  setActiveTab(tab: TabType): void {
    this.activeTab = tab;
    this.cdr.detectChanges();
  }

  getTopicVisibilityBadge(discussion: DiscussionTopic): { show: boolean; label: string } | null {
    if (discussion.visibility === 'INVITE_ONLY') {
      return { show: true, label: 'Privado' };
    }
    return null;
  }

  getAuthorInitials(name: string): string {
    return name.split(' ').map(p => p[0]).slice(0, 2).join('').toUpperCase();
  }

  getAvatarColor(id: string): string {
    return id.charCodeAt(0) % 2 === 0 ? '#8b1e2d' : '#6b0119';
  }

  formatTimeAgo(dateStr: string): string {
    const diff  = Date.now() - new Date(dateStr).getTime();
    const mins  = Math.floor(diff / 60000);
    const hours = Math.floor(mins / 60);
    const days  = Math.floor(hours / 24);
    if (days > 0)  return `há ${days} dia${days > 1 ? 's' : ''}`;
    if (hours > 0) return `há ${hours} hora${hours > 1 ? 's' : ''}`;
    return `há ${mins} min`;
  }

  getCategoryColor(cat: CommunityCategory | null | undefined): { bg: string; text: string } {
    return { bg: cat?.color_bg ?? '#E5E7EB', text: cat?.color_text ?? '#1F2937' };
  }

  private formatDate(value: string): string {
    return new Intl.DateTimeFormat('pt-PT', { day: '2-digit', month: 'short', year: 'numeric' }).format(new Date(value));
  }

  isCardOwner(discussion: DiscussionTopic): boolean {
    return !!this.currentUserId && discussion.author_id === this.currentUserId;
  }

  toggleCardMenu(event: Event, id: string): void {
    event.stopPropagation();
    this.openCardMenuId = this.openCardMenuId === id ? null : id;
    this.cdr.detectChanges();
  }

  @HostListener('document:click')
  closeCardMenu(): void {
    if (this.openCardMenuId !== null) {
      this.openCardMenuId = null;
      this.cdr.detectChanges();
    }
  }

  editCard(event: Event, id: string): void {
    event.stopPropagation();
    this.openCardMenuId = null;
    this.router.navigate(['/forum/community/discussao', id], { queryParams: { edit: '1' } });
  }

  openDeleteCardModal(event: Event, id: string): void {
    event.stopPropagation();
    this.openCardMenuId = null;
    this.deleteCardTargetId = id;
    this.showDeleteCardModal = true;
    this.cdr.detectChanges();
  }

  closeDeleteCardModal(): void {
    this.showDeleteCardModal = false;
    this.deleteCardTargetId = null;
    this.cdr.detectChanges();
  }

  async confirmDeleteCard(): Promise<void> {
    if (!this.deleteCardTargetId) return;
    try {
      await firstValueFrom(this.communityService.deleteTopic(this.deleteCardTargetId));
      this.discussions = this.discussions.filter(d => d.id !== this.deleteCardTargetId);
      this.closeDeleteCardModal();
      this.cdr.detectChanges();
    } catch {
      this.closeDeleteCardModal();
      this.error = 'Erro ao eliminar discussão.';
      this.cdr.detectChanges();
      setTimeout(() => {
        this.error = null;
        this.cdr.detectChanges();
      }, 4000);
    }
  }

  navigateTo(path: string): void { this.router.navigate([path]); }
  navigateToDiscussion(id: string): void { this.router.navigate(['/forum/community/discussao', id]); }
}