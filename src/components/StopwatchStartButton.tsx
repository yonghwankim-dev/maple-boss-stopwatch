import { StyleSheet } from "react-native";
import { Button } from "react-native-paper";


interface StopwatchStartButtonProps{
    isRunning: boolean;
    start: ()=> void;
    pause: ()=> void;
}

export default function StopwatchStartButton({
    isRunning,
    start,
    pause,
}: StopwatchStartButtonProps){
    return (
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
    );
}

const styles = StyleSheet.create({
    fullBtn: {
        flex: 1,
        borderRadius: 0,
        height: 52,
        justifyContent: 'center'
    },
    btnLabel: {
        fontSize: 15,
        fontWeight: 'bold',
        marginVertical: 0
    }
});