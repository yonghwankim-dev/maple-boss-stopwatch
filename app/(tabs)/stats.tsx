import { BOSS_DATA } from "@/constants/bossData";
import { useCharacter } from "@/src/context/CharacterContext";
import { formatTime } from "@/src/utils/timeFormatter";
import React, { useEffect, useMemo, useState } from "react";
import { Dimensions, Platform, Pressable, ScrollView, StyleSheet, View } from "react-native";
import { LineChart } from 'react-native-chart-kit';
import { Card, Divider, IconButton, List, Surface, Text } from "react-native-paper";

if(Platform.OS === 'web' && typeof window !== 'undefined'){
    const iconsole = window.console;
    if(iconsole){
        const originalError = iconsole.error;
        iconsole.error = (...args) => {
            // 에러 메시지 중 터치/리스폰더 관련 키워드가 포함되어 있다면 브라우저 화면에 띄우지 않고 가로챕니다.
            if (
                args[0] && 
                typeof args[0] === 'string' && 
                (args[0].includes('Unknown event handler property') || args[0].includes('onResponder'))
            ) {
                return; 
            }
            originalError(...args);
        };
    }
}

// X축 날짜 형식 헬퍼 함수
const formatXAxisLabel = (dateString: string)=>{
    const date = new Date(dateString);
    const currentYear = new Date().getFullYear();
    const recordYear = date.getFullYear();

    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');

    // 이전 연도 데이터 포함시 YYYY-MM-DD, 올해 데이터는 MM-DD
    if(recordYear < currentYear){
        return `${recordYear}-${month}-${day}`;
    }
    return `${month}-${day}`;
}

