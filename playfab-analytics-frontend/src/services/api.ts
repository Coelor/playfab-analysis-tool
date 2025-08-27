import axios from 'axios';
import { 
  PlayerDto, 
  PlayerSummaryDto, 
  UserDataResponseDto, 
  PlayerAnalyticsDto,
  FilesResponseDto,
  FileAnalysisDto,
  ObjectsResponseDto,
  ApiResponse,
  PaginatedResponse,
  GetPlayersRequest
} from '../types/Player';

const API_BASE_URL = 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Response interceptor to handle API responses
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error);
    throw error;
  }
);

export const playersApi = {
  // Get all players with pagination and filtering
  getAllPlayers: async (request?: GetPlayersRequest): Promise<PaginatedResponse<PlayerSummaryDto>> => {
    const params = new URLSearchParams();
    if (request?.pageNumber) params.append('pageNumber', request.pageNumber.toString());
    if (request?.pageSize) params.append('pageSize', request.pageSize.toString());
    if (request?.searchTerm) params.append('searchTerm', request.searchTerm);

    const response = await api.get<ApiResponse<PaginatedResponse<PlayerSummaryDto>>>(
      `/players?${params.toString()}`
    );
    
    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.message || 'Failed to fetch players');
    }
    
    return response.data.data;
  },

  // Get player by ID
  getPlayerById: async (playFabId: string): Promise<PlayerDto> => {
    const response = await api.get<ApiResponse<PlayerDto>>(`/players/${playFabId}`);
    
    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.message || 'Failed to fetch player');
    }
    
    return response.data.data;
  },

  // Get player user data
  getUserData: async (playFabId: string, keys?: string[]): Promise<UserDataResponseDto> => {
    const params = keys && keys.length > 0 ? `?keys=${keys.join(',')}` : '';
    const response = await api.get<ApiResponse<UserDataResponseDto>>(
      `/players/${playFabId}/userdata${params}`
    );
    
    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.message || 'Failed to fetch user data');
    }
    
    return response.data.data;
  },

  // Get player analytics
  getPlayerAnalytics: async (playFabId: string): Promise<PlayerAnalyticsDto> => {
    const response = await api.get<ApiResponse<PlayerAnalyticsDto>>(`/players/${playFabId}/analytics`);
    
    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.message || 'Failed to fetch analytics');
    }
    
    return response.data.data;
  },

  // Get player files
  getPlayerFiles: async (playFabId: string): Promise<FilesResponseDto> => {
    const response = await api.get<ApiResponse<FilesResponseDto>>(`/players/${playFabId}/files`);
    
    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.message || 'Failed to fetch files');
    }
    
    return response.data.data;
  },

  // Download player file
  downloadPlayerFile: async (playFabId: string, fileName: string): Promise<Blob> => {
    const response = await api.get(`/players/${playFabId}/files/${fileName}/download`, {
      responseType: 'blob'
    });
    
    return response.data;
  },

  // Analyze player file
  analyzePlayerFile: async (playFabId: string, fileName: string): Promise<FileAnalysisDto> => {
    const response = await api.get<ApiResponse<FileAnalysisDto>>(
      `/players/${playFabId}/files/${fileName}/analyze`
    );
    
    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.message || 'Failed to analyze file');
    }
    
    return response.data.data;
  },

  // Get player objects
  getPlayerObjects: async (playFabId: string): Promise<ObjectsResponseDto> => {
    const response = await api.get<ApiResponse<ObjectsResponseDto>>(`/players/${playFabId}/objects`);
    
    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.message || 'Failed to fetch objects');
    }
    
    return response.data.data;
  },
};

// Utility function to handle API errors
export const handleApiError = (error: any): string => {
  if (error.response?.data?.message) {
    return error.response.data.message;
  }
  if (error.message) {
    return error.message;
  }
  return 'An unexpected error occurred';
};

export default api;