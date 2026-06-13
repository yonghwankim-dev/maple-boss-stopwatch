import { Button } from "react-native-paper";
import { stopwatchButtonStyle } from "../styles/stopwatchButtonStyle";


interface StopwatchCompleteButtonProps{
    isRunning: boolean;
    handleComplete: ()=>void;
}

export default function StopwatchCompleteButton({
    isRunning,
    handleComplete
}: StopwatchCompleteButtonProps){
    return (
        <Button
            mode="contained"
            onPress={handleComplete}
            style={stopwatchButtonStyle.fullBtn}
            labelStyle={stopwatchButtonStyle.btnLabel}
            icon="check-bold"
            disabled={!isRunning}
            buttonColor={isRunning ? '#2196f3' : '#b0bec5'}
        >
            완료
        </Button>
    );
}