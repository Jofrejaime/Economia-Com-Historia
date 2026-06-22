import { Component, OnInit, ViewEncapsulation, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HeaderComponent } from '../../../components/header/header';
import { FooterComponent } from '../../../components/footer/footer';
import { ProfileService } from '../../../services/profile.service';
import { ToastService } from '../../../services/toast.service';

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
    error: null
  };

  // Formulário de edição
  editForm!: FormGroup;

  // Avatar
  avatarPreview: string | null = null;
  avatarFile: File | null = null;
  avatarError: string | null = null;
  avatarPreviewTime: number = 0;

  // Lista de províncias de Angola
  angolasProvinces = [
    'Luanda', 'Bengo', 'Benguela', 'Bié', 'Cabinda', 'Cuando Cubango',
    'Cuanza Norte', 'Cuanza Sul', 'Cunene', 'Huambo', 'Huíla', 'Kuando Kubango',
    'Kwanza Norte', 'Kwanza Sul', 'Malanje', 'Moxico', 'Namibe', 'Uíge', 'Zaire'
  ].sort();

  // Dados do perfil
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
  
  // Estatísticas
  stats: Stat[] = [];

  // Méritos e Distinções
  merits: Merit[] = [];

  // Configurações de conta
  settings: { privacy: Array<{label: string; checked: boolean}>; notifications: Array<{label: string; checked: boolean}> } = {
    privacy: [],
    notifications: []
  };

  // Conteúdos criados
  userContents: Content[] = [];

  constructor(
    private router: Router,
    private profileService: ProfileService,
    private cdr: ChangeDetectorRef,
    private fb: FormBuilder,
    private toastService: ToastService
  ) {
    this.editForm = this.fb.group({
      display_name: ['', [Validators.required, Validators.maxLength(100)]],
      full_name: [''],
      institution: [''],
      province: [''],
      bio: ['', [Validators.maxLength(2000)]],
      research_areas: [''],
      website_url: [''],
      avatar_url: ['']
    });
    
    // Carregar avatar do localStorage
    this.loadAvatarFromStorage();
  }

  ngOnInit(): void {
    this.loadProfile();
  }

  // ============================================
  // LOCALSTORAGE - AVATAR
  // ============================================

  private loadAvatarFromStorage(): void {
    try {
      const savedAvatar = localStorage.getItem('profile_avatar');
      if (savedAvatar) {
        this.avatarPreview = savedAvatar;
        this.profileAvatarUrl = savedAvatar;
        this.editForm.patchValue({ avatar_url: savedAvatar });
      }
    } catch (error) {
      // Falhar silenciosamente
    }
  }

  private saveAvatarToStorage(avatarData: string): void {
    try {
      localStorage.setItem('profile_avatar', avatarData);
    } catch (error) {
      // Falhar silenciosamente
    }
  }

  private removeAvatarFromStorage(): void {
    try {
      localStorage.removeItem('profile_avatar');
    } catch (error) {
      // Falhar silenciosamente
    }
  }

  // ============================================
  // LOAD PROFILE
  // ============================================

  private async loadProfile(): Promise<void> {
    this.state.isLoadingProfile = true;
    this.state.error = null;

    try {
      const me = await this.profileService.getMe();

      const profile = me?.profile ?? null;
      const user = me?.user as Record<string, unknown> | undefined;

      this.mapProfileData(profile, user);

      if (user) {
        this.mapUserDataToStats(user);
      }

      await this.loadAdditionalData();

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
  }

  // ============================================
  // MAP PROFILE DATA
  // ============================================

  private mapProfileData(profile: any, user: any): void {
    this.profileName = (profile?.display_name as string) || 
                       (user?.['email'] as string) || 
                       'Perfil Académico';

    if (profile?.institution) {
      this.profileStatus = `ESTATUTO ACADÉMICO: ${profile.institution}`;
    } else {
      this.profileStatus = 'ESTATUTO ACADÉMICO: UTILIZADOR AUTENTICADO';
    }

    if (profile?.bio) {
      this.profileBio = profile.bio.split('\n').filter((line: string) => line.trim());
      if (this.profileBio.length === 0) {
        this.profileBio = ['Seu perfil está sincronizado com a API.'];
      }
    } else {
      this.profileBio = ['Seu perfil está sincronizado com a API.'];
    }

    // Verificar localStorage primeiro
    const savedAvatar = localStorage.getItem('profile_avatar');
    if (savedAvatar) {
      this.profileAvatarUrl = savedAvatar;
      this.avatarPreview = savedAvatar;
    } else {
      this.profileAvatarUrl = profile?.avatar_url || '';
    }
    
    this.profileEmail = (user?.['email'] as string) || '';
    this.profileRole = (user?.['role'] as string) || '';
  }

  // ============================================
  // MAP USER DATA TO STATS
  // ============================================

  private mapUserDataToStats(user: any): void {
    const userLevels = user.user_levels || {};
    const currentLevel = userLevels.current_level || 1;
    const totalPoints = userLevels.total_points || 0;
    const quizzesCompleted = userLevels.quizzes_completed || 0;

    const progressPercentage = Math.min((currentLevel / 5) * 100, 100);

    this.stats = [
      {
        label: 'PONTUAÇÃO ACADÉMICA TOTAL',
        value: totalPoints.toLocaleString(),
        unit: 'pts',
        color: '#6b0119',
        progress: progressPercentage
      },
      {
        label: 'QUESTIONÁRIOS CONCLUÍDOS',
        value: quizzesCompleted,
        unit: 'de 200',
        color: '#8b1e2d',
        progress: Math.min((quizzesCompleted / 200) * 100, 100)
      },
      {
        label: 'NÍVEL ATUAL',
        value: currentLevel,
        subtext: `de 5 níveis`,
        rankBadge: this.getLevelName(currentLevel),
        color: 'white',
        bgColor: '#8b1e2d',
        progress: null
      },
      {
        label: 'DOCUMENTOS LIDOS',
        value: userLevels.documents_read || 0,
        unit: 'arquivos',
        color: '#574142',
        progress: Math.min(((userLevels.documents_read || 0) / 50) * 100, 100)
      }
    ];
  }

  // ============================================
  // UTILITY METHODS
  // ============================================

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

  private async loadAdditionalData(): Promise<void> {
    try {
      this.merits = [];
      this.userContents = [];
      this.settings = {
        privacy: [],
        notifications: []
      };
    } catch (error) {
      // Falhar silenciosamente
    }
  }

  private getErrorMessage(error: any): string {
    if (error?.status === 401) return 'Sessão expirada. Por favor, faça login novamente.';
    if (error?.status === 403) return 'Sem permissão para aceder a este perfil.';
    if (error?.status === 404) return 'Perfil não encontrado.';
    if (error?.status === 500) return 'Erro do servidor. Tente novamente mais tarde.';
    if (error instanceof Error) return error.message;
    return 'Falha ao carregar o perfil.';
  }

  // ============================================
  // NAVIGATION METHODS
  // ============================================

  navigateTo(path: string): void {
    this.router.navigate([path]);
  }

  openNotifications(): void {
    this.router.navigate(['/notificacoes']);
  }

  openNotificationPreferences(): void {
    this.toastService.info('Funcionalidade em desenvolvimento. Em breve disponível.');
  }

  openPrivacy(): void {
    this.toastService.info('Funcionalidade em desenvolvimento. Em breve disponível.');
  }

  openSupport(): void {
    this.toastService.info('Funcionalidade em desenvolvimento. Em breve disponível.');
  }

  // ============================================
  // PROFILE EDIT MODAL
  // ============================================

  openEditProfileModal(): void {
    this.state.isEditingProfile = true;
  }

  closeEditProfileModal(): void {
    this.state.isEditingProfile = false;
    this.refreshProfile();
  }

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

  async saveProfileChanges(): Promise<void> {
    if (!this.editForm.valid) {
      this.state.error = 'Por favor, preencha todos os campos obrigatórios corretamente.';
      return;
    }

    this.state.isLoadingStats = true;
    this.state.error = null;

    try {
      let updates = this.editForm.value;

      if (typeof updates.research_areas === 'string') {
        updates.research_areas = updates.research_areas
          .split(',')
          .map((area: string) => area.trim())
          .filter((area: string) => area.length > 0);
      }

      if (Array.isArray(updates.research_areas) && updates.research_areas.length > 10) {
        updates.research_areas = updates.research_areas.slice(0, 10);
      }

      // Garantir que o avatar_url está incluído
      if (this.avatarPreview) {
        updates.avatar_url = this.avatarPreview;
      } else if (this.profileAvatarUrl) {
        updates.avatar_url = this.profileAvatarUrl;
      }

      await this.profileService.updateProfile(updates);

      if (this.avatarFile) {
        const response = await this.profileService.updateAvatar(this.avatarFile);
        if (response?.avatar_url) {
          this.profileAvatarUrl = response.avatar_url + '?t=' + Date.now();
          this.saveAvatarToStorage(response.avatar_url);
          this.editForm.patchValue({ avatar_url: response.avatar_url });
        }
        this.avatarPreview = null;
        this.avatarFile = null;
        this.avatarPreviewTime = 0;
      }

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

  // ============================================
  // AVATAR METHODS
  // ============================================

  getAvatarSrc(): string {
    if (this.avatarPreview) {
      return this.avatarPreview;
    }
    return this.profileAvatarUrl;
  }

  onAvatarSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];

    if (!file) return;

    this.avatarError = null;

    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      this.avatarError = 'Tipo de arquivo não permitido. Use JPG, PNG ou WebP.';
      return;
    }

    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      this.avatarError = 'Arquivo muito grande. Máximo 5MB.';
      return;
    }

    const reader = new FileReader();
    reader.onload = (e: any) => {
      const result = e.target?.result;
      if (result && typeof result === 'string') {
        this.avatarPreview = result;
        this.avatarPreviewTime = Date.now();
        this.profileAvatarUrl = result;
        
        this.saveAvatarToStorage(result);
        
        this.editForm.patchValue({
          avatar_url: result
        });
        
        this.cdr.detectChanges();
        this.cdr.markForCheck();
      }
    };
    reader.onerror = () => {
      this.avatarError = 'Erro ao ler arquivo. Tente novamente.';
    };
    reader.readAsDataURL(file);
    this.avatarFile = file;
  }

  removeAvatar(): void {
    this.editForm.patchValue({
      avatar_url: null
    });
    this.avatarPreview = null;
    this.avatarFile = null;
    this.avatarError = null;
    this.avatarPreviewTime = 0;
    this.profileAvatarUrl = '';
    
    this.removeAvatarFromStorage();
    
    this.cdr.detectChanges();
  }

  clearAvatarSelection(): void {
    this.avatarPreview = null;
    this.avatarFile = null;
    this.avatarError = null;
    this.avatarPreviewTime = 0;
    this.removeAvatarFromStorage();
  }

  // ============================================
  // STATS AND OTHER METHODS
  // ============================================

  getStatValue(key: string): string | number {
    const statMap: { [key: string]: { value: string | number; fallback: string | number } } = {
      totalPoints: { value: this.stats[0]?.value || 14850, fallback: '14.850' },
      quizzesCompleted: { value: this.stats[1]?.value || 42, fallback: '42' },
      globalRank: { value: this.stats[2]?.value || 12, fallback: '12' },
      documentsRead: { value: this.stats[3]?.value || 1247, fallback: '1.247' },
      documentsProgress: { value: this.stats[3]?.progress || 75, fallback: '75' }
    };
    const stat = statMap[key];
    if (!stat) return '';
    return stat.value || stat.fallback;
  }

  refreshProfile(): void {
    this.profileService.getMe().then(me => {
      const profile = me?.profile ?? null;
      const user = me?.user as Record<string, unknown> | undefined;
      if (profile) {
        this.profileData = profile;
        this.mapProfileData(profile, user);
        this.cdr.detectChanges();
      }
    }).catch(() => {});
  }

  downloadPortfolio(): void {
    this.toastService.info('Funcionalidade de download em desenvolvimento.');
  }

  deactivateAccount(): void {
    const confirm = window.confirm(
      'Tem certeza que deseja desativar sua conta? Esta ação é irreversível.'
    );
    if (confirm) {
      this.toastService.info('Funcionalidade de desativação em desenvolvimento.');
    }
  }

  togglePrivacySetting(index: number): void {
    this.settings.privacy[index].checked = !this.settings.privacy[index].checked;
  }

  toggleNotificationSetting(index: number): void {
    this.settings.notifications[index].checked = !this.settings.notifications[index].checked;
  }

  toggleSetting(settingType: string, index: number): void {
    if (settingType === 'privacy') {
      this.togglePrivacySetting(index);
    } else if (settingType === 'notifications') {
      this.toggleNotificationSetting(index);
    }
  }
}