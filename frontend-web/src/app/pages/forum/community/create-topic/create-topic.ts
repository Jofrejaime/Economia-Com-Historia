import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Router, RouterModule } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { HeaderComponent } from '../../../../components/header/header';
import { FooterComponent } from '../../../../components/footer/footer';
import { CommunityCategory, CommunityService, TopicVisibility } from '../../../../services/community.service';
import { environment } from '../../../../../environments/environment';
import { AuthService } from '../../../../services/auth.service';

type MemberRole = 'member' | 'moderator';

interface SelectedMember {
  user: {
    id: string;
    display_name: string | null;
    full_name: string | null;
    institution: string | null;
  };
  role: MemberRole;
}

interface Participant {
  id: string;
  name: string;
  display_name?: string | null;
  full_name?: string | null;
  email: string;
  initials: string;
  avatarColor: string;
  institution?: string;
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
  memberSearchResults: Participant[] = [];
  memberSearchLoading = false;
  memberSearchError: string | null = null;

  allParticipants: Participant[] = [
    { id: '1', name: 'Ana Silva', email: 'ana.silva@universidade.ao', initials: 'AS', avatarColor: '#8B1E2D' },
    { id: '2', name: 'Carlos Santos', email: 'carlos.santos@universidade.ao', initials: 'CS', avatarColor: '#1F2937' },
    { id: '3', name: 'Maria Costa', email: 'maria.costa@universidade.ao', initials: 'MC', avatarColor: '#9CA3AF' },
    { id: '4', name: 'João Mendes', email: 'joao.mendes@universidade.ao', initials: 'JM', avatarColor: '#8B1E2D' },
    { id: '5', name: 'Paula Ferreira', email: 'paula.ferreira@universidade.ao', initials: 'PF', avatarColor: '#1F2937' },
    { id: '6', name: 'Miguel Rodrigues', email: 'miguel.rodrigues@universidade.ao', initials: 'MR', avatarColor: '#9CA3AF' },
  ];

  constructor(
    private router: Router,
    private communityService: CommunityService,
    private http: HttpClient,
    private authService: AuthService
  ) {
    this.memberSearchResults = [...this.allParticipants];
  }

  async ngOnInit(): Promise<void> {
    try {
      const result = await firstValueFrom(this.communityService.getCategories());
      this.categories = result.ok && result.data ? result.data : [];
    } catch {
      this.categories = [];
    } finally {
      this.isLoadingCategories = false;
    }
  }

  get selectedCategoryData(): CommunityCategory | undefined {
    return this.categories.find((cat) => cat.id === this.selectedCategory);
  }

  get selectedMemberCount(): number {
    return this.selectedMembers.length;
  }

  get canSearchUsers(): boolean {
    return this.visibility === 'INVITE_ONLY';
  }

  get visibilityLabel(): string {
    switch (this.visibility) {
      case 'PUBLIC':
        return 'Público: qualquer utilizador pode ver o tópico';
      case 'CATEGORY':
        return 'Categoria: visibilidade herdada do acesso da categoria';
      case 'INVITE_ONLY':
        return 'Por convite: apenas owner, moderadores e membros convidados';
      default:
        return this.visibility;
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
      return;
    }

    this.filterParticipants();
  }

  onMemberSearchInput(value: string): void {
    this.memberSearch = value;
    this.memberSearchError = null;
    this.filterParticipants();
  }

  searchMembers(): void {
    const search = this.memberSearch.trim();
    if (search.length > 0 && search.length < 2) {
      this.memberSearchError = 'A pesquisa requer pelo menos 2 caracteres.';
      this.memberSearchResults = [];
      return;
    }

    this.filterParticipants();
  }

  addMember(user: Participant): void {
    if (this.selectedMembers.some((member) => member.user.id === user.id)) {
      return;
    }

    this.selectedMembers = [
      ...this.selectedMembers,
      {
        user: {
          id: user.id,
          display_name: user.name,
          full_name: user.name,
          institution: user.institution ?? null,
        },
        role: 'member',
      },
    ];
  }

  removeMember(userId: string): void {
    this.selectedMembers = this.selectedMembers.filter((member) => member.user.id !== userId);
  }

  updateMemberRole(userId: string, role: MemberRole): void {
    const member = this.selectedMembers.find((item) => item.user.id === userId);
    if (member) {
      member.role = role;
    }
  }

  togglePreview(): void {
    this.showPreview = !this.showPreview;
  }

  validate(): boolean {
    const newErrors: { title?: string; category?: string; content?: string; members?: string } = {};

    if (!this.title.trim()) {
      newErrors.title = 'O título é obrigatório';
    } else if (this.title.length < 10) {
      newErrors.title = 'O título deve ter pelo menos 10 caracteres';
    } else if (this.title.length > 255) {
      newErrors.title = 'O título não pode exceder 255 caracteres';
    }

    if (!this.selectedCategory) {
      newErrors.category = 'Por favor, selecione uma categoria';
    }

    if (!this.content.trim()) {
      newErrors.content = 'O conteúdo é obrigatório';
    } else if (this.content.length < 50) {
      newErrors.content = 'O conteúdo deve ter pelo menos 50 caracteres';
    } else if (this.content.length > 5000) {
      newErrors.content = 'O conteúdo não pode exceder 5000 caracteres';
    }

    if (this.visibility === 'INVITE_ONLY' && this.selectedMembers.length === 0) {
      newErrors.members = 'Adicione pelo menos um membro para tópicos por convite.';
    }

    this.errors = newErrors;
    return Object.keys(newErrors).length === 0;
  }

  async handleSubmit(event: Event): Promise<void> {
    event.preventDefault();
    if (!this.validate() || this.isSubmitting) return;

    this.isSubmitting = true;
    this.message = null;

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
            visibility: this.toBackendVisibility(this.visibility),
            members: this.visibility === 'INVITE_ONLY'
              ? this.selectedMembers.map((member) => ({
                  user_id: member.user.id,
                  role: member.role,
                }))
              : undefined,
          },
          { headers }
        )
      );
      this.router.navigate(['/forum/community/discussao', res.data.id]);
    } catch (err: any) {
      this.message = err?.error?.message ?? 'Erro ao publicar tópico.';
    } finally {
      this.isSubmitting = false;
    }
  }

  saveDraft(): void {
    this.message = 'Rascunho guardado localmente.';
  }

  navigateTo(path: string): void {
    this.router.navigate([path]);
  }

  getCategoryColor(cat: CommunityCategory): { bg: string; text: string } {
    return { bg: cat.color_bg ?? '#E5E7EB', text: cat.color_text ?? '#1F2937' };
  }

  private filterParticipants(): void {
    const search = this.memberSearch.toLowerCase().trim();
    const selectedIds = new Set(this.selectedMembers.map((member) => member.user.id));

    if (!search) {
      this.memberSearchResults = this.allParticipants.filter((participant) => !selectedIds.has(participant.id));
      return;
    }

    this.memberSearchResults = this.allParticipants.filter((participant) => {
      if (selectedIds.has(participant.id)) {
        return false;
      }

      return participant.name.toLowerCase().includes(search)
        || participant.email.toLowerCase().includes(search)
        || (participant.institution ?? '').toLowerCase().includes(search);
    });
  }

  private toBackendVisibility(value: TopicVisibility): 'PUBLIC' | 'RESTRICTED' | 'PRIVATE' {
    switch (value) {
      case 'PUBLIC':
        return 'PUBLIC';
      case 'INVITE_ONLY':
        return 'PRIVATE';
      case 'CATEGORY':
      default:
        return 'RESTRICTED';
    }
  }
}
