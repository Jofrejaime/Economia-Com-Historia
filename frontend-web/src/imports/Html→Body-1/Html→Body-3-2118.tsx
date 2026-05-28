import svgPaths from "./svg-yulma705mf";
import imgFeaturedImageAnchor from "./7c78201b4196ff35ea2279e1d9b70057d59cb510.png";

function Link() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0" data-name="Link">
      <div className="flex flex-col font-['Inter:Medium',sans-serif] font-medium justify-center leading-[0] not-italic relative shrink-0 text-[#59413e] text-[14px] whitespace-nowrap">
        <p className="leading-[20px]">Comunidade</p>
      </div>
    </div>
  );
}

function Container() {
  return (
    <div className="h-[7px] relative shrink-0 w-[4.317px]" data-name="Container">
      <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 4.31667 7">
        <g id="Container">
          <path d={svgPaths.p35022f90} fill="var(--fill-0, #59413E)" id="Icon" />
        </g>
      </svg>
    </div>
  );
}

function Container1() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0" data-name="Container">
      <div className="flex flex-col font-['Inter:Medium',sans-serif] font-medium justify-center leading-[0] not-italic relative shrink-0 text-[#6f0008] text-[14px] whitespace-nowrap">
        <p className="leading-[20px]">Iniciar Discussão</p>
      </div>
    </div>
  );
}

function Nav() {
  return (
    <div className="content-stretch flex gap-[8px] items-center relative shrink-0 w-full" data-name="Nav">
      <Link />
      <Container />
      <Container1 />
    </div>
  );
}

function Heading() {
  return (
    <div className="content-stretch flex flex-col items-start pt-[8px] relative shrink-0 w-full" data-name="Heading 1">
      <div className="flex flex-col font-['Newsreader:Bold',sans-serif] font-bold justify-center leading-[0] relative shrink-0 text-[#1b1c1b] text-[48px] tracking-[-1.2px] w-full">
        <p className="leading-[48px]">Propor novo tema de investigação</p>
      </div>
    </div>
  );
}

function Container2() {
  return (
    <div className="content-stretch flex flex-col items-start max-w-[672px] relative shrink-0 w-[672px]" data-name="Container">
      <div className="flex flex-col font-['Inter:Light_Italic',sans-serif] font-light italic justify-center leading-[0] relative shrink-0 text-[#59413e] text-[18px] whitespace-nowrap">
        <p className="leading-[29.25px] mb-0">Contribua para o arquivo digital partilhando as suas questões, documentos ou</p>
        <p className="leading-[29.25px]">reflexões sobre a história económica.</p>
      </div>
    </div>
  );
}

function PageHeader() {
  return (
    <div className="content-stretch flex flex-col gap-[16px] items-start max-w-[896px] relative shrink-0 w-[896px]" data-name="Page Header">
      <Nav />
      <Heading />
      <Container2 />
    </div>
  );
}

function Label() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0 w-full" data-name="Label">
      <div className="flex flex-col font-['Inter:Bold',sans-serif] font-bold justify-center leading-[0] not-italic relative shrink-0 text-[#59413e] text-[12px] tracking-[1.2px] uppercase w-full">
        <p className="leading-[16px]">TÍTULO DA DISCUSSÃO</p>
      </div>
    </div>
  );
}

function Container3() {
  return (
    <div className="content-stretch flex flex-[1_0_0] flex-col items-start min-w-px overflow-clip relative" data-name="Container">
      <div className="flex flex-col font-['Newsreader:Italic',sans-serif] font-normal italic justify-center leading-[0] relative shrink-0 text-[#a8a29e] text-[20px] w-full">
        <p className="leading-[normal]">Ex: O Impacto do Plano Marshall na Indústria Têxtil Portuguesa</p>
      </div>
    </div>
  );
}

function Input() {
  return (
    <div className="bg-[#e4e2e0] relative rounded-[4px] shrink-0 w-full" data-name="Input">
      <div className="flex flex-row justify-center overflow-clip rounded-[inherit] size-full">
        <div className="content-stretch flex items-start justify-center px-[20px] py-[24px] relative size-full">
          <Container3 />
        </div>
      </div>
    </div>
  );
}

function TitleField() {
  return (
    <div className="content-stretch flex flex-col gap-[12px] items-start relative shrink-0 w-full" data-name="Title Field">
      <Label />
      <Input />
    </div>
  );
}

