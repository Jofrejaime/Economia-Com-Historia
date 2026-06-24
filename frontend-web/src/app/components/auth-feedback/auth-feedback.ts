import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { RouterModule } from '@angular/router';

export type AuthFeedbackType = 'error' | 'success' | 'info';

@Component({
  selector: 'app-auth-feedback',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="auth-feedback" [ngClass]="typeClass">
      <div class="auth-feedback-icon" [ngClass]="typeClass + '-icon'">{{ icon }}</div>
      <div class="auth-feedback-content">
        <div class="auth-feedback-title">{{ title }}</div>
        <div class="auth-feedback-message">{{ message }}</div>
        <a
          *ngIf="actionLabel && actionLink"
          [routerLink]="actionLink"
          class="auth-feedback-action"
          [ngClass]="typeClass + '-action'"
        >
          {{ actionLabel }}
        </a>
      </div>
    </div>
  `,
  styles: [
    `
      .auth-feedback {
        display: flex;
        gap: 12px;
        padding: 14px 16px;
        border-radius: 6px;
        margin-bottom: 16px;
        border: 1px solid transparent;
      }

      .auth-feedback-icon {
        width: 28px;
        height: 28px;
        border-radius: 9999px;
        display: flex;
        align-items: center;
        justify-content: center;
        flex: 0 0 28px;
        font-size: 14px;
        font-weight: 700;
      }

      .auth-feedback-content {
        flex: 1;
        min-width: 0;
      }

      .auth-feedback-title {
        font-size: 14px;
        font-weight: 700;
        line-height: 1.4;
        margin-bottom: 3px;
      }

      .auth-feedback-message {
        font-size: 13px;
        line-height: 1.6;
      }

      .auth-feedback-action {
        display: inline-flex;
        margin-top: 10px;
        font-size: 13px;
        font-weight: 600;
        text-decoration: underline;
        text-underline-offset: 2px;
      }

      .error {
        background: rgba(185, 28, 28, 0.08);
        border-color: rgba(185, 28, 28, 0.15);
        color: #7f1d1d;
      }

      .error-icon {
        background: rgba(185, 28, 28, 0.12);
        color: #991b1b;
      }

      .error-action {
        color: #991b1b;
      }

      .success {
        background: rgba(22, 163, 74, 0.08);
        border-color: rgba(34, 197, 94, 0.15);
        color: #14532d;
      }

      .success-icon {
        background: rgba(22, 163, 74, 0.12);
        color: #166534;
      }

      .success-action {
        color: #166534;
      }

      .info {
        background: rgba(30, 64, 175, 0.08);
        border-color: rgba(59, 130, 246, 0.15);
        color: #1e3a8a;
      }

      .info-icon {
        background: rgba(30, 64, 175, 0.12);
        color: #1d4ed8;
      }

      .info-action {
        color: #1d4ed8;
      }
    `,
  ],
})
export class AuthFeedbackComponent {
  @Input() type: AuthFeedbackType = 'info';
  @Input() title = '';
  @Input() message = '';
  @Input() actionLabel: string | null = null;
  @Input() actionLink: string | null = null;

  get icon(): string {
    switch (this.type) {
      case 'success':
        return '✓';
      case 'error':
        return '!';
      default:
        return 'i';
    }
  }

  get typeClass(): string {
    return this.type;
  }
}
