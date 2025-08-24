import axios from 'axios';
import { Player, UserDataResponse, PlayerAnalytics } from '../types/Player';

const API_BASE_URL = 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const playersApi = {
  // Get all players
  getAllPlayers: async (): Promise<Player[]> => {
    const response = await api.get<Player[]>('/players');
    return response.data;
  },

  // Get player by ID
  getPlayerById: async (playFabId: string): Promise<Player> => {
    const response = await api.get<Player>(`/players/${playFabId}`);
    return response.data;
  },

  // Get player user data
  getUserData: async (playFabId: string, keys?: string[]): Promise<UserDataResponse> => {
    if (keys && keys.length > 0) {
      const response = await api.get<UserDataResponse>(
        `/players/${playFabId}/userdata?keys=${keys.join(',')}`
      );
      return response.data;
    } else {
      const response = await api.get<UserDataResponse>(`/players/${playFabId}/userdata`);
      return response.data;
    }
  },

  // Get player analytics
  getPlayerAnalytics: async (playFabId: string): Promise<PlayerAnalytics> => {
    const response = await api.get<PlayerAnalytics>(`/players/${playFabId}/analytics`);
    return response.data;
  },
};

export default api;