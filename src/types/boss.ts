export interface BossRecord{
  id: string;
  characterName: string;
  bossName: string;
  difficulty: string;
  clearTime: string; // 화면 출력용(예: 15분 40초)
  clearTimeSec: number;
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