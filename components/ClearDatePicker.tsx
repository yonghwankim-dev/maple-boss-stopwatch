import { formatDate } from "@/src/utils/timeFormatter";
import DateTimePicker, { DateTimePickerChangeEvent } from '@react-native-community/datetimepicker';
import { useState } from "react";
import { Platform, Pressable } from "react-native";
import { Button, TextInput } from "react-native-paper";
import { View } from "./Themed";

export const ClearDatePicker = ()=>{
    const [manualDate, setManualDate] = useState<Date>(new Date());
    const [open, setOpen] = useState<boolean>(false);

    const onValueChange = (event: DateTimePickerChangeEvent, selectedDate?: Date)=>{
        if(Platform.OS === 'android'){
            setOpen(false);
        }
        if(selectedDate){
            setManualDate(selectedDate);
        }
    }

    return (
        <View style={{ marginVertical: 8 }}>
            {/* TextInput을 클릭하면 캘린더를 표시하도록 함 */}
            <Pressable onPress={()=>setOpen(true)}>
                <View pointerEvents="none">
                    <TextInput
                        label="클리어 날짜"
                        value={formatDate(manualDate)}
                        mode="outlined"
                        right={<TextInput.Icon icon="calendar" onPress={()=>setOpen(true)}/>}
                        editable={false} // 키도브 입력 방지
                    >
                    </TextInput>
                </View>
            </Pressable>

            {/* 캘린더 피커 컴포넌트 */}
            {open && (
                <DateTimePicker
                    value={manualDate}
                    mode="date"
                    display={Platform.OS === 'ios' ? 'inline' : 'default'} // IOS는 inline(달력 전체 노출) 또는 Spinner
                    onValueChange={onValueChange}
                />
            )}

            {/* IOS는 확인/닫기 버튼이 별도로 필요할 수 있음 */}
            {open && Platform.OS === 'ios' && (
                <Button
                    mode="contained"
                    onPress={()=> setOpen(false)}
                    style={{ marginTop: 8}}
                >
                    선택 완료
                </Button>
            )}

        </View>

    )
}