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
    let onPress = start;
    let icon = "play";
    let buttonColor = "#4caf50";
    let buttonTitle = "시작";
    if(isRunning){
        onPress = pause;
        icon = "pause";
        buttonColor = "#ff4d4d";
        buttonTitle = "일시정지"
    }
    return (
        <Button
            mode="contained"
            onPress={onPress}
            style={styles.fullBtn}
            labelStyle={styles.btnLabel}
            icon={icon}
            buttonColor={buttonColor}
        >
            {buttonTitle}
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