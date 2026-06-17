import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export interface Toast {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info' | 'warning';
  duration?: number; // em ms, 0 = não auto-fechar
}

@Injectable({ providedIn: 'root' })
export class ToastService {
  private toasts$ = new BehaviorSubject<Toast[]>([]);
  private counter = 0;

  getToasts(): Observable<Toast[]> {
    return this.toasts$.asObservable();
  }

  success(message: string, duration = 3000): void {
    this.addToast(message, 'success', duration);
  }

  error(message: string, duration = 4000): void {
    this.addToast(message, 'error', duration);
  }

  info(message: string, duration = 3000): void {
    this.addToast(message, 'info', duration);
  }

  warning(message: string, duration = 3500): void {
    this.addToast(message, 'warning', duration);
  }

  private addToast(message: string, type: Toast['type'], duration: number): void {
    const id = `toast-${++this.counter}-${Date.now()}`;
    const toast: Toast = { id, message, type, duration };

    const toasts = this.toasts$.getValue();
    this.toasts$.next([...toasts, toast]);

    if (duration > 0) {
      setTimeout(() => this.removeToast(id), duration);
    }
  }

  removeToast(id: string): void {
    const toasts = this.toasts$.getValue();
    this.toasts$.next(toasts.filter(t => t.id !== id));
  }

  clearAll(): void {
    this.toasts$.next([]);
  }
}
