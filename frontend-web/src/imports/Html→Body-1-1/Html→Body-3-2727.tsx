import svgPaths from "./svg-hgk31kecza";
import imgSectionCategoryHeader from "./4a9783399e27c6ae9ff944d0aa6091c3c70eaf88.png";
import imgRetratoDoCurador from "./2b43da9ee8d0412c207409ee02026a1deb4da238.png";

function Container1() {
  return (
    <div className="relative shrink-0 size-[12px]" data-name="Container">
      <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 12 12">
        <g id="Container">
          <path d={svgPaths.p2286b600} fill="var(--fill-0, white)" id="Icon" />
        </g>
      </svg>
    </div>
  );
}

function Container2() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0" data-name="Container">
      <div className="flex flex-col font-['Newsreader:Regular',sans-serif] font-normal justify-center leading-[0] relative shrink-0 text-[14px] text-white tracking-[2.8px] uppercase whitespace-nowrap">
        <p className="leading-[20px]">VOLTAR PARA COMUNIDADE</p>
      </div>
    </div>
  );
}

function Link() {
  return (
    <div className="content-stretch flex gap-[8px] items-center relative shrink-0" data-name="Link">
      <Container1 />
      <Container2 />
    </div>
  );
}

function Heading() {
  return (
    <div className="content-stretch flex flex-col items-start pt-[8px] relative shrink-0 w-full" data-name="Heading 1">
      <div className="flex flex-col font-['Newsreader:Regular',sans-serif] font-normal justify-center leading-[0] relative shrink-0 text-[60px] text-white w-full">
        <p className="leading-[60px]">História Monetária</p>
      </div>
    </div>
  );
}

function Container3() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0 w-full" data-name="Container">
      <div className="flex flex-col font-['Inter:Regular',sans-serif] font-light justify-center leading-[0] not-italic relative shrink-0 text-[#f5f5f4] text-[18px] w-full">
        <p className="leading-[29.25px] mb-0">Explore a evolução do sistema financeiro angolano, desde os primeiros zimbo</p>
        <p className="leading-[29.25px] mb-0">até à implementação do Kwanza moderno. Uma jornada analítica pelos arquivos</p>
        <p className="leading-[29.25px]">da nossa soberania económica.</p>
      </div>
    </div>
  );
}

function Container() {
  return (
    <div className="content-stretch flex flex-col gap-[16px] items-start max-w-[672px] relative shrink-0 w-[672px]" data-name="Container">
      <Link />
      <Heading />
      <Container3 />
    </div>
  );
}

function SectionCategoryHeader() {
  return (
    <div className="h-[400px] relative rounded-[8px] shrink-0 w-full" data-name="Section - Category Header">
      <div className="flex flex-col justify-end overflow-clip rounded-[inherit] size-full">
        <div className="content-stretch flex flex-col items-start justify-end p-[48px] relative size-full">
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <img alt="" className="absolute h-[296%] left-0 max-w-none top-[-98%] w-full" src={imgSectionCategoryHeader} />
          </div>
          <Container />
        </div>
      </div>
    </div>
  );
}

function Button() {
  return (
    <div className="bg-[#6f0008] content-stretch flex flex-col items-center justify-center px-[24px] py-[8px] relative rounded-[12px] shrink-0" data-name="Button">
      <div className="absolute bg-[rgba(255,255,255,0)] inset-0 rounded-[12px] shadow-[0px_4px_6px_-1px_rgba(0,0,0,0.1),0px_2px_4px_-2px_rgba(0,0,0,0.1)]" data-name="Button:shadow" />
      <div className="flex flex-col font-['Inter:Regular',sans-serif] font-medium justify-center leading-[0] not-italic relative shrink-0 text-[16px] text-center text-white whitespace-nowrap">
        <p className="leading-[24px]">Iniciar Nova Discussão</p>
      </div>
    </div>
  );
}

function Button1() {
  return (
    <div className="bg-white content-stretch drop-shadow-[0px_1px_1px_rgba(0,0,0,0.05)] flex flex-col items-center justify-center px-[12px] py-[4px] relative rounded-[12px] shrink-0" data-name="Button">
      <div className="flex flex-col font-['Inter:Regular',sans-serif] font-medium justify-center leading-[0] not-italic relative shrink-0 text-[#6f0008] text-[14px] text-center whitespace-nowrap">
        <p className="leading-[20px]">Recentes</p>
      </div>
    </div>
  );
}

function Button2() {
  return (
    <div className="content-stretch flex flex-col items-center justify-center px-[12px] py-[4px] relative shrink-0" data-name="Button">
      <div className="flex flex-col font-['Inter:Regular',sans-serif] font-medium justify-center leading-[0] not-italic relative shrink-0 text-[#78716c] text-[14px] text-center whitespace-nowrap">
        <p className="leading-[20px]">Mais Ativos</p>
      </div>
    </div>
  );
}

function Button3() {
  return (
    <div className="content-stretch flex flex-col items-center justify-center px-[12px] py-[4px] relative shrink-0" data-name="Button">
      <div className="flex flex-col font-['Inter:Regular',sans-serif] font-medium justify-center leading-[0] not-italic relative shrink-0 text-[#78716c] text-[14px] text-center whitespace-nowrap">
        <p className="leading-[20px]">Fixados</p>
      </div>
    </div>
  );
}

function Background() {
  return (
    <div className="bg-[#e4e2e0] content-stretch flex gap-[16px] items-center px-[16px] py-[4px] relative rounded-[12px] shrink-0" data-name="Background">
      <Button1 />
      <Button2 />
      <Button3 />
    </div>
  );
}

function ActionBar() {
  return (
    <div className="bg-[#f5f3f1] relative rounded-[8px] shrink-0 w-full" data-name="Action Bar">
      <div className="flex flex-row items-center size-full">
        <div className="content-stretch flex items-center justify-between p-[24px] relative size-full">
          <Button />
          <Background />
        </div>
      </div>
    </div>
  );
}

