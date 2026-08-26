import { createContext, ReactNode, useState } from "react";
import { Alert, Platform } from "react-native";
import { BossRecord, createBossRecord } from "../models/BossRecord";
import { Character } from "../types/types";
import { formatDate } from "../utils/timeFormatter";


interface StopwatchManualContextType{
    save: (selectedCharacter: Character, selectedBossName: string, selectedBossDifficulty: string)=>Promise<BossRecord | undefined>    
}

const StopwatchManualContext = createContext<StopwatchManualContextType | undefined>(undefined);

export function StopwatchManualProvider({ children }: { children: ReactNode }){
    const [manualMinutes, setManualMinutes] = useState<string>('');
    const [manualSeconds, setManualSeconds] = useState<string>('');
    const [manualDate, setManualDate] = useState<Date>(new Date());
    const limitSeconds = 1200;

    // 입력모드 타입 : ELAPSED=소모시간, REMAINING=남은시간
    type InputMode = 'ELAPSED' | 'REMAINING';

    // 컴포넌트 내부 상태
    const [inputMode, setInputMode] = useState<InputMode>('ELAPSED'); // 기본값: 소모시간 입력방식

    const save = async (selectedCharacter: Character, selectedBossName: string, selectedBossDifficulty: string)=>{
        const mins = parseInt(manualMinutes || '0', 10);
        const secs = parseInt(manualSeconds || '0', 10);
        if(mins == 0 && secs == 0){
            const message = "클리어 시간을 입력해주세요.";
            if(Platform.OS === 'web'){
                alert(message);
            }else{
                Alert.alert("입력 오류", message);
            }
            return;
        }

        if(secs >= 60){
            const message = "초는 59초 이하로 입력해주세요.";
            if(Platform.OS === 'web'){
                alert(message);
            }else{
                Alert.alert("입력 오류", message);
            }
            return;
        }
    
        let totalSeconds = 0;
        if(inputMode === 'ELAPSED'){
            totalSeconds = mins * 60 + secs;
        }else if(inputMode === 'REMAINING'){
            totalSeconds = limitSeconds - ((mins * 60) + secs);
        }
    
        const newRecord: BossRecord = createBossRecord({
            characterId: selectedCharacter.id,
            bossName: selectedBossName,
            difficulty: selectedBossDifficulty,
            clearTimeSec: totalSeconds,
            clearDate: formatDate(manualDate),
        });
        return newRecord;
    };

    return ( 
        <StopwatchManualContext.Provider value={{
            save   
        }}>
            {children}
        </StopwatchManualContext.Provider>
    );
}
