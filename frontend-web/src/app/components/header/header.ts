import { Component, HostListener, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { ProfileService } from '../../services/profile.service';
import { NotificationService } from '../../services/notification.service';

interface HeaderUser {
  display_name?: string;
  email?: string;
  role?: string;
}

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './header.html',
  styleUrls: ['./header.css'],
})
export class HeaderComponent implements OnInit {
  mobileMenuOpen = false;
  avatarUrl = '';
  unreadCount = 0;
  isAuthenticated = false;
  displayName = 'Conta';
  userRole = '';

  // Cache partilhado entre TODAS as instâncias do HeaderComponent (cada
  // página tem o seu próprio <app-header>, o que recria o componente a
  // cada navegação). Sem isto, o avatar "pisca" a cada mudança de página
  // enquanto se espera por uma nova chamada a getMe().
  private static cachedAvatarUrl: string | null = null;
  private static cachedDisplayName: string | null = null;
  private static cachedUserRole: string | null = null;
  private static cacheUserId: string | null = null;

  constructor(
    public router: Router,
    private auth: AuthService,
    private profileService: ProfileService,
    private notificationService: NotificationService
  ) {}

  ngOnInit(): void {
    this.syncSessionState();

    if (this.isAuthenticated) {
      this.applyCacheIfAvailable();
      this.loadUserAvatar();
      this.loadUnreadCount();
    }
  }

  private syncSessionState(): void {
    this.isAuthenticated = this.auth.isAuthenticated();

    if (!this.isAuthenticated) {
      this.avatarUrl = '';
      this.unreadCount = 0;
      this.displayName = 'Conta';
      this.userRole = '';
      HeaderComponent.cachedAvatarUrl = null;
      HeaderComponent.cachedDisplayName = null;
      HeaderComponent.cachedUserRole = null;
      HeaderComponent.cacheUserId = null;
      return;
    }

    const user = this.auth.getUser() as (HeaderUser & { id?: string }) | null;
    this.displayName = user?.display_name || user?.email || 'Conta';
    this.userRole = user?.role || '';

    // Se o utilizador mudou (ex: logout + login com outra conta), invalida a cache.
    const userId = user?.id ?? null;
    if (HeaderComponent.cacheUserId !== userId) {
      HeaderComponent.cachedAvatarUrl = null;
      HeaderComponent.cacheUserId = userId;
    }
  }

  /** Mostra imediatamente o último avatar conhecido, sem esperar pela API. */
  private applyCacheIfAvailable(): void {
    if (HeaderComponent.cachedAvatarUrl !== null) {
      this.avatarUrl = HeaderComponent.cachedAvatarUrl;
    }
    if (HeaderComponent.cachedDisplayName) {
      this.displayName = HeaderComponent.cachedDisplayName;
    }
    if (HeaderComponent.cachedUserRole) {
      this.userRole = HeaderComponent.cachedUserRole;
    }
  }

  private async loadUserAvatar(): Promise<void> {
    try {
      const me = await this.profileService.getMe();
      const url = me?.profile?.avatar_url ?? '';
      this.avatarUrl = url;
      HeaderComponent.cachedAvatarUrl = url;
      HeaderComponent.cachedDisplayName = this.displayName;
      HeaderComponent.cachedUserRole = this.userRole;
    } catch {
      // Em caso de erro, mantém o que já estava (cache ou vazio) em vez de limpar.
    }
  }

  private async loadUnreadCount(): Promise<void> {
    try {
      const notifications = await this.notificationService.getNotifications();
      this.unreadCount = notifications.filter(n => !n.is_read).length;
    } catch {
      this.unreadCount = 0;
    }
  }

  hasAvatar(): boolean {
    return !!this.avatarUrl?.trim();
  }

  onAvatarLoadError(): void {
    this.avatarUrl = '';
    HeaderComponent.cachedAvatarUrl = '';
  }

  goToHome(): void {
  if (this.isAuthenticated) {
    this.router.navigate(['/home']);
  } else {
    this.router.navigate(['/landing']);
  }
}

  goToNotifications(): void {
    void this.router.navigate(['/notificacoes']);
  }

  goToLogin(): void {
    void this.router.navigate(['/auth/login']);
  }

  goToRegister(): void {
    void this.router.navigate(['/auth/criar-conta']);
  }

  toggleMobileMenu(): void {
    this.mobileMenuOpen = !this.mobileMenuOpen;
  }

  closeMobileMenu(): void {
    this.mobileMenuOpen = false;
  }

  async logout(): Promise<void> {
    HeaderComponent.cachedAvatarUrl = null;
    HeaderComponent.cachedDisplayName = null;
    HeaderComponent.cachedUserRole = null;
    HeaderComponent.cacheUserId = null;
    await this.auth.logout();
    this.closeMobileMenu();
    await this.router.navigate(['/landing']);
  }

  @HostListener('window:resize')
  onResize(): void {
    if (window.innerWidth > 768) {
      this.mobileMenuOpen = false;
    }
  }
}