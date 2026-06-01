import svgPaths from "./svg-upajfybr04";

function Heading() {
  return (
    <div className="relative shrink-0" data-name="Heading 2">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col items-start relative size-full">
        <div className="flex flex-col font-['IBM_Plex_Sans:Bold',sans-serif] font-bold justify-center leading-[0] relative shrink-0 text-[#8b1e2d] text-[24px] whitespace-nowrap" style={{ fontVariationSettings: "'wdth' 100" }}>
          <p className="leading-[32px]">Méritos e Distinções</p>
        </div>
      </div>
    </div>
  );
}

function Link() {
  return (
    <div className="relative shrink-0" data-name="Link">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col items-start relative size-full">
        <div className="flex flex-col font-['Source_Sans_3:SemiBold',sans-serif] font-semibold justify-center leading-[0] relative shrink-0 text-[#6b0119] text-[14px] whitespace-nowrap">
          <p className="leading-[20px]">Ver Todos os Certificados</p>
        </div>
      </div>
    </div>
  );
}

function HorizontalBorder() {
  return (
    <div className="content-stretch flex items-center justify-between pb-[17px] relative shrink-0 w-full" data-name="HorizontalBorder">
      <div aria-hidden="true" className="absolute border-[rgba(222,191,191,0.1)] border-b border-solid inset-0 pointer-events-none" />
      <Heading />
      <Link />
    </div>
  );
}

function Container1() {
  return (
    <div className="h-[26.25px] relative shrink-0 w-[20px]" data-name="Container">
      <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 20 26.25">
        <g id="Container">
          <path d={svgPaths.p4fe3ea0} fill="var(--fill-0, #6B0119)" id="Icon" />
        </g>
      </svg>
    </div>
  );
}

function BackgroundShadow() {
  return (
    <div className="bg-white drop-shadow-[0px_1px_1px_rgba(0,0,0,0.05)] relative rounded-[12px] shrink-0 size-[64px]" data-name="Background+Shadow">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-center justify-center relative size-full">
        <Container1 />
      </div>
    </div>
  );
}

function Heading1() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0 w-full" data-name="Heading 3">
      <div className="flex flex-col font-['IBM_Plex_Sans:Bold',sans-serif] font-bold justify-center leading-[0] relative shrink-0 text-[#8b1e2d] text-[18px] whitespace-nowrap" style={{ fontVariationSettings: "'wdth' 100" }}>
        <p className="leading-[28px]">Mestre da Moeda</p>
      </div>
    </div>
  );
}

function Container3() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0 w-full" data-name="Container">
      <div className="flex flex-col font-['Source_Sans_3:Regular',sans-serif] font-normal justify-center leading-[0] relative shrink-0 text-[#574142] text-[14px] whitespace-nowrap">
        <p className="leading-[20px] mb-0">Atribuído por completar o percurso</p>
        <p className="leading-[20px] mb-0">completo da história monetária do século</p>
        <p className="leading-[20px]">XVIII.</p>
      </div>
    </div>
  );
}

function Container4() {
  return (
    <div className="content-stretch flex flex-col items-start pt-[8px] relative shrink-0 w-full" data-name="Container">
      <div className="flex flex-col font-['Source_Sans_3:Bold',sans-serif] font-bold justify-center leading-[0] relative shrink-0 text-[#94a3b8] text-[10px] tracking-[1px] uppercase whitespace-nowrap">
        <p className="leading-[15px]">ID: AEA-4492-X</p>
      </div>
    </div>
  );
}

function Container2() {
  return (
    <div className="h-full relative shrink-0 w-[242.34px]" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col items-start relative size-full">
        <Heading1 />
        <Container3 />
        <Container4 />
      </div>
    </div>
  );
}

