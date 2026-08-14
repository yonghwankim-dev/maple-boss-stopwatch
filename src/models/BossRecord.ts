import uuid from 'react-native-uuid';

export interface BossRecord{
  id: string; // UUID v4
  characterId: string; // UUID v4
  bossName: string;
  difficulty: string;
  clearTimeSec: number;
  clearDate: string; // 예: "2026-08-13" (YYYY-MM-DD 형식)
  createdAt: Date;
}

interface CreateBossRecordParams{
  characterId: string;
  bossName: string;
  difficulty: string;
  clearTimeSec: number; 
  clearDate: string;  // "YYYY-MM-DD"
  id?: string;        // 기본값: uuidv4
  createdAt?: Date;   //기본값: 현재 시각  
}

export const createBossRecord = ({
  characterId,
  bossName,
  difficulty,
  clearTimeSec,
  clearDate,
  id = uuid.v4() as string,
  createdAt = new Date(),
}: CreateBossRecordParams): BossRecord =>{
  return {
    id,
    characterId,
    bossName,
    difficulty,
    clearTimeSec,
    clearDate,
    createdAt
  };
}