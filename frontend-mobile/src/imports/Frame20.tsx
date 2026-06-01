import svgPaths from "./svg-uzv97rnfij";
import imgMoedaAngolanaKwanzaEmPlanoDetalhadoComTexturasMetalicasELuzDramaticaQuente from "figma:asset/df82eb32053affc07277ac586d48205469b4471d.png";

function Heading() {
  return (
    <div className="content-stretch flex flex-col items-center relative shrink-0 w-full" data-name="Heading 1">
      <div className="flex flex-col font-['IBM_Plex_Sans:Bold',sans-serif] font-bold justify-center leading-[0] relative shrink-0 text-[24px] text-center text-white tracking-[-0.6px] whitespace-nowrap" style={{ fontVariationSettings: "'wdth' 100" }}>
        <p className="leading-[32px] mb-0">Kwanza: História e Desafios</p>
        <p className="leading-[32px]">da Moeda Nacional</p>
      </div>
    </div>
  );
}

function Container1() {
  return (
    <div className="h-[10.5px] relative shrink-0 w-[12.833px]" data-name="Container">
      <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 12.8333 10.5">
        <g id="Container">
          <path d={svgPaths.p27737a70} fill="var(--fill-0, white)" id="Icon" />
        </g>
      </svg>
    </div>
  );
}

function Container2() {
  return (
    <div className="content-stretch flex flex-col items-center relative shrink-0" data-name="Container">
      <div className="flex flex-col font-['Nimbus_Sans:Regular',sans-serif] justify-center leading-[0] not-italic relative shrink-0 text-[16px] text-center text-white whitespace-nowrap">
        <p className="leading-[24px]">Narrado por Prof. Dr. Arnaldo Santos</p>
      </div>
    </div>
  );
}

function Container() {
  return (
    <div className="content-stretch flex gap-[8px] items-center justify-center opacity-80 relative shrink-0 w-full" data-name="Container">
      <Container1 />
      <Container2 />
    </div>
  );
}

function TrackInfo() {
  return (
    <div className="content-stretch flex flex-col gap-[12px] items-start relative shrink-0 w-full" data-name="Track Info">
      <Heading />
      <Container />
    </div>
  );
}

function TrackInfoMargin() {
  return (
    <div className="absolute content-stretch flex flex-col items-start left-[32px] pb-[40px] right-[32px] top-[374px]" data-name="Track Info:margin">
      <TrackInfo />
    </div>
  );
}

function MoedaAngolanaKwanzaEmPlanoDetalhadoComTexturasMetalicasELuzDramaticaQuente() {
  return (
    <div className="h-[326px] relative rounded-[8px] shadow-[0px_25px_50px_-12px_rgba(0,0,0,0.25)] shrink-0 w-full" data-name="Moeda angolana Kwanza em plano detalhado com texturas metálicas e luz dramática quente">
      <div className="absolute inset-0 overflow-hidden pointer-events-none rounded-[8px]">
        <img alt="" className="absolute left-0 max-w-none size-full top-0" src={imgMoedaAngolanaKwanzaEmPlanoDetalhadoComTexturasMetalicasELuzDramaticaQuente} />
      </div>
    </div>
  );
}

function LargeSquareArtwork() {
  return (
    <div className="content-stretch flex flex-col items-start justify-center relative shrink-0 w-full" data-name="Large Square Artwork">
      <div className="absolute bg-[rgba(0,0,0,0.2)] blur-[20px] inset-[16px_0_-16px_0] opacity-50 rounded-[8px]" data-name="Overlay+Blur" />
      <MoedaAngolanaKwanzaEmPlanoDetalhadoComTexturasMetalicasELuzDramaticaQuente />
    </div>
  );
}

function LargeSquareArtworkMargin() {
  return (
    <div className="absolute content-stretch flex flex-col items-start left-[32px] pb-[48px] right-[32px] top-0" data-name="Large Square Artwork:margin">
      <LargeSquareArtwork />
    </div>
  );
}

function Container4() {
  return (
    <div className="flex-[1_0_0] min-w-px relative" data-name="Container">
      <div className="content-stretch flex flex-col items-start pl-[131.88px] pr-[182.12px] relative size-full">
        <div className="bg-white rounded-[6px] shrink-0 size-[12px]" data-name="Background" />
      </div>
    </div>
  );
}

