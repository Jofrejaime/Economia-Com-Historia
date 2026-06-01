import svgPaths from "./svg-2ttgooi46q";
import imgHistoriaEconomica from "./82750e7e97de56986f2c4cf5c089241c43dd58cb.png";
import imgEraColonial from "./111e5d06a4ca06808b7a296e1e0fc067f0eb1a56.png";
import imgDiversificacaoEconomica from "./5f66a70c2ac962c61ed4776f2c0b1640e8f5a58a.png";
import imgMarta from "./06a4afa7e5640a6bd64bd2a1bd43ca867f45f4e3.png";
import imgJoao from "./9c351444a85e4748ab4edc288a9ed4b83c0f3f7c.png";
import imgAndre from "./2542f6a44aa7426e01c33baa539ebbc290c45863.png";

function Heading() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0 w-full" data-name="Heading 1">
      <div className="flex flex-col font-['Newsreader:Regular',sans-serif] font-normal justify-center leading-[0] relative shrink-0 text-[#6f0008] text-[60px] w-full">
        <p className="leading-[66px] mb-0">Desafie o seu</p>
        <p className="leading-[66px] mb-0">conhecimento sobre a</p>
        <p className="leading-[66px]">Economia de Angola</p>
      </div>
    </div>
  );
}

function Container1() {
  return (
    <div className="content-stretch flex flex-col items-start max-w-[576px] relative shrink-0 w-[576px]" data-name="Container">
      <div className="flex flex-col font-['Inter:Regular',sans-serif] font-normal justify-center leading-[0] not-italic relative shrink-0 text-[#59413e] text-[18px] whitespace-nowrap">
        <p className="leading-[29.25px] mb-0">Explore séculos de história económica, desde as rotas comerciais</p>
        <p className="leading-[29.25px] mb-0">coloniais até à era da diversificação contemporânea. Cada quiz é</p>
        <p className="leading-[29.25px]">uma jornada pela identidade financeira de uma nação.</p>
      </div>
    </div>
  );
}

function Background() {
  return (
    <div className="bg-[#fda49b] content-stretch flex flex-col items-start px-[16px] py-[4px] relative rounded-[12px] shrink-0" data-name="Background">
      <div className="flex flex-col font-['Inter:Regular',sans-serif] font-normal justify-center leading-[0] not-italic relative shrink-0 text-[#783732] text-[14px] tracking-[0.35px] whitespace-nowrap">
        <p className="leading-[20px]">342 Estudantes Ativos</p>
      </div>
    </div>
  );
}

function Container3() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0" data-name="Container">
      <div className="flex flex-col font-['Inter:Regular',sans-serif] font-normal justify-center leading-[0] not-italic relative shrink-0 text-[#8c706d] text-[14px] whitespace-nowrap">
        <p className="leading-[20px]">•</p>
      </div>
    </div>
  );
}

function Container4() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0" data-name="Container">
      <div className="flex flex-col font-['Inter:Regular',sans-serif] font-normal justify-center leading-[0] not-italic relative shrink-0 text-[#59413e] text-[14px] whitespace-nowrap">
        <p className="leading-[20px]">12 Categorias Disponíveis</p>
      </div>
    </div>
  );
}

function Container2() {
  return (
    <div className="content-stretch flex gap-[16px] items-center pt-[8px] relative shrink-0 w-full" data-name="Container">
      <Background />
      <Container3 />
      <Container4 />
    </div>
  );
}

function Container() {
  return (
    <div className="col-[1/span_7] content-stretch flex flex-col gap-[24px] items-start justify-self-stretch relative row-1 self-center shrink-0" data-name="Container">
      <Heading />
      <Container1 />
      <Container2 />
    </div>
  );
}

function HistoriaEconomica() {
  return (
    <div className="h-[593.321px] relative shrink-0 w-full" data-name="História Económica">
      <div aria-hidden="true" className="absolute inset-0 pointer-events-none">
        <div className="absolute inset-0 overflow-hidden">
          <img alt="" className="absolute h-full left-[-12.5%] max-w-none top-0 w-[125%]" src={imgHistoriaEconomica} />
        </div>
        <div className="absolute bg-[rgba(255,255,255,0.3)] inset-0 mix-blend-saturation" />
      </div>
    </div>
  );
}

function BackgroundShadow() {
  return (
    <div className="aspect-[4/5] bg-[#eae8e6] content-stretch flex flex-col items-start justify-center overflow-clip relative rounded-[8px] shadow-[0px_25px_50px_-12px_rgba(0,0,0,0.25)] w-full" data-name="Background+Shadow">
      <HistoriaEconomica />
    </div>
  );
}

