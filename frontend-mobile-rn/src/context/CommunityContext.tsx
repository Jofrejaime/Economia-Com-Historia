import React, { createContext, useCallback, useContext, useMemo, useState } from "react";
import type { DiscussionTopic, TopicReply, PaginatedResponse } from "../types/api";
import { communityService } from "../services/api/communityService";

interface CommunityContextValue {
  topics: DiscussionTopic[];
  loading: boolean;
  hasMore: boolean;
  fetchTopics: (reset?: boolean) => Promise<void>;
  fetchNextPage: () => Promise<void>;
  addTopicOptimistic: (topic: DiscussionTopic) => void;
  updateTopicOptimistic: (id: string, updates: Partial<DiscussionTopic>) => void;
  getTopicById: (id: string) => DiscussionTopic | undefined;
}

const CommunityContext = createContext<CommunityContextValue | undefined>(undefined);

export function CommunityProvider({ children }: { children: React.ReactNode }) {
  const [topics, setTopics] = useState<DiscussionTopic[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const fetchTopics = useCallback(async (reset = false) => {
    setLoading(true);
    try {
      const currentPage = reset ? 1 : page;
      const response: PaginatedResponse<DiscussionTopic> = await communityService.topics({
        sort: 'recent',
        page: currentPage,
        per_page: 20,
      });
      setTopics((prev) => (reset ? response.data : [...prev, ...response.data]));
      setHasMore(response.meta.current_page < response.meta.last_page);
      setPage(currentPage + 1);
    } catch (error) {
      console.warn("Erro ao carregar tópicos", error);
    } finally {
      setLoading(false);
    }
  }, [page]);

  const fetchNextPage = useCallback(async () => {
    if (!loading && hasMore) {
      await fetchTopics(false);
    }
  }, [loading, hasMore, fetchTopics]);

  const addTopicOptimistic = useCallback((topic: DiscussionTopic) => {
    setTopics((prev) => [topic, ...prev]);
  }, []);

  const updateTopicOptimistic = useCallback((id: string, updates: Partial<DiscussionTopic>) => {
    setTopics((prev) =>
      prev.map((t) => (t.id === id ? { ...t, ...updates } : t))
    );
  }, []);

  const getTopicById = useCallback(
    (id: string) => topics.find((t) => t.id === id),
    [topics]
  );

  const value = useMemo(
    () => ({ topics, loading, hasMore, fetchTopics, fetchNextPage, addTopicOptimistic, updateTopicOptimistic, getTopicById }),
    [topics, loading, hasMore, fetchTopics, fetchNextPage, addTopicOptimistic, updateTopicOptimistic, getTopicById]
  );

  return <CommunityContext.Provider value={value}>{children}</CommunityContext.Provider>;
}

export function useCommunity() {
  const ctx = useContext(CommunityContext);
  if (!ctx) throw new Error("useCommunity must be used within CommunityProvider");
  return ctx;
}
