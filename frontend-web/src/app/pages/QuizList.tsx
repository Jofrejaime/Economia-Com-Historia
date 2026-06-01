import { useNavigate } from 'react-router';
import SystemHeader from '../components/SystemHeader';
import SystemFooter from '../components/SystemFooter';
import LeaderboardSection from '../components/LeaderboardSection';

export default function QuizList() {
  const navigate = useNavigate();

  const userLevel = {
    current: 3,
    name: "Investigador Avançado",
    points: 2450,
    nextLevel: 3000,
    progress: 82
  };

  const featuredQuizzes = [
    {
      id: 1,
      title: "O Ciclo do Café em Angola",
      module: "MÓDULO IV: ANGOLA COLONIAL",
      description: "Análise do impacto econômico e social do café entre 1950-1970",
      questions: 15,
      difficulty: "Avançado",
      points: 150,
      image: null,
      completed: false
    },
    {
      id: 2,
      title: "Reformas Monetárias Pós-Independência",
      module: "MÓDULO V: ANGOLA INDEPENDENTE",
      description: "A transição do Escudo para o Kwanza em 1977",
      questions: 12,
      difficulty: "Intermédio",
      points: 120,
      image: null,
      completed: true
    }
  ];

  const quizzes = [
    {
      id: 3,
      title: "Infraestruturas Coloniais",
      module: "MÓDULO III",
      questions: 10,
      difficulty: "Básico",
      points: 100,
      completed: false
    },
    {
      id: 4,
      title: "Economia do Petróleo",
      module: "MÓDULO VI",
      questions: 18,
      difficulty: "Avançado",
      points: 180,
      completed: false
    },
    {
      id: 5,
      title: "Comércio Transatlântico",
      module: "MÓDULO II",
      questions: 14,
      difficulty: "Intermédio",
      points: 140,
      completed: true
    },
    {
      id: 6,
      title: "Desenvolvimento Urbano",
      module: "MÓDULO IV",
      questions: 12,
      difficulty: "Básico",
      points: 120,
      completed: false
    }
  ];

  return (
    <div className="bg-[#f8f9ff] flex flex-col min-h-screen">
      <SystemHeader />

      <main className="flex-1 w-full">
        <div className="max-w-[1536px] mx-auto px-[24px] md:px-[32px] lg:px-[48px] py-[32px] md:py-[48px] lg:py-[64px]">
          {/* Header */}
          <div className="mb-[32px] md:mb-[48px]">
            <h1 className="font-['IBM_Plex_Sans:Bold',sans-serif] font-bold text-[#6b0119] text-[32px] md:text-[42px] lg:text-[48px] tracking-[-1.2px] leading-[40px] md:leading-[48px] lg:leading-[56px] mb-[12px]" style={{ fontVariationSettings: "'wdth' 100" }}>
              Questionários Académicos
            </h1>
            <p className="font-['Source_Sans_3:Regular',sans-serif] font-normal text-[#574142] text-[16px] md:text-[18px] leading-[26px] md:leading-[28px]">
              Teste os seus conhecimentos sobre a história económica de Angola
            </p>
          </div>

          {/* User Level Card */}
          <UserLevelCard level={userLevel} />

          {/* Featured Quizzes */}
          <section className="mb-[48px] md:mb-[64px]">
            <div className="flex items-center justify-between mb-[24px] md:mb-[32px]">
              <div>
                <h2 className="font-['IBM_Plex_Sans:Bold',sans-serif] font-bold text-[#6b0119] text-[24px] md:text-[28px] tracking-[-0.6px] leading-[32px] md:leading-[36px]" style={{ fontVariationSettings: "'wdth' 100" }}>
                  Destaques em Progresso
                </h2>
                <div className="bg-[#6b0119] h-[3px] w-[48px] mt-[8px]" />
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-[24px] md:gap-[32px]">
              {featuredQuizzes.map(quiz => (
                <FeaturedQuizCard key={quiz.id} quiz={quiz} onClick={() => navigate('/quiz/pergunta')} />
              ))}
            </div>
          </section>

          {/* Leaderboard */}
          <LeaderboardSection />

          {/* All Quizzes */}
          <section>
            <div className="flex items-center justify-between mb-[24px] md:mb-[32px]">
              <h2 className="font-['IBM_Plex_Sans:Bold',sans-serif] font-bold text-[#6b0119] text-[24px] md:text-[28px] tracking-[-0.6px] leading-[32px] md:leading-[36px]" style={{ fontVariationSettings: "'wdth' 100" }}>
                Todos os Questionários
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-[20px] md:gap-[24px]">
              {quizzes.map(quiz => (
                <QuizCard key={quiz.id} quiz={quiz} onClick={() => navigate('/quiz/pergunta')} />
              ))}
            </div>
          </section>
        </div>
      </main>

      <SystemFooter />
    </div>
  );
}

