import React, { useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import BottomNav from './BottomNav';

interface PersonalInfoProps {
  onBack: () => void;
  onNavigate: (destination: 'dashboard' | 'content' | 'community' | 'quiz' | 'profile') => void;
}

export default function PersonalInfo({ onBack, onNavigate }: PersonalInfoProps) {
  const [name, setName] = useState('José da Assunção A. Ndele');
  const [email, setEmail] = useState('jose.ndele@email.com');
  const [occupation, setOccupation] = useState('Economista e Político Angolano');
  const [location, setLocation] = useState('Luanda, Angola');

  return (
    <div className="bg-[#f8f9ff] min-h-screen pb-28">
      {/* Header */}
      <div className="backdrop-blur-[12px] bg-[rgba(255,255,255,0.85)] sticky top-0 z-10">
        <div className="flex items-center gap-4 px-6 py-4">
          <button onClick={onBack} className="p-1">
            <ArrowLeft className="w-5 h-5 text-[#7f1d1d]" />
          </button>
          <h1 className="font-['IBM_Plex_Sans'] font-bold text-[18px] text-[#7f1d1d] tracking-[-0.4px]">
            Informação Pessoal
          </h1>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-[896px] mx-auto px-6 pt-8">
        <p className="font-['Source_Sans_3'] text-[16px] text-[#574142] mb-8">
          Gerir dados da conta e identificação
        </p>

        <div className="bg-white rounded-lg p-6 space-y-6">
          <div>
            <label className="block font-['Source_Sans_3'] font-semibold text-[14px] text-[#4B5563] mb-2">
              Nome Completo
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-3 bg-[#F9FAFB] border border-[#E5E7EB] rounded-lg font-['Source_Sans_3'] text-[16px] text-[#1F2937] focus:outline-none focus:border-[#8B1E2D] transition-colors"
            />
          </div>

          <div>
            <label className="block font-['Source_Sans_3'] font-semibold text-[14px] text-[#4B5563] mb-2">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 bg-[#F9FAFB] border border-[#E5E7EB] rounded-lg font-['Source_Sans_3'] text-[16px] text-[#1F2937] focus:outline-none focus:border-[#8B1E2D] transition-colors"
            />
          </div>

          <div>
            <label className="block font-['Source_Sans_3'] font-semibold text-[14px] text-[#4B5563] mb-2">
              Ocupação
            </label>
            <input
              type="text"
              value={occupation}
              onChange={(e) => setOccupation(e.target.value)}
              className="w-full px-4 py-3 bg-[#F9FAFB] border border-[#E5E7EB] rounded-lg font-['Source_Sans_3'] text-[16px] text-[#1F2937] focus:outline-none focus:border-[#8B1E2D] transition-colors"
            />
          </div>

          <div>
            <label className="block font-['Source_Sans_3'] font-semibold text-[14px] text-[#4B5563] mb-2">
              Localização
            </label>
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="w-full px-4 py-3 bg-[#F9FAFB] border border-[#E5E7EB] rounded-lg font-['Source_Sans_3'] text-[16px] text-[#1F2937] focus:outline-none focus:border-[#8B1E2D] transition-colors"
            />
          </div>

          <button className="w-full py-4 bg-[#8B1E2D] text-white rounded-lg font-['Source_Sans_3'] font-bold text-[16px] hover:bg-[#A52535] transition-colors">
            Guardar Alterações
          </button>
        </div>
      </div>

      {/* Bottom Navigation */}
      <BottomNav activeTab="profile" onNavigate={onNavigate} />
    </div>
  );
}
