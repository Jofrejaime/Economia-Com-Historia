import { useState } from 'react';
import { useNavigate } from 'react-router';
import SystemHeader from '../components/SystemHeader';
import SystemFooter from '../components/SystemFooter';
import svgPaths from '../../imports/ComunidadeAcademicaDesktop-1/svg-90hhnwtu0o';

type Category = {
  id: string;
  name: string;
  description: string;
  color: { bg: string; text: string };
};

export default function CreateTopic() {
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [content, setContent] = useState('');
  const [showPreview, setShowPreview] = useState(false);
  const [errors, setErrors] = useState<{ title?: string; category?: string; content?: string }>({});

  const categories: Category[] = [
    {
      id: 'policy-analysis',
      name: 'Análise de Políticas',
      description: 'Discussões sobre políticas económicas e fiscais',
      color: { bg: '#acf0e0', text: '#003a32' },
    },
    {
      id: 'trade-routes',
      name: 'Rotas Comerciais',
      description: 'História e impacto das rotas comerciais',
      color: { bg: '#ffd6a5', text: '#4a2c00' },
    },
    {
      id: 'fiscal-history',
      name: 'História Fiscal',
      description: 'Evolução dos sistemas fiscais angolanos',
      color: { bg: '#d4c5f9', text: '#2d1b69' },
    },
    {
      id: 'monetary-system',
      name: 'Sistema Monetário',
      description: 'Desenvolvimento e reformas monetárias',
      color: { bg: '#ffb3ba', text: '#5c0011' },
    },
    {
      id: 'banking',
      name: 'Sistema Bancário',
      description: 'Instituições bancárias e regulação',
      color: { bg: '#bae1ff', text: '#003a5d' },
    },
    {
      id: 'sources',
      name: 'Fontes e Arquivos',
      description: 'Partilha de fontes primárias e documentação',
      color: { bg: '#c7ceea', text: '#1e2952' },
    },
  ];

  const validate = () => {
    const newErrors: { title?: string; category?: string; content?: string } = {};

    if (!title.trim()) {
      newErrors.title = 'O título é obrigatório';
    } else if (title.length < 10) {
      newErrors.title = 'O título deve ter pelo menos 10 caracteres';
    } else if (title.length > 150) {
      newErrors.title = 'O título não pode exceder 150 caracteres';
    }

    if (!selectedCategory) {
      newErrors.category = 'Por favor, selecione uma categoria';
    }

    if (!content.trim()) {
      newErrors.content = 'O conteúdo é obrigatório';
    } else if (content.length < 50) {
      newErrors.content = 'O conteúdo deve ter pelo menos 50 caracteres para uma discussão significativa';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (validate()) {
      // Aqui seria enviado para API
      console.log({
        title,
        category: selectedCategory,
        content,
      });

      // Redirecionar para a discussão criada
      navigate('/comunidade/discussao');
    }
  };

  const handleSaveDraft = () => {
    if (title.trim() || content.trim()) {
      // Salvar rascunho no localStorage ou API
      console.log('Rascunho salvo:', { title, category: selectedCategory, content });
      // Mostrar feedback ao usuário
      alert('Rascunho guardado com sucesso!');
    }
  };

  const selectedCategoryData = categories.find(cat => cat.id === selectedCategory);

  return (
    <div className="bg-[#f8f9ff] flex flex-col min-h-screen">
      <SystemHeader />

      <main className="flex-1 w-full">
        <div className="max-w-[1536px] mx-auto px-[24px] md:px-[32px] lg:px-[48px] py-[24px] md:py-[32px] lg:py-[40px]">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-[8px] mb-[24px] md:mb-[32px] text-[13px] md:text-[14px]">
            <button
              onClick={() => navigate('/comunidade')}
              className="font-['Source_Sans_3:Medium',sans-serif] font-medium text-[#8b7171] hover:text-[#6b0119] transition-colors"
            >
              Comunidade
            </button>
            <span className="text-[#8b7171]">/</span>
            <span className="font-['Source_Sans_3:Medium',sans-serif] font-medium text-[#6b0119]">
              Criar Tópico
            </span>
          </nav>

          {/* Page Header */}
          <div className="mb-[32px] md:mb-[40px]">
            <h1 className="font-['IBM_Plex_Sans:Bold',sans-serif] font-bold text-[#121c2a] text-[28px] md:text-[36px] lg:text-[42px] tracking-[-0.84px] leading-[36px] md:leading-[44px] lg:leading-[50px] mb-[12px] md:mb-[16px]" style={{ fontVariationSettings: "'wdth' 100" }}>
              Criar Novo Tópico
            </h1>
            <p className="font-['Source_Sans_3:Regular',sans-serif] font-normal text-[#574142] text-[14px] md:text-[15px] lg:text-[16px] leading-[22px] md:leading-[24px] lg:leading-[26px] max-w-[800px]">
              Partilhe as suas questões, descobertas e perspectivas com a comunidade académica. Certifique-se de incluir contexto adequado e fontes quando aplicável.
            </p>
          </div>

          {/* Main Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-[32px] md:gap-[40px] lg:gap-[48px]">
            {/* Form */}
            <div className="lg:col-span-9">
              <form onSubmit={handleSubmit}>
                <div className="bg-white rounded-[8px] md:rounded-[12px] p-[24px] md:p-[32px] lg:p-[40px]">
                  {/* Title Field */}
                  <div className="mb-[24px] md:mb-[28px]">
                    <label className="block font-['Source_Sans_3:Bold',sans-serif] font-bold text-[#121c2a] text-[14px] md:text-[15px] leading-[20px] md:leading-[22px] mb-[8px] md:mb-[10px]">
                      Título da Discussão
                      <span className="text-[#8b1e2d] ml-[4px]">*</span>
                    </label>
                    <input
                      type="text"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="Ex: Análise da Reforma Monetária de 1976: A Transição do Kwanza"
                      className={`w-full px-[16px] md:px-[18px] py-[14px] md:py-[16px] bg-[#f1f5f9] rounded-[6px] border ${
                        errors.title ? 'border-[#8b1e2d]' : 'border-[rgba(226,232,240,0.8)]'
                      } focus:border-[#6b0119] focus:bg-white transition-all font-['Source_Sans_3:Regular',sans-serif] font-normal text-[#121c2a] text-[15px] md:text-[16px] outline-none`}
                    />
                    {errors.title && (
                      <p className="mt-[6px] font-['Source_Sans_3:Regular',sans-serif] text-[#8b1e2d] text-[12px] md:text-[13px] leading-[16px] md:leading-[18px]">
                        {errors.title}
                      </p>
                    )}
                    <p className="mt-[6px] font-['Source_Sans_3:Regular',sans-serif] text-[#8b7171] text-[12px] md:text-[13px] leading-[16px] md:leading-[18px]">
                      {title.length}/150 caracteres
                    </p>
                  </div>

                  {/* Category Field */}
                  <div className="mb-[24px] md:mb-[28px]">
                    <label className="block font-['Source_Sans_3:Bold',sans-serif] font-bold text-[#121c2a] text-[14px] md:text-[15px] leading-[20px] md:leading-[22px] mb-[8px] md:mb-[10px]">
                      Categoria
                      <span className="text-[#8b1e2d] ml-[4px]">*</span>
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-[12px] md:gap-[14px]">
                      {categories.map((category) => (
                        <button
                          key={category.id}
                          type="button"
                          onClick={() => setSelectedCategory(category.id)}
                          className={`p-[14px] md:p-[16px] rounded-[6px] border-2 transition-all text-left ${
                            selectedCategory === category.id
                              ? 'border-[#6b0119] bg-[rgba(107,1,25,0.03)]'
                              : 'border-[rgba(226,232,240,0.8)] hover:border-[#6b0119] hover:bg-[rgba(107,1,25,0.02)]'
                          }`}
                        >
                          <div
                            className="inline-block px-[8px] py-[2px] rounded-[2px] mb-[8px]"
                            style={{ backgroundColor: category.color.bg }}
                          >
                            <span
                              className="font-['Source_Sans_3:Bold',sans-serif] font-bold text-[10px] md:text-[11px] tracking-[-0.5px] uppercase leading-[14px] md:leading-[15px]"
                              style={{ color: category.color.text }}
                            >
                              {category.name}
                            </span>
                          </div>
                          <p className="font-['Source_Sans_3:Regular',sans-serif] text-[#574142] text-[12px] md:text-[13px] leading-[17px] md:leading-[18px]">
                            {category.description}
                          </p>
                        </button>
                      ))}
                    </div>
                    {errors.category && (
                      <p className="mt-[8px] font-['Source_Sans_3:Regular',sans-serif] text-[#8b1e2d] text-[12px] md:text-[13px] leading-[16px] md:leading-[18px]">
                        {errors.category}
                      </p>
                    )}
                  </div>

                  {/* Content Field */}
                  <div className="mb-[28px] md:mb-[32px]">
                    <div className="flex items-center justify-between mb-[8px] md:mb-[10px]">
                      <label className="font-['Source_Sans_3:Bold',sans-serif] font-bold text-[#121c2a] text-[14px] md:text-[15px] leading-[20px] md:leading-[22px]">
                        Conteúdo
                        <span className="text-[#8b1e2d] ml-[4px]">*</span>
                      </label>
                      <button
                        type="button"
                        onClick={() => setShowPreview(!showPreview)}
                        className="font-['Source_Sans_3:SemiBold',sans-serif] font-semibold text-[#6b0119] text-[12px] md:text-[13px] leading-[16px] md:leading-[18px] hover:underline"
                      >
                        {showPreview ? 'Editar' : 'Pré-visualizar'}
                      </button>
                    </div>

                    {!showPreview ? (
                      <>
                        <textarea
                          value={content}
                          onChange={(e) => setContent(e.target.value)}
                          placeholder="Descreva a sua questão ou tópico de discussão de forma clara e detalhada. Inclua contexto, fontes primárias relevantes e questões específicas que gostaria de debater com a comunidade..."
                          className={`w-full min-h-[300px] md:min-h-[350px] lg:min-h-[400px] px-[16px] md:px-[18px] py-[14px] md:py-[16px] bg-[#f1f5f9] rounded-[6px] border ${
                            errors.content ? 'border-[#8b1e2d]' : 'border-[rgba(226,232,240,0.8)]'
                          } focus:border-[#6b0119] focus:bg-white transition-all font-['Source_Sans_3:Regular',sans-serif] font-normal text-[#121c2a] text-[14px] md:text-[15px] leading-[22px] md:leading-[24px] outline-none resize-vertical`}
                        />
                        {errors.content && (
                          <p className="mt-[6px] font-['Source_Sans_3:Regular',sans-serif] text-[#8b1e2d] text-[12px] md:text-[13px] leading-[16px] md:leading-[18px]">
                            {errors.content}
                          </p>
                        )}
                        <div className="mt-[6px] flex items-center justify-between">
                          <p className="font-['Source_Sans_3:Regular',sans-serif] text-[#8b7171] text-[12px] md:text-[13px] leading-[16px] md:leading-[18px]">
                            Mínimo 50 caracteres • {content.length} caracteres
                          </p>
                          <p className="font-['Source_Sans_3:Italic',sans-serif] italic text-[#8b7171] text-[11px] md:text-[12px] leading-[15px] md:leading-[16px]">
                            Suporta formatação básica
                          </p>
                        </div>
                      </>
                    ) : (
                      <div className="min-h-[300px] md:min-h-[350px] lg:min-h-[400px] px-[16px] md:px-[18px] py-[14px] md:py-[16px] bg-white rounded-[6px] border border-[rgba(226,232,240,0.8)]">
                        <div className="font-['Source_Sans_3:Bold',sans-serif] font-bold text-[#6b0119] text-[11px] md:text-[12px] tracking-[1.2px] uppercase leading-[16px] mb-[12px] md:mb-[16px]">
                          PRÉ-VISUALIZAÇÃO
                        </div>
                        <div className="font-['Source_Sans_3:Regular',sans-serif] font-normal text-[#574142] text-[14px] md:text-[15px] leading-[22px] md:leading-[24px] whitespace-pre-line">
                          {content || 'O seu conteúdo aparecerá aqui...'}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-col sm:flex-row gap-[12px] md:gap-[16px] pt-[24px] border-t border-[rgba(222,191,191,0.2)]">
                    <button
                      type="submit"
                      className="bg-[#8b1e2d] px-[28px] md:px-[36px] py-[14px] md:py-[16px] rounded-[6px] font-['Source_Sans_3:Bold',sans-serif] font-bold text-white text-[15px] md:text-[16px] leading-[22px] md:leading-[24px] hover:bg-[#7a1a27] transition-colors flex items-center justify-center gap-[10px]"
                    >
                      <svg className="size-[18px] md:size-[20px]" fill="none" viewBox="0 0 20 20.025">
                        <path d={svgPaths.p3d954600} fill="white" />
                      </svg>
                      Publicar Tópico
                    </button>
                    <button
                      type="button"
                      onClick={handleSaveDraft}
                      className="px-[28px] md:px-[36px] py-[14px] md:py-[16px] rounded-[6px] border border-[#6b0119] font-['Source_Sans_3:SemiBold',sans-serif] font-semibold text-[#6b0119] text-[15px] md:text-[16px] leading-[22px] md:leading-[24px] hover:bg-[rgba(107,1,25,0.05)] transition-colors"
                    >
                      Guardar Rascunho
                    </button>
                    <button
                      type="button"
                      onClick={() => navigate('/comunidade')}
                      className="px-[28px] md:px-[36px] py-[14px] md:py-[16px] rounded-[6px] font-['Source_Sans_3:SemiBold',sans-serif] font-semibold text-[#8b7171] text-[15px] md:text-[16px] leading-[22px] md:leading-[24px] hover:bg-[rgba(139,113,113,0.05)] transition-colors"
                    >
                      Cancelar
                    </button>
                  </div>
                </div>
              </form>
            </div>

            {/* Sidebar */}
            <aside className="lg:col-span-3">
              <div className="flex flex-col gap-[24px] md:gap-[28px] lg:sticky lg:top-[24px]">
                {/* Guidelines */}
                <div className="bg-[#eff4ff] rounded-[8px] p-[20px] md:p-[24px]">
                  <h3 className="font-['IBM_Plex_Sans:Bold',sans-serif] font-bold text-[#6b0119] text-[11px] md:text-[12px] tracking-[1.2px] uppercase leading-[16px] mb-[16px] md:mb-[20px]" style={{ fontVariationSettings: "'wdth' 100" }}>
                    DIRETRIZES
                  </h3>
                  <div className="flex flex-col gap-[12px] md:gap-[14px]">
                    <div className="flex gap-[10px] items-start">
                      <svg className="size-[16px] shrink-0 mt-[2px]" fill="none" viewBox="0 0 20 20">
                        <path d={svgPaths.p1caa9380} fill="#6b0119" />
                      </svg>
                      <p className="font-['Source_Sans_3:Regular',sans-serif] text-[#574142] text-[13px] md:text-[14px] leading-[18px] md:leading-[20px]">
                        Escolha um título claro e descritivo
                      </p>
                    </div>
                    <div className="flex gap-[10px] items-start">
                      <svg className="size-[16px] shrink-0 mt-[2px]" fill="none" viewBox="0 0 20 20">
                        <path d={svgPaths.p1caa9380} fill="#6b0119" />
                      </svg>
                      <p className="font-['Source_Sans_3:Regular',sans-serif] text-[#574142] text-[13px] md:text-[14px] leading-[18px] md:leading-[20px]">
                        Forneça contexto histórico adequado
                      </p>
                    </div>
                    <div className="flex gap-[10px] items-start">
                      <svg className="size-[16px] shrink-0 mt-[2px]" fill="none" viewBox="0 0 20 20">
                        <path d={svgPaths.p1caa9380} fill="#6b0119" />
                      </svg>
                      <p className="font-['Source_Sans_3:Regular',sans-serif] text-[#574142] text-[13px] md:text-[14px] leading-[18px] md:leading-[20px]">
                        Cite fontes primárias quando disponíveis
                      </p>
                    </div>
                    <div className="flex gap-[10px] items-start">
                      <svg className="size-[16px] shrink-0 mt-[2px]" fill="none" viewBox="0 0 20 20">
                        <path d={svgPaths.p1caa9380} fill="#6b0119" />
                      </svg>
                      <p className="font-['Source_Sans_3:Regular',sans-serif] text-[#574142] text-[13px] md:text-[14px] leading-[18px] md:loading-[20px]">
                        Faça perguntas específicas à comunidade
                      </p>
                    </div>
                    <div className="flex gap-[10px] items-start">
                      <svg className="size-[16px] shrink-0 mt-[2px]" fill="none" viewBox="0 0 20 20">
                        <path d={svgPaths.p1caa9380} fill="#6b0119" />
                      </svg>
                      <p className="font-['Source_Sans_3:Regular',sans-serif] text-[#574142] text-[13px] md:text-[14px] leading-[18px] md:leading-[20px]">
                        Mantenha um tom académico respeitoso
                      </p>
                    </div>
                  </div>
                </div>

                {/* Tips */}
                <div className="bg-white rounded-[8px] p-[20px] md:p-[24px]">
                  <h3 className="font-['IBM_Plex_Sans:Bold',sans-serif] font-bold text-[#6b0119] text-[11px] md:text-[12px] tracking-[1.2px] uppercase leading-[16px] mb-[16px] md:mb-[20px]" style={{ fontVariationSettings: "'wdth' 100" }}>
                    DICAS ÚTEIS
                  </h3>
                  <div className="flex flex-col gap-[12px]">
                    <p className="font-['Source_Sans_3:Regular',sans-serif] text-[#574142] text-[13px] md:text-[14px] leading-[19px] md:leading-[20px]">
                      <span className="font-bold text-[#6b0119]">Pesquise primeiro:</span> Verifique se o tópico já foi discutido
                    </p>
                    <p className="font-['Source_Sans_3:Regular',sans-serif] text-[#574142] text-[13px] md:text-[14px] leading-[19px] md:leading-[20px]">
                      <span className="font-bold text-[#6b0119]">Seja específico:</span> Discussões focadas geram melhores respostas
                    </p>
                    <p className="font-['Source_Sans_3:Regular',sans-serif] text-[#574142] text-[13px] md:text-[14px] leading-[19px] md:leading-[20px]">
                      <span className="font-bold text-[#6b0119]">Formatação:</span> Use quebras de linha e **negrito** para organizar
                    </p>
                  </div>
                </div>

                {/* Category Info */}
                {selectedCategoryData && (
                  <div className="bg-white rounded-[8px] p-[20px] md:p-[24px] border-l-4" style={{ borderColor: selectedCategoryData.color.bg }}>
                    <h3 className="font-['IBM_Plex_Sans:Bold',sans-serif] font-bold text-[#6b0119] text-[11px] md:text-[12px] tracking-[1.2px] uppercase leading-[16px] mb-[12px]" style={{ fontVariationSettings: "'wdth' 100" }}>
                      CATEGORIA SELECIONADA
                    </h3>
                    <div
                      className="inline-block px-[8px] py-[2px] rounded-[2px] mb-[8px]"
                      style={{ backgroundColor: selectedCategoryData.color.bg }}
                    >
                      <span
                        className="font-['Source_Sans_3:Bold',sans-serif] font-bold text-[11px] tracking-[-0.5px] uppercase leading-[15px]"
                        style={{ color: selectedCategoryData.color.text }}
                      >
                        {selectedCategoryData.name}
                      </span>
                    </div>
                    <p className="font-['Source_Sans_3:Regular',sans-serif] text-[#574142] text-[13px] leading-[19px]">
                      {selectedCategoryData.description}
                    </p>
                  </div>
                )}
              </div>
            </aside>
          </div>
        </div>
      </main>

      <SystemFooter />
    </div>
  );
}
