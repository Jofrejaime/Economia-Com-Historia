import { Component, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule, NavigationEnd } from '@angular/router';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-dashboard-admin',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './dashboard-admin.html',
  styleUrls: ['./dashboard-admin.css']
})
export class DashboardAdminComponent {
  currentYear = new Date().getFullYear();
  currentRoute = '';
  pendingCount = 12;
  pendingReportsCount = 4;
  unreadNotificationsCount = 0;
  
  // Propriedade para sidebar
  isSidebarCollapsed: boolean = false;

  constructor(
    private router: Router,
    private authService: AuthService
  ) {
    this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        this.currentRoute = event.urlAfterRedirects;
      }
    });
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