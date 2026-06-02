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
  avatarUrl = 'https://www.lusakavoice.com/wp-content/uploads/2014/08/Screen-Shot-2014-08-06-at-3.06.26-AM.png';

  constructor(
    private router: Router,
    private auth: AuthService,
    private profileService: ProfileService
  ) {}

  ngOnInit(): void {
    this.loadUserAvatar();
  }

  private async loadUserAvatar(): Promise<void> {
    try {
      const me = await this.profileService.getMe();
      if (me?.profile?.avatar_url) {
        this.avatarUrl = me.profile.avatar_url;
      }
    } catch (error) {
      // Falhar silenciosamente, usar default
    }
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

