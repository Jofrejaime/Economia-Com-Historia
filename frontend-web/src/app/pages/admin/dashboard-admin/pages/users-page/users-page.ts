import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

// Interface com APENAS campos que existem nas migrations
interface User {
  // Tabela users
  id: string;
  email: string;
  email_verified: boolean;
  is_active: boolean;
  role: 'estudante' | 'investigador' | 'curador' | 'administrador' | 'superadministrador';
  created_at: string;
  updated_at: string;
  last_login_at: string | null;
  
  // Tabela user_profiles
  display_name: string;
  full_name: string | null;
  institution: string | null;
  province: string | null;
  avatar_url: string | null;
  bio: string | null;
  research_areas: string[] | null;
  
  // Campos APENAS para frontend (não existem na BD)
  avatarColor?: string;
  avatarInitials?: string;
  research_areas_input?: string;
}

@Component({
  selector: 'app-users-page',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './users-page.html',
  styleUrls: ['./users-page.css']
})
export class UsersPageComponent {
  searchQuery = '';
  filterRole = 'todos';
  filterStatus = 'todos';
  
  showUserModal = false;
  editingUser: User | null = null;
  
  avatarFile: File | null = null;
  avatarPreview: string | null = null;
  
  // Lista de províncias
  provinces = [
    'Luanda', 'Bengo', 'Benguela', 'Bié', 'Cabinda', 'Cuando Cubango',
    'Cuanza Norte', 'Cuanza Sul', 'Cunene', 'Huambo', 'Huíla',
    'Malanje', 'Moxico', 'Namibe', 'Uíge', 'Zaire'
  ];

  userForm: User = {
    id: '',
    email: '',
    email_verified: false,
    is_active: true,
    role: 'estudante',
    created_at: '',
    updated_at: '',
    last_login_at: null,
    display_name: '',
    full_name: null,
    institution: null,
    province: null,
    avatar_url: null,
    bio: null,
    research_areas: null,
    research_areas_input: '',
    avatarColor: '#8b1e2d',
    avatarInitials: ''
  };

  users: User[] = [
    {
      id: '1',
      email: 'm.costa@arquivo.ao',
      email_verified: true,
      is_active: true,
      role: 'administrador',
      created_at: '2024-01-15T08:00:00Z',
      updated_at: '2024-06-15T10:00:00Z',
      last_login_at: '2024-06-15T09:30:00Z',
      display_name: 'Dr. Manuel Costa',
      full_name: 'Manuel António Costa',
      institution: 'Arquivo Nacional',
      province: 'Luanda',
      avatar_url: null,
      bio: 'Historiador económico com foco no período colonial.',
      research_areas: ['História Económica', 'Economia Colonial', 'Arquivos'],
      avatarColor: '#6b0119',
      avatarInitials: 'MC'
    },
    {
      id: '2',
      email: 'a.silva@uan.ao',
      email_verified: true,
      is_active: true,
      role: 'curador',
      created_at: '2024-02-22T10:00:00Z',
      updated_at: '2024-06-14T14:00:00Z',
      last_login_at: '2024-06-14T13:00:00Z',
      display_name: 'Dra. Ana Silva',
      full_name: 'Ana Maria Silva',
      institution: 'Universidade Agostinho Neto',
      province: 'Luanda',
      avatar_url: null,
      bio: 'Investigadora em sistemas monetários africanos.',
      research_areas: ['Sistemas Monetários', 'Economia Política', 'História Fiscal'],
      avatarColor: '#1d4ed8',
      avatarInitials: 'AS'
    },
    {
      id: '3',
      email: 'c.mendes@isced.ao',
      email_verified: true,
      is_active: true,
      role: 'investigador',
      created_at: '2024-03-10T09:00:00Z',
      updated_at: '2024-06-12T16:00:00Z',
      last_login_at: '2024-06-12T15:30:00Z',
      display_name: 'Prof. Carlos Mendes',
      full_name: 'Carlos Eduardo Mendes',
      institution: 'ISCED Huíla',
      province: 'Huíla',
      avatar_url: null,
      bio: 'Especialista em rotas comerciais e infraestruturas.',
      research_areas: ['Rotas Comerciais', 'Infraestrutura', 'História do Comércio'],
      avatarColor: '#0891b2',
      avatarInitials: 'CM'
    },
    {
      id: '4',
      email: 'mj.santos@ucan.ao',
      email_verified: false,
      is_active: false,
      role: 'estudante',
      created_at: '2024-04-05T11:00:00Z',
      updated_at: '2024-04-05T11:00:00Z',
      last_login_at: null,
      display_name: 'Maria João Santos',
      full_name: 'Maria João Santos',
      institution: 'Universidade Católica',
      province: 'Benguela',
      avatar_url: null,
      bio: null,
      research_areas: null,
      avatarColor: '#7c3aed',
      avatarInitials: 'MS'
    },
    {
      id: '5',
      email: 'j.lopes@isptec.ao',
      email_verified: true,
      is_active: false,
      role: 'investigador',
      created_at: '2024-02-28T14:00:00Z',
      updated_at: '2024-06-10T08:00:00Z',
      last_login_at: '2024-06-10T07:30:00Z',
      display_name: 'Dr. João Lopes',
      full_name: 'João Pedro Lopes',
      institution: 'ISPTEC',
      province: 'Luanda',
      avatar_url: null,
      bio: 'Pesquisador em políticas públicas e desenvolvimento.',
      research_areas: ['Políticas Públicas', 'Desenvolvimento Económico', 'Economia Social'],
      avatarColor: '#dc2626',
      avatarInitials: 'JL'
    }
  ];