function Background1() {
  return (
    <div className="bg-[#fda49b] content-stretch flex items-center justify-center relative rounded-[12px] shrink-0 size-[56px]" data-name="Background">
      <div className="flex flex-col font-['Inter:Regular',sans-serif] font-bold justify-center leading-[0] not-italic relative shrink-0 text-[#783732] text-[20px] text-center whitespace-nowrap">
        <p className="leading-[28px]">AM</p>
      </div>
    </div>
  );
}

function Heading1() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0" data-name="Heading 3">
      <div className="flex flex-col font-['Newsreader:Regular',sans-serif] font-normal justify-center leading-[0] relative shrink-0 text-[#1b1c1b] text-[24px] whitespace-nowrap">
        <p className="leading-[32px]">A Reforma de 1976: O Nascimento do Kwanza</p>
      </div>
    </div>
  );
}

function Container7() {
  return (
    <div className="relative shrink-0 size-[11.667px]" data-name="Container">
      <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 11.6667 11.6667">
        <g id="Container">
          <path d={svgPaths.p3c4dd880} fill="var(--fill-0, #A8A29E)" id="Icon" />
        </g>
      </svg>
    </div>
  );
}

function Container6() {
  return (
    <div className="relative shrink-0 w-full" data-name="Container">
      <div className="flex flex-row items-center size-full">
        <div className="content-stretch flex items-center justify-between relative size-full">
          <Heading1 />
          <Container7 />
        </div>
      </div>
    </div>
  );
}

function Background2() {
  return (
    <div className="bg-[#efedec] relative rounded-[2px] self-stretch shrink-0" data-name="Background">
      <div className="content-stretch flex flex-col items-start px-[8px] py-[4px] relative size-full">
        <div className="flex flex-col font-['Inter:Regular',sans-serif] font-normal justify-center leading-[0] not-italic relative shrink-0 text-[#59413e] text-[10px] tracking-[1px] uppercase whitespace-nowrap">
          <p className="leading-[15px]">ANÁLISE MONETÁRIA</p>
        </div>
      </div>
    </div>
  );
}

function Background3() {
  return (
    <div className="bg-[#efedec] relative rounded-[2px] self-stretch shrink-0" data-name="Background">
      <div className="content-stretch flex flex-col items-start px-[8px] py-[4px] relative size-full">
        <div className="flex flex-col font-['Inter:Regular',sans-serif] font-normal justify-center leading-[0] not-italic relative shrink-0 text-[#59413e] text-[10px] tracking-[1px] uppercase whitespace-nowrap">
          <p className="leading-[15px]">PÓS-INDEPENDÊNCIA</p>
        </div>
      </div>
    </div>
  );
}

function Container8() {
  return (
    <div className="content-stretch flex gap-[8px] h-[23px] items-start relative shrink-0 w-full" data-name="Container">
      <Background2 />
      <Background3 />
    </div>
  );
}

function Container10() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0" data-name="Container">
      <div className="flex flex-col font-['Inter:Regular',sans-serif] font-normal justify-center leading-[0] not-italic relative shrink-0 text-[#78716c] text-[14px] whitespace-nowrap">
        <p className="leading-[20px]">Por Dr. António Manuel</p>
      </div>
    </div>
  );
}

function Margin() {
  return (
    <div className="content-stretch flex flex-col items-start pl-[24px] relative shrink-0" data-name="Margin">
      <div className="flex flex-col font-['Inter:Regular',sans-serif] font-normal justify-center leading-[0] not-italic relative shrink-0 text-[#78716c] text-[14px] whitespace-nowrap">
        <p className="leading-[20px]">12 de Out, 2023</p>
      </div>
    </div>
  );
}

function Container12() {
  return (
    <div className="relative shrink-0 size-[15px]" data-name="Container">
      <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 15 15">
        <g id="Container">
          <path d={svgPaths.p20401000} fill="var(--fill-0, #78716C)" id="Icon" />
        </g>
      </svg>
    </div>
  );
}

function Container11() {
  return (
    <div className="content-stretch flex gap-[4px] items-center relative shrink-0" data-name="Container">
      <Container12 />
      <div className="flex flex-col font-['Inter:Regular',sans-serif] font-normal justify-center leading-[0] not-italic relative shrink-0 text-[#78716c] text-[14px] whitespace-nowrap">
        <p className="leading-[20px]">42</p>
      </div>
    </div>
  );
}

function Margin1() {
  return (
    <div className="content-stretch flex flex-col items-start pl-[24px] relative shrink-0" data-name="Margin">
      <Container11 />
    </div>
  );
}

function Container14() {
  return (
    <div className="h-[11.25px] relative shrink-0 w-[16.5px]" data-name="Container">
      <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 16.5 11.25">
        <g id="Container">
          <path d={svgPaths.p110cf380} fill="var(--fill-0, #78716C)" id="Icon" />
        </g>
      </svg>
    </div>
  );
}

function Container13() {
  return (
    <div className="content-stretch flex gap-[4px] items-center relative shrink-0" data-name="Container">
      <Container14 />
      <div className="flex flex-col font-['Inter:Regular',sans-serif] font-normal justify-center leading-[0] not-italic relative shrink-0 text-[#78716c] text-[14px] whitespace-nowrap">
        <p className="leading-[20px]">1.2k</p>
      </div>
    </div>
  );
}

function Margin2() {
  return (
    <div className="content-stretch flex flex-col items-start pl-[24px] relative shrink-0" data-name="Margin">
      <Container13 />
    </div>
  );
}

function Container9() {
  return (
    <div className="content-stretch flex items-center pt-[8px] relative shrink-0 w-full" data-name="Container">
      <Container10 />
      <Margin />
      <Margin1 />
      <Margin2 />
    </div>
  );
}

function Container5() {
  return (
    <div className="content-stretch flex flex-[1_0_0] flex-col gap-[8px] items-start min-w-px relative" data-name="Container">
      <Container6 />
      <Container8 />
      <Container9 />
    </div>
  );
}

function Container4() {
  return (
    <div className="relative shrink-0 w-full" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex gap-[24px] items-start relative size-full">
        <Background1 />
        <Container5 />
      </div>
    </div>
  );
}

