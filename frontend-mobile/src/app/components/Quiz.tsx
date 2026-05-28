import React, { useState } from 'react';
import { ArrowLeft, Check, Lightbulb } from 'lucide-react';
import BottomNav from './BottomNav';

interface QuizProps {
  onBack: () => void;
  onSubmitAnswer: (isCorrect: boolean) => void;
  onNavigate?: (destination: 'dashboard' | 'content' | 'community' | 'quiz' | 'profile') => void;
}

export default function Quiz({ onBack, onSubmitAnswer, onNavigate }: QuizProps) {
  const [selectedOption, setSelectedOption] = useState<string | null>(null);

  const handleSubmit = () => {
    if (selectedOption === 'B') {
      onSubmitAnswer(true);
    } else {
      onSubmitAnswer(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8F9FF]">
      {/* Status Bar */}
      <div className="h-11 bg-white flex items-center justify-between px-5 border-b border-[#E5E7EB]">
        <span className="font-['IBM_Plex_Sans'] font-bold text-[15px]">9:41</span>
        <div className="flex gap-1">
          <div className="w-4 h-4">📶</div>
          <div className="w-4 h-4">📡</div>
          <div className="w-4 h-4">🔋</div>
        </div>
      </div>

      {/* Header */}
      <div className="backdrop-blur-md bg-white/85 px-6 py-4 flex items-center justify-between border-b border-[#E5E7EB]">
        <button
          onClick={onBack}
          className="flex items-center gap-4 text-[#7F1D1D]"
        >
          <ArrowLeft className="w-5 h-5" />
          <h1 className="font-['IBM_Plex_Sans'] font-bold text-[18px] tracking-[-0.45px]">
            Economia com História
          </h1>
        </button>

        <button className="p-2">
          <div className="flex flex-col gap-1">
            <div className="w-1 h-1 bg-[#7F1D1D] rounded-full"></div>
            <div className="w-1 h-1 bg-[#7F1D1D] rounded-full"></div>
            <div className="w-1 h-1 bg-[#7F1D1D] rounded-full"></div>
          </div>
        </button>
      </div>

      {/* Main Content */}
      <div className="px-6 py-12">
        {/* Module and Question */}
        <div className="mb-12">
          <p className="font-['Source_Sans_3'] font-semibold text-[12px] text-[#894D50] tracking-[2.4px] uppercase text-center mb-4">
            MÓDULO II: A ERA COLONIAL
          </p>

          <h2 className="font-['IBM_Plex_Sans'] font-bold text-[30px] text-[#121C2A] text-center leading-[37.5px] mb-4">
            Qual foi o impacto imediato da abolição do tráfico negreiro na estrutura comercial de Luanda em 1836?
          </h2>

          <div className="flex justify-center">
            <div className="w-16 h-0.5 bg-[rgba(139,30,45,0.2)]"></div>
          </div>
        </div>

        {/* Options */}
        <div className="space-y-4 mb-12">
          {/* Option A */}
          <button
            onClick={() => setSelectedOption('A')}
            className={`w-full p-6 rounded-lg text-left transition-all ${
              selectedOption === 'A'
                ? 'bg-white border-l-4 border-[#8B1E2D] shadow-lg'
                : 'bg-[#EFF4FF] border-l-4 border-transparent'
            }`}
          >
            <div className="flex items-start gap-6">
              <span className={`font-['IBM_Plex_Sans'] font-bold text-[20px] leading-[28px] ${
                selectedOption === 'A' ? 'text-[#6B0119]' : 'text-[rgba(107,1,25,0.4)]'
              }`}>
                A
              </span>
              <p className={`font-['Source_Sans_3'] text-[18px] leading-[29.25px] flex-1 ${
                selectedOption === 'A' ? 'font-semibold text-[#121C2A]' : 'text-[#574142]'
              }`}>
                O colapso total imediato de todas as rotas comerciais marítimas para a Europa.
              </p>
              {selectedOption === 'A' && (
                <Check className="w-5 h-5 text-[#6B0119] flex-shrink-0 mt-1" />
              )}
            </div>
          </button>

          {/* Option B */}
          <button
            onClick={() => setSelectedOption('B')}
            className={`w-full p-6 rounded-lg text-left transition-all ${
              selectedOption === 'B'
                ? 'bg-white border-l-4 border-[#8B1E2D] shadow-lg'
                : 'bg-[#EFF4FF] border-l-4 border-transparent'
            }`}
          >
            <div className="flex items-start gap-6">
              <span className={`font-['IBM_Plex_Sans'] font-bold text-[20px] leading-[28px] ${
                selectedOption === 'B' ? 'text-[#6B0119]' : 'text-[rgba(107,1,25,0.4)]'
              }`}>
                B
              </span>
              <p className={`font-['Source_Sans_3'] text-[18px] leading-[29.25px] flex-1 ${
                selectedOption === 'B' ? 'font-semibold text-[#121C2A]' : 'text-[#574142]'
              }`}>
                Uma transição forçada para a "economia lícita", focada na exportação de cera, marfim e óleo de palma.
              </p>
              {selectedOption === 'B' && (
                <Check className="w-5 h-5 text-[#6B0119] flex-shrink-0 mt-1" />
              )}
            </div>
          </button>

          {/* Option C */}
          <button
            onClick={() => setSelectedOption('C')}
            className={`w-full p-6 rounded-lg text-left transition-all ${
              selectedOption === 'C'
                ? 'bg-white border-l-4 border-[#8B1E2D] shadow-lg'
                : 'bg-[#EFF4FF] border-l-4 border-transparent'
            }`}
          >
            <div className="flex items-start gap-6">
              <span className={`font-['IBM_Plex_Sans'] font-bold text-[20px] leading-[28px] ${
                selectedOption === 'C' ? 'text-[#6B0119]' : 'text-[rgba(107,1,25,0.4)]'
              }`}>
                C
              </span>
              <p className={`font-['Source_Sans_3'] text-[18px] leading-[29.25px] flex-1 ${
                selectedOption === 'C' ? 'font-semibold text-[#121C2A]' : 'text-[#574142]'
              }`}>
                A substituição imediata da mão-de-obra escrava por sistemas mecanizados industriais importados.
              </p>
              {selectedOption === 'C' && (
                <Check className="w-5 h-5 text-[#6B0119] flex-shrink-0 mt-1" />
              )}
            </div>
          </button>

          {/* Option D */}
          <button
            onClick={() => setSelectedOption('D')}
            className={`w-full p-6 rounded-lg text-left transition-all ${
              selectedOption === 'D'
                ? 'bg-white border-l-4 border-[#8B1E2D] shadow-lg'
                : 'bg-[#EFF4FF] border-l-4 border-transparent'
            }`}
          >
            <div className="flex items-start gap-6">
              <span className={`font-['IBM_Plex_Sans'] font-bold text-[20px] leading-[28px] ${
                selectedOption === 'D' ? 'text-[#6B0119]' : 'text-[rgba(107,1,25,0.4)]'
              }`}>
                D
              </span>
              <p className={`font-['Source_Sans_3'] text-[18px] leading-[29.25px] flex-1 ${
                selectedOption === 'D' ? 'font-semibold text-[#121C2A]' : 'text-[#574142]'
              }`}>
                O isolamento diplomático de Angola perante as outras colónias portuguesas no Atlântico.
              </p>
              {selectedOption === 'D' && (
                <Check className="w-5 h-5 text-[#6B0119] flex-shrink-0 mt-1" />
              )}
            </div>
          </button>
        </div>

        {/* Hint and Submit */}
        <div className="border-t border-[rgba(222,191,191,0.15)] pt-8">
          <div className="flex items-start gap-3 mb-6">
            <Lightbulb className="w-3 h-3 text-[rgba(87,65,66,0.7)] flex-shrink-0 mt-1" />
            <p className="font-['Source_Sans_3'] italic text-[14px] text-[rgba(87,65,66,0.7)] leading-[20px]">
              Pense na transição entre o mercantilismo clássico e o novo colonialismo.
            </p>
          </div>

          <button
            onClick={handleSubmit}
            disabled={!selectedOption}
            className="w-full py-5 bg-[#8B1E2D] text-white rounded-xl font-['Source_Sans_3'] font-bold text-[17px] flex items-center justify-center gap-2.5 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-[#A52535] active:scale-[0.98] transition-all shadow-[0px_8px_24px_-4px_rgba(139,30,45,0.4)]"
          >
            <span className="tracking-[0.5px]">Confirmar Resposta</span>
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 16 16">
              <path d="M12.207 4.793a1 1 0 010 1.414l-5 5a1 1 0 01-1.414 0l-2-2a1 1 0 011.414-1.414L6.5 9.086l4.293-4.293a1 1 0 011.414 0z"/>
            </svg>
          </button>
        </div>
      </div>

      {/* Bottom Navigation */}
      {onNavigate && <BottomNav activeTab="quiz" onNavigate={onNavigate} />}
    </div>
  );
}
