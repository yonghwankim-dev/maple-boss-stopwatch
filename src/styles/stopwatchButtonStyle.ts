import { StyleSheet } from "react-native";

export const stopwatchButtonStyle = StyleSheet.create({
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
    },
    resetBtn: {
        backgroundColor: '#424242'
    },
});