function Topic() {
  return (
    <div className="bg-white relative rounded-[8px] shrink-0 w-full" data-name="Topic 1">
      <div aria-hidden="true" className="absolute border border-[rgba(0,0,0,0)] border-solid inset-0 pointer-events-none rounded-[8px]" />
      <div className="content-stretch flex flex-col items-start p-[33px] relative size-full">
        <Container4 />
      </div>
    </div>
  );
}

function Background4() {
  return (
    <div className="bg-[#cee5ff] content-stretch flex items-center justify-center relative rounded-[12px] shrink-0 size-[56px]" data-name="Background">
      <div className="flex flex-col font-['Inter:Regular',sans-serif] font-bold justify-center leading-[0] not-italic relative shrink-0 text-[#001d32] text-[20px] text-center whitespace-nowrap">
        <p className="leading-[28px]">LC</p>
      </div>
    </div>
  );
}

function Heading2() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0" data-name="Heading 3">
      <div className="flex flex-col font-['Newsreader:Regular',sans-serif] font-normal justify-center leading-[0] relative shrink-0 text-[#1b1c1b] text-[24px] whitespace-nowrap">
        <p className="leading-[32px]">Moedas Coloniais em Angola: Circulação e Valor</p>
      </div>
    </div>
  );
}

function Container18() {
  return (
    <div className="h-[12.25px] relative shrink-0 w-[9.333px]" data-name="Container">
      <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 9.33333 12.25">
        <g id="Container">
          <path d={svgPaths.p27c49100} fill="var(--fill-0, #921A1A)" id="Icon" />
        </g>
      </svg>
    </div>
  );
}

function Container17() {
  return (
    <div className="relative shrink-0 w-full" data-name="Container">
      <div className="flex flex-row items-center size-full">
        <div className="content-stretch flex items-center justify-between relative size-full">
          <Heading2 />
          <Container18 />
        </div>
      </div>
    </div>
  );
}

function Background5() {
  return (
    <div className="bg-[#efedec] relative rounded-[2px] self-stretch shrink-0" data-name="Background">
      <div className="content-stretch flex flex-col items-start px-[8px] py-[4px] relative size-full">
        <div className="flex flex-col font-['Inter:Regular',sans-serif] font-normal justify-center leading-[0] not-italic relative shrink-0 text-[#59413e] text-[10px] tracking-[1px] uppercase whitespace-nowrap">
          <p className="leading-[15px]">ARQUIVOS COLONIAIS</p>
        </div>
      </div>
    </div>
  );
}

function Background6() {
  return (
    <div className="bg-[#efedec] relative rounded-[2px] self-stretch shrink-0" data-name="Background">
      <div className="content-stretch flex flex-col items-start px-[8px] py-[4px] relative size-full">
        <div className="flex flex-col font-['Inter:Regular',sans-serif] font-normal justify-center leading-[0] not-italic relative shrink-0 text-[#59413e] text-[10px] tracking-[1px] uppercase whitespace-nowrap">
          <p className="leading-[15px]">NUMISMÁTICA</p>
        </div>
      </div>
    </div>
  );
}

function Container19() {
  return (
    <div className="content-stretch flex gap-[8px] h-[23px] items-start relative shrink-0 w-full" data-name="Container">
      <Background5 />
      <Background6 />
    </div>
  );
}

function Container21() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0" data-name="Container">
      <div className="flex flex-col font-['Inter:Regular',sans-serif] font-normal justify-center leading-[0] not-italic relative shrink-0 text-[#78716c] text-[14px] whitespace-nowrap">
        <p className="leading-[20px]">Por Prof. Luís Costa</p>
      </div>
    </div>
  );
}

function Margin3() {
  return (
    <div className="content-stretch flex flex-col items-start pl-[24px] relative shrink-0" data-name="Margin">
      <div className="flex flex-col font-['Inter:Regular',sans-serif] font-normal justify-center leading-[0] not-italic relative shrink-0 text-[#78716c] text-[14px] whitespace-nowrap">
        <p className="leading-[20px]">05 de Out, 2023</p>
      </div>
    </div>
  );
}

function Container23() {
  return (
    <div className="relative shrink-0 size-[15px]" data-name="Container">
      <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 15 15">
        <g id="Container">
          <path d={svgPaths.p20401000} fill="var(--fill-0, #78716C)" id="Icon" />
        </g>
      </svg>
    </div>
  );
}

function Container22() {
  return (
    <div className="content-stretch flex gap-[4px] items-center relative shrink-0" data-name="Container">
      <Container23 />
      <div className="flex flex-col font-['Inter:Regular',sans-serif] font-normal justify-center leading-[0] not-italic relative shrink-0 text-[#78716c] text-[14px] whitespace-nowrap">
        <p className="leading-[20px]">18</p>
      </div>
    </div>
  );
}

function Margin4() {
  return (
    <div className="content-stretch flex flex-col items-start pl-[24px] relative shrink-0" data-name="Margin">
      <Container22 />
    </div>
  );
}

function Container25() {
  return (
    <div className="h-[11.25px] relative shrink-0 w-[16.5px]" data-name="Container">
      <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 16.5 11.25">
        <g id="Container">
          <path d={svgPaths.p110cf380} fill="var(--fill-0, #78716C)" id="Icon" />
        </g>
      </svg>
    </div>
  );
}

function Container24() {
  return (
    <div className="content-stretch flex gap-[4px] items-center relative shrink-0" data-name="Container">
      <Container25 />
      <div className="flex flex-col font-['Inter:Regular',sans-serif] font-normal justify-center leading-[0] not-italic relative shrink-0 text-[#78716c] text-[14px] whitespace-nowrap">
        <p className="leading-[20px]">640</p>
      </div>
    </div>
  );
}

function Margin5() {
  return (
    <div className="content-stretch flex flex-col items-start pl-[24px] relative shrink-0" data-name="Margin">
      <Container24 />
    </div>
  );
}

function Container20() {
  return (
    <div className="content-stretch flex items-center pt-[8px] relative shrink-0 w-full" data-name="Container">
      <Container21 />
      <Margin3 />
      <Margin4 />
      <Margin5 />
    </div>
  );
}

