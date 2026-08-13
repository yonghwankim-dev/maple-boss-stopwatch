export interface BossRecord{
  id: string; // UUID v4
  characterId: string; // UUID v4
  bossName: string;
  difficulty: string;
  clearTimeSec: number;
  clearDate: string; // 예: "2026-08-13" (YYYY-MM-DD 형식)
  createdAt: Date;
}

export interface Character{
    id: string, // UUID v4   
    name: string,
    createdAt: Date
}

export interface ExportedData{
  version: string;
  exportedAt: string;
  characters: Character[];
  persistentRecords: BossRecord[];
}