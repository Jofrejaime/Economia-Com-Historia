import svgPaths from "./svg-ocnz8hgyje";
import imgMarta from "./06a4afa7e5640a6bd64bd2a1bd43ca867f45f4e3.png";
import imgJoao from "./9c351444a85e4748ab4edc288a9ed4b83c0f3f7c.png";
import imgAndre from "./2542f6a44aa7426e01c33baa539ebbc290c45863.png";

function Heading() {
  return (
    <div className="content-stretch flex flex-col items-center relative shrink-0 w-full" data-name="Heading 2">
      <div className="flex flex-col font-['Newsreader:Regular',sans-serif] font-normal justify-center leading-[0] relative shrink-0 text-[#1b1c1b] text-[36px] text-center whitespace-nowrap">
        <p className="leading-[40px]">Elite Académica da Semana</p>
      </div>
    </div>
  );
}

function Marta() {
  return (
    <div className="pointer-events-none relative rounded-[12px] shrink-0 size-[64px]" data-name="Marta">
      <div className="absolute inset-0 overflow-hidden rounded-[12px]">
        <img alt="" className="absolute left-0 max-w-none size-full top-0" src={imgMarta} />
      </div>
      <div aria-hidden="true" className="absolute border-4 border-[#921a1a] border-solid inset-0 rounded-[12px]" />
    </div>
  );
}

function Background() {
  return (
    <div className="absolute bg-[#6f0008] bottom-[-4px] content-stretch flex items-center justify-center pb-[5px] pt-[4px] right-[-4px] rounded-[12px] size-[24px]" data-name="Background">
      <div className="flex flex-col font-['Inter:Regular',sans-serif] font-normal justify-center leading-[0] not-italic relative shrink-0 text-[10px] text-center text-white whitespace-nowrap">
        <p className="leading-[15px]">1</p>
      </div>
    </div>
  );
}

function Container1() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0" data-name="Container">
      <Marta />
      <Background />
    </div>
  );
}

function Margin() {
  return (
    <div className="absolute content-stretch flex flex-col items-start left-[107px] pb-[16px] top-[24px]" data-name="Margin">
      <Container1 />
    </div>
  );
}

function BackgroundShadow() {
  return (
    <div className="bg-white col-1 drop-shadow-[0px_1px_1px_rgba(0,0,0,0.05)] h-[168px] justify-self-stretch relative rounded-[8px] row-1 shrink-0" data-name="Background+Shadow">
      <div className="-translate-x-1/2 -translate-y-1/2 absolute flex flex-col font-['Inter:Regular',sans-serif] font-normal justify-center leading-[0] left-[calc(50%-0.01px)] not-italic text-[#1b1c1b] text-[16px] text-center top-[116px] whitespace-nowrap">
        <p className="leading-[24px]">Marta S.</p>
      </div>
      <div className="-translate-x-1/2 -translate-y-1/2 absolute flex flex-col font-['Inter:Regular',sans-serif] font-normal justify-center leading-[0] left-1/2 not-italic text-[#8c706d] text-[12px] text-center top-[136px] tracking-[-0.6px] uppercase whitespace-nowrap">
        <p className="leading-[16px]">2,450 PTS</p>
      </div>
      <Margin />
    </div>
  );
}

function Joao() {
  return (
    <div className="pointer-events-none relative rounded-[12px] shrink-0 size-[64px]" data-name="João">
      <div className="absolute inset-0 overflow-hidden rounded-[12px]">
        <img alt="" className="absolute left-0 max-w-none size-full top-0" src={imgJoao} />
      </div>
      <div aria-hidden="true" className="absolute border-4 border-[#e4e2e0] border-solid inset-0 rounded-[12px]" />
    </div>
  );
}

function Background1() {
  return (
    <div className="absolute bg-[#a8a29e] bottom-[-4px] content-stretch flex items-center justify-center pb-[5px] pt-[4px] right-[-4px] rounded-[12px] size-[24px]" data-name="Background">
      <div className="flex flex-col font-['Inter:Regular',sans-serif] font-normal justify-center leading-[0] not-italic relative shrink-0 text-[10px] text-center text-white whitespace-nowrap">
        <p className="leading-[15px]">2</p>
      </div>
    </div>
  );
}

function Container2() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0" data-name="Container">
      <Joao />
      <Background1 />
    </div>
  );
}

function Margin1() {
  return (
    <div className="absolute content-stretch flex flex-col items-start left-[107px] pb-[16px] top-[24px]" data-name="Margin">
      <Container2 />
    </div>
  );
}

function BackgroundShadow1() {
  return (
    <div className="bg-white col-2 drop-shadow-[0px_1px_1px_rgba(0,0,0,0.05)] h-[168px] justify-self-stretch relative rounded-[8px] row-1 shrink-0" data-name="Background+Shadow">
      <div className="-translate-x-1/2 -translate-y-1/2 absolute flex flex-col font-['Inter:Regular',sans-serif] font-normal justify-center leading-[0] left-1/2 not-italic text-[#1b1c1b] text-[16px] text-center top-[116px] whitespace-nowrap">
        <p className="leading-[24px]">João P.</p>
      </div>
      <div className="-translate-x-1/2 -translate-y-1/2 absolute flex flex-col font-['Inter:Regular',sans-serif] font-normal justify-center leading-[0] left-1/2 not-italic text-[#8c706d] text-[12px] text-center top-[136px] tracking-[-0.6px] uppercase whitespace-nowrap">
        <p className="leading-[16px]">2,120 PTS</p>
      </div>
      <Margin1 />
    </div>
  );
}

