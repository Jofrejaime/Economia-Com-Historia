import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { MediaObject, MediaUploadOptions } from '../../models/media.models';
import { FileUploadComponent } from './file-upload.component';

/**
 * Sprint 18.4 — Upload de imagem (capa, ícone, avatar, badge…).
 *
 * Especialização do app-file-upload com accept/limites de imagem e
 * pré-visualização automática. Reutilizar em todos os módulos que
 * precisem de imagens — nunca implementar uploads próprios.
 */
@Component({
  selector: 'app-image-upload',
  standalone: true,
  imports: [CommonModule, FileUploadComponent],
  template: `
    <app-file-upload
      [label]="label"
      [hint]="hint || 'JPG, PNG, WEBP ou SVG — máx. ' + maxSizeMb + ' MB'"
      accept=".jpg,.jpeg,.png,.webp,.svg,.gif,image/*"
      [maxSizeMb]="maxSizeMb"
      [disabled]="disabled"
      [autoUpload]="autoUpload"
      [uploadOptions]="uploadOptions"
      [media]="media"
      [existingUrl]="existingUrl"
      (fileChange)="fileChange.emit($event)"
      (mediaChange)="mediaChange.emit($event)"
      (uploadError)="uploadError.emit($event)" />
  `,
})
export class ImageUploadComponent {
  @Input() label = 'Imagem';
  @Input() hint = '';
  @Input() maxSizeMb = 4;
  @Input() disabled = false;
  @Input() autoUpload = false;
  @Input() uploadOptions: MediaUploadOptions = {};
  @Input() media: MediaObject | null = null;
  @Input() existingUrl: string | null = null;

  @Output() fileChange = new EventEmitter<File | null>();
  @Output() mediaChange = new EventEmitter<MediaObject | null>();
  @Output() uploadError = new EventEmitter<string>();
}
