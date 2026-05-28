import React from 'react';
import { TrendingUp, Trophy, RefreshCw, BookOpen } from 'lucide-react';
import BottomNav from './BottomNav';

interface QuizResultProps {
  onNavigate: (destination: 'dashboard' | 'content' | 'community' | 'quiz' | 'profile') => void;
  onViewRanking: () => void;
  onExploreContent: () => void;
  onRetakeQuiz: () => void;
}

export default function QuizResult({ onNavigate, onViewRanking, onExploreContent, onRetakeQuiz }: QuizResultProps) {
  return (
    <div className="bg-[#f8f9ff] min-h-screen pb-28">
      {/* Header */}
      <div className="backdrop-blur-[12px] bg-[rgba(255,255,255,0.85)] sticky top-0 z-10">
        <div className="flex items-center justify-between px-6 py-4">
          <div className="flex items-center gap-4">
            <svg className="w-[18px] h-[12px]" fill="none" viewBox="0 0 18 12">
              <path d="M0 12V10H18V12H0V12M0 7V5H18V7H0V7M0 2V0H18V2H0V2" fill="#7F1D1D" />
            </svg>
            <h1 className="font-['IBM_Plex_Sans'] font-bold text-[18px] text-[#7f1d1d] tracking-[-0.45px]">
              Economia com História
            </h1>
          </div>
          <button className="p-1">
            <svg className="w-[18px] h-[18px]" fill="none" viewBox="0 0 18 18">
              <path d="M16.6 18L10.3 11.7C9.8 12.1 9.225 12.4167 8.575 12.65C7.925 12.8833 7.23333 13 6.5 13C4.68333 13 3.14583 12.3708 1.8875 11.1125C0.629167 9.85417 0 8.31667 0 6.5C0 4.68333 0.629167 3.14583 1.8875 1.8875C3.14583 0.629167 4.68333 0 6.5 0C8.31667 0 9.85417 0.629167 11.1125 1.8875C12.3708 3.14583 13 4.68333 13 6.5C13 7.23333 12.8833 7.925 12.65 8.575C12.4167 9.225 12.1 9.8 11.7 10.3L18 16.6L16.6 18V18M6.5 11C7.75 11 8.8125 10.5625 9.6875 9.6875C10.5625 8.8125 11 7.75 11 6.5C11 5.25 10.5625 4.1875 9.6875 3.3125C8.8125 2.4375 7.75 2 6.5 2C5.25 2 4.1875 2.4375 3.3125 3.3125C2.4375 4.1875 2 5.25 2 6.5C2 7.75 2.4375 8.8125 3.3125 9.6875C4.1875 10.5625 5.25 11 6.5 11V11" fill="#7F1D1D" />
            </svg>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-[896px] mx-auto px-6 pt-8">
        {/* Score Hero Section */}
        <div className="bg-[#eff4ff] rounded-lg p-8 mb-12 border-l-8 border-[#8b1e2d] relative overflow-hidden">
          <svg className="absolute right-[-75px] top-[-75px] w-[250px] h-[250px] opacity-10" fill="none" viewBox="0 0 250 250">
            <path d="M37.5 200V112.5H62.5V200H37.5V200M112.5 200V112.5H137.5V200H112.5V200M0 250V225H250V250H0V250M187.5 200V112.5H212.5V200H187.5V200M0 87.5V62.5L125 0L250 62.5V87.5H0V87.5" fill="#1F2937" />
          </svg>

          <div className="relative z-10">
            <h2 className="font-['IBM_Plex_Sans'] font-bold text-[36px] text-[#8b1e2d] tracking-[-0.9px] leading-[40px] mb-2">
              Conclusão<br/>Meritória
            </h2>
            <p className="font-['Source_Sans_3'] text-[18px] text-[#574142] leading-[29.25px] max-w-[448px]">
              Parabéns pela sua dedicação ao estudo da trajetória económica de Angola. O seu desempenho reflete um compromisso com o rigor histórico.
            </p>
          </div>

          <div className="flex items-center justify-center mt-8">
            <div className="relative w-[160px] h-[160px]">
              <svg className="absolute inset-0 -rotate-90" viewBox="0 0 160 160">
                <circle
                  cx="80"
                  cy="80"
                  r="74"
                  fill="none"
                  stroke="#DEBFBF"
                  strokeWidth="8"
                />
                <circle
                  cx="80"
                  cy="80"
                  r="74"
                  fill="none"
                  stroke="#8B1E2D"
                  strokeWidth="8"
                  strokeLinecap="round"
                  strokeDasharray={`${74 * 2 * Math.PI * 0.85} ${74 * 2 * Math.PI}`}
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <p className="font-['Source_Sans_3'] font-bold text-[48px] text-[#8b1e2d] leading-[48px]">
                  85%
                </p>
                <p className="font-['Source_Sans_3'] font-semibold text-[10px] text-[#894d50] tracking-[1px] uppercase">
                  SCORE FINAL
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Performance Cards */}
        <div className="space-y-6 mb-12">
          {/* Mastery Card */}
          <div className="bg-white rounded-lg p-6 shadow-sm">
            <p className="font-['Source_Sans_3'] font-bold text-[12px] text-[#894d50] uppercase tracking-[1.2px] mb-2">
              ANÁLISE DE DOMÍNIO
            </p>
            <h3 className="font-['IBM_Plex_Sans'] font-bold text-[24px] text-[#1f2937] mb-6">
              Desempenho por Período
            </h3>

            <div className="space-y-6">
              <div>
                <div className="flex justify-between mb-2">
                  <span className="font-['Source_Sans_3'] font-semibold text-[14px] text-[#1f2937]">
                    Economia Pré-Colonial
                  </span>
                  <span className="font-['Source_Sans_3'] font-bold text-[14px] text-[#8b1e2d]">
                    92%
                  </span>
                </div>
                <div className="bg-[#dee9fc] h-[6px] rounded-full overflow-hidden">
                  <div className="bg-[#8b1e2d] h-full w-[92%]" />
                </div>
              </div>

              <div>
                <div className="flex justify-between mb-2">
                  <span className="font-['Source_Sans_3'] font-semibold text-[14px] text-[#1f2937]">
                    O Ciclo do Café e Diamantes
                  </span>
                  <span className="font-['Source_Sans_3'] font-bold text-[14px] text-[#8b1e2d]">
                    78%
                  </span>
                </div>
                <div className="bg-[#dee9fc] h-[6px] rounded-full overflow-hidden">
                  <div className="bg-[#8b1e2d] h-full w-[78%]" />
                </div>
              </div>

              <div>
                <div className="flex justify-between mb-2">
                  <span className="font-['Source_Sans_3'] font-semibold text-[14px] text-[#1f2937]">
                    Reconstrução Pós-Guerra
                  </span>
                  <span className="font-['Source_Sans_3'] font-bold text-[14px] text-[#8b1e2d]">
                    85%
                  </span>
                </div>
                <div className="bg-[#dee9fc] h-[6px] rounded-full overflow-hidden">
                  <div className="bg-[#8b1e2d] h-full w-[85%]" />
                </div>
              </div>
            </div>
          </div>

          {/* Stats Card */}
          <div className="bg-[#8b1e2d] rounded-lg p-6 text-white relative">
            <div className="absolute right-6 top-6">
              <Trophy className="w-7 h-6 text-white" />
            </div>

            <p className="font-['Source_Sans_3'] font-bold text-[30px] text-center mt-6 mb-4">
              17 / 20
            </p>
            <p className="font-['Source_Sans_3'] text-[14px] text-[#ff9da0] text-center mb-6">
              Respostas Corretas articuladas com precisão<br/>histórica.
            </p>

            <div className="border-t border-[rgba(255,255,255,0.2)] pt-6">
              <p className="font-['Source_Sans_3'] text-[12px] text-center uppercase tracking-[-0.6px] opacity-80 mb-1">
                TEMPO TOTAL
              </p>
              <p className="font-['Source_Sans_3'] font-semibold text-[20px] text-center">
                12m 45s
              </p>
            </div>
          </div>
        </div>

        {/* Editorial Insights */}
        <div className="mb-12">
          <div className="flex items-center gap-2 mb-6">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 19.0118 20">
              <path d="M3 20V15.7C2.05 14.8333 1.3125 13.8208 0.7875 12.6625C0.2625 11.5042 0 10.2833 0 9C0 6.5 0.875 4.375 2.625 2.625C4.375 0.875 6.5 0 9 0C11.0833 0 12.9292 0.6125 14.5375 1.8375C16.1458 3.0625 17.1917 4.65833 17.675 6.625L18.975 11.75C19.0583 12.0667 19 12.3542 18.8 12.6125C18.6 12.8708 18.3333 13 18 13H16V16C16 16.55 15.8042 17.0208 15.4125 17.4125C15.0208 17.8042 14.55 18 14 18H12V20H10V16H14V16V16V11H16.7L15.75 7.125C15.3667 5.60833 14.55 4.375 13.3 3.425C12.05 2.475 10.6167 2 9 2C7.06667 2 5.41667 2.675 4.05 4.025C2.68333 5.375 2 7.01667 2 8.95C2 9.95 2.20417 10.9 2.6125 11.8C3.02083 12.7 3.6 13.5 4.35 14.2L5 14.8V20H3V20M9.35 11V11V11V11V11V11V11V11V11V11V11V11V11V11V11V11V11V11M8 13H10L10.15 11.75C10.2833 11.7 10.4042 11.6417 10.5125 11.575C10.6208 11.5083 10.7167 11.4333 10.8 11.35L11.95 11.85L12.95 10.15L11.95 9.4C11.9833 9.26667 12 9.13333 12 9C12 8.86667 11.9833 8.73333 11.95 8.6L12.95 7.85L11.95 6.15L10.8 6.65C10.7167 6.56667 10.6208 6.49167 10.5125 6.425C10.4042 6.35833 10.2833 6.3 10.15 6.25L10 5H8L7.85 6.25C7.71667 6.3 7.59583 6.35833 7.4875 6.425C7.37917 6.49167 7.28333 6.56667 7.2 6.65L6.05 6.15L5.05 7.85L6.05 8.6C6.01667 8.73333 6 8.86667 6 9C6 9.13333 6.01667 9.26667 6.05 9.4L5.05 10.15L6.05 11.85L7.2 11.35C7.28333 11.4333 7.37917 11.5083 7.4875 11.575C7.59583 11.6417 7.71667 11.7 7.85 11.75L8 13V13M9 10.5C8.58333 10.5 8.22917 10.3542 7.9375 10.0625C7.64583 9.77083 7.5 9.41667 7.5 9C7.5 8.58333 7.64583 8.22917 7.9375 7.9375C8.22917 7.64583 8.58333 7.5 9 7.5C9.41667 7.5 9.77083 7.64583 10.0625 7.9375C10.3542 8.22917 10.5 8.58333 10.5 9C10.5 9.41667 10.3542 9.77083 10.0625 10.0625C9.77083 10.3542 9.41667 10.5 9 10.5V10.5" fill="#8B1E2D" />
            </svg>
            <h3 className="font-['IBM_Plex_Sans'] font-bold text-[20px] text-[#1f2937]">
              Parecer Académico
            </h3>
          </div>

          <div className="space-y-6">
            <div className="bg-[#eff4ff] rounded border-l-2 border-[#debfbf] p-6">
              <h4 className="font-['Source_Sans_3'] font-bold text-[16px] text-[#8b1e2d] mb-2">
                Pontos Fortes
              </h4>
              <p className="font-['Source_Sans_3'] text-[14px] text-[#574142] leading-[22.75px]">
                Demonstrou uma compreensão profunda das rotas comerciais ancestrais e do impacto da moeda 'Kwanza' na soberania nacional.
              </p>
            </div>

            <div className="bg-[#eff4ff] rounded border-l-2 border-[#debfbf] p-6">
              <h4 className="font-['Source_Sans_3'] font-bold text-[16px] text-[#8b1e2d] mb-2">
                Sugestão de Estudo
              </h4>
              <p className="font-['Source_Sans_3'] text-[14px] text-[#574142] leading-[22.75px]">
                Recomendamos a revisão do módulo sobre a 'Diversificação Económica Pós-2002' para consolidar os conceitos de macroeconomia angolana.
              </p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="border-t border-[rgba(222,191,191,0.3)] pt-8 pb-8 space-y-4">
          <button
            onClick={onViewRanking}
            className="w-full bg-[#8b1e2d] text-white rounded py-3 px-8 font-['Source_Sans_3'] font-semibold text-[16px] flex items-center justify-center gap-2 hover:bg-[#A52535] transition-colors"
          >
            <TrendingUp className="w-3 h-3" />
            Ver Ranking
          </button>

          <button
            onClick={onExploreContent}
            className="w-full bg-white border border-[#debfbf] text-[#574142] rounded py-3 px-8 font-['Source_Sans_3'] font-semibold text-[16px] flex items-center justify-center gap-2 hover:bg-gray-50 transition-colors"
          >
            <BookOpen className="w-3 h-3" />
            Explorar Mais Conteúdos
          </button>

          <button
            onClick={onRetakeQuiz}
            className="w-full text-[#8b1e2d] rounded py-3 px-8 font-['Source_Sans_3'] font-bold text-[16px] flex items-center justify-center gap-2 hover:bg-gray-50 transition-colors"
          >
            <RefreshCw className="w-3 h-3" />
            Refazer Quiz
          </button>
        </div>

        {/* Visual Context */}
        <div className="opacity-80 mb-8">
          <img
            src="https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?w=400&q=80"
            alt="Historical context"
            className="w-full h-48 object-cover rounded-lg shadow-md"
            style={{ mixBlendMode: 'saturation' }}
          />
        </div>
      </div>

      {/* Bottom Navigation */}
      <BottomNav activeTab="quiz" onNavigate={onNavigate} />
    </div>
  );
}
