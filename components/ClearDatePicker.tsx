import { formatDate } from "@/src/utils/timeFormatter";
import { useCallback, useState } from "react";
import { Pressable } from "react-native";
import { TextInput } from "react-native-paper";
import { DatePickerModal, ko, registerTranslation } from 'react-native-paper-dates';
import { View } from "./Themed";

registerTranslation("ko", ko);

interface ClearDatePickerProps {
    date: Date,
    setDate: (date: Date)=>void;
}

export const ClearDatePicker: React.FC<ClearDatePickerProps> = ({date, setDate})=>{
    const [open, setOpen] = useState<boolean>(false);

    const onDismiss = useCallback(()=>{
        setOpen(false);
    }, [setOpen]);

    const onConfirm = useCallback((params: {date: Date | undefined})=>{
        setOpen(false);
        if(params.date){
            setDate(params.date);
        }
    }, [setOpen, setDate]);

    return (
        <View style={{ marginVertical: 8 }}>
            {/* TextInput을 클릭하면 캘린더를 표시하도록 함 */}
            <Pressable onPress={()=>setOpen(true)}>
                <View pointerEvents="none">
                    <TextInput
                        label="클리어 날짜"
                        value={formatDate(date)}
                        mode="outlined"
                        right={<TextInput.Icon icon="calendar" onPress={()=>setOpen(true)}/>}
                        editable={false} // 키도브 입력 방지
                    >
                    </TextInput>
                </View>
            </Pressable>
            {/* Web / iOS / Andriod 공용 달력 모달 */}
            <DatePickerModal
                locale="ko"
                mode="single"
                visible={open}
                onDismiss={onDismiss}
                date={date}
                onConfirm={onConfirm}
                label="날짜 선택"
            />

        </View>

    )
}