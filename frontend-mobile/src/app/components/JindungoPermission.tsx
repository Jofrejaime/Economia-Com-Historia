import React from 'react';
import { ArrowLeft, Lock, AlertCircle } from 'lucide-react';

interface JindungoPermissionProps {
  onBack: () => void;
  onRequestPermission: () => void;
}

export default function JindungoPermission({ onBack, onRequestPermission }: JindungoPermissionProps) {
  return (
    <div className="min-h-screen bg-[#F8F9FF] flex flex-col">
      {/* Header */}
      <div className="bg-white border-b border-[#E5E7EB] px-6 py-4">
        <div className="flex items-center gap-4">
          <button onClick={onBack} className="p-1">
            <ArrowLeft className="w-5 h-5 text-[#8B1E2D]" />
          </button>
          <h1 className="font-['IBM_Plex_Sans'] font-bold text-[18px] text-[#8B1E2D]">
            Conteúdo Restrito
          </h1>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-12">
        <div className="max-w-md w-full text-center">
          {/* Lock Icon */}
          <div className="mb-8 flex justify-center">
            <div className="w-24 h-24 bg-[#FDF3F4] rounded-full flex items-center justify-center">
              <Lock className="w-12 h-12 text-[#8B1E2D]" />
            </div>
          </div>

          {/* Title */}
          <h2 className="font-['IBM_Plex_Sans'] font-bold text-[32px] text-[#1F2937] mb-4">
            Texto com Jindungo
          </h2>

          {/* Description */}
          <p className="font-['Source_Sans_3'] text-[18px] text-[#574142] leading-[29.25px] mb-8">
            Este conteúdo aborda temas controversos e sensíveis que requerem permissão especial para acesso.
          </p>

          {/* Alert Box */}
          <div className="bg-[#FEF2F2] border border-[#DEBFBF] rounded-lg p-5 mb-8">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-[#8B1E2D] flex-shrink-0 mt-0.5" />
              <div className="text-left">
                <h3 className="font-['Source_Sans_3'] font-bold text-[14px] text-[#8B1E2D] mb-1">
                  Porque Preciso de Permissão?
                </h3>
                <p className="font-['Source_Sans_3'] text-[14px] text-[#574142] leading-[22px]">
                  Os textos com jindungo contêm análises históricas e económicas que podem gerar debate. Garantimos que apenas utilizadores comprometidos com o rigor académico acedam a estes conteúdos.
                </p>
              </div>
            </div>
          </div>

          {/* Approval Info */}
          <div className="bg-white rounded-lg p-6 mb-8 text-center">
            <div className="w-16 h-16 bg-[#8B1E2D]/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-[#8B1E2D]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="font-['Source_Sans_3'] font-bold text-[16px] text-[#1F2937] mb-2">
              Aprovação do Administrador
            </h3>
            <p className="font-['Source_Sans_3'] text-[14px] text-[#574142] leading-[22px]">
              O seu pedido será analisado pela equipa editorial. Aguarde a aprovação do administrador para aceder aos conteúdos com jindungo.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3">
            <button
              onClick={onRequestPermission}
              className="w-full py-4 bg-[#8B1E2D] text-white rounded-lg font-['Source_Sans_3'] font-bold text-[16px] hover:bg-[#A52535] active:scale-[0.98] transition-all shadow-md"
            >
              Solicitar Acesso
            </button>

            <button
              onClick={onBack}
              className="w-full py-4 bg-white border-2 border-[#E5E7EB] text-[#574142] rounded-lg font-['Source_Sans_3'] font-semibold text-[16px] hover:bg-gray-50 transition-colors"
            >
              Voltar aos Conteúdos
            </button>
          </div>

          {/* Footer Note */}
          <p className="font-['Source_Sans_3'] text-[12px] text-[#9CA3AF] mt-6">
            O pedido de acesso será revisto pela equipa editorial em até 24 horas.
          </p>
        </div>
      </div>
    </div>
  );
}
