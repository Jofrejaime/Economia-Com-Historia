import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { HeaderComponent } from '../../../components/header/header';
import { FooterComponent } from '../../../components/footer/footer';
import { CommunityCategory, CommunityService, DiscussionTopic } from '../../../services/community.service';

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
  isLoading = true;
  error: string | null = null;

  loading = false;
  errorMessage: string | null = null;
  featuredResearches = [
    { date: '12 Mar 1975', title: 'Os documentos fundadores do BNA e a política fiscal inicial.' },
    { date: '08 Fev 1982', title: 'Mudanças monetárias durante o período de transição.' },
    { date: '22 Nov 1990', title: 'Linhas de crédito garantidas por petróleo: Uma análise histórica.' },
  ];

  constructor(
    private router: Router,
    private communityService: CommunityService
  ) {}

  async ngOnInit(): Promise<void> {
    try {
      const [categoriesResult, topicsResult] = await Promise.all([
        firstValueFrom(this.communityService.getCategories()),
        firstValueFrom(this.communityService.getTopics()),
      ]);

      this.categories = categoriesResult.ok && categoriesResult.data ? categoriesResult.data : [];
      this.discussions = topicsResult.ok && topicsResult.data ? topicsResult.data.data : [];
    } catch (err) {
      this.error = 'Erro ao carregar a comunidade.';
    } finally {
      this.isLoading = false;
    }
  }

  get filteredDiscussions(): DiscussionTopic[] {
    if (this.activeTab === 'pinned') {
      return this.discussions.filter((discussion) => discussion.is_pinned);
    }

    if (this.activeTab === 'popular') {
      return [...this.discussions].sort((a, b) => b.views_count - a.views_count);
    }

    return [...this.discussions].sort(
      (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
  }

  get totalMembers(): number {
    return this.categories.reduce((total, category) => total + (category.members_count ?? 0), 0);
  }

  get totalTopics(): number {
    return this.categories.reduce((total, category) => total + (category.topics_count ?? 0), 0);
  }

  async loadCommunityData(): Promise<void> {
    this.loading = true;
    this.errorMessage = null;

    const [categoriesResult, topicsResult] = await Promise.all([
      firstValueFrom(this.communityService.getCategories()),
      firstValueFrom(this.communityService.getTopics({ per_page: 20 })),
    ]);

    if (categoriesResult.ok && categoriesResult.data) {
      this.categories = categoriesResult.data;
    }

    if (!topicsResult.ok || !topicsResult.data) {
      this.errorMessage = topicsResult.message || 'Não foi possível carregar a comunidade.';
      this.discussions = [];
      this.featuredResearches = [];
      this.loading = false;
      return;
    }

    this.discussions = topicsResult.data.data ?? [];
    this.featuredResearches = this.discussions.slice(0, 3).map((topic) => ({
      date: this.formatDate(topic.created_at),
      title: topic.title,
    }));

    this.loading = false;
  }

  setActiveTab(tab: TabType): void {
    this.activeTab = tab;
  }

  getAccessBadge(accessLevelId: string): { label: string; bg: string; text: string } {
    switch (accessLevelId) {
      case 'jindungo': return { label: 'Jindungo', bg: '#ffd6a5', text: '#4a2c00' };
      case 'restricted': return { label: 'Restrito', bg: '#ffb3ba', text: '#5c0011' };
      default: return { label: 'Público', bg: '#d1fae5', text: '#065f46' };
    }
  }

  getAuthorInitials(name: string): string {
    return name.split(' ').map((part) => part[0]).slice(0, 2).join('').toUpperCase();
  }

  getAvatarColor(id: string): string {
    return id.charCodeAt(0) % 2 === 0 ? '#8b1e2d' : '#6b0119';
  }

  formatTimeAgo(dateStr: string): string {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    const hours = Math.floor(mins / 60);
    const days = Math.floor(hours / 24);
    if (days > 0) return `há ${days} dia${days > 1 ? 's' : ''}`;
    if (hours > 0) return `há ${hours} hora${hours > 1 ? 's' : ''}`;
    return `há ${mins} min`;
  }

  getCategoryColor(cat: CommunityCategory | null | undefined): { bg: string; text: string } {
    return {
      bg: cat?.color_bg ?? '#E5E7EB',
      text: cat?.color_text ?? '#1F2937',
    };
  }

  navigateTo(path: string): void {
    this.router.navigate([path]);
  }

  navigateToDiscussion(id: string): void {
    this.router.navigate(['/forum/community/discussao', id]);
  }

  private formatDate(value: string): string {
    return new Intl.DateTimeFormat('pt-PT', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    }).format(new Date(value));
  }
}
