import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { firstValueFrom } from 'rxjs';
import { AdminApiService, AdminUser } from '../../../../../services/admin-api.service';
import { ProvinceAdminService } from '../../../../../services/province-admin.service';

type UserRole = 'admin' | 'professor' | 'investigador' | 'estudante' | '';
type UserStatusFilter = 'todos' | 'active' | 'pending' | 'blocked' | 'inactive';

interface UserFormState {
  email: string;
  role: UserRole;
  email_verified: boolean;
  is_active: boolean;
  display_name: string;
  full_name: string;
  institution: string;
  province: string;
  avatar_url: string;
  bio: string;
  website_url: string;
  research_areas_input: string;
  avatarColor: string;
  password?: string;
}

interface AdminUserView extends AdminUser {
  avatarInitials: string;
  avatarColor: string;
}

@Component({
  selector: 'app-users-page',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './users-page.html',
  styleUrls: ['./users-page.css']
})
export class UsersPageComponent implements OnInit {
  searchQuery = '';
  filterRole: 'todos' | UserRole = 'todos';
  filterStatus: UserStatusFilter = 'todos';

  loading = false;
  saving = false;
  errorMessage: string | null = null;
  successMessage: string | null = null;

  showUserModal = false;
  editingUser: AdminUserView | null = null;
  modalMode: 'view' | 'edit' = 'view';

  currentPage = 1;
  pageSize = 10;
  pageSizeOptions = [10, 20, 50];

  users: AdminUserView[] = [];

  modalTab: 'general' | 'gamification' | 'sessions' = 'general';
  profileDetails: any = null;
  sessionDetails: any[] = [];
  loadingDetails = false;
  detailsErrorMessage: string | null = null;

  provinces = [
    'Bengo',
    'Benguela',
    'Bié',
    'Cabinda',
    'Cuando Cubango',
    'Cuanza Norte',
    'Cuanza Sul',
    'Cunene',
    'Huambo',
    'Huíla',
    'Luanda',
    'Lunda Norte',
    'Lunda Sul',
    'Malanje',
    'Moxico',
    'Namibe',
    'Uíge',
    'Zaire',
  ];

  userForm: UserFormState = this.createEmptyForm();

  constructor(private adminApi: AdminApiService, private provinceAdmin: ProvinceAdminService) {}

  ngOnInit(): void {
    void this.loadUsers();
    void this.loadProvinces();
  }

  async loadProvinces(): Promise<void> {
    try {
      const result = await firstValueFrom(this.provinceAdmin.getPublicProvinces());
      if (result.ok && result.data) {
        this.provinces = result.data.map(p => p.name).sort();
      }
    } catch (e) {
      // Fallback is the hardcoded list
    }
  }

  get filteredUsers(): AdminUserView[] {
    return this.users.filter((user) => {
      const search = this.searchQuery.trim().toLowerCase();
      const matchSearch = search === '' ||
        user.display_name.toLowerCase().includes(search) ||
        (user.full_name || '').toLowerCase().includes(search) ||
        user.email.toLowerCase().includes(search) ||
        (user.institution || '').toLowerCase().includes(search);

      const matchRole = this.filterRole === 'todos' || user.role === this.filterRole;
      const matchStatus = this.filterStatus === 'todos' || this.getUserStatus(user) === this.filterStatus;

      return matchSearch && matchRole && matchStatus;
    });
  }

  get pagedUsers(): AdminUserView[] {
    const start = (this.currentPage - 1) * this.pageSize;
    return this.filteredUsers.slice(start, start + this.pageSize);
  }

  get totalPages(): number {
    return Math.max(1, Math.ceil(this.filteredUsers.length / this.pageSize));
  }

  get pageStart(): number {
    return this.filteredUsers.length === 0 ? 0 : ((this.currentPage - 1) * this.pageSize) + 1;
  }

  get pageEnd(): number {
    return Math.min(this.currentPage * this.pageSize, this.filteredUsers.length);
  }

  getStats() {
    return {
      total: this.users.length,
      active: this.users.filter((user) => this.getUserStatus(user) === 'active').length,
      pending: this.users.filter((user) => this.getUserStatus(user) === 'pending').length,
      blocked: this.users.filter((user) => this.getUserStatus(user) === 'blocked').length,
    };
  }

