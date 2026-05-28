import React, { useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import BottomNav from './BottomNav';

interface SupportProps {
  onBack: () => void;
  onNavigate: (destination: 'dashboard' | 'content' | 'community' | 'quiz' | 'profile') => void;
}

export default function Support({ onBack, onNavigate }: SupportProps) {
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');

  return (
    <div className="bg-[#f8f9ff] min-h-screen pb-28">
      {/* Header */}
      <div className="backdrop-blur-[12px] bg-[rgba(255,255,255,0.85)] sticky top-0 z-10">
        <div className="flex items-center gap-4 px-6 py-4">
          <button onClick={onBack} className="p-1">
            <ArrowLeft className="w-5 h-5 text-[#7f1d1d]" />
          </button>
          <h1 className="font-['IBM_Plex_Sans'] font-bold text-[18px] text-[#7f1d1d] tracking-[-0.4px]">
            Suporte e Ajuda
          </h1>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-[896px] mx-auto px-6 pt-8">
        <p className="font-['Source_Sans_3'] text-[16px] text-[#574142] mb-8">
          Contactar a equipa editorial
        </p>

        <div className="bg-white rounded-lg p-6 space-y-6">
          <div>
            <label className="block font-['Source_Sans_3'] font-semibold text-[14px] text-[#4B5563] mb-2">
              Assunto
            </label>
            <select
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="w-full px-4 py-3 bg-[#F9FAFB] border border-[#E5E7EB] rounded-lg font-['Source_Sans_3'] text-[16px] text-[#1F2937] focus:outline-none focus:border-[#8B1E2D] transition-colors"
            >
              <option value="">Selecione um assunto</option>
              <option value="technical">Problema Técnico</option>
              <option value="content">Questão sobre Conteúdo</option>
              <option value="account">Questão sobre Conta</option>
              <option value="suggestion">Sugestão</option>
              <option value="other">Outro</option>
            </select>
          </div>

          <div>
            <label className="block font-['Source_Sans_3'] font-semibold text-[14px] text-[#4B5563] mb-2">
              Mensagem
            </label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={8}
              placeholder="Descreva a sua questão ou sugestão..."
              className="w-full px-4 py-3 bg-[#F9FAFB] border border-[#E5E7EB] rounded-lg font-['Source_Sans_3'] text-[16px] text-[#1F2937] placeholder:text-[#9CA3AF] focus:outline-none focus:border-[#8B1E2D] transition-colors resize-none"
            />
          </div>

          <button className="w-full py-4 bg-[#8B1E2D] text-white rounded-lg font-['Source_Sans_3'] font-bold text-[16px] hover:bg-[#A52535] transition-colors">
            Enviar Mensagem
          </button>
        </div>

        {/* FAQ Section */}
        <div className="mt-8">
          <h2 className="font-['IBM_Plex_Sans'] font-bold text-[20px] text-[#1F2937] mb-4">
            Perguntas Frequentes
          </h2>

          <div className="space-y-4">
            <div className="bg-white rounded-lg p-5">
              <h3 className="font-['Source_Sans_3'] font-bold text-[16px] text-[#1F2937] mb-2">
                Como posso aceder a textos com jindungo?
              </h3>
              <p className="font-['Source_Sans_3'] text-[14px] text-[#6B7280]">
                Os textos com jindungo requerem permissão especial. Pode solicitar acesso através do botão presente em cada artigo.
              </p>
            </div>

            <div className="bg-white rounded-lg p-5">
              <h3 className="font-['Source_Sans_3'] font-bold text-[16px] text-[#1F2937] mb-2">
                Como funcionam as conquistas?
              </h3>
              <p className="font-['Source_Sans_3'] text-[14px] text-[#6B7280]">
                As conquistas são desbloqueadas automaticamente conforme completa quizzes e participa na comunidade.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Navigation */}
      <BottomNav activeTab="profile" onNavigate={onNavigate} />
    </div>
  );
}
