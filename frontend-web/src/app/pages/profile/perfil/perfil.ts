import { Component, OnInit, ViewEncapsulation, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { firstValueFrom } from 'rxjs';
import { Router, RouterModule } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HeaderComponent } from '../../../components/header/header';
import { FooterComponent } from '../../../components/footer/footer';
import { ProfileService } from '../../../services/profile.service';
import { ToastService } from '../../../services/toast.service';
import { ProvinceAdminService } from '../../../services/province-admin.service';
import { AuthService } from '../../../services/auth.service';
import { environment } from '../../../../environments/environment';

interface Merit {
  iconPath: string;
  iconViewBox: string;
  title: string;
  description: string[];
  id?: string;
  progress?: string;
  isActive: boolean;
}

interface Content {
  id: string;
  title: string;
  type: string;
  date: string;
  views: number;
  category: string;
  description: string;
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

  // Lista de províncias de Angola
  angolasProvinces = [
    'Luanda', 'Bengo', 'Benguela', 'Bié', 'Cabinda', 'Cuando Cubango',
    'Cuanza Norte', 'Cuanza Sul', 'Cunene', 'Huambo', 'Huíla', 'Kuando Kubango',
    'Kwanza Norte', 'Kwanza Sul', 'Malanje', 'Moxico', 'Namibe', 'Uíge', 'Zaire'
  ].sort();

  // Dados do perfil (carregados do backend)
  profileName = '';
  profileStatus = '';
  profileBio: string[] = [];
  profileAvatarUrl = '';
  profileEmail = '';
  profileRole = '';

  // Dados brutos do backend
  userData: any = null;
  profileData: any = null;
  profileError: string | null = null;

  // Estatísticas (carregadas do backend)
  stats: Stat[] = [];

  // Méritos e Distinções (dinâmicos do backend - aguardando endpoint)
  merits: Merit[] = [];

  // Configurações de conta (dinâmicas do backend - aguardando endpoint)
  settings: { privacy: Array<{label: string; checked: boolean}>; notifications: Array<{label: string; checked: boolean}> } = {
    privacy: [],
    notifications: []
  };

  // Conteúdos criados (dinâmicos do backend - aguardando endpoint)
  userContents: Content[] = [];

