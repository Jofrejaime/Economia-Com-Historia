import { Routes } from '@angular/router';
import { ContentsComponent } from './pages/contents/contents';
import { LoginComponent } from './pages/auth/login/login';
import { RegisterComponent } from './pages/auth/register/register';
import { ForgotPasswordComponent } from './pages/auth/forgot-password/forgot-password';
import { ResendVerificationComponent } from './pages/auth/resend-verification/resend-verification';
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
import { AccessLevelsPageComponent } from './pages/admin/dashboard-admin/pages/access-levels-page/access-levels-page';
import { authGuard } from './guards/auth.guard';
import { guestGuard } from './guards/guest.guard';
import { adminGuard } from './guards/admin.guard';
import { homeGuard } from './guards/home.guard';
import { DashboardAdminComponent } from './pages/admin/dashboard-admin/dashboard-admin';
import { OverviewPageComponent } from './pages/admin/dashboard-admin/pages/overview-page/overview-page';
import { RequestsPageComponent } from './pages/admin/dashboard-admin/pages/request-page/request-page';
import { AccessGrantsPageComponent } from './pages/admin/dashboard-admin/pages/access-grants-page/access-grants-page';
import { UsersPageComponent } from './pages/admin/dashboard-admin/pages/users-page/users-page';
import { CategoriesPageComponent } from './pages/admin/dashboard-admin/pages/categories-page/categories-page';
import { TagsPageComponent } from './pages/admin/dashboard-admin/pages/tags-page/tags-page';
import { ContentsPageComponent } from './pages/admin/dashboard-admin/pages/contents-page/contents-page';
import { CommunityPageComponent } from './pages/admin/dashboard-admin/pages/community-page/community-page';
import { SettingsPageComponent } from './pages/admin/dashboard-admin/pages/settings-page/settings-page';
import { ReportsPageComponent } from './pages/admin/dashboard-admin/pages/reports-page/reports-page';
import { QuizzesManagerPageComponent } from './pages/admin/dashboard-admin/pages/quizzes-manager-page/quizzes-manager-page';
import { LevelsPageComponent } from './pages/admin/dashboard-admin/pages/levels-page/levels-page';
import { BadgesPageComponent } from './pages/admin/dashboard-admin/pages/badges-page/badges-page';
import { GamificationPageComponent } from './pages/admin/dashboard-admin/pages/gamification-page/gamification-page';
import { NotificationsPageComponent } from './pages/admin/dashboard-admin/pages/notifications-page/notifications-page';
import { UserNotificationsComponent } from './pages/user-notifications/user-notifications';
import { RankingComponent } from './pages/quizzes/quiz-ranking/quiz-ranking';
import { ProvincesPageComponent } from './pages/admin/dashboard-admin/pages/provinces-page/provinces-page';
import { InterestAreasPageComponent } from './pages/admin/dashboard-admin/pages/interest-areas-page/interest-areas-page';
import { SavedContentsComponent } from './pages/contents/saved-contents/saved-contents';
import { PrivacyPolicyComponent} from './pages/legal/privacy-policy/privacy-policy';
import { NotificationPreferencesComponent} from './pages/auth/notification-preferences/notification-preferences';

export const routes: Routes = [
  { path: '', redirectTo: '/home', pathMatch: 'full' },
  { path: 'home', canActivate: [homeGuard], loadComponent: () => import('./pages/home/home-user/home-user').then(m => m.HomeUser) },
  { path: 'contents', component: ContentsComponent },
  { path: 'contents/saved', canActivate: [authGuard], component: SavedContentsComponent },
  { path: 'forum/community', component: CommunityComponent },
  { path: 'quiz', component: QuizListComponent },
  { path: 'quiz/pergunta', canActivate: [authGuard], component: QuestionQuizComponent },
  { path: 'quiz/resultado', canActivate: [authGuard], component: QuizResultComponent },
  { path: 'quiz/ranking', canActivate: [authGuard], component: RankingComponent },
  { path: 'auth/perfil', canActivate: [authGuard], component: PerfilComponent },
  { path: 'auth/perfil', canActivate: [authGuard], component: PerfilComponent },
  { path: 'auth/login', canActivate: [guestGuard], component: LoginComponent },
  { path: 'auth/notification-preferences', canActivate: [authGuard], component: NotificationPreferencesComponent },
  { path: 'auth/criar-conta', canActivate: [guestGuard], component: RegisterComponent },
  { path: 'auth/forgot-password', canActivate: [guestGuard], component: ForgotPasswordComponent },
  { path: 'auth/resend-verification', canActivate: [guestGuard], component: ResendVerificationComponent },
  { path: 'auth/reset-password', canActivate: [guestGuard], component: ResetPasswordComponent },
  { path: 'contents/view/:id', component: ContentsViewComponent },
  { path: 'forum/comunidade/criar-topico', canActivate: [authGuard], component: CreateTopicComponent },
  { path: 'forum/community/discussao/:id', component: DiscussionThreadComponent },
  { path: 'landing', component: HomeVisitorComponent },
  { path: 'forum/categorias', component: CategoryViewComponent },
  { path: 'forum/categoria/:id', component: CategoryDetailComponent },
  { path: 'legal/privacy-policy', component: PrivacyPolicyComponent },
  {
    path: 'admin/dashboard',
    component: DashboardAdminComponent,
    canActivate: [adminGuard],
    canActivateChild: [adminGuard],
    children: [
      { path: '', redirectTo: 'visao-geral', pathMatch: 'full' },
      { path: 'visao-geral', component: OverviewPageComponent },
      { path: 'pedidos', component: RequestsPageComponent },
      { path: 'concessoes', component: AccessGrantsPageComponent },
      { path: 'utilizadores', component: UsersPageComponent },
      { path: 'categorias', component: CategoriesPageComponent },
      { path: 'tags', component: TagsPageComponent },
      { path: 'conteudos', component: ContentsPageComponent },
      { path: 'comunidade', component: CommunityPageComponent },
      { path: 'configuracoes', component: SettingsPageComponent },
      { path: 'denuncias', component: ReportsPageComponent },
      { path: 'quizzes', component: QuizzesManagerPageComponent },
      // ===== NOVAS ROTAS =====
      { path: 'gamificacao', component: GamificationPageComponent },
      { path: 'niveis', component: LevelsPageComponent },
      { path: 'badges', component: BadgesPageComponent },
      { path: 'notificacoes', component: NotificationsPageComponent },
      { path: 'niveis-acesso', component: AccessLevelsPageComponent },
      { path: 'provincias', component: ProvincesPageComponent },
      { path: 'areas-interesse', component: InterestAreasPageComponent },
    ]
  },
  { path: 'notificacoes', canActivate: [authGuard], component: UserNotificationsComponent },
  { path: '**', redirectTo: '/home' }
];
