import svgPaths from "./svg-g4b8l5xhpt";
import imgHeroSection from "./31878a23223929167fffccca19f0e20433da6343.png";
import imgOldAngolanCurrency from "./56005e9b1318e6b2c43cabb9b8b770daeebb734c.png";
import imgTrainCrossingBridge from "./33ad0644d420f0a3254eada525f90672a1d1fc62.png";
import imgGovernmentAssembly from "./e40dab4772255cc3575a8f8c90f167c3f08dc070.png";

function Heading() {
  return (
    <div className="relative shrink-0" data-name="Heading 1">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col items-start relative size-full">
        <div className="flex flex-col font-['Nimbus_Sans:Bold',sans-serif] justify-center leading-[0] not-italic relative shrink-0 text-[#8b2121] text-[20px] tracking-[-0.5px] whitespace-nowrap">
          <p className="leading-[28px]">Arquivo Económico de Angola</p>
        </div>
      </div>
    </div>
  );
}

function Link() {
  return (
    <div className="content-stretch flex flex-col items-start pb-[6px] relative shrink-0" data-name="Link">
      <div aria-hidden="true" className="absolute border-[#8b2121] border-b-2 border-solid inset-0 pointer-events-none" />
      <div className="flex flex-col font-['Nimbus_Sans:Regular',sans-serif] justify-center leading-[0] not-italic relative shrink-0 text-[#8b2121] text-[14px] whitespace-nowrap">
        <p className="leading-[20px]">Início</p>
      </div>
    </div>
  );
}

function LinkMargin() {
  return (
    <div className="content-stretch flex flex-col items-start pl-[24px] relative shrink-0" data-name="Link:margin">
      <div className="flex flex-col font-['Nimbus_Sans:Regular',sans-serif] justify-center leading-[0] not-italic relative shrink-0 text-[#6b7280] text-[14px] whitespace-nowrap">
        <p className="leading-[20px]">Conteúdos</p>
      </div>
    </div>
  );
}

function LinkMargin1() {
  return (
    <div className="content-stretch flex flex-col items-start pl-[24px] relative shrink-0 cursor-pointer" data-name="Link:margin" data-nav="comunidade">
      <div className="flex flex-col font-['Nimbus_Sans:Regular',sans-serif] justify-center leading-[0] not-italic relative shrink-0 text-[#6b7280] text-[14px] whitespace-nowrap">
        <p className="leading-[20px]">Comunidade</p>
      </div>
    </div>
  );
}

function LinkMargin2() {
  return (
    <div className="content-stretch flex flex-col items-start pl-[24px] relative shrink-0 cursor-pointer" data-name="Link:margin" data-nav="quiz">
      <div className="flex flex-col font-['Nimbus_Sans:Regular',sans-serif] justify-center leading-[0] not-italic relative shrink-0 text-[#6b7280] text-[14px] whitespace-nowrap">
        <p className="leading-[20px]">Quiz</p>
      </div>
    </div>
  );
}

function LinkMargin3() {
  return (
    <div className="content-stretch flex flex-col items-start pl-[24px] relative shrink-0" data-name="Link:margin">
      <div className="flex flex-col font-['Nimbus_Sans:Regular',sans-serif] justify-center leading-[0] not-italic relative shrink-0 text-[#6b7280] text-[14px] whitespace-nowrap">
        <p className="leading-[20px]">Perfil</p>
      </div>
    </div>
  );
}

function Nav() {
  return (
    <div className="relative shrink-0" data-name="Nav">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-center relative size-full">
        <Link />
        <LinkMargin />
        <LinkMargin1 />
        <LinkMargin2 />
        <LinkMargin3 />
      </div>
    </div>
  );
}

function Container1() {
  return (
    <div className="content-stretch flex flex-[1_0_0] flex-col items-start min-w-px overflow-clip py-px relative" data-name="Container">
      <div className="flex flex-col font-['Nimbus_Sans:Regular',sans-serif] justify-center leading-[0] not-italic relative shrink-0 text-[#6b7280] text-[12px] w-full">
        <p className="leading-[normal]">Pesquisar arquivo...</p>
      </div>
    </div>
  );
}

function Input() {
  return (
    <div className="bg-[#f3f4f6] content-stretch flex items-start justify-center overflow-clip pl-[40px] pr-[16px] py-[9px] relative rounded-[6px] shrink-0 w-[192px]" data-name="Input">
      <Container1 />
    </div>
  );
}

function Svg() {
  return (
    <div className="absolute left-[12px] size-[16px] top-[10px]" data-name="SVG">
      <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 16 16">
        <g id="SVG">
          <path d={svgPaths.p2aa1a600} id="Vector" stroke="var(--stroke-0, #9CA3AF)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33333" />
        </g>
      </svg>
    </div>
  );
}

function Container() {
  return (
    <div className="relative shrink-0" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col items-start relative size-full">
        <Input />
        <Svg />
      </div>
    </div>
  );
}

function MainHeader() {
  return (
    <div className="relative shrink-0 w-full" data-name="MainHeader">
      <div aria-hidden="true" className="absolute border-[#f3f4f6] border-b border-solid inset-0 pointer-events-none" />
      <div className="flex flex-row items-center size-full">
        <div className="content-stretch flex items-center justify-between pb-[17px] pt-[16px] px-[32px] relative size-full">
          <Heading />
          <Nav />
          <Container />
        </div>
      </div>
    </div>
  );
}

function Container2() {
  return (
    <div className="content-stretch flex flex-col items-start opacity-80 relative shrink-0 w-full" data-name="Container">
      <div className="flex flex-col font-['Nimbus_Sans:Bold',sans-serif] justify-center leading-[0] not-italic relative shrink-0 text-[10px] text-white tracking-[1px] uppercase w-full">
        <p className="leading-[15px]">MÓDULO ATUAL: TEXTOS COM JIMBUMBO</p>
      </div>
    </div>
  );
}

function Margin() {
  return (
    <div className="content-stretch flex flex-col items-start pb-[16px] relative shrink-0 w-full" data-name="Margin">
      <Container2 />
    </div>
  );
}

function Heading1() {
  return (
    <div className="content-stretch flex flex-col items-start max-w-[672px] relative shrink-0 w-full" data-name="Heading 2">
      <div className="flex flex-col font-['Liberation_Serif:Bold',sans-serif] justify-center leading-[0] not-italic relative shrink-0 text-[48px] text-white w-full">
        <p className="leading-[60px] mb-0">A Era de Ouro do Café</p>
        <p className="leading-[60px]">Angolano</p>
      </div>
    </div>
  );
}

function Heading2Margin() {
  return (
    <div className="content-stretch flex flex-col items-start max-w-[672px] pb-[24px] relative shrink-0 w-[672px]" data-name="Heading 2:margin">
      <Heading1 />
    </div>
  );
}

