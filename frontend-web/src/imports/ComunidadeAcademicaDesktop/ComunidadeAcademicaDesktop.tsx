import svgPaths from "./svg-8v9bguwh3t";
import imgHistoriaMonetaria from "./cc2bf198e790491cbf9d0c45610d5499db9cb2d6.png";
import imgInfraestrutura from "./53151015f06c65e8a59965235e52a68b5b706ac3.png";
import imgAb6AXuA0T17CjBmHyALwHqulueMvs8Kz32UT8DjWiv7Qy5CS1HCMi0SbaWp3Tijfi7LljqYzH9YNtidM9QGpgh0OwaPp5VWWucI6VBvt9Syon3TyEGxxmBcZasnqeTwPaDuxq5TJwMxfndtFn3SrJbY4Ts0Gjedn0NTfWSMtXdWalJc1IxwEjw4TrhQcwcGBrAxvwfhfSnXkDe6P9BilDw5LVa9H2Y5GcdYgWzq9WbC59Ifqh0RgcZjryxVt9GNtts4TamVni from "./c8893a97d9eeaef1bf61f99f4e347e4250f644ca.png";

function Container() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0" data-name="Container">
      <div className="flex flex-col font-['Source_Sans_3:Bold',sans-serif] font-bold justify-center leading-[0] relative shrink-0 text-[#7f1d1d] text-[24px] tracking-[-1.2px] whitespace-nowrap">
        <p className="leading-[32px]">Arquivo Económico de Angola</p>
      </div>
    </div>
  );
}

function Link() {
  return (
    <div className="content-stretch flex flex-col items-start pb-[4px] relative shrink-0" data-name="Link">
      <div className="flex flex-col font-['Source_Sans_3:Medium',sans-serif] font-medium justify-center leading-[0] relative shrink-0 text-[#475569] text-[16px] whitespace-nowrap">
        <p className="leading-[24px]">Início</p>
      </div>
    </div>
  );
}

function LinkMargin() {
  return (
    <div className="content-stretch flex flex-col items-start pb-[4px] pl-[48px] relative shrink-0" data-name="Link:margin">
      <div className="flex flex-col font-['Source_Sans_3:Medium',sans-serif] font-medium justify-center leading-[0] relative shrink-0 text-[#475569] text-[16px] whitespace-nowrap">
        <p className="leading-[24px]">Conteúdos</p>
      </div>
    </div>
  );
}

function Link1() {
  return (
    <div className="content-stretch flex flex-col items-start pb-[6px] relative shrink-0" data-name="Link">
      <div aria-hidden="true" className="absolute border-[#7f1d1d] border-b-2 border-solid inset-0 pointer-events-none" />
      <div className="flex flex-col font-['Source_Sans_3:Bold',sans-serif] font-bold justify-center leading-[0] relative shrink-0 text-[#7f1d1d] text-[16px] whitespace-nowrap">
        <p className="leading-[24px]">Comunidade</p>
      </div>
    </div>
  );
}

function LinkMargin1() {
  return (
    <div className="content-stretch flex flex-col items-start pl-[48px] relative shrink-0" data-name="Link:margin">
      <Link1 />
    </div>
  );
}

function LinkMargin2() {
  return (
    <div className="content-stretch flex flex-col items-start pb-[4px] pl-[48px] relative shrink-0" data-name="Link:margin">
      <div className="flex flex-col font-['Source_Sans_3:Medium',sans-serif] font-medium justify-center leading-[0] relative shrink-0 text-[#475569] text-[16px] whitespace-nowrap">
        <p className="leading-[24px]">Quiz</p>
      </div>
    </div>
  );
}

function LinkMargin3() {
  return (
    <div className="content-stretch flex flex-col items-start pb-[4px] pl-[48px] relative shrink-0" data-name="Link:margin">
      <div className="flex flex-col font-['Source_Sans_3:Medium',sans-serif] font-medium justify-center leading-[0] relative shrink-0 text-[#475569] text-[16px] whitespace-nowrap">
        <p className="leading-[24px]">Perfil</p>
      </div>
    </div>
  );
}

function Container1() {
  return (
    <div className="content-stretch flex items-center relative shrink-0" data-name="Container">
      <Link />
      <LinkMargin />
      <LinkMargin1 />
      <LinkMargin2 />
      <LinkMargin3 />
    </div>
  );
}

function Container2() {
  return (
    <div className="relative shrink-0 size-[18px]" data-name="Container">
      <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 18 18">
        <g id="Container">
          <path d={svgPaths.p8a35e00} fill="var(--fill-0, #475569)" id="Icon" />
        </g>
      </svg>
    </div>
  );
}

function Container3() {
  return (
    <div className="content-stretch flex flex-col items-center relative shrink-0" data-name="Container">
      <div className="flex flex-col font-['Source_Sans_3:Medium',sans-serif] font-medium justify-center leading-[0] relative shrink-0 text-[#475569] text-[14px] text-center whitespace-nowrap">
        <p className="leading-[20px]">Pesquisar</p>
      </div>
    </div>
  );
}

function Button() {
  return (
    <div className="content-stretch flex gap-[7.99px] items-center relative shrink-0" data-name="Button">
      <Container2 />
      <Container3 />
    </div>
  );
}

function Nav() {
  return (
    <div className="max-w-[1536px] relative shrink-0 w-full" data-name="Nav">
      <div className="flex flex-row items-center max-w-[inherit] size-full">
        <div className="content-stretch flex items-center justify-between max-w-[inherit] px-[48px] py-[24px] relative size-full">
          <Container />
          <Container1 />
          <Button />
        </div>
      </div>
    </div>
  );
}

function HeaderTopNavBar() {
  return (
    <div className="backdrop-blur-[32px] bg-[rgba(255,255,255,0.85)] content-stretch flex flex-col items-start relative shrink-0 w-full" data-name="Header - TopNavBar">
      <Nav />
    </div>
  );
}

function Container5() {
  return (
    <div className="absolute content-stretch flex flex-col items-start left-0 right-0 top-[-1px]" data-name="Container">
      <div className="flex flex-col font-['Source_Sans_3:Bold',sans-serif] font-bold justify-center leading-[0] relative shrink-0 text-[#6b0119] text-[11px] tracking-[1.1px] uppercase whitespace-nowrap">
        <p className="leading-[16.5px]">{`FÓRUM & INTERCÂMBIO`}</p>
      </div>
    </div>
  );
}

function Heading() {
  return (
    <div className="absolute content-stretch flex flex-col items-start left-0 right-0 top-[32.5px]" data-name="Heading 1">
      <div className="flex flex-col font-['IBM_Plex_Sans:Bold',sans-serif] font-bold justify-center leading-[0] relative shrink-0 text-[#121c2a] text-[48px] tracking-[-0.96px] whitespace-nowrap" style={{ fontVariationSettings: "'wdth' 100" }}>
        <p className="leading-[60px]">Discurso Académico</p>
      </div>
    </div>
  );
}

function Container6() {
  return (
    <div className="absolute content-stretch flex flex-col items-start left-0 max-w-[576px] right-0 top-[116.5px]" data-name="Container">
      <div className="flex flex-col font-['Source_Sans_3:Regular',sans-serif] font-normal justify-center leading-[0] relative shrink-0 text-[#574142] text-[18px] whitespace-nowrap">
        <p className="leading-[28px] mb-0">Interaja com académicos e investigadores sobre a evolução histórica da</p>
        <p className="leading-[28px]">economia angolana, rotas comerciais e sistemas monetários pós-coloniais.</p>
      </div>
    </div>
  );
}

function Container4() {
  return (
    <div className="h-[172.5px] max-w-[672px] relative shrink-0 w-[576px]" data-name="Container">
      <Container5 />
      <Heading />
      <Container6 />
    </div>
  );
}

function Container7() {
  return (
    <div className="h-[20.025px] relative shrink-0 w-[20px]" data-name="Container">
      <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 20 20.025">
        <g id="Container">
          <path d={svgPaths.p3d954600} fill="var(--fill-0, white)" id="Icon" />
        </g>
      </svg>
    </div>
  );
}

function Button1() {
  return (
    <div className="bg-[#8b1e2d] content-stretch drop-shadow-[0px_1px_1px_rgba(0,0,0,0.05)] flex gap-[12px] items-center px-[32px] py-[16px] relative rounded-[4px] shrink-0 cursor-pointer" data-name="Button" data-nav="create-topic">
      <Container7 />
      <div className="flex flex-col font-['Source_Sans_3:Bold',sans-serif] font-bold justify-center leading-[0] relative shrink-0 text-[16px] text-center text-white whitespace-nowrap">
        <p className="leading-[24px]">Criar Tópico</p>
      </div>
    </div>
  );
}

function CommunityHeroHeaderSection() {
  return (
    <div className="content-stretch flex items-end justify-between relative shrink-0 w-full" data-name="Community Hero / Header Section">
      <Container4 />
      <Button1 />
    </div>
  );
}

function Heading2() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0 w-full" data-name="Heading 3">
      <div className="flex flex-col font-['IBM_Plex_Sans:Bold',sans-serif] font-bold justify-center leading-[0] relative shrink-0 text-[#6b0119] text-[12px] tracking-[1.2px] uppercase w-full" style={{ fontVariationSettings: "'wdth' 100" }}>
        <p className="leading-[16px]">REGRAS DO ARQUIVO</p>
      </div>
    </div>
  );
}

function Container8() {
  return (
    <div className="content-stretch flex flex-col items-start relative self-stretch shrink-0" data-name="Container">
      <div className="flex flex-col font-['Source_Sans_3:Bold',sans-serif] font-bold justify-center leading-[0] relative shrink-0 text-[#6b0119] text-[14px] whitespace-nowrap">
        <p className="leading-[20px]">01.</p>
      </div>
    </div>
  );
}

