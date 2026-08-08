export const BOSS_DATA: Record<string, string[]> = {
  "스우": ["Normal", "Hard", "Extreme"],
  "데미안": ["Normal", "Hard"],
  "가디언 엔젤 슬라임": ["Normal", "Chaos"],
  "루시드": ["Easy", "Normal", "Hard"],
  "윌": ["Easy", "Normal", "Hard"],
  "더스크": ["Normal", "Chaos"],
  "진 힐라": ["Normal", "Hard"],
  "듄켈": ["Normal", "Hard"],
  "검은 마법사": ["Hard", "Extreme"],
  "선택받은 세렌": ["Normal", "Hard", "Extreme"],
  "감시자 칼로스": ["Easy", "Normal", "Chaos", "Extreme"],
  "최초의 대적자": ["Easy", "Normal", "Hard", "Extreme"],
  "카링": ["Easy", "Normal", "Hard", "Extreme"],
  "찬란한 흉성": ["Normal", "Hard"],
  "림보": ["Normal", "Hard"],
  "발드릭스": ["Normal", "Hard"], 
  "유피테르": ["Normal", "Hard"]
};

export const BOSS_ORDER = Object.keys(BOSS_DATA);

export const getBossSortRank = (bossName: string, difficulty: string)=>{
  const bossIndex = BOSS_ORDER.indexOf(bossName);
  const validBossIndex = bossIndex !== -1 ? bossIndex : 999;
  
  const difficultyList = BOSS_DATA[bossName] || [];
  const difficultyIndex = difficultyList.indexOf(difficulty);
  const validDifficultyIndex = difficultyIndex !== -1 ? difficultyIndex : 999;

  return {
    bossIndex: validBossIndex,
    difficultyIndex: validDifficultyIndex
  };
}