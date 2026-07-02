import { HttpClient, HttpErrorResponse, HttpEventType } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError, map, Observable, of } from 'rxjs';
import { environment } from '../../environments/environment';
import { MediaObject, MediaUploadOptions, MediaUploadState } from '../models/media.models';

/**
 * Sprint 18.4 — cliente do pipeline único de uploads (/api/media/uploads).
 *
 * Nenhum componente deve chamar HttpClient diretamente para uploads:
 * todos os módulos (documentos, badges, categorias, comunidade, …)
 * reutilizam este serviço e os componentes app-file-upload/app-image-upload/
 * app-gallery-upload.
 */
@Injectable({ providedIn: 'root' })
export class MediaUploadService {
  constructor(private http: HttpClient) {}

  /** Upload com progresso real (0–100) e objeto de media padronizado no fim. */
  upload(file: File, options: MediaUploadOptions = {}): Observable<MediaUploadState> {
    const form = new FormData();
    form.append('file', file, file.name);
    if (options.collection) form.append('collection', options.collection);
    if (options.modelType) form.append('model_type', options.modelType);
    if (options.modelId) form.append('model_id', options.modelId);
    if (options.directory) form.append('directory', options.directory);

    return this.http.post<{ message: string; data: MediaObject }>(
      `${environment.apiBaseUrl}/api/media/uploads`,
      form,
      { observe: 'events', reportProgress: true },
    ).pipe(
      map((event): MediaUploadState => {
        if (event.type === HttpEventType.UploadProgress) {
          const progress = event.total ? Math.round((event.loaded / event.total) * 100) : 0;
          return { status: 'progress', progress };
        }
        if (event.type === HttpEventType.Response) {
          return { status: 'done', media: event.body!.data };
        }
        return { status: 'progress', progress: 0 };
      }),
      catchError((error: unknown) => of<MediaUploadState>({
        status: 'error',
        message: this.errorMessage(error),
      })),
    );
  }

  /** Remove um ficheiro (ficheiro + thumbnail + preview + registo). */
  delete(mediaId: string): Observable<boolean> {
    return this.http.delete(`${environment.apiBaseUrl}/api/media/${mediaId}`).pipe(
      map(() => true),
      catchError(() => of(false)),
    );
  }

  private errorMessage(error: unknown): string {
    if (error instanceof HttpErrorResponse) {
      const fileErrors = error.error?.errors?.file;
      if (Array.isArray(fileErrors) && fileErrors.length > 0) {
        return fileErrors[0];
      }
      if (typeof error.error?.message === 'string' && error.error.message !== '') {
        return error.error.message;
      }
      if (error.status === 413) {
        return 'Ficheiro demasiado grande.';
      }
    }
    return 'Erro ao carregar o ficheiro.';
  }
}