function Item() {
  return (
    <div className="content-stretch flex gap-[12px] items-start relative shrink-0 w-full" data-name="Item">
      <Container8 />
      <div className="flex flex-col font-['Source_Sans_3:Regular',sans-serif] font-normal justify-center leading-[0] relative shrink-0 text-[#574142] text-[14px] whitespace-nowrap">
        <p className="leading-[20px] mb-0">Mantenha citações</p>
        <p className="leading-[20px] mb-0">académicas onde</p>
        <p className="leading-[20px]">aplicável.</p>
      </div>
    </div>
  );
}

function Container9() {
  return (
    <div className="content-stretch flex flex-col items-start relative self-stretch shrink-0" data-name="Container">
      <div className="flex flex-col font-['Source_Sans_3:Bold',sans-serif] font-bold justify-center leading-[0] relative shrink-0 text-[#6b0119] text-[14px] whitespace-nowrap">
        <p className="leading-[20px]">02.</p>
      </div>
    </div>
  );
}

function Item1() {
  return (
    <div className="content-stretch flex gap-[12px] items-start relative shrink-0 w-full" data-name="Item">
      <Container9 />
      <div className="flex flex-col font-['Source_Sans_3:Regular',sans-serif] font-normal justify-center leading-[0] relative shrink-0 text-[#574142] text-[14px] whitespace-nowrap">
        <p className="leading-[20px] mb-0">Foque em fontes</p>
        <p className="leading-[20px] mb-0">primárias históricas e</p>
        <p className="leading-[20px]">económicas.</p>
      </div>
    </div>
  );
}

function Container10() {
  return (
    <div className="content-stretch flex flex-col items-start relative self-stretch shrink-0" data-name="Container">
      <div className="flex flex-col font-['Source_Sans_3:Bold',sans-serif] font-bold justify-center leading-[0] relative shrink-0 text-[#6b0119] text-[14px] whitespace-nowrap">
        <p className="leading-[20px]">03.</p>
      </div>
    </div>
  );
}

function Item2() {
  return (
    <div className="content-stretch flex gap-[12px] items-start relative shrink-0 w-full" data-name="Item">
      <Container10 />
      <div className="flex flex-col font-['Source_Sans_3:Regular',sans-serif] font-normal justify-center leading-[0] relative shrink-0 text-[#574142] text-[14px] whitespace-nowrap">
        <p className="leading-[20px] mb-0">Respeite a propriedade</p>
        <p className="leading-[20px]">intelectual do repositório.</p>
      </div>
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

function Background() {
  return (
    <div className="bg-[#eff4ff] relative rounded-[4px] shrink-0 w-full" data-name="Background">
      <div className="content-stretch flex flex-col gap-[24px] items-start p-[32px] relative size-full">
        <Heading2 />
        <List />
      </div>
    </div>
  );
}

function Heading3() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0 w-full" data-name="Heading 3">
      <div className="flex flex-col font-['IBM_Plex_Sans:Bold',sans-serif] font-bold justify-center leading-[0] relative shrink-0 text-[#6b0119] text-[12px] tracking-[1.2px] uppercase w-full" style={{ fontVariationSettings: "'wdth' 100" }}>
        <p className="leading-[16px]">PESQUISAS EM DESTAQUE</p>
      </div>
    </div>
  );
}

function Container13() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0 w-full" data-name="Container">
      <div className="flex flex-col font-['Source_Sans_3:Regular',sans-serif] font-normal justify-center leading-[0] relative shrink-0 text-[#8b7171] text-[10px] w-full">
        <p className="leading-[15px]">12 Mar 1975</p>
      </div>
    </div>
  );
}

function Heading4() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0 w-full" data-name="Heading 4">
      <div className="flex flex-col font-['Source_Sans_3:Bold',sans-serif] font-bold justify-center leading-[0] relative shrink-0 text-[#121c2a] text-[16px] w-full">
        <p className="leading-[22px] mb-0">Os documentos fundadores do BNA</p>
        <p className="leading-[22px]">e a política fiscal inicial.</p>
      </div>
    </div>
  );
}

function Link2() {
  return (
    <div className="content-stretch flex flex-col gap-[4px] items-start relative shrink-0 w-full" data-name="Link">
      <Container13 />
      <Heading4 />
    </div>
  );
}

function Container14() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0 w-full" data-name="Container">
      <div className="flex flex-col font-['Source_Sans_3:Regular',sans-serif] font-normal justify-center leading-[0] relative shrink-0 text-[#8b7171] text-[10px] w-full">
        <p className="leading-[15px]">08 Fev 1982</p>
      </div>
    </div>
  );
}

function Heading5() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0 w-full" data-name="Heading 4">
      <div className="flex flex-col font-['Source_Sans_3:Bold',sans-serif] font-bold justify-center leading-[0] relative shrink-0 text-[#121c2a] text-[16px] w-full">
        <p className="leading-[22px] mb-0">Mudanças monetárias durante o</p>
        <p className="leading-[22px]">período de transição.</p>
      </div>
    </div>
  );
}

function Link3() {
  return (
    <div className="content-stretch flex flex-col gap-[4px] items-start relative shrink-0 w-full" data-name="Link">
      <Container14 />
      <Heading5 />
    </div>
  );
}

function Container15() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0 w-full" data-name="Container">
      <div className="flex flex-col font-['Source_Sans_3:Regular',sans-serif] font-normal justify-center leading-[0] relative shrink-0 text-[#8b7171] text-[10px] w-full">
        <p className="leading-[15px]">22 Nov 1990</p>
      </div>
    </div>
  );
}

function Heading6() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0 w-full" data-name="Heading 4">
      <div className="flex flex-col font-['Source_Sans_3:Bold',sans-serif] font-bold justify-center leading-[0] relative shrink-0 text-[#121c2a] text-[16px] w-full">
        <p className="leading-[22px] mb-0">Linhas de crédito garantidas por</p>
        <p className="leading-[22px]">petróleo: Uma análise histórica.</p>
      </div>
    </div>
  );
}

function Link4() {
  return (
    <div className="content-stretch flex flex-col gap-[4px] items-start relative shrink-0 w-full" data-name="Link">
      <Container15 />
      <Heading6 />
    </div>
  );
}

function Container12() {
  return (
    <div className="content-stretch flex flex-col gap-[24px] items-start relative shrink-0 w-full" data-name="Container">
      <Link2 />
      <Link3 />
      <Link4 />
    </div>
  );
}

function Container11() {
  return (
    <div className="content-stretch flex flex-col gap-[24px] items-start relative shrink-0 w-full" data-name="Container">
      <Heading3 />
      <Container12 />
    </div>
  );
}

function AsideSidebarCommunityMetadata() {
  return (
    <div className="col-[1/span_3] content-stretch flex flex-col gap-[48px] items-start justify-self-stretch pb-[340px] relative row-1 self-start shrink-0" data-name="Aside - Sidebar: Community Metadata">
      <Background />
      <Container11 />
    </div>
  );
}

function Button2() {
  return (
    <div className="absolute content-stretch flex flex-col items-center justify-center left-0 pb-[26px] pt-[8px] top-0" data-name="Button">
      <div aria-hidden="true" className="absolute border-[#6b0119] border-b-2 border-solid inset-0 pointer-events-none" />
      <div className="flex flex-col font-['Source_Sans_3:Bold',sans-serif] font-bold justify-center leading-[0] relative shrink-0 text-[#6b0119] text-[14px] text-center whitespace-nowrap">
        <p className="leading-[20px]">Atividades Recentes</p>
      </div>
    </div>
  );
}

function ButtonMargin() {
  return (
    <div className="h-[36px] relative shrink-0 w-[123.55px]" data-name="Button:margin">
      <Button2 />
    </div>
  );
}

function Button3() {
  return (
    <div className="content-stretch flex flex-col items-center justify-center pb-[16px] relative shrink-0" data-name="Button">
      <div className="flex flex-col font-['Source_Sans_3:Medium',sans-serif] font-medium justify-center leading-[0] relative shrink-0 text-[#574142] text-[14px] text-center whitespace-nowrap">
        <p className="leading-[20px]">Mais Discutidos</p>
      </div>
    </div>
  );
}

function Button4() {
  return (
    <div className="content-stretch flex flex-col items-center justify-center pb-[16px] relative shrink-0" data-name="Button">
      <div className="flex flex-col font-['Source_Sans_3:Medium',sans-serif] font-medium justify-center leading-[0] relative shrink-0 text-[#574142] text-[14px] text-center whitespace-nowrap">
        <p className="leading-[20px]">Fixados</p>
      </div>
    </div>
  );
}

function Container16() {
  return (
    <div className="relative shrink-0" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex gap-[32px] items-start relative size-full">
        <ButtonMargin />
        <Button3 />
        <Button4 />
      </div>
    </div>
  );
}

function Container18() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0" data-name="Container">
      <div className="flex flex-col font-['Source_Sans_3:Bold',sans-serif] font-bold justify-center leading-[0] relative shrink-0 text-[#8b7171] text-[12px] tracking-[1.2px] uppercase whitespace-nowrap">
        <p className="leading-[16px]">ORDENAR POR: RECENTES</p>
      </div>
    </div>
  );
}

function Container19() {
  return (
    <div className="h-[4.317px] relative shrink-0 w-[7px]" data-name="Container">
      <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 7 4.31667">
        <g id="Container">
          <path d={svgPaths.p1a9c9340} fill="var(--fill-0, #8B7171)" id="Icon" />
        </g>
      </svg>
    </div>
  );
}

