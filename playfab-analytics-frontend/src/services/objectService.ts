import { ObjectsResponseDto, ApiResponse } from '../types';
import { apiClient } from './apiClient';

export const objectService = {
  // Get player objects
  getPlayerObjects: async (playFabId: string): Promise<ObjectsResponseDto> => {
    const response = await apiClient.get<ApiResponse<ObjectsResponseDto>>(`/players/${playFabId}/objects`);
    
    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.message || 'Failed to fetch objects');
    }
    
    return response.data.data;
  },
};