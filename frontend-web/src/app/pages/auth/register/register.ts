import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
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
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './register.html',
  styleUrls: ['./register.css']
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

  constructor(private router: Router, private auth: AuthService) {}

  handleSubmit(event: Event): void {
    event.preventDefault();
    this.errorMessage = null;
    this.successMessage = null;

    if (this.formData.password !== this.formData.confirmPassword) {
      this.errorMessage = 'As palavras-passe não coincidem.';
      return;
    }

    this.loading = true;

    this.auth
      .register({
        display_name: this.formData.name,
        full_name: this.formData.name,
        email: this.formData.email,
        institution: this.formData.institution || undefined,
        password: this.formData.password,
      })
      .subscribe({
        next: async (result) => {
          this.loading = false;

          if (result.ok && result.token) {
            this.auth.setSession(result.token, result.user);
            this.successMessage = result.message || 'Conta criada com sucesso.';
            await this.router.navigate(['/home']);
            return;
          }

          this.errorMessage = this.getFriendlyRegisterError(result.message);
        },
        error: (err: unknown) => {
          this.loading = false;
          const message = err instanceof Error ? err.message : 'Falha ao criar conta.';
          this.errorMessage = this.getFriendlyRegisterError(message);
        },
      });
  }

  private getFriendlyRegisterError(message?: string): string {
    const normalizedMessage = (message ?? '').toLowerCase();

    if (normalizedMessage.includes('validation') || normalizedMessage.includes('422')) {
      return 'Não foi possível validar os dados. Verifique os campos e tente novamente.';
    }

    if (normalizedMessage.includes('email') && normalizedMessage.includes('unique')) {
      return 'Este email já está registado.';
    }

    return message || 'Não foi possível criar a conta. Tente novamente.';
  }
}
