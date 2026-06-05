import { useCharacter } from "@/src/context/CharacterContext";
import { useState } from "react";
import { ScrollView, StyleSheet } from "react-native";
import { Card, Surface, Text } from "react-native-paper";

export default function StatsScreen(){
    const {characters} = useCharacter();
    // 통계를 볼 캐릭터 필터링 상태 정의 (기본값: 첫번째 캐릭터)
    const [selectedCharName, setSelectedCharName] = useState<string>(characters[0]?.name || '');
    return (
        <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
            {/* 캐릭터 퀵 셀렉터 (수평 스크롤 가로 바) */}
            <Card style={styles.card}>
                <Card.Title title="캐릭터 선택" subtitle="통계를 확인할 캐릭터를 탭하세요."/>
                <Card.Content>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipRow}>
                        {characters.map(char => {
                            const isSelected = char.name === selectedCharName;
                            return (
                                <Surface
                                    key={char.id}
                                    style={[styles.chip, isSelected && styles.chipActive]}
                                    onTouchEnd={()=>setSelectedCharName(char.name)}
                                >
                                    <Text style={[styles.chipText, isSelected && styles.chipTextActive]}>
                                        {char.name}
                                    </Text>

                                </Surface>
                            );
                        })}
                    </ScrollView>
                </Card.Content>
            </Card>
        </ScrollView>
    )
}

const styles = StyleSheet.create({
  container: { 
    flex:1, 
    backgroundColor: '#f5f5f5',
  },
  contentContainer: {
    padding: 16,
    maxWidth: 800,
    width: '100%',
    alignSelf: 'center'
  },
  card: {
    marginBottom: 16,
    backgroundColor: "#fff"
  },
  // 퀵 캐릭터 셀렉터 스타일
  chipRow: {
    flexDirection: 'row',
    gap: 8,
    paddingVertical: 8,
    backgroundColor: 'transparent'
  },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 4,
    backgroundColor: '#e0e0e0',
    elevation: 1,
    minWidth: 80,
    alignItems: 'center'
  },
  chipActive: {
    backgroundColor: '#2196f3'
  },
  chipText: {
    fontSize: 14,
    color: '#333',
    fontWeight: 'bold'
  },
  chipTextActive: {
    color: '#fff'
  }
});
