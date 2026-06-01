import React, { useState, useRef } from 'react';
import { ArrowLeft, Plus, MessageCircle, Eye, ChevronDown, ChevronLeft, ChevronRight, Lock, Globe, Search, Menu, MoreVertical, X } from 'lucide-react';
import BottomNav from './BottomNav';

interface CommunityProps {
  onNavigate?: (destination: 'dashboard' | 'content' | 'community' | 'quiz' | 'profile') => void;
  onCreateTopic?: () => void;
  onViewTopic?: () => void;
  isLoggedIn?: boolean;
  onBack?: () => void;
}

type FilterType = 'all' | 'monetary' | 'agribusiness' | 'oil' | 'infrastructure';

interface Discussion {
  id: string;
  author: string;
  authorInitials: string;
  time: string;
  title: string;
  description: string;
  replies: number;
  views: string;
  isPinned?: boolean;
  isPrivate?: boolean;
  isActive?: boolean;
}

const discussions: Discussion[] = [
  {
    id: '1',
    author: 'Artur Mendes',
    authorInitials: 'AM',
    time: '2h atrás',
    title: 'O impacto da desvalorização do Kwanza nas rotas comerciais transfronteiriças',
    description: 'Análise profunda sobre como as recentes flutuações cambiais estão redefinindo o…',
    replies: 42,
    views: '1.2k',
    isPinned: true,
    isPrivate: false,
    isActive: true
  },
  {
    id: '2',
    author: 'Catarina Neto',
    authorInitials: 'CN',
    time: 'Ontem',
    title: 'Revisitando o sistema económico do Reino do Kongo: Lições para hoje?',
    description: 'Poderia a centralização comercial do antigo reino oferecer insights sobre a diversificação económica que Angola procura atualmente? Debate aberto sobre modelos históricos.',
    replies: 128,
    views: '3.5k',
    isPrivate: false,
    isActive: true
  },
  {
    id: '3',
    author: 'João Diogo',
    authorInitials: 'JD',
    time: '3 dias atrás',
    title: 'A ferrovia de Benguela: Um corredor de esperança ou apenas história?',
    description: 'Discutindo a viabilidade económica da revitalização do Corredor do Lobito e seu pap…',
    replies: 18,
    views: '890',
    isPrivate: true,
    isActive: false
  }
];

