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
import { DashboardAdminComponent } from './pages/admin/dashboard-admin/dashboard-admin';
import { OverviewPageComponent } from './pages/admin/dashboard-admin/pages/overview-page/overview-page';
import { RequestsPageComponent } from './pages/admin/dashboard-admin/pages/request-page/request-page';
import { UsersPageComponent } from './pages/admin/dashboard-admin/pages/users-page/users-page';
import { CategoriesPageComponent } from './pages/admin/dashboard-admin/pages/categories-page/categories-page';
import { ContentsPageComponent } from './pages/admin/dashboard-admin/pages/contents-page/contents-page';
import { CommunityPageComponent } from './pages/admin/dashboard-admin/pages/community-page/community-page';
import { SettingsPageComponent } from './pages/admin/dashboard-admin/pages/settings-page/settings-page';
import { ReportsPageComponent } from './pages/admin/dashboard-admin/pages/reports-page/reports-page';
import { QuizzesManagerPageComponent } from './pages/admin/dashboard-admin/pages/quizzes-manager-page/quizzes-manager-page';

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
  
  // Admin Routes (com rotas aninhadas - CORRIGIDO)
  {
    path: 'admin/dashboard',
    component: DashboardAdminComponent,
    children: [
      { path: '', redirectTo: 'visao-geral', pathMatch: 'full' },
      { path: 'visao-geral', component: OverviewPageComponent },
      { path: 'pedidos', component: RequestsPageComponent },
      { path: 'utilizadores', component: UsersPageComponent },
      { path: 'categorias', component: CategoriesPageComponent },
      { path: 'conteudos', component: ContentsPageComponent },
      { path: 'comunidade', component: CommunityPageComponent },
      { path: 'configuracoes', component: SettingsPageComponent },
       { path: 'denuncias', component: ReportsPageComponent }, 
    { path: 'quizzes', component: QuizzesManagerPageComponent }, 
    ]
  },
  
  { path: '**', redirectTo: '/home' }
];