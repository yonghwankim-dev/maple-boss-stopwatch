import { StyleSheet } from "react-native";
import { Button } from "react-native-paper";


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
            style={styles.fullBtn}
            labelStyle={styles.btnLabel}
            icon="check-bold"
            disabled={!isRunning}
            buttonColor={isRunning ? '#2196f3' : '#b0bec5'}
        >
            완료
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