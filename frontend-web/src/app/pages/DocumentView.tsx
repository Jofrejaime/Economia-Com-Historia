import { useNavigate } from 'react-router';
import SystemHeader from '../components/SystemHeader';
import SystemFooter from '../components/SystemFooter';
import svgPaths from '../../imports/Main-1/svg-vq8xl1me02';
import imgHeroSection from '../../imports/Main-1/4b6e0546dbaab2bf9ed258c71538dd070f4810d3.png';
import imgDocument from '../../imports/Main-1/d744eb6e5c53ff4b5830fcac3bcbb5b0333d7c77.png';

export default function DocumentView() {
  const navigate = useNavigate();

  return (
    <div className="bg-[#f8f9ff] flex flex-col min-h-screen">
      <SystemHeader />

      <main className="flex-1 w-full">
        {/* Breadcrumbs */}
        <div className="bg-[#eff4ff] w-full">
          <div className="max-w-[1536px] mx-auto px-[24px] md:px-[32px] lg:px-[48px] py-[16px]">
            <div className="flex gap-[8px] items-center">
              <button
                onClick={() => navigate('/inicio')}
                className="font-['Source_Sans_3:Regular',sans-serif] text-[#64748b] text-[11px] md:text-[12px] tracking-[1.2px] uppercase leading-[16px] hover:text-[#6b0119] transition-colors"
              >
                INÍCIO
              </button>
              <svg className="h-[5px] w-[3.083px]" fill="none" viewBox="0 0 3.08333 5">
                <path d={svgPaths.p200a4600} fill="#64748B" />
              </svg>
              <button
                onClick={() => navigate('/arquivo')}
                className="font-['Source_Sans_3:Regular',sans-serif] text-[#64748b] text-[11px] md:text-[12px] tracking-[1.2px] uppercase leading-[16px] hover:text-[#6b0119] transition-colors"
              >
                CONTEÚDO
              </button>
              <svg className="h-[5px] w-[3.083px]" fill="none" viewBox="0 0 3.08333 5">
                <path d={svgPaths.p200a4600} fill="#64748B" />
              </svg>
              <span className="font-['Source_Sans_3:Regular',sans-serif] text-[#64748b] text-[11px] md:text-[12px] tracking-[1.2px] uppercase leading-[16px]">
                INFRAESTRUTURA
              </span>
              <svg className="h-[5px] w-[3.083px]" fill="none" viewBox="0 0 3.08333 5">
                <path d={svgPaths.p200a4600} fill="#64748B" />
              </svg>
              <span className="font-['Source_Sans_3:SemiBold',sans-serif] font-bold text-[#6b0119] text-[11px] md:text-[12px] tracking-[1.2px] uppercase leading-[16px]">
                CAMINHO DE FERRO DE BENGUELA
              </span>
            </div>
          </div>
        </div>

        {/* Hero Section */}
        <div className="relative w-full h-[400px] md:h-[500px] lg:h-[614px] flex items-end overflow-hidden">
          <div className="absolute inset-0">
            <img
              alt="O Caminho de Ferro de Benguela"
              className="absolute h-full w-full object-cover"
              src={imgHeroSection}
              style={{ transform: 'scale(4.2)' }}
            />
            <div className="absolute inset-0 bg-white mix-blend-saturation" />
          </div>
          <div className="absolute inset-0 bg-gradient-to-t from-[rgba(107,1,25,0.8)] via-[rgba(107,1,25,0)] to-[rgba(107,1,25,0)]" />
          <div className="relative max-w-[1536px] mx-auto w-full px-[24px] md:px-[32px] lg:px-[48px] pb-[32px] md:pb-[48px] lg:pb-[64px]">
            <div className="flex flex-col gap-[16px] md:gap-[20px] lg:gap-[24px]">
              <div className="flex gap-[12px] md:gap-[16px] flex-wrap">
                <div className="backdrop-blur-[6px] bg-[rgba(255,255,255,0.1)] border border-[rgba(255,255,255,0.2)] px-[10px] md:px-[13px] py-[3px] md:py-[4px]">
                  <span className="font-['Source_Sans_3:SemiBold',sans-serif] font-semibold text-white text-[10px] md:text-[11px] tracking-[1.1px] uppercase leading-[15px] md:leading-[16.5px]">
                    FONTE PRIMÁRIA • 1912
                  </span>
                </div>
                <div className="backdrop-blur-[6px] bg-[rgba(255,255,255,0.1)] border border-[rgba(255,255,255,0.2)] px-[10px] md:px-[13px] py-[3px] md:py-[4px]">
                  <span className="font-['Source_Sans_3:SemiBold',sans-serif] font-semibold text-white text-[10px] md:text-[11px] tracking-[1.1px] uppercase leading-[15px] md:leading-[16.5px]">
                    IMPACTO SOCIOECONÓMICO
                  </span>
                </div>
              </div>
              <h1 className="font-['IBM_Plex_Sans:Bold',sans-serif] font-bold text-white text-[32px] md:text-[52px] lg:text-[72px] tracking-[-1.6px] md:tracking-[-2.6px] lg:tracking-[-3.6px] leading-[38px] md:leading-[58px] lg:leading-[72px] max-w-[896px]" style={{ fontVariationSettings: "'wdth' 100" }}>
                O Caminho de Ferro de Benguela: Análise de Impacto Fiscal
              </h1>
            </div>
          </div>
        </div>

        {/* Two-Column Layout */}
        <div className="max-w-[1536px] mx-auto px-[24px] md:px-[32px] lg:px-[48px] py-[48px] md:py-[72px] lg:py-[96px]">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-[32px] md:gap-[48px] lg:gap-[64px]">
            {/* Left Column - Main Content */}
            <div className="lg:col-span-8">
              <div className="flex flex-col gap-[32px] md:gap-[40px] lg:gap-[48px]">
                {/* Resumo Executivo */}
                <section>
                  <h2 className="font-['IBM_Plex_Sans:Bold',sans-serif] font-bold text-[#6b0119] text-[20px] md:text-[22px] lg:text-[24px] leading-[28px] md:leading-[30px] lg:leading-[32px] mb-[16px] md:mb-[20px] lg:mb-[23px]" style={{ fontVariationSettings: "'wdth' 100" }}>
                    Resumo Executivo
                  </h2>
                  <p className="font-['Source_Sans_3:Regular',sans-serif] text-[16px] md:text-[17px] lg:text-[18px] text-[rgba(18,28,42,0.8)] leading-[27px] md:leading-[29px] lg:leading-[30.6px]">
                    Este documento constitui um marco fundamental na historiografia económica de Angola, detalhando a estruturação financeira e as projeções de retorno sobre o investimento do Caminho de Ferro de Benguela (CFB) durante o seu primeiro decénio de operação. A análise foca-se especificamente no equilíbrio entre as concessões estatais e o capital privado britânico.
                  </p>
                </section>

                {/* Quote */}
                <div className="bg-[#eff4ff] border-l-4 border-[#6b0119] pl-[24px] md:pl-[32px] lg:pl-[36px] pr-[20px] md:pr-[28px] lg:pr-[32px] py-[32px] md:py-[40px] lg:py-[48px]">
                  <p className="font-['Source_Sans_3:Italic',sans-serif] italic text-[#8b1e2d] text-[18px] md:text-[21px] lg:text-[24px] leading-[30px] md:leading-[34px] lg:leading-[39px]">
                    "A ferrovia não foi apenas um meio de transporte, mas a artéria vital da economia colonial, redefinindo as rotas comerciais de toda a África Austral e vinculando o destino do Planalto Central aos mercados globais de commodities."
                  </p>
                </div>

                {/* Contexto Histórico */}
                <section>
                  <h2 className="font-['IBM_Plex_Sans:Bold',sans-serif] font-bold text-[#6b0119] text-[20px] md:text-[22px] lg:text-[24px] leading-[28px] md:leading-[30px] lg:leading-[32px] mb-[16px] md:mb-[20px] lg:mb-[23px]" style={{ fontVariationSettings: "'wdth' 100" }}>
                    Contexto Histórico
                  </h2>
                  <div className="flex flex-col gap-[12px] md:gap-[13px] lg:gap-[15px]">
                    <p className="font-['Source_Sans_3:Regular',sans-serif] text-[16px] md:text-[17px] lg:text-[18px] text-[rgba(18,28,42,0.8)] leading-[27px] md:leading-[29px] lg:leading-[30.6px]">
                      A construção do CFB iniciou-se em 1903, sob a égide de Sir Robert Williams, visionário que procurava conectar o Porto de Lobito às ricas jazidas de cobre do Catanga. Este relatório de 1912 examina o período crítico de transição entre a fase de construção intensiva e o início da exploração comercial regular.
                    </p>
                    <p className="font-['Source_Sans_3:Regular',sans-serif] text-[16px] md:text-[17px] lg:text-[18px] text-[rgba(18,28,42,0.8)] leading-[27px] md:leading-[29px] lg:leading-[30.6px]">
                      A análise demonstra como o traçado foi influenciado não apenas pela topografia, mas por necessidades políticas de afirmação da soberania portuguesa no interior, contrastando com os interesses estritamente extrativistas das companhias concessionárias.
                    </p>
                  </div>
                </section>

                {/* Análise de Fluxos de Capital */}
                <section>
                  <h2 className="font-['IBM_Plex_Sans:Bold',sans-serif] font-bold text-[#6b0119] text-[20px] md:text-[22px] lg:text-[24px] leading-[28px] md:leading-[30px] lg:leading-[32px] mb-[16px] md:mb-[20px] lg:mb-[23px]" style={{ fontVariationSettings: "'wdth' 100" }}>
                    Análise de Fluxos de Capital
                  </h2>
                  <p className="font-['Source_Sans_3:Regular',sans-serif] text-[16px] md:text-[17px] lg:text-[18px] text-[rgba(18,28,42,0.8)] leading-[27px] md:leading-[29px] lg:leading-[30.6px] mb-[16px] md:mb-[20px] lg:mb-[23px]">
                    Os registos fiscais de 1912 revelam uma dependência significativa das taxas de trânsito de mercadorias agrícolas e minerais. O capital investido, predominantemente proveniente de sindicatos bancários de Londres e Lisboa, exigia garantias de juros que pressionavam as contas públicas da colónia.
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-[16px] mt-[9px]">
                    <div className="bg-[#e6eeff] h-[140px] md:h-[160px] lg:h-[192px] flex items-center justify-center rounded-[4px]">
                      <span className="font-['Source_Sans_3:Regular',sans-serif] text-[#94a3b8] text-[11px] md:text-[12px] tracking-[1.2px] uppercase leading-[16px]">
                        [DIAGRAMA DE FLUXO FINANCEIRO 1912]
                      </span>
                    </div>
                    <div className="bg-[#dee9fc] h-[140px] md:h-[160px] lg:h-[192px] flex items-center justify-center rounded-[4px]">
                      <span className="font-['Source_Sans_3:Regular',sans-serif] text-[#94a3b8] text-[11px] md:text-[12px] tracking-[1.2px] uppercase leading-[16px]">
                        [TABELA DE EXPORTAÇÕES POR PORTO]
                      </span>
                    </div>
                  </div>
                </section>
              </div>
            </div>

            {/* Right Column - Sidebar */}
            <div className="lg:col-span-4">
              <div className="lg:sticky lg:top-[24px] flex flex-col gap-[24px] md:gap-[28px] lg:gap-[32px]">
                {/* Digital Document Card */}
                <div className="bg-white drop-shadow-[0px_1px_1px_rgba(0,0,0,0.05)] rounded-[4px] border-t-4 border-[#6b0119] p-[20px] md:p-[22px] lg:p-[24px] pt-[24px] md:pt-[26px] lg:pt-[28px]">
                  <h3 className="font-['IBM_Plex_Sans:Bold',sans-serif] font-bold text-[#64748b] text-[11px] md:text-[12px] tracking-[1.2px] uppercase leading-[16px] mb-[16px]" style={{ fontVariationSettings: "'wdth' 100" }}>
                    DOCUMENTO DIGITALIZADO
                  </h3>
                  <div className="bg-[#e6eeff] rounded-[4px] overflow-hidden mb-[16px] relative group cursor-pointer">
                    <img
                      alt="Documento digitalizado"
                      className="w-full h-auto opacity-80 mix-blend-multiply"
                      src={imgDocument}
                    />
                    <div className="absolute inset-0 backdrop-blur-[2px] bg-[rgba(107,1,25,0.2)] opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <svg className="size-[24px] md:size-[27px]" fill="none" viewBox="0 0 27 27">
                        <path d={svgPaths.p4fe0e00} fill="white" />
                      </svg>
                    </div>
                  </div>
                  <div className="flex flex-col gap-[10px] md:gap-[12px] pt-[6px] md:pt-[8px]">
                    <button className="bg-[#8b1e2d] hover:bg-[#7a1a27] transition-colors flex gap-[8px] items-center justify-center py-[14px] md:py-[16px] rounded-[6px]">
                      <svg className="size-[14px] md:size-[16px]" fill="none" viewBox="0 0 16 16">
                        <path d={svgPaths.p1c92c780} fill="white" />
                      </svg>
                      <span className="font-['Source_Sans_3:SemiBold',sans-serif] font-bold text-white text-[14px] md:text-[16px] leading-[20px] md:leading-[24px]">
                        Descarregar PDF (4.2 MB)
                      </span>
                    </button>
                    <button className="border border-[#debfbf] hover:bg-[#f8f9ff] transition-colors flex gap-[8px] items-center justify-center py-[11px] md:py-[13px] rounded-[6px]">
                      <svg className="h-[10px] md:h-[12px] w-[15px] md:w-[17px]" fill="none" viewBox="0 0 17 12">
                        <path d={svgPaths.p300fe680} fill="#6B0119" />
                      </svg>
                      <span className="font-['Source_Sans_3:SemiBold',sans-serif] font-semibold text-[#6b0119] text-[14px] md:text-[16px] leading-[20px] md:leading-[24px]">
                        Citar Documento
                      </span>
                    </button>
                    <button className="border border-[#debfbf] hover:bg-[#f8f9ff] transition-colors flex gap-[8px] items-center justify-center py-[11px] md:py-[13px] rounded-[6px]">
                      <svg className="h-[16px] md:h-[18px] w-[12px] md:w-[14px]" fill="none" viewBox="0 0 14 18">
                        <path d={svgPaths.p1db08b60} fill="#475569" />
                      </svg>
                      <span className="font-['Source_Sans_3:SemiBold',sans-serif] font-semibold text-[#475569] text-[14px] md:text-[16px] leading-[20px] md:leading-[24px]">
                        Adicionar aos Favoritos
                      </span>
                    </button>
                  </div>
                </div>

                {/* Metadata List */}
                <div className="bg-[#eff4ff] rounded-[4px] p-[24px] md:p-[28px] lg:p-[32px]">
                  <h3 className="font-['IBM_Plex_Sans:Bold',sans-serif] font-bold text-[#0f172a] text-[11px] md:text-[12px] tracking-[1.2px] uppercase leading-[16px] mb-[20px] md:mb-[24px]" style={{ fontVariationSettings: "'wdth' 100" }}>
                    METADADOS DO ARQUIVO
                  </h3>
                  <div className="flex flex-col gap-[20px] md:gap-[24px]">
                    <div>
                      <div className="font-['Source_Sans_3:Regular',sans-serif] text-[#64748b] text-[9px] md:text-[10px] tracking-[1px] uppercase leading-[14px] md:leading-[15px] mb-[4px]">
                        AUTOR
                      </div>
                      <div className="font-['Source_Sans_3:SemiBold',sans-serif] font-semibold text-[#6b0119] text-[13px] md:text-[14px] leading-[18px] md:leading-[20px]">
                        Conselho Ultramarino
                      </div>
                    </div>
                    <div>
                      <div className="font-['Source_Sans_3:Regular',sans-serif] text-[#64748b] text-[9px] md:text-[10px] tracking-[1px] uppercase leading-[14px] md:leading-[15px] mb-[4px]">
                        DATA DE EMISSÃO
                      </div>
                      <div className="font-['Source_Sans_3:SemiBold',sans-serif] font-semibold text-[#0f172a] text-[13px] md:text-[14px] leading-[18px] md:leading-[20px]">
                        14 de Agosto de 1912
                      </div>
                    </div>
                    <div>
                      <div className="font-['Source_Sans_3:Regular',sans-serif] text-[#64748b] text-[9px] md:text-[10px] tracking-[1px] uppercase leading-[14px] md:leading-[15px] mb-[4px]">
                        TIPO DE REGISTO
                      </div>
                      <div className="font-['Source_Sans_3:SemiBold',sans-serif] font-semibold text-[#0f172a] text-[13px] md:text-[14px] leading-[18px] md:leading-[20px]">
                        Relatório Fiscal e Estatístico
                      </div>
                    </div>
                    <div>
                      <div className="font-['Source_Sans_3:Regular',sans-serif] text-[#64748b] text-[9px] md:text-[10px] tracking-[1px] uppercase leading-[14px] md:leading-[15px] mb-[4px]">
                        LOCALIZAÇÃO FÍSICA
                      </div>
                      <div className="font-['Source_Sans_3:SemiBold',sans-serif] font-semibold text-[#0f172a] text-[13px] md:text-[14px] leading-[18px] md:leading-[20px]">
                        Sala A, Prateleira 4, Caixa 102-B
                      </div>
                    </div>
                    <div>
                      <div className="font-['Source_Sans_3:Regular',sans-serif] text-[#64748b] text-[9px] md:text-[10px] tracking-[1px] uppercase leading-[14px] md:leading-[15px] mb-[4px]">
                        ID ÚNICO
                      </div>
                      <div className="font-['Liberation_Mono:Regular',sans-serif] text-[#64748b] text-[11px] md:text-[12px] leading-[15px] md:leading-[16px]">
                        ANA-CFB-1912-004-R
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Discussion Section */}
        <div className="bg-[#f8fafc] border-t border-[rgba(226,232,240,0.1)] w-full">
          <div className="max-w-[1536px] mx-auto px-[24px] md:px-[32px] lg:px-[48px] py-[48px] md:py-[72px] lg:py-[96px]">
            <div className="flex flex-col gap-[32px] md:gap-[40px] lg:gap-[48px]">
              {/* Header */}
              <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-[20px] md:gap-[24px]">
                <div>
                  <h2 className="font-['IBM_Plex_Sans:Bold',sans-serif] font-bold text-[#0f172a] text-[24px] md:text-[28px] lg:text-[30px] leading-[32px] md:leading-[34px] lg:leading-[36px] mb-[6px] md:mb-[8px]" style={{ fontVariationSettings: "'wdth' 100" }}>
                    Discussão Académica
                  </h2>
                  <p className="font-['Source_Sans_3:Regular',sans-serif] text-[#64748b] text-[14px] md:text-[15px] lg:text-[16px] leading-[21px] md:leading-[23px] lg:leading-[24px]">
                    Comentários recentes de investigadores da rede.
                  </p>
                </div>
                <div className="flex flex-col sm:flex-row gap-[12px] sm:gap-[16px]">
                  <button
                    onClick={() => navigate('/comunidade/criar-topico')}
                    className="bg-[#8b1e2d] hover:bg-[#7a1a27] transition-colors px-[20px] md:px-[24px] py-[12px] md:py-[14px] rounded-[6px] flex items-center justify-center gap-[8px]"
                  >
                    <svg className="size-[16px]" fill="none" viewBox="0 0 16 16">
                      <path d="M8 3V13M3 8H13" stroke="white" strokeWidth="2" strokeLinecap="round"/>
                    </svg>
                    <span className="font-['Source_Sans_3:SemiBold',sans-serif] font-bold text-white text-[14px] md:text-[15px] lg:text-[16px] leading-[20px] md:leading-[22px] lg:leading-[24px] whitespace-nowrap">
                      Criar Tópico
                    </span>
                  </button>
                  <button
                    onClick={() => navigate('/comunidade')}
                    className="flex gap-[8px] items-center group hover:opacity-70 transition-opacity px-[8px]"
                  >
                    <span className="font-['Source_Sans_3:SemiBold',sans-serif] font-bold text-[#6b0119] text-[14px] md:text-[15px] lg:text-[16px] leading-[20px] md:leading-[22px] lg:leading-[24px] whitespace-nowrap">
                      Ver todas as discussões
                    </span>
                    <svg className="size-[14px] md:size-[16px]" fill="none" viewBox="0 0 16 16">
                      <path d={svgPaths.p1a406200} fill="#6B0119" />
                    </svg>
                  </button>
                </div>
              </div>

              {/* Comments Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-[20px] md:gap-[24px] lg:gap-[32px]">
                {/* Comment 1 */}
                <div
                  onClick={() => navigate('/comunidade/discussao')}
                  className="bg-white drop-shadow-[0px_1px_1px_rgba(0,0,0,0.05)] border-l-2 border-[#8b1e2d] pl-[24px] md:pl-[30px] lg:pl-[34px] pr-[24px] md:pr-[28px] lg:pr-[32px] py-[24px] md:py-[28px] lg:py-[32px] cursor-pointer hover:shadow-[0px_4px_12px_rgba(0,0,0,0.08)] transition-shadow"
                >
                  <div className="flex gap-[12px] md:gap-[14px] lg:gap-[16px] items-center mb-[12px] md:mb-[14px] lg:mb-[15.5px]">
                    <div className="bg-[#dee9fc] rounded-[12px] size-[36px] md:size-[38px] lg:size-[40px] flex items-center justify-center shrink-0">
                      <span className="font-['Source_Sans_3:SemiBold',sans-serif] font-bold text-[#6b0119] text-[14px] md:text-[15px] lg:text-[16px] leading-[20px] md:leading-[22px] lg:leading-[24px]">
                        DA
                      </span>
                    </div>
                    <div>
                      <div className="font-['IBM_Plex_Sans:Bold',sans-serif] font-bold text-[#121c2a] text-[13px] md:text-[14px] leading-[18px] md:leading-[20px] mb-[2px]" style={{ fontVariationSettings: "'wdth' 100" }}>
                        Dr. Afonso Henriques
                      </div>
                      <div className="font-['Source_Sans_3:Regular',sans-serif] text-[#94a3b8] text-[9px] md:text-[10px] tracking-[1px] uppercase leading-[13px] md:leading-[15px]">
                        UNIVERSIDADE AGOSTINHO NETO
                      </div>
                    </div>
                  </div>
                  <p className="font-['Source_Sans_3:Italic',sans-serif] italic text-[#574142] text-[14px] md:text-[15px] lg:text-[16px] leading-[22px] md:leading-[23px] lg:leading-[24px] mb-[12px] md:mb-[14px] lg:mb-[15.5px] line-clamp-2">
                    "A análise da pág. 14 sobre os subsídios ao carvão é crucial para entender por que a tração a vapor persistiu tanto tempo em relação à eletrificação sugerida posteriormente..."
                  </p>
                  <div className="flex gap-[12px] md:gap-[14px] lg:gap-[16px] items-center">
                    <span className="font-['Source_Sans_3:Regular',sans-serif] text-[#94a3b8] text-[11px] md:text-[12px] leading-[15px] md:leading-[16px]">
                      Há 2 dias
                    </span>
                    <div className="flex gap-[4px] items-center">
                      <svg className="size-[10px] md:size-[11.667px]" fill="none" viewBox="0 0 11.6667 11.6667">
                        <path d={svgPaths.p2725ef00} fill="#94A3B8" />
                      </svg>
                      <span className="font-['Source_Sans_3:Regular',sans-serif] text-[#94a3b8] text-[11px] md:text-[12px] leading-[15px] md:leading-[16px]">
                        4 respostas
                      </span>
                    </div>
                  </div>
                </div>

                {/* Comment 2 */}
                <div
                  onClick={() => navigate('/comunidade/discussao')}
                  className="bg-white drop-shadow-[0px_1px_1px_rgba(0,0,0,0.05)] border-l-2 border-[#cbd5e1] pl-[24px] md:pl-[30px] lg:pl-[34px] pr-[24px] md:pr-[28px] lg:pr-[32px] py-[24px] md:py-[28px] lg:py-[32px] cursor-pointer hover:shadow-[0px_4px_12px_rgba(0,0,0,0.08)] transition-shadow"
                >
                  <div className="flex gap-[12px] md:gap-[14px] lg:gap-[16px] items-center mb-[12px] md:mb-[14px] lg:mb-[15.5px]">
                    <div className="bg-[#dee9fc] rounded-[12px] size-[36px] md:size-[38px] lg:size-[40px] flex items-center justify-center shrink-0">
                      <span className="font-['Source_Sans_3:SemiBold',sans-serif] font-bold text-[#64748b] text-[14px] md:text-[15px] lg:text-[16px] leading-[20px] md:leading-[22px] lg:leading-[24px]">
                        MS
                      </span>
                    </div>
                    <div>
                      <div className="font-['IBM_Plex_Sans:Bold',sans-serif] font-bold text-[#121c2a] text-[13px] md:text-[14px] leading-[18px] md:leading-[20px] mb-[2px]" style={{ fontVariationSettings: "'wdth' 100" }}>
                        Maria dos Santos
                      </div>
                      <div className="font-['Source_Sans_3:Regular',sans-serif] text-[#94a3b8] text-[9px] md:text-[10px] tracking-[1px] uppercase leading-[13px] md:leading-[15px]">
                        INVESTIGADORA INDEPENDENTE
                      </div>
                    </div>
                  </div>
                  <p className="font-['Source_Sans_3:Italic',sans-serif] italic text-[#574142] text-[14px] md:text-[15px] lg:text-[16px] leading-[22px] md:leading-[23px] lg:leading-[24px] mb-[12px] md:mb-[14px] lg:mb-[15.5px] line-clamp-2">
                    "Alguém tem dados complementares sobre a mão-de-obra local recrutada no Huambo citada nos anexos deste relatório? Gostaria de comparar com os censos de 1915."
                  </p>
                  <div className="flex gap-[12px] md:gap-[14px] lg:gap-[16px] items-center">
                    <span className="font-['Source_Sans_3:Regular',sans-serif] text-[#94a3b8] text-[11px] md:text-[12px] leading-[15px] md:leading-[16px]">
                      Há 1 semana
                    </span>
                    <div className="flex gap-[4px] items-center">
                      <svg className="size-[10px] md:size-[11.667px]" fill="none" viewBox="0 0 11.6667 11.6667">
                        <path d={svgPaths.p2725ef00} fill="#94A3B8" />
                      </svg>
                      <span className="font-['Source_Sans_3:Regular',sans-serif] text-[#94a3b8] text-[11px] md:text-[12px] leading-[15px] md:leading-[16px]">
                        0 respostas
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <SystemFooter />
    </div>
  );
}
