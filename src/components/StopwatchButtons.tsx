import { StyleSheet, View } from "react-native";
import StopwatchCompleteButton from "./StopwatchCompleteButton";
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

            <StopwatchCompleteButton
                isRunning={isRunning}
                handleComplete={handleComplete}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    buttonRow: { 
        flexDirection: 'row',
        width: '100%',
        backgroundColor: 'transparent'
    }
});