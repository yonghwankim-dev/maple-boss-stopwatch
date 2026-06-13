import { StyleSheet } from "react-native";
import { Button } from "react-native-paper";


interface StopwatchResetButtonProps{
    handleReset: ()=>void;
}

export default function StopwatchResetButton({
    handleReset
}: StopwatchResetButtonProps){
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