function Container17() {
  return (
    <div className="relative shrink-0" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex gap-[7.99px] items-center relative size-full">
        <Container18 />
        <Container19 />
      </div>
    </div>
  );
}

function HorizontalBorder() {
  return (
    <div className="content-stretch flex items-center justify-between pb-[17px] relative shrink-0 w-full" data-name="HorizontalBorder">
      <div aria-hidden="true" className="absolute border-[rgba(222,191,191,0.2)] border-b border-solid inset-0 pointer-events-none" />
      <Container16 />
      <Container17 />
    </div>
  );
}

function Background1() {
  return (
    <div className="bg-[#8b1e2d] content-stretch flex items-center justify-center pb-[10.5px] pt-[9.5px] relative rounded-[4px] shrink-0 size-[48px]" data-name="Background">
      <div className="flex flex-col font-['Source_Sans_3:Bold',sans-serif] font-bold justify-center leading-[0] relative shrink-0 text-[18px] text-center text-white whitespace-nowrap">
        <p className="leading-[28px]">JJ</p>
      </div>
    </div>
  );
}

function Background2() {
  return (
    <div className="bg-[#acf0e0] content-stretch flex flex-col items-start px-[8px] py-[2px] relative rounded-[2px] shrink-0" data-name="Background">
      <div className="flex flex-col font-['Source_Sans_3:Bold',sans-serif] font-bold justify-center leading-[0] relative shrink-0 text-[#003a32] text-[12px] tracking-[-0.6px] uppercase whitespace-nowrap">
        <p className="leading-[16px]">ANÁLISE DE POLÍTICAS</p>
      </div>
    </div>
  );
}

function Container22() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0" data-name="Container">
      <div className="flex flex-col font-['Source_Sans_3:Italic',sans-serif] font-normal italic justify-center leading-[0] relative shrink-0 text-[#8b7171] text-[12px] whitespace-nowrap">
        <p className="leading-[16px]">por Jofre Jaime • há 2 horas</p>
      </div>
    </div>
  );
}

function Container21() {
  return (
    <div className="content-stretch flex gap-[12px] items-center relative shrink-0 w-full" data-name="Container">
      <Background2 />
      <Container22 />
    </div>
  );
}

function Heading1() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0 w-full" data-name="Heading 2">
      <div className="flex flex-col font-['IBM_Plex_Sans:Bold',sans-serif] font-bold justify-center leading-[0] relative shrink-0 text-[#121c2a] text-[24px] tracking-[-0.48px] w-full" style={{ fontVariationSettings: "'wdth' 100" }}>
        <p className="leading-[32px]">Análise da Reforma Monetária de 1976: A Transição do Kwanza</p>
      </div>
    </div>
  );
}

function Container23() {
  return (
    <div className="content-stretch flex flex-col items-start max-w-[768px] overflow-clip pt-[4px] relative shrink-0 w-full" data-name="Container">
      <div className="flex flex-col font-['Source_Sans_3:Regular',sans-serif] font-normal justify-center leading-[0] relative shrink-0 text-[#574142] text-[16px] w-full">
        <p className="leading-[24px] mb-0">Procuro fontes primárias sobre a logística da troca de moeda em 1976 nas províncias do leste. O arquivo</p>
        <p className="leading-[24px]">contém contagens regionais específicas de Moxico?</p>
      </div>
    </div>
  );
}

function Container26() {
  return (
    <div className="relative shrink-0 size-[15px]" data-name="Container">
      <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 15 15">
        <g id="Container">
          <path d={svgPaths.p7731200} fill="var(--fill-0, #8B7171)" id="Icon" />
        </g>
      </svg>
    </div>
  );
}

function Container27() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0" data-name="Container">
      <div className="flex flex-col font-['Source_Sans_3:Medium',sans-serif] font-medium justify-center leading-[0] relative shrink-0 text-[#8b7171] text-[14px] whitespace-nowrap">
        <p className="leading-[20px]">24 Respostas</p>
      </div>
    </div>
  );
}

function Container25() {
  return (
    <div className="content-stretch flex gap-[8px] items-center relative shrink-0" data-name="Container">
      <Container26 />
      <Container27 />
    </div>
  );
}

function Container29() {
  return (
    <div className="h-[11.25px] relative shrink-0 w-[16.5px]" data-name="Container">
      <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 16.5 11.25">
        <g id="Container">
          <path d={svgPaths.p110cf380} fill="var(--fill-0, #8B7171)" id="Icon" />
        </g>
      </svg>
    </div>
  );
}

function Container30() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0" data-name="Container">
      <div className="flex flex-col font-['Source_Sans_3:Medium',sans-serif] font-medium justify-center leading-[0] relative shrink-0 text-[#8b7171] text-[14px] whitespace-nowrap">
        <p className="leading-[20px]">1.2k Visualizações</p>
      </div>
    </div>
  );
}

function Container28() {
  return (
    <div className="content-stretch flex gap-[8px] items-center relative shrink-0" data-name="Container">
      <Container29 />
      <Container30 />
    </div>
  );
}

function Container32() {
  return (
    <div className="h-[15px] relative shrink-0 w-[13.5px]" data-name="Container">
      <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 13.5 15">
        <g id="Container">
          <path d={svgPaths.p2a676800} fill="var(--fill-0, #8B7171)" id="Icon" />
        </g>
      </svg>
    </div>
  );
}

function Container33() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0" data-name="Container">
      <div className="flex flex-col font-['Source_Sans_3:Medium',sans-serif] font-medium justify-center leading-[0] relative shrink-0 text-[#8b7171] text-[14px] whitespace-nowrap">
        <p className="leading-[20px]">Exportar Citações</p>
      </div>
    </div>
  );
}

function Container31() {
  return (
    <div className="content-stretch flex gap-[8px] items-center relative shrink-0" data-name="Container">
      <Container32 />
      <Container33 />
    </div>
  );
}

function Container24() {
  return (
    <div className="content-stretch flex gap-[32px] items-center pt-[16px] relative shrink-0 w-full" data-name="Container">
      <Container25 />
      <Container28 />
      <Container31 />
    </div>
  );
}

function Container20() {
  return (
    <div className="content-stretch flex flex-[1_0_0] flex-col gap-[8px] items-start min-w-px relative" data-name="Container">
      <Container21 />
      <Heading1 />
      <Container23 />
      <Container24 />
    </div>
  );
}

function Card() {
  return (
    <div className="bg-white relative shrink-0 w-full" data-name="Card 1">
      <div className="content-stretch flex gap-[32px] items-start p-[32px] relative size-full">
        <Background1 />
        <Container20 />
      </div>
    </div>
  );
}

function Background3() {
  return (
    <div className="bg-[#894d50] content-stretch flex items-center justify-center pb-[10.5px] pt-[9.5px] relative rounded-[4px] shrink-0 size-[48px]" data-name="Background">
      <div className="flex flex-col font-['Source_Sans_3:Bold',sans-serif] font-bold justify-center leading-[0] relative shrink-0 text-[18px] text-center text-white whitespace-nowrap">
        <p className="leading-[28px]">CM</p>
      </div>
    </div>
  );
}

function Background4() {
  return (
    <div className="bg-[#acf0e0] content-stretch flex flex-col items-start px-[8px] py-[2px] relative rounded-[2px] shrink-0" data-name="Background">
      <div className="flex flex-col font-['Source_Sans_3:Bold',sans-serif] font-bold justify-center leading-[0] relative shrink-0 text-[#005046] text-[12px] tracking-[-0.6px] uppercase whitespace-nowrap">
        <p className="leading-[16px]">INFRAESTRUTURA</p>
      </div>
    </div>
  );
}

function Container36() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0" data-name="Container">
      <div className="flex flex-col font-['Source_Sans_3:Italic',sans-serif] font-normal italic justify-center leading-[0] relative shrink-0 text-[#8b7171] text-[12px] whitespace-nowrap">
        <p className="leading-[16px]">por Cristina Mazebo • há 6 horas</p>
      </div>
    </div>
  );
}

function Container35() {
  return (
    <div className="content-stretch flex gap-[12px] items-center relative shrink-0 w-full" data-name="Container">
      <Background4 />
      <Container36 />
    </div>
  );
}

function Heading7() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0 w-full" data-name="Heading 2">
      <div className="flex flex-col font-['IBM_Plex_Sans:Bold',sans-serif] font-bold justify-center leading-[0] relative shrink-0 text-[#121c2a] text-[24px] tracking-[-0.48px] w-full" style={{ fontVariationSettings: "'wdth' 100" }}>
        <p className="leading-[32px] mb-0">Impacto Económico do Caminho de Ferro no Corredor de Benguela</p>
        <p className="leading-[32px]">(1950-1970)</p>
      </div>
    </div>
  );
}

function Container37() {
  return (
    <div className="content-stretch flex flex-col items-start max-w-[768px] overflow-clip pt-[4px] relative shrink-0 w-full" data-name="Container">
      <div className="flex flex-col font-['Source_Sans_3:Regular',sans-serif] font-normal justify-center leading-[0] relative shrink-0 text-[#574142] text-[16px] w-full">
        <p className="leading-[24px] mb-0">Carreguei um conjunto de manifestos de carga digitalizados do porto do Lobito. Estes mostram um aumento</p>
        <p className="leading-[24px]">significativo no trânsito de cobre pouco antes do movimento de independência ganhar força.</p>
      </div>
    </div>
  );
}

function Container40() {
  return (
    <div className="relative shrink-0 size-[15px]" data-name="Container">
      <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 15 15">
        <g id="Container">
          <path d={svgPaths.p7731200} fill="var(--fill-0, #8B7171)" id="Icon" />
        </g>
      </svg>
    </div>
  );
}

