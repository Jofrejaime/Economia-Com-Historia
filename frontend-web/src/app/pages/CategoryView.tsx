import { useState } from 'react';
import { useNavigate } from 'react-router';
import { Lock, Flame, Check, Clock, ChevronLeft } from 'lucide-react';
import SystemHeader from '../components/SystemHeader';
import SystemFooter from '../components/SystemFooter';
import CategoryCard from '../components/CategoryCard';
import catImg1 from '../../imports/SectionMainContentGrid/ed182b00277857e41c8f8aff96230df9ff2965f8.png';
import catImg2 from '../../imports/SectionMainContentGrid/720d549295f5ffea8f208f4906c2ade1055adcc4.png';
import catImg3 from '../../imports/SectionMainContentGrid/b27df40c0e6cc1052d5cef4496804ad8ad301914.png';
import catImg4 from '../../imports/SectionMainContentGrid/6b013c56324876776a0921dba0cff24f36e76b22.png';
import catImg5 from '../../imports/SectionMainContentGrid/933bbaf5f01d51082b96c823cb291ff8204f0fcf.png';

type AccessType = 'public' | 'jindungo' | 'restricted';
type RequestStatus = 'none' | 'pending' | 'approved';

interface Category {
  id: number;
  name: string;
  description: string;
  accessType: AccessType;
  members: number;
  topics: number;
  color: { bg: string; text: string };
  requestStatus: RequestStatus;
  backgroundImage?: string;
}

