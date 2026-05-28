import svgPaths from "./svg-sfa91ab0zq";
import imgBibliotecaHistorica from "./4a0cc1180c84c33b9b441c98f3577f51eefa8645.png";

function Container1() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0" data-name="Container">
      <div className="flex flex-col font-['Newsreader:Regular',sans-serif] font-normal justify-center leading-[0] relative shrink-0 text-[#6f0008] text-[24px] whitespace-nowrap">
        <p className="leading-[32px]">Economia com História</p>
      </div>
    </div>
  );
}

function Container() {
  return (
    <div className="max-w-[1440px] relative shrink-0 w-full" data-name="Container">
      <div className="flex flex-row items-center max-w-[inherit] size-full">
        <div className="content-stretch flex items-center justify-between max-w-[inherit] px-[48px] py-[24px] relative size-full">
          <Container1 />
        </div>
      </div>
    </div>
  );
}

function Header() {
  return (
    <div className="bg-[#fbf9f7] content-stretch flex flex-col items-start relative shrink-0 w-full z-[3]" data-name="Header">
      <Container />
      <div className="bg-[#f5f3f1] h-px relative shrink-0 w-full" data-name="Horizontal Divider" />
    </div>
  );
}

function BibliotecaHistorica() {
  return (
    <div className="absolute inset-[0_0.01px_0_0]" data-name="Biblioteca Histórica">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <img alt="" className="absolute h-full left-[-39.64%] max-w-none top-0 w-[179.27%]" src={imgBibliotecaHistorica} />
      </div>
    </div>
  );
}

function OverlayOverlayBlur() {
  return (
    <div className="backdrop-blur-[6px] bg-[rgba(255,255,255,0.1)] content-stretch flex items-start px-[12px] py-[4px] relative rounded-[2px] shrink-0" data-name="Overlay+OverlayBlur">
      <div className="flex flex-col font-['Inter:Regular',sans-serif] font-normal justify-center leading-[0] not-italic relative shrink-0 text-[12px] text-white tracking-[1.2px] uppercase whitespace-nowrap">
        <p className="leading-[16px]">INSCRIÇÃO ACADÉMICA</p>
      </div>
    </div>
  );
}

function Heading1() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0 w-full" data-name="Heading 2">
      <div className="flex flex-col font-['Newsreader:Regular',sans-serif] font-normal justify-center leading-[0] relative shrink-0 text-[36px] text-white w-full">
        <p className="leading-[45px] mb-0">Preservando o legado</p>
        <p className="leading-[45px] mb-0">económico através da</p>
        <p className="leading-[45px]">história digital.</p>
      </div>
    </div>
  );
}

function Container3() {
  return (
    <div className="content-stretch flex flex-col gap-[24px] items-start relative shrink-0 w-full" data-name="Container">
      <OverlayOverlayBlur />
      <Heading1 />
    </div>
  );
}

function Container6() {
  return (
    <div className="h-[45.5px] relative shrink-0 w-[343.14px]" data-name="Container">
      <div className="-translate-y-1/2 absolute flex flex-col font-['Inter:Regular',sans-serif] font-normal justify-center leading-[0] left-0 not-italic text-[14px] text-white top-[21.88px] whitespace-nowrap">
        <p className="leading-[22.75px] mb-0">Aceda a arquivos exclusivos e manuscritos</p>
        <p className="leading-[22.75px]">digitalizados de valor incalculável.</p>
      </div>
    </div>
  );
}

function Container5() {
  return (
    <div className="content-stretch flex gap-[16px] items-start relative shrink-0 w-full" data-name="Container">
      <div className="h-[19.5px] relative shrink-0 w-[22px]" data-name="Icon">
        <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 22 19.5">
          <path d={svgPaths.p1382b180} fill="var(--fill-0, #FDA49B)" id="Icon" />
        </svg>
      </div>
      <Container6 />
    </div>
  );
}

function Container8() {
  return (
    <div className="h-[45.5px] relative shrink-0 w-[343.14px]" data-name="Container">
      <div className="-translate-y-1/2 absolute flex flex-col font-['Inter:Regular',sans-serif] font-normal justify-center leading-[0] left-0 not-italic text-[14px] text-white top-[21.88px] whitespace-nowrap">
        <p className="leading-[22.75px] mb-0">Conecte-se com investigadores e estudantes de</p>
        <p className="leading-[22.75px]">instituições globais.</p>
      </div>
    </div>
  );
}

