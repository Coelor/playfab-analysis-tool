import { UserDataResponseDto, ApiResponse } from '../types';
import { apiClient } from './apiClient';

export const userDataService = {
  // Get player user data
  getUserData: async (playFabId: string, keys?: string[]): Promise<UserDataResponseDto> => {
    const params = keys && keys.length > 0 ? `?keys=${keys.join(',')}` : '';
    const response = await apiClient.get<ApiResponse<UserDataResponseDto>>(
      `/players/${playFabId}/userdata${params}`
    );
    
    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.message || 'Failed to fetch user data');
    }
    
    return response.data.data;
  },
};