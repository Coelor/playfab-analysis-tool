import { FilesResponseDto, FileAnalysisDto, ApiResponse } from '../types';
import { apiClient } from './apiClient';

export const fileService = {
  // Get player files
  getPlayerFiles: async (playFabId: string): Promise<FilesResponseDto> => {
    const response = await apiClient.get<ApiResponse<FilesResponseDto>>(`/players/${playFabId}/files`);
    
    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.message || 'Failed to fetch files');
    }
    
    return response.data.data;
  },

  // Download player file
  downloadPlayerFile: async (playFabId: string, fileName: string): Promise<Blob> => {
    const response = await apiClient.get(`/players/${playFabId}/files/${fileName}/download`, {
      responseType: 'blob'
    });
    
    return response.data;
  },

  // Analyze player file
  analyzePlayerFile: async (playFabId: string, fileName: string): Promise<FileAnalysisDto> => {
    const response = await apiClient.get<ApiResponse<FileAnalysisDto>>(
      `/players/${playFabId}/files/${fileName}/analyze`
    );
    
    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.message || 'Failed to analyze file');
    }
    
    return response.data.data;
  },
};