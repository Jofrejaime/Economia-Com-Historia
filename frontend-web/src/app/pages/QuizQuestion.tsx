import { useState } from 'react';
import { useNavigate } from 'react-router';
import SystemHeader from '../components/SystemHeader';
import SystemFooter from '../components/SystemFooter';

export default function QuizQuestion() {
  const navigate = useNavigate();
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const currentQuestion = 4;
  const totalQuestions = 15;

  const question = {
    module: "MÓDULO IV: ANGOLA COLONIAL",
    title: "O impacto do Ciclo do Café na estrutura social angolana (1950-1970)",
    subtitle: "Considere as transformações demográficas e o surgimento de novas elites económicas durante o auge da produção cafeeira no Planalto Central.",
    options: [
      {
        id: 'A',
        text: "Provocou o declínio imediato das infraestruturas ferroviárias devido ao foco exclusivo na exportação marítima."
      },
      {
        id: 'B',
        text: "Acelerou o processo de urbanização e consolidou uma nova burguesia agrária e administrativa no corredor do Lobito.",
        isCorrect: true
      },
      {
        id: 'C',
        text: "Resultou na abolição total do trabalho forçado em todas as explorações agrícolas do norte do país."
      },
      {
        id: 'D',
        text: "Não teve qualquer impacto significativo, permanecendo Angola dependente apenas da extração diamantífera."
      }
    ],
    hint: {
      title: "Dica do Pesquisador",
      quote: '"O café transformou Angola no quarto maior produtor mundial nos anos 60. Note como a rede ferroviária, especialmente o CFB, foi redesenhada para drenar esta riqueza para o Porto do Lobito, criando centros urbanos vibrantes que antes eram meros postos administrativos."',
      expert: {
        name: "DR. ALBERTO MENDES",
        role: "Especialista em História Económica"
      }
    },
    reading: {
      title: "Leitura Recomendada",
      text: 'Consulte o Capítulo 12: "A Era do Ouro Negro Agrícola" no arquivo digital.'
    }
  };

  const progress = (currentQuestion / totalQuestions) * 100;

  return (
    <div className="bg-[#f8f9ff] flex flex-col min-h-screen">
      <SystemHeader />

      <main className="flex-1 w-full">
        <div className="max-w-[1536px] mx-auto px-[24px] md:px-[32px] lg:px-[48px] py-[32px] md:py-[48px] lg:py-[64px]">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-[32px] md:gap-[48px] lg:gap-[64px]">
            {/* Question Section */}
            <div className="lg:col-span-8">
              {/* Module Tag */}
              <p className="font-['Source_Sans_3:Bold',sans-serif] font-bold text-[#904a44] text-[11px] md:text-[12px] tracking-[1.2px] uppercase leading-[16px] mb-[16px] md:mb-[20px]">
                {question.module}
              </p>

              {/* Question Title */}
              <h1 className="font-['IBM_Plex_Sans:Bold',sans-serif] font-bold text-[#1b1c1b] text-[36px] md:text-[48px] lg:text-[56px] tracking-[-1.2px] leading-[44px] md:leading-[56px] lg:leading-[64px] mb-[16px] md:mb-[20px]" style={{ fontVariationSettings: "'wdth' 100" }}>
                {question.title}
              </h1>

              {/* Subtitle */}
              <p className="font-['Source_Sans_3:Italic',sans-serif] italic text-[#59413e] text-[16px] md:text-[18px] leading-[26px] md:leading-[29px] mb-[32px] md:mb-[48px] max-w-[672px]">
                {question.subtitle}
              </p>

              {/* Options */}
              <div className="flex flex-col gap-[16px] mb-[32px] md:mb-[48px]">
                {question.options.map((option) => (
                  <button
                    key={option.id}
                    onClick={() => setSelectedOption(option.id)}
                    className={`relative rounded-[8px] p-[24px] md:p-[28px] text-left transition-all ${
                      selectedOption === option.id
                        ? 'bg-white border-2 border-[#6f0008] shadow-[0px_4px_24px_-4px_rgba(27,28,27,0.06)]'
                        : 'bg-[#f5f3f1] border-2 border-transparent hover:border-[rgba(224,191,187,0.4)]'
                    }`}
                  >
                    <div className="flex items-start gap-[20px] md:gap-[24px]">
                      {/* Radio Button */}
                      <div className={`flex-shrink-0 w-[20px] h-[20px] md:w-[24px] md:h-[24px] rounded-full border-2 flex items-center justify-center transition-all ${
                        selectedOption === option.id
                          ? 'border-[#6f0008] bg-[#6f0008]'
                          : 'border-[#e0bfbb] bg-transparent'
                      }`}>
                        {selectedOption === option.id && (
                          <div className="w-[8px] h-[8px] md:w-[10px] md:h-[10px] rounded-full bg-white" />
                        )}
                      </div>

                      {/* Option Text */}
                      <p className="font-['Source_Sans_3:Regular',sans-serif] font-normal text-[#1b1c1b] text-[16px] md:text-[18px] leading-[26px] md:leading-[28px] flex-1">
                        {option.text}
                      </p>
                    </div>
                  </button>
                ))}
              </div>

              {/* Progress and Navigation */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-[24px] pt-[32px] border-t border-[rgba(224,191,187,0.2)]">
                {/* Progress Dots */}
                <div className="flex items-center gap-[8px]">
                  {Array.from({ length: totalQuestions }).map((_, index) => (
                    <div
                      key={index}
                      className={`h-[4px] rounded-full transition-all ${
                        index < currentQuestion
                          ? 'w-[48px] bg-[#6f0008]'
                          : 'w-[48px] bg-[#e4e2e0]'
                      }`}
                    />
                  ))}
                </div>

                {/* Next Button */}
                <button
                  onClick={() => navigate('/quiz/resultado')}
                  disabled={!selectedOption}
                  className={`flex items-center gap-[12px] px-[32px] md:px-[40px] py-[14px] md:py-[16px] rounded-[12px] transition-all ${
                    selectedOption
                      ? 'bg-[#6f0008] hover:bg-[#8b1e2d] cursor-pointer'
                      : 'bg-[#e4e2e0] cursor-not-allowed opacity-50'
                  }`}
                >
                  <span className="font-['Source_Sans_3:Bold',sans-serif] font-bold text-white text-[16px] md:text-[18px]">
                    Avançar
                  </span>
                  <svg className="w-[16px] h-[16px]" fill="white" viewBox="0 0 16 16">
                    <path d="M10.0704 5.96094L5.53516 10.4961L4.62891 9.58984L7.84766 6.37109H0.0703125V5.05078H7.84766L4.62891 1.83203L5.53516 0.925781L10.0704 5.46094V5.96094Z" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-4 flex flex-col gap-[32px]">
              {/* Hint Card */}
              <div className="bg-[#f5f3f1] rounded-[8px] p-[28px] md:p-[32px]">
                <div className="flex items-center gap-[12px] mb-[20px] md:mb-[24px]">
                  <svg className="w-[16px] h-[16px] md:w-[20px] md:h-[20px]" fill="#6f0008" viewBox="0 0 15 20">
                    <path d="M7.5 0L0 5V11C0 16.55 3.84 21.74 7.5 23C11.16 21.74 15 16.55 15 11V5L7.5 0Z" />
                  </svg>
                  <h3 className="font-['IBM_Plex_Sans:Bold',sans-serif] font-bold text-[#6f0008] text-[20px] md:text-[24px]" style={{ fontVariationSettings: "'wdth' 100" }}>
                    {question.hint.title}
                  </h3>
                </div>

                {/* Quote Image Placeholder */}
                <div className="bg-[#dbdad8] rounded-[4px] h-[140px] md:h-[162px] mb-[20px] md:mb-[24px] overflow-hidden">
                  <div className="w-full h-full bg-gradient-to-br from-[#e0bfbb] to-[#dbdad8] opacity-50" />
                </div>

                {/* Quote */}
                <p className="font-['Source_Sans_3:Regular',sans-serif] italic text-[#59413e] text-[13px] md:text-[14px] leading-[21px] md:leading-[23px] mb-[20px] md:mb-[24px]">
                  {question.hint.quote}
                </p>

                {/* Expert */}
                <div className="bg-[#e4e2e0] rounded-[4px] p-[16px] flex items-center gap-[16px]">
                  <div className="w-[48px] h-[48px] rounded-[12px] bg-gradient-to-br from-[#d4a574] to-[#b8944f] flex-shrink-0" />
                  <div>
                    <p className="font-['Source_Sans_3:Bold',sans-serif] font-bold text-[#1b1c1b] text-[11px] md:text-[12px] tracking-[-0.3px] uppercase leading-[16px] mb-[4px]">
                      {question.hint.expert.name}
                    </p>
                    <p className="font-['Source_Sans_3:Regular',sans-serif] font-normal text-[#59413e] text-[11px] md:text-[12px] leading-[16px]">
                      {question.hint.expert.role}
                    </p>
                  </div>
                </div>
              </div>

              {/* Reading Card */}
              <div className="border-2 border-[rgba(224,191,187,0.3)] rounded-[8px] p-[24px] md:p-[28px]">
                <div className="flex items-center gap-[8px] mb-[12px]">
                  <svg className="w-[12px] h-[12px]" fill="#1b1c1b" viewBox="0 0 12 10">
                    <path d="M11 0H1C0.45 0 0 0.45 0 1V9C0 9.55 0.45 10 1 10H11C11.55 10 12 9.55 12 9V1C12 0.45 11.55 0 11 0ZM11 9H1V1H11V9Z" />
                  </svg>
                  <h4 className="font-['Source_Sans_3:Bold',sans-serif] font-bold text-[#1b1c1b] text-[15px] md:text-[16px]">
                    {question.reading.title}
                  </h4>
                </div>
                <p className="font-['Source_Sans_3:Regular',sans-serif] font-normal text-[#59413e] text-[13px] md:text-[14px] leading-[19px] md:leading-[20px]">
                  {question.reading.text}
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>

      <SystemFooter />
    </div>
  );
}