function Container3() {
  return (
    <div className="content-stretch flex items-center justify-center relative shrink-0 w-full" data-name="Container">
      <Container4 />
    </div>
  );
}

function Input() {
  return (
    <div className="absolute content-stretch flex flex-col inset-[-3px_0] items-start" data-name="Input">
      <Container3 />
    </div>
  );
}

function Overlay() {
  return (
    <div className="bg-[rgba(255,255,255,0.2)] h-[6px] relative rounded-[12px] shrink-0 w-full" data-name="Overlay">
      <div className="absolute bg-white inset-[0_58%_0_0] rounded-[12px]" data-name="Background" />
      <Input />
    </div>
  );
}

function Container6() {
  return (
    <div className="content-stretch flex flex-col items-start relative self-stretch shrink-0" data-name="Container">
      <div className="flex flex-col font-['Nimbus_Sans:Bold',sans-serif] justify-center leading-[0] not-italic relative shrink-0 text-[10px] text-white tracking-[1px] whitespace-nowrap">
        <p className="leading-[15px]">12:45</p>
      </div>
    </div>
  );
}

function Container7() {
  return (
    <div className="content-stretch flex flex-col items-start relative self-stretch shrink-0" data-name="Container">
      <div className="flex flex-col font-['Nimbus_Sans:Bold',sans-serif] justify-center leading-[0] not-italic relative shrink-0 text-[10px] text-white tracking-[1px] whitespace-nowrap">
        <p className="leading-[15px]">28:10</p>
      </div>
    </div>
  );
}

function Container5() {
  return (
    <div className="content-stretch flex h-[15px] items-start justify-between opacity-60 relative shrink-0 w-full" data-name="Container">
      <Container6 />
      <Container7 />
    </div>
  );
}

function ProgressBar() {
  return (
    <div className="content-stretch flex flex-col gap-[8px] items-start relative shrink-0 w-full" data-name="Progress Bar">
      <Overlay />
      <Container5 />
    </div>
  );
}

function Container8() {
  return (
    <div className="relative shrink-0 size-[20px]" data-name="Container">
      <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 20 20">
        <g id="Container">
          <path d={svgPaths.pc4cbb00} fill="var(--fill-0, white)" fillOpacity="0.6" id="Icon" />
        </g>
      </svg>
    </div>
  );
}

function Button() {
  return (
    <div className="content-stretch flex flex-col items-center justify-center relative shrink-0" data-name="Button">
      <Container8 />
    </div>
  );
}

function Container10() {
  return (
    <div className="h-[31.5px] relative shrink-0 w-[27px]" data-name="Container">
      <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 27 31.5">
        <g id="Container">
          <path d={svgPaths.pb3767c0} fill="var(--fill-0, white)" id="Icon" />
        </g>
      </svg>
    </div>
  );
}

function Button1() {
  return (
    <div className="content-stretch flex flex-col items-center justify-center relative shrink-0" data-name="Button">
      <Container10 />
    </div>
  );
}

function Container11() {
  return (
    <div className="h-[28px] relative shrink-0 w-[24px]" data-name="Container">
      <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 24 28">
        <g id="Container">
          <path d={svgPaths.p24adca80} fill="var(--fill-0, #8B1E2D)" id="Icon" />
        </g>
      </svg>
    </div>
  );
}

function Button2() {
  return (
    <div className="bg-white content-stretch flex items-center justify-center relative rounded-[12px] shrink-0 size-[80px]" data-name="Button">
      <div className="-translate-y-1/2 absolute bg-[rgba(255,255,255,0)] left-0 rounded-[12px] shadow-[0px_10px_15px_-3px_rgba(0,0,0,0.1),0px_4px_6px_-4px_rgba(0,0,0,0.1)] size-[80px] top-1/2" data-name="Button:shadow" />
      <Container11 />
    </div>
  );
}

function Container12() {
  return (
    <div className="h-[31.5px] relative shrink-0 w-[27px]" data-name="Container">
      <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 27 31.5">
        <g id="Container">
          <path d={svgPaths.p6759e90} fill="var(--fill-0, white)" id="Icon" />
        </g>
      </svg>
    </div>
  );
}

function Button3() {
  return (
    <div className="content-stretch flex flex-col items-center justify-center relative shrink-0" data-name="Button">
      <Container12 />
    </div>
  );
}

