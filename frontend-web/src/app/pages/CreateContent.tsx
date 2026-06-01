import { useState } from 'react';
import { useNavigate } from 'react-router';
import SystemHeader from '../components/SystemHeader';
import SystemFooter from '../components/SystemFooter';

type DocumentType = 'manuscript' | 'article' | 'report' | 'thesis' | 'archive';
type AcademicLevel = 'intro' | 'advanced' | 'doctorate';
type Category = {
  id: string;
  name: string;
  color: { bg: string; text: string };
};

export default function CreateContent() {
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [documentType, setDocumentType] = useState<DocumentType>('article');
  const [academicLevel, setAcademicLevel] = useState<AcademicLevel>('advanced');
  const [author, setAuthor] = useState('');
  const [institution, setInstitution] = useState('');
  const [publicationDate, setPublicationDate] = useState('');
  const [summary, setSummary] = useState('');
  const [content, setContent] = useState('');
  const [coverImage, setCoverImage] = useState<File | null>(null);
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const categories: Category[] = [
    { id: 'microtextos', name: 'Microtextos', color: { bg: '#fde68a', text: '#78350f' } },
    { id: 'jindungo', name: 'Textos com Jindungo', color: { bg: '#fca5a5', text: '#7f1d1d' } },
    { id: 'infrastructure', name: 'Infraestrutura Colonial', color: { bg: '#e6eeff', text: '#1e3a8a' } },
    { id: 'agriculture', name: 'Café e Agricultura', color: { bg: '#ffd6a5', text: '#4a2c00' } },
    { id: 'policy', name: 'Política Pós-Independência', color: { bg: '#acf0e0', text: '#003a32' } },
    { id: 'mining', name: 'Mineração e Indústria', color: { bg: '#d4c5f9', text: '#2d1b69' } },
    { id: 'monetary', name: 'Política Monetária', color: { bg: '#ffb3ba', text: '#5c0011' } },
    { id: 'fiscal', name: 'História Fiscal', color: { bg: '#bae1ff', text: '#003a5d' } },
  ];

  const documentTypes = [
    { id: 'manuscript' as DocumentType, name: 'Manuscrito', description: 'Documento histórico original' },
    { id: 'article' as DocumentType, name: 'Artigo de Investigação', description: 'Estudo académico publicado' },
    { id: 'report' as DocumentType, name: 'Relatório Fiscal', description: 'Documento oficial do governo' },
    { id: 'thesis' as DocumentType, name: 'Tese', description: 'Trabalho de doutoramento/mestrado' },
    { id: 'archive' as DocumentType, name: 'Registo de Arquivo', description: 'Documento de arquivo histórico' },
  ];

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!title.trim()) {
      newErrors.title = 'O título é obrigatório';
    } else if (title.length < 10) {
      newErrors.title = 'O título deve ter pelo menos 10 caracteres';
    }

    if (!selectedCategory) {
      newErrors.category = 'Por favor, selecione uma categoria';
    }

    if (!author.trim()) {
      newErrors.author = 'O autor é obrigatório';
    }

    if (!publicationDate) {
      newErrors.publicationDate = 'A data de emissão é obrigatória';
    }

    if (!summary.trim()) {
      newErrors.summary = 'O resumo executivo é obrigatório';
    } else if (summary.length < 50) {
      newErrors.summary = 'O resumo deve ter pelo menos 50 caracteres';
    }

    if (!content.trim()) {
      newErrors.content = 'O conteúdo é obrigatório';
    } else if (content.length < 100) {
      newErrors.content = 'O conteúdo deve ter pelo menos 100 caracteres';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (validate()) {
      console.log({
        title,
        category: selectedCategory,
        documentType,
        academicLevel,
        author,
        institution,
        publicationDate,
        summary,
        content,
        coverImage,
        pdfFile,
      });

      navigate('/documento/1');
    }
  };

  const handleSaveDraft = () => {
    if (title.trim() || content.trim()) {
      console.log('Rascunho salvo');
      alert('Rascunho guardado com sucesso!');
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type === 'application/pdf') {
      setPdfFile(file);
    } else {
      alert('Por favor, selecione um arquivo PDF válido');
    }
  };

  const handleCoverImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
      setCoverImage(file);
    } else {
      alert('Por favor, selecione uma imagem válida (JPG, PNG, etc.)');
    }
  };

  const selectedCategoryData = categories.find(cat => cat.id === selectedCategory);
  const selectedDocType = documentTypes.find(dt => dt.id === documentType);

  return (
    <div className="bg-[#f8f9ff] flex flex-col min-h-screen">
      <SystemHeader />

      <main className="flex-1 w-full">
        <div className="max-w-[1536px] mx-auto px-[24px] md:px-[32px] lg:px-[48px] py-[24px] md:py-[32px] lg:py-[40px]">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-[8px] mb-[24px] md:mb-[32px] text-[13px] md:text-[14px]">
            <button
              onClick={() => navigate('/arquivo')}
              className="font-['Source_Sans_3:Medium',sans-serif] font-medium text-[#8b7171] hover:text-[#6b0119] transition-colors"
            >
              Arquivo
            </button>
            <span className="text-[#8b7171]">/</span>
            <span className="font-['Source_Sans_3:Medium',sans-serif] font-medium text-[#6b0119]">
              Criar Conteúdo
            </span>
          </nav>

          {/* Page Header */}
          <div className="mb-[32px] md:mb-[40px]">
            <h1 className="font-['IBM_Plex_Sans:Bold',sans-serif] font-bold text-[#121c2a] text-[28px] md:text-[36px] lg:text-[42px] tracking-[-0.84px] leading-[36px] md:leading-[44px] lg:leading-[50px] mb-[12px] md:mb-[16px]" style={{ fontVariationSettings: "'wdth' 100" }}>
              Adicionar Novo Documento
            </h1>
            <p className="font-['Source_Sans_3:Regular',sans-serif] font-normal text-[#574142] text-[14px] md:text-[15px] lg:text-[16px] leading-[22px] md:leading-[24px] lg:leading-[26px] max-w-[800px]">
              Contribua para o arquivo digital com documentos históricos, análises académicas e fontes primárias sobre a economia angolana.
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
                      Título do Documento
                      <span className="text-[#8b1e2d] ml-[4px]">*</span>
                    </label>
                    <input
                      type="text"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="Ex: O Caminho de Ferro de Benguela: Análise de Impacto Fiscal"
                      className={`w-full px-[16px] md:px-[18px] py-[14px] md:py-[16px] bg-[#f1f5f9] rounded-[6px] border ${
                        errors.title ? 'border-[#8b1e2d]' : 'border-[rgba(226,232,240,0.8)]'
                      } focus:border-[#6b0119] focus:bg-white transition-all font-['Source_Sans_3:Regular',sans-serif] font-normal text-[#121c2a] text-[15px] md:text-[16px] outline-none`}
                    />
                    {errors.title && (
                      <p className="mt-[6px] font-['Source_Sans_3:Regular',sans-serif] text-[#8b1e2d] text-[12px] md:text-[13px]">
                        {errors.title}
                      </p>
                    )}
                  </div>

                  {/* Category and Document Type - Modern Selects */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-[20px] md:gap-[24px] mb-[24px] md:mb-[28px]">
                    {/* Category Select */}
                    <div>
                      <label className="block font-['Source_Sans_3:Bold',sans-serif] font-bold text-[#121c2a] text-[14px] md:text-[15px] leading-[20px] md:leading-[22px] mb-[8px] md:mb-[10px]">
                        Categoria
                        <span className="text-[#8b1e2d] ml-[4px]">*</span>
                      </label>
                      <div className="relative">
                        <select
                          value={selectedCategory}
                          onChange={(e) => setSelectedCategory(e.target.value)}
                          className={`w-full px-[16px] md:px-[18px] py-[14px] md:py-[16px] bg-[#f1f5f9] rounded-[6px] border ${
                            errors.category ? 'border-[#8b1e2d]' : 'border-[rgba(226,232,240,0.8)]'
                          } focus:border-[#6b0119] focus:bg-white transition-all font-['Source_Sans_3:Regular',sans-serif] text-[#121c2a] text-[15px] md:text-[16px] outline-none cursor-pointer appearance-none pr-[40px]`}
                          style={{
                            backgroundImage: `url("data:image/svg+xml,%3Csvg width='12' height='8' viewBox='0 0 12 8' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M1 1.5L6 6.5L11 1.5' stroke='%236b0119' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E")`,
                            backgroundRepeat: 'no-repeat',
                            backgroundPosition: 'right 16px center',
                          }}
                        >
                          <option value="">Selecione uma categoria</option>
                          {categories.map((category) => (
                            <option key={category.id} value={category.id}>
                              {category.name}
                            </option>
                          ))}
                        </select>
                      </div>
                      {errors.category && (
                        <p className="mt-[6px] font-['Source_Sans_3:Regular',sans-serif] text-[#8b1e2d] text-[12px] md:text-[13px]">
                          {errors.category}
                        </p>
                      )}
                      {selectedCategoryData && (
                        <div className="mt-[10px]">
                          <div
                            className="inline-block px-[10px] py-[4px] rounded-[4px]"
                            style={{ backgroundColor: selectedCategoryData.color.bg }}
                          >
                            <span
                              className="font-['Source_Sans_3:Bold',sans-serif] font-bold text-[11px] md:text-[12px] tracking-[-0.5px] uppercase"
                              style={{ color: selectedCategoryData.color.text }}
                            >
                              {selectedCategoryData.name}
                            </span>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Document Type Select */}
                    <div>
                      <label className="block font-['Source_Sans_3:Bold',sans-serif] font-bold text-[#121c2a] text-[14px] md:text-[15px] leading-[20px] md:leading-[22px] mb-[8px] md:mb-[10px]">
                        Tipo de Documento
                        <span className="text-[#8b1e2d] ml-[4px]">*</span>
                      </label>
                      <div className="relative">
                        <select
                          value={documentType}
                          onChange={(e) => setDocumentType(e.target.value as DocumentType)}
                          className="w-full px-[16px] md:px-[18px] py-[14px] md:py-[16px] bg-[#f1f5f9] rounded-[6px] border border-[rgba(226,232,240,0.8)] focus:border-[#6b0119] focus:bg-white transition-all font-['Source_Sans_3:Regular',sans-serif] text-[#121c2a] text-[15px] md:text-[16px] outline-none cursor-pointer appearance-none pr-[40px]"
                          style={{
                            backgroundImage: `url("data:image/svg+xml,%3Csvg width='12' height='8' viewBox='0 0 12 8' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M1 1.5L6 6.5L11 1.5' stroke='%236b0119' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E")`,
                            backgroundRepeat: 'no-repeat',
                            backgroundPosition: 'right 16px center',
                          }}
                        >
                          {documentTypes.map((type) => (
                            <option key={type.id} value={type.id}>
                              {type.name}
                            </option>
                          ))}
                        </select>
                      </div>
                      {selectedDocType && (
                        <p className="mt-[6px] font-['Source_Sans_3:Regular',sans-serif] text-[#8b7171] text-[12px] md:text-[13px]">
                          {selectedDocType.description}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Academic Level */}
                  <div className="mb-[24px] md:mb-[28px]">
                    <label className="block font-['Source_Sans_3:Bold',sans-serif] font-bold text-[#121c2a] text-[14px] md:text-[15px] leading-[20px] md:leading-[22px] mb-[8px] md:mb-[10px]">
                      Nível Académico
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-[10px] md:gap-[12px]">
                      {[
                        { id: 'intro' as AcademicLevel, label: 'Introdutório' },
                        { id: 'advanced' as AcademicLevel, label: 'Investigação Avançada' },
                        { id: 'doctorate' as AcademicLevel, label: 'Arquivo de Doutoramento' },
                      ].map((level) => (
                        <button
                          key={level.id}
                          type="button"
                          onClick={() => setAcademicLevel(level.id)}
                          className={`px-[16px] py-[12px] rounded-[6px] transition-all ${
                            academicLevel === level.id
                              ? 'bg-[#6b0119] text-white shadow-[0px_2px_4px_rgba(107,1,25,0.2)]'
                              : 'bg-[#eff4ff] text-[#794043] hover:bg-[#dee9fc]'
                          }`}
                        >
                          <span className="font-['Source_Sans_3:Medium',sans-serif] font-medium text-[13px] md:text-[14px]">
                            {level.label}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Author and Institution */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-[20px] md:gap-[24px] mb-[24px] md:mb-[28px]">
                    <div>
                      <label className="block font-['Source_Sans_3:Bold',sans-serif] font-bold text-[#121c2a] text-[14px] md:text-[15px] leading-[20px] md:leading-[22px] mb-[8px] md:mb-[10px]">
                        Autor
                        <span className="text-[#8b1e2d] ml-[4px]">*</span>
                      </label>
                      <input
                        type="text"
                        value={author}
                        onChange={(e) => setAuthor(e.target.value)}
                        placeholder="Ex: Conselho Ultramarino"
                        className={`w-full px-[16px] md:px-[18px] py-[14px] md:py-[16px] bg-[#f1f5f9] rounded-[6px] border ${
                          errors.author ? 'border-[#8b1e2d]' : 'border-[rgba(226,232,240,0.8)]'
                        } focus:border-[#6b0119] focus:bg-white transition-all font-['Source_Sans_3:Regular',sans-serif] text-[15px] md:text-[16px] outline-none`}
                      />
                      {errors.author && (
                        <p className="mt-[6px] font-['Source_Sans_3:Regular',sans-serif] text-[#8b1e2d] text-[12px] md:text-[13px]">
                          {errors.author}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block font-['Source_Sans_3:Bold',sans-serif] font-bold text-[#121c2a] text-[14px] md:text-[15px] leading-[20px] md:leading-[22px] mb-[8px] md:mb-[10px]">
                        Instituição
                      </label>
                      <input
                        type="text"
                        value={institution}
                        onChange={(e) => setInstitution(e.target.value)}
                        placeholder="Ex: Banco Nacional de Angola"
                        className="w-full px-[16px] md:px-[18px] py-[14px] md:py-[16px] bg-[#f1f5f9] rounded-[6px] border border-[rgba(226,232,240,0.8)] focus:border-[#6b0119] focus:bg-white transition-all font-['Source_Sans_3:Regular',sans-serif] text-[15px] md:text-[16px] outline-none"
                      />
                    </div>
                  </div>

                  {/* Publication Date */}
                  <div className="mb-[24px] md:mb-[28px]">
                    <label className="block font-['Source_Sans_3:Bold',sans-serif] font-bold text-[#121c2a] text-[14px] md:text-[15px] leading-[20px] md:leading-[22px] mb-[8px] md:mb-[10px]">
                      Data de Emissão
                      <span className="text-[#8b1e2d] ml-[4px]">*</span>
                    </label>
                    <input
                      type="date"
                      value={publicationDate}
                      onChange={(e) => setPublicationDate(e.target.value)}
                      className={`w-full max-w-[300px] px-[16px] md:px-[18px] py-[14px] md:py-[16px] bg-[#f1f5f9] rounded-[6px] border ${
                        errors.publicationDate ? 'border-[#8b1e2d]' : 'border-[rgba(226,232,240,0.8)]'
                      } focus:border-[#6b0119] focus:bg-white transition-all font-['Source_Sans_3:Regular',sans-serif] text-[15px] md:text-[16px] outline-none`}
                    />
                    {errors.publicationDate && (
                      <p className="mt-[6px] font-['Source_Sans_3:Regular',sans-serif] text-[#8b1e2d] text-[12px] md:text-[13px]">
                        {errors.publicationDate}
                      </p>
                    )}
                  </div>

                  {/* Summary */}
                  <div className="mb-[24px] md:mb-[28px]">
                    <label className="block font-['Source_Sans_3:Bold',sans-serif] font-bold text-[#121c2a] text-[14px] md:text-[15px] leading-[20px] md:leading-[22px] mb-[8px] md:mb-[10px]">
                      Resumo Executivo
                      <span className="text-[#8b1e2d] ml-[4px]">*</span>
                    </label>
                    <textarea
                      value={summary}
                      onChange={(e) => setSummary(e.target.value)}
                      placeholder="Forneça um resumo conciso do documento (2-4 frases) descrevendo o contexto histórico, objetivos e principais conclusões..."
                      className={`w-full min-h-[120px] px-[16px] md:px-[18px] py-[14px] md:py-[16px] bg-[#f1f5f9] rounded-[6px] border ${
                        errors.summary ? 'border-[#8b1e2d]' : 'border-[rgba(226,232,240,0.8)]'
                      } focus:border-[#6b0119] focus:bg-white transition-all font-['Source_Sans_3:Regular',sans-serif] text-[14px] md:text-[15px] leading-[22px] md:leading-[24px] outline-none resize-vertical`}
                    />
                    {errors.summary && (
                      <p className="mt-[6px] font-['Source_Sans_3:Regular',sans-serif] text-[#8b1e2d] text-[12px] md:text-[13px]">
                        {errors.summary}
                      </p>
                    )}
                  </div>

                  {/* Content Field */}
                  <div className="mb-[28px] md:mb-[32px]">
                    <div className="flex items-center justify-between mb-[8px] md:mb-[10px]">
                      <label className="font-['Source_Sans_3:Bold',sans-serif] font-bold text-[#121c2a] text-[14px] md:text-[15px] leading-[20px] md:leading-[22px]">
                        Conteúdo Principal
                        <span className="text-[#8b1e2d] ml-[4px]">*</span>
                      </label>
                      <button
                        type="button"
                        onClick={() => setShowPreview(!showPreview)}
                        className="font-['Source_Sans_3:SemiBold',sans-serif] font-semibold text-[#6b0119] text-[12px] md:text-[13px] hover:underline"
                      >
                        {showPreview ? 'Editar' : 'Pré-visualizar'}
                      </button>
                    </div>

                    {!showPreview ? (
                      <>
                        <textarea
                          value={content}
                          onChange={(e) => setContent(e.target.value)}
                          placeholder="Desenvolva o conteúdo completo do documento incluindo introdução, contexto histórico, análise, conclusões e referências..."
                          className={`w-full min-h-[400px] px-[16px] md:px-[18px] py-[14px] md:py-[16px] bg-[#f1f5f9] rounded-[6px] border ${
                            errors.content ? 'border-[#8b1e2d]' : 'border-[rgba(226,232,240,0.8)]'
                          } focus:border-[#6b0119] focus:bg-white transition-all font-['Source_Sans_3:Regular',sans-serif] text-[14px] md:text-[15px] leading-[22px] md:leading-[24px] outline-none resize-vertical`}
                        />
                        {errors.content && (
                          <p className="mt-[6px] font-['Source_Sans_3:Regular',sans-serif] text-[#8b1e2d] text-[12px] md:text-[13px]">
                            {errors.content}
                          </p>
                        )}
                        <p className="mt-[6px] font-['Source_Sans_3:Regular',sans-serif] text-[#8b7171] text-[12px] md:text-[13px]">
                          {content.length} caracteres
                        </p>
                      </>
                    ) : (
                      <div className="min-h-[400px] px-[16px] md:px-[18px] py-[14px] md:py-[16px] bg-white rounded-[6px] border border-[rgba(226,232,240,0.8)]">
                        <div className="font-['Source_Sans_3:Bold',sans-serif] font-bold text-[#6b0119] text-[11px] md:text-[12px] tracking-[1.2px] uppercase mb-[16px]">
                          PRÉ-VISUALIZAÇÃO
                        </div>
                        <div className="font-['Source_Sans_3:Regular',sans-serif] text-[#574142] text-[14px] md:text-[15px] leading-[22px] md:leading-[24px] whitespace-pre-line">
                          {content || 'O conteúdo aparecerá aqui...'}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Cover Image Upload */}
                  <div className="mb-[24px] md:mb-[28px]">
                    <label className="block font-['Source_Sans_3:Bold',sans-serif] font-bold text-[#121c2a] text-[14px] md:text-[15px] leading-[20px] md:leading-[22px] mb-[8px] md:mb-[10px]">
                      Imagem de Capa (Opcional)
                    </label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-[16px]">
                      <div className="border-2 border-dashed border-[rgba(226,232,240,0.8)] rounded-[6px] p-[24px] text-center hover:border-[#6b0119] transition-colors bg-[#f8f9ff]">
                        <input
                          type="file"
                          id="cover-upload"
                          accept="image/*"
                          onChange={handleCoverImageChange}
                          className="hidden"
                        />
                        <label
                          htmlFor="cover-upload"
                          className="cursor-pointer flex flex-col items-center gap-[12px]"
                        >
                          <svg className="size-[36px]" fill="none" viewBox="0 0 36 36">
                            <rect x="4" y="4" width="28" height="28" rx="2" stroke="#6b0119" strokeWidth="1.5" fill="none"/>
                            <path d="M18 12V24M12 18H24" stroke="#6b0119" strokeWidth="2" strokeLinecap="round"/>
                          </svg>
                          <div>
                            <p className="font-['Source_Sans_3:SemiBold',sans-serif] font-semibold text-[#6b0119] text-[13px] md:text-[14px] mb-[4px]">
                              {coverImage ? coverImage.name : 'Escolher imagem de capa'}
                            </p>
                            <p className="font-['Source_Sans_3:Regular',sans-serif] text-[#8b7171] text-[11px] md:text-[12px]">
                              JPG, PNG até 5MB
                            </p>
                          </div>
                        </label>
                      </div>
                      {coverImage && (
                        <div className="border border-[rgba(226,232,240,0.8)] rounded-[6px] p-[12px] bg-white">
                          <div className="aspect-[3/4] relative rounded-[4px] overflow-hidden bg-[#f1f5f9] flex items-center justify-center">
                            <img
                              src={URL.createObjectURL(coverImage)}
                              alt="Pré-visualização da capa"
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <button
                            type="button"
                            onClick={() => setCoverImage(null)}
                            className="mt-[8px] w-full py-[6px] text-center font-['Source_Sans_3:SemiBold',sans-serif] font-semibold text-[#8b1e2d] text-[12px] hover:underline"
                          >
                            Remover imagem
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* PDF Upload */}
                  <div className="mb-[28px] md:mb-[32px]">
                    <label className="block font-['Source_Sans_3:Bold',sans-serif] font-bold text-[#121c2a] text-[14px] md:text-[15px] leading-[20px] md:leading-[22px] mb-[8px] md:mb-[10px]">
                      Documento PDF (Opcional)
                    </label>
                    <div className="border-2 border-dashed border-[rgba(226,232,240,0.8)] rounded-[6px] p-[24px] md:p-[32px] text-center hover:border-[#6b0119] transition-colors bg-[#f8f9ff]">
                      <input
                        type="file"
                        id="pdf-upload"
                        accept=".pdf"
                        onChange={handleFileChange}
                        className="hidden"
                      />
                      <label
                        htmlFor="pdf-upload"
                        className="cursor-pointer flex flex-col items-center gap-[12px]"
                      >
                        <svg className="size-[40px]" fill="none" viewBox="0 0 40 40">
                          <path d="M12 8H28L34 14V32H12V8Z" stroke="#6b0119" strokeWidth="1.5" fill="none"/>
                          <path d="M28 8V14H34" stroke="#6b0119" strokeWidth="1.5" fill="none"/>
                          <path d="M20 16V28M14 22H26" stroke="#6b0119" strokeWidth="1.5" strokeLinecap="round"/>
                        </svg>
                        <div>
                          <p className="font-['Source_Sans_3:SemiBold',sans-serif] font-semibold text-[#6b0119] text-[14px] md:text-[15px] mb-[4px]">
                            {pdfFile ? pdfFile.name : 'Clique para fazer upload do PDF'}
                          </p>
                          <p className="font-['Source_Sans_3:Regular',sans-serif] text-[#8b7171] text-[12px] md:text-[13px]">
                            PDF até 10MB
                          </p>
                        </div>
                      </label>
                    </div>
                    {pdfFile && (
                      <div className="mt-[8px] flex items-center justify-between p-[12px] bg-[#eff4ff] rounded-[6px]">
                        <div className="flex items-center gap-[8px]">
                          <svg className="size-[20px]" fill="none" viewBox="0 0 20 20">
                            <path d="M6 2H14L18 6V18H6V2Z" stroke="#6b0119" strokeWidth="1.5" fill="none"/>
                            <path d="M14 2V6H18" stroke="#6b0119" strokeWidth="1.5" fill="none"/>
                          </svg>
                          <span className="font-['Source_Sans_3:Medium',sans-serif] font-medium text-[#121c2a] text-[13px] md:text-[14px]">
                            {pdfFile.name}
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => setPdfFile(null)}
                          className="font-['Source_Sans_3:SemiBold',sans-serif] font-semibold text-[#8b1e2d] text-[12px] hover:underline"
                        >
                          Remover
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-col sm:flex-row gap-[12px] md:gap-[16px] pt-[24px] border-t border-[rgba(222,191,191,0.2)]">
                    <button
                      type="submit"
                      className="bg-[#8b1e2d] px-[28px] md:px-[36px] py-[14px] md:py-[16px] rounded-[6px] font-['Source_Sans_3:Bold',sans-serif] font-bold text-white text-[15px] md:text-[16px] hover:bg-[#7a1a27] transition-colors flex items-center justify-center gap-[10px] shadow-[0px_2px_4px_rgba(139,30,45,0.2)]"
                    >
                      <svg className="size-[18px] md:size-[20px]" fill="none" viewBox="0 0 20 20">
                        <path d="M10 3V17M3 10H17" stroke="white" strokeWidth="2" strokeLinecap="round"/>
                      </svg>
                      Publicar Documento
                    </button>
                    <button
                      type="button"
                      onClick={handleSaveDraft}
                      className="px-[28px] md:px-[36px] py-[14px] md:py-[16px] rounded-[6px] border-2 border-[#6b0119] font-['Source_Sans_3:SemiBold',sans-serif] font-semibold text-[#6b0119] text-[15px] md:text-[16px] hover:bg-[rgba(107,1,25,0.05)] transition-colors"
                    >
                      Guardar Rascunho
                    </button>
                    <button
                      type="button"
                      onClick={() => navigate('/arquivo')}
                      className="px-[28px] md:px-[36px] py-[14px] md:py-[16px] rounded-[6px] font-['Source_Sans_3:SemiBold',sans-serif] font-semibold text-[#8b7171] text-[15px] md:text-[16px] hover:bg-[rgba(139,113,113,0.05)] transition-colors"
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
                      <div className="size-[4px] rounded-full bg-[#6b0119] mt-[8px] shrink-0" />
                      <p className="font-['Source_Sans_3:Regular',sans-serif] text-[#574142] text-[13px] md:text-[14px] leading-[18px] md:leading-[20px]">
                        Título claro e descritivo
                      </p>
                    </div>
                    <div className="flex gap-[10px] items-start">
                      <div className="size-[4px] rounded-full bg-[#6b0119] mt-[8px] shrink-0" />
                      <p className="font-['Source_Sans_3:Regular',sans-serif] text-[#574142] text-[13px] md:text-[14px] leading-[18px] md:leading-[20px]">
                        Fornecer contexto histórico adequado
                      </p>
                    </div>
                    <div className="flex gap-[10px] items-start">
                      <div className="size-[4px] rounded-full bg-[#6b0119] mt-[8px] shrink-0" />
                      <p className="font-['Source_Sans_3:Regular',sans-serif] text-[#574142] text-[13px] md:text-[14px] leading-[18px] md:leading-[20px]">
                        Incluir referências e citações
                      </p>
                    </div>
                    <div className="flex gap-[10px] items-start">
                      <div className="size-[4px] rounded-full bg-[#6b0119] mt-[8px] shrink-0" />
                      <p className="font-['Source_Sans_3:Regular',sans-serif] text-[#574142] text-[13px] md:text-[14px] leading-[18px] md:leading-[20px]">
                        Manter rigor académico
                      </p>
                    </div>
                  </div>
                </div>

                {/* Document Info */}
                {selectedCategoryData && selectedDocType && (
                  <div className="bg-white rounded-[8px] p-[20px] md:p-[24px] shadow-[0px_2px_8px_rgba(0,0,0,0.04)]">
                    <h3 className="font-['IBM_Plex_Sans:Bold',sans-serif] font-bold text-[#6b0119] text-[11px] md:text-[12px] tracking-[1.2px] uppercase leading-[16px] mb-[16px]" style={{ fontVariationSettings: "'wdth' 100" }}>
                      SELEÇÃO ATUAL
                    </h3>
                    <div className="mb-[12px]">
                      <div
                        className="inline-block px-[10px] py-[4px] rounded-[4px] mb-[8px]"
                        style={{ backgroundColor: selectedCategoryData.color.bg }}
                      >
                        <span
                          className="font-['Source_Sans_3:Bold',sans-serif] font-bold text-[11px] tracking-[-0.5px] uppercase"
                          style={{ color: selectedCategoryData.color.text }}
                        >
                          {selectedCategoryData.name}
                        </span>
                      </div>
                    </div>
                    <div className="font-['Source_Sans_3:SemiBold',sans-serif] font-semibold text-[#121c2a] text-[14px] mb-[4px]">
                      {selectedDocType.name}
                    </div>
                    <p className="font-['Source_Sans_3:Regular',sans-serif] text-[#574142] text-[13px] leading-[19px]">
                      {selectedDocType.description}
                    </p>
                  </div>
                )}

                {/* Cover Preview */}
                {coverImage && (
                  <div className="bg-white rounded-[8px] p-[20px] md:p-[24px] shadow-[0px_2px_8px_rgba(0,0,0,0.04)]">
                    <h3 className="font-['IBM_Plex_Sans:Bold',sans-serif] font-bold text-[#6b0119] text-[11px] md:text-[12px] tracking-[1.2px] uppercase leading-[16px] mb-[16px]" style={{ fontVariationSettings: "'wdth' 100" }}>
                      CAPA DO DOCUMENTO
                    </h3>
                    <div className="aspect-[3/4] relative rounded-[6px] overflow-hidden bg-[#f1f5f9]">
                      <img
                        src={URL.createObjectURL(coverImage)}
                        alt="Pré-visualização da capa"
                        className="w-full h-full object-cover"
                      />
                    </div>
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
