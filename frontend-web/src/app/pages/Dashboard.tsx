import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router';
import { Lock, Flame, ChevronDown } from 'lucide-react';
import SystemHeader from '../components/SystemHeader';
import SystemFooter from '../components/SystemFooter';
import SectionMainContentGrid from '../../imports/SectionMainContentGrid/SectionMainContentGrid';
import svgPaths from '../../imports/Main/svg-n1klcw522z';

type Theme = string;
type Level = 'intro' | 'advanced' | 'doctorate';
type Format = string;
type AccessCategory = 'all' | 'public' | 'jindungo' | 'restricted';

export default function Dashboard() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedThemes, setSelectedThemes] = useState<Theme[]>(['Café e Agricultura']);
  const [selectedLevel, setSelectedLevel] = useState<Level>('advanced');
  const [selectedFormats, setSelectedFormats] = useState<Format[]>(['Revistas Estatísticas']);
  const [selectedAccessCategory, setSelectedAccessCategory] = useState<AccessCategory>('all');
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [showAccessDropdown, setShowAccessDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowAccessDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const themes = [
    'Infraestrutura Colonial',
    'Café e Agricultura',
    'Política Pós-Independência',
    'Mineração e Indústria Extrativa',
  ];

  const formats = [
    'Manuscritos',
    'Revistas Estatísticas',
    'Registos Fotográficos',
    'Correspondência Oficial',
  ];

  const toggleTheme = (theme: Theme) => {
    setSelectedThemes(prev =>
      prev.includes(theme) ? prev.filter(t => t !== theme) : [...prev, theme]
    );
  };

  const toggleFormat = (format: Format) => {
    setSelectedFormats(prev =>
      prev.includes(format) ? prev.filter(f => f !== format) : [...prev, format]
    );
  };

  return (
    <div className="bg-[#f8f9ff] flex flex-col min-h-screen">
      <SystemHeader />

      <main className="flex-1 w-full">
        <div className="max-w-[1536px] mx-auto px-[24px] md:px-[32px] lg:px-[48px] py-[24px] md:py-[32px] lg:py-[48px]">
          {/* Header with Search */}
          <div className="mb-[24px] md:mb-[32px] lg:mb-[40px]">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-[16px] md:gap-[24px] mb-[20px] md:mb-[24px]">
              <div>
                <h1 className="font-['IBM_Plex_Sans:Bold',sans-serif] font-bold text-[#6b0119] text-[28px] md:text-[36px] lg:text-[42px] tracking-[-0.84px] leading-[36px] md:leading-[44px] lg:leading-[50px] mb-[8px]" style={{ fontVariationSettings: "'wdth' 100" }}>
                  Arquivo de Conteúdos
                </h1>
                <p className="font-['Source_Sans_3:Regular',sans-serif] font-normal text-[#574142] text-[14px] md:text-[15px] lg:text-[16px] leading-[21px] md:leading-[23px] lg:leading-[26px]">
                  Explore a nossa colecção de documentos históricos e económicos
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-[12px] sm:gap-[16px]">
                {/* Create Content Button */}
                <button
                  onClick={() => navigate('/arquivo/criar')}
                  className="bg-[#8b1e2d] drop-shadow-[0px_1px_1px_rgba(0,0,0,0.05)] flex gap-[12px] items-center justify-center px-[24px] md:px-[28px] py-[12px] md:py-[14px] rounded-[4px] cursor-pointer hover:bg-[#7a1a27] transition-colors"
                >
                  <svg className="size-[18px] md:size-[20px]" fill="none" viewBox="0 0 20 20">
                    <path d="M10 4V16M4 10H16" stroke="white" strokeWidth="2" strokeLinecap="round"/>
                  </svg>
                  <span className="font-['Source_Sans_3:Bold',sans-serif] font-bold text-white text-[14px] md:text-[15px] leading-[20px] md:leading-[22px]">
                    Criar Conteúdo
                  </span>
                </button>

                {/* Mobile Filter Toggle */}
                <button
                  onClick={() => setShowMobileFilters(!showMobileFilters)}
                  className="lg:hidden bg-[#8b1e2d] px-[20px] py-[12px] rounded-[4px] font-['Source_Sans_3:SemiBold',sans-serif] font-semibold text-white text-[14px] leading-[20px] flex items-center gap-[8px] justify-center"
                >
                  <svg className="size-[16px]" fill="none" viewBox="0 0 16 16">
                    <path d="M2 3h12M2 8h8M2 13h12" stroke="white" strokeWidth="2" strokeLinecap="round"/>
                  </svg>
                  Filtros
                </button>
              </div>
            </div>

            {/* Search Bar */}
            <div className="relative">
              <div className="absolute left-[16px] md:left-[18px] top-1/2 -translate-y-1/2 pointer-events-none">
                <svg className="size-[18px] md:size-[20px]" fill="none" viewBox="0 0 24 26">
                  <path d="M24.6 26L18.3 19.7C17.8 20.1 17.225 20.4167 16.575 20.65C15.925 20.8833 15.2333 21 14.5 21C12.6833 21 11.1458 20.3708 9.8875 19.1125C8.62917 17.8542 8 16.3167 8 14.5C8 12.6833 8.62917 11.1458 9.8875 9.8875C11.1458 8.62917 12.6833 8 14.5 8C16.3167 8 17.8542 8.62917 19.1125 9.8875C20.3708 11.1458 21 12.6833 21 14.5C21 15.2333 20.8833 15.925 20.65 16.575C20.4167 17.225 20.1 17.8 19.7 18.3L26 24.6L24.6 26V26M14.5 19C15.75 19 16.8125 18.5625 17.6875 17.6875C18.5625 16.8125 19 15.75 19 14.5C19 13.25 18.5625 12.1875 17.6875 11.3125C16.8125 10.4375 15.75 10 14.5 10C13.25 10 12.1875 10.4375 11.3125 11.3125C10.4375 12.1875 10 13.25 10 14.5C10 15.75 10.4375 16.8125 11.3125 17.6875C12.1875 18.5625 13.25 19 14.5 19V19" fill="#8B7171"/>
                </svg>
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Pesquisar documentos, temas ou períodos históricos..."
                className="w-full pl-[48px] md:pl-[52px] pr-[16px] md:pr-[18px] py-[14px] md:py-[16px] bg-white rounded-[6px] md:rounded-[8px] border border-[rgba(226,232,240,0.8)] focus:border-[#6b0119] focus:shadow-[0px_2px_8px_rgba(107,1,25,0.1)] transition-all font-['Source_Sans_3:Regular',sans-serif] font-normal text-[#121c2a] text-[14px] md:text-[15px] outline-none"
              />
            </div>
          </div>

          {/* Main Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-[24px] md:gap-[32px] lg:gap-[48px]">
            {/* Filters Sidebar */}
            <aside className={`lg:col-span-3 ${showMobileFilters ? 'block' : 'hidden lg:block'}`}>
              <div className="bg-white rounded-[8px] md:rounded-[12px] p-[20px] md:p-[24px] lg:p-[28px] lg:sticky lg:top-[24px] overflow-visible">
                <h2 className="font-['IBM_Plex_Sans:Bold',sans-serif] font-bold text-[#6b0119] text-[11px] md:text-[12px] tracking-[2.4px] uppercase leading-[16px] mb-[24px] md:mb-[28px]" style={{ fontVariationSettings: "'wdth' 100" }}>
                  FILTROS DO ARQUIVO
                </h2>

                {/* Access Category Filter */}
                <div className="mb-[24px] md:mb-[28px]">
                  <h3 className="font-['IBM_Plex_Sans:Bold',sans-serif] font-bold text-[#121c2a] text-[13px] md:text-[14px] leading-[18px] md:leading-[20px] mb-[6px] md:mb-[8px]" style={{ fontVariationSettings: "'wdth' 100" }}>
                    Categoria de Acesso
                  </h3>
                  <p className="font-['Source_Sans_3:Regular',sans-serif] font-normal text-[#8b7171] text-[11px] md:text-[12px] leading-[15px] md:leading-[16px] mb-[10px] md:mb-[12px]">
                    Filtre por nível de permissão
                  </p>

                  <div ref={dropdownRef} className="relative">
                    <button
                      onClick={() => setShowAccessDropdown(!showAccessDropdown)}
                      className="w-full bg-white border border-[#debfbf] rounded-[6px] px-[14px] py-[12px] pr-[40px] font-['Source_Sans_3:Medium',sans-serif] font-medium text-[#121c2a] text-[13px] md:text-[14px] leading-[18px] md:leading-[20px] cursor-pointer hover:border-[#6b0119] focus:border-[#6b0119] focus:outline-none focus:ring-2 focus:ring-[rgba(107,1,25,0.1)] transition-all text-left flex items-center gap-[10px]"
                    >
                      {selectedAccessCategory === 'jindungo' && (
                        <Flame className="size-[16px] text-[#ff6b35] shrink-0" />
                      )}
                      {selectedAccessCategory === 'restricted' && (
                        <Lock className="size-[16px] text-[#6b0119] shrink-0" />
                      )}
                      <span className="flex-1">
                        {selectedAccessCategory === 'all' && 'Todos os Documentos'}
                        {selectedAccessCategory === 'public' && 'Documentos Públicos'}
                        {selectedAccessCategory === 'jindungo' && 'Jindungo'}
                        {selectedAccessCategory === 'restricted' && 'Conteúdos Restritos'}
                      </span>
                      <ChevronDown className={`size-[16px] text-[#8b7171] absolute right-[14px] transition-transform ${showAccessDropdown ? 'rotate-180' : ''}`} />
                    </button>

                    {showAccessDropdown && (
                      <>
                        <style>{`
                          @keyframes dropdownSlide {
                            from {
                              opacity: 0;
                              transform: translateY(-10px);
                            }
                            to {
                              opacity: 1;
                              transform: translateY(0);
                            }
                          }
                        `}</style>
                        <div
                          className="absolute top-[calc(100%+6px)] left-0 w-full bg-white border border-[#debfbf] rounded-[6px] shadow-[0px_4px_12px_rgba(0,0,0,0.1)] z-50 overflow-hidden"
                          style={{ animation: 'dropdownSlide 200ms ease-out forwards' }}
                        >
                        {[
                          { id: 'all' as AccessCategory, label: 'Todos os Documentos', icon: null },
                          { id: 'public' as AccessCategory, label: 'Documentos Públicos', icon: null },
                          {
                            id: 'jindungo' as AccessCategory,
                            label: 'Jindungo',
                            icon: <Flame className="size-[16px] text-[#ff6b35]" />,
                            badge: 'Privado',
                            badgeColor: '#ffd6a5',
                            badgeTextColor: '#4a2c00'
                          },
                          {
                            id: 'restricted' as AccessCategory,
                            label: 'Conteúdos Restritos',
                            icon: <Lock className="size-[16px] text-[#6b0119]" />,
                            badge: 'Privado',
                            badgeColor: '#ffb3ba',
                            badgeTextColor: '#5c0011'
                          },
                        ].map((option, index) => (
                          <button
                            key={option.id}
                            onClick={() => {
                              setSelectedAccessCategory(option.id);
                              setShowAccessDropdown(false);
                            }}
                            className={`w-full px-[14px] py-[12px] text-left flex items-center gap-[10px] transition-colors ${
                              selectedAccessCategory === option.id
                                ? 'bg-[#eff4ff] text-[#6b0119]'
                                : 'hover:bg-[#f8f9ff] text-[#121c2a]'
                            } ${index > 0 ? 'border-t border-[rgba(222,191,191,0.2)]' : ''}`}
                          >
                            {option.icon && <div className="shrink-0">{option.icon}</div>}
                            <span className="flex-1 font-['Source_Sans_3:Medium',sans-serif] font-medium text-[13px] md:text-[14px] leading-[18px] md:leading-[20px]">
                              {option.label}
                            </span>
                            {option.badge && (
                              <div
                                className="px-[6px] py-[2px] rounded-[3px] text-[9px] font-['Source_Sans_3:Bold',sans-serif] font-bold uppercase tracking-[0.5px] leading-[12px]"
                                style={{
                                  backgroundColor: option.badgeColor,
                                  color: option.badgeTextColor
                                }}
                              >
                                {option.badge}
                              </div>
                            )}
                          </button>
                        ))}
                        </div>
                      </>
                    )}
                  </div>
                </div>

                {/* Theme Filter */}
                <div className="mb-[24px] md:mb-[28px] pt-[20px] md:pt-[24px] border-t border-[rgba(222,191,191,0.2)]">
                  <h3 className="font-['IBM_Plex_Sans:Bold',sans-serif] font-bold text-[#121c2a] text-[13px] md:text-[14px] leading-[18px] md:leading-[20px] mb-[10px] md:mb-[12px]" style={{ fontVariationSettings: "'wdth' 100" }}>
                    Tema
                  </h3>
                  <div className="flex flex-col gap-[8px]">
                    {themes.map((theme) => (
                      <label
                        key={theme}
                        className="flex items-center gap-[12px] cursor-pointer group"
                      >
                        <div className="relative shrink-0">
                          <input
                            type="checkbox"
                            checked={selectedThemes.includes(theme)}
                            onChange={() => toggleTheme(theme)}
                            className="peer sr-only"
                          />
                          <div className="size-[16px] rounded-[2px] border border-[#debfbf] bg-white peer-checked:bg-[#6b0119] peer-checked:border-transparent transition-all flex items-center justify-center">
                            {selectedThemes.includes(theme) && (
                              <svg className="size-[14px]" fill="none" viewBox="0 0 16 16">
                                <path d={svgPaths.pf079980} fill="white" />
                              </svg>
                            )}
                          </div>
                        </div>
                        <span className="font-['Source_Sans_3:Regular',sans-serif] text-[#574142] text-[13px] md:text-[14px] leading-[18px] md:leading-[20px] group-hover:text-[#6b0119] transition-colors">
                          {theme}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Level Filter */}
                <div className="mb-[24px] md:mb-[28px] pt-[20px] md:pt-[24px] border-t border-[rgba(222,191,191,0.2)]">
                  <h3 className="font-['IBM_Plex_Sans:Bold',sans-serif] font-bold text-[#121c2a] text-[13px] md:text-[14px] leading-[18px] md:leading-[20px] mb-[10px] md:mb-[12px]" style={{ fontVariationSettings: "'wdth' 100" }}>
                    Nível Académico
                  </h3>
                  <div className="flex flex-col gap-[8px]">
                    {[
                      { id: 'intro' as Level, label: 'Introdutório' },
                      { id: 'advanced' as Level, label: 'Investigação Avançada' },
                      { id: 'doctorate' as Level, label: 'Arquivo de Doutoramento' },
                    ].map((level) => (
                      <button
                        key={level.id}
                        onClick={() => setSelectedLevel(level.id)}
                        className={`px-[12px] py-[8px] md:py-[9px] rounded-[4px] text-left transition-all ${
                          selectedLevel === level.id
                            ? 'bg-[#6b0119] text-white drop-shadow-[0px_1px_1px_rgba(0,0,0,0.05)]'
                            : 'bg-[#eff4ff] text-[#794043] hover:bg-[#dee9fc]'
                        }`}
                      >
                        <span className="font-['Source_Sans_3:Medium',sans-serif] font-medium text-[13px] md:text-[14px] leading-[18px] md:leading-[20px]">
                          {level.label}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Format Filter */}
                <div className="pt-[20px] md:pt-[24px] border-t border-[rgba(222,191,191,0.2)]">
                  <h3 className="font-['IBM_Plex_Sans:Bold',sans-serif] font-bold text-[#121c2a] text-[13px] md:text-[14px] leading-[18px] md:leading-[20px] mb-[10px] md:mb-[12px]" style={{ fontVariationSettings: "'wdth' 100" }}>
                    Formato
                  </h3>
                  <div className="flex flex-col gap-[8px]">
                    {formats.map((format) => (
                      <label
                        key={format}
                        className="flex items-center gap-[12px] cursor-pointer group"
                      >
                        <div className="relative shrink-0">
                          <input
                            type="radio"
                            name="format"
                            checked={selectedFormats.includes(format)}
                            onChange={() => toggleFormat(format)}
                            className="peer sr-only"
                          />
                          <div className="size-[16px] rounded-full border border-[#6b7280] bg-white peer-checked:bg-transparent transition-all flex items-center justify-center">
                            {selectedFormats.includes(format) && (
                              <div className="size-[8px] rounded-full bg-[#6b0119]" />
                            )}
                          </div>
                        </div>
                        <span className="font-['Source_Sans_3:Regular',sans-serif] text-[#574142] text-[13px] md:text-[14px] leading-[18px] md:leading-[20px] group-hover:text-[#6b0119] transition-colors">
                          {format}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            </aside>

            {/* Documents Grid */}
            <div className="lg:col-span-9">
              <SectionMainContentGrid />
            </div>
          </div>
        </div>
      </main>

      <SystemFooter />
    </div>
  );
}