function Background1() {
  return (
    <div className="absolute bg-white bottom-[-15.9px] content-stretch flex flex-col gap-[7.75px] items-start left-[-13.79px] max-w-[200px] pl-[24px] pr-[25.89px] py-[24px] rounded-[8px]" data-name="Background">
      <div className="absolute bg-[rgba(255,255,255,0)] inset-0 rounded-[8px] shadow-[0px_10px_15px_-3px_rgba(0,0,0,0.1),0px_4px_6px_-4px_rgba(0,0,0,0.1)]" data-name="Overlay+Shadow" />
      <div className="h-[24px] relative shrink-0 w-[29.25px]" data-name="Icon">
        <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 29.25 24">
          <path d={svgPaths.pce603c0} fill="var(--fill-0, #6F0008)" id="Icon" />
        </svg>
      </div>
      <div className="flex flex-col font-['Inter:Regular',sans-serif] font-normal justify-center leading-[0] not-italic relative shrink-0 text-[#1b1c1b] text-[14px] whitespace-nowrap">
        <p className="leading-[19.25px] mb-0">{`"A história é o balanço`}</p>
        <p className="leading-[19.25px] mb-0">da riqueza de um</p>
        <p className="leading-[19.25px]">{`povo."`}</p>
      </div>
    </div>
  );
}

function Container5() {
  return (
    <div className="col-[8/span_5] content-stretch flex flex-col items-start relative row-1 self-center shrink-0 w-[484.877px]" data-name="Container">
      <div className="flex h-[609.526px] items-center justify-center relative shrink-0 w-[495.087px]" style={{ "--transform-inner-width": "1185", "--transform-inner-height": "22" } as React.CSSProperties}>
        <div className="flex-none rotate-2">
          <BackgroundShadow />
        </div>
      </div>
      <Background1 />
    </div>
  );
}

function HeroSectionAsymmetric() {
  return (
    <div className="gap-x-[32px] gap-y-[32px] grid grid-cols-[repeat(12,minmax(0,1fr))] grid-rows-[_593.33px] relative shrink-0 w-full" data-name="Hero Section Asymmetric">
      <Container />
      <Container5 />
    </div>
  );
}

function Container8() {
  return (
    <div className="h-[30px] relative shrink-0 w-[15px]" data-name="Container">
      <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 15 30">
        <g id="Container">
          <path d={svgPaths.p5bcc800} fill="var(--fill-0, #FFA299)" id="Icon" />
        </g>
      </svg>
    </div>
  );
}

function Background2() {
  return (
    <div className="bg-[#921a1a] content-stretch flex items-center justify-center relative rounded-[12px] shrink-0 size-[80px]" data-name="Background">
      <Container8 />
    </div>
  );
}

function Heading1() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0 w-full" data-name="Heading 2">
      <div className="flex flex-col font-['Newsreader:Regular',sans-serif] font-normal justify-center leading-[0] relative shrink-0 text-[#1b1c1b] text-[24px] whitespace-nowrap">
        <p className="leading-[32px]">Mestre da Numismática</p>
      </div>
    </div>
  );
}

function Container10() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0 w-full" data-name="Container">
      <div className="flex flex-col font-['Inter:Regular',sans-serif] font-normal justify-center leading-[0] not-italic relative shrink-0 text-[#59413e] text-[16px] whitespace-nowrap">
        <p className="leading-[24px]">Nível 4 • Colecionador de Kuanzas</p>
      </div>
    </div>
  );
}

function Container9() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0 w-[265.77px]" data-name="Container">
      <Heading1 />
      <Container10 />
    </div>
  );
}

function Container7() {
  return (
    <div className="content-stretch flex gap-[24px] items-center relative shrink-0" data-name="Container">
      <Background2 />
      <Container9 />
    </div>
  );
}

function Container13() {
  return (
    <div className="content-stretch flex flex-col items-start relative self-stretch shrink-0" data-name="Container">
      <div className="flex flex-col font-['Inter:Regular',sans-serif] font-normal justify-center leading-[0] not-italic relative shrink-0 text-[#59413e] text-[14px] whitespace-nowrap">
        <p className="leading-[20px]">Progresso para Nível 5</p>
      </div>
    </div>
  );
}

function Container14() {
  return (
    <div className="content-stretch flex flex-col items-start relative self-stretch shrink-0" data-name="Container">
      <div className="flex flex-col font-['Inter:Regular',sans-serif] font-normal justify-center leading-[0] not-italic relative shrink-0 text-[#6f0008] text-[14px] whitespace-nowrap">
        <p className="leading-[20px]">85%</p>
      </div>
    </div>
  );
}

function Container12() {
  return (
    <div className="content-stretch flex h-[20px] items-start justify-between relative shrink-0 w-full" data-name="Container">
      <Container13 />
      <Container14 />
    </div>
  );
}

function Background3() {
  return (
    <div className="bg-[#e4e2e0] h-[8px] overflow-clip relative rounded-[12px] shrink-0 w-full" data-name="Background">
      <div className="absolute bg-[#6f0008] inset-[0_15%_0_0] rounded-[12px]" data-name="Background" />
    </div>
  );
}

function Container11() {
  return (
    <div className="content-stretch flex flex-[1_0_0] flex-col gap-[8px] items-start max-w-[448px] min-w-px relative" data-name="Container">
      <Container12 />
      <Background3 />
    </div>
  );
}

function Container17() {
  return (
    <div className="content-stretch flex flex-col items-center mb-[-0.5px] relative shrink-0 w-full" data-name="Container">
      <div className="flex flex-col font-['Inter:Regular',sans-serif] font-normal justify-center leading-[0] not-italic relative shrink-0 text-[#6f0008] text-[24px] text-center whitespace-nowrap">
        <p className="leading-[32px]">12</p>
      </div>
    </div>
  );
}

