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