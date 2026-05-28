import { Lock, Flame } from 'lucide-react';

const AccessBadge = ({ accessCategory }: { accessCategory: 'public' | 'jindungo' | 'restricted' }) => {
  if (accessCategory === 'public') return null;

  const config = {
    jindungo: {
      icon: Flame,
      label: 'Jindungo',
      bg: '#ffd6a5',
      text: '#4a2c00',
    },
    restricted: {
      icon: Lock,
      label: 'Restrito',
      bg: '#ffb3ba',
      text: '#5c0011',
    },
  };

  const { icon: Icon, label, bg, text } = config[accessCategory];

  return (
    <div className="absolute top-[16px] right-[16px] px-[8px] py-[4px] rounded-[4px] flex items-center gap-[4px] backdrop-blur-sm" style={{ backgroundColor: bg }}>
      <Icon className="size-[12px]" style={{ color: text }} />
      <span className="font-['Source_Sans_3:Bold',sans-serif] font-bold text-[10px] leading-[14px] uppercase tracking-[0.5px]" style={{ color: text }}>
        {label}
      </span>
    </div>
  );
};

interface ContentCardProps {
  id: number | string;
  title: string;
  category: string;
  type: string;
  date: string;
  views?: number;
  description?: string;
  image?: string;
  author?: string;
  onClick?: () => void;
  variant?: 'default' | 'featured' | 'vertical';
  fileInfo?: string;
  accessCategory?: 'public' | 'jindungo' | 'restricted';
}