function Container41() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0" data-name="Container">
      <div className="flex flex-col font-['Source_Sans_3:Medium',sans-serif] font-medium justify-center leading-[0] relative shrink-0 text-[#8b7171] text-[14px] whitespace-nowrap">
        <p className="leading-[20px]">8 Respostas</p>
      </div>
    </div>
  );
}

function Container39() {
  return (
    <div className="content-stretch flex gap-[8px] items-center relative shrink-0" data-name="Container">
      <Container40 />
      <Container41 />
    </div>
  );
}

function Container43() {
  return (
    <div className="h-[11.25px] relative shrink-0 w-[16.5px]" data-name="Container">
      <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 16.5 11.25">
        <g id="Container">
          <path d={svgPaths.p110cf380} fill="var(--fill-0, #8B7171)" id="Icon" />
        </g>
      </svg>
    </div>
  );
}

function Container44() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0" data-name="Container">
      <div className="flex flex-col font-['Source_Sans_3:Medium',sans-serif] font-medium justify-center leading-[0] relative shrink-0 text-[#8b7171] text-[14px] whitespace-nowrap">
        <p className="leading-[20px]">450 Visualizações</p>
      </div>
    </div>
  );
}

function Container42() {
  return (
    <div className="content-stretch flex gap-[8px] items-center relative shrink-0" data-name="Container">
      <Container43 />
      <Container44 />
    </div>
  );
}

function Container46() {
  return (
    <div className="h-[9.375px] relative shrink-0 w-[15px]" data-name="Container">
      <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 15 9.375">
        <g id="Container">
          <path d={svgPaths.p12056000} fill="var(--fill-0, #8B7171)" id="Icon" />
        </g>
      </svg>
    </div>
  );
}

function Container47() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0" data-name="Container">
      <div className="flex flex-col font-['Source_Sans_3:Medium',sans-serif] font-medium justify-center leading-[0] relative shrink-0 text-[#8b7171] text-[14px] whitespace-nowrap">
        <p className="leading-[20px]">3 Conjuntos de Dados</p>
      </div>
    </div>
  );
}

function Container45() {
  return (
    <div className="content-stretch flex gap-[8px] items-center relative shrink-0" data-name="Container">
      <Container46 />
      <Container47 />
    </div>
  );
}

function Container38() {
  return (
    <div className="content-stretch flex gap-[32px] items-center pt-[16px] relative shrink-0 w-full" data-name="Container">
      <Container39 />
      <Container42 />
      <Container45 />
    </div>
  );
}

function Container34() {
  return (
    <div className="content-stretch flex flex-[1_0_0] flex-col gap-[8px] items-start min-w-px relative" data-name="Container">
      <Container35 />
      <Heading7 />
      <Container37 />
      <Container38 />
    </div>
  );
}

function Card1() {
  return (
    <div className="bg-white relative shrink-0 w-full" data-name="Card 2">
      <div className="content-stretch flex gap-[32px] items-start p-[32px] relative size-full">
        <Background3 />
        <Container34 />
      </div>
    </div>
  );
}

function Background5() {
  return (
    <div className="bg-[#8b7171] content-stretch flex items-center justify-center pb-[10.5px] pt-[9.5px] relative rounded-[4px] shrink-0 size-[48px]" data-name="Background">
      <div className="flex flex-col font-['Source_Sans_3:Bold',sans-serif] font-bold justify-center leading-[0] relative shrink-0 text-[18px] text-center text-white whitespace-nowrap">
        <p className="leading-[28px]">MK</p>
      </div>
    </div>
  );
}

function Background6() {
  return (
    <div className="bg-[#ffdada] content-stretch flex flex-col items-start px-[8px] py-[2px] relative rounded-[2px] shrink-0" data-name="Background">
      <div className="flex flex-col font-['Source_Sans_3:Bold',sans-serif] font-bold justify-center leading-[0] relative shrink-0 text-[#6d3639] text-[12px] tracking-[-0.6px] uppercase whitespace-nowrap">
        <p className="leading-[16px]">AGRICULTURA</p>
      </div>
    </div>
  );
}

function Container50() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0" data-name="Container">
      <div className="flex flex-col font-['Source_Sans_3:Italic',sans-serif] font-normal italic justify-center leading-[0] relative shrink-0 text-[#8b7171] text-[12px] whitespace-nowrap">
        <p className="leading-[16px]">por Manuel Katito • há 1 dia</p>
      </div>
    </div>
  );
}

function Container49() {
  return (
    <div className="content-stretch flex gap-[12px] items-center relative shrink-0 w-full" data-name="Container">
      <Background6 />
      <Container50 />
    </div>
  );
}

function Heading8() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0 w-full" data-name="Heading 2">
      <div className="flex flex-col font-['IBM_Plex_Sans:Bold',sans-serif] font-bold justify-center leading-[0] relative shrink-0 text-[#121c2a] text-[24px] tracking-[-0.48px] w-full" style={{ fontVariationSettings: "'wdth' 100" }}>
        <p className="leading-[32px] mb-0">Produção de Café e Quotas de Exportação sob a Administração</p>
        <p className="leading-[32px]">Colonial tardia</p>
      </div>
    </div>
  );
}

function Container51() {
  return (
    <div className="content-stretch flex flex-col items-start max-w-[768px] overflow-clip pt-[4px] relative shrink-0 w-full" data-name="Container">
      <div className="flex flex-col font-['Source_Sans_3:Regular',sans-serif] font-normal justify-center leading-[0] relative shrink-0 text-[#574142] text-[16px] w-full">
        <p className="leading-[24px] mb-0">Discussão sobre a mudança de plantações familiares para propriedades industriais na província do Uíge e o</p>
        <p className="leading-[24px]">subsequente vácuo económico criado pós-1975.</p>
      </div>
    </div>
  );
}

function Container54() {
  return (
    <div className="relative shrink-0 size-[15px]" data-name="Container">
      <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 15 15">
        <g id="Container">
          <path d={svgPaths.p7731200} fill="var(--fill-0, #8B7171)" id="Icon" />
        </g>
      </svg>
    </div>
  );
}

function Container55() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0" data-name="Container">
      <div className="flex flex-col font-['Source_Sans_3:Medium',sans-serif] font-medium justify-center leading-[0] relative shrink-0 text-[#8b7171] text-[14px] whitespace-nowrap">
        <p className="leading-[20px]">56 Respostas</p>
      </div>
    </div>
  );
}

function Container53() {
  return (
    <div className="content-stretch flex gap-[8px] items-center relative shrink-0" data-name="Container">
      <Container54 />
      <Container55 />
    </div>
  );
}

function Container57() {
  return (
    <div className="h-[11.25px] relative shrink-0 w-[16.5px]" data-name="Container">
      <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 16.5 11.25">
        <g id="Container">
          <path d={svgPaths.p110cf380} fill="var(--fill-0, #8B7171)" id="Icon" />
        </g>
      </svg>
    </div>
  );
}

function Container58() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0" data-name="Container">
      <div className="flex flex-col font-['Source_Sans_3:Medium',sans-serif] font-medium justify-center leading-[0] relative shrink-0 text-[#8b7171] text-[14px] whitespace-nowrap">
        <p className="leading-[20px]">3.1k Visualizações</p>
      </div>
    </div>
  );
}

function Container56() {
  return (
    <div className="content-stretch flex gap-[8px] items-center relative shrink-0" data-name="Container">
      <Container57 />
      <Container58 />
    </div>
  );
}

function Container60() {
  return (
    <div className="h-[15.75px] relative shrink-0 w-[16.5px]" data-name="Container">
      <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 16.5 15.75">
        <g id="Container">
          <path d={svgPaths.pf8747d7} fill="var(--fill-0, #6B0119)" id="Icon" />
        </g>
      </svg>
    </div>
  );
}

function Container61() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0" data-name="Container">
      <div className="flex flex-col font-['Source_Sans_3:Bold',sans-serif] font-bold justify-center leading-[0] relative shrink-0 text-[#6b0119] text-[14px] whitespace-nowrap">
        <p className="leading-[20px]">Escolha da Equipa</p>
      </div>
    </div>
  );
}

function Container59() {
  return (
    <div className="content-stretch flex gap-[8px] items-center relative shrink-0" data-name="Container">
      <Container60 />
      <Container61 />
    </div>
  );
}

function Container52() {
  return (
    <div className="content-stretch flex gap-[32px] items-center pt-[16px] relative shrink-0 w-full" data-name="Container">
      <Container53 />
      <Container56 />
      <Container59 />
    </div>
  );
}

function Container48() {
  return (
    <div className="content-stretch flex flex-[1_0_0] flex-col gap-[8px] items-start min-w-px relative" data-name="Container">
      <Container49 />
      <Heading8 />
      <Container51 />
      <Container52 />
    </div>
  );
}

function Card2() {
  return (
    <div className="bg-white relative shrink-0 w-full" data-name="Card 3">
      <div className="content-stretch flex gap-[32px] items-start p-[32px] relative size-full">
        <Background5 />
        <Container48 />
      </div>
    </div>
  );
}

function TopicCardsFeed() {
  return (
    <div className="content-stretch flex flex-col gap-[16px] items-start relative shrink-0 w-full" data-name="Topic Cards Feed">
      <Card />
      <Card1 />
      <Card2 />
    </div>
  );
}

function Container63() {
  return (
    <div className="h-[13.4px] relative shrink-0 w-[12px]" data-name="Container">
      <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 12 13.4">
        <g id="Container">
          <path d={svgPaths.pd5e0180} fill="var(--fill-0, #6B0119)" id="Icon" />
        </g>
      </svg>
    </div>
  );
}