function Label1() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0 w-full" data-name="Label">
      <div className="flex flex-col font-['Inter:Bold',sans-serif] font-bold justify-center leading-[0] not-italic relative shrink-0 text-[#59413e] text-[12px] tracking-[1.2px] uppercase w-full">
        <p className="leading-[16px]">ENQUADRAMENTO E CONTEXTO</p>
      </div>
    </div>
  );
}

function Container4() {
  return (
    <div className="h-[14px] relative shrink-0 w-[10.4px]" data-name="Container">
      <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 10.4 14">
        <g id="Container">
          <path d={svgPaths.p19681a80} fill="var(--fill-0, #1B1C1B)" id="Icon" />
        </g>
      </svg>
    </div>
  );
}

function Button() {
  return (
    <div className="relative rounded-[2px] shrink-0" data-name="Button">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col items-center justify-center p-[8px] relative size-full">
        <Container4 />
      </div>
    </div>
  );
}

function Container5() {
  return (
    <div className="h-[14px] relative shrink-0 w-[13px]" data-name="Container">
      <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 13 14">
        <g id="Container">
          <path d={svgPaths.paccb900} fill="var(--fill-0, #1B1C1B)" id="Icon" />
        </g>
      </svg>
    </div>
  );
}

function Button1() {
  return (
    <div className="relative rounded-[2px] shrink-0" data-name="Button">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col items-center justify-center p-[8px] relative size-full">
        <Container5 />
      </div>
    </div>
  );
}

function Container6() {
  return (
    <div className="h-[16px] relative shrink-0 w-[18px]" data-name="Container">
      <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 18 16">
        <g id="Container">
          <path d={svgPaths.p28ce3f00} fill="var(--fill-0, #1B1C1B)" id="Icon" />
        </g>
      </svg>
    </div>
  );
}

function Button2() {
  return (
    <div className="relative rounded-[2px] shrink-0" data-name="Button">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col items-center justify-center p-[8px] relative size-full">
        <Container6 />
      </div>
    </div>
  );
}

function Margin() {
  return (
    <div className="h-[24px] relative shrink-0 w-[17px]" data-name="Margin">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col items-start px-[8px] relative size-full">
        <div className="bg-[#e0bfbb] h-[24px] relative shrink-0 w-px" data-name="Vertical Divider" />
      </div>
    </div>
  );
}

function Container7() {
  return (
    <div className="h-[10px] relative shrink-0 w-[20px]" data-name="Container">
      <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 20 10">
        <g id="Container">
          <path d={svgPaths.pc80eb80} fill="var(--fill-0, #1B1C1B)" id="Icon" />
        </g>
      </svg>
    </div>
  );
}

function Button3() {
  return (
    <div className="relative rounded-[2px] shrink-0" data-name="Button">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col items-center justify-center p-[8px] relative size-full">
        <Container7 />
      </div>
    </div>
  );
}

function Container8() {
  return (
    <div className="relative shrink-0 size-[18px]" data-name="Container">
      <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 18 18">
        <g id="Container">
          <path d={svgPaths.p27589980} fill="var(--fill-0, #1B1C1B)" id="Icon" />
        </g>
      </svg>
    </div>
  );
}

function Button4() {
  return (
    <div className="relative rounded-[2px] shrink-0" data-name="Button">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col items-center justify-center p-[8px] relative size-full">
        <Container8 />
      </div>
    </div>
  );
}

function Container9() {
  return (
    <div className="h-[16px] relative shrink-0 w-[22px]" data-name="Container">
      <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 22 16">
        <g id="Container">
          <path d={svgPaths.p378800} fill="var(--fill-0, #1B1C1B)" id="Icon" />
        </g>
      </svg>
    </div>
  );
}

function Button5() {
  return (
    <div className="relative rounded-[2px] shrink-0" data-name="Button">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col items-center justify-center p-[8px] relative size-full">
        <Container9 />
      </div>
    </div>
  );
}

function Toolbar() {
  return (
    <div className="bg-[#eae8e6] relative shrink-0 w-full" data-name="Toolbar">
      <div aria-hidden="true" className="absolute border-[rgba(224,191,187,0.2)] border-b border-solid inset-0 pointer-events-none" />
      <div className="flex flex-row items-center size-full">
        <div className="content-stretch flex gap-[8px] items-center pb-[13px] pt-[12px] px-[12px] relative size-full">
          <Button />
          <Button1 />
          <Button2 />
          <Margin />
          <Button3 />
          <Button4 />
          <Button5 />
        </div>
      </div>
    </div>
  );
}