function Container16() {
  return (
    <div className="content-stretch flex flex-col items-start px-[16px] relative self-stretch shrink-0" data-name="Container">
      <Container17 />
      <div className="flex flex-col font-['Inter:Regular',sans-serif] font-normal justify-center leading-[0] not-italic relative shrink-0 text-[#8c706d] text-[12px] text-center tracking-[1.2px] uppercase whitespace-nowrap">
        <p className="leading-[16px]">QUIZZES</p>
      </div>
    </div>
  );
}

function Container19() {
  return (
    <div className="content-stretch flex flex-col items-center mb-[-0.5px] relative shrink-0 w-full" data-name="Container">
      <div className="flex flex-col font-['Inter:Regular',sans-serif] font-normal justify-center leading-[0] not-italic relative shrink-0 text-[#6f0008] text-[24px] text-center whitespace-nowrap">
        <p className="leading-[32px]">840</p>
      </div>
    </div>
  );
}

function Container18() {
  return (
    <div className="content-stretch flex flex-col items-start px-[16px] relative self-stretch shrink-0" data-name="Container">
      <Container19 />
      <div className="flex flex-col font-['Inter:Regular',sans-serif] font-normal justify-center leading-[0] not-italic relative shrink-0 text-[#8c706d] text-[12px] text-center tracking-[1.2px] uppercase whitespace-nowrap">
        <p className="leading-[16px]">PONTOS</p>
      </div>
    </div>
  );
}

function Container15() {
  return (
    <div className="content-stretch flex gap-[16px] h-[47.5px] items-start relative shrink-0" data-name="Container">
      <Container16 />
      <Container18 />
    </div>
  );
}

function Container6() {
  return (
    <div className="content-stretch flex items-center justify-between relative shrink-0 w-full" data-name="Container">
      <Container7 />
      <Container11 />
      <Container15 />
    </div>
  );
}

function UserProgressSectionMestreDaNumismatica() {
  return (
    <div className="bg-[#f5f3f1] relative rounded-[8px] shrink-0 w-full" data-name="User Progress Section: Mestre da Numismática">
      <div className="content-stretch flex flex-col items-start p-[32px] relative size-full">
        <Container6 />
      </div>
    </div>
  );
}

function EraColonial() {
  return (
    <div className="flex-[1_0_0] min-h-px relative w-full" data-name="Era Colonial">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <img alt="" className="absolute left-0 max-w-none size-full top-0" src={imgEraColonial} />
      </div>
    </div>
  );
}

function Container20() {
  return (
    <div className="content-stretch flex flex-[1_0_0] flex-col items-start justify-center min-w-px overflow-clip relative self-stretch" data-name="Container">
      <EraColonial />
    </div>
  );
}

function Background4() {
  return (
    <div className="bg-[#ffdad6] content-stretch flex flex-col items-start px-[8px] py-[2px] relative rounded-[2px] shrink-0" data-name="Background">
      <div className="flex flex-col font-['Inter:Regular',sans-serif] font-normal justify-center leading-[0] not-italic relative shrink-0 text-[#93000a] text-[10px] uppercase whitespace-nowrap">
        <p className="leading-[15px]">DIFÍCIL</p>
      </div>
    </div>
  );
}

function Container23() {
  return (
    <div className="content-stretch flex items-start justify-between relative shrink-0 w-full" data-name="Container">
      <div className="flex flex-col font-['Inter:Regular',sans-serif] font-normal justify-center leading-[0] not-italic relative shrink-0 text-[#6f0008] text-[12px] tracking-[1.2px] uppercase whitespace-nowrap">
        <p className="leading-[16px]">HISTÓRIA IMPERIAL</p>
      </div>
      <Background4 />
    </div>
  );
}

function Heading2() {
  return (
    <div className="content-stretch flex flex-col items-start pt-[5.2px] relative shrink-0 w-full" data-name="Heading 3">
      <div className="flex flex-col font-['Newsreader:Regular',sans-serif] font-normal justify-center leading-[0] relative shrink-0 text-[#1b1c1b] text-[30px] w-full">
        <p className="leading-[36px] mb-0">Era Colonial: O Ciclo</p>
        <p className="leading-[36px]">das Commodities</p>
      </div>
    </div>
  );
}

function Container24() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0 w-full" data-name="Container">
      <div className="flex flex-col font-['Inter:Regular',sans-serif] font-normal justify-center leading-[0] not-italic relative shrink-0 text-[#59413e] text-[14px] w-full">
        <p className="leading-[22.75px] mb-0">Teste os seus conhecimentos sobre o comércio</p>
        <p className="leading-[22.75px] mb-0">triangular, a exploração de marfim e os primeiros</p>
        <p className="leading-[22.75px]">bancos coloniais em Angola.</p>
      </div>
    </div>
  );
}

function Container22() {
  return (
    <div className="content-stretch flex flex-col gap-[10.8px] items-start pb-[24px] relative shrink-0 w-full" data-name="Container">
      <Container23 />
      <Heading2 />
      <Container24 />
    </div>
  );
}

