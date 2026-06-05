import { useCharacter } from "@/src/context/CharacterContext";
import { formatTime } from "@/src/utils/timeFormatter";
import React, { useMemo, useState } from "react";
import { Dimensions, Platform, ScrollView, StyleSheet, View } from "react-native";
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

export default function StatsScreen(){
    const {characters, records} = useCharacter();
    // 통계를 볼 캐릭터 필터링 상태 정의 (기본값: 첫번째 캐릭터)
    const [selectedCharName, setSelectedCharName] = useState<string>(characters[0]?.name || '');
    
    // 데이터 가공1: 선택된 캐릭터의 최근 5개 기록 추출 (그래프용)
    const chartRecords = useMemo(()=>{
        return records.filter(r => r.characterName === selectedCharName)
        .sort((a,b)=> new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()) // 과거 -> 최근 순 (시간 기준 오름차순)
        .slice(-5); // 최근 5개만
    }, [records, selectedCharName]);

    // 데이터 가공2: 보스별 개인 최고 기록(최단 타임) 계산
    const bestRecords = useMemo(()=>{
        const filtered = records.filter(r => r.characterName === selectedCharName);
        const bossMap: {[key: string]: number} = {};

        filtered.forEach(r=>{
            if(!bossMap[r.bossName] || r.clearTimeSec < bossMap[r.bossName]){
                bossMap[r.bossName] = r.clearTimeSec;
            }
        });

        return Object.entries(bossMap).map(([bossName, clearTimeSec]) => ({
            bossName,
            clearTimeSec
        }));
    }, [records, selectedCharName]);


    // 차트 데이터 형식 설정
    const chartData = useMemo(()=>{
        if(chartRecords.length === 0){
            return null;
        }
        return {
            labels: chartRecords.map((_, i)=>`${i+1}회차`),
            datasets: [
                {
                    // 차트는 분(Minute) 단위 실수 형태로 변환하여 시각화
                    data: chartRecords.map(r=>r.clearTimeSec / 60),
                    color: (opacity = 1) => `rgba(33, 150, 243, ${opacity})`, // 메인 블루
                    strokeWidth: 3
                },
            ],
        };
    }, [chartRecords]);

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

            {/* 꺽은선 추이 그래프 세션 */}
            <Card style={styles.card}>
                <Card.Title title="클리어 타임 추이" subtitle="최근 최대 5개 보스의 시간 변화 추적 (단위: 분)"/>
                <Card.Content style={styles.chartCenter}>
                    {chartData ? (
                        <LineChart
                            data={chartData}
                            width={chartWidth}
                            height={220}
                            chartConfig={{
                                backgroundColor: '#ffffff',
                                backgroundGradientFrom: '#ffffff',
                                backgroundGradientTo: '#ffffff',
                                decimalPlaces: 1,
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
                            <React.Fragment key={item.bossName}>
                                <View style={styles.bestRow}>
                                    <List.Item
                                        title={item.bossName}
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
