import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { HeaderComponent } from '../../../components/header/header';
import { FooterComponent } from '../../../components/footer/footer';
import { CommunityService, CommunityCategory } from '../../../services/community.service';
import { firstValueFrom } from 'rxjs';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-category-view',
  standalone: true,
  imports: [CommonModule, RouterModule, HeaderComponent, FooterComponent],
  templateUrl: './category-view.html',
  styleUrls: ['./category-view.css']
})
export class CategoryViewComponent implements OnInit {
  categories: CommunityCategory[] = [];
  error: string | null = null;
  isAuthenticated = false;

  constructor(
    private router: Router,
    private communityService: CommunityService,
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
      this.categories = result.ok && result.data ? result.data : [];
    } catch {
      this.error = 'Erro ao carregar categorias.';
    } finally {
      this.cdr.detectChanges();
    }
  }

  getCategoryColor(cat: CommunityCategory): { bg: string; text: string } {
    return { bg: cat.color_bg ?? '#E5E7EB', text: cat.color_text ?? '#1F2937' };
  }

  navigateTo(path: string): void { this.router.navigate([path]); }
}