function Container27() {
  return (
    <div className="relative shrink-0 size-[11.667px]" data-name="Container">
      <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 11.6667 11.6667">
        <g id="Container">
          <path d={svgPaths.p7813dc0} fill="var(--fill-0, #8C706D)" id="Icon" />
        </g>
      </svg>
    </div>
  );
}

function Container26() {
  return (
    <div className="content-stretch flex gap-[3.99px] items-center relative shrink-0" data-name="Container">
      <Container27 />
      <div className="flex flex-col font-['Inter:Regular',sans-serif] font-normal justify-center leading-[0] not-italic relative shrink-0 text-[#8c706d] text-[14px] whitespace-nowrap">
        <p className="leading-[20px]">25 Questões</p>
      </div>
    </div>
  );
}

function Container28() {
  return (
    <div className="relative shrink-0 size-[16px]" data-name="Container">
      <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 16 16">
        <g id="Container">
          <path d={svgPaths.p1a406200} fill="var(--fill-0, white)" id="Icon" />
        </g>
      </svg>
    </div>
  );
}

function Button() {
  return (
    <div className="bg-[#6f0008] content-stretch flex items-center justify-center relative rounded-[12px] shrink-0 size-[40px]" data-name="Button">
      <Container28 />
    </div>
  );
}

function Container25() {
  return (
    <div className="content-stretch flex items-center justify-between relative shrink-0 w-full" data-name="Container">
      <Container26 />
      <Button />
    </div>
  );
}

function Container21() {
  return (
    <div className="flex-[1_0_0] min-w-px relative self-stretch" data-name="Container">
      <div className="content-stretch flex flex-col items-start justify-between p-[32px] relative size-full">
        <Container22 />
        <Container25 />
      </div>
    </div>
  );
}

function BackgroundShadow1() {
  return (
    <div className="bg-white content-stretch flex h-[314.8px] items-start overflow-clip relative rounded-[8px] shadow-[0px_1px_2px_0px_rgba(0,0,0,0.05)] shrink-0 w-full" data-name="Background+Shadow">
      <Container20 />
      <Container21 />
    </div>
  );
}

function CategoryCard() {
  return (
    <div className="col-[1/span_2] content-stretch flex flex-col items-start justify-center justify-self-stretch relative row-1 self-start shrink-0" data-name="Category Card 1">
      <BackgroundShadow1 />
    </div>
  );
}

function Container30() {
  return (
    <div className="relative shrink-0 size-[20px]" data-name="Container">
      <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 20 20">
        <g id="Container">
          <path d={svgPaths.p29720700} fill="var(--fill-0, #004A76)" id="Icon" />
        </g>
      </svg>
    </div>
  );
}

function Background5() {
  return (
    <div className="bg-[#cee5ff] content-stretch flex items-center justify-center relative rounded-[8px] shrink-0 size-[48px]" data-name="Background">
      <Container30 />
    </div>
  );
}

function Background6() {
  return (
    <div className="bg-[#e4e2e0] content-stretch flex flex-col items-start px-[8px] py-[2px] relative rounded-[2px] shrink-0" data-name="Background">
      <div className="flex flex-col font-['Inter:Regular',sans-serif] font-normal justify-center leading-[0] not-italic relative shrink-0 text-[#59413e] text-[10px] uppercase whitespace-nowrap">
        <p className="leading-[15px]">MÉDIO</p>
      </div>
    </div>
  );
}

function Container29() {
  return (
    <div className="content-stretch flex items-start justify-between relative shrink-0 w-full" data-name="Container">
      <Background5 />
      <Background6 />
    </div>
  );
}

function Margin() {
  return (
    <div className="content-stretch flex flex-col items-start pb-[24px] relative shrink-0 w-full" data-name="Margin">
      <Container29 />
    </div>
  );
}

function Heading3() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0 w-full" data-name="Heading 3">
      <div className="flex flex-col font-['Newsreader:Regular',sans-serif] font-normal justify-center leading-[0] relative shrink-0 text-[#1b1c1b] text-[24px] w-full">
        <p className="leading-[32px]">Pós-Independência</p>
      </div>
    </div>
  );
}

function Heading3Margin() {
  return (
    <div className="content-stretch flex flex-col items-start pb-[12px] relative shrink-0 w-full" data-name="Heading 3:margin">
      <Heading3 />
    </div>
  );
}

function Container31() {
  return (
    <div className="absolute content-stretch flex flex-col items-start left-0 pb-[108.455px] right-[-0.01px] top-[-1.13px]" data-name="Container">
      <div className="flex flex-col font-['Inter:Regular',sans-serif] font-normal justify-center leading-[0] not-italic relative shrink-0 text-[#59413e] text-[14px] whitespace-nowrap">
        <p className="leading-[22.75px] mb-0">A transição para a economia centralizada e os</p>
        <p className="leading-[22.75px]">desafios da reconstrução nacional pós-1975.</p>
      </div>
    </div>
  );
}

function Margin1() {
  return (
    <div className="h-[185.33px] relative shrink-0 w-full" data-name="Margin">
      <Container31 />
    </div>
  );
}

