import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { HeaderComponent } from '../../../../components/header/header';
import { FooterComponent } from '../../../../components/footer/footer';
import { CommunityService, CommunityCategory } from '../../../../services/community.service';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../../../../environments/environment';
import { AuthService } from '../../../../services/auth.service';

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
  errors: { title?: string; category?: string; content?: string; participants?: string } = {};

  categories: CommunityCategory[] = [];
  isLoadingCategories = true;

  // ===== MOCK: privacy/participantes (a ligar à API mais tarde) =====
  topicPrivacy: 'public' | 'private' = 'public';
  selectedParticipants: string[] = [];
  participantSearch = '';

  allParticipants = [
    { id: '1', name: 'Ana Silva', email: 'ana.silva@universidade.ao', initials: 'AS', avatarColor: '#8B1E2D' },
    { id: '2', name: 'Carlos Santos', email: 'carlos.santos@universidade.ao', initials: 'CS', avatarColor: '#1F2937' },
    { id: '3', name: 'Maria Costa', email: 'maria.costa@universidade.ao', initials: 'MC', avatarColor: '#9CA3AF' },
    { id: '4', name: 'João Mendes', email: 'joao.mendes@universidade.ao', initials: 'JM', avatarColor: '#8B1E2D' },
    { id: '5', name: 'Paula Ferreira', email: 'paula.ferreira@universidade.ao', initials: 'PF', avatarColor: '#1F2937' },
    { id: '6', name: 'Miguel Rodrigues', email: 'miguel.rodrigues@universidade.ao', initials: 'MR', avatarColor: '#9CA3AF' },
  ];

  filteredParticipants = [...this.allParticipants];

  constructor(
    private router: Router,
    private communityService: CommunityService,
    private http: HttpClient,
    private authService: AuthService
  ) {}

  async ngOnInit(): Promise<void> {
    try {
      this.categories = await this.communityService.getCategories();
    } catch {
      this.categories = [];
    } finally {
      this.isLoadingCategories = false;
    }
  }

  get selectedCategoryData(): CommunityCategory | undefined {
    return this.categories.find(cat => cat.id === this.selectedCategory);
  }

  // ===== MOCK: participantes =====
  filterParticipants(): void {
    const search = this.participantSearch.toLowerCase().trim();
    if (!search) {
      this.filteredParticipants = [...this.allParticipants];
      return;
    }
    this.filteredParticipants = this.allParticipants.filter(p =>
      p.name.toLowerCase().includes(search) ||
      p.email.toLowerCase().includes(search)
    );
  }

  toggleParticipant(id: string): void {
    const index = this.selectedParticipants.indexOf(id);
    if (index === -1) {
      this.selectedParticipants.push(id);
    } else {
      this.selectedParticipants.splice(index, 1);
    }
  }

  isParticipantSelected(id: string): boolean {
    return this.selectedParticipants.includes(id);
  }

  validate(): boolean {
    const newErrors: { title?: string; category?: string; content?: string; participants?: string } = {};

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

    this.errors = newErrors;
    return Object.keys(newErrors).length === 0;
  }

  async handleSubmit(event: Event): Promise<void> {
    event.preventDefault();
    if (!this.validate() || this.isSubmitting) return;

    this.isSubmitting = true;
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
          },
          { headers }
        )
      );
      this.router.navigate(['/forum/community/discussao', res.data.id]);
    } catch (err: any) {
      const msg = err?.error?.message ?? 'Erro ao publicar tópico.';
      alert(msg);
    } finally {
      this.isSubmitting = false;
    }
  }

  navigateTo(path: string): void {
    this.router.navigate([path]);
  }

  getCategoryColor(cat: CommunityCategory): { bg: string; text: string } {
    return { bg: cat.color_bg ?? '#E5E7EB', text: cat.color_text ?? '#1F2937' };
  }
}