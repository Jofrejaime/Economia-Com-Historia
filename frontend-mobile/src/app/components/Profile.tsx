import React from 'react';
import { Menu, Search, User, BookOpen, Heart, Award, ChevronRight, Bell, Shield, HelpCircle, LogOut } from 'lucide-react';
import BottomNav from './BottomNav';
import svgPaths from "../../imports/Perfil/svg-o2cgvm1dh2";
import imgProfile from "../../imports/Perfil/8c711ec32be972eef06cb0eef1620adc2b98ee6c.png";

interface ProfileProps {
  userName: string;
  onNavigate: (destination: 'dashboard' | 'content' | 'community' | 'quiz' | 'profile') => void;
  onLogout: () => void;
  onPersonalInfo: () => void;
  onNotifications: () => void;
  onNotificationPreferences: () => void;
  onPrivacy: () => void;
  onSupport: () => void;
}

export default function Profile({ userName, onNavigate, onLogout, onPersonalInfo, onNotifications, onNotificationPreferences, onPrivacy, onSupport }: ProfileProps) {
  return (
    <div className="bg-[#f8f9ff] min-h-screen pb-28">
      {/* Header */}
      <div className="backdrop-blur-[12px] bg-[rgba(255,255,255,0.85)] sticky top-0 z-10">
        <div className="flex items-center justify-between px-6 py-4">
          <div className="flex items-center gap-4">
            <button className="p-1">
              <svg className="w-[18px] h-[12px]" fill="none" viewBox="0 0 18 12">
                <path d={svgPaths.p2bce57c0} fill="#7F1D1D" />
              </svg>
            </button>
            <h1 className="font-['IBM_Plex_Sans'] font-bold text-[18px] text-[#7f1d1d] tracking-[-0.4px]">
              Economia com História
            </h1>
          </div>
          <button className="p-1">
            <svg className="w-[18px] h-[18px]" fill="none" viewBox="0 0 18 18">
              <path d={svgPaths.p8a35e00} fill="#7F1D1D" />
            </svg>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-[896px] mx-auto px-6 pt-8">
        {/* User Identity Section */}
        <div className="flex flex-col items-center gap-8 mb-12">
          {/* Profile Photo */}
          <div className="relative">
            <div className="w-32 h-32 rounded-xl overflow-hidden shadow-[0px_0px_0px_4px_rgba(107,1,25,0.1)]">
              <img
                src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&q=80"
                alt="Profile"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="absolute bottom-0 right-0 w-[24.833px] h-[24.25px]">
              <div className="absolute inset-[-8.25%_-49.07%_-89.69%_-48.32%]">
                <svg className="w-full h-full" fill="none" viewBox="0 0 49.02 48">
                  <rect fill="#6B0119" height="24.25" rx="12" width="24.8333" x="12" y="2" />
                  <path d={svgPaths.p36188980} fill="white" />
                </svg>
              </div>
            </div>
          </div>

          {/* Name & Details */}
          <div className="flex flex-col items-center gap-1 w-full max-w-[274.33px]">
            <h2 className="font-['IBM_Plex_Sans'] font-bold text-[30px] text-[#6b0119] text-center tracking-[-0.75px] leading-[36px]">
              José da Assunção<br/>A. Ndele
            </h2>
            <p className="font-['Source_Sans_3'] text-[16px] text-[#574142] text-center leading-[24px]">
              Economista e Político Angolano
            </p>
            <div className="flex items-center gap-3 pt-3">
              <span className="px-3 py-1 bg-[#dee9fc] text-[#6b0119] rounded-[2px] font-['Source_Sans_3'] font-semibold text-[12px] uppercase tracking-[0.6px]">
                NÍVEL ACADÉMICO V
              </span>
              <span className="px-3 py-1 bg-[#dee9fc] text-[#6b0119] rounded-[2px] font-['Source_Sans_3'] font-semibold text-[12px] uppercase tracking-[0.6px]">
                MEMBRO TITULAR
              </span>
            </div>
          </div>
        </div>

        {/* Academic Statistics - Bento Grid */}
        <div className="grid grid-cols-1 gap-4 mb-12">
          {/* Total Score Card */}
          <div className="bg-[#eff4ff] rounded-lg p-6">
            <p className="font-['Source_Sans_3'] font-semibold text-[16px] text-[#6b0119] uppercase tracking-[1.6px] opacity-80 mb-4">
              PONTUAÇÃO TOTAL
            </p>
            <div className="pt-4">
              <p className="font-['Source_Sans_3'] font-bold text-[36px] text-[#121c2a] tracking-[-1.8px] leading-[40px]">
                14.850
              </p>
              <p className="font-['Source_Sans_3'] text-[14px] text-[#574142] leading-[20px] mt-1">
                +12% este mês
              </p>
            </div>
          </div>

          {/* Quizzes Completed Card */}
          <div className="bg-[#8b1e2d] rounded-lg p-6">
            <p className="font-['Source_Sans_3'] font-semibold text-[16px] text-white uppercase tracking-[1.6px] opacity-90 mb-4">
              QUIZZES CONCLUÍDOS
            </p>
            <div className="pt-4">
              <p className="font-['Source_Sans_3'] font-bold text-[36px] text-white tracking-[-1.8px] leading-[40px] mb-4">
                42
              </p>
              <div className="bg-[rgba(255,255,255,0.2)] h-1 rounded-full overflow-hidden">
                <div className="bg-white h-full w-[84%]" />
              </div>
            </div>
          </div>

          {/* Global Ranking Card */}
          <div className="bg-[#eff4ff] rounded-lg p-6">
            <p className="font-['Source_Sans_3'] font-semibold text-[16px] text-[#6b0119] uppercase tracking-[1.6px] opacity-80 mb-4">
              POSIÇÃO GLOBAL
            </p>
            <div className="pt-4">
              <p className="font-['Source_Sans_3'] font-bold text-[36px] text-[#121c2a] tracking-[-1.8px] leading-[40px]">
                #12
              </p>
              <p className="font-['Source_Sans_3'] text-[14px] text-[#574142] leading-[20px] mt-1">
                Top 5% de Historiadores
              </p>
            </div>
          </div>
        </div>

        {/* Badges & Certificates Section */}
        <div className="mb-12">
          <div className="flex items-end justify-between mb-6">
            <h3 className="font-['IBM_Plex_Sans'] font-bold text-[20px] text-[#121c2a] tracking-[-0.5px] leading-[28px]">
              Méritos e Distinções
            </h3>
            <button className="font-['Source_Sans_3'] font-semibold text-[14px] text-[#6b0119] leading-[20px]">
              Ver Todos
            </button>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Badge 1 */}
            <div className="bg-white p-6 flex flex-col items-center">
              <div className="mb-4">
                <div className="w-16 h-16 bg-[#dee9fc] rounded-xl flex items-center justify-center">
                  <svg className="w-[25px] h-[25px]" fill="none" viewBox="0 0 25 25">
                    <path d={svgPaths.p27384f80} fill="#6B0119" />
                  </svg>
                </div>
              </div>
              <p className="font-['Source_Sans_3'] font-bold text-[12px] text-[#121c2a] text-center uppercase leading-[15px]">
                ARQUIVISTA<br/>IMPERIAL
              </p>
            </div>

            {/* Badge 2 */}
            <div className="bg-white p-6 flex flex-col items-center">
              <div className="mb-4">
                <div className="w-16 h-16 bg-[#dee9fc] rounded-xl flex items-center justify-center">
                  <svg className="w-[24.375px] h-[20px]" fill="none" viewBox="0 0 24.375 20">
                    <path d={svgPaths.p2bd4edc0} fill="#6B0119" />
                  </svg>
                </div>
              </div>
              <p className="font-['Source_Sans_3'] font-bold text-[12px] text-[#121c2a] text-center uppercase leading-[15px]">
                CRÓNICAS DO<br/>KWANZA
              </p>
            </div>

            {/* Badge 3 */}
            <div className="bg-white p-6 flex flex-col items-center">
              <div className="mb-4">
                <div className="w-16 h-16 bg-[#dee9fc] rounded-xl flex items-center justify-center">
                  <svg className="w-[24.0625px] h-[21.375px]" fill="none" viewBox="0 0 24.0625 21.375">
                    <path d={svgPaths.p7ac9a80} fill="#6B0119" />
                  </svg>
                </div>
              </div>
              <p className="font-['Source_Sans_3'] font-bold text-[12px] text-[#121c2a] text-center uppercase leading-[15px]">
                DIAMANTE<br/>ANGOLANO
              </p>
            </div>

            {/* Badge 4 - Locked */}
            <div className="bg-white p-6 flex flex-col items-center">
              <div className="mb-4">
                <div className="w-16 h-16 rounded-xl flex items-center justify-center opacity-50 bg-[#dee9fc]">
                  <svg className="w-[27.5px] h-[22.5px]" fill="none" viewBox="0 0 27.5 22.5">
                    <path d={svgPaths.p36063280} fill="#574142" />
                  </svg>
                </div>
              </div>
              <p className="font-['Source_Sans_3'] font-bold text-[12px] text-[#574142] text-center uppercase leading-[15px]">
                PH.D HONORÁRIO
              </p>
            </div>
          </div>
        </div>

        {/* Settings & Navigation */}
        <div className="bg-[#eff4ff] rounded-lg overflow-hidden mb-6">
          <div className="p-2">
            {/* Personal Info */}
            <button
              onClick={onPersonalInfo}
              className="flex items-center gap-4 p-4 rounded-[2px] w-full text-left hover:bg-gray-50 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 16 16">
                <path d={svgPaths.p85bff00} fill="#6B0119" />
              </svg>
              <div className="flex-1">
                <p className="font-['Source_Sans_3'] font-bold text-[14px] text-[#121c2a] leading-[20px]">
                  Informação Pessoal
                </p>
                <p className="font-['Source_Sans_3'] text-[12px] text-[#574142] leading-[16px]">
                  Gerir dados da conta e identificação
                </p>
              </div>
              <svg className="w-[7.4px] h-3" fill="none" viewBox="0 0 7.4 12">
                <path d={svgPaths.p28c84800} fill="#DEBFBF" />
              </svg>
            </button>

            {/* Notifications */}
            <button
              onClick={onNotifications}
              className="flex items-center gap-4 p-4 rounded-[2px] w-full text-left hover:bg-gray-50 transition-colors"
            >
              <svg className="w-4 h-5" fill="none" viewBox="0 0 16 20">
                <path d={svgPaths.p164b49c0} fill="#6B0119" />
              </svg>
              <div className="flex-1">
                <p className="font-['Source_Sans_3'] font-bold text-[14px] text-[#121c2a] leading-[20px]">
                  Notificações
                </p>
                <p className="font-['Source_Sans_3'] text-[12px] text-[#574142] leading-[16px]">
                  Ver todas as notificações recebidas
                </p>
              </div>
              <svg className="w-[7.4px] h-3" fill="none" viewBox="0 0 7.4 12">
                <path d={svgPaths.p28c84800} fill="#DEBFBF" />
              </svg>
            </button>

            {/* Notification Preferences */}
            <button
              onClick={onNotificationPreferences}
              className="flex items-center gap-4 p-4 rounded-[2px] w-full text-left hover:bg-gray-50 transition-colors"
            >
              <svg className="w-4 h-5" fill="none" viewBox="0 0 16 20">
                <path d={svgPaths.p164b49c0} fill="#6B0119" />
              </svg>
              <div className="flex-1">
                <p className="font-['Source_Sans_3'] font-bold text-[14px] text-[#121c2a] leading-[20px]">
                  Preferências de Notificação
                </p>
                <p className="font-['Source_Sans_3'] text-[12px] text-[#574142] leading-[16px]">
                  Configurar alertas de novos conteúdos e<br/>desafios
                </p>
              </div>
              <svg className="w-[7.4px] h-3" fill="none" viewBox="0 0 7.4 12">
                <path d={svgPaths.p28c84800} fill="#DEBFBF" />
              </svg>
            </button>

            {/* Privacy & Security */}
            <button
              onClick={onPrivacy}
              className="flex items-center gap-4 p-4 rounded-[2px] w-full text-left hover:bg-gray-50 transition-colors"
            >
              <svg className="w-4 h-5" fill="none" viewBox="0 0 16 20">
                <path d={svgPaths.p15aec574} fill="#6B0119" />
              </svg>
              <div className="flex-1">
                <p className="font-['Source_Sans_3'] font-bold text-[14px] text-[#121c2a] leading-[20px]">
                  Privacidade e Segurança
                </p>
                <p className="font-['Source_Sans_3'] text-[12px] text-[#574142] leading-[16px]">
                  Alterar palavra-passe e acessos
                </p>
              </div>
              <svg className="w-[7.4px] h-3" fill="none" viewBox="0 0 7.4 12">
                <path d={svgPaths.p28c84800} fill="#DEBFBF" />
              </svg>
            </button>

            {/* Support */}
            <button
              onClick={onSupport}
              className="flex items-center gap-4 pb-6 pt-4 px-4 rounded-[2px] w-full text-left hover:bg-gray-50 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 20 20">
                <path d={svgPaths.p2816f2c0} fill="#6B0119" />
              </svg>
              <div className="flex-1">
                <p className="font-['Source_Sans_3'] font-bold text-[14px] text-[#121c2a] leading-[20px]">
                  Suporte e Ajuda
                </p>
                <p className="font-['Source_Sans_3'] text-[12px] text-[#574142] leading-[16px]">
                  Contactar a equipa editorial
                </p>
              </div>
              <svg className="w-[7.4px] h-3" fill="none" viewBox="0 0 7.4 12">
                <path d={svgPaths.p28c84800} fill="#DEBFBF" />
              </svg>
            </button>

            {/* Divider */}
            <div className="h-px bg-[rgba(222,191,191,0.2)] mx-2" />

            {/* Logout */}
            <button
              onClick={onLogout}
              className="flex items-center gap-4 pb-4 pt-6 px-4 rounded-[2px] w-full text-left hover:bg-red-50 transition-colors"
            >
              <svg className="w-[18px] h-[18px]" fill="none" viewBox="0 0 18 18">
                <path d={svgPaths.p3e9df400} fill="#BA1A1A" />
              </svg>
              <div className="flex-1">
                <p className="font-['Source_Sans_3'] font-bold text-[14px] text-[#ba1a1a] leading-[20px]">
                  Terminar Sessão
                </p>
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* Bottom Navigation */}
      <BottomNav activeTab="profile" onNavigate={onNavigate} isLoggedIn={true} />
    </div>
  );
}
