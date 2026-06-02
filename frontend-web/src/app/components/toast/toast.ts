import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ToastService, Toast } from '../../services/toast.service';
import { trigger, transition, style, animate } from '@angular/animations';

@Component({
  selector: 'app-toast',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div style="position: fixed; top: 24px; right: 24px; z-index: 9999; max-width: 400px; pointer-events: none;">
      <div *ngFor="let toast of toasts" 
           [@slideIn]
           style="margin-bottom: 12px; pointer-events: auto;"
           [ngSwitch]="toast.type">
        
        <!-- Success Toast -->
        <div *ngSwitchCase="'success'"
             style="background: linear-gradient(135deg, #22c55e, #16a34a); color: white; padding: 16px 20px; border-radius: 8px; box-shadow: 0 4px 12px rgba(34, 197, 94, 0.3); display: flex; align-items: center; gap: 12px;">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="20 6 9 17 4 12"></polyline>
          </svg>
          <span style="flex: 1;">{{ toast.message }}</span>
          <button (click)="close(toast.id)" style="background: none; border: none; color: white; cursor: pointer; font-size: 20px; padding: 0; width: 24px; height: 24px; display: flex; align-items: center; justify-content: center;">×</button>
        </div>

        <!-- Error Toast -->
        <div *ngSwitchCase="'error'"
             style="background: linear-gradient(135deg, #ef4444, #dc2626); color: white; padding: 16px 20px; border-radius: 8px; box-shadow: 0 4px 12px rgba(239, 68, 68, 0.3); display: flex; align-items: center; gap: 12px;">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="15" y1="9" x2="9" y2="15"></line>
            <line x1="9" y1="9" x2="15" y2="15"></line>
          </svg>
          <span style="flex: 1;">{{ toast.message }}</span>
          <button (click)="close(toast.id)" style="background: none; border: none; color: white; cursor: pointer; font-size: 20px; padding: 0; width: 24px; height: 24px; display: flex; align-items: center; justify-content: center;">×</button>
        </div>

        <!-- Warning Toast -->
        <div *ngSwitchCase="'warning'"
             style="background: linear-gradient(135deg, #f59e0b, #d97706); color: white; padding: 16px 20px; border-radius: 8px; box-shadow: 0 4px 12px rgba(245, 158, 11, 0.3); display: flex; align-items: center; gap: 12px;">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3.05h16.94a2 2 0 0 0 1.71-3.05L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
            <line x1="12" y1="9" x2="12" y2="13"></line>
            <line x1="12" y1="17" x2="12.01" y2="17"></line>
          </svg>
          <span style="flex: 1;">{{ toast.message }}</span>
          <button (click)="close(toast.id)" style="background: none; border: none; color: white; cursor: pointer; font-size: 20px; padding: 0; width: 24px; height: 24px; display: flex; align-items: center; justify-content: center;">×</button>
        </div>

        <!-- Info Toast -->
        <div *ngSwitchDefault
             style="background: linear-gradient(135deg, #3b82f6, #2563eb); color: white; padding: 16px 20px; border-radius: 8px; box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3); display: flex; align-items: center; gap: 12px;">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="12" y1="16" x2="12" y2="12"></line>
            <line x1="12" y1="8" x2="12.01" y2="8"></line>
          </svg>
          <span style="flex: 1;">{{ toast.message }}</span>
          <button (click)="close(toast.id)" style="background: none; border: none; color: white; cursor: pointer; font-size: 20px; padding: 0; width: 24px; height: 24px; display: flex; align-items: center; justify-content: center;">×</button>
        </div>

      </div>
    </div>
  `,
  animations: [
    trigger('slideIn', [
      transition(':enter', [
        style({ transform: 'translateX(400px)', opacity: 0 }),
        animate('300ms ease-out', style({ transform: 'translateX(0)', opacity: 1 }))
      ]),
      transition(':leave', [
        animate('300ms ease-in', style({ transform: 'translateX(400px)', opacity: 0 }))
      ])
    ])
  ]
})
export class ToastComponent implements OnInit {
  toasts: Toast[] = [];

  constructor(private toastService: ToastService) {}

  ngOnInit(): void {
    this.toastService.getToasts().subscribe(toasts => {
      this.toasts = toasts;
    });
  }

  close(id: string): void {
    this.toastService.removeToast(id);
  }
}