function Container16() {
  return (
    <div className="content-stretch flex flex-[1_0_0] flex-col gap-[8px] items-start min-w-px relative" data-name="Container">
      <Container17 />
      <Container19 />
      <Container20 />
    </div>
  );
}

function Container15() {
  return (
    <div className="relative shrink-0 w-full" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex gap-[24px] items-start relative size-full">
        <Background4 />
        <Container16 />
      </div>
    </div>
  );
}

function Topic2Private() {
  return (
    <div className="bg-white relative rounded-[8px] shrink-0 w-full" data-name="Topic 2 (Private)">
      <div aria-hidden="true" className="absolute border border-[rgba(0,0,0,0)] border-solid inset-0 pointer-events-none rounded-[8px]" />
      <div className="content-stretch flex flex-col items-start p-[33px] relative size-full">
        <Container15 />
      </div>
    </div>
  );
}

function Background7() {
  return (
    <div className="bg-[#e4e2e0] content-stretch flex items-center justify-center relative rounded-[12px] shrink-0 size-[56px]" data-name="Background">
      <div className="flex flex-col font-['Inter:Regular',sans-serif] font-bold justify-center leading-[0] not-italic relative shrink-0 text-[#292524] text-[20px] text-center whitespace-nowrap">
        <p className="leading-[28px]">SF</p>
      </div>
    </div>
  );
}

function Heading3() {
  return (
    <div className="content-stretch flex flex-col items-start pr-[57.72px] relative shrink-0" data-name="Heading 3">
      <div className="flex flex-col font-['Newsreader:Regular',sans-serif] font-normal justify-center leading-[0] relative shrink-0 text-[#1b1c1b] text-[24px] whitespace-nowrap">
        <p className="leading-[32px] mb-0">Impacto da Desvalorização em 1991: Memórias do Novo</p>
        <p className="leading-[32px]">Kwanza</p>
      </div>
    </div>
  );
}

function Container29() {
  return (
    <div className="relative shrink-0 size-[11.667px]" data-name="Container">
      <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 11.6667 11.6667">
        <g id="Container">
          <path d={svgPaths.p3c4dd880} fill="var(--fill-0, #A8A29E)" id="Icon" />
        </g>
      </svg>
    </div>
  );
}

function Container28() {
  return (
    <div className="relative shrink-0 w-full" data-name="Container">
      <div className="flex flex-row items-center size-full">
        <div className="content-stretch flex items-center justify-between relative size-full">
          <Heading3 />
          <Container29 />
        </div>
      </div>
    </div>
  );
}

function Background8() {
  return (
    <div className="bg-[#efedec] relative rounded-[2px] self-stretch shrink-0" data-name="Background">
      <div className="content-stretch flex flex-col items-start px-[8px] py-[4px] relative size-full">
        <div className="flex flex-col font-['Inter:Regular',sans-serif] font-normal justify-center leading-[0] not-italic relative shrink-0 text-[#59413e] text-[10px] tracking-[1px] uppercase whitespace-nowrap">
          <p className="leading-[15px]">INFLAÇÃO</p>
        </div>
      </div>
    </div>
  );
}

function Background9() {
  return (
    <div className="bg-[#efedec] relative rounded-[2px] self-stretch shrink-0" data-name="Background">
      <div className="content-stretch flex flex-col items-start px-[8px] py-[4px] relative size-full">
        <div className="flex flex-col font-['Inter:Regular',sans-serif] font-normal justify-center leading-[0] not-italic relative shrink-0 text-[#59413e] text-[10px] tracking-[1px] uppercase whitespace-nowrap">
          <p className="leading-[15px]">HISTÓRIA ORAL</p>
        </div>
      </div>
    </div>
  );
}

function Container30() {
  return (
    <div className="content-stretch flex gap-[8px] h-[23px] items-start relative shrink-0 w-full" data-name="Container">
      <Background8 />
      <Background9 />
    </div>
  );
}

function Container32() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0" data-name="Container">
      <div className="flex flex-col font-['Inter:Regular',sans-serif] font-normal justify-center leading-[0] not-italic relative shrink-0 text-[#78716c] text-[14px] whitespace-nowrap">
        <p className="leading-[20px]">Por Sara Francisco</p>
      </div>
    </div>
  );
}

function Margin6() {
  return (
    <div className="content-stretch flex flex-col items-start pl-[24px] relative shrink-0" data-name="Margin">
      <div className="flex flex-col font-['Inter:Regular',sans-serif] font-normal justify-center leading-[0] not-italic relative shrink-0 text-[#78716c] text-[14px] whitespace-nowrap">
        <p className="leading-[20px]">28 de Set, 2023</p>
      </div>
    </div>
  );
}

function Container34() {
  return (
    <div className="relative shrink-0 size-[15px]" data-name="Container">
      <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 15 15">
        <g id="Container">
          <path d={svgPaths.p20401000} fill="var(--fill-0, #78716C)" id="Icon" />
        </g>
      </svg>
    </div>
  );
}

function Container33() {
  return (
    <div className="content-stretch flex gap-[4px] items-center relative shrink-0" data-name="Container">
      <Container34 />
      <div className="flex flex-col font-['Inter:Regular',sans-serif] font-normal justify-center leading-[0] not-italic relative shrink-0 text-[#78716c] text-[14px] whitespace-nowrap">
        <p className="leading-[20px]">56</p>
      </div>
    </div>
  );
}

function Margin7() {
  return (
    <div className="content-stretch flex flex-col items-start pl-[24px] relative shrink-0" data-name="Margin">
      <Container33 />
    </div>
  );
}

function Container36() {
  return (
    <div className="h-[11.25px] relative shrink-0 w-[16.5px]" data-name="Container">
      <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 16.5 11.25">
        <g id="Container">
          <path d={svgPaths.p110cf380} fill="var(--fill-0, #78716C)" id="Icon" />
        </g>
      </svg>
    </div>
  );
}