export default function ContentCard({
  title,
  category,
  type,
  date,
  views,
  description,
  image,
  author,
  onClick,
  variant = 'default',
  fileInfo,
  accessCategory = 'public'
}: ContentCardProps) {
  if (variant === 'featured') {
    return (
      <div
        onClick={onClick}
        className="bg-white overflow-hidden rounded-[6px] md:rounded-[8px] w-full cursor-pointer hover:shadow-[0px_4px_16px_rgba(0,0,0,0.08)] transition-shadow group relative"
      >
        <AccessBadge accessCategory={accessCategory} />
        <div className="flex flex-col md:flex-row w-full">
          {/* Image Section */}
          {image && (
            <div className="w-full md:flex-1 h-[220px] sm:h-[280px] md:h-[380px] lg:h-[420px] relative overflow-hidden">
              <div className="absolute inset-0">
                <img
                  alt={title}
                  className="w-full h-full object-cover opacity-80 grayscale-[50%] group-hover:scale-105 transition-transform duration-300"
                  src={image}
                />
              </div>
            </div>
          )}

          {/* Content Section */}
          <div className="bg-[#eff4ff] w-full md:flex-1 flex flex-col justify-between p-[24px] sm:p-[28px] md:p-[32px] lg:p-[40px]">
            <div>
              <p className="font-['Source_Sans_3:Bold',sans-serif] font-bold text-[#6b0119] text-[9px] sm:text-[10px] tracking-[2px] sm:tracking-[2.5px] uppercase leading-[13px] sm:leading-[14px] mb-[10px] sm:mb-[12px]">
                {category}
              </p>

              <h2 className="font-['IBM_Plex_Sans:Bold',sans-serif] font-bold text-[#121c2a] text-[18px] sm:text-[20px] md:text-[24px] lg:text-[28px] leading-[26px] sm:leading-[28px] md:leading-[32px] lg:leading-[36px] mb-[10px] sm:mb-[12px] md:mb-[14px] group-hover:text-[#6b0119] transition-colors" style={{ fontVariationSettings: "'wdth' 100" }}>
                {title}
              </h2>

              {description && (
                <p className="font-['Source_Sans_3:Italic',sans-serif] italic text-[#574142] text-[13px] sm:text-[14px] md:text-[15px] leading-[20px] sm:leading-[21px] md:leading-[22px] line-clamp-3">
                  {description}
                </p>
              )}
            </div>

            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-[12px] sm:gap-[16px] mt-[20px] sm:mt-[24px] md:mt-[28px]">
              {fileInfo && (
                <p className="font-['Source_Sans_3:Bold',sans-serif] font-bold text-[10px] sm:text-[11px] text-[rgba(18,28,42,0.6)] leading-[14px] sm:leading-[15px]">
                  {fileInfo}
                </p>
              )}

              <button className="flex gap-[6px] items-center hover:opacity-80 transition-opacity group">
                <span className="font-['Source_Sans_3:Bold',sans-serif] font-bold text-[#6b0119] text-[13px] sm:text-[14px] md:text-[15px] leading-[18px] sm:leading-[20px] md:leading-[22px]">
                  Aceder ao Registo
                </span>
                <svg className="w-[8px] h-[8px] sm:w-[9px] sm:h-[9px]" fill="none" viewBox="0 0 9.33333 9.33333">
                  <path d="M7.10208 5.25H0V4.08333H7.10208L3.83542 0.816667L4.66667 0L9.33333 4.66667L4.66667 9.33333L3.83542 8.51667L7.10208 5.25V5.25" fill="#6B0119" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (variant === 'vertical') {
    return (
      <div
        onClick={onClick}
        className="bg-white relative rounded-[6px] md:rounded-[8px] overflow-hidden border-b-4 border-transparent hover:border-b-[rgba(107,1,25,0.3)] hover:shadow-[0px_4px_16px_rgba(0,0,0,0.08)] transition-all cursor-pointer group"
      >
        <AccessBadge accessCategory={accessCategory} />
        <div className="flex flex-col justify-between p-[24px] sm:p-[28px] md:p-[32px] min-h-[380px] sm:min-h-[420px] md:min-h-[440px]">
          <div className="space-y-[16px] sm:space-y-[20px]">
            {image && (
              <div className="w-full h-[193.5px] relative overflow-hidden bg-[#d9e3f6] rounded-[4px]">
                <img
                  src={image}
                  alt={title}
                  className="absolute inset-0 w-full h-full object-cover opacity-80 group-hover:scale-105 transition-transform duration-300"
                />
              </div>
            )}

            <div className="px-0 py-0">
              <p className="font-['Source_Sans_3:Regular',sans-serif] text-[#574142] text-[9px] sm:text-[10px] tracking-[0.9px] sm:tracking-[1px] uppercase leading-[13px] sm:leading-[14px]">
                {category}
              </p>
            </div>

            <div className="w-full">
              <h3 className="font-['IBM_Plex_Sans:SemiBold',sans-serif] font-semibold text-[#121c2a] text-[17px] sm:text-[18px] md:text-[19px] lg:text-[20px] leading-[25px] sm:leading-[26px] md:leading-[27px] lg:leading-[28px] group-hover:text-[#6b0119] transition-colors" style={{ fontVariationSettings: "'wdth' 100" }}>
                {title}
              </h3>
            </div>

            {description && (
              <div className="w-full">
                <p className="font-['Source_Sans_3:Regular',sans-serif] text-[#574142] text-[13px] sm:text-[14px] leading-[19px] sm:leading-[20px] line-clamp-2">
                  {description}
                </p>
              </div>
            )}
          </div>

          <div className="flex gap-[12px] sm:gap-[14px] md:gap-[16px] items-center flex-wrap w-full">
            <div className="bg-[#dee9fc] inline-flex px-[7px] sm:px-[8px] py-[3px] sm:py-[4px] rounded-[2px]">
              <span className="font-['Source_Sans_3:Regular',sans-serif] text-[#121c2a] text-[11px] sm:text-[12px] leading-[15px] sm:leading-[16px] whitespace-nowrap">
                {type}
              </span>
            </div>
            <span className="font-['Source_Sans_3:Regular',sans-serif] text-[11px] sm:text-[12px] text-[rgba(18,28,42,0.4)] leading-[15px] sm:leading-[16px] whitespace-nowrap">
              {date}
            </span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      onClick={onClick}
      className="bg-white relative rounded-[6px] md:rounded-[8px] overflow-hidden border border-[rgba(222,191,191,0.1)] hover:border-[rgba(107,1,25,0.3)] hover:shadow-[0px_4px_16px_rgba(0,0,0,0.08)] transition-all cursor-pointer group"
    >
      <AccessBadge accessCategory={accessCategory} />
      <div className="flex flex-col md:flex-row gap-0 md:gap-[24px] lg:gap-[32px]">
        {/* Image Section - Optional */}
        {image && (
          <div className="w-full md:w-[200px] lg:w-[240px] h-[180px] md:h-auto shrink-0">
            <div className="relative w-full h-full overflow-hidden bg-[#d9e3f6]">
              <img
                src={image}
                alt={title}
                className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
            </div>
          </div>
        )}

        {/* Content Section */}
        <div className="flex flex-col justify-between p-[20px] md:p-[24px] lg:p-[28px] flex-1 min-w-0">
          {/* Top Content */}
          <div className="flex flex-col gap-[12px] md:gap-[14px]">
            {/* Category Badge */}
            <div className="flex items-center gap-[8px] flex-wrap">
              <div className="px-[8px] py-[4px] bg-[#eff4ff] rounded-[4px]">
                <span className="font-['Source_Sans_3:Bold',sans-serif] font-bold text-[#6b0119] text-[10px] md:text-[11px] leading-[14px] md:leading-[16px] tracking-[1px] uppercase">
                  {category}
                </span>
              </div>
            </div>

            {/* Title */}
            <h3 className="font-['IBM_Plex_Sans:Bold',sans-serif] font-bold text-[#121c2a] text-[18px] md:text-[20px] lg:text-[22px] leading-[26px] md:leading-[28px] lg:leading-[30px] tracking-[-0.4px] group-hover:text-[#6b0119] transition-colors" style={{ fontVariationSettings: "'wdth' 100" }}>
              {title}
            </h3>

            {/* Description */}
            {description && (
              <p className="font-['Source_Sans_3:Regular',sans-serif] font-normal text-[#574142] text-[13px] md:text-[14px] leading-[19px] md:leading-[20px] line-clamp-2">
                {description}
              </p>
            )}
          </div>

          {/* Bottom Meta */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-[12px] pt-[16px] md:pt-[20px]">
            <div className="flex items-center gap-[12px] md:gap-[16px] flex-wrap">
              {/* Type Badge */}
              <div className="px-[8px] py-[4px] bg-[#dee9fc] rounded-[3px]">
                <span className="font-['Source_Sans_3:Regular',sans-serif] font-normal text-[#121c2a] text-[11px] md:text-[12px] leading-[15px] md:leading-[16px]">
                  {type}
                </span>
              </div>

              {/* Author */}
              {author && (
                <>
                  <span className="font-['Source_Sans_3:Regular',sans-serif] font-normal text-[#94a3b8] text-[11px] md:text-[12px] leading-[15px] md:leading-[16px]">
                    •
                  </span>
                  <span className="font-['Source_Sans_3:Bold',sans-serif] font-bold text-[#6b0119] text-[11px] md:text-[12px] leading-[15px] md:leading-[16px]">
                    {author}
                  </span>
                </>
              )}

              {/* Date */}
              <span className="font-['Source_Sans_3:Regular',sans-serif] font-normal text-[#94a3b8] text-[11px] md:text-[12px] leading-[15px] md:leading-[16px]">
                •
              </span>
              <span className="font-['Source_Sans_3:Regular',sans-serif] font-normal text-[#94a3b8] text-[11px] md:text-[12px] leading-[15px] md:leading-[16px]">
                {date}
              </span>

              {/* Views */}
              {views !== undefined && (
                <>
                  <span className="font-['Source_Sans_3:Regular',sans-serif] font-normal text-[#94a3b8] text-[11px] md:text-[12px] leading-[15px] md:leading-[16px]">
                    •
                  </span>
                  <span className="font-['Source_Sans_3:Medium',sans-serif] font-medium text-[#574142] text-[11px] md:text-[12px] leading-[15px] md:leading-[16px]">
                    {views.toLocaleString()} visualizações
                  </span>
                </>
              )}
            </div>

            {/* Arrow Icon */}
            <div className="shrink-0">
              <div className="w-[20px] h-[20px] flex items-center justify-center text-[#6b0119] group-hover:translate-x-[4px] transition-transform">
                <svg className="w-[10px] h-[10px]" fill="none" viewBox="0 0 10.5 10.5">
                  <path d="M10.0704 5.96094L5.53516 10.4961L4.62891 9.58984L7.84766 6.37109H0.0703125V5.05078H7.84766L4.62891 1.83203L5.53516 0.925781L10.0704 5.46094V5.96094Z" fill="currentColor" />
                </svg>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