function MeritItem() {
  return (
    <div className="bg-[#eff4ff] col-1 h-[159px] justify-self-stretch relative rounded-[8px] row-1 shrink-0" data-name="Merit Item">
      <div aria-hidden="true" className="absolute border-[#6b0119] border-l-4 border-solid inset-0 pointer-events-none rounded-[8px]" />
      <div className="content-stretch flex gap-[16px] items-start pl-[28px] pr-[24px] py-[24px] relative size-full">
        <BackgroundShadow />
        <Container2 />
      </div>
    </div>
  );
}

function Container5() {
  return (
    <div className="h-[20px] relative shrink-0 w-[24.375px]" data-name="Container">
      <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 24.375 20">
        <g id="Container">
          <path d={svgPaths.p2bd4edc0} fill="var(--fill-0, #6B0119)" id="Icon" />
        </g>
      </svg>
    </div>
  );
}

function BackgroundShadow1() {
  return (
    <div className="bg-white drop-shadow-[0px_1px_1px_rgba(0,0,0,0.05)] relative rounded-[12px] shrink-0 size-[64px]" data-name="Background+Shadow">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-center justify-center relative size-full">
        <Container5 />
      </div>
    </div>
  );
}

function Heading2() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0 w-full" data-name="Heading 3">
      <div className="flex flex-col font-['IBM_Plex_Sans:Bold',sans-serif] font-bold justify-center leading-[0] relative shrink-0 text-[#8b1e2d] text-[18px] whitespace-nowrap" style={{ fontVariationSettings: "'wdth' 100" }}>
        <p className="leading-[28px]">Arquivista Principal</p>
      </div>
    </div>
  );
}

function Container7() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0 w-full" data-name="Container">
      <div className="flex flex-col font-['Source_Sans_3:Regular',sans-serif] font-normal justify-center leading-[0] relative shrink-0 text-[#574142] text-[14px] whitespace-nowrap">
        <p className="leading-[20px] mb-0">Reconhecido por contribuir com mais de</p>
        <p className="leading-[20px]">20 fontes primárias para o repositório.</p>
      </div>
    </div>
  );
}

function Container8() {
  return (
    <div className="content-stretch flex flex-col items-start pt-[8px] relative shrink-0 w-full" data-name="Container">
      <div className="flex flex-col font-['Source_Sans_3:Bold',sans-serif] font-bold justify-center leading-[0] relative shrink-0 text-[#94a3b8] text-[10px] tracking-[1px] uppercase whitespace-nowrap">
        <p className="leading-[15px]">ID: AEA-1102-A</p>
      </div>
    </div>
  );
}

function Container6() {
  return (
    <div className="h-full relative shrink-0 w-[236.06px]" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col items-start relative size-full">
        <Heading2 />
        <Container7 />
        <Container8 />
      </div>
    </div>
  );
}

function MeritItem1() {
  return (
    <div className="bg-[#eff4ff] col-2 h-[159px] justify-self-stretch relative rounded-[8px] row-1 shrink-0" data-name="Merit Item">
      <div aria-hidden="true" className="absolute border-[#6b0119] border-l-4 border-solid inset-0 pointer-events-none rounded-[8px]" />
      <div className="content-stretch flex gap-[16px] items-start pl-[28px] pr-[24px] py-[24px] relative size-full">
        <BackgroundShadow1 />
        <Container6 />
      </div>
    </div>
  );
}

function Container9() {
  return (
    <div className="relative shrink-0 size-[25px]" data-name="Container">
      <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 25 25">
        <g id="Container">
          <path d={svgPaths.p34a70300} fill="var(--fill-0, #CBD5E1)" id="Icon" />
        </g>
      </svg>
    </div>
  );
}

function BackgroundShadow2() {
  return (
    <div className="bg-white drop-shadow-[0px_1px_1px_rgba(0,0,0,0.05)] relative rounded-[12px] shrink-0 size-[64px]" data-name="Background+Shadow">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-center justify-center relative size-full">
        <Container9 />
      </div>
    </div>
  );
}

