import { Character } from "@/src/types/types";
import { Platform, Pressable, StyleSheet } from "react-native";
import { Card, Surface, Text } from "react-native-paper";
import { View } from "./Themed";

interface CharacterSelectorCardProps{
    characters: Character[];
    selectedCharacter: Character | null;
    setSelectedCharacter: (character: Character) => void;
    title?: string;
    subtitle?: string;
}

export const CharacterSelectorCard: React.FC<CharacterSelectorCardProps> = ({
    characters,
    selectedCharacter,
    setSelectedCharacter,
    title = "캐릭터 선택",
    subtitle = "기록을 측정할 캐릭터를 선택해주세요"
}) => {
    return (
        <>
        {/* 캐릭터 퀵 셀렉터 (수평 스크롤 가로 바) */}
        <Card style={styles.card}>
            <Card.Title title={title} subtitle={subtitle}/>
            <Card.Content>
                <View style={styles.chipGrid}>
                    {characters.map((char)=>{
                        const isSelected = char.id === selectedCharacter?.id;
                        return (
                            <Pressable
                                key={char.id}
                                onPress={()=>setSelectedCharacter(char)}
                                style={styles.pressableWrapper}
                            >
                                <Surface
                                    style={[styles.chip, isSelected && styles.chipActive]}
                                >
                                    <Text style={[styles.chipText, isSelected && styles.chipTextActive]}>
                                        {char.name}
                                    </Text>
                                </Surface>
                            </Pressable>
                        );
                    })}
                </View>
            </Card.Content>
        </Card>
        </>
    );
};

const styles = StyleSheet.create({
  card: {
    marginBottom: 16,
    backgroundColor: "#fff"
  },

  chipGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    paddingVertical: 8
  },
  // 웹에서 마우스 커서를 올렸을때, 클릭 가능한 손가락 모양(pointer)이 나오도록 설정
  pressableWrapper: {
    ...Platform.select({
        web: {
            cursor: 'pointer'
        },
    }),
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