import { useNavigate } from 'react-router';
import svgPaths from '../../imports/Html→Body-2/svg-nm0c0smz3h';
import imgHero from '../../imports/Html→Body-2/f32997422bf94ed2b3bce31b441b7339e05f444f.png';

export default function LandingPage() {
  const navigate = useNavigate();

  return (
    <div className="bg-[#f8f9ff] flex flex-col min-h-screen">
      {/* Header */}
      <header className="bg-white w-full border-b border-[rgba(226,232,240,0.3)]">
        <div className="max-w-[1536px] mx-auto px-[24px] md:px-[32px] lg:px-[48px] py-[16px] md:py-[20px] lg:py-[24px] flex items-center justify-between">
          <div className="flex flex-col font-['Source_Sans_3:Bold',sans-serif] font-bold justify-center leading-[0] text-[#7f1d1d] text-[18px] md:text-[20px] lg:text-[24px] tracking-[-1.2px] whitespace-nowrap">
            <p className="leading-[24px] md:leading-[28px] lg:leading-[32px]">Economia com História</p>
          </div>

          <button
            onClick={() => navigate('/login')}
            className="font-['Source_Sans_3:SemiBold',sans-serif] font-semibold text-[#6b0119] text-[14px] md:text-[16px] px-[20px] md:px-[28px] py-[8px] md:py-[10px] rounded-[6px] border border-[#6b0119] hover:bg-[#6b0119] hover:text-white transition-colors cursor-pointer"
          >
            Entrar
          </button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="flex-1 w-full py-[48px] md:py-[64px] lg:py-[96px]">
        <div className="max-w-[1536px] mx-auto px-[24px] md:px-[32px] lg:px-[48px]">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-[32px] lg:gap-[48px] items-center">
            {/* Left Content */}
            <div className="lg:col-span-6 flex flex-col gap-[24px] md:gap-[32px]">
              <div className="flex flex-col gap-[8px]">
                <div className="flex flex-col font-['Source_Sans_3:Bold',sans-serif] font-bold text-[#8b1e2d] text-[12px] md:text-[14px] tracking-[1.4px] uppercase leading-[16px] md:leading-[20px]">
                  <p>Arquivo Digital</p>
                </div>
              </div>

              <div className="flex flex-col gap-[16px] md:gap-[20px]">
                <h1 className="font-['IBM_Plex_Sans:Bold',sans-serif] font-bold text-[#6b0119] text-[36px] md:text-[42px] lg:text-[48px] xl:text-[54px] tracking-[-1.2px] leading-[40px] md:leading-[46px] lg:leading-[52px] xl:leading-[60px]" style={{ fontVariationSettings: "'wdth' 100" }}>
                  Arquivo Digital do Pensamento Económico de Angola
                </h1>

                <div className="flex flex-col font-['Source_Sans_3:Regular',sans-serif] font-normal text-[#574142] text-[16px] md:text-[18px] leading-[26px] md:leading-[28px]">
                  <p>Preservando décadas de história económica. Explore, pesquise e contribua. O</p>
                  <p>conhecimento agora tem morada.</p>
                </div>
              </div>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-[16px] pt-[24px]">
                <button
                  onClick={() => navigate('/login')}
                  className="bg-[#8b1e2d] flex items-center justify-center px-[32px] md:px-[40px] py-[18px] md:py-[21px] rounded-[4px] shadow-[0px_40px_40px_-20px_rgba(18,28,42,0.06)] cursor-pointer hover:bg-[#7a1a27] transition-colors"
                >
                  <span className="font-['Source_Sans_3:Bold',sans-serif] font-bold text-white text-[16px] md:text-[18px] leading-[24px] md:leading-[28px]">
                    Aceder ao Arquivo
                  </span>
                </button>

                <button
                  onClick={() => navigate('/criar-conta')}
                  className="border border-[rgba(222,191,191,0.3)] flex items-center justify-center px-[32px] md:px-[41px] py-[18px] md:py-[21px] rounded-[4px] cursor-pointer hover:bg-[rgba(107,1,25,0.05)] transition-colors"
                >
                  <span className="font-['Source_Sans_3:SemiBold',sans-serif] font-semibold text-[#6b0119] text-[16px] md:text-[18px] leading-[24px] md:leading-[28px]">
                    Saiba Mais
                  </span>
                </button>
              </div>
            </div>

            {/* Right Image */}
            <div className="lg:col-span-6 flex items-center justify-center">
              <div className="relative w-full max-w-[600px] h-[400px] md:h-[500px] lg:h-[600px]">
                <div className="absolute inset-[-30px] md:inset-[-40px]" style={{ containerType: "size" }}>
                  <div className="flex-none h-[100cqh] w-[100cqw]">
                    <div className="bg-[#dee9fc] blur-[32px] opacity-20 rounded-[12px] size-full" />
                  </div>
                </div>

                <div className="relative w-full h-full rounded-[16px] shadow-[0px_40px_40px_-20px_rgba(18,28,42,0.06)] overflow-hidden">
                  <div className="absolute inset-0 overflow-hidden">
                    <img alt="Arquivo Digital" className="absolute w-full h-[116%] left-0 top-[-8%] object-cover" src={imgHero} />
                  </div>
                  <div className="absolute bg-[rgba(255,255,255,0.2)] inset-0 mix-blend-saturation" />
                </div>

                {/* Stats Card Overlay */}
                <div className="absolute bottom-[-16px] md:bottom-[-32px] left-[-16px] md:left-[-32px] bg-white p-[24px] md:p-[32px] rounded-[8px] shadow-[0px_40px_40px_-20px_rgba(18,28,42,0.06)] border-l-4 border-[#6b0119]">
                  <div className="flex flex-col gap-[4px]">
                    <div className="font-['Source_Sans_3:Bold',sans-serif] font-bold text-[#6b0119] text-[24px] md:text-[30px] leading-[30px] md:leading-[36px]">
                      12M+
                    </div>
                    <div className="font-['Source_Sans_3:Medium',sans-serif] font-medium text-[#64748b] text-[12px] md:text-[14px] tracking-[1.4px] uppercase leading-[16px] md:leading-[20px]">
                      DOCUMENTOS DIGITALIZADOS
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="bg-white w-full py-[64px] md:py-[80px] lg:py-[96px]">
        <div className="max-w-[1536px] mx-auto px-[24px] md:px-[32px] lg:px-[48px]">
          <div className="flex flex-col gap-[48px] md:gap-[64px] items-center">
            {/* Section Header */}
            <div className="flex flex-col gap-[16px] md:gap-[24px] items-center max-w-[672px] text-center">
              <h2 className="font-['IBM_Plex_Sans:Bold',sans-serif] font-bold text-[#6b0119] text-[30px] md:text-[36px] tracking-[-0.72px] leading-[36px] md:leading-[40px]" style={{ fontVariationSettings: "'wdth' 100" }}>
                Por que Juntar-se ao Arquivo?
              </h2>
              <p className="font-['Source_Sans_3:Regular',sans-serif] font-normal text-[#574142] text-[16px] md:text-[18px] leading-[26px] md:leading-[28px]">
                Uma plataforma completa para investigadores, estudantes e académicos explorarem a história económica de Angola.
              </p>
            </div>

            {/* Features Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-[48px] md:gap-[64px] w-full">
              {/* Feature 1 */}
              <div className="flex flex-col gap-[16px] items-start">
                <div className="size-[40px] md:size-[48px] bg-[#dee9fc] rounded-[8px] flex items-center justify-center">
                  <svg className="size-[20px] md:size-[24px]" fill="none" viewBox="0 0 30 22">
                    <path d={svgPaths.pb257040} fill="#6b0119" />
                  </svg>
                </div>
                <h3 className="font-['Source_Sans_3:Bold',sans-serif] font-bold text-[#6b0119] text-[18px] md:text-[20px] leading-[26px] md:leading-[28px]">
                  Acesso Académico Completo
                </h3>
                <p className="font-['Source_Sans_3:Regular',sans-serif] font-normal text-[#64748b] text-[14px] md:text-[16px] leading-[22px] md:leading-[24px]">
                  Milhões de documentos digitalizados, organizados e pesquisáveis para a sua investigação.
                </p>
              </div>

              {/* Feature 2 */}
              <div className="flex flex-col gap-[16px] items-start">
                <div className="size-[40px] md:size-[48px] bg-[#dee9fc] rounded-[8px] flex items-center justify-center">
                  <svg className="size-[20px] md:size-[24px]" fill="none" viewBox="0 0 30 28.75">
                    <path d={svgPaths.p17161d00} fill="#6b0119" />
                  </svg>
                </div>
                <h3 className="font-['Source_Sans_3:Bold',sans-serif] font-bold text-[#6b0119] text-[18px] md:text-[20px] leading-[26px] md:leading-[28px]">
                  Comunidade Académica
                </h3>
                <p className="font-['Source_Sans_3:Regular',sans-serif] font-normal text-[#64748b] text-[14px] md:text-[16px] leading-[22px] md:leading-[24px]">
                  Conecte-se com outros investigadores, partilhe descobertas e colabore em projectos.
                </p>
              </div>

              {/* Feature 3 */}
              <div className="flex flex-col gap-[16px] items-start">
                <div className="size-[40px] md:size-[48px] bg-[#dee9fc] rounded-[8px] flex items-center justify-center">
                  <svg className="size-[20px] md:size-[24px]" fill="none" viewBox="0 0 20 25">
                    <path d={svgPaths.p2256d300} fill="#6b0119" />
                  </svg>
                </div>
                <h3 className="font-['Source_Sans_3:Bold',sans-serif] font-bold text-[#6b0119] text-[18px] md:text-[20px] leading-[26px] md:leading-[28px]">
                  Preservação Histórica
                </h3>
                <p className="font-['Source_Sans_3:Regular',sans-serif] font-normal text-[#64748b] text-[14px] md:text-[16px] leading-[22px] md:leading-[24px]">
                  Contribua para a preservação e disseminação do conhecimento económico angolano.
                </p>
              </div>
            </div>

            {/* CTA */}
            <button
              onClick={() => navigate('/criar-conta')}
              className="bg-white px-[40px] md:px-[48px] py-[16px] md:py-[20px] rounded-[4px] shadow-[0px_40px_40px_-20px_rgba(18,28,42,0.06)] cursor-pointer hover:shadow-[0px_40px_40px_-10px_rgba(18,28,42,0.1)] transition-shadow"
            >
              <span className="font-['Source_Sans_3:Bold',sans-serif] font-bold text-[#6b0119] text-[16px] md:text-[18px] leading-[24px] md:leading-[28px]">
                Criar Conta de Investigador
              </span>
            </button>
          </div>
        </div>
      </section>

      {/* Access Info Section */}
      <section className="bg-gradient-to-br from-[#6b0119] to-[#8b1e2d] w-full py-[64px] md:py-[80px] lg:py-[96px]">
        <div className="max-w-[1536px] mx-auto px-[24px] md:px-[32px] lg:px-[48px]">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-[32px] md:gap-[48px] items-center">
            {/* Left Content */}
            <div className="flex flex-col gap-[24px] md:gap-[32px]">
              <div className="flex flex-col gap-[16px]">
                <div className="inline-flex px-[12px] py-[6px] bg-[rgba(255,255,255,0.15)] rounded-[4px] w-fit">
                  <span className="font-['Source_Sans_3:Bold',sans-serif] font-bold text-white text-[11px] md:text-[12px] tracking-[1.2px] uppercase leading-[16px]">
                    Acesso Aberto
                  </span>
                </div>
                <h2 className="font-['IBM_Plex_Sans:Bold',sans-serif] font-bold text-white text-[28px] md:text-[36px] lg:text-[42px] tracking-[-0.84px] leading-[34px] md:leading-[42px] lg:leading-[48px]" style={{ fontVariationSettings: "'wdth' 100" }}>
                  Explore sem Restrições
                </h2>
                <p className="font-['Source_Sans_3:Regular',sans-serif] font-normal text-white/90 text-[15px] md:text-[16px] lg:text-[18px] leading-[24px] md:leading-[26px] lg:leading-[28px]">
                  Não precisa de criar conta para começar a explorar. Todo o conteúdo do arquivo está disponível para leitura pública.
                </p>
              </div>

              <div className="flex flex-col gap-[16px]">
                <div className="flex gap-[12px] items-start">
                  <div className="mt-[2px] shrink-0">
                    <svg className="size-[20px]" fill="none" viewBox="0 0 20 20">
                      <path d={svgPaths.p1caa9380} fill="white" />
                    </svg>
                  </div>
                  <div className="flex flex-col gap-[4px]">
                    <h3 className="font-['Source_Sans_3:Bold',sans-serif] font-bold text-white text-[15px] md:text-[16px] leading-[22px] md:leading-[24px]">
                      Navegue por Documentos Históricos
                    </h3>
                    <p className="font-['Source_Sans_3:Regular',sans-serif] font-normal text-white/80 text-[13px] md:text-[14px] leading-[20px] md:leading-[22px]">
                      Acesse milhões de documentos, relatórios e publicações económicas sem necessidade de login.
                    </p>
                  </div>
                </div>

                <div className="flex gap-[12px] items-start">
                  <div className="mt-[2px] shrink-0">
                    <svg className="size-[20px]" fill="none" viewBox="0 0 20 20">
                      <path d={svgPaths.p1caa9380} fill="white" />
                    </svg>
                  </div>
                  <div className="flex flex-col gap-[4px]">
                    <h3 className="font-['Source_Sans_3:Bold',sans-serif] font-bold text-white text-[15px] md:text-[16px] leading-[22px] md:leading-[24px]">
                      Leia Discussões da Comunidade
                    </h3>
                    <p className="font-['Source_Sans_3:Regular',sans-serif] font-normal text-white/80 text-[13px] md:text-[14px] leading-[20px] md:leading-[22px]">
                      Acompanhe conversas académicas e debates sobre economia angolana.
                    </p>
                  </div>
                </div>

                <div className="flex gap-[12px] items-start">
                  <div className="mt-[2px] shrink-0">
                    <svg className="size-[20px]" fill="none" viewBox="0 0 20 20">
                      <path d={svgPaths.p1caa9380} fill="white" />
                    </svg>
                  </div>
                  <div className="flex flex-col gap-[4px]">
                    <h3 className="font-['Source_Sans_3:Bold',sans-serif] font-bold text-white text-[15px] md:text-[16px] leading-[22px] md:leading-[24px]">
                      Utilize Ferramentas de Pesquisa
                    </h3>
                    <p className="font-['Source_Sans_3:Regular',sans-serif] font-normal text-white/80 text-[13px] md:text-[14px] leading-[20px] md:leading-[22px]">
                      Pesquise, filtre e descubra conteúdos relevantes para a sua investigação.
                    </p>
                  </div>
                </div>
              </div>

              <button
                onClick={() => navigate('/inicio')}
                className="bg-white px-[32px] md:px-[40px] py-[14px] md:py-[16px] rounded-[6px] w-fit cursor-pointer hover:bg-[#f5f5f5] transition-colors"
              >
                <span className="font-['Source_Sans_3:Bold',sans-serif] font-bold text-[#6b0119] text-[14px] md:text-[16px] leading-[20px] md:leading-[24px]">
                  Começar a Explorar →
                </span>
              </button>
            </div>

            {/* Right Content - What you need an account for */}
            <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-[12px] p-[28px] md:p-[36px] lg:p-[40px]">
              <div className="flex flex-col gap-[20px] md:gap-[24px]">
                <div className="flex flex-col gap-[8px]">
                  <h3 className="font-['IBM_Plex_Sans:Bold',sans-serif] font-bold text-white text-[20px] md:text-[24px] tracking-[-0.48px] leading-[26px] md:leading-[30px]" style={{ fontVariationSettings: "'wdth' 100" }}>
                    Com uma conta pode também:
                  </h3>
                  <p className="font-['Source_Sans_3:Regular',sans-serif] font-normal text-white/80 text-[13px] md:text-[14px] leading-[20px] md:leading-[22px]">
                    Participe activamente da preservação histórica
                  </p>
                </div>

                <div className="flex flex-col gap-[14px] md:gap-[16px]">
                  <div className="flex gap-[10px] items-start">
                    <div className="mt-[2px] shrink-0">
                      <svg className="size-[16px]" fill="none" viewBox="0 0 16 16">
                        <path d={svgPaths.p1a406200} fill="white" />
                      </svg>
                    </div>
                    <span className="font-['Source_Sans_3:Regular',sans-serif] font-normal text-white text-[13px] md:text-[14px] leading-[20px] md:leading-[22px]">
                      Comentar em discussões e contribuir com insights
                    </span>
                  </div>

                  <div className="flex gap-[10px] items-start">
                    <div className="mt-[2px] shrink-0">
                      <svg className="size-[16px]" fill="none" viewBox="0 0 16 16">
                        <path d={svgPaths.p1a406200} fill="white" />
                      </svg>
                    </div>
                    <span className="font-['Source_Sans_3:Regular',sans-serif] font-normal text-white text-[13px] md:text-[14px] leading-[20px] md:leading-[22px]">
                      Criar novos tópicos e iniciar debates académicos
                    </span>
                  </div>

                  <div className="flex gap-[10px] items-start">
                    <div className="mt-[2px] shrink-0">
                      <svg className="size-[16px]" fill="none" viewBox="0 0 16 16">
                        <path d={svgPaths.p1a406200} fill="white" />
                      </svg>
                    </div>
                    <span className="font-['Source_Sans_3:Regular',sans-serif] font-normal text-white text-[13px] md:text-[14px] leading-[20px] md:leading-[22px]">
                      Contribuir com novos documentos ao arquivo
                    </span>
                  </div>

                  <div className="flex gap-[10px] items-start">
                    <div className="mt-[2px] shrink-0">
                      <svg className="size-[16px]" fill="none" viewBox="0 0 16 16">
                        <path d={svgPaths.p1a406200} fill="white" />
                      </svg>
                    </div>
                    <span className="font-['Source_Sans_3:Regular',sans-serif] font-normal text-white text-[13px] md:text-[14px] leading-[20px] md:leading-[22px]">
                      Guardar pesquisas e criar colecções personalizadas
                    </span>
                  </div>

                  <div className="flex gap-[10px] items-start">
                    <div className="mt-[2px] shrink-0">
                      <svg className="size-[16px]" fill="none" viewBox="0 0 16 16">
                        <path d={svgPaths.p1a406200} fill="white" />
                      </svg>
                    </div>
                    <span className="font-['Source_Sans_3:Regular',sans-serif] font-normal text-white text-[13px] md:text-[14px] leading-[20px] md:leading-[22px]">
                      Receber notificações sobre novos conteúdos
                    </span>
                  </div>
                </div>

                <div className="border-t border-white/20 pt-[16px] md:pt-[20px] mt-[4px]">
                  <button
                    onClick={() => navigate('/criar-conta')}
                    className="w-full bg-white px-[28px] md:px-[32px] py-[12px] md:py-[14px] rounded-[6px] cursor-pointer hover:bg-[#f5f5f5] transition-colors"
                  >
                    <span className="font-['Source_Sans_3:Bold',sans-serif] font-bold text-[#6b0119] text-[14px] md:text-[15px] leading-[20px] md:leading-[22px]">
                      Criar Conta Gratuita
                    </span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#f1f5f9] w-full py-[32px] md:py-[40px]">
        <div className="max-w-[1536px] mx-auto px-[24px] md:px-[32px] lg:px-[48px]">
          <div className="flex flex-col md:flex-row items-center justify-between gap-[16px]">
            <p className="font-['Source_Sans_3:Regular',sans-serif] font-normal text-[#64748b] text-[13px] md:text-[14px] leading-[20px]">
              © 2026 Economia com História. Todos os direitos reservados.
            </p>
            <p className="font-['Source_Sans_3:Regular',sans-serif] font-normal text-[#94a3b8] text-[12px] md:text-[13px] leading-[18px]">
              Arquivo restrito a investigadores e académicos
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
