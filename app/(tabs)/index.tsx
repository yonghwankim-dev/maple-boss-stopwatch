import { Alert, Platform, ScrollView, StyleSheet, Text } from 'react-native';
import { Button, Card, DataTable, Menu, Provider } from 'react-native-paper';

import { View } from '@/components/Themed';
import { BOSS_DATA } from '@/constants/bossData';
import { useCharacter } from '@/src/context/CharacterContext';
import { useStopwatch } from '@/src/hooks/useStopwatch';
import { BossRecord } from '@/src/types/boss';
import { formatTime, getTodayDate } from '@/src/utils/timeFormatter';
import { useState } from 'react';

export default function StopwatchScreen() {
  const {time, isRunning, start, pause, reset, complete } = useStopwatch();

  const { characters, selectedCharacter, setSelectedCharacter, records, setRecords } = useCharacter();
    
  // 보스 및 난이도 상태 관리
  const [bossName, setBossName] = useState<string>("스우");
  const [difficulty, setDifficulty] = useState<string>(BOSS_DATA["스우"][0]);

  // UI 메뉴 오픈 여부 제어 상태
  const [charMenuVisible, setCharMenuVisible] = useState<boolean>(false);
  const [bossMenuVisible, setBossMenuVisible] = useState<boolean>(false);
  const [diffMenuVisible, setDiffMenuVisible] = useState<boolean>(false);

  // 보스 변경 핸들러
  const handleBossChange = (selectedBoss: string) => {
    setBossName(selectedBoss);
    setDifficulty(BOSS_DATA[selectedBoss][0]);
    setBossMenuVisible(false);
  };

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
    if(!selectedCharacter){
      const errorMessage = "캐릭터 관리 탭에서 캐릭터를 먼저 추가해 주세요.";
      if(Platform.OS === 'web'){
        alert(errorMessage);
      }else{
        Alert.alert("선택 오류", errorMessage);
      }
      return;
    }
    const elapsedSeconds = complete();

    const newRecord: BossRecord = {
      id: Math.random().toString(36).substring(2, 9),
      characterName: selectedCharacter.name,
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
        {/* 캐릭터 관리 카드 */}
        <Card style={styles.card}>
          <Card.Title title="캐릭터 관리 및 선택" subtitle="스톱워치를 시작할 캐릭터를 선택해주세요"/>
          <Card.Content>
            {/* 메인 선택 구역 (캐릭터 / 보스 / 난이도) */}
            <View style={styles.pickerRow}>
              {/* 캐릭터 선택 메뉴 */}
              <Menu
                visible={charMenuVisible}
                onDismiss={()=>setCharMenuVisible(false)}
                anchor={
                  <Button
                    mode="outlined"
                    onPress={()=>setCharMenuVisible(true)}
                    style={styles.pickerBtn}
                    contentStyle={styles.pickerBtnContent}
                  >
                    캐릭터: {selectedCharacter?.name ? selectedCharacter?.name : '없음'}
                  </Button>
                } 
              >
                {characters.map((char)=>(
                  <Menu.Item
                    key={char.id}
                    onPress={()=>{setSelectedCharacter(char); setCharMenuVisible(false);}}
                    title={char.name}                    
                  />
                ))}
              </Menu>

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
              타겟: <Text style={styles.boldChar}>
                {selectedCharacter ? selectedCharacter.name : '미선택'}
                </Text> ➡️ <Text style={styles.boldBoss}>{difficulty} {bossName}</Text>
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

  // 캐릭터 추가 폼 레이아웃
  addCharRow:{
    flexDirection: 'row', 
    gap: 10, 
    alignItems: 'center',
    backgroundColor: 'transparent'
  },
  charInput: {
    flex: 4
  },
  rectBtn:{
    borderRadius: 4,
    height: 40,
    justifyContent: 'center'
  },
  divider: {
    marginVertical: 12
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
  deleteBtn: {
    flex: 1,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#ff4d4d'
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
  boldChar: {
    fontWeight: 'bold',
    color: '#e91e63'
  },
  boldBoss: {
    fontWeight: 'bold',
    color: '#2196f3'
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