export default function StatsScreen(){
    const {characters, records} = useCharacter();

    // 보스 목록 리스트
    const bossKeys = useMemo(()=>Object.keys(BOSS_DATA), []);

    // 통계를 볼 캐릭터 필터링 상태 정의 (기본값: 첫번째 캐릭터)
    const [selectedCharName, setSelectedCharName] = useState<string>(characters[0]?.name || '');
    const [selectedBossName, setSelectedBossName] = useState<string>(bossKeys[0]);
    
    // 선택된 보스에 종속된 난이도 상태 관리 (보스가 변경될때마다 해당 보스의 첫번째 난이도로 자동 리셋)
    const [selectedDifficulty, setSelectedDifficulty] = useState<string>(BOSS_DATA[bossKeys[0]][0]);


    useEffect(()=>{
        if(BOSS_DATA[selectedBossName]){
            setSelectedDifficulty(BOSS_DATA[selectedBossName][0]);
        }
    }, [selectedBossName]);
    
    // 데이터 가공1: [특정 캐릭터 + 특정 보스 + 특정 난이도] 기준으로 날짜별 정렬
    const filteredRecords = useMemo(()=>{
        return records.filter(r => 
            r.characterName === selectedCharName &&
            r.bossName === selectedBossName &&
            r.difficulty === selectedDifficulty
        )
        .sort((a,b)=> new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()) // 과거 -> 최근 순 (시간 기준 오름차순)
        .slice(-5); // 최근 5개만
    }, [records, selectedCharName, selectedBossName, selectedDifficulty]);

    // 데이터 가공2: 보스별(난이도 포함 명칭) 개인 최고 기록 계산
    const bestRecords = useMemo(()=>{
        const filtered = records.filter(r => r.characterName === selectedCharName);
        // key: 보스이름, value: 클리어시간(초단위)
        const bossMap: {[key: string]: number} = {};

        filtered.forEach(r=>{
            // 리스트 식별 명칭에 난이도를 함께 결합 (예: '스우 (Hard)')
            const displayName = `${r.bossName} (${r.difficulty})`

            if(!bossMap[displayName] || r.clearTimeSec < bossMap[displayName]){
                bossMap[displayName] = r.clearTimeSec;
            }
        });

        return Object.entries(bossMap).map(([bossDisplayName, clearTimeSec]) => ({
            bossDisplayName,
            clearTimeSec
        }));
    }, [records, selectedCharName]);

    // 차트 데이터 및 Y축 5분 단위 계산 로직
    const chartConfigValues = useMemo(()=>{
        if(filteredRecords.length === 0){
            return null;
        }
        const minutesData = filteredRecords.map(r=>r.clearTimeSec / 60);
        const maxMinutes = Math.max(...minutesData, 5);

        const yAxisMax = Math.ceil(maxMinutes / 5) * 5;
        const segments = yAxisMax / 5;
        
        return {
            data: {
                labels: filteredRecords.map(r=>formatXAxisLabel(r.createdAt)),
                datasets: [
                    {
                        data: minutesData,
                        color: (opacity = 1) => `rgba(33, 150, 243, ${opacity})`,
                        strokeWidth: 3
                    }
                ],
            },
            yAxisMax,
            segments
        };

    }, [filteredRecords]);

    const screenWidth = Dimensions.get("window").width;
    const chartWidth = Math.min(screenWidth - 64, 540); // 반응형 너비 대응

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
                                <Pressable
                                    key={char.id}
                                    onPress={()=>setSelectedCharName(char.name)}
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
                    </ScrollView>
                </Card.Content>
            </Card>

            {/* 보스 및 난이도 선택 필터 세션 */}
            <Card style={styles.card}>
                <Card.Title title="보스 및 난이도 선택"/>
                <Card.Content style={{gap:12}}>
                    {/* 1차 카테고리: 보스 대분류 */}
                    <View style={styles.filterSection}>
                        <Text style={styles.filterLabel}>보스명</Text>
                        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipRow}>
                            {bossKeys.map(boss=>{
                                const isSelected = boss === selectedBossName;
                                return (
                                    <Pressable
                                        key={boss}
                                        onPress={()=>setSelectedBossName(boss)}
                                        style={styles.pressableWrapper}
                                    >
                                        <Surface
                                            style={[styles.bossChip, isSelected && styles.bossChipActive]}
                                        >
                                            <Text style={[styles.bossChipText, isSelected && styles.bossChipTextActive]}>
                                                {boss}
                                            </Text>
                                        </Surface>
                                    </Pressable>
                                    
                                );
                            })}
                        </ScrollView>
                    </View>
                    <Divider style={{marginVertical: 4}}/>

                    {/* 2차 카테고리: 동적 난이도 소분류 */}
                    <View style={styles.filterSection}>
                        <Text style={styles.filterLabel}>난이도</Text>
                        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipRow}>
                            {BOSS_DATA[selectedBossName]?.map(diff=>{
                                const isSelected = diff === selectedDifficulty;
                                return (
                                    <Pressable
                                        key={diff}
                                        onPress={()=>setSelectedDifficulty(diff)}
                                        style={styles.pressableWrapper}
                                    >
                                        <Surface
                                            style={[styles.diffChip, isSelected && styles.diffChipActive]}
                                        >
                                            <Text style={[styles.diffChipText, isSelected && styles.diffChipTextActive]}>
                                                {diff}
                                            </Text>
                                        </Surface>
                                    </Pressable>
                                    
                                )
                            })}
                        </ScrollView>

                    </View>
                    
                </Card.Content>

            </Card>

            {/* 꺽은선 추이 그래프 세션 */}
            <Card style={styles.card}>
                <Card.Title title={`${selectedCharName || '캐릭터'} - ${selectedBossName} (${selectedDifficulty}) 추이`} subtitle="일자별 레이드 시간 변화 추적 (Y축: 분, 5분간격)"/>
                <Card.Content style={styles.chartCenter}>
                    {chartConfigValues ? (
                        <LineChart
                            data={chartConfigValues.data}
                            width={chartWidth}
                            height={240}
                            fromZero={true}
                            yAxisLabel=""
                            yAxisSuffix="분" 
                            segments={chartConfigValues.segments}
                            chartConfig={{
                                backgroundColor: '#ffffff',
                                backgroundGradientFrom: '#ffffff',
                                backgroundGradientTo: '#ffffff',
                                decimalPlaces: 0,
                                color: (opacity = 1) => `rgba(33, 150, 243, ${opacity})`,
                                labelColor: (opacity = 1) => `rgba(100, 100, 100, ${opacity})`,
                                style: {borderRadius: 8},
                                propsForDots: {r: '5', strokeWidth: '2', stroke: '#2196f3'},
                            }}
                            bezier // 곡선효과 적용
                            style={styles.chartRadius}
                            onDataPointClick={()=>{}}
                        />
                    ) : (
                        <View style={styles.emptyContainer}>
                            <IconButton icon="chart-timeline-variant" size={40} iconColor="#ccc"/>
                            <Text style={styles.emptyText}>아직 이 캐릭터로 저장된 보스 클리어 기록이 없습니다.</Text>
                        </View>
                    )}
                </Card.Content>
            </Card>

            {/* 보스별 최고 기록 요약 보드 */}
            <Card style={styles.card}>
                <Card.Title title="보스별 최고 기록" subtitle="가장 빠르게 클리어한 시간입니다."/>
                <Card.Content>
                    {bestRecords.length > 0 ? (
                        bestRecords.map((item, index) => (
                            <React.Fragment key={item.bossDisplayName}>
                                <View style={styles.bestRow}>
                                    <List.Item
                                        title={item.bossDisplayName}
                                        titleStyle={styles.bossTitle}
                                        style={styles.listItem}
                                    />
                                    <Text style={styles.bestTime}>{formatTime(item.clearTimeSec)}</Text>
                                </View>
                                {index < bestRecords.length - 1 && <Divider/>}
                            </React.Fragment>
                        ))
                    ) : (
                        <Text style={styles.emptyText}>기록이 존재하지 않습니다.</Text>                
                    )}
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
  },

  filterSection: {
    backgroundColor: 'transaprent'
  },
  filterLabel: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#666',
    marginBottom: 4
  },

  // 대분류 보스 칩 스타일
  bossChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 4,
    backgroundColor: '#eceff1',
    elevation: 1
  },
  bossChipActive: {
    backgroundColor: '#37474f'
  },
  bossChipText: {
    fontSize: 13,
    color: '#455a64',
    fontWeight: 'bold'
  },
  bossChipTextActive: {
    color: '#fff'
  },
  // 소분류 난이도 칩 스타일
  diffChip: {
    paddingHorizontal: 14, 
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: '#f3e5f5',
    elevation: 1
  },
  diffChipActive: {
    backgroundColor: '#8e24aa'
  },
  diffChipText: {
    fontSize: 12,
    color: '#7b1fa2',
    fontWeight: 'bold'
  },
  diffChipTextActive: {
    color: '#fff'
  },


  // 차트 레이아웃 
  chartCenter: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    backgroundColor: 'transaprent'
  },
  chartRadius: {
    borderRadius: 8,
    marginTop: 8
  },
  // 최고 기록 열 레이아웃
  bestRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'transaprent'
  },
  listItem: {
    flex: 1,
    paddingVertical: 4
  },
  bossTitle: {
    fontSize: 15,
    fontWeight: 'bold'
  },
  bestTime: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#4caf50',
    marginRight: 16
  },

  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 30,
    backgroundColor: 'transparent'
  },
  emptyText: {
    textAlign: 'center',
    color: '#777',
    fontSize: 14,
    marginTop: 8
  }
});