function Container9() {
  return (
    <div className="content-stretch flex gap-[32px] items-center relative shrink-0" data-name="Container">
      <Button1 />
      <Button2 />
      <Button3 />
    </div>
  );
}

function Container13() {
  return (
    <div className="h-[25px] relative shrink-0 w-[22.5px]" data-name="Container">
      <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 22.5 25">
        <g id="Container">
          <path d={svgPaths.p36cb6480} fill="var(--fill-0, white)" fillOpacity="0.6" id="Icon" />
        </g>
      </svg>
    </div>
  );
}

function Button4() {
  return (
    <div className="content-stretch flex flex-col items-center justify-center relative shrink-0" data-name="Button">
      <Container13 />
    </div>
  );
}

function PlaybackControls() {
  return (
    <div className="relative shrink-0 w-full" data-name="Playback Controls">
      <div className="flex flex-row items-center size-full">
        <div className="content-stretch flex items-center justify-between px-[16px] relative size-full">
          <Button />
          <Container9 />
          <Button4 />
        </div>
      </div>
    </div>
  );
}

function Button5() {
  return (
    <div className="relative shrink-0" data-name="Button">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col gap-[4px] items-center leading-[0] relative size-full text-[rgba(255,255,255,0.8)] text-center whitespace-nowrap">
        <div className="flex flex-col font-['IBM_Plex_Sans:Bold',sans-serif] font-bold justify-center relative shrink-0 text-[14px] tracking-[-0.7px]" style={{ fontVariationSettings: "'wdth' 100" }}>
          <p className="leading-[20px]">1.25x</p>
        </div>
        <div className="flex flex-col font-['Nimbus_Sans:Bold',sans-serif] justify-center not-italic opacity-60 relative shrink-0 text-[10px] tracking-[1px] uppercase">
          <p className="leading-[15px]">VELOCIDADE</p>
        </div>
      </div>
    </div>
  );
}

function Button6() {
  return (
    <div className="relative shrink-0" data-name="Button">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col gap-[4px] items-center relative size-full">
        <div className="h-[20px] relative shrink-0 w-[16px]" data-name="Icon">
          <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 16 20">
            <path d={svgPaths.pc679c40} fill="var(--fill-0, white)" fillOpacity="0.8" id="Icon" />
          </svg>
        </div>
        <div className="flex flex-col font-['Nimbus_Sans:Bold',sans-serif] justify-center leading-[0] not-italic opacity-60 relative shrink-0 text-[10px] text-[rgba(255,255,255,0.8)] text-center tracking-[1px] uppercase whitespace-nowrap">
          <p className="leading-[15px]">TRANSCRIÇÃO</p>
        </div>
      </div>
    </div>
  );
}

function Button7() {
  return (
    <div className="relative shrink-0" data-name="Button">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col gap-[4px] items-center relative size-full">
        <div className="h-[16px] relative shrink-0 w-[20px]" data-name="Icon">
          <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 20 16">
            <path d={svgPaths.p172b9974} fill="var(--fill-0, white)" fillOpacity="0.8" id="Icon" />
          </svg>
        </div>
        <div className="flex flex-col font-['Nimbus_Sans:Bold',sans-serif] justify-center leading-[0] not-italic opacity-60 relative shrink-0 text-[10px] text-[rgba(255,255,255,0.8)] text-center tracking-[1px] uppercase whitespace-nowrap">
          <p className="leading-[15px]">DISPOSITIVOS</p>
        </div>
      </div>
    </div>
  );
}

function SpeedSecondaryControls() {
  return (
    <div className="relative shrink-0 w-full" data-name="Speed & Secondary Controls">
      <div aria-hidden="true" className="absolute border-[rgba(255,255,255,0.1)] border-solid border-t inset-0 pointer-events-none" />
      <div className="flex flex-row items-center size-full">
        <div className="content-stretch flex gap-[28.2px] items-center pt-[17px] px-[14.13px] relative size-full">
          <Button5 />
          <Button6 />
          <Button7 />
        </div>
      </div>
    </div>
  );
}

function ControlsSection() {
  return (
    <div className="-translate-y-1/2 absolute content-stretch flex flex-col gap-[32px] items-start left-[32px] right-[32px] top-[calc(50%+233px)]" data-name="Controls Section">
      <ProgressBar />
      <PlaybackControls />
      <SpeedSecondaryControls />
    </div>
  );
}

