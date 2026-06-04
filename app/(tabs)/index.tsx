import { Platform, StyleSheet, Text } from 'react-native';
import { Button, Card } from 'react-native-paper';

import { View } from '@/components/Themed';
import { useStopwatch } from '@/src/hooks/useStopwatch';


export default function StopwatchScreen() {
  const {time, isRunning, start, pause, reset, complete } = useStopwatch();

  const formatTime = (seconds: number) =>{
    const mins = Math.floor(seconds / 60).toString().padStart(2, '0');
    const secs = (seconds % 60).toString().padStart(2, '0');
    return `${mins}분:${secs}초`;
  }

  const handleReset = ()=>{
    const message = "시간을 초기화하시겠습니까?";
    if(Platform.OS === 'web'){
      if(window.confirm(message)){
        reset();
      }
    }else{
      reset();
    }
  };

  const handleComplete = ()=>{
    const finalTime = complete();
    console.log("측정 완료된 시간(초):", finalTime);
    // TODO: 다음 단계에서 캐릭터 정보와 보스 데이터를 조합해 테이블 리스트에 추가하는 로직 구현
  }

  return (
    <View style={styles.container}>
      <Card style={styles.timeCard}>
        <Card.Content style={styles.timeContent}>
          {/* 타이머 디스플레이 영역 */}
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
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex:1, 
    backgroundColor: '#f5f5f5',
    justifyContent: 'center', 
    padding: 16
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
    fontSize: 56, 
    fontWeight: 'bold', 
    color: '#fff',
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    marginBottom: 32
  },
  buttonRow: { 
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    gap: 8
  },
  btn: {
    flex: 1
  }
});