function Container10() {
  return (
    <div className="content-stretch flex flex-[1_0_0] flex-col items-start min-w-px relative" data-name="Container">
      <div className="flex flex-col font-['Inter:Regular',sans-serif] font-normal justify-center leading-[0] not-italic relative shrink-0 text-[#a8a29e] text-[16px] w-full whitespace-pre-wrap">
        <p className="leading-[26px] mb-0">{`Escreva aqui a sua análise, referências bibliográficas ou questões para a `}</p>
        <p className="leading-[26px]">comunidade...</p>
      </div>
    </div>
  );
}

function TextareaEditorArea() {
  return (
    <div className="relative shrink-0 w-full" data-name="Textarea - Editor Area">
      <div className="flex flex-row justify-center overflow-clip rounded-[inherit] size-full">
        <div className="content-stretch flex items-start justify-center pb-[284px] pt-[24px] px-[24px] relative size-full">
          <Container10 />
        </div>
      </div>
    </div>
  );
}

function Background() {
  return (
    <div className="bg-[#e4e2e0] content-stretch flex flex-col items-start overflow-clip relative rounded-[4px] shrink-0 w-full" data-name="Background">
      <Toolbar />
      <TextareaEditorArea />
    </div>
  );
}

function ContentEditorSimulation() {
  return (
    <div className="content-stretch flex flex-col gap-[12px] items-start relative shrink-0 w-full" data-name="Content Editor Simulation">
      <Label1 />
      <Background />
    </div>
  );
}

function Overlay() {
  return (
    <div className="h-[39px] relative shrink-0 w-[46px]" data-name="Overlay">
      <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 46 39">
        <g id="Overlay">
          <rect fill="var(--fill-0, #6F0008)" fillOpacity="0.05" height="39" rx="12" width="46" />
          <path d={svgPaths.p1c8db000} fill="var(--fill-0, #6F0008)" id="Icon" />
        </g>
      </svg>
    </div>
  );
}

function Container13() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0 w-full" data-name="Container">
      <div className="flex flex-col font-['Inter:Bold',sans-serif] font-bold justify-center leading-[0] not-italic relative shrink-0 text-[#1b1c1b] text-[16px] whitespace-nowrap">
        <p className="leading-[24px]">Visibilidade do Tópico</p>
      </div>
    </div>
  );
}

function Container14() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0 w-full" data-name="Container">
      <div className="flex flex-col font-['Inter:Regular',sans-serif] font-normal justify-center leading-[0] not-italic relative shrink-0 text-[#59413e] text-[14px] whitespace-nowrap">
        <p className="leading-[20px]">Defina quem pode aceder a esta discussão no arquivo.</p>
      </div>
    </div>
  );
}

function Container12() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0 w-[363.89px]" data-name="Container">
      <Container13 />
      <Container14 />
    </div>
  );
}

function Container11() {
  return (
    <div className="relative shrink-0" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex gap-[16px] items-center relative size-full">
        <Overlay />
        <Container12 />
      </div>
    </div>
  );
}

function Background2() {
  return (
    <div className="bg-[#6f0008] content-stretch flex flex-col items-start px-[24px] py-[8px] relative rounded-[12px] shrink-0" data-name="Background">
      <div className="flex flex-col font-['Inter:Semi_Bold',sans-serif] font-semibold justify-center leading-[0] not-italic relative shrink-0 text-[14px] text-white whitespace-nowrap">
        <p className="leading-[20px]">Público</p>
      </div>
    </div>
  );
}

function Label2() {
  return (
    <div className="content-stretch flex flex-col items-start relative self-stretch shrink-0" data-name="Label">
      <Background2 />
    </div>
  );
}

function Label3() {
  return (
    <div className="relative self-stretch shrink-0" data-name="Label">
      <div className="content-stretch flex flex-col items-start pb-[8.5px] pt-[7.5px] px-[24px] relative size-full">
        <div className="flex flex-col font-['Inter:Semi_Bold',sans-serif] font-semibold justify-center leading-[0] not-italic relative shrink-0 text-[#59413e] text-[14px] whitespace-nowrap">
          <p className="leading-[20px]">Privado</p>
        </div>
      </div>
    </div>
  );
}