function MainContentCanvas() {
  return (
    <div className="absolute h-[803px] left-0 right-0 top-[72px]" data-name="Main Content Canvas">
      <TrackInfoMargin />
      <LargeSquareArtworkMargin />
      <ControlsSection />
    </div>
  );
}

function Heading1() {
  return (
    <div className="content-stretch flex flex-col items-start opacity-60 relative shrink-0" data-name="Heading 3">
      <div className="flex flex-col font-['IBM_Plex_Sans:Bold',sans-serif] font-bold justify-center leading-[0] relative shrink-0 text-[12px] text-white tracking-[1.2px] uppercase whitespace-nowrap" style={{ fontVariationSettings: "'wdth' 100" }}>
        <p className="leading-[16px]">TRANSCRIÇÃO EM TEMPO REAL</p>
      </div>
    </div>
  );
}

function Container15() {
  return (
    <div className="relative shrink-0 size-[10.5px]" data-name="Container">
      <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 10.5 10.5">
        <g id="Container">
          <path d={svgPaths.p14eb9c00} fill="var(--fill-0, white)" id="Icon" />
        </g>
      </svg>
    </div>
  );
}

function Container14() {
  return (
    <div className="content-stretch flex items-center justify-between relative shrink-0 w-full" data-name="Container">
      <Heading1 />
      <Container15 />
    </div>
  );
}

function Container16() {
  return (
    <div className="content-stretch flex flex-col items-start pb-[0.625px] relative shrink-0 w-full" data-name="Container">
      <div className="flex flex-col font-['Nimbus_Sans:Regular',sans-serif] justify-center leading-[0] not-italic relative shrink-0 text-[18px] text-white w-full">
        <p className="mb-0">
          <span className="leading-[29.25px]">{`"...a introdução do `}</span>
          <span className="font-['Nimbus_Sans:Regular',sans-serif] leading-[29.25px] not-italic text-[#ff9da0]">Kwanza</span>
          <span className="leading-[29.25px]">{` em 1977`}</span>
        </p>
        <p className="leading-[29.25px] mb-0">não foi apenas uma mudança</p>
        <p className="leading-[29.25px] mb-0">monetária, mas um símbolo de</p>
        <p className="leading-[29.25px]">{`soberania económica..."`}</p>
      </div>
    </div>
  );
}

function Container17() {
  return (
    <div className="content-stretch flex flex-col items-start opacity-40 pb-[0.625px] relative shrink-0 w-full" data-name="Container">
      <div className="flex flex-col font-['Nimbus_Sans:Regular',sans-serif] justify-center leading-[0] not-italic relative shrink-0 text-[18px] text-white w-full">
        <p className="leading-[29.25px] mb-0">Neste capítulo, analisamos como as</p>
        <p className="leading-[29.25px] mb-0">flutuações cambiais impactaram o</p>
        <p className="leading-[29.25px] mb-0">mercado de Luanda durante a</p>
        <p className="leading-[29.25px]">década de 90...</p>
      </div>
    </div>
  );
}

function SectionFloatingMiniTranscriptContextualDetail() {
  return (
    <div className="backdrop-blur-[10px] bg-[rgba(255,255,255,0.05)] relative rounded-[8px] shrink-0 w-full" data-name="Section - Floating Mini-Transcript (Contextual Detail)">
      <div className="content-stretch flex flex-col gap-[15.4px] items-start p-[24px] relative size-full">
        <Container14 />
        <Container16 />
        <Container17 />
      </div>
    </div>
  );
}

function SectionFloatingMiniTranscriptContextualDetailMargin() {
  return (
    <div className="absolute content-stretch flex flex-col items-start left-0 pb-[96px] px-[24px] right-0 top-[875px]" data-name="Section - Floating Mini-Transcript (Contextual Detail):margin">
      <SectionFloatingMiniTranscriptContextualDetail />
    </div>
  );
}

function Container18() {
  return (
    <div className="h-[7.4px] relative shrink-0 w-[12px]" data-name="Container">
      <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 12 7.4">
        <g id="Container">
          <path d={svgPaths.p1adfde00} fill="var(--fill-0, white)" id="Icon" />
        </g>
      </svg>
    </div>
  );
}