function Heading3() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0 w-full" data-name="Heading 3">
      <div className="flex flex-col font-['IBM_Plex_Sans:Bold',sans-serif] font-bold justify-center leading-[0] relative shrink-0 text-[#94a3b8] text-[18px] whitespace-nowrap" style={{ fontVariationSettings: "'wdth' 100" }}>
        <p className="leading-[28px]">Ligação Institucional</p>
      </div>
    </div>
  );
}

function Container11() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0 w-full" data-name="Container">
      <div className="flex flex-col font-['Source_Sans_3:Regular',sans-serif] font-normal justify-center leading-[0] relative shrink-0 text-[#94a3b8] text-[14px] whitespace-nowrap">
        <p className="leading-[20px] mb-0">Estabelecer 5 ligações institucionais</p>
        <p className="leading-[20px]">dentro da rede do Arquivo.</p>
      </div>
    </div>
  );
}

function Container12() {
  return (
    <div className="content-stretch flex flex-col items-start pt-[8px] relative shrink-0 w-full" data-name="Container">
      <div className="flex flex-col font-['Source_Sans_3:Bold',sans-serif] font-bold justify-center leading-[0] relative shrink-0 text-[#94a3b8] text-[10px] tracking-[1px] uppercase whitespace-nowrap">
        <p className="leading-[15px]">EM PROGRESSO: 3/5</p>
      </div>
    </div>
  );
}

function Container10() {
  return (
    <div className="h-full relative shrink-0 w-[208.95px]" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col items-start relative size-full">
        <Heading3 />
        <Container11 />
        <Container12 />
      </div>
    </div>
  );
}

function MeritItem2() {
  return (
    <div className="bg-[#eff4ff] col-1 h-[139px] justify-self-stretch opacity-60 relative rounded-[8px] row-2 shrink-0" data-name="Merit Item">
      <div aria-hidden="true" className="absolute border-[rgba(107,1,25,0.2)] border-l-4 border-solid inset-0 pointer-events-none rounded-[8px]" />
      <div className="content-stretch flex gap-[16px] items-start pl-[28px] pr-[24px] py-[24px] relative size-full">
        <BackgroundShadow2 />
        <Container10 />
      </div>
    </div>
  );
}

function Container13() {
  return (
    <div className="h-[26.25px] relative shrink-0 w-[27.5px]" data-name="Container">
      <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 27.5 26.25">
        <g id="Container">
          <path d={svgPaths.p2e076997} fill="var(--fill-0, #CBD5E1)" id="Icon" />
        </g>
      </svg>
    </div>
  );
}

function BackgroundShadow3() {
  return (
    <div className="bg-white drop-shadow-[0px_1px_1px_rgba(0,0,0,0.05)] relative rounded-[12px] shrink-0 size-[64px]" data-name="Background+Shadow">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-center justify-center relative size-full">
        <Container13 />
      </div>
    </div>
  );
}

function Heading4() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0 w-full" data-name="Heading 3">
      <div className="flex flex-col font-['IBM_Plex_Sans:Bold',sans-serif] font-bold justify-center leading-[0] relative shrink-0 text-[#94a3b8] text-[18px] whitespace-nowrap" style={{ fontVariationSettings: "'wdth' 100" }}>
        <p className="leading-[28px]">Verificador de Factos Prata</p>
      </div>
    </div>
  );
}

function Container15() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0 w-full" data-name="Container">
      <div className="flex flex-col font-['Source_Sans_3:Regular',sans-serif] font-normal justify-center leading-[0] relative shrink-0 text-[#94a3b8] text-[14px] whitespace-nowrap">
        <p className="leading-[20px] mb-0">Rever 50 submissões da comunidade</p>
        <p className="leading-[20px]">com uma taxa de verificação de 95%.</p>
      </div>
    </div>
  );
}

function Container16() {
  return (
    <div className="content-stretch flex flex-col items-start pt-[8px] relative shrink-0 w-full" data-name="Container">
      <div className="flex flex-col font-['Source_Sans_3:Bold',sans-serif] font-bold justify-center leading-[0] relative shrink-0 text-[#94a3b8] text-[10px] tracking-[1px] uppercase whitespace-nowrap">
        <p className="leading-[15px]">EM PROGRESSO: 12/50</p>
      </div>
    </div>
  );
}

