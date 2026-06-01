import React, { useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import BottomNav from './BottomNav';

interface NotificationPreferencesProps {
  onBack: () => void;
  onNavigate: (destination: 'dashboard' | 'content' | 'community' | 'quiz' | 'profile') => void;
}

export default function NotificationPreferences({ onBack, onNavigate }: NotificationPreferencesProps) {
  const [newContent, setNewContent] = useState(true);
  const [quizReminders, setQuizReminders] = useState(true);
  const [communityUpdates, setCommunityUpdates] = useState(false);
  const [achievements, setAchievements] = useState(true);

  return (
    <div className="bg-[#f8f9ff] min-h-screen pb-28">
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
      <div className="backdrop-blur-[12px] bg-[rgba(255,255,255,0.85)] sticky top-0 z-10 border-b border-[#E5E7EB]">
        <div className="flex items-center gap-4 px-6 py-4">
          <button onClick={onBack} className="p-1 hover:bg-[#FDF3F4] rounded-lg transition-colors">
            <ArrowLeft className="w-5 h-5 text-[#8B1E2D]" />
          </button>
          <h1 className="font-['IBM_Plex_Sans'] font-bold text-[18px] text-[#8B1E2D] tracking-[-0.4px]">
            Preferências de Notificação
          </h1>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-[896px] mx-auto px-6 pt-8">
        <p className="font-['Source_Sans_3'] text-[16px] text-[#574142] mb-8">
          Configurar alertas de novos conteúdos e desafios
        </p>

        <div className="bg-white rounded-lg overflow-hidden">
          <div className="flex items-center justify-between p-5 border-b border-[#E5E7EB]">
            <div>
              <h3 className="font-['Source_Sans_3'] font-bold text-[16px] text-[#1F2937]">
                Novos Conteúdos
              </h3>
              <p className="font-['Source_Sans_3'] text-[14px] text-[#6B7280]">
                Artigos, podcasts e micro textos
              </p>
            </div>
            <button
              onClick={() => setNewContent(!newContent)}
              className={`w-12 h-6 rounded-full transition-colors ${
                newContent ? 'bg-[#8B1E2D]' : 'bg-gray-300'
              }`}
            >
              <div
                className={`w-5 h-5 bg-white rounded-full transition-transform ${
                  newContent ? 'translate-x-6' : 'translate-x-0.5'
                }`}
              />
            </button>
          </div>

          <div className="flex items-center justify-between p-5 border-b border-[#E5E7EB]">
            <div>
              <h3 className="font-['Source_Sans_3'] font-bold text-[16px] text-[#1F2937]">
                Lembretes de Quiz
              </h3>
              <p className="font-['Source_Sans_3'] text-[14px] text-[#6B7280]">
                Novos quizzes disponíveis
              </p>
            </div>
            <button
              onClick={() => setQuizReminders(!quizReminders)}
              className={`w-12 h-6 rounded-full transition-colors ${
                quizReminders ? 'bg-[#8B1E2D]' : 'bg-gray-300'
              }`}
            >
              <div
                className={`w-5 h-5 bg-white rounded-full transition-transform ${
                  quizReminders ? 'translate-x-6' : 'translate-x-0.5'
                }`}
              />
            </button>
          </div>

          <div className="flex items-center justify-between p-5 border-b border-[#E5E7EB]">
            <div>
              <h3 className="font-['Source_Sans_3'] font-bold text-[16px] text-[#1F2937]">
                Atualizações da Comunidade
              </h3>
              <p className="font-['Source_Sans_3'] text-[14px] text-[#6B7280]">
                Respostas e discussões
              </p>
            </div>
            <button
              onClick={() => setCommunityUpdates(!communityUpdates)}
              className={`w-12 h-6 rounded-full transition-colors ${
                communityUpdates ? 'bg-[#8B1E2D]' : 'bg-gray-300'
              }`}
            >
              <div
                className={`w-5 h-5 bg-white rounded-full transition-transform ${
                  communityUpdates ? 'translate-x-6' : 'translate-x-0.5'
                }`}
              />
            </button>
          </div>

          <div className="flex items-center justify-between p-5">
            <div>
              <h3 className="font-['Source_Sans_3'] font-bold text-[16px] text-[#1F2937]">
                Conquistas e Badges
              </h3>
              <p className="font-['Source_Sans_3'] text-[14px] text-[#6B7280]">
                Novos méritos desbloqueados
              </p>
            </div>
            <button
              onClick={() => setAchievements(!achievements)}
              className={`w-12 h-6 rounded-full transition-colors ${
                achievements ? 'bg-[#8B1E2D]' : 'bg-gray-300'
              }`}
            >
              <div
                className={`w-5 h-5 bg-white rounded-full transition-transform ${
                  achievements ? 'translate-x-6' : 'translate-x-0.5'
                }`}
              />
            </button>
          </div>
        </div>
      </div>

      {/* Bottom Navigation */}
      <BottomNav activeTab="profile" onNavigate={onNavigate} isLoggedIn={true} />
    </div>
  );
}
