import { Button } from "react-native-paper";
import { StopwatchButtonStyle } from "../styles/stopwatchButtonStyle";


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
            style={StopwatchButtonStyle.fullBtn}
            labelStyle={StopwatchButtonStyle.btnLabel}
            icon={icon}
            buttonColor={buttonColor}
        >
            {buttonTitle}
        </Button>
    );
}