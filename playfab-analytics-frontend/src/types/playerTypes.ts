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