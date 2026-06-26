import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router, ActivatedRoute } from '@angular/router';
import { HeaderComponent } from '../../../components/header/header';
import { FooterComponent } from '../../../components/footer/footer';
import { CommunityService, DiscussionTopic, CommunityCategory } from '../../../services/community.service';

interface ReferenceDoc { title: string; format: string; }

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
    private cdr: ChangeDetectorRef
  ) {}

  async ngOnInit(): Promise<void> {
    const categoryId = this.route.snapshot.paramMap.get('id');
    if (!categoryId) { this.router.navigate(['/forum/community']); return; }
    this.loadData(categoryId);
  }

  private async loadData(categoryId: string): Promise<void> {
    try {
      const [categories, topics] = await Promise.all([
        this.communityService.getCategories(),
        this.communityService.getTopics(),
      ]);
      this.category = categories.find(c => c.id === categoryId) ?? null;
      this.discussions = topics.filter(t => t.category_id === categoryId);
    } catch {
      this.error = 'Erro ao carregar categoria.';
    } finally {
      this.cdr.detectChanges();
    }
  }

  get categoryName(): string { return this.category?.name ?? '—'; }
  get categoryDescription(): string { return this.category?.description ?? ''; }
  get stats() {
    return {
      documents: this.discussions.length,
      results: this.discussions.reduce((t, d) => t + d.views_count, 0)
    };
  }

  getAuthorInitials(name: string): string {
    return name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase();
  }

  formatTimeAgo(dateStr: string): string {
    const diff = Date.now() - new Date(dateStr).getTime();
    const days = Math.floor(diff / 86400000);
    const hours = Math.floor(diff / 3600000);
    if (days > 0) return `há ${days} dia${days > 1 ? 's' : ''}`;
    if (hours > 0) return `há ${hours}h`;
    return 'recentemente';
  }

  navigateTo(path: string): void { this.router.navigate([path]); }
  startNewDiscussion(): void { this.router.navigate(['/forum/comunidade/criar-topico']); }
  viewDiscussion(id: string): void { this.router.navigate(['/forum/community/discussao', id]); }
}