function Container14() {
  return (
    <div className="h-full relative shrink-0 w-[228.3px]" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col items-start relative size-full">
        <Heading4 />
        <Container15 />
        <Container16 />
      </div>
    </div>
  );
}

function MeritItem3() {
  return (
    <div className="bg-[#eff4ff] col-2 h-[139px] justify-self-stretch opacity-60 relative rounded-[8px] row-2 shrink-0" data-name="Merit Item">
      <div aria-hidden="true" className="absolute border-[rgba(107,1,25,0.2)] border-l-4 border-solid inset-0 pointer-events-none rounded-[8px]" />
      <div className="content-stretch flex gap-[16px] items-start pl-[28px] pr-[24px] py-[24px] relative size-full">
        <BackgroundShadow3 />
        <Container14 />
      </div>
    </div>
  );
}

function Container() {
  return (
    <div className="gap-x-[24px] gap-y-[24px] grid grid-cols-[repeat(2,minmax(0,1fr))] grid-rows-[__159px_139px] relative shrink-0 w-full" data-name="Container">
      <MeritItem />
      <MeritItem1 />
      <MeritItem2 />
      <MeritItem3 />
    </div>
  );
}

function MeritsDistinctions23Width() {
  return (
    <div className="col-[1/span_2] content-stretch flex flex-col gap-[32px] items-start justify-self-stretch pb-[63px] relative row-1 self-start shrink-0" data-name="Merits & Distinctions (2/3 width)">
      <HorizontalBorder />
      <Container />
    </div>
  );
}

function Heading5() {
  return (
    <div className="relative shrink-0 w-full" data-name="Heading 2">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col items-start relative size-full">
        <div className="flex flex-col font-['IBM_Plex_Sans:Bold',sans-serif] font-bold justify-center leading-[0] relative shrink-0 text-[#8b1e2d] text-[24px] w-full" style={{ fontVariationSettings: "'wdth' 100" }}>
          <p className="leading-[32px]">Controlos de Conta</p>
        </div>
      </div>
    </div>
  );
}

function HorizontalBorder1() {
  return (
    <div className="content-stretch flex flex-col items-start pb-[17px] relative shrink-0 w-full" data-name="HorizontalBorder">
      <div aria-hidden="true" className="absolute border-[rgba(222,191,191,0.1)] border-b border-solid inset-0 pointer-events-none" />
      <Heading5 />
    </div>
  );
}

function Heading6() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0 w-full" data-name="Heading 4">
      <div className="flex flex-col font-['Source_Sans_3:Bold',sans-serif] font-bold justify-center leading-[0] relative shrink-0 text-[#574142] text-[14px] tracking-[1.4px] uppercase w-full">
        <p className="leading-[20px]">PRIVACIDADE E SEGURANÇA</p>
      </div>
    </div>
  );
}

function Container19() {
  return (
    <div className="-translate-y-1/2 absolute content-stretch flex flex-col items-start left-0 top-1/2" data-name="Container">
      <div className="flex flex-col font-['Source_Sans_3:Medium',sans-serif] font-medium justify-center leading-[0] relative shrink-0 text-[#121c2a] text-[16px] whitespace-nowrap">
        <p className="leading-[24px]">Perfil Académico Público</p>
      </div>
    </div>
  );
}

function Svg() {
  return (
    <div className="relative shrink-0 size-[16px]" data-name="SVG">
      <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 16 16">
        <g id="SVG">
          <path d={svgPaths.pf079980} fill="var(--fill-0, white)" id="Vector" />
        </g>
      </svg>
    </div>
  );
}