export default function CategoryView() {
  const navigate = useNavigate();
  const [categories, setCategories] = useState<Category[]>([
    {
      id: 1,
      name: 'Análise de Políticas',
      description: 'Discussões sobre políticas económicas e fiscais angolanas. Explore reformas monetárias, estratégias de desenvolvimento e impactos macroeconómicos.',
      accessType: 'public',
      members: 234,
      topics: 89,
      color: { bg: '#acf0e0', text: '#003a32' },
      requestStatus: 'none',
      backgroundImage: catImg1
    },
    {
      id: 2,
      name: 'Jindungo',
      description: 'Conteúdos exclusivos e análises aprofundadas para membros premium. Acesso a pesquisas inéditas, dados históricos raros e discussões com especialistas renomados.',
      accessType: 'jindungo',
      members: 156,
      topics: 45,
      color: { bg: '#ffd6a5', text: '#4a2c00' },
      requestStatus: 'none',
      backgroundImage: catImg2
    },
    {
      id: 3,
      name: 'Rotas Comerciais',
      description: 'História do comércio e redes económicas na África Austral. Análise de fluxos comerciais históricos e impacto nas economias regionais.',
      accessType: 'public',
      members: 189,
      topics: 67,
      color: { bg: '#ffd6a5', text: '#4a2c00' },
      requestStatus: 'none',
      backgroundImage: catImg3
    },
    {
      id: 4,
      name: 'Investigação Avançada',
      description: 'Pesquisas de doutoramento e publicações científicas. Ambiente dedicado para investigadores com projectos académicos em desenvolvimento.',
      accessType: 'restricted',
      members: 78,
      topics: 23,
      color: { bg: '#ffb3ba', text: '#5c0011' },
      requestStatus: 'none',
      backgroundImage: catImg4
    },
    {
      id: 5,
      name: 'História Fiscal',
      description: 'Sistemas fiscais coloniais e pós-coloniais. Documentação de políticas tributárias e evolução da administração fiscal em Angola.',
      accessType: 'public',
      members: 201,
      topics: 54,
      color: { bg: '#d4c5f9', text: '#2d1b69' },
      requestStatus: 'none',
      backgroundImage: catImg5
    },
    {
      id: 6,
      name: 'Sistema Monetário',
      description: 'Evolução das moedas e políticas monetárias. Estudo das reformas cambiais e gestão de reservas ao longo da história económica angolana.',
      accessType: 'restricted',
      members: 112,
      topics: 38,
      color: { bg: '#ffb3ba', text: '#5c0011' },
      requestStatus: 'none',
      backgroundImage: catImg1
    },
  ]);

  const handleRequestAccess = (categoryId: number, accessType: AccessType) => {
    setCategories(prev =>
      prev.map(cat =>
        cat.id === categoryId
          ? {
              ...cat,
              requestStatus: accessType === 'public' ? 'approved' : 'pending'
            }
          : cat
      )
    );
  };

  return (
    <div className="bg-[#f8f9ff] flex flex-col min-h-screen">
      <SystemHeader />

      <main className="flex-1 w-full">
        <div className="max-w-[1536px] mx-auto px-[24px] md:px-[32px] lg:px-[48px] py-[32px] md:py-[48px] lg:py-[64px]">
          {/* Breadcrumb */}
          <button
            onClick={() => navigate('/comunidade')}
            className="flex items-center gap-[8px] mb-[24px] md:mb-[32px] font-['Source_Sans_3:SemiBold',sans-serif] font-semibold text-[#6b0119] text-[13px] md:text-[14px] leading-[18px] md:leading-[20px] hover:gap-[12px] transition-all"
          >
            <ChevronLeft className="size-[16px]" />
            Voltar para Comunidade
          </button>

          {/* Header */}
          <div className="mb-[40px] md:mb-[48px]">
            <h1 className="font-['IBM_Plex_Sans:Bold',sans-serif] font-bold text-[#121c2a] text-[32px] md:text-[42px] lg:text-[48px] tracking-[-0.96px] leading-[38px] md:leading-[50px] lg:leading-[60px] mb-[16px]" style={{ fontVariationSettings: "'wdth' 100" }}>
              Categorias de Acesso
            </h1>
            <p className="font-['Source_Sans_3:Regular',sans-serif] font-normal text-[#574142] text-[15px] md:text-[16px] lg:text-[18px] leading-[24px] md:leading-[26px] lg:leading-[28px] max-w-[800px]">
              Solicite acesso às categorias para participar em discussões especializadas. As categorias públicas concedem acesso imediato, enquanto as privadas requerem aprovação da equipa.
            </p>
          </div>

          {/* Info Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-[16px] md:gap-[20px] mb-[40px] md:mb-[48px]">
            <div className="bg-[#acf0e0] bg-opacity-20 border border-[#acf0e0] rounded-[6px] md:rounded-[8px] p-[20px] md:p-[24px]">
              <h3 className="font-['IBM_Plex_Sans:Bold',sans-serif] font-bold text-[#003a32] text-[14px] md:text-[15px] tracking-[1px] uppercase leading-[18px] md:leading-[20px] mb-[8px]" style={{ fontVariationSettings: "'wdth' 100" }}>
                Públicas
              </h3>
              <p className="font-['Source_Sans_3:Regular',sans-serif] font-normal text-[#003a32] text-[13px] md:text-[14px] leading-[19px] md:leading-[20px]">
                Acesso automático ao solicitar. Perfeitas para começar.
              </p>
            </div>

            <div className="bg-[#ffd6a5] bg-opacity-20 border border-[#ffd6a5] rounded-[6px] md:rounded-[8px] p-[20px] md:p-[24px]">
              <div className="flex items-center gap-[8px] mb-[8px]">
                <Flame className="size-[16px] text-[#ff6b35]" />
                <h3 className="font-['IBM_Plex_Sans:Bold',sans-serif] font-bold text-[#4a2c00] text-[14px] md:text-[15px] tracking-[1px] uppercase leading-[18px] md:leading-[20px]" style={{ fontVariationSettings: "'wdth' 100" }}>
                  Jindungo
                </h3>
              </div>
              <p className="font-['Source_Sans_3:Regular',sans-serif] font-normal text-[#4a2c00] text-[13px] md:text-[14px] leading-[19px] md:leading-[20px]">
                Conteúdo premium. Requer aprovação manual.
              </p>
            </div>

            <div className="bg-[#ffb3ba] bg-opacity-20 border border-[#ffb3ba] rounded-[6px] md:rounded-[8px] p-[20px] md:p-[24px]">
              <div className="flex items-center gap-[8px] mb-[8px]">
                <Lock className="size-[16px] text-[#6b0119]" />
                <h3 className="font-['IBM_Plex_Sans:Bold',sans-serif] font-bold text-[#5c0011] text-[14px] md:text-[15px] tracking-[1px] uppercase leading-[18px] md:leading-[20px]" style={{ fontVariationSettings: "'wdth' 100" }}>
                  Restritas
                </h3>
              </div>
              <p className="font-['Source_Sans_3:Regular',sans-serif] font-normal text-[#5c0011] text-[13px] md:text-[14px] leading-[19px] md:leading-[20px]">
                Para investigadores. Validação necessária.
              </p>
            </div>
          </div>

          {/* Categories Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-[20px] md:gap-[24px]">
            {categories.map((category) => (
              <div key={category.id} className="flex flex-col gap-[16px]">
                <CategoryCard
                  category={category}
                  onClick={() => category.requestStatus === 'approved' ? navigate('/comunidade') : undefined}
                  showStats={true}
                />

                {/* Action Button */}
                {category.requestStatus === 'none' && (
                  <button
                    onClick={() => handleRequestAccess(category.id, category.accessType)}
                    className="w-full bg-[#8b1e2d] px-[24px] py-[12px] md:py-[14px] rounded-[6px] font-['Source_Sans_3:Bold',sans-serif] font-bold text-white text-[14px] md:text-[15px] leading-[20px] md:leading-[22px] hover:bg-[#7a1a27] transition-colors"
                  >
                    Solicitar Acesso
                  </button>
                )}

                {category.requestStatus === 'pending' && (
                  <div className="w-full bg-[#ffd6a5] bg-opacity-30 border border-[#ffd6a5] px-[24px] py-[12px] md:py-[14px] rounded-[6px] flex items-center justify-center gap-[10px]">
                    <Clock className="size-[18px] text-[#4a2c00]" />
                    <span className="font-['Source_Sans_3:Bold',sans-serif] font-bold text-[#4a2c00] text-[14px] md:text-[15px] leading-[20px] md:leading-[22px]">
                      Aguardando Aprovação
                    </span>
                  </div>
                )}

                {category.requestStatus === 'approved' && (
                  <div className="w-full bg-[#acf0e0] bg-opacity-30 border border-[#acf0e0] px-[24px] py-[12px] md:py-[14px] rounded-[6px] flex items-center justify-center gap-[10px]">
                    <Check className="size-[18px] text-[#003a32]" />
                    <span className="font-['Source_Sans_3:Bold',sans-serif] font-bold text-[#003a32] text-[14px] md:text-[15px] leading-[20px] md:leading-[22px]">
                      Acesso Concedido
                    </span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </main>

      <SystemFooter />
    </div>
  );
}
