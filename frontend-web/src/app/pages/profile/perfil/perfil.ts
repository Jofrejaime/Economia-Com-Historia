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
    private toastService: ToastService
  ) {
    // Inicializar formulário vazio
    this.editForm = this.fb.group({
      display_name: ['', [Validators.required, Validators.maxLength(100)]],
      bio: ['', [Validators.maxLength(2000)]],
      institution: [''],
      province: [''],
      research_areas: ['']  // ← String, não array
    });
  }

  ngOnInit(): void {
    this.loadProfile();
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

      // Mapear dados do utilizador para estatísticas
      if (user) {
        this.mapUserDataToStats(user);
      }

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

    // Avatar (vazio se não houver)
    this.profileAvatarUrl = profile?.avatar_url || '';

    // Email e role (para referência interna)
    this.profileEmail = (user?.['email'] as string) || '';
    this.profileRole = (user?.['role'] as string) || '';
  }

  /**
   * Mapeia dados do utilizador para estatísticas
   */
  private mapUserDataToStats(user: any): void {
    const userLevels = user.user_levels || {};
    const currentLevel = userLevels.current_level || 1;
    const totalPoints = userLevels.total_points || 0;
    const quizzesCompleted = userLevels.quizzes_completed || 0;

    // Calcular progresso (0-100)
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
      // 3. GET /api/profile/settings - Retornar configurações de privacidade/notificações
      
      // Por enquanto, manter arrays vazios até backend implementar
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
  }

  /**
   * Fechar modal de edição
   */
  closeEditProfileModal(): void {
    this.state.isEditingProfile = false;
    // Recarregar perfil para garantir que temos dados atualizados
    // (especialmente avatar que pode ter sido atualizado)
    this.refreshProfile();
  }

  /**
   * Salvar mudanças do perfil
   */
  async saveProfileChanges(): Promise<void> {
    if (!this.editForm.valid) {
      this.state.error = 'Por favor, preencha todos os campos obrigatórios corretamente.';
      return;
    }

    this.state.isLoadingStats = true;
    this.state.error = null;

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
        // Usar diretamente a URL retornada pelo backend (já completa e processada)
        if (response?.avatar_url) {
          // Atualizar URL imediatamente para mostrar mudança
          this.profileAvatarUrl = response.avatar_url + '?t=' + Date.now();
        }
        // Limpar seleção
        this.avatarPreview = null;
        this.avatarFile = null;
        this.avatarPreviewTime = 0;
      }

      // Atualizar dados locais com os valores do form
      this.profileData = { ...this.profileData, ...updates };
      this.mapProfileData(this.profileData, this.userData);
      
      // Forçar detecção de mudanças
      this.cdr.detectChanges();

      // Fechar modal após sucesso
      this.closeEditProfileModal();
      
      // Mostrar toast de sucesso
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
    // Restaurar valores originais
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
    // Se há preview, usar diretamente
    if (this.avatarPreview) {
      return this.avatarPreview;
    }
    // Caso contrário, usar o avatar atual
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

    // Validar tipo de arquivo
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      this.avatarError = 'Tipo de arquivo não permitido. Use JPG, PNG ou WebP.';
      return;
    }

    // Validar tamanho (máx 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB em bytes
    if (file.size > maxSize) {
      this.avatarError = 'Arquivo muito grande. Máximo 5MB.';
      return;
    }

    // Criar preview usando FileReader
    const reader = new FileReader();
    
    reader.onload = (e: any) => {
      // Atualizar preview imediatamente
      const result = e.target?.result;
      if (result && typeof result === 'string') {
        this.avatarPreview = result;
        this.avatarPreviewTime = Date.now();
        // Forçar Angular a detectar mudanças
        this.cdr.markForCheck();
      }
    };
    
    reader.onerror = () => {
      this.avatarError = 'Erro ao ler arquivo. Tente novamente.';
    };

    // Iniciar leitura do arquivo
    reader.readAsDataURL(file);

    // Guardar arquivo para upload
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
    // TODO: Salvar no backend via SettingsService
  }

  /**
   * Toggle de configuração de notificações
   */
  toggleNotificationSetting(index: number): void {
    this.settings.notifications[index].checked = !this.settings.notifications[index].checked;
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

  // ===== NOVOS MÉTODOS PARA AS FUNCIONALIDADES ADICIONADAS =====

/**
 * Abrir notificações
 */
openNotifications(): void {
  // TODO: Navegar para página de notificações ou abrir modal
  this.router.navigate(['/notificacoes']);
  // Ou abrir dropdown/modal
}

/**
 * Abrir preferências de notificação
 */
openNotificationPreferences(): void {
  // TODO: Navegar para página de preferências
  this.router.navigate(['/preferencias/notificacoes']);
}

/**
 * Abrir privacidade e segurança
 */
openPrivacy(): void {
  // TODO: Navegar para página de privacidade
  this.router.navigate(['/privacidade']);
}

/**
 * Abrir suporte
 */
openSupport(): void {
  // TODO: Navegar para página de suporte
  this.router.navigate(['/suporte']);
}

/**
 * Obter valor de estatística
 */
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
  
  // Se o valor for undefined ou null, usar fallback
  return stat.value || stat.fallback;
}


  /**
   * Atualizar perfil manualmente
   */
  refreshProfile(): void {
    // Carregar perfil em background (sem mostrar loading spinner)
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