function Background1() {
  return (
    <div className="bg-[#f5f3f1] h-[44px] relative rounded-[12px] shrink-0" data-name="Background">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex gap-[8px] items-start p-[4px] relative size-full">
        <Label2 />
        <Label3 />
      </div>
    </div>
  );
}

function VisibilitySelector() {
  return (
    <div className="bg-white relative rounded-[4px] shrink-0 w-full" data-name="Visibility Selector">
      <div aria-hidden="true" className="absolute border border-[rgba(224,191,187,0.2)] border-solid inset-0 pointer-events-none rounded-[4px]" />
      <div className="flex flex-row items-center size-full">
        <div className="content-stretch flex items-center justify-between p-[25px] relative size-full">
          <Container11 />
          <Background1 />
        </div>
      </div>
    </div>
  );
}

function Container15() {
  return (
    <div className="h-[15px] relative shrink-0 w-[12px]" data-name="Container">
      <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 12 15">
        <g id="Container">
          <path d={svgPaths.p20c9e700} fill="var(--fill-0, #59413E)" id="Icon" />
        </g>
      </svg>
    </div>
  );
}

function Button6() {
  return (
    <div className="relative shrink-0" data-name="Button">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex gap-[8px] items-center px-[24px] py-[12px] relative size-full">
        <Container15 />
        <div className="flex flex-col font-['Inter:Medium',sans-serif] font-medium justify-center leading-[0] not-italic relative shrink-0 text-[#59413e] text-[16px] text-center whitespace-nowrap">
          <p className="leading-[24px]">Guardar como rascunho</p>
        </div>
      </div>
    </div>
  );
}

function Container16() {
  return (
    <div className="h-[16px] relative shrink-0 w-[19px]" data-name="Container">
      <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 19 16">
        <g id="Container">
          <path d={svgPaths.p8d35f80} fill="var(--fill-0, white)" id="Icon" />
        </g>
      </svg>
    </div>
  );
}

function Button7() {
  return (
    <div className="bg-[#6f0008] relative rounded-[12px] shrink-0" data-name="Button">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex gap-[8px] items-center px-[40px] py-[16px] relative size-full">
        <div className="absolute bg-[rgba(255,255,255,0)] inset-[0_-0.02px_0_0] rounded-[12px] shadow-[0px_10px_15px_-3px_rgba(111,0,8,0.1),0px_4px_6px_-4px_rgba(111,0,8,0.1)]" data-name="Button:shadow" />
        <Container16 />
        <div className="flex flex-col font-['Inter:Bold',sans-serif] font-bold justify-center leading-[0] not-italic relative shrink-0 text-[16px] text-center text-white whitespace-nowrap">
          <p className="leading-[24px]">Publicar no Arquivo</p>
        </div>
      </div>
    </div>
  );
}

function ActionButtons() {
  return (
    <div className="content-stretch flex gap-[23.99px] items-center justify-end pt-[25px] relative shrink-0 w-full" data-name="Action Buttons">
      <div aria-hidden="true" className="absolute border-[rgba(224,191,187,0.1)] border-solid border-t inset-0 pointer-events-none" />
      <Button6 />
      <Button7 />
    </div>
  );
}

function Form() {
  return (
    <div className="content-stretch flex flex-col gap-[40px] items-start relative shrink-0 w-full" data-name="Form">
      <TitleField />
      <ContentEditorSimulation />
      <VisibilitySelector />
      <ActionButtons />
    </div>
  );
}

function SectionLeftSideMainForm8Columns() {
  return (
    <div className="bg-[#f5f3f1] col-[1/span_8] justify-self-stretch relative rounded-[8px] row-1 self-start shrink-0" data-name="Section - Left Side: Main Form (8 Columns)">
      <div className="content-stretch flex flex-col items-start pb-[56px] pt-[40px] px-[40px] relative size-full">
        <div className="absolute bg-[rgba(255,255,255,0)] inset-0 rounded-[8px] shadow-[0px_4px_24px_-1px_rgba(27,28,27,0.06)]" data-name="Overlay+Shadow" />
        <Form />
      </div>
    </div>
  );
}

function Heading1() {
  return (
    <div className="relative shrink-0 w-full" data-name="Heading 3">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col items-start relative size-full">
        <div className="flex flex-col font-['Newsreader:Bold',sans-serif] font-bold justify-center leading-[0] relative shrink-0 text-[#1b1c1b] text-[20px] w-full">
          <p className="leading-[28px]">Normas Editoriais</p>
        </div>
      </div>
    </div>
  );
}

