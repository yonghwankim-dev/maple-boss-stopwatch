import { BOSS_DATA } from "@/constants/bossData";
import { createContext, ReactNode, useContext, useState } from "react";

interface BossContextType{
    selectedBossName: string | null;
    setSelectedBossName: React.Dispatch<React.SetStateAction<string | null>>;
    selectedBossDifficulty: string | null;
    setSelectedDifficulty: React.Dispatch<React.SetStateAction<string | null>>;

}

const BossContext = createContext<BossContextType | undefined>(undefined);

export function BossProvider({children} : {children: ReactNode}){
    const [selectedBossName, setSelectedBossName] = useState<string | null>('스우');
    const [selectedBossDifficulty, setSelectedDifficulty] = useState<string | null>(BOSS_DATA['스우'][0]);

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