import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { HeaderComponent } from '../../../components/header/header';
import { FooterComponent } from '../../../components/footer/footer';
import { CommunityService, CommunityCategory } from '../../../services/community.service';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { AuthService } from '../../../services/auth.service';

interface CategoryWithStatus extends CommunityCategory {
  requestStatus: 'none' | 'pending' | 'approved';
}

@Component({
  selector: 'app-category-view',
  standalone: true,
  imports: [CommonModule, RouterModule, HeaderComponent, FooterComponent],
  templateUrl: './category-view.html',
  styleUrls: ['./category-view.css']
})
export class CategoryViewComponent implements OnInit {
  categories: CategoryWithStatus[] = [];
  error: string | null = null;
  isAuthenticated = false;

  constructor(
    private router: Router,
    private communityService: CommunityService,
    private http: HttpClient,
    private authService: AuthService,
    private cdr: ChangeDetectorRef
  ) {}

  async ngOnInit(): Promise<void> {
    this.isAuthenticated = await this.authService.ensureSession();
    this.loadCategories();
  }

  private async loadCategories(): Promise<void> {
    try {
      const result = await firstValueFrom(this.communityService.getCategories());
      const cats = result.ok && result.data ? result.data : [];
      this.categories = cats.map(c => ({ ...c, requestStatus: 'none' as const }));
    } catch {
      this.error = 'Erro ao carregar categorias.';
    } finally {
      this.cdr.detectChanges();
    }
  }

  async handleRequestAccess(categoryId: string, accessLevelId: string): Promise<void> {
    if (!this.isAuthenticated) {
      this.router.navigate(['/auth/login']);
      return;
    }

    try {
      const token = this.authService.getToken();
      const headers = token ? this.authService.getAuthHeaders(token) : {};
      await firstValueFrom(
        this.http.post(`${environment.apiBaseUrl}/api/access-requests`, { access_level_id: accessLevelId }, { headers })
      );
      const cat = this.categories.find(c => c.id === categoryId);
      if (cat) cat.requestStatus = accessLevelId === 'public' ? 'approved' : 'pending';
      this.cdr.detectChanges();
    } catch (err: any) {
      alert(err?.error?.message ?? 'Erro ao solicitar acesso.');
    }
  }

  getAccessBadge(accessLevelId: string): { label: string; bg: string; text: string } {
    switch (accessLevelId) {
      case 'jindungo':   return { label: 'Jindungo', bg: '#ffd6a5', text: '#4a2c00' };
      case 'restricted': return { label: 'Restrito', bg: '#ffb3ba', text: '#5c0011' };
      default:           return { label: 'Público',  bg: '#d1fae5', text: '#065f46' };
    }
  }

  getCategoryColor(cat: CommunityCategory): { bg: string; text: string } {
    return { bg: cat.color_bg ?? '#E5E7EB', text: cat.color_text ?? '#1F2937' };
  }

  canNavigate(category: CategoryWithStatus): boolean {
    return category.access_level_id === 'public' || category.requestStatus === 'approved';
  }

  navigateTo(path: string): void { this.router.navigate([path]); }
}