function Container3() {
  return (
    <div className="absolute content-stretch flex flex-col items-start left-0 max-w-[512px] opacity-90 right-0 top-[-0.63px]" data-name="Container">
      <div className="flex flex-col font-['Nimbus_Sans:Regular',sans-serif] justify-center leading-[0] not-italic relative shrink-0 text-[14px] text-white whitespace-nowrap">
        <p className="leading-[22.75px] mb-0">Explore como Angola se tornou o terceiro maior produtor mundial de café na</p>
        <p className="leading-[22.75px]">década de 1970 e o seu impacto duradouro nas infraestruturas regionais.</p>
      </div>
    </div>
  );
}

function Margin1() {
  return (
    <div className="h-[77.5px] max-w-[512px] relative shrink-0 w-[512px]" data-name="Margin">
      <Container3 />
    </div>
  );
}

function Svg1() {
  return (
    <div className="relative shrink-0 size-[16px]" data-name="SVG">
      <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 16 16">
        <g id="SVG">
          <path d={svgPaths.p3577ba00} id="Vector" stroke="var(--stroke-0, white)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33333" />
        </g>
      </svg>
    </div>
  );
}

function Button() {
  return (
    <div className="bg-[#8b2121] content-stretch flex gap-[8px] items-center px-[24px] py-[12px] relative rounded-[4px] shrink-0" data-name="Button">
      <div className="flex flex-col font-['Nimbus_Sans:Bold',sans-serif] justify-center leading-[0] not-italic relative shrink-0 text-[14px] text-center text-white whitespace-nowrap">
        <p className="leading-[20px]">Continuar Leitura</p>
      </div>
      <Svg1 />
    </div>
  );
}

function Margin2() {
  return (
    <div className="content-stretch flex flex-col items-start pl-[24px] relative shrink-0" data-name="Margin">
      <div className="flex flex-col font-['Nimbus_Sans:Regular',sans-serif] justify-center leading-[0] not-italic opacity-70 relative shrink-0 text-[12px] text-white whitespace-nowrap">
        <p className="leading-[16px]">85% concluído • faltando 2 min</p>
      </div>
    </div>
  );
}

function Container4() {
  return (
    <div className="content-stretch flex items-center relative shrink-0 w-full" data-name="Container">
      <Button />
      <Margin2 />
    </div>
  );
}

function SemiTransparentOverlayToEnsureTextReadability() {
  return (
    <div className="bg-gradient-to-r flex-[1_0_0] from-[rgba(139,33,33,0.8)] min-h-px relative to-[rgba(139,33,33,0.4)] w-full" data-name="Semi-transparent overlay to ensure text readability">
      <div className="flex flex-col justify-center size-full">
        <div className="content-stretch flex flex-col items-start justify-center p-[48px] relative size-full">
          <Margin />
          <Heading2Margin />
          <Margin1 />
          <Container4 />
        </div>
      </div>
    </div>
  );
}

function HeroSection() {
  return (
    <div className="content-stretch flex flex-col h-[424px] items-start justify-center overflow-clip pt-[24px] relative rounded-[12px] shrink-0 w-[1036px]" data-name="HeroSection">
      <div className="absolute inset-0 overflow-hidden pointer-events-none rounded-[12px]">
        <img alt="" className="absolute h-[455.7%] left-0 max-w-none top-[-177.85%] w-full" src={imgHeroSection} />
      </div>
      <SemiTransparentOverlayToEnsureTextReadability />
    </div>
  );
}

function Heading2() {
  return (
    <div className="absolute content-stretch flex flex-col items-start left-0 top-0" data-name="Heading 3">
      <div className="flex flex-col font-['Nimbus_Sans:Bold',sans-serif] justify-center leading-[0] not-italic relative shrink-0 text-[#8b2121] text-[24px] whitespace-nowrap">
        <p className="leading-[32px]">Arquivos Recomendados</p>
      </div>
      <div className="absolute bg-[#8b2121] bottom-[-8px] h-[4px] left-0 w-[48px]" data-name="Background" />
    </div>
  );
}

function Container5() {
  return (
    <div className="h-[32px] relative shrink-0 w-full" data-name="Container">
      <Heading2 />
      <div className="-translate-y-1/2 absolute flex flex-col font-['Nimbus_Sans:Bold',sans-serif] justify-center leading-[0] left-[480.8px] not-italic text-[#8b2121] text-[10px] top-[19.5px] tracking-[0.5px] uppercase whitespace-nowrap">
        <p className="leading-[15px]">EXPLORAR TODOS OS DOCUMENTOS</p>
      </div>
    </div>
  );
}

function OldAngolanCurrency() {
  return (
    <div className="flex-[1_0_0] min-h-px relative w-full" data-name="Old Angolan Currency">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <img alt="" className="absolute h-[106.77%] left-0 max-w-none top-[-3.38%] w-full" src={imgOldAngolanCurrency} />
      </div>
    </div>
  );
}

function Container6() {
  return (
    <div className="h-full relative shrink-0 w-[271.19px]" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col items-start justify-center relative size-full">
        <OldAngolanCurrency />
      </div>
    </div>
  );
}

function Container8() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0 w-full" data-name="Container">
      <div className="flex flex-col font-['Nimbus_Sans:Bold',sans-serif] justify-center leading-[0] not-italic relative shrink-0 text-[#8b2121] text-[9px] tracking-[0.9px] uppercase w-full">
        <p className="leading-[13.5px]">HISTÓRIA MONETÁRIA</p>
      </div>
    </div>
  );
}

function Margin3() {
  return (
    <div className="content-stretch flex flex-col items-start mb-[-0.5px] pb-[8px] relative shrink-0 w-full" data-name="Margin">
      <Container8 />
    </div>
  );
}

function Heading3() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0 w-full" data-name="Heading 4">
      <div className="flex flex-col font-['Liberation_Serif:Bold',sans-serif] justify-center leading-[0] not-italic relative shrink-0 text-[#1f2937] text-[20px] w-full">
        <p className="leading-[28px]">A Transição: Do Escudo ao Kwanza</p>
      </div>
    </div>
  );
}

function Heading4Margin() {
  return (
    <div className="content-stretch flex flex-col items-start mb-[-0.5px] pb-[12px] relative shrink-0 w-full" data-name="Heading 4:margin">
      <Heading3 />
    </div>
  );
}

function Container9() {
  return (
    <div className="absolute content-stretch flex flex-col items-start left-0 pb-[0.75px] right-0 top-[-0.75px]" data-name="Container">
      <div className="flex flex-col font-['Nimbus_Sans:Regular',sans-serif] justify-center leading-[0] not-italic relative shrink-0 text-[#6b7280] text-[12px] whitespace-nowrap">
        <p className="leading-[19.5px] mb-0">Uma análise profunda da reforma monetária de 1977 que</p>
        <p className="leading-[19.5px]">moldou a soberania económica da nação recém-independente.</p>
      </div>
    </div>
  );
}

function Margin4() {
  return (
    <div className="h-[63px] mb-[-0.5px] relative shrink-0 w-full" data-name="Margin">
      <Container9 />
    </div>
  );
}