function Container7() {
  return (
    <div className="content-stretch flex gap-[16px] items-start relative shrink-0 w-full" data-name="Container">
      <div className="h-[18px] relative shrink-0 w-[22px]" data-name="Icon">
        <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 22 18">
          <path d={svgPaths.pb257040} fill="var(--fill-0, #FDA49B)" id="Icon" />
        </svg>
      </div>
      <Container8 />
    </div>
  );
}

function Container4() {
  return (
    <div className="content-stretch flex flex-col gap-[16px] items-start relative shrink-0 w-full" data-name="Container">
      <Container5 />
      <Container7 />
    </div>
  );
}

function Container2() {
  return (
    <div className="relative shrink-0 w-full" data-name="Container">
      <div className="content-stretch flex flex-col items-start justify-between p-[48px] relative size-full">
        <Container3 />
        <Container4 />
      </div>
    </div>
  );
}

function Background() {
  return (
    <div className="bg-[#921a1a] col-[1/span_5] justify-self-stretch relative row-1 self-start shrink-0" data-name="Background">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col items-start justify-center overflow-clip relative rounded-[inherit] size-full">
        <BibliotecaHistorica />
        <div className="absolute inset-[0_0.01px_0_0] opacity-90" style={{ backgroundImage: "linear-gradient(141.146deg, rgb(111, 0, 8) 0%, rgb(146, 26, 26) 100%)" }} data-name="Gradient" />
        <Container2 />
      </div>
    </div>
  );
}

function Heading() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0 w-full" data-name="Heading 1">
      <div className="flex flex-col font-['Newsreader:Regular',sans-serif] font-normal justify-center leading-[0] relative shrink-0 text-[#6f0008] text-[30px] w-full">
        <p className="leading-[36px]">Criar Conta Académica</p>
      </div>
    </div>
  );
}

function Container11() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0 w-full" data-name="Container">
      <div className="flex flex-col font-['Inter:Regular',sans-serif] font-normal justify-center leading-[0] not-italic relative shrink-0 text-[#59413e] text-[14px] w-full">
        <p className="leading-[20px]">Inicie a sua jornada no maior arquivo digital de história económica.</p>
      </div>
    </div>
  );
}

function Container10() {
  return (
    <div className="content-stretch flex flex-col gap-[8px] items-start relative shrink-0 w-full" data-name="Container">
      <Heading />
      <Container11 />
    </div>
  );
}

function Container13() {
  return (
    <div className="content-stretch flex flex-[1_0_0] flex-col items-start min-w-px overflow-clip relative" data-name="Container">
      <div className="flex flex-col font-['Inter:Regular',sans-serif] font-normal justify-center leading-[0] not-italic relative shrink-0 text-[#a8a29e] text-[16px] w-full">
        <p className="leading-[normal]">Ex: Alexandre Herculano</p>
      </div>
    </div>
  );
}

function Input() {
  return (
    <div className="absolute bg-[#e4e2e0] content-stretch flex items-start justify-center left-0 overflow-clip px-[16px] py-[14px] right-[-0.01px] rounded-[6px] top-[22.5px]" data-name="Input">
      <Container13 />
    </div>
  );
}

function Container12() {
  return (
    <div className="h-[70.5px] relative shrink-0 w-full" data-name="Container">
      <div className="-translate-y-1/2 absolute flex flex-col font-['Inter:Regular',sans-serif] font-normal justify-center leading-[0] left-[4px] not-italic text-[11px] text-[rgba(89,65,62,0.7)] top-[8px] tracking-[1.1px] uppercase whitespace-nowrap">
        <p className="leading-[16.5px]">NOME COMPLETO</p>
      </div>
      <Input />
    </div>
  );
}

function Container15() {
  return (
    <div className="content-stretch flex flex-[1_0_0] flex-col items-start min-w-px overflow-clip relative" data-name="Container">
      <div className="flex flex-col font-['Inter:Regular',sans-serif] font-normal justify-center leading-[0] not-italic relative shrink-0 text-[#a8a29e] text-[16px] w-full">
        <p className="leading-[normal]">nome@universidade.pt</p>
      </div>
    </div>
  );
}

function Input1() {
  return (
    <div className="absolute bg-[#e4e2e0] content-stretch flex items-start justify-center left-0 overflow-clip px-[16px] py-[14px] right-[-0.01px] rounded-[6px] top-[22.5px]" data-name="Input">
      <Container15 />
    </div>
  );
}

function Container14() {
  return (
    <div className="h-[70.5px] relative shrink-0 w-full" data-name="Container">
      <div className="-translate-y-1/2 absolute flex flex-col font-['Inter:Regular',sans-serif] font-normal justify-center leading-[0] left-[4px] not-italic text-[11px] text-[rgba(89,65,62,0.7)] top-[8px] tracking-[1.1px] uppercase whitespace-nowrap">
        <p className="leading-[16.5px]">EMAIL ACADÉMICO</p>
      </div>
      <Input1 />
    </div>
  );
}