export default function Community({ onNavigate, onCreateTopic, onViewTopic, isLoggedIn = false, onBack }: CommunityProps) {
  const [selectedFilter, setSelectedFilter] = useState<FilterType>('all');
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showDotsMenu, setShowDotsMenu] = useState(false);
  const [showHamburgerMenu, setShowHamburgerMenu] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const scrollLeft = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: -200, behavior: 'smooth' });
    }
  };

  const scrollRight = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: 200, behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-[#F8F9FF]">
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
      <div className="backdrop-blur-md bg-white/85 border-b border-[#E5E7EB] px-6 py-4 sticky top-0 z-20">
        {showSearch ? (
          <div className="flex items-center gap-3">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Pesquisar discussões..."
              autoFocus
              className="flex-1 px-4 py-2 bg-[#F5F5F5] rounded-lg font-['Source_Sans_3'] text-[15px] text-[#1F2937] placeholder:text-[#9CA3AF] focus:outline-none focus:ring-2 focus:ring-[#8B1E2D]"
            />
            <button onClick={() => { setShowSearch(false); setSearchQuery(''); }} className="p-2 hover:bg-[#F5F5F5] rounded-lg transition-colors">
              <X className="w-5 h-5 text-[#8B1E2D]" />
            </button>
          </div>
        ) : (
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button onClick={onBack} className="text-[#8B1E2D] hover:bg-[#FDF3F4] p-1 rounded-lg transition-colors">
                <ArrowLeft className="w-5 h-5" />
              </button>
              <h1 className="font-['IBM_Plex_Sans'] font-bold text-[18px] text-[#8B1E2D] tracking-[-0.45px]">
                Economia com História
              </h1>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={() => setShowSearch(true)} className="p-2 hover:bg-[#FDF3F4] rounded-lg transition-colors">
                <Search className="w-5 h-5 text-[#8B1E2D]" />
              </button>
              <div className="relative">
                <button onClick={() => setShowHamburgerMenu(!showHamburgerMenu)} className="p-2 hover:bg-[#FDF3F4] rounded-lg transition-colors">
                  <Menu className="w-5 h-5 text-[#8B1E2D]" />
                </button>
                {showHamburgerMenu && (
                  <>
                    <div className="fixed inset-0 z-10" onClick={() => setShowHamburgerMenu(false)}></div>
                    <div className="absolute right-0 top-12 w-56 bg-white rounded-xl shadow-lg border border-[#E5E7EB] overflow-hidden animate-[fadeIn_0.2s_ease-out] z-20">
                      <button onClick={() => setShowHamburgerMenu(false)} className="w-full px-4 py-3 text-left hover:bg-[#F5F5F5] transition-colors font-['Source_Sans_3'] text-[15px] text-[#1F2937]">
                        Filtros avançados
                      </button>
                      <button onClick={() => setShowHamburgerMenu(false)} className="w-full px-4 py-3 text-left hover:bg-[#F5F5F5] transition-colors font-['Source_Sans_3'] text-[15px] text-[#1F2937]">
                        Meus tópicos
                      </button>
                      <button onClick={() => setShowHamburgerMenu(false)} className="w-full px-4 py-3 text-left hover:bg-[#F5F5F5] transition-colors font-['Source_Sans_3'] text-[15px] text-[#1F2937]">
                        Guardados
                      </button>
                      <div className="border-t border-[#E5E7EB]"></div>
                      <button onClick={() => setShowHamburgerMenu(false)} className="w-full px-4 py-3 text-left hover:bg-[#F5F5F5] transition-colors font-['Source_Sans_3'] text-[15px] text-[#1F2937]">
                        Configurações
                      </button>
                    </div>
                  </>
                )}
              </div>
              <div className="relative">
                <button onClick={() => setShowDotsMenu(!showDotsMenu)} className="p-2 hover:bg-[#FDF3F4] rounded-lg transition-colors">
                  <MoreVertical className="w-5 h-5 text-[#8B1E2D]" />
                </button>
                {showDotsMenu && (
                  <>
                    <div className="fixed inset-0 z-10" onClick={() => setShowDotsMenu(false)}></div>
                    <div className="absolute right-0 top-12 w-48 bg-white rounded-xl shadow-lg border border-[#E5E7EB] overflow-hidden animate-[fadeIn_0.2s_ease-out] z-20">
                      <button onClick={() => setShowDotsMenu(false)} className="w-full px-4 py-3 text-left hover:bg-[#F5F5F5] transition-colors font-['Source_Sans_3'] text-[15px] text-[#1F2937]">
                        Partilhar
                      </button>
                      <button onClick={() => setShowDotsMenu(false)} className="w-full px-4 py-3 text-left hover:bg-[#F5F5F5] transition-colors font-['Source_Sans_3'] text-[15px] text-[#1F2937]">
                        Reportar
                      </button>
                      <button onClick={() => setShowDotsMenu(false)} className="w-full px-4 py-3 text-left hover:bg-[#F5F5F5] transition-colors font-['Source_Sans_3'] text-[15px] text-[#1F2937]">
                        Ajuda
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Main Content */}
      <div className="px-6 pt-12 pb-28">
        {/* Editorial Header */}
        <div className="mb-10">
          <p className="font-['Source_Sans_3'] font-bold text-[10px] text-[#8B1E2D] tracking-[1px] uppercase mb-4">
            ARQUIVO DIGITAL DE IDEIAS
          </p>
          <h2 className="font-['IBM_Plex_Sans'] font-bold text-[36px] text-[#8B1E2D] leading-[45px] mb-4">
            Comunidade
          </h2>
          <p className="font-['Source_Sans_3'] text-[18px] text-[#574142] leading-[29.25px] mb-6">
            Um espaço académico dedicado ao debate sobre a evolução das estruturas económicas angolanas, do período pré-colonial às reformas contemporâneas.
          </p>
          <button
            onClick={onCreateTopic}
            className="flex items-center gap-3 px-8 py-3 bg-[#8B1E2D] text-white rounded-lg shadow-[0px_20px_25px_-5px_rgba(139,30,45,0.15),0px_8px_10px_-6px_rgba(139,30,45,0.15)] hover:bg-[#A52535] active:scale-[0.98] transition-all"
          >
            <Plus className="w-5 h-5" />
            <span className="font-['Source_Sans_3'] font-bold text-[16px] leading-[24px]">
              Criar Tópico
            </span>
          </button>
        </div>

        {/* Filters */}
        <div className="mb-10 relative -mx-6 px-6">
          {/* Left Arrow */}
          <button
            onClick={scrollLeft}
            className="absolute left-0 top-1/2 -translate-y-1/2 z-10 w-10 h-20 bg-gradient-to-r from-[#F8F9FF] to-transparent flex items-center justify-start pl-2 opacity-30 hover:opacity-60 transition-opacity"
            aria-label="Scroll left"
          >
            <ChevronLeft className="w-6 h-6 text-[#1F2937]" />
          </button>

          {/* Scrollable Container */}
          <div
            ref={scrollContainerRef}
            className="overflow-x-auto hide-scrollbar"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            <div className="flex gap-2 pb-4">
              <button
                onClick={() => setSelectedFilter('all')}
                className={`flex-shrink-0 px-5 py-4 rounded-xl font-['Source_Sans_3'] font-bold text-[14px] leading-[20px] transition-all ${
                  selectedFilter === 'all'
                    ? 'bg-[#8B1E2D] text-white shadow-md'
                    : 'bg-[#EFF4FF] text-[#574142]'
                }`}
              >
                Tudo
              </button>
              <button
                onClick={() => setSelectedFilter('monetary')}
                className={`flex-shrink-0 px-5 py-3 rounded-xl font-['Source_Sans_3'] font-bold text-[14px] leading-[20px] whitespace-nowrap transition-all ${
                  selectedFilter === 'monetary'
                    ? 'bg-[#8B1E2D] text-white shadow-md'
                    : 'bg-[#EFF4FF] text-[#574142]'
                }`}
              >
                História<br/>Monetária
              </button>
              <button
                onClick={() => setSelectedFilter('agribusiness')}
                className={`flex-shrink-0 px-5 py-4 rounded-xl font-['Source_Sans_3'] font-bold text-[14px] leading-[20px] transition-all ${
                  selectedFilter === 'agribusiness'
                    ? 'bg-[#8B1E2D] text-white shadow-md'
                    : 'bg-[#EFF4FF] text-[#574142]'
                }`}
              >
                Agronegócio
              </button>
              <button
                onClick={() => setSelectedFilter('oil')}
                className={`flex-shrink-0 px-5 py-2 rounded-xl font-['Source_Sans_3'] font-bold text-[14px] leading-[20px] whitespace-nowrap transition-all ${
                  selectedFilter === 'oil'
                    ? 'bg-[#8B1E2D] text-white shadow-md'
                    : 'bg-[#EFF4FF] text-[#574142]'
                }`}
              >
                Petróleo<br/>e<br/>Reforma
              </button>
              <button
                onClick={() => setSelectedFilter('infrastructure')}
                className={`flex-shrink-0 px-5 py-4 rounded-xl font-['Source_Sans_3'] font-bold text-[14px] leading-[20px] transition-all ${
                  selectedFilter === 'infrastructure'
                    ? 'bg-[#8B1E2D] text-white shadow-md'
                    : 'bg-[#EFF4FF] text-[#574142]'
                }`}
              >
                Infraestrutura
              </button>
            </div>
          </div>

          {/* Right Arrow */}
          <button
            onClick={scrollRight}
            className="absolute right-0 top-1/2 -translate-y-1/2 z-10 w-10 h-20 bg-gradient-to-l from-[#F8F9FF] to-transparent flex items-center justify-end pr-2 opacity-30 hover:opacity-60 transition-opacity"
            aria-label="Scroll right"
          >
            <ChevronRight className="w-6 h-6 text-[#1F2937]" />
          </button>
        </div>

        {/* Discussions List */}
        <div className="space-y-10">
          {discussions.map((discussion, index) => (
            <div
              key={discussion.id}
              onClick={onViewTopic}
              style={{ animationDelay: `${index * 100}ms` }}
              className="bg-white rounded-2xl p-6 shadow-sm border border-[#E5E7EB] hover:shadow-lg hover:border-[#8B1E2D]/30 hover:scale-[1.01] active:scale-[0.99] transition-all duration-300 cursor-pointer animate-[fadeInUp_0.5s_ease-out_forwards] opacity-0"
            >
              <div className="flex gap-6">
                {/* Avatar */}
                <div className="flex-shrink-0">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                    discussion.isPinned
                      ? 'bg-[#8B1E2D] text-white shadow-md'
                      : 'bg-[#D9E3F6] text-[#8B1E2D]'
                  }`}>
                    <span className="font-['Source_Sans_3'] font-bold text-[17px] leading-[24px]">
                      {discussion.authorInitials}
                    </span>
                  </div>
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  {/* Meta Info */}
                  <div className="flex items-center flex-wrap gap-2 mb-3">
                    {discussion.isPinned && (
                      <div className="bg-[rgba(139,30,45,0.08)] px-2.5 py-1 rounded-md">
                        <span className="font-['Source_Sans_3'] font-bold text-[10px] text-[#8B1E2D] tracking-[0.5px] uppercase leading-[15px]">
                          DESTAQUE
                        </span>
                      </div>
                    )}
                    {discussion.isActive && (
                      <div className="bg-[rgba(4,120,87,0.08)] px-2.5 py-1 rounded-md">
                        <span className="font-['Source_Sans_3'] font-bold text-[10px] text-[#047857] tracking-[0.5px] uppercase leading-[15px]">
                          A DECORRER
                        </span>
                      </div>
                    )}
                    <div className="flex items-center gap-1.5 bg-[#F5F5F5] px-2.5 py-1 rounded-md">
                      {discussion.isPrivate ? (
                        <Lock className="w-3 h-3 text-[#6B7280]" />
                      ) : (
                        <Globe className="w-3 h-3 text-[#6B7280]" />
                      )}
                      <span className="font-['Source_Sans_3'] font-semibold text-[11px] text-[#6B7280] leading-[16px]">
                        {discussion.isPrivate ? 'Privado' : 'Público'}
                      </span>
                    </div>
                  </div>

                  {/* Title */}
                  <h3 className="font-['IBM_Plex_Sans'] font-bold text-[22px] text-[#1F2937] leading-[30px] mb-2">
                    {discussion.title}
                  </h3>

                  {/* Description */}
                  <p className="font-['Source_Sans_3'] text-[15px] text-[#6B7280] leading-[24px] mb-4">
                    {discussion.description}
                  </p>

                  {/* Author and Stats */}
                  <div className="flex items-center flex-wrap gap-4 pt-3 border-t border-[#F3F4F6]">
                    <p className="font-['Source_Sans_3'] text-[12px] text-[#9CA3AF] leading-[16px]">
                      <span className="font-bold text-[#4B5563]">{discussion.author}</span> • {discussion.time}
                    </p>
                    <div className="flex items-center gap-4 ml-auto">
                      <div className="flex items-center gap-1.5">
                        <MessageCircle className="w-4 h-4 text-[#9CA3AF]" />
                        <span className="font-['Source_Sans_3'] font-bold text-[13px] text-[#6B7280] leading-[20px]">
                          {discussion.replies}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Eye className="w-4 h-4 text-[#9CA3AF]" />
                        <span className="font-['Source_Sans_3'] font-bold text-[13px] text-[#6B7280] leading-[20px]">
                          {discussion.views}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Load More */}
        <div className="flex flex-col items-center pt-16">
          <p className="font-['Source_Sans_3'] font-bold text-[10px] text-[#8B1E2D] tracking-[2px] uppercase text-center mb-2">
            VER MAIS ARQUIVOS
          </p>
          <button className="w-12 h-12 bg-[#EFF4FF] rounded-xl flex items-center justify-center hover:bg-[#DEE9FC] transition-colors">
            <ChevronDown className="w-3 h-3 text-[#1F2937]" />
          </button>
        </div>
      </div>

      {/* Bottom Navigation */}
      <BottomNav activeTab="community" onNavigate={onNavigate || (() => {})} isLoggedIn={isLoggedIn} />
    </div>
  );
}