function Container35() {
  return (
    <div className="content-stretch flex gap-[4px] items-center relative shrink-0" data-name="Container">
      <Container36 />
      <div className="flex flex-col font-['Inter:Regular',sans-serif] font-normal justify-center leading-[0] not-italic relative shrink-0 text-[#78716c] text-[14px] whitespace-nowrap">
        <p className="leading-[20px]">2.5k</p>
      </div>
    </div>
  );
}

function Margin8() {
  return (
    <div className="content-stretch flex flex-col items-start pl-[24px] relative shrink-0" data-name="Margin">
      <Container35 />
    </div>
  );
}

function Container31() {
  return (
    <div className="content-stretch flex items-center pt-[8px] relative shrink-0 w-full" data-name="Container">
      <Container32 />
      <Margin6 />
      <Margin7 />
      <Margin8 />
    </div>
  );
}

function Container27() {
  return (
    <div className="content-stretch flex flex-[1_0_0] flex-col gap-[8px] items-start min-w-px relative" data-name="Container">
      <Container28 />
      <Container30 />
      <Container31 />
    </div>
  );
}

function Container26() {
  return (
    <div className="relative shrink-0 w-full" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex gap-[24px] items-start relative size-full">
        <Background7 />
        <Container27 />
      </div>
    </div>
  );
}

function Topic1() {
  return (
    <div className="bg-white relative rounded-[8px] shrink-0 w-full" data-name="Topic 3">
      <div aria-hidden="true" className="absolute border border-[rgba(0,0,0,0)] border-solid inset-0 pointer-events-none rounded-[8px]" />
      <div className="content-stretch flex flex-col items-start p-[33px] relative size-full">
        <Container26 />
      </div>
    </div>
  );
}

function TopicsList() {
  return (
    <div className="content-stretch flex flex-col gap-[24px] items-start relative shrink-0 w-full" data-name="Topics List">
      <Topic />
      <Topic2Private />
      <Topic1 />
    </div>
  );
}

function TopicsContent() {
  return (
    <div className="col-[1/span_8] content-stretch flex flex-col gap-[40px] items-start justify-self-stretch pb-[190.5px] relative row-1 self-start shrink-0" data-name="Topics Content">
      <ActionBar />
      <TopicsList />
    </div>
  );
}

function Heading4() {
  return (
    <div className="content-stretch flex flex-col items-start pb-[9px] relative shrink-0 w-full" data-name="Heading 4">
      <div aria-hidden="true" className="absolute border-[rgba(224,191,187,0.3)] border-b border-solid inset-0 pointer-events-none" />
      <div className="flex flex-col font-['Newsreader:Regular',sans-serif] font-normal justify-center leading-[0] relative shrink-0 text-[#6f0008] text-[20px] whitespace-nowrap">
        <p className="leading-[28px]">Curador da Categoria</p>
      </div>
    </div>
  );
}

function RetratoDoCurador() {
  return (
    <div className="flex-[1_0_0] min-h-px relative w-full" data-name="Retrato do Curador">
      <div className="absolute bg-clip-padding border-0 border-[transparent] border-solid inset-0 overflow-hidden pointer-events-none">
        <img alt="" className="absolute h-full left-[-0.9%] max-w-none top-0 w-[101.8%]" src={imgRetratoDoCurador} />
      </div>
    </div>
  );
}

function Border() {
  return (
    <div className="h-[64px] relative rounded-[12px] shrink-0 w-[62.94px]" data-name="Border">
      <div className="content-stretch flex flex-col items-start justify-center overflow-clip p-[2px] relative rounded-[inherit] size-full">
        <RetratoDoCurador />
      </div>
      <div aria-hidden="true" className="absolute border-2 border-[rgba(111,0,8,0.2)] border-solid inset-0 pointer-events-none rounded-[12px]" />
    </div>
  );
}

function Container39() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0 w-full" data-name="Container">
      <div className="flex flex-col font-['Inter:Regular',sans-serif] font-bold justify-center leading-[0] not-italic relative shrink-0 text-[#1b1c1b] text-[16px] whitespace-nowrap">
        <p className="leading-[20px]">Dr. Manuel Vitoria</p>
      </div>
    </div>
  );
}

function Container40() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0 w-full" data-name="Container">
      <div className="flex flex-col font-['Inter:Italic',sans-serif] font-normal italic justify-center leading-[0] relative shrink-0 text-[#78716c] text-[14px] whitespace-nowrap">
        <p className="leading-[20px] mb-0">Especialista em Economia</p>
        <p className="leading-[20px]">Política</p>
      </div>
    </div>
  );
}

function Container38() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0 w-[171.76px]" data-name="Container">
      <Container39 />
      <Container40 />
    </div>
  );
}

function Container37() {
  return (
    <div className="content-stretch flex gap-[16px] items-center pt-[0.9px] relative shrink-0 w-full" data-name="Container">
      <Border />
      <Container38 />
    </div>
  );
}

function Container41() {
  return (
    <div className="content-stretch flex flex-col items-start pb-[0.875px] relative shrink-0 w-full" data-name="Container">
      <div className="flex flex-col font-['Inter:Regular',sans-serif] font-normal justify-center leading-[0] not-italic relative shrink-0 text-[#57534e] text-[14px] w-full">
        <p className="leading-[22.75px] mb-0">{`"A nossa moeda é o reflexo da nossa história`}</p>
        <p className="leading-[22.75px] mb-0">política e social. Preservar este arquivo é</p>
        <p className="leading-[22.75px] mb-0">garantir a literacia económica das futuras</p>
        <p className="leading-[22.75px]">{`gerações."`}</p>
      </div>
    </div>
  );
}

function Button4() {
  return (
    <div className="content-stretch flex items-center justify-center pb-[13px] pt-[13.9px] px-px relative rounded-[12px] shrink-0 w-full" data-name="Button">
      <div aria-hidden="true" className="absolute border border-[#6f0008] border-solid inset-0 pointer-events-none rounded-[12px]" />
      <div className="flex flex-col font-['Inter:Regular',sans-serif] font-medium justify-center leading-[0] not-italic relative shrink-0 text-[#6f0008] text-[14px] text-center whitespace-nowrap">
        <p className="leading-[20px]">Contactar Curador</p>
      </div>
    </div>
  );
}