function Andre() {
  return (
    <div className="pointer-events-none relative rounded-[12px] shrink-0 size-[64px]" data-name="André">
      <div className="absolute inset-0 overflow-hidden rounded-[12px]">
        <img alt="" className="absolute left-0 max-w-none size-full top-0" src={imgAndre} />
      </div>
      <div aria-hidden="true" className="absolute border-4 border-[#e4e2e0] border-solid inset-0 rounded-[12px]" />
    </div>
  );
}

function Background2() {
  return (
    <div className="absolute bg-[#b08d57] bottom-[-4px] content-stretch flex items-center justify-center pb-[5px] pt-[4px] right-[-4px] rounded-[12px] size-[24px]" data-name="Background">
      <div className="flex flex-col font-['Inter:Regular',sans-serif] font-normal justify-center leading-[0] not-italic relative shrink-0 text-[10px] text-center text-white whitespace-nowrap">
        <p className="leading-[15px]">3</p>
      </div>
    </div>
  );
}

function Container3() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0" data-name="Container">
      <Andre />
      <Background2 />
    </div>
  );
}

function Margin2() {
  return (
    <div className="absolute content-stretch flex flex-col items-start left-[107px] pb-[16px] top-[24px]" data-name="Margin">
      <Container3 />
    </div>
  );
}

function BackgroundShadow2() {
  return (
    <div className="bg-white col-3 drop-shadow-[0px_1px_1px_rgba(0,0,0,0.05)] h-[168px] justify-self-stretch relative rounded-[8px] row-1 shrink-0" data-name="Background+Shadow">
      <div className="-translate-x-1/2 -translate-y-1/2 absolute flex flex-col font-['Inter:Regular',sans-serif] font-normal justify-center leading-[0] left-[calc(50%+0.01px)] not-italic text-[#1b1c1b] text-[16px] text-center top-[116px] whitespace-nowrap">
        <p className="leading-[24px]">André M.</p>
      </div>
      <div className="-translate-x-1/2 -translate-y-1/2 absolute flex flex-col font-['Inter:Regular',sans-serif] font-normal justify-center leading-[0] left-1/2 not-italic text-[#8c706d] text-[12px] text-center top-[136px] tracking-[-0.6px] uppercase whitespace-nowrap">
        <p className="leading-[16px]">1,980 PTS</p>
      </div>
      <Margin2 />
    </div>
  );
}

function Container4() {
  return (
    <div className="relative shrink-0 size-[25px]" data-name="Container">
      <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 25 25">
        <g id="Container">
          <path d={svgPaths.p2e1e2d00} fill="var(--fill-0, #8C706D)" id="Icon" />
        </g>
      </svg>
    </div>
  );
}

function Margin3() {
  return (
    <div className="relative shrink-0" data-name="Margin">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col items-start pb-[8px] relative size-full">
        <Container4 />
      </div>
    </div>
  );
}

function Container5() {
  return (
    <div className="relative shrink-0" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col items-center relative size-full">
        <div className="flex flex-col font-['Inter:Regular',sans-serif] font-normal justify-center leading-[0] not-italic relative shrink-0 text-[#59413e] text-[14px] text-center whitespace-nowrap">
          <p className="leading-[20px]">O seu lugar está aqui</p>
        </div>
      </div>
    </div>
  );
}

function BackgroundBorderShadow() {
  return (
    <div className="bg-white col-4 drop-shadow-[0px_1px_1px_rgba(0,0,0,0.05)] justify-self-stretch opacity-70 relative rounded-[8px] row-1 self-start shrink-0" data-name="Background+Border+Shadow">
      <div aria-hidden="true" className="absolute border border-[#e0bfbb] border-dashed inset-0 pointer-events-none rounded-[8px]" />
      <div className="flex flex-col items-center justify-center size-full">
        <div className="content-stretch flex flex-col items-center justify-center px-[25px] py-[52px] relative size-full">
          <Margin3 />
          <Container5 />
        </div>
      </div>
    </div>
  );
}

function Container() {
  return (
    <div className="gap-x-[24px] gap-y-[24px] grid grid-cols-[repeat(4,minmax(0,1fr))] grid-rows-[_168px] relative shrink-0 w-full" data-name="Container">
      <BackgroundShadow />
      <BackgroundShadow1 />
      <BackgroundShadow2 />
      <BackgroundBorderShadow />
    </div>
  );
}

export default function LeaderboardPreviewSection() {
  return (
    <div className="content-stretch flex flex-col gap-[48px] items-start pt-[31.99px] relative size-full" data-name="Leaderboard Preview Section">
      <Heading />
      <Container />
    </div>
  );
}