function Svg2() {
  return (
    <div className="relative shrink-0 size-[12px]" data-name="SVG">
      <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 12 12">
        <g id="SVG">
          <path d={svgPaths.p7550880} id="Vector" stroke="var(--stroke-0, #8B2121)" strokeLinecap="round" strokeLinejoin="round" />
        </g>
      </svg>
    </div>
  );
}

function Link1() {
  return (
    <div className="content-stretch flex gap-[4px] items-center relative shrink-0 w-full" data-name="Link">
      <div className="flex flex-col font-['Nimbus_Sans:Bold',sans-serif] justify-center leading-[0] not-italic relative shrink-0 text-[#8b2121] text-[10px] tracking-[0.5px] uppercase whitespace-nowrap">
        <p className="leading-[15px]">LER ARQUIVO</p>
      </div>
      <Svg2 />
    </div>
  );
}

function Container7() {
  return (
    <div className="h-full relative shrink-0 w-[406.8px]" data-name="Container">
      <div className="flex flex-col justify-center size-full">
        <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col items-start justify-center p-[32px] relative size-full">
          <Margin3 />
          <Heading4Margin />
          <Margin4 />
          <Link1 />
        </div>
      </div>
    </div>
  );
}

function FeaturedCardCurrencyTransition() {
  return (
    <div className="bg-white h-[256px] relative rounded-[8px] shrink-0 w-full" data-name="Featured Card: Currency Transition">
      <div className="content-stretch flex items-start overflow-clip p-px relative rounded-[inherit] size-full">
        <Container6 />
        <Container7 />
      </div>
      <div aria-hidden="true" className="absolute border border-[#f3f4f6] border-solid inset-0 pointer-events-none rounded-[8px] shadow-[0px_1px_2px_0px_rgba(0,0,0,0.05)]" />
    </div>
  );
}

function Svg3() {
  return (
    <div className="relative shrink-0 size-[24px]" data-name="SVG">
      <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 24 24">
        <g id="SVG">
          <path d={svgPaths.p2612f620} fill="var(--fill-0, #8B2121)" id="Vector" />
        </g>
      </svg>
    </div>
  );
}

function BackgroundShadow() {
  return (
    <div className="bg-white drop-shadow-[0px_1px_1px_rgba(0,0,0,0.05)] relative rounded-[8px] shrink-0 size-[40px]" data-name="Background+Shadow">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-center justify-center relative size-full">
        <Svg3 />
      </div>
    </div>
  );
}

function Heading4() {
  return (
    <div className="relative shrink-0 w-full" data-name="Heading 4">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col items-start pt-[16.6px] relative size-full">
        <div className="flex flex-col font-['Liberation_Serif:Bold',sans-serif] justify-center leading-[0] not-italic relative shrink-0 text-[#1f2937] text-[18px] w-full">
          <p className="leading-[28px]">Caminho de Ferro de Benguela</p>
        </div>
      </div>
    </div>
  );
}

function Container11() {
  return (
    <div className="relative shrink-0 w-full" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col items-start relative size-full">
        <div className="flex flex-col font-['Nimbus_Sans:Regular',sans-serif] justify-center leading-[0] not-italic relative shrink-0 text-[#6b7280] text-[11px] w-full">
          <p className="leading-[17.88px] mb-0">Mapeamento do corredor de exportação de Copperbelt</p>
          <p className="leading-[17.88px]">até à costa atlântica através do centro de Angola.</p>
        </div>
      </div>
    </div>
  );
}

function TrainCrossingBridge() {
  return (
    <div className="flex-[1_0_0] min-h-px relative w-full" data-name="Train crossing bridge">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <img alt="" className="absolute h-[217.19%] left-0 max-w-none top-[-58.59%] w-full" src={imgTrainCrossingBridge} />
      </div>
    </div>
  );
}

function Container12() {
  return (
    <div className="h-[144.6px] relative rounded-[8px] shrink-0 w-full" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col items-start justify-center overflow-clip pt-[16.6px] relative rounded-[inherit] size-full">
        <TrainCrossingBridge />
      </div>
    </div>
  );
}

function CardRailway() {
  return (
    <div className="bg-[#f4f7fb] col-1 justify-self-stretch relative rounded-[12px] row-1 self-start shrink-0" data-name="Card: Railway">
      <div aria-hidden="true" className="absolute border border-[rgba(0,0,0,0)] border-solid inset-0 pointer-events-none rounded-[12px]" />
      <div className="content-stretch flex flex-col gap-[7.4px] items-start p-[25px] relative size-full">
        <BackgroundShadow />
        <Heading4 />
        <Container11 />
        <Container12 />
      </div>
    </div>
  );
}

function Svg4() {
  return (
    <div className="relative shrink-0 size-[24px]" data-name="SVG">
      <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 24 24">
        <g id="SVG">
          <path clipRule="evenodd" d={svgPaths.p3fc43340} fill="var(--fill-0, #8B2121)" fillRule="evenodd" id="Vector" />
        </g>
      </svg>
    </div>
  );
}

function BackgroundShadow1() {
  return (
    <div className="bg-white drop-shadow-[0px_1px_1px_rgba(0,0,0,0.05)] relative rounded-[8px] shrink-0 size-[40px]" data-name="Background+Shadow">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-center justify-center relative size-full">
        <Svg4 />
      </div>
    </div>
  );
}

function Heading5() {
  return (
    <div className="relative shrink-0 w-full" data-name="Heading 4">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col items-start pt-[16.6px] relative size-full">
        <div className="flex flex-col font-['Liberation_Serif:Bold',sans-serif] justify-center leading-[0] not-italic relative shrink-0 text-[#1f2937] text-[18px] w-full">
          <p className="leading-[28px]">Política Pós-Independência</p>
        </div>
      </div>
    </div>
  );
}

function Container13() {
  return (
    <div className="relative shrink-0 w-full" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col items-start relative size-full">
        <div className="flex flex-col font-['Nimbus_Sans:Regular',sans-serif] justify-center leading-[0] not-italic relative shrink-0 text-[#6b7280] text-[11px] w-full">
          <p className="leading-[17.88px] mb-0">Análise das estruturas da economia planeada do final</p>
          <p className="leading-[17.88px]">dos anos 70 e 80 no contexto regional.</p>
        </div>
      </div>
    </div>
  );
}

function GovernmentAssembly() {
  return (
    <div className="flex-[1_0_0] min-h-px relative w-full" data-name="Government Assembly">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <img alt="" className="absolute h-[217.19%] left-0 max-w-none top-[-58.59%] w-full" src={imgGovernmentAssembly} />
      </div>
    </div>
  );
}

function Container14() {
  return (
    <div className="h-[144.6px] relative rounded-[8px] shrink-0 w-full" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col items-start justify-center overflow-clip pt-[16.6px] relative rounded-[inherit] size-full">
        <GovernmentAssembly />
      </div>
    </div>
  );
}

