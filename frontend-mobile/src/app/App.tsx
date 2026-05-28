import React, { useState } from 'react';
import Home from './components/Home';
import Login from './components/Login';
import Register from './components/Register';
import Dashboard from './components/Dashboard';
import Content from './components/Content';
import Podcast from './components/Podcast';
import Article from './components/Article';
import Quiz from './components/Quiz';
import QuizFeedback from './components/QuizFeedback';
import Community from './components/Community';
import Profile from './components/Profile';
import CreateTopic from './components/CreateTopic';
import QuizList from './components/QuizList';
import TopicDiscussion from './components/TopicDiscussion';
import QuizResult from './components/QuizResult';
import PersonalInfo from './components/PersonalInfo';
import Notifications from './components/Notifications';
import NotificationPreferences from './components/NotificationPreferences';
import Privacy from './components/Privacy';
import Support from './components/Support';
import JindungoPermission from './components/JindungoPermission';
import LoginPrompt from './components/LoginPrompt';

type Screen = 'home' | 'login' | 'register' | 'dashboard' | 'content' | 'podcast' | 'article-jindungo' | 'article-micro' | 'quiz' | 'quiz-feedback' | 'community' | 'profile' | 'create-topic' | 'quiz-list' | 'topic-discussion' | 'quiz-result' | 'personal-info' | 'notifications' | 'notification-preferences' | 'privacy' | 'support' | 'jindungo-permission' | 'login-prompt-topic' | 'login-prompt-comment' | 'login-prompt-quiz';

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<Screen>('home');
  const [userName, setUserName] = useState('');
  const [isQuizAnswerCorrect, setIsQuizAnswerCorrect] = useState(false);
  const [hasJindungoPermission, setHasJindungoPermission] = useState(false);
  const [quizCount, setQuizCount] = useState(0);
  const [topicTitle, setTopicTitle] = useState('');
  const [topicCategory, setTopicCategory] = useState('');

  const handleLogin = () => {
    setUserName('Luís');
    setCurrentScreen('dashboard');
  };

  const handleRegister = () => {
    setUserName('Luís');
    setCurrentScreen('dashboard');
  };

  const handleLogout = () => {
    setUserName('');
    setHasJindungoPermission(false);
    setCurrentScreen('login');
  };

  const handleQuizAnswer = (isCorrect: boolean) => {
    setIsQuizAnswerCorrect(isCorrect);
    setQuizCount(prev => prev + 1);
    setCurrentScreen('quiz-feedback');
  };

  const handleQuizComplete = () => {
    setCurrentScreen('quiz-result');
  };

  const handleBottomNavigation = (destination: 'dashboard' | 'content' | 'community' | 'quiz' | 'profile') => {
    if (!userName) {
      if (destination === 'community') {
        setCurrentScreen('community');
      } else if (destination === 'content') {
        setCurrentScreen('content');
      } else if (destination === 'quiz') {
        setCurrentScreen('quiz-list');
      } else if (destination === 'dashboard') {
        setCurrentScreen('home');
      } else {
        setCurrentScreen('login');
      }
    } else if (destination === 'quiz') {
      setCurrentScreen('quiz-list');
    } else {
      setCurrentScreen(destination);
    }
  };

  const handleJindungoAccess = () => {
    if (hasJindungoPermission) {
      setCurrentScreen('article-jindungo');
    } else {
      setCurrentScreen('jindungo-permission');
    }
  };

  const handleRequestPermission = () => {
    if (!userName) {
      setCurrentScreen('login');
      return;
    }
    setHasJindungoPermission(true);
    setCurrentScreen('article-jindungo');
  };

  const handleCreateTopicFromArticle = (title: string, category: string) => {
    if (!userName) {
      setCurrentScreen('login');
      return;
    }
    setTopicTitle(title);
    setTopicCategory(category);
    setCurrentScreen('create-topic');
  };

  const handleStartQuizFromContent = () => {
    if (!userName) {
      setCurrentScreen('login');
      return;
    }
    setCurrentScreen('quiz');
  };

  return (
    <>
      {currentScreen === 'home' && (
        <Home
          onLogin={() => setCurrentScreen('login')}
          onRegister={() => setCurrentScreen('register')}
          onViewJindungo={() => setCurrentScreen('jindungo-permission')}
          onViewArticle={() => setCurrentScreen('article-micro')}
          onViewPodcast={() => setCurrentScreen('podcast')}
          onViewCommunity={() => setCurrentScreen('community')}
          onViewContent={() => setCurrentScreen('content')}
          onViewQuiz={() => setCurrentScreen('quiz-list')}
        />
      )}

      {currentScreen === 'login' && (
        <Login
          onBack={() => setCurrentScreen('home')}
          onRegister={() => setCurrentScreen('register')}
          onSuccess={handleLogin}
          onForgotPassword={() => setCurrentScreen('privacy')}
        />
      )}

      {currentScreen === 'register' && (
        <Register
          onBack={() => setCurrentScreen('home')}
          onLogin={() => setCurrentScreen('login')}
          onSuccess={handleRegister}
        />
      )}

      {currentScreen === 'dashboard' && (
        <Dashboard
          userName={userName}
          onViewContent={() => setCurrentScreen('content')}
          onViewJindungo={handleJindungoAccess}
          onNavigate={handleBottomNavigation}
          onNotifications={() => setCurrentScreen('notifications')}
          onResumeReading={() => setCurrentScreen('article-jindungo')}
          onViewArticle={(type) => setCurrentScreen(type === 'jindungo' ? 'article-jindungo' : 'article-micro')}
          onViewDebate={() => setCurrentScreen('topic-discussion')}
        />
      )}

      {currentScreen === 'content' && (
        <Content
          onBack={() => userName ? setCurrentScreen('dashboard') : setCurrentScreen('home')}
          onViewPodcast={() => setCurrentScreen('podcast')}
          onViewJindungo={handleJindungoAccess}
          onViewMicro={() => setCurrentScreen('article-micro')}
          onNavigate={handleBottomNavigation}
          isLoggedIn={!!userName}
        />
      )}

      {currentScreen === 'podcast' && (
        <Podcast
          onBack={() => userName ? setCurrentScreen('content') : setCurrentScreen('home')}
          onStartQuiz={handleStartQuizFromContent}
          onCreateTopic={handleCreateTopicFromArticle}
          onNavigate={handleBottomNavigation}
          isLoggedIn={!!userName}
        />
      )}

      {currentScreen === 'article-jindungo' && (
        <Article
          type="jindungo"
          onBack={() => setCurrentScreen('content')}
          onStartQuiz={handleStartQuizFromContent}
          onCreateTopic={handleCreateTopicFromArticle}
          onNavigate={handleBottomNavigation}
          isLoggedIn={!!userName}
        />
      )}

      {currentScreen === 'article-micro' && (
        <Article
          type="micro"
          onBack={() => userName ? setCurrentScreen('content') : setCurrentScreen('home')}
          onStartQuiz={handleStartQuizFromContent}
          onCreateTopic={handleCreateTopicFromArticle}
          onNavigate={handleBottomNavigation}
          isLoggedIn={!!userName}
        />
      )}

      {currentScreen === 'quiz' && (
        <Quiz
          onBack={() => setCurrentScreen('content')}
          onSubmitAnswer={handleQuizAnswer}
          onNavigate={handleBottomNavigation}
        />
      )}

      {currentScreen === 'quiz-feedback' && (
        <QuizFeedback
          isCorrect={isQuizAnswerCorrect}
          onBack={() => setCurrentScreen('quiz')}
          onNextQuestion={quizCount >= 19 ? handleQuizComplete : () => setCurrentScreen('quiz')}
          onNavigate={handleBottomNavigation}
        />
      )}

      {currentScreen === 'community' && (
        <Community
          onNavigate={handleBottomNavigation}
          onCreateTopic={() => {
            if (!userName) {
              setCurrentScreen('login-prompt-topic');
            } else {
              setTopicTitle('');
              setTopicCategory('');
              setCurrentScreen('create-topic');
            }
          }}
          onViewTopic={() => setCurrentScreen('topic-discussion')}
          isLoggedIn={!!userName}
          onBack={() => userName ? setCurrentScreen('dashboard') : setCurrentScreen('home')}
        />
      )}

      {currentScreen === 'profile' && (
        <Profile
          userName={userName}
          onNavigate={handleBottomNavigation}
          onLogout={handleLogout}
          onPersonalInfo={() => setCurrentScreen('personal-info')}
          onNotifications={() => setCurrentScreen('notifications')}
          onNotificationPreferences={() => setCurrentScreen('notification-preferences')}
          onPrivacy={() => setCurrentScreen('privacy')}
          onSupport={() => setCurrentScreen('support')}
        />
      )}

      {currentScreen === 'create-topic' && (
        <CreateTopic
          onBack={() => setCurrentScreen('community')}
          onNavigate={handleBottomNavigation}
          onPublish={() => setCurrentScreen('topic-discussion')}
          onSaveDraft={() => setCurrentScreen('community')}
          initialTitle={topicTitle}
          initialCategory={topicCategory}
        />
      )}

      {currentScreen === 'topic-discussion' && (
        <TopicDiscussion
          onBack={() => setCurrentScreen('community')}
          onNavigate={handleBottomNavigation}
          onComment={!userName ? () => setCurrentScreen('login-prompt-comment') : undefined}
          isLoggedIn={!!userName}
        />
      )}

      {currentScreen === 'quiz-list' && (
        <QuizList
          onNavigate={handleBottomNavigation}
          onStartQuiz={() => {
            if (!userName) {
              setCurrentScreen('login-prompt-quiz');
            } else {
              setCurrentScreen('quiz');
            }
          }}
          isLoggedIn={!!userName}
        />
      )}

      {currentScreen === 'quiz-result' && (
        <QuizResult
          onNavigate={handleBottomNavigation}
          onViewRanking={() => setCurrentScreen('quiz-list')}
          onExploreContent={() => setCurrentScreen('content')}
          onRetakeQuiz={() => setCurrentScreen('quiz')}
        />
      )}

      {currentScreen === 'personal-info' && (
        <PersonalInfo
          onBack={() => setCurrentScreen('profile')}
          onNavigate={handleBottomNavigation}
        />
      )}

      {currentScreen === 'notifications' && (
        <Notifications
          onBack={() => setCurrentScreen('profile')}
          onNavigate={handleBottomNavigation}
        />
      )}

      {currentScreen === 'notification-preferences' && (
        <NotificationPreferences
          onBack={() => setCurrentScreen('profile')}
          onNavigate={handleBottomNavigation}
        />
      )}

      {currentScreen === 'privacy' && (
        <Privacy
          onBack={() => setCurrentScreen('profile')}
          onNavigate={handleBottomNavigation}
        />
      )}

      {currentScreen === 'support' && (
        <Support
          onBack={() => setCurrentScreen('profile')}
          onNavigate={handleBottomNavigation}
        />
      )}

      {currentScreen === 'jindungo-permission' && (
        <JindungoPermission
          onBack={() => userName ? setCurrentScreen('content') : setCurrentScreen('home')}
          onRequestPermission={handleRequestPermission}
        />
      )}

      {currentScreen === 'login-prompt-topic' && (
        <LoginPrompt
          type="create-topic"
          onBack={() => setCurrentScreen('community')}
          onLogin={() => setCurrentScreen('login')}
        />
      )}

      {currentScreen === 'login-prompt-comment' && (
        <LoginPrompt
          type="comment"
          onBack={() => setCurrentScreen('topic-discussion')}
          onLogin={() => setCurrentScreen('login')}
        />
      )}

      {currentScreen === 'login-prompt-quiz' && (
        <LoginPrompt
          type="quiz"
          onBack={() => setCurrentScreen('quiz-list')}
          onLogin={() => setCurrentScreen('login')}
        />
      )}
    </>
  );
}
