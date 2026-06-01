import React, { useState } from 'react';
import { ArrowLeft, ChevronRight, Plus, X, Globe, Lock, Users } from 'lucide-react';
import BottomNav from './BottomNav';

interface CreateTopicProps {
  onBack: () => void;
  onNavigate: (destination: 'dashboard' | 'content' | 'community' | 'quiz' | 'profile') => void;
  onPublish?: () => void;
  onSaveDraft?: () => void;
  initialTitle?: string;
  initialCategory?: string;
}

type AccessLevel = 'public' | 'limited';

export default function CreateTopic({ onBack, onNavigate, onPublish, onSaveDraft, initialTitle = '', initialCategory = '' }: CreateTopicProps) {
  const [title, setTitle] = useState(initialTitle);
  const [category, setCategory] = useState(initialCategory);
  const [description, setDescription] = useState('');
  const [accessLevel, setAccessLevel] = useState<AccessLevel>('public');
  const [selectedMembers] = useState([
    { id: '1', name: 'João Domingos', avatar: 'JD' },
    { id: '2', name: 'Catarina Domingos', avatar: 'CD' },
    { id: '3', name: 'Eduardo Loureiro', avatar: 'EL' }
  ]);

  const categories = [
    'História Monetária',
    'Agronegócio',
    'Petróleo e Reforma',
    'Infraestrutura',
    'Economia Colonial',
    'Desenvolvimento Sustentável'
  ];

  return (
    <div className="min-h-screen bg-[#F8F9FF]">
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
      <div className="bg-white border-b border-[#E5E7EB] px-6 py-4 sticky top-0 z-10">
        <div className="flex items-center justify-between">
          <button onClick={onBack} className="flex items-center gap-3 text-[#8B1E2D]">
            <ArrowLeft className="w-5 h-5" />
            <span className="font-['IBM_Plex_Sans'] font-bold text-[16px]">Novo Fórum</span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="px-6 pt-8 pb-32">
        {/* Title Section */}
        <div className="mb-8">
          <h1 className="font-['IBM_Plex_Sans'] font-bold text-[36px] text-[#8B1E2D] leading-[45px] mb-3">
            Iniciar Discussão
          </h1>
          <p className="font-['Source_Sans_3'] text-[16px] text-[#574142] leading-[26px]">
            Crie um tópico para debater temas relevantes.
            Será publicado no arquivo público da plataforma
            e notificará os membros do círculo de diálogo.
            Moderadores podem mover para o arquivo
            secundário se não atender aos critérios
            editoriais.
          </p>
        </div>

        {/* Topic Identity */}
        <div className="mb-8">
          <h2 className="font-['IBM_Plex_Sans'] font-bold text-[18px] text-[#1F2937] mb-4">
            Identidade do Tema
          </h2>

          <div className="space-y-4">
            {/* Title Input */}
            <div>
              <label className="block font-['Source_Sans_3'] font-semibold text-[14px] text-[#4B5563] mb-2">
                Título do tópico
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Ex: A desvalorização do Kwanza e seu impacto..."
                className="w-full px-4 py-3 bg-white border-2 border-[#E5E7EB] rounded-lg font-['Source_Sans_3'] text-[16px] text-[#1F2937] placeholder:text-[#9CA3AF] focus:outline-none focus:border-[#8B1E2D] transition-colors"
              />
            </div>

            {/* Category Selector */}
            <div>
              <label className="block font-['Source_Sans_3'] font-semibold text-[14px] text-[#4B5563] mb-2">
                Selecionar categoria
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-4 py-3 bg-white border-2 border-[#E5E7EB] rounded-lg font-['Source_Sans_3'] text-[16px] text-[#1F2937] focus:outline-none focus:border-[#8B1E2D] transition-colors"
              >
                <option value="">Escolha uma categoria</option>
                {categories.map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            {/* Description Input */}
            <div>
              <label className="block font-['Source_Sans_3'] font-semibold text-[14px] text-[#4B5563] mb-2">
                Descreva o contexto e as questões
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Desenvolva o contexto histórico e as questões que pretende debater..."
                rows={6}
                className="w-full px-4 py-3 bg-white border-2 border-[#E5E7EB] rounded-lg font-['Source_Sans_3'] text-[16px] text-[#1F2937] placeholder:text-[#9CA3AF] focus:outline-none focus:border-[#8B1E2D] transition-colors resize-none"
              />
            </div>
          </div>
        </div>

        {/* Discussion Circle */}
        <div className="mb-8">
          <h2 className="font-['IBM_Plex_Sans'] font-bold text-[18px] text-[#1F2937] mb-2">
            Círculo de Diálogo
          </h2>
          <p className="font-['Source_Sans_3'] text-[14px] text-[#6B7280] mb-4">
            Estas pessoas poderão participar activamente e serão notificadas
          </p>

          <div className="space-y-3 mb-4">
            {selectedMembers.map((member) => (
              <div key={member.id} className="flex items-center gap-3 bg-white p-3 rounded-lg border border-[#E5E7EB]">
                <div className="w-10 h-10 bg-[#D9E3F6] rounded-full flex items-center justify-center">
                  <span className="font-['Source_Sans_3'] font-bold text-[14px] text-[#8B1E2D]">
                    {member.avatar}
                  </span>
                </div>
                <span className="font-['Source_Sans_3'] font-semibold text-[15px] text-[#1F2937] flex-1">
                  {member.name}
                </span>
                <button className="p-1 hover:bg-[#F5F5F5] rounded-full transition-colors">
                  <X className="w-4 h-4 text-[#9CA3AF]" />
                </button>
              </div>
            ))}
          </div>

          <button className="w-full py-3 border-2 border-dashed border-[#E5E7EB] text-[#8B1E2D] rounded-lg font-['Source_Sans_3'] font-semibold text-[14px] flex items-center justify-center gap-2 hover:border-[#8B1E2D] hover:bg-[#FDF3F4] transition-colors">
            <Plus className="w-4 h-4" />
            Adicionar mais membros
          </button>
        </div>

        {/* Access Level */}
        <div className="mb-8">
          <h2 className="font-['IBM_Plex_Sans'] font-bold text-[18px] text-[#1F2937] mb-4">
            Nível de Acesso
          </h2>
          <p className="font-['Source_Sans_3'] text-[14px] text-[#6B7280] mb-4">
            Define quem pode ler e participar da discussão
          </p>

          <div className="space-y-3">
            {/* Public Option */}
            <button
              onClick={() => setAccessLevel('public')}
              className={`w-full p-4 rounded-xl border-2 transition-all text-left ${
                accessLevel === 'public'
                  ? 'border-[#8B1E2D] bg-[#FDF3F4]'
                  : 'border-[#E5E7EB] bg-white'
              }`}
            >
              <div className="flex items-start gap-3">
                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center mt-0.5 ${
                  accessLevel === 'public' ? 'border-[#8B1E2D]' : 'border-[#D1D5DB]'
                }`}>
                  {accessLevel === 'public' && (
                    <div className="w-2.5 h-2.5 bg-[#8B1E2D] rounded-full" />
                  )}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <Globe className="w-4 h-4 text-[#8B1E2D]" />
                    <span className="font-['Source_Sans_3'] font-bold text-[16px] text-[#1F2937]">
                      Público
                    </span>
                  </div>
                  <p className="font-['Source_Sans_3'] text-[14px] text-[#6B7280] leading-relaxed">
                    Qualquer pessoa pode ler e participar da discussão
                  </p>
                </div>
              </div>
            </button>

            {/* Limited Option */}
            <button
              onClick={() => setAccessLevel('limited')}
              className={`w-full p-4 rounded-xl border-2 transition-all text-left ${
                accessLevel === 'limited'
                  ? 'border-[#8B1E2D] bg-[#FDF3F4]'
                  : 'border-[#E5E7EB] bg-white'
              }`}
            >
              <div className="flex items-start gap-3">
                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center mt-0.5 ${
                  accessLevel === 'limited' ? 'border-[#8B1E2D]' : 'border-[#D1D5DB]'
                }`}>
                  {accessLevel === 'limited' && (
                    <div className="w-2.5 h-2.5 bg-[#8B1E2D] rounded-full" />
                  )}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <Lock className="w-4 h-4 text-[#8B1E2D]" />
                    <span className="font-['Source_Sans_3'] font-bold text-[16px] text-[#1F2937]">
                      Limitado
                    </span>
                  </div>
                  <p className="font-['Source_Sans_3'] text-[14px] text-[#6B7280] leading-relaxed">
                    Apenas convidados específicos podem participar
                  </p>
                </div>
              </div>
            </button>

          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-3">
          <button
            onClick={onPublish}
            className="w-full py-5 bg-[#8B1E2D] text-white rounded-xl font-['Source_Sans_3'] font-bold text-[17px] hover:bg-[#A52535] active:scale-[0.98] transition-all shadow-[0px_8px_24px_-4px_rgba(139,30,45,0.4)] flex items-center justify-center gap-2"
          >
            Iniciar discussão
            <ChevronRight className="w-5 h-5" />
          </button>

          <button
            onClick={onSaveDraft}
            className="w-full font-['Source_Sans_3'] font-semibold text-[14px] text-[#8B1E2D] hover:text-[#A52535] transition-colors"
          >
            Salvar rascunho temporário
          </button>
        </div>
      </div>

      {/* Bottom Navigation */}
      <BottomNav activeTab="community" onNavigate={onNavigate} isLoggedIn={true} />
    </div>
  );
}
