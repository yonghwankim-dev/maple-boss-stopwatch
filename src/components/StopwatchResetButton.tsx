import { Alert, Platform } from "react-native";
import { Button } from "react-native-paper";
import { StopwatchButtonStyle } from "../styles/StopwatchButtonStyle";


interface StopwatchResetButtonProps{
    reset: ()=>void;
}

export default function StopwatchResetButton({
    reset
}: StopwatchResetButtonProps){

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

    return (
        <Button
            mode="contained"
            onPress={handleReset}
            style={[StopwatchButtonStyle.fullBtn, StopwatchButtonStyle.resetBtn]}
            labelStyle={StopwatchButtonStyle.btnLabel}
            icon="refresh"
        >
            초기화
        </Button>
    );
}