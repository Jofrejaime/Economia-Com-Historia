import { useState } from 'react';
import { useNavigate } from 'react-router';
import { Heart, ArrowRight } from 'lucide-react';
import SystemHeader from '../components/SystemHeader';
import SystemFooter from '../components/SystemFooter';
import CategoryCard from '../components/CategoryCard';
import svgPaths from '../../imports/ComunidadeAcademicaDesktop-1/svg-90hhnwtu0o';
import catImg1 from '../../imports/SectionMainContentGrid/ed182b00277857e41c8f8aff96230df9ff2965f8.png';
import catImg2 from '../../imports/SectionMainContentGrid/720d549295f5ffea8f208f4906c2ade1055adcc4.png';
import catImg3 from '../../imports/SectionMainContentGrid/b27df40c0e6cc1052d5cef4496804ad8ad301914.png';
import catImg4 from '../../imports/SectionMainContentGrid/6b013c56324876776a0921dba0cff24f36e76b22.png';

type TabType = 'recent' | 'popular' | 'pinned';

export default function CommunityHome() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<TabType>('recent');

  const discussions = [
    {
      id: 1,
      author: 'Jofre Jaime',
      authorInitials: 'JJ',
      avatar: '#8b1e2d',
      category: 'ANÁLISE DE POLÍTICAS',
      categoryColor: { bg: '#acf0e0', text: '#003a32' },
      timeAgo: 'há 2 horas',
      title: 'Análise da Reforma Monetária de 1976: A Transição do Kwanza',
      excerpt: 'Procuro fontes primárias sobre a logística da troca de moeda em 1976 nas províncias do leste. O arquivo contém contagens regionais específicas de Moxico?',
      replies: 12,
      views: 487,
      likes: 23,
      isPinned: false,
    },
    {
      id: 2,
      author: 'Ana Correia',
      authorInitials: 'AC',
      avatar: '#6b0119',
      category: 'ROTAS COMERCIAIS',
      categoryColor: { bg: '#ffd6a5', text: '#4a2c00' },
      timeAgo: 'há 5 horas',
      title: 'Impacto das Linhas de Crédito Garantidas por Petróleo (1990-2000)',
      excerpt: 'Estou a investigar como as linhas de crédito garantidas por petróleo moldaram a política económica durante a década de 90. Existem relatórios do BNA sobre este período?',
      replies: 8,
      views: 234,
      likes: 15,
      isPinned: true,
    },
    {
      id: 3,
      author: 'Manuel Santos',
      authorInitials: 'MS',
      avatar: '#8b1e2d',
      category: 'HISTÓRIA FISCAL',
      categoryColor: { bg: '#d4c5f9', text: '#2d1b69' },
      timeAgo: 'há 8 horas',
      title: 'Documentos Fundadores do BNA e Política Fiscal Inicial',
      excerpt: 'Procuro documentação sobre a criação do Banco Nacional de Angola em 1975. Alguém tem acesso aos decretos originais?',
      replies: 18,
      views: 612,
      likes: 34,
      isPinned: false,
    },
    {
      id: 4,
      author: 'Isabel Fernandes',
      authorInitials: 'IF',
      avatar: '#6b0119',
      category: 'SISTEMA MONETÁRIO',
      categoryColor: { bg: '#ffb3ba', text: '#5c0011' },
      timeAgo: 'há 1 dia',
      title: 'Mudanças Monetárias Durante o Período de Transição (1982-1985)',
      excerpt: 'Estudo sobre as mudanças no sistema monetário angolano durante a transição económica. Que documentos recomendam para este período?',
      replies: 24,
      views: 891,
      likes: 42,
      isPinned: false,
    },
  ];

  const featuredResearches = [
    { date: '12 Mar 1975', title: 'Os documentos fundadores do BNA e a política fiscal inicial.' },
    { date: '08 Fev 1982', title: 'Mudanças monetárias durante o período de transição.' },
    { date: '22 Nov 1990', title: 'Linhas de crédito garantidas por petróleo: Uma análise histórica.' },
  ];

  const categories = [
    {
      id: 1,
      name: 'Análise de Políticas',
      description: 'Discussões sobre políticas económicas e fiscais',
      accessType: 'public' as const,
      members: 234,
      topics: 89,
      color: { bg: '#acf0e0', text: '#003a32' },
      backgroundImage: catImg1
    },
    {
      id: 2,
      name: 'Jindungo',
      description: 'Conteúdos exclusivos e análises aprofundadas',
      accessType: 'jindungo' as const,
      members: 156,
      topics: 45,
      color: { bg: '#ffd6a5', text: '#4a2c00' },
      backgroundImage: catImg2
    },
    {
      id: 3,
      name: 'Rotas Comerciais',
      description: 'História do comércio e redes económicas',
      accessType: 'public' as const,
      members: 189,
      topics: 67,
      color: { bg: '#ffd6a5', text: '#4a2c00' },
      backgroundImage: catImg3
    },
    {
      id: 4,
      name: 'Investigação Avançada',
      description: 'Pesquisas de doutoramento e publicações científicas',
      accessType: 'restricted' as const,
      members: 78,
      topics: 23,
      color: { bg: '#ffb3ba', text: '#5c0011' },
      backgroundImage: catImg4
    },
  ];

  const filteredDiscussions = discussions.filter(d => {
    if (activeTab === 'pinned') return d.isPinned;
    if (activeTab === 'popular') return d.views > 500;
    return true;
  });

  return (
    <div className="bg-[#f8f9ff] flex flex-col min-h-screen">
      <SystemHeader />

      <main className="flex-1 w-full">
        <div className="max-w-[1536px] mx-auto px-[24px] md:px-[32px] lg:px-[48px] py-[32px] md:py-[48px] lg:py-[64px]">
          {/* Hero Section */}
          <div className="flex flex-col lg:flex-row items-start lg:items-end justify-between gap-[24px] md:gap-[32px] mb-[48px] md:mb-[64px]">
            <div className="flex flex-col gap-[16px] md:gap-[20px] max-w-[672px]">
              <div className="font-['Source_Sans_3:Bold',sans-serif] font-bold text-[#6b0119] text-[11px] md:text-[12px] tracking-[1.1px] md:tracking-[1.2px] uppercase leading-[16px] md:leading-[16.5px]">
                FÓRUM & INTERCÂMBIO
              </div>
              <h1 className="font-['IBM_Plex_Sans:Bold',sans-serif] font-bold text-[#121c2a] text-[32px] md:text-[42px] lg:text-[48px] tracking-[-0.96px] leading-[38px] md:leading-[50px] lg:leading-[60px]" style={{ fontVariationSettings: "'wdth' 100" }}>
                Discurso Académico
              </h1>
              <p className="font-['Source_Sans_3:Regular',sans-serif] font-normal text-[#574142] text-[15px] md:text-[16px] lg:text-[18px] leading-[24px] md:leading-[26px] lg:leading-[28px]">
                Interaja com académicos e investigadores sobre a evolução histórica da economia angolana, rotas comerciais e sistemas monetários pós-coloniais.
              </p>
            </div>

            <button
              onClick={() => navigate('/comunidade/criar-topico')}
              className="bg-[#8b1e2d] drop-shadow-[0px_1px_1px_rgba(0,0,0,0.05)] flex gap-[12px] items-center px-[28px] md:px-[32px] py-[14px] md:py-[16px] rounded-[4px] cursor-pointer hover:bg-[#7a1a27] transition-colors w-full sm:w-auto justify-center"
            >
              <svg className="size-[18px] md:size-[20px]" fill="none" viewBox="0 0 20 20.025">
                <path d={svgPaths.p3d954600} fill="white" />
              </svg>
              <span className="font-['Source_Sans_3:Bold',sans-serif] font-bold text-white text-[15px] md:text-[16px] leading-[22px] md:leading-[24px]">
                Criar Tópico
              </span>
            </button>
          </div>

          {/* Categories Section */}
          <div className="mb-[48px] md:mb-[64px]">
            <div className="flex items-end justify-between mb-[24px] md:mb-[32px]">
              <div>
                <h2 className="font-['IBM_Plex_Sans:Bold',sans-serif] font-bold text-[#121c2a] text-[24px] md:text-[28px] lg:text-[32px] tracking-[-0.64px] leading-[32px] md:leading-[36px] lg:leading-[40px] mb-[8px]" style={{ fontVariationSettings: "'wdth' 100" }}>
                  Categorias de Acesso
                </h2>
                <p className="font-['Source_Sans_3:Regular',sans-serif] font-normal text-[#574142] text-[14px] md:text-[15px] leading-[21px] md:leading-[23px]">
                  Solicite acesso às categorias para participar em discussões especializadas
                </p>
              </div>
              <button
                onClick={() => navigate('/comunidade/categoria')}
                className="hidden sm:flex items-center gap-[8px] font-['Source_Sans_3:SemiBold',sans-serif] font-semibold text-[#6b0119] text-[14px] md:text-[15px] leading-[20px] md:leading-[22px] hover:gap-[12px] transition-all"
              >
                Ver todas
                <ArrowRight className="size-[16px]" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-[16px] md:gap-[20px] lg:gap-[24px]">
              {categories.map((category) => (
                <CategoryCard
                  key={category.id}
                  category={category}
                  onClick={() => navigate('/comunidade/categoria')}
                  showStats={true}
                />
              ))}
            </div>

            {/* Mobile "Ver todas" button */}
            <button
              onClick={() => navigate('/comunidade/categoria')}
              className="sm:hidden flex items-center gap-[8px] font-['Source_Sans_3:SemiBold',sans-serif] font-semibold text-[#6b0119] text-[14px] leading-[20px] mt-[20px] mx-auto"
            >
              Ver todas as categorias
              <ArrowRight className="size-[16px]" />
            </button>
          </div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-[32px] md:gap-[40px] lg:gap-[48px]">
            {/* Main Content - Discussions */}
            <div className="lg:col-span-9 order-2 lg:order-1">
              {/* Tabs and Sorting */}
              <div className="border-b border-[rgba(222,191,191,0.2)] pb-[16px] md:pb-[17px] mb-[24px] md:mb-[32px] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-[16px]">
                <div className="flex gap-[24px] md:gap-[32px] overflow-x-auto w-full sm:w-auto">
                  <button
                    onClick={() => setActiveTab('recent')}
                    className={`pb-[8px] md:pb-[10px] border-b-2 transition-all ${
                      activeTab === 'recent'
                        ? 'border-[#6b0119]'
                        : 'border-transparent'
                    }`}
                  >
                    <span className={`font-['Source_Sans_3:${activeTab === 'recent' ? 'Bold' : 'Medium'}',sans-serif] text-[13px] md:text-[14px] leading-[18px] md:leading-[20px] whitespace-nowrap ${
                      activeTab === 'recent' ? 'text-[#6b0119]' : 'text-[#574142]'
                    }`}>
                      Atividades Recentes
                    </span>
                  </button>
                  <button
                    onClick={() => setActiveTab('popular')}
                    className={`pb-[8px] md:pb-[10px] border-b-2 transition-all ${
                      activeTab === 'popular'
                        ? 'border-[#6b0119]'
                        : 'border-transparent'
                    }`}
                  >
                    <span className={`font-['Source_Sans_3:${activeTab === 'popular' ? 'Bold' : 'Medium'}',sans-serif] text-[13px] md:text-[14px] leading-[18px] md:leading-[20px] whitespace-nowrap ${
                      activeTab === 'popular' ? 'text-[#6b0119]' : 'text-[#574142]'
                    }`}>
                      Mais Discutidos
                    </span>
                  </button>
                  <button
                    onClick={() => setActiveTab('pinned')}
                    className={`pb-[8px] md:pb-[10px] border-b-2 transition-all ${
                      activeTab === 'pinned'
                        ? 'border-[#6b0119]'
                        : 'border-transparent'
                    }`}
                  >
                    <span className={`font-['Source_Sans_3:${activeTab === 'pinned' ? 'Bold' : 'Medium'}',sans-serif] text-[13px] md:text-[14px] leading-[18px] md:leading-[20px] whitespace-nowrap ${
                      activeTab === 'pinned' ? 'text-[#6b0119]' : 'text-[#574142]'
                    }`}>
                      Fixados
                    </span>
                  </button>
                </div>

                <div className="flex gap-[8px] items-center">
                  <span className="font-['Source_Sans_3:Bold',sans-serif] font-bold text-[#8b7171] text-[11px] md:text-[12px] tracking-[1.2px] uppercase leading-[16px] whitespace-nowrap">
                    ORDENAR POR: RECENTES
                  </span>
                  <svg className="size-[14px]" fill="none" viewBox="0 0 7 4.31667">
                    <path d={svgPaths.p1a9c9340} fill="#8B7171" />
                  </svg>
                </div>
              </div>

              {/* Discussions List */}
              <div className="flex flex-col gap-[20px] md:gap-[24px]">
                {filteredDiscussions.map((discussion) => (
                  <div
                    key={discussion.id}
                    onClick={() => navigate('/comunidade/discussao')}
                    className="bg-white rounded-[6px] md:rounded-[8px] p-[20px] md:p-[24px] lg:p-[28px] cursor-pointer hover:shadow-[0px_2px_8px_rgba(0,0,0,0.08)] transition-shadow"
                  >
                    <div className="flex gap-[16px] md:gap-[20px]">
                      {/* Avatar */}
                      <div
                        className="shrink-0 size-[40px] md:size-[48px] rounded-[4px] flex items-center justify-center"
                        style={{ backgroundColor: discussion.avatar }}
                      >
                        <span className="font-['Source_Sans_3:Bold',sans-serif] font-bold text-white text-[16px] md:text-[18px] leading-[24px] md:leading-[28px]">
                          {discussion.authorInitials}
                        </span>
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        {/* Meta */}
                        <div className="flex flex-wrap gap-[8px] md:gap-[12px] items-center mb-[8px] md:mb-[12px]">
                          <div
                            className="px-[6px] md:px-[8px] py-[2px] rounded-[2px]"
                            style={{ backgroundColor: discussion.categoryColor.bg }}
                          >
                            <span
                              className="font-['Source_Sans_3:Bold',sans-serif] font-bold text-[10px] md:text-[12px] tracking-[-0.6px] uppercase leading-[14px] md:leading-[16px]"
                              style={{ color: discussion.categoryColor.text }}
                            >
                              {discussion.category}
                            </span>
                          </div>
                          <span className="font-['Source_Sans_3:Italic',sans-serif] italic text-[#8b7171] text-[11px] md:text-[12px] leading-[15px] md:leading-[16px]">
                            por {discussion.author} • {discussion.timeAgo}
                          </span>
                          {discussion.isPinned && (
                            <svg className="size-[14px] md:size-[16px]" fill="none" viewBox="0 0 16.5 15.75">
                              <path d={svgPaths.pf8747d7} fill="#6b0119" />
                            </svg>
                          )}
                        </div>

                        {/* Title */}
                        <h3 className="font-['IBM_Plex_Sans:Bold',sans-serif] font-bold text-[#121c2a] text-[18px] md:text-[20px] lg:text-[24px] tracking-[-0.48px] leading-[24px] md:leading-[28px] lg:leading-[32px] mb-[8px] md:mb-[12px]" style={{ fontVariationSettings: "'wdth' 100" }}>
                          {discussion.title}
                        </h3>

                        {/* Excerpt */}
                        <p className="font-['Source_Sans_3:Regular',sans-serif] font-normal text-[#574142] text-[14px] md:text-[15px] lg:text-[16px] leading-[21px] md:leading-[23px] lg:leading-[24px] mb-[12px] md:mb-[16px] line-clamp-2">
                          {discussion.excerpt}
                        </p>

                        {/* Stats */}
                        <div className="flex gap-[16px] md:gap-[20px] lg:gap-[24px] flex-wrap">
                          <div className="flex gap-[6px] items-center">
                            <svg className="size-[14px] md:size-[15px]" fill="none" viewBox="0 0 15 15">
                              <path d={svgPaths.p7731200} fill="#8B7171" />
                            </svg>
                            <span className="font-['Source_Sans_3:Medium',sans-serif] font-medium text-[#8b7171] text-[12px] md:text-[13px] leading-[16px] md:leading-[18px]">
                              {discussion.replies} respostas
                            </span>
                          </div>
                          <div className="flex gap-[6px] items-center">
                            <svg className="size-[14px] md:size-[16px]" fill="none" viewBox="0 0 16.5 11.25">
                              <path d={svgPaths.p110cf380} fill="#8B7171" />
                            </svg>
                            <span className="font-['Source_Sans_3:Medium',sans-serif] font-medium text-[#8b7171] text-[12px] md:text-[13px] leading-[16px] md:leading-[18px]">
                              {discussion.views} visualizações
                            </span>
                          </div>
                          <div className="flex gap-[6px] items-center">
                            <Heart className="size-[14px] md:size-[15px] text-[#8B7171]" />
                            <span className="font-['Source_Sans_3:Medium',sans-serif] font-medium text-[#8b7171] text-[12px] md:text-[13px] leading-[16px] md:leading-[18px]">
                              {discussion.likes}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Sidebar */}
            <aside className="lg:col-span-3 order-1 lg:order-2">
              <div className="flex flex-col gap-[32px] md:gap-[40px] lg:gap-[48px] lg:sticky lg:top-[24px]">
                {/* Community Rules */}
                <div className="bg-[#eff4ff] rounded-[4px] p-[24px] md:p-[28px] lg:p-[32px]">
                  <h3 className="font-['IBM_Plex_Sans:Bold',sans-serif] font-bold text-[#6b0119] text-[11px] md:text-[12px] tracking-[1.2px] uppercase leading-[16px] mb-[20px] md:mb-[24px]" style={{ fontVariationSettings: "'wdth' 100" }}>
                    REGRAS DO ARQUIVO
                  </h3>
                  <div className="flex flex-col gap-[14px] md:gap-[16px]">
                    <div className="flex gap-[10px] md:gap-[12px] items-start">
                      <span className="font-['Source_Sans_3:Bold',sans-serif] font-bold text-[#6b0119] text-[13px] md:text-[14px] leading-[18px] md:leading-[20px] shrink-0">
                        01.
                      </span>
                      <p className="font-['Source_Sans_3:Regular',sans-serif] font-normal text-[#574142] text-[13px] md:text-[14px] leading-[18px] md:leading-[20px]">
                        Mantenha citações académicas onde aplicável.
                      </p>
                    </div>
                    <div className="flex gap-[10px] md:gap-[12px] items-start">
                      <span className="font-['Source_Sans_3:Bold',sans-serif] font-bold text-[#6b0119] text-[13px] md:text-[14px] leading-[18px] md:leading-[20px] shrink-0">
                        02.
                      </span>
                      <p className="font-['Source_Sans_3:Regular',sans-serif] font-normal text-[#574142] text-[13px] md:text-[14px] leading-[18px] md:leading-[20px]">
                        Foque em fontes primárias históricas e económicas.
                      </p>
                    </div>
                    <div className="flex gap-[10px] md:gap-[12px] items-start">
                      <span className="font-['Source_Sans_3:Bold',sans-serif] font-bold text-[#6b0119] text-[13px] md:text-[14px] leading-[18px] md:leading-[20px] shrink-0">
                        03.
                      </span>
                      <p className="font-['Source_Sans_3:Regular',sans-serif] font-normal text-[#574142] text-[13px] md:text-[14px] leading-[18px] md:leading-[20px]">
                        Respeite a propriedade intelectual do repositório.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Featured Researches */}
                <div>
                  <h3 className="font-['IBM_Plex_Sans:Bold',sans-serif] font-bold text-[#6b0119] text-[11px] md:text-[12px] tracking-[1.2px] uppercase leading-[16px] mb-[20px] md:mb-[24px]" style={{ fontVariationSettings: "'wdth' 100" }}>
                    PESQUISAS EM DESTAQUE
                  </h3>
                  <div className="flex flex-col gap-[20px] md:gap-[24px]">
                    {featuredResearches.map((research, index) => (
                      <button
                        key={index}
                        onClick={() => navigate('/comunidade/discussao')}
                        className="text-left hover:opacity-70 transition-opacity"
                      >
                        <div className="font-['Source_Sans_3:Regular',sans-serif] font-normal text-[#8b7171] text-[9px] md:text-[10px] leading-[13px] md:leading-[15px] mb-[3px] md:mb-[4px]">
                          {research.date}
                        </div>
                        <div className="font-['Source_Sans_3:Bold',sans-serif] font-bold text-[#121c2a] text-[14px] md:text-[16px] leading-[20px] md:leading-[22px]">
                          {research.title}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </aside>
          </div>
        </div>
      </main>

      <SystemFooter />
    </div>
  );
}
