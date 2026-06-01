import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-content-card',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div style="background-color: white; border-radius: 8px; padding: 24px; border: 1px solid rgba(222,191,191,0.1); cursor: pointer; transition: all 0.3s;" 
         (click)="onClick.emit()"
         onmouseover="this.style.borderColor='rgba(107,1,25,0.3)'; this.style.boxShadow='0 4px 12px rgba(0,0,0,0.1)'"
         onmouseout="this.style.borderColor='rgba(222,191,191,0.1)'; this.style.boxShadow='none'">
      <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 12px;">
        <span style="background-color: #eff4ff; padding: 4px 12px; border-radius: 4px; font-size: 11px; font-weight: bold; color: #6b0119;">{{ type }}</span>
        <span style="color: #94a3b8; font-size: 12px;">{{ date }}</span>
      </div>
      <h3 style="font-family: 'IBM Plex Sans', sans-serif; font-weight: bold; color: #121c2a; font-size: 20px; margin: 0 0 12px 0;">{{ title }}</h3>
      <p style="color: #574142; font-size: 15px; line-height: 24px; margin: 0 0 16px 0;">{{ description }}</p>
      <div style="display: flex; justify-content: space-between; align-items: center;">
        <div style="display: flex; gap: 16px;">
          <span style="color: #94a3b8; font-size: 12px;">📁 {{ category }}</span>
          <span style="color: #94a3b8; font-size: 12px;">👁️ {{ views }} visualizações</span>
        </div>
        <span style="color: #8b1e2d; font-size: 14px; font-weight: 600;">Ler mais →</span>
      </div>
    </div>
  `
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