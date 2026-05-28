import { Link } from 'react-router';
import svgPaths from '../../imports/PaginaInicialDesktop-2/svg-9t8rdcd748';
import heroImg from '../../imports/PaginaInicialDesktop-2/763b78c12b8e487e0a7a7ae5ead65f49a71f432d.png';
import card1Img from '../../imports/PaginaInicialDesktop-2/cce088739d7ec4818e3147ca1e7c7887dc0bd3d5.png';
import card2Img from '../../imports/PaginaInicialDesktop-2/6844821a47833d1e1bb3420ad6db6842ea576361.png';
import card3Img from '../../imports/PaginaInicialDesktop-2/376109c85d49d17db55eeff60b4615a13e4d7a95.png';
import catImg1 from '../../imports/SectionMainContentGrid/ed182b00277857e41c8f8aff96230df9ff2965f8.png';
import catImg2 from '../../imports/SectionMainContentGrid/720d549295f5ffea8f208f4906c2ade1055adcc4.png';
import catImg3 from '../../imports/SectionMainContentGrid/b27df40c0e6cc1052d5cef4496804ad8ad301914.png';
import catImg4 from '../../imports/SectionMainContentGrid/6b013c56324876776a0921dba0cff24f36e76b22.png';
import catImg5 from '../../imports/SectionMainContentGrid/933bbaf5f01d51082b96c823cb291ff8204f0fcf.png';
import LeaderboardSection from './LeaderboardSection';

export default function HomeMainResponsive() {
  return (
    <div className="max-w-[1536px] relative shrink-0 w-full">
      <div className="content-stretch flex flex-col gap-[48px] md:gap-[64px] lg:gap-[96px] items-start max-w-[inherit] p-[24px] md:p-[32px] lg:p-[48px] relative size-full">
        {/* Hero Section */}
        <HeroSection />

        {/* Categories Section */}
        <CategoriesSection />

        {/* Leaderboard Section */}
        <LeaderboardSection />

        {/* Main Content Grid */}
        <MainContentGrid />
      </div>
    </div>
  );
}