function CardPostIndependencePolicy() {
  return (
    <div className="bg-[#f4f7fb] col-2 justify-self-stretch relative rounded-[12px] row-1 self-start shrink-0" data-name="Card: Post-Independence Policy">
      <div aria-hidden="true" className="absolute border border-[rgba(0,0,0,0)] border-solid inset-0 pointer-events-none rounded-[12px]" />
      <div className="content-stretch flex flex-col gap-[7.4px] items-start p-[25px] relative size-full">
        <BackgroundShadow1 />
        <Heading5 />
        <Container13 />
        <Container14 />
      </div>
    </div>
  );
}

function Container10() {
  return (
    <div className="gap-x-[24px] gap-y-[24px] grid grid-cols-[repeat(2,minmax(0,1fr))] grid-rows-[_337.75px] pt-[8px] relative shrink-0 w-full" data-name="Container">
      <CardRailway />
      <CardPostIndependencePolicy />
    </div>
  );
}

function SectionRecommendedArchives() {
  return (
    <div className="col-[1/span_8] content-stretch flex flex-col gap-[24px] items-start justify-self-stretch pb-[54.5px] relative row-1 self-start shrink-0" data-name="Section - RecommendedArchives">
      <Container5 />
      <FeaturedCardCurrencyTransition />
      <Container10 />
    </div>
  );
}

function Svg6() {
  return (
    <div className="flex-[1_0_0] min-h-px overflow-clip relative w-[20px]" data-name="SVG">
      <div className="absolute inset-[15%_35%_30%_10%]" data-name="Vector">
        <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 11 11">
          <path d={svgPaths.p176b3d00} fill="var(--fill-0, #8B2121)" id="Vector" />
        </svg>
      </div>
      <div className="absolute inset-[35%_10%_10%_40.31%]" data-name="Vector">
        <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 9.938 11">
          <path d={svgPaths.p3ef78610} fill="var(--fill-0, #8B2121)" id="Vector" />
        </svg>
      </div>
    </div>
  );
}

function Svg5() {
  return (
    <div className="content-stretch flex flex-col items-start justify-center overflow-clip relative shrink-0 size-[20px]" data-name="SVG">
      <Svg6 />
    </div>
  );
}

function SvgMargin() {
  return (
    <div className="content-stretch flex flex-col h-[20px] items-start pr-[8px] relative shrink-0 w-[28px]" data-name="SVG:margin">
      <Svg5 />
    </div>
  );
}

function Heading6() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0" data-name="Heading 4">
      <div className="flex flex-col font-['Nimbus_Sans:Bold',sans-serif] justify-center leading-[0] not-italic relative shrink-0 text-[#8b2121] text-[16px] whitespace-nowrap">
        <p className="leading-[24px]">Discussões Ativas</p>
      </div>
    </div>
  );
}

function Container15() {
  return (
    <div className="content-stretch flex items-center relative shrink-0 w-full" data-name="Container">
      <SvgMargin />
      <Heading6 />
    </div>
  );
}

function Heading7() {
  return (
    <div className="absolute content-stretch flex flex-col items-start left-0 right-0 top-[-1px]" data-name="Heading 5">
      <div className="flex flex-col font-['Nimbus_Sans:Bold',sans-serif] justify-center leading-[0] not-italic relative shrink-0 text-[#1f2937] text-[11px] whitespace-nowrap">
        <p className="leading-[16.5px]">Impacto da Modernização do Porto do Lobito</p>
      </div>
    </div>
  );
}

function Container18() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0" data-name="Container">
      <div className="flex flex-col font-['Nimbus_Sans:Bold',sans-serif] justify-center leading-[0] not-italic relative shrink-0 text-[#8b2121] text-[9px] whitespace-nowrap">
        <p className="leading-[13.5px]">Dr. Agostinho Neto</p>
      </div>
    </div>
  );
}

function Margin5() {
  return (
    <div className="content-stretch flex flex-col items-start px-[8px] relative shrink-0" data-name="Margin">
      <div className="flex flex-col font-['Nimbus_Sans:Regular',sans-serif] justify-center leading-[0] not-italic relative shrink-0 text-[#6b7280] text-[9px] whitespace-nowrap">
        <p className="leading-[13.5px]">•</p>
      </div>
    </div>
  );
}

function Container19() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0" data-name="Container">
      <div className="flex flex-col font-['Nimbus_Sans:Regular',sans-serif] justify-center leading-[0] not-italic relative shrink-0 text-[#6b7280] text-[9px] whitespace-nowrap">
        <p className="leading-[13.5px]">24 Respostas</p>
      </div>
    </div>
  );
}

function Container17() {
  return (
    <div className="absolute content-stretch flex items-center left-0 right-0 top-[20.5px]" data-name="Container">
      <Container18 />
      <Margin5 />
      <Container19 />
    </div>
  );
}

function HorizontalBorder() {
  return (
    <div className="h-[47px] relative shrink-0 w-full" data-name="HorizontalBorder">
      <div aria-hidden="true" className="absolute border-[#e5e7eb] border-b border-solid inset-0 pointer-events-none" />
      <Heading7 />
      <Container17 />
    </div>
  );
}

function Heading8() {
  return (
    <div className="absolute content-stretch flex flex-col items-start left-0 right-0 top-0" data-name="Heading 5">
      <div className="flex flex-col font-['Nimbus_Sans:Bold',sans-serif] justify-center leading-[0] not-italic relative shrink-0 text-[#1f2937] text-[11px] whitespace-nowrap">
        <p className="leading-[16.5px]">Choques Petrolíferos dos Anos 80</p>
      </div>
    </div>
  );
}

function Container21() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0" data-name="Container">
      <div className="flex flex-col font-['Nimbus_Sans:Bold',sans-serif] justify-center leading-[0] not-italic relative shrink-0 text-[#8b2121] text-[9px] whitespace-nowrap">
        <p className="leading-[13.5px]">Prof.ª Isabel Santos</p>
      </div>
    </div>
  );
}

function Margin6() {
  return (
    <div className="content-stretch flex flex-col items-start px-[8px] relative shrink-0" data-name="Margin">
      <div className="flex flex-col font-['Nimbus_Sans:Regular',sans-serif] justify-center leading-[0] not-italic relative shrink-0 text-[#6b7280] text-[9px] whitespace-nowrap">
        <p className="leading-[13.5px]">•</p>
      </div>
    </div>
  );
}

function Container22() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0" data-name="Container">
      <div className="flex flex-col font-['Nimbus_Sans:Regular',sans-serif] justify-center leading-[0] not-italic relative shrink-0 text-[#6b7280] text-[9px] whitespace-nowrap">
        <p className="leading-[13.5px]">12 Respostas</p>
      </div>
    </div>
  );
}

function Container20() {
  return (
    <div className="absolute content-stretch flex items-center left-0 right-0 top-[21.5px]" data-name="Container">
      <Container21 />
      <Margin6 />
      <Container22 />
    </div>
  );
}

function HorizontalBorder1() {
  return (
    <div className="h-[48px] relative shrink-0 w-full" data-name="HorizontalBorder">
      <div aria-hidden="true" className="absolute border-[#e5e7eb] border-b border-solid inset-0 pointer-events-none" />
      <Heading8 />
      <Container20 />
    </div>
  );
}

