import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { AuthFeedbackComponent } from '../../../components/auth-feedback/auth-feedback';
import { AuthService } from '../../../services/auth.service';

interface RegisterFormData {
  name: string;
  email: string;
  institution: string;
  password: string;
  confirmPassword: string;
}

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, AuthFeedbackComponent],
  templateUrl: './register.html',
  styleUrls: ['./register.css'],
})
export class RegisterComponent {
  formData: RegisterFormData = {
    name: '',
    email: '',
    institution: '',
    password: '',
    confirmPassword: '',
  };

  loading = false;
  errorMessage: string | null = null;
  successMessage: string | null = null;

  readonly passwordRequirement =
    'A palavra-passe deve ter pelo menos 8 caracteres, incluir letras maiúsculas e minúsculas, e pelo menos um símbolo (ex: ! @ # $ % &).';

  constructor(private router: Router, private auth: AuthService, private cdr: ChangeDetectorRef) {}

  /** Validação local, para dar feedback imediato sem esperar pelo backend. */
  private validatePasswordLocally(password: string): string | null {
    if (password.length < 8) {
      return `A palavra-passe precisa de ter pelo menos 8 caracteres. ${this.passwordRequirement}`;
    }
    if (!/[a-z]/.test(password)) {
      return `A palavra-passe precisa de pelo menos uma letra minúscula.`;
    }
    if (!/[A-Z]/.test(password)) {
      return `A palavra-passe precisa de pelo menos uma letra maiúscula.`;
    }
    if (!/[^A-Za-z0-9]/.test(password)) {
      return `A palavra-passe precisa de pelo menos um símbolo (ex: ! @ # $ % &).`;
    }
    return null;
  }

  goBack(): void {
  this.router.navigate(['/landing']);

}

  async handleSubmit(event: Event): Promise<void> {
    event.preventDefault();
    this.errorMessage = null;
    this.successMessage = null;

    if (this.formData.password !== this.formData.confirmPassword) {
      this.errorMessage = 'As palavras-passe não coincidem.';
      this.cdr.detectChanges();
      return;
    }

    const passwordError = this.validatePasswordLocally(this.formData.password);
    if (passwordError) {
      this.errorMessage = passwordError;
      this.cdr.detectChanges();
      return;
    }

    this.loading = true;
    this.cdr.detectChanges();

    try {
      const result = await firstValueFrom(
        this.auth.register({
          display_name: this.formData.name,
          full_name: this.formData.name,
          email: this.formData.email,
          institution: this.formData.institution || undefined,
          password: this.formData.password,
          password_confirmation: this.formData.confirmPassword,
        })
      );

      if (result.ok && result.token && (result.status === 201 || result.status === 200)) {
        this.auth.setSession(result.token, result.user);
        this.successMessage = result.message || 'Conta criada com sucesso.';
        this.cdr.detectChanges();
        await this.sleep(2000);
        await this.router.navigate(['/home']);
        return;
      }

      this.errorMessage = this.getFriendlyRegisterError(result.message, result.status, (result as any).errors);
      this.cdr.detectChanges();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Falha ao criar conta.';
      const errors = (err as any)?.error?.errors;
      const status = (err as any)?.status;
      this.errorMessage = this.getFriendlyRegisterError(message, status, errors);
      this.cdr.detectChanges();
    } finally {
      this.loading = false;
      this.cdr.detectChanges();
    }
  }

  private getFriendlyRegisterError(
    message?: string,
    status?: number,
    errors?: Record<string, string[]>
  ): string {
    // Prioridade máxima: erros de validação reais do backend, campo a campo
    if (errors?.['password']?.length) {
      return `A palavra-passe não cumpre os requisitos. ${this.passwordRequirement}`;
    }

    if (errors?.['email']?.length) {
      return 'Este email já está registado. Tente entrar ou recuperar a palavra-passe.';
    }

    if (errors && Object.keys(errors).length > 0) {
      return Object.values(errors).flat().join(' ');
    }

    const normalizedMessage = (message ?? '').toLowerCase();

    if (
      normalizedMessage.includes('password') &&
      (normalizedMessage.includes('uppercase') || normalizedMessage.includes('symbol') || normalizedMessage.includes('lowercase'))
    ) {
      return `A palavra-passe não cumpre os requisitos. ${this.passwordRequirement}`;
    }

    if (
      normalizedMessage.includes('email') &&
      (normalizedMessage.includes('already been taken') || normalizedMessage.includes('unique') || normalizedMessage.includes('já está registado'))
    ) {
      return 'Este email já está registado. Tente entrar ou recuperar a palavra-passe.';
    }

    if (normalizedMessage.includes('timeout') || normalizedMessage.includes('demorou demasiado')) {
      return 'O servidor demorou demasiado a responder. Tente novamente em instantes.';
    }

    if (status === 403 || normalizedMessage.includes('verify your email')) {
      return 'A conta foi criada, mas precisa de verificar o email antes de continuar.';
    }

    if (status === 201) {
      return 'A conta foi criada com sucesso.';
    }

    return message || 'Não foi possível criar a conta. Tente novamente.';
  }

  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => {
      window.setTimeout(resolve, ms);
    });
  }
}