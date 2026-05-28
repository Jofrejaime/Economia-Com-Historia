import { useState } from 'react';
import { MapPin, Trophy, ChevronDown, Star, Medal } from 'lucide-react';
import imgMarta from '../../imports/LeaderboardPreviewSection/06a4afa7e5640a6bd64bd2a1bd43ca867f45f4e3.png';
import imgJoao from '../../imports/LeaderboardPreviewSection/9c351444a85e4748ab4edc288a9ed4b83c0f3f7c.png';
import imgAndre from '../../imports/LeaderboardPreviewSection/2542f6a44aa7426e01c33baa539ebbc290c45863.png';

type RankingScope = 'nacional' | 'provincia';

const PROVINCIAS = [
  'Bengo', 'Benguela', 'Bié', 'Cabinda', 'Cuando Cubango',
  'Cuanza Norte', 'Cuanza Sul', 'Cunene', 'Huambo', 'Huíla',
  'Luanda', 'Lunda Norte', 'Lunda Sul', 'Malanje', 'Moxico',
  'Namibe', 'Uíge', 'Zaire'
];

interface RankUser {
  position: number;
  name: string;
  initials: string;
  points: number;
  quizzes: number;
  accuracy: number;
  province: string;
  image?: string;
  avatarColor: string;
  trend: 'up' | 'down' | 'same';
  trendValue: number;
}

const allUsers: RankUser[] = [
  { position: 1,  name: 'Marta Sebastião',   initials: 'MS', points: 4850, quizzes: 32, accuracy: 94, province: 'Luanda',        image: imgMarta, avatarColor: '#6b0119', trend: 'same', trendValue: 0 },
  { position: 2,  name: 'João Pinheiro',      initials: 'JP', points: 4120, quizzes: 28, accuracy: 91, province: 'Benguela',      image: imgJoao,  avatarColor: '#8b1e2d', trend: 'up',   trendValue: 1 },
  { position: 3,  name: 'André Monteiro',     initials: 'AM', points: 3980, quizzes: 27, accuracy: 88, province: 'Huambo',        image: imgAndre, avatarColor: '#574142', trend: 'down', trendValue: 1 },
  { position: 4,  name: 'Isabel Fernandes',   initials: 'IF', points: 3740, quizzes: 25, accuracy: 87, province: 'Luanda',        avatarColor: '#003a32', trend: 'up',   trendValue: 2 },
  { position: 5,  name: 'Carlos Bento',       initials: 'CB', points: 3510, quizzes: 24, accuracy: 85, province: 'Huíla',         avatarColor: '#2d1b69', trend: 'up',   trendValue: 1 },
  { position: 6,  name: 'Ana Correia',        initials: 'AC', points: 3290, quizzes: 22, accuracy: 83, province: 'Malanje',       avatarColor: '#4a2c00', trend: 'down', trendValue: 2 },
  { position: 7,  name: 'Manuel Santos',      initials: 'MS', points: 3180, quizzes: 21, accuracy: 82, province: 'Benguela',      avatarColor: '#1b4d3e', trend: 'same', trendValue: 0 },
  { position: 8,  name: 'Fátima Lopes',       initials: 'FL', points: 2960, quizzes: 20, accuracy: 80, province: 'Cabinda',       avatarColor: '#5c0011', trend: 'up',   trendValue: 3 },
  { position: 9,  name: 'Domingos Vita',      initials: 'DV', points: 2780, quizzes: 19, accuracy: 79, province: 'Moxico',        avatarColor: '#6b0119', trend: 'down', trendValue: 1 },
  { position: 10, name: 'Rosa Kimbangu',      initials: 'RK', points: 2650, quizzes: 18, accuracy: 78, province: 'Uíge',          avatarColor: '#003a32', trend: 'up',   trendValue: 2 },
  { position: 11, name: 'Pedro Neto',         initials: 'PN', points: 2450, quizzes: 17, accuracy: 77, province: 'Cuanza Sul',    avatarColor: '#2d1b69', trend: 'same', trendValue: 0 },
  { position: 12, name: 'Teresa Kamalata',    initials: 'TK', points: 2310, quizzes: 16, accuracy: 75, province: 'Cuando Cubango',avatarColor: '#4a2c00', trend: 'up',   trendValue: 1 },
  { position: 13, name: 'Simão Dala',         initials: 'SD', points: 2180, quizzes: 15, accuracy: 74, province: 'Bié',           avatarColor: '#8b1e2d', trend: 'down', trendValue: 3 },
  { position: 14, name: 'Esperança Mutamba',  initials: 'EM', points: 2050, quizzes: 14, accuracy: 73, province: 'Namibe',        avatarColor: '#574142', trend: 'up',   trendValue: 2 },
  { position: 15, name: 'António Tavares',    initials: 'AT', points: 1920, quizzes: 13, accuracy: 72, province: 'Luanda',        avatarColor: '#1b4d3e', trend: 'same', trendValue: 0 },
  // extra por provincia
  { position: 16, name: 'Cecília Mbala',      initials: 'CM', points: 1850, quizzes: 13, accuracy: 71, province: 'Lunda Norte',   avatarColor: '#5c0011', trend: 'up',   trendValue: 1 },
  { position: 17, name: 'Heitor Quiala',      initials: 'HQ', points: 1730, quizzes: 12, accuracy: 70, province: 'Zaire',         avatarColor: '#6b0119', trend: 'down', trendValue: 2 },
  { position: 18, name: 'Noémia Chicava',     initials: 'NC', points: 1650, quizzes: 12, accuracy: 69, province: 'Cunene',        avatarColor: '#003a32', trend: 'up',   trendValue: 1 },
  { position: 19, name: 'Salvador Ginga',     initials: 'SG', points: 1560, quizzes: 11, accuracy: 68, province: 'Bengo',         avatarColor: '#4a2c00', trend: 'same', trendValue: 0 },
  { position: 20, name: 'Lurdes Kitoko',      initials: 'LK', points: 1480, quizzes: 11, accuracy: 67, province: 'Lunda Sul',     avatarColor: '#2d1b69', trend: 'down', trendValue: 1 },
  { position: 21, name: 'Filipe Caholo',      initials: 'FC', points: 1390, quizzes: 10, accuracy: 66, province: 'Cuanza Norte',  avatarColor: '#8b1e2d', trend: 'up',   trendValue: 3 },
];

