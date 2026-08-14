import { BossRecord } from "../models/BossRecord";


export interface Character{
    id: string, // UUID v4   
    name: string,
    createdAt: Date
}

export interface ExportedData{
  version: string;
  exportedAt: string;
  characters: Character[];
  bossRecords: BossRecord[];
}