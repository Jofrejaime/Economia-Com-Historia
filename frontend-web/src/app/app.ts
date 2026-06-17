import { Component, OnInit } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { AuthService } from './services/auth.service';
import { ToastComponent } from './components/toast/toast';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, ToastComponent],
  template: `
    <app-toast></app-toast>
    <router-outlet></router-outlet>
  `,
})
export class App implements OnInit {
  constructor(private auth: AuthService, private router: Router) {}

  ngOnInit(): void {
    void this.restoreSessionOnStart();
  }

  private async restoreSessionOnStart(): Promise<void> {
    if (!this.auth.getToken()) {
      return;
    }

    const restored = await this.auth.ensureSession();

    if (restored && (this.router.url === '/auth/login' || this.router.url === '/landing')) {
      void this.router.navigate(['/home']);
    }
  }
}