function Container17() {
  return (
    <div className="content-stretch flex flex-col items-start relative self-stretch shrink-0" data-name="Container">
      <div className="relative shrink-0 size-[20px]" data-name="Icon">
        <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 20 20">
          <path d={svgPaths.p1fe7b600} fill="var(--fill-0, #6F0008)" id="Icon" />
        </svg>
      </div>
    </div>
  );
}

function Container19() {
  return (
    <div className="absolute content-stretch flex flex-col items-start left-0 pb-[0.75px] right-0 top-[-1px]" data-name="Container">
      <div className="flex flex-col font-['Inter:Bold',sans-serif] font-bold justify-center leading-[0] not-italic relative shrink-0 text-[#1b1c1b] text-[14px] whitespace-nowrap">
        <p className="leading-[22.75px]">Cordialidade</p>
      </div>
    </div>
  );
}

function Container20() {
  return <div className="absolute h-[69px] left-0 right-0 top-[25.5px]" data-name="Container" />;
}

function Container18() {
  return (
    <div className="relative self-stretch shrink-0 w-[261.98px]" data-name="Container">
      <Container19 />
      <Container20 />
    </div>
  );
}

function Item() {
  return (
    <div className="h-[20px] relative shrink-0 w-full" data-name="Item">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex gap-[16px] items-start relative size-full">
        <Container17 />
        <Container18 />
      </div>
    </div>
  );
}

function Container21() {
  return (
    <div className="content-stretch flex flex-col items-start relative self-stretch shrink-0" data-name="Container">
      <div className="h-[16px] relative shrink-0 w-[19.5px]" data-name="Icon">
        <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 19.5 16">
          <path d={svgPaths.p29002e00} fill="var(--fill-0, #6F0008)" id="Icon" />
        </svg>
      </div>
    </div>
  );
}

function Container23() {
  return (
    <div className="absolute content-stretch flex flex-col items-start left-0 pb-[0.75px] right-0 top-[-1px]" data-name="Container">
      <div className="flex flex-col font-['Inter:Bold',sans-serif] font-bold justify-center leading-[0] not-italic relative shrink-0 text-[#1b1c1b] text-[14px] whitespace-nowrap">
        <p className="leading-[22.75px]">Rigor Histórico</p>
      </div>
    </div>
  );
}

function Container22() {
  return (
    <div className="relative self-stretch shrink-0 w-[261.98px]" data-name="Container">
      <Container23 />
    </div>
  );
}

function Item1() {
  return (
    <div className="content-stretch flex gap-[16px] h-[16px] items-start relative shrink-0 w-full" data-name="Item">
      <Container21 />
      <Container22 />
    </div>
  );
}

function Container24() {
  return (
    <div className="content-stretch flex flex-col items-start relative self-stretch shrink-0" data-name="Container">
      <div className="h-[20px] relative shrink-0 w-[12.5px]" data-name="Icon">
        <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 12.5 20">
          <path d={svgPaths.p2fe31000} fill="var(--fill-0, #6F0008)" id="Icon" />
        </svg>
      </div>
    </div>
  );
}

function Container26() {
  return (
    <div className="absolute content-stretch flex flex-col items-start left-0 pb-[0.75px] right-0 top-[-1px]" data-name="Container">
      <div className="flex flex-col font-['Inter:Bold',sans-serif] font-bold justify-center leading-[0] not-italic relative shrink-0 text-[#1b1c1b] text-[14px] whitespace-nowrap">
        <p className="leading-[22.75px]">Anexos e Média</p>
      </div>
    </div>
  );
}

function Container25() {
  return (
    <div className="relative self-stretch shrink-0 w-[261.98px]" data-name="Container">
      <Container26 />
    </div>
  );
}

function Item2() {
  return (
    <div className="content-stretch flex gap-[16px] h-[20px] items-start relative shrink-0 w-full" data-name="Item">
      <Container24 />
      <Container25 />
    </div>
  );
}

function List() {
  return (
    <div className="relative shrink-0 w-full" data-name="List">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col gap-[24px] items-start relative size-full">
        <Item1 />
        <Item2 />
      </div>
    </div>
  );
}