function Button5() {
  return (
    <div className="content-stretch flex gap-[8px] items-center relative shrink-0" data-name="Button">
      <div className="flex flex-col font-['Source_Sans_3:Bold',sans-serif] font-bold justify-center leading-[0] relative shrink-0 text-[#6b0119] text-[14px] text-center whitespace-nowrap">
        <p className="leading-[20px]">Carregar Histórico do Arquivo</p>
      </div>
      <Container63 />
    </div>
  );
}

function Container62() {
  return (
    <div className="content-stretch flex items-start justify-center pt-[16px] relative shrink-0 w-full" data-name="Container">
      <Button5 />
    </div>
  );
}

function MainDiscussionFeed() {
  return (
    <div className="col-[4/span_9] content-stretch flex flex-col gap-[32px] items-start justify-self-stretch relative row-1 self-start shrink-0" data-name="Main Discussion Feed">
      <HorizontalBorder />
      <TopicCardsFeed />
      <Container62 />
    </div>
  );
}

function MainContentAreaAsymmetricLayout() {
  return (
    <div className="gap-x-[64px] gap-y-[64px] grid grid-cols-[repeat(12,minmax(0,1fr))] grid-rows-[_961px] relative shrink-0 w-full" data-name="Main Content Area: Asymmetric Layout">
      <AsideSidebarCommunityMetadata />
      <MainDiscussionFeed />
    </div>
  );
}

function Main() {
  return (
    <div className="max-w-[1536px] relative shrink-0 w-full" data-name="Main">
      <div className="content-stretch flex flex-col gap-[64px] items-start max-w-[inherit] p-[48px] relative size-full">
        <CommunityHeroHeaderSection />
        <MainContentAreaAsymmetricLayout />
      </div>
    </div>
  );
}

function Heading9() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0 w-full" data-name="Heading 1">
      <div className="flex flex-col font-['Newsreader:Regular',sans-serif] font-normal justify-center leading-[0] relative shrink-0 text-[#6f0008] text-[60px] w-full">
        <p className="leading-[60px]">Categorias</p>
      </div>
    </div>
  );
}

function Container64() {
  return (
    <div className="content-stretch flex flex-col items-start max-w-[672px] relative shrink-0 w-[672px]" data-name="Container">
      <div className="flex flex-col font-['Inter:Regular',sans-serif] font-normal justify-center leading-[0] not-italic relative shrink-0 text-[#59413e] text-[18px] whitespace-nowrap">
        <p className="leading-[29.25px] mb-0">Um espaço de diálogo e rigor para historiadores, economistas e entusiastas.</p>
        <p className="leading-[29.25px]">Explore os fóruns temáticos e participe na construção do arquivo digital.</p>
      </div>
    </div>
  );
}

function HeaderHeroSection() {
  return (
    <div className="content-stretch flex flex-col gap-[24px] items-start relative shrink-0 w-full" data-name="Header - Hero Section">
      <Heading9 />
      <Container64 />
    </div>
  );
}

function Overlay() {
  return (
    <div className="bg-[rgba(111,0,8,0.1)] content-stretch flex items-start px-[12px] py-[4px] relative rounded-[12px] shrink-0" data-name="Overlay">
      <div className="flex flex-col font-['Inter:Regular',sans-serif] font-normal justify-center leading-[0] not-italic relative shrink-0 text-[#6f0008] text-[12px] tracking-[1.2px] whitespace-nowrap">
        <p className="leading-[16px]">DESTAQUE</p>
      </div>
    </div>
  );
}

function Heading10() {
  return (
    <div className="content-stretch flex flex-col items-start pt-[1.2px] relative shrink-0 w-full" data-name="Heading 2">
      <div className="flex flex-col font-['Newsreader:Regular',sans-serif] font-normal justify-center leading-[0] relative shrink-0 text-[#1b1c1b] text-[30px] w-full">
        <p className="leading-[36px]">História Monetária</p>
      </div>
    </div>
  );
}

function Container68() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0 w-full" data-name="Container">
      <div className="flex flex-col font-['Inter:Regular',sans-serif] font-normal justify-center leading-[0] not-italic relative shrink-0 text-[#59413e] text-[14px] w-full">
        <p className="leading-[22.75px] mb-0">Discussões sobre a evolução dos padrões</p>
        <p className="leading-[22.75px] mb-0">monetários, bancos centrais e o impacto das</p>
        <p className="leading-[22.75px]">moedas fiduciárias no desenvolvimento global.</p>
      </div>
    </div>
  );
}

function Container67() {
  return (
    <div className="content-stretch flex flex-col gap-[14.8px] items-start pb-[24px] relative shrink-0 w-full" data-name="Container">
      <Overlay />
      <Heading10 />
      <Container68 />
    </div>
  );
}

function Container71() {
  return (
    <div className="relative shrink-0 size-[11.667px]" data-name="Container">
      <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 11.6667 11.6667">
        <g id="Container">
          <path d={svgPaths.p2d08cd00} fill="var(--fill-0, #8C706D)" id="Icon" />
        </g>
      </svg>
    </div>
  );
}

function Container70() {
  return (
    <div className="content-stretch flex gap-[4px] items-center relative shrink-0" data-name="Container">
      <Container71 />
      <div className="flex flex-col font-['Inter:Regular',sans-serif] font-normal justify-center leading-[0] not-italic relative shrink-0 text-[#8c706d] text-[12px] whitespace-nowrap">
        <p className="leading-[16px]">1.2k Tópicos</p>
      </div>
    </div>
  );
}

function Container73() {
  return (
    <div className="h-[9.333px] relative shrink-0 w-[12.833px]" data-name="Container">
      <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 12.8333 9.33333">
        <g id="Container">
          <path d={svgPaths.p1d3af800} fill="var(--fill-0, #8C706D)" id="Icon" />
        </g>
      </svg>
    </div>
  );
}

function Container72() {
  return (
    <div className="content-stretch flex gap-[4px] items-center relative shrink-0" data-name="Container">
      <Container73 />
      <div className="flex flex-col font-['Inter:Regular',sans-serif] font-normal justify-center leading-[0] not-italic relative shrink-0 text-[#8c706d] text-[12px] whitespace-nowrap">
        <p className="leading-[16px]">4.8k Membros</p>
      </div>
    </div>
  );
}

function Container69() {
  return (
    <div className="content-stretch flex gap-[24px] items-center relative shrink-0 w-full" data-name="Container">
      <Container70 />
      <Container72 />
    </div>
  );
}

function Container66() {
  return (
    <div className="flex-[1_0_0] min-w-px relative self-stretch" data-name="Container">
      <div className="content-stretch flex flex-col items-start justify-between p-[32px] relative size-full">
        <Container67 />
        <Container69 />
      </div>
    </div>
  );
}

function HistoriaMonetaria() {
  return (
    <div className="absolute inset-[0_0.01px_0.3px_0]" data-name="História Monetária">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <img alt="" className="absolute h-[109.28%] left-0 max-w-none top-[-4.64%] w-full" src={imgHistoriaMonetaria} />
      </div>
    </div>
  );
}

function Container74() {
  return (
    <div className="flex-[1_0_0] min-w-px relative self-stretch" data-name="Container">
      <HistoriaMonetaria />
      <div className="absolute bg-[rgba(111,0,8,0.1)] inset-[0_0.01px_0.3px_0] mix-blend-multiply" data-name="Overlay" />
    </div>
  );
}

function Container65() {
  return (
    <div className="content-stretch flex h-[263.8px] items-start relative shrink-0 w-full" data-name="Container">
      <Container66 />
      <Container74 />
    </div>
  );
}

function CategoryCardHistoriaMonetariaLargeFeatured() {
  return (
    <div className="bg-[#f5f3f1] col-[1/span_8] content-stretch flex flex-col h-[263px] items-start justify-center justify-self-stretch overflow-clip relative rounded-[8px] row-1 self-start shrink-0" data-name="Category Card: História Monetária (Large Featured)">
      <Container65 />
    </div>
  );
}

function Heading11() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0 w-full" data-name="Heading 2">
      <div className="flex flex-col font-['Newsreader:Regular',sans-serif] font-normal justify-center leading-[0] relative shrink-0 text-[#1b1c1b] text-[24px] w-full">
        <p className="leading-[32px]">Infraestrutura</p>
      </div>
    </div>
  );
}

function Container76() {
  return (
    <div className="content-stretch flex flex-col items-start pb-[0.625px] relative shrink-0 w-full" data-name="Container">
      <div className="flex flex-col font-['Inter:Regular',sans-serif] font-normal justify-center leading-[0] not-italic relative shrink-0 text-[#59413e] text-[14px] w-full">
        <p className="leading-[22.75px] mb-0">Caminhos-de-ferro, portos e o esqueleto físico</p>
        <p className="leading-[22.75px]">da economia moderna.</p>
      </div>
    </div>
  );
}

function Container75() {
  return (
    <div className="relative shrink-0 w-full" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col gap-[10.875px] items-start relative size-full">
        <Heading11 />
        <Container76 />
      </div>
    </div>
  );
}

function Infraestrutura() {
  return (
    <div className="h-[128px] relative rounded-[4px] shrink-0 w-full" data-name="Infraestrutura">
      <div aria-hidden="true" className="absolute inset-0 pointer-events-none rounded-[4px]">
        <div className="absolute inset-0 overflow-hidden rounded-[4px]">
          <img alt="" className="absolute h-[245.83%] left-0 max-w-none top-[-72.91%] w-full" src={imgInfraestrutura} />
        </div>
        <div className="absolute bg-white inset-0 mix-blend-saturation rounded-[4px]" />
      </div>
    </div>
  );
}