  async loadUsers(): Promise<void> {
    this.loading = true;
    this.errorMessage = null;
    this.currentPage = 1;

    const result = await firstValueFrom(this.adminApi.listUsers({
      search: this.searchQuery.trim() || undefined,
      role: this.filterRole === 'todos' ? undefined : this.filterRole,
      status: this.filterStatus === 'todos' ? undefined : this.filterStatus,
    }));

    if (!result) {
      this.errorMessage = 'Não foi possível carregar a lista de utilizadores.';
      this.loading = false;
      return;
    }

    if (!result.ok || !result.data) {
      this.errorMessage = result.message || 'Não foi possível carregar a lista de utilizadores.';
      this.users = [];
      this.loading = false;
      return;
    }

    this.users = result.data.map((user) => this.toViewUser(user));
    this.loading = false;
  }

  refreshUsers(): void {
    void this.loadUsers();
  }

  openCreateUserModal(): void {
    this.editingUser = null;
    this.modalMode = 'edit';
    this.modalTab = 'general';
    this.userForm = this.createEmptyForm();
    this.showUserModal = true;
    this.successMessage = null;
    this.errorMessage = null;
  }

  openEditUserModal(user: AdminUserView): void {
    this.editingUser = user;
    this.modalMode = 'edit';
    this.modalTab = 'general';
    this.userForm = {
      email: user.email,
      role: (user.role as UserRole) || 'estudante',
      email_verified: user.email_verified,
      is_active: user.is_active,
      display_name: user.display_name || '',
      full_name: user.full_name || '',
      institution: user.institution || '',
      province: user.province || '',
      avatar_url: user.avatar_url || '',
      bio: user.bio || '',
      website_url: user.website_url || '',
      research_areas_input: Array.isArray(user.research_areas) ? user.research_areas.join(', ') : '',
      avatarColor: user.avatarColor,
      password: '',
    };
    this.showUserModal = true;
    this.successMessage = null;
    this.errorMessage = null;
  }

  openViewUserModal(user: AdminUserView): void {
    this.editingUser = user;
    this.modalMode = 'view';
    this.modalTab = 'general';
    this.userForm = {
      email: user.email,
      role: (user.role as UserRole) || 'estudante',
      email_verified: user.email_verified,
      is_active: user.is_active,
      display_name: user.display_name || '',
      full_name: user.full_name || '',
      institution: user.institution || '',
      province: user.province || '',
      avatar_url: user.avatar_url || '',
      bio: user.bio || '',
      website_url: user.website_url || '',
      research_areas_input: Array.isArray(user.research_areas) ? user.research_areas.join(', ') : '',
      avatarColor: user.avatarColor,
      password: '',
    };
    this.showUserModal = true;
    this.successMessage = null;
    this.errorMessage = null;
  }

  closeUserModal(): void {
    if (this.saving) {
      return;
    }

    this.showUserModal = false;
    this.editingUser = null;
    this.modalMode = 'view';
    this.modalTab = 'general';
    this.profileDetails = null;
    this.sessionDetails = [];
  }

  async loadUserProfileData(): Promise<void> {
    if (!this.editingUser) return;
    this.loadingDetails = true;
    this.detailsErrorMessage = null;
    this.profileDetails = null;

    const result = await firstValueFrom(this.adminApi.getUserProfile(this.editingUser.id));
    if (result.ok && result.data) {
      this.profileDetails = result.data;
    } else {
      this.detailsErrorMessage = result.message || 'Erro ao carregar progresso.';
    }
    this.loadingDetails = false;
  }

  async loadUserSessionsData(): Promise<void> {
    if (!this.editingUser) return;
    this.loadingDetails = true;
    this.detailsErrorMessage = null;
    this.sessionDetails = [];

    const result = await firstValueFrom(this.adminApi.getUserSessions(this.editingUser.id));
    if (result.ok && result.data) {
      this.sessionDetails = result.data;
    } else {
      this.detailsErrorMessage = result.message || 'Erro ao carregar sessões.';
    }
    this.loadingDetails = false;
  }

  enableEditMode(): void {
    this.modalMode = 'edit';
  }

