import { useState } from 'react';
import { Link, useNavigate } from 'react-router';
import AuthHeader from '../components/AuthHeader';
import AuthFooter from '../components/AuthFooter';
import svgPaths from '../../imports/PaginaInicialDesktop-2/svg-9t8rdcd748';
import backgroundImg from '../../imports/Frame17-1/4a0cc1180c84c33b9b441c98f3577f51eefa8645.png';

export default function SignUp() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    institution: '',
    password: '',
    confirmPassword: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Simular criação de conta e redirecionar para início
    navigate('/inicio');
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#f8f9ff]">
      <AuthHeader />

      <main className="flex-1 w-full relative">
        {/* Background Image with Overlay */}
        <div className="absolute inset-0 opacity-[0.03]">
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <img
              alt=""
              className="absolute h-full left-[-39.64%] max-w-none top-0 w-[179.27%] object-cover"
              src={backgroundImg}
            />
          </div>
          <div className="absolute inset-0 bg-white mix-blend-saturation" />
        </div>

        <div className="relative z-10 flex items-center justify-center px-[24px] py-[48px] md:py-[64px] lg:py-[80px] min-h-full">
          <div className="w-full max-w-[420px] md:max-w-[520px] flex flex-col gap-[24px] md:gap-[32px]">
            {/* Hero Branding/Intro */}
            <div className="flex flex-col gap-[10px] md:gap-[12px] items-center w-full">
              <h1 className="font-['IBM_Plex_Sans:Bold',sans-serif] font-bold text-[#6b0119] text-[36px] md:text-[42px] lg:text-[48px] text-center tracking-[-1.2px] leading-[42px] md:leading-[46px] lg:leading-[48px]" style={{ fontVariationSettings: "'wdth' 100" }}>
                Criar Conta
              </h1>

              <p className="font-['Source_Sans_3:Regular',sans-serif] font-normal text-[#574142] text-[15px] md:text-[16px] text-center leading-[24px] md:leading-[26px] max-w-[400px] md:max-w-[440px]">
                Junte-se à nossa comunidade académica e contribua para a preservação da história económica de Angola.
              </p>
            </div>

            {/* SignUp Card */}
            <div className="bg-white drop-shadow-[0px_1px_2px_0px_rgba(0,0,0,0.05)] rounded-[6px] md:rounded-[8px] w-full">
              <div className="p-[32px] md:p-[36px] lg:p-[40px] flex flex-col gap-[20px] md:gap-[24px]">
                {/* Form */}
                <form onSubmit={handleSubmit} className="flex flex-col gap-[18px] md:gap-[20px] w-full">
                  {/* Name Field */}
                  <div className="flex flex-col gap-[5px] md:gap-[6px] w-full">
                    <label className="font-['Source_Sans_3:Bold',sans-serif] font-bold text-[#574142] text-[11px] md:text-[12px] tracking-[1.2px] uppercase leading-[14px] md:leading-[16px]">
                      NOME COMPLETO
                    </label>

                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="José António Silva"
                      required
                      className="w-full px-[14px] md:px-[16px] py-[14px] md:py-[16px] lg:py-[18px] bg-[#f1f5f9] rounded-[3px] md:rounded-[4px] border border-[rgba(226,232,240,0.8)] focus:border-[#6b0119] focus:bg-white transition-all font-['Source_Sans_3:Regular',sans-serif] font-normal text-[#121c2a] text-[15px] md:text-[16px] outline-none placeholder:text-[#94a3b8]"
                    />
                  </div>

                  {/* Email Field */}
                  <div className="flex flex-col gap-[5px] md:gap-[6px] w-full">
                    <label className="font-['Source_Sans_3:Bold',sans-serif] font-bold text-[#574142] text-[11px] md:text-[12px] tracking-[1.2px] uppercase leading-[14px] md:leading-[16px]">
                      EMAIL INSTITUCIONAL
                    </label>

                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="nome@instituicao.edu"
                      required
                      className="w-full px-[14px] md:px-[16px] py-[14px] md:py-[16px] lg:py-[18px] bg-[#f1f5f9] rounded-[3px] md:rounded-[4px] border border-[rgba(226,232,240,0.8)] focus:border-[#6b0119] focus:bg-white transition-all font-['Source_Sans_3:Regular',sans-serif] font-normal text-[#121c2a] text-[15px] md:text-[16px] outline-none placeholder:text-[#94a3b8]"
                    />
                  </div>

                  {/* Institution Field */}
                  <div className="flex flex-col gap-[5px] md:gap-[6px] w-full">
                    <label className="font-['Source_Sans_3:Bold',sans-serif] font-bold text-[#574142] text-[11px] md:text-[12px] tracking-[1.2px] uppercase leading-[14px] md:leading-[16px]">
                      INSTITUIÇÃO ACADÉMICA
                    </label>

                    <input
                      type="text"
                      name="institution"
                      value={formData.institution}
                      onChange={handleChange}
                      placeholder="Universidade de..."
                      required
                      className="w-full px-[14px] md:px-[16px] py-[14px] md:py-[16px] lg:py-[18px] bg-[#f1f5f9] rounded-[3px] md:rounded-[4px] border border-[rgba(226,232,240,0.8)] focus:border-[#6b0119] focus:bg-white transition-all font-['Source_Sans_3:Regular',sans-serif] font-normal text-[#121c2a] text-[15px] md:text-[16px] outline-none placeholder:text-[#94a3b8]"
                    />
                  </div>

                  {/* Password Field */}
                  <div className="flex flex-col gap-[5px] md:gap-[6px] w-full">
                    <label className="font-['Source_Sans_3:Bold',sans-serif] font-bold text-[#574142] text-[11px] md:text-[12px] tracking-[1.2px] uppercase leading-[14px] md:leading-[16px]">
                      PALAVRA-PASSE
                    </label>

                    <input
                      type="password"
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      placeholder="••••••••"
                      required
                      className="w-full px-[14px] md:px-[16px] py-[14px] md:py-[16px] lg:py-[18px] bg-[#f1f5f9] rounded-[3px] md:rounded-[4px] border border-[rgba(226,232,240,0.8)] focus:border-[#6b0119] focus:bg-white transition-all font-['Source_Sans_3:Regular',sans-serif] font-normal text-[#121c2a] text-[15px] md:text-[16px] outline-none placeholder:text-[#94a3b8]"
                    />
                  </div>

                  {/* Confirm Password Field */}
                  <div className="flex flex-col gap-[5px] md:gap-[6px] w-full">
                    <label className="font-['Source_Sans_3:Bold',sans-serif] font-bold text-[#574142] text-[11px] md:text-[12px] tracking-[1.2px] uppercase leading-[14px] md:leading-[16px]">
                      CONFIRMAR PALAVRA-PASSE
                    </label>

                    <input
                      type="password"
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      placeholder="••••••••"
                      required
                      className="w-full px-[14px] md:px-[16px] py-[14px] md:py-[16px] lg:py-[18px] bg-[#f1f5f9] rounded-[3px] md:rounded-[4px] border border-[rgba(226,232,240,0.8)] focus:border-[#6b0119] focus:bg-white transition-all font-['Source_Sans_3:Regular',sans-serif] font-normal text-[#121c2a] text-[15px] md:text-[16px] outline-none placeholder:text-[#94a3b8]"
                    />
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    className="w-full bg-[#8b1e2d] py-[14px] md:py-[16px] rounded-[6px] md:rounded-[8px] lg:rounded-[12px] flex items-center justify-center gap-[8px] cursor-pointer hover:bg-[#7a1a27] transition-colors mt-[4px] md:mt-[6px]"
                  >
                    <span className="font-['Source_Sans_3:SemiBold',sans-serif] font-semibold text-white text-[15px] md:text-[16px] leading-[22px] md:leading-[24px]">
                      Solicitar Criação de Conta
                    </span>
                    <svg className="size-[12px] md:size-[13.333px]" fill="none" preserveAspectRatio="none" viewBox="0 0 16 16">
                      <path d={svgPaths.p1a406200} fill="white" />
                    </svg>
                  </button>
                </form>

                {/* Divider */}
                <div className="bg-[rgba(222,191,191,0.2)] h-px w-full" />

                {/* Secondary Action */}
                <div className="flex flex-col gap-[14px] md:gap-[16px] items-center w-full">
                  <p className="font-['Source_Sans_3:Regular',sans-serif] font-normal text-[#64748b] text-[13px] md:text-[14px] text-center leading-[18px] md:leading-[20px]">
                    Já tem uma conta no arquivo?
                  </p>

                  <Link to="/login" className="w-full">
                    <button className="w-full bg-[#dee9fc] px-[28px] md:px-[32px] py-[10px] md:py-[12px] rounded-[8px] md:rounded-[12px] cursor-pointer hover:bg-[#d0e0f7] transition-colors">
                      <span className="font-['Source_Sans_3:SemiBold',sans-serif] font-semibold text-[#6b0119] text-[13px] md:text-[14px] leading-[18px] md:leading-[20px]">
                        Entrar na Conta Existente
                      </span>
                    </button>
                  </Link>
                </div>
              </div>
            </div>

            {/* Academic Footer/Notice */}
            <p className="font-['Source_Sans_3:Regular',sans-serif] font-normal text-[#94a3b8] text-[11px] md:text-[12px] text-center leading-[17px] md:leading-[19.5px]">
              As solicitações de conta são revisadas pela nossa equipa académica.<br />
              Receberá uma notificação por email após a aprovação.
            </p>
          </div>
        </div>
      </main>

      <AuthFooter />
    </div>
  );
}
