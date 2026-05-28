import { Link } from 'react-router';

export default function AuthFooter() {
  return (
    <div className="bg-[#f8f9ff] relative shrink-0 w-full">
      <div aria-hidden="true" className="absolute border-[rgba(222,191,191,0.2)] border-solid border-t inset-0 pointer-events-none" />
      <div className="content-stretch flex flex-col items-start pb-[32px] md:pb-[40px] lg:pb-[48px] pt-[33px] md:pt-[41px] lg:pt-[49px] px-[24px] md:px-[36px] lg:px-[48px] relative size-full">
        <div className="max-w-[1440px] relative shrink-0 w-full mx-auto">
          <div className="content-stretch flex flex-col gap-[24px] md:gap-[28px] lg:gap-[32px] items-start max-w-[inherit] relative size-full">
            <div className="bg-[rgba(222,191,191,0.2)] h-px relative shrink-0 w-full" />

            <div className="content-stretch flex flex-col md:flex-row items-start md:items-center justify-between gap-[24px] md:gap-0 relative shrink-0 w-full">
              {/* Left: Brand & Copyright */}
              <div className="content-stretch flex flex-col gap-[6px] md:gap-[8px] items-start relative shrink-0">
                <div className="content-stretch flex flex-col items-start relative shrink-0 w-full">
                  <div className="flex flex-col font-['IBM_Plex_Sans:Bold',sans-serif] font-bold justify-center leading-[0] relative shrink-0 text-[#6b0119] text-[16px] md:text-[17px] lg:text-[18px]" style={{ fontVariationSettings: "'wdth' 100" }}>
                    <p className="leading-[24px] md:leading-[26px] lg:leading-[28px]">Economia com História</p>
                  </div>
                </div>

                <div className="content-stretch flex flex-col items-start relative shrink-0 w-full">
                  <div className="flex flex-col font-['Source_Sans_3:Regular',sans-serif] font-normal justify-center leading-[0] relative shrink-0 text-[#64748b] text-[13px] md:text-[14px] tracking-[0.35px]">
                    <p className="leading-[18px] md:leading-[20px]">© 2026 Economia com História. Um arquivo académico digital.</p>
                  </div>
                </div>
              </div>

              {/* Right: Links */}
              <div className="content-stretch flex flex-wrap gap-x-[24px] md:gap-x-[28px] lg:gap-x-[32px] gap-y-[12px] h-auto md:h-[20px] items-start relative shrink-0">
                <Link to="/" className="content-stretch flex flex-col items-start relative self-stretch shrink-0 hover:opacity-70 transition-opacity">
                  <div className="flex flex-col font-['Source_Sans_3:Regular',sans-serif] font-normal justify-center leading-[0] relative shrink-0 text-[#64748b] text-[13px] md:text-[14px] tracking-[0.35px] whitespace-nowrap">
                    <p className="leading-[18px] md:leading-[20px]">Sobre o Projecto</p>
                  </div>
                </Link>

                <button className="content-stretch flex flex-col items-start relative self-stretch shrink-0 cursor-pointer hover:opacity-70 transition-opacity">
                  <div className="flex flex-col font-['Source_Sans_3:Regular',sans-serif] font-normal justify-center leading-[0] relative shrink-0 text-[#64748b] text-[13px] md:text-[14px] tracking-[0.35px] whitespace-nowrap">
                    <p className="leading-[18px] md:leading-[20px]">Termos de Uso</p>
                  </div>
                </button>

                <button className="content-stretch flex flex-col items-start relative self-stretch shrink-0 cursor-pointer hover:opacity-70 transition-opacity">
                  <div className="flex flex-col font-['Source_Sans_3:Regular',sans-serif] font-normal justify-center leading-[0] relative shrink-0 text-[#64748b] text-[13px] md:text-[14px] tracking-[0.35px] whitespace-nowrap">
                    <p className="leading-[18px] md:leading-[20px]">Privacidade</p>
                  </div>
                </button>

                <button className="content-stretch flex flex-col items-start relative self-stretch shrink-0 cursor-pointer hover:opacity-70 transition-opacity">
                  <div className="flex flex-col font-['Source_Sans_3:Regular',sans-serif] font-normal justify-center leading-[0] relative shrink-0 text-[#64748b] text-[13px] md:text-[14px] tracking-[0.35px] whitespace-nowrap">
                    <p className="leading-[18px] md:leading-[20px]">Contactos</p>
                  </div>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
