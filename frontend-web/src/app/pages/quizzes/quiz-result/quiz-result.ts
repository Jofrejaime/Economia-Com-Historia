import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule, ActivatedRoute } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { HeaderComponent } from '../../../components/header/header';
import { FooterComponent } from '../../../components/footer/footer';
import { QuizService, QuizAttempt } from '../../../services/quiz.service';
import { AuthService } from '../../../services/auth.service';
import { environment } from '../../../../environments/environment';

interface RelatedDocument {
  id: string;
  title: string;
  document_type?: string | null;
  media_type?: string | null;
  cover_image_url?: string | null;
  summary?: string | null;
}

@Component({
  selector: 'app-quiz-result',
  standalone: true,
  imports: [CommonModule, RouterModule, HeaderComponent, FooterComponent],
  templateUrl: './quiz-result.html',
  styleUrls: ['./quiz-result.css']
})
export class QuizResultComponent implements OnInit {

  attempt: QuizAttempt | null = null;
  error: string | null = null;
  isLoadingNext = false;

  // Conteúdos relacionados ao quiz (GET /quizzes/{id}/documents)
  relatedDocuments: RelatedDocument[] = [];
  loadingRelated = false;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private quizService: QuizService,
    private http: HttpClient,
    private authService: AuthService,
    private cdr: ChangeDetectorRef
  ) {}

  async ngOnInit(): Promise<void> {
    const attemptId = this.route.snapshot.queryParamMap.get('attempt');
    if (!attemptId) {
      this.router.navigate(['/quiz']);
      return;
    }
    this.loadResult(attemptId);
  }

  private async loadResult(attemptId: string): Promise<void> {
    try {
      this.attempt = await this.quizService.getAttempt(attemptId);
      // Assim que sabemos o quiz, busca os conteúdos relacionados
      // (não bloqueia a exibição do resultado)
      if (this.attempt?.quiz_id) {
        void this.loadRelatedDocuments(this.attempt.quiz_id);
      }
    } catch {
      this.error = 'Erro ao carregar resultado.';
    } finally {
      this.cdr.detectChanges();
    }
  }

  /**
   * Conteúdos relacionados = documentos ligados ao quiz via pivot N:N.
   * Endpoint público (auth opcional): GET /api/quizzes/{id}/documents
   */
  private async loadRelatedDocuments(quizId: string): Promise<void> {
    this.loadingRelated = true;
    this.cdr.detectChanges();

    try {
      const token = this.authService.getToken();
      const headers = token ? this.authService.getAuthHeaders(token) : {};

      const res: any = await firstValueFrom(
        this.http.get(`${environment.apiBaseUrl}/api/quizzes/${quizId}/documents`, { headers })
      );

      // aceita tanto { data: [...] } como array directo
      const list: any[] = Array.isArray(res) ? res : (res?.data ?? []);
      this.relatedDocuments = list.map(d => ({
        id: d.id,
        title: d.title,
        document_type: d.document_type ?? null,
        media_type: d.media_type ?? null,
        cover_image_url: d.cover_image_url ?? null,
        summary: d.summary ?? null,
      }));
    } catch {
      this.relatedDocuments = [];
    } finally {
      this.loadingRelated = false;
      this.cdr.detectChanges();
    }
  }

  navigateToDocument(id: string): void {
    this.router.navigate(['/contents/view', id]);
  }

  /** Rótulo do tipo de conteúdo, derivado do ficheiro (media_type): Texto/Vídeo/Podcast. */
  getContentTypeLabel(mediaType: string | null | undefined): string {
    const t = (mediaType || 'TEXT').toUpperCase();
    if (t === 'VIDEO') return 'Vídeo';
    if (t === 'AUDIO') return 'Podcast';
    if (t === 'IMAGE') return 'Imagem';
    return 'Texto';
  }

  get score(): number {
    return this.attempt?.score ?? 0;
  }

  get performance(): string {
    switch (this.attempt?.performance_rating) {
      case 'excellent':          return 'Excelente';
      case 'good':                return 'Bom';
      case 'average':             return 'Satisfatório';
      case 'needs_improvement':   return 'Precisa de Melhorar';
      case 'poor':                 return 'Insuficiente';
      default:                     return this.performanceFromScore();
    }
  }

  private performanceFromScore(): string {
    if (this.score >= 90) return 'Excelente';
    if (this.score >= 70) return 'Bom';
    if (this.score >= 50) return 'Satisfatório';
    return 'Precisa de Melhorar';
  }

  get pointsEarned(): number {
    return this.attempt?.points_earned ?? 0;
  }

  get bonusPoints(): number {
    return this.attempt?.bonus_points ?? 0;
  }

  get correctAnswers(): number {
    return this.attempt?.correct_answers ?? 0;
  }

  get totalQuestions(): number {
    return this.attempt?.total_questions ?? 0;
  }

  get timeSpent(): string {
    const secs = this.attempt?.time_spent_secs ?? 0;
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}m ${s}s`;
  }

  goToQuizList(): void {
    this.router.navigate(['/quiz']);
  }

  async nextQuiz(): Promise<void> {
    if (this.isLoadingNext || !this.attempt) return;

    this.isLoadingNext = true;
    this.cdr.detectChanges();

    try {
      const quizzes = await this.quizService.getQuizzes();

      if (quizzes.length === 0) {
        this.router.navigate(['/quiz']);
        return;
      }

      const currentIndex = quizzes.findIndex(q => q.id === this.attempt!.quiz_id);
      const nextIndex = currentIndex === -1 || currentIndex === quizzes.length - 1
        ? 0
        : currentIndex + 1;
      const nextQuiz = quizzes[nextIndex];

      const newAttemptId = await this.quizService.startAttempt(nextQuiz.id);

      this.router.navigate(['/quiz/pergunta'], {
        queryParams: { quiz: nextQuiz.id, attempt: newAttemptId }
      });
    } catch {
      this.error = 'Erro ao iniciar o próximo quiz.';
      this.isLoadingNext = false;
      this.cdr.detectChanges();
    }
  }

  goToRanking(): void {
    this.router.navigate(['/quiz/ranking']);
  }
}