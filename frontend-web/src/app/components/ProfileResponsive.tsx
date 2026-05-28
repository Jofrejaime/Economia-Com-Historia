import { useNavigate } from 'react-router';
import svgPaths from '../../imports/LowerSectionDistinctionsSettings/svg-upajfybr04';
import avatarImg from '../../imports/PerfilDoInvestigadorDesktop-1/8c711ec32be972eef06cb0eef1620adc2b98ee6c.png';
import ContentCard from './ContentCard';

export default function ProfileResponsive() {
  return (
    <div className="max-w-[1536px] relative shrink-0 w-full">
      <div className="content-stretch flex flex-col gap-[32px] md:gap-[48px] lg:gap-[64px] items-start max-w-[inherit] p-[24px] md:p-[32px] lg:p-[48px] relative size-full">
        {/* Profile Header */}
        <ProfileHeader />

        {/* Stats Grid */}
        <StatsGrid />

        {/* Méritos e Distinções + Controles de Conta */}
        <MeritsAndAccountSection />

        {/* Conteúdos Criados pelo Usuário */}
        <UserContentSection />
      </div>
    </div>
  );
}

function ProfileHeader() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-[24px] md:gap-[32px] lg:gap-[48px] relative shrink-0 w-full">
      {/* Background Image Card */}
      <div className="lg:col-span-3 content-stretch flex flex-col items-start justify-center overflow-clip relative rounded-[6px] md:rounded-[8px] bg-[#dee9fc] shadow-[0px_1px_2px_0px_rgba(0,0,0,0.05)] h-[200px] md:h-[240px] lg:h-[260px]">
        <div className="h-full relative shrink-0 w-full">
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <img alt="Profile Background" className="absolute h-[133.33%] left-[-0.05%] max-w-none top-[-1.61%] w-full object-cover" src={avatarImg} />
          </div>
        </div>
      </div>

      {/* Profile Info */}
      <div className="lg:col-span-9 content-stretch flex flex-col gap-[8px] items-start relative">
        {/* Academic Status Badge */}
        <div className="content-stretch flex flex-col items-start relative shrink-0 w-full">
          <div className="flex flex-col font-['Source_Sans_3:Bold',sans-serif] font-bold justify-center leading-[0] relative shrink-0 text-[#6b0119] text-[10px] md:text-[11px] tracking-[1.1px] uppercase w-full">
            <p className="leading-[14px] md:leading-[16.5px]">ESTATUTO ACADÉMICO: INVESTIGADOR SÉNIOR</p>
          </div>
        </div>

        {/* Name */}
        <div className="content-stretch flex flex-col items-start pb-[8px] md:pb-[12px] lg:pb-[16px] relative shrink-0 w-full">
          <div className="flex flex-col font-['IBM_Plex_Sans:Bold',sans-serif] font-bold justify-center leading-[0] relative shrink-0 text-[#8b1e2d] text-[32px] md:text-[40px] lg:text-[48px] tracking-[-2.4px] w-full" style={{ fontVariationSettings: "'wdth' 100" }}>
            <p className="leading-[36px] md:leading-[42px] lg:leading-[48px]">Dr. José Ndele</p>
          </div>
        </div>

        {/* Bio */}
        <div className="content-stretch flex flex-col items-start max-w-full lg:max-w-[672px] pb-[16px] md:pb-[20px] lg:pb-[24px] relative shrink-0 w-full">
          <div className="flex flex-col font-['Source_Sans_3:Regular',sans-serif] font-normal justify-center leading-[0] relative shrink-0 text-[#574142] text-[15px] md:text-[16px] lg:text-[18px] w-full">
            <p className="leading-[24px] md:leading-[26px] lg:leading-[28px] mb-0">Principal contribuidor do Repositório de Moeda do Século XIX. Especialista em transições</p>
            <p className="leading-[24px] md:leading-[26px] lg:leading-[28px] mb-0">macroeconómicas do centro comercial de Luanda. Atualmente a perseguir a distinção</p>
            <p className="leading-[24px] md:leading-[26px] lg:leading-[28px]">"Arquivo de Ouro".</p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="content-stretch flex flex-col sm:flex-row gap-[12px] md:gap-[16px] items-start sm:items-center relative shrink-0 w-full">
          <button className="bg-[#8b1e2d] content-stretch flex flex-col items-center justify-center px-[20px] md:px-[24px] py-[8px] md:py-[9px] relative rounded-[4px] shrink-0 cursor-pointer hover:bg-[#7a1a27] transition-colors w-full sm:w-auto">
            <div className="flex flex-col font-['Source_Sans_3:SemiBold',sans-serif] font-semibold justify-center leading-[0] relative shrink-0 text-[14px] md:text-[16px] text-center text-white whitespace-nowrap">
              <p className="leading-[20px] md:leading-[24px]">Editar Bio Académica</p>
            </div>
          </button>
          <button className="content-stretch flex flex-col items-center justify-center px-[20px] md:px-[25px] py-[8px] md:py-[9px] relative rounded-[4px] shrink-0 border border-[rgba(222,191,191,0.3)] cursor-pointer hover:border-[#6b0119] hover:bg-[rgba(107,1,25,0.05)] transition-all w-full sm:w-auto">
            <div className="flex flex-col font-['Source_Sans_3:SemiBold',sans-serif] font-semibold justify-center leading-[0] relative shrink-0 text-[#6b0119] text-[14px] md:text-[16px] text-center whitespace-nowrap">
              <p className="leading-[20px] md:leading-[24px]">Descarregar Portfólio</p>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}