function Container34() {
  return (
    <div className="relative shrink-0 size-[11.667px]" data-name="Container">
      <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 11.6667 11.6667">
        <g id="Container">
          <path d={svgPaths.p7813dc0} fill="var(--fill-0, #8C706D)" id="Icon" />
        </g>
      </svg>
    </div>
  );
}

function Container33() {
  return (
    <div className="content-stretch flex gap-[3.99px] items-center relative shrink-0" data-name="Container">
      <Container34 />
      <div className="flex flex-col font-['Inter:Regular',sans-serif] font-normal justify-center leading-[0] not-italic relative shrink-0 text-[#8c706d] text-[14px] whitespace-nowrap">
        <p className="leading-[20px]">15 Questões</p>
      </div>
    </div>
  );
}

function Container36() {
  return (
    <div className="h-[12px] relative shrink-0 w-[7.4px]" data-name="Container">
      <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 7.4 12">
        <g id="Container">
          <path d={svgPaths.p28c84800} fill="var(--fill-0, #6F0008)" id="Icon" />
        </g>
      </svg>
    </div>
  );
}

function Container35() {
  return (
    <div className="content-stretch flex gap-[3.99px] items-center relative shrink-0" data-name="Container">
      <div className="flex flex-col font-['Inter:Regular',sans-serif] font-normal justify-center leading-[0] not-italic relative shrink-0 text-[#6f0008] text-[16px] whitespace-nowrap">
        <p className="leading-[24px]">Começar</p>
      </div>
      <Container36 />
    </div>
  );
}

function Container32() {
  return (
    <div className="content-stretch flex items-center justify-between relative shrink-0 w-full" data-name="Container">
      <Container33 />
      <Container35 />
    </div>
  );
}

function BackgroundShadow2() {
  return (
    <div className="bg-white drop-shadow-[0px_1px_1px_rgba(0,0,0,0.05)] relative rounded-[8px] shrink-0 w-full" data-name="Background+Shadow">
      <div className="content-stretch flex flex-col items-start justify-between p-[32px] relative size-full">
        <Margin />
        <Heading3Margin />
        <Margin1 />
        <Container32 />
      </div>
    </div>
  );
}

function CategoryCard1() {
  return (
    <div className="col-3 content-stretch flex flex-col items-start justify-center justify-self-stretch relative row-1 self-start shrink-0" data-name="Category Card 2">
      <BackgroundShadow2 />
    </div>
  );
}

function Container38() {
  return (
    <div className="relative shrink-0 size-[18px]" data-name="Container">
      <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 18 18">
        <g id="Container">
          <path d={svgPaths.p1167b300} fill="var(--fill-0, #783732)" id="Icon" />
        </g>
      </svg>
    </div>
  );
}

function Background7() {
  return (
    <div className="bg-[#fda49b] content-stretch flex items-center justify-center relative rounded-[8px] shrink-0 size-[48px]" data-name="Background">
      <Container38 />
    </div>
  );
}

function Background8() {
  return (
    <div className="bg-[#e4e2e0] content-stretch flex flex-col items-start px-[8px] py-[2px] relative rounded-[2px] shrink-0" data-name="Background">
      <div className="flex flex-col font-['Inter:Regular',sans-serif] font-normal justify-center leading-[0] not-italic relative shrink-0 text-[#59413e] text-[10px] uppercase whitespace-nowrap">
        <p className="leading-[15px]">FÁCIL</p>
      </div>
    </div>
  );
}

function Container37() {
  return (
    <div className="content-stretch flex items-start justify-between relative shrink-0 w-full" data-name="Container">
      <Background7 />
      <Background8 />
    </div>
  );
}

function Margin2() {
  return (
    <div className="content-stretch flex flex-col items-start pb-[24px] relative shrink-0 w-full" data-name="Margin">
      <Container37 />
    </div>
  );
}

function Heading4() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0 w-full" data-name="Heading 3">
      <div className="flex flex-col font-['Newsreader:Regular',sans-serif] font-normal justify-center leading-[0] relative shrink-0 text-[#1b1c1b] text-[24px] w-full">
        <p className="leading-[32px]">O Boom do Petróleo</p>
      </div>
    </div>
  );
}

function Heading3Margin1() {
  return (
    <div className="content-stretch flex flex-col items-start pb-[12px] relative shrink-0 w-full" data-name="Heading 3:margin">
      <Heading4 />
    </div>
  );
}

function Container39() {
  return (
    <div className="absolute content-stretch flex flex-col items-start left-0 pb-[85.58px] right-0 top-[-1.25px]" data-name="Container">
      <div className="flex flex-col font-['Inter:Regular',sans-serif] font-normal justify-center leading-[0] not-italic relative shrink-0 text-[#59413e] text-[14px] whitespace-nowrap">
        <p className="leading-[22.75px] mb-0">Analise o impacto do ouro negro no PIB</p>
        <p className="leading-[22.75px] mb-0">angolano e o crescimento das infraestruturas</p>
        <p className="leading-[22.75px]">urbanas.</p>
      </div>
    </div>
  );
}