function HeroSection() {
  return (
    <div className="content-stretch flex flex-col items-start overflow-clip relative rounded-[6px] md:rounded-[8px] shrink-0 w-full">
      <div className="content-stretch flex flex-col h-[400px] md:h-[450px] lg:h-[500px] items-start justify-center overflow-clip relative shrink-0 w-full">
        {/* Background Image */}
        <div className="flex-[1_0_0] min-h-px relative w-full">
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <img
              alt="A Era de Ouro do Café Angolano"
              className="absolute h-[236.8%] left-0 max-w-none top-[-68.4%] w-full object-cover"
              src={heroImg}
            />
          </div>
        </div>

        {/* Gradient Overlay */}
        <div className="absolute bg-gradient-to-r from-[rgba(139,30,45,0.9)] inset-0 to-[rgba(139,30,45,0)] via-1/2 via-[rgba(139,30,45,0.4)]" />

        {/* Content */}
        <div className="absolute content-stretch flex flex-col inset-0 items-start justify-center px-[24px] md:px-[40px] lg:px-[64px] max-w-full lg:max-w-[768px]">
          {/* Module Label */}
          <div className="content-stretch flex flex-col items-start pb-[12px] md:pb-[16px] relative shrink-0 w-full">
            <div className="flex flex-col font-['Source_Sans_3:Bold',sans-serif] font-bold justify-center leading-[0] relative shrink-0 text-[#ff9da0] text-[10px] md:text-[12px] tracking-[2.4px] uppercase w-full">
              <p className="leading-[14px] md:leading-[16px]">MÓDULO ATUAL: TEXTOS COM JINDUNGO</p>
            </div>
          </div>

          {/* Title */}
          <div className="content-stretch flex flex-col items-start pb-[16px] md:pb-[20px] lg:pb-[24px] relative shrink-0 w-full">
            <div className="flex flex-col font-['IBM_Plex_Sans:Bold',sans-serif] font-bold justify-center leading-[0] relative shrink-0 text-[32px] md:text-[48px] lg:text-[60px] text-white tracking-[-1.2px] w-full" style={{ fontVariationSettings: "'wdth' 100" }}>
              <p className="leading-[40px] md:leading-[60px] lg:leading-[75px] mb-0">A Era de Ouro do Café</p>
              <p className="leading-[40px] md:leading-[60px] lg:leading-[75px]">Angolano</p>
            </div>
          </div>

          {/* Description */}
          <div className="content-stretch flex flex-col items-start pb-[20px] md:pb-[26px] lg:pb-[32px] relative shrink-0 w-full">
            <div className="flex flex-col font-['Source_Sans_3:Regular',sans-serif] font-normal justify-center leading-[0] relative shrink-0 text-[16px] md:text-[18px] lg:text-[20px] text-[rgba(255,255,255,0.9)] w-full">
              <p className="leading-[26px] md:leading-[30px] lg:leading-[32.5px] mb-0">Explore como Angola se tornou o terceiro maior produtor mundial de café na</p>
              <p className="leading-[26px] md:leading-[30px] lg:leading-[32.5px]">década de 1970 e o seu impacto duradouro nas infraestruturas regionais.</p>
            </div>
          </div>

          {/* CTA Section */}
          <div className="content-stretch flex flex-col sm:flex-row gap-[16px] md:gap-[20px] lg:gap-[24px] items-start sm:items-center relative shrink-0 w-full">
            <Link to="/arquivo">
              <button className="bg-[#8b1e2d] content-stretch flex gap-[8px] items-center px-[24px] md:px-[28px] lg:px-[32px] py-[12px] md:py-[14px] lg:py-[16px] relative rounded-[4px] md:rounded-[6px] shrink-0 cursor-pointer hover:bg-[#7a1a27] transition-colors w-full sm:w-auto">
                <div className="flex flex-col font-['Source_Sans_3:SemiBold',sans-serif] font-semibold justify-center leading-[0] relative shrink-0 text-[14px] md:text-[16px] text-center text-white whitespace-nowrap">
                  <p className="leading-[20px] md:leading-[24px]">Continuar Leitura</p>
                </div>
                <div className="relative shrink-0 size-[14px] md:size-[16px]">
                  <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 16 16">
                    <path d={svgPaths.p1a406200} fill="white" />
                  </svg>
                </div>
              </button>
            </Link>

            <div className="content-stretch flex flex-col items-start relative shrink-0">
              <div className="flex flex-col font-['Source_Sans_3:Medium',sans-serif] font-medium justify-center leading-[0] relative shrink-0 text-[13px] md:text-[14px] text-[rgba(255,255,255,0.7)] whitespace-nowrap">
                <p className="leading-[18px] md:leading-[20px]">85% Concluído • faltam 12 min</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function CategoriesSection() {
  const categories = [
    {
      id: 1,
      name: "Textos com Jindungo",
      description: "Análises críticas e documentos históricos com perspectivas angolanas autênticas",
      icon: "M12 2L2 7V17L12 22L22 17V7L12 2M12 4.18L19 7.82V16.18L12 19.82L5 16.18V7.82L12 4.18Z",
      documentCount: 42,
      isExclusive: true,
      color: "#8b1e2d",
      backgroundImage: heroImg
    },
    {
      id: 2,
      name: "História Económica",
      description: "Desenvolvimento econômico e transformações monetárias de Angola",
      icon: "M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2M12 20C7.59 20 4 16.41 4 12C4 7.59 7.59 4 12 4C16.41 4 20 7.59 20 12C20 16.41 16.41 20 12 20M15 13H11V7H13V11H15V13Z",
      documentCount: 156,
      isExclusive: false,
      color: "#6b0119",
      backgroundImage: catImg2
    },
    {
      id: 3,
      name: "Infraestrutura Colonial",
      description: "Ferrovias, portos e desenvolvimento urbano durante período colonial",
      icon: "M20 6H4V4H20V6M14 9H6V11H14V9M20 9V11H16V9H20M6 14H11V16H6V14M20 14V16H13V14H20M4 19H20V21H4V19Z",
      documentCount: 89,
      isExclusive: false,
      color: "#6b0119",
      backgroundImage: catImg5
    },
    {
      id: 4,
      name: "Estudos Monetários",
      description: "Moedas, reformas monetárias e políticas financeiras históricas",
      icon: "M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2M13.41 18.09V20H10.74V18.07C9.03 17.77 7.61 16.75 7.21 15.14L9.04 14.41C9.3 15.41 10.16 16.17 11.88 16.17C13.62 16.17 14.2 15.35 14.2 14.6C14.2 13.77 13.62 13.08 11.64 12.64C9.3 12.11 7.53 11.21 7.53 9.16C7.53 7.42 8.85 6.31 10.74 5.96V4H13.41V5.95C14.82 6.3 15.93 7.21 16.28 8.63L14.47 9.37C14.25 8.48 13.53 7.71 11.88 7.71C10.37 7.71 9.68 8.38 9.68 9.16C9.68 9.95 10.45 10.46 12.41 10.95C14.88 11.54 16.35 12.48 16.35 14.6C16.35 16.32 15.11 17.54 13.41 18.09Z",
      documentCount: 73,
      isExclusive: false,
      color: "#6b0119",
      backgroundImage: card1Img
    },
    {
      id: 5,
      name: "Arquivos Restritos",
      description: "Documentos confidenciais e materiais de investigação avançada",
      icon: "M12 1L3 5V11C3 16.55 6.84 21.74 12 23C17.16 21.74 21 16.55 21 11V5L12 1M12 5C13.4 5 14.8 5.4 16 6.1C17.3 6.9 18 8.4 18 10C18 11 17.6 11.9 17 12.6C16.4 13.3 15.5 13.8 14.6 14L15.5 16H13.3L12.5 14.3C12.3 14.3 12.2 14.3 12 14.3C10.6 14.3 9.2 13.9 8 13.2C6.7 12.4 6 10.9 6 9.3C6 8.3 6.4 7.4 7 6.7C7.6 6 8.5 5.5 9.4 5.3L8.5 3.5H10.7L11.5 5.2C11.7 5.2 11.8 5.2 12 5.2M12 7C11.2 7 10.5 7.3 10 7.9C9.5 8.5 9.2 9.3 9.2 10.2C9.2 11.1 9.5 11.9 10 12.5C10.5 13.1 11.2 13.4 12 13.4C12.8 13.4 13.5 13.1 14 12.5C14.5 11.9 14.8 11.1 14.8 10.2C14.8 9.3 14.5 8.5 14 7.9C13.5 7.3 12.8 7 12 7Z",
      documentCount: 28,
      isExclusive: true,
      color: "#8b1e2d",
      backgroundImage: catImg3
    },
    {
      id: 6,
      name: "Política Pós-Independência",
      description: "Transições políticas e econômicas após 1975",
      icon: "M14 2H6C4.89 2 4 2.9 4 4V20C4 21.11 4.89 22 6 22H18C19.11 22 20 21.11 20 20V8L14 2M18 20H6V4H13V9H18V20M10 19L12 15H9V10L7 14H10V19Z",
      documentCount: 134,
      isExclusive: false,
      color: "#6b0119",
      backgroundImage: catImg4
    }
  ];

  return (
    <div className="content-stretch flex flex-col gap-[24px] md:gap-[32px] items-start relative shrink-0 w-full">
      {/* Section Header */}
      <div className="content-stretch flex flex-col gap-[8px] md:gap-[12px] items-start relative shrink-0 w-full">
        <div className="flex items-end justify-between w-full">
          <div className="flex flex-col gap-[6px] md:gap-[8px]">
            <h2 className="font-['IBM_Plex_Sans:Bold',sans-serif] font-bold text-[#6b0119] text-[24px] md:text-[28px] lg:text-[30px] tracking-[-0.6px] leading-[32px] md:leading-[34px] lg:leading-[36px]" style={{ fontVariationSettings: "'wdth' 100" }}>
              Explorar por Categoria
            </h2>
            <div className="bg-[#6b0119] h-[3px] md:h-[4px] w-[40px] md:w-[48px]" />
          </div>
        </div>
        <p className="font-['Source_Sans_3:Regular',sans-serif] font-normal text-[#574142] text-[14px] md:text-[15px] lg:text-[16px] leading-[21px] md:leading-[23px] lg:leading-[26px]">
          Navegue através das principais áreas de investigação do arquivo
        </p>
      </div>

      {/* Categories Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-[20px] md:gap-[24px] lg:gap-[28px] w-full">
        {categories.map((category) => (
          <CategoryCard key={category.id} category={category} />
        ))}
      </div>
    </div>
  );
}

interface CategoryCardProps {
  category: {
    id: number;
    name: string;
    description: string;
    icon: string;
    documentCount: number;
    isExclusive: boolean;
    color: string;
    backgroundImage: string;
  };
}

function CategoryCard({ category }: CategoryCardProps) {
  return (
    <div className="relative rounded-[6px] md:rounded-[8px] overflow-hidden border border-[rgba(222,191,191,0.1)] hover:border-[rgba(107,1,25,0.3)] hover:shadow-[0px_4px_16px_rgba(0,0,0,0.08)] transition-all cursor-pointer group">
      {/* Background Image */}
      <div className="absolute inset-0 overflow-hidden">
        <img
          src={category.backgroundImage}
          alt={category.name}
          className="w-full h-full object-cover opacity-40 grayscale-[30%] group-hover:opacity-50 group-hover:grayscale-0 group-hover:scale-110 transition-all duration-500"
        />
      </div>

      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/85 via-white/80 to-white/70" />

      {/* Exclusive Badge */}
      {category.isExclusive && (
        <div className="absolute top-[12px] right-[12px] z-10">
          <div className="bg-[#8b1e2d] px-[8px] py-[4px] rounded-[3px] flex items-center gap-[4px] shadow-md">
            <svg className="w-[10px] h-[10px]" fill="none" viewBox="0 0 12 12">
              <path d="M6 0.5L1.5 3V6.5C1.5 9.775 3.92 12.74 6 13.5C8.08 12.74 10.5 9.775 10.5 6.5V3L6 0.5Z" fill="white"/>
            </svg>
            <span className="font-['Source_Sans_3:Bold',sans-serif] font-bold text-white text-[9px] md:text-[10px] leading-[13px] tracking-[0.8px] uppercase">
              Exclusivo
            </span>
          </div>
        </div>
      )}

      <div className="relative flex flex-col p-[24px] md:p-[28px] lg:p-[32px] min-h-[240px] md:min-h-[260px] justify-between">
        {/* Top Content */}
        <div className="flex flex-col gap-[12px] md:gap-[16px]">
          {/* Icon */}
          <div
            className="w-[48px] h-[48px] md:w-[56px] md:h-[56px] rounded-[10px] md:rounded-[12px] flex items-center justify-center transition-all group-hover:scale-110"
            style={{ backgroundColor: `${category.color}15` }}
          >
            <svg className="w-[24px] h-[24px] md:w-[28px] md:h-[28px]" fill={category.color} viewBox="0 0 24 24">
              <path d={category.icon} />
            </svg>
          </div>

          {/* Title */}
          <div className="flex flex-col gap-[6px] md:gap-[8px]">
            <h3 className="font-['IBM_Plex_Sans:Bold',sans-serif] font-bold text-[#121c2a] text-[18px] md:text-[20px] leading-[26px] md:leading-[28px] tracking-[-0.4px] group-hover:text-[#6b0119] transition-colors" style={{ fontVariationSettings: "'wdth' 100" }}>
              {category.name}
            </h3>
            <p className="font-['Source_Sans_3:Regular',sans-serif] font-normal text-[#574142] text-[13px] md:text-[14px] leading-[19px] md:leading-[20px] line-clamp-2">
              {category.description}
            </p>
          </div>
        </div>

        {/* Bottom Content */}
        <div className="flex items-center justify-between pt-[16px] md:pt-[20px] border-t border-[rgba(222,191,191,0.1)]">
          <div className="flex items-center gap-[6px]">
            <span className="font-['Source_Sans_3:Medium',sans-serif] font-medium text-[#574142] text-[12px] md:text-[13px] leading-[16px] md:leading-[18px]">
              {category.documentCount} documentos
            </span>
          </div>

          {category.isExclusive ? (
            <div className="flex items-center gap-[6px] px-[10px] py-[6px] bg-[#eff4ff] rounded-[3px] group-hover:bg-[#8b1e2d] transition-colors">
              <span className="font-['Source_Sans_3:Bold',sans-serif] font-bold text-[#6b0119] text-[11px] md:text-[12px] leading-[14px] md:leading-[16px] group-hover:text-white transition-colors">
                Pedir Acesso
              </span>
              <svg className="w-[8px] h-[8px] group-hover:translate-x-[2px] transition-transform" fill="#6b0119" viewBox="0 0 10.5 10.5">
                <path className="group-hover:fill-white transition-colors" d="M10.0704 5.96094L5.53516 10.4961L4.62891 9.58984L7.84766 6.37109H0.0703125V5.05078H7.84766L4.62891 1.83203L5.53516 0.925781L10.0704 5.46094V5.96094Z" fill="#6b0119" />
              </svg>
            </div>
          ) : (
            <div className="flex items-center gap-[4px] group-hover:gap-[8px] transition-all">
              <span className="font-['Source_Sans_3:Bold',sans-serif] font-bold text-[#6b0119] text-[11px] md:text-[12px] leading-[14px] md:leading-[16px]">
                Explorar
              </span>
              <svg className="w-[8px] h-[8px]" fill="none" viewBox="0 0 10.5 10.5">
                <path d="M10.0704 5.96094L5.53516 10.4961L4.62891 9.58984L7.84766 6.37109H0.0703125V5.05078H7.84766L4.62891 1.83203L5.53516 0.925781L10.0704 5.46094V5.96094Z" fill="#6B0119" />
              </svg>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function MainContentGrid() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-[32px] md:gap-[48px] lg:gap-[64px] w-full">
      {/* Main Content - 8 columns */}
      <div className="lg:col-span-8 content-stretch flex flex-col gap-[32px] md:gap-[40px] lg:gap-[48px] items-start relative">
        {/* Section Header */}
        <div className="content-stretch flex items-end justify-between relative shrink-0 w-full">
          <div className="content-stretch flex flex-col gap-[6px] md:gap-[8px] items-start relative shrink-0">
            <div className="flex flex-col font-['IBM_Plex_Sans:Bold',sans-serif] font-bold justify-center leading-[0] relative shrink-0 text-[#6b0119] text-[24px] md:text-[28px] lg:text-[30px] tracking-[-0.6px]" style={{ fontVariationSettings: "'wdth' 100" }}>
              <p className="leading-[32px] md:leading-[34px] lg:leading-[36px]">Arquivos Recomendados</p>
            </div>
            <div className="bg-[#6b0119] h-[3px] md:h-[4px] relative shrink-0 w-[40px] md:w-[48px]" />
          </div>

          <Link to="/arquivo" className="content-stretch flex flex-col items-start relative shrink-0">
            <div className="flex flex-col font-['Source_Sans_3:SemiBold',sans-serif] font-semibold justify-center leading-[0] relative shrink-0 text-[#6b0119] text-[13px] md:text-[14px] whitespace-nowrap cursor-pointer hover:underline">
              <p className="leading-[18px] md:leading-[20px]">Explorar Todos os Documentos</p>
            </div>
          </Link>
        </div>

        {/* Cards Grid */}
        <RecommendedCardsGrid />
      </div>

      {/* Sidebar - 4 columns */}
      <div className="lg:col-span-4 content-stretch flex flex-col gap-[32px] md:gap-[40px] lg:gap-[48px] items-start relative">
        <ActiveDiscussionsCard />
        <TopRankingScholarsCard />
        <QuoteCard />
      </div>
    </div>
  );
}

function RecommendedCardsGrid() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-[24px] md:gap-[28px] lg:gap-[32px] w-full">
      {/* Large Featured Card - spans 2 columns on desktop */}
      <div className="md:col-span-2 bg-white content-stretch flex flex-col md:flex-row h-auto md:h-[220px] lg:h-[256px] items-start overflow-clip relative rounded-[6px] md:rounded-[8px] shadow-[0px_1px_2px_0px_rgba(0,0,0,0.05)] shrink-0">
        {/* Image */}
        <div className="content-stretch flex flex-[1_0_0] flex-col h-[180px] md:h-full items-start justify-center min-w-px overflow-clip relative">
          <div className="flex-[1_0_0] min-h-px relative w-full">
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
              <img alt="" className="absolute h-[150%] left-0 max-w-none top-[-25%] w-full object-cover" src={card1Img} />
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="flex-[1_0_0] h-full min-w-px relative">
          <div className="flex flex-col justify-center size-full">
            <div className="content-stretch flex flex-col items-start justify-center p-[24px] md:p-[28px] lg:p-[32px] relative size-full">
              <div className="content-stretch flex flex-col items-start pb-[6px] md:pb-[8px] relative shrink-0 w-full">
                <div className="flex flex-col font-['Source_Sans_3:Bold',sans-serif] font-bold justify-center leading-[0] relative shrink-0 text-[#6b0119] text-[9px] md:text-[10px] tracking-[1px] uppercase w-full">
                  <p className="leading-[13px] md:leading-[15px]">HISTÓRIA MONETÁRIA</p>
                </div>
              </div>

              <div className="content-stretch flex flex-col items-start pb-[12px] md:pb-[14px] lg:pb-[16px] relative shrink-0 w-full">
                <div className="flex flex-col font-['IBM_Plex_Sans:Bold',sans-serif] font-bold justify-center leading-[0] relative shrink-0 text-[#121c2a] text-[20px] md:text-[22px] lg:text-[24px] tracking-[-0.48px] w-full" style={{ fontVariationSettings: "'wdth' 100" }}>
                  <p className="leading-[28px] md:leading-[30px] lg:leading-[32px] mb-0">A Transição: Do Escudo ao</p>
                  <p className="leading-[28px] md:leading-[30px] lg:leading-[32px]">Kwanza</p>
                </div>
              </div>

              <div className="content-stretch flex flex-col items-start pb-[16px] md:pb-[20px] lg:pb-[24px] relative shrink-0 w-full">
                <div className="flex flex-col font-['Source_Sans_3:Regular',sans-serif] font-normal justify-center leading-[0] relative shrink-0 text-[#574142] text-[13px] md:text-[14px] w-full">
                  <p className="leading-[18px] md:leading-[20px] mb-0">Uma análise profunda da reforma monetária de 1977</p>
                  <p className="leading-[18px] md:leading-[20px] mb-0">que moldou a soberania económica da nação recém-</p>
                  <p className="leading-[18px] md:leading-[20px]">independente.</p>
                </div>
              </div>

              <div className="content-stretch flex gap-[8px] items-center relative shrink-0 w-full cursor-pointer hover:gap-[12px] transition-all">
                <div className="flex flex-col font-['Source_Sans_3:Bold',sans-serif] font-bold justify-center leading-[0] relative shrink-0 text-[#6b0119] text-[11px] md:text-[12px] whitespace-nowrap">
                  <p className="leading-[14px] md:leading-[16px]">LER ARQUIVO</p>
                </div>
                <div className="relative shrink-0 size-[9px] md:size-[10.5px]">
                  <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 10.5 10.5">
                    <path d={svgPaths.p32ab500} fill="#6B0119" />
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Small Cards */}
      <SmallArchiveCard
        icon={svgPaths.p155d85e0}
        iconViewBox="0 0 16 19"
        title="Caminho de Ferro de Benguela"
        description={["Mapeamento do corredor de exportação do", "Copperbelt até à costa atlântica através do centro", "de Angola."]}
        image={card2Img}
      />

      <SmallArchiveCard
        icon={svgPaths.p5df7b00}
        iconViewBox="0 0 20 20"
        title="Política Pós-Independência"
        description={["Análise das estruturas de economia planeada do", "final dos anos 70 e 80 no contexto regional."]}
        image={card3Img}
      />
    </div>
  );
}

interface SmallArchiveCardProps {
  icon: string;
  iconViewBox: string;
  title: string;
  description: string[];
  image: string;
}

function SmallArchiveCard({ icon, iconViewBox, title, description, image }: SmallArchiveCardProps) {
  return (
    <div className="content-stretch flex flex-col items-start justify-center relative shrink-0">
      <div className="bg-[#eff4ff] relative rounded-[6px] md:rounded-[8px] shrink-0 w-full overflow-hidden">
        <div className="content-stretch flex flex-col items-start justify-between p-[24px] md:p-[28px] lg:p-[32px] relative size-full min-h-[360px] md:min-h-[380px] lg:min-h-[428px]">
          <div className="content-stretch flex flex-col gap-[10px] md:gap-[12px] items-start relative shrink-0 w-full">
            {/* Icon */}
            <div className="bg-[rgba(107,1,25,0.1)] content-stretch flex items-center justify-center relative rounded-[10px] md:rounded-[12px] shrink-0 size-[44px] md:size-[48px] overflow-hidden">
              <div className="relative shrink-0 max-w-[60%] max-h-[60%]">
                <svg className="block w-full h-full" fill="none" preserveAspectRatio="xMidYMid meet" viewBox={iconViewBox}>
                  <path d={icon} fill="#6B0119" />
                </svg>
              </div>
            </div>

            {/* Title */}
            <div className="content-stretch flex flex-col items-start pt-[8px] md:pt-[10px] lg:pt-[12px] relative shrink-0 w-full overflow-hidden">
              <div className="flex flex-col font-['IBM_Plex_Sans:Bold',sans-serif] font-bold justify-center leading-[0] relative shrink-0 text-[#121c2a] text-[18px] md:text-[19px] lg:text-[20px] tracking-[-0.4px] w-full" style={{ fontVariationSettings: "'wdth' 100" }}>
                <p className="leading-[26px] md:leading-[27px] lg:leading-[28px] break-words">{title}</p>
              </div>
            </div>

            {/* Description */}
            <div className="content-stretch flex flex-col items-start relative shrink-0 w-full overflow-hidden">
              <div className="flex flex-col font-['Source_Sans_3:Regular',sans-serif] font-normal justify-center leading-[0] relative shrink-0 text-[#574142] text-[13px] md:text-[14px] w-full">
                {description.map((line, index) => (
                  <p key={index} className={`leading-[18px] md:leading-[20px] break-words ${index < description.length - 1 ? 'mb-0' : ''}`}>{line}</p>
                ))}
              </div>
            </div>
          </div>

          {/* Image */}
          <div className="content-stretch flex flex-col h-[140px] md:h-[150px] lg:h-[160px] items-start pt-[24px] md:pt-[28px] lg:pt-[32px] relative shrink-0 w-full">
            <div className="content-stretch flex flex-col h-full items-start justify-center overflow-clip relative rounded-[3px] md:rounded-[4px] shrink-0 w-full">
              <div className="flex-[1_0_0] min-h-px relative w-full">
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                  <img alt="" className="absolute h-[190%] left-0 max-w-none top-[-45%] w-full object-cover" src={image} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function ActiveDiscussionsCard() {
  return (
    <div className="bg-[#eff4ff] relative rounded-[6px] md:rounded-[8px] shrink-0 w-full overflow-hidden">
      <div className="content-stretch flex flex-col gap-[20px] md:gap-[24px] items-start p-[24px] md:p-[28px] lg:p-[32px] relative size-full">
        {/* Header */}
        <div className="content-stretch flex gap-[6px] md:gap-[8px] items-center relative shrink-0 w-full overflow-hidden">
          <div className="relative shrink-0 size-[18px] md:size-[20px]">
            <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 20 20">
              <path d={svgPaths.p1c483e80} fill="#6B0119" />
            </svg>
          </div>
          <div className="flex flex-col font-['IBM_Plex_Sans:Bold',sans-serif] font-bold justify-center leading-[0] relative shrink-0 text-[#6b0119] text-[18px] md:text-[20px] tracking-[-0.4px] whitespace-nowrap" style={{ fontVariationSettings: "'wdth' 100" }}>
            <p className="leading-[26px] md:leading-[28px]">Discussões Ativas</p>
          </div>
        </div>

        {/* Discussions List */}
        <div className="content-stretch flex flex-col gap-[20px] md:gap-[24px] items-start pt-[4px] md:pt-[6px] lg:pt-[8px] relative shrink-0 w-full overflow-hidden">
          <DiscussionItem
            title="Impacto da Modernização do Porto do Lobito"
            author="Dr. Agostinho Neto"
            replies="24 Respostas"
            hasBorder
          />
          <DiscussionItem
            title="Choques Petrolíferos dos Anos 80"
            author="Prof.ª Isabel Santos"
            replies="12 Respostas"
            hasBorder
          />
          <DiscussionItem
            title="Histórias Orais da Exploração de Diamantes"
            author="L. Martins"
            replies="8 Respostas"
            hasBorder={false}
          />
        </div>

        {/* CTA Button */}
        <Link to="/comunidade" className="w-full">
          <button className="content-stretch flex items-center justify-center px-px py-[11px] md:py-[13px] relative rounded-[2px] shrink-0 w-full cursor-pointer hover:bg-[rgba(107,1,25,0.05)] transition-colors">
            <div aria-hidden="true" className="absolute border border-[rgba(107,1,25,0.2)] border-solid inset-0 pointer-events-none rounded-[2px]" />
            <div className="flex flex-col font-['Source_Sans_3:Bold',sans-serif] font-bold justify-center leading-[0] relative shrink-0 text-[#6b0119] text-[11px] md:text-[12px] text-center tracking-[1.2px] uppercase whitespace-nowrap">
              <p className="leading-[14px] md:leading-[16px]">ADERIR À COMUNIDADE</p>
            </div>
          </button>
        </Link>
      </div>
    </div>
  );
}

interface DiscussionItemProps {
  title: string;
  author: string;
  replies: string;
  hasBorder: boolean;
}

function DiscussionItem({ title, author, replies, hasBorder }: DiscussionItemProps) {
  return (
    <div className={`content-stretch flex flex-col gap-[3px] md:gap-[4px] items-start ${hasBorder ? 'pb-[14px] md:pb-[17px]' : 'pb-[6px] md:pb-[8px]'} relative shrink-0 w-full overflow-hidden`}>
      {hasBorder && <div aria-hidden="true" className="absolute border-[rgba(222,191,191,0.2)] border-b border-solid inset-0 pointer-events-none" />}

      <div className="flex flex-col font-['Source_Sans_3:Bold',sans-serif] font-bold justify-center leading-[0] relative shrink-0 text-[#121c2a] text-[13px] md:text-[14px] w-full cursor-pointer hover:text-[#6b0119] transition-colors overflow-hidden">
        <p className="leading-[18px] md:leading-[20px] break-words">{title}</p>
      </div>

      <div className="content-stretch flex gap-[10px] md:gap-[12px] items-center relative shrink-0 w-full overflow-hidden">
        <div className="flex flex-col font-['Source_Sans_3:Bold',sans-serif] font-bold justify-center leading-[0] relative shrink-0 text-[#6b0119] text-[10px] md:text-[11px] whitespace-nowrap">
          <p className="leading-[14px] md:leading-[16.5px]">{author}</p>
        </div>
        <div className="flex flex-col font-['Source_Sans_3:Regular',sans-serif] font-normal justify-center leading-[0] relative shrink-0 text-[#574142] text-[10px] md:text-[11px] whitespace-nowrap">
          <p className="leading-[14px] md:leading-[16.5px]">•</p>
        </div>
        <div className="flex flex-col font-['Source_Sans_3:Regular',sans-serif] font-normal justify-center leading-[0] relative shrink-0 text-[#574142] text-[10px] md:text-[11px] whitespace-nowrap">
          <p className="leading-[14px] md:leading-[16.5px]">{replies}</p>
        </div>
      </div>
    </div>
  );
}

function TopRankingScholarsCard() {
  return (
    <div className="bg-[#8b1e2d] relative rounded-[6px] md:rounded-[8px] shrink-0 w-full overflow-hidden">
      <div className="content-stretch flex flex-col gap-[24px] md:gap-[28px] lg:gap-[32px] items-start p-[24px] md:p-[28px] lg:p-[32px] relative size-full">
        {/* Header */}
        <div className="content-stretch flex gap-[6px] md:gap-[8px] items-center relative shrink-0 w-full overflow-hidden">
          <div className="h-[18px] md:h-[20px] relative shrink-0 w-[9px] md:w-[10px]">
            <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 10 20">
              <path d={svgPaths.p2d1edbc0} fill="white" />
            </svg>
          </div>
          <div className="flex flex-col font-['IBM_Plex_Sans:Bold',sans-serif] font-bold justify-center leading-[0] relative shrink-0 text-[18px] md:text-[20px] text-white tracking-[-0.4px] whitespace-nowrap" style={{ fontVariationSettings: "'wdth' 100" }}>
            <p className="leading-[26px] md:leading-[28px]">Principais Investigadores</p>
          </div>
        </div>

        {/* Ranking List */}
        <div className="content-stretch flex flex-col gap-[20px] md:gap-[24px] items-start relative shrink-0 w-full overflow-hidden">
          <ScholarRank rank="1" name="Dr. Manuel Vicente" specialty="Análise Macroeconómica" points="4.2k" opacity="bg-[rgba(255,255,255,0.2)]" />
          <ScholarRank rank="2" name="Sofia Teixeira" specialty="História Colonial" points="3.8k" opacity="bg-[rgba(255,255,255,0.1)]" />
          <ScholarRank rank="3" name="Joaquim Silva" specialty="Desenv. Infraestruturas" points="3.5k" opacity="bg-[rgba(255,255,255,0.05)]" />
        </div>
      </div>
    </div>
  );
}

interface ScholarRankProps {
  rank: string;
  name: string;
  specialty: string;
  points: string;
  opacity: string;
}

function ScholarRank({ rank, name, specialty, points, opacity }: ScholarRankProps) {
  return (
    <div className="content-stretch flex gap-[12px] md:gap-[14px] lg:gap-[16px] items-center relative shrink-0 w-full overflow-hidden">
      <div className={`${opacity} content-stretch flex items-center justify-center relative rounded-[10px] md:rounded-[12px] shrink-0 size-[36px] md:size-[40px]`}>
        <div className="flex flex-col font-['Source_Sans_3:Bold',sans-serif] font-bold justify-center leading-[0] relative shrink-0 text-[14px] md:text-[16px] text-center text-white whitespace-nowrap">
          <p className="leading-[20px] md:leading-[24px]">{rank}</p>
        </div>
      </div>

      <div className="content-stretch flex flex-[1_0_0] flex-col items-start min-w-0 relative overflow-hidden">
        <div className="flex flex-col font-['Source_Sans_3:Bold',sans-serif] font-bold justify-center leading-[0] relative shrink-0 text-[13px] md:text-[14px] text-white w-full">
          <p className="leading-[18px] md:leading-[20px] truncate">{name}</p>
        </div>
        <div className="flex flex-col font-['Source_Sans_3:Regular',sans-serif] font-normal justify-center leading-[0] relative shrink-0 text-[9px] md:text-[10px] text-[rgba(255,255,255,0.6)] w-full">
          <p className="leading-[13px] md:leading-[15px] truncate">{specialty}</p>
        </div>
      </div>

      <div className="content-stretch flex flex-col items-start relative shrink-0">
        <div className="flex flex-col font-['Source_Sans_3:Bold',sans-serif] font-bold justify-center leading-[0] relative shrink-0 text-[13px] md:text-[14px] text-right text-white whitespace-nowrap">
          <p className="leading-[18px] md:leading-[20px]">{points}</p>
        </div>
        <div className="flex flex-col font-['Source_Sans_3:Regular',sans-serif] font-normal justify-center leading-[0] relative shrink-0 text-[9px] md:text-[10px] text-[rgba(255,255,255,0.6)] text-right whitespace-nowrap">
          <p className="leading-[13px] md:leading-[15px]">Pontos</p>
        </div>
      </div>
    </div>
  );
}

function QuoteCard() {
  return (
    <div className="bg-[#eff4ff] relative shrink-0 w-full rounded-[6px] md:rounded-[8px] overflow-hidden">
      <div aria-hidden="true" className="absolute border-[#6b0119] border-l-4 border-solid inset-0 pointer-events-none rounded-[6px] md:rounded-[8px]" />
      <div className="content-stretch flex flex-col gap-[12px] md:gap-[14px] lg:gap-[16px] items-start pl-[28px] md:pl-[32px] lg:pl-[36px] pr-[24px] md:pr-[28px] lg:pr-[32px] py-[32px] md:py-[36px] lg:py-[40px] relative size-full">
        <div className="h-[10px] md:h-[12px] relative shrink-0 w-[14px] md:w-[17px]">
          <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 17 12">
            <path d={svgPaths.p300fe680} fill="#6B0119" opacity="0.5" />
          </svg>
        </div>

        <div className="flex flex-col font-['Source_Sans_3:Italic',sans-serif] font-normal italic justify-center leading-[0] relative shrink-0 text-[#574142] text-[14px] md:text-[15px] lg:text-[16px] w-full overflow-hidden">
          <p className="leading-[22px] md:leading-[23px] lg:leading-[24px] mb-0 break-words">"Compreender o passado é a única forma</p>
          <p className="leading-[22px] md:leading-[23px] lg:leading-[24px] mb-0 break-words">de salvaguardar o futuro económico da</p>
          <p className="leading-[22px] md:leading-[23px] lg:leading-[24px] break-words">nossa nação soberana."</p>
        </div>

        <div className="flex flex-col font-['Source_Sans_3:Bold',sans-serif] font-bold justify-center leading-[0] relative shrink-0 text-[#6b0119] text-[11px] md:text-[12px] w-full overflow-hidden">
          <p className="leading-[14px] md:leading-[16px] break-words">— Comissão de Arquivos Angolanos, 1978</p>
        </div>
      </div>
    </div>
  );
}