function Heading9() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0 w-full" data-name="Heading 5">
      <div className="flex flex-col font-['Nimbus_Sans:Bold',sans-serif] justify-center leading-[0] not-italic relative shrink-0 text-[#1f2937] text-[11px] w-full">
        <p className="leading-[16.5px]">Histórias Orais da Exploração de Diamantes</p>
      </div>
    </div>
  );
}

function Container25() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0" data-name="Container">
      <div className="flex flex-col font-['Nimbus_Sans:Bold',sans-serif] justify-center leading-[0] not-italic relative shrink-0 text-[#8b2121] text-[9px] whitespace-nowrap">
        <p className="leading-[13.5px]">L. Martins</p>
      </div>
    </div>
  );
}

function Margin7() {
  return (
    <div className="content-stretch flex flex-col items-start px-[8px] relative shrink-0" data-name="Margin">
      <div className="flex flex-col font-['Nimbus_Sans:Regular',sans-serif] justify-center leading-[0] not-italic relative shrink-0 text-[#6b7280] text-[9px] whitespace-nowrap">
        <p className="leading-[13.5px]">•</p>
      </div>
    </div>
  );
}

function Container26() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0" data-name="Container">
      <div className="flex flex-col font-['Nimbus_Sans:Regular',sans-serif] justify-center leading-[0] not-italic relative shrink-0 text-[#6b7280] text-[9px] whitespace-nowrap">
        <p className="leading-[13.5px]">5 Respostas</p>
      </div>
    </div>
  );
}

function Container24() {
  return (
    <div className="content-stretch flex items-center relative shrink-0 w-full" data-name="Container">
      <Container25 />
      <Margin7 />
      <Container26 />
    </div>
  );
}

function Container23() {
  return (
    <div className="content-stretch flex flex-col gap-[4px] items-start pb-[12px] relative shrink-0 w-full" data-name="Container">
      <Heading9 />
      <Container24 />
    </div>
  );
}

function Container16() {
  return (
    <div className="content-stretch flex flex-col gap-[15px] items-start pt-[8px] relative shrink-0 w-full" data-name="Container">
      <HorizontalBorder />
      <HorizontalBorder1 />
      <Container23 />
    </div>
  );
}

function Button1() {
  return (
    <div className="content-stretch flex items-center justify-center px-px py-[9px] relative rounded-[4px] shrink-0 w-full" data-name="Button">
      <div aria-hidden="true" className="absolute border border-[#d1d5db] border-solid inset-0 pointer-events-none rounded-[4px]" />
      <div className="flex flex-col font-['Nimbus_Sans:Bold',sans-serif] justify-center leading-[0] not-italic relative shrink-0 text-[#6b7280] text-[10px] text-center tracking-[0.5px] uppercase whitespace-nowrap">
        <p className="leading-[15px]">ADERIR À COMUNIDADE</p>
      </div>
    </div>
  );
}

function ActiveDiscussions() {
  return (
    <div className="bg-[#f4f7fb] relative rounded-[12px] shrink-0 w-full" data-name="ActiveDiscussions">
      <div className="content-stretch flex flex-col gap-[16px] items-start p-[24px] relative size-full">
        <Container15 />
        <Container16 />
        <Button1 />
      </div>
    </div>
  );
}

function Svg8() {
  return (
    <div className="flex-[1_0_0] min-h-px overflow-clip relative w-[20px]" data-name="SVG">
      <div className="absolute inset-[12.5%]" data-name="Vector">
        <div className="absolute inset-[-5.56%]">
          <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 16.6667 16.6667">
            <path d={svgPaths.p2ef36b00} id="Vector" stroke="var(--stroke-0, white)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.66667" />
          </svg>
        </div>
      </div>
    </div>
  );
}

function Svg7() {
  return (
    <div className="content-stretch flex flex-col items-start justify-center overflow-clip relative shrink-0 size-[20px]" data-name="SVG">
      <Svg8 />
    </div>
  );
}

function SvgMargin1() {
  return (
    <div className="content-stretch flex flex-col h-[20px] items-start pr-[8px] relative shrink-0 w-[28px]" data-name="SVG:margin">
      <Svg7 />
    </div>
  );
}

function Heading10() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0" data-name="Heading 4">
      <div className="flex flex-col font-['Nimbus_Sans:Bold',sans-serif] justify-center leading-[0] not-italic relative shrink-0 text-[16px] text-white whitespace-nowrap">
        <p className="leading-[24px]">Principais Investigadores</p>
      </div>
    </div>
  );
}

function Container27() {
  return (
    <div className="content-stretch flex items-center relative shrink-0 w-full" data-name="Container">
      <SvgMargin1 />
      <Heading10 />
    </div>
  );
}

function Background() {
  return (
    <div className="bg-[#991b1b] content-stretch flex items-center justify-center relative rounded-[9999px] shrink-0 size-[32px]" data-name="Background">
      <div className="flex flex-col font-['Nimbus_Sans:Bold',sans-serif] justify-center leading-[0] not-italic relative shrink-0 text-[12px] text-center text-white whitespace-nowrap">
        <p className="leading-[16px]">1</p>
      </div>
    </div>
  );
}

function Margin8() {
  return (
    <div className="content-stretch flex flex-col h-[32px] items-start pr-[12px] relative shrink-0 w-[44px]" data-name="Margin">
      <Background />
    </div>
  );
}

function Container31() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0 w-full" data-name="Container">
      <div className="flex flex-col font-['Nimbus_Sans:Bold',sans-serif] justify-center leading-[0] not-italic relative shrink-0 text-[12px] text-white whitespace-nowrap">
        <p className="leading-[16px]">Dr. Manuel Vicente</p>
      </div>
    </div>
  );
}

function Container32() {
  return (
    <div className="content-stretch flex flex-col items-start opacity-70 relative shrink-0 w-full" data-name="Container">
      <div className="flex flex-col font-['Nimbus_Sans:Regular',sans-serif] justify-center leading-[0] not-italic relative shrink-0 text-[9px] text-white whitespace-nowrap">
        <p className="leading-[13.5px]">Política Macroeconómica</p>
      </div>
    </div>
  );
}

function Container30() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0 w-[106.64px]" data-name="Container">
      <Container31 />
      <Container32 />
    </div>
  );
}

function Container29() {
  return (
    <div className="content-stretch flex items-center relative shrink-0" data-name="Container">
      <Margin8 />
      <Container30 />
    </div>
  );
}

function Container34() {
  return (
    <div className="content-stretch flex flex-col items-end relative shrink-0 w-full" data-name="Container">
      <div className="flex flex-col font-['Nimbus_Sans:Bold',sans-serif] justify-center leading-[0] not-italic relative shrink-0 text-[12px] text-right text-white whitespace-nowrap">
        <p className="leading-[16px]">4.2k</p>
      </div>
    </div>
  );
}

