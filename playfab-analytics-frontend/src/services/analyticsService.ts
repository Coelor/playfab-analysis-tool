import { PlayerAnalyticsDto, ApiResponse } from '../types';
import { apiClient } from './apiClient';

export const analyticsService = {
  // Get player analytics
  getPlayerAnalytics: async (playFabId: string): Promise<PlayerAnalyticsDto> => {
    const response = await apiClient.get<ApiResponse<PlayerAnalyticsDto>>(`/players/${playFabId}/analytics`);
    
    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.message || 'Failed to fetch analytics');
    }
    
    return response.data.data;
  },
};