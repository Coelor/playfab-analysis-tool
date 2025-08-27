// API Response wrapper
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  errors?: string[];
  timestamp: string;
}

// Player DTOs
export interface PlayerDto {
  playFabId: string;
  displayName?: string;
  created?: string;
  lastLogin?: string;
  totalValueToDateInUSD?: number;
  linkedAccounts: string[];
  statistics: { [key: string]: any };
}

export interface PlayerSummaryDto {
  playFabId: string;
  displayName?: string;
  lastLogin?: string;
  totalValueToDateInUSD?: number;
  linkedAccountsCount: number;
  statisticsCount: number;
}

// Pagination
export interface PaginatedResponse<T> {
  items: T[];
  totalCount: number;
  pageNumber: number;
  pageSize: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

// User Data
export interface UserDataRecord {
  key: string;
  value: string;
  lastUpdated?: string;
  permission?: number;
  dataVersion?: number;
}

export interface UserDataResponseDto {
  playFabId: string;
  data: { [key: string]: UserDataRecord };
  dataVersion: number;
}

// Files
export interface FileDto {
  fileName: string;
  fileSize: number;
  lastModified: string;
  contentType: string;
  downloadUrl?: string;
  playFabId: string;
}

export interface FilesResponseDto {
  playFabId: string;
  files: FileDto[];
  totalFiles: number;
  totalSizeBytes: number;
}

export interface FileAnalysisDto {
  fileName: string;
  playFabId: string;
  fileSize: number;
  contentType: string;
  rowCount: number;
  headers: string[];
  metadata: { [key: string]: any };
}

// Objects
export interface ObjectDto {
  objectName: string;
  objectData?: any;
  lastModified?: string;
  playFabId: string;
}

export interface ObjectsResponseDto {
  playFabId: string;
  objects: ObjectDto[];
  totalObjects: number;
  profileVersion: number;
}

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

// Request models
export interface GetPlayersRequest {
  pageNumber?: number;
  pageSize?: number;
  searchTerm?: string;
  createdAfter?: string;
  createdBefore?: string;
  lastLoginAfter?: string;
  lastLoginBefore?: string;
  linkedAccounts?: string[];
}

// Legacy interfaces for backward compatibility
export interface Player extends PlayerDto {}
export interface UserDataResponse extends UserDataResponseDto {}
export interface PlayerAnalytics extends PlayerAnalyticsDto {}