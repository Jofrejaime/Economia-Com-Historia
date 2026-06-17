import { Component } from '@angular/core';
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
  }

  // ===== LOGOUT CORRIGIDO =====
  async logout(): Promise<void> {
    try {
      // Se o AuthService tiver um método logout que retorna Promise
      await this.authService.logout();
      this.router.navigate(['/login']);
    } catch (error) {
      // Fallback: logout local mesmo se o serviço falhar
      console.warn('Logout com fallback local:', error);
      localStorage.removeItem('token');
      localStorage.removeItem('refresh_token');
      // Limpar outros dados de sessão se necessário
      sessionStorage.clear();
      this.router.navigate(['/login']);
    }
  }
}