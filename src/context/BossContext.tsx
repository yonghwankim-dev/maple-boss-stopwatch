import { BOSS_DATA } from "@/constants/bossData";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { createContext, ReactNode, useContext, useState } from "react";

interface BossContextType{
    selectedBossName: string;
    setSelectedBossName: React.Dispatch<React.SetStateAction<string>>;
    selectedBossDifficulty: string;
    handleBossChange: (selectedBoss: string) => void;
    handleBossDifficultyChange: (difficulty: string) => void;
}

const BossContext = createContext<BossContextType | undefined>(undefined);

const BOSS_DIFF_MAP_KEY = '@boss_difficulty_memorize_map';

export function BossProvider({children} : {children: ReactNode}){
    const firstBossName = Object.keys(BOSS_DATA)[0];
    const firstBossDfficulties = BOSS_DATA[firstBossName];
    const [selectedBossName, setSelectedBossName] = useState<string>(firstBossName);
    const [selectedBossDifficulty, setSelectedDifficulty] = useState<string>(firstBossDfficulties[0]);

    // 각 보스별로 사용자가 마지막으로 선택한 난이도를 기억할 상태맵
    const [bossDifficultyMap, setBossDifficultyMap] = useState<Record<string, string>>({
        [firstBossName]: firstBossDfficulties[0]
    });

    const handleBossChange = (boss: string)=>{
        // 선택된 보스 이름 상태 설정
        setSelectedBossName(boss);

        // 이전에 이 보스에서 선택했던 난이도가 있다면 불러오고, 없으면 첫 난이도로 지정
        const memorizeDifficulty = bossDifficultyMap[boss];
        // 선택된 보스의 이용 가능한 난이도 리스트 초기화
        const availableDifficulties = BOSS_DATA[boss];
        
        if(memorizeDifficulty && availableDifficulties.includes(memorizeDifficulty)){
            setSelectedDifficulty(memorizeDifficulty);
        }else{
            const firstDifficultyIndex = 0;
            const defaultDifficulty = availableDifficulties[firstDifficultyIndex];
            setSelectedDifficulty(defaultDifficulty);
        }
    }

    const handleBossDifficultyChange = (difficulty: string)=>{
        setSelectedDifficulty(difficulty);
        const updateMap = {
            ...bossDifficultyMap,
            [selectedBossName]: difficulty
        };

        setBossDifficultyMap(updateMap);

        try{
            AsyncStorage.setItem(BOSS_DIFF_MAP_KEY, JSON.stringify(updateMap));    
        }catch(error){
            console.error("AsyncStorage 저장 실패 : ", error);
        }        
    }

    return (
        <BossContext.Provider
            value={{
                selectedBossName,
                setSelectedBossName,
                selectedBossDifficulty,
                handleBossChange,
                handleBossDifficultyChange
            }}
        >
            {children}
        </BossContext.Provider>
    )
}

export function useBoss(){
    const context = useContext(BossContext);
    if(!context){
        throw new Error("useBoss must be used within a BossProvider");
    }
    return context;
}