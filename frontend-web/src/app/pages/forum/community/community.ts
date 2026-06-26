import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { HeaderComponent } from '../../../components/header/header';
import { FooterComponent } from '../../../components/footer/footer';
import { CommunityService } from '../../../services/community.service';
import { CommunityCategory, DiscussionTopic } from '../../../models/community.models';

type TabType = 'recent' | 'popular' | 'pinned';

interface TopicCard {
  id: string;
  author: string;
  authorInitials: string;
  avatar: string;
  category: string;
  categoryColor: { bg: string; text: string };
  timeAgo: string;
  title: string;
  excerpt: string;
  replies: number;
  views: number;
  likes: number;
  isPinned: boolean;
  isPrivate: boolean;
}

interface CategoryCard {
  id: string;
  name: string;
  description: string;
  accessType: 'public' | 'jindungo' | 'restricted';
  members: number;
  topics: number;
  color: { bg: string; text: string };
  backgroundImage: string;
}

@Component({
  selector: 'app-community',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    HeaderComponent,
    FooterComponent
  ],
  templateUrl: './community.html',
  styleUrls: ['./community.css']
})
export class CommunityComponent implements OnInit {
  activeTab: TabType = 'recent';
  loading = false;
  errorMessage: string | null = null;

  discussions: TopicCard[] = [];
  categories: CategoryCard[] = [];
  featuredResearches: Array<{ date: string; title: string }> = [];

  constructor(
    private router: Router,
    private communityService: CommunityService,
  ) {}

  async ngOnInit(): Promise<void> {
    await this.loadCommunityData();
  }

  get filteredDiscussions(): TopicCard[] {
    if (this.activeTab === 'pinned') {
      return this.discussions.filter((discussion) => discussion.isPinned);
    }

    if (this.activeTab === 'popular') {
      return this.discussions.filter((discussion) => discussion.views > 100);
    }

    return this.discussions;
  }

  async loadCommunityData(): Promise<void> {
    this.loading = true;
    this.errorMessage = null;

    const [categoriesResult, topicsResult] = await Promise.all([
      firstValueFrom(this.communityService.getCategories()),
      firstValueFrom(this.communityService.getTopics({ per_page: 20 })),
    ]);

    if (categoriesResult.ok && categoriesResult.data) {
      this.categories = categoriesResult.data.map((category) => this.toCategoryCard(category));
    }

    if (!topicsResult.ok || !topicsResult.data) {
      this.errorMessage = topicsResult.message || 'Não foi possível carregar a comunidade.';
      this.discussions = [];
      this.featuredResearches = [];
      this.loading = false;
      return;
    }

    const topics = topicsResult.data.data ?? [];
    this.discussions = topics.map((topic) => this.toTopicCard(topic));
    this.featuredResearches = topics.slice(0, 3).map((topic) => ({
      date: this.formatDate(topic.created_at),
      title: topic.title,
    }));

    this.loading = false;
  }

  setActiveTab(tab: TabType): void {
    this.activeTab = tab;
  }

  getAccessBadge(accessType: string): { label: string; bg: string; text: string } {
    switch (accessType) {
      case 'jindungo':
        return { label: 'Jindungo', bg: '#ffd6a5', text: '#4a2c00' };
      case 'restricted':
        return { label: 'Restrito', bg: '#ffb3ba', text: '#5c0011' };
      default:
        return { label: 'Público', bg: '#d1fae5', text: '#065f46' };
    }
  }

  getTotalMembers(): number {
    return this.categories.reduce((total, category) => total + category.members, 0);
  }

  getTotalTopics(): number {
    return this.categories.reduce((total, category) => total + category.topics, 0);
  }

  requestAccess(discussionId: string): void {
    this.router.navigate(['/forum/community/discussao', discussionId]);
  }

  navigateTo(path: string): void {
    this.router.navigate([path]);
  }

  private toTopicCard(topic: DiscussionTopic): TopicCard {
    const authorName = topic.author?.display_name || topic.author?.full_name || topic.author?.email || 'Utilizador';
    const categoryName = topic.category?.name || 'Sem categoria';
    const categoryColor = this.pickCategoryColor(topic.category?.color_bg, topic.category?.color_text);

    return {
      id: topic.id,
      author: authorName,
      authorInitials: this.initialsFromName(authorName),
      avatar: topic.author?.id ? '#8b1e2d' : '#6b7280',
      category: categoryName.toUpperCase(),
      categoryColor,
      timeAgo: this.formatRelativeTime(topic.created_at),
      title: topic.title,
      excerpt: this.trimExcerpt(topic.content),
      replies: topic.replies_count,
      views: topic.views_count,
      likes: topic.likes_count,
      isPinned: topic.is_pinned,
      isPrivate: topic.visibility === 'PRIVATE',
    };
  }

  private toCategoryCard(category: CommunityCategory): CategoryCard {
    return {
      id: category.id,
      name: category.name,
      description: category.description || 'Categoria da comunidade',
      accessType: this.normalizeAccessType(category.access_level_id),
      members: category.members_count ?? 0,
      topics: category.topics_count ?? 0,
      color: {
        bg: category.color_bg || '#E5E7EB',
        text: category.color_text || '#1F2937',
      },
      backgroundImage: category.cover_image_url || this.placeholderImage(category.name),
    };
  }

  private normalizeAccessType(value: string): 'public' | 'jindungo' | 'restricted' {
    if (value === 'jindungo' || value === 'restricted') {
      return value;
    }

    return 'public';
  }

  private pickCategoryColor(bg?: string | null, text?: string | null): { bg: string; text: string } {
    return {
      bg: bg || '#E5E7EB',
      text: text || '#1F2937',
    };
  }

  private placeholderImage(label: string): string {
    const safeLabel = label.slice(0, 24);
    return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(`
      <svg xmlns="http://www.w3.org/2000/svg" width="800" height="400" viewBox="0 0 800 400">
        <defs>
          <linearGradient id="g" x1="0" x2="1" y1="0" y2="1">
            <stop offset="0%" stop-color="#8B1E2D"/>
            <stop offset="100%" stop-color="#1F2937"/>
          </linearGradient>
        </defs>
        <rect width="800" height="400" fill="url(#g)"/>
        <text x="50%" y="52%" fill="#FFFFFF" font-family="Arial, sans-serif" font-size="32" text-anchor="middle">${safeLabel}</text>
      </svg>
    `)}`;
  }

  private initialsFromName(value: string): string {
    return value
      .split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase() ?? '')
      .join('') || 'U';
  }

  private trimExcerpt(content: string): string {
    return content.length > 180 ? `${content.slice(0, 177)}...` : content;
  }

  private formatRelativeTime(createdAt: string): string {
    const created = new Date(createdAt);
    const diffMs = Date.now() - created.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);

    if (diffHours < 1) {
      return 'há instantes';
    }

    if (diffHours < 24) {
      return `há ${diffHours} hora(s)`;
    }

    if (diffDays < 30) {
      return `há ${diffDays} dia(s)`;
    }

    return this.formatDate(createdAt);
  }

  private formatDate(value: string): string {
    return new Intl.DateTimeFormat('pt-PT', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    }).format(new Date(value));
  }
}
