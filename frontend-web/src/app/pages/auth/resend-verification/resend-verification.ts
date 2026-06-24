import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { AuthFeedbackComponent } from '../../../components/auth-feedback/auth-feedback';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-resend-verification',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, AuthFeedbackComponent],
  templateUrl: './resend-verification.html',
  styleUrls: ['../forgot-password/forgot-password.css'],
})
export class ResendVerificationComponent {
  email = '';
  loading = false;
  errorMessage: string | null = null;
  successMessage: string | null = null;

  constructor(private auth: AuthService, private router: Router, private cdr: ChangeDetectorRef) {}

  async handleSubmit(event: Event): Promise<void> {
    event.preventDefault();
    this.errorMessage = null;
    this.successMessage = null;
    this.loading = true;
    this.cdr.detectChanges();

    try {
      const result = await firstValueFrom(this.auth.resendVerification(this.email));

      if (result.ok) {
        this.successMessage = result.message || 'Se a conta existir, enviamos um email de verificação.';
        this.cdr.detectChanges();
        return;
      }

      this.errorMessage = this.getFriendlyError(result.message, result.status);
      this.cdr.detectChanges();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Falha ao reenviar verificação.';
      this.errorMessage = this.getFriendlyError(message);
      this.cdr.detectChanges();
    } finally {
      this.loading = false;
      this.cdr.detectChanges();
    }
  }

  goToLogin(): void {
    void this.router.navigate(['/auth/login']);
  }

  private getFriendlyError(message?: string, status?: number): string {
    const normalized = (message ?? '').toLowerCase();

    if (status === 422 || normalized.includes('unprocessable') || normalized.includes('validation')) {
      return 'Nao foi possivel validar o email. Verifique o endereço e tente novamente.';
    }

    if (status === 500) {
      return 'O servidor encontrou um problema ao reenviar a verificação. Tente novamente em instantes.';
    }

    if (normalized.includes('timeout') || normalized.includes('demorou demasiado')) {
      return 'O servidor demorou demasiado a responder. Tente novamente em instantes.';
    }

    return message || 'Nao foi possivel reenviar a verificação.';
  }
}