  async saveUser(): Promise<void> {
    this.saving = true;
    this.errorMessage = null;
    this.successMessage = null;

    const payload: any = {
      email: this.userForm.email.trim(),
      role: this.userForm.role || 'estudante',
      email_verified: this.userForm.email_verified,
      is_active: this.userForm.is_active,
      display_name: this.userForm.display_name.trim(),
      full_name: this.userForm.full_name.trim() || null,
      institution: this.userForm.institution.trim() || null,
      province: this.userForm.province.trim() || null,
      avatar_url: this.userForm.avatar_url.trim() || null,
      bio: this.userForm.bio.trim() || null,
      website_url: this.userForm.website_url.trim() || null,
      research_areas: this.parseResearchAreas(this.userForm.research_areas_input),
    };

    if (!this.editingUser) {
      if (!this.userForm.password || this.userForm.password.trim().length < 8) {
        this.errorMessage = 'A palavra-passe é obrigatória e deve ter pelo menos 8 caracteres.';
        this.saving = false;
        return;
      }
      payload.password = this.userForm.password;
    }

    const result = await firstValueFrom(
      this.editingUser 
        ? this.adminApi.updateUser(this.editingUser.id, payload)
        : this.adminApi.createUser(payload)
    );

    if (!result) {
      this.errorMessage = 'Não foi possível guardar as alterações.';
      this.saving = false;
      return;
    }

    if (!result.ok || !result.data) {
      this.errorMessage = result.message || 'Não foi possível guardar as alterações.';
      this.saving = false;
      return;
    }

    this.successMessage = result.message || (this.editingUser ? 'Utilizador actualizado com sucesso.' : 'Utilizador criado com sucesso.');
    this.showUserModal = false;
    await this.loadUsers();
    this.saving = false;
  }

  onPageSizeChange(size: number): void {
    this.pageSize = size;
    this.currentPage = 1;
  }

  goToPage(page: number): void {
    this.currentPage = Math.max(1, Math.min(page, this.totalPages));
  }

  previousPage(): void {
    this.goToPage(this.currentPage - 1);
  }

  nextPage(): void {
    this.goToPage(this.currentPage + 1);
  }

  resetPagination(): void {
    this.currentPage = 1;
  }

  async blockUser(id: string): Promise<void> {
    await this.updateUserStatus(id, { is_active: false });
  }

  async activateUser(id: string): Promise<void> {
    await this.updateUserStatus(id, { is_active: true });
  }

  async approveUser(id: string): Promise<void> {
    await this.updateUserStatus(id, { email_verified: true });
  }

  async deleteUser(id: string): Promise<void> {
    if (!confirm('Tem a certeza que deseja eliminar este utilizador?')) {
      return;
    }

    this.loading = true;
    this.errorMessage = null;
    this.successMessage = null;

    const result = await firstValueFrom(this.adminApi.deleteUser(id));

    if (!result) {
      this.errorMessage = 'Não foi possível eliminar o utilizador.';
      this.loading = false;
      return;
    }

    if (!result.ok) {
      this.errorMessage = result.message || 'Não foi possível eliminar o utilizador.';
      this.loading = false;
      return;
    }

    this.successMessage = 'Utilizador eliminado com sucesso.';
    await this.loadUsers();
  }

  getRoleIcon(role: string): string {
    switch (role) {
      case 'admin':
        return '👑';
      case 'professor':
        return '📚';
      case 'investigador':
        return '🔬';
      case 'estudante':
      default:
        return '🎓';
    }
  }

  getRoleLabel(role: string): string {
    switch (role) {
      case 'admin':
        return 'Administrador';
      case 'professor':
        return 'Professor';
      case 'investigador':
        return 'Investigador';
      case 'estudante':
      default:
        return 'Estudante';
    }
  }

  getStatusLabel(isActive: boolean, emailVerified: boolean): string {
    if (!isActive && !emailVerified) {
      return 'Pendente';
    }

    if (!isActive) {
      return 'Bloqueado';
    }

    return emailVerified ? 'Ativo' : 'Pendente';
  }

  getStatusClass(user: AdminUserView): string {
    const status = this.getUserStatus(user);
    return status === 'active' ? 'status-active' : status === 'blocked' ? 'status-blocked' : 'status-pending';
  }

