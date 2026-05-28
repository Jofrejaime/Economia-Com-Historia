import { useNavigate } from 'react-router';
import SystemHeader from '../components/SystemHeader';
import SystemFooter from '../components/SystemFooter';

export default function QuizResult() {
  const navigate = useNavigate();

  const result = {
    score: 85,
    correctAnswers: 13,
    totalQuestions: 15,
    timeSpent: "18m 42s",
    pointsEarned: 130,
    bonusPoints: 20,
    levelProgress: {
      before: 2450,
      after: 2600,
      nextLevel: 3000,
      percentage: 87
    },
    performance: "Excelente",
    badge: {
      earned: true,
      name: "Especialista em Café Colonial",
      description: "Dominou o conhecimento sobre o ciclo do café em Angola"
    },
    answers: [
      { question: 1, correct: true, time: "45s" },
      { question: 2, correct: true, time: "52s" },
      { question: 3, correct: false, time: "1m 12s" },
      { question: 4, correct: true, time: "38s" },
      { question: 5, correct: true, time: "1m 05s" },
      { question: 6, correct: true, time: "42s" },
      { question: 7, correct: true, time: "56s" },
      { question: 8, correct: true, time: "48s" },
      { question: 9, correct: true, time: "1m 18s" },
      { question: 10, correct: false, time: "1m 32s" },
      { question: 11, correct: true, time: "39s" },
      { question: 12, correct: true, time: "44s" },
      { question: 13, correct: true, time: "51s" },
      { question: 14, correct: true, time: "47s" },
      { question: 15, correct: true, time: "53s" }
    ]
  };

  return (
    <div className="bg-[#f8f9ff] flex flex-col min-h-screen">
      <SystemHeader />

      <main className="flex-1 w-full">
        <div className="max-w-[1536px] mx-auto px-[24px] md:px-[32px] lg:px-[48px] py-[32px] md:py-[48px] lg:py-[64px]">
          {/* Success Banner */}
          <div className="relative bg-gradient-to-br from-[#4ade80] via-[#22c55e] to-[#16a34a] rounded-[12px] md:rounded-[16px] p-[32px] md:p-[48px] lg:p-[56px] mb-[32px] md:mb-[48px] overflow-hidden shadow-2xl">
            {/* Decorative Elements */}
            <div className="absolute top-0 right-0 w-[300px] h-[300px] bg-[#4ade80] opacity-20 rounded-full blur-3xl animate-pulse" />
            <div className="absolute bottom-0 left-0 w-[250px] h-[250px] bg-[#fbbf24] opacity-20 rounded-full blur-2xl animate-pulse" />

            <div className="relative text-center">
              {/* Trophy Icon */}
              <div className="w-[80px] h-[80px] md:w-[100px] md:h-[100px] mx-auto mb-[24px] md:mb-[32px] relative">
                <div className="absolute inset-0 bg-[#fbbf24] rounded-full animate-ping opacity-30" />
                <div className="relative bg-gradient-to-br from-[#fbbf24] to-[#f59e0b] rounded-full p-[16px] md:p-[20px] shadow-2xl">
                  <svg className="w-full h-full" fill="white" viewBox="0 0 24 24">
                    <path d="M12 2C11.5 2 11 2.19 10.59 2.59L2.59 10.59C1.8 11.37 1.8 12.63 2.59 13.41L10.59 21.41C11.37 22.2 12.63 22.2 13.41 21.41L21.41 13.41C22.2 12.63 22.2 11.37 21.41 10.59L13.41 2.59C13 2.19 12.5 2 12 2M12 4L20 12L12 20L4 12L12 4M12 7C9.24 7 7 9.24 7 12S9.24 17 12 17 17 14.76 17 12 14.76 7 12 7M12 9C13.66 9 15 10.34 15 12S13.66 15 12 15 9 13.66 9 12 10.34 9 12 9Z" />
                  </svg>
                </div>
              </div>

              {/* Main Score */}
              <h1 className="font-['IBM_Plex_Sans:Bold',sans-serif] font-bold text-white text-[48px] md:text-[64px] lg:text-[72px] tracking-[-1.8px] leading-[56px] md:leading-[72px] lg:leading-[80px] mb-[12px]" style={{ fontVariationSettings: "'wdth' 100" }}>
                {result.score}%
              </h1>

              <p className="font-['Source_Sans_3:Bold',sans-serif] font-bold text-white/90 text-[18px] md:text-[22px] lg:text-[24px] tracking-[1.2px] uppercase mb-[16px]">
                {result.performance}
              </p>

              <p className="font-['Source_Sans_3:Regular',sans-serif] font-normal text-white/80 text-[16px] md:text-[18px] leading-[26px]">
                {result.correctAnswers} de {result.totalQuestions} questões corretas • {result.timeSpent}
              </p>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-[20px] md:gap-[24px] mb-[32px] md:mb-[48px]">
            {/* Points Earned */}
            <div className="bg-white rounded-[8px] md:rounded-[12px] p-[24px] md:p-[28px] border border-[rgba(222,191,191,0.1)] shadow-sm">
              <div className="flex items-center gap-[12px] mb-[16px]">
                <div className="w-[40px] h-[40px] bg-gradient-to-br from-[#fbbf24] to-[#f59e0b] rounded-[10px] flex items-center justify-center">
                  <svg className="w-[20px] h-[20px]" fill="white" viewBox="0 0 24 24">
                    <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" />
                  </svg>
                </div>
                <h3 className="font-['Source_Sans_3:Bold',sans-serif] font-bold text-[#574142] text-[12px] tracking-[1px] uppercase">
                  Pontos Ganhos
                </h3>
              </div>
              <p className="font-['IBM_Plex_Sans:Bold',sans-serif] font-bold text-[#fbbf24] text-[36px] md:text-[42px] tracking-[-0.84px] leading-[44px]" style={{ fontVariationSettings: "'wdth' 100" }}>
                +{result.pointsEarned}
              </p>
              {result.bonusPoints > 0 && (
                <p className="font-['Source_Sans_3:Medium',sans-serif] font-medium text-[#22c55e] text-[13px]">
                  +{result.bonusPoints} bónus
                </p>
              )}
            </div>

            {/* Accuracy */}
            <div className="bg-white rounded-[8px] md:rounded-[12px] p-[24px] md:p-[28px] border border-[rgba(222,191,191,0.1)] shadow-sm">
              <div className="flex items-center gap-[12px] mb-[16px]">
                <div className="w-[40px] h-[40px] bg-gradient-to-br from-[#22c55e] to-[#16a34a] rounded-[10px] flex items-center justify-center">
                  <svg className="w-[20px] h-[20px]" fill="white" viewBox="0 0 24 24">
                    <path d="M9 16.17L4.83 12L3.41 13.41L9 19L21 7L19.59 5.59L9 16.17Z" />
                  </svg>
                </div>
                <h3 className="font-['Source_Sans_3:Bold',sans-serif] font-bold text-[#574142] text-[12px] tracking-[1px] uppercase">
                  Precisão
                </h3>
              </div>
              <p className="font-['IBM_Plex_Sans:Bold',sans-serif] font-bold text-[#22c55e] text-[36px] md:text-[42px] tracking-[-0.84px] leading-[44px]" style={{ fontVariationSettings: "'wdth' 100" }}>
                {result.score}%
              </p>
              <p className="font-['Source_Sans_3:Medium',sans-serif] font-medium text-[#94a3b8] text-[13px]">
                {result.correctAnswers}/{result.totalQuestions} corretas
              </p>
            </div>

            {/* Time */}
            <div className="bg-white rounded-[8px] md:rounded-[12px] p-[24px] md:p-[28px] border border-[rgba(222,191,191,0.1)] shadow-sm">
              <div className="flex items-center gap-[12px] mb-[16px]">
                <div className="w-[40px] h-[40px] bg-gradient-to-br from-[#8b1e2d] to-[#6b0119] rounded-[10px] flex items-center justify-center">
                  <svg className="w-[20px] h-[20px]" fill="white" viewBox="0 0 24 24">
                    <path d="M12 2C6.5 2 2 6.5 2 12S6.5 22 12 22 22 17.5 22 12 17.5 2 12 2M12 20C7.59 20 4 16.41 4 12S7.59 4 12 4 20 7.59 20 12 16.41 20 12 20M12.5 7H11V13L16.2 16.2L17 14.9L12.5 12.2V7Z" />
                  </svg>
                </div>
                <h3 className="font-['Source_Sans_3:Bold',sans-serif] font-bold text-[#574142] text-[12px] tracking-[1px] uppercase">
                  Tempo
                </h3>
              </div>
              <p className="font-['IBM_Plex_Sans:Bold',sans-serif] font-bold text-[#8b1e2d] text-[36px] md:text-[42px] tracking-[-0.84px] leading-[44px]" style={{ fontVariationSettings: "'wdth' 100" }}>
                {result.timeSpent}
              </p>
              <p className="font-['Source_Sans_3:Medium',sans-serif] font-medium text-[#94a3b8] text-[13px]">
                Tempo total
              </p>
            </div>

            {/* Level Progress */}
            <div className="bg-gradient-to-br from-[#d4a574] to-[#b8944f] rounded-[8px] md:rounded-[12px] p-[24px] md:p-[28px] shadow-sm">
              <h3 className="font-['Source_Sans_3:Bold',sans-serif] font-bold text-white/90 text-[12px] tracking-[1px] uppercase mb-[16px]">
                Progresso de Nível
              </h3>
              <p className="font-['IBM_Plex_Sans:Bold',sans-serif] font-bold text-white text-[36px] md:text-[42px] tracking-[-0.84px] leading-[44px] mb-[12px]" style={{ fontVariationSettings: "'wdth' 100" }}>
                {result.levelProgress.percentage}%
              </p>
              <div className="bg-white/25 h-[8px] rounded-full overflow-hidden mb-[8px]">
                <div
                  className="bg-gradient-to-r from-[#4ade80] to-[#22c55e] h-full rounded-full transition-all duration-1000"
                  style={{ width: `${result.levelProgress.percentage}%` }}
                />
              </div>
              <p className="font-['Source_Sans_3:Medium',sans-serif] font-medium text-white/80 text-[12px]">
                {result.levelProgress.after - result.levelProgress.before} pontos até próximo nível
              </p>
            </div>
          </div>

          {/* Badge Earned */}
          {result.badge.earned && (
            <div className="bg-gradient-to-r from-[#fbbf24] via-[#f59e0b] to-[#fbbf24] rounded-[12px] md:rounded-[16px] p-[2px] mb-[32px] md:mb-[48px] shadow-xl">
              <div className="bg-white rounded-[10px] md:rounded-[14px] p-[28px] md:p-[36px]">
                <div className="flex flex-col md:flex-row items-center gap-[24px] md:gap-[32px]">
                  {/* Badge Icon */}
                  <div className="relative">
                    <div className="absolute inset-0 bg-[#fbbf24] rounded-full blur-xl opacity-40 animate-pulse" />
                    <div className="relative w-[100px] h-[100px] md:w-[120px] md:h-[120px] bg-gradient-to-br from-[#fbbf24] to-[#f59e0b] rounded-full flex items-center justify-center shadow-2xl">
                      <svg className="w-[50px] h-[50px] md:w-[60px] md:h-[60px]" fill="white" viewBox="0 0 24 24">
                        <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" />
                      </svg>
                    </div>
                  </div>

                  {/* Badge Info */}
                  <div className="flex-1 text-center md:text-left">
                    <p className="font-['Source_Sans_3:Bold',sans-serif] font-bold text-[#fbbf24] text-[12px] tracking-[1.2px] uppercase mb-[8px]">
                      🎉 Nova Distinção Desbloqueada!
                    </p>
                    <h2 className="font-['IBM_Plex_Sans:Bold',sans-serif] font-bold text-[#1b1c1b] text-[28px] md:text-[36px] tracking-[-0.84px] leading-[36px] md:leading-[44px] mb-[8px]" style={{ fontVariationSettings: "'wdth' 100" }}>
                      {result.badge.name}
                    </h2>
                    <p className="font-['Source_Sans_3:Regular',sans-serif] font-normal text-[#59413e] text-[15px] md:text-[16px] leading-[24px]">
                      {result.badge.description}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Question Review */}
          <div className="bg-white rounded-[8px] md:rounded-[12px] p-[28px] md:p-[36px] border border-[rgba(222,191,191,0.1)] mb-[32px] md:mb-[48px]">
            <h2 className="font-['IBM_Plex_Sans:Bold',sans-serif] font-bold text-[#6b0119] text-[24px] md:text-[28px] tracking-[-0.6px] leading-[32px] md:leading-[36px] mb-[24px]" style={{ fontVariationSettings: "'wdth' 100" }}>
              Revisão das Respostas
            </h2>

            <div className="grid grid-cols-3 sm:grid-cols-5 md:grid-cols-10 lg:grid-cols-15 gap-[12px]">
              {result.answers.map((answer, index) => (
                <div key={index} className="flex flex-col items-center gap-[6px]">
                  <div className={`w-[48px] h-[48px] rounded-[8px] flex items-center justify-center font-['Source_Sans_3:Bold',sans-serif] font-bold text-[16px] transition-all hover:scale-110 ${
                    answer.correct
                      ? 'bg-gradient-to-br from-[#22c55e] to-[#16a34a] text-white shadow-lg'
                      : 'bg-gradient-to-br from-[#ef4444] to-[#dc2626] text-white shadow-lg'
                  }`}>
                    {index + 1}
                  </div>
                  <span className="font-['Source_Sans_3:Regular',sans-serif] font-normal text-[#94a3b8] text-[11px]">
                    {answer.time}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-[16px] justify-center">
            <button
              onClick={() => navigate('/quiz')}
              className="bg-white border-2 border-[#6b0119] px-[32px] md:px-[40px] py-[14px] md:py-[16px] rounded-[12px] hover:bg-[#f8f9ff] transition-all"
            >
              <span className="font-['Source_Sans_3:Bold',sans-serif] font-bold text-[#6b0119] text-[16px] md:text-[18px]">
                Voltar aos Questionários
              </span>
            </button>

            <button
              onClick={() => navigate('/quiz/pergunta')}
              className="bg-[#6b0119] px-[32px] md:px-[40px] py-[14px] md:py-[16px] rounded-[12px] hover:bg-[#8b1e2d] transition-all flex items-center justify-center gap-[12px]"
            >
              <span className="font-['Source_Sans_3:Bold',sans-serif] font-bold text-white text-[16px] md:text-[18px]">
                Próximo Questionário
              </span>
              <svg className="w-[16px] h-[16px]" fill="white" viewBox="0 0 16 16">
                <path d="M10.0704 5.96094L5.53516 10.4961L4.62891 9.58984L7.84766 6.37109H0.0703125V5.05078H7.84766L4.62891 1.83203L5.53516 0.925781L10.0704 5.46094V5.96094Z" />
              </svg>
            </button>
          </div>
        </div>
      </main>

      <SystemFooter />
    </div>
  );
}
