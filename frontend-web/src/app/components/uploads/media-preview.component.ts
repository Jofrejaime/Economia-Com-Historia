import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnChanges, Output } from '@angular/core';
import { MediaObject } from '../../models/media.models';

/**
 * Sprint 18.4 — Pré-visualização padronizada de um ficheiro.
 *
 * Aceita um MediaObject (ficheiro já no servidor) ou um File local
 * (antes do upload). Imagens mostram thumbnail; outros ficheiros
 * mostram um cartão com extensão, nome e tamanho.
 */
@Component({
  selector: 'app-media-preview',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="mp-wrap" *ngIf="hasContent()">
      <!-- Imagem -->
      <div class="mp-image" *ngIf="imageSrc; else fileChip">
        <img [src]="imageSrc" [alt]="displayName" />
      </div>

      <!-- Ficheiro não-imagem -->
      <ng-template #fileChip>
        <div class="mp-chip">
          <span class="mp-ext">{{ displayExtension.toUpperCase() }}</span>
        </div>
      </ng-template>

      <div class="mp-meta" *ngIf="showMeta">
        <span class="mp-name" [title]="displayName">{{ displayName }}</span>
        <span class="mp-size" *ngIf="displaySize">{{ displaySize }}</span>
      </div>

      <button *ngIf="removable" type="button" class="mp-remove" (click)="remove.emit()" title="Remover ficheiro">×</button>
    </div>
  `,
  styles: [`
    .mp-wrap { position: relative; display: inline-flex; align-items: center; gap: 10px;
      border: 1px solid #e2e8f0; border-radius: 8px; padding: 8px; background: #f8fafc; max-width: 100%; }
    .mp-image img { width: 88px; height: 66px; object-fit: cover; border-radius: 6px; display: block; }
    .mp-chip { width: 66px; height: 66px; border-radius: 6px; background: #1e293b; color: #fff;
      display: flex; align-items: center; justify-content: center; }
    .mp-ext { font-size: 12px; font-weight: 700; letter-spacing: 0.5px; }
    .mp-meta { display: flex; flex-direction: column; min-width: 0; }
    .mp-name { font-size: 13px; color: #0f172a; white-space: nowrap; overflow: hidden;
      text-overflow: ellipsis; max-width: 220px; }
    .mp-size { font-size: 12px; color: #64748b; }
    .mp-remove { position: absolute; top: -8px; right: -8px; width: 22px; height: 22px;
      border-radius: 50%; border: none; background: #ef4444; color: #fff; cursor: pointer;
      font-size: 14px; line-height: 1; display: flex; align-items: center; justify-content: center; }
    .mp-remove:hover { background: #dc2626; }
  `],
})
export class MediaPreviewComponent implements OnChanges {
  @Input() media: MediaObject | null = null;
  @Input() file: File | null = null;
  /** URL direta (campos legados cover_image_url/pdf_url). */
  @Input() url: string | null = null;
  @Input() removable = false;
  @Input() showMeta = true;

  @Output() remove = new EventEmitter<void>();

  imageSrc: string | null = null;

  ngOnChanges(): void {
    this.resolveImage();
  }

  hasContent(): boolean {
    return this.media !== null || this.file !== null || !!this.url;
  }

  get displayName(): string {
    if (this.file) return this.file.name;
    if (this.media) return this.media.filename;
    if (this.url) return this.url.split('/').pop() ?? this.url;
    return '';
  }

  get displayExtension(): string {
    const name = this.displayName;
    const dot = name.lastIndexOf('.');
    return dot >= 0 ? name.slice(dot + 1) : 'FILE';
  }

  get displaySize(): string | null {
    const bytes = this.file?.size ?? this.media?.size ?? null;
    if (bytes === null) return null;
    if (bytes >= 1048576) return (bytes / 1048576).toFixed(1) + ' MB';
    if (bytes >= 1024) return Math.round(bytes / 1024) + ' KB';
    return bytes + ' B';
  }

  private resolveImage(): void {
    this.imageSrc = null;

    if (this.file) {
      if (this.file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = () => (this.imageSrc = reader.result as string);
        reader.readAsDataURL(this.file);
      }
      return;
    }

    if (this.media) {
      if (this.media.mime_type.startsWith('image/')) {
        this.imageSrc = this.media.thumbnail ?? this.media.url;
      }
      return;
    }

    if (this.url && /\.(jpe?g|png|webp|gif|svg)(\?.*)?$/i.test(this.url)) {
      this.imageSrc = this.url;
    }
  }
}
