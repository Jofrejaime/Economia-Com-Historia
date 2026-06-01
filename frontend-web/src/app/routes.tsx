import { createBrowserRouter } from "react-router";
import LandingPage from "./pages/LandingPage";
import Home from "./pages/Home";
import Login from "./pages/Login";
import SignUp from "./pages/SignUp";
import Dashboard from "./pages/Dashboard";
import DocumentView from "./pages/DocumentView";
import CreateContent from "./pages/CreateContent";
import QuizList from "./pages/QuizList";
import QuizQuestion from "./pages/QuizQuestion";
import QuizResult from "./pages/QuizResult";
import CommunityHome from "./pages/CommunityHome";
import CreateTopic from "./pages/CreateTopic";
import DiscussionThread from "./pages/DiscussionThread";
import CategoryView from "./pages/CategoryView";
import Profile from "./pages/Profile";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: LandingPage,
  },
  {
    path: "/inicio",
    Component: Home,
  },
  {
    path: "/login",
    Component: Login,
  },
  {
    path: "/criar-conta",
    Component: SignUp,
  },
  {
    path: "/arquivo",
    Component: Dashboard,
  },
  {
    path: "/documento/:id",
    Component: DocumentView,
  },
  {
    path: "/arquivo/criar",
    Component: CreateContent,
  },
  {
    path: "/quiz",
    Component: QuizList,
  },
  {
    path: "/quiz/pergunta",
    Component: QuizQuestion,
  },
  {
    path: "/quiz/resultado",
    Component: QuizResult,
  },
  {
    path: "/comunidade",
    Component: CommunityHome,
  },
  {
    path: "/comunidade/criar-topico",
    Component: CreateTopic,
  },
  {
    path: "/comunidade/discussao",
    Component: DiscussionThread,
  },
  {
    path: "/comunidade/categoria",
    Component: CategoryView,
  },
  {
    path: "/perfil",
    Component: Profile,
  },
]);
