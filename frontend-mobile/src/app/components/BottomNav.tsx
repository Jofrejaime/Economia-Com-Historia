import React from 'react';
import { Home, TrendingUp, MessageCircle, Trophy, User } from 'lucide-react';

interface BottomNavProps {
  activeTab: 'home' | 'content' | 'community' | 'quiz' | 'profile';
  onNavigate: (screen: 'dashboard' | 'content' | 'community' | 'quiz' | 'profile') => void;
  isLoggedIn?: boolean;
}

export default function BottomNav({ activeTab, onNavigate, isLoggedIn = true }: BottomNavProps) {
  return (
    <nav className="fixed bottom-0 left-0 right-0 h-20 bg-white border-t border-[#E5E7EB] px-5 z-50 shadow-[0_-2px_10px_rgba(0,0,0,0.05)]">
      <div className="flex items-center justify-around h-full">
        <button
          onClick={() => onNavigate('dashboard')}
          className={`flex flex-col items-center gap-1 transition-all duration-200 active:scale-95 ${
            activeTab === 'home' ? 'text-[#8B1E2D]' : 'text-[#9CA3AF] hover:text-[#6B7280]'
          }`}
        >
          <Home className={`w-6 h-6 transition-transform duration-200 ${activeTab === 'home' ? 'scale-110' : ''}`} />
          <span className={`text-[11px] font-['Source_Sans_3'] ${
            activeTab === 'home' ? 'font-bold' : ''
          }`}>
            Início
          </span>
          {activeTab === 'home' && (
            <div className="w-1 h-1 rounded-full bg-[#8B1E2D] animate-pulse" />
          )}
        </button>

        <button
          onClick={() => onNavigate('content')}
          className={`flex flex-col items-center gap-1 transition-all duration-200 active:scale-95 ${
            activeTab === 'content' ? 'text-[#8B1E2D]' : 'text-[#9CA3AF] hover:text-[#6B7280]'
          }`}
        >
          <TrendingUp className={`w-6 h-6 transition-transform duration-200 ${activeTab === 'content' ? 'scale-110' : ''}`} />
          <span className={`text-[11px] font-['Source_Sans_3'] ${
            activeTab === 'content' ? 'font-bold' : ''
          }`}>
            Conteúdos
          </span>
          {activeTab === 'content' && (
            <div className="w-1 h-1 rounded-full bg-[#8B1E2D] animate-pulse" />
          )}
        </button>

        <button
          onClick={() => onNavigate('community')}
          className={`flex flex-col items-center gap-1 transition-all duration-200 active:scale-95 ${
            activeTab === 'community' ? 'text-[#8B1E2D]' : 'text-[#9CA3AF] hover:text-[#6B7280]'
          }`}
        >
          <MessageCircle className={`w-6 h-6 transition-transform duration-200 ${activeTab === 'community' ? 'scale-110' : ''}`} />
          <span className={`text-[11px] font-['Source_Sans_3'] ${
            activeTab === 'community' ? 'font-bold' : ''
          }`}>
            Comunidade
          </span>
          {activeTab === 'community' && (
            <div className="w-1 h-1 rounded-full bg-[#8B1E2D] animate-pulse" />
          )}
        </button>

        <button
          onClick={() => onNavigate('quiz')}
          className={`flex flex-col items-center gap-1 transition-all duration-200 active:scale-95 ${
            activeTab === 'quiz' ? 'text-[#8B1E2D]' : 'text-[#9CA3AF] hover:text-[#6B7280]'
          }`}
        >
          <Trophy className={`w-6 h-6 transition-transform duration-200 ${activeTab === 'quiz' ? 'scale-110' : ''}`} />
          <span className={`text-[11px] font-['Source_Sans_3'] ${
            activeTab === 'quiz' ? 'font-bold' : ''
          }`}>
            Quiz
          </span>
          {activeTab === 'quiz' && (
            <div className="w-1 h-1 rounded-full bg-[#8B1E2D] animate-pulse" />
          )}
        </button>

        {isLoggedIn && (
          <button
            onClick={() => onNavigate('profile')}
            className={`flex flex-col items-center gap-1 transition-all duration-200 active:scale-95 ${
              activeTab === 'profile' ? 'text-[#8B1E2D]' : 'text-[#9CA3AF] hover:text-[#6B7280]'
            }`}
          >
            <User className={`w-6 h-6 transition-transform duration-200 ${activeTab === 'profile' ? 'scale-110' : ''}`} />
            <span className={`text-[11px] font-['Source_Sans_3'] ${
              activeTab === 'profile' ? 'font-bold' : ''
            }`}>
              Perfil
            </span>
            {activeTab === 'profile' && (
              <div className="w-1 h-1 rounded-full bg-[#8B1E2D] animate-pulse" />
            )}
          </button>
        )}
      </div>
    </nav>
  );
}