function Svg() {
  return (
    <div className="relative shrink-0 size-[24px]" data-name="SVG">
      <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 24 24">
        <g id="SVG">
          <path d="M7.2 9.6L12 14.4L16.8 9.6" id="Vector" stroke="var(--stroke-0, #6B7280)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" />
        </g>
      </svg>
    </div>
  );
}

function ImageClip() {
  return (
    <div className="absolute content-stretch flex flex-col inset-0 items-start justify-center overflow-clip pl-[416px] pr-[8px] py-[12px]" data-name="image clip">
      <Svg />
    </div>
  );
}

function Container18() {
  return (
    <div className="content-stretch flex flex-[1_0_0] flex-col items-start min-w-px overflow-clip relative" data-name="Container">
      <div className="flex flex-col font-['Inter:Regular',sans-serif] font-normal justify-center leading-[0] not-italic relative shrink-0 text-[#1b1c1b] text-[16px] w-full">
        <p className="leading-[24px]">Seleccione a sua instituição</p>
      </div>
    </div>
  );
}

function Options() {
  return (
    <div className="bg-[#e4e2e0] relative rounded-[6px] shrink-0 w-full" data-name="Options">
      <div className="flex flex-row items-center justify-center size-full">
        <div className="content-stretch flex items-center justify-center px-[16px] py-[12px] relative size-full">
          <ImageClip />
          <Container18 />
        </div>
      </div>
    </div>
  );
}

function Container19() {
  return (
    <div className="absolute bottom-1/4 content-stretch flex flex-col items-start right-[12px] top-1/4" data-name="Container">
      <div className="h-[7.4px] relative shrink-0 w-[12px]" data-name="Icon">
        <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 12 7.4">
          <path d={svgPaths.p1adfde00} fill="var(--fill-0, #A8A29E)" id="Icon" />
        </svg>
      </div>
    </div>
  );
}

function Container17() {
  return (
    <div className="absolute content-stretch flex flex-col items-start left-0 right-[-0.01px] top-[22.5px]" data-name="Container">
      <Options />
      <Container19 />
    </div>
  );
}

function Container16() {
  return (
    <div className="h-[70.5px] relative shrink-0 w-full" data-name="Container">
      <div className="-translate-y-1/2 absolute flex flex-col font-['Inter:Regular',sans-serif] font-normal justify-center leading-[0] left-[4px] not-italic text-[11px] text-[rgba(89,65,62,0.7)] top-[8px] tracking-[1.1px] uppercase whitespace-nowrap">
        <p className="leading-[16.5px]">INSTITUIÇÃO ACADÉMICA</p>
      </div>
      <Container17 />
    </div>
  );
}

function Container22() {
  return (
    <div className="content-stretch flex flex-[1_0_0] flex-col items-start min-w-px overflow-clip relative" data-name="Container">
      <div className="flex flex-col font-['Inter:Regular',sans-serif] font-normal justify-center leading-[0] not-italic relative shrink-0 text-[#a8a29e] text-[16px] w-full">
        <p className="leading-[normal]">••••••••</p>
      </div>
    </div>
  );
}

function Input2() {
  return (
    <div className="bg-[#e4e2e0] relative rounded-[6px] shrink-0 w-full" data-name="Input">
      <div className="flex flex-row justify-center overflow-clip rounded-[inherit] size-full">
        <div className="content-stretch flex items-start justify-center px-[16px] py-[14px] relative size-full">
          <Container22 />
        </div>
      </div>
    </div>
  );
}

function Container23() {
  return (
    <div className="h-[15px] relative shrink-0 w-[22px]" data-name="Container">
      <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 22 15">
        <g id="Container">
          <path d={svgPaths.p3e801e80} fill="var(--fill-0, #A8A29E)" id="Icon" />
        </g>
      </svg>
    </div>
  );
}

function Button() {
  return (
    <div className="absolute bottom-[34.04%] content-stretch flex flex-col items-center justify-center right-[12px] top-[34.04%]" data-name="Button">
      <Container23 />
    </div>
  );
}

function Container21() {
  return (
    <div className="absolute content-stretch flex flex-col items-start left-0 right-[-0.01px] top-[22.5px]" data-name="Container">
      <Input2 />
      <Button />
    </div>
  );
}