function Container79() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0" data-name="Container">
      <div className="flex flex-col font-['Inter:Regular',sans-serif] font-normal justify-center leading-[0] not-italic relative shrink-0 text-[#6f0008] text-[12px] whitespace-nowrap">
        <p className="leading-[16px]">456 Tópicos</p>
      </div>
    </div>
  );
}

function Container80() {
  return (
    <div className="relative shrink-0 size-[16px]" data-name="Container">
      <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 16 16">
        <g id="Container">
          <path d={svgPaths.p1a406200} fill="var(--fill-0, #6F0008)" id="Icon" />
        </g>
      </svg>
    </div>
  );
}

function Container78() {
  return (
    <div className="relative shrink-0 w-full" data-name="Container">
      <div className="flex flex-row items-center size-full">
        <div className="content-stretch flex items-center justify-between relative size-full">
          <Container79 />
          <Container80 />
        </div>
      </div>
    </div>
  );
}

function Container77() {
  return (
    <div className="content-stretch flex flex-col gap-[16px] items-start relative shrink-0 w-full" data-name="Container">
      <Infraestrutura />
      <Container78 />
    </div>
  );
}

function Margin() {
  return (
    <div className="relative shrink-0 w-full" data-name="Margin">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col items-start pt-[32px] relative size-full">
        <Container77 />
      </div>
    </div>
  );
}

function CategoryCardInfraestruturaSquare() {
  return (
    <div className="bg-[#f5f3f1] col-[9/span_4] justify-self-stretch relative rounded-[8px] row-1 self-start shrink-0" data-name="Category Card: Infraestrutura (Square)">
      <div aria-hidden="true" className="absolute border-[rgba(111,0,8,0.2)] border-solid border-t-4 inset-0 pointer-events-none rounded-[8px]" />
      <div className="content-stretch flex flex-col items-start justify-between pb-[32px] pt-[36px] px-[32px] relative size-full">
        <Container75 />
        <Margin />
      </div>
    </div>
  );
}

function Paragraph() {
  return (
    <div className="relative shrink-0 w-full" data-name="Paragraph">
      <div className="content-stretch flex items-start justify-between relative size-full">
        <div className="flex flex-col font-['Newsreader:Regular',sans-serif] font-normal justify-center leading-[0] relative shrink-0 text-[#1b1c1b] text-[24px] whitespace-nowrap">
          <p className="leading-[32px]">Ciclo do Café</p>
        </div>
        <div className="h-[16px] relative shrink-0 w-[19.5px]" data-name="Icon">
          <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 19.5 16">
            <path d={svgPaths.p29002e00} fill="var(--fill-0, #8C706D)" id="Icon" />
          </svg>
        </div>
      </div>
    </div>
  );
}

function Margin1() {
  return (
    <div className="relative shrink-0 w-full" data-name="Margin">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col items-start pb-[24px] relative size-full">
        <Paragraph />
      </div>
    </div>
  );
}

function Container81() {
  return (
    <div className="absolute content-stretch flex flex-col items-start left-0 right-[0.01px] top-[-1.25px]" data-name="Container">
      <div className="flex flex-col font-['Inter:Regular',sans-serif] font-normal justify-center leading-[0] not-italic relative shrink-0 text-[#59413e] text-[14px] whitespace-nowrap">
        <p className="leading-[22.75px] mb-0">A economia de exportação e a transformação</p>
        <p className="leading-[22.75px] mb-0">social do século XIX. Uma análise profunda</p>
        <p className="leading-[22.75px]">sobre as fazendas e o trabalho.</p>
      </div>
    </div>
  );
}

function Margin2() {
  return (
    <div className="h-[92.25px] relative shrink-0 w-full" data-name="Margin">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
        <Container81 />
      </div>
    </div>
  );
}

function Margin4() {
  return (
    <div className="h-[32px] relative shrink-0 w-[24px]" data-name="Margin">
      <div className="absolute bg-[#d6d3d1] border-2 border-[#f5f3f1] border-solid left-[-8px] rounded-[12px] size-[32px] top-0" data-name="Background+Border" />
    </div>
  );
}

function Margin5() {
  return (
    <div className="h-[32px] relative shrink-0 w-[24px]" data-name="Margin">
      <div className="absolute bg-[#a8a29e] border-2 border-[#f5f3f1] border-solid left-[-8px] rounded-[12px] size-[32px] top-0" data-name="Background+Border" />
    </div>
  );
}

function Margin6() {
  return (
    <div className="content-stretch flex flex-col items-start pl-[8px] relative shrink-0" data-name="Margin">
      <div className="flex flex-col font-['Inter:Regular',sans-serif] font-normal justify-center leading-[0] not-italic relative shrink-0 text-[#8c706d] text-[10px] tracking-[0.5px] uppercase whitespace-nowrap">
        <p className="leading-[15px]">+230 ATIVOS</p>
      </div>
    </div>
  );
}

function Container82() {
  return (
    <div className="content-stretch flex items-center relative shrink-0 w-full" data-name="Container">
      <div className="bg-[#e7e5e4] relative rounded-[12px] shrink-0 size-[32px]" data-name="Background+Border">
        <div aria-hidden="true" className="absolute border-2 border-[#f5f3f1] border-solid inset-0 pointer-events-none rounded-[12px]" />
      </div>
      <Margin4 />
      <Margin5 />
      <Margin6 />
    </div>
  );
}

function Margin3() {
  return (
    <div className="h-[68px] min-h-[32px] relative shrink-0 w-full" data-name="Margin">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col items-start justify-end min-h-[inherit] pt-[36px] relative size-full">
        <Container82 />
      </div>
    </div>
  );
}

function CategoryCardCicloDoCafeAsymmetricHalf() {
  return (
    <div className="bg-[#f5f3f1] col-[1/span_4] justify-self-stretch relative rounded-[8px] row-2 self-start shrink-0" data-name="Category Card: Ciclo do Café (Asymmetric Half)">
      <div aria-hidden="true" className="absolute border-[rgba(224,191,187,0.3)] border-b-4 border-solid inset-0 pointer-events-none rounded-[8px]" />
      <div className="content-stretch flex flex-col items-start justify-between pb-[36px] pt-[32px] px-[32px] relative size-full">
        <Margin1 />
        <Margin2 />
        <Margin3 />
      </div>
    </div>
  );
}

function Heading12() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0 w-full" data-name="Heading 2">
      <div className="flex flex-col font-['Newsreader:Regular',sans-serif] font-normal justify-center leading-[0] relative shrink-0 text-[#1b1c1b] text-[24px] w-full">
        <p className="leading-[32px]">Pensamento Económico</p>
      </div>
    </div>
  );
}

function Heading2Margin() {
  return (
    <div className="relative shrink-0 w-full" data-name="Heading 2:margin">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col items-start pb-[12px] relative size-full">
        <Heading12 />
      </div>
    </div>
  );
}

function Container83() {
  return (
    <div className="absolute content-stretch flex flex-col items-start left-0 pb-[0.625px] right-[0.01px] top-[-1.13px]" data-name="Container">
      <div className="flex flex-col font-['Inter:Regular',sans-serif] font-normal justify-center leading-[0] not-italic relative shrink-0 text-[#59413e] text-[14px] whitespace-nowrap">
        <p className="leading-[22.75px] mb-0">De Adam Smith às teorias contemporâneas. O</p>
        <p className="leading-[22.75px]">debate filosófico por trás dos números.</p>
      </div>
    </div>
  );
}

function Margin7() {
  return (
    <div className="h-[69.5px] relative shrink-0 w-full" data-name="Margin">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
        <Container83 />
      </div>
    </div>
  );
}

function Container85() {
  return (
    <div className="h-[30px] relative shrink-0 w-[28.518px]" data-name="Container">
      <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 28.5176 30">
        <g id="Container">
          <path d={svgPaths.p2214e800} fill="var(--fill-0, #6F0008)" fillOpacity="0.4" id="Icon" />
        </g>
      </svg>
    </div>
  );
}

function Background7() {
  return (
    <div className="bg-[#e4e2e0] col-1 content-stretch flex h-[96px] items-center justify-center justify-self-stretch relative rounded-[4px] row-1 shrink-0" data-name="Background">
      <Container85 />
    </div>
  );
}

function Container86() {
  return (
    <div className="h-[28.5px] relative shrink-0 w-[30px]" data-name="Container">
      <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 30 28.5">
        <g id="Container">
          <path d={svgPaths.pec96580} fill="var(--fill-0, #6F0008)" fillOpacity="0.4" id="Icon" />
        </g>
      </svg>
    </div>
  );
}

function Background8() {
  return (
    <div className="bg-[#e4e2e0] col-2 content-stretch flex h-[96px] items-center justify-center justify-self-stretch relative rounded-[4px] row-1 shrink-0" data-name="Background">
      <Container86 />
    </div>
  );
}

function Container84() {
  return (
    <div className="relative shrink-0 w-full" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid gap-x-[8px] gap-y-[8px] grid grid-cols-[repeat(2,minmax(0,1fr))] grid-rows-[_96px] relative size-full">
        <Background7 />
        <Background8 />
      </div>
    </div>
  );
}

function CategoryCardPensamentoEconomico() {
  return (
    <div className="bg-[#f5f3f1] col-[9/span_4] justify-self-stretch relative rounded-[8px] row-2 self-start shrink-0" data-name="Category Card: Pensamento Económico">
      <div aria-hidden="true" className="absolute border-[rgba(111,0,8,0.1)] border-r-4 border-solid inset-0 pointer-events-none rounded-[8px]" />
      <div className="content-stretch flex flex-col items-start pb-[42.75px] pl-[32px] pr-[36px] pt-[32px] relative size-full">
        <Heading2Margin />
        <Margin7 />
        <Container84 />
      </div>
    </div>
  );
}