  constructor(
    private router: Router,
    private profileService: ProfileService,
    private cdr: ChangeDetectorRef,
    private fb: FormBuilder,
    private toastService: ToastService,
    private provinceAdmin: ProvinceAdminService,
    private http: HttpClient,
    private authService: AuthService
  ) {
    // Inicializar formulário vazio
    this.editForm = this.fb.group({
      display_name: ['', [Validators.required, Validators.maxLength(100)]],
      bio: ['', [Validators.maxLength(2000)]],
      institution: [''],
      province: [''],
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

      // Mapear dados do utilizador para estatísticas (base: /me)
      if (user) {
        this.mapUserDataToStats(user);
      }
      this.buildStats();

      // Carregar dados adicionais (méritos, conteúdos, configurações)
      await this.loadAdditionalData();

      // Pré-preencher formulário com dados atuais
      if (profile) {
        this.editForm.patchValue({
          display_name: profile.display_name || '',
          bio: profile.bio || '',
          institution: profile.institution || '',
          province: profile.province || '',
          research_areas: Array.isArray(profile.research_areas)
            ? profile.research_areas.join(', ')
            : ''
        });
      }

      // Armazenar dados brutos para referência
      this.userData = user;
      this.profileData = profile;

      this.state.error = null;
    } catch (error) {
      this.profileError = this.getErrorMessage(error);
      this.state.error = this.profileError;
    } finally {
      this.state.isLoadingProfile = false;
      this.cdr.detectChanges();
    }

    // Depois do render inicial, busca os números reais aos endpoints /me/*
    // (não bloqueia o carregamento do perfil).
    void this.loadRealStats();
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
  }

  /**
   * Extrai os números de gamificação do objeto user devolvido por /me.
   * Suporta as várias formas possíveis do payload (user_levels, user_level,
   * levels, gamification), porque o nome da relação varia consoante o
   * controller a incluir ou não.
   */
  private mapUserDataToStats(user: any): void {
    const levels = user.user_levels ?? user.user_level ?? user.levels ?? user.gamification ?? {};

    this.statTotalPoints      = Number(levels.total_points ?? levels.points ?? 0) || 0;
    this.statCurrentLevel     = Number(levels.current_level ?? levels.level ?? 1) || 1;
    this.statQuizzesCompleted = Number(levels.quizzes_completed ?? 0) || 0;
    this.statDocumentsRead    = Number(levels.documents_read ?? 0) || 0;
  }

  /**
   * Complementa os números com dados reais dos endpoints "me":
   * - GET /api/me/point-transactions → total de pontos (soma das transações)
   * - GET /api/me/quiz-attempts      → tentativas concluídas
   * Só substitui o valor base quando este está a zero (evita "regredir"
   * valores corretos vindos de /me com contagens de páginas parciais).
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
   * Carrega dados adicionais do backend (méritos, conteúdos, configurações)
   */
  private async loadAdditionalData(): Promise<void> {
    try {
      // TODO: Implementar endpoints no backend para:
      // 1. GET /api/profile/merits - Retornar méritos do utilizador
      // 2. GET /api/profile/contents - Retornar conteúdos criados
      this.merits = [];
      this.userContents = [];
      this.settings = {
        privacy: [],
        notifications: []
      };
    } catch (error) {
      // Falhar silenciosamente se não conseguir carregar dados adicionais
    }
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
      const token = this.authService.getToken();
      const headers = token ? this.authService.getAuthHeaders(token) : {};

      await firstValueFrom(
        this.http.put(
          `${environment.apiBaseUrl}/api/profile/password`,
          { current_password, password, password_confirmation },
          { headers }
        )
      );

      this.toastService.success('Palavra-passe alterada com sucesso!');
      this.closePasswordModal();
    } catch (error: any) {
      this.passwordError = error?.error?.message
        ?? (error?.status === 422 ? 'Palavra-passe atual incorreta ou nova palavra-passe inválida.' : 'Erro ao alterar a palavra-passe.');
    } finally {
      this.savingPassword = false;
      this.cdr.detectChanges();
    }
  }

  /** Navega para a página de preferências de notificações. */
  goToNotificationPreferences(): void {
    this.router.navigate(['/auth/perfil/notificacoes']);
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

      // Salvar dados do perfil
      await this.profileService.updateProfile(updates);

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
        bio: this.profileData.bio || '',
        institution: this.profileData.institution || '',
        province: this.profileData.province || '',
        research_areas: this.profileData.research_areas || []
      });
    }
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
   * Descarregar portfólio
   */
  downloadPortfolio(): void {
    // TODO: Implementar download de portfólio
    this.toastService.info('Funcionalidade de download em desenvolvimento.');
  }

  /**
   * Desativar conta
   */
  deactivateAccount(): void {
    const confirm = window.confirm(
      'Tem certeza que deseja desativar sua conta? Esta ação é irreversível.'
    );

    if (confirm) {
      // TODO: Implementar desativação de conta
      this.toastService.info('Funcionalidade de desativação em desenvolvimento.');
    }
  }

  /**
   * Toggle de configuração de privacidade
   */
  togglePrivacySetting(index: number): void {
    this.settings.privacy[index].checked = !this.settings.privacy[index].checked;
    this.cdr.detectChanges();
    // TODO: Salvar no backend via SettingsService
  }

  /**
   * Toggle de configuração de notificações
   */
  toggleNotificationSetting(index: number): void {
    this.settings.notifications[index].checked = !this.settings.notifications[index].checked;
    this.cdr.detectChanges();
    // TODO: Salvar no backend via SettingsService
  }

  /**
   * Toggle genérico de configuração
   */
  toggleSetting(settingType: string, index: number): void {
    if (settingType === 'privacy') {
      this.togglePrivacySetting(index);
    } else if (settingType === 'notifications') {
      this.toggleNotificationSetting(index);
    }
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