function Container20() {
  return (
    <div className="h-[70.5px] relative shrink-0 w-full" data-name="Container">
      <div className="-translate-y-1/2 absolute flex flex-col font-['Inter:Regular',sans-serif] font-normal justify-center leading-[0] left-[4px] not-italic text-[11px] text-[rgba(89,65,62,0.7)] top-[8px] tracking-[1.1px] uppercase whitespace-nowrap">
        <p className="leading-[16.5px]">PALAVRA-PASSE</p>
      </div>
      <Container21 />
    </div>
  );
}

function Container25() {
  return (
    <div className="content-stretch flex h-[20px] items-center relative shrink-0" data-name="Container">
      <div className="bg-[#e4e2e0] relative rounded-[2px] shrink-0 size-[16px]" data-name="Input" />
    </div>
  );
}

function Container24() {
  return (
    <div className="content-stretch flex gap-[12px] items-start pb-[24px] pt-[8px] relative shrink-0 w-full" data-name="Container">
      <Container25 />
      <div className="flex flex-col font-['Inter:Regular',sans-serif] font-normal justify-center leading-[0] not-italic relative shrink-0 text-[#59413e] text-[12px] whitespace-nowrap">
        <p>
          <span className="leading-[19.5px]">{`Concordo com os `}</span>
          <span className="font-['Inter:Regular',sans-serif] font-normal leading-[19.5px] not-italic text-[#6f0008]">Termos de Uso</span>
          <span className="leading-[19.5px]">{` e a `}</span>
          <span className="font-['Inter:Regular',sans-serif] font-normal leading-[19.5px] not-italic text-[#6f0008]">Política de Privacidade</span>
          <span className="leading-[19.5px]">{` do projecto.`}</span>
        </p>
      </div>
    </div>
  );
}

function Container26() {
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

function Button1() {
  return (
    <div className="bg-[#6f0008] content-stretch flex gap-[8px] items-center justify-center py-[16px] relative rounded-[12px] shrink-0 w-full" data-name="Button">
      <div className="flex flex-col font-['Inter:Regular',sans-serif] font-normal justify-center leading-[0] not-italic relative shrink-0 text-[14px] text-center text-white tracking-[1.4px] uppercase whitespace-nowrap">
        <p className="leading-[20px]">CRIAR CONTA</p>
      </div>
      <Container26 />
    </div>
  );
}

function Form() {
  return (
    <div className="content-stretch flex flex-col gap-[24px] items-start pt-[8px] relative shrink-0 w-full" data-name="Form">
      <Container12 />
      <Container14 />
      <Container16 />
      <Container20 />
      <Container24 />
      <Button1 />
    </div>
  );
}

function Container27() {
  return (
    <div className="relative shrink-0 w-full" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col items-center relative size-full">
        <div className="flex flex-col font-['Inter:Regular',sans-serif] font-normal justify-center leading-[0] not-italic relative shrink-0 text-[#59413e] text-[14px] text-center whitespace-nowrap">
          <p className="leading-[20px]">Já possui uma conta académica?</p>
        </div>
      </div>
    </div>
  );
}

function Link() {
  return (
    <div className="relative shrink-0 cursor-pointer" data-name="Link" data-nav="login">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-start justify-center relative size-full">
        <div className="flex flex-col font-['Inter:Regular',sans-serif] font-normal justify-center leading-[0] not-italic relative shrink-0 text-[#6f0008] text-[16px] text-center whitespace-nowrap">
          <p className="leading-[24px]">Aceder ao Arquivo</p>
        </div>
      </div>
    </div>
  );
}

function HorizontalBorder() {
  return (
    <div className="content-stretch flex flex-col gap-[8px] items-center pt-[33px] relative shrink-0 w-full" data-name="HorizontalBorder">
      <div aria-hidden="true" className="absolute border-[rgba(224,191,187,0.2)] border-solid border-t inset-0 pointer-events-none" />
      <Container27 />
      <Link />
    </div>
  );
}

function Container9() {
  return (
    <div className="content-stretch flex flex-col gap-[32px] items-start max-w-[448px] relative shrink-0 w-full" data-name="Container">
      <Container10 />
      <Form />
      <HorizontalBorder />
    </div>
  );
}

function Background1() {
  return (
    <div className="bg-white col-[6/span_7] justify-self-stretch relative row-1 self-start shrink-0" data-name="Background">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col items-start px-[111.42px] py-[64px] relative size-full">
        <Container9 />
      </div>
    </div>
  );
}

function BackgroundBorderShadow() {
  return (
    <div className="bg-[#f5f3f1] max-w-[1152px] relative rounded-[8px] shrink-0 w-[1152px]" data-name="Background+Border+Shadow">
      <div className="grid grid-cols-[repeat(12,minmax(0,1fr))] grid-rows-[_859px] max-w-[inherit] overflow-clip p-px relative rounded-[inherit] size-full">
        <Background />
        <Background1 />
      </div>
      <div aria-hidden="true" className="absolute border border-[rgba(224,191,187,0.2)] border-solid inset-0 pointer-events-none rounded-[8px] shadow-[0px_25px_50px_-12px_rgba(27,28,27,0.05)]" />
    </div>
  );
}

function Main() {
  return (
    <div className="relative shrink-0 w-full z-[2]" data-name="Main">
      <div className="flex flex-row items-center justify-center size-full">
        <div className="content-stretch flex items-center justify-center px-[24px] py-[79px] relative size-full">
          <div className="absolute inset-0 opacity-10" style={{ backgroundImage: "url('data:image/svg+xml;utf8,<svg viewBox=\\'0 0 1280 1019\\' xmlns=\\'http://www.w3.org/2000/svg\\' preserveAspectRatio=\\'none\\'><rect x=\\'0\\' y=\\'0\\' height=\\'100%\\' width=\\'100%\\' fill=\\'url(%23grad)\\' opacity=\\'1\\'/><defs><radialGradient id=\\'grad\\' gradientUnits=\\'userSpaceOnUse\\' cx=\\'0\\' cy=\\'0\\' r=\\'10\\' gradientTransform=\\'matrix(90.51 0 0 72.054 640 509.5)\\'><stop stop-color=\\'rgba(111,0,8,1)\\' offset=\\'0.017678\\'/><stop stop-color=\\'rgba(111,0,8,0)\\' offset=\\'0.017678\\'/></radialGradient></defs></svg>')" }} data-name="Gradient" />
          <BackgroundBorderShadow />
        </div>
      </div>
    </div>
  );
}

function Container31() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0 w-full" data-name="Container">
      <div className="flex flex-col font-['Inter:Regular',sans-serif] font-normal justify-center leading-[0] not-italic relative shrink-0 text-[#6f0008] text-[18px] whitespace-nowrap">
        <p className="leading-[28px]">Economia com História</p>
      </div>
    </div>
  );
}

