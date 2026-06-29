import { httpClient } from '../http/client';
import { API_ENDPOINTS } from '../../constants/api';
import type { CommunityCategory, DiscussionTopic, DiscussionTopicMember, TopicReply, PaginatedResponse } from '../../types/api';

export interface TopicFilters {
  category_id?: string;
  sort?: 'recent' | 'popular' | 'pinned';
  status?: 'published' | 'open' | 'locked' | 'archived' | 'draft';
  page?: number;
  per_page?: number;
}

export const communityService = {
  async categories(): Promise<CommunityCategory[]> {
    const { data } = await httpClient.get(API_ENDPOINTS.COMMUNITY.CATEGORIES);
    return data.data ?? data;
  },

  async topics(filters?: TopicFilters): Promise<PaginatedResponse<DiscussionTopic>> {
    const { data } = await httpClient.get(API_ENDPOINTS.COMMUNITY.TOPICS, { params: filters });
    return data;
  },

  async topicDetail(id: string): Promise<DiscussionTopic> {
    const { data } = await httpClient.get(API_ENDPOINTS.COMMUNITY.TOPIC_DETAIL(id));
    return data.data ?? data;
  },

  async createTopic(payload: { category_id: string; title: string; content: string; visibility?: 'PUBLIC' | 'CATEGORY' | 'INVITE_ONLY' }): Promise<DiscussionTopic> {
    const { data } = await httpClient.post(API_ENDPOINTS.COMMUNITY.TOPICS, payload);
    return data.data ?? data;
  },

  async updateTopic(id: string, payload: Partial<{ title: string; content: string; status: string; visibility: 'PUBLIC' | 'CATEGORY' | 'INVITE_ONLY' }>): Promise<DiscussionTopic> {
    const { data } = await httpClient.patch(API_ENDPOINTS.COMMUNITY.TOPIC_DETAIL(id), payload);
    return data.data ?? data;
  },

  async deleteTopic(id: string): Promise<void> {
    await httpClient.delete(API_ENDPOINTS.COMMUNITY.TOPIC_DETAIL(id));
  },

  async likeTopic(id: string): Promise<void> {
    await httpClient.post(API_ENDPOINTS.COMMUNITY.TOPIC_LIKE(id));
  },

  async unlikeTopic(id: string): Promise<void> {
    await httpClient.delete(API_ENDPOINTS.COMMUNITY.TOPIC_LIKE(id));
  },

  async followTopic(id: string): Promise<void> {
    await httpClient.post(API_ENDPOINTS.COMMUNITY.TOPIC_FOLLOW(id));
  },

  async unfollowTopic(id: string): Promise<void> {
    await httpClient.delete(API_ENDPOINTS.COMMUNITY.TOPIC_FOLLOW(id));
  },

  async replies(topicId: string, page = 1): Promise<PaginatedResponse<TopicReply>> {
    const { data } = await httpClient.get(API_ENDPOINTS.COMMUNITY.TOPIC_REPLIES(topicId), {
      params: { page },
    });
    return data;
  },

  async createReply(topicId: string, payload: { content: string; parent_reply_id?: string }): Promise<TopicReply> {
    const { data } = await httpClient.post(API_ENDPOINTS.COMMUNITY.TOPIC_REPLIES(topicId), payload);
    return data.data ?? data;
  },

  async likeReply(replyId: string): Promise<void> {
    await httpClient.post(API_ENDPOINTS.REPLIES.LIKE(replyId));
  },

  async unlikeReply(replyId: string): Promise<void> {
    await httpClient.delete(API_ENDPOINTS.REPLIES.LIKE(replyId));
  },

  // ─── Topic Members ────────────────────────────────────────────────────────

  async topicMembers(topicId: string): Promise<DiscussionTopicMember[]> {
    const { data } = await httpClient.get(API_ENDPOINTS.COMMUNITY.TOPIC_MEMBERS(topicId));
    return data.data ?? data;
  },

  async inviteMember(topicId: string, payload: { user_id: string; role?: 'member' | 'moderator' }): Promise<DiscussionTopicMember> {
    const { data } = await httpClient.post(API_ENDPOINTS.COMMUNITY.TOPIC_MEMBERS(topicId), payload);
    return data.data ?? data;
  },

  async updateMember(topicId: string, userId: string, role: 'member' | 'moderator'): Promise<DiscussionTopicMember> {
    const { data } = await httpClient.patch(API_ENDPOINTS.COMMUNITY.TOPIC_MEMBER(topicId, userId), { role });
    return data.data ?? data;
  },

  async removeMember(topicId: string, userId: string): Promise<void> {
    await httpClient.delete(API_ENDPOINTS.COMMUNITY.TOPIC_MEMBER(topicId, userId));
  },

  async joinTopic(topicId: string): Promise<void> {
    await httpClient.post(API_ENDPOINTS.COMMUNITY.TOPIC_JOIN(topicId));
  },

  async leaveTopic(topicId: string): Promise<void> {
    await httpClient.post(API_ENDPOINTS.COMMUNITY.TOPIC_LEAVE(topicId));
  },
};
