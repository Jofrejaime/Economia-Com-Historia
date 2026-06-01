import React, { useState } from 'react';
import { ArrowLeft, Search, Filter, Flame, Zap, BookOpen, Headphones, Video, FileText, Clock, TrendingUp, Calendar, Eye } from 'lucide-react';
import BottomNav from './BottomNav';

interface ContentProps {
  onBack: () => void;
  onViewPodcast?: () => void;
  onViewJindungo?: () => void;
  onViewMicro?: () => void;
  onNavigate?: (destination: 'dashboard' | 'content' | 'community' | 'quiz' | 'profile') => void;
  isLoggedIn?: boolean;
}

type CategoryType = 'all' | 'jindungo' | 'micro' | 'series' | 'podcast' | 'video';
type SortType = 'recent' | 'popular' | 'trending';
type ThemeType = 'all' | 'economia' | 'historia' | 'politica' | 'desenvolvimento';

interface ContentItem {
  id: string;
  title: string;
  description: string;
  category: CategoryType;
  theme: ThemeType;
  author: string;
  authorImage: string;
  duration: string;
  image: string;
  views?: number;
  date: string;
  isTrending?: boolean;
}

const contentData: ContentItem[] = [
  {
    id: '1',
    title: 'Dívida Externa: Angola pode sair da dependência do FMI?',
    description: 'Análise profunda sobre o endividamento externo e as relações com instituições financeiras internacionais',
    category: 'jindungo',
    theme: 'economia',
    author: 'Dr. Carlos Neto',
    authorImage: 'https://images.unsplash.com/photo-1531384441138-2736e62e0919?w=100&q=80',
    duration: '18 min de leitura',
    image: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=800&q=80',
    views: 2847,
    date: '2026-04-15',
    isTrending: true
  },
  {
    id: '2',
    title: 'Privatizações: Benefício público ou transferência de riqueza?',
    description: 'Debate sobre o processo de privatizações de empresas estatais em Angola',
    category: 'jindungo',
    theme: 'economia',
    author: 'Prof. Ana Domingos',
    authorImage: 'https://images.unsplash.com/photo-1594744803329-e58b31de8bf5?w=100&q=80',
    duration: '22 min de leitura',
    image: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=800&q=80',
    views: 3156,
    date: '2026-04-12',
    isTrending: true
  },
  {
    id: '3',
    title: 'O que foi o Acordo de Bicesse?',
    description: 'Contexto histórico e consequências do acordo de paz de 1991',
    category: 'micro',
    theme: 'historia',
    author: 'Luís Ferreira',
    authorImage: 'https://images.unsplash.com/photo-1623605931891-d5b95ee98459?w=100&q=80',
    duration: '3 min de leitura',
    image: 'https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=800&q=80',
    views: 1923,
    date: '2026-04-18'
  },
  {
    id: '4',
    title: 'Inflação no Kwanza: números actuais',
    description: 'Análise da inflação e poder de compra da moeda angolana',
    category: 'micro',
    theme: 'economia',
    author: 'Economia em Foco',
    authorImage: 'https://images.unsplash.com/photo-1531384370597-8590413be50a?w=100&q=80',
    duration: '4 min de leitura',
    image: 'https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?w=800&q=80',
    views: 2134,
    date: '2026-04-17'
  },
  {
    id: '5',
    title: 'História Económica de Angola: Podcast Completo',
    description: 'Série de 12 episódios sobre a evolução económica desde a independência',
    category: 'podcast',
    theme: 'historia',
    author: 'Vozes da História',
    authorImage: 'https://images.unsplash.com/photo-1531384441138-2736e62e0919?w=100&q=80',
    duration: '8 episódios · 6h total',
    image: 'https://images.unsplash.com/photo-1478737270239-2f02b77fc618?w=800&q=80',
    views: 5234,
    date: '2026-04-10',
    isTrending: true
  },
  {
    id: '6',
    title: 'A Era do Petróleo em Angola',
    description: 'Documentário sobre a descoberta e exploração petrolífera',
    category: 'video',
    theme: 'economia',
    author: 'História Visual',
    authorImage: 'https://images.unsplash.com/photo-1542345812-d98b5cd6cf98?w=100&q=80',
    duration: '45 min',
    image: 'https://images.unsplash.com/photo-1541888946425-d81bb19240f5?w=800&q=80',
    views: 8932,
    date: '2026-04-08',
    isTrending: true
  },
  {
    id: '7',
    title: 'Reformas Económicas dos Anos 90',
    description: 'As transformações estruturais após o fim da economia planificada',
    category: 'series',
    theme: 'economia',
    author: 'Prof. Manuel Santos',
    authorImage: 'https://images.unsplash.com/photo-1619194617062-5a83b8580c10?w=100&q=80',
    duration: '5 artigos',
    image: 'https://images.unsplash.com/photo-1526304640581-d334cdbbf45e?w=800&q=80',
    views: 1845,
    date: '2026-04-14'
  },
  {
    id: '8',
    title: 'Sonangol: Breve história da empresa estatal',
    description: 'Papel da Sonangol na economia angolana',
    category: 'micro',
    theme: 'economia',
    author: 'Economia em Foco',
    authorImage: 'https://images.unsplash.com/photo-1595956381979-9b3e843e5d4e?w=100&q=80',
    duration: '5 min de leitura',
    image: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&q=80',
    views: 2567,
    date: '2026-04-16'
  },
  {
    id: '9',
    title: 'Desenvolvimento Rural vs. Urbano: O desafio da equidade',
    description: 'Como equilibrar o desenvolvimento entre zonas urbanas e rurais',
    category: 'jindungo',
    theme: 'desenvolvimento',
    author: 'Dr. Carlos Neto',
    authorImage: 'https://images.unsplash.com/photo-1531384441138-2736e62e0919?w=100&q=80',
    duration: '16 min de leitura',
    image: 'https://images.unsplash.com/photo-1464207687429-7505649dae38?w=800&q=80',
    views: 1678,
    date: '2026-04-11'
  },
  {
    id: '10',
    title: 'Conversas sobre Economia Angolana',
    description: 'Entrevistas com economistas e académicos sobre temas actuais',
    category: 'podcast',
    theme: 'economia',
    author: 'Podcast EH',
    authorImage: 'https://images.unsplash.com/photo-1558222218-b7b54eede3f3?w=100&q=80',
    duration: '15 episódios · 10h',
    image: 'https://images.unsplash.com/photo-1590602847861-f357a9332bbc?w=800&q=80',
    views: 3421,
    date: '2026-04-09'
  },
  {
    id: '11',
    title: 'Política Monetária do BNA: Como funciona?',
    description: 'Explicação do papel do Banco Nacional de Angola',
    category: 'video',
    theme: 'economia',
    author: 'Economia Visual',
    authorImage: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&q=80',
    duration: '28 min',
    image: 'https://images.unsplash.com/photo-1559526324-4b87b5e36e44?w=800&q=80',
    views: 2876,
    date: '2026-04-13'
  },
  {
    id: '12',
    title: 'Corrupção e Transparência: Análise do impacto económico',
    description: 'Como a corrupção afecta o desenvolvimento económico de Angola',
    category: 'jindungo',
    theme: 'politica',
    author: 'Prof. Ana Domingos',
    authorImage: 'https://images.unsplash.com/photo-1594744803329-e58b31de8bf5?w=100&q=80',
    duration: '20 min de leitura',
    image: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=800&q=80',
    views: 4123,
    date: '2026-04-07',
    isTrending: true
  }
];

