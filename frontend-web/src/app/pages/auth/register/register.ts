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

  constructor(private router: Router, private auth: AuthService, private cdr: ChangeDetectorRef) {}

  async handleSubmit(event: Event): Promise<void> {
    event.preventDefault();
    this.errorMessage = null;
    this.successMessage = null;

    if (this.formData.password !== this.formData.confirmPassword) {
      this.errorMessage = 'As palavras-passe nao coincidem.';
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

      this.errorMessage = this.getFriendlyRegisterError(result.message, result.status);
      this.cdr.detectChanges();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Falha ao criar conta.';
      this.errorMessage = this.getFriendlyRegisterError(message);
      this.cdr.detectChanges();
    } finally {
      this.loading = false;
      this.cdr.detectChanges();
    }
  }

  private getFriendlyRegisterError(message?: string, status?: number): string {
    const normalizedMessage = (message ?? '').toLowerCase();

    if (normalizedMessage.includes('timeout') || normalizedMessage.includes('demorou demasiado')) {
      return 'O servidor demorou demasiado a responder. Tente novamente em instantes.';
    }

    if (status === 422 || normalizedMessage.includes('validation') || normalizedMessage.includes('unprocessable')) {
      return 'Nao foi possivel validar os dados. Verifique os campos e tente novamente.';
    }

    if (status === 403 || normalizedMessage.includes('verify your email')) {
      return 'A conta foi criada, mas precisa de verificar o email antes de continuar.';
    }

    if (status === 201) {
      return 'A conta foi criada com sucesso.';
    }

    if (normalizedMessage.includes('email') && normalizedMessage.includes('unique')) {
      return 'Este email ja esta registado.';
    }

    return message || 'Nao foi possivel criar a conta. Tente novamente.';
  }

  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => {
      window.setTimeout(resolve, ms);
    });
  }
}
