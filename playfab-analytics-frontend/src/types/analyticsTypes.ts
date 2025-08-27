import { FileDto } from './fileTypes';
import { ObjectDto } from './objectTypes';

// Analytics
export interface PlayerAnalyticsDto {
  playFabId: string;
  displayName?: string;
  accountAge?: number;
  daysSinceLastLogin?: number;
  totalValueToDateInUSD?: number;
  linkedAccountsCount: number;
  statisticsCount: number;
  userDataKeysCount: number;
  totalFilesCount: number;
  totalFileSizeBytes: number;
  totalObjectsCount: number;
  accountSummary: {
    linkedAccounts: string[];
    statistics: { [key: string]: any };
  };
  userDataSummary: {
    availableKeys: string[];
    totalEntries: number;
  };
  filesSummary: {
    files: FileDto[];
    totalFiles: number;
    totalSizeBytes: number;
  };
  objectsSummary: {
    objects: ObjectDto[];
    totalObjects: number;
  };
}