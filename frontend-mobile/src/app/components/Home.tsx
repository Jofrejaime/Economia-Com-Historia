import React from 'react';
import { BookOpen, TrendingUp, MessageCircle, Trophy, ArrowRight, Flame } from 'lucide-react';

interface HomeProps {
  onLogin: () => void;
  onRegister: () => void;
  onViewJindungo?: () => void;
  onViewArticle?: () => void;
  onViewPodcast?: () => void;
  onViewCommunity?: () => void;
  onViewContent?: () => void;
  onViewQuiz?: () => void;
}

export default function Home({ onLogin, onRegister, onViewJindungo, onViewArticle, onViewPodcast, onViewCommunity, onViewContent, onViewQuiz }: HomeProps) {
  return (
    <div className="min-h-screen bg-[#F5F5F5]">
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
      <header className="bg-[#8B1E2D] px-5 pt-8 pb-6">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
            <BookOpen className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="font-['IBM_Plex_Sans'] font-bold text-[22px] text-white leading-tight">
              Economia com História
            </h1>
            <p className="font-['IBM_Plex_Sans'] text-[14px] text-white/70">Angola</p>
          </div>
        </div>
        <p className="font-['Source_Sans_3'] text-[16px] text-white/90 leading-relaxed mt-4">
          Aprende a história económica do teu país com conteúdo académico sério e acessível
        </p>
      </header>

      {/* Main Content */}
      <main className="pb-20">

        {/* Featured Content - Jindungo Section */}
        <section className="px-5 py-6 bg-white border-b border-[#E5E7EB]">
          <div className="flex items-center gap-2 mb-4">
            <Flame className="w-5 h-5 text-[#DC2626]" />
            <h2 className="font-['IBM_Plex_Sans'] font-bold text-[18px] text-[#1F2937] uppercase tracking-wider">
              Em Destaque
            </h2>
          </div>

          <div className="bg-gradient-to-br from-[#FDF3F4] to-white border-2 border-[#8B1E2D] rounded-xl overflow-hidden shadow-sm">
            <div className="relative h-48">
              <img
                src="https://images.unsplash.com/photo-1541888946425-d81bb19240f5?w=800&q=80"
                alt="Petróleo Angola"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
              <div className="absolute top-3 left-3 flex gap-2">
                <span className="px-3 py-1 bg-[#FFFBEB] text-[#92400E] rounded-full text-[11px] font-medium">
                  Intermédio
                </span>
                <span className="px-3 py-1 bg-[#8B1E2D] text-white rounded-full text-[11px] font-medium flex items-center gap-1">
                  <Flame className="w-3 h-3" />
                  JINDUNGO
                </span>
              </div>
              <div className="absolute bottom-0 left-0 right-0 p-4">
                <h3 className="font-['IBM_Plex_Sans'] font-bold text-[18px] text-white leading-tight mb-2">
                  A Economia do Petróleo em Angola: Riqueza, Dependência e Perspectivas
                </h3>
                <p className="font-['Source_Sans_3'] text-[14px] text-white/90 line-clamp-2">
                  Como a descoberta do petróleo transformou a estrutura económica de Angola e quais os desafios actuais
                </p>
              </div>
            </div>
            <div className="p-4 flex items-center justify-between">
              <div className="flex items-center gap-4 text-[12px] text-[#4B5563]">
                <span>📖 12 min de leitura</span>
                <span>🎥 1 vídeo</span>
              </div>
              <button onClick={onViewJindungo} className="px-4 py-2 bg-[#8B1E2D] text-white rounded-lg font-['Source_Sans_3'] font-semibold text-[14px] flex items-center gap-2 hover:bg-[#A52535] transition-colors">
                Ler
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </section>

        {/* More Content */}
        <section className="px-5 py-6 bg-white border-b border-[#E5E7EB]">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-['IBM_Plex_Sans'] font-bold text-[11px] text-[#9CA3AF] uppercase tracking-[0.12em]">
              Conteúdos Recentes
            </h2>
            <button onClick={onLogin} className="text-[#8B1E2D] text-[14px] font-['Source_Sans_3'] flex items-center gap-1">
              Ver todos
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          <div className="space-y-3">
            {/* Content Card 1 */}
            <button onClick={onViewArticle} className="bg-[#F5F5F5] rounded-xl p-4 border border-[#E5E7EB] w-full text-left hover:bg-[#E5E7EB] transition-colors">
              <div className="flex gap-3">
                <img
                  src="https://images.unsplash.com/photo-1526304640581-d334cdbbf45e?w=200&q=80"
                  alt="Independência"
                  className="w-20 h-20 rounded-lg object-cover flex-shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex gap-2 mb-2">
                    <span className="px-2 py-0.5 bg-[#EFF6FF] text-[#1E40AF] rounded-full text-[11px] font-medium">
                      Introdução
                    </span>
                  </div>
                  <h3 className="font-['IBM_Plex_Sans'] font-semibold text-[14px] text-[#1F2937] leading-tight line-clamp-2 mb-1">
                    Independência e Reconstrução Económica (1975–1985)
                  </h3>
                  <p className="text-[12px] text-[#9CA3AF]">8 min de leitura</p>
                </div>
              </div>
            </button>

            {/* Content Card 2 */}
            <button onClick={onViewPodcast} className="bg-[#F5F5F5] rounded-xl p-4 border border-[#E5E7EB] w-full text-left hover:bg-[#E5E7EB] transition-colors">
              <div className="flex gap-3">
                <img
                  src="https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=200&q=80"
                  alt="Kwanza"
                  className="w-20 h-20 rounded-lg object-cover flex-shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex gap-2 mb-2">
                    <span className="px-2 py-0.5 bg-[#FFFBEB] text-[#92400E] rounded-full text-[11px] font-medium">
                      Intermédio
                    </span>
                  </div>
                  <h3 className="font-['IBM_Plex_Sans'] font-semibold text-[14px] text-[#1F2937] leading-tight line-clamp-2 mb-1">
                    Kwanza: História e Desafios da Moeda Nacional
                  </h3>
                  <p className="text-[12px] text-[#9CA3AF]">14 min · áudio disponível</p>
                </div>
              </div>
            </button>
          </div>
        </section>

        {/* Active Debates */}
        <section className="px-5 py-6 bg-white border-b border-[#E5E7EB]">
          <div className="flex items-center gap-2 mb-4">
            <MessageCircle className="w-5 h-5 text-[#8B1E2D]" />
            <h2 className="font-['IBM_Plex_Sans'] font-bold text-[11px] text-[#9CA3AF] uppercase tracking-[0.12em]">
              Debates Activos
            </h2>
          </div>

          <div className="space-y-3">
            <div className="border-l-3 border-[#8B1E2D] pl-3">
              <h3 className="font-['IBM_Plex_Sans'] font-semibold text-[15px] text-[#1F2937] mb-2 leading-tight">
                O petróleo foi uma bênção ou uma maldição para Angola?
              </h3>
              <div className="flex items-center gap-3 text-[12px] text-[#9CA3AF]">
                <span>💬 47 respostas</span>
                <span>•</span>
                <span>Activo há 2h</span>
              </div>
            </div>

            <div className="border-l-3 border-[#D1D5DB] pl-3">
              <h3 className="font-['IBM_Plex_Sans'] font-semibold text-[15px] text-[#1F2937] mb-2 leading-tight">
                Kwanza e inflação: podemos aprender com o passado?
              </h3>
              <div className="flex items-center gap-3 text-[12px] text-[#9CA3AF]">
                <span>💬 11 respostas</span>
                <span>•</span>
                <span>Activo há 1 dia</span>
              </div>
            </div>
          </div>

          <button onClick={onLogin} className="w-full mt-4 py-3 border-2 border-[#E5E7EB] text-[#4B5563] rounded-lg font-['Source_Sans_3'] font-semibold text-[14px] hover:border-[#8B1E2D] hover:text-[#8B1E2D] transition-colors">
            Ver todos os debates
          </button>
        </section>

        {/* Top Ranking */}
        <section className="px-5 py-6 bg-white border-b border-[#E5E7EB]">
          <h2 className="font-['IBM_Plex_Sans'] font-bold text-[28px] text-[#1F2937] mb-6">
            Ranking
          </h2>

          <div className="space-y-3 mb-5">
            {/* 1st Place */}
            <div className="bg-gradient-to-r from-[#8B1E2D] to-[#A52535] rounded-2xl p-4 shadow-md">
              <div className="flex items-center gap-4">
                <div className="flex items-center justify-center w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl">
                  <span className="font-['IBM_Plex_Sans'] font-bold text-[20px] text-white">#1</span>
                </div>
                <div className="w-14 h-14 bg-white rounded-full flex items-center justify-center text-[24px] shadow-lg">
                  👤
                </div>
                <div className="flex-1">
                  <p className="font-['IBM_Plex_Sans'] font-bold text-[16px] text-white">Ana Domingos</p>
                  <p className="font-['Source_Sans_3'] text-[13px] text-white/80">Estudante de Economia</p>
                </div>
                <div className="text-right">
                  <p className="font-['IBM_Plex_Sans'] font-bold text-[20px] text-white">980</p>
                  <p className="font-['Source_Sans_3'] text-[11px] text-white/70">pontos</p>
                </div>
              </div>
            </div>

            {/* 2nd Place */}
            <div className="bg-[#F5F5F5] rounded-2xl p-4 border-l-4 border-[#9CA3AF] shadow-sm">
              <div className="flex items-center gap-4">
                <div className="flex items-center justify-center w-12 h-12 bg-[#E5E7EB] rounded-xl">
                  <span className="font-['IBM_Plex_Sans'] font-bold text-[18px] text-[#6B7280]">#2</span>
                </div>
                <div className="w-14 h-14 bg-[#D9E3F6] rounded-full flex items-center justify-center">
                  <span className="font-['Source_Sans_3'] font-bold text-[18px] text-[#8B1E2D]">CN</span>
                </div>
                <div className="flex-1">
                  <p className="font-['IBM_Plex_Sans'] font-bold text-[16px] text-[#1F2937]">Carlos Neto</p>
                  <p className="font-['Source_Sans_3'] text-[13px] text-[#6B7280]">Professor</p>
                </div>
                <div className="text-right">
                  <p className="font-['IBM_Plex_Sans'] font-bold text-[20px] text-[#4B5563]">870</p>
                  <p className="font-['Source_Sans_3'] text-[11px] text-[#9CA3AF]">pontos</p>
                </div>
              </div>
            </div>

            {/* 3rd Place */}
            <div className="bg-[#F5F5F5] rounded-2xl p-4 border-l-4 border-[#D1D5DB] shadow-sm">
              <div className="flex items-center gap-4">
                <div className="flex items-center justify-center w-12 h-12 bg-[#E5E7EB] rounded-xl">
                  <span className="font-['IBM_Plex_Sans'] font-bold text-[18px] text-[#6B7280]">#3</span>
                </div>
                <div className="w-14 h-14 bg-[#D9E3F6] rounded-full flex items-center justify-center">
                  <span className="font-['Source_Sans_3'] font-bold text-[18px] text-[#8B1E2D]">LF</span>
                </div>
                <div className="flex-1">
                  <p className="font-['IBM_Plex_Sans'] font-bold text-[16px] text-[#1F2937]">Luís Ferreira</p>
                  <p className="font-['Source_Sans_3'] text-[13px] text-[#6B7280]">Estudante</p>
                </div>
                <div className="text-right">
                  <p className="font-['IBM_Plex_Sans'] font-bold text-[20px] text-[#4B5563]">760</p>
                  <p className="font-['Source_Sans_3'] text-[11px] text-[#9CA3AF]">pontos</p>
                </div>
              </div>
            </div>

            {/* 4th Place */}
            <div className="bg-white rounded-2xl p-4 border border-[#E5E7EB]">
              <div className="flex items-center gap-4">
                <div className="flex items-center justify-center w-12 h-12 bg-[#F5F5F5] rounded-xl">
                  <span className="font-['IBM_Plex_Sans'] font-bold text-[18px] text-[#9CA3AF]">#4</span>
                </div>
                <div className="w-14 h-14 bg-[#D9E3F6] rounded-full flex items-center justify-center">
                  <span className="font-['Source_Sans_3'] font-bold text-[18px] text-[#8B1E2D]">MS</span>
                </div>
                <div className="flex-1">
                  <p className="font-['IBM_Plex_Sans'] font-bold text-[16px] text-[#1F2937]">Maria Santos</p>
                  <p className="font-['Source_Sans_3'] text-[13px] text-[#6B7280]">Investigadora</p>
                </div>
                <div className="text-right">
                  <p className="font-['IBM_Plex_Sans'] font-bold text-[20px] text-[#6B7280]">650</p>
                  <p className="font-['Source_Sans_3'] text-[11px] text-[#9CA3AF]">pontos</p>
                </div>
              </div>
            </div>

            {/* 5th Place */}
            <div className="bg-white rounded-2xl p-4 border border-[#E5E7EB]">
              <div className="flex items-center gap-4">
                <div className="flex items-center justify-center w-12 h-12 bg-[#F5F5F5] rounded-xl">
                  <span className="font-['IBM_Plex_Sans'] font-bold text-[18px] text-[#9CA3AF]">#5</span>
                </div>
                <div className="w-14 h-14 bg-[#D9E3F6] rounded-full flex items-center justify-center">
                  <span className="font-['Source_Sans_3'] font-bold text-[18px] text-[#8B1E2D]">JM</span>
                </div>
                <div className="flex-1">
                  <p className="font-['IBM_Plex_Sans'] font-bold text-[16px] text-[#1F2937]">João Mendes</p>
                  <p className="font-['Source_Sans_3'] text-[13px] text-[#6B7280]">Analista</p>
                </div>
                <div className="text-right">
                  <p className="font-['IBM_Plex_Sans'] font-bold text-[20px] text-[#6B7280]">580</p>
                  <p className="font-['Source_Sans_3'] text-[11px] text-[#9CA3AF]">pontos</p>
                </div>
              </div>
            </div>
          </div>

          <button onClick={onLogin} className="w-full py-4 bg-[#F5F5F5] text-[#4B5563] rounded-xl font-['Source_Sans_3'] font-bold text-[15px] hover:bg-[#E5E7EB] transition-colors flex items-center justify-center gap-2">
            Ver ranking completo
            <ArrowRight className="w-5 h-5" />
          </button>
        </section>

        {/* CTA Section */}
        <section className="px-5 py-8 bg-gradient-to-br from-[#8B1E2D] to-[#6D1522] text-white">
          <div className="text-center">
            <h2 className="font-['IBM_Plex_Sans'] font-bold text-[22px] mb-3 leading-tight">
              Pronto para aprender?
            </h2>
            <p className="font-['Source_Sans_3'] text-[16px] text-white/90 mb-6 leading-relaxed">
              Cria a tua conta e começa a explorar a história económica de Angola
            </p>
            <button
              onClick={onRegister}
              className="w-full py-4 bg-white text-[#8B1E2D] rounded-lg font-['Source_Sans_3'] font-bold text-[16px] mb-3 hover:bg-[#F5F5F5] active:scale-[0.98] transition-all shadow-lg hover:shadow-xl"
            >
              Criar conta
            </button>
            <button
              onClick={onLogin}
              className="w-full py-4 bg-transparent border-2 border-white text-white rounded-lg font-['Source_Sans_3'] font-semibold text-[16px] hover:bg-white/10 active:scale-[0.98] transition-all"
            >
              Já tenho conta · Entrar
            </button>
          </div>
        </section>
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 h-20 bg-white border-t border-[#E5E7EB] px-5">
        <div className="flex items-center justify-around h-full">
          <button className="flex flex-col items-center gap-1 text-[#8B1E2D]">
            <BookOpen className="w-6 h-6" />
            <span className="text-[11px] font-['Source_Sans_3'] font-bold">Início</span>
            <div className="w-1 h-1 rounded-full bg-[#8B1E2D]" />
          </button>

          <button onClick={onViewContent} className="flex flex-col items-center gap-1 text-[#9CA3AF]">
            <TrendingUp className="w-6 h-6" />
            <span className="text-[11px] font-['Source_Sans_3']">Conteúdos</span>
          </button>

          <button onClick={onViewCommunity} className="flex flex-col items-center gap-1 text-[#9CA3AF]">
            <MessageCircle className="w-6 h-6" />
            <span className="text-[11px] font-['Source_Sans_3']">Comunidade</span>
          </button>

          <button onClick={onViewQuiz} className="flex flex-col items-center gap-1 text-[#9CA3AF]">
            <Trophy className="w-6 h-6" />
            <span className="text-[11px] font-['Source_Sans_3']">Quiz</span>
          </button>
        </div>
      </nav>
    </div>
  );
}
