import { Routes } from '@angular/router';
import { ContentsComponent } from './pages/contents/contents';
import { LoginComponent } from './pages/auth/login/login';
import { RegisterComponent } from './pages/auth/register/register';
import { ForgotPasswordComponent } from './pages/auth/forgot-password/forgot-password';
import { ResetPasswordComponent } from './pages/auth/reset-password/reset-password';
import { CommunityComponent } from './pages/forum/community/community';
import { QuizListComponent } from './pages/quizzes/quiz-list/quiz-list';
import { QuestionQuizComponent } from './pages/quizzes/question-quiz/question-quiz';
import { QuizResultComponent } from './pages/quizzes/quiz-result/quiz-result';
import { PerfilComponent } from './pages/profile/perfil/perfil';
import { ContentsViewComponent } from './pages/contents/contents-view/contents-view';
import { CreateTopicComponent } from './pages/forum/community/create-topic/create-topic';
import { DiscussionThreadComponent } from './pages/forum/discussion-thread/discussion-thread';
import { HomeVisitorComponent } from './pages/home/home-visitor/home-visitor';
import { CategoryViewComponent } from './pages/forum/category-view/category-view';
import { CategoryDetailComponent } from './pages/forum/category-detail/category-detail';
import { authGuard } from './guards/auth.guard';

export const routes: Routes = [
  { path: '', redirectTo: '/home', pathMatch: 'full' },
  { path: 'home', canActivate: [authGuard], loadComponent: () => import('./pages/home/home-user/home-user').then(m => m.HomeUser) },
  { path: 'contents', canActivate: [authGuard], component: ContentsComponent },
  { path: 'forum/community', canActivate: [authGuard], component: CommunityComponent },
  { path: 'quiz', canActivate: [authGuard], component: QuizListComponent },
  { path: 'quiz/pergunta', canActivate: [authGuard], component: QuestionQuizComponent },
  { path: 'quiz/resultado', canActivate: [authGuard], component: QuizResultComponent },
  { path: 'auth/perfil', canActivate: [authGuard], component: PerfilComponent },
  { path: 'auth/login', component: LoginComponent },
  { path: 'auth/criar-conta', component: RegisterComponent },
  { path: 'auth/forgot-password', component: ForgotPasswordComponent },
  { path: 'auth/reset-password', component: ResetPasswordComponent },
  { path: 'contents/view/:id', canActivate: [authGuard], component: ContentsViewComponent },
  { path: 'forum/comunidade/criar-topico', canActivate: [authGuard], component: CreateTopicComponent },
  { path: 'forum/community/discussao', canActivate: [authGuard], component: DiscussionThreadComponent },
  { path: 'landing', component: HomeVisitorComponent },
  { path: 'forum/categorias', canActivate: [authGuard], component: CategoryViewComponent },
  { path: 'forum/categoria/:id', canActivate: [authGuard], component: CategoryDetailComponent },
  { path: '**', redirectTo: '/home' }
];