  get filteredUsers(): User[] {
    return this.users.filter(user => {
      const matchSearch = this.searchQuery === '' ||
        (user.display_name && user.display_name.toLowerCase().includes(this.searchQuery.toLowerCase())) ||
        (user.full_name && user.full_name.toLowerCase().includes(this.searchQuery.toLowerCase())) ||
        user.email.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
        (user.institution && user.institution.toLowerCase().includes(this.searchQuery.toLowerCase()));
      const matchRole = this.filterRole === 'todos' || user.role === this.filterRole;
      const matchStatus = this.filterStatus === 'todos' || 
        (this.filterStatus === 'active' ? user.is_active === true : 
         this.filterStatus === 'pending' ? user.email_verified === false && user.is_active === false :
         this.filterStatus === 'blocked' ? user.is_active === false && user.email_verified === true : true);
      return matchSearch && matchRole && matchStatus;
    });
  }

  getRoleLabel(role: string): string {
    const roles: Record<string, string> = {
      administrador: 'Administrador',
      curador: 'Curador',
      investigador: 'Investigador',
      estudante: 'Estudante',
      superadministrador: 'Super Administrador'
    };
    return roles[role] || role;
  }

  getRoleIcon(role: string): string {
    const icons: Record<string, string> = {
      administrador: '👑',
      curador: '📚',
      investigador: '🔬',
      estudante: '🎓',
      superadministrador: '⭐'
    };
    return icons[role] || '👤';
  }

  getStatusLabel(isActive: boolean, emailVerified: boolean): string {
    if (isActive && emailVerified) return 'Ativo';
    if (!isActive && emailVerified) return 'Bloqueado';
    if (!isActive && !emailVerified) return 'Pendente';
    return 'Ativo';
  }

  getStats() {
    return {
      total: this.users.length,
      active: this.users.filter(u => u.is_active && u.email_verified).length,
      pending: this.users.filter(u => !u.is_active && !u.email_verified).length,
      blocked: this.users.filter(u => !u.is_active && u.email_verified).length
    };
  }

  getInitials(name: string): string {
    if (!name) return '?';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
  }

  getRandomColor(): string {
    const colors = ['#6b0119', '#1d4ed8', '#0891b2', '#7c3aed', '#15803d', '#b45309', '#dc2626'];
    return colors[Math.floor(Math.random() * colors.length)];
  }

