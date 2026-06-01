import React from 'react';
import { ArrowLeft, Check, X, ChevronRight, CheckCircle, XCircle } from 'lucide-react';
import BottomNav from './BottomNav';

interface QuizFeedbackProps {
  onBack: () => void;
  onNextQuestion: () => void;
  isCorrect: boolean;
  onNavigate?: (destination: 'dashboard' | 'content' | 'community' | 'quiz' | 'profile') => void;
}

export default function QuizFeedback({ onBack, onNextQuestion, isCorrect, onNavigate }: QuizFeedbackProps) {
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
          <X className="w-4.5 h-4.5 text-[#7F1D1D]" />
        </button>
      </div>

      {/* Main Content */}
      <div className="px-6 py-12 pb-24 relative">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none">
          <svg className="w-full h-full" viewBox="0 0 390 390">
            <circle cx="195" cy="195" r="195" fill="black"/>
          </svg>
        </div>

        {/* Result Header */}
        <div className="relative mb-12">
          {/* Icon */}
          <div className={`w-20 h-20 rounded-xl flex items-center justify-center mb-6 shadow-sm ${
            isCorrect ? 'bg-[#90D3C5]' : 'bg-[#FCA5A5]'
          }`}>
            {isCorrect ? (
              <CheckCircle className="w-7.5 h-7.5 text-[#003A32]" strokeWidth={2.5} />
            ) : (
              <XCircle className="w-7.5 h-7.5 text-[#7F1D1D]" strokeWidth={2.5} />
            )}
          </div>

          {/* Status */}
          <div className="mb-1">
            <p className="font-['Source_Sans_3'] font-bold text-[11px] text-[#003A32] tracking-[2.2px] uppercase mb-1">
              Feedback do Sistema
            </p>
            <h2 className={`font-['IBM_Plex_Sans'] font-bold text-[48px] leading-[48px] tracking-[-1.2px] ${
              isCorrect ? 'text-[#6B0119]' : 'text-[#DC2626]'
            }`}>
              {isCorrect ? 'Correto' : 'Incorreto'}
            </h2>
          </div>
        </div>

        {/* Explanation Card */}
        <div className={`bg-[#EFF4FF] rounded-lg border-l-4 shadow-sm overflow-hidden mb-12 ${
          isCorrect ? 'border-[#047857]' : 'border-[#6B0119]'
        }`}>
          {/* Image */}
          <div className="relative h-64 overflow-hidden">
            <img
              src="https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=800&q=80"
              alt="Contexto histórico"
              className="w-full h-full object-cover opacity-80"
            />
            <div className="absolute inset-0 bg-white mix-blend-saturation"></div>
            <div className="absolute inset-0 bg-[rgba(107,1,25,0.1)] mix-blend-multiply"></div>
          </div>

          {/* Content */}
          <div className="p-8">
            {/* Title */}
            <div className="flex items-center gap-2 mb-6">
              <svg className="w-3 h-2.5" fill="currentColor" viewBox="0 0 12 10">
                <path d="M4 10L0 6l1.5-1.5L4 7l6.5-6.5L12 2l-8 8z"/>
              </svg>
              <h3 className={`font-['Source_Sans_3'] font-bold text-[14px] uppercase tracking-wide ${
                isCorrect ? 'text-[#047857]' : 'text-[#6B0119]'
              }`}>
                Análise Histórica
              </h3>
            </div>

            {/* Explanation */}
            <p className="font-['Source_Sans_3'] text-[18px] text-[#574142] leading-[29.25px] mb-6">
              {isCorrect ? (
                <>
                  A introdução do Kwanza em 1977 não foi apenas uma mudança monetária, mas um acto de soberania económica fundamental para o recém-formado Estado angolano. Este processo permitiu o controlo centralizado da liquidez e a dissociação definitiva do sistema financeiro colonial português, estabelecendo as bases para a governação macroeconómica do país.
                </>
              ) : (
                <>
                  A resposta correta era a opção B. A abolição do tráfico negreiro em 1836 forçou uma transição para a "economia lícita", focada na exportação de produtos como cera, marfim e óleo de palma. Esta mudança representou uma transformação profunda na estrutura económica de Luanda, embora não tenha eliminado imediatamente todas as formas de trabalho forçado.
                </>
              )}
            </p>

            {/* Link to Chapter */}
            <button className={`flex items-center gap-2 hover:underline ${
              isCorrect ? 'text-[#047857]' : 'text-[#6B0119]'
            }`}>
              <svg className="w-3 h-2.5" fill="currentColor" viewBox="0 0 13 9">
                <path d="M0 4.5h10m0 0L6.5 1M10 4.5L6.5 8"/>
              </svg>
              <span className="font-['Source_Sans_3'] font-bold text-[16px] leading-[24px]">
                Rever capítulo: "A Reforma de 1977"
              </span>
              <svg className="w-2.5 h-2.5" fill="currentColor" viewBox="0 0 10 10">
                <circle cx="5" cy="5" r="5"/>
              </svg>
            </button>
          </div>
        </div>

        {/* Progress and Next */}
        <div className="border-t border-[rgba(222,191,191,0.2)] pt-6">
          {/* Progress */}
          <div className="flex items-center gap-4 mb-6">
            <span className="font-['Source_Sans_3'] font-bold text-[14px] text-[#574142]">
              Progresso:
            </span>
            <div className="flex-1 max-w-[192px]">
              <div className="h-1.5 bg-[#D9E3F6] rounded-full overflow-hidden">
                <div className={`h-full rounded-full transition-colors ${
                  isCorrect ? 'bg-[#047857]' : 'bg-[#6B0119]'
                }`} style={{ width: '75%' }}></div>
              </div>
            </div>
            <span className="font-['Source_Sans_3'] text-[12px] text-[#574142]">
              12/16
            </span>
          </div>

          {/* Next Button */}
          <button
            onClick={onNextQuestion}
            className={`w-full py-5 text-white rounded-xl font-['Source_Sans_3'] font-bold text-[17px] flex items-center justify-center gap-3 active:scale-[0.98] transition-all ${
              isCorrect
                ? 'bg-[#047857] hover:bg-[#059669] shadow-[0px_8px_24px_-4px_rgba(4,120,87,0.4)]'
                : 'bg-[#8B1E2D] hover:bg-[#A52535] shadow-[0px_8px_24px_-4px_rgba(139,30,45,0.4)]'
            }`}
          >
            <span className="leading-[24px] tracking-[0.5px]">Próxima Pergunta</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Bottom Navigation */}
      {onNavigate && <BottomNav activeTab="quiz" onNavigate={onNavigate} />}
    </div>
  );
}
