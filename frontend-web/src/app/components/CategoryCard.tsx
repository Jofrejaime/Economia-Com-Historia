import { Lock, Flame } from 'lucide-react';

interface CategoryCardProps {
  category: {
    id: number;
    name: string;
    description: string;
    accessType: 'public' | 'jindungo' | 'restricted';
    members?: number;
    topics?: number;
    color: { bg: string; text: string };
    backgroundImage?: string;
    requestStatus?: 'none' | 'pending' | 'approved';
  };
  onClick?: () => void;
  showStats?: boolean;
}

export default function CategoryCard({ category, onClick, showStats = true }: CategoryCardProps) {
  const getAccessIcon = () => {
    if (category.accessType === 'jindungo') {
      return (
        <svg className="w-[24px] h-[24px] md:w-[28px] md:h-[28px]" fill={category.accessType === 'public' ? '#6b0119' : '#8b1e2d'} viewBox="0 0 24 24">
          <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z" />
        </svg>
      );
    }
    if (category.accessType === 'restricted') {
      return (
        <svg className="w-[24px] h-[24px] md:w-[28px] md:h-[28px]" fill={category.accessType === 'public' ? '#6b0119' : '#8b1e2d'} viewBox="0 0 24 24">
          <path d="M12 1L3 5V11C3 16.55 6.84 21.74 12 23C17.16 21.74 21 16.55 21 11V5L12 1M12 7C13.4 7 14.5 8.1 14.5 9.5C14.5 10.9 13.4 12 12 12C10.6 12 9.5 10.9 9.5 9.5C9.5 8.1 10.6 7 12 7M12 13.5C14 13.5 17 14.5 17 16.5V18H7V16.5C7 14.5 10 13.5 12 13.5Z" />
        </svg>
      );
    }
    return (
      <svg className="w-[24px] h-[24px] md:w-[28px] md:h-[28px]" fill="#6b0119" viewBox="0 0 24 24">
        <path d="M14 2H6C4.89 2 4 2.9 4 4V20C4 21.11 4.89 22 6 22H18C19.11 22 20 21.11 20 20V8L14 2M18 20H6V4H13V9H18V20M10 19L12 15H9V10L7 14H10V19Z" />
      </svg>
    );
  };

  const getAccessLabel = () => {
    if (category.accessType === 'public') return 'Pública';
    if (category.accessType === 'jindungo') return 'Jindungo';
    return 'Restrita';
  };

  const isExclusive = category.accessType !== 'public';

  return (
    <div
      onClick={onClick}
      className="relative rounded-[6px] md:rounded-[8px] overflow-hidden border border-[rgba(222,191,191,0.1)] hover:border-[rgba(107,1,25,0.3)] hover:shadow-[0px_4px_16px_rgba(0,0,0,0.08)] transition-all cursor-pointer group"
    >
      {/* Background Image */}
      {category.backgroundImage && (
        <div className="absolute inset-0 overflow-hidden">
          <img
            src={category.backgroundImage}
            alt={category.name}
            className="w-full h-full object-cover opacity-40 grayscale-[30%] group-hover:opacity-50 group-hover:grayscale-0 group-hover:scale-110 transition-all duration-500"
          />
        </div>
      )}

      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/85 via-white/80 to-white/70" />

      {/* Exclusive Badge */}
      {isExclusive && (
        <div className="absolute top-[12px] right-[12px] z-10">
          <div className="bg-[#8b1e2d] px-[8px] py-[4px] rounded-[3px] flex items-center gap-[4px] shadow-md">
            {category.accessType === 'jindungo' ? (
              <Flame className="w-[10px] h-[10px] text-white" />
            ) : (
              <Lock className="w-[10px] h-[10px] text-white" />
            )}
            <span className="font-['Source_Sans_3:Bold',sans-serif] font-bold text-white text-[9px] md:text-[10px] leading-[13px] tracking-[0.8px] uppercase">
              Privado
            </span>
          </div>
        </div>
      )}

      <div className="relative flex flex-col p-[24px] md:p-[28px] lg:p-[32px] min-h-[240px] md:min-h-[260px] justify-between">
        {/* Top Content */}
        <div className="flex flex-col gap-[12px] md:gap-[16px]">
          {/* Icon */}
          <div
            className="w-[48px] h-[48px] md:w-[56px] md:h-[56px] rounded-[10px] md:rounded-[12px] flex items-center justify-center transition-all group-hover:scale-110"
            style={{ backgroundColor: `${isExclusive ? '#8b1e2d' : '#6b0119'}15` }}
          >
            {getAccessIcon()}
          </div>

          {/* Title */}
          <div className="flex flex-col gap-[6px] md:gap-[8px]">
            <h3 className="font-['IBM_Plex_Sans:Bold',sans-serif] font-bold text-[#121c2a] text-[18px] md:text-[20px] leading-[26px] md:leading-[28px] tracking-[-0.4px] group-hover:text-[#6b0119] transition-colors" style={{ fontVariationSettings: "'wdth' 100" }}>
              {category.name}
            </h3>
            <p className="font-['Source_Sans_3:Regular',sans-serif] font-normal text-[#574142] text-[13px] md:text-[14px] leading-[19px] md:leading-[20px] line-clamp-2">
              {category.description}
            </p>
          </div>
        </div>

        {/* Bottom Content */}
        <div className="flex items-center justify-between pt-[16px] md:pt-[20px] border-t border-[rgba(222,191,191,0.1)]">
          {showStats && category.topics !== undefined ? (
            <div className="flex items-center gap-[6px]">
              <span className="font-['Source_Sans_3:Medium',sans-serif] font-medium text-[#574142] text-[12px] md:text-[13px] leading-[16px] md:leading-[18px]">
                {category.topics} tópicos
              </span>
            </div>
          ) : (
            <div className="flex items-center gap-[6px]">
              <span className="font-['Source_Sans_3:Medium',sans-serif] font-medium text-[#574142] text-[12px] md:text-[13px] leading-[16px] md:leading-[18px]">
                {category.members || 0} membros
              </span>
            </div>
          )}

          {isExclusive ? (
            <div className="flex items-center gap-[6px] px-[10px] py-[6px] bg-[#eff4ff] rounded-[3px] group-hover:bg-[#8b1e2d] transition-colors">
              <span className="font-['Source_Sans_3:Bold',sans-serif] font-bold text-[#6b0119] text-[11px] md:text-[12px] leading-[14px] md:leading-[16px] group-hover:text-white transition-colors">
                Pedir Acesso
              </span>
              <svg className="w-[8px] h-[8px] group-hover:translate-x-[2px] transition-transform" fill="#6b0119" viewBox="0 0 10.5 10.5">
                <path className="group-hover:fill-white transition-colors" d="M10.0704 5.96094L5.53516 10.4961L4.62891 9.58984L7.84766 6.37109H0.0703125V5.05078H7.84766L4.62891 1.83203L5.53516 0.925781L10.0704 5.46094V5.96094Z" fill="#6b0119" />
              </svg>
            </div>
          ) : (
            <div className="flex items-center gap-[4px] group-hover:gap-[8px] transition-all">
              <span className="font-['Source_Sans_3:Bold',sans-serif] font-bold text-[#6b0119] text-[11px] md:text-[12px] leading-[14px] md:leading-[16px]">
                Explorar
              </span>
              <svg className="w-[8px] h-[8px]" fill="none" viewBox="0 0 10.5 10.5">
                <path d="M10.0704 5.96094L5.53516 10.4961L4.62891 9.58984L7.84766 6.37109H0.0703125V5.05078H7.84766L4.62891 1.83203L5.53516 0.925781L10.0704 5.46094V5.96094Z" fill="#6B0119" />
              </svg>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