function Margin3() {
  return (
    <div className="h-[185.33px] relative shrink-0 w-full" data-name="Margin">
      <Container39 />
    </div>
  );
}

function Container42() {
  return (
    <div className="relative shrink-0 size-[11.667px]" data-name="Container">
      <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 11.6667 11.6667">
        <g id="Container">
          <path d={svgPaths.p7813dc0} fill="var(--fill-0, #8C706D)" id="Icon" />
        </g>
      </svg>
    </div>
  );
}

function Container41() {
  return (
    <div className="content-stretch flex gap-[4px] items-center relative shrink-0" data-name="Container">
      <Container42 />
      <div className="flex flex-col font-['Inter:Regular',sans-serif] font-normal justify-center leading-[0] not-italic relative shrink-0 text-[#8c706d] text-[14px] whitespace-nowrap">
        <p className="leading-[20px]">10 Questões</p>
      </div>
    </div>
  );
}

function Container44() {
  return (
    <div className="h-[12px] relative shrink-0 w-[7.4px]" data-name="Container">
      <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 7.4 12">
        <g id="Container">
          <path d={svgPaths.p28c84800} fill="var(--fill-0, #6F0008)" id="Icon" />
        </g>
      </svg>
    </div>
  );
}

function Container43() {
  return (
    <div className="content-stretch flex gap-[3.99px] items-center relative shrink-0" data-name="Container">
      <div className="flex flex-col font-['Inter:Regular',sans-serif] font-normal justify-center leading-[0] not-italic relative shrink-0 text-[#6f0008] text-[16px] whitespace-nowrap">
        <p className="leading-[24px]">Começar</p>
      </div>
      <Container44 />
    </div>
  );
}

function Container40() {
  return (
    <div className="content-stretch flex items-center justify-between relative shrink-0 w-full" data-name="Container">
      <Container41 />
      <Container43 />
    </div>
  );
}

function BackgroundShadow3() {
  return (
    <div className="bg-white drop-shadow-[0px_1px_1px_rgba(0,0,0,0.05)] relative rounded-[8px] shrink-0 w-full" data-name="Background+Shadow">
      <div className="content-stretch flex flex-col items-start justify-between p-[32px] relative size-full">
        <Margin2 />
        <Heading3Margin1 />
        <Margin3 />
        <Container40 />
      </div>
    </div>
  );
}

function CategoryCard2() {
  return (
    <div className="col-1 content-stretch flex flex-col items-start justify-center justify-self-stretch relative row-2 self-start shrink-0" data-name="Category Card 3">
      <BackgroundShadow3 />
    </div>
  );
}

function Background9() {
  return (
    <div className="bg-[#e4e2e0] content-stretch flex flex-col items-start px-[8px] py-[2px] relative rounded-[2px] shrink-0" data-name="Background">
      <div className="flex flex-col font-['Inter:Regular',sans-serif] font-normal justify-center leading-[0] not-italic relative shrink-0 text-[#59413e] text-[10px] uppercase whitespace-nowrap">
        <p className="leading-[15px]">MÉDIO</p>
      </div>
    </div>
  );
}

function Container47() {
  return (
    <div className="content-stretch flex items-start justify-between relative shrink-0 w-full" data-name="Container">
      <div className="flex flex-col font-['Inter:Regular',sans-serif] font-normal justify-center leading-[0] not-italic relative shrink-0 text-[#6f0008] text-[12px] tracking-[1.2px] uppercase whitespace-nowrap">
        <p className="leading-[16px]">{`FUTURO & ESTRATÉGIA`}</p>
      </div>
      <Background9 />
    </div>
  );
}

function Heading5() {
  return (
    <div className="content-stretch flex flex-col items-start pt-[5.1px] relative shrink-0 w-full" data-name="Heading 3">
      <div className="flex flex-col font-['Newsreader:Regular',sans-serif] font-normal justify-center leading-[0] relative shrink-0 text-[#1b1c1b] text-[30px] w-full">
        <p className="leading-[36px]">{`Diversificação & Futuro`}</p>
      </div>
    </div>
  );
}

function Container48() {
  return (
    <div className="content-stretch flex flex-col items-start pb-[0.625px] relative shrink-0 w-full" data-name="Container">
      <div className="flex flex-col font-['Inter:Regular',sans-serif] font-normal justify-center leading-[0] not-italic relative shrink-0 text-[#59413e] text-[14px] w-full">
        <p className="leading-[22.75px] mb-0">Da agricultura ao turismo: quais são os novos</p>
        <p className="leading-[22.75px]">pilares da economia angolana para o século XXI?</p>
      </div>
    </div>
  );
}

function Container46() {
  return (
    <div className="content-stretch flex flex-col gap-[10.9px] items-start pb-[24px] relative shrink-0 w-full" data-name="Container">
      <Container47 />
      <Heading5 />
      <Container48 />
    </div>
  );
}

function Container51() {
  return (
    <div className="relative shrink-0 size-[11.667px]" data-name="Container">
      <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 11.6667 11.6667">
        <g id="Container">
          <path d={svgPaths.p7813dc0} fill="var(--fill-0, #8C706D)" id="Icon" />
        </g>
      </svg>
    </div>
  );
}