export default function LeaderboardSection() {
  const [scope, setScope] = useState<RankingScope>('nacional');
  const [selectedProvince, setSelectedProvince] = useState<string>('Luanda');
  const [showProvinceDropdown, setShowProvinceDropdown] = useState(false);
  const [showFullTable, setShowFullTable] = useState(false);

  const filteredUsers = scope === 'nacional'
    ? allUsers
    : allUsers.filter(u => u.province === selectedProvince)
        .map((u, i) => ({ ...u, position: i + 1 }));

  const top3 = filteredUsers.slice(0, 3);
  const rest  = filteredUsers.slice(3);
  const displayRest = showFullTable ? rest : rest.slice(0, 7);

  // Province stats for the info bar
  const provinceStats = PROVINCIAS.map(p => ({
    name: p,
    count: allUsers.filter(u => u.province === p).length,
    topPoints: Math.max(0, ...allUsers.filter(u => u.province === p).map(u => u.points))
  })).filter(p => p.count > 0).sort((a, b) => b.topPoints - a.topPoints);

  return (
    <section className="flex flex-col gap-[40px] md:gap-[56px] w-full mb-[48px] md:mb-[64px]">

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-[20px]">
        <div>
          <p className="font-['Source_Sans_3:Bold',sans-serif] font-bold text-[#6b0119] text-[11px] tracking-[1.2px] uppercase leading-[16px] mb-[8px]">
            CLASSIFICAÇÃO
          </p>
          <h2 className="font-['IBM_Plex_Sans:Bold',sans-serif] font-bold text-[#121c2a] text-[28px] md:text-[32px] lg:text-[36px] tracking-[-0.72px] leading-[36px] md:leading-[40px] lg:leading-[44px]" style={{ fontVariationSettings: "'wdth' 100" }}>
            {scope === 'nacional' ? 'Ranking Nacional' : `Ranking — ${selectedProvince}`}
          </h2>
          <div className="bg-gradient-to-r from-[#6b0119] to-[#d4a574] h-[3px] w-[64px] mt-[10px]" />
        </div>

        {/* Scope Tabs */}
        <div className="flex bg-white border border-[rgba(222,191,191,0.4)] rounded-[8px] p-[4px] gap-[4px] self-start md:self-auto shadow-sm">
          <button
            onClick={() => setScope('nacional')}
            className={`flex items-center gap-[8px] px-[16px] py-[10px] rounded-[6px] transition-all ${
              scope === 'nacional'
                ? 'bg-[#6b0119] text-white shadow-sm'
                : 'text-[#574142] hover:bg-[#f8f9ff]'
            }`}
          >
            <Trophy className="size-[15px]" />
            <span className="font-['Source_Sans_3:Bold',sans-serif] font-bold text-[13px] leading-[18px] whitespace-nowrap">
              Nacional
            </span>
          </button>
          <button
            onClick={() => setScope('provincia')}
            className={`flex items-center gap-[8px] px-[16px] py-[10px] rounded-[6px] transition-all ${
              scope === 'provincia'
                ? 'bg-[#6b0119] text-white shadow-sm'
                : 'text-[#574142] hover:bg-[#f8f9ff]'
            }`}
          >
            <MapPin className="size-[15px]" />
            <span className="font-['Source_Sans_3:Bold',sans-serif] font-bold text-[13px] leading-[18px] whitespace-nowrap">
              Por Província
            </span>
          </button>
        </div>
      </div>

      {/* Province Selector */}
      {scope === 'provincia' && (
        <div className="flex flex-col sm:flex-row gap-[16px] items-start sm:items-center">
          <div className="flex items-center gap-[10px] shrink-0">
            <MapPin className="size-[18px] text-[#6b0119]" />
            <span className="font-['Source_Sans_3:Bold',sans-serif] font-bold text-[#121c2a] text-[14px] leading-[20px]">
              Seleccionar Província:
            </span>
          </div>

          {/* Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowProvinceDropdown(!showProvinceDropdown)}
              className="flex items-center gap-[12px] bg-white border border-[#debfbf] rounded-[8px] px-[16px] py-[12px] pr-[40px] hover:border-[#6b0119] focus:border-[#6b0119] focus:outline-none transition-all shadow-sm min-w-[220px] relative"
            >
              <MapPin className="size-[16px] text-[#6b0119] shrink-0" />
              <span className="font-['Source_Sans_3:Bold',sans-serif] font-bold text-[#121c2a] text-[14px] leading-[20px] flex-1 text-left">
                {selectedProvince}
              </span>
              <ChevronDown className={`size-[16px] text-[#8b7171] absolute right-[14px] transition-transform ${showProvinceDropdown ? 'rotate-180' : ''}`} />
            </button>

            {showProvinceDropdown && (
              <>
                <style>{`
                  @keyframes provDropdown { from { opacity:0; transform:translateY(-8px) } to { opacity:1; transform:translateY(0) } }
                `}</style>
                <div
                  className="absolute top-[calc(100%+6px)] left-0 bg-white border border-[#debfbf] rounded-[8px] shadow-[0px_8px_24px_rgba(0,0,0,0.12)] z-50 overflow-hidden grid grid-cols-2 min-w-[320px]"
                  style={{ animation: 'provDropdown 200ms ease-out forwards' }}
                >
                  {PROVINCIAS.map((prov, idx) => {
                    const stat = provinceStats.find(s => s.name === prov);
                    const count = stat?.count ?? 0;
                    return (
                      <button
                        key={prov}
                        onClick={() => { setSelectedProvince(prov); setShowProvinceDropdown(false); setShowFullTable(false); }}
                        className={`flex items-center gap-[10px] px-[14px] py-[11px] text-left transition-colors ${
                          selectedProvince === prov
                            ? 'bg-[#eff4ff] text-[#6b0119]'
                            : 'hover:bg-[#f8f9ff] text-[#121c2a]'
                        } ${idx % 2 === 0 ? 'border-r border-[rgba(222,191,191,0.2)]' : ''} border-b border-[rgba(222,191,191,0.15)]`}
                      >
                        <MapPin className={`size-[13px] shrink-0 ${selectedProvince === prov ? 'text-[#6b0119]' : 'text-[#8b7171]'}`} />
                        <div className="flex-1 min-w-0">
                          <div className="font-['Source_Sans_3:Medium',sans-serif] font-medium text-[13px] leading-[18px] truncate">
                            {prov}
                          </div>
                          <div className="font-['Source_Sans_3:Regular',sans-serif] text-[10px] leading-[14px] text-[#8b7171]">
                            {count} investigador{count !== 1 ? 'es' : ''}
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </>
            )}
          </div>

          {/* Province quick stats */}
          {(() => {
            const stat = provinceStats.find(s => s.name === selectedProvince);
            const users = allUsers.filter(u => u.province === selectedProvince);
            const avgPts = users.length ? Math.round(users.reduce((a, u) => a + u.points, 0) / users.length) : 0;
            return stat ? (
              <div className="flex gap-[12px] flex-wrap">
                <div className="bg-[#6b0119] bg-opacity-5 border border-[rgba(107,1,25,0.15)] rounded-[6px] px-[14px] py-[8px]">
                  <span className="font-['Source_Sans_3:Bold',sans-serif] font-bold text-[#6b0119] text-[12px] tracking-[0.5px]">
                    {stat.count} investigador{stat.count !== 1 ? 'es' : ''}
                  </span>
                </div>
                <div className="bg-[#fbbf24] bg-opacity-10 border border-[rgba(251,191,36,0.3)] rounded-[6px] px-[14px] py-[8px]">
                  <span className="font-['Source_Sans_3:Bold',sans-serif] font-bold text-[#92620a] text-[12px] tracking-[0.5px]">
                    Máx: {stat.topPoints.toLocaleString()} pts
                  </span>
                </div>
                <div className="bg-[#acf0e0] bg-opacity-20 border border-[#acf0e0] rounded-[6px] px-[14px] py-[8px]">
                  <span className="font-['Source_Sans_3:Bold',sans-serif] font-bold text-[#003a32] text-[12px] tracking-[0.5px]">
                    Média: {avgPts.toLocaleString()} pts
                  </span>
                </div>
              </div>
            ) : null;
          })()}
        </div>
      )}

      {/* Empty state for province */}
      {scope === 'provincia' && filteredUsers.length === 0 && (
        <div className="bg-white rounded-[12px] border border-dashed border-[#debfbf] p-[48px] text-center">
          <MapPin className="size-[40px] text-[#debfbf] mx-auto mb-[16px]" />
          <h3 className="font-['IBM_Plex_Sans:Bold',sans-serif] font-bold text-[#121c2a] text-[20px] mb-[8px]" style={{ fontVariationSettings: "'wdth' 100" }}>
            Nenhum investigador em {selectedProvince}
          </h3>
          <p className="font-['Source_Sans_3:Regular',sans-serif] text-[#574142] text-[15px]">
            Seja o primeiro a representar esta província no ranking!
          </p>
        </div>
      )}

      {/* Top 3 Podium */}
      {filteredUsers.length > 0 && (
        <div className="w-full">
          {/* Podium reorder: 2nd | 1st | 3rd */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-[16px] md:gap-[20px] items-end mb-[32px] md:mb-[40px]">
            {[top3[1], top3[0], top3[2]].filter(Boolean).map((user, displayIdx) => {
              const isChampion = user.position === 1;
              const podiumHeights = ['h-[200px] md:h-[220px]', 'h-[240px] md:h-[280px]', 'h-[180px] md:h-[200px]'];
              // displayIdx 0 → position 2, displayIdx 1 → position 1, displayIdx 2 → position 3
              const heightClass = podiumHeights[displayIdx];

              const medalConfig: Record<number, { bg: string; text: string; label: string; ring: string }> = {
                1: { bg: 'from-[#fbbf24] to-[#f59e0b]', text: '#fbbf24', label: '1.º', ring: 'ring-[#fbbf24]' },
                2: { bg: 'from-[#d4d4d8] to-[#a1a1aa]', text: '#94a3b8', label: '2.º', ring: 'ring-[#d4d4d8]' },
                3: { bg: 'from-[#d4a574] to-[#b8944f]', text: '#b8944f', label: '3.º', ring: 'ring-[#d4a574]' },
              };
              const medal = medalConfig[user.position];

              return (
                <div
                  key={user.position}
                  className={`relative bg-white rounded-[12px] border border-[rgba(222,191,191,0.15)] shadow-sm hover:shadow-lg transition-all flex flex-col items-center justify-end pb-[24px] pt-[32px] px-[16px] overflow-hidden ${heightClass} ${isChampion ? `ring-2 ${medal.ring} ring-offset-2` : ''}`}
                >
                  {/* Background gradient for champion */}
                  {isChampion && (
                    <div className="absolute inset-0 bg-gradient-to-b from-[#fbbf24]/8 to-transparent pointer-events-none" />
                  )}

                  {/* Position medal top */}
                  <div className={`absolute top-[12px] left-1/2 -translate-x-1/2 bg-gradient-to-br ${medal.bg} rounded-full w-[32px] h-[32px] flex items-center justify-center shadow-md ${isChampion ? 'animate-bounce' : ''}`}>
                    {isChampion ? (
                      <svg className="w-[16px] h-[16px]" fill="white" viewBox="0 0 24 24">
                        <path d="M5 16L3 5L8.5 10L12 4L15.5 10L21 5L19 16H5M19 19C19 19.6 18.6 20 18 20H6C5.4 20 5 19.6 5 19V18H19V19Z" />
                      </svg>
                    ) : (
                      <span className="font-['Source_Sans_3:Bold',sans-serif] font-bold text-white text-[12px]">{user.position}</span>
                    )}
                  </div>

                  {/* Avatar */}
                  <div className={`relative mb-[12px] rounded-[14px] overflow-hidden border-4 w-[64px] h-[64px] md:w-[72px] md:h-[72px] shadow-lg`} style={{ borderColor: medal.text }}>
                    {user.image ? (
                      <img src={user.image} alt={user.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center" style={{ backgroundColor: user.avatarColor }}>
                        <span className="font-['Source_Sans_3:Bold',sans-serif] font-bold text-white text-[22px] leading-none">
                          {user.initials}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Name */}
                  <p className="font-['Source_Sans_3:Bold',sans-serif] font-bold text-[#121c2a] text-[15px] md:text-[16px] leading-[22px] text-center mb-[4px] line-clamp-1">
                    {user.name}
                  </p>

                  {/* Province badge */}
                  <div className="flex items-center gap-[4px] mb-[8px]">
                    <MapPin className="size-[11px] text-[#8b7171]" />
                    <span className="font-['Source_Sans_3:Regular',sans-serif] text-[#8b7171] text-[11px] leading-[14px]">
                      {user.province}
                    </span>
                  </div>

                  {/* Points */}
                  <div className="flex items-center gap-[5px]">
                    <Star className="size-[13px]" fill={medal.text} style={{ color: medal.text }} />
                    <span className="font-['IBM_Plex_Sans:Bold',sans-serif] font-bold text-[15px] md:text-[16px]" style={{ color: medal.text }}>
                      {user.points.toLocaleString()} pts
                    </span>
                  </div>

                  {/* Quizzes & Accuracy */}
                  <div className="flex gap-[12px] mt-[8px]">
                    <span className="font-['Source_Sans_3:Regular',sans-serif] text-[#94a3b8] text-[11px]">
                      {user.quizzes} quizzes
                    </span>
                    <span className="font-['Source_Sans_3:Regular',sans-serif] text-[#94a3b8] text-[11px]">
                      {user.accuracy}% precisão
                    </span>
                  </div>

                  {/* Shine effect */}
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full hover:translate-x-full transition-transform duration-1000 pointer-events-none" />
                </div>
              );
            })}
          </div>

          {/* Full Ranking Table */}
          {rest.length > 0 && (
            <div className="bg-white rounded-[12px] border border-[rgba(222,191,191,0.15)] overflow-hidden shadow-sm">
              {/* Table header */}
              <div className="grid grid-cols-[48px_1fr_auto_auto_auto] gap-[12px] px-[20px] md:px-[28px] py-[14px] bg-[#f8f9ff] border-b border-[rgba(222,191,191,0.2)]">
                <span className="font-['Source_Sans_3:Bold',sans-serif] font-bold text-[#8b7171] text-[11px] tracking-[1px] uppercase text-center">#</span>
                <span className="font-['Source_Sans_3:Bold',sans-serif] font-bold text-[#8b7171] text-[11px] tracking-[1px] uppercase">Investigador</span>
                <span className="font-['Source_Sans_3:Bold',sans-serif] font-bold text-[#8b7171] text-[11px] tracking-[1px] uppercase hidden md:block text-right">Quizzes</span>
                <span className="font-['Source_Sans_3:Bold',sans-serif] font-bold text-[#8b7171] text-[11px] tracking-[1px] uppercase hidden sm:block text-right">Precisão</span>
                <span className="font-['Source_Sans_3:Bold',sans-serif] font-bold text-[#8b7171] text-[11px] tracking-[1px] uppercase text-right">Pontos</span>
              </div>

              {displayRest.map((user, idx) => (
                <div
                  key={user.position}
                  className={`grid grid-cols-[48px_1fr_auto_auto_auto] gap-[12px] px-[20px] md:px-[28px] py-[16px] items-center transition-colors hover:bg-[#f8f9ff] ${idx < displayRest.length - 1 ? 'border-b border-[rgba(222,191,191,0.1)]' : ''}`}
                >
                  {/* Position */}
                  <div className="flex items-center justify-center">
                    <span className="font-['IBM_Plex_Sans:Bold',sans-serif] font-bold text-[#574142] text-[15px] w-[28px] text-center" style={{ fontVariationSettings: "'wdth' 100" }}>
                      {user.position}
                    </span>
                  </div>

                  {/* User Info */}
                  <div className="flex items-center gap-[12px] min-w-0">
                    {/* Avatar */}
                    <div className="shrink-0 w-[40px] h-[40px] rounded-[8px] overflow-hidden">
                      {user.image ? (
                        <img src={user.image} alt={user.name} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center" style={{ backgroundColor: user.avatarColor }}>
                          <span className="font-['Source_Sans_3:Bold',sans-serif] font-bold text-white text-[14px]">
                            {user.initials}
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="min-w-0">
                      <p className="font-['Source_Sans_3:Bold',sans-serif] font-bold text-[#121c2a] text-[14px] md:text-[15px] leading-[20px] truncate">
                        {user.name}
                      </p>
                      <div className="flex items-center gap-[4px]">
                        <MapPin className="size-[11px] text-[#8b7171] shrink-0" />
                        <span className="font-['Source_Sans_3:Regular',sans-serif] text-[#8b7171] text-[12px] truncate">
                          {user.province}
                        </span>
                        {/* Trend */}
                        {user.trend === 'up' && (
                          <span className="ml-[4px] text-[#22c55e] text-[11px] font-bold">↑ {user.trendValue}</span>
                        )}
                        {user.trend === 'down' && (
                          <span className="ml-[4px] text-[#ef4444] text-[11px] font-bold">↓ {user.trendValue}</span>
                        )}
                        {user.trend === 'same' && (
                          <span className="ml-[4px] text-[#94a3b8] text-[11px]">—</span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Quizzes */}
                  <span className="font-['Source_Sans_3:Medium',sans-serif] font-medium text-[#574142] text-[13px] md:text-[14px] hidden md:block text-right">
                    {user.quizzes}
                  </span>

                  {/* Accuracy */}
                  <div className="hidden sm:flex flex-col items-end gap-[3px]">
                    <span className="font-['Source_Sans_3:Medium',sans-serif] font-medium text-[#574142] text-[13px] md:text-[14px]">
                      {user.accuracy}%
                    </span>
                    <div className="w-[48px] h-[4px] bg-[#f1f5f9] rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-[#6b0119] to-[#d4a574] rounded-full"
                        style={{ width: `${user.accuracy}%` }}
                      />
                    </div>
                  </div>

                  {/* Points */}
                  <div className="flex items-center gap-[5px] justify-end">
                    <Star className="size-[12px] text-[#fbbf24] hidden sm:block" fill="#fbbf24" />
                    <span className="font-['IBM_Plex_Sans:Bold',sans-serif] font-bold text-[#d4a574] text-[14px] md:text-[15px]" style={{ fontVariationSettings: "'wdth' 100" }}>
                      {user.points.toLocaleString()}
                    </span>
                  </div>
                </div>
              ))}

              {/* Show more / less */}
              {rest.length > 7 && (
                <button
                  onClick={() => setShowFullTable(!showFullTable)}
                  className="w-full flex items-center justify-center gap-[8px] py-[16px] border-t border-[rgba(222,191,191,0.2)] hover:bg-[#f8f9ff] transition-colors"
                >
                  <span className="font-['Source_Sans_3:Bold',sans-serif] font-bold text-[#6b0119] text-[14px] leading-[20px]">
                    {showFullTable ? 'Mostrar menos' : `Ver mais ${rest.length - 7} investigadores`}
                  </span>
                  <ChevronDown className={`size-[16px] text-[#6b0119] transition-transform ${showFullTable ? 'rotate-180' : ''}`} />
                </button>
              )}
            </div>
          )}
        </div>
      )}

      {/* Province overview mini-map (national scope only) */}
      {scope === 'nacional' && (
        <div className="bg-white rounded-[12px] border border-[rgba(222,191,191,0.15)] p-[24px] md:p-[32px] shadow-sm">
          <div className="flex items-center justify-between mb-[20px] md:mb-[24px]">
            <h3 className="font-['IBM_Plex_Sans:Bold',sans-serif] font-bold text-[#121c2a] text-[18px] md:text-[20px] tracking-[-0.4px] leading-[26px]" style={{ fontVariationSettings: "'wdth' 100" }}>
              Actividade por Província
            </h3>
            <button
              onClick={() => setScope('provincia')}
              className="font-['Source_Sans_3:SemiBold',sans-serif] font-semibold text-[#6b0119] text-[13px] hover:underline flex items-center gap-[6px]"
            >
              <MapPin className="size-[13px]" />
              Ver por província
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-[10px] md:gap-[12px]">
            {provinceStats.map((prov) => {
              const topUser = allUsers.filter(u => u.province === prov.name).sort((a, b) => b.points - a.points)[0];
              const intensityPct = Math.round((prov.topPoints / 5000) * 100);
              return (
                <button
                  key={prov.name}
                  onClick={() => { setScope('provincia'); setSelectedProvince(prov.name); setShowFullTable(false); }}
                  className="flex flex-col gap-[8px] bg-[#f8f9ff] hover:bg-[rgba(107,1,25,0.04)] border border-[rgba(222,191,191,0.2)] hover:border-[rgba(107,1,25,0.25)] rounded-[8px] p-[12px] md:p-[14px] text-left transition-all group"
                >
                  <div className="flex items-center gap-[6px]">
                    <MapPin className="size-[12px] text-[#6b0119] shrink-0" />
                    <span className="font-['Source_Sans_3:Bold',sans-serif] font-bold text-[#121c2a] text-[12px] leading-[16px] truncate group-hover:text-[#6b0119] transition-colors">
                      {prov.name}
                    </span>
                  </div>

                  {/* Mini progress bar */}
                  <div className="w-full h-[4px] bg-[#e2e8f0] rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-[#6b0119] to-[#d4a574] rounded-full transition-all"
                      style={{ width: `${Math.max(10, intensityPct)}%` }}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="font-['Source_Sans_3:Regular',sans-serif] text-[#8b7171] text-[10px]">
                      {prov.count} inv.
                    </span>
                    <span className="font-['Source_Sans_3:Bold',sans-serif] font-bold text-[#d4a574] text-[11px]">
                      {prov.topPoints >= 1000 ? `${(prov.topPoints / 1000).toFixed(1)}k` : prov.topPoints} pts
                    </span>
                  </div>

                  {topUser && (
                    <div className="flex items-center gap-[6px] pt-[4px] border-t border-[rgba(222,191,191,0.2)]">
                      <div className="w-[18px] h-[18px] rounded-[4px] flex items-center justify-center shrink-0" style={{ backgroundColor: topUser.avatarColor }}>
                        <span className="font-['Source_Sans_3:Bold',sans-serif] font-bold text-white text-[8px]">{topUser.initials}</span>
                      </div>
                      <span className="font-['Source_Sans_3:Regular',sans-serif] text-[#574142] text-[10px] truncate">
                        {topUser.name.split(' ')[0]}
                      </span>
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </section>
  );
}
