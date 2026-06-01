import React from 'react';
import { ArrowLeft, LogIn } from 'lucide-react';

interface LoginPromptProps {
  onBack: () => void;
  onLogin: () => void;
  type: 'create-topic' | 'comment' | 'quiz';
}

export default function LoginPrompt({ onBack, onLogin, type }: LoginPromptProps) {
  const messages = {
    'create-topic': {
      title: 'Quer debater sobre um tema?',
      description: 'Faça login para criar tópicos e participar das discussões da comunidade.'
    },
    'comment': {
      title: 'Quer deixar a sua opinião?',
      description: 'Faça login para comentar e participar activamente nas discussões.'
    },
    'quiz': {
      title: 'Quer testar os seus conhecimentos?',
      description: 'Faça login para realizar quizzes e acompanhar o seu progresso académico.'
    }
  };

  const message = messages[type];

  return (
    <div className="min-h-screen bg-[#F8F9FF] flex flex-col">
      {/* Header */}
      <div className="bg-white border-b border-[#E5E7EB] px-6 py-4">
        <div className="flex items-center gap-4">
          <button onClick={onBack} className="p-1">
            <ArrowLeft className="w-5 h-5 text-[#8B1E2D]" />
          </button>
          <h1 className="font-['IBM_Plex_Sans'] font-bold text-[18px] text-[#8B1E2D]">
            Login Necessário
          </h1>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-12">
        <div className="max-w-md w-full text-center">
          {/* Icon */}
          <div className="mb-8 flex justify-center">
            <div className="w-24 h-24 bg-[#FDF3F4] rounded-full flex items-center justify-center">
              <LogIn className="w-12 h-12 text-[#8B1E2D]" />
            </div>
          </div>

          {/* Title */}
          <h2 className="font-['IBM_Plex_Sans'] font-bold text-[32px] text-[#1F2937] mb-4">
            {message.title}
          </h2>

          {/* Description */}
          <p className="font-['Source_Sans_3'] text-[18px] text-[#574142] leading-[29.25px] mb-8">
            {message.description}
          </p>

          {/* Benefits */}
          <div className="bg-white rounded-lg p-6 mb-8 text-left">
            <h3 className="font-['Source_Sans_3'] font-bold text-[16px] text-[#1F2937] mb-4">
              Com uma conta podes:
            </h3>
            <ul className="space-y-3">
              <li className="flex items-start gap-3">
                <div className="w-5 h-5 bg-[#8B1E2D] rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-white text-xs">✓</span>
                </div>
                <span className="font-['Source_Sans_3'] text-[14px] text-[#574142]">
                  Criar e participar em debates
                </span>
              </li>
              <li className="flex items-start gap-3">
                <div className="w-5 h-5 bg-[#8B1E2D] rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-white text-xs">✓</span>
                </div>
                <span className="font-['Source_Sans_3'] text-[14px] text-[#574142]">
                  Comentar e partilhar opiniões
                </span>
              </li>
              <li className="flex items-start gap-3">
                <div className="w-5 h-5 bg-[#8B1E2D] rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-white text-xs">✓</span>
                </div>
                <span className="font-['Source_Sans_3'] text-[14px] text-[#574142]">
                  Realizar quizzes e acompanhar progresso
                </span>
              </li>
              <li className="flex items-start gap-3">
                <div className="w-5 h-5 bg-[#8B1E2D] rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-white text-xs">✓</span>
                </div>
                <span className="font-['Source_Sans_3'] text-[14px] text-[#574142]">
                  Aceder a conteúdos exclusivos
                </span>
              </li>
            </ul>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3">
            <button
              onClick={onLogin}
              className="w-full py-4 bg-[#8B1E2D] text-white rounded-lg font-['Source_Sans_3'] font-bold text-[16px] hover:bg-[#A52535] active:scale-[0.98] transition-all shadow-md flex items-center justify-center gap-2"
            >
              <LogIn className="w-5 h-5" />
              Fazer Login
            </button>

            <button
              onClick={onBack}
              className="w-full py-4 bg-white border-2 border-[#E5E7EB] text-[#574142] rounded-lg font-['Source_Sans_3'] font-semibold text-[16px] hover:bg-gray-50 transition-colors"
            >
              Voltar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