export default function Content({ onBack, onViewPodcast, onViewJindungo, onViewMicro, onNavigate, isLoggedIn = false }: ContentProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<CategoryType>('all');
  const [selectedTheme, setSelectedTheme] = useState<ThemeType>('all');
  const [sortBy, setSortBy] = useState<SortType>('recent');
  const [showFilters, setShowFilters] = useState(false);

  const getCategoryIcon = (category: CategoryType) => {
    switch (category) {
      case 'jindungo': return <Flame className="w-4 h-4" />;
      case 'micro': return <Zap className="w-4 h-4" />;
      case 'podcast': return <Headphones className="w-4 h-4" />;
      case 'video': return <Video className="w-4 h-4" />;
      case 'series': return <BookOpen className="w-4 h-4" />;
      default: return <FileText className="w-4 h-4" />;
    }
  };

  const getCategoryName = (category: CategoryType) => {
    switch (category) {
      case 'jindungo': return 'Jindungo';
      case 'micro': return 'Micro Textos';
      case 'podcast': return 'Podcasts';
      case 'video': return 'Vídeos';
      case 'series': return 'Séries';
      default: return 'Todos';
    }
  };

  const getThemeName = (theme: ThemeType) => {
    switch (theme) {
      case 'economia': return 'Economia';
      case 'historia': return 'História';
      case 'politica': return 'Política';
      case 'desenvolvimento': return 'Desenvolvimento';
      default: return 'Todos os temas';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const diffTime = Math.abs(today.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Hoje';
    if (diffDays === 1) return 'Ontem';
    if (diffDays < 7) return `Há ${diffDays} dias`;
    if (diffDays < 30) return `Há ${Math.floor(diffDays / 7)} semanas`;
    return `Há ${Math.floor(diffDays / 30)} meses`;
  };

  // Filter and sort content
  const filteredContent = contentData
    .filter(item => {
      if (selectedCategory !== 'all' && item.category !== selectedCategory) return false;
      if (selectedTheme !== 'all' && item.theme !== selectedTheme) return false;
      if (searchQuery && !item.title.toLowerCase().includes(searchQuery.toLowerCase())) return false;
      return true;
    })
    .sort((a, b) => {
      if (sortBy === 'recent') return new Date(b.date).getTime() - new Date(a.date).getTime();
      if (sortBy === 'popular') return (b.views || 0) - (a.views || 0);
      if (sortBy === 'trending') return (b.isTrending ? 1 : 0) - (a.isTrending ? 1 : 0);
      return 0;
    });

  return (
    <div className="min-h-screen bg-[#F5F5F5]">
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
      <div className="bg-white border-b border-[#E5E7EB]">
        <div className="px-5 py-4">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-[#8B1E2D] font-['Source_Sans_3'] font-semibold mb-4"
          >
            <ArrowLeft className="w-5 h-5" />
            Voltar
          </button>

          <h1 className="font-['IBM_Plex_Sans'] font-bold text-[26px] text-[#1F2937] mb-4">
            Conteúdos
          </h1>

          {/* Search Bar */}
          <div className="relative mb-4">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#9CA3AF]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Procurar conteúdos..."
              className="w-full h-12 pl-12 pr-4 bg-[#F5F5F5] border-2 border-[#E5E7EB] rounded-lg font-['Source_Sans_3'] text-[16px] text-[#1F2937] placeholder:text-[#9CA3AF] focus:outline-none focus:border-[#8B1E2D] transition-colors"
            />
          </div>

          {/* Filter Button */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-['Source_Sans_3'] font-semibold text-[14px] transition-colors ${
              showFilters ? 'bg-[#8B1E2D] text-white' : 'bg-[#F5F5F5] text-[#4B5563] border-2 border-[#E5E7EB]'
            }`}
          >
            <Filter className="w-4 h-4" />
            Filtros
          </button>
        </div>

        {/* Filters Panel */}
        {showFilters && (
          <div className="px-5 pb-4 space-y-4 border-t border-[#E5E7EB] pt-4">
            {/* Categories */}
            <div>
              <label className="block font-['Source_Sans_3'] font-semibold text-[12px] text-[#9CA3AF] uppercase tracking-wider mb-2">
                Categoria
              </label>
              <div className="flex flex-wrap gap-2">
                {(['all', 'jindungo', 'micro', 'podcast', 'video', 'series'] as CategoryType[]).map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`flex items-center gap-1.5 px-3 py-2 rounded-full font-['Source_Sans_3'] font-medium text-[13px] transition-colors ${
                      selectedCategory === cat
                        ? 'bg-[#8B1E2D] text-white'
                        : 'bg-white border-2 border-[#E5E7EB] text-[#4B5563]'
                    }`}
                  >
                    {getCategoryIcon(cat)}
                    {getCategoryName(cat)}
                  </button>
                ))}
              </div>
            </div>

            {/* Themes */}
            <div>
              <label className="block font-['Source_Sans_3'] font-semibold text-[12px] text-[#9CA3AF] uppercase tracking-wider mb-2">
                Tema
              </label>
              <div className="flex flex-wrap gap-2">
                {(['all', 'economia', 'historia', 'politica', 'desenvolvimento'] as ThemeType[]).map((theme) => (
                  <button
                    key={theme}
                    onClick={() => setSelectedTheme(theme)}
                    className={`px-3 py-2 rounded-full font-['Source_Sans_3'] font-medium text-[13px] transition-colors ${
                      selectedTheme === theme
                        ? 'bg-[#8B1E2D] text-white'
                        : 'bg-white border-2 border-[#E5E7EB] text-[#4B5563]'
                    }`}
                  >
                    {getThemeName(theme)}
                  </button>
                ))}
              </div>
            </div>

            {/* Sort */}
            <div>
              <label className="block font-['Source_Sans_3'] font-semibold text-[12px] text-[#9CA3AF] uppercase tracking-wider mb-2">
                Ordenar por
              </label>
              <div className="flex gap-2">
                <button
                  onClick={() => setSortBy('recent')}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-full font-['Source_Sans_3'] font-medium text-[13px] transition-colors ${
                    sortBy === 'recent'
                      ? 'bg-[#8B1E2D] text-white'
                      : 'bg-white border-2 border-[#E5E7EB] text-[#4B5563]'
                  }`}
                >
                  <Calendar className="w-4 h-4" />
                  Recentes
                </button>
                <button
                  onClick={() => setSortBy('popular')}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-full font-['Source_Sans_3'] font-medium text-[13px] transition-colors ${
                    sortBy === 'popular'
                      ? 'bg-[#8B1E2D] text-white'
                      : 'bg-white border-2 border-[#E5E7EB] text-[#4B5563]'
                  }`}
                >
                  <TrendingUp className="w-4 h-4" />
                  Populares
                </button>
                <button
                  onClick={() => setSortBy('trending')}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-full font-['Source_Sans_3'] font-medium text-[13px] transition-colors ${
                    sortBy === 'trending'
                      ? 'bg-[#8B1E2D] text-white'
                      : 'bg-white border-2 border-[#E5E7EB] text-[#4B5563]'
                  }`}
                >
                  <Flame className="w-4 h-4" />
                  Tendências
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Content List */}
      <div className="px-5 py-6 pb-28">
        <p className="font-['Source_Sans_3'] text-[14px] text-[#9CA3AF] mb-4">
          {filteredContent.length} {filteredContent.length === 1 ? 'conteúdo encontrado' : 'conteúdos encontrados'}
        </p>

        <div className="space-y-4">
          {filteredContent.map((item, index) => (
            <div
              key={item.id}
              onClick={() => {
                if (item.category === 'podcast' && onViewPodcast) {
                  onViewPodcast();
                } else if (item.category === 'jindungo' && onViewJindungo) {
                  onViewJindungo();
                } else if (item.category === 'micro' && onViewMicro) {
                  onViewMicro();
                }
              }}
              style={{ animationDelay: `${index * 80}ms` }}
              className="bg-white rounded-xl overflow-hidden border-2 border-[#E5E7EB] hover:border-[#8B1E2D] hover:shadow-xl hover:scale-[1.01] active:scale-[0.99] transition-all duration-300 cursor-pointer animate-[fadeInUp_0.5s_ease-out_forwards] opacity-0"
            >
              <div className="flex gap-3.5 p-4">
                {/* Image */}
                <div className="relative w-28 h-28 flex-shrink-0 rounded-lg overflow-hidden shadow-sm">
                  <div
                    className="absolute inset-0 bg-cover bg-center"
                    style={{ backgroundImage: `url(${item.image})` }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />

                  {/* Category Icon */}
                  {item.category === 'jindungo' && (
                    <div className="absolute top-2 left-2 w-7 h-7 bg-[#DC2626] rounded-full flex items-center justify-center shadow-md">
                      <Flame className="w-4 h-4 text-white" />
                    </div>
                  )}
                  {item.category === 'micro' && (
                    <div className="absolute top-2 left-2 w-7 h-7 bg-[#8B1E2D] rounded-full flex items-center justify-center shadow-md">
                      <Zap className="w-4 h-4 text-white" />
                    </div>
                  )}
                  {item.category === 'podcast' && (
                    <div className="absolute top-2 left-2 w-7 h-7 bg-[#16A34A] rounded-full flex items-center justify-center shadow-md">
                      <Headphones className="w-4 h-4 text-white" />
                    </div>
                  )}
                  {item.category === 'video' && (
                    <div className="absolute top-2 left-2 w-7 h-7 bg-[#3B82F6] rounded-full flex items-center justify-center shadow-md">
                      <Video className="w-4 h-4 text-white" />
                    </div>
                  )}
                  {item.category === 'series' && (
                    <div className="absolute top-2 left-2 w-7 h-7 bg-[#D97706] rounded-full flex items-center justify-center shadow-md">
                      <BookOpen className="w-4 h-4 text-white" />
                    </div>
                  )}

                </div>

                {/* Content Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <h3 className="font-['IBM_Plex_Sans'] font-bold text-[16px] text-[#1F2937] leading-snug line-clamp-2 flex-1">
                      {item.title}
                    </h3>
                    {item.isTrending && (
                      <Flame className="w-4 h-4 text-[#DC2626] flex-shrink-0 mt-0.5" />
                    )}
                  </div>

                  <p className="font-['Source_Sans_3'] text-[13px] text-[#6B7280] leading-relaxed line-clamp-2 mb-4">
                    {item.description}
                  </p>

                  {/* Metadata */}
                  <div className="space-y-2.5">
                    <div className="flex items-center gap-2.5">
                      <img
                        src={item.authorImage}
                        alt={item.author}
                        className="w-8 h-8 rounded-full object-cover border-2 border-[#E5E7EB] shadow-sm"
                      />
                      <span className="text-[13px] font-['Source_Sans_3'] font-bold text-[#1F2937]">{item.author}</span>
                    </div>
                    <div className="flex items-center flex-wrap gap-2">
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-[#FDF3F4] text-[#8B1E2D] rounded-md text-[11px] font-['Source_Sans_3'] font-bold border border-[#8B1E2D]/10">
                        <Clock className="w-3.5 h-3.5" />
                        {item.duration}
                      </span>
                      {item.views && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-[#F3F4F6] text-[#4B5563] rounded-md text-[11px] font-['Source_Sans_3'] font-bold border border-[#E5E7EB]">
                          <Eye className="w-3.5 h-3.5" />
                          {item.views.toLocaleString()}
                        </span>
                      )}
                      <span className="inline-flex items-center gap-1 text-[11px] font-['Source_Sans_3'] font-semibold text-[#9CA3AF]">
                        <Calendar className="w-3.5 h-3.5" />
                        {formatDate(item.date)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredContent.length === 0 && (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-[#E5E7EB] rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="w-8 h-8 text-[#9CA3AF]" />
            </div>
            <h3 className="font-['IBM_Plex_Sans'] font-bold text-[18px] text-[#1F2937] mb-2">
              Nenhum conteúdo encontrado
            </h3>
            <p className="font-['Source_Sans_3'] text-[14px] text-[#9CA3AF]">
              Tenta ajustar os filtros ou a pesquisa
            </p>
          </div>
        )}
      </div>

      {/* Bottom Navigation */}
      <BottomNav activeTab="content" onNavigate={onNavigate || (() => {})} isLoggedIn={isLoggedIn} />
    </div>
  );
}
