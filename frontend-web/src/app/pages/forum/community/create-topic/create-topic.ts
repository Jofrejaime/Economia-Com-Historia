import { CommonModule } from '@angular/common';
import { Component, OnDestroy } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { debounceTime, distinctUntilChanged, firstValueFrom, Subject, takeUntil } from 'rxjs';
import { HeaderComponent } from '../../../../components/header/header';
import { FooterComponent } from '../../../../components/footer/footer';
import {
  CommunityCategory,
  CreateTopicPayload,
  TopicMemberPayload,
  UserLookupResult,
} from '../../../../models/community.models';
import { CommunityService } from '../../../../services/community.service';

type TopicVisibility = 'PUBLIC' | 'RESTRICTED' | 'PRIVATE';
type MemberRole = 'member' | 'moderator';

interface SelectedMember {
  user: UserLookupResult;
  role: MemberRole;
}

@Component({
  selector: 'app-create-topic',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, HeaderComponent, FooterComponent],
  templateUrl: './create-topic.html',
  styleUrls: ['./create-topic.css']
})
export class CreateTopicComponent implements OnDestroy {
  title = '';
  selectedCategory = '';
  content = '';
  showPreview = false;
  visibility: TopicVisibility = 'RESTRICTED';
  selectedMembers: SelectedMember[] = [];
  memberSearch = '';
  memberSearchLoading = false;
  memberSearchError: string | null = null;
  memberSearchResults: UserLookupResult[] = [];
  canSearchUsers = false;
  private readonly memberSearchInput$ = new Subject<string>();
  private readonly destroy$ = new Subject<void>();
  submitting = false;
  message: string | null = null;
  errors: { title?: string; category?: string; content?: string; members?: string } = {};

  categories: CommunityCategory[] = [];

  constructor(
    private router: Router,
    private communityService: CommunityService,
  ) {}

  async ngOnInit(): Promise<void> {
    await this.loadCategories();
    this.loadDraft();

    this.canSearchUsers = true;

    this.memberSearchInput$
      .pipe(
        debounceTime(300),
        distinctUntilChanged(),
        takeUntil(this.destroy$),
      )
      .subscribe((value) => {
        void this.performMemberSearch(value);
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.memberSearchInput$.complete();
  }

  get selectedCategoryData(): CommunityCategory | undefined {
    return this.categories.find((category) => category.id === this.selectedCategory);
  }

  get selectedMemberCount(): number {
    return this.selectedMembers.length;
  }

  get visibilityLabel(): string {
    switch (this.visibility) {
      case 'PUBLIC':
        return 'Público';
      case 'PRIVATE':
        return 'Privado';
      default:
        return 'Restrito à Categoria';
    }
  }

  async loadCategories(): Promise<void> {
    const result = await firstValueFrom(this.communityService.getCategories());

    if (result.ok && result.data) {
      this.categories = result.data;
      return;
    }

    this.message = result.message || 'Não foi possível carregar as categorias.';
  }

  setVisibility(visibility: TopicVisibility): void {
    this.visibility = visibility;

    if (visibility !== 'PRIVATE') {
      this.selectedMembers = [];
      this.memberSearchResults = [];
      this.memberSearchError = null;
      this.memberSearch = '';
    }
  }

  async searchMembers(): Promise<void> {
    this.memberSearchInput$.next(this.memberSearch);
  }

  onMemberSearchInput(value: string): void {
    this.memberSearch = value;
    this.memberSearchInput$.next(value);
  }

  private async performMemberSearch(searchValue: string): Promise<void> {
    this.memberSearchError = null;

    if (this.visibility !== 'PRIVATE') {
      this.memberSearchResults = [];
      return;
    }

    if (!this.canSearchUsers) {
      this.memberSearchError = 'A API atual não expõe pesquisa pública de utilizadores. Registe esta pendência antes de usar convites avançados.';
      return;
    }

    const search = searchValue.trim();

    if (search.length < 2) {
      this.memberSearchResults = [];
      return;
    }

    this.memberSearchLoading = true;
    const result = await firstValueFrom(this.communityService.searchUsers(search, 10));
    this.memberSearchLoading = false;

    if (!result.ok || !result.data) {
      this.memberSearchResults = [];
      this.memberSearchError = result.message || 'Não foi possível pesquisar utilizadores.';
      return;
    }

    const selectedIds = new Set(this.selectedMembers.map((member) => member.user.id));
    this.memberSearchResults = result.data.filter((user) => !selectedIds.has(user.id));
  }

  addMember(user: UserLookupResult): void {
    if (this.selectedMembers.some((member) => member.user.id === user.id)) {
      return;
    }

    this.selectedMembers.push({ user, role: 'member' });
    this.memberSearchResults = this.memberSearchResults.filter((candidate) => candidate.id !== user.id);
    this.memberSearch = '';
    this.memberSearchError = null;
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
    }

    if (this.visibility === 'PRIVATE' && this.selectedMembers.length === 0) {
      newErrors.members = 'Adicione pelo menos um membro para um tópico privado';
    }

    this.errors = newErrors;
    return Object.keys(newErrors).length === 0;
  }

  async handleSubmit(event: Event): Promise<void> {
    event.preventDefault();

    if (!this.validate()) {
      return;
    }

    this.submitting = true;
    this.message = null;

    const payload: CreateTopicPayload = {
      category_id: this.selectedCategory,
      title: this.title.trim(),
      content: this.content.trim(),
      visibility: this.visibility,
    };

    if (this.visibility === 'PRIVATE') {
      const members: TopicMemberPayload[] = this.selectedMembers.map((member) => ({
        user_id: member.user.id,
        role: member.role,
      }));
      payload.members = members;
      payload.member_ids = members.map((member) => member.user_id);
    }

    const result = await firstValueFrom(this.communityService.createTopic(payload));
    this.submitting = false;

    if (!result.ok || !result.data) {
      this.message = result.message || 'Não foi possível criar o tópico.';
      return;
    }

    this.clearDraft();
    await this.router.navigate(['/forum/community/discussao', result.data.id]);
  }

  saveDraft(): void {
    if (!this.title.trim() && !this.content.trim() && !this.selectedCategory) {
      this.message = 'Não há conteúdo para guardar como rascunho.';
      return;
    }

    const draft = {
      title: this.title,
      category: this.selectedCategory,
      content: this.content,
      visibility: this.visibility,
      members: this.selectedMembers.map((member) => ({
        user: member.user,
        role: member.role,
      })),
      savedAt: new Date().toISOString(),
    };

    localStorage.setItem('topicDraft', JSON.stringify(draft));
    this.message = 'Rascunho guardado com sucesso.';
  }

  loadDraft(): void {
    const draft = localStorage.getItem('topicDraft');

    if (!draft) {
      return;
    }

    try {
      const data = JSON.parse(draft) as {
        title?: string;
        category?: string;
        content?: string;
        visibility?: TopicVisibility;
        members?: SelectedMember[];
      };

      this.title = data.title || '';
      this.selectedCategory = data.category || '';
      this.content = data.content || '';
      this.visibility = data.visibility || 'RESTRICTED';
      this.selectedMembers = Array.isArray(data.members) ? data.members : [];
    } catch {
      this.clearDraft();
    }
  }

  clearDraft(): void {
    localStorage.removeItem('topicDraft');
  }

  navigateTo(path: string): void {
    this.router.navigate([path]);
  }
}
