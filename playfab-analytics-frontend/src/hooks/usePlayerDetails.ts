import { useState, useEffect, useCallback } from 'react';
import {
  PlayerDto,
  UserDataResponseDto,
  PlayerAnalyticsDto,
  FilesResponseDto,
  ObjectsResponseDto,
  FileAnalysisDto,
} from '../types';
import { 
  playerService,
  userDataService,
  fileService,
  objectService,
  analyticsService,
  handleApiError 
} from '../services';

interface UsePlayerDetailsState {
  player: PlayerDto | null;
  userData: UserDataResponseDto | null;
  analytics: PlayerAnalyticsDto | null;
  files: FilesResponseDto | null;
  objects: ObjectsResponseDto | null;
  loading: boolean;
  error: string | null;
}

interface UsePlayerDetailsActions {
  refetch: () => Promise<void>;
  downloadFile: (fileName: string) => Promise<void>;
  analyzeFile: (fileName: string) => Promise<FileAnalysisDto>;
}

export const usePlayerDetails = (playFabId: string): UsePlayerDetailsState & UsePlayerDetailsActions => {
  const [state, setState] = useState<UsePlayerDetailsState>({
    player: null,
    userData: null,
    analytics: null,
    files: null,
    objects: null,
    loading: true,
    error: null,
  });

  const fetchPlayerData = useCallback(async () => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));

      // Fetch all player data in parallel
      const [playerData, userDataResponse, analyticsData, filesResponse, objectsResponse] = await Promise.allSettled([
        playerService.getPlayerById(playFabId),
        userDataService.getUserData(playFabId),
        analyticsService.getPlayerAnalytics(playFabId),
        fileService.getPlayerFiles(playFabId),
        objectService.getPlayerObjects(playFabId),
      ]);

      const newState: Partial<UsePlayerDetailsState> = { loading: false };

      if (playerData.status === 'fulfilled') {
        newState.player = playerData.value;
      }

      if (userDataResponse.status === 'fulfilled') {
        newState.userData = userDataResponse.value;
      }

      if (analyticsData.status === 'fulfilled') {
        newState.analytics = analyticsData.value;
      }

      if (filesResponse.status === 'fulfilled') {
        newState.files = filesResponse.value;
      }

      if (objectsResponse.status === 'fulfilled') {
        newState.objects = objectsResponse.value;
      }

      if (playerData.status === 'rejected') {
        newState.error = 'Failed to fetch player data';
      }

      setState(prev => ({ ...prev, ...newState }));
    } catch (err) {
      const errorMessage = handleApiError(err);
      setState(prev => ({
        ...prev,
        loading: false,
        error: `Failed to fetch player data: ${errorMessage}`,
      }));
    }
  }, [playFabId]);

  useEffect(() => {
    if (playFabId) {
      fetchPlayerData();
    }
  }, [fetchPlayerData, playFabId]);

  const downloadFile = async (fileName: string) => {
    try {
      const blob = await fileService.downloadPlayerFile(playFabId, fileName);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Error downloading file:', err);
      throw new Error('Failed to download file');
    }
  };

  const analyzeFile = async (fileName: string) => {
    try {
      const analysis = await fileService.analyzePlayerFile(playFabId, fileName);
      return analysis;
    } catch (err) {
      console.error('Error analyzing file:', err);
      throw new Error('Failed to analyze file');
    }
  };

  return {
    ...state,
    refetch: fetchPlayerData,
    downloadFile,
    analyzeFile,
  };
};