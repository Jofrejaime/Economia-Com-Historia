import { Routes } from '@angular/router';
import { ContentsComponent } from './pages/contents/contents';
import { LoginComponent } from './pages/auth/login/login';
import { RegisterComponent } from './pages/auth/register/register';
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

export const routes: Routes = [
  { path: '', redirectTo: '/home', pathMatch: 'full' },
  { path: 'home', loadComponent: () => import('./pages/home/home-user/home-user').then(m => m.HomeUser) },
  { path: 'contents', component: ContentsComponent },
  { path: 'forum/community', component: CommunityComponent },
  { path: 'quiz', component: QuizListComponent },
  { path: 'quiz/pergunta', component: QuestionQuizComponent },
  { path: 'quiz/resultado', component: QuizResultComponent },
  { path: 'auth/perfil', component: PerfilComponent },
  { path: 'auth/login', component: LoginComponent },
  { path: 'auth/criar-conta', component: RegisterComponent },
   { path: 'contents/view/:id', component: ContentsViewComponent },
    { path: 'forum/comunidade/criar-topico', component: CreateTopicComponent },
    { path: 'forum/community/discussao', component: DiscussionThreadComponent },
    { path: 'landing', component: HomeVisitorComponent },
    { path: 'forum/categorias', component: CategoryViewComponent },
    { path: 'forum/categoria/:id', component: CategoryDetailComponent },
  { path: '**', redirectTo: '/home' }
];