function Container35() {
  return (
    <div className="content-stretch flex flex-col items-end opacity-70 relative shrink-0 w-full" data-name="Container">
      <div className="flex flex-col font-['Nimbus_Sans:Regular',sans-serif] justify-center leading-[0] not-italic relative shrink-0 text-[8px] text-right text-white whitespace-nowrap">
        <p className="leading-[12px]">Pontos</p>
      </div>
    </div>
  );
}

function Container33() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0 w-[24.61px]" data-name="Container">
      <Container34 />
      <Container35 />
    </div>
  );
}

function Investigator() {
  return (
    <div className="content-stretch flex items-center justify-between relative shrink-0 w-full" data-name="Investigator 1">
      <Container29 />
      <Container33 />
    </div>
  );
}

function Background1() {
  return (
    <div className="bg-[#991b1b] content-stretch flex items-center justify-center relative rounded-[9999px] shrink-0 size-[32px]" data-name="Background">
      <div className="flex flex-col font-['Nimbus_Sans:Bold',sans-serif] justify-center leading-[0] not-italic relative shrink-0 text-[12px] text-center text-white whitespace-nowrap">
        <p className="leading-[16px]">2</p>
      </div>
    </div>
  );
}

function Margin9() {
  return (
    <div className="content-stretch flex flex-col h-[32px] items-start pr-[12px] relative shrink-0 w-[44px]" data-name="Margin">
      <Background1 />
    </div>
  );
}

function Container38() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0 w-full" data-name="Container">
      <div className="flex flex-col font-['Nimbus_Sans:Bold',sans-serif] justify-center leading-[0] not-italic relative shrink-0 text-[12px] text-white whitespace-nowrap">
        <p className="leading-[16px]">Sofia Teixeira</p>
      </div>
    </div>
  );
}

function Container39() {
  return (
    <div className="content-stretch flex flex-col items-start opacity-70 relative shrink-0 w-full" data-name="Container">
      <div className="flex flex-col font-['Nimbus_Sans:Regular',sans-serif] justify-center leading-[0] not-italic relative shrink-0 text-[9px] text-white whitespace-nowrap">
        <p className="leading-[13.5px]">História Digital</p>
      </div>
    </div>
  );
}

function Container37() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0 w-[77.05px]" data-name="Container">
      <Container38 />
      <Container39 />
    </div>
  );
}

function Container36() {
  return (
    <div className="content-stretch flex items-center relative shrink-0" data-name="Container">
      <Margin9 />
      <Container37 />
    </div>
  );
}

function Container41() {
  return (
    <div className="content-stretch flex flex-col items-end relative shrink-0 w-full" data-name="Container">
      <div className="flex flex-col font-['Nimbus_Sans:Bold',sans-serif] justify-center leading-[0] not-italic relative shrink-0 text-[12px] text-right text-white whitespace-nowrap">
        <p className="leading-[16px]">3.8k</p>
      </div>
    </div>
  );
}

function Container42() {
  return (
    <div className="content-stretch flex flex-col items-end opacity-70 relative shrink-0 w-full" data-name="Container">
      <div className="flex flex-col font-['Nimbus_Sans:Regular',sans-serif] justify-center leading-[0] not-italic relative shrink-0 text-[8px] text-right text-white whitespace-nowrap">
        <p className="leading-[12px]">Pontos</p>
      </div>
    </div>
  );
}

function Container40() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0 w-[24.61px]" data-name="Container">
      <Container41 />
      <Container42 />
    </div>
  );
}

function Investigator1() {
  return (
    <div className="content-stretch flex items-center justify-between relative shrink-0 w-full" data-name="Investigator 2">
      <Container36 />
      <Container40 />
    </div>
  );
}

function Background2() {
  return (
    <div className="bg-[#991b1b] content-stretch flex items-center justify-center relative rounded-[9999px] shrink-0 size-[32px]" data-name="Background">
      <div className="flex flex-col font-['Nimbus_Sans:Bold',sans-serif] justify-center leading-[0] not-italic relative shrink-0 text-[12px] text-center text-white whitespace-nowrap">
        <p className="leading-[16px]">3</p>
      </div>
    </div>
  );
}

function Margin10() {
  return (
    <div className="content-stretch flex flex-col h-[32px] items-start pr-[12px] relative shrink-0 w-[44px]" data-name="Margin">
      <Background2 />
    </div>
  );
}

function Container45() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0 w-full" data-name="Container">
      <div className="flex flex-col font-['Nimbus_Sans:Bold',sans-serif] justify-center leading-[0] not-italic relative shrink-0 text-[12px] text-white whitespace-nowrap">
        <p className="leading-[16px]">Joaquim Silva</p>
      </div>
    </div>
  );
}

function Container46() {
  return (
    <div className="content-stretch flex flex-col items-start opacity-70 relative shrink-0 w-full" data-name="Container">
      <div className="flex flex-col font-['Nimbus_Sans:Regular',sans-serif] justify-center leading-[0] not-italic relative shrink-0 text-[9px] text-white whitespace-nowrap">
        <p className="leading-[13.5px]">Recursos Hidrocarbonetos</p>
      </div>
    </div>
  );
}

function Container44() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0 w-[106.39px]" data-name="Container">
      <Container45 />
      <Container46 />
    </div>
  );
}

function Container43() {
  return (
    <div className="content-stretch flex items-center relative shrink-0" data-name="Container">
      <Margin10 />
      <Container44 />
    </div>
  );
}

function Container48() {
  return (
    <div className="content-stretch flex flex-col items-end relative shrink-0 w-full" data-name="Container">
      <div className="flex flex-col font-['Nimbus_Sans:Bold',sans-serif] justify-center leading-[0] not-italic relative shrink-0 text-[12px] text-right text-white whitespace-nowrap">
        <p className="leading-[16px]">3.5k</p>
      </div>
    </div>
  );
}

function Container49() {
  return (
    <div className="content-stretch flex flex-col items-end opacity-70 relative shrink-0 w-full" data-name="Container">
      <div className="flex flex-col font-['Nimbus_Sans:Regular',sans-serif] justify-center leading-[0] not-italic relative shrink-0 text-[8px] text-right text-white whitespace-nowrap">
        <p className="leading-[12px]">Pontos</p>
      </div>
    </div>
  );
}

function Container47() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0 w-[24.61px]" data-name="Container">
      <Container48 />
      <Container49 />
    </div>
  );
}

function Investigator2() {
  return (
    <div className="content-stretch flex items-center justify-between relative shrink-0 w-full" data-name="Investigator 3">
      <Container43 />
      <Container47 />
    </div>
  );
}

function Container28() {
  return (
    <div className="content-stretch flex flex-col gap-[16px] items-start relative shrink-0 w-full" data-name="Container">
      <Investigator />
      <Investigator1 />
      <Investigator2 />
    </div>
  );
}

function TopResearchers() {
  return (
    <div className="bg-[#8b2121] relative rounded-[12px] shrink-0 w-full" data-name="TopResearchers">
      <div className="content-stretch flex flex-col gap-[24px] items-start p-[24px] relative size-full">
        <Container27 />
        <Container28 />
      </div>
    </div>
  );
}

