export interface BossRecord{
  id: string;
  characterName: string;
  bossName: string;
  difficulty: string;
  clearTime: string; // 화면 출력용(예: 15분 40초)
  clearTimeSec: number;
  createdAt: string; // YYYY-MM-DD 형식 (내부 데이터는 시간 포함 가능)
}

export interface Character{
    id: string,
    name: string
}