function Container89() {
  return (
    <div className="h-[21px] relative shrink-0 w-[16px]" data-name="Container">
      <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 16 21">
        <g id="Container">
          <path d={svgPaths.p7a6eda0} fill="var(--fill-0, #6F0008)" id="Icon" />
        </g>
      </svg>
    </div>
  );
}

function Heading13() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0" data-name="Heading 2">
      <div className="flex flex-col font-['Newsreader:Regular',sans-serif] font-normal justify-center leading-[0] relative shrink-0 text-[#1b1c1b] text-[24px] whitespace-nowrap">
        <p className="leading-[32px]">Data Hub: Séries Históricas</p>
      </div>
    </div>
  );
}

function Container88() {
  return (
    <div className="content-stretch flex gap-[12px] items-center relative shrink-0 w-full" data-name="Container">
      <Container89 />
      <Heading13 />
    </div>
  );
}

function Container90() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0 w-full" data-name="Container">
      <div className="flex flex-col font-['Inter:Regular',sans-serif] font-normal justify-center leading-[0] not-italic relative shrink-0 text-[#59413e] text-[14px] w-full">
        <p className="leading-[20px] mb-0">Base de dados bruta com estatísticas vitais, censos e balanças comerciais desde 1822. Disponível para</p>
        <p className="leading-[20px]">utilizadores registados com perfil validado.</p>
      </div>
    </div>
  );
}

function Container87() {
  return (
    <div className="flex-[1_0_0] min-w-px relative" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col gap-[8px] items-start relative size-full">
        <Container88 />
        <Container90 />
      </div>
    </div>
  );
}

function Button6() {
  return (
    <div className="content-stretch flex items-center justify-center px-[33px] py-[13px] relative rounded-[12px] shrink-0" data-name="Button">
      <div aria-hidden="true" className="absolute border border-[#6f0008] border-solid inset-0 pointer-events-none rounded-[12px]" />
      <div className="flex flex-col font-['Inter:Regular',sans-serif] font-normal justify-center leading-[0] not-italic relative shrink-0 text-[#6f0008] text-[14px] text-center whitespace-nowrap">
        <p className="leading-[20px]">Ver Requisitos de Acesso</p>
      </div>
    </div>
  );
}

function Container91() {
  return (
    <div className="relative shrink-0" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col items-start relative size-full">
        <Button6 />
      </div>
    </div>
  );
}

function CategoryCardEstatisticasHistoricasLocked() {
  return (
    <div className="bg-white col-[1/span_12] drop-shadow-[0px_1px_1px_rgba(0,0,0,0.05)] h-[146px] justify-self-stretch relative rounded-[8px] row-3 shrink-0" data-name="Category Card: Estatísticas Históricas (Locked)">
      <div aria-hidden="true" className="absolute border border-[rgba(224,191,187,0.2)] border-solid inset-0 pointer-events-none rounded-[8px]" />
      <div className="flex flex-row items-center size-full">
        <div className="content-stretch flex items-center justify-between p-[33px] relative size-full">
          <Container87 />
          <Container91 />
        </div>
      </div>
    </div>
  );
}

function BackgroundDecorativeElement() {
  return (
    <div className="absolute bottom-[-32.45px] h-[156px] right-[-32px] w-[176px]" data-name="Background decorative element">
      <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 176 156">
        <g id="Background decorative element" opacity="0.1">
          <path d={svgPaths.pc079bc0} fill="var(--fill-0, white)" id="Icon" />
        </g>
      </svg>
    </div>
  );
}

function Container94() {
  return (
    <div className="h-[21px] relative shrink-0 w-[16px]" data-name="Container">
      <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 16 21">
        <g id="Container">
          <path d={svgPaths.p7a6eda0} fill="var(--fill-0, #FDA49B)" id="Icon" />
        </g>
      </svg>
    </div>
  );
}

function Container95() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0" data-name="Container">
      <div className="flex flex-col font-['Inter:Regular',sans-serif] font-normal justify-center leading-[0] not-italic relative shrink-0 text-[#fda49b] text-[10px] tracking-[2px] uppercase whitespace-nowrap">
        <p className="leading-[15px]">ACESSO RESTRITO</p>
      </div>
    </div>
  );
}

function Container93() {
  return (
    <div className="content-stretch flex gap-[7.99px] items-center relative shrink-0 w-full" data-name="Container">
      <Container94 />
      <Container95 />
    </div>
  );
}

function Heading14() {
  return (
    <div className="content-stretch flex flex-col items-start pt-[5.2px] relative shrink-0 w-full" data-name="Heading 2">
      <div className="flex flex-col font-['Newsreader:Regular',sans-serif] font-normal justify-center leading-[0] relative shrink-0 text-[24px] text-white w-full">
        <p className="leading-[32px]">Textos com Jindungo</p>
      </div>
    </div>
  );
}

function Container96() {
  return (
    <div className="content-stretch flex flex-col items-start pb-[21.2px] relative shrink-0 w-full" data-name="Container">
      <div className="flex flex-col font-['Inter:Regular',sans-serif] font-normal justify-center leading-[0] not-italic relative shrink-0 text-[#89bff3] text-[14px] w-full">
        <p className="leading-[22.75px] mb-0">Manuscritos digitalizados e análises</p>
        <p className="leading-[22.75px] mb-0">econométricas exclusivas para membros</p>
        <p className="leading-[22.75px]">académicos e investigadores seniores.</p>
      </div>
    </div>
  );
}

function Button7() {
  return (
    <div className="bg-[#fda49b] content-stretch flex items-center justify-center px-[24px] py-[8px] relative rounded-[12px] shrink-0" data-name="Button">
      <div className="flex flex-col font-['Inter:Regular',sans-serif] font-normal justify-center leading-[0] not-italic relative shrink-0 text-[#783732] text-[14px] text-center whitespace-nowrap">
        <p className="leading-[20px]">Solicitar Acesso</p>
      </div>
    </div>
  );
}

function Container92() {
  return (
    <div className="content-stretch flex flex-col gap-[10.8px] items-start relative shrink-0 w-full" data-name="Container">
      <Container93 />
      <Heading14 />
      <Container96 />
      <Button7 />
    </div>
  );
}

function CategoryCardPremiumArchiveLockedPrivate() {
  return (
    <div className="bg-[#003758] col-[5/span_4] justify-self-stretch relative rounded-[8px] row-2 self-start shrink-0" data-name="Category Card: Premium Archive (Locked/Private)">
      <div className="overflow-clip rounded-[inherit] size-full">
        <div className="content-stretch flex flex-col items-start p-[32px] relative size-full">
          <BackgroundDecorativeElement />
          <Container92 />
        </div>
      </div>
    </div>
  );
}

function BentoGridLayoutForCategories() {
  return (
    <div className="gap-x-[24px] gap-y-[24px] grid grid-cols-[repeat(12,minmax(0,1fr))] grid-rows-[___357.50px_284.25px_146px] relative shrink-0 w-full" data-name="Bento Grid Layout for Categories">
      <CategoryCardHistoriaMonetariaLargeFeatured />
      <CategoryCardInfraestruturaSquare />
      <CategoryCardCicloDoCafeAsymmetricHalf />
      <CategoryCardPensamentoEconomico />
      <CategoryCardEstatisticasHistoricasLocked />
      <CategoryCardPremiumArchiveLockedPrivate />
    </div>
  );
}

function Categorias() {
  return (
    <div className="content-stretch flex flex-col gap-[64px] items-start max-w-[1440px] px-[48px] py-[64px] relative shrink-0 w-[1280px]" data-name="Categorias">
      <HeaderHeroSection />
      <BentoGridLayoutForCategories />
    </div>
  );
}

function Container98() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0 w-full" data-name="Container">
      <div className="flex flex-col font-['Source_Sans_3:Bold',sans-serif] font-bold justify-center leading-[0] relative shrink-0 text-[#0f172a] text-[18px] w-full">
        <p className="leading-[28px]">Arquivo Económico de Angola</p>
      </div>
    </div>
  );
}

function Container99() {
  return (
    <div className="content-stretch flex flex-col items-start max-w-[320px] relative shrink-0 w-full" data-name="Container">
      <div className="flex flex-col font-['Source_Sans_3:Regular',sans-serif] font-normal justify-center leading-[0] relative shrink-0 text-[#64748b] text-[14px] w-full">
        <p className="leading-[22.75px] mb-0">Preservando a narrativa histórica da jornada</p>
        <p className="leading-[22.75px] mb-0">económica de Angola para as futuras</p>
        <p className="leading-[22.75px] mb-0">gerações de académicos e decisores</p>
        <p className="leading-[22.75px]">políticos.</p>
      </div>
    </div>
  );
}

function Container97() {
  return (
    <div className="col-1 justify-self-stretch relative row-1 self-start shrink-0" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col gap-[24px] items-start pb-[1.5px] relative size-full">
        <Container98 />
        <Container99 />
      </div>
    </div>
  );
}

function Heading15() {
  return (
    <div className="absolute content-stretch flex flex-col items-start left-0 right-0 top-[-1px]" data-name="Heading 4">
      <div className="flex flex-col font-['Source_Sans_3:Bold',sans-serif] font-bold justify-center leading-[0] relative shrink-0 text-[#7f1d1d] text-[11px] tracking-[1.1px] uppercase whitespace-nowrap">
        <p className="leading-[16.5px]">NAVEGAÇÃO</p>
      </div>
    </div>
  );
}

