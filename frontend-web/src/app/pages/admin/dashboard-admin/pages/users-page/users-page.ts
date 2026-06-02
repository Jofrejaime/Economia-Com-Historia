import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface User {
  id: number;
  name: string;
  email: string;
  institution: string;
  role: 'admin' | 'curator' | 'researcher' | 'student';
  status: 'active' | 'pending' | 'blocked';
  joinDate: string;
  lastActive: string;
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
export class UsersPageComponent {
  searchQuery = '';
  filterRole = 'todos';
  filterStatus = 'todos';
  
  // Modal control
  showUserModal = false;
  editingUser: User | null = null;
  
  // Form data for new/edit user
  userForm: User = {
    id: 0,
    name: '',
    email: '',
    institution: '',
    role: 'student',
    status: 'pending',
    joinDate: '',
    lastActive: 'Nunca',
    avatarInitials: '',
    avatarColor: '#6b0119'
  };

  users: User[] = [
    {
      id: 1,
      name: 'Dr. Manuel Costa',
      email: 'm.costa@arquivo.ao',
      institution: 'Arquivo Nacional',
      role: 'admin',
      status: 'active',
      joinDate: '15 Jan 2024',
      lastActive: 'Hoje',
      avatarInitials: 'MC',
      avatarColor: '#6b0119'
    },
    {
      id: 2,
      name: 'Dra. Ana Silva',
      email: 'a.silva@uan.ao',
      institution: 'Universidade Agostinho Neto',
      role: 'curator',
      status: 'active',
      joinDate: '22 Fev 2024',
      lastActive: 'Ontem',
      avatarInitials: 'AS',
      avatarColor: '#1d4ed8'
    },
    {
      id: 3,
      name: 'Prof. Carlos Mendes',
      email: 'c.mendes@isced.ao',
      institution: 'ISCED Huíla',
      role: 'researcher',
      status: 'active',
      joinDate: '10 Mar 2024',
      lastActive: 'Há 2 dias',
      avatarInitials: 'CM',
      avatarColor: '#0891b2'
    },
    {
      id: 4,
      name: 'Maria João Santos',
      email: 'mj.santos@ucan.ao',
      institution: 'Universidade Católica',
      role: 'student',
      status: 'pending',
      joinDate: '05 Abr 2024',
      lastActive: 'Nunca',
      avatarInitials: 'MS',
      avatarColor: '#7c3aed'
    },
    {
      id: 5,
      name: 'Dr. João Lopes',
      email: 'j.lopes@isptec.ao',
      institution: 'ISPTEC',
      role: 'researcher',
      status: 'blocked',
      joinDate: '28 Fev 2024',
      lastActive: 'Há 5 dias',
      avatarInitials: 'JL',
      avatarColor: '#dc2626'
    }
  ];

  get filteredUsers(): User[] {
    return this.users.filter(user => {
      const matchSearch = this.searchQuery === '' ||
        user.name.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
        user.email.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
        user.institution.toLowerCase().includes(this.searchQuery.toLowerCase());
      const matchRole = this.filterRole === 'todos' || user.role === this.filterRole;
      const matchStatus = this.filterStatus === 'todos' || user.status === this.filterStatus;
      return matchSearch && matchRole && matchStatus;
    });
  }

  getRoleLabel(role: string): string {
    const roles: Record<string, string> = {
      admin: 'Administrador',
      curator: 'Curador',
      researcher: 'Investigador',
      student: 'Estudante'
    };
    return roles[role] || role;
  }

  getRoleBadgeClass(role: string): string {
    const classes: Record<string, string> = {
      admin: 'badge-admin',
      curator: 'badge-curator',
      researcher: 'badge-researcher',
      student: 'badge-student'
    };
    return classes[role] || 'badge-default';
  }

  getStatusLabel(status: string): string {
    const statuses: Record<string, string> = {
      active: 'Ativo',
      pending: 'Pendente',
      blocked: 'Bloqueado'
    };
    return statuses[status] || status;
  }

  getStatusBadgeClass(status: string): string {
    const classes: Record<string, string> = {
      active: 'status-active',
      pending: 'status-pending',
      blocked: 'status-blocked'
    };
    return classes[status] || 'status-default';
  }

  getStats() {
    return {
      total: this.users.length,
      active: this.users.filter(u => u.status === 'active').length,
      pending: this.users.filter(u => u.status === 'pending').length,
      blocked: this.users.filter(u => u.status === 'blocked').length
    };
  }

  // Generate avatar initials from name
  generateInitials(name: string): string {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
  }

  // Generate random avatar color
  getRandomColor(): string {
    const colors = ['#6b0119', '#1d4ed8', '#0891b2', '#7c3aed', '#15803d', '#b45309', '#dc2626'];
    return colors[Math.floor(Math.random() * colors.length)];
  }

  // Open modal to add new user
  openAddUserModal(): void {
    this.editingUser = null;
    this.userForm = {
      id: 0,
      name: '',
      email: '',
      institution: '',
      role: 'student',
      status: 'pending',
      joinDate: new Date().toLocaleDateString('pt-PT', { day: '2-digit', month: 'short', year: 'numeric' }),
      lastActive: 'Nunca',
      avatarInitials: '',
      avatarColor: this.getRandomColor()
    };
    this.showUserModal = true;
  }

  // Open modal to edit user
  openEditUserModal(user: User): void {
    this.editingUser = { ...user };
    this.userForm = { ...user };
    this.showUserModal = true;
  }

  // Close modal
  closeUserModal(): void {
    this.showUserModal = false;
    this.editingUser = null;
  }

  // Save user (create or update)
  saveUser(): void {
    if (!this.userForm.name.trim()) {
      alert('Por favor, insira o nome do utilizador');
      return;
    }
    
    if (!this.userForm.email.trim()) {
      alert('Por favor, insira o email do utilizador');
      return;
    }
    
    // Generate initials if not set
    if (!this.userForm.avatarInitials) {
      this.userForm.avatarInitials = this.generateInitials(this.userForm.name);
    }
    
    if (this.editingUser) {
      // Update existing user
      const index = this.users.findIndex(u => u.id === this.editingUser!.id);
      if (index !== -1) {
        this.users[index] = { ...this.userForm, id: this.editingUser.id };
      }
    } else {
      // Create new user
      const newId = Math.max(...this.users.map(u => u.id), 0) + 1;
      this.userForm.id = newId;
      this.users.push({ ...this.userForm });
    }
    
    this.closeUserModal();
  }

  // Delete user
  deleteUser(id: number): void {
    if (confirm('Tem certeza que deseja eliminar este utilizador?')) {
      this.users = this.users.filter(u => u.id !== id);
    }
  }

  // Block user
  blockUser(id: number): void {
    const user = this.users.find(u => u.id === id);
    if (user) {
      user.status = 'blocked';
    }
  }

  // Activate user
  activateUser(id: number): void {
    const user = this.users.find(u => u.id === id);
    if (user) {
      user.status = 'active';
    }
  }

  // Approve pending user
  approveUser(id: number): void {
    const user = this.users.find(u => u.id === id);
    if (user && user.status === 'pending') {
      user.status = 'active';
    }
  }

  // Get role icon
  getRoleIcon(role: string): string {
    const icons: Record<string, string> = {
      admin: '👑',
      curator: '📚',
      researcher: '🔬',
      student: '🎓'
    };
    return icons[role] || '👤';
  }
}