import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { MediaObject } from '../../models/media.models';
import { MediaUploadService } from '../../services/media-upload.service';
import { MediaPreviewComponent } from './media-preview.component';

/**
 * Sprint 18.4 — Multi-upload de imagens (galeria).
 *
 * Drag & drop / seleção múltipla, pré-visualização por item e remoção
 * individual. Em modo deferred (default) emite a lista de Files ao pai,
 * que os envia como gallery[] no multipart; imagens já existentes no
 * servidor podem ser removidas via (removeExisting).
 */
@Component({
  selector: 'app-gallery-upload',
  standalone: true,
  imports: [CommonModule, MediaPreviewComponent],
  template: `
    <div class="gu-wrap">
      <label class="gu-label" *ngIf="label">{{ label }}</label>

      <div class="gu-grid">
        <!-- Imagens já no servidor -->
        <div class="gu-item" *ngFor="let item of existing">
          <app-media-preview [media]="item" [removable]="!disabled" [showMeta]="false"
            (remove)="onRemoveExisting(item)" />
        </div>

        <!-- Novas imagens (locais, ainda não enviadas) -->
        <div class="gu-item" *ngFor="let file of files; let i = index">
          <app-media-preview [file]="file" [removable]="!disabled" [showMeta]="false"
            (remove)="removeAt(i)" />
        </div>

        <!-- Tile para adicionar -->
        <div class="gu-add" [class.gu-drag]="dragOver" [class.gu-disabled]="disabled"
          (click)="!disabled && input.click()"
          (dragover)="onDragOver($event)" (dragleave)="dragOver = false" (drop)="onDrop($event)">
          <span class="gu-plus">+</span>
          <span class="gu-add-text">Adicionar</span>
        </div>
      </div>

      <p class="gu-hint" *ngIf="hint">{{ hint }}</p>
      <p class="gu-error" *ngIf="errorMessage">{{ errorMessage }}</p>

      <input #input type="file" hidden multiple accept=".jpg,.jpeg,.png,.webp,.gif,image/*"
        (change)="onBrowse($event)" />
    </div>
  `,
  styles: [`
    .gu-wrap { display: flex; flex-direction: column; gap: 8px; }
    .gu-label { font-size: 13px; font-weight: 600; color: #334155; }
    .gu-grid { display: flex; flex-wrap: wrap; gap: 12px; }
    .gu-item { position: relative; }
    .gu-add { width: 104px; height: 84px; border: 2px dashed #cbd5e1; border-radius: 8px;
      display: flex; flex-direction: column; align-items: center; justify-content: center;
      color: #64748b; cursor: pointer; background: #f8fafc; transition: border-color .15s; }
    .gu-add:hover, .gu-drag { border-color: #2563eb; color: #2563eb; background: #eff6ff; }
    .gu-disabled { opacity: .5; cursor: not-allowed; }
    .gu-plus { font-size: 22px; line-height: 1; }
    .gu-add-text { font-size: 12px; margin-top: 4px; }
    .gu-hint { margin: 0; font-size: 12px; color: #94a3b8; }
    .gu-error { margin: 0; font-size: 12px; color: #dc2626; }
  `],
})
export class GalleryUploadComponent {
  @Input() label = 'Galeria';
  @Input() hint = 'Até 12 imagens — JPG, PNG, WEBP (máx. 4 MB cada)';
  @Input() maxFiles = 12;
  @Input() maxSizeMb = 4;
  @Input() disabled = false;

  /** Imagens já persistidas no servidor (modo edição). */
  @Input() existing: MediaObject[] = [];
  /** Novas imagens locais, geridas pelo componente. */
  @Input() files: File[] = [];

  @Output() filesChange = new EventEmitter<File[]>();
  @Output() removeExisting = new EventEmitter<MediaObject>();

  dragOver = false;
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
    this.addFiles(Array.from(event.dataTransfer?.files ?? []));
  }

  onBrowse(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.addFiles(Array.from(input.files ?? []));
    input.value = '';
  }

  removeAt(index: number): void {
    this.files = this.files.filter((_, i) => i !== index);
    this.filesChange.emit(this.files);
  }

  onRemoveExisting(item: MediaObject): void {
    this.uploader.delete(item.id).subscribe((ok) => {
      if (ok) {
        this.existing = this.existing.filter((m) => m.id !== item.id);
        this.removeExisting.emit(item);
      } else {
        this.errorMessage = 'Não foi possível remover a imagem.';
      }
    });
  }

  private addFiles(incoming: File[]): void {
    this.errorMessage = null;

    for (const file of incoming) {
      if (this.existing.length + this.files.length >= this.maxFiles) {
        this.errorMessage = `Máximo de ${this.maxFiles} imagens na galeria.`;
        break;
      }
      if (!file.type.startsWith('image/')) {
        this.errorMessage = `"${file.name}" não é uma imagem.`;
        continue;
      }
      if (file.size > this.maxSizeMb * 1024 * 1024) {
        this.errorMessage = `"${file.name}" excede ${this.maxSizeMb} MB.`;
        continue;
      }
      this.files = [...this.files, file];
    }

    this.filesChange.emit(this.files);
  }
}
