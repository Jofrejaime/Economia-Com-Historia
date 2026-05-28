import { Link } from 'react-router';

export default function AuthHeader() {
  return (
    <div className="bg-[#f8f9ff] content-stretch flex flex-col items-start relative shrink-0 w-full">
      <div className="max-w-[1440px] relative shrink-0 w-full mx-auto">
        <div className="flex flex-row items-center max-w-[inherit] size-full">
          <div className="content-stretch flex items-center justify-between max-w-[inherit] px-[24px] md:px-[36px] lg:px-[48px] py-[20px] md:py-[22px] lg:py-[24px] relative size-full">
            <Link to="/" className="content-stretch flex flex-col items-start relative shrink-0 hover:opacity-80 transition-opacity">
              <div className="flex flex-col font-['IBM_Plex_Sans:Bold',sans-serif] font-bold justify-center leading-[0] relative shrink-0 text-[#6b0119] text-[20px] md:text-[22px] lg:text-[24px]" style={{ fontVariationSettings: "'wdth' 100" }}>
                <p className="leading-[28px] md:leading-[30px] lg:leading-[32px]">Economia com História</p>
              </div>
            </Link>
          </div>
        </div>
      </div>
      <div className="bg-[rgba(222,191,191,0.2)] h-px relative shrink-0 w-full" />
    </div>
  );
}
