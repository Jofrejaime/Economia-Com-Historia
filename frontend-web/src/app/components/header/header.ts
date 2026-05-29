import { Component, ElementRef, HostListener, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { ViewEncapsulation } from '@angular/core';

@Component({
  selector: 'app-header',
  standalone: true,  // ← IMPORTANTE: adicione standalone: true
  imports: [
    CommonModule,
    RouterModule,
    HeaderComponent
  ],
  templateUrl: './header.html',  // ← mude para .html (sem .component)
  styleUrls: ['./header.css'] ,
  encapsulation: ViewEncapsulation.None    // ← mude para .css (sem .component)
})
export class HeaderComponent {
  @ViewChild('dropdownRef') dropdownRef!: ElementRef;
  
  mobileMenuOpen = false;
  profileDropdownOpen = false;
  avatarUrl = 'https://raw.githubusercontent.com/stackblitz/angular-11-start/master/src/assets/avatar-placeholder.png';
  
  // Substitua pela URL real do avatar ou use um caminho local
  // avatarUrl = '/assets/images/avatar.png';

  constructor(private router: Router) {}

  toggleMobileMenu(): void {
    this.mobileMenuOpen = !this.mobileMenuOpen;
    if (this.mobileMenuOpen) {
      this.profileDropdownOpen = false;
    }
  }

  toggleDropdown(): void {
    this.profileDropdownOpen = !this.profileDropdownOpen;
  }

  closeDropdown(): void {
    this.profileDropdownOpen = false;
  }

  isActive(path: string): boolean {
    return this.router.url === path;
  }

  isActiveOrChild(path: string): boolean {
    return this.router.url === path || this.router.url.startsWith(path + '/');
  }

  handleNavigation(path: string): void {
    this.router.navigate([path]);
    this.mobileMenuOpen = false;
    this.profileDropdownOpen = false;
  }

  logout(): void {
    // Limpar dados do usuário
    localStorage.removeItem('user');
    sessionStorage.clear();
    
    this.profileDropdownOpen = false;
    this.mobileMenuOpen = false;
    
    // Navegar para login
    this.router.navigate(['/login']);
  }

}