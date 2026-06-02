import { Component, OnInit, ViewEncapsulation, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HeaderComponent } from '../../../components/header/header';
import { FooterComponent } from '../../../components/footer/footer';
import { ProfileService } from '../../../services/profile.service';

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
  id: number;
  title: string;
  type: string;
  date: string;
  views: number;
  category: string;
  description: string;
  author: string;
}

interface ProfileEditForm {
  display_name: string;
  bio: string;
  institution: string;
  province: string;
  research_areas: string[];
}

interface UiState {
  isLoadingProfile: boolean;
  isLoadingStats: boolean;
  isEditingProfile: boolean;
  error: string | null;
  success: string | null;
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
    error: null,
    success: null
  };

  // Formulário de edição
  editForm!: FormGroup;

  // Lista de províncias de Angola
  angolasProvinces = [
    'Luanda', 'Bengo', 'Benguela', 'Bié', 'Cabinda', 'Cuando Cubango',
    'Cuanza Norte', 'Cuanza Sul', 'Cunene', 'Huambo', 'Huíla', 'Kuando Kubango',
    'Kwanza Norte', 'Kwanza Sul', 'Malanje', 'Moxico', 'Namibe', 'Uíge', 'Zaire'
  ].sort();

  // Dados do perfil
  profileName = 'Carregando...';
  profileStatus = 'CARREGANDO DADOS...';
  profileBio = ['A carregar contexto do utilizador...'];
  profileAvatarUrl = 'https://www.lusakavoice.com/wp-content/uploads/2014/08/Screen-Shot-2014-08-06-at-3.06.26-AM.png';
  profileEmail = '';
  profileRole = '';
  profileError: string | null = null;

  // Dados brutos do backend
  userData: any = null;
  profileData: any = null;
  
  // Estatísticas (agora dinâmicas)
  stats: Stat[] = [
    { label: 'PONTUAÇÃO ACADÉMICA TOTAL', value: '0', unit: 'pts', color: '#6b0119', progress: 0 },
    { label: 'QUESTIONÁRIOS CONCLUÍDOS', value: '0', unit: 'de 200', color: '#8b1e2d', progress: 0 },
    { label: 'NÍVEL ATUAL', value: '1', subtext: 'de 5 níveis', rankBadge: 'Iniciante', color: 'white', bgColor: '#8b1e2d', progress: null },
    { label: 'DOCUMENTOS LIDOS', value: '0', unit: 'arquivos', color: '#574142', progress: null }
  ];

  // Méritos e Distinções (mantém defaults até carregar do backend)
  merits: Merit[] = [
    {
      iconPath: 'M12 2L15 8.5L22 9.5L17 14L18.5 21L12 17.5L5.5 21L7 14L2 9.5L9 8.5L12 2Z',
      iconViewBox: '0 0 24 24',
      title: 'Mestre da Moeda',
      description: ['Atribuído por completar o percurso completo da história monetária do século XVIII.'],
      id: 'AEA-4492-X',
      isActive: true
    },
    {
      iconPath: 'M4 4H20V20H4V4Z M8 8H16V16H8V8Z',
      iconViewBox: '0 0 24 24',
      title: 'Arquivista Principal',
      description: ['Reconhecido por contribuir com mais de 20 fontes primárias para o repositório.'],
      id: 'AEA-1102-A',
      isActive: true
    },
    {
      iconPath: 'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2Z M12 6V12L16 14',
      iconViewBox: '0 0 24 24',
      title: 'Ligação Institucional',
      description: ['Estabelecer 5 ligações institucionais dentro da rede do Arquivo.'],
      progress: 'EM PROGRESSO: 3/5',
      isActive: false
    },
    {
      iconPath: 'M9 12L11 14L15 10M21 12C21 16.97 16.97 21 12 21C7.03 21 3 16.97 3 12C3 7.03 7.03 3 12 3C16.97 3 21 7.03 21 12Z',
      iconViewBox: '0 0 24 24',
      title: 'Verificador de Factos Prata',
      description: ['Rever 50 submissões da comunidade com uma taxa de verificação de 95%.'],
      progress: 'EM PROGRESSO: 12/50',
      isActive: false
    }
  ];

  // Configurações de conta
  settings = {
    privacy: [
      { label: 'Perfil Académico Público', checked: true },
      { label: 'Autenticação de Dois Factores', checked: false }
    ],
    notifications: [
      { label: 'Atualizações do Arquivo', checked: true },
      { label: 'Menções de Pares', checked: true }
    ]
  };

  // Conteúdos criados (mantém defaults até carregar do backend)
  userContents: Content[] = [
    {
      id: 1,
      title: 'Análise do Sistema Monetário de Luanda no Século XVIII',
      type: 'Artigo Académico',
      date: '15 de Março, 2026',
      views: 1245,
      category: 'História Económica',
      description: 'Estudo detalhado sobre as transformações monetárias e econômicas do sistema de comércio em Luanda durante o século XVIII.',
      author: 'Dr. José Ndele'
    },
    {
      id: 2,
      title: 'Transições Macroeconómicas no Centro Comercial',
      type: 'Documento de Pesquisa',
      date: '2 de Fevereiro, 2026',
      views: 892,
      category: 'Economia',
      description: 'Análise das mudanças estruturais nos principais centros de comércio e seu impacto na economia regional.',
      author: 'Dr. José Ndele'
    },
    {
      id: 3,
      title: 'Repositório de Moeda do Século XIX - Vol. 3',
      type: 'Compilação Histórica',
      date: '10 de Janeiro, 2026',
      views: 2103,
      category: 'Numismática',
      description: 'Terceiro volume da compilação histórica de moedas circuladas em território angolano no século XIX.',
      author: 'Dr. José Ndele'
    }
  ];

  constructor(
    private router: Router,
    private profileService: ProfileService,
    private cdr: ChangeDetectorRef,
    private fb: FormBuilder
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

    // Timeout de emergência - se nada responder em 6s, força o fim
    const emergencyTimeout = setTimeout(() => {
      this.profileName = 'Usuário Autenticado';
      this.profileStatus = 'ESTATUTO ACADÉMICO: UTILIZADOR AUTENTICADO';
      this.profileBio = ['Backend não respondeu. Mostrando dados padrão.'];
      
      this.state.isLoadingProfile = false;
      this.state.error = '⚠️ Backend não respondeu. Tente recarregar a página.';
      this.cdr.detectChanges();
    }, 6000);

    try {
      const me = await this.profileService.getMe();
      clearTimeout(emergencyTimeout);

      const profile = me?.profile ?? null;
      const user = me?.user as Record<string, unknown> | undefined;

      // Mapear dados do perfil para exibição
      this.mapProfileData(profile, user);

      // Mapear dados do utilizador para estatísticas
      if (user) {
        this.mapUserDataToStats(user);
      }

      // Pré-preencher formulário com dados atuais
      if (profile) {
        this.editForm.patchValue({
          display_name: profile.display_name || '',
          bio: profile.bio || '',
          institution: profile.institution || '',
          province: profile.province || '',
          // Converter array para string (join com vírgula)
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
      
      // Mostrar dados padrão em caso de erro
      this.profileName = 'Erro ao Carregar';
      this.profileStatus = 'ESTATUTO ACADÉMICO: ERRO DE CONEXÃO';
      this.profileBio = [this.profileError];
    } finally {
      this.state.isLoadingProfile = false;
      this.cdr.detectChanges();
    }
  }

  /**
   * Mapeia dados do backend para exibição de perfil
   */
  private mapProfileData(profile: any, user: any): void {
    // Nome
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
        this.profileBio = ['O seu perfil está sincronizado com o contrato de identidade da API.'];
      }
    } else {
      this.profileBio = ['O seu perfil está sincronizado com o contrato de identidade da API.'];
    }

    // Avatar
    if (profile?.avatar_url) {
      this.profileAvatarUrl = profile.avatar_url;
    }

    // Email e role (para referência)
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

      await this.profileService.updateProfile(updates);

      // Atualizar dados locais
      this.profileData = { ...this.profileData, ...updates };
      this.mapProfileData(this.profileData, this.userData);

      this.state.success = '✅ Perfil atualizado com sucesso!';
      this.closeEditProfileModal();

      // Limpar mensagem de sucesso após 3 segundos
      setTimeout(() => {
        this.state.success = null;
      }, 3000);
    } catch (error) {
      this.state.error = this.getErrorMessage(error);
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
    this.closeEditProfileModal();
  }

  /**
   * Descarregar portfólio
   */
  downloadPortfolio(): void {
    // TODO: Implementar download de portfólio
    this.state.success = 'Funcionalidade de download em desenvolvimento.';
    setTimeout(() => {
      this.state.success = null;
    }, 3000);
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
      this.state.success = 'Funcionalidade de desativação em desenvolvimento.';
      setTimeout(() => {
        this.state.success = null;
      }, 3000);
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

  /**
   * Limpar mensagem de erro
   */
  clearError(): void {
    this.state.error = null;
    this.profileError = null;
  }

  /**
   * Limpar mensagem de sucesso
   */
  clearSuccess(): void {
    this.state.success = null;
  }

  /**
   * Atualizar perfil manualmente
   */
  refreshProfile(): void {
    void this.loadProfile();
  }
}
