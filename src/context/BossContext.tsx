import { BOSS_DATA } from "@/constants/bossData";
import { createContext, ReactNode, useContext, useState } from "react";

interface BossContextType{
    selectedBossName: string;
    setSelectedBossName: React.Dispatch<React.SetStateAction<string>>;
    selectedBossDifficulty: string;
    setSelectedDifficulty: React.Dispatch<React.SetStateAction<string>>;

}

const BossContext = createContext<BossContextType | undefined>(undefined);

export function BossProvider({children} : {children: ReactNode}){
    const firstBossName = Object.keys(BOSS_DATA)[0];
    const firstBossDfficulties = BOSS_DATA[firstBossName];
    const [selectedBossName, setSelectedBossName] = useState<string>(firstBossName);
    const [selectedBossDifficulty, setSelectedDifficulty] = useState<string>(firstBossDfficulties[0]);

    return (
        <BossContext.Provider
            value={{
                selectedBossName,
                setSelectedBossName,
                selectedBossDifficulty,
                setSelectedDifficulty
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