function Container50() {
  return (
    <div className="content-stretch flex gap-[4px] items-center relative shrink-0" data-name="Container">
      <Container51 />
      <div className="flex flex-col font-['Inter:Regular',sans-serif] font-normal justify-center leading-[0] not-italic relative shrink-0 text-[#8c706d] text-[14px] whitespace-nowrap">
        <p className="leading-[20px]">20 Questões</p>
      </div>
    </div>
  );
}

function Container52() {
  return (
    <div className="h-[14px] relative shrink-0 w-[11px]" data-name="Container">
      <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 11 14">
        <g id="Container">
          <path d={svgPaths.p30eba500} fill="var(--fill-0, white)" id="Icon" />
        </g>
      </svg>
    </div>
  );
}

function Button1() {
  return (
    <div className="bg-[#6f0008] content-stretch flex items-center justify-center relative rounded-[12px] shrink-0 size-[40px]" data-name="Button">
      <Container52 />
    </div>
  );
}

function Container49() {
  return (
    <div className="content-stretch flex items-center justify-between relative shrink-0 w-full" data-name="Container">
      <Container50 />
      <Button1 />
    </div>
  );
}

function Container45() {
  return (
    <div className="flex-[1_0_0] min-w-px relative self-stretch z-[2]" data-name="Container">
      <div className="content-stretch flex flex-col items-start justify-between pb-[32.01px] pt-[32px] px-[32px] relative size-full">
        <Container46 />
        <Container49 />
      </div>
    </div>
  );
}

function DiversificacaoEconomica() {
  return (
    <div className="flex-[1_0_0] min-h-px relative w-full" data-name="Diversificação Económica">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <img alt="" className="absolute left-0 max-w-none size-full top-0" src={imgDiversificacaoEconomica} />
      </div>
    </div>
  );
}

function Container53() {
  return (
    <div className="content-stretch flex flex-[1_0_0] flex-col items-start justify-center min-w-px overflow-clip relative self-stretch z-[1]" data-name="Container">
      <DiversificacaoEconomica />
    </div>
  );
}

function BackgroundShadow4() {
  return (
    <div className="bg-white content-stretch flex h-[256.535px] isolate items-start overflow-clip relative rounded-[8px] shadow-[0px_1px_2px_0px_rgba(0,0,0,0.05)] shrink-0 w-full" data-name="Background+Shadow">
      <Container45 />
      <Container53 />
    </div>
  );
}

function CategoryCard3() {
  return (
    <div className="col-[2/span_2] content-stretch flex flex-col items-start justify-center justify-self-stretch relative row-2 self-start shrink-0" data-name="Category Card 4">
      <BackgroundShadow4 />
    </div>
  );
}

function QuizCategoriesBentoGrid() {
  return (
    <div className="gap-x-[32px] gap-y-[32px] grid grid-cols-[repeat(3,minmax(0,1fr))] grid-rows-[__389.33px_389.33px] relative shrink-0 w-full" data-name="Quiz Categories Bento Grid">
      <CategoryCard />
      <CategoryCard1 />
      <CategoryCard2 />
      <CategoryCard3 />
    </div>
  );
}

function Heading6() {
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

function Background10() {
  return (
    <div className="absolute bg-[#6f0008] bottom-[-4px] content-stretch flex items-center justify-center pb-[5px] pt-[4px] right-[-4px] rounded-[12px] size-[24px]" data-name="Background">
      <div className="flex flex-col font-['Inter:Regular',sans-serif] font-normal justify-center leading-[0] not-italic relative shrink-0 text-[10px] text-center text-white whitespace-nowrap">
        <p className="leading-[15px]">1</p>
      </div>
    </div>
  );
}

function Container55() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0" data-name="Container">
      <Marta />
      <Background10 />
    </div>
  );
}

function Margin4() {
  return (
    <div className="absolute content-stretch flex flex-col items-start left-[107px] pb-[16px] top-[24px]" data-name="Margin">
      <Container55 />
    </div>
  );
}

function BackgroundShadow5() {
  return (
    <div className="bg-white col-1 drop-shadow-[0px_1px_1px_rgba(0,0,0,0.05)] h-[168px] justify-self-stretch relative rounded-[8px] row-1 shrink-0" data-name="Background+Shadow">
      <div className="-translate-x-1/2 -translate-y-1/2 absolute flex flex-col font-['Inter:Regular',sans-serif] font-normal justify-center leading-[0] left-[calc(50%-0.01px)] not-italic text-[#1b1c1b] text-[16px] text-center top-[116px] whitespace-nowrap">
        <p className="leading-[24px]">Marta S.</p>
      </div>
      <div className="-translate-x-1/2 -translate-y-1/2 absolute flex flex-col font-['Inter:Regular',sans-serif] font-normal justify-center leading-[0] left-1/2 not-italic text-[#8c706d] text-[12px] text-center top-[136px] tracking-[-0.6px] uppercase whitespace-nowrap">
        <p className="leading-[16px]">2,450 PTS</p>
      </div>
      <Margin4 />
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

function Background11() {
  return (
    <div className="absolute bg-[#a8a29e] bottom-[-4px] content-stretch flex items-center justify-center pb-[5px] pt-[4px] right-[-4px] rounded-[12px] size-[24px]" data-name="Background">
      <div className="flex flex-col font-['Inter:Regular',sans-serif] font-normal justify-center leading-[0] not-italic relative shrink-0 text-[10px] text-center text-white whitespace-nowrap">
        <p className="leading-[15px]">2</p>
      </div>
    </div>
  );
}

function Container56() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0" data-name="Container">
      <Joao />
      <Background11 />
    </div>
  );
}

