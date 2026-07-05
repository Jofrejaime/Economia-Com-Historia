import { CommonModule } from '@angular/common';
import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { HeaderComponent } from '../../../../components/header/header';
import { FooterComponent } from '../../../../components/footer/footer';
import { CommunityCategory, CommunityService, TopicVisibility } from '../../../../services/community.service';
import { environment } from '../../../../../environments/environment';
import { AuthService } from '../../../../services/auth.service';

interface SelectedMember {
  user: {
    id: string;
    display_name: string | null;
    full_name: string | null;
    institution: string | null;
  };
}

interface UserSearchResult {
  id: string;
  display_name: string | null;
  full_name: string | null;
  avatar_url: string | null;
  institution: string | null;
}

interface DocumentSearchResult {
  id: string;
  title: string;
  category?: { name: string } | null;
}

@Component({
  selector: 'app-create-topic',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, HeaderComponent, FooterComponent],
  templateUrl: './create-topic.html',
  styleUrls: ['./create-topic.css']
})
export class CreateTopicComponent implements OnInit {
  title = '';
  selectedCategory = '';
  content = '';
  showPreview = false;
  isSubmitting = false;
  message: string | null = null;
  errors: { title?: string; category?: string; content?: string; members?: string } = {};

  categories: CommunityCategory[] = [];
  isLoadingCategories = true;

  visibility: TopicVisibility = 'PUBLIC';
  selectedMembers: SelectedMember[] = [];
  memberSearch = '';
  memberSearchResults: UserSearchResult[] = [];
  memberSearchLoading = false;
  memberSearchError: string | null = null;

  // Documento relacionado (opcional — a coluna document_id em discussion_topics é 1:N)
  selectedDocument: DocumentSearchResult | null = null;
  documentSearch = '';
  documentSearchResults: DocumentSearchResult[] = [];
  documentSearchLoading = false;
  documentSearchError: string | null = null;

