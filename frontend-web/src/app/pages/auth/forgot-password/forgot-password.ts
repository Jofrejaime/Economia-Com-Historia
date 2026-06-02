import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './forgot-password.html',
  styleUrls: ['./forgot-password.css'],
})
export class ForgotPasswordComponent {
  email = '';
  loading = false;
  errorMessage: string | null = null;
  successMessage: string | null = null;
  resetToken: string | null = null;

  constructor(private auth: AuthService, private router: Router) {}

  handleSubmit(event: Event): void {
    event.preventDefault();
    this.errorMessage = null;
    this.successMessage = null;
    this.resetToken = null;
    this.loading = true;

    this.auth.forgotPassword(this.email).subscribe({
      next: (result) => {
        this.loading = false;

        if (result.ok) {
          this.successMessage = result.message || 'Se o email existir, foi gerado um token de redefinição.';
          this.resetToken = result.resetToken || null;
          return;
        }

        this.errorMessage = this.getFriendlyError(result.message);
      },
      error: (err: unknown) => {
        this.loading = false;
        const message = err instanceof Error ? err.message : 'Falha ao solicitar redefinição.';
        this.errorMessage = this.getFriendlyError(message);
      },
    });
  }

  goToResetPassword(): void {
    if (!this.resetToken) {
      return;
    }

    void this.router.navigate(['/auth/reset-password'], {
      queryParams: { token: this.resetToken },
    });
  }

  private getFriendlyError(message?: string): string {
    const normalized = (message ?? '').toLowerCase();

    if (normalized.includes('email')) {
      return 'Verifique o email e tente novamente.';
    }

    if (normalized.includes('unprocessable') || normalized.includes('422')) {
      return 'Não foi possível processar o pedido. Verifique os dados.';
    }

    return message || 'Não foi possível solicitar a redefinição.';
  }
}
