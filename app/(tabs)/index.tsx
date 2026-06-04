import { Alert, Platform, ScrollView, StyleSheet, Text } from 'react-native';
import { Button, Card, DataTable, HelperText, TextInput } from 'react-native-paper';

import { View } from '@/components/Themed';
import { useStopwatch } from '@/src/hooks/useStopwatch';
import { useState } from 'react';

interface BossRecord{
  id: string;
  characterName: string;
  bossName: string;
  difficulty: string;
  clearTime: string; // 화면 출력용(예: 15분 40초)
  clearTimeSec: number;
  createdAt: string; // YYYY-MM-DD 형식 (내부 데이터는 시간 포함 가능)
}

export default function StopwatchScreen() {
  const {time, isRunning, start, pause, reset, complete } = useStopwatch();

  const [characterName, setCharacterName] = useState<string>("제빛제로");
  const [difficulty, setDifficulty] = useState<string>("Hard");
  const [bossName, setBossName] = useState<string>("스우");

  const formatTime = (seconds: number) =>{
    const mins = Math.floor(seconds / 60).toString().padStart(2, '0');
    const secs = (seconds % 60).toString().padStart(2, '0');
    return `${mins}분 ${secs}초`;
  }

  // 하단 목록 테이블 상태 관리
  const [records, setRecords] = useState<BossRecord[]>([]);


  const handleReset = ()=>{
    const message = "시간을 초기화하시겠습니까?";
    if(Platform.OS === 'web'){
      if(window.confirm(message)){
        reset();
      }
    }else{
      Alert.alert("초기화", message, [
        {text: "취소", style: "cancel"},
        {text: "확인", onPress: reset}
      ])
    }
  };

  const handleComplete = ()=>{
    const elapsedSeconds = complete();

    const newRecord: BossRecord = {
      id: Math.random().toString(36).substring(2, 9),
      characterName: characterName.trim(),
      bossName: bossName,
      difficulty: difficulty,
      clearTime: formatTime(elapsedSeconds),
      clearTimeSec: elapsedSeconds,
      // 출력 형식: YYYY-MM-DD
      createdAt: new Date().toISOString().split('T')[0]
    };

    setRecords((prevRecords)=>[newRecord, ...prevRecords]);
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <Card style={styles.card}>
        <Card.Content>
          <TextInput
            label="캐릭터 이름(필수)"
            value={characterName}
            onChangeText={setCharacterName}
            mode="outlined"
            error={!characterName.trim()}
            style={styles.input}
          />
          {!characterName.trim() && (
            <HelperText type="error" visible={true}>
              캐릭터 이름을 입력해야 기록을 추가할 수 있습니다.
            </HelperText>
          )}

          <Text style={styles.infoText}>
            보스: <Text style={styles.bold}>{difficulty} {bossName}</Text>
          </Text>
        </Card.Content>
      </Card>

      {/* 타이머 디스플레이 및 제어 영역 */}
      <Card style={styles.timeCard}>
        <Card.Content style={styles.timeContent}>
          
          <Text style={styles.timerText}>{formatTime(time)}</Text>

          {/* 스톱워치 버튼 영역 */}
          <View style={styles.buttonRow}>
            <Button
              mode="contained"
              onPress={isRunning ? pause : start}
              style={styles.btn}
              buttonColor={isRunning ? "#ff4d4d" : "#4caf50"}
            >
              {isRunning ? "일시정지" : "시작"}
            </Button>

            <Button
              mode="contained"
              onPress={handleReset}
              style={styles.btn}
            >
              초기화
            </Button>

            <Button
              mode="contained"
              onPress={handleComplete}
              style={styles.btn}
              buttonColor="#2196f3"
            >
              완료
            </Button>
          </View>
        </Card.Content>
      </Card>

      {/* 보스 클리어 목록 테이블 */}
      <Card style={styles.card}>
        <Card.Title title="보스 클리어 목록" subtitle="최신 기록이 맨 위에 표시됩니다."/>
        <Card.Content>
          <DataTable>
            <DataTable.Header>
              <DataTable.Title>캐릭터</DataTable.Title>
              <DataTable.Title>보스 (난이도)</DataTable.Title>
              <DataTable.Title numeric>클리어 시간</DataTable.Title>
              <DataTable.Title numeric>날짜</DataTable.Title>
            </DataTable.Header>

            {records.map((item)=>(
              <DataTable.Row key={item.id}>
                <DataTable.Cell>{item.characterName}</DataTable.Cell>
                <DataTable.Cell>{`${item.bossName} (${item.difficulty})`}</DataTable.Cell>
                <DataTable.Cell numeric>{item.clearTime}</DataTable.Cell>
                <DataTable.Cell numeric>{item.createdAt}</DataTable.Cell>
              </DataTable.Row>
            ))}

            {records.length === 0 && (
              <Text style={styles.emptyText}>아직 추가된 보스 클리어 기록이 없습니다.</Text>
            )}
            
          </DataTable>
        </Card.Content>
      </Card>
    </ScrollView>
  );
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
  timeCard: {
    backgroundColor: "#1e1e24",
    paddingVertical: 30,
    borderRadius: 12,
    elevation: 4
  },
  timeContent:{
    alignItems: 'center'
  },
  timerText: { 
    fontSize: 52, 
    fontWeight: 'bold', 
    color: '#fff',
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    marginBottom: 20
  },
  input: {
    marginTop: 8
  },
  infoText: {
    fontSize: 14,
    color: '#555',
    marginTop: 12
  },
  bold: {
    fontWeight: 'bold',
    color: '#2196f3'
  },
  buttonRow: { 
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    gap: 8
  },
  btn: {
    flex: 1
  },
  emptyText: {
    textAlign: 'center',
    color: '#999',
    marginVertical: 30,
    fontSize: 14
  }
});
