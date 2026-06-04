import React, { useState } from 'react';
import { ArrowLeft, Clock, BookmarkPlus, Share2, ThumbsUp, ThumbsDown, MessageCircle, ChevronRight, Trophy, Users } from 'lucide-react';
import BottomNav from './BottomNav';

interface ArticleProps {
  onBack: () => void;
  type: 'jindungo' | 'micro';
  onStartQuiz?: () => void;
  onCreateTopic?: (title: string, category: string) => void;
  onNavigate?: (destination: 'dashboard' | 'content' | 'community' | 'quiz' | 'profile') => void;
  isLoggedIn?: boolean;
}

export default function Article({ onBack, type, onStartQuiz, onCreateTopic, onNavigate, isLoggedIn = false }: ArticleProps) {
  const [liked, setLiked] = useState<boolean | null>(null);

  const isJindungo = type === 'jindungo';

  return (
    <div className="min-h-screen bg-[#F5F5F5]">
      {/* Status Bar */}
      {/* Header */}
      <div className="bg-white px-5 py-4 border-b border-[#E5E7EB] sticky top-0 z-10">
        <div className="flex items-center justify-between mb-3">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-[#8B1E2D] font-['Source_Sans_3'] font-semibold"
          >
            <ArrowLeft className="w-5 h-5" />
            Voltar
          </button>

          <span className="font-['IBM_Plex_Sans'] font-bold text-[14px] text-[#1F2937]">
            Economia com História
          </span>

          <button className="w-6 h-6 flex items-center justify-center">
            <div className="flex flex-col gap-1">
              <div className="w-1 h-1 bg-[#4B5563] rounded-full"></div>
              <div className="w-1 h-1 bg-[#4B5563] rounded-full"></div>
              <div className="w-1 h-1 bg-[#4B5563] rounded-full"></div>
            </div>
          </button>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-1.5 px-3 py-2 bg-[#F5F5F5] rounded-lg">
            <BookmarkPlus className="w-4 h-4 text-[#4B5563]" />
            <span className="font-['Source_Sans_3'] font-semibold text-[13px] text-[#4B5563]">Guardar</span>
          </button>
          <button className="flex items-center gap-1.5 px-3 py-2 bg-[#F5F5F5] rounded-lg">
            <Share2 className="w-4 h-4 text-[#4B5563]" />
            <span className="font-['Source_Sans_3'] font-semibold text-[13px] text-[#4B5563]">Partilhar</span>
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="bg-white">
        {/* Article Header */}
        <div className="px-5 pt-6 pb-4">
          {/* Category Badge */}
          <div className="mb-4">
            {isJindungo ? (
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#DC2626] text-white rounded-md font-['Source_Sans_3'] font-bold text-[11px] uppercase tracking-wide">
                <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M13.5 0.67s0.74 2.65 0.74 4.8c0 2.06-1.35 3.73-3.41 3.73-2.07 0-3.63-1.67-3.63-3.73l0.03-0.36C5.21 7.51 4 10.62 4 14c0 4.42 3.58 8 8 8s8-3.58 8-8C20 8.61 17.41 3.8 13.5 0.67zM11.71 19c-1.78 0-3.22-1.4-3.22-3.14 0-1.62 1.05-2.76 2.81-3.12 1.77-.36 3.6-1.21 4.62-2.58.39 1.29.59 2.65.59 4.04 0 2.65-2.15 4.8-4.8 4.8z"/>
                </svg>
                Jindungo
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#8B1E2D] text-white rounded-md font-['Source_Sans_3'] font-bold text-[11px] uppercase tracking-wide">
                <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M13 7h-2v4H7v2h4v4h2v-4h4v-2h-4V7zm-1-5C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z"/>
                </svg>
                Micro Texto
              </span>
            )}
          </div>

          {/* Title */}
          <h1 className="font-['IBM_Plex_Sans'] font-bold text-[28px] text-[#1F2937] leading-tight mb-4">
            {isJindungo
              ? 'A Riqueza do Subsolo Angolano: Do Café ao Crude'
              : 'O que foi o Acordo de Bicesse?'
            }
          </h1>

          {/* Author Info */}
          <div className="flex items-center gap-3 mb-6">
            <img
              src="https://images.unsplash.com/photo-1531384441138-2736e62e0919?w=100&q=80"
              alt="Autor"
              className="w-12 h-12 rounded-full object-cover border-2 border-[#E5E7EB]"
            />
            <div className="flex-1">
              <p className="font-['Source_Sans_3'] font-bold text-[14px] text-[#1F2937]">
                {isJindungo ? 'Dr. Carlos Neto' : 'Luís Ferreira'}
              </p>
              <div className="flex items-center gap-2 text-[12px] text-[#6B7280]">
                <span className="font-['Source_Sans_3'] font-medium">
                  {isJindungo ? '18 min de leitura' : '3 min de leitura'}
                </span>
                <span>•</span>
                <span className="font-['Source_Sans_3'] font-medium">Há 3 dias</span>
              </div>
            </div>
          </div>

          {/* Featured Image */}
          <div className="relative w-full h-64 rounded-xl overflow-hidden mb-6">
            <img
              src={isJindungo
                ? "https://images.unsplash.com/photo-1541888946425-d81bb19240f5?w=800&q=80"
                : "https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=800&q=80"
              }
              alt="Imagem do artigo"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent"></div>
          </div>
        </div>

        {/* Article Content */}
        <div className="px-5 pb-8">
          {isJindungo ? (
            <>
              {/* Introduction */}
              <div className="mb-6">
                <p className="font-['Source_Sans_3'] text-[17px] text-[#1F2937] leading-relaxed mb-4">
                  A história do subsolo angolano é tão rica quanto controversa. Desde os tempos coloniais até aos dias de hoje, os recursos naturais moldaram profundamente a economia e a sociedade angolanas.
                </p>
                <p className="font-['Source_Sans_3'] text-[17px] text-[#1F2937] leading-relaxed">
                  Esta narrativa de transformação, da economia cafeeira à dependência petrolífera, levanta questões fundamentais sobre o desenvolvimento económico sustentável.
                </p>
              </div>

              {/* Section */}
              <div className="mb-6">
                <h2 className="font-['IBM_Plex_Sans'] font-bold text-[22px] text-[#1F2937] mb-3">
                  O Café: O Primeiro Ouro Negro
                </h2>
                <p className="font-['Source_Sans_3'] text-[17px] text-[#1F2937] leading-relaxed mb-4">
                  Durante décadas, o café angolano era considerado um dos melhores do mundo. A economia colonial dependia fortemente desta exportação, que empregava milhares de trabalhadores nas regiões montanhosas.
                </p>
                <p className="font-['Source_Sans_3'] text-[17px] text-[#1F2937] leading-relaxed">
                  Com a independência em 1975, a produção cafeeira enfrentou desafios sem precedentes, incluindo a guerra civil e a falta de investimento.
                </p>
              </div>

              {/* Academic Note */}
              <div className="bg-[#FDF3F4] border-l-4 border-[#8B1E2D] rounded-lg p-5 mb-6">
                <h3 className="font-['IBM_Plex_Sans'] font-bold text-[16px] text-[#8B1E2D] mb-3">
                  Nota Académica: A Relação Café-Petróleo
                </h3>
                <p className="font-['Source_Sans_3'] text-[15px] text-[#1F2937] leading-relaxed mb-3">
                  A transição de uma economia agrícola (café) para uma economia extractiva (petróleo) representa um caso clássico da "maldição dos recursos naturais".
                </p>
                <p className="font-['Source_Sans_3'] text-[15px] text-[#6B7280] leading-relaxed">
                  Economistas argumentam que a dependência excessiva de um único recurso pode prejudicar o desenvolvimento de outros sectores produtivos.
                </p>
              </div>

              {/* Vocabulary Section */}
              <div className="bg-[#F5F5F5] rounded-lg p-5 mb-6">
                <h3 className="font-['IBM_Plex_Sans'] font-bold text-[14px] text-[#4B5563] uppercase tracking-wider mb-4">
                  Vocabulário
                </h3>
                <div className="space-y-3">
                  <div>
                    <p className="font-['Source_Sans_3'] font-bold text-[15px] text-[#1F2937] mb-1">
                      Crude (Petróleo Bruto)
                    </p>
                    <p className="font-['Source_Sans_3'] text-[14px] text-[#6B7280]">
                      Petróleo não refinado, tal como é extraído do subsolo
                    </p>
                  </div>
                  <div>
                    <p className="font-['Source_Sans_3'] font-bold text-[15px] text-[#1F2937] mb-1">
                      Economia Extractiva
                    </p>
                    <p className="font-['Source_Sans_3'] text-[14px] text-[#6B7280]">
                      Sistema económico baseado na extração de recursos naturais
                    </p>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <>
              {/* Micro texto content */}
              <div className="mb-6">
                <p className="font-['Source_Sans_3'] text-[17px] text-[#1F2937] leading-relaxed mb-4">
                  O Acordo de Bicesse foi um tratado de paz assinado em 31 de maio de 1991, em Estoril, Portugal, entre o governo angolano (MPLA) e a UNITA.
                </p>
                <p className="font-['Source_Sans_3'] text-[17px] text-[#1F2937] leading-relaxed mb-4">
                  Este acordo pôs fim a 16 anos de guerra civil e estabeleceu as bases para as primeiras eleições multipartidárias em Angola.
                </p>
                <p className="font-['Source_Sans_3'] text-[17px] text-[#1F2937] leading-relaxed">
                  Apesar das expectativas, o acordo falhou quando a UNITA rejeitou os resultados eleitorais de 1992, levando à retoma do conflito armado.
                </p>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Action Buttons - Quiz and Forum */}
      <div className="bg-white border-t border-[#E5E7EB] px-5 py-6 mb-4">
        <h3 className="font-['IBM_Plex_Sans'] font-bold text-[11px] text-[#9CA3AF] uppercase tracking-[0.12em] mb-4">
          Atividades
        </h3>
        <div className="space-y-3">
          <button
            onClick={onStartQuiz}
            className="w-full flex items-center justify-between px-4 py-3.5 bg-[#8B1E2D] text-white rounded-lg hover:bg-[#A52535] transition-colors"
          >
            <span className="font-['Source_Sans_3'] font-semibold text-[15px]">
              Realizar Quiz
            </span>
            <Trophy className="w-5 h-5" />
          </button>

          <button
            onClick={() => onCreateTopic?.(
              isJindungo
                ? 'A Riqueza do Subsolo Angolano: Do Café ao Crude'
                : 'O que foi o Acordo de Bicesse?',
              isJindungo ? 'Petróleo e Reforma' : 'História Monetária'
            )}
            className="w-full flex items-center justify-between px-4 py-3.5 bg-[#047857] text-white rounded-lg hover:bg-[#059669] transition-colors"
          >
            <span className="font-['Source_Sans_3'] font-semibold text-[15px]">
              Debater no Fórum
            </span>
            <Users className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Feedback Section */}
      <div className="bg-white border-t border-[#E5E7EB] px-5 py-6 mb-4">
        <h3 className="font-['IBM_Plex_Sans'] font-bold text-[18px] text-[#1F2937] mb-4 text-center">
          Gostaste deste conteúdo?
        </h3>
        <div className="flex items-center justify-center gap-4">
          <button
            onClick={() => setLiked(true)}
            className={`flex items-center gap-2 px-6 py-3 rounded-lg border-2 transition-all ${
              liked === true
                ? 'bg-[#16A34A] border-[#16A34A] text-white'
                : 'bg-white border-[#E5E7EB] text-[#4B5563] hover:border-[#16A34A]'
            }`}
          >
            <ThumbsUp className="w-5 h-5" />
            <span className="font-['Source_Sans_3'] font-bold text-[14px]">Sim</span>
          </button>
          <button
            onClick={() => setLiked(false)}
            className={`flex items-center gap-2 px-6 py-3 rounded-lg border-2 transition-all ${
              liked === false
                ? 'bg-[#DC2626] border-[#DC2626] text-white'
                : 'bg-white border-[#E5E7EB] text-[#4B5563] hover:border-[#DC2626]'
            }`}
          >
            <ThumbsDown className="w-5 h-5" />
            <span className="font-['Source_Sans_3'] font-bold text-[14px]">Não</span>
          </button>
        </div>
      </div>

      {/* Related Articles */}
      <div className="bg-white px-5 py-6 mb-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-['IBM_Plex_Sans'] font-bold text-[18px] text-[#1F2937]">
            Artigos Relacionados
          </h3>
          <button className="text-[#8B1E2D] font-['Source_Sans_3'] font-semibold text-[14px] flex items-center gap-1">
            Ver todos
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        <div className="space-y-3">
          {/* Related Article Card */}
          <div className="flex gap-3 p-3 bg-[#F5F5F5] rounded-lg border border-[#E5E7EB]">
            <img
              src="https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=200&q=80"
              alt="Artigo relacionado"
              className="w-20 h-20 rounded-lg object-cover"
            />
            <div className="flex-1 min-w-0">
              <h4 className="font-['IBM_Plex_Sans'] font-bold text-[14px] text-[#1F2937] leading-tight line-clamp-2 mb-1">
                Independência e Reconstrução Económica (1975–1985)
              </h4>
              <p className="font-['Source_Sans_3'] text-[12px] text-[#9CA3AF]">8 min de leitura</p>
            </div>
          </div>

          <div className="flex gap-3 p-3 bg-[#F5F5F5] rounded-lg border border-[#E5E7EB]">
            <img
              src="https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?w=200&q=80"
              alt="Artigo relacionado"
              className="w-20 h-20 rounded-lg object-cover"
            />
            <div className="flex-1 min-w-0">
              <h4 className="font-['IBM_Plex_Sans'] font-bold text-[14px] text-[#1F2937] leading-tight line-clamp-2 mb-1">
                Kwanza: História e Desafios da Moeda Nacional
              </h4>
              <p className="font-['Source_Sans_3'] text-[12px] text-[#9CA3AF]">14 min · áudio disponível</p>
            </div>
          </div>
        </div>
      </div>

      {/* Comments Section */}
      <div className="bg-white px-5 py-6 mb-24">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-['IBM_Plex_Sans'] font-bold text-[18px] text-[#1F2937] flex items-center gap-2">
            <MessageCircle className="w-5 h-5 text-[#8B1E2D]" />
            Comentários (12)
          </h3>
        </div>
        <button className="w-full py-3 border-2 border-[#E5E7EB] text-[#4B5563] rounded-lg font-['Source_Sans_3'] font-semibold text-[14px] hover:border-[#8B1E2D] hover:text-[#8B1E2D] transition-colors">
          Ver comentários
        </button>
      </div>

      {/* Bottom Navigation */}
      <BottomNav activeTab="content" onNavigate={onNavigate || (() => {})} isLoggedIn={isLoggedIn} />
    </div>
  );
}
