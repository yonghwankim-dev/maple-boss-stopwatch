import { Alert, Platform, ScrollView, StyleSheet, Text } from 'react-native';
import { Button, Card, DataTable, HelperText, Menu, Provider, TextInput } from 'react-native-paper';

import { View } from '@/components/Themed';
import { BOSS_DATA } from '@/constants/bossData';
import { useStopwatch } from '@/src/hooks/useStopwatch';
import { BossRecord } from '@/src/types/boss';
import { formatTime, getTodayDate } from '@/src/utils/timeFormatter';
import { useState } from 'react';

export default function StopwatchScreen() {
  const {time, isRunning, start, pause, reset, complete } = useStopwatch();

  const [characterName, setCharacterName] = useState<string>("제빛제로");
  
  // 보스 및 난이도 상태 관리
  const [bossName, setBossName] = useState<string>("스우");
  const [difficulty, setDifficulty] = useState<string>(BOSS_DATA["스우"][0]);

  // Menu 오픈 여부 제어 상태
  const [bossMenuVisible, setBossMenuVisible] = useState<boolean>(false);
  const [diffMenuVisible, setDiffMenuVisible] = useState<boolean>(false);

  const handleBossChange = (selectedBoss: string) => {
    setBossName(selectedBoss);
    setDifficulty(BOSS_DATA[selectedBoss][0]);
    setBossMenuVisible(false);
  };

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
      createdAt: getTodayDate()
    };

    setRecords((prevRecords)=>[newRecord, ...prevRecords]);
  };

  return (
    <Provider>
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

            {/* 보스 및 난이도 선택 피커 버튼 레이아웃 */}
            <View style={styles.pickerRow}>
              {/* 보스 선택 메뉴 */}
              <Menu
                visible={bossMenuVisible}
                onDismiss={()=>setBossMenuVisible(false)}
                anchor={
                  <Button 
                    mode="outlined" 
                    onPress={()=>setBossMenuVisible(true)} 
                    style={styles.pickerBtn}
                    contentStyle={styles.pickerBtnContent}
                  >
                    {bossName}
                  </Button>
                }
              >
                {Object.keys(BOSS_DATA).map((boss)=>(
                  <Menu.Item key={boss} onPress={()=> handleBossChange(boss)} title={boss}/>
                ))}
              </Menu>

              {/* 보스 난이도 선택 메뉴 */}
              <Menu
                visible={diffMenuVisible}
                onDismiss={()=>setDiffMenuVisible(false)}
                anchor={
                  <Button 
                    mode="outlined" 
                    onPress={()=>setDiffMenuVisible(true)} 
                    style={styles.pickerBtn}
                    contentStyle={styles.pickerBtnContent}
                  >
                    {difficulty}
                  </Button>
                }
              >
                {BOSS_DATA[bossName].map((diff)=>(
                  <Menu.Item key={diff} onPress={()=> {setDifficulty(diff); setDiffMenuVisible(false);}} title={diff}/>
                ))}
              </Menu>
            </View>

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
    </Provider>
    
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
  pickerRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 12,
    backgroundColor: 'transparent'
  },
  pickerBtn: {
    flex: 1,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#ccc'
  },
  pickerBtnContent: {
    height: 48,
    justifyContent: 'center'
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
