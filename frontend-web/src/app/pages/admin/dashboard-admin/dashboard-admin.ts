import { Component, HostListener, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule, NavigationEnd } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { AuthService } from '../../../services/auth.service';
import { AdminApiService } from '../../../services/admin-api.service';
import { NotificationService } from '../../../services/notification.service';

@Component({
  selector: 'app-dashboard-admin',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './dashboard-admin.html',
  styleUrls: ['./dashboard-admin.css']
})
export class DashboardAdminComponent implements OnInit {
  currentYear = new Date().getFullYear();
  currentRoute = '';

  // Contadores da sidebar — todos carregados do backend, nenhum mockado
  pendingCount = 0;
  pendingReportsCount = 0;
  unreadNotificationsCount = 0;

  // Perfil do admin autenticado (mostrado no rodapé da sidebar)
  adminName = 'Administrador';
  adminRole = 'Administrador';

  // Propriedade para sidebar
  isSidebarCollapsed: boolean = false;

  constructor(
    private router: Router,
    private authService: AuthService,
    private adminApi: AdminApiService,
    private notificationService: NotificationService
  ) {
    this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        this.currentRoute = event.urlAfterRedirects;
      }
    });
  }

  ngOnInit(): void {
    this.loadCurrentUser();
    void this.loadSummaryCounts();
    void this.loadUnreadNotificationsCount();
  }

  private loadCurrentUser(): void {
    // Valores imediatos a partir da sessão local...
    const cached = this.authService.getUser() as
      | { display_name?: string; full_name?: string; email?: string; role?: string }
      | null;
    if (cached) {
      this.adminName = cached.display_name || cached.full_name || cached.email || 'Administrador';
      this.adminRole = this.roleLabel(cached.role);
    }

    // ...e refrescados a partir do servidor (também renova a sessão).
    void this.authService.me()
      .then((data: any) => {
        const user = data?.user;
        const profile = data?.profile;
        const name = profile?.display_name || user?.display_name || user?.full_name || user?.email;
        if (name) this.adminName = name;
        if (user?.role) this.adminRole = this.roleLabel(user.role);
      })
      .catch(() => { /* mantém os valores da sessão local */ });
  }

  private roleLabel(role?: string): string {
    switch (role) {
      case 'admin': return 'Administrador';
      case 'user':  return 'Utilizador';
      default:      return 'Administrador';
    }
  }

  isActive(route: string): boolean {
    return this.currentRoute === route;
  }

  navigateTo(path: string): void {
    this.router.navigate([path]);
    // Fecha a sidebar no mobile após navegar
    if (window.innerWidth <= 768) {
      this.isSidebarCollapsed = true;
    }
  }

  // Método para alternar sidebar
  toggleSidebar(): void {
    this.isSidebarCollapsed = !this.isSidebarCollapsed;
  }

  /**
   * Carrega os contadores agregados do dashboard administrativo — inclui
   * pedidos de acesso pendentes (badge de "Pedidos de Acesso") e denúncias
   * pendentes (badge de "Denúncias"). Nenhum destes valores é mockado.
   */
  private async loadSummaryCounts(): Promise<void> {
    const result = await firstValueFrom(this.adminApi.getSummary());

    if (result.ok && result.data) {
      this.pendingCount = result.data.access_requests?.pending ?? 0;
      this.pendingReportsCount = result.data.moderation?.reports_pending ?? 0;
    }
  }

  /**
   * Carrega o número de notificações não lidas do Admin autenticado, para o
   * badge de "Notificações" na sidebar — mesmo padrão já usado no
   * HeaderComponent do frontend público.
   */
  private async loadUnreadNotificationsCount(): Promise<void> {
    try {
      const notifications = await this.notificationService.getNotifications();
      this.unreadNotificationsCount = notifications.filter(n => !n.is_read).length;
    } catch {
      this.unreadNotificationsCount = 0;
    }
  }

  // ===== LOGOUT =====
  async logout(): Promise<void> {
    try {
      await this.authService.logout();
      this.router.navigate(['/landing']);
    } catch (error) {
      console.warn('Logout com fallback local:', error);
      localStorage.removeItem('token');
      localStorage.removeItem('refresh_token');
      sessionStorage.clear();
      this.router.navigate(['/landing']);
    }
  }

  // ===== FECHA SIDEBAR AUTOMATICAMENTE EM TELAS PEQUENAS (CORRIGIDO) =====
  @HostListener('window:resize')
  onWindowResize(): void {
    if (window.innerWidth > 768 && this.isSidebarCollapsed) {
      this.isSidebarCollapsed = false;
    }
    if (window.innerWidth <= 768 && !this.isSidebarCollapsed) {
      this.isSidebarCollapsed = true;
    }
  }
}