function GuidelinesCard() {
  return (
    <div className="bg-white h-[238px] relative rounded-[8px] shrink-0 w-full" data-name="Guidelines Card">
      <div aria-hidden="true" className="absolute border border-[rgba(224,191,187,0.1)] border-solid inset-0 pointer-events-none rounded-[8px]" />
      <div className="content-stretch flex flex-col gap-[24px] items-start p-[33px] relative size-full">
        <div className="absolute bg-[rgba(255,255,255,0)] inset-[0_-18px_-27px_0] rounded-[2px] shadow-[0px_4px_24px_-1px_rgba(27,28,27,0.06)]" data-name="Guidelines Card:shadow" />
        <Heading1 />
        <Item />
        <List />
      </div>
    </div>
  );
}

function Container28() {
  return (
    <div className="content-stretch flex flex-col items-start opacity-80 relative shrink-0 w-full" data-name="Container">
      <div className="flex flex-col font-['Inter:Bold',sans-serif] font-bold justify-center leading-[0] not-italic relative shrink-0 text-[12px] text-white tracking-[1.2px] uppercase w-full">
        <p className="leading-[16px]">INSPIRAÇÃO</p>
      </div>
    </div>
  );
}

function Container29() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0 w-full" data-name="Container">
      <div className="flex flex-col font-['Newsreader:Italic',sans-serif] font-normal italic justify-center leading-[0] relative shrink-0 text-[18px] text-white w-full">
        <p className="leading-[28px] mb-0">{`"A História é o esforço intelectual para`}</p>
        <p className="leading-[28px] mb-0">compreender o presente através do</p>
        <p className="leading-[28px]">{`passado."`}</p>
      </div>
    </div>
  );
}

function Container27() {
  return (
    <div className="absolute bottom-[24px] content-stretch flex flex-col gap-[4px] items-start left-[24px] right-[24px]" data-name="Container">
      <Container28 />
      <Container29 />
    </div>
  );
}

function FeaturedImageAnchor() {
  return (
    <div className="h-[320px] overflow-clip relative rounded-[8px] shrink-0 w-full" data-name="Featured Image Anchor">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <img alt="" className="absolute h-[143.75%] left-0 max-w-none top-[-21.87%] w-full" src={imgFeaturedImageAnchor} />
      </div>
      <div className="absolute bg-gradient-to-t from-[rgba(111,0,8,0.8)] inset-0 to-[rgba(111,0,8,0)]" data-name="Gradient" />
      <Container27 />
    </div>
  );
}

function Container30() {
  return (
    <div className="relative shrink-0 w-full" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col items-start relative size-full">
        <div className="flex flex-col font-['Inter:Medium',sans-serif] font-medium justify-center leading-[0] not-italic relative shrink-0 text-[#59413e] text-[14px] w-full">
          <p className="leading-[20px] mb-0">Precisa de ajuda para estruturar o seu tópico?</p>
          <p>
            <span className="leading-[20px]">{`Consulte o nosso `}</span>
            <span className="font-['Inter:Bold',sans-serif] font-bold leading-[20px] not-italic text-[#6f0008]">Guia do Investigador</span>
            <span className="leading-[20px]">.</span>
          </p>
        </div>
      </div>
    </div>
  );
}

function QuickLinksHelp() {
  return (
    <div className="bg-[#efedec] relative rounded-[8px] shrink-0 w-full" data-name="Quick Links/Help">
      <div aria-hidden="true" className="absolute border-[#6f0008] border-l-4 border-solid inset-0 pointer-events-none rounded-[8px]" />
      <div className="content-stretch flex flex-col items-start pl-[28px] pr-[24px] py-[24px] relative size-full">
        <Container30 />
      </div>
    </div>
  );
}

function AsideRightSideGuidelinesMeta4Columns() {
  return (
    <div className="col-[9/span_4] content-stretch flex flex-col h-[646px] items-start justify-self-stretch pb-[113px] relative row-1 self-start shrink-0" data-name="Aside - Right Side: Guidelines & Meta (4 Columns)">
      <GuidelinesCard />
      <FeaturedImageAnchor />
      <QuickLinksHelp />
    </div>
  );
}

function AsymmetricBentoGridForFormContext() {
  return (
    <div className="gap-x-[40px] gap-y-[40px] grid grid-cols-[repeat(12,minmax(0,1fr))] grid-rows-[_944px] relative shrink-0 w-full" data-name="Asymmetric Bento Grid for Form & Context">
      <SectionLeftSideMainForm8Columns />
      <AsideRightSideGuidelinesMeta4Columns />
    </div>
  );
}