function Button8() {
  return (
    <div className="content-stretch flex items-center justify-center relative rounded-[12px] shrink-0 size-[40px]" data-name="Button">
      <Container18 />
    </div>
  );
}

function Container20() {
  return (
    <div className="content-stretch flex flex-col items-start opacity-60 relative shrink-0" data-name="Container">
      <div className="flex flex-col font-['IBM_Plex_Sans:Bold',sans-serif] font-bold justify-center leading-[0] relative shrink-0 text-[12px] text-white tracking-[1.2px] uppercase whitespace-nowrap" style={{ fontVariationSettings: "'wdth' 100" }}>
        <p className="leading-[16px]">A REPRODUZIR</p>
      </div>
    </div>
  );
}

function Container21() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0" data-name="Container">
      <div className="flex flex-col font-['IBM_Plex_Sans:Bold',sans-serif] font-bold justify-center leading-[0] relative shrink-0 text-[14px] text-white whitespace-nowrap" style={{ fontVariationSettings: "'wdth' 100" }}>
        <p className="leading-[20px]">Economia com História</p>
      </div>
    </div>
  );
}

function Container19() {
  return (
    <div className="content-stretch flex flex-col items-center relative shrink-0" data-name="Container">
      <Container20 />
      <Container21 />
    </div>
  );
}

function Container22() {
  return (
    <div className="h-[16px] relative shrink-0 w-[4px]" data-name="Container">
      <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 4 16">
        <g id="Container">
          <path d={svgPaths.p3caf0c80} fill="var(--fill-0, white)" id="Icon" />
        </g>
      </svg>
    </div>
  );
}

function Button9() {
  return (
    <div className="content-stretch flex items-center justify-center relative rounded-[12px] shrink-0 size-[40px]" data-name="Button">
      <Container22 />
    </div>
  );
}

function HeaderTopNavigationShellSuppressedForTransactionLikeFocusButKeepingMinimalHeader() {
  return (
    <div className="absolute backdrop-blur-[10px] bg-[rgba(255,255,255,0.05)] content-stretch flex items-center justify-between left-0 px-[24px] py-[16px] right-0 top-0" data-name="Header - Top Navigation (Shell suppressed for transaction-like focus, but keeping minimal header)">
      <Button8 />
      <Container19 />
      <Button9 />
    </div>
  );
}

function Container23() {
  return (
    <div className="h-[18px] relative shrink-0 w-[16px]" data-name="Container">
      <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 16 18">
        <g id="Container">
          <path d={svgPaths.p12a32500} fill="var(--fill-0, #A1A1AA)" id="Icon" />
        </g>
      </svg>
    </div>
  );
}

function Container24() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0" data-name="Container">
      <div className="flex flex-col font-['Source_Sans_3:Medium',sans-serif] font-medium justify-center leading-[0] relative shrink-0 text-[#a1a1aa] text-[10px] tracking-[0.25px] uppercase whitespace-nowrap">
        <p className="leading-[15px]">HOME</p>
      </div>
    </div>
  );
}

function Link() {
  return (
    <div className="-translate-y-1/2 absolute content-stretch flex flex-col items-center justify-center left-[25.47px] top-1/2" data-name="Link">
      <Container23 />
      <Container24 />
    </div>
  );
}

function Container25() {
  return (
    <div className="h-[16px] relative shrink-0 w-[22px]" data-name="Container">
      <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 22 16">
        <g id="Container">
          <path d={svgPaths.p2b6c7500} fill="var(--fill-0, #8B1E2D)" id="Icon" />
        </g>
      </svg>
    </div>
  );
}

function Container26() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0" data-name="Container">
      <div className="flex flex-col font-['Source_Sans_3:Medium',sans-serif] font-medium justify-center leading-[0] relative shrink-0 text-[#8b1e2d] text-[10px] tracking-[0.25px] uppercase whitespace-nowrap">
        <p className="leading-[15px]">CONTEÚDOS</p>
      </div>
    </div>
  );
}

function Link1() {
  return (
    <div className="content-stretch flex flex-col items-center justify-center relative" data-name="Link">
      <Container25 />
      <Container26 />
    </div>
  );
}

function Container27() {
  return (
    <div className="h-[12px] relative shrink-0 w-[24px]" data-name="Container">
      <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 24 12">
        <g id="Container">
          <path d={svgPaths.p5df3d80} fill="var(--fill-0, #A1A1AA)" id="Icon" />
        </g>
      </svg>
    </div>
  );
}

