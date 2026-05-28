import React, { useState } from 'react';
import { Trophy, MapPin, Filter, Clock, Users } from 'lucide-react';
import BottomNav from './BottomNav';

interface QuizListProps {
  onNavigate: (destination: 'dashboard' | 'content' | 'community' | 'quiz' | 'profile') => void;
  onStartQuiz?: () => void;
  isLoggedIn?: boolean;
}

type LocationFilter = 'all' | 'luanda' | 'benguela' | 'huambo' | 'lubango';

interface QuizItem {
  id: string;
  title: string;
  description: string;
  category: string;
  difficulty: 'Fácil' | 'Intermédio' | 'Avançado';
  questions: number;
  duration: string;
  participants: number;
  location: string;
  author: string;
  authorAvatar: string;
}

interface RankingItem {
  id: string;
  name: string;
  avatar: string;
  score: number;
  quizzesCompleted: number;
  location: string;
}

export default function QuizList({ onNavigate, onStartQuiz, isLoggedIn = false }: QuizListProps) {
  const [locationFilter, setLocationFilter] = useState<LocationFilter>('all');
  const [activeTab, setActiveTab] = useState<'quizzes' | 'ranking'>('quizzes');

  const quizzes: QuizItem[] = [
    {
      id: '1',
      title: 'História Económica de Angola: 1975-1990',
      description: 'Teste seus conhecimentos sobre o período pós-independência',
      category: 'História Monetária',
      difficulty: 'Intermédio',
      questions: 15,
      duration: '20 min',
      participants: 1247,
      location: 'Luanda',
      author: 'Prof. Ana Domingos',
      authorAvatar: 'AD'
    },
    {
      id: '2',
      title: 'O Kwanza e a Inflação',
      description: 'Desafios monetários e políticas económicas',
      category: 'Economia',
      difficulty: 'Avançado',
      questions: 20,
      duration: '25 min',
      participants: 892,
      location: 'Benguela',
      author: 'Dr. Carlos Neto',
      authorAvatar: 'CN'
    },
    {
      id: '3',
      title: 'Petróleo em Angola',
      description: 'Da descoberta à dependência económica',
      category: 'Recursos Naturais',
      difficulty: 'Fácil',
      questions: 10,
      duration: '15 min',
      participants: 2134,
      location: 'Luanda',
      author: 'Luís Ferreira',
      authorAvatar: 'LF'
    }
  ];

  const ranking: RankingItem[] = [
    { id: '1', name: 'Ana Domingos', avatar: 'AD', score: 2840, quizzesCompleted: 28, location: 'Luanda' },
    { id: '2', name: 'Carlos Neto', avatar: 'CN', score: 2650, quizzesCompleted: 25, location: 'Benguela' },
    { id: '3', name: 'Maria Santos', avatar: 'MS', score: 2480, quizzesCompleted: 24, location: 'Huambo' },
    { id: '4', name: 'João Mendes', avatar: 'JM', score: 2320, quizzesCompleted: 22, location: 'Luanda' },
    { id: '5', name: 'Pedro Silva', avatar: 'PS', score: 2180, quizzesCompleted: 21, location: 'Lubango' }
  ];

  const locations = [
    { value: 'all', label: 'Todas' },
    { value: 'luanda', label: 'Luanda' },
    { value: 'benguela', label: 'Benguela' },
    { value: 'huambo', label: 'Huambo' },
    { value: 'lubango', label: 'Lubango' }
  ];

  const filteredRanking = locationFilter === 'all'
    ? ranking
    : ranking.filter(item => item.location.toLowerCase() === locationFilter);

  return (
    <div className="min-h-screen bg-[#F8F9FF]">
      {/* Status Bar */}
      <div className="h-11 bg-white flex items-center justify-between px-5">
        <span className="font-['IBM_Plex_Sans'] font-bold text-[15px]">9:41</span>
        <div className="flex gap-1">
          <div className="w-4 h-4">📶</div>
          <div className="w-4 h-4">📡</div>
          <div className="w-4 h-4">🔋</div>
        </div>
      </div>

      {/* Header */}
      <div className="bg-gradient-to-br from-[#8B1E2D] to-[#6D1522] px-6 pt-8 pb-6">
        <div className="mb-4">
          <h1 className="font-['IBM_Plex_Sans'] font-bold text-[32px] text-white leading-tight mb-2">
            Quiz
          </h1>
          <p className="font-['Source_Sans_3'] text-[15px] text-white/80">
            Teste os teus conhecimentos
          </p>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 bg-white/10 backdrop-blur-md rounded-xl p-1">
          <button
            onClick={() => setActiveTab('quizzes')}
            className={`flex-1 py-3 rounded-lg font-['Source_Sans_3'] font-bold text-[15px] transition-all duration-300 active:scale-95 ${
              activeTab === 'quizzes'
                ? 'bg-white text-[#8B1E2D] shadow-md scale-105'
                : 'text-white/70 hover:text-white/90'
            }`}
          >
            Quizzes
          </button>
          <button
            onClick={() => setActiveTab('ranking')}
            className={`flex-1 py-3 rounded-lg font-['Source_Sans_3'] font-bold text-[15px] transition-all duration-300 active:scale-95 ${
              activeTab === 'ranking'
                ? 'bg-white text-[#8B1E2D] shadow-md scale-105'
                : 'text-white/70 hover:text-white/90'
            }`}
          >
            Ranking
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="px-6 pt-6 pb-28">
        {activeTab === 'quizzes' ? (
          <>
            {/* Quiz List */}
            <div className="space-y-4">
              {quizzes.map((quiz, index) => (
                <div
                  key={quiz.id}
                  onClick={onStartQuiz}
                  style={{ animationDelay: `${index * 100}ms` }}
                  className="bg-white rounded-2xl p-5 shadow-sm border border-[#E5E7EB] hover:shadow-md hover:border-[#8B1E2D]/20 hover:scale-[1.01] active:scale-[0.99] transition-all duration-300 cursor-pointer animate-[fadeInUp_0.5s_ease-out_forwards] opacity-0"
                >
                  {/* Header */}
                  <div className="flex items-start gap-3 mb-3">
                    <div className="w-12 h-12 bg-[#D9E3F6] rounded-xl flex items-center justify-center flex-shrink-0">
                      <span className="font-['Source_Sans_3'] font-bold text-[18px] text-[#8B1E2D]">
                        {quiz.authorAvatar}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-['Source_Sans_3'] text-[13px] text-[#9CA3AF] mb-1">
                        {quiz.author}
                      </p>
                      <h3 className="font-['IBM_Plex_Sans'] font-bold text-[18px] text-[#1F2937] leading-tight">
                        {quiz.title}
                      </h3>
                    </div>
                  </div>

                  {/* Description */}
                  <p className="font-['Source_Sans_3'] text-[15px] text-[#6B7280] leading-relaxed mb-4">
                    {quiz.description}
                  </p>

                  {/* Badges */}
                  <div className="flex flex-wrap gap-2 mb-4">
                    <span className="px-3 py-1 bg-[#FDF3F4] text-[#8B1E2D] rounded-md font-['Source_Sans_3'] font-bold text-[12px]">
                      {quiz.category}
                    </span>
                    <span className={`px-3 py-1 rounded-md font-['Source_Sans_3'] font-bold text-[12px] ${
                      quiz.difficulty === 'Fácil'
                        ? 'bg-[#ECFDF5] text-[#059669]'
                        : quiz.difficulty === 'Intermédio'
                        ? 'bg-[#FFFBEB] text-[#D97706]'
                        : 'bg-[#FEF2F2] text-[#DC2626]'
                    }`}>
                      {quiz.difficulty}
                    </span>
                    <span className="px-3 py-1 bg-[#F3F4F6] text-[#4B5563] rounded-md font-['Source_Sans_3'] font-bold text-[12px] flex items-center gap-1">
                      <MapPin className="w-3 h-3" />
                      {quiz.location}
                    </span>
                  </div>

                  {/* Stats */}
                  <div className="flex items-center gap-4 pt-3 border-t border-[#F3F4F6]">
                    <div className="flex items-center gap-1.5">
                      <Trophy className="w-4 h-4 text-[#9CA3AF]" />
                      <span className="font-['Source_Sans_3'] text-[13px] text-[#6B7280]">
                        {quiz.questions} perguntas
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Clock className="w-4 h-4 text-[#9CA3AF]" />
                      <span className="font-['Source_Sans_3'] text-[13px] text-[#6B7280]">
                        {quiz.duration}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5 ml-auto">
                      <Users className="w-4 h-4 text-[#9CA3AF]" />
                      <span className="font-['Source_Sans_3'] font-bold text-[13px] text-[#8B1E2D]">
                        {quiz.participants.toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        ) : (
          <>
            {/* Location Filter */}
            <div className="mb-6">
              <div className="flex items-center gap-2 mb-3">
                <Filter className="w-4 h-4 text-[#6B7280]" />
                <span className="font-['Source_Sans_3'] font-semibold text-[14px] text-[#6B7280]">
                  Filtrar por localidade
                </span>
              </div>
              <div className="flex gap-2 overflow-x-auto pb-2 hide-scrollbar">
                {locations.map((loc) => (
                  <button
                    key={loc.value}
                    onClick={() => setLocationFilter(loc.value as LocationFilter)}
                    className={`flex-shrink-0 px-4 py-2 rounded-lg font-['Source_Sans_3'] font-semibold text-[14px] transition-all duration-300 active:scale-95 ${
                      locationFilter === loc.value
                        ? 'bg-[#8B1E2D] text-white shadow-md scale-105'
                        : 'bg-white text-[#6B7280] border border-[#E5E7EB] hover:border-[#8B1E2D]/30 hover:shadow-sm'
                    }`}
                  >
                    {loc.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Ranking List */}
            <div className="space-y-3">
              {filteredRanking.map((user, index) => (
                <div
                  key={user.id}
                  style={{ animationDelay: `${index * 100}ms` }}
                  className={`rounded-2xl p-5 shadow-sm animate-[fadeInUp_0.5s_ease-out_forwards] opacity-0 ${
                    index === 0
                      ? 'bg-gradient-to-r from-[#8B1E2D] to-[#A52535]'
                      : index === 1
                      ? 'bg-[#F5F5F5] border-l-4 border-[#9CA3AF]'
                      : index === 2
                      ? 'bg-[#F5F5F5] border-l-4 border-[#D1D5DB]'
                      : 'bg-white border border-[#E5E7EB]'
                  }`}
                >
                  <div className="flex items-center gap-4">
                    {/* Rank */}
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                      index === 0
                        ? 'bg-white/20 backdrop-blur-sm'
                        : 'bg-[#E5E7EB]'
                    }`}>
                      <span className={`font-['IBM_Plex_Sans'] font-bold text-[20px] ${
                        index === 0 ? 'text-white' : 'text-[#6B7280]'
                      }`}>
                        #{index + 1}
                      </span>
                    </div>

                    {/* Avatar */}
                    <div className={`w-14 h-14 rounded-full flex items-center justify-center ${
                      index === 0 ? 'bg-white' : 'bg-[#D9E3F6]'
                    }`}>
                      <span className={`font-['Source_Sans_3'] font-bold text-[18px] ${
                        index === 0 ? 'text-[#8B1E2D]' : 'text-[#8B1E2D]'
                      }`}>
                        {user.avatar}
                      </span>
                    </div>

                    {/* Info */}
                    <div className="flex-1">
                      <p className={`font-['IBM_Plex_Sans'] font-bold text-[16px] ${
                        index === 0 ? 'text-white' : 'text-[#1F2937]'
                      }`}>
                        {user.name}
                      </p>
                      <div className="flex items-center gap-2">
                        <span className={`font-['Source_Sans_3'] text-[13px] ${
                          index === 0 ? 'text-white/80' : 'text-[#6B7280]'
                        }`}>
                          {user.quizzesCompleted} quizzes
                        </span>
                        <span className={index === 0 ? 'text-white/60' : 'text-[#D1D5DB]'}>•</span>
                        <span className={`font-['Source_Sans_3'] text-[13px] flex items-center gap-1 ${
                          index === 0 ? 'text-white/80' : 'text-[#6B7280]'
                        }`}>
                          <MapPin className="w-3 h-3" />
                          {user.location}
                        </span>
                      </div>
                    </div>

                    {/* Score */}
                    <div className="text-right">
                      <p className={`font-['IBM_Plex_Sans'] font-bold text-[20px] ${
                        index === 0 ? 'text-white' : 'text-[#4B5563]'
                      }`}>
                        {user.score}
                      </p>
                      <p className={`font-['Source_Sans_3'] text-[11px] ${
                        index === 0 ? 'text-white/70' : 'text-[#9CA3AF]'
                      }`}>
                        pontos
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Bottom Navigation */}
      <BottomNav activeTab="quiz" onNavigate={onNavigate} isLoggedIn={isLoggedIn} />
    </div>
  );
}
