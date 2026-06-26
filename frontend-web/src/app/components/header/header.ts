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

  constructor(
    private router: Router,
    private auth: AuthService,
    private profileService: ProfileService,
    private notificationService: NotificationService
  ) {}

  ngOnInit(): void {
    this.syncSessionState();

    if (this.isAuthenticated) {
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
      return;
    }

    const user = this.auth.getUser() as HeaderUser | null;
    this.displayName = user?.display_name || user?.email || 'Conta';
    this.userRole = user?.role || '';
  }

  private async loadUserAvatar(): Promise<void> {
    try {
      const me = await this.profileService.getMe();
      if (me?.profile?.avatar_url) {
        this.avatarUrl = me.profile.avatar_url;
      }
    } catch {
      this.avatarUrl = '';
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