function Heading4Margin() {
  return (
    <div className="h-[24.5px] relative shrink-0 w-full" data-name="Heading 4:margin">
      <Heading15 />
    </div>
  );
}

function Link5() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0 w-full" data-name="Link">
      <div className="flex flex-col font-['Source_Sans_3:Regular',sans-serif] font-normal justify-center leading-[0] relative shrink-0 text-[#64748b] text-[16px] w-full">
        <p className="leading-[24px]">Créditos Académicos</p>
      </div>
    </div>
  );
}

function Link6() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0 w-full" data-name="Link">
      <div className="flex flex-col font-['Source_Sans_3:Regular',sans-serif] font-normal justify-center leading-[0] relative shrink-0 text-[#64748b] text-[16px] w-full">
        <p className="leading-[24px]">Repositório Institucional</p>
      </div>
    </div>
  );
}

function Link7() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0 w-full" data-name="Link">
      <div className="flex flex-col font-['Source_Sans_3:Regular',sans-serif] font-normal justify-center leading-[0] relative shrink-0 text-[#64748b] text-[16px] w-full">
        <p className="leading-[24px]">Contactar Arquivo</p>
      </div>
    </div>
  );
}

function Container100() {
  return (
    <div className="col-2 justify-self-stretch relative row-1 self-start shrink-0" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col gap-[16px] items-start relative size-full">
        <Heading4Margin />
        <Link5 />
        <Link6 />
        <Link7 />
      </div>
    </div>
  );
}

function Heading16() {
  return (
    <div className="absolute content-stretch flex flex-col items-start left-0 right-0 top-[-1px]" data-name="Heading 4">
      <div className="flex flex-col font-['Source_Sans_3:Bold',sans-serif] font-bold justify-center leading-[0] relative shrink-0 text-[#7f1d1d] text-[11px] tracking-[1.1px] uppercase whitespace-nowrap">
        <p className="leading-[16.5px]">LEGAL</p>
      </div>
    </div>
  );
}

function Heading4Margin1() {
  return (
    <div className="h-[24.5px] relative shrink-0 w-full" data-name="Heading 4:margin">
      <Heading16 />
    </div>
  );
}

function Link8() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0 w-full" data-name="Link">
      <div className="flex flex-col font-['Source_Sans_3:Regular',sans-serif] font-normal justify-center leading-[0] relative shrink-0 text-[#64748b] text-[16px] w-full">
        <p className="leading-[24px]">Política de Privacidade</p>
      </div>
    </div>
  );
}

function Link9() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0 w-full" data-name="Link">
      <div className="flex flex-col font-['Source_Sans_3:Regular',sans-serif] font-normal justify-center leading-[0] relative shrink-0 text-[#64748b] text-[16px] w-full">
        <p className="leading-[24px]">Termos de Serviço</p>
      </div>
    </div>
  );
}

function Container101() {
  return (
    <div className="col-3 justify-self-stretch relative row-1 self-start shrink-0" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col gap-[16px] items-start pb-[40px] relative size-full">
        <Heading4Margin1 />
        <Link8 />
        <Link9 />
      </div>
    </div>
  );
}

function Heading17() {
  return (
    <div className="absolute content-stretch flex flex-col items-start left-0 right-0 top-[-1px]" data-name="Heading 4">
      <div className="flex flex-col font-['Source_Sans_3:Bold',sans-serif] font-bold justify-center leading-[0] relative shrink-0 text-[#7f1d1d] text-[11px] tracking-[1.1px] uppercase whitespace-nowrap">
        <p className="leading-[16.5px]">PARCERIA DE PRESERVAÇÃO</p>
      </div>
    </div>
  );
}

function Heading4Margin2() {
  return (
    <div className="h-[24.5px] relative shrink-0 w-full" data-name="Heading 4:margin">
      <Heading17 />
    </div>
  );
}

function Ab6AXuA0T17CjBmHyALwHqulueMvs8Kz32UT8DjWiv7Qy5CS1HCMi0SbaWp3Tijfi7LljqYzH9YNtidM9QGpgh0OwaPp5VWWucI6VBvt9Syon3TyEGxxmBcZasnqeTwPaDuxq5TJwMxfndtFn3SrJbY4Ts0Gjedn0NTfWSMtXdWalJc1IxwEjw4TrhQcwcGBrAxvwfhfSnXkDe6P9BilDw5LVa9H2Y5GcdYgWzq9WbC59Ifqh0RgcZjryxVt9GNtts4TamVni() {
  return (
    <div className="max-w-[128px] relative shrink-0 size-[128px]" data-name="AB6AXuA0T17cjBMHyALwHQULUEMvs8kz32uT8djWIV7QY5c-S1hCMi0_SBAWp3Tijfi7lljqYzH9yNtidM9qGPGH0OwaPp5vWWucI6VBvt9SYON3tyEGxxmBC_ZasnqeTwPaDUXQ5tJwMxfndtFN-3srJbY4ts0gjedn0NTfW-sMTXdWALJc1IXWEjw4TRHQcwcGBrAXVWFHFSnXkDE6p9_bilDw5_L_VA9H2y5Gcd-YgWZQ9-WbC59IFQH0RgcZjryxVt9gNTTS4TamVNI">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <img alt="" className="absolute left-[12.5%] max-w-none size-3/4 top-[12.5%]" src={imgAb6AXuA0T17CjBmHyALwHqulueMvs8Kz32UT8DjWiv7Qy5CS1HCMi0SbaWp3Tijfi7LljqYzH9YNtidM9QGpgh0OwaPp5VWWucI6VBvt9Syon3TyEGxxmBcZasnqeTwPaDuxq5TJwMxfndtFn3SrJbY4Ts0Gjedn0NTfWSMtXdWalJc1IxwEjw4TrhQcwcGBrAxvwfhfSnXkDe6P9BilDw5LVa9H2Y5GcdYgWzq9WbC59Ifqh0RgcZjryxVt9GNtts4TamVni} />
      </div>
    </div>
  );
}

function BackgroundOverlay() {
  return (
    <div className="content-stretch flex h-[64px] items-center justify-center overflow-clip relative rounded-[2px] shrink-0 w-[128px]" data-name="Background+Overlay">
      <div aria-hidden="true" className="absolute inset-0 pointer-events-none rounded-[2px]">
        <div className="absolute bg-[rgba(226,232,240,0.5)] inset-0 rounded-[2px]" />
        <div className="absolute bg-white inset-0 mix-blend-saturation rounded-[2px]" />
      </div>
      <Ab6AXuA0T17CjBmHyALwHqulueMvs8Kz32UT8DjWiv7Qy5CS1HCMi0SbaWp3Tijfi7LljqYzH9YNtidM9QGpgh0OwaPp5VWWucI6VBvt9Syon3TyEGxxmBcZasnqeTwPaDuxq5TJwMxfndtFn3SrJbY4Ts0Gjedn0NTfWSMtXdWalJc1IxwEjw4TrhQcwcGBrAxvwfhfSnXkDe6P9BilDw5LVa9H2Y5GcdYgWzq9WbC59Ifqh0RgcZjryxVt9GNtts4TamVni />
    </div>
  );
}

function Container102() {
  return (
    <div className="col-4 justify-self-stretch relative row-1 self-start shrink-0" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col gap-[24px] items-start pb-[32px] relative size-full">
        <Heading4Margin2 />
        <BackgroundOverlay />
      </div>
    </div>
  );
}

function HorizontalBorder1() {
  return (
    <div className="max-w-[1536px] relative shrink-0 w-full" data-name="HorizontalBorder">
      <div aria-hidden="true" className="absolute border-[rgba(226,232,240,0.1)] border-solid border-t inset-0 pointer-events-none" />
      <div className="gap-x-[48px] gap-y-[48px] grid grid-cols-[repeat(4,minmax(0,1fr))] grid-rows-[_144.50px] max-w-[inherit] pb-[96px] pt-[97px] px-[48px] relative size-full">
        <Container97 />
        <Container100 />
        <Container101 />
        <Container102 />
      </div>
    </div>
  );
}

function Container103() {
  return (
    <div className="content-stretch flex flex-col items-center relative shrink-0 w-full" data-name="Container">
      <div className="flex flex-col font-['Source_Sans_3:Regular',sans-serif] font-normal justify-center leading-[0] relative shrink-0 text-[#64748b] text-[11px] text-center tracking-[1.1px] uppercase whitespace-nowrap">
        <p className="leading-[16.5px]">© 2026 ARQUIVO ECONÓMICO DE ANGOLA. DEDICADO À EXCELÊNCIA ACADÉMICA E PRESERVAÇÃO HISTÓRICA.</p>
      </div>
    </div>
  );
}

function Overlay1() {
  return (
    <div className="bg-[rgba(226,232,240,0.3)] relative shrink-0 w-full" data-name="Overlay">
      <div className="content-stretch flex flex-col items-start pb-[32px] pt-[31px] px-[48px] relative size-full">
        <Container103 />
      </div>
    </div>
  );
}

function Footer() {
  return (
    <div className="bg-[#f1f5f9] content-stretch flex flex-col items-start relative shrink-0 w-full" data-name="Footer">
      <HorizontalBorder1 />
      <Overlay1 />
    </div>
  );
}

export default function ComunidadeAcademicaDesktop() {
  return (
    <div className="bg-[#f8f9ff] content-stretch flex flex-col gap-px items-start relative size-full" data-name="Comunidade Académica (Desktop)">
      <HeaderTopNavBar />
      <Main />
      <Categorias />
      <Footer />
    </div>
  );
}