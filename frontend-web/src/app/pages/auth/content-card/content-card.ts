import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-content-card',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="content-card" (click)="onClick.emit()">
      <div class="content-card-header">
        <span class="content-card-type">{{ type }}</span>
        <span class="content-card-date">{{ date }}</span>
      </div>
      <h3 class="content-card-title">{{ title }}</h3>
      <p class="content-card-description">{{ description }}</p>
      <div class="content-card-footer">
        <div class="content-card-meta">
          <span class="content-card-meta-item">📁 {{ category }}</span>
          <span class="content-card-meta-item">👁️ {{ views }} visualizações</span>
        </div>
        <span class="content-card-link">Ler mais →</span>
      </div>
    </div>
  `,
  styles: [`
    /* ============================================
       CONTENT CARD - DESIGN SYSTEM
       ============================================ */

    @import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Sans:wght@400;500;600;700&family=Source+Sans+3:wght@400;500;600;700&display=swap');

    .content-card {
      background-color: #FFFFFF;
      border-radius: 8px;
      padding: 24px;
      border: 1px solid #E5E7EB;
      cursor: pointer;
      transition: all 0.3s ease;
      box-shadow: 0 1px 2px rgba(0, 0, 0, 0.02);
      font-family: 'Source Sans 3', sans-serif;
    }

    .content-card:hover {
      border-color: rgba(139, 30, 45, 0.2);
      box-shadow: 0 4px 16px rgba(0, 0, 0, 0.04);
      transform: translateY(-2px);
    }

    .content-card-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 12px;
    }

    .content-card-type {
      background-color: #F5F5F5;
      padding: 4px 12px;
      border-radius: 4px;
      font-size: 11px;
      font-weight: 600;
      color: #8B1E2D;
      font-family: 'Source Sans 3', sans-serif;
      line-height: 1.7;
      text-transform: uppercase;
      letter-spacing: 0.3px;
    }

    .content-card-date {
      color: #9CA3AF;
      font-size: 12px;
      font-family: 'Source Sans 3', sans-serif;
      line-height: 1.7;
    }

    .content-card-title {
      font-family: 'IBM Plex Sans', sans-serif;
      font-weight: 700;
      color: #1F2937;
      font-size: 20px;
      margin: 0 0 12px 0;
      letter-spacing: -0.02em;
      line-height: 1.3;
    }

    .content-card-description {
      color: #1F2937;
      font-size: 15px;
      line-height: 1.7;
      margin: 0 0 16px 0;
      font-family: 'Source Sans 3', sans-serif;
    }

    .content-card-footer {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .content-card-meta {
      display: flex;
      gap: 16px;
    }

    .content-card-meta-item {
      color: #9CA3AF;
      font-size: 12px;
      font-family: 'Source Sans 3', sans-serif;
      line-height: 1.7;
    }

    .content-card-link {
      color: #8B1E2D;
      font-size: 14px;
      font-weight: 600;
      font-family: 'Source Sans 3', sans-serif;
      line-height: 1.7;
      transition: all 0.2s;
    }

    .content-card:hover .content-card-link {
      transform: translateX(2px);
    }

    /* ============================================
       RESPONSIVO
       ============================================ */

    @media (max-width: 768px) {
      .content-card {
        padding: 20px;
      }

      .content-card-title {
        font-size: 18px;
      }

      .content-card-description {
        font-size: 14px;
      }

      .content-card-footer {
        flex-direction: column;
        align-items: flex-start;
        gap: 12px;
      }

      .content-card-meta {
        flex-wrap: wrap;
        gap: 12px;
      }
    }

    @media (max-width: 480px) {
      .content-card {
        padding: 16px;
      }

      .content-card-title {
        font-size: 16px;
      }

      .content-card-description {
        font-size: 13px;
      }

      .content-card-header {
        flex-direction: column;
        gap: 6px;
      }
    }
  `]
})
export class ContentCardComponent {
  @Input() id!: number;
  @Input() title!: string;
  @Input() type!: string;
  @Input() date!: string;
  @Input() views!: number;
  @Input() category!: string;
  @Input() description!: string;
  @Input() author!: string;
  @Output() onClick = new EventEmitter<void>();
}