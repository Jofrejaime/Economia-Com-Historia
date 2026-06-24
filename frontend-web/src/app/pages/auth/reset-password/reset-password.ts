import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { AuthFeedbackComponent } from '../../../components/auth-feedback/auth-feedback';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, AuthFeedbackComponent],
  templateUrl: './reset-password.html',
  styleUrls: ['./reset-password.css'],
})
export class ResetPasswordComponent implements OnInit {
  private token = '';
  password = '';
  confirmPassword = '';
  loading = false;
  errorMessage: string | null = null;
  successMessage: string | null = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private auth: AuthService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    const token = this.route.snapshot.queryParamMap.get('token');
    if (token) {
      this.token = token;
    }
  }

  async handleSubmit(event: Event): Promise<void> {
    event.preventDefault();
    this.errorMessage = null;
    this.successMessage = null;

    if (!this.token) {
      this.errorMessage = 'Token de recuperação em falta. Abra novamente o link do email.';
      this.cdr.detectChanges();
      return;
    }

    if (this.password !== this.confirmPassword) {
      this.errorMessage = 'As palavras-passe não coincidem.';
      this.cdr.detectChanges();
      return;
    }

    this.loading = true;
    this.cdr.detectChanges();

    try {
      const result = await firstValueFrom(
        this.auth.resetPassword({
          token: this.token,
          password: this.password,
          password_confirmation: this.confirmPassword,
        })
      );

      if (result.ok) {
        this.successMessage = result.message || 'Palavra-passe redefinida com sucesso.';
        this.password = '';
        this.confirmPassword = '';
        this.cdr.detectChanges();
        await this.sleep(1200);
        await this.router.navigate(['/auth/login']);
        return;
      }

      this.errorMessage = this.getFriendlyError(result.message, result.status);
      this.cdr.detectChanges();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Falha ao redefinir a palavra-passe.';
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

    if (normalized.includes('token') && (normalized.includes('invalid') || normalized.includes('expired'))) {
      return 'O token é inválido ou expirou. Gere um novo pedido.';
    }

    if (normalized.includes('password') && normalized.includes('confirmed')) {
      return 'Confirme corretamente a nova palavra-passe.';
    }

    if (status === 422 || normalized.includes('unprocessable')) {
      return 'Não foi possível validar os dados. Verifique os campos e tente novamente.';
    }

    if (normalized.includes('demorou demasiado') || normalized.includes('timeout')) {
      return 'O servidor demorou demasiado a responder. Tente novamente em instantes.';
    }

    return message || 'Não foi possível redefinir a palavra-passe.';
  }

  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => {
      window.setTimeout(resolve, ms);
    });
  }
}
