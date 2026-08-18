import { Alert, Platform, ScrollView, StyleSheet, Text } from 'react-native';
import { Button, Card, DataTable, Divider, IconButton, Provider, SegmentedButtons, TextInput } from 'react-native-paper';

import { BossSelectorCard } from '@/components/BossSelectorCard';
import { CharacterSelectorCard } from '@/components/CharacterSelectorCard';
import { ClearDatePicker } from '@/components/ClearDatePicker';
import { View } from '@/components/Themed';
import StopwatchButtons from '@/src/components/StopwatchButtons';
import { useBoss } from '@/src/context/BossContext';
import { useBossRecord } from '@/src/context/BossRecordContext';
import { useCharacter } from '@/src/context/CharacterContext';
import { useStopwatch } from '@/src/hooks/useStopwatch';
import { BossRecord, createBossRecord } from '@/src/models/BossRecord';
import { formatDate, formatTime } from '@/src/utils/timeFormatter';
import { useState } from 'react';

export default function StopwatchScreen() {
  const { time, isRunning, start, pause, reset, complete } = useStopwatch();
  const { characters, characterMap, selectedCharacter, setSelectedCharacter } = useCharacter();
  const { tempRecords, setTempRecords, saveBossRecord } = useBossRecord();
    
  // 보스 및 난이도 상태 관리
  const {
      selectedBossName, 
      selectedBossDifficulty, 
      handleBossChange, 
      handleBossDifficultyChange, 
      isSelectedBoss, 
      isSelectedBossDifficulty, 
      getCurrentSelectedBossDifficulties,
      formatCurrentBossTarget
  } = useBoss();

  // 기록 방식 상태 관리 ('timer': 스톱워치, 'manual': 직접입력)
  const [recordMode, setRecordMode] = useState<'timer' | 'manual'>('timer');

  // 입력모드 타입 : ELAPSED=소모시간, REMAINING=남은시간
  type InputMode = 'ELAPSED' | 'REMAINING';

  // 컴포넌트 내부 상태
  const [inputMode, setInputMode] = useState<InputMode>('ELAPSED'); // 기본값: 소모시간 입력방식
  
  // 소모 시간 직접 입력 폼 전용 상태 관리  
  const [manualMinutes, setManualMinutes] = useState<string>('');
  const [manualSeconds, setManualSeconds] = useState<string>('');
  const [manualDate, setManualDate] = useState<Date>(new Date());

  // 남은 시간 직접 입력 폼 전용 상태 관리
  const limitSeconds = 1200;

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

    let elapsedSeconds = complete();

    const newRecord: BossRecord = createBossRecord({
      characterId: selectedCharacter.id,
      bossName: selectedBossName,
      difficulty: selectedBossDifficulty,
      clearTimeSec: elapsedSeconds,
      clearDate: formatDate(manualDate),
    });

    setTempRecords((prev)=>[newRecord, ...prev]);

    await saveBossRecord(newRecord);
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

    let totalSeconds = 0;
    if(inputMode === 'ELAPSED'){
      totalSeconds = mins * 60 + secs;
    }else if(inputMode === 'REMAINING'){
      totalSeconds = limitSeconds - ((mins * 60) + secs);
    }

    const newRecord: BossRecord = createBossRecord({
      characterId: selectedCharacter.id,
      bossName: selectedBossName,
      difficulty: selectedBossDifficulty,
      clearTimeSec: totalSeconds,
      clearDate: formatDate(manualDate),
    });

    setTempRecords((prev)=>[newRecord, ...prev]);
    await saveBossRecord(newRecord);

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
        <CharacterSelectorCard
          characters={characters}
          selectedCharacter={selectedCharacter}
          setSelectedCharacter={setSelectedCharacter}
        />

        {/* 보스 및 난이도 설정 카드 */}
        <BossSelectorCard
          handleBossChange={handleBossChange}
          handleBossDifficultyChange={handleBossDifficultyChange}
          isSelectedBoss={isSelectedBoss}
          isSelectedBossDifficulty={isSelectedBossDifficulty}
          getCurrentSelectedBossDifficulties={getCurrentSelectedBossDifficulties}
          formatCurrentBossTarget={formatCurrentBossTarget}
        />
        
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
              <StopwatchButtons 
                isRunning={isRunning}
                start={start}
                pause={pause}
                reset={reset}
                handleComplete={handleComplete}
              />
            </Card.Content>
          </Card>

        ) : (
          /* 수동 기록 입력 영역 */
          <Card style={styles.card}>
            <Card.Title title="직접 기록 입력" subtitle={
              inputMode === 'ELAPSED'
                ? '클리어에 소모된 시간을 입력합니다.'
                : '남은 시간을 입력하면 소모 시간을 자동 계산합니다.'
            }/>
            <Card.Content style={{gap: 16}}>
              {/* 입력 방식 선택 스우치 */}
              <SegmentedButtons
                value={inputMode}
                onValueChange={(val)=>setInputMode(val as InputMode)}
                buttons={[
                  {value: 'ELAPSED', label: '소모 시간 입력'},
                  {value: 'REMAINING', label: '남은 시간 입력'}
                ]}
              />
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

              <ClearDatePicker
                date={manualDate}
                setDate={setManualDate}
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
                  <DataTable.Cell style={{flex: 1.2}}>{characterMap.get(item.characterId)?.name}</DataTable.Cell>
                  <DataTable.Cell style={{flex: 2}}>{`${item.bossName} (${item.difficulty})`}</DataTable.Cell>
                  <DataTable.Cell numeric style={{flex: 1.2}}>{formatTime(item.clearTimeSec)}</DataTable.Cell>
                  <DataTable.Cell numeric style={{flex: 1.5}}>{item.clearDate}</DataTable.Cell>
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
});
