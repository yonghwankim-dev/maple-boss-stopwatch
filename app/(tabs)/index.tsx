import { Alert, Platform, Pressable, ScrollView, StyleSheet, Text } from 'react-native';
import { Button, Card, DataTable, Divider, IconButton, Menu, Provider, SegmentedButtons, Surface, TextInput } from 'react-native-paper';

import { View } from '@/components/Themed';
import { BOSS_DATA } from '@/constants/bossData';
import { useCharacter } from '@/src/context/CharacterContext';
import { useStopwatch } from '@/src/hooks/useStopwatch';
import { BossRecord } from '@/src/types/boss';
import { formatTime, getTodayDate } from '@/src/utils/timeFormatter';
import { useState } from 'react';

export default function StopwatchScreen() {
  const {time, isRunning, start, pause, reset, complete } = useStopwatch();
  const { characters, selectedCharacter, setSelectedCharacter, tempRecords, setTempRecords, saveToPersistent } = useCharacter();
    
  // 보스 및 난이도 상태 관리
  const [bossName, setBossName] = useState<string>("스우");
  const [difficulty, setDifficulty] = useState<string>(BOSS_DATA["스우"][0]);

  // UI 메뉴 오픈 여부 제어 상태
  const [charMenuVisible, setCharMenuVisible] = useState<boolean>(false);
  const [bossMenuVisible, setBossMenuVisible] = useState<boolean>(false);
  const [diffMenuVisible, setDiffMenuVisible] = useState<boolean>(false);

  // 기록 방식 상태 관리 ('timer': 스톱워치, 'manual': 직접입력)
  const [recordMode, setRecordMode] = useState<'timer' | 'manual'>('timer');

  // 직접 입력 폼 전용 상태 관리
  const [manualMinutes, setManualMinutes] = useState<string>('');
  const [manualSeconds, setManualSeconds] = useState<string>('');
  const [manualDate, setManualDate] = useState<string>(getTodayDate());
  
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

  const handleComplete = async ()=>{
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

    setTempRecords((prevRecords)=>[newRecord, ...prevRecords]);

    await saveToPersistent(newRecord);
  };

  // 수동 기록 저장 핸들러
  const handleManualSave = async () => {
    if(!selectedCharacter){
      const errorMessage = "캐릭터 관리 탭에서 캐릭터를 먼저 추가해주세요.";
      if(Platform.OS === 'web'){
        alert(errorMessage);
      }else{
        Alert.alert("선택 오류", errorMessage);
      }
      return;
    }

    const mins = parseInt(manualMinutes || '0', 10);
    const secs = parseInt(manualSeconds || '0', 10);

    if(mins == 0 && secs == 0){
      const message = "클리어 시간을 입력해주세요.";
      if(Platform.OS === 'web'){
        alert(message);
      }else{
        Alert.alert("입력 오류", message);
      }
      return;
    }
    
    if(secs >= 60){
      const message = "초는 59초 이하로 입력해주세요.";
      if(Platform.OS === 'web'){
        alert(message);
      }else{
        Alert.alert("입력 오류", message);
      }
      return;
    }

    // YYYY-MM-DD 정규식 검증
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if(!dateRegex.test(manualDate)){
      const message = "날짜 형식을 YYYY-MM-DD에 맞게 입력해주세요.";
      if(Platform.OS === 'web'){
        alert(message);
      }else{
        Alert.alert("입력 오류", message);
      }
      return;
    }

    const totalSeconds = mins * 60 + secs;
    const newRecord: BossRecord = {
      id: Math.random().toString(36).substring(2, 9),
      characterName: selectedCharacter.name,
      bossName: bossName,
      difficulty: difficulty,
      clearTime: formatTime(totalSeconds),
      clearTimeSec: totalSeconds,
      createdAt: manualDate
    };

    setTempRecords((prevRecords)=>[newRecord, ...prevRecords ]);
    await saveToPersistent(newRecord);

    // 저장후 폼 초기화
    setManualMinutes('');
    setManualSeconds('');
  };

  // 보스 클리어 기록 삭제 핸들러
  const handleDeleteTempRecord = (id: string)=>{
    setTempRecords((prevRecords)=>prevRecords.filter((record)=>record.id !== id));
  }

  return (
    <Provider>
      <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
        {/* 캐릭터 필터 카드 */}
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
                    style={styles.singlePickerBtn}
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
            </View>
          </Card.Content>
        </Card>

        {/* 보스 및 난이도 설정 카드 */}
        <Card style={styles.card}>
          <Card.Title title="보스 및 난이도 설정" subtitle="기록을 측정할 보스 및 난이도를 선택하세요."/>
          <Card.Content style={{gap: 16}}>
            {/* 6열 바둑판 그리드 형태의 보스 즉시 선택 구역 */}
            <View style={styles.dropdownWrapper}>
              <Text style={styles.dropdownLabel}> 보스명</Text>

              <View style={styles.bossGridContainer}>
                {Object.keys(BOSS_DATA).map((boss)=>{
                  const isSelected = boss === bossName;
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
                {BOSS_DATA[bossName].map(diff => {
                  const isSelected = diff === difficulty;
                  return (
                    <Pressable
                      key={diff}
                      onPress={()=>setDifficulty(diff)}
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
                </Text> ➡️ <Text style={styles.boldBoss}>{bossName} ({difficulty})</Text>
            </Text>
          </Card.Content>

        </Card>

        {/* 기록 모드 전환 탭 */}
        <View style={styles.tabWrapper}>
          <SegmentedButtons
            value={recordMode}
            onValueChange={setRecordMode}
            buttons={[
              {
                value: 'timer',
                label: '스톱워치 측정',
                icon: 'timer-outline'
              },
              {
                value: 'manual',
                label: '직접 기록 입력',
                icon: 'pencil-outline'
              }
            ]}
            style={styles.segmentedTab}
          />
        </View>

        {/* 하단 제어 섹션 분기점 */}
        {recordMode === 'timer' ? (
          /* 타이머 디스플레이 및 제어 영역 */
          <Card style={styles.timeCard}>
            <Card.Content style={styles.timeContent}>    
              <Text style={styles.timerText}>{formatTime(time)}</Text>

              {/* 스톱워치 버튼 영역 */}
              <View style={styles.buttonRow}>
                <Button
                  mode="contained"
                  onPress={isRunning ? pause : start}
                  style={styles.fullBtn}
                  labelStyle={styles.btnLabel}
                  icon={isRunning ? "pause" : "play"}
                  buttonColor={isRunning ? "#ff4d4d" : "#4caf50"}
                >
                  {isRunning ? "일시정지" : "시작"}
                </Button>

                <Button
                  mode="contained"
                  onPress={handleReset}
                  style={[styles.fullBtn, styles.resetBtn]}
                  labelStyle={styles.btnLabel}
                  icon="refresh"
                >
                  초기화
                </Button>

                <Button
                  mode="contained"
                  onPress={handleComplete}
                  style={styles.fullBtn}
                  labelStyle={styles.btnLabel}
                  icon="check-bold"
                  disabled={!isRunning}
                  buttonColor={isRunning ? '#2196f3' : '#b0bec5'}
                >
                  완료
                </Button>
              </View>
            </Card.Content>
          </Card>

        ) : (
          /* 수동 기록 입력 영역 */
          <Card style={styles.card}>
            <Card.Title title="직접 기록 입력" subtitle="클리어 시간과 날짜를 수동으로 입력합니다."/>
            <Card.Content style={{gap: 16}}>
              <View style={styles.inputRow}>
                <TextInput
                  label="분"
                  value={manualMinutes}
                  onChangeText={setManualMinutes}
                  keyboardType="number-pad"
                  mode="outlined"
                  style={{flex: 1}}
                  placeholder='00'
                />
                <Text style={styles.timeSeparator}>:</Text>
                <TextInput
                  label="초"
                  value={manualSeconds}
                  onChangeText={setManualSeconds}
                  keyboardType="number-pad"
                  mode="outlined"
                  style={{flex: 1}}
                  placeholder='00'
                />
              </View>
              <TextInput
                label="클리어 날짜 (YYYY-MM-DD)"
                value={manualDate}
                onChangeText={setManualDate}
                mode='outlined'
                placeholder='1900-01-01'
              />
              <Divider style={{marginVertical: 4}}/>
              <Button
                mode='contained'
                onPress={handleManualSave}
                buttonColor='#4caf50'
                icon='content-save'
              >
                저장
              </Button>
            </Card.Content>
          </Card> 
        )}
        

        {/* 보스 클리어 목록 테이블 */}
        <Card style={styles.card}>
          <Card.Title title="보스 클리어 목록" subtitle="최신 기록이 맨 위에 표시됩니다."/>
          <Card.Content>
            <DataTable>
              <DataTable.Header>
                <DataTable.Title style={{flex: 1.2}}>캐릭터</DataTable.Title>
                <DataTable.Title style={{flex: 2}}>보스 (난이도)</DataTable.Title>
                <DataTable.Title numeric style={{flex: 1.2}}>클리어 시간</DataTable.Title>
                <DataTable.Title numeric style={{flex: 1.5}}>날짜</DataTable.Title>
                <DataTable.Title numeric style={styles.deleteHeader}>관리</DataTable.Title>
              </DataTable.Header>

              {tempRecords.map((item)=>(
                <DataTable.Row key={item.id}>
                  <DataTable.Cell style={{flex: 1.2}}>{item.characterName}</DataTable.Cell>
                  <DataTable.Cell style={{flex: 2}}>{`${item.bossName} (${item.difficulty})`}</DataTable.Cell>
                  <DataTable.Cell numeric style={{flex: 1.2}}>{item.clearTime}</DataTable.Cell>
                  <DataTable.Cell numeric style={{flex: 1.5}}>{item.createdAt}</DataTable.Cell>
                  <DataTable.Cell numeric style={styles.deleteCell}>
                    <IconButton
                      icon="delete-outline"
                      iconColor="#ff4d4d"
                      size={20}
                      onPress={()=> handleDeleteTempRecord(item.id)}
                      style={styles.deleteIconBtn}
                    />
                  </DataTable.Cell>
                </DataTable.Row>
              ))}

              {tempRecords.length === 0 && (
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
  tabWrapper:{
    marginBottom: 16,
    backgroundColor: 'transparent'
  },
  segmentedTab:{
    backgroundColor: '#fff',
    borderRadius: 8
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12
  },
  timeSeparator:{
    fontSize: 24,
    fontWeight: 'bold',
    color: '#666'
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
    borderRadius: 12,
    elevation: 4,
    marginBottom: 16,
    overflow: 'hidden'  
  },
  timeContent:{
    alignItems: 'center',
    paddingVertical: 40
  },
  timerText: { 
    fontSize: 52, 
    fontWeight: 'bold', 
    color: '#fff',
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace'
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
  singlePickerBtn:{
    width: '100%',
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#ccc',
    marginTop: 4
  },
  deleteBtn: {
    flex: 1,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#ff4d4d'
  },
  pickerBtnContent: {
    height: 48,
    flexDirection: 'row',
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
    width: '100%',
    backgroundColor: 'transparent'
  },
  fullBtn: {
    flex: 1,
    borderRadius: 0,
    height: 52,
    justifyContent: 'center'
  },
  resetBtn: {
    backgroundColor: '#424242'
  },
  btnLabel: {
    fontSize: 15,
    fontWeight: 'bold',
    marginVertical: 0
  },
  emptyText: {
    textAlign: 'center',
    color: '#999',
    marginVertical: 30,
    fontSize: 14
  },

  // 보스 클리어 목록 - 관리 컬럼 스타일
  deleteHeader: {
    flex: 0.8,
    justifyContent: 'center',
    paddingRight: 0
  },
  deleteCell: {
    flex: 0.8,
    justifyContent: 'center',
    paddingRight: 0
  },
  deleteIconBtn: {
    margin: 0,
    padding: 0
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
  fullWidthPickerBtn:{
    width: '100%',
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#ccc',
    backgroundColor: '#fff'
  },
  pickerBtnContentExpanded: {
    height: 48,
    flexDirection: 'row',
    justifyContent: 'center',
    paddingHorizontal: 4
  },
  activeMenuItemText: {
    fontWeight: 'bold',
    color: '#2196f3'
  },
  cardDivider:{
    marginTop: 8,
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
