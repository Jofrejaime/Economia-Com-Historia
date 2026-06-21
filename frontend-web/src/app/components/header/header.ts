import { Component, HostListener, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { ProfileService } from '../../services/profile.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './header.html',
  styleUrls: ['./header.css']
})
export class HeaderComponent implements OnInit {
  mobileMenuOpen = false;
  avatarUrl = '';
  unreadCount = 0;

  constructor(
    private router: Router,
    private auth: AuthService,
    private profileService: ProfileService
  ) {}

  ngOnInit(): void {
    this.loadUserAvatar();
    this.loadUnreadCount();
  }

  private async loadUserAvatar(): Promise<void> {
    try {
      const me = await this.profileService.getMe();
      if (me?.profile?.avatar_url) {
        this.avatarUrl = me.profile.avatar_url;
      }
    } catch (error) {
      this.avatarUrl = '';
    }
  }

  private loadUnreadCount(): void {
    // Em produção: buscar do backend
    // Por enquanto, valor mock
    this.unreadCount = 3;
  }

  // Navegar diretamente para a página de notificações
  goToNotifications(): void {
    this.router.navigate(['/notificacoes']);
  }

  toggleMobileMenu(): void {
    this.mobileMenuOpen = !this.mobileMenuOpen;
  }

  closeMobileMenu(): void {
    this.mobileMenuOpen = false;
  }

  async logout(): Promise<void> {
    await this.auth.logout();
    await this.router.navigate(['/landing']);
  }

  @HostListener('window:resize', ['$event'])
  onResize(event: any): void {
    if (window.innerWidth > 768) {
      this.mobileMenuOpen = false;
    }
  }
}