function Input() {
  return (
    <div className="-translate-y-1/2 absolute bg-[#6b0119] left-[281.65px] rounded-[2px] size-[18px] top-1/2" data-name="Input">
      <div className="content-stretch flex flex-col items-center justify-center overflow-clip p-px relative rounded-[inherit] size-full">
        <Svg />
      </div>
      <div aria-hidden="true" className="absolute border border-[rgba(0,0,0,0)] border-solid inset-0 pointer-events-none rounded-[2px]" />
    </div>
  );
}

function Label() {
  return (
    <div className="h-[24px] relative shrink-0 w-full" data-name="Label">
      <Container19 />
      <Input />
    </div>
  );
}

function Container20() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0" data-name="Container">
      <div className="flex flex-col font-['Source_Sans_3:Medium',sans-serif] font-medium justify-center leading-[0] relative shrink-0 text-[#121c2a] text-[16px] whitespace-nowrap">
        <p className="leading-[24px]">Autenticação de Dois Factores</p>
      </div>
    </div>
  );
}

function Label1() {
  return (
    <div className="relative shrink-0 w-full" data-name="Label">
      <div className="flex flex-row items-center size-full">
        <div className="content-stretch flex items-center justify-between pr-[0.01px] relative size-full">
          <Container20 />
          <div className="bg-white relative rounded-[2px] shrink-0 size-[16px]" data-name="Input">
            <div aria-hidden="true" className="absolute border border-[#debfbf] border-solid inset-0 pointer-events-none rounded-[2px]" />
          </div>
        </div>
      </div>
    </div>
  );
}

function Container18() {
  return (
    <div className="content-stretch flex flex-col gap-[8px] items-start relative shrink-0 w-full" data-name="Container">
      <Label />
      <Label1 />
    </div>
  );
}

function Container17() {
  return (
    <div className="content-stretch flex flex-col gap-[16px] items-start relative shrink-0 w-full" data-name="Container">
      <Heading6 />
      <Container18 />
    </div>
  );
}

function Heading7() {
  return (
    <div className="relative shrink-0 w-full" data-name="Heading 4">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col items-start relative size-full">
        <div className="flex flex-col font-['Source_Sans_3:Bold',sans-serif] font-bold justify-center leading-[0] relative shrink-0 text-[#574142] text-[14px] tracking-[1.4px] uppercase w-full">
          <p className="leading-[20px]">NOTIFICAÇÕES</p>
        </div>
      </div>
    </div>
  );
}

function Container22() {
  return (
    <div className="-translate-y-1/2 absolute content-stretch flex flex-col items-start left-0 top-1/2" data-name="Container">
      <div className="flex flex-col font-['Source_Sans_3:Medium',sans-serif] font-medium justify-center leading-[0] relative shrink-0 text-[#121c2a] text-[16px] whitespace-nowrap">
        <p className="leading-[24px]">Atualizações do Arquivo</p>
      </div>
    </div>
  );
}

function Svg1() {
  return (
    <div className="relative shrink-0 size-[16px]" data-name="SVG">
      <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 16 16">
        <g id="SVG">
          <path d={svgPaths.pf079980} fill="var(--fill-0, white)" id="Vector" />
        </g>
      </svg>
    </div>
  );
}

function Input1() {
  return (
    <div className="-translate-y-1/2 absolute bg-[#6b0119] left-[281.65px] rounded-[2px] size-[18px] top-1/2" data-name="Input">
      <div className="content-stretch flex flex-col items-center justify-center overflow-clip p-px relative rounded-[inherit] size-full">
        <Svg1 />
      </div>
      <div aria-hidden="true" className="absolute border border-[rgba(0,0,0,0)] border-solid inset-0 pointer-events-none rounded-[2px]" />
    </div>
  );
}

function Label2() {
  return (
    <div className="h-[24px] relative shrink-0 w-full" data-name="Label">
      <Container22 />
      <Input1 />
    </div>
  );
}

