import { StyleSheet, View } from "react-native";
import { Button } from "react-native-paper";
import StopwatchResetButton from "./StopwatchResetButton";
import StopwatchStartButton from "./StopwatchStartButton";

interface StopwatchButtonsProps{
    isRunning: boolean;
    start: () => void;
    pause: () => void;
    handleReset: () => void;
    handleComplete: () => void;
}

export default function StopwatchButtons({
    isRunning,
    start,
    pause,
    handleReset,
    handleComplete,
}: StopwatchButtonsProps){
    return (
        /* 스톱워치 버튼 영역 */
        <View style={styles.buttonRow}>
            <StopwatchStartButton
                isRunning={isRunning}
                start={start}
                pause={pause}
            />

            <StopwatchResetButton
                handleReset={handleReset}
            />

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
    );
}

const styles = StyleSheet.create({
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
    }
});