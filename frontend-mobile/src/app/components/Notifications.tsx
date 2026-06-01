import React from 'react';
import { ArrowLeft, FileText, Lock, Trophy, MessageCircle, Bell } from 'lucide-react';
import BottomNav from './BottomNav';

interface NotificationsProps {
  onBack: () => void;
  onNavigate: (destination: 'dashboard' | 'content' | 'community' | 'quiz' | 'profile') => void;
}

interface Notification {
  id: string;
  type: 'content' | 'security' | 'achievement' | 'community' | 'system';
  icon: React.ReactNode;
  title: string;
  description: string;
  time: string;
  isNew: boolean;
}

export default function Notifications({ onBack, onNavigate }: NotificationsProps) {
  const notifications: Notification[] = [
    {
      id: '1',
      type: 'content',
      icon: <FileText className="w-5 h-5" />,
      title: 'Novo conteúdo disponível',
      description: 'O artigo "Agricultura Angolana: Do Colonialismo ao Abandono" foi publicado',
      time: 'Há 2 horas',
      isNew: true
    },
    {
      id: '2',
      type: 'security',
      icon: <Lock className="w-5 h-5" />,
      title: 'Palavra-passe alterada',
      description: 'A sua palavra-passe foi alterada com sucesso',
      time: 'Ontem',
      isNew: true
    },
    {
      id: '3',
      type: 'achievement',
      icon: <Trophy className="w-5 h-5" />,
      title: 'Nova conquista desbloqueada',
      description: 'Completou 10 quizzes! Ganhou o badge "Estudante Dedicado"',
      time: 'Há 2 dias',
      isNew: false
    },
    {
      id: '4',
      type: 'community',
      icon: <MessageCircle className="w-5 h-5" />,
      title: 'Nova resposta no seu tópico',
      description: 'Catarina Neto respondeu em "O petróleo foi uma bênção ou uma maldição?"',
      time: 'Há 3 dias',
      isNew: false
    },
    {
      id: '5',
      type: 'content',
      icon: <FileText className="w-5 h-5" />,
      title: 'Novo podcast disponível',
      description: 'Kwanza: História e Desafios da Moeda Nacional já está disponível',
      time: 'Há 5 dias',
      isNew: false
    },
    {
      id: '6',
      type: 'system',
      icon: <Bell className="w-5 h-5" />,
      title: 'Atualização do sistema',
      description: 'A plataforma foi atualizada com novas funcionalidades',
      time: 'Há 1 semana',
      isNew: false
    }
  ];

  const getIconColor = (type: string, isNew: boolean) => {
    if (type === 'content') return isNew ? 'bg-[#3B82F6] text-white' : 'bg-[#EFF6FF] text-[#3B82F6]';
    if (type === 'security') return isNew ? 'bg-[#DC2626] text-white' : 'bg-[#FEF2F2] text-[#DC2626]';
    if (type === 'achievement') return isNew ? 'bg-[#F59E0B] text-white' : 'bg-[#FFFBEB] text-[#F59E0B]';
    if (type === 'community') return isNew ? 'bg-[#8B1E2D] text-white' : 'bg-[#FDF3F4] text-[#8B1E2D]';
    return isNew ? 'bg-[#6B7280] text-white' : 'bg-[#F5F5F5] text-[#6B7280]';
  };

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
            Notificações
          </h1>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-[896px] mx-auto px-6 pt-6">
        <div className="space-y-3">
          {notifications.map((notification) => (
            <div
              key={notification.id}
              className={`bg-white rounded-xl p-4 border transition-all hover:shadow-md hover:scale-[1.01] cursor-pointer ${
                notification.isNew
                  ? 'border-[#8B1E2D] shadow-sm'
                  : 'border-[#E5E7EB]'
              }`}
            >
              <div className="flex gap-4">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${getIconColor(notification.type, notification.isNew)}`}>
                  {notification.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between mb-1">
                    <h3 className="font-['IBM_Plex_Sans'] font-bold text-[16px] text-[#1F2937]">
                      {notification.title}
                    </h3>
                    {notification.isNew && (
                      <div className="w-2 h-2 bg-[#8B1E2D] rounded-full flex-shrink-0 ml-2 mt-1.5"></div>
                    )}
                  </div>
                  <p className="font-['Source_Sans_3'] text-[14px] text-[#6B7280] leading-relaxed mb-2">
                    {notification.description}
                  </p>
                  <p className="font-['Source_Sans_3'] text-[12px] text-[#9CA3AF]">
                    {notification.time}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="text-center mt-8 mb-8">
          <p className="font-['Source_Sans_3'] text-[14px] text-[#9CA3AF]">
            Todas as notificações foram carregadas
          </p>
        </div>
      </div>

      {/* Bottom Navigation */}
      <BottomNav activeTab="profile" onNavigate={onNavigate} isLoggedIn={true} />
    </div>
  );
}
