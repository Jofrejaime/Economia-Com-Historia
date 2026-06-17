import React, { createContext, ReactNode, useContext, useMemo, useState } from "react";
import { CommunityTopic } from "../types/navigation";

export interface CommunityComment {
  id: string;
  author: string;
  authorAvatar: string;
  time: string;
  content: string;
  likes: number;
  replies: number;
  isLiked?: boolean;
}

interface CommunityContextValue {
  topics: CommunityTopic[];
  addTopic: (topic: CommunityTopic) => void;
  getTopicById: (id: string) => CommunityTopic | undefined;
  addComment: (topicId: string, comment: CommunityComment) => void;
  toggleCommentLike: (topicId: string, commentId: string) => void;
  addReply: (topicId: string, commentId: string) => void;
  updateTopic: (topicId: string, updates: Partial<CommunityTopic>) => void;
}

const CommunityContext = createContext<CommunityContextValue | undefined>(undefined);

const initialTopics: CommunityTopic[] = [
  {
    id: "1",
    author: "Artur Mendes",
    authorInitials: "AM",
    time: "2h atrás",
    title: "O impacto da desvalorização do Kwanza nas rotas comerciais transfronteiriças",
    description: "Análise profunda sobre como as recentes flutuações cambiais estão redefinindo o comércio regional e as cadeias logísticas em Angola.",
    category: "Economia",
    replies: 42,
    views: "1.2k",
    isPinned: true,
    isPrivate: false,
    isActive: true,
    createdAt: new Date("2026-06-08T10:00:00Z").toISOString(),
    members: [
      { id: "u7", name: "Eduardo Loureiro", username: "eduardo_l", avatarUri: null }
    ],
    comments: [
      {
        id: "1",
        author: "Dr. Ricardo Marto",
        authorAvatar: "RM",
        time: "há 2 horas",
        content:
          "Excelente análise! A ferrovia de Benguela foi e ainda é peça-chave da infraestrutura logística de Angola. As obras de reabilitação podem transformar significativamente a região.",
        likes: 12,
        replies: 3,
        isLiked: true,
      },
      {
        id: "2",
        author: "Ana Paula Santos",
        authorAvatar: "AS",
        time: "há 5 horas",
        content:
          "Concordo plenamente. É importante também analisar o impacto social desta obra. A ferrovia não traz apenas benefícios económicos, mas pode transformar comunidades inteiras ao longo do trajeto.",
        likes: 8,
        replies: 1,
      },
    ],
  },
  {
    id: "2",
    author: "Catarina Neto",
    authorInitials: "CN",
    time: "Ontem",
    title: "Revisitando o sistema económico do Reino do Kongo: Lições para hoje?",
    description:
      "Debate sobre o legado das políticas comerciais ancestrais e como estas podem inspirar a diversificação económica contemporânea.",
    category: "História",
    replies: 128,
    views: "3.5k",
    isPrivate: false,
    isActive: true,
    createdAt: new Date("2026-06-07T16:20:00Z").toISOString(),
    members: [],
    comments: [
      {
        id: "1",
        author: "Paulo Gonçalves",
        authorAvatar: "PG",
        time: "há 1 dia",
        content:
          "Interessante comparação entre o Reino do Kongo e a importância da diversificação hoje. Precisamos olhar para modelos que não só geram riqueza, mas também estabilidade social.",
        likes: 6,
        replies: 2,
      },
    ],
  },
  {
    id: "3",
    author: "João Diogo",
    authorInitials: "JD",
    time: "3 dias atrás",
    title: "A ferrovia de Benguela: Um corredor de esperança ou apenas história?",
    description: "Discussão sobre a viabilidade económica e social da revitalização do Corredor do Lobito e seus impactos na região.",
    category: "Infraestrutura",
    replies: 18,
    views: "890",
    isPrivate: true,
    isActive: false,
    createdAt: new Date("2026-06-05T14:30:00Z").toISOString(),
    members: [
      { id: "u4", name: "Carla Domingos", username: "carla.dom", avatarUri: null },
      { id: "u7", name: "Eduardo Loureiro", username: "eduardo_l", avatarUri: null }
    ],
    comments: [
      {
        id: "1",
        author: "Marta Silva",
        authorAvatar: "MS",
        time: "há 2 dias",
        content:
          "A ferrovia representa tanto oportunidades como desafios. Sem políticas claras, o investimento pode beneficiar apenas algumas regiões.",
        likes: 3,
        replies: 0,
      },
    ],
  },
];

export function CommunityProvider({ children }: { children: ReactNode }) {
  const [topics, setTopics] = useState<CommunityTopic[]>(initialTopics);

  const addTopic = (topic: CommunityTopic) => {
    setTopics((current) => [topic, ...current]);
  };

  const getTopicById = (id: string) => topics.find((topic) => topic.id === id);

  const addComment = (topicId: string, comment: CommunityComment) => {
    setTopics((current) =>
      current.map((topic) =>
        topic.id === topicId
          ? { ...topic, comments: [...topic.comments, comment], replies: topic.replies + 1 }
          : topic,
      ),
    );
  };

  const toggleCommentLike = (topicId: string, commentId: string) => {
    setTopics((current) =>
      current.map((topic) => {
        if (topic.id !== topicId) return topic;
        return {
          ...topic,
          comments: topic.comments.map((comment) => {
            if (comment.id !== commentId) return comment;
            const liked = !comment.isLiked;
            return {
              ...comment,
              isLiked: liked,
              likes: comment.likes + (liked ? 1 : -1),
            };
          }),
        };
      }),
    );
  };

  const addReply = (topicId: string, commentId: string) => {
    setTopics((current) =>
      current.map((topic) => {
        if (topic.id !== topicId) return topic;
        return {
          ...topic,
          comments: topic.comments.map((comment) =>
            comment.id === commentId ? { ...comment, replies: comment.replies + 1 } : comment,
          ),
        };
      }),
    );
  };

  const updateTopic = (topicId: string, updates: Partial<CommunityTopic>) => {
    setTopics((current) =>
      current.map((topic) =>
        topic.id === topicId ? { ...topic, ...updates } : topic
      )
    );
  };

  const value = useMemo(
    () => ({ topics, addTopic, getTopicById, addComment, toggleCommentLike, addReply, updateTopic }),
    [topics],
  );

  return <CommunityContext.Provider value={value}>{children}</CommunityContext.Provider>;
}

export function useCommunity() {
  const context = useContext(CommunityContext);
  if (!context) {
    throw new Error("useCommunity must be used within CommunityProvider");
  }

  return context;
}
