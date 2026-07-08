import { Component, OnInit, ViewEncapsulation, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { firstValueFrom } from 'rxjs';
import { Router, RouterModule } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HeaderComponent } from '../../../components/header/header';
import { FooterComponent } from '../../../components/footer/footer';
import { ProfileService, Badge, InterestAreaRef, UserLevel } from '../../../services/profile.service';
import { ToastService } from '../../../services/toast.service';
import { ProvinceAdminService } from '../../../services/province-admin.service';
import { InterestAreaAdminService } from '../../../services/interest-area-admin.service';
import { AuthService } from '../../../services/auth.service';
import { environment } from '../../../../environments/environment';

interface PointTransaction {
  points: number;
  reason: string;
  description: string | null;
  created_at: string;
}

interface UiState {
  isLoadingProfile: boolean;
  isLoadingStats: boolean;
  isEditingProfile: boolean;
  isChangingPassword: boolean;
  error: string | null;
}

interface Stat {
  label: string;
  value: string | number;
  unit?: string;
  subtext?: string;
  color?: string;
  bgColor?: string;
  rankBadge?: string;
  progress?: number | null;
}

@Component({
  selector: 'app-perfil',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule, HeaderComponent, FooterComponent],
  templateUrl: './perfil.html',
  styleUrls: ['./perfil.css'],
  encapsulation: ViewEncapsulation.None
})
export class PerfilComponent implements OnInit {
  // Estado da UI
  state: UiState = {
    isLoadingProfile: true,
    isLoadingStats: false,
    isEditingProfile: false,
    isChangingPassword: false,
    error: null
  };

  // Formulário de edição
  editForm!: FormGroup;

  // Formulário de alteração de palavra-passe
  passwordForm!: FormGroup;
  passwordError: string | null = null;
  savingPassword = false;

  // Avatar
  avatarPreview: string | null = null;
  avatarFile: File | null = null;
  avatarError: string | null = null;
  avatarPreviewTime: number = 0;

  // Valores numéricos reais das estatísticas (fontes: /me + endpoints "me")
  private statTotalPoints = 0;
  private statQuizzesCompleted = 0;
  private statCurrentLevel = 1;
  private statDocumentsRead = 0;

  // Placeholder de avatar: em vez de usar um data:image/svg+xml (que alguns
  // browsers/políticas de segurança recusam renderizar em <img>), usamos um
  // <div> com as iniciais do utilizador quando não há foto real.
  get hasRealAvatar(): boolean {
    return !!this.profileAvatarUrl;
  }

  get profileInitials(): string {
    const name = this.profileName || '?';
    return name.split(' ').map(n => n[0]).filter(Boolean).slice(0, 2).join('').toUpperCase();
  }

  // Lista de províncias de Angola — lista canónica (AngolaProvinces::all() no
  // backend); só usada como fallback se GET /provinces falhar.
  angolasProvinces = [
    'Bengo', 'Benguela', 'Bié', 'Cabinda', 'Cuando Cubango',
    'Cuanza Norte', 'Cuanza Sul', 'Cunene', 'Huambo', 'Huíla', 'Luanda',
    'Lunda Norte', 'Lunda Sul', 'Malanje', 'Moxico', 'Namibe', 'Uíge', 'Zaire'
  ].sort();

  // Dados do perfil (carregados do backend)
  profileName = '';
  profileStatus = '';
  profileBio: string[] = [];
  profileAvatarUrl = '';
  profileEmail = '';
  profileRole = '';
  profileFullName = '';
  profileWebsite = '';

  // Dados brutos do backend
  userData: any = null;
  profileData: any = null;
  profileError: string | null = null;

  // Estatísticas (carregadas do backend)
  stats: Stat[] = [];

  // Registo bruto de gamificação — usado para os contadores secundários
  // (tópicos criados, respostas, pontos da semana/mês) que não cabem nos
  // 4 cartões principais.
  userLevel: UserLevel | null = null;

  // Distinções realmente conquistadas (user_badges)
  badges: Badge[] = [];

