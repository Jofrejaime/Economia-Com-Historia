import { Component, ChangeDetectorRef, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './login.html',
  styleUrls: ['./login.css']
})
export class LoginComponent implements OnInit {
  email = '';
  password = '';
  loading = false;
  errorMessage: string | null = null;

  constructor(private router: Router, private auth: AuthService, private cdr: ChangeDetectorRef) {}

  ngOnInit(): void {
    void this.restoreExistingSession();
  }

  private async restoreExistingSession(): Promise<void> {
    if (!this.auth.getToken()) {
      return;
    }

    const restored = await this.auth.ensureSession();

    if (restored) {
      void this.router.navigate(['/home']);
    }
  }

  handleSubmit(event: Event): void {
    event.preventDefault();
    this.errorMessage = null;
    this.loading = true;
    this.cdr.detectChanges();

    this.auth.login(this.email, this.password).subscribe({
      next: (result) => {
        if (result.ok && result.token) {
          this.auth.setSession(result.token, result.user);
        }

        this.loading = false;
        this.cdr.detectChanges();

        if (result.ok) {
          void this.router.navigate(['/home']);
          return;
        }

        this.errorMessage = this.getFriendlyLoginError(result.message);
        this.cdr.detectChanges();
      },
      error: (err: unknown) => {
        const message = err instanceof Error ? err.message : 'Falha ao iniciar sessão.';

        this.errorMessage = this.getFriendlyLoginError(message);
        this.loading = false;
        this.cdr.detectChanges();
      },
    });
  }

  private getFriendlyLoginError(message?: string): string {
    const normalizedMessage = (message ?? '').toLowerCase();

    if (normalizedMessage.includes('invalid credentials')) {
      return 'Email ou palavra-passe incorretos. Verifique os dados e tente novamente.';
    }

    if (normalizedMessage.includes('unprocessable') || normalizedMessage.includes('422')) {
      return 'Não foi possível validar o acesso. Verifique os dados e tente novamente.';
    }

    return message || 'Não foi possível iniciar sessão. Verifique os dados e tente novamente.';
  }

  forgotPassword(): void {
    void this.router.navigate(['/auth/forgot-password']);
  }
}
