import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
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
  doc: DocumentDetail | null = null;
  error: string | null = null;
  isAuthenticated = false;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private documentService: DocumentService,
    private authService: AuthService,
    private cdr: ChangeDetectorRef
  ) {}

  async ngOnInit(): Promise<void> {
    this.isAuthenticated = this.authService.isAuthenticated();
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) {
      this.router.navigate(['/contents']);
      return;
    }
    this.loadDocument(id);
  }

  private async loadDocument(id: string): Promise<void> {
    try {
      this.doc = await this.documentService.getDocument(id);
    } catch (err: any) {
      this.error = err?.message ?? 'Erro ao carregar documento.';
    } finally {
      this.cdr.detectChanges();
    }
  }

  async toggleLike(): Promise<void> {
    if (!this.doc) return;
    if (!this.isAuthenticated) {
      this.router.navigate(['/auth/login']);
      return;
    }
    try {
      if (this.doc.is_liked) {
        await this.documentService.unlikeDocument(this.doc.id);
        this.doc.is_liked = false;
        this.doc.likes_count--;
      } else {
        await this.documentService.likeDocument(this.doc.id);
        this.doc.is_liked = true;
        this.doc.likes_count++;
      }
      this.cdr.detectChanges();
    } catch {}
  }

  async toggleFavorite(): Promise<void> {
    if (!this.doc) return;
    if (!this.isAuthenticated) {
      this.router.navigate(['/auth/login']);
      return;
    }
    try {
      if (this.doc.is_favorited) {
        await this.documentService.unfavoriteDocument(this.doc.id);
        this.doc.is_favorited = false;
      } else {
        await this.documentService.favoriteDocument(this.doc.id);
        this.doc.is_favorited = true;
      }
      this.cdr.detectChanges();
    } catch {}
  }

  async onDownload(): Promise<void> {
    if (!this.doc) return;
    if (!this.isAuthenticated) {
      this.router.navigate(['/auth/login']);
      return;
    }
    try {
      const pdfUrl = await this.documentService.downloadDocument(this.doc.id);
      const url = pdfUrl ?? this.doc.pdf_url;
      if (url) window.open(url, '_blank');
    } catch {}
  }

  navigateTo(path: string): void {
    this.router.navigate([path]);
  }

  hasDocumentImage(): boolean {
    return !!this.doc?.cover_image_url?.trim();
  }

  getDocumentImage(): string {
    return this.doc?.cover_image_url ?? '';
  }

  getAcademicLevelLabel(): string {
    switch (this.doc?.academic_level) {
      case 'intro':     return 'Introdutório';
      case 'advanced':  return 'Investigação Avançada';
      case 'doctorate': return 'Arquivo de Doutoramento';
      default:          return '—';
    }
  }

  formatDate(date: string | null): string {
    if (!date) return '—';
    return new Date(date).toLocaleDateString('pt-PT', {
      day: 'numeric', month: 'long', year: 'numeric'
    });
  }
}