function Margin5() {
  return (
    <div className="absolute content-stretch flex flex-col items-start left-[107px] pb-[16px] top-[24px]" data-name="Margin">
      <Container56 />
    </div>
  );
}

function BackgroundShadow6() {
  return (
    <div className="bg-white col-2 drop-shadow-[0px_1px_1px_rgba(0,0,0,0.05)] h-[168px] justify-self-stretch relative rounded-[8px] row-1 shrink-0" data-name="Background+Shadow">
      <div className="-translate-x-1/2 -translate-y-1/2 absolute flex flex-col font-['Inter:Regular',sans-serif] font-normal justify-center leading-[0] left-1/2 not-italic text-[#1b1c1b] text-[16px] text-center top-[116px] whitespace-nowrap">
        <p className="leading-[24px]">João P.</p>
      </div>
      <div className="-translate-x-1/2 -translate-y-1/2 absolute flex flex-col font-['Inter:Regular',sans-serif] font-normal justify-center leading-[0] left-1/2 not-italic text-[#8c706d] text-[12px] text-center top-[136px] tracking-[-0.6px] uppercase whitespace-nowrap">
        <p className="leading-[16px]">2,120 PTS</p>
      </div>
      <Margin5 />
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

function Background12() {
  return (
    <div className="absolute bg-[#b08d57] bottom-[-4px] content-stretch flex items-center justify-center pb-[5px] pt-[4px] right-[-4px] rounded-[12px] size-[24px]" data-name="Background">
      <div className="flex flex-col font-['Inter:Regular',sans-serif] font-normal justify-center leading-[0] not-italic relative shrink-0 text-[10px] text-center text-white whitespace-nowrap">
        <p className="leading-[15px]">3</p>
      </div>
    </div>
  );
}

function Container57() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0" data-name="Container">
      <Andre />
      <Background12 />
    </div>
  );
}

function Margin6() {
  return (
    <div className="absolute content-stretch flex flex-col items-start left-[107px] pb-[16px] top-[24px]" data-name="Margin">
      <Container57 />
    </div>
  );
}

function BackgroundShadow7() {
  return (
    <div className="bg-white col-3 drop-shadow-[0px_1px_1px_rgba(0,0,0,0.05)] h-[168px] justify-self-stretch relative rounded-[8px] row-1 shrink-0" data-name="Background+Shadow">
      <div className="-translate-x-1/2 -translate-y-1/2 absolute flex flex-col font-['Inter:Regular',sans-serif] font-normal justify-center leading-[0] left-[calc(50%+0.01px)] not-italic text-[#1b1c1b] text-[16px] text-center top-[116px] whitespace-nowrap">
        <p className="leading-[24px]">André M.</p>
      </div>
      <div className="-translate-x-1/2 -translate-y-1/2 absolute flex flex-col font-['Inter:Regular',sans-serif] font-normal justify-center leading-[0] left-1/2 not-italic text-[#8c706d] text-[12px] text-center top-[136px] tracking-[-0.6px] uppercase whitespace-nowrap">
        <p className="leading-[16px]">1,980 PTS</p>
      </div>
      <Margin6 />
    </div>
  );
}

function Container58() {
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

function Margin7() {
  return (
    <div className="relative shrink-0" data-name="Margin">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col items-start pb-[8px] relative size-full">
        <Container58 />
      </div>
    </div>
  );
}

function Container59() {
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
          <Margin7 />
          <Container59 />
        </div>
      </div>
    </div>
  );
}

function Container54() {
  return (
    <div className="gap-x-[24px] gap-y-[24px] grid grid-cols-[repeat(4,minmax(0,1fr))] grid-rows-[_168px] relative shrink-0 w-full" data-name="Container">
      <BackgroundShadow5 />
      <BackgroundShadow6 />
      <BackgroundShadow7 />
      <BackgroundBorderShadow />
    </div>
  );
}

function LeaderboardPreviewSection() {
  return (
    <div className="content-stretch flex flex-col gap-[48px] items-start pt-[31.99px] relative shrink-0 w-full" data-name="Leaderboard Preview Section">
      <Heading6 />
      <Container54 />
    </div>
  );
}

export default function MainContent() {
  return (
    <div className="content-stretch flex flex-col gap-[64px] items-start pb-[96.02px] pt-[48px] px-[48px] relative size-full" data-name="Main Content">
      <HeroSectionAsymmetric />
      <UserProgressSectionMestreDaNumismatica />
      <QuizCategoriesBentoGrid />
      <LeaderboardPreviewSection />
    </div>
  );
}