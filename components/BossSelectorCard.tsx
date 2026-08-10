import { BOSS_DATA } from "@/constants/bossData";
import { Character } from "@/src/types/boss";
import { Pressable, ScrollView, StyleSheet } from "react-native";
import { Card, Divider, Surface, Text } from "react-native-paper";
import { View } from "./Themed";

interface BossSelectorCardProps{
    selectedCharacter: Character | null;
    handleBossChange: (boss: string) => void;
    handleBossDifficultyChange: (difficulty: string) => void;
    isSelectedBoss: (boss: string) => boolean;
    isSelectedBossDifficulty: (diff: string) => boolean;
    getCurrentSelectedBossDifficulties: () => string[];
    formatCurrentBossTarget: () => string;
    title?: string;
    subtitle?: string;
}

export const BossSelectorCard: React.FC<BossSelectorCardProps> = ({
    selectedCharacter,
    handleBossChange,
    handleBossDifficultyChange,
    isSelectedBoss,
    isSelectedBossDifficulty,
    getCurrentSelectedBossDifficulties,
    formatCurrentBossTarget,
    title = "보스 및 난이도 설정",
    subtitle = "기록을 측정할 보스 및 난이도를 선택하세요."
}) => {
    return (
        <Card style={styles.card}>
          <Card.Title title={title} subtitle={subtitle}/>
          <Card.Content style={{gap: 16}}>
            {/* 6열 바둑판 그리드 형태의 보스 즉시 선택 구역 */}
            <View style={styles.dropdownWrapper}>
              <Text style={styles.dropdownLabel}> 보스명</Text>

              <View style={styles.bossGridContainer}>
                {Object.keys(BOSS_DATA).map((boss)=>{
                  const isSelected = isSelectedBoss(boss);
                  return (
                    <Pressable
                      key={boss}
                      onPress={()=>handleBossChange(boss)}
                      style={styles.gridItemWrapper}
                    >
                      <Surface
                        style={[
                          styles.bossGridCell,
                          isSelected && styles.bossGridCellActive
                        ]}
                        elevation={isSelected ? 2 : 0}
                      >
                        <Text
                          style={[
                            styles.bossGridText,
                            isSelected && styles.bossGridTextActive
                          ]}
                          numberOfLines={1}
                          adjustsFontSizeToFit
                        >
                          {boss}
                        </Text>
                      </Surface>
                    </Pressable>
                  );
                })}
              </View>
            </View>
            <View style={styles.dropdownWrapper}>
              <Text style={styles.dropdownLabel}>난이도</Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.chipRow}
              >
                {getCurrentSelectedBossDifficulties().map(diff => {
                  const isSelected = isSelectedBossDifficulty(diff);
                  return (
                    <Pressable
                      key={diff}
                      onPress={()=>handleBossDifficultyChange(diff)}
                      style={styles.pressableWrapper}
                    >
                      <Surface
                        style={[
                          styles.diffChip,
                          isSelected && styles.diffChipActive
                        ]}
                        elevation={isSelected ? 1 : 0}
                      >
                        <Text
                          style={[
                            styles.diffChipText,
                            isSelected && styles.diffChipTextActive
                          ]}
                        >
                          {diff}
                        </Text>

                      </Surface>

                    </Pressable>
                  );
                })}

              </ScrollView>
            </View>
            <Divider/>

            {/* 선택한 캐릭터 / 보스 / 난이도 출력 */}
            <Text style={styles.infoText}>
              타겟: <Text style={styles.boldChar}>
                {selectedCharacter ? selectedCharacter.name : '미선택'}
                </Text> ➡️ <Text style={styles.boldBoss}>{formatCurrentBossTarget()}</Text>
            </Text>
          </Card.Content>

        </Card>
    );
}

const styles = StyleSheet.create({
  card: {
    marginBottom: 16,
    backgroundColor: "#fff"
  },
  infoText: {
    fontSize: 14,
    color: '#555',
    marginTop: 12
  },
  boldChar: {
    fontWeight: 'bold',
    color: '#e91e63'
  },
  boldBoss: {
    fontWeight: 'bold',
    color: '#2196f3'
  },
  // 드롭다운 한줄 래퍼 및 라벨 스타일
  dropdownWrapper:{
    width: '100%',
    backgroundColor: 'transaprent'
  },
  dropdownLabel:{
    fontSize: 13,
    fontWeight: 'bold',
    color: '#666',
    marginBottom: 4
  },
  // 6열 보스 그리드 레이아웃 스타일
  bossGridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -3,
    marginTop: 4,
    backgroundColor: 'transaprent'
  },
  gridItemWrapper: {
    width: `${100 / 6}%`,
    padding: 3,
    aspectRatio: 1
  },
  bossGridCell: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    backgroundColor: '#fafafa'
  },
  bossGridCellActive: {
    borderColor: '#2196f3',
    backgroundColor: '#e3f2fd'
  },
  bossGridText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#666',
    textAlign: 'center'
  },
  bossGridTextActive: {
    fontWeight: 'bold',
    color: '#2196f3'
  },
  // 난이도 수평 스크롤 행 스타일
  chipRow: {
    flexDirection: 'row',
    gap: 8,
    paddingVertical: 4,
    backgroundColor: 'transaprent'
  },
  pressableWrapper:{
    backgroundColor: 'transaprent'
  },
  // 기본 칩 디자인
  diffChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    backgroundColor: '#fafafa',
    justifyContent: 'center',
    alignItems: 'center'
  },
  // 활성화시 칩 다지인
  diffChipActive: {
    borderColor: '#2196f3',
    backgroundColor: '#e3f2fd'
  },
  // 기본 칩 텍스트
  diffChipText: {
    fontSize: 13,
    fontWeight: '500',
    color: '#666'
  },
  diffChipTextActive: {
    fontWeight: 'bold',
    color: '#2196f3'
  }
});
