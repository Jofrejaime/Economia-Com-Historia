import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { MediaObject, MediaUploadOptions } from '../../models/media.models';
import { MediaUploadService } from '../../services/media-upload.service';
import { MediaPreviewComponent } from './media-preview.component';

/**
 * Sprint 18.4 — Componente reutilizável de upload de UM ficheiro.
 *
 * Suporta drag & drop, clique para escolher, pré-visualização, barra de
 * progresso, substituição (replace) e remoção. Dois modos:
 *
 *  - deferred (default): emite o File via (fileChange); o módulo pai envia-o
 *    como multipart junto com o formulário (ex.: criação de documentos).
 *  - autoUpload: envia imediatamente pelo pipeline /api/media/uploads e
 *    emite o MediaObject via (mediaChange) (ex.: editor rico, ícones).
 *
 * Nenhum componente da plataforma deve implementar uploads próprios —
 * reutilizar sempre este componente ou os seus derivados.
 */
@Component({
  selector: 'app-file-upload',
  standalone: true,
  imports: [CommonModule, MediaPreviewComponent],
  template: `
    <div class="fu-wrap">
      <label class="fu-label" *ngIf="label">{{ label }}</label>

      <!-- Pré-visualização do ficheiro atual (local ou já no servidor) -->
      <div class="fu-current" *ngIf="selectedFile || media || existingUrl">
        <app-media-preview
          [file]="selectedFile"
          [media]="media"
          [url]="!selectedFile && !media ? existingUrl : null"
          [removable]="!disabled && uploadProgress === null"
          (remove)="clear()" />
        <button type="button" class="fu-replace" *ngIf="!disabled && uploadProgress === null" (click)="input.click()">
          Substituir
        </button>
      </div>

      <!-- Zona de drop -->
      <div
        class="fu-drop"
        *ngIf="!selectedFile && !media && !existingUrl"
        [class.fu-drag]="dragOver"
        [class.fu-disabled]="disabled"
        (click)="!disabled && input.click()"
        (dragover)="onDragOver($event)"
        (dragleave)="dragOver = false"
        (drop)="onDrop($event)">
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6">
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
          <polyline points="17 8 12 3 7 8"/>
          <line x1="12" y1="3" x2="12" y2="15"/>
        </svg>
        <p class="fu-text">Arraste o ficheiro para aqui ou <span>clique para escolher</span></p>
        <p class="fu-hint" *ngIf="hint">{{ hint }}</p>
      </div>

      <input #input type="file" hidden [accept]="accept" (change)="onBrowse($event)" />

      <!-- Barra de progresso -->
      <div class="fu-progress" *ngIf="uploadProgress !== null">
        <div class="fu-bar"><div class="fu-fill" [style.width.%]="uploadProgress"></div></div>
        <span class="fu-pct">{{ uploadProgress }}%</span>
      </div>

      <p class="fu-error" *ngIf="errorMessage">{{ errorMessage }}</p>
    </div>
  `,
  styles: [`
    .fu-wrap { display: flex; flex-direction: column; gap: 8px; }
    .fu-label { font-size: 13px; font-weight: 600; color: #334155; }
    .fu-drop { border: 2px dashed #cbd5e1; border-radius: 10px; padding: 22px 16px; text-align: center;
      color: #64748b; cursor: pointer; background: #f8fafc; transition: border-color .15s, background .15s; }
    .fu-drop:hover, .fu-drag { border-color: #2563eb; background: #eff6ff; color: #2563eb; }
    .fu-disabled { opacity: .5; cursor: not-allowed; }
    .fu-text { margin: 8px 0 0; font-size: 13px; }
    .fu-text span { color: #2563eb; font-weight: 600; }
    .fu-hint { margin: 4px 0 0; font-size: 12px; color: #94a3b8; }
    .fu-current { display: flex; align-items: center; gap: 12px; flex-wrap: wrap; }
    .fu-replace { border: 1px solid #cbd5e1; background: #fff; border-radius: 6px; padding: 6px 12px;
      font-size: 12px; cursor: pointer; color: #334155; }
    .fu-replace:hover { border-color: #2563eb; color: #2563eb; }
    .fu-progress { display: flex; align-items: center; gap: 10px; }
    .fu-bar { flex: 1; height: 8px; background: #e2e8f0; border-radius: 4px; overflow: hidden; }
    .fu-fill { height: 100%; background: linear-gradient(90deg, #3b82f6, #2563eb); transition: width .2s; }
    .fu-pct { font-size: 12px; color: #334155; min-width: 36px; text-align: right; }
    .fu-error { margin: 0; font-size: 12px; color: #dc2626; }
  `],
})
export class FileUploadComponent {
  @Input() label = '';
  @Input() hint = '';
  @Input() accept = '.pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.csv,.txt,.zip,.rar,.odt';
  @Input() maxSizeMb = 50;
  @Input() disabled = false;

  /** true → envia já pelo pipeline /media/uploads; false → emite o File ao pai. */
  @Input() autoUpload = false;
  @Input() uploadOptions: MediaUploadOptions = {};

  /** Ficheiro já existente no servidor (modo edição). */
  @Input() media: MediaObject | null = null;
  /** URL legada (cover_image_url/pdf_url) quando não há MediaObject. */
  @Input() existingUrl: string | null = null;

  @Output() fileChange = new EventEmitter<File | null>();
  @Output() mediaChange = new EventEmitter<MediaObject | null>();
  @Output() uploadError = new EventEmitter<string>();

  selectedFile: File | null = null;
  dragOver = false;
  uploadProgress: number | null = null;
  errorMessage: string | null = null;

  constructor(private uploader: MediaUploadService) {}

  onDragOver(event: DragEvent): void {
    event.preventDefault();
    if (!this.disabled) this.dragOver = true;
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    this.dragOver = false;
    if (this.disabled) return;
    const file = event.dataTransfer?.files?.[0];
    if (file) this.handleFile(file);
  }

  onBrowse(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (file) this.handleFile(file);
    input.value = '';
  }

  clear(): void {
    this.selectedFile = null;
    this.media = null;
    this.existingUrl = null;
    this.errorMessage = null;
    this.fileChange.emit(null);
    this.mediaChange.emit(null);
  }

  private handleFile(file: File): void {
    this.errorMessage = null;

    if (file.size > this.maxSizeMb * 1024 * 1024) {
      this.errorMessage = `Ficheiro demasiado grande (máx. ${this.maxSizeMb} MB).`;
      this.uploadError.emit(this.errorMessage);
      return;
    }

    this.selectedFile = file;
    this.media = null;
    this.existingUrl = null;

    if (!this.autoUpload) {
      this.fileChange.emit(file);
      return;
    }

    this.uploadProgress = 0;
    this.uploader.upload(file, this.uploadOptions).subscribe((state) => {
      if (state.status === 'progress') {
        this.uploadProgress = state.progress;
      } else if (state.status === 'done') {
        this.uploadProgress = null;
        this.media = state.media;
        this.selectedFile = null;
        this.mediaChange.emit(state.media);
      } else {
        this.uploadProgress = null;
        this.selectedFile = null;
        this.errorMessage = state.message;
        this.uploadError.emit(state.message);
      }
    });
  }
}
