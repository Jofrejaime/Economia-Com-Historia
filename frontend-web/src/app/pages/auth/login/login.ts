import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { AuthFeedbackComponent } from '../../../components/auth-feedback/auth-feedback';
import { AuthService } from '../../../services/auth.service';

interface User {
  id?: string;
  role?: 'admin' | 'professor' | 'investigador' | 'estudante' | string;
  email?: string;
  display_name?: string;
  [key: string]: unknown;
}

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, AuthFeedbackComponent],
  templateUrl: './login.html',
  styleUrls: ['./login.css'],
})
export class LoginComponent implements OnInit {
  email = '';
  password = '';
  loading = false;
  errorMessage: string | null = null;
  successMessage: string | null = null;
  feedbackActionLabel: string | null = null;
  feedbackActionLink: string | null = null;

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
      this.redirectByRole();
    }
  }

  private redirectByRole(): void {
    const user = this.auth.getUser() as User | null;
    const userRole = user?.role ?? 'estudante';

    switch (userRole) {
      case 'admin':
        void this.router.navigate(['/admin/dashboard']);
        break;
      case 'professor':
      case 'investigador':
      case 'estudante':
      default:
        void this.router.navigate(['/home']);
        break;
    }
  }
goBack(): void {
  this.router.navigate(['/landing']);
}
  async handleSubmit(event: Event): Promise<void> {
    event.preventDefault();
    this.errorMessage = null;
    this.successMessage = null;
    this.feedbackActionLabel = null;
    this.feedbackActionLink = null;
    this.loading = true;
    this.cdr.detectChanges();

    try {
      const result = await firstValueFrom(this.auth.login(this.email, this.password));

      if (result.ok && result.token) {
        this.auth.setSession(result.token, result.user);
        this.successMessage = result.message || 'Sessão iniciada com sucesso.';
        this.cdr.detectChanges();
        await this.sleep(1000);
        this.redirectByRole();
        return;
      }

      this.setLoginError(result.message, result.status);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Falha ao iniciar sessao.';
      this.setLoginError(message);
    } finally {
      this.loading = false;
      this.cdr.detectChanges();
    }
  }

  private setLoginError(message?: string, status?: number): void {
    this.errorMessage = this.getFriendlyLoginError(message, status);
    if (status === 403 || (message ?? '').toLowerCase().includes('verify your email')) {
      this.feedbackActionLabel = 'Reenviar verificação';
      this.feedbackActionLink = '/auth/resend-verification';
    }
    this.cdr.detectChanges();
  }

  private getFriendlyLoginError(message?: string, status?: number): string {
    const normalizedMessage = (message ?? '').toLowerCase();

    if (status === 403 || normalizedMessage.includes('verify your email')) {
      return 'Precisa verificar o email antes de iniciar sessão.';
    }

    if (normalizedMessage.includes('invalid credentials')) {
      return 'Email ou palavra-passe incorretos. Verifique os dados e tente novamente.';
    }

    if (status === 403 || normalizedMessage.includes('deactivated')) {
      return 'A conta está desativada. Contacte a equipa de suporte.';
    }

    if (normalizedMessage.includes('timeout') || normalizedMessage.includes('demorou demasiado')) {
      return 'O servidor demorou demasiado a responder. Tente novamente em instantes.';
    }

    if (normalizedMessage.includes('unprocessable') || normalizedMessage.includes('422')) {
      return 'Nao foi possivel validar o acesso. Verifique os dados e tente novamente.';
    }

    return message || 'Nao foi possivel iniciar sessao. Verifique os dados e tente novamente.';
  }

  forgotPassword(): void {
    void this.router.navigate(['/auth/forgot-password']);
  }

  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => {
      window.setTimeout(resolve, ms);
    });
  }
}
