import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { finalize } from 'rxjs';
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

  constructor(private auth: AuthService) {}

  handleSubmit(event: Event): void {
    event.preventDefault();
    this.errorMessage = null;
    this.successMessage = null;
    this.loading = true;

    this.auth
      .forgotPassword(this.email)
      .pipe(finalize(() => {
        this.loading = false;
      }))
      .subscribe({
        next: (result) => {
          if (result.ok) {
            this.successMessage = result.message || 'Se o email existir, enviamos um link de redefinicao.';
            return;
          }

          this.errorMessage = this.getFriendlyError(result.message);
        },
        error: (err: unknown) => {
          const message = err instanceof Error ? err.message : 'Falha ao solicitar redefinicao.';
          this.errorMessage = this.getFriendlyError(message);
        },
      });
  }

  private getFriendlyError(message?: string): string {
    const normalized = (message ?? '').toLowerCase();

    if (normalized.includes('demorou demasiado') || normalized.includes('timeout')) {
      return 'O servidor demorou demasiado a responder. Tente novamente em instantes.';
    }

    if (normalized.includes('email')) {
      return 'Verifique o email e tente novamente.';
    }

    if (normalized.includes('unprocessable') || normalized.includes('422')) {
      return 'Nao foi possivel processar o pedido. Verifique os dados.';
    }

    return message || 'Nao foi possivel solicitar a redefinicao.';
  }
}