function Container28() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0" data-name="Container">
      <div className="flex flex-col font-['Source_Sans_3:Medium',sans-serif] font-medium justify-center leading-[0] relative shrink-0 text-[#a1a1aa] text-[10px] tracking-[0.25px] uppercase whitespace-nowrap">
        <p className="leading-[15px]">COMUNIDADE</p>
      </div>
    </div>
  );
}

function Link2() {
  return (
    <div className="-translate-y-1/2 absolute content-stretch flex flex-col items-center justify-center left-[178.7px] top-1/2" data-name="Link">
      <Container27 />
      <Container28 />
    </div>
  );
}

function Container29() {
  return (
    <div className="relative shrink-0 size-[20px]" data-name="Container">
      <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 20 20">
        <g id="Container">
          <path d={svgPaths.p13915240} fill="var(--fill-0, #A1A1AA)" id="Icon" />
        </g>
      </svg>
    </div>
  );
}

function Container30() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0" data-name="Container">
      <div className="flex flex-col font-['Source_Sans_3:Medium',sans-serif] font-medium justify-center leading-[0] relative shrink-0 text-[#a1a1aa] text-[10px] tracking-[0.25px] uppercase whitespace-nowrap">
        <p className="leading-[15px]">QUIZ</p>
      </div>
    </div>
  );
}

function Link3() {
  return (
    <div className="-translate-y-1/2 absolute content-stretch flex flex-col items-center justify-center left-[274.5px] top-1/2" data-name="Link">
      <Container29 />
      <Container30 />
    </div>
  );
}

function Container31() {
  return (
    <div className="relative shrink-0 size-[16px]" data-name="Container">
      <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 16 16">
        <g id="Container">
          <path d={svgPaths.p85bff00} fill="var(--fill-0, #A1A1AA)" id="Icon" />
        </g>
      </svg>
    </div>
  );
}

function Container32() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0" data-name="Container">
      <div className="flex flex-col font-['Source_Sans_3:Medium',sans-serif] font-medium justify-center leading-[0] relative shrink-0 text-[#a1a1aa] text-[10px] tracking-[0.25px] uppercase whitespace-nowrap">
        <p className="leading-[15px]">PERFIL</p>
      </div>
    </div>
  );
}

function Link4() {
  return (
    <div className="-translate-y-1/2 absolute content-stretch flex flex-col items-center justify-center left-[333.45px] top-1/2" data-name="Link">
      <Container31 />
      <Container32 />
    </div>
  );
}

function BottomNavigationShellJsonComponentMapping() {
  return (
    <div className="absolute backdrop-blur-[10px] bg-[rgba(255,255,255,0.8)] border-[rgba(228,228,231,0.2)] border-solid border-t bottom-0 h-[80px] left-0 rounded-tl-[4px] rounded-tr-[4px] shadow-[0px_-4px_24px_0px_rgba(0,0,0,0.04)] w-[390px]" data-name="Bottom Navigation Shell (JSON Component Mapping)">
      <Link />
      <div className="-translate-y-1/2 absolute flex h-[34.1px] items-center justify-center left-[84.54px] top-1/2 w-[62.05px]" style={{ "--transform-inner-width": "1200", "--transform-inner-height": "42" } as React.CSSProperties}>
        <div className="flex-none scale-x-[110.00000000000001%] scale-y-[110.00000000000001%]">
          <Link1 />
        </div>
      </div>
      <Link2 />
      <Link3 />
      <Link4 />
    </div>
  );
}

function HtmlBody() {
  return (
    <div className="absolute h-[1631px] left-0 top-0 w-[448px]" style={{ backgroundImage: "linear-gradient(90deg, rgb(139, 30, 45) 0%, rgb(139, 30, 45) 100%), linear-gradient(90deg, rgb(255, 255, 255) 0%, rgb(255, 255, 255) 100%)" }} data-name="Html → Body">
      <MainContentCanvas />
      <SectionFloatingMiniTranscriptContextualDetailMargin />
      <HeaderTopNavigationShellSuppressedForTransactionLikeFocusButKeepingMinimalHeader />
      <BottomNavigationShellJsonComponentMapping />
    </div>
  );
}

export default function Frame() {
  return (
    <div className="bg-white relative size-full">
      <HtmlBody />
    </div>
  );
}