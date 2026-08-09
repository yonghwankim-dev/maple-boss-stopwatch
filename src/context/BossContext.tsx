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
    const [selectedBossName, setSelectedBossName] = useState<string>('스우');
    const [selectedBossDifficulty, setSelectedDifficulty] = useState<string>(BOSS_DATA['스우'][0]);

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