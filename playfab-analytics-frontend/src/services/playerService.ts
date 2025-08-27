import { 
  PlayerDto, 
  PlayerSummaryDto, 
  PaginatedResponse,
  GetPlayersRequest,
  ApiResponse
} from '../types';
import { apiClient } from './apiClient';

export const playerService = {
  // Get all players with pagination and filtering
  getAllPlayers: async (request?: GetPlayersRequest): Promise<PaginatedResponse<PlayerSummaryDto>> => {
    const params = new URLSearchParams();
    if (request?.pageNumber) params.append('pageNumber', request.pageNumber.toString());
    if (request?.pageSize) params.append('pageSize', request.pageSize.toString());
    if (request?.searchTerm) params.append('searchTerm', request.searchTerm);

    const response = await apiClient.get<ApiResponse<PaginatedResponse<PlayerSummaryDto>>>(
      `/players?${params.toString()}`
    );
    
    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.message || 'Failed to fetch players');
    }
    
    return response.data.data;
  },

  // Get player by ID
  getPlayerById: async (playFabId: string): Promise<PlayerDto> => {
    const response = await apiClient.get<ApiResponse<PlayerDto>>(`/players/${playFabId}`);
    
    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.message || 'Failed to fetch player');
    }
    
    return response.data.data;
  },
};