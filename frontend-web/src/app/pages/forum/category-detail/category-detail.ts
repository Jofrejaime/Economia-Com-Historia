import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router, ActivatedRoute } from '@angular/router';
import { HeaderComponent } from '../../../components/header/header';
import { FooterComponent } from '../../../components/footer/footer';
import { CommunityService, DiscussionTopic, CommunityCategory } from '../../../services/community.service';
import { AuthService } from '../../../services/auth.service';
import { firstValueFrom } from 'rxjs';

interface ReferenceDoc { title: string; format: string; }

interface CategoryStats {
  documents: number;
  results: number;
}

@Component({
  selector: 'app-category-detail',
  standalone: true,
  imports: [CommonModule, RouterModule, HeaderComponent, FooterComponent],
  templateUrl: './category-detail.html',
  styleUrls: ['./category-detail.css']
})
export class CategoryDetailComponent implements OnInit {
  category: CommunityCategory | null = null;
  discussions: DiscussionTopic[] = [];
  error: string | null = null;
  isAuthenticated = false;

  stats: CategoryStats = { documents: 0, results: 0 };

  curator = {
    name: 'Dr. Carlos Lopes',
    role: 'Especialista em Economia Política',
    quote: '"A nossa moeda é o reflexo da nossa história política e social."'
  };

  referenceDocs: ReferenceDoc[] = [
    { title: 'Relatório Anual BNA (1977)', format: 'PDF' },
    { title: 'Estatutos do Banco de Angola', format: 'PDF' },
    { title: 'História do Escudo em Angola', format: 'ARTIGO' }
  ];

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private communityService: CommunityService,
    private authService: AuthService,
    private cdr: ChangeDetectorRef
  ) {}

  async ngOnInit(): Promise<void> {
    this.isAuthenticated = await this.authService.ensureSession();

    const categoryId = this.route.snapshot.paramMap.get('id');
    if (!categoryId) { this.router.navigate(['/forum/community']); return; }
    this.loadData(categoryId);
  }

  private async loadData(categoryId: string): Promise<void> {
    try {
      const [categoriesResult, topicsResult] = await Promise.all([
        firstValueFrom(this.communityService.getCategories()),
        firstValueFrom(this.communityService.getTopics({ category_id: categoryId, per_page: 50 })),
      ]);

      const categories = categoriesResult.ok && categoriesResult.data ? categoriesResult.data : [];
      const topics = topicsResult.ok && topicsResult.data ? topicsResult.data.data : [];

      this.category = categories.find(c => c.id === categoryId) ?? null;
      this.discussions = topics;

      this.stats = {
        documents: this.discussions.length,
        results: this.discussions.reduce((t, d) => t + d.views_count, 0)
      };
    } catch {
      this.error = 'Erro ao carregar categoria.';
    } finally {
      this.cdr.detectChanges();
    }
  }

  get categoryName(): string { return this.category?.name ?? '—'; }
  get categoryDescription(): string { return this.category?.description ?? ''; }

  getAuthorInitials(name: string): string {
    return name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase();
  }

  formatTimeAgo(dateStr: string): string {
    const diff  = Date.now() - new Date(dateStr).getTime();
    const days  = Math.floor(diff / 86400000);
    const hours = Math.floor(diff / 3600000);
    if (days > 0)  return `há ${days} dia${days > 1 ? 's' : ''}`;
    if (hours > 0) return `há ${hours}h`;
    return 'recentemente';
  }

  navigateTo(path: string): void { this.router.navigate([path]); }

  startNewDiscussion(): void {
    if (!this.isAuthenticated) {
      this.router.navigate(['/auth/login']);
      return;
    }
    this.router.navigate(['/forum/comunidade/criar-topico']);
  }

  viewDiscussion(id: string): void { this.router.navigate(['/forum/community/discussao', id]); }
}