function MainContentCanvas() {
  return (
    <div className="absolute content-stretch flex flex-col gap-[48px] items-start left-0 max-w-[1440px] p-[48px] right-0 top-[80px]" data-name="Main Content Canvas">
      <PageHeader />
      <AsymmetricBentoGridForFormContext />
    </div>
  );
}

function Container34() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0 w-full" data-name="Container">
      <div className="flex flex-col font-['Newsreader:Bold',sans-serif] font-bold justify-center leading-[0] relative shrink-0 text-[#6f0008] text-[18px] whitespace-nowrap">
        <p className="leading-[28px]">Economia com História</p>
      </div>
    </div>
  );
}

function Container35() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0 w-full" data-name="Container">
      <div className="flex flex-col font-['Inter:Regular',sans-serif] font-normal justify-center leading-[0] not-italic relative shrink-0 text-[#78716c] text-[14px] tracking-[0.35px] whitespace-nowrap">
        <p className="leading-[20px]">© 2026 Economia com História. Um arquivo académico digital.</p>
      </div>
    </div>
  );
}

function Container33() {
  return (
    <div className="content-stretch flex flex-col gap-[8px] items-start relative shrink-0 w-[434px]" data-name="Container">
      <Container34 />
      <Container35 />
    </div>
  );
}

function Link1() {
  return (
    <div className="content-stretch flex flex-col items-start relative self-stretch shrink-0" data-name="Link">
      <div className="flex flex-col font-['Inter:Regular',sans-serif] font-normal justify-center leading-[0] not-italic relative shrink-0 text-[#78716c] text-[14px] tracking-[0.35px] whitespace-nowrap">
        <p className="leading-[20px]">Sobre o Projecto</p>
      </div>
    </div>
  );
}

function Link2() {
  return (
    <div className="content-stretch flex flex-col items-start relative self-stretch shrink-0" data-name="Link">
      <div className="flex flex-col font-['Inter:Regular',sans-serif] font-normal justify-center leading-[0] not-italic relative shrink-0 text-[#78716c] text-[14px] tracking-[0.35px] whitespace-nowrap">
        <p className="leading-[20px]">Termos de Uso</p>
      </div>
    </div>
  );
}

function Link3() {
  return (
    <div className="content-stretch flex flex-col items-start relative self-stretch shrink-0" data-name="Link">
      <div className="flex flex-col font-['Inter:Regular',sans-serif] font-normal justify-center leading-[0] not-italic relative shrink-0 text-[#78716c] text-[14px] tracking-[0.35px] whitespace-nowrap">
        <p className="leading-[20px]">Privacidade</p>
      </div>
    </div>
  );
}

function Link4() {
  return (
    <div className="content-stretch flex flex-col items-start relative self-stretch shrink-0" data-name="Link">
      <div className="flex flex-col font-['Inter:Regular',sans-serif] font-normal justify-center leading-[0] not-italic relative shrink-0 text-[#78716c] text-[14px] tracking-[0.35px] whitespace-nowrap">
        <p className="leading-[20px]">Contactos</p>
      </div>
    </div>
  );
}

function Container36() {
  return (
    <div className="content-stretch flex gap-[32px] h-[20px] items-start relative shrink-0" data-name="Container">
      <Link1 />
      <Link2 />
      <Link3 />
      <Link4 />
    </div>
  );
}

function Container32() {
  return (
    <div className="content-stretch flex items-center justify-between relative shrink-0 w-full" data-name="Container">
      <Container33 />
      <Container36 />
    </div>
  );
}

function Container31() {
  return (
    <div className="max-w-[1440px] relative shrink-0 w-full" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col gap-[32px] items-start max-w-[inherit] relative size-full">
        <div className="bg-[rgba(224,191,187,0.2)] h-px relative shrink-0 w-full" data-name="Horizontal Divider" />
        <Container32 />
      </div>
    </div>
  );
}

function FooterFromSharedComponents() {
  return (
    <div className="absolute bg-[#f5f3f1] bottom-0 content-stretch flex flex-col items-start left-0 pb-[48px] pt-[49px] px-[48px] right-0" data-name="Footer from Shared Components">
      <div aria-hidden="true" className="absolute border-[#e7e5e4] border-solid border-t inset-0 pointer-events-none" />
      <Container31 />
    </div>
  );
}

