import { useState, useEffect, useCallback } from 'react';
import { PlayerSummaryDto, GetPlayersRequest, PaginatedResponse } from '../types';
import { playerService, handleApiError } from '../services';

interface UsePlayerListState {
  players: PlayerSummaryDto[];
  loading: boolean;
  error: string | null;
  pagination: {
    currentPage: number;
    totalPages: number;
    totalCount: number;
    pageSize: number;
  };
  searchTerm: string;
}

interface UsePlayerListActions {
  setCurrentPage: (page: number) => void;
  setSearchTerm: (term: string) => void;
  refetch: () => Promise<void>;
}

export const usePlayerList = (initialPageSize = 20): UsePlayerListState & UsePlayerListActions => {
  const [state, setState] = useState<UsePlayerListState>({
    players: [],
    loading: true,
    error: null,
    pagination: {
      currentPage: 1,
      totalPages: 1,
      totalCount: 0,
      pageSize: initialPageSize,
    },
    searchTerm: '',
  });

  const fetchPlayers = useCallback(async () => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));
      
      const request: GetPlayersRequest = {
        pageNumber: state.pagination.currentPage,
        pageSize: state.pagination.pageSize,
        searchTerm: state.searchTerm || undefined,
      };

      const response: PaginatedResponse<PlayerSummaryDto> = await playerService.getAllPlayers(request);

      setState(prev => ({
        ...prev,
        players: response.items,
        loading: false,
        pagination: {
          ...prev.pagination,
          totalPages: response.totalPages,
          totalCount: response.totalCount,
        },
      }));
    } catch (err) {
      const errorMessage = handleApiError(err);
      setState(prev => ({
        ...prev,
        loading: false,
        error: `Failed to fetch players: ${errorMessage}`,
        players: [],
      }));
    }
  }, [state.pagination.currentPage, state.pagination.pageSize, state.searchTerm]);

  useEffect(() => {
    fetchPlayers();
  }, [fetchPlayers]);

  const setCurrentPage = (page: number) => {
    setState(prev => ({
      ...prev,
      pagination: { ...prev.pagination, currentPage: page },
    }));
  };

  const setSearchTerm = (term: string) => {
    setState(prev => ({
      ...prev,
      searchTerm: term,
      pagination: { ...prev.pagination, currentPage: 1 }, // Reset to first page on search
    }));
  };

  const refetch = async () => {
    await fetchPlayers();
  };

  return {
    ...state,
    setCurrentPage,
    setSearchTerm,
    refetch,
  };
};