  // Áreas de interesse seleccionadas (catálogo estruturado, distinto do
  // campo livre research_areas)
  interestAreas: InterestAreaRef[] = [];
  interestAreaCatalog: InterestAreaRef[] = [];
  selectedInterestAreaIds = new Set<string>();

  // Últimas transações de pontos (GET /me/point-transactions)
  recentActivity: PointTransaction[] = [];

  constructor(
    private router: Router,
    private profileService: ProfileService,
    private cdr: ChangeDetectorRef,
    private fb: FormBuilder,
    private toastService: ToastService,
    private provinceAdmin: ProvinceAdminService,
    private interestAreaAdmin: InterestAreaAdminService,
    private http: HttpClient,
    private authService: AuthService
  ) {
    // Inicializar formulário vazio
    this.editForm = this.fb.group({
      display_name: ['', [Validators.required, Validators.maxLength(100)]],
      full_name: ['', [Validators.maxLength(255)]],
      bio: ['', [Validators.maxLength(2000)]],
      institution: [''],
      province: [''],
      website_url: ['', [Validators.maxLength(500)]],
      research_areas: ['']  // ← String, não array
    });

    // Formulário de alteração de palavra-passe
    this.passwordForm = this.fb.group({
      current_password: ['', [Validators.required]],
      password: ['', [Validators.required, Validators.minLength(8)]],
      password_confirmation: ['', [Validators.required]],
    });
  }

  ngOnInit(): void {
    void this.loadProfile();
    void this.loadProvinces();
    void this.loadInterestAreaCatalog();
  }

  private async loadInterestAreaCatalog(): Promise<void> {
    try {
      const result = await firstValueFrom(this.interestAreaAdmin.getPublicInterestAreas());
      if (result.ok && result.data) {
        this.interestAreaCatalog = result.data;
        this.cdr.detectChanges();
      }
    } catch {
      // Sem catálogo disponível — o picker no modal fica simplesmente vazio.
    }
  }

  isInterestAreaSelected(id: string): boolean {
    return this.selectedInterestAreaIds.has(id);
  }

  toggleInterestArea(id: string): void {
    if (this.selectedInterestAreaIds.has(id)) {
      this.selectedInterestAreaIds.delete(id);
    } else {
      if (this.selectedInterestAreaIds.size >= 10) {
        this.toastService.info('Pode seleccionar no máximo 10 áreas de interesse.');
        return;
      }
      this.selectedInterestAreaIds.add(id);
    }
  }

  private async loadProvinces(): Promise<void> {
    try {
      const result = await firstValueFrom(this.provinceAdmin.getPublicProvinces());
      if (result.ok && result.data) {
        this.angolasProvinces = result.data.map((p: any) => p.name).sort();
        this.cdr.detectChanges();
      }
    } catch (e) {
      // Fallback is the hardcoded list
    }
  }

  private async loadProfile(): Promise<void> {
    this.state.isLoadingProfile = true;
    this.state.error = null;

    try {
      const me = await this.profileService.getMe();

      const profile = me?.profile ?? null;
      const user = me?.user as Record<string, unknown> | undefined;

      // Mapear dados do perfil para exibição
      this.mapProfileData(profile, user);

      // Dados de gamificação vêm numa chave irmã de /me (me.user_level),
      // não dentro de me.user — user_level é o registo da tabela user_levels.
      this.userLevel = me?.user_level ?? null;
      this.mapUserDataToStats(this.userLevel);
      this.buildStats();

      // Dados adicionais que já vêm na mesma resposta de /me
      this.badges = me?.badges ?? [];
      this.interestAreas = me?.interest_areas ?? [];
      this.selectedInterestAreaIds = new Set(this.interestAreas.map(a => a.id));

      // Pré-preencher formulário com dados atuais
      if (profile) {
        this.editForm.patchValue({
          display_name: profile.display_name || '',
          full_name: profile.full_name || '',
          bio: profile.bio || '',
          institution: profile.institution || '',
          province: profile.province || '',
          website_url: profile.website_url || '',
          research_areas: Array.isArray(profile.research_areas)
            ? profile.research_areas.join(', ')
            : ''
        });
      }

      // Armazenar dados brutos para referência
      this.userData = user;
      this.profileData = profile;

      this.state.error = null;

      // user_level só falta para um utilizador recém-criado sem registo de
      // gamificação ainda — nesse caso, e só nesse, tenta reconstruir os
      // números a partir do histórico bruto (/me/point-transactions,
      // /me/quiz-attempts).
      if (!me?.user_level) {
        void this.loadRealStats();
      }
      void this.loadRecentActivity();
    } catch (error) {
      this.profileError = this.getErrorMessage(error);
      this.state.error = this.profileError;
    } finally {
      this.state.isLoadingProfile = false;
      this.cdr.detectChanges();
    }
  }