function Container37() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0" data-name="Container">
      <div className="flex flex-col font-['Newsreader:Bold',sans-serif] font-bold justify-center leading-[0] relative shrink-0 text-[#6f0008] text-[24px] tracking-[-0.4px] whitespace-nowrap">
        <p className="leading-[32px]">Economia com História</p>
      </div>
    </div>
  );
}

function Link5() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0" data-name="Link">
      <div className="flex flex-col font-['Newsreader:Medium',sans-serif] font-medium justify-center leading-[0] relative shrink-0 text-[#57534e] text-[16px] tracking-[-0.4px] whitespace-nowrap">
        <p className="leading-[26px]">Início</p>
      </div>
    </div>
  );
}

function Link6() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0" data-name="Link">
      <div className="flex flex-col font-['Newsreader:Medium',sans-serif] font-medium justify-center leading-[0] relative shrink-0 text-[#57534e] text-[16px] tracking-[-0.4px] whitespace-nowrap">
        <p className="leading-[26px]">Conteúdos</p>
      </div>
    </div>
  );
}

function Link7() {
  return (
    <div className="content-stretch flex flex-col items-start pb-[6px] relative shrink-0" data-name="Link">
      <div aria-hidden="true" className="absolute border-[#6f0008] border-b-2 border-solid inset-0 pointer-events-none" />
      <div className="flex flex-col font-['Newsreader:Bold',sans-serif] font-bold justify-center leading-[0] relative shrink-0 text-[#6f0008] text-[16px] tracking-[-0.4px] whitespace-nowrap">
        <p className="leading-[26px]">Comunidade</p>
      </div>
    </div>
  );
}

function Link8() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0" data-name="Link">
      <div className="flex flex-col font-['Newsreader:Medium',sans-serif] font-medium justify-center leading-[0] relative shrink-0 text-[#57534e] text-[16px] tracking-[-0.4px] whitespace-nowrap">
        <p className="leading-[26px]">Quiz</p>
      </div>
    </div>
  );
}

function Link9() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0" data-name="Link">
      <div className="flex flex-col font-['Newsreader:Medium',sans-serif] font-medium justify-center leading-[0] relative shrink-0 text-[#57534e] text-[16px] tracking-[-0.4px] whitespace-nowrap">
        <p className="leading-[26px]">Perfil</p>
      </div>
    </div>
  );
}

function Container38() {
  return (
    <div className="content-stretch flex gap-[32px] items-center relative shrink-0" data-name="Container">
      <Link5 />
      <Link6 />
      <Link7 />
      <Link8 />
      <Link9 />
    </div>
  );
}

function Container39() {
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

function Container40() {
  return (
    <div className="content-stretch flex flex-col items-center relative shrink-0" data-name="Container">
      <div className="flex flex-col font-['Source_Sans_3:Medium',sans-serif] font-medium justify-center leading-[0] relative shrink-0 text-[#475569] text-[14px] text-center whitespace-nowrap">
        <p className="leading-[20px]">Pesquisar</p>
      </div>
    </div>
  );
}

function Button8() {
  return (
    <div className="content-stretch flex gap-[7.99px] items-center relative shrink-0" data-name="Button">
      <Container39 />
      <Container40 />
    </div>
  );
}

function Nav1() {
  return (
    <div className="max-w-[1440px] relative shrink-0 w-full" data-name="Nav">
      <div className="flex flex-row items-center max-w-[inherit] size-full">
        <div className="content-stretch flex items-center justify-between max-w-[inherit] px-[48px] py-[24px] relative size-full">
          <Container37 />
          <Container38 />
          <Button8 />
        </div>
      </div>
    </div>
  );
}

function HeaderTopNavBarFromSharedComponents() {
  return (
    <div className="absolute bg-[#fbf9f7] content-stretch flex flex-col items-start left-0 right-0 top-0" data-name="Header - TopNavBar from Shared Components">
      <Nav1 />
      <div className="bg-[#f5f3f1] h-px relative shrink-0 w-full" data-name="Style Separation Logic" />
    </div>
  );
}

export default function HtmlBody() {
  return (
    <div className="relative size-full" style={{ backgroundImage: "linear-gradient(90deg, rgb(251, 249, 247) 0%, rgb(251, 249, 247) 100%), linear-gradient(90deg, rgb(255, 255, 255) 0%, rgb(255, 255, 255) 100%)" }} data-name="Html → Body">
      <MainContentCanvas />
      <FooterFromSharedComponents />
      <HeaderTopNavBarFromSharedComponents />
    </div>
  );
}