function Container50() {
  return (
    <div className="absolute content-stretch flex flex-col items-start left-[28px] right-0 top-[22.75px]" data-name="Container">
      <div className="flex flex-col font-['Liberation_Serif:Italic',sans-serif] justify-center leading-[0] not-italic relative shrink-0 text-[#374151] text-[14px] whitespace-nowrap">
        <p className="leading-[22.75px] mb-0">{`"Compreender o passado é a única forma de`}</p>
        <p className="leading-[22.75px] mb-0">salvaguardar o futuro económico da nossa nação</p>
        <p className="leading-[22.75px]">{`soberana."`}</p>
      </div>
    </div>
  );
}

function Container51() {
  return (
    <div className="absolute content-stretch flex flex-col items-start left-[28px] pt-[37.2px] right-0 top-[71.05px]" data-name="Container">
      <div className="flex flex-col font-['Nimbus_Sans:Bold',sans-serif] justify-center leading-[0] not-italic relative shrink-0 text-[#8b2121] text-[10px] tracking-[0.5px] uppercase whitespace-nowrap">
        <p className="leading-[15px]">— COMISSÃO DE ARQUIVOS ANGOLANOS, 1978</p>
      </div>
    </div>
  );
}

function QuoteSection() {
  return (
    <div className="h-[131.25px] relative shrink-0 w-full" data-name="QuoteSection">
      <div aria-hidden="true" className="absolute border-[#8b2121] border-l-4 border-solid inset-0 pointer-events-none" />
      <div className="absolute h-[24.188px] left-[29.05px] top-[13.55px] w-[34.365px]" data-name="Icon">
        <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 34.3652 24.1875">
          <path d={svgPaths.p3322a000} fill="var(--fill-0, #8B2121)" id="Icon" opacity="0.3" />
        </svg>
      </div>
      <Container50 />
      <Container51 />
    </div>
  );
}

function AsideSidebar() {
  return (
    <div className="col-[9/span_4] content-stretch flex flex-col gap-[32px] items-start justify-self-stretch relative row-1 self-start shrink-0" data-name="Aside - Sidebar">
      <ActiveDiscussions />
      <TopResearchers />
      <QuoteSection />
    </div>
  );
}

function MainContentGrid() {
  return (
    <div className="relative shrink-0 w-full" data-name="MainContentGrid">
      <div className="gap-x-[32px] gap-y-[32px] grid grid-cols-[repeat(12,minmax(0,1fr))] grid-rows-[_736.25px] px-[32px] py-[40px] relative size-full">
        <SectionRecommendedArchives />
        <AsideSidebar />
      </div>
    </div>
  );
}

function Heading11() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0 w-full" data-name="Heading 5">
      <div className="flex flex-col font-['Nimbus_Sans:Bold',sans-serif] justify-center leading-[0] not-italic relative shrink-0 text-[#1f2937] text-[14px] w-full">
        <p className="leading-[20px]">Arquivo Económico de Angola</p>
      </div>
    </div>
  );
}

function Container53() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0 w-full" data-name="Container">
      <div className="flex flex-col font-['Nimbus_Sans:Regular',sans-serif] justify-center leading-[0] not-italic relative shrink-0 text-[#6b7280] text-[11px] w-full">
        <p className="leading-[17.88px] mb-0">Um repositório dedicado ao estudo da rica</p>
        <p className="leading-[17.88px] mb-0">e complexa jornada económica de Angola,</p>
        <p className="leading-[17.88px] mb-0">desde o comércio pré-colonial até ao</p>
        <p className="leading-[17.88px]">desenvolvimento moderno.</p>
      </div>
    </div>
  );
}

function Col1Brand() {
  return (
    <div className="col-1 content-stretch flex flex-col gap-[23.315px] items-start justify-self-stretch pb-[25.5px] relative row-1 self-start shrink-0" data-name="Col 1: Brand">
      <Heading11 />
      <Container53 />
    </div>
  );
}

function Heading12() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0 w-full" data-name="Heading 5">
      <div className="flex flex-col font-['Nimbus_Sans:Bold',sans-serif] justify-center leading-[0] not-italic relative shrink-0 text-[#8b2121] text-[10px] tracking-[1px] uppercase w-full">
        <p className="leading-[15px]">NAVEGAÇÃO</p>
      </div>
    </div>
  );
}

function Item() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0 w-full" data-name="Item">
      <div className="flex flex-col font-['Nimbus_Sans:Regular',sans-serif] justify-center leading-[0] not-italic relative shrink-0 text-[#6b7280] text-[11px] w-full">
        <p className="leading-[16.5px]">Início</p>
      </div>
    </div>
  );
}

function Item1() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0 w-full" data-name="Item">
      <div className="flex flex-col font-['Nimbus_Sans:Regular',sans-serif] justify-center leading-[0] not-italic relative shrink-0 text-[#6b7280] text-[11px] w-full">
        <p className="leading-[16.5px]">Conteúdos Históricos</p>
      </div>
    </div>
  );
}

function Item2() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0 w-full" data-name="Item">
      <div className="flex flex-col font-['Nimbus_Sans:Regular',sans-serif] justify-center leading-[0] not-italic relative shrink-0 text-[#6b7280] text-[11px] w-full">
        <p className="leading-[16.5px]">Comunidade Académica</p>
      </div>
    </div>
  );
}

function Item3() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0 w-full" data-name="Item">
      <div className="flex flex-col font-['Nimbus_Sans:Regular',sans-serif] justify-center leading-[0] not-italic relative shrink-0 text-[#6b7280] text-[11px] w-full">
        <p className="leading-[16.5px]">Quiz do Arquivo</p>
      </div>
    </div>
  );
}

function List() {
  return (
    <div className="content-stretch flex flex-col gap-[11px] items-start relative shrink-0 w-full" data-name="List">
      <Item />
      <Item1 />
      <Item2 />
      <Item3 />
    </div>
  );
}

function Col2Navigation() {
  return (
    <div className="col-2 content-stretch flex flex-col gap-[23px] items-start justify-self-stretch relative row-1 self-start shrink-0" data-name="Col 2: Navigation">
      <Heading12 />
      <List />
    </div>
  );
}

function Heading13() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0 w-full" data-name="Heading 5">
      <div className="flex flex-col font-['Nimbus_Sans:Bold',sans-serif] justify-center leading-[0] not-italic relative shrink-0 text-[#8b2121] text-[10px] tracking-[1px] uppercase w-full">
        <p className="leading-[15px]">RECURSOS</p>
      </div>
    </div>
  );
}

function Item4() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0 w-full" data-name="Item">
      <div className="flex flex-col font-['Nimbus_Sans:Regular',sans-serif] justify-center leading-[0] not-italic relative shrink-0 text-[#6b7280] text-[11px] w-full">
        <p className="leading-[16.5px]">Créditos Académicos</p>
      </div>
    </div>
  );
}