function Container32() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0 w-full" data-name="Container">
      <div className="flex flex-col font-['Inter:Regular',sans-serif] font-normal justify-center leading-[0] not-italic relative shrink-0 text-[#78716c] text-[14px] tracking-[0.35px] whitespace-nowrap">
        <p className="leading-[20px]">© 2026 Economia com História. Um arquivo académico digital.</p>
      </div>
    </div>
  );
}

function Container30() {
  return (
    <div className="content-stretch flex flex-col gap-[8px] items-start relative shrink-0 w-[434px]" data-name="Container">
      <Container31 />
      <Container32 />
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

function Container33() {
  return (
    <div className="content-stretch flex gap-[32px] h-[20px] items-start relative shrink-0" data-name="Container">
      <Link1 />
      <Link2 />
      <Link3 />
      <Link4 />
    </div>
  );
}

function Container29() {
  return (
    <div className="content-stretch flex items-center justify-between relative shrink-0 w-full" data-name="Container">
      <Container30 />
      <Container33 />
    </div>
  );
}

function Container28() {
  return (
    <div className="max-w-[1440px] relative shrink-0 w-full" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col gap-[32px] items-start max-w-[inherit] relative size-full">
        <div className="bg-[rgba(224,191,187,0.2)] h-px relative shrink-0 w-full" data-name="Horizontal Divider" />
        <Container29 />
      </div>
    </div>
  );
}

function Footer() {
  return (
    <div className="bg-[#f5f3f1] relative shrink-0 w-full z-[1]" data-name="Footer">
      <div aria-hidden="true" className="absolute border-[#e7e5e4] border-solid border-t inset-0 pointer-events-none" />
      <div className="content-stretch flex flex-col items-start pb-[48px] pt-[49px] px-[48px] relative size-full">
        <Container28 />
      </div>
    </div>
  );
}

function HtmlBody() {
  return (
    <div className="absolute content-stretch flex flex-col isolate items-start left-0 min-h-[1294px] top-0 w-[1280px]" style={{ backgroundImage: "linear-gradient(90deg, rgb(251, 249, 247) 0%, rgb(251, 249, 247) 100%), linear-gradient(90deg, rgb(255, 255, 255) 0%, rgb(255, 255, 255) 100%)" }} data-name="Html → Body">
      <Header />
      <Main />
      <Footer />
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