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