function UserLevelCard({ level }: { level: any }) {
  return (
    <div className="bg-gradient-to-br from-[#d4a574] to-[#b8944f] rounded-[8px] md:rounded-[12px] p-[28px] md:p-[36px] lg:p-[40px] mb-[48px] md:mb-[64px] relative overflow-hidden shadow-lg">
      {/* Decorative elements */}
      <div className="absolute top-0 right-0 w-[200px] h-[200px] bg-[#c99d66] opacity-20 rounded-full blur-3xl" />
      <div className="absolute bottom-0 left-0 w-[150px] h-[150px] bg-[#eac086] opacity-20 rounded-full blur-2xl" />

      <div className="relative grid grid-cols-1 md:grid-cols-2 gap-[24px] md:gap-[32px] items-center">
        {/* Level Info */}
        <div>
          <p className="font-['Source_Sans_3:Bold',sans-serif] font-bold text-white/90 text-[11px] md:text-[12px] tracking-[1.2px] uppercase leading-[16px] mb-[8px]">
            ESTATUTO ACTUAL
          </p>
          <h3 className="font-['IBM_Plex_Sans:Bold',sans-serif] font-bold text-white text-[28px] md:text-[36px] lg:text-[42px] tracking-[-0.84px] leading-[34px] md:leading-[42px] lg:leading-[48px] mb-[12px]" style={{ fontVariationSettings: "'wdth' 100" }}>
            Nível {level.current}: {level.name}
          </h3>
          <p className="font-['Source_Sans_3:Regular',sans-serif] font-normal text-white/80 text-[15px] md:text-[16px] leading-[24px]">
            {level.points} pontos académicos • {level.nextLevel - level.points} pontos até ao próximo nível
          </p>
        </div>

        {/* Progress */}
        <div>
          <div className="flex items-end justify-between mb-[12px]">
            <span className="font-['Source_Sans_3:Medium',sans-serif] font-medium text-white/90 text-[13px] md:text-[14px]">
              Progresso
            </span>
            <span className="font-['Source_Sans_3:Bold',sans-serif] font-bold text-white text-[18px] md:text-[20px]">
              {level.progress}%
            </span>
          </div>
          <div className="bg-white/25 h-[12px] md:h-[14px] rounded-full overflow-hidden backdrop-blur-sm">
            <div
              className="bg-gradient-to-r from-[#4ade80] to-[#22c55e] h-full rounded-full transition-all duration-700 shadow-lg"
              style={{ width: `${level.progress}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

function FeaturedQuizCard({ quiz, onClick }: { quiz: any; onClick: () => void }) {
  const difficultyColors: Record<string, string> = {
    'Básico': '#22c55e',
    'Intermédio': '#d4a574',
    'Avançado': '#6b0119'
  };

  return (
    <div
      onClick={onClick}
      className="bg-white rounded-[8px] md:rounded-[12px] overflow-hidden border border-[rgba(222,191,191,0.1)] hover:border-[rgba(107,1,25,0.3)] hover:shadow-xl transition-all cursor-pointer group"
    >
      <div className="p-[28px] md:p-[32px] lg:p-[36px]">
        {/* Module */}
        <div className="flex items-center justify-between mb-[16px]">
          <p className="font-['Source_Sans_3:Bold',sans-serif] font-bold text-[#904a44] text-[10px] md:text-[11px] tracking-[1.2px] uppercase leading-[16px]">
            {quiz.module}
          </p>
          {quiz.completed && (
            <div className="bg-[#22c55e] px-[10px] py-[4px] rounded-[4px]">
              <span className="font-['Source_Sans_3:Bold',sans-serif] font-bold text-white text-[10px] tracking-[0.8px] uppercase">
                Concluído
              </span>
            </div>
          )}
        </div>

        {/* Title */}
        <h3 className="font-['IBM_Plex_Sans:Bold',sans-serif] font-bold text-[#1b1c1b] text-[22px] md:text-[26px] lg:text-[28px] tracking-[-0.6px] leading-[30px] md:leading-[34px] lg:leading-[36px] mb-[12px] group-hover:text-[#6b0119] transition-colors" style={{ fontVariationSettings: "'wdth' 100" }}>
          {quiz.title}
        </h3>

        {/* Description */}
        <p className="font-['Source_Sans_3:Regular',sans-serif] font-normal text-[#59413e] text-[15px] md:text-[16px] leading-[24px] md:leading-[26px] mb-[24px]">
          {quiz.description}
        </p>

        {/* Meta */}
        <div className="flex flex-wrap items-center gap-[16px] md:gap-[20px] mb-[24px] pb-[24px] border-b border-[rgba(224,191,187,0.2)]">
          <div className="flex items-center gap-[8px]">
            <div className="w-[6px] h-[6px] rounded-full" style={{ backgroundColor: difficultyColors[quiz.difficulty] }} />
            <span className="font-['Source_Sans_3:Medium',sans-serif] font-medium text-[#574142] text-[13px] md:text-[14px]">
              {quiz.difficulty}
            </span>
          </div>
          <span className="font-['Source_Sans_3:Regular',sans-serif] font-normal text-[#94a3b8] text-[13px] md:text-[14px]">
            {quiz.questions} perguntas
          </span>
          <span className="font-['Source_Sans_3:Bold',sans-serif] font-bold text-[#d4a574] text-[13px] md:text-[14px]">
            +{quiz.points} pts
          </span>
        </div>

        {/* Button */}
        <button className="bg-[#6b0119] w-full px-[24px] py-[14px] md:py-[16px] rounded-[8px] group-hover:bg-[#8b1e2d] transition-colors flex items-center justify-center gap-[8px]">
          <span className="font-['Source_Sans_3:Bold',sans-serif] font-bold text-white text-[15px] md:text-[16px]">
            {quiz.completed ? 'Rever Questionário' : 'Iniciar Questionário'}
          </span>
          <svg className="w-[14px] h-[14px]" fill="white" viewBox="0 0 16 16">
            <path d="M10.0704 5.96094L5.53516 10.4961L4.62891 9.58984L7.84766 6.37109H0.0703125V5.05078H7.84766L4.62891 1.83203L5.53516 0.925781L10.0704 5.46094V5.96094Z" />
          </svg>
        </button>
      </div>
    </div>
  );
}

function QuizCard({ quiz, onClick }: { quiz: any; onClick: () => void }) {
  const difficultyColors: Record<string, string> = {
    'Básico': '#22c55e',
    'Intermédio': '#d4a574',
    'Avançado': '#6b0119'
  };

  return (
    <div
      onClick={onClick}
      className="bg-white rounded-[6px] md:rounded-[8px] p-[24px] md:p-[28px] border border-[rgba(222,191,187,0.1)] hover:border-[rgba(107,1,25,0.3)] hover:shadow-lg transition-all cursor-pointer group relative overflow-hidden"
    >
      {quiz.completed && (
        <div className="absolute top-[12px] right-[12px]">
          <div className="bg-[#22c55e] w-[24px] h-[24px] rounded-full flex items-center justify-center">
            <svg className="w-[14px] h-[14px]" fill="white" viewBox="0 0 16 16">
              <path d="M13.5 3.5L6 11L2.5 7.5L3.5 6.5L6 9L12.5 2.5L13.5 3.5Z" />
            </svg>
          </div>
        </div>
      )}

      <p className="font-['Source_Sans_3:Bold',sans-serif] font-bold text-[#904a44] text-[10px] tracking-[1px] uppercase leading-[14px] mb-[12px]">
        {quiz.module}
      </p>

      <h3 className="font-['IBM_Plex_Sans:Bold',sans-serif] font-bold text-[#121c2a] text-[18px] md:text-[20px] tracking-[-0.4px] leading-[26px] md:leading-[28px] mb-[16px] group-hover:text-[#6b0119] transition-colors" style={{ fontVariationSettings: "'wdth' 100" }}>
        {quiz.title}
      </h3>

      <div className="flex flex-wrap items-center gap-[12px] mb-[16px]">
        <div className="flex items-center gap-[6px]">
          <div className="w-[6px] h-[6px] rounded-full" style={{ backgroundColor: difficultyColors[quiz.difficulty] }} />
          <span className="font-['Source_Sans_3:Medium',sans-serif] font-medium text-[#574142] text-[12px]">
            {quiz.difficulty}
          </span>
        </div>
        <span className="font-['Source_Sans_3:Regular',sans-serif] font-normal text-[#94a3b8] text-[12px]">
          {quiz.questions} perguntas
        </span>
      </div>

      <div className="flex items-center justify-between pt-[16px] border-t border-[rgba(224,191,187,0.1)]">
        <span className="font-['Source_Sans_3:Bold',sans-serif] font-bold text-[#d4a574] text-[14px]">
          +{quiz.points} pts
        </span>
        <svg className="w-[12px] h-[12px] group-hover:translate-x-[4px] transition-transform" fill="#6b0119" viewBox="0 0 10.5 10.5">
          <path d="M10.0704 5.96094L5.53516 10.4961L4.62891 9.58984L7.84766 6.37109H0.0703125V5.05078H7.84766L4.62891 1.83203L5.53516 0.925781L10.0704 5.46094V5.96094Z" />
        </svg>
      </div>
    </div>
  );
}