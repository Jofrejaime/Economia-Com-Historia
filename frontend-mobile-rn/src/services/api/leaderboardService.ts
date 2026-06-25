import { httpClient } from '../http/client';
import { API_ENDPOINTS } from '../../constants/api';
import type { LeaderboardEntry } from '../../types/api';

export interface ProvinceStats {
  province: string;
  total_users: number;
  total_points: number;
  avg_points: number;
  max_points: number;
}

export const leaderboardService = {
  async national(params?: { page?: number; per_page?: number }): Promise<LeaderboardEntry[]> {
    const { data } = await httpClient.get(API_ENDPOINTS.LEADERBOARD.NATIONAL, { params });
    return data.data ?? data;
  },

  async provincial(province: string): Promise<LeaderboardEntry[]> {
    const { data } = await httpClient.get(API_ENDPOINTS.LEADERBOARD.PROVINCIAL, {
      params: { province },
    });
    return data.data ?? data;
  },

  async provinceStats(): Promise<ProvinceStats[]> {
    const { data } = await httpClient.get(API_ENDPOINTS.LEADERBOARD.PROVINCE_STATS);
    return data.data ?? data;
  },
};