function Container23() {
  return (
    <div className="-translate-y-1/2 absolute content-stretch flex flex-col items-start left-0 top-1/2" data-name="Container">
      <div className="flex flex-col font-['Source_Sans_3:Medium',sans-serif] font-medium justify-center leading-[0] relative shrink-0 text-[#121c2a] text-[16px] whitespace-nowrap">
        <p className="leading-[24px]">Menções de Pares</p>
      </div>
    </div>
  );
}

function Svg2() {
  return (
    <div className="relative shrink-0 size-[16px]" data-name="SVG">
      <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 16 16">
        <g id="SVG">
          <path d={svgPaths.pf079980} fill="var(--fill-0, white)" id="Vector" />
        </g>
      </svg>
    </div>
  );
}

function Input2() {
  return (
    <div className="-translate-y-1/2 absolute bg-[#6b0119] left-[281.65px] rounded-[2px] size-[18px] top-1/2" data-name="Input">
      <div className="content-stretch flex flex-col items-center justify-center overflow-clip p-px relative rounded-[inherit] size-full">
        <Svg2 />
      </div>
      <div aria-hidden="true" className="absolute border border-[rgba(0,0,0,0)] border-solid inset-0 pointer-events-none rounded-[2px]" />
    </div>
  );
}

function Label3() {
  return (
    <div className="h-[24px] relative shrink-0 w-full" data-name="Label">
      <Container23 />
      <Input2 />
    </div>
  );
}

function Container21() {
  return (
    <div className="relative shrink-0 w-full" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col gap-[8px] items-start relative size-full">
        <Label2 />
        <Label3 />
      </div>
    </div>
  );
}

function HorizontalBorder2() {
  return (
    <div className="content-stretch flex flex-col gap-[16px] items-start pt-[17px] relative shrink-0 w-full" data-name="HorizontalBorder">
      <div aria-hidden="true" className="absolute border-[rgba(222,191,191,0.2)] border-solid border-t inset-0 pointer-events-none" />
      <Heading7 />
      <Container21 />
    </div>
  );
}

function Container24() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0" data-name="Container">
      <div className="flex flex-col font-['Source_Sans_3:Bold',sans-serif] font-bold justify-center leading-[0] relative shrink-0 text-[#ba1a1a] text-[16px] whitespace-nowrap">
        <p className="leading-[24px]">Desativar Conta do Arquivo</p>
      </div>
    </div>
  );
}

function Container25() {
  return (
    <div className="h-[19px] relative shrink-0 w-[22px]" data-name="Container">
      <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 32 32">
        <g id="Container" opacity="0">
          <path d={svgPaths.p7555480} fill="var(--fill-0, #BA1A1A)" id="Icon" />
        </g>
      </svg>
    </div>
  );
}

function Button() {
  return (
    <div className="relative rounded-[4px] shrink-0 w-full" data-name="Button">
      <div className="flex flex-row items-center size-full">
        <div className="content-stretch flex items-center justify-between pb-[12px] pt-[36px] px-[12px] relative size-full">
          <Container24 />
          <Container25 />
        </div>
      </div>
    </div>
  );
}

function Background() {
  return (
    <div className="bg-[#dee9fc] relative rounded-[8px] shrink-0 w-full" data-name="Background">
      <div className="content-stretch flex flex-col gap-[24px] items-start p-[32px] relative size-full">
        <Container17 />
        <HorizontalBorder2 />
        <Button />
      </div>
    </div>
  );
}

function AsideAccountSettings13Width() {
  return (
    <div className="col-3 content-stretch flex flex-col gap-[32px] items-start justify-self-stretch relative row-1 self-start shrink-0" data-name="Aside - Account Settings (1/3 width)">
      <HorizontalBorder1 />
      <Background />
    </div>
  );
}

export default function LowerSectionDistinctionsSettings() {
  return (
    <div className="gap-x-[48px] gap-y-[48px] grid grid-cols-[repeat(3,minmax(0,1fr))] grid-rows-[_466px] relative size-full" data-name="Lower Section: Distinctions & Settings">
      <MeritsDistinctions23Width />
      <AsideAccountSettings13Width />
    </div>
  );
}