function StatsGrid() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-[16px] md:gap-[24px] lg:gap-[32px] w-full">
      <StatCard
        label="PONTUAÇÃO ACADÉMICA TOTAL"
        value="12.450"
        unit="pts"
        color="#6b0119"
        progress={75}
      />
      <StatCard
        label="QUESTIONÁRIOS CONCLUÍDOS"
        value="142"
        unit="de 200 marcos históricos"
        color="#8b1e2d"
        progress={71}
      />
      <StatCard
        label="POSIÇÃO GLOBAL DE PERÍODO"
        value="#12"
        subtext="MELHORES DO PERÍODO"
        rankBadge="Quadro do Sector XX"
        color="white"
        bgColor="#8b1e2d"
      />
      <StatCard
        label="CERTIFICAÇÕES PARA A ÊNFASE"
        value="28"
        unit="validações do arquivo"
        color="#574142"
        progress={null}
      />
    </div>
  );
}

interface StatCardProps {
  label: string;
  value: string;
  unit?: string;
  subtext?: string;
  rankBadge?: string;
  color: string;
  bgColor?: string;
  progress?: number | null;
}

function StatCard({ label, value, unit, subtext, rankBadge, color, bgColor, progress }: StatCardProps) {
  const isRankCard = bgColor !== undefined;

  return (
    <div
      className={`${isRankCard ? '' : 'bg-white'} h-[180px] md:h-[192px] relative rounded-[6px] md:rounded-[8px] overflow-hidden ${!isRankCard ? 'border-b-2 border-[rgba(107,1,25,0.1)]' : ''}`}
      style={isRankCard ? { backgroundColor: bgColor } : undefined}
    >
      <div className="content-stretch flex flex-col items-start justify-between p-[24px] md:p-[28px] lg:p-[32px] relative size-full">
        {/* Label */}
        <div className="content-stretch flex flex-col items-start relative shrink-0 w-full overflow-hidden">
          <div className={`flex flex-col font-['Source_Sans_3:Bold',sans-serif] font-bold justify-center leading-[0] relative shrink-0 ${isRankCard ? 'text-white' : 'text-[#574142]'} text-[10px] md:text-[11px] tracking-[1.1px] uppercase w-full`}>
            <p className="leading-[14px] md:leading-[16.5px] break-words">{label}</p>
          </div>
        </div>

        {/* Value */}
        <div className="content-stretch flex gap-[8px] items-baseline leading-[0] relative shrink-0 w-full overflow-hidden">
          <div className={`flex flex-col font-['Source_Sans_3:Bold',sans-serif] font-bold justify-center relative shrink-0 text-[40px] md:text-[48px]`} style={{ color: isRankCard ? 'white' : color }}>
            <p className="leading-[40px] md:leading-[48px] truncate">{value}</p>
          </div>
          {unit && !isRankCard && (
            <div className="flex flex-col font-['Source_Sans_3:Medium',sans-serif] font-medium justify-center relative text-[#94a3b8] text-[13px] md:text-[14px] overflow-hidden flex-1 min-w-0">
              <p className="leading-[18px] md:leading-[20px] break-words">{unit}</p>
            </div>
          )}
        </div>

        {/* Progress Bar or Subtext */}
        {progress !== null && progress !== undefined ? (
          <div className="h-[20px] md:h-[22px] relative shrink-0 w-full">
            <div className="content-stretch flex flex-col items-start pt-[14px] md:pt-[16px] relative size-full">
              <div className="bg-[#f1f5f9] h-[5px] md:h-[6px] relative rounded-[12px] shrink-0 w-full">
                <div
                  className="absolute bottom-0 left-0 rounded-[12px] top-0"
                  style={{
                    backgroundColor: isRankCard ? 'white' : color,
                    width: `${progress}%`,
                  }}
                />
              </div>
            </div>
          </div>
        ) : subtext ? (
          <div className="content-stretch flex flex-col items-start relative shrink-0 w-full overflow-hidden">
            <div className="flex flex-col font-['Source_Sans_3:Bold',sans-serif] font-bold justify-center leading-[0] relative shrink-0 text-white text-[10px] md:text-[11px] tracking-[1.1px] uppercase w-full">
              <p className="leading-[14px] md:leading-[16.5px] mb-0 break-words">{subtext}</p>
              {rankBadge && <p className="leading-[14px] md:leading-[16.5px] break-words">{rankBadge}</p>}
            </div>
          </div>
        ) : (
          <div className="h-[20px] md:h-[22px] relative shrink-0 w-full overflow-hidden">
            <div className="content-stretch flex flex-col items-start pt-[14px] md:pt-[16px] relative size-full">
              <div className="flex flex-col font-['Source_Sans_3:Regular',sans-serif] font-normal justify-center leading-[0] relative shrink-0 text-[#94a3b8] text-[12px] md:text-[13px] w-full">
                <p className="leading-[16px] md:leading-[18px] break-words">{unit}</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function MeritsAndAccountSection() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-[32px] md:gap-[40px] lg:gap-[48px] w-full">
      {/* Méritos e Distinções - 2/3 width */}
      <div className="lg:col-span-2 content-stretch flex flex-col gap-[24px] md:gap-[32px] items-start relative">
        {/* Header */}
        <div className="content-stretch flex items-center justify-between pb-[12px] md:pb-[17px] relative shrink-0 w-full border-b border-[rgba(222,191,191,0.1)]">
          <div className="flex flex-col font-['IBM_Plex_Sans:Bold',sans-serif] font-bold justify-center leading-[0] relative shrink-0 text-[#8b1e2d] text-[20px] md:text-[24px]" style={{ fontVariationSettings: "'wdth' 100" }}>
            <p className="leading-[28px] md:leading-[32px]">Méritos e Distinções</p>
          </div>
          <div className="flex flex-col font-['Source_Sans_3:SemiBold',sans-serif] font-semibold justify-center leading-[0] relative shrink-0 text-[#6b0119] text-[13px] md:text-[14px] whitespace-nowrap cursor-pointer hover:underline">
            <p className="leading-[18px] md:leading-[20px]">Ver Todos os Certificados</p>
          </div>
        </div>

        {/* Merit Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-[20px] md:gap-[24px] w-full">
          <MeritCardNew
            iconPath={svgPaths.p4fe3ea0}
            iconViewBox="0 0 20 26.25"
            title="Mestre da Moeda"
            description={["Atribuído por completar o percurso", "completo da história monetária do século", "XVIII."]}
            id="AEA-4492-X"
            isActive
          />
          <MeritCardNew
            iconPath={svgPaths.p2bd4edc0}
            iconViewBox="0 0 24.375 20"
            title="Arquivista Principal"
            description={["Reconhecido por contribuir com mais de", "20 fontes primárias para o repositório."]}
            id="AEA-1102-A"
            isActive
          />
          <MeritCardNew
            iconPath={svgPaths.p34a70300}
            iconViewBox="0 0 25 25"
            title="Ligação Institucional"
            description={["Estabelecer 5 ligações institucionais", "dentro da rede do Arquivo."]}
            progress="EM PROGRESSO: 3/5"
            isActive={false}
          />
          <MeritCardNew
            iconPath={svgPaths.p2e076997}
            iconViewBox="0 0 27.5 26.25"
            title="Verificador de Factos Prata"
            description={["Rever 50 submissões da comunidade", "com uma taxa de verificação de 95%."]}
            progress="EM PROGRESSO: 12/50"
            isActive={false}
          />
        </div>
      </div>

      {/* Controles de Conta - 1/3 width */}
      <AccountControlsSectionNew />
    </div>
  );
}

interface MeritCardNewProps {
  iconPath: string;
  iconViewBox: string;
  title: string;
  description: string[];
  id?: string;
  progress?: string;
  isActive: boolean;
}

function MeritCardNew({ iconPath, iconViewBox, title, description, id, progress, isActive }: MeritCardNewProps) {
  return (
    <div className={`bg-[#eff4ff] relative rounded-[6px] md:rounded-[8px] overflow-hidden ${isActive ? '' : 'opacity-60'}`}>
      <div aria-hidden="true" className={`absolute border-l-4 border-solid inset-0 pointer-events-none rounded-[6px] md:rounded-[8px] ${isActive ? 'border-[#6b0119]' : 'border-[rgba(107,1,25,0.2)]'}`} />
      <div className="content-stretch flex gap-[14px] md:gap-[16px] items-start pl-[24px] md:pl-[28px] pr-[20px] md:pr-[24px] py-[20px] md:py-[24px] relative size-full min-h-[139px] md:min-h-[159px]">
        {/* Icon Circle */}
        <div className="bg-white drop-shadow-[0px_1px_1px_rgba(0,0,0,0.05)] relative rounded-[10px] md:rounded-[12px] shrink-0 size-[56px] md:size-[64px] overflow-hidden">
          <div className="content-stretch flex items-center justify-center relative size-full p-2">
            <div className="relative shrink-0 max-w-[80%] max-h-[80%]">
              <svg className="block w-full h-full" fill="none" preserveAspectRatio="xMidYMid meet" viewBox={iconViewBox}>
                <path d={iconPath} fill={isActive ? '#6B0119' : '#CBD5E1'} />
              </svg>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="content-stretch flex flex-col items-start relative flex-1 min-w-0 overflow-hidden">
          {/* Title */}
          <div className="content-stretch flex flex-col items-start relative shrink-0 w-full overflow-hidden">
            <div className={`flex flex-col font-['IBM_Plex_Sans:Bold',sans-serif] font-bold justify-center leading-[0] relative shrink-0 text-[16px] md:text-[18px] w-full ${isActive ? 'text-[#8b1e2d]' : 'text-[#94a3b8]'}`} style={{ fontVariationSettings: "'wdth' 100" }}>
              <p className="leading-[24px] md:leading-[28px] break-words">{title}</p>
            </div>
          </div>

          {/* Description */}
          <div className="content-stretch flex flex-col items-start relative shrink-0 w-full pt-[4px] overflow-hidden">
            <div className={`flex flex-col font-['Source_Sans_3:Regular',sans-serif] font-normal justify-center leading-[0] relative shrink-0 text-[13px] md:text-[14px] w-full ${isActive ? 'text-[#574142]' : 'text-[#94a3b8]'}`}>
              {description.map((line, index) => (
                <p key={index} className={`leading-[18px] md:leading-[20px] break-words ${index < description.length - 1 ? 'mb-0' : ''}`}>{line}</p>
              ))}
            </div>
          </div>

          {/* ID or Progress */}
          <div className="content-stretch flex flex-col items-start pt-[6px] md:pt-[8px] relative shrink-0 w-full overflow-hidden">
            <div className="flex flex-col font-['Source_Sans_3:Bold',sans-serif] font-bold justify-center leading-[0] relative shrink-0 text-[#94a3b8] text-[9px] md:text-[10px] tracking-[1px] uppercase w-full">
              <p className="leading-[13px] md:leading-[15px] break-words">{id || progress}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function AccountControlsSectionNew() {
  return (
    <div className="content-stretch flex flex-col gap-[24px] md:gap-[32px] items-start relative">
      {/* Header */}
      <div className="content-stretch flex flex-col items-start pb-[12px] md:pb-[17px] relative shrink-0 w-full border-b border-[rgba(222,191,191,0.1)]">
        <div className="flex flex-col font-['IBM_Plex_Sans:Bold',sans-serif] font-bold justify-center leading-[0] relative shrink-0 text-[#8b1e2d] text-[20px] md:text-[24px] w-full" style={{ fontVariationSettings: "'wdth' 100" }}>
          <p className="leading-[28px] md:leading-[32px]">Controlos de Conta</p>
        </div>
      </div>

      {/* Settings Panel */}
      <div className="bg-[#dee9fc] relative rounded-[6px] md:rounded-[8px] shrink-0 w-full">
        <div className="content-stretch flex flex-col gap-[20px] md:gap-[24px] items-start p-[24px] md:p-[28px] lg:p-[32px] relative size-full">
          {/* Privacy & Security Section */}
          <div className="content-stretch flex flex-col gap-[12px] md:gap-[16px] items-start relative shrink-0 w-full">
            <div className="flex flex-col font-['Source_Sans_3:Bold',sans-serif] font-bold justify-center leading-[0] relative shrink-0 text-[#574142] text-[13px] md:text-[14px] tracking-[1.4px] uppercase w-full">
              <p className="leading-[18px] md:leading-[20px]">PRIVACIDADE E SEGURANÇA</p>
            </div>
            <div className="content-stretch flex flex-col gap-[6px] md:gap-[8px] items-start relative shrink-0 w-full">
              <CheckboxLabel label="Perfil Académico Público" checked />
              <CheckboxLabel label="Autenticação de Dois Factores" checked={false} />
            </div>
          </div>

          {/* Notifications Section */}
          <div className="content-stretch flex flex-col gap-[12px] md:gap-[16px] items-start pt-[12px] md:pt-[17px] relative shrink-0 w-full border-t border-[rgba(222,191,191,0.2)]">
            <div className="flex flex-col font-['Source_Sans_3:Bold',sans-serif] font-bold justify-center leading-[0] relative shrink-0 text-[#574142] text-[13px] md:text-[14px] tracking-[1.4px] uppercase w-full">
              <p className="leading-[18px] md:leading-[20px]">NOTIFICAÇÕES</p>
            </div>
            <div className="content-stretch flex flex-col gap-[6px] md:gap-[8px] items-start relative shrink-0 w-full">
              <CheckboxLabel label="Atualizações do Arquivo" checked />
              <CheckboxLabel label="Menções de Pares" checked />
            </div>
          </div>

          {/* Deactivate Account Button */}
          <button className="relative rounded-[4px] shrink-0 w-full pt-[24px] md:pt-[36px] pb-[8px] md:pb-[12px] px-[8px] md:px-[12px] cursor-pointer hover:bg-[rgba(186,26,26,0.05)] transition-colors">
            <div className="content-stretch flex items-center justify-between relative size-full">
              <div className="flex flex-col font-['Source_Sans_3:Bold',sans-serif] font-bold justify-center leading-[0] relative shrink-0 text-[#ba1a1a] text-[14px] md:text-[16px]">
                <p className="leading-[20px] md:leading-[24px]">Desativar Conta do Arquivo</p>
              </div>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}

interface CheckboxLabelProps {
  label: string;
  checked: boolean;
}

function CheckboxLabel({ label, checked }: CheckboxLabelProps) {
  return (
    <div className="h-[22px] md:h-[24px] relative shrink-0 w-full">
      <div className="content-stretch flex items-center justify-between relative size-full">
        <div className="flex flex-col font-['Source_Sans_3:Medium',sans-serif] font-medium justify-center leading-[0] relative shrink-0 text-[#121c2a] text-[14px] md:text-[16px]">
          <p className="leading-[20px] md:leading-[24px]">{label}</p>
        </div>
        <div className={`relative shrink-0 size-[16px] md:size-[18px] rounded-[2px] ${checked ? 'bg-[#6b0119]' : 'bg-white border border-[#debfbf]'}`}>
          {checked && (
            <div className="content-stretch flex flex-col items-center justify-center overflow-clip p-px relative rounded-[inherit] size-full">
              <div className="relative shrink-0 size-[14px] md:size-[16px]">
                <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 16 16">
                  <path d={svgPaths.pf079980} fill="white" />
                </svg>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function UserContentSection() {
  const navigate = useNavigate();

  const userContents = [
    {
      id: 1,
      title: "Análise do Sistema Monetário de Luanda no Século XVIII",
      type: "Artigo Académico",
      date: "15 de Março, 2026",
      views: 1245,
      category: "História Económica",
      description: "Estudo detalhado sobre as transformações monetárias e econômicas do sistema de comércio em Luanda durante o século XVIII.",
      author: "Dr. José Ndele"
    },
    {
      id: 2,
      title: "Transições Macroeconómicas no Centro Comercial",
      type: "Documento de Pesquisa",
      date: "2 de Fevereiro, 2026",
      views: 892,
      category: "Economia",
      description: "Análise das mudanças estruturais nos principais centros de comércio e seu impacto na economia regional.",
      author: "Dr. José Ndele"
    },
    {
      id: 3,
      title: "Repositório de Moeda do Século XIX - Vol. 3",
      type: "Compilação Histórica",
      date: "10 de Janeiro, 2026",
      views: 2103,
      category: "Numismática",
      description: "Terceiro volume da compilação histórica de moedas circuladas em território angolano no século XIX.",
      author: "Dr. José Ndele"
    },
    {
      id: 4,
      title: "Influências Comerciais nas Políticas Monetárias Coloniais",
      type: "Artigo Académico",
      date: "18 de Dezembro, 2025",
      views: 756,
      category: "História Económica",
      description: "Investigação sobre como as rotas comerciais influenciaram as decisões de política monetária durante o período colonial.",
      author: "Dr. José Ndele"
    },
    {
      id: 5,
      title: "Metodologia de Catalogação para Arquivos Históricos",
      type: "Guia Metodológico",
      date: "5 de Novembro, 2025",
      views: 1567,
      category: "Arquivologia",
      description: "Guia completo para catalogação e preservação de documentos históricos em arquivos digitais e físicos.",
      author: "Dr. José Ndele"
    },
    {
      id: 6,
      title: "Redes Comerciais do Atlântico Sul: Uma Perspectiva Angolana",
      type: "Artigo Académico",
      date: "22 de Outubro, 2025",
      views: 1834,
      category: "História Comercial",
      description: "Mapeamento das principais rotas e redes comerciais que conectavam Angola ao comércio transatlântico.",
      author: "Dr. José Ndele"
    }
  ];

  return (
    <div className="content-stretch flex flex-col gap-[24px] md:gap-[32px] items-start relative shrink-0 w-full">
      {/* Header */}
      <div className="content-stretch flex items-center justify-between pb-[12px] md:pb-[17px] relative shrink-0 w-full border-b border-[rgba(222,191,191,0.1)]">
        <div className="flex flex-col font-['IBM_Plex_Sans:Bold',sans-serif] font-bold justify-center leading-[0] relative shrink-0 text-[#8b1e2d] text-[20px] md:text-[24px]" style={{ fontVariationSettings: "'wdth' 100" }}>
          <p className="leading-[28px] md:leading-[32px]">Conteúdos Criados</p>
        </div>
        <div className="flex items-center gap-[8px]">
          <div className="flex flex-col font-['Source_Sans_3:Medium',sans-serif] font-medium justify-center leading-[0] relative shrink-0 text-[#574142] text-[13px] md:text-[14px]">
            <p className="leading-[18px] md:leading-[20px]">{userContents.length} publicações</p>
          </div>
        </div>
      </div>

      {/* Content List */}
      <div className="grid grid-cols-1 gap-[16px] md:gap-[20px] w-full">
        {userContents.map((content) => (
          <ContentCard
            key={content.id}
            id={content.id}
            title={content.title}
            category={content.category}
            type={content.type}
            date={content.date}
            views={content.views}
            description={content.description}
            author={content.author}
            onClick={() => navigate(`/documento/${content.id}`)}
          />
        ))}
      </div>
    </div>
  );
}
