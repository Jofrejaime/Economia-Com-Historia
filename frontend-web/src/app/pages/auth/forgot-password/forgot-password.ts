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
  template: `
<div style="display: flex; min-height: 100vh;">
  <div style="flex: 1; background: linear-gradient(135deg, #6b0119, #8b1e2d); position: relative; display: flex; flex-direction: column; justify-content: space-between; padding: 48px;">
    <div style="position: absolute; top: 0; right: 0; width: 300px; height: 300px; background: rgba(139,30,45,0.08); border-radius: 50%;"></div>
    <div style="position: absolute; bottom: 0; left: 0; width: 200px; height: 200px; background: rgba(139,30,45,0.05); border-radius: 50%;"></div>

    <div style="position: relative; z-index: 2;">
      <div style="display: flex; align-items: center; gap: 12px;">
        <div style="width: 36px; height: 36px; background: rgba(255,255,255,0.1); border-radius: 8px; display: flex; align-items: center; justify-content: center;">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="#d4a0a8">
            <path d="M12 2L2 7L12 12L22 7L12 2Z"/>
            <path d="M2 17L12 22L22 17"/>
            <path d="M2 12L12 17L22 12"/>
          </svg>
        </div>
        <span style="color: #f0e6e8; font-size: 20px; font-weight: 600; letter-spacing: -0.3px;">Economia com Historia</span>
      </div>
    </div>

    <div style="position: relative; z-index: 2; flex: 1; display: flex; flex-direction: column; justify-content: center; gap: 36px;">
      <div>
        <div style="margin-bottom: 16px;">
          <span style="background: rgba(255,255,255,0.15); color: white; font-size: 12px; font-weight: 600; padding: 4px 12px; border-radius: 20px; display: inline-block;">RECUPERACAO DE ACESSO</span>
        </div>
        <h2 style="font-family: 'IBM Plex Sans', sans-serif; color: white; font-size: 32px; font-weight: 700; margin: 0 0 12px 0; letter-spacing: -0.5px;">Esqueceu a senha?</h2>
        <p style="color: rgba(255,255,255,0.7); font-size: 15px; line-height: 1.5; margin: 0;">Indique o email institucional para receber o link de redefinicao.</p>
      </div>
    </div>
  </div>

  <div style="flex: 1; background-color: #f8f9ff; display: flex; align-items: center; justify-content: center; padding: 48px; overflow-y: auto;">
    <div style="width: 100%; max-width: 440px;">
      <div style="margin-bottom: 40px; text-align: center;">
        <div style="margin-bottom: 16px;">
          <span style="background: linear-gradient(135deg, #8b1e2d15, #6b011915); color: #8b1e2d; font-size: 13px; font-weight: 600; padding: 6px 14px; border-radius: 30px; display: inline-block; letter-spacing: 0.5px;">REDEFINIR ACESSO</span>
        </div>
        <h1 style="font-family: 'IBM Plex Sans', sans-serif; color: #121c2a; font-size: 36px; font-weight: 700; margin: 0 0 12px 0; letter-spacing: -1px;">Recuperar senha</h1>
        <p style="color: #64748b; font-size: 16px; margin: 0;">Vamos enviar um link seguro para redefinir a sua palavra-passe</p>
      </div>

      <div style="background: white; border-radius: 24px; padding: 40px; border: 1px solid rgba(222,191,191,0.2); box-shadow: 0 8px 24px rgba(0,0,0,0.04);">
        <form (ngSubmit)="handleSubmit($event)">
          <div *ngIf="loading" style="margin-bottom:16px; background: linear-gradient(135deg, rgba(59,130,246,0.1), rgba(37,99,235,0.06)); color:#1d4ed8; padding:14px 16px; border-radius:14px; border:1px solid rgba(59,130,246,0.15);">
            Estamos a enviar o pedido. Se demorar demais, vamos mostrar uma mensagem de erro.
          </div>

          <div *ngIf="errorMessage" style="margin-bottom:16px; background: linear-gradient(135deg, rgba(185,28,28,0.1), rgba(153,27,27,0.06)); color:#7f1d1d; padding:14px 16px; border-radius:14px; border:1px solid rgba(185,28,28,0.15);">
            {{ errorMessage }}
          </div>

          <div *ngIf="successMessage" style="margin-bottom:16px; background: linear-gradient(135deg, rgba(22,163,74,0.1), rgba(34,197,94,0.08)); color:#14532d; padding:14px 16px; border-radius:14px; border:1px solid rgba(34,197,94,0.18);">
            <div style="font-weight:700; margin-bottom:4px;">Pedido enviado</div>
            <div style="font-size:13px; line-height:1.4;">{{ successMessage }}</div>
          </div>

          <div style="margin-bottom: 24px;">
            <label style="display: block; font-weight: 600; color: #121c2a; font-size: 14px; margin-bottom: 8px;">Email institucional</label>
            <input type="email" [(ngModel)]="email" name="email" placeholder="nome@instituicao.edu" required style="width: 100%; padding: 14px 16px; background: #f8f9ff; border-radius: 12px; border: 1px solid rgba(222,191,191,0.3); font-size: 15px; outline: none; transition: all 0.3s; box-sizing: border-box;" />
          </div>

          <button type="submit" [disabled]="loading" style="width: 100%; background: linear-gradient(135deg, #8b1e2d, #6b0119); padding: 16px; border-radius: 40px; border: none; cursor: pointer; font-weight: 600; color: white; font-size: 16px; transition: all 0.3s; margin-bottom: 24px;">
            <span *ngIf="!loading">Enviar link</span>
            <span *ngIf="loading">A enviar...</span>
          </button>
        </form>

        <div style="text-align: center;">
          <a routerLink="/auth/login" style="color: #8b1e2d; font-weight: 600; text-decoration: none;">Voltar ao login</a>
        </div>
      </div>
    </div>
  </div>
</div>
  `,
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
