import React from 'react';
import { BookOpen, TrendingUp, MessageCircle, Trophy, ArrowRight, Flame, Clock, Video, Headphones, FileText, Zap, Target, Bell } from 'lucide-react';
import BottomNav from './BottomNav';

interface DashboardProps {
  userName?: string;
  onViewContent?: () => void;
  onViewJindungo?: () => void;
  onNavigate?: (destination: 'dashboard' | 'content' | 'community' | 'quiz' | 'profile') => void;
  onNotifications?: () => void;
  onResumeReading?: () => void;
  onViewArticle?: (type: 'jindungo' | 'micro') => void;
  onViewDebate?: () => void;
}

export default function Dashboard({ userName = 'Luís', onViewContent, onViewJindungo, onNavigate, onNotifications, onResumeReading, onViewArticle, onViewDebate }: DashboardProps) {
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

      {/* Header with greeting */}
      <header className="bg-white px-5 pt-6 pb-4 border-b border-[#E5E7EB]">
        <div className="flex items-center justify-between mb-1">
          <div>
            <p className="font-['Source_Sans_3'] text-[14px] text-[#9CA3AF]">
              Bom dia, {userName} 👋
            </p>
            <h1 className="font-['IBM_Plex_Sans'] font-bold text-[20px] text-[#1F2937] mt-1">
              Segunda, 14 de Julho
            </h1>
          </div>
          <button onClick={onNotifications} className="relative">
            <Bell className="w-6 h-6 text-[#4B5563]" />
            <div className="absolute -top-1 -right-1 w-5 h-5 bg-[#8B1E2D] text-white text-[11px] font-bold rounded-full flex items-center justify-center">
              3
            </div>
          </button>
        </div>
      </header>

      {/* Search Bar */}
      <div className="bg-white px-5 py-4 border-b border-[#E5E7EB]">
        <div className="relative">
          <input
            type="text"
            placeholder="Pesquisar conteúdos, tópicos..."
            onFocus={onViewContent}
            className="w-full h-12 pl-12 pr-4 bg-[#F5F5F5] rounded-full font-['Source_Sans_3'] text-[16px] text-[#1F2937] placeholder:text-[#9CA3AF] focus:outline-none focus:ring-2 focus:ring-[#8B1E2D]"
          />
          <div className="absolute left-4 top-1/2 -translate-y-1/2">
            <svg className="w-5 h-5 text-[#8B1E2D]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="pb-24">

        {/* Continue Learning */}
        <section className="px-5 py-6 bg-white border-b border-[#E5E7EB]">
          <h2 className="font-['IBM_Plex_Sans'] font-bold text-[11px] text-[#9CA3AF] uppercase tracking-[0.12em] mb-4">
            Continuar a Aprender
          </h2>
          <div className="relative rounded-xl overflow-hidden animate-[scaleIn_0.5s_ease-out]">
            <div
              className="absolute inset-0 bg-cover bg-center"
              style={{
                backgroundImage: 'url(https://images.unsplash.com/photo-1541888946425-d81bb19240f5?w=800&q=80)'
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/70 to-black/50" />

            <div className="relative p-4 flex gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex gap-2 mb-2">
                  <span className="px-3 py-1 bg-[#FFFBEB] text-[#92400E] rounded-full text-[11px] font-medium">
                    Intermédio
                  </span>
                </div>
                <h3 className="font-['IBM_Plex_Sans'] font-bold text-[18px] text-white line-clamp-2 mb-3">
                  A Economia do Petróleo em Angola
                </h3>
                <div className="mb-4">
                  <div className="h-2 bg-white/20 rounded-full overflow-hidden backdrop-blur-sm">
                    <div className="h-full bg-[#16A34A] rounded-full" style={{ width: '60%' }}></div>
                  </div>
                  <p className="font-['Source_Sans_3'] text-[13px] text-white/80 mt-2">
                    Capítulo 3 de 5 · <span className="font-semibold text-white">60% concluído</span>
                  </p>
                </div>
                <button onClick={onResumeReading} className="px-5 py-2.5 bg-white text-[#8B1E2D] rounded-lg font-['Source_Sans_3'] font-bold text-[15px] hover:bg-[#F5F5F5] active:scale-[0.98] transition-all shadow-lg flex items-center gap-2">
                  Retomar leitura
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Jindungo - Hot Content */}
        <section className="px-5 py-6 bg-white border-b border-[#E5E7EB]">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Flame className="w-5 h-5 text-[#DC2626]" />
              <h2 className="font-['IBM_Plex_Sans'] font-bold text-[18px] text-[#1F2937]">
                JINDUNGO
              </h2>
            </div>
            <button onClick={onViewContent} className="text-[#DC2626] text-[14px] font-['Source_Sans_3'] font-semibold flex items-center gap-1">
              Ver todos
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
          <p className="font-['Source_Sans_3'] text-[14px] text-[#4B5563] mb-4">
            Temas polémicos e debates actuais sobre economia angolana
          </p>

          <div className="space-y-3">
            {/* Jindungo Item 1 */}
            <button onClick={onViewJindungo} className="relative rounded-xl overflow-hidden border-2 border-[#DC2626] w-full text-left hover:shadow-lg hover:scale-[1.01] active:scale-[0.99] transition-all duration-300">
              <div
                className="absolute inset-0 bg-cover bg-center"
                style={{
                  backgroundImage: 'url(https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=800&q=80)'
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/80 to-black/90" />

              <div className="relative p-4">
                <div className="flex items-start gap-3 mb-3">
                  <div className="w-10 h-10 bg-[#DC2626] rounded-full flex items-center justify-center flex-shrink-0">
                    <Flame className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="px-3 py-1 bg-[#DC2626] text-white rounded-full text-[11px] font-bold uppercase tracking-wide">
                        🔥 Jindungo
                      </span>
                    </div>
                    <h3 className="font-['IBM_Plex_Sans'] font-bold text-[18px] text-white leading-tight mb-3">
                      Dívida Externa: Angola pode sair da dependência do FMI?
                    </h3>
                    <p className="font-['Source_Sans_3'] text-[15px] text-white/90 line-clamp-2 mb-4">
                      Análise crítica sobre as negociações com o Fundo Monetário Internacional e os impactos nas políticas económicas nacionais
                    </p>
                    <div className="flex items-center gap-4 text-[12px] text-white/80 mb-4">
                      <span>📖 15 min</span>
                      <span>💬 89 comentários</span>
                      <span className="px-2 py-0.5 bg-[#DC2626] text-white rounded-full font-semibold">
                        Trending
                      </span>
                    </div>
                    <div className="flex gap-2">
                      <span className="px-3 py-1 bg-white/20 backdrop-blur-sm text-white border border-white/30 rounded-full text-[11px] font-medium">
                        Avançado
                      </span>
                      <span className="px-3 py-1 bg-white/20 backdrop-blur-sm text-white border border-white/30 rounded-full text-[11px] font-medium">
                        Economia
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </button>

            {/* Jindungo Item 2 */}
            <button onClick={onViewJindungo} className="relative rounded-xl overflow-hidden border-2 border-[#D97706] w-full text-left hover:shadow-lg hover:scale-[1.01] active:scale-[0.99] transition-all duration-300">
              <div
                className="absolute inset-0 bg-cover bg-center"
                style={{
                  backgroundImage: 'url(https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800&q=80)'
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/80 to-black/90" />

              <div className="relative p-4">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-[#D97706] rounded-full flex items-center justify-center flex-shrink-0">
                    <Flame className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="px-3 py-1 bg-[#D97706] text-white rounded-full text-[11px] font-bold uppercase tracking-wide">
                        🔥 Jindungo
                      </span>
                    </div>
                    <h3 className="font-['IBM_Plex_Sans'] font-bold text-[18px] text-white leading-tight mb-3">
                      Privatizações: Progresso ou retrocesso económico?
                    </h3>
                    <p className="font-['Source_Sans_3'] text-[15px] text-white/90 line-clamp-2 mb-4">
                      O debate sobre a privatização de empresas estatais e o impacto na economia nacional
                    </p>
                    <div className="flex items-center gap-4 text-[12px] text-white/80 mb-4">
                      <span>📖 12 min</span>
                      <span>💬 67 comentários</span>
                    </div>
                    <div className="flex gap-2">
                      <span className="px-3 py-1 bg-white/20 backdrop-blur-sm text-white border border-white/30 rounded-full text-[11px] font-medium">
                        Intermédio
                      </span>
                      <span className="px-3 py-1 bg-white/20 backdrop-blur-sm text-white border border-white/30 rounded-full text-[11px] font-medium">
                        Política
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </button>

            {/* Jindungo Item 3 */}
            <button onClick={onViewJindungo} className="relative rounded-xl overflow-hidden border-2 border-[#8B1E2D] w-full text-left hover:shadow-lg hover:scale-[1.01] active:scale-[0.99] transition-all duration-300">
              <div
                className="absolute inset-0 bg-cover bg-center"
                style={{
                  backgroundImage: 'url(https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=800&q=80)'
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/80 to-black/90" />

              <div className="relative p-4">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-[#8B1E2D] rounded-full flex items-center justify-center flex-shrink-0">
                    <Flame className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="px-3 py-1 bg-[#8B1E2D] text-white rounded-full text-[11px] font-bold uppercase tracking-wide">
                        🔥 Jindungo
                      </span>
                    </div>
                    <h3 className="font-['IBM_Plex_Sans'] font-bold text-[18px] text-white leading-tight mb-3">
                      Agricultura vs Petróleo: É possível diversificar a economia?
                    </h3>
                    <p className="font-['Source_Sans_3'] text-[15px] text-white/90 line-clamp-2 mb-4">
                      Debate sobre as políticas de diversificação económica e o abandono do sector agrícola em Angola
                    </p>
                    <div className="flex items-center gap-4 text-[12px] text-white/80 mb-4">
                      <span>📖 18 min</span>
                      <span>💬 102 comentários</span>
                    </div>
                    <div className="flex gap-2">
                      <span className="px-3 py-1 bg-white/20 backdrop-blur-sm text-white border border-white/30 rounded-full text-[11px] font-medium">
                        Intermédio
                      </span>
                      <span className="px-3 py-1 bg-white/20 backdrop-blur-sm text-white border border-white/30 rounded-full text-[11px] font-medium">
                        Desenvolvimento
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </button>
          </div>

          <button onClick={onViewContent} className="w-full mt-4 py-3 bg-gradient-to-r from-[#DC2626] to-[#8B1E2D] text-white rounded-lg font-['Source_Sans_3'] font-bold text-[14px] flex items-center justify-center gap-2 hover:from-[#B91C1C] hover:to-[#6D1522] active:scale-[0.98] transition-all shadow-md">
            <Flame className="w-4 h-4" />
            Explorar mais Jindungo
          </button>
        </section>

        {/* Micro Textos - Quick Reads */}
        <section className="px-5 py-6 bg-white border-b border-[#E5E7EB]">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Zap className="w-5 h-5 text-[#8B1E2D]" />
              <h2 className="font-['IBM_Plex_Sans'] font-bold text-[11px] text-[#9CA3AF] uppercase tracking-[0.12em]">
                Micro Textos
              </h2>
            </div>
            <button onClick={onViewContent} className="text-[#8B1E2D] text-[14px] font-['Source_Sans_3'] flex items-center gap-1">
              Ver todos
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
          <p className="font-['Source_Sans_3'] text-[14px] text-[#4B5563] mb-4">
            Leituras rápidas de 2-5 minutos
          </p>

          <div className="space-y-3">
            {/* Micro Card 1 */}
            <button onClick={() => onViewArticle?.('micro')} className="relative rounded-lg overflow-hidden border border-[#E5E7EB] w-full text-left hover:shadow-md hover:border-[#8B1E2D]/30 hover:scale-[1.01] active:scale-[0.99] transition-all duration-300">
              <div
                className="absolute inset-0 bg-cover bg-center"
                style={{
                  backgroundImage: 'url(https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=800&q=80)'
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-r from-white/95 via-white/90 to-white/70" />

              <div className="relative p-4">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-[#8B1E2D]/10 rounded-full flex items-center justify-center flex-shrink-0">
                    <Clock className="w-4 h-4 text-[#8B1E2D]" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="px-2 py-0.5 bg-[#8B1E2D] text-white rounded-full text-[10px] font-bold uppercase">
                        Novo
                      </span>
                      <span className="text-[11px] text-[#9CA3AF]">⏱ 3 min</span>
                    </div>
                    <h3 className="font-['IBM_Plex_Sans'] font-bold text-[16px] text-[#1F2937] mb-2 leading-tight">
                      O que foi o Acordo de Bicesse?
                    </h3>
                    <p className="font-['Source_Sans_3'] text-[14px] text-[#4B5563] mb-2 line-clamp-2">
                      Resumo histórico do acordo de paz assinado em 1991 e seu impacto económico em Angola
                    </p>
                    <div className="flex items-center gap-3 text-[11px] text-[#9CA3AF]">
                      <span>📅 Publicado hoje</span>
                      <span>•</span>
                      <span>História</span>
                    </div>
                  </div>
                </div>
              </div>
            </button>

            {/* Micro Card 2 */}
            <button onClick={() => onViewArticle?.('micro')} className="relative rounded-lg overflow-hidden border border-[#E5E7EB] w-full text-left hover:shadow-md hover:border-[#8B1E2D]/30 hover:scale-[1.01] active:scale-[0.99] transition-all duration-300">
              <div
                className="absolute inset-0 bg-cover bg-center"
                style={{
                  backgroundImage: 'url(https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=800&q=80)'
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-r from-white/95 via-white/90 to-white/70" />

              <div className="relative p-4">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-[#16A34A]/10 rounded-full flex items-center justify-center flex-shrink-0">
                    <Clock className="w-4 h-4 text-[#16A34A]" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="px-2 py-0.5 bg-[#16A34A] text-white rounded-full text-[10px] font-bold uppercase">
                        Popular
                      </span>
                      <span className="text-[11px] text-[#9CA3AF]">⏱ 2 min</span>
                    </div>
                    <h3 className="font-['IBM_Plex_Sans'] font-bold text-[16px] text-[#1F2937] mb-2 leading-tight">
                      Inflação no Kwanza: números actuais
                    </h3>
                    <p className="font-['Source_Sans_3'] text-[14px] text-[#4B5563] mb-2 line-clamp-2">
                      Análise rápida da taxa de inflação e poder de compra em 2024
                    </p>
                    <div className="flex items-center gap-3 text-[11px] text-[#9CA3AF]">
                      <span>📅 Publicado ontem</span>
                      <span>•</span>
                      <span>Economia</span>
                    </div>
                  </div>
                </div>
              </div>
            </button>

            {/* Micro Card 3 */}
            <button onClick={() => onViewArticle?.('micro')} className="relative rounded-lg overflow-hidden border border-[#E5E7EB] w-full text-left hover:shadow-md hover:border-[#8B1E2D]/30 hover:scale-[1.01] active:scale-[0.99] transition-all duration-300">
              <div
                className="absolute inset-0 bg-cover bg-center"
                style={{
                  backgroundImage: 'url(https://images.unsplash.com/photo-1526304640581-d334cdbbf45e?w=800&q=80)'
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-r from-white/95 via-white/90 to-white/70" />

              <div className="relative p-4">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-[#3B82F6]/10 rounded-full flex items-center justify-center flex-shrink-0">
                    <Clock className="w-4 h-4 text-[#3B82F6]" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-[11px] text-[#9CA3AF]">⏱ 4 min</span>
                    </div>
                    <h3 className="font-['IBM_Plex_Sans'] font-bold text-[16px] text-[#1F2937] mb-2 leading-tight">
                      Sonangol: Breve história da empresa estatal
                    </h3>
                    <p className="font-['Source_Sans_3'] text-[14px] text-[#4B5563] mb-2 line-clamp-2">
                      Da criação em 1976 até hoje: evolução e papel na economia nacional
                    </p>
                    <div className="flex items-center gap-3 text-[11px] text-[#9CA3AF]">
                      <span>📅 Há 2 dias</span>
                      <span>•</span>
                      <span>Petróleo</span>
                    </div>
                  </div>
                </div>
              </div>
            </button>
          </div>

          <button onClick={onViewContent} className="w-full mt-4 py-3 bg-white border-2 border-[#E5E7EB] text-[#4B5563] rounded-lg font-['Source_Sans_3'] font-semibold text-[14px] flex items-center justify-center gap-2 hover:border-[#8B1E2D] hover:text-[#8B1E2D] hover:bg-[#FDF3F4] active:scale-[0.98] transition-all">
            <Zap className="w-4 h-4" />
            Ver todos os micro textos
          </button>
        </section>

        {/* Content by Type */}
        <section className="px-5 py-6 bg-white border-b border-[#E5E7EB]">
          <h2 className="font-['IBM_Plex_Sans'] font-bold text-[11px] text-[#9CA3AF] uppercase tracking-[0.12em] mb-4">
            Explorar por Formato
          </h2>

          <div className="grid grid-cols-2 gap-3">
            {/* Videos */}
            <button onClick={onViewContent} className="bg-gradient-to-br from-[#EFF6FF] to-white border-2 border-[#3B82F6] rounded-xl p-4 text-left hover:shadow-md hover:scale-[1.02] active:scale-[0.98] transition-all duration-300">
              <Video className="w-8 h-8 text-[#3B82F6] mb-2" />
              <h3 className="font-['IBM_Plex_Sans'] font-bold text-[14px] text-[#1F2937] mb-1">
                Vídeos
              </h3>
              <p className="font-['Source_Sans_3'] text-[12px] text-[#4B5563] mb-2">
                Aulas em vídeo
              </p>
              <p className="font-['Source_Sans_3'] text-[11px] text-[#3B82F6] font-semibold">
                24 disponíveis
              </p>
            </button>

            {/* Audio */}
            <button onClick={onViewContent} className="bg-gradient-to-br from-[#F0FDF4] to-white border-2 border-[#16A34A] rounded-xl p-4 text-left hover:shadow-md hover:scale-[1.02] active:scale-[0.98] transition-all duration-300">
              <Headphones className="w-8 h-8 text-[#16A34A] mb-2" />
              <h3 className="font-['IBM_Plex_Sans'] font-bold text-[14px] text-[#1F2937] mb-1">
                Áudio
              </h3>
              <p className="font-['Source_Sans_3'] text-[12px] text-[#4B5563] mb-2">
                Podcasts e narração
              </p>
              <p className="font-['Source_Sans_3'] text-[11px] text-[#16A34A] font-semibold">
                18 disponíveis
              </p>
            </button>

            {/* Articles */}
            <button onClick={onViewContent} className="bg-gradient-to-br from-[#FDF3F4] to-white border-2 border-[#8B1E2D] rounded-xl p-4 text-left hover:shadow-md hover:scale-[1.02] active:scale-[0.98] transition-all duration-300">
              <FileText className="w-8 h-8 text-[#8B1E2D] mb-2" />
              <h3 className="font-['IBM_Plex_Sans'] font-bold text-[14px] text-[#1F2937] mb-1">
                Artigos
              </h3>
              <p className="font-['Source_Sans_3'] text-[12px] text-[#4B5563] mb-2">
                Textos académicos
              </p>
              <p className="font-['Source_Sans_3'] text-[11px] text-[#8B1E2D] font-semibold">
                148 disponíveis
              </p>
            </button>

            {/* Series */}
            <button onClick={onViewContent} className="bg-gradient-to-br from-[#FFFBEB] to-white border-2 border-[#D97706] rounded-xl p-4 text-left hover:shadow-md hover:scale-[1.02] active:scale-[0.98] transition-all duration-300">
              <Target className="w-8 h-8 text-[#D97706] mb-2" />
              <h3 className="font-['IBM_Plex_Sans'] font-bold text-[14px] text-[#1F2937] mb-1">
                Séries
              </h3>
              <p className="font-['Source_Sans_3'] text-[12px] text-[#4B5563] mb-2">
                Conteúdo sequencial
              </p>
              <p className="font-['Source_Sans_3'] text-[11px] text-[#D97706] font-semibold">
                12 séries
              </p>
            </button>
          </div>
        </section>

        {/* Recent Articles */}
        <section className="px-5 py-6 bg-white border-b border-[#E5E7EB]">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-['IBM_Plex_Sans'] font-bold text-[11px] text-[#9CA3AF] uppercase tracking-[0.12em]">
              Artigos Recentes
            </h2>
            <button onClick={onViewContent} className="text-[#8B1E2D] text-[14px] font-['Source_Sans_3'] flex items-center gap-1">
              Ver todos
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          <div className="space-y-3">
            <button onClick={() => onViewArticle?.('jindungo')} className="bg-[#F5F5F5] rounded-xl p-4 border border-[#E5E7EB] w-full text-left hover:shadow-md hover:border-[#8B1E2D]/30 hover:scale-[1.01] active:scale-[0.99] transition-all duration-300">
              <div className="flex gap-3">
                <img
                  src="https://images.unsplash.com/photo-1526304640581-d334cdbbf45e?w=200&q=80"
                  alt="Independência"
                  className="w-24 h-24 rounded-lg object-cover flex-shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex gap-2 mb-2">
                    <span className="px-2 py-0.5 bg-[#EFF6FF] text-[#1E40AF] rounded-full text-[11px] font-medium">
                      Introdução
                    </span>
                    <span className="px-2 py-0.5 bg-[#F5F5F5] text-[#4B5563] rounded-full text-[11px] font-medium">
                      História
                    </span>
                  </div>
                  <h3 className="font-['IBM_Plex_Sans'] font-semibold text-[15px] text-[#1F2937] leading-tight line-clamp-2 mb-2">
                    Independência e Reconstrução Económica (1975–1985)
                  </h3>
                  <p className="font-['Source_Sans_3'] text-[12px] text-[#9CA3AF]">
                    8 min de leitura · Publicado hoje
                  </p>
                </div>
              </div>
            </button>

            <button onClick={() => onViewArticle?.('jindungo')} className="bg-[#F5F5F5] rounded-xl p-4 border border-[#E5E7EB] w-full text-left hover:shadow-md hover:border-[#8B1E2D]/30 hover:scale-[1.01] active:scale-[0.99] transition-all duration-300">
              <div className="flex gap-3">
                <img
                  src="https://images.unsplash.com/photo-1559526324-4b87b5e36e44?w=200&q=80"
                  alt="Agricultura"
                  className="w-24 h-24 rounded-lg object-cover flex-shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex gap-2 mb-2">
                    <span className="px-2 py-0.5 bg-[#FFFBEB] text-[#92400E] rounded-full text-[11px] font-medium">
                      Intermédio
                    </span>
                    <span className="px-2 py-0.5 bg-[#F5F5F5] text-[#4B5563] rounded-full text-[11px] font-medium">
                      Economia
                    </span>
                  </div>
                  <h3 className="font-['IBM_Plex_Sans'] font-semibold text-[15px] text-[#1F2937] leading-tight line-clamp-2 mb-2">
                    Agricultura Angolana: Do Colonialismo ao Abandono
                  </h3>
                  <p className="font-['Source_Sans_3'] text-[12px] text-[#9CA3AF]">
                    16 min de leitura · Ontem
                  </p>
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
            <button onClick={onViewDebate} className="border-l-4 border-[#8B1E2D] pl-3 bg-[#FDF3F4] p-3 rounded-r-lg w-full text-left hover:shadow-md hover:scale-[1.01] active:scale-[0.99] transition-all duration-300">
              <h3 className="font-['IBM_Plex_Sans'] font-semibold text-[15px] text-[#1F2937] mb-2 leading-tight">
                O petróleo foi uma bênção ou uma maldição para Angola?
              </h3>
              <div className="flex items-center gap-3 text-[12px] text-[#9CA3AF]">
                <span>💬 47 respostas</span>
                <span>•</span>
                <span>Activo há 2h</span>
              </div>
            </button>

            <button onClick={onViewDebate} className="border-l-4 border-[#D1D5DB] pl-3 bg-[#F5F5F5] p-3 rounded-r-lg w-full text-left hover:shadow-md hover:scale-[1.01] active:scale-[0.99] transition-all duration-300">
              <h3 className="font-['IBM_Plex_Sans'] font-semibold text-[15px] text-[#1F2937] mb-2 leading-tight">
                China e Angola: parceria estratégica ou dependência?
              </h3>
              <div className="flex items-center gap-3 text-[12px] text-[#9CA3AF]">
                <span>💬 34 respostas</span>
                <span>•</span>
                <span>Activo há 4h</span>
              </div>
            </button>
          </div>
        </section>

        {/* Ranking */}
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

          <button className="w-full py-4 bg-[#F5F5F5] text-[#4B5563] rounded-xl font-['Source_Sans_3'] font-bold text-[15px] hover:bg-[#E5E7EB] hover:text-[#8B1E2D] active:scale-[0.98] transition-all flex items-center justify-center gap-2">
            Ver ranking completo
            <ArrowRight className="w-5 h-5" />
          </button>
        </section>
      </main>

      {/* Bottom Navigation */}
      {onNavigate && <BottomNav activeTab="home" onNavigate={onNavigate} isLoggedIn={true} />}
    </div>
  );
}
