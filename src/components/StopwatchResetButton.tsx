import { Alert, Platform, StyleSheet } from "react-native";
import { Button } from "react-native-paper";


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
            style={[styles.fullBtn, styles.resetBtn]}
            labelStyle={styles.btnLabel}
            icon="refresh"
        >
            초기화
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
    resetBtn: {
        backgroundColor: '#424242'
    },
    btnLabel: {
        fontSize: 15,
        fontWeight: 'bold',
        marginVertical: 0
    }
})