function CuratorCard() {
  return (
    <div className="bg-[#f5f3f1] relative rounded-[8px] shrink-0 w-full" data-name="Curator Card">
      <div className="content-stretch flex flex-col gap-[23.1px] items-start p-[32px] relative size-full">
        <Heading4 />
        <Container37 />
        <Container41 />
        <Button4 />
      </div>
    </div>
  );
}

function Heading5() {
  return (
    <div className="content-stretch flex flex-col items-start pb-[9px] relative shrink-0 w-full" data-name="Heading 4">
      <div aria-hidden="true" className="absolute border-[rgba(224,191,187,0.3)] border-b border-solid inset-0 pointer-events-none" />
      <div className="flex flex-col font-['Newsreader:Regular',sans-serif] font-normal justify-center leading-[0] relative shrink-0 text-[#6f0008] text-[20px] whitespace-nowrap">
        <p className="leading-[28px]">Documentos de Referência</p>
      </div>
    </div>
  );
}

function Container43() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0 w-full" data-name="Container">
      <div className="flex flex-col font-['Inter:Regular',sans-serif] font-medium justify-center leading-[0] not-italic relative shrink-0 text-[#1b1c1b] text-[14px] whitespace-nowrap">
        <p className="leading-[20px]">Relatório Anual BNA (1977)</p>
      </div>
    </div>
  );
}

function Container44() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0 w-full" data-name="Container">
      <div className="flex flex-col font-['Inter:Regular',sans-serif] font-normal justify-center leading-[0] not-italic relative shrink-0 text-[#78716c] text-[11px] uppercase whitespace-nowrap">
        <p className="leading-[16.5px]">PDF • 12MB</p>
      </div>
    </div>
  );
}

function Container42() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0 w-[179.28px]" data-name="Container">
      <Container43 />
      <Container44 />
    </div>
  );
}

function Item() {
  return (
    <div className="content-stretch flex gap-[11.99px] items-start relative shrink-0 w-full" data-name="Item">
      <div className="h-[20px] relative shrink-0 w-[16px]" data-name="Icon">
        <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 16 20">
          <path d={svgPaths.pc679c40} fill="var(--fill-0, #6F0008)" id="Icon" />
        </svg>
      </div>
      <Container42 />
    </div>
  );
}

function Container46() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0 w-full" data-name="Container">
      <div className="flex flex-col font-['Inter:Regular',sans-serif] font-medium justify-center leading-[0] not-italic relative shrink-0 text-[#1b1c1b] text-[14px] whitespace-nowrap">
        <p className="leading-[20px]">Estatutos do Banco de Angola</p>
      </div>
    </div>
  );
}

function Container47() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0 w-full" data-name="Container">
      <div className="flex flex-col font-['Inter:Regular',sans-serif] font-normal justify-center leading-[0] not-italic relative shrink-0 text-[#78716c] text-[11px] uppercase whitespace-nowrap">
        <p className="leading-[16.5px]">PDF • 4.5MB</p>
      </div>
    </div>
  );
}

function Container45() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0 w-[200.56px]" data-name="Container">
      <Container46 />
      <Container47 />
    </div>
  );
}

function Item1() {
  return (
    <div className="content-stretch flex gap-[11.99px] items-start relative shrink-0 w-full" data-name="Item">
      <div className="h-[20px] relative shrink-0 w-[16px]" data-name="Icon">
        <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 16 20">
          <path d={svgPaths.pc679c40} fill="var(--fill-0, #6F0008)" id="Icon" />
        </svg>
      </div>
      <Container45 />
    </div>
  );
}

function Container49() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0 w-full" data-name="Container">
      <div className="flex flex-col font-['Inter:Regular',sans-serif] font-medium justify-center leading-[0] not-italic relative shrink-0 text-[#1b1c1b] text-[14px] whitespace-nowrap">
        <p className="leading-[20px]">História do Escudo em Angola</p>
      </div>
    </div>
  );
}

function Container50() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0 w-full" data-name="Container">
      <div className="flex flex-col font-['Inter:Regular',sans-serif] font-normal justify-center leading-[0] not-italic relative shrink-0 text-[#78716c] text-[11px] uppercase whitespace-nowrap">
        <p className="leading-[16.5px]">ARTIGO ACADÉMICO</p>
      </div>
    </div>
  );
}

function Container48() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0 w-[200.84px]" data-name="Container">
      <Container49 />
      <Container50 />
    </div>
  );
}

function Item2() {
  return (
    <div className="content-stretch flex gap-[11.99px] items-start relative shrink-0 w-full" data-name="Item">
      <div className="h-[19.5px] relative shrink-0 w-[22px]" data-name="Icon">
        <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 22 19.5">
          <path d={svgPaths.p1382b180} fill="var(--fill-0, #6F0008)" id="Icon" />
        </svg>
      </div>
      <Container48 />
    </div>
  );
}

function List() {
  return (
    <div className="content-stretch flex flex-col gap-[16px] items-start relative shrink-0 w-full" data-name="List">
      <Item />
      <Item1 />
      <Item2 />
    </div>
  );
}

function ReferenceDocuments() {
  return (
    <div className="bg-[#f5f3f1] relative rounded-[8px] shrink-0 w-full" data-name="Reference Documents">
      <div className="content-stretch flex flex-col gap-[24px] items-start p-[32px] relative size-full">
        <Heading5 />
        <List />
      </div>
    </div>
  );
}

function Heading6() {
  return (
    <div className="relative shrink-0 w-full" data-name="Heading 4">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col items-start relative size-full">
        <div className="flex flex-col font-['Newsreader:Regular',sans-serif] font-normal justify-center leading-[0] relative shrink-0 text-[#292524] text-[18px] w-full">
          <p className="leading-[28px]">Atividade da Categoria</p>
        </div>
      </div>
    </div>
  );
}

function Container52() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0 w-full" data-name="Container">
      <div className="flex flex-col font-['Inter:Regular',sans-serif] font-bold justify-center leading-[0] not-italic relative shrink-0 text-[#6f0008] text-[24px] w-full">
        <p className="leading-[32px]">154</p>
      </div>
    </div>
  );
}

