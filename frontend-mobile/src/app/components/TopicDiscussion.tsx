import React, { useState } from 'react';
import { ArrowLeft, ThumbsUp, MessageCircle, Share2, MoreVertical } from 'lucide-react';
import BottomNav from './BottomNav';

interface TopicDiscussionProps {
  onBack: () => void;
  onNavigate?: (destination: 'dashboard' | 'content' | 'community' | 'quiz' | 'profile') => void;
  onComment?: () => void;
  isLoggedIn?: boolean;
}

interface Comment {
  id: string;
  author: string;
  authorAvatar: string;
  time: string;
  content: string;
  likes: number;
  replies: number;
  isLiked?: boolean;
}

export default function TopicDiscussion({ onBack, onNavigate, onComment, isLoggedIn = false }: TopicDiscussionProps) {
  const [showCommentBox, setShowCommentBox] = useState(false);
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [animatingLike, setAnimatingLike] = useState<string | null>(null);
  const [topicLiked, setTopicLiked] = useState(false);
  const [topicLikes, setTopicLikes] = useState(448);
  const [comments, setComments] = useState<Comment[]>([
    {
      id: '1',
      author: 'Dr. Ricardo Marto',
      authorAvatar: 'RM',
      time: 'há 2 horas',
      content: 'Excelente análise! A ferrovia de Benguela foi e ainda é peça-chave da infraestrutura logística de Angola. As obras de reabilitação podem transformar significativamente a região.',
      likes: 12,
      replies: 3,
      isLiked: true
    },
    {
      id: '2',
      author: 'Ana Paula Santos',
      authorAvatar: 'AS',
      time: 'há 5 horas',
      content: 'Concordo plenamente. É importante também analisar o impacto social desta obra. A ferrovia não traz apenas benefícios económicos, mas pode transformar comunidades inteiras ao longo do trajeto. A economia local, o acesso a mercados e a integração regional são fatores-chave para avaliarmos o verdadeiro impacto social.',
      likes: 8,
      replies: 1
    }
  ]);

  const handleTopicLike = () => {
    if (!isLoggedIn) {
      if (onComment) {
        onComment();
      }
      return;
    }

    setAnimatingLike('topic');
    setTimeout(() => setAnimatingLike(null), 600);

    setTopicLiked(!topicLiked);
    setTopicLikes(topicLiked ? topicLikes - 1 : topicLikes + 1);
  };

  const handleLike = (commentId: string) => {
    if (!isLoggedIn) {
      if (onComment) {
        onComment();
      }
      return;
    }

    setAnimatingLike(commentId);
    setTimeout(() => setAnimatingLike(null), 600);

    setComments(comments.map(comment => {
      if (comment.id === commentId) {
        return {
          ...comment,
          isLiked: !comment.isLiked,
          likes: comment.isLiked ? comment.likes - 1 : comment.likes + 1
        };
      }
      return comment;
    }));
  };

  const handleReply = (commentId: string) => {
    if (!isLoggedIn) {
      if (onComment) {
        onComment();
      }
      return;
    }
    setReplyingTo(replyingTo === commentId ? null : commentId);
  };

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
            <span className="font-['IBM_Plex_Sans'] font-bold text-[16px]">Discussão do Fórum</span>
          </button>
          <button className="p-2">
            <MoreVertical className="w-5 h-5 text-[#4B5563]" />
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="pb-28">
        {/* Topic Header */}
        <div className="bg-white px-6 pt-6 pb-4 mb-4">
          <div className="mb-3">
            <span className="font-['Source_Sans_3'] font-bold text-[11px] text-[#8B1E2D] tracking-[1px] uppercase">
              COMUNIDADE E CULTURA
            </span>
          </div>

          <h1 className="font-['IBM_Plex_Sans'] font-bold text-[28px] text-[#1F2937] leading-tight mb-4">
            O Impacto da Ferrovia de Benguela
          </h1>

          {/* Featured Image */}
          <div className="relative w-full h-48 rounded-xl overflow-hidden mb-4">
            <img
              src="https://images.unsplash.com/photo-1474487548417-781cb71495f3?w=800&q=80"
              alt="Ferrovia"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
            <div className="absolute bottom-3 left-3 right-3">
              <p className="font-['Source_Sans_3'] text-[13px] text-white/90">
                IMAGEM POR FOTO: ALBERTO TEIXEIRA
              </p>
            </div>
          </div>

          {/* Author & Date */}
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-[#D9E3F6] rounded-full flex items-center justify-center">
              <span className="font-['Source_Sans_3'] font-bold text-[16px] text-[#8B1E2D]">JD</span>
            </div>
            <div>
              <p className="font-['Source_Sans_3'] font-semibold text-[14px] text-[#1F2937]">
                João Diogo
              </p>
              <p className="font-['Source_Sans_3'] text-[12px] text-[#9CA3AF]">
                Publicado há 3 dias
              </p>
            </div>
          </div>

          {/* Quote */}
          <div className="bg-[#F8F9FF] border-l-4 border-[#8B1E2D] rounded-r-lg p-4 mb-6">
            <p className="font-['Source_Sans_3'] italic text-[16px] text-[#4B5563] leading-relaxed">
              "A ferrovia não foi apenas um trilho de aço, foi a espinha dorsal de uma economia nascente. Conectou mercados, uniu povos e alimentou esperanças. Agora, a questão é: podemos revitalizar não apenas os trilhos, mas também o impacto social?"
            </p>
          </div>

          {/* Stats & Actions */}
          <div className="pt-4 border-t border-[#E5E7EB]">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <MessageCircle className="w-5 h-5 text-[#8B1E2D]" />
                <span className="font-['Source_Sans_3'] font-bold text-[15px] text-[#1F2937]">
                  24 COMENTÁRIOS
                </span>
              </div>
              <button
                onClick={handleTopicLike}
                className={`flex items-center gap-2 transition-all ${
                  topicLiked ? 'text-[#8B1E2D]' : 'text-[#9CA3AF]'
                } ${isLoggedIn ? 'hover:scale-105 active:scale-95' : 'cursor-not-allowed opacity-50'} ${
                  animatingLike === 'topic' ? 'animate-[likeAnimation_0.6s_ease-out]' : ''
                }`}
              >
                <ThumbsUp
                  className={`w-5 h-5 transition-all ${
                    animatingLike === 'topic' ? 'scale-150' : ''
                  }`}
                  fill={topicLiked ? 'currentColor' : 'none'}
                />
                <span className="font-['Source_Sans_3'] font-semibold text-[14px]">
                  {topicLikes}
                </span>
              </button>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2">
              <button
                onClick={handleTopicLike}
                className={`flex-1 py-2.5 rounded-lg font-['Source_Sans_3'] font-semibold text-[14px] transition-all ${
                  topicLiked
                    ? 'bg-[#8B1E2D] text-white'
                    : 'bg-[#F5F5F5] text-[#6B7280] hover:bg-[#E5E7EB]'
                } ${isLoggedIn ? 'active:scale-95' : 'opacity-50 cursor-not-allowed'}`}
              >
                <div className="flex items-center justify-center gap-2">
                  <ThumbsUp className="w-4 h-4" fill={topicLiked ? 'currentColor' : 'none'} />
                  <span>{topicLiked ? 'Gostei' : 'Gostar'}</span>
                </div>
              </button>
              <button className="flex-1 py-2.5 bg-[#F5F5F5] text-[#6B7280] rounded-lg font-['Source_Sans_3'] font-semibold text-[14px] hover:bg-[#E5E7EB] active:scale-95 transition-all">
                <div className="flex items-center justify-center gap-2">
                  <Share2 className="w-4 h-4" />
                  <span>Partilhar</span>
                </div>
              </button>
            </div>
          </div>
        </div>

        {/* Comments */}
        <div className="bg-white px-6 py-4">
          <div className="space-y-6">
            {comments.map((comment) => (
              <div key={comment.id} className="pb-6 border-b border-[#E5E7EB] last:border-0">
                {/* Comment Header */}
                <div className="flex items-start gap-3 mb-3">
                  <div className="w-10 h-10 bg-[#D9E3F6] rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="font-['Source_Sans_3'] font-bold text-[15px] text-[#8B1E2D]">
                      {comment.authorAvatar}
                    </span>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <p className="font-['Source_Sans_3'] font-bold text-[15px] text-[#1F2937]">
                        {comment.author}
                      </p>
                      <span className="font-['Source_Sans_3'] text-[12px] text-[#9CA3AF]">
                        {comment.time}
                      </span>
                    </div>
                    <p className="font-['Source_Sans_3'] text-[15px] text-[#4B5563] leading-relaxed">
                      {comment.content}
                    </p>
                  </div>
                </div>

                {/* Comment Actions */}
                <div className="flex items-center gap-6 ml-13">
                  <button
                    onClick={() => handleLike(comment.id)}
                    disabled={!isLoggedIn}
                    className={`flex items-center gap-1.5 transition-all ${
                      comment.isLiked ? 'text-[#8B1E2D]' : 'text-[#9CA3AF]'
                    } ${isLoggedIn ? 'hover:scale-110 active:scale-95' : 'opacity-50 cursor-not-allowed'} ${
                      animatingLike === comment.id ? 'animate-[likeAnimation_0.6s_ease-out]' : ''
                    }`}
                  >
                    <ThumbsUp
                      className={`w-4 h-4 transition-all ${
                        animatingLike === comment.id ? 'scale-150' : ''
                      }`}
                      fill={comment.isLiked ? 'currentColor' : 'none'}
                    />
                    <span className="font-['Source_Sans_3'] font-semibold text-[13px]">
                      {comment.likes}
                    </span>
                  </button>
                  <button
                    onClick={() => handleReply(comment.id)}
                    className={`flex items-center gap-1.5 text-[#9CA3AF] transition-all ${
                      isLoggedIn ? 'hover:text-[#8B1E2D] active:scale-95' : 'opacity-50 cursor-not-allowed'
                    }`}
                  >
                    <MessageCircle className="w-4 h-4" />
                    <span className="font-['Source_Sans_3'] font-semibold text-[13px]">
                      Responder
                    </span>
                  </button>
                </div>

                {/* Reply Box */}
                {replyingTo === comment.id && (
                  <div className="mt-4 ml-13 bg-[#F8F9FF] rounded-lg p-4 animate-[fadeInUp_0.3s_ease-out]">
                    <div className="flex gap-3">
                      <div className="w-8 h-8 bg-[#D9E3F6] rounded-full flex items-center justify-center flex-shrink-0">
                        <span className="font-['Source_Sans_3'] font-bold text-[13px] text-[#8B1E2D]">EU</span>
                      </div>
                      <div className="flex-1">
                        <textarea
                          placeholder={`Responder a ${comment.author}...`}
                          rows={2}
                          autoFocus
                          className="w-full px-3 py-2 bg-white border border-[#E5E7EB] rounded-lg font-['Source_Sans_3'] text-[14px] text-[#1F2937] placeholder:text-[#9CA3AF] focus:outline-none focus:border-[#8B1E2D] resize-none"
                        />
                        <div className="flex justify-end gap-2 mt-2">
                          <button
                            onClick={() => setReplyingTo(null)}
                            className="px-3 py-1.5 text-[#6B7280] font-['Source_Sans_3'] font-semibold text-[13px] hover:bg-white rounded-lg transition-colors"
                          >
                            Cancelar
                          </button>
                          <button
                            onClick={() => setReplyingTo(null)}
                            className="px-4 py-1.5 bg-[#8B1E2D] text-white rounded-lg font-['Source_Sans_3'] font-semibold text-[13px] hover:bg-[#A52535] active:scale-95 transition-all"
                          >
                            Responder
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Floating Action Button */}
      <button
        onClick={() => {
          if (onComment) {
            onComment();
          } else {
            setShowCommentBox(!showCommentBox);
          }
        }}
        className="fixed bottom-24 right-6 w-14 h-14 bg-[#8B1E2D] text-white rounded-full shadow-lg flex items-center justify-center hover:bg-[#A52535] active:scale-95 transition-all z-20"
      >
        <MessageCircle className="w-6 h-6" />
      </button>

      {/* Comment Input (shown when FAB is clicked) */}
      {showCommentBox && (
        <div className="fixed bottom-24 left-0 right-0 bg-white border-t border-[#E5E7EB] p-4 shadow-2xl z-20">
          <div className="flex gap-3">
            <div className="w-10 h-10 bg-[#D9E3F6] rounded-full flex items-center justify-center flex-shrink-0">
              <span className="font-['Source_Sans_3'] font-bold text-[15px] text-[#8B1E2D]">EU</span>
            </div>
            <div className="flex-1">
              <textarea
                placeholder="Adicionar um comentário..."
                rows={3}
                className="w-full px-4 py-3 bg-[#F5F5F5] border border-[#E5E7EB] rounded-lg font-['Source_Sans_3'] text-[15px] text-[#1F2937] placeholder:text-[#9CA3AF] focus:outline-none focus:border-[#8B1E2D] resize-none"
              />
              <div className="flex justify-end gap-2 mt-2">
                <button
                  onClick={() => setShowCommentBox(false)}
                  className="px-4 py-2 text-[#6B7280] font-['Source_Sans_3'] font-semibold text-[14px]"
                >
                  Cancelar
                </button>
                <button className="px-6 py-2 bg-[#8B1E2D] text-white rounded-lg font-['Source_Sans_3'] font-semibold text-[14px] hover:bg-[#A52535] transition-colors">
                  Publicar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Bottom Navigation */}
      <BottomNav activeTab="community" onNavigate={onNavigate || (() => {})} isLoggedIn={isLoggedIn} />
    </div>
  );
}