  /**
   * Mapeia dados do backend para exibição de perfil
   */
  private mapProfileData(profile: any, user: any): void {
    // Nome - usar display_name ou email como fallback
    this.profileName = (profile?.display_name as string) ||
                       (user?.['email'] as string) ||
                       'Perfil Académico';

    // Status académico
    if (profile?.institution) {
      this.profileStatus = `ESTATUTO ACADÉMICO: ${profile.institution}`;
    } else {
      this.profileStatus = 'ESTATUTO ACADÉMICO: UTILIZADOR AUTENTICADO';
    }

    // Bio (quebra em linhas se necessário)
    if (profile?.bio) {
      this.profileBio = profile.bio.split('\n').filter((line: string) => line.trim());
      if (this.profileBio.length === 0) {
        this.profileBio = ['Seu perfil está sincronizado com a API.'];
      }
    } else {
      this.profileBio = ['Seu perfil está sincronizado com a API.'];
    }

    // Avatar — string vazia quando não há URL válido; o template decide
    // entre mostrar a <img> ou o placeholder de iniciais (hasRealAvatar).
    this.profileAvatarUrl = profile?.avatar_url || '';

    // Email e role (para referência interna)
    this.profileEmail = (user?.['email'] as string) || '';
    this.profileRole = (user?.['role'] as string) || '';

    this.profileFullName = (profile?.full_name as string) || '';
    this.profileWebsite = (profile?.website_url as string) || '';
  }

  /**
   * Extrai os números de gamificação de me.user_level — chave irmã de
   * me.user na resposta de /me, não um campo dentro de "user".
   */
  private mapUserDataToStats(userLevel: UserLevel | null): void {
    this.statTotalPoints      = Number(userLevel?.total_points ?? 0) || 0;
    this.statCurrentLevel     = Number(userLevel?.current_level ?? 1) || 1;
    this.statQuizzesCompleted = Number(userLevel?.quizzes_completed ?? 0) || 0;
    this.statDocumentsRead    = Number(userLevel?.documents_read ?? 0) || 0;
  }

  /**
   * Últimas 5 transações de pontos, para a secção "Atividade Recente" —
   * pedido independente do fallback de estatísticas, chamado sempre (não só
   * quando falta user_level).
   */
  private async loadRecentActivity(): Promise<void> {
    const token = this.authService.getToken();
    const headers = token ? this.authService.getAuthHeaders(token) : {};

    try {
      const res: any = await firstValueFrom(
        this.http.get(`${environment.apiBaseUrl}/api/me/point-transactions`, { headers, params: { per_page: 5 } })
      );
      const list: any[] = Array.isArray(res) ? res : (res?.data?.data ?? res?.data ?? []);

      this.recentActivity = list.slice(0, 5).map(t => ({
        points: Number(t.points) || 0,
        reason: t.reason ?? '',
        description: t.description ?? null,
        created_at: t.created_at,
      }));
      this.cdr.detectChanges();
    } catch { /* sem histórico disponível — secção fica com o estado vazio */ }
  }