function Item5() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0 w-full" data-name="Item">
      <div className="flex flex-col font-['Nimbus_Sans:Regular',sans-serif] justify-center leading-[0] not-italic relative shrink-0 text-[#6b7280] text-[11px] w-full">
        <p className="leading-[16.5px]">Repositório Institucional</p>
      </div>
    </div>
  );
}

function Item6() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0 w-full" data-name="Item">
      <div className="flex flex-col font-['Nimbus_Sans:Regular',sans-serif] justify-center leading-[0] not-italic relative shrink-0 text-[#6b7280] text-[11px] w-full">
        <p className="leading-[16.5px]">Política de Privacidade</p>
      </div>
    </div>
  );
}

function Item7() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0 w-full" data-name="Item">
      <div className="flex flex-col font-['Nimbus_Sans:Regular',sans-serif] justify-center leading-[0] not-italic relative shrink-0 text-[#6b7280] text-[11px] w-full">
        <p className="leading-[16.5px]">Termos de Serviço</p>
      </div>
    </div>
  );
}

function List1() {
  return (
    <div className="content-stretch flex flex-col gap-[11px] items-start relative shrink-0 w-full" data-name="List">
      <Item4 />
      <Item5 />
      <Item6 />
      <Item7 />
    </div>
  );
}

function Col3Resources() {
  return (
    <div className="col-3 content-stretch flex flex-col gap-[23px] items-start justify-self-stretch relative row-1 self-start shrink-0" data-name="Col 3: Resources">
      <Heading13 />
      <List1 />
    </div>
  );
}

function Heading14() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0 w-full" data-name="Heading 5">
      <div className="flex flex-col font-['Nimbus_Sans:Bold',sans-serif] justify-center leading-[0] not-italic relative shrink-0 text-[#8b2121] text-[10px] tracking-[1px] uppercase w-full">
        <p className="leading-[15px]">CONTACTAR O ARQUIVO</p>
      </div>
    </div>
  );
}

function Container54() {
  return (
    <div className="content-stretch flex flex-col items-start pb-[0.75px] pt-[7.25px] relative shrink-0 w-full" data-name="Container">
      <div className="flex flex-col font-['Nimbus_Sans:Regular',sans-serif] justify-center leading-[0] not-italic relative shrink-0 text-[#6b7280] text-[11px] w-full">
        <p className="leading-[16.5px] mb-0">Questões sobre dados históricos ou acesso</p>
        <p className="leading-[16.5px]">institucional:</p>
      </div>
    </div>
  );
}

function Col4Contact() {
  return (
    <div className="col-4 content-stretch flex flex-col gap-[16px] items-start justify-self-stretch pb-[33px] relative row-1 self-start shrink-0" data-name="Col 4: Contact">
      <Heading14 />
      <Container54 />
      <div className="flex flex-col font-['Nimbus_Sans:Bold',sans-serif] justify-center leading-[0] not-italic relative shrink-0 text-[#8b2121] text-[14px] whitespace-nowrap">
        <p className="leading-[20px]">archive@angola-history.edu</p>
      </div>
    </div>
  );
}

function Container52() {
  return (
    <div className="relative shrink-0 w-full" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid gap-x-[48px] gap-y-[48px] grid grid-cols-[repeat(4,minmax(0,1fr))] grid-rows-[_141px] relative size-full">
        <Col1Brand />
        <Col2Navigation />
        <Col3Resources />
        <Col4Contact />
      </div>
    </div>
  );
}

function Container55() {
  return (
    <div className="relative shrink-0" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col items-start relative size-full">
        <div className="flex flex-col font-['Nimbus_Sans:Regular',sans-serif] justify-center leading-[0] not-italic relative shrink-0 text-[#9ca3af] text-[10px] whitespace-nowrap">
          <p className="leading-[15px]">© 2024 ARQUIVO ECONÓMICO DE ANGOLA. DEDICADO À EXCELÊNCIA ACADÉMICA E PRESERVAÇÃO HISTÓRICA.</p>
        </div>
      </div>
    </div>
  );
}

function Svg9() {
  return (
    <div className="relative shrink-0 size-[16px]" data-name="SVG">
      <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 16 16">
        <g id="SVG">
          <path clipRule="evenodd" d={svgPaths.p10035200} fill="var(--fill-0, #9CA3AF)" fillRule="evenodd" id="Vector" />
        </g>
      </svg>
    </div>
  );
}

function Svg11() {
  return (
    <div className="flex-[1_0_0] min-h-px overflow-clip relative w-[16px]" data-name="SVG">
      <div className="absolute bottom-1/4 left-[8.34%] right-1/4 top-[8.33%]" data-name="Vector">
        <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 10.6664 10.6669">
          <path d={svgPaths.p2a4ba680} fill="var(--fill-0, #9CA3AF)" id="Vector" />
        </svg>
      </div>
    </div>
  );
}

function Svg10() {
  return (
    <div className="content-stretch flex flex-col items-start justify-center overflow-clip relative shrink-0 size-[16px]" data-name="SVG">
      <Svg11 />
    </div>
  );
}

function SvgMargin2() {
  return (
    <div className="content-stretch flex flex-col h-[16px] items-start pl-[16px] relative shrink-0 w-[32px]" data-name="SVG:margin">
      <Svg10 />
    </div>
  );
}

function Container56() {
  return (
    <div className="relative shrink-0" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-center relative size-full">
        <Svg9 />
        <SvgMargin2 />
      </div>
    </div>
  );
}

function FooterBottom() {
  return (
    <div className="relative shrink-0 w-full" data-name="Footer Bottom">
      <div aria-hidden="true" className="absolute border-[#f3f4f6] border-solid border-t inset-0 pointer-events-none" />
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-center justify-between pt-[33px] relative size-full">
        <Container55 />
        <Container56 />
      </div>
    </div>
  );
}

function Footer() {
  return (
    <div className="bg-[#fbfbfb] relative shrink-0 w-full" data-name="Footer">
      <div aria-hidden="true" className="absolute border-[#f3f4f6] border-solid border-t inset-0 pointer-events-none" />
      <div className="content-stretch flex flex-col gap-[48px] items-start pb-[48px] pt-[49px] px-[48px] relative size-full">
        <Container52 />
        <FooterBottom />
      </div>
    </div>
  );
}

function MainContainer() {
  return (
    <div className="bg-white content-stretch drop-shadow-[0px_1px_1px_rgba(0,0,0,0.05)] flex flex-col items-center max-w-[1100px] min-h-[1641px] pb-[0.75px] relative shrink-0 w-full" data-name="MainContainer">
      <MainHeader />
      <HeroSection />
      <MainContentGrid />
      <Footer />
    </div>
  );
}

export default function HtmlBody() {
  return (
    <div className="content-stretch flex flex-col items-start px-[90px] relative size-full" style={{ backgroundImage: "linear-gradient(90deg, rgb(243, 244, 246) 0%, rgb(243, 244, 246) 100%), linear-gradient(90deg, rgb(255, 255, 255) 0%, rgb(255, 255, 255) 100%)" }} data-name="Html → Body">
      <MainContainer />
    </div>
  );
}