import { useState } from 'react';
import { useNavigate } from 'react-router';
import { Heart } from 'lucide-react';
import SystemHeader from '../components/SystemHeader';
import SystemFooter from '../components/SystemFooter';
import svgPaths from '../../imports/ComunidadeAcademicaDesktop-1/svg-90hhnwtu0o';

export default function DiscussionThread() {
  const navigate = useNavigate();
  const [replyText, setReplyText] = useState('');
  const [showReplyForm, setShowReplyForm] = useState(false);

  const discussion = {
    id: 1,
    author: 'Jofre Jaime',
    authorInitials: 'JJ',
    authorRole: 'Investigador Sénior',
    authorPosts: 127,
    avatar: '#8b1e2d',
    category: 'ANÁLISE DE POLÍTICAS',
    categoryColor: { bg: '#acf0e0', text: '#003a32' },
    timeAgo: 'há 2 horas',
    date: '10 Mai 2026, 14:30',
    title: 'Análise da Reforma Monetária de 1976: A Transição do Kwanza',
    content: `Procuro fontes primárias sobre a logística da troca de moeda em 1976 nas províncias do leste. Especificamente, estou interessado em:

**Questões principais:**

1. Documentação sobre a implementação regional da reforma monetária
2. Relatórios de contagens regionais, especialmente de Moxico e Cuando Cubango
3. Correspondência entre o Banco Nacional de Angola e autoridades provinciais
4. Dados estatísticos sobre a circulação monetária durante o período de transição

Tenho consultado os arquivos do BNA mas a documentação para estas províncias específicas parece estar incompleta ou mal catalogada. Alguém da comunidade teve acesso a fontes primárias deste período?

Também estou interessado em saber se existem relatórios internos sobre os desafios logísticos enfrentados durante a implementação da reforma nas zonas rurais.

Agradeço antecipadamente qualquer orientação ou referências bibliográficas.`,
    replies: 12,
    views: 487,
    likes: 23,
    isLiked: false,
    isPinned: false,
  };

  const replies = [
    {
      id: 1,
      author: 'Ana Correia',
      authorInitials: 'AC',
      authorRole: 'Professora Associada',
      authorPosts: 89,
      avatar: '#6b0119',
      timeAgo: 'há 1 hora',
      date: '10 Mai 2026, 15:30',
      content: `Olá Jofre, excelente questão de investigação!

Trabalhei recentemente com documentação similar para o meu estudo sobre políticas monetárias pós-coloniais. Posso sugerir algumas fontes que podem ser úteis:

1. **Arquivo Histórico do BNA** - Sala 3, Estante 12-B: Contém relatórios trimestrais de 1975-1977. Verifique especialmente o relatório Q4/1976.

2. **Biblioteca Nacional** - Secção de Economia: Tem uma colecção de correspondências oficiais entre Luanda e as províncias. Código de catalogação: ECO-MON-1976.

3. Também recomendo contactar a Dra. Isabel Fernandes na Universidade Agostinho Neto - ela tem investigado extensivamente este período.

Espero que ajude!`,
      likes: 15,
      isLiked: false,
    },
    {
      id: 2,
      author: 'Manuel Santos',
      authorInitials: 'MS',
      authorRole: 'Estudante de Doutoramento',
      authorPosts: 34,
      avatar: '#8b1e2d',
      timeAgo: 'há 45 min',
      date: '10 Mai 2026, 15:45',
      content: `Complementando a resposta da Ana, também sugiro verificar os arquivos digitalizados do Ministério das Finanças desse período.

Encontrei alguns documentos interessantes sobre a logística de distribuição da nova moeda. Posso partilhar as referências se precisar.

Uma observação: muita da documentação de Moxico foi transferida para Luanda em 1978 devido ao conflito armado, por isso pode estar arquivada sob códigos diferentes dos esperados.`,
      likes: 8,
      isLiked: true,
    },
    {
      id: 3,
      author: 'Isabel Fernandes',
      authorInitials: 'IF',
      authorRole: 'Investigadora Principal',
      authorPosts: 203,
      avatar: '#6b0119',
      timeAgo: 'há 30 min',
      date: '10 Mai 2026, 16:00',
      content: `Obrigada pela menção, Ana! 👋

Jofre, realmente tenho alguns documentos que podem interessar. Inclusive, tenho cópias digitalizadas de relatórios internos do BNA de 1976 que incluem dados de Moxico.

Podes contactar-me através do email institucional (ifernandes@uan.ao) e posso partilhar os PDFs.

Também estou a organizar um seminário sobre este tema no próximo mês - seria óptimo ter a tua perspectiva nesta discussão.`,
      likes: 19,
      isLiked: false,
    },
  ];

  const relatedTopics = [
    { title: 'Documentos Fundadores do BNA', replies: 18, views: 612 },
    { title: 'Política Fiscal no Período Pós-Colonial', replies: 24, views: 891 },
    { title: 'Sistema Monetário Angolano (1975-1985)', replies: 15, views: 543 },
  ];

  const handleSubmitReply = (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyText.trim()) return;

    // Aqui seria enviado para API
    console.log('Nova resposta:', replyText);
    setReplyText('');
    setShowReplyForm(false);
  };

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
              Análise de Políticas
            </span>
          </nav>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-[32px] md:gap-[40px] lg:gap-[48px]">
            {/* Main Thread Content */}
            <div className="lg:col-span-9">
              {/* Discussion Header */}
              <div className="bg-white rounded-[8px] md:rounded-[12px] p-[24px] md:p-[32px] lg:p-[40px] mb-[20px] md:mb-[24px]">
                {/* Category & Meta */}
                <div className="flex flex-wrap gap-[8px] md:gap-[12px] items-center mb-[16px] md:mb-[20px]">
                  <div
                    className="px-[8px] py-[2px] rounded-[2px]"
                    style={{ backgroundColor: discussion.categoryColor.bg }}
                  >
                    <span
                      className="font-['Source_Sans_3:Bold',sans-serif] font-bold text-[11px] md:text-[12px] tracking-[-0.6px] uppercase leading-[15px] md:leading-[16px]"
                      style={{ color: discussion.categoryColor.text }}
                    >
                      {discussion.category}
                    </span>
                  </div>
                  {discussion.isPinned && (
                    <div className="flex items-center gap-[6px]">
                      <svg className="size-[14px] md:size-[16px]" fill="none" viewBox="0 0 16.5 15.75">
                        <path d={svgPaths.pf8747d7} fill="#6b0119" />
                      </svg>
                      <span className="font-['Source_Sans_3:Bold',sans-serif] font-bold text-[#6b0119] text-[11px] md:text-[12px] uppercase tracking-[1.2px]">
                        Fixado
                      </span>
                    </div>
                  )}
                </div>

                {/* Title */}
                <h1 className="font-['IBM_Plex_Sans:Bold',sans-serif] font-bold text-[#121c2a] text-[24px] md:text-[32px] lg:text-[36px] tracking-[-0.72px] leading-[32px] md:leading-[40px] lg:leading-[44px] mb-[20px] md:mb-[24px]" style={{ fontVariationSettings: "'wdth' 100" }}>
                  {discussion.title}
                </h1>

                {/* Author Info */}
                <div className="flex items-start gap-[16px] pb-[24px] md:pb-[28px] border-b border-[rgba(222,191,191,0.2)] mb-[24px] md:mb-[28px]">
                  <div
                    className="shrink-0 size-[48px] md:size-[56px] rounded-[6px] flex items-center justify-center"
                    style={{ backgroundColor: discussion.avatar }}
                  >
                    <span className="font-['Source_Sans_3:Bold',sans-serif] font-bold text-white text-[20px] md:text-[24px] leading-[28px] md:leading-[32px]">
                      {discussion.authorInitials}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-['Source_Sans_3:Bold',sans-serif] font-bold text-[#121c2a] text-[16px] md:text-[18px] leading-[22px] md:leading-[26px] mb-[4px]">
                      {discussion.author}
                    </div>
                    <div className="font-['Source_Sans_3:Regular',sans-serif] font-normal text-[#8b7171] text-[13px] md:text-[14px] leading-[18px] md:leading-[20px]">
                      {discussion.authorRole} • {discussion.date}
                    </div>
                  </div>
                </div>

                {/* Content */}
                <div className="font-['Source_Sans_3:Regular',sans-serif] font-normal text-[#574142] text-[15px] md:text-[16px] leading-[24px] md:leading-[26px] mb-[24px] md:mb-[32px] whitespace-pre-line">
                  {discussion.content}
                </div>

                {/* Actions */}
                <div className="flex flex-wrap gap-[16px] md:gap-[24px] items-center">
                  <button className="flex gap-[8px] items-center group">
                    <Heart className="size-[18px] md:size-[20px] text-[#8B7171] group-hover:text-[#6b0119] transition-colors" />
                    <span className="font-['Source_Sans_3:Bold',sans-serif] font-bold text-[#8b7171] text-[14px] md:text-[15px] leading-[20px] md:leading-[22px] group-hover:text-[#6b0119] transition-colors">
                      {discussion.likes}
                    </span>
                  </button>
                  <button
                    onClick={() => setShowReplyForm(!showReplyForm)}
                    className="flex gap-[8px] items-center group"
                  >
                    <svg className="size-[18px] md:size-[20px]" fill="none" viewBox="0 0 15 15">
                      <path d={svgPaths.p7731200} fill="#8B7171" className="group-hover:fill-[#6b0119] transition-colors" />
                    </svg>
                    <span className="font-['Source_Sans_3:Bold',sans-serif] font-bold text-[#8b7171] text-[14px] md:text-[15px] leading-[20px] md:leading-[22px] group-hover:text-[#6b0119] transition-colors">
                      Responder
                    </span>
                  </button>
                  <button className="flex gap-[8px] items-center group">
                    <svg className="size-[18px] md:size-[20px]" fill="none" viewBox="0 0 13.5 15">
                      <path d={svgPaths.p12056000} fill="#8B7171" className="group-hover:fill-[#6b0119] transition-colors" />
                    </svg>
                    <span className="font-['Source_Sans_3:Bold',sans-serif] font-bold text-[#8b7171] text-[14px] md:text-[15px] leading-[20px] md:leading-[22px] group-hover:text-[#6b0119] transition-colors">
                      Partilhar
                    </span>
                  </button>
                  <div className="flex gap-[8px] items-center ml-auto">
                    <svg className="size-[18px] md:size-[20px]" fill="none" viewBox="0 0 16.5 11.25">
                      <path d={svgPaths.p110cf380} fill="#8B7171" />
                    </svg>
                    <span className="font-['Source_Sans_3:Medium',sans-serif] font-medium text-[#8b7171] text-[13px] md:text-[14px] leading-[18px] md:leading-[20px]">
                      {discussion.views} visualizações
                    </span>
                  </div>
                </div>
              </div>

              {/* Reply Form */}
              {showReplyForm && (
                <div className="bg-white rounded-[8px] md:rounded-[12px] p-[24px] md:p-[32px] mb-[20px] md:mb-[24px]">
                  <h3 className="font-['Source_Sans_3:Bold',sans-serif] font-bold text-[#121c2a] text-[16px] md:text-[18px] leading-[22px] md:leading-[26px] mb-[16px] md:mb-[20px]">
                    Adicionar Resposta
                  </h3>
                  <form onSubmit={handleSubmitReply}>
                    <textarea
                      value={replyText}
                      onChange={(e) => setReplyText(e.target.value)}
                      placeholder="Partilhe a sua perspectiva, fontes ou sugestões..."
                      className="w-full min-h-[150px] md:min-h-[180px] px-[16px] md:px-[18px] py-[14px] md:py-[16px] bg-[#f1f5f9] rounded-[6px] border border-[rgba(226,232,240,0.8)] focus:border-[#6b0119] focus:bg-white transition-all font-['Source_Sans_3:Regular',sans-serif] font-normal text-[#121c2a] text-[14px] md:text-[15px] outline-none resize-vertical"
                    />
                    <div className="flex gap-[12px] mt-[16px] md:mt-[20px]">
                      <button
                        type="submit"
                        className="bg-[#8b1e2d] px-[24px] md:px-[32px] py-[12px] md:py-[14px] rounded-[6px] font-['Source_Sans_3:Bold',sans-serif] font-bold text-white text-[14px] md:text-[15px] leading-[20px] md:leading-[22px] hover:bg-[#7a1a27] transition-colors"
                      >
                        Publicar Resposta
                      </button>
                      <button
                        type="button"
                        onClick={() => setShowReplyForm(false)}
                        className="px-[24px] md:px-[32px] py-[12px] md:py-[14px] rounded-[6px] font-['Source_Sans_3:SemiBold',sans-serif] font-semibold text-[#6b0119] text-[14px] md:text-[15px] leading-[20px] md:leading-[22px] hover:bg-[rgba(107,1,25,0.05)] transition-colors"
                      >
                        Cancelar
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {/* Replies Section */}
              <div className="mb-[24px] md:mb-[32px]">
                <h2 className="font-['IBM_Plex_Sans:Bold',sans-serif] font-bold text-[#121c2a] text-[20px] md:text-[24px] tracking-[-0.48px] leading-[28px] md:leading-[32px] mb-[20px] md:mb-[24px]" style={{ fontVariationSettings: "'wdth' 100" }}>
                  {replies.length} Respostas
                </h2>

                <div className="flex flex-col gap-[16px] md:gap-[20px]">
                  {replies.map((reply) => (
                    <div
                      key={reply.id}
                      className="bg-white rounded-[8px] md:rounded-[12px] p-[20px] md:p-[24px] lg:p-[28px]"
                    >
                      {/* Reply Author */}
                      <div className="flex items-start gap-[14px] md:gap-[16px] mb-[16px] md:mb-[20px]">
                        <div
                          className="shrink-0 size-[40px] md:size-[48px] rounded-[4px] flex items-center justify-center"
                          style={{ backgroundColor: reply.avatar }}
                        >
                          <span className="font-['Source_Sans_3:Bold',sans-serif] font-bold text-white text-[16px] md:text-[18px] leading-[24px] md:leading-[28px]">
                            {reply.authorInitials}
                          </span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="font-['Source_Sans_3:Bold',sans-serif] font-bold text-[#121c2a] text-[15px] md:text-[16px] leading-[20px] md:leading-[22px] mb-[2px]">
                            {reply.author}
                          </div>
                          <div className="font-['Source_Sans_3:Regular',sans-serif] font-normal text-[#8b7171] text-[12px] md:text-[13px] leading-[16px] md:leading-[18px]">
                            {reply.authorRole} • {reply.timeAgo}
                          </div>
                        </div>
                      </div>

                      {/* Reply Content */}
                      <div className="font-['Source_Sans_3:Regular',sans-serif] font-normal text-[#574142] text-[14px] md:text-[15px] leading-[22px] md:leading-[24px] mb-[16px] md:mb-[20px] whitespace-pre-line pl-[54px] md:pl-[64px]">
                        {reply.content}
                      </div>

                      {/* Reply Actions */}
                      <div className="flex gap-[16px] md:gap-[20px] pl-[54px] md:pl-[64px]">
                        <button className="flex gap-[6px] items-center group">
                          <Heart
                            className={`size-[16px] md:size-[18px] group-hover:text-[#6b0119] transition-colors ${reply.isLiked ? 'text-[#6b0119] fill-[#6b0119]' : 'text-[#8B7171]'}`}
                          />
                          <span className={`font-['Source_Sans_3:SemiBold',sans-serif] font-semibold text-[13px] md:text-[14px] leading-[18px] md:leading-[20px] group-hover:text-[#6b0119] transition-colors ${reply.isLiked ? 'text-[#6b0119]' : 'text-[#8b7171]'}`}>
                            {reply.likes}
                          </span>
                        </button>
                        <button className="font-['Source_Sans_3:SemiBold',sans-serif] font-semibold text-[#8b7171] text-[13px] md:text-[14px] leading-[18px] md:leading-[20px] hover:text-[#6b0119] transition-colors">
                          Responder
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <aside className="lg:col-span-3">
              <div className="flex flex-col gap-[28px] md:gap-[32px] lg:sticky lg:top-[24px]">
                {/* Author Card */}
                <div className="bg-white rounded-[8px] p-[20px] md:p-[24px]">
                  <h3 className="font-['Source_Sans_3:Bold',sans-serif] font-bold text-[#6b0119] text-[11px] md:text-[12px] tracking-[1.2px] uppercase leading-[16px] mb-[16px] md:mb-[20px]">
                    SOBRE O AUTOR
                  </h3>
                  <div className="flex items-center gap-[12px] mb-[12px]">
                    <div
                      className="shrink-0 size-[48px] rounded-[6px] flex items-center justify-center"
                      style={{ backgroundColor: discussion.avatar }}
                    >
                      <span className="font-['Source_Sans_3:Bold',sans-serif] font-bold text-white text-[18px] leading-[26px]">
                        {discussion.authorInitials}
                      </span>
                    </div>
                    <div>
                      <div className="font-['Source_Sans_3:Bold',sans-serif] font-bold text-[#121c2a] text-[15px] leading-[20px] mb-[2px]">
                        {discussion.author}
                      </div>
                      <div className="font-['Source_Sans_3:Regular',sans-serif] font-normal text-[#8b7171] text-[12px] leading-[16px]">
                        {discussion.authorRole}
                      </div>
                    </div>
                  </div>
                  <div className="font-['Source_Sans_3:Regular',sans-serif] font-normal text-[#8b7171] text-[13px] leading-[18px]">
                    {discussion.authorPosts} publicações
                  </div>
                </div>

                {/* Related Topics */}
                <div className="bg-white rounded-[8px] p-[20px] md:p-[24px]">
                  <h3 className="font-['Source_Sans_3:Bold',sans-serif] font-bold text-[#6b0119] text-[11px] md:text-[12px] tracking-[1.2px] uppercase leading-[16px] mb-[16px] md:mb-[20px]">
                    TÓPICOS RELACIONADOS
                  </h3>
                  <div className="flex flex-col gap-[14px] md:gap-[16px]">
                    {relatedTopics.map((topic, index) => (
                      <button
                        key={index}
                        onClick={() => navigate('/comunidade/discussao')}
                        className="text-left group"
                      >
                        <div className="font-['Source_Sans_3:Bold',sans-serif] font-bold text-[#121c2a] text-[14px] leading-[20px] mb-[6px] group-hover:text-[#6b0119] transition-colors">
                          {topic.title}
                        </div>
                        <div className="flex gap-[12px] text-[#8b7171] text-[11px] leading-[16px]">
                          <span className="font-['Source_Sans_3:Regular',sans-serif]">
                            {topic.replies} respostas
                          </span>
                          <span>•</span>
                          <span className="font-['Source_Sans_3:Regular',sans-serif]">
                            {topic.views} visualizações
                          </span>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Quick Actions */}
                <div className="bg-[#eff4ff] rounded-[8px] p-[20px] md:p-[24px]">
                  <h3 className="font-['Source_Sans_3:Bold',sans-serif] font-bold text-[#6b0119] text-[11px] md:text-[12px] tracking-[1.2px] uppercase leading-[16px] mb-[16px] md:mb-[20px]">
                    ACÇÕES RÁPIDAS
                  </h3>
                  <div className="flex flex-col gap-[10px] md:gap-[12px]">
                    <button className="w-full text-left px-[12px] py-[10px] rounded-[4px] hover:bg-white transition-colors font-['Source_Sans_3:SemiBold',sans-serif] font-semibold text-[#6b0119] text-[13px] md:text-[14px] leading-[18px] md:leading-[20px]">
                      Reportar Discussão
                    </button>
                    <button className="w-full text-left px-[12px] py-[10px] rounded-[4px] hover:bg-white transition-colors font-['Source_Sans_3:SemiBold',sans-serif] font-semibold text-[#6b0119] text-[13px] md:text-[14px] leading-[18px] md:leading-[20px]">
                      Seguir Tópico
                    </button>
                    <button className="w-full text-left px-[12px] py-[10px] rounded-[4px] hover:bg-white transition-colors font-['Source_Sans_3:SemiBold',sans-serif] font-semibold text-[#6b0119] text-[13px] md:text-[14px] leading-[18px] md:leading-[20px]">
                      Guardar para Ler
                    </button>
                  </div>
                </div>
              </div>
            </aside>
          </div>
        </div>
      </main>

      <SystemFooter />
    </div>
  );
}
