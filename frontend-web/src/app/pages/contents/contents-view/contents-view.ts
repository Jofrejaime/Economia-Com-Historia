import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule, ActivatedRoute } from '@angular/router';
import { HeaderComponent } from '../../../components/header/header';
import { FooterComponent } from '../../../components/footer/footer';
import { DocumentService, DocumentDetail } from '../../../services/document.service';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-contents-view',
  standalone: true,
  imports: [CommonModule, RouterModule, HeaderComponent, FooterComponent],
  templateUrl: './contents-view.html',
  styleUrls: ['./contents-view.css']
})
export class ContentsViewComponent implements OnInit {
  document: DocumentDetail | null = null;
  isLoading = true;
  error: string | null = null;
  isAuthenticated = false;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private documentService: DocumentService,
    private authService: AuthService
  ) {}

  async ngOnInit(): Promise<void> {
    this.isAuthenticated = this.authService.isAuthenticated();
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) {
      this.router.navigate(['/contents']);
      return;
    }
    await this.loadDocument(id);
  }

  async loadDocument(id: string): Promise<void> {
    try {
      this.document = await this.documentService.getDocument(id);
    } catch (err: any) {
      this.error = err?.message ?? 'Erro ao carregar documento.';
    } finally {
      this.isLoading = false;
    }
  }

  async toggleLike(): Promise<void> {
    if (!this.document || !this.isAuthenticated) return;
    try {
      if (this.document.is_liked) {
        await this.documentService.unlikeDocument(this.document.id);
        this.document.is_liked = false;
        this.document.likes_count--;
      } else {
        await this.documentService.likeDocument(this.document.id);
        this.document.is_liked = true;
        this.document.likes_count++;
      }
    } catch {}
  }

  async toggleFavorite(): Promise<void> {
    if (!this.document || !this.isAuthenticated) return;
    try {
      if (this.document.is_favorited) {
        await this.documentService.unfavoriteDocument(this.document.id);
        this.document.is_favorited = false;
      } else {
        await this.documentService.favoriteDocument(this.document.id);
        this.document.is_favorited = true;
      }
    } catch {}
  }

async onDownload(): Promise<void> {
  if (!this.document || !this.isAuthenticated) return;
  try {
    const pdfUrl = await this.documentService.downloadDocument(this.document.id);
    const url = pdfUrl ?? this.document.pdf_url;
    if (url) {
      window.open(url, '_blank');
    }
  } catch {}
}

  navigateTo(path: string): void {
    this.router.navigate([path]);
  }

  getDocumentImage(): string {
    return this.document?.cover_image_url ?? 'assets/images/document-placeholder.jpg';
  }

  getAcademicLevelLabel(): string {
    switch (this.document?.academic_level) {
      case 'intro': return 'Introdutório';
      case 'advanced': return 'Investigação Avançada';
      case 'doctorate': return 'Arquivo de Doutoramento';
      default: return '—';
    }
  }

  formatDate(date: string | null): string {
    if (!date) return '—';
    return new Date(date).toLocaleDateString('pt-PT', {
      day: 'numeric', month: 'long', year: 'numeric'
    });
  }
}