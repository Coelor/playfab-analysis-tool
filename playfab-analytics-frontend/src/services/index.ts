// Import services
import { playerService } from './playerService';
import { userDataService } from './userDataService';
import { fileService } from './fileService';
import { objectService } from './objectService';
import { analyticsService } from './analyticsService';

// Export all services
export { playerService } from './playerService';
export { userDataService } from './userDataService';
export { fileService } from './fileService';
export { objectService } from './objectService';
export { analyticsService } from './analyticsService';
export { apiClient, handleApiError } from './apiClient';

// Consolidated API object for backward compatibility
export const playersApi = {
  getAllPlayers: playerService.getAllPlayers,
  getPlayerById: playerService.getPlayerById,
  getUserData: userDataService.getUserData,
  getPlayerFiles: fileService.getPlayerFiles,
  downloadPlayerFile: fileService.downloadPlayerFile,
  analyzePlayerFile: fileService.analyzePlayerFile,
  getPlayerObjects: objectService.getPlayerObjects,
  getPlayerAnalytics: analyticsService.getPlayerAnalytics,
};