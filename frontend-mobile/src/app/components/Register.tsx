import React, { useState } from 'react';
import { ArrowLeft, Eye, EyeOff } from 'lucide-react';

interface RegisterProps {
  onBack: () => void;
  onLogin: () => void;
  onSuccess?: () => void;
}

export default function Register({ onBack, onLogin, onSuccess }: RegisterProps) {
  const [step, setStep] = useState(1);
  const [showPassword, setShowPassword] = useState(false);

  // Step 1 fields
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // Step 2 fields
  const [academicLevel, setAcademicLevel] = useState('');
  const [interests, setInterests] = useState<string[]>([]);

  const [emailError, setEmailError] = useState('');
  const [passwordStrength, setPasswordStrength] = useState(0);

  const validateEmail = (value: string) => {
    if (value && !value.includes('@')) {
      setEmailError('Email inválido');
    } else {
      setEmailError('');
    }
  };

  const calculatePasswordStrength = (value: string) => {
    let strength = 0;
    if (value.length >= 8) strength++;
    if (/[A-Z]/.test(value)) strength++;
    if (/[0-9]/.test(value)) strength++;
    setPasswordStrength(strength);
  };

  const toggleInterest = (interest: string) => {
    if (interests.includes(interest)) {
      setInterests(interests.filter(i => i !== interest));
    } else {
      setInterests([...interests, interest]);
    }
  };

  const canContinueStep1 = fullName && email && password.length >= 8 && !emailError;
  const canCompleteStep2 = academicLevel && interests.length > 0;

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Status Bar */}
      <div className="h-11 bg-white flex items-center justify-between px-5">
        <span className="font-['IBM_Plex_Sans'] font-bold text-[15px]">9:41</span>
        <div className="flex gap-1">
          <div className="w-4 h-4">📶</div>
          <div className="w-4 h-4">📡</div>
          <div className="w-4 h-4">🔋</div>
        </div>
      </div>

      {/* Header */}
      <div className="px-5 py-4 border-b border-[#E5E7EB]">
        <button
          onClick={step === 1 ? onBack : () => setStep(1)}
          className="flex items-center gap-2 text-[#8B1E2D] font-['Source_Sans_3'] font-semibold mb-4"
        >
          <ArrowLeft className="w-5 h-5" />
          {step === 1 ? 'Voltar' : 'Anterior'}
        </button>

        {/* Progress Indicator */}
        <div className="flex items-center gap-2">
          <div className="flex-1 h-1 bg-[#8B1E2D] rounded-full"></div>
          <div className={`flex-1 h-1 ${step === 2 ? 'bg-[#8B1E2D]' : 'bg-[#E5E7EB]'} rounded-full transition-colors`}></div>
        </div>
        <p className="mt-2 font-['Source_Sans_3'] text-[12px] text-[#9CA3AF]">
          Passo {step} de 2
        </p>
      </div>

      {/* Content */}
      <div className="flex-1 px-5 py-8">
        {step === 1 ? (
          <>
            <h1 className="font-['IBM_Plex_Sans'] font-bold text-[26px] text-[#1F2937] mb-2">
              Cria a tua conta
            </h1>
            <p className="font-['Source_Sans_3'] text-[16px] text-[#4B5563] mb-8">
              Preenche os teus dados
            </p>

            {/* Google Register */}
            <button onClick={() => { if (onSuccess) onSuccess(); }} className="w-full py-4 bg-white border-2 border-[#E5E7EB] rounded-lg font-['Source_Sans_3'] font-semibold text-[16px] text-[#1F2937] flex items-center justify-center gap-3 mb-6 hover:bg-[#F5F5F5] transition-colors">
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Registar com Google
            </button>

            {/* Divider */}
            <div className="flex items-center gap-4 mb-6">
              <div className="flex-1 h-px bg-[#E5E7EB]"></div>
              <span className="font-['Source_Sans_3'] text-[14px] text-[#9CA3AF]">ou</span>
              <div className="flex-1 h-px bg-[#E5E7EB]"></div>
            </div>

            {/* Form Step 1 */}
            <form className="space-y-5" onSubmit={(e) => { e.preventDefault(); if (canContinueStep1) setStep(2); }}>
              {/* Full Name */}
              <div>
                <label className="block font-['Source_Sans_3'] font-semibold text-[14px] text-[#1F2937] mb-2">
                  Nome completo
                </label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Luís Manuel Ferreira"
                  className="w-full h-12 px-4 bg-white border-2 border-[#E5E7EB] rounded-lg font-['Source_Sans_3'] text-[16px] text-[#1F2937] placeholder:text-[#9CA3AF] focus:outline-none focus:border-[#8B1E2D] transition-colors"
                />
              </div>

              {/* Email */}
              <div>
                <label className="block font-['Source_Sans_3'] font-semibold text-[14px] text-[#1F2937] mb-2">
                  Email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    validateEmail(e.target.value);
                  }}
                  placeholder="o.teu@email.com"
                  className={`w-full h-12 px-4 bg-white border-2 ${
                    emailError ? 'border-[#DC2626] bg-[#FEF2F2]' : 'border-[#E5E7EB]'
                  } rounded-lg font-['Source_Sans_3'] text-[16px] text-[#1F2937] placeholder:text-[#9CA3AF] focus:outline-none focus:border-[#8B1E2D] transition-colors`}
                />
                {emailError && (
                  <p className="mt-2 font-['Source_Sans_3'] text-[14px] text-[#DC2626] flex items-center gap-1">
                    <span>⚠</span> {emailError}
                  </p>
                )}
              </div>

              {/* Password */}
              <div>
                <label className="block font-['Source_Sans_3'] font-semibold text-[14px] text-[#1F2937] mb-2">
                  Palavra-passe
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      calculatePasswordStrength(e.target.value);
                    }}
                    placeholder="mín. 8 caracteres"
                    className="w-full h-12 px-4 pr-12 bg-white border-2 border-[#E5E7EB] rounded-lg font-['Source_Sans_3'] text-[16px] text-[#1F2937] placeholder:text-[#9CA3AF] focus:outline-none focus:border-[#8B1E2D] transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-[#9CA3AF] hover:text-[#4B5563]"
                  >
                    {showPassword ? (
                      <EyeOff className="w-5 h-5" />
                    ) : (
                      <Eye className="w-5 h-5" />
                    )}
                  </button>
                </div>

                {/* Password Strength */}
                {password && (
                  <div className="mt-2">
                    <div className="flex gap-1 mb-1">
                      <div className={`h-1 flex-1 rounded-full ${passwordStrength >= 1 ? 'bg-[#DC2626]' : 'bg-[#E5E7EB]'}`}></div>
                      <div className={`h-1 flex-1 rounded-full ${passwordStrength >= 2 ? 'bg-[#D97706]' : 'bg-[#E5E7EB]'}`}></div>
                      <div className={`h-1 flex-1 rounded-full ${passwordStrength >= 3 ? 'bg-[#16A34A]' : 'bg-[#E5E7EB]'}`}></div>
                    </div>
                    <p className={`font-['Source_Sans_3'] text-[12px] ${
                      passwordStrength === 1 ? 'text-[#DC2626]' :
                      passwordStrength === 2 ? 'text-[#D97706]' :
                      'text-[#16A34A]'
                    }`}>
                      {passwordStrength === 1 ? 'Fraca' : passwordStrength === 2 ? 'Média' : 'Forte'}
                    </p>
                  </div>
                )}
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={!canContinueStep1}
                className="w-full h-12 bg-[#8B1E2D] text-white rounded-lg font-['Source_Sans_3'] font-bold text-[16px] disabled:bg-[#D1D5DB] disabled:text-[#9CA3AF] hover:bg-[#A52535] transition-colors"
              >
                Continuar
              </button>
            </form>
          </>
        ) : (
          <>
            <h1 className="font-['IBM_Plex_Sans'] font-bold text-[26px] text-[#1F2937] mb-2">
              O teu perfil
            </h1>
            <p className="font-['Source_Sans_3'] text-[16px] text-[#4B5563] mb-8">
              Personaliza a tua experiência de aprendizagem
            </p>

            {/* Form Step 2 */}
            <form className="space-y-6" onSubmit={(e) => { e.preventDefault(); if (onSuccess) onSuccess(); }}>
              {/* Academic Level */}
              <div>
                <label className="block font-['Source_Sans_3'] font-semibold text-[14px] text-[#1F2937] mb-3">
                  Nível académico
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {['Ensino Médio', 'Licenciatura', 'Mestrado', 'Outro'].map((level) => (
                    <button
                      key={level}
                      type="button"
                      onClick={() => setAcademicLevel(level)}
                      className={`py-3 px-4 rounded-lg font-['Source_Sans_3'] font-semibold text-[14px] border-2 transition-colors ${
                        academicLevel === level
                          ? 'bg-[#FDF3F4] border-[#8B1E2D] text-[#8B1E2D]'
                          : 'bg-white border-[#E5E7EB] text-[#4B5563] hover:border-[#D1D5DB]'
                      }`}
                    >
                      {level}
                    </button>
                  ))}
                </div>
              </div>

              {/* Interests */}
              <div>
                <label className="block font-['Source_Sans_3'] font-semibold text-[14px] text-[#1F2937] mb-3">
                  Área de interesse
                </label>
                <p className="font-['Source_Sans_3'] text-[12px] text-[#9CA3AF] mb-3">
                  Seleciona pelo menos uma área
                </p>
                <div className="flex flex-wrap gap-2">
                  {['Economia', 'História', 'Política', 'Desenvolvimento', 'Outro'].map((interest) => (
                    <button
                      key={interest}
                      type="button"
                      onClick={() => toggleInterest(interest)}
                      className={`py-2 px-4 rounded-full font-['Source_Sans_3'] font-medium text-[14px] border-2 transition-colors ${
                        interests.includes(interest)
                          ? 'bg-[#8B1E2D] border-[#8B1E2D] text-white'
                          : 'bg-white border-[#E5E7EB] text-[#4B5563] hover:border-[#D1D5DB]'
                      }`}
                    >
                      {interest}
                    </button>
                  ))}
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={!canCompleteStep2}
                className="w-full h-12 bg-[#8B1E2D] text-white rounded-lg font-['Source_Sans_3'] font-bold text-[16px] disabled:bg-[#D1D5DB] disabled:text-[#9CA3AF] hover:bg-[#A52535] transition-colors"
              >
                Criar conta
              </button>
            </form>
          </>
        )}

        {/* Login Link */}
        {step === 1 && (
          <div className="mt-8 text-center">
            <p className="font-['Source_Sans_3'] text-[14px] text-[#9CA3AF]">
              Ao continuar, aceitas os{' '}
              <button className="text-[#8B1E2D] hover:underline">Termos de Uso</button>
              {' '}e{' '}
              <button className="text-[#8B1E2D] hover:underline">Política de Privacidade</button>
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