  // ============================================
  // MÉTODOS DE AVATAR
  // ============================================

  onAvatarSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];

    if (!file) return;

    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      alert('Tipo de arquivo não permitido. Use JPG, PNG ou WebP.');
      return;
    }

    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      alert('Arquivo muito grande. Máximo 5MB.');
      return;
    }

    this.avatarFile = file;

    const reader = new FileReader();
    reader.onload = (e: any) => {
      this.avatarPreview = e.target.result;
      this.userForm.avatar_url = this.avatarPreview;
    };
    reader.readAsDataURL(file);
  }

  removeAvatar(): void {
    this.avatarFile = null;
    this.avatarPreview = null;
    this.userForm.avatar_url = null;
    
    const input = document.querySelector('input[type="file"]') as HTMLInputElement;
    if (input) input.value = '';
  }

  // ============================================
  // MÉTODOS DO MODAL
  // ============================================

  openAddUserModal(): void {
    this.editingUser = null;
    this.avatarFile = null;
    this.avatarPreview = null;
    this.userForm = {
      id: '',
      email: '',
      email_verified: false,
      is_active: true,
      role: 'estudante',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      last_login_at: null,
      display_name: '',
      full_name: null,
      institution: null,
      province: null,
      avatar_url: null,
      bio: null,
      research_areas: null,
      research_areas_input: '',
      avatarColor: this.getRandomColor(),
      avatarInitials: ''
    };
    this.showUserModal = true;
  }

  openEditUserModal(user: User): void {
    this.editingUser = { ...user };
    this.avatarFile = null;
    this.avatarPreview = null;
    this.userForm = {
      ...user,
      research_areas_input: user.research_areas ? user.research_areas.join(', ') : ''
    };
    this.showUserModal = true;
  }

  closeUserModal(): void {
    this.showUserModal = false;
    this.editingUser = null;
    this.avatarFile = null;
    this.avatarPreview = null;
  }

  // ============================================
  // MÉTODOS CRUD
  // ============================================

  saveUser(): void {
    if (!this.userForm.display_name?.trim()) {
      alert('Por favor, insira o nome de exibição do utilizador');
      return;
    }
    
    if (!this.userForm.email?.trim()) {
      alert('Por favor, insira o email do utilizador');
      return;
    }
    
    if (!this.userForm.avatarInitials) {
      this.userForm.avatarInitials = this.getInitials(this.userForm.display_name);
    }
    
    if (this.userForm.research_areas_input?.trim()) {
      this.userForm.research_areas = this.userForm.research_areas_input
        .split(',')
        .map(area => area.trim())
        .filter(area => area.length > 0);
    } else {
      this.userForm.research_areas = null;
    }
    
    if (this.avatarFile) {
      // Em produção: upload para o servidor
      this.userForm.avatar_url = this.avatarPreview;
    }
    
    if (this.editingUser) {
      const index = this.users.findIndex(u => u.id === this.editingUser!.id);
      if (index !== -1) {
        this.users[index] = { ...this.userForm, id: this.editingUser.id };
      }
    } else {
      this.userForm.id = Date.now().toString();
      this.users.push({ ...this.userForm });
    }
    
    this.closeUserModal();
  }

  deleteUser(id: string): void {
    if (confirm('Tem certeza que deseja eliminar este utilizador?')) {
      this.users = this.users.filter(u => u.id !== id);
    }
  }

  blockUser(id: string): void {
    const user = this.users.find(u => u.id === id);
    if (user) {
      user.is_active = false;
    }
  }

  activateUser(id: string): void {
    const user = this.users.find(u => u.id === id);
    if (user) {
      user.is_active = true;
      user.email_verified = true;
    }
  }

  approveUser(id: string): void {
    const user = this.users.find(u => u.id === id);
    if (user && !user.email_verified) {
      user.email_verified = true;
      user.is_active = true;
    }
  }
}