  getInitials(name: string): string {
    const parts = name.trim().split(/\s+/).filter(Boolean);
    if (parts.length === 0) {
      return 'U';
    }

    return parts.slice(0, 2).map((part) => part[0]?.toUpperCase() || '').join('').slice(0, 2);
  }

  onAvatarSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];

    if (!file) {
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      this.userForm.avatar_url = String(reader.result || '');
    };
    reader.readAsDataURL(file);
  }

  removeAvatar(): void {
    this.userForm.avatar_url = '';
  }

  exportCSV(): void {
    const header = ['Nome', 'Email', 'Função', 'Instituição', 'Estado', 'Criado em'];
    const rows = this.filteredUsers.map((user) => [
      user.display_name || user.full_name || '',
      user.email,
      this.getRoleLabel(user.role),
      user.institution || '',
      this.getStatusLabel(user.is_active, user.email_verified),
      user.created_at,
    ]);

    const csv = [header, ...rows]
      .map((row) => row.map((value) => `"${String(value).replace(/"/g, '""')}"`).join(','))
      .join('\n');

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = 'utilizadores.csv';
    anchor.click();
    URL.revokeObjectURL(url);
  }

  private async updateUserStatus(id: string, changes: Partial<Pick<UserFormState, 'email_verified' | 'is_active'>>): Promise<void> {
    const current = this.users.find((user) => user.id === id);
    if (!current) {
      return;
    }

    this.loading = true;
    this.errorMessage = null;
    this.successMessage = null;

    const result = await firstValueFrom(this.adminApi.updateUser(id, {
      email: current.email,
      role: current.role,
      email_verified: changes.email_verified ?? current.email_verified,
      is_active: changes.is_active ?? current.is_active,
      display_name: current.display_name || current.full_name || current.email,
      full_name: current.full_name,
      institution: current.institution,
      province: current.province,
      avatar_url: current.avatar_url,
      bio: current.bio,
      website_url: current.website_url,
      research_areas: current.research_areas ?? [],
    }));

    if (!result) {
      this.errorMessage = 'Não foi possível actualizar o utilizador.';
      this.loading = false;
      return;
    }

    if (!result.ok) {
      this.errorMessage = result.message || 'Não foi possível actualizar o utilizador.';
      this.loading = false;
      return;
    }

    this.successMessage = result.message || 'Utilizador actualizado com sucesso.';
    await this.loadUsers();
  }

  private getUserStatus(user: AdminUserView): 'active' | 'pending' | 'blocked' | 'inactive' {
    if (user.is_active && user.email_verified) {
      return 'active';
    }

    if (!user.is_active && !user.email_verified) {
      return 'pending';
    }

    if (!user.is_active) {
      return 'blocked';
    }

    return 'inactive';
  }

  private parseResearchAreas(value: string): string[] {
    return value
      .split(',')
      .map((item) => item.trim())
      .filter(Boolean);
  }

  private createEmptyForm(): UserFormState {
    return {
      email: '',
      role: 'estudante',
      email_verified: false,
      is_active: true,
      display_name: '',
      full_name: '',
      institution: '',
      province: '',
      avatar_url: '',
      bio: '',
      website_url: '',
      research_areas_input: '',
      avatarColor: '#8b1e2d',
      password: '',
    };
  }

  private toViewUser(user: AdminUser): AdminUserView {
    const displayName = user.display_name || user.full_name || user.email;
    const avatarColor = this.pickAvatarColor(displayName);

    return {
      ...user,
      display_name: displayName,
      avatarInitials: this.getInitials(displayName),
      avatarColor,
    };
  }

  private pickAvatarColor(seed: string): string {
    const colors = ['#8B1E2D', '#1D4ED8', '#0F766E', '#7C3AED', '#B45309'];
    const index = Math.abs(this.hashCode(seed)) % colors.length;
    return colors[index] ?? colors[0];
  }

  private hashCode(value: string): number {
    let hash = 0;
    for (let index = 0; index < value.length; index += 1) {
      hash = ((hash << 5) - hash) + value.charCodeAt(index);
      hash |= 0;
    }
    return hash;
  }
}
