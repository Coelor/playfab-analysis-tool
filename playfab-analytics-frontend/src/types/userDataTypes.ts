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