  private searchTimer: any = null;
  private documentSearchTimer: any = null;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private communityService: CommunityService,
    private http: HttpClient,
    private authService: AuthService,
    private cdr: ChangeDetectorRef
  ) {}

  async ngOnInit(): Promise<void> {
    this.loadCategories();
    this.prefillDocumentFromQuery();
  }

  private async loadCategories(): Promise<void> {
    try {
      const result = await firstValueFrom(this.communityService.getCategories());
      this.categories = result.ok && result.data ? result.data : [];
    } catch {
      this.categories = [];
    } finally {
      this.isLoadingCategories = false;
      this.cdr.detectChanges();
    }
  }

  /**
   * Se a página for aberta a partir de um conteúdo
   * (ex: /forum/community/criar?document_id=xxx&document_title=yyy),
   * pré-seleciona esse documento.
   */
  private prefillDocumentFromQuery(): void {
    const documentId = this.route.snapshot.queryParamMap.get('document_id');
    if (!documentId) return;

    const documentTitle = this.route.snapshot.queryParamMap.get('document_title');
    if (documentTitle) {
      this.selectedDocument = { id: documentId, title: documentTitle };
      this.cdr.detectChanges();
      return;
    }

    // Sem título na query: busca o documento à API para mostrar o nome.
    // GET /documents/{id} é público (autenticação opcional).
    this.http
      .get<any>(`${environment.apiBaseUrl}/api/documents/${documentId}`)
      .subscribe({
        next: res => {
          const data = res?.data ?? res;
          this.selectedDocument = {
            id: documentId,
            title: data?.title ?? 'Conteúdo selecionado',
          };
          this.cdr.detectChanges();
        },
        error: () => {
          this.selectedDocument = { id: documentId, title: 'Conteúdo selecionado' };
          this.cdr.detectChanges();
        },
      });
  }

  get selectedCategoryData(): CommunityCategory | undefined {
    return this.categories.find(cat => cat.id === this.selectedCategory);
  }

  get selectedMemberCount(): number {
    return this.selectedMembers.length;
  }

  get canSearchUsers(): boolean {
    return this.visibility === 'INVITE_ONLY';
  }

  get visibilityLabel(): string {
    switch (this.visibility) {
      case 'PUBLIC':      return 'Público: qualquer utilizador pode ver o tópico';
      case 'INVITE_ONLY': return 'Por convite: apenas o autor e os membros convidados';
      default:            return this.visibility;
    }
  }

  setVisibility(visibility: TopicVisibility): void {
    this.visibility = visibility;
    this.message = null;
    if (visibility !== 'INVITE_ONLY') {
      this.selectedMembers = [];
      this.memberSearch = '';
      this.memberSearchResults = [];
      this.memberSearchError = null;
    }
    this.cdr.detectChanges();
  }

  onMemberSearchInput(value: string): void {
    this.memberSearch = value;
    this.memberSearchError = null;
    clearTimeout(this.searchTimer);

    if (value.trim().length < 2) {
      this.memberSearchResults = [];
      this.cdr.detectChanges();
      return;
    }

    this.searchTimer = setTimeout(() => this.searchMembers(), 400);
  }

  async searchMembers(): Promise<void> {
    const q = this.memberSearch.trim();
    if (q.length < 2) {
      this.memberSearchError = 'A pesquisa requer pelo menos 2 caracteres.';
      this.memberSearchResults = [];
      this.cdr.detectChanges();
      return;
    }

    this.memberSearchLoading = true;
    this.memberSearchError = null;
    this.cdr.detectChanges();

    try {
      const token = this.authService.getToken();
      const headers = token ? this.authService.getAuthHeaders(token) : {};

      // endpoint devolve array directo, não { data: [] }
      const results = await firstValueFrom(
        this.http.get<UserSearchResult[]>(
          `${environment.apiBaseUrl}/api/users/search?q=${encodeURIComponent(q)}`,
          { headers }
        )
      );

      const selectedIds = new Set(this.selectedMembers.map(m => m.user.id));
      this.memberSearchResults = (results ?? []).filter(u => !selectedIds.has(u.id));
    } catch {
      this.memberSearchError = 'Erro ao pesquisar utilizadores.';
      this.memberSearchResults = [];
    } finally {
      this.memberSearchLoading = false;
      this.cdr.detectChanges();
    }
  }

  addMember(user: UserSearchResult): void {
    if (this.selectedMembers.some(m => m.user.id === user.id)) return;
    this.selectedMembers = [
      ...this.selectedMembers,
      {
        user: {
          id: user.id,
          display_name: user.display_name,
          full_name: user.full_name,
          institution: user.institution,
        },
      },
    ];
    this.memberSearchResults = this.memberSearchResults.filter(u => u.id !== user.id);
    this.cdr.detectChanges();
  }

  removeMember(userId: string): void {
    this.selectedMembers = this.selectedMembers.filter(m => m.user.id !== userId);
    this.cdr.detectChanges();
  }

  // ==========================================
  // DOCUMENTO RELACIONADO
  // ==========================================
  onDocumentSearchInput(value: string): void {
    this.documentSearch = value;
    this.documentSearchError = null;
    clearTimeout(this.documentSearchTimer);

    if (value.trim().length < 2) {
      this.documentSearchResults = [];
      this.cdr.detectChanges();
      return;
    }

    this.documentSearchTimer = setTimeout(() => this.searchDocuments(), 400);
  }

  async searchDocuments(): Promise<void> {
    const q = this.documentSearch.trim();
    if (q.length < 2) {
      this.documentSearchError = 'A pesquisa requer pelo menos 2 caracteres.';
      this.documentSearchResults = [];
      this.cdr.detectChanges();
      return;
    }

    this.documentSearchLoading = true;
    this.documentSearchError = null;
    this.cdr.detectChanges();

    try {
      // GET /documents é público (autenticação opcional)
      const res = await firstValueFrom(
        this.http.get<any>(
          `${environment.apiBaseUrl}/api/documents?search=${encodeURIComponent(q)}&per_page=8`
        )
      );

      // aceita tanto { data: [...] } como array directo
      const list: any[] = Array.isArray(res) ? res : (res?.data ?? []);

      this.documentSearchResults = list
        .map(d => ({
          id: d.id,
          title: d.title,
          category: d.category ?? null,
        }))
        .filter(d => d.id !== this.selectedDocument?.id);
    } catch {
      this.documentSearchError = 'Erro ao pesquisar conteúdos.';
      this.documentSearchResults = [];
    } finally {
      this.documentSearchLoading = false;
      this.cdr.detectChanges();
    }
  }

  selectDocument(document: DocumentSearchResult): void {
    this.selectedDocument = document;
    this.documentSearch = '';
    this.documentSearchResults = [];
    this.cdr.detectChanges();
  }

  clearSelectedDocument(): void {
    this.selectedDocument = null;
    this.cdr.detectChanges();
  }

  togglePreview(): void {
    this.showPreview = !this.showPreview;
  }

  getUserInitials(user: { display_name?: string | null; full_name?: string | null }): string {
    const name = user.display_name || user.full_name || '?';
    return name.split(' ').map((n: string) => n[0]).slice(0, 2).join('').toUpperCase();
  }

  validate(): boolean {
    const errs: { title?: string; category?: string; content?: string; members?: string } = {};

    if (!this.title.trim()) {
      errs.title = 'O título é obrigatório';
    } else if (this.title.length < 10) {
      errs.title = 'O título deve ter pelo menos 10 caracteres';
    } else if (this.title.length > 255) {
      errs.title = 'O título não pode exceder 255 caracteres';
    }

    if (!this.selectedCategory) {
      errs.category = 'Por favor, selecione uma categoria';
    }

    if (!this.content.trim()) {
      errs.content = 'O conteúdo é obrigatório';
    } else if (this.content.length < 50) {
      errs.content = 'O conteúdo deve ter pelo menos 50 caracteres';
    } else if (this.content.length > 5000) {
      errs.content = 'O conteúdo não pode exceder 5000 caracteres';
    }

    if (this.visibility === 'INVITE_ONLY' && this.selectedMembers.length === 0) {
      errs.members = 'Adicione pelo menos um membro para tópicos por convite.';
    }

    this.errors = errs;
    return Object.keys(errs).length === 0;
  }

  async handleSubmit(event: Event): Promise<void> {
    event.preventDefault();
    if (!this.validate() || this.isSubmitting) return;

    this.isSubmitting = true;
    this.message = null;
    this.cdr.detectChanges();

    try {
      const token = this.authService.getToken();
      const headers = token ? this.authService.getAuthHeaders(token) : {};
      const res = await firstValueFrom(
        this.http.post<{ data: { id: string } }>(
          `${environment.apiBaseUrl}/api/topics`,
          {
            category_id: this.selectedCategory,
            title: this.title,
            content: this.content,
            visibility: this.visibility,
            member_ids: this.visibility === 'INVITE_ONLY'
              ? this.selectedMembers.map(m => m.user.id)
              : undefined,
            document_id: this.selectedDocument?.id ?? undefined,
          },
          { headers }
        )
      );
      this.router.navigate(['/forum/community/discussao', res.data.id]);
    } catch (err: any) {
      this.message = err?.error?.message ?? 'Erro ao publicar tópico.';
      this.cdr.detectChanges();
    } finally {
      this.isSubmitting = false;
      this.cdr.detectChanges();
    }
  }

  saveDraft(): void {
    this.message = 'Funcionalidade de rascunho ainda não disponível.';
    this.cdr.detectChanges();
  }

  navigateTo(path: string): void {
    this.router.navigate([path]);
  }

  getCategoryColor(cat: CommunityCategory): { bg: string; text: string } {
    return { bg: cat.color_bg ?? '#E5E7EB', text: cat.color_text ?? '#1F2937' };
  }
}