function Container53() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0 w-full" data-name="Container">
      <div className="flex flex-col font-['Inter:Regular',sans-serif] font-normal justify-center leading-[0] not-italic relative shrink-0 text-[#78716c] text-[10px] tracking-[-0.5px] uppercase w-full">
        <p className="leading-[15px]">DISCUSSÕES</p>
      </div>
    </div>
  );
}

function Background10() {
  return (
    <div className="bg-[#fbf9f7] col-1 justify-self-stretch relative rounded-[4px] row-1 self-start shrink-0" data-name="Background">
      <div className="content-stretch flex flex-col items-start p-[16px] relative size-full">
        <Container52 />
        <Container53 />
      </div>
    </div>
  );
}

function Container54() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0 w-full" data-name="Container">
      <div className="flex flex-col font-['Inter:Regular',sans-serif] font-bold justify-center leading-[0] not-italic relative shrink-0 text-[#6f0008] text-[24px] w-full">
        <p className="leading-[32px]">2.1k</p>
      </div>
    </div>
  );
}

function Container55() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0 w-full" data-name="Container">
      <div className="flex flex-col font-['Inter:Regular',sans-serif] font-normal justify-center leading-[0] not-italic relative shrink-0 text-[#78716c] text-[10px] tracking-[-0.5px] uppercase w-full">
        <p className="leading-[15px]">PESQUISADORES</p>
      </div>
    </div>
  );
}

function Background11() {
  return (
    <div className="bg-[#fbf9f7] col-2 justify-self-stretch relative rounded-[4px] row-1 self-start shrink-0" data-name="Background">
      <div className="content-stretch flex flex-col items-start p-[16px] relative size-full">
        <Container54 />
        <Container55 />
      </div>
    </div>
  );
}

function Container51() {
  return (
    <div className="relative shrink-0 w-full" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid gap-x-[16px] gap-y-[16px] grid grid-cols-[repeat(2,minmax(0,1fr))] grid-rows-[_79px] relative size-full">
        <Background10 />
        <Background11 />
      </div>
    </div>
  );
}

function CommunityStats() {
  return (
    <div className="relative rounded-[8px] shrink-0 w-full" data-name="Community Stats">
      <div aria-hidden="true" className="absolute border border-[rgba(224,191,187,0.2)] border-solid inset-0 pointer-events-none rounded-[8px]" />
      <div className="content-stretch flex flex-col gap-[16px] items-start p-[33px] relative size-full">
        <Heading6 />
        <Container51 />
      </div>
    </div>
  );
}

function AsideSidebar() {
  return (
    <div className="col-[9/span_4] content-stretch flex flex-col gap-[32px] items-start justify-self-stretch relative row-1 self-start shrink-0" data-name="Aside - Sidebar">
      <CuratorCard />
      <ReferenceDocuments />
      <CommunityStats />
    </div>
  );
}

function MainContentArea() {
  return (
    <div className="gap-x-[48px] gap-y-[48px] grid grid-cols-[repeat(12,minmax(0,1fr))] grid-rows-[_893.50px] relative shrink-0 w-full" data-name="Main Content Area">
      <TopicsContent />
      <AsideSidebar />
    </div>
  );
}

function Main() {
  return (
    <div className="max-w-[1440px] relative shrink-0 w-full" data-name="Main">
      <div className="content-stretch flex flex-col gap-[48px] items-start max-w-[inherit] px-[48px] relative size-full">
        <SectionCategoryHeader />
        <MainContentArea />
      </div>
    </div>
  );
}

function Container57() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0 w-full" data-name="Container">
      <div className="flex flex-col font-['Newsreader:Italic',sans-serif] font-normal italic justify-center leading-[0] relative shrink-0 text-[#6f0008] text-[18px] whitespace-nowrap">
        <p className="leading-[28px]">Economia com História</p>
      </div>
    </div>
  );
}

function Container58() {
  return (
    <div className="content-stretch flex flex-col items-start opacity-80 relative shrink-0 w-full" data-name="Container">
      <div className="flex flex-col font-['Inter:Regular',sans-serif] font-normal justify-center leading-[0] not-italic relative shrink-0 text-[#57534e] text-[12px] whitespace-nowrap">
        <p className="leading-[19.5px]">© 2024 Arquivo Histórico de Angola. Instituição Académica de Pesquisa.</p>
      </div>
    </div>
  );
}

function Container56() {
  return (
    <div className="relative shrink-0 w-[413.83px]" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col gap-[4px] items-start relative size-full">
        <Container57 />
        <Container58 />
      </div>
    </div>
  );
}

function Link1() {
  return (
    <div className="content-stretch flex flex-col items-start relative self-stretch shrink-0" data-name="Link">
      <div className="flex flex-col font-['Inter:Regular',sans-serif] font-normal justify-center leading-[0] not-italic relative shrink-0 text-[#6f0008] text-[12px] whitespace-nowrap">
        <p className="leading-[19.5px]">Termos de Uso</p>
      </div>
    </div>
  );
}

function Link2() {
  return (
    <div className="content-stretch flex flex-col items-start relative self-stretch shrink-0" data-name="Link">
      <div className="flex flex-col font-['Inter:Regular',sans-serif] font-normal justify-center leading-[0] not-italic relative shrink-0 text-[#6f0008] text-[12px] whitespace-nowrap">
        <p className="leading-[19.5px]">Política de Privacidade</p>
      </div>
    </div>
  );
}

function Link3() {
  return (
    <div className="content-stretch flex flex-col items-start relative self-stretch shrink-0" data-name="Link">
      <div className="flex flex-col font-['Inter:Regular',sans-serif] font-normal justify-center leading-[0] not-italic relative shrink-0 text-[#6f0008] text-[12px] whitespace-nowrap">
        <p className="leading-[19.5px]">Créditos Institucionais</p>
      </div>
    </div>
  );
}

function Container59() {
  return (
    <div className="h-[20px] opacity-80 relative shrink-0" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex gap-[32px] items-start justify-center relative size-full">
        <Link1 />
        <Link2 />
        <Link3 />
      </div>
    </div>
  );
}

