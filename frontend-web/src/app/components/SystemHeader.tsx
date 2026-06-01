import { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router';
import { User, LogOut } from 'lucide-react';
import svgPaths from '../../imports/PerfilDoInvestigadorDesktop/svg-vpdt0cnbmp';
import avatarImg from '../../imports/PerfilDoInvestigadorDesktop/8c711ec32be972eef06cb0eef1620adc2b98ee6c.png';

export default function SystemHeader() {
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setProfileDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const isActive = (path: string) => location.pathname === path;

  const handleNavigation = (path: string) => {
    navigate(path);
    setMobileMenuOpen(false);
  };

  return (
    <div className="backdrop-blur-[32px] bg-[rgba(255,255,255,0.85)] max-w-[1536px] relative shrink-0 w-full z-50" data-name="TopNavBar Navigation Shell">
      <div className="flex flex-col max-w-[inherit] w-full">
        <div className="content-stretch flex items-center justify-between max-w-[inherit] px-[24px] md:px-[32px] lg:px-[48px] py-[16px] md:py-[20px] lg:py-[24px] relative w-full">
          {/* Logo */}
          <div
            className="content-stretch flex flex-col items-start relative shrink-0 cursor-pointer"
            data-name="Container"
            onClick={() => handleNavigation('/inicio')}
          >
            <div className="flex flex-col font-['Source_Sans_3:Bold',sans-serif] font-bold justify-center leading-[0] relative shrink-0 text-[#7f1d1d] text-[18px] md:text-[20px] lg:text-[24px] tracking-[-1.2px] whitespace-nowrap">
              <p className="leading-[24px] md:leading-[28px] lg:leading-[32px]">Economia com História</p>
            </div>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="lg:hidden flex flex-col justify-center items-center gap-[5px] p-2 cursor-pointer z-50 bg-transparent border-none"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Menu"
            type="button"
          >
            <span className={`block w-6 h-[2px] bg-[#7f1d1d] transition-all duration-300 ${mobileMenuOpen ? 'rotate-45 translate-y-[7px]' : ''}`}></span>
            <span className={`block w-6 h-[2px] bg-[#7f1d1d] transition-all duration-300 ${mobileMenuOpen ? 'opacity-0' : 'opacity-100'}`}></span>
            <span className={`block w-6 h-[2px] bg-[#7f1d1d] transition-all duration-300 ${mobileMenuOpen ? '-rotate-45 -translate-y-[7px]' : ''}`}></span>
          </button>

          {/* Desktop Navigation Links */}
          <div className="hidden lg:flex gap-[24px] xl:gap-[32px] items-center relative shrink-0" data-name="Container">
            {/* Início */}
            <div
              className="group content-stretch flex flex-col items-start pb-[4px] relative shrink-0 cursor-pointer transition-all"
              data-name="Link"
              onClick={() => handleNavigation('/inicio')}
            >
              {isActive('/inicio') && (
                <div aria-hidden="true" className="absolute border-[#7f1d1d] border-b-2 border-solid inset-0 pointer-events-none" />
              )}
              <div className={`flex flex-col font-['Source_Sans_3:${isActive('/inicio') ? 'Bold' : 'Medium'}',sans-serif] font-${isActive('/inicio') ? 'bold' : 'medium'} justify-center leading-[0] relative shrink-0 text-[14px] xl:text-[16px] whitespace-nowrap transition-colors group-hover:text-[#7f1d1d]`} style={{ color: isActive('/inicio') ? '#7f1d1d' : '#475569' }}>
                <p className="leading-[24px]">Início</p>
              </div>
            </div>

            {/* Conteúdos */}
            <div
              className="group content-stretch flex flex-col items-start pb-[4px] relative shrink-0 cursor-pointer transition-all"
              data-name="Link"
              onClick={() => handleNavigation('/arquivo')}
            >
              {isActive('/arquivo') && (
                <div aria-hidden="true" className="absolute border-[#7f1d1d] border-b-2 border-solid inset-0 pointer-events-none" />
              )}
              <div className={`flex flex-col font-['Source_Sans_3:${isActive('/arquivo') ? 'Bold' : 'Medium'}',sans-serif] font-${isActive('/arquivo') ? 'bold' : 'medium'} justify-center leading-[0] relative shrink-0 text-[14px] xl:text-[16px] whitespace-nowrap transition-colors group-hover:text-[#7f1d1d]`} style={{ color: isActive('/arquivo') ? '#7f1d1d' : '#475569' }}>
                <p className="leading-[24px]">Conteúdos</p>
              </div>
            </div>

            {/* Comunidade */}
            <div
              className="group content-stretch flex flex-col items-start pb-[4px] relative shrink-0 cursor-pointer transition-all"
              data-name="Link"
              onClick={() => handleNavigation('/comunidade')}
            >
              {(isActive('/comunidade') || location.pathname.startsWith('/comunidade/')) && (
                <div aria-hidden="true" className="absolute border-[#7f1d1d] border-b-2 border-solid inset-0 pointer-events-none" />
              )}
              <div className={`flex flex-col font-['Source_Sans_3:${(isActive('/comunidade') || location.pathname.startsWith('/comunidade/')) ? 'Bold' : 'Medium'}',sans-serif] font-${(isActive('/comunidade') || location.pathname.startsWith('/comunidade/')) ? 'bold' : 'medium'} justify-center leading-[0] relative shrink-0 text-[14px] xl:text-[16px] whitespace-nowrap transition-colors group-hover:text-[#7f1d1d]`} style={{ color: (isActive('/comunidade') || location.pathname.startsWith('/comunidade/')) ? '#7f1d1d' : '#475569' }}>
                <p className="leading-[24px]">Comunidade</p>
              </div>
            </div>

            {/* Quiz */}
            <div
              className="group content-stretch flex flex-col items-start pb-[4px] relative shrink-0 cursor-pointer transition-all"
              data-name="Link"
              onClick={() => handleNavigation('/quiz')}
            >
              {(isActive('/quiz') || location.pathname.startsWith('/quiz/')) && (
                <div aria-hidden="true" className="absolute border-[#7f1d1d] border-b-2 border-solid inset-0 pointer-events-none" />
              )}
              <div className={`flex flex-col font-['Source_Sans_3:${(isActive('/quiz') || location.pathname.startsWith('/quiz/')) ? 'Bold' : 'Medium'}',sans-serif] font-${(isActive('/quiz') || location.pathname.startsWith('/quiz/')) ? 'bold' : 'medium'} justify-center leading-[0] relative shrink-0 text-[14px] xl:text-[16px] whitespace-nowrap transition-colors group-hover:text-[#7f1d1d]`} style={{ color: (isActive('/quiz') || location.pathname.startsWith('/quiz/')) ? '#7f1d1d' : '#475569' }}>
                <p className="leading-[24px]">Quiz</p>
              </div>
            </div>
          </div>

          {/* Right Side: Notification + Avatar */}
          <div className="hidden lg:flex gap-[12px] xl:gap-[15.99px] items-center relative shrink-0" data-name="Container">
            {/* Notification Button */}
            <div className="relative shrink-0 size-[28px] xl:size-[34px] cursor-pointer hover:opacity-70 transition-opacity" data-name="Button">
              <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 34 34">
                <g id="Button">
                  <path d={svgPaths.p266e0b00} fill="var(--fill-0, #475569)" id="Icon" />
                </g>
              </svg>
            </div>

            {/* Avatar with Dropdown */}
            <div ref={dropdownRef} className="relative">
              <div
                className="bg-[#8b1e2d] content-stretch flex flex-col items-start justify-center overflow-clip relative rounded-[10px] xl:rounded-[12px] shrink-0 size-[28px] xl:size-[32px] cursor-pointer hover:opacity-90 transition-opacity ring-2 ring-transparent hover:ring-[#8b1e2d] hover:ring-opacity-30"
                data-name="Background"
                onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
              >
                <div className="flex-[1_0_0] min-h-px relative w-full">
                  <div className="absolute inset-0 overflow-hidden pointer-events-none">
                    <img alt="Avatar" className="absolute h-[133.33%] left-[0.75%] max-w-none top-[-1.54%] w-full" src={avatarImg} />
                  </div>
                </div>
              </div>

              {/* Dropdown Menu */}
              {profileDropdownOpen && (
                <>
                  <style>{`
                    @keyframes profileDropdownSlide {
                      from {
                        opacity: 0;
                        transform: translateY(-8px);
                      }
                      to {
                        opacity: 1;
                        transform: translateY(0);
                      }
                    }
                  `}</style>
                  <div
                    className="absolute right-0 top-[calc(100%+8px)] w-[200px] bg-white border border-[#debfbf] rounded-[6px] shadow-[0px_4px_16px_rgba(0,0,0,0.12)] overflow-hidden z-50"
                    style={{ animation: 'profileDropdownSlide 200ms ease-out forwards' }}
                  >
                    {/* Profile Option */}
                    <button
                      onClick={() => {
                        handleNavigation('/perfil');
                        setProfileDropdownOpen(false);
                      }}
                      className="w-full flex items-center gap-[12px] px-[16px] py-[12px] hover:bg-[#f8f9ff] transition-colors text-left border-b border-[rgba(222,191,191,0.2)]"
                    >
                      <User className="size-[18px] text-[#6b0119]" />
                      <span className="font-['Source_Sans_3:SemiBold',sans-serif] font-semibold text-[#121c2a] text-[14px] leading-[20px]">
                        Meu Perfil
                      </span>
                    </button>

                    {/* Logout Option */}
                    <button
                      onClick={() => {
                        setProfileDropdownOpen(false);
                        navigate('/login');
                      }}
                      className="w-full flex items-center gap-[12px] px-[16px] py-[12px] hover:bg-[#fff5f5] transition-colors text-left"
                    >
                      <LogOut className="size-[18px] text-[#8b1e2d]" />
                      <span className="font-['Source_Sans_3:SemiBold',sans-serif] font-semibold text-[#8b1e2d] text-[14px] leading-[20px]">
                        Sair
                      </span>
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        <div className={`lg:hidden overflow-hidden transition-all duration-300 ease-in-out bg-[rgba(255,255,255,0.98)] ${mobileMenuOpen ? 'max-h-[600px] border-t border-[rgba(226,232,240,0.5)]' : 'max-h-0 border-t-0'}`}>
          <div className="flex flex-col gap-[4px] px-[24px] pb-[20px] pt-[12px]">
          {/* Mobile Início */}
          <div
            className="flex items-center py-[12px] cursor-pointer hover:bg-[rgba(127,29,29,0.05)] px-[12px] rounded-[6px] transition-colors"
            onClick={() => handleNavigation('/inicio')}
          >
            <span className={`font-['Source_Sans_3:${isActive('/inicio') ? 'Bold' : 'Medium'}',sans-serif] text-[16px]`} style={{ color: isActive('/inicio') ? '#7f1d1d' : '#475569' }}>
              Início
            </span>
          </div>

          {/* Mobile Conteúdos */}
          <div
            className="flex items-center py-[12px] cursor-pointer hover:bg-[rgba(127,29,29,0.05)] px-[12px] rounded-[6px] transition-colors"
            onClick={() => handleNavigation('/arquivo')}
          >
            <span className={`font-['Source_Sans_3:${isActive('/arquivo') ? 'Bold' : 'Medium'}',sans-serif] text-[16px]`} style={{ color: isActive('/arquivo') ? '#7f1d1d' : '#475569' }}>
              Conteúdos
            </span>
          </div>

          {/* Mobile Comunidade */}
          <div
            className="flex items-center py-[12px] cursor-pointer hover:bg-[rgba(127,29,29,0.05)] px-[12px] rounded-[6px] transition-colors"
            onClick={() => handleNavigation('/comunidade')}
          >
            <span className={`font-['Source_Sans_3:${(isActive('/comunidade') || location.pathname.startsWith('/comunidade/')) ? 'Bold' : 'Medium'}',sans-serif] text-[16px]`} style={{ color: (isActive('/comunidade') || location.pathname.startsWith('/comunidade/')) ? '#7f1d1d' : '#475569' }}>
              Comunidade
            </span>
          </div>

          {/* Mobile Quiz */}
          <div
            className="flex items-center py-[12px] cursor-pointer hover:bg-[rgba(127,29,29,0.05)] px-[12px] rounded-[6px] transition-colors"
            onClick={() => handleNavigation('/quiz')}
          >
            <span className={`font-['Source_Sans_3:${(isActive('/quiz') || location.pathname.startsWith('/quiz/')) ? 'Bold' : 'Medium'}',sans-serif] text-[16px]`} style={{ color: (isActive('/quiz') || location.pathname.startsWith('/quiz/')) ? '#7f1d1d' : '#475569' }}>
              Quiz
            </span>
          </div>

          {/* Mobile Divider */}
          <div className="h-[1px] bg-[rgba(226,232,240,0.5)] my-[8px]"></div>

          {/* Mobile User Profile */}
          <div
            className="flex items-center gap-[12px] py-[12px] px-[12px] cursor-pointer hover:bg-[rgba(127,29,29,0.05)] rounded-[6px] transition-colors"
            onClick={() => handleNavigation('/perfil')}
          >
            <div className="bg-[#8b1e2d] content-stretch flex flex-col items-start justify-center overflow-clip relative rounded-[10px] shrink-0 size-[32px]" data-name="Background">
              <div className="flex-[1_0_0] min-h-px relative w-full">
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                  <img alt="Avatar" className="absolute h-[133.33%] left-[0.75%] max-w-none top-[-1.54%] w-full" src={avatarImg} />
                </div>
              </div>
            </div>
            <div className="flex items-center gap-[8px]">
              <User className="size-[16px] text-[#6b0119]" />
              <span className={`font-['Source_Sans_3:${isActive('/perfil') ? 'Bold' : 'Medium'}',sans-serif] text-[14px]`} style={{ color: isActive('/perfil') ? '#7f1d1d' : '#475569' }}>
                Meu Perfil
              </span>
            </div>
          </div>

          {/* Mobile Logout */}
          <div
            className="flex items-center gap-[12px] py-[12px] px-[12px] cursor-pointer hover:bg-[rgba(139,30,45,0.05)] rounded-[6px] transition-colors"
            onClick={() => {
              setMobileMenuOpen(false);
              navigate('/login');
            }}
          >
            <div className="size-[32px] flex items-center justify-center">
              <LogOut className="size-[18px] text-[#8b1e2d]" />
            </div>
            <span className="font-['Source_Sans_3:SemiBold',sans-serif] font-semibold text-[#8b1e2d] text-[14px]">
              Sair
            </span>
          </div>
        </div>
      </div>
      </div>
    </div>
  );
}
