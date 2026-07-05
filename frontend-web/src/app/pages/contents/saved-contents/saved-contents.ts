import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { HeaderComponent } from '../../../components/header/header';
import { FooterComponent } from '../../../components/footer/footer';
import { DocumentService, Document } from '../../../services/document.service';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-saved-contents',
  standalone: true,
  imports: [CommonModule, RouterModule, HeaderComponent, FooterComponent],
  templateUrl: './saved-contents.html',
  styleUrls: ['./saved-contents.css']
})
export class SavedContentsComponent implements OnInit {
  favorites: Document[] = [];
  loading = true;
  error: string | null = null;
  removingId: string | null = null;

  constructor(
    private router: Router,
    private documentService: DocumentService,
    private authService: AuthService,
    private cdr: ChangeDetectorRef
  ) {}

  async ngOnInit(): Promise<void> {
    // Página exclusiva de utilizadores autenticados
    if (!this.authService.isAuthenticated()) {
      this.router.navigate(['/auth/login']);
      return;
    }
    await this.loadFavorites();
  }

  private async loadFavorites(): Promise<void> {
    this.loading = true;
    this.error = null;

    try {
      this.favorites = await this.documentService.getFavorites();
    } catch (err: any) {
      this.error = err?.error?.message ?? 'Erro ao carregar os conteúdos guardados.';
    } finally {
      this.loading = false;
      this.cdr.detectChanges();
    }
  }

  /**
   * Remove dos favoritos com atualização otimista:
   * o cartão sai logo da lista; se a API falhar, volta.
   */
  async removeFavorite(doc: Document, event: MouseEvent): Promise<void> {
    event.stopPropagation(); // não navegar para o detalhe ao clicar em remover
    if (this.removingId) return;

    this.removingId = doc.id;
    const previous = this.favorites;
    this.favorites = this.favorites.filter(f => f.id !== doc.id);
    this.cdr.detectChanges();

    try {
      await this.documentService.unfavoriteDocument(doc.id);
    } catch {
      // reverte se a API falhar
      this.favorites = previous;
      this.error = 'Não foi possível remover o conteúdo dos guardados.';
    } finally {
      this.removingId = null;
      this.cdr.detectChanges();
    }
  }

  navigateToDocument(id: string): void {
    this.router.navigate(['/contents/view', id]);
  }

  navigateTo(path: string): void {
    this.router.navigate([path]);
  }
}