function HorizontalBorder() {
  return (
    <div className="content-stretch flex items-center justify-between max-w-[1280px] pt-[33px] relative shrink-0 w-full" data-name="HorizontalBorder">
      <div aria-hidden="true" className="absolute border-[rgba(224,191,187,0.2)] border-solid border-t inset-0 pointer-events-none" />
      <Container56 />
      <Container59 />
    </div>
  );
}

function FooterBasedOnComponents() {
  return (
    <div className="bg-[#f5f3f1] relative shrink-0 w-full" data-name="Footer based on COMPONENTS_42">
      <div className="content-stretch flex flex-col items-start px-[32px] py-[48px] relative size-full">
        <HorizontalBorder />
      </div>
    </div>
  );
}

function Container61() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0" data-name="Container">
      <div className="flex flex-col font-['Newsreader:Italic',sans-serif] font-normal italic justify-center leading-[0] relative shrink-0 text-[#6f0008] text-[24px] whitespace-nowrap">
        <p className="leading-[32px]">Economia com História</p>
      </div>
    </div>
  );
}

function Link4() {
  return (
    <div className="content-stretch flex flex-col items-start opacity-70 relative shrink-0" data-name="Link">
      <div className="flex flex-col font-['Newsreader:Regular',sans-serif] font-normal justify-center leading-[0] relative shrink-0 text-[#1b1c1b] text-[18px] tracking-[-0.45px] whitespace-nowrap">
        <p className="leading-[28px]">Home</p>
      </div>
    </div>
  );
}

function LinkMargin() {
  return (
    <div className="content-stretch flex flex-col items-start pl-[32px] relative shrink-0" data-name="Link:margin">
      <div className="flex flex-col font-['Newsreader:Regular',sans-serif] font-normal justify-center leading-[0] opacity-70 relative shrink-0 text-[#1b1c1b] text-[18px] tracking-[-0.45px] whitespace-nowrap">
        <p className="leading-[28px]">Conteúdos</p>
      </div>
    </div>
  );
}

function LinkMargin1() {
  return (
    <div className="content-stretch flex flex-col items-start pl-[32px] relative shrink-0" data-name="Link:margin">
      <div className="flex flex-col font-['Newsreader:Regular',sans-serif] font-normal justify-center leading-[0] relative shrink-0 text-[#6f0008] text-[18px] tracking-[-0.45px] whitespace-nowrap">
        <p className="leading-[28px]">Comunidade</p>
      </div>
    </div>
  );
}

function LinkMargin2() {
  return (
    <div className="content-stretch flex flex-col items-start pl-[32px] relative shrink-0" data-name="Link:margin">
      <div className="flex flex-col font-['Newsreader:Regular',sans-serif] font-normal justify-center leading-[0] opacity-70 relative shrink-0 text-[#1b1c1b] text-[18px] tracking-[-0.45px] whitespace-nowrap">
        <p className="leading-[28px]">Quiz</p>
      </div>
    </div>
  );
}

function LinkMargin3() {
  return (
    <div className="content-stretch flex flex-col items-start pl-[32px] relative shrink-0" data-name="Link:margin">
      <div className="flex flex-col font-['Newsreader:Regular',sans-serif] font-normal justify-center leading-[0] opacity-70 relative shrink-0 text-[#1b1c1b] text-[18px] tracking-[-0.45px] whitespace-nowrap">
        <p className="leading-[28px]">Perfil</p>
      </div>
    </div>
  );
}

function Nav() {
  return (
    <div className="content-stretch flex items-center relative shrink-0" data-name="Nav">
      <Link4 />
      <LinkMargin />
      <LinkMargin1 />
      <LinkMargin2 />
      <LinkMargin3 />
    </div>
  );
}

function Button5() {
  return (
    <div className="h-[16px] relative shrink-0 w-[22px]" data-name="Button">
      <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 22 16">
        <g id="Button">
          <path d={svgPaths.p378800} fill="var(--fill-0, #6F0008)" id="Icon" />
        </g>
      </svg>
    </div>
  );
}

function Button6() {
  return (
    <div className="h-[16px] relative shrink-0 w-[19.5px]" data-name="Button">
      <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 19.5 16">
        <g id="Button">
          <path d={svgPaths.p29002e00} fill="var(--fill-0, #6F0008)" id="Icon" />
        </g>
      </svg>
    </div>
  );
}

function ButtonMargin() {
  return (
    <div className="content-stretch flex flex-col items-start pl-[16px] relative shrink-0" data-name="Button:margin">
      <Button6 />
    </div>
  );
}

function Container62() {
  return (
    <div className="content-stretch flex items-center relative shrink-0" data-name="Container">
      <Button5 />
      <ButtonMargin />
    </div>
  );
}

function Container60() {
  return (
    <div className="max-w-[1440px] relative shrink-0 w-full" data-name="Container">
      <div className="flex flex-row items-center max-w-[inherit] size-full">
        <div className="content-stretch flex items-center justify-between max-w-[inherit] pl-[24px] pr-[24.02px] py-[16px] relative size-full">
          <Container61 />
          <Nav />
          <Container62 />
        </div>
      </div>
    </div>
  );
}

function HeaderTopAppBarBasedOnComponents() {
  return (
    <div className="absolute backdrop-blur-[12px] bg-[rgba(251,249,247,0.8)] content-stretch flex flex-col items-start left-0 shadow-[0px_4px_24px_0px_rgba(27,28,27,0.06)] top-0 w-[1280px]" data-name="Header - TopAppBar based on COMPONENTS_42">
      <Container60 />
    </div>
  );
}

export default function HtmlBody() {
  return (
    <div className="content-stretch flex flex-col gap-[80px] items-start pt-[104px] relative size-full" style={{ backgroundImage: "linear-gradient(90deg, rgb(251, 249, 247) 0%, rgb(251, 249, 247) 100%), linear-gradient(90deg, rgb(255, 255, 255) 0%, rgb(255, 255, 255) 100%)" }} data-name="Html → Body">
      <Main />
      <FooterBasedOnComponents />
      <HeaderTopAppBarBasedOnComponents />
    </div>
  );
}