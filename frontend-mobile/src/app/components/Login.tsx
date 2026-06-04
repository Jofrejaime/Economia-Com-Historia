import React, { useState } from 'react';
import { ArrowLeft, Eye, EyeOff } from 'lucide-react';

interface LoginProps {
  onBack: () => void;
  onRegister: () => void;
  onSuccess?: () => void;
  onForgotPassword?: () => void;
}

export default function Login({ onBack, onRegister, onSuccess, onForgotPassword }: LoginProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [emailError, setEmailError] = useState('');

  const validateEmail = (value: string) => {
    if (value && !value.includes('@')) {
      setEmailError('Email inválido');
    } else {
      setEmailError('');
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Status Bar */}

      {/* Header */}
      <div className="px-5 py-4 border-b border-[#E5E7EB]">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-[#8B1E2D] font-['Source_Sans_3'] font-semibold"
        >
          <ArrowLeft className="w-5 h-5" />
          Voltar
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 px-5 py-8">
        <h1 className="font-['IBM_Plex_Sans'] font-bold text-[26px] text-[#1F2937] mb-2">
          Bem-vindo de volta
        </h1>
        <p className="font-['Source_Sans_3'] text-[16px] text-[#4B5563] mb-8">
          Entra para continuar a aprender
        </p>

        {/* Google Login */}
        <button onClick={() => { if (onSuccess) onSuccess(); }} className="w-full py-4 bg-white border-2 border-[#E5E7EB] rounded-lg font-['Source_Sans_3'] font-semibold text-[16px] text-[#1F2937] flex items-center justify-center gap-3 mb-6 hover:bg-[#F5F5F5] transition-colors">
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
          </svg>
          Continuar com Google
        </button>

        {/* Divider */}
        <div className="flex items-center gap-4 mb-6">
          <div className="flex-1 h-px bg-[#E5E7EB]"></div>
          <span className="font-['Source_Sans_3'] text-[14px] text-[#9CA3AF]">ou</span>
          <div className="flex-1 h-px bg-[#E5E7EB]"></div>
        </div>

        {/* Form */}
        <form className="space-y-5" onSubmit={(e) => { e.preventDefault(); if (onSuccess) onSuccess(); }}>
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
              className={`w-full h-12 px-4 bg-white border-2 ${emailError ? 'border-[#DC2626] bg-[#FEF2F2]' : 'border-[#E5E7EB]'
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
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
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
          </div>

          {/* Forgot Password */}
          <div className="flex justify-end">
            <button
              type="button"
              onClick={onForgotPassword}
              className="font-['Source_Sans_3'] text-[14px] text-[#8B1E2D] hover:underline"
            >
              Esqueci a palavra-passe
            </button>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={!email || !password || !!emailError}
            className="w-full h-12 bg-[#8B5E3C] text-white rounded-lg font-['Source_Sans_3'] font-bold text-[16px] disabled:bg-[#D1D5DB] disabled:text-[#9CA3AF] hover:bg-[#734D31] transition-colors"
          >
            Entrar
          </button>
        </form>

        {/* Register Link */}
        <div className="mt-8 text-center">
          <p className="font-['Source_Sans_3'] text-[16px] text-[#4B5563]">
            Não tens conta?{' '}
            <button
              onClick={onRegister}
              className="text-[#8B1E2D] font-semibold hover:underline"
            >
              Regista-te
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
