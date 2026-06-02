import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { finalize } from 'rxjs';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './reset-password.html',
  styleUrls: ['./reset-password.css'],
})
export class ResetPasswordComponent implements OnInit {
  token = '';
  password = '';
  confirmPassword = '';
  loading = false;
  errorMessage: string | null = null;
  successMessage: string | null = null;

  constructor(private route: ActivatedRoute, private router: Router, private auth: AuthService) {}

  ngOnInit(): void {
    const token = this.route.snapshot.queryParamMap.get('token');
    if (token) {
      this.token = token;
    }
  }

  handleSubmit(event: Event): void {
    event.preventDefault();
    this.errorMessage = null;
    this.successMessage = null;

    if (!this.token) {
      this.errorMessage = 'Token de recuperação em falta. Abra novamente o link do email.';
      return;
    }

    if (this.password !== this.confirmPassword) {
      this.errorMessage = 'As palavras-passe não coincidem.';
      return;
    }

    this.loading = true;

    this.auth
      .resetPassword({
        token: this.token,
        password: this.password,
        password_confirmation: this.confirmPassword,
      })
      .pipe(
        finalize(() => {
          this.loading = false;
        })
      )
      .subscribe({
        next: (result) => {
          if (result.ok) {
            this.successMessage = result.message || 'Palavra-passe redefinida com sucesso.';
            this.password = '';
            this.confirmPassword = '';
            return;
          }

          this.errorMessage = this.getFriendlyError(result.message);
        },
        error: (err: unknown) => {
          const message = err instanceof Error ? err.message : 'Falha ao redefinir a palavra-passe.';
          this.errorMessage = this.getFriendlyError(message);
        },
      });
  }

  goToLogin(): void {
    void this.router.navigate(['/auth/login']);
  }

  private getFriendlyError(message?: string): string {
    const normalized = (message ?? '').toLowerCase();

    if (normalized.includes('token') && (normalized.includes('invalid') || normalized.includes('expired'))) {
      return 'O token é inválido ou expirou. Gere um novo pedido.';
    }

    if (normalized.includes('password') && normalized.includes('confirmed')) {
      return 'Confirme corretamente a nova palavra-passe.';
    }

    if (normalized.includes('422') || normalized.includes('unprocessable')) {
      return 'Não foi possível validar os dados. Verifique os campos e tente novamente.';
    }

    if (normalized.includes('demorou demasiado') || normalized.includes('timeout')) {
      return 'O servidor demorou demasiado a responder. Tente novamente em instantes.';
    }

    return message || 'Não foi possível redefinir a palavra-passe.';
  }
}
