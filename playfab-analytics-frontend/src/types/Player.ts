export interface Player {
  playFabId: string;
  displayName?: string;
  created?: string;
  lastLogin?: string;
  totalValueToDateInUSD?: number;
  linkedAccounts: string[];
  statistics: { [key: string]: any };
}

export interface UserDataRecord {
  key: string;
  value: string;
  lastUpdated?: string;
  permission?: number;
}

export interface UserDataResponse {
  playFabId: string;
  data: { [key: string]: UserDataRecord };
  dataVersion: number;
}

export interface PlayerAnalytics {
  playFabId?: string;
  displayName?: string;
  lastActivity?: string;
  createdDate?: string;
  totalValueToDateInUSD?: number;
  linkedAccounts?: string[];
  statistics?: { [key: string]: any };
  userDataKeyCount?: number;
  userDataKeys?: string[];
}