  /**
   * Reconstrói os números a partir do histórico bruto, só usado quando
   * /me não trouxe user_level (utilizador ainda sem registo de gamificação).
   */
  private async loadRealStats(): Promise<void> {
    const token = this.authService.getToken();
    const headers = token ? this.authService.getAuthHeaders(token) : {};

    // ── Pontos ──────────────────────────────────────────────────────────
    if (this.statTotalPoints === 0) {
      try {
        const res: any = await firstValueFrom(
          this.http.get(`${environment.apiBaseUrl}/api/me/point-transactions`, { headers })
        );
        const list: any[] = Array.isArray(res) ? res : (res?.data?.data ?? res?.data ?? []);
        const statsTotal = res?.stats?.total_points ?? res?.data?.stats?.total_points;

        this.statTotalPoints = typeof statsTotal === 'number'
          ? statsTotal
          : list.reduce((sum, t) => sum + (Number(t.points) || 0), 0);
      } catch { /* mantém 0 */ }
    }

    // ── Quizzes concluídos ──────────────────────────────────────────────
    if (this.statQuizzesCompleted === 0) {
      try {
        const res: any = await firstValueFrom(
          this.http.get(`${environment.apiBaseUrl}/api/me/quiz-attempts`, { headers })
        );
        const list: any[] = Array.isArray(res) ? res : (res?.data?.data ?? res?.data ?? []);
        const metaTotal = res?.meta?.total ?? res?.data?.meta?.total;

        const completed = list.filter(a =>
          ['completed', 'passed', 'graded', 'finished'].includes(String(a.status ?? '').toLowerCase())
          || !!a.completed_at
        );

        this.statQuizzesCompleted = completed.length > 0
          ? completed.length
          : (typeof metaTotal === 'number' ? metaTotal : list.length);
      } catch { /* mantém 0 */ }
    }

    this.buildStats();
    this.cdr.detectChanges();
  }

  /** Constrói o array de cards a partir dos valores numéricos atuais. */
  private buildStats(): void {
    const progressPercentage = Math.min((this.statCurrentLevel / 5) * 100, 100);

    this.stats = [
      {
        label: 'PONTUAÇÃO ACADÉMICA TOTAL',
        value: this.statTotalPoints.toLocaleString(),
        unit: 'pts',
        color: '#6b0119',
        progress: progressPercentage
      },
      {
        label: 'QUESTIONÁRIOS CONCLUÍDOS',
        value: this.statQuizzesCompleted,
        unit: 'de 200',
        color: '#8b1e2d',
        progress: Math.min((this.statQuizzesCompleted / 200) * 100, 100)
      },
      {
        label: 'NÍVEL ATUAL',
        value: this.statCurrentLevel,
        subtext: `de 5 níveis`,
        rankBadge: this.getLevelName(this.statCurrentLevel),
        color: 'white',
        bgColor: '#8b1e2d',
        progress: null
      },
      {
        label: 'DOCUMENTOS LIDOS',
        value: this.statDocumentsRead,
        unit: 'arquivos',
        color: '#574142',
        progress: Math.min((this.statDocumentsRead / 50) * 100, 100)
      }
    ];
  }

  /**
   * Retorna o nome do nível baseado no número
   */
  private getLevelName(level: number): string {
    const levelNames: { [key: number]: string } = {
      1: 'Iniciante',
      2: 'Aprendiz',
      3: 'Especialista',
      4: 'Mestre',
      5: 'Arquivista'
    };
    return levelNames[level] || 'Iniciante';
  }

  /**
   * Retorna mensagem de erro apropriada
   */
  private getErrorMessage(error: any): string {
    if (error?.status === 401) {
      return 'Sessão expirada. Por favor, faça login novamente.';
    }
    if (error?.status === 403) {
      return 'Sem permissão para aceder a este perfil.';
    }
    if (error?.status === 404) {
      return 'Perfil não encontrado.';
    }
    if (error?.status === 422) {
      return error?.error?.message ?? 'Dados inválidos.';
    }
    if (error?.status === 500) {
      return 'Erro do servidor. Tente novamente mais tarde.';
    }
    if (error instanceof Error) {
      return error.message;
    }
    return 'Falha ao carregar o perfil.';
  }

  /**
   * Navegar para uma rota
   */
  navigateTo(path: string): void {
    this.router.navigate([path]);
  }

  /**
   * Abrir modal de edição de perfil
   */
  openEditProfileModal(): void {
    this.state.isEditingProfile = true;
    this.cdr.detectChanges();
  }

  /**
   * Fecha o modal de edição de perfil.
   */
  closeEditProfileModal(): void {
    this.state.isEditingProfile = false;
    this.cdr.detectChanges();
  }

  // ==========================================
  // ALTERAÇÃO DE PALAVRA-PASSE
  // ==========================================
  openPasswordModal(): void {
    this.passwordForm.reset();
    this.passwordError = null;
    this.state.isChangingPassword = true;
    this.cdr.detectChanges();
  }

  closePasswordModal(): void {
    this.state.isChangingPassword = false;
    this.passwordError = null;
    this.cdr.detectChanges();
  }

  /**
   * Requisitos de complexidade que o backend exige (Password::min(8)
   * ->mixedCase()->numbers()->symbols()) — mostrados em tempo real para que
   * o utilizador não descubra só depois de submeter.
   */
  get passwordRequirements(): { label: string; met: boolean }[] {
    const value: string = this.passwordForm?.get('password')?.value || '';
    return [
      { label: 'Pelo menos 8 caracteres', met: value.length >= 8 },
      { label: 'Uma letra maiúscula e uma minúscula', met: /[a-z]/.test(value) && /[A-Z]/.test(value) },
      { label: 'Pelo menos um número', met: /[0-9]/.test(value) },
      { label: 'Pelo menos um símbolo (ex: ! @ # $)', met: /[^A-Za-z0-9]/.test(value) },
    ];
  }

  async submitPasswordChange(): Promise<void> {
    this.passwordError = null;

    if (!this.passwordForm.valid) {
      this.passwordForm.markAllAsTouched();
      this.passwordError = 'Preencha todos os campos corretamente.';
      this.cdr.detectChanges();
      return;
    }

    const { current_password, password, password_confirmation } = this.passwordForm.value;

    if (password !== password_confirmation) {
      this.passwordError = 'A confirmação não coincide com a nova palavra-passe.';
      this.cdr.detectChanges();
      return;
    }

    this.savingPassword = true;
    this.cdr.detectChanges();

    try {
      await this.profileService.updatePassword({ current_password, password, password_confirmation });

      this.toastService.success('Palavra-passe alterada com sucesso!');
      this.closePasswordModal();
    } catch (error: any) {
      // error.errors (adicionado por ProfileService.normalizeError) traz as
      // mensagens específicas por campo que o Laravel devolve — sem isto só
      // víamos o texto genérico "The given data was invalid."
      const fieldErrors: Record<string, string[]> | undefined = error?.errors;
      this.passwordError = fieldErrors?.['current_password']?.[0]
        ?? fieldErrors?.['password']?.[0]
        ?? error?.message
        ?? 'Erro ao alterar a palavra-passe.';
    } finally {
      this.savingPassword = false;
      this.cdr.detectChanges();
    }
  }

  /** Navega para a página de preferências de notificações. */
  goToNotificationPreferences(): void {
    this.router.navigate(['/auth/notification-preferences']);
  }

  /**
   * Salvar mudanças do perfil
   */
  async saveProfileChanges(): Promise<void> {
    if (!this.editForm.valid) {
      this.state.error = 'Por favor, preencha todos os campos obrigatórios corretamente.';
      this.cdr.detectChanges();
      return;
    }

    this.state.isLoadingStats = true;
    this.state.error = null;
    this.cdr.detectChanges();

    try {
      let updates = this.editForm.value;

      // Converter research_areas de string para array
      if (typeof updates.research_areas === 'string') {
        updates.research_areas = updates.research_areas
          .split(',')
          .map((area: string) => area.trim())
          .filter((area: string) => area.length > 0);
      }

      // Limitar a 10 áreas
      if (Array.isArray(updates.research_areas) && updates.research_areas.length > 10) {
        updates.research_areas = updates.research_areas.slice(0, 10);
      }

      updates.interest_area_ids = Array.from(this.selectedInterestAreaIds);

      // Salvar dados do perfil
      const result = await this.profileService.updateProfile(updates);
      if (result.interest_areas) {
        this.interestAreas = result.interest_areas;
      }

      // Se houver novo avatar, fazer upload
      if (this.avatarFile) {
        const response = await this.profileService.updateAvatar(this.avatarFile);
        if (response?.avatar_url) {
          this.profileAvatarUrl = response.avatar_url + '?t=' + Date.now();
          if (this.profileData) {
            this.profileData.avatar_url = response.avatar_url;
          }
        }
        this.avatarPreview = null;
        this.avatarFile = null;
        this.avatarPreviewTime = 0;
      }

      // Atualizar dados locais com os valores do form
      this.profileData = { ...this.profileData, ...updates };
      this.mapProfileData(this.profileData, this.userData);

      this.cdr.detectChanges();

      this.closeEditProfileModal();
      this.toastService.success('Perfil atualizado com sucesso!');
    } catch (error) {
      const errorMsg = this.getErrorMessage(error);
      this.state.error = errorMsg;
      this.toastService.error(errorMsg);
    } finally {
      this.state.isLoadingStats = false;
      this.cdr.detectChanges();
    }
  }

  /**
   * Descartar mudanças e fechar modal
   */
  discardChanges(): void {
    if (this.profileData) {
      this.editForm.patchValue({
        display_name: this.profileData.display_name || '',
        full_name: this.profileData.full_name || '',
        bio: this.profileData.bio || '',
        institution: this.profileData.institution || '',
        province: this.profileData.province || '',
        website_url: this.profileData.website_url || '',
        research_areas: Array.isArray(this.profileData.research_areas)
          ? this.profileData.research_areas.join(', ')
          : ''
      });
    }
    this.selectedInterestAreaIds = new Set(this.interestAreas.map(a => a.id));
    this.avatarPreview = null;
    this.avatarFile = null;
    this.avatarError = null;
    this.avatarPreviewTime = 0;
    this.closeEditProfileModal();
  }

  /**
   * Retorna a URL correta do avatar (preview ou atual)
   */
  getAvatarSrc(): string {
    if (this.avatarPreview) {
      return this.avatarPreview;
    }
    return this.profileAvatarUrl;
  }

  /**
   * Quando usuário seleciona arquivo de avatar
   */
  onAvatarSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];

    if (!file) {
      return;
    }

    this.avatarError = null;

    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      this.avatarError = 'Tipo de arquivo não permitido. Use JPG, PNG ou WebP.';
      this.cdr.detectChanges();
      return;
    }

    const maxSize = 5 * 1024 * 1024; // 5MB em bytes
    if (file.size > maxSize) {
      this.avatarError = 'Arquivo muito grande. Máximo 5MB.';
      this.cdr.detectChanges();
      return;
    }

    const reader = new FileReader();

    reader.onload = (e: any) => {
      const result = e.target?.result;
      if (result && typeof result === 'string') {
        this.avatarPreview = result;
        this.avatarPreviewTime = Date.now();
        this.cdr.detectChanges();
      }
    };

    reader.onerror = () => {
      this.avatarError = 'Erro ao ler arquivo. Tente novamente.';
      this.cdr.detectChanges();
    };

    reader.readAsDataURL(file);
    this.avatarFile = file;
  }

  /**
   * Limpar seleção de avatar
   */
  clearAvatarSelection(): void {
    this.avatarPreview = null;
    this.avatarFile = null;
    this.avatarError = null;
    this.avatarPreviewTime = 0;
    this.cdr.detectChanges();
  }

  /**
   * Chamado quando a <img> do avatar falha ao carregar (link morto, 403, etc.).
   */
  onAvatarLoadError(event: Event): void {
    (event.target as HTMLImageElement).style.display = 'none';
    this.profileAvatarUrl = '';
    this.cdr.detectChanges();
  }

  /**
   * Atualizar perfil manualmente (chamada explícita, ex: botão de refresh)
   */
  refreshProfile(): void {
    this.profileService.getMe().then(me => {
      const profile = me?.profile ?? null;
      const user = me?.user as Record<string, unknown> | undefined;

      if (profile) {
        this.profileData = profile;
        this.mapProfileData(profile, user);
        this.cdr.detectChanges();
      }
    }).catch(error => {
      // Silenciosamente falhar em background, sem mostrar erro
    });
  }
}