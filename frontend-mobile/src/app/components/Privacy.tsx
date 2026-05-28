import React, { useState } from 'react';
import { ArrowLeft, Eye, EyeOff } from 'lucide-react';
import BottomNav from './BottomNav';

interface PrivacyProps {
  onBack: () => void;
  onNavigate: (destination: 'dashboard' | 'content' | 'community' | 'quiz' | 'profile') => void;
}

export default function Privacy({ onBack, onNavigate }: PrivacyProps) {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  return (
    <div className="bg-[#f8f9ff] min-h-screen pb-28">
      {/* Header */}
      <div className="backdrop-blur-[12px] bg-[rgba(255,255,255,0.85)] sticky top-0 z-10">
        <div className="flex items-center gap-4 px-6 py-4">
          <button onClick={onBack} className="p-1">
            <ArrowLeft className="w-5 h-5 text-[#7f1d1d]" />
          </button>
          <h1 className="font-['IBM_Plex_Sans'] font-bold text-[18px] text-[#7f1d1d] tracking-[-0.4px]">
            Privacidade e Segurança
          </h1>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-[896px] mx-auto px-6 pt-8">
        <p className="font-['Source_Sans_3'] text-[16px] text-[#574142] mb-8">
          Alterar palavra-passe e acessos
        </p>

        <div className="bg-white rounded-lg p-6 space-y-6">
          <div>
            <label className="block font-['Source_Sans_3'] font-semibold text-[14px] text-[#4B5563] mb-2">
              Palavra-passe Atual
            </label>
            <div className="relative">
              <input
                type={showCurrent ? 'text' : 'password'}
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="w-full px-4 py-3 pr-12 bg-[#F9FAFB] border border-[#E5E7EB] rounded-lg font-['Source_Sans_3'] text-[16px] text-[#1F2937] focus:outline-none focus:border-[#8B1E2D] transition-colors"
              />
              <button
                onClick={() => setShowCurrent(!showCurrent)}
                className="absolute right-4 top-1/2 -translate-y-1/2"
              >
                {showCurrent ? <EyeOff className="w-5 h-5 text-gray-400" /> : <Eye className="w-5 h-5 text-gray-400" />}
              </button>
            </div>
          </div>

          <div>
            <label className="block font-['Source_Sans_3'] font-semibold text-[14px] text-[#4B5563] mb-2">
              Nova Palavra-passe
            </label>
            <div className="relative">
              <input
                type={showNew ? 'text' : 'password'}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full px-4 py-3 pr-12 bg-[#F9FAFB] border border-[#E5E7EB] rounded-lg font-['Source_Sans_3'] text-[16px] text-[#1F2937] focus:outline-none focus:border-[#8B1E2D] transition-colors"
              />
              <button
                onClick={() => setShowNew(!showNew)}
                className="absolute right-4 top-1/2 -translate-y-1/2"
              >
                {showNew ? <EyeOff className="w-5 h-5 text-gray-400" /> : <Eye className="w-5 h-5 text-gray-400" />}
              </button>
            </div>
          </div>

          <div>
            <label className="block font-['Source_Sans_3'] font-semibold text-[14px] text-[#4B5563] mb-2">
              Confirmar Nova Palavra-passe
            </label>
            <div className="relative">
              <input
                type={showConfirm ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full px-4 py-3 pr-12 bg-[#F9FAFB] border border-[#E5E7EB] rounded-lg font-['Source_Sans_3'] text-[16px] text-[#1F2937] focus:outline-none focus:border-[#8B1E2D] transition-colors"
              />
              <button
                onClick={() => setShowConfirm(!showConfirm)}
                className="absolute right-4 top-1/2 -translate-y-1/2"
              >
                {showConfirm ? <EyeOff className="w-5 h-5 text-gray-400" /> : <Eye className="w-5 h-5 text-gray-400" />}
              </button>
            </div>
          </div>

          <button className="w-full py-4 bg-[#8B1E2D] text-white rounded-lg font-['Source_Sans_3'] font-bold text-[16px] hover:bg-[#A52535] transition-colors">
            Atualizar Palavra-passe
          </button>
        </div>
      </div>

      {/* Bottom Navigation */}
      <BottomNav activeTab="profile" onNavigate={onNavigate} />
    </div>
  );
}
