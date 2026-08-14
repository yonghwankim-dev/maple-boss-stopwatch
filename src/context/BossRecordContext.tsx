import AsyncStorage from "@react-native-async-storage/async-storage";
import { createContext, ReactNode, useContext, useEffect, useState } from "react";
import { BossRecord } from "../models/BossRecord";
import { ExportedData } from "../types/types";

interface BossRecordContextType{
    /* 보스 클리어 기록 데이터 */
    tempRecords: BossRecord[]; // 스톱워치 화면 전용 임시 데이터
    setTempRecords: React.Dispatch<React.SetStateAction<BossRecord[]>>;
        
    /* 보스 클리어 기록 데이터 관리 기능 */
    bossRecords: BossRecord[]; // 통계 및 히스토리 전용 영속적 데이터
    saveBossRecord: (record: BossRecord) => Promise<void>;
    deleteBossRecords: (characterId: string) => Promise<void>;

    /* 보스 데이터 가져오기 기능 */
    importBossRecords: (exportedData: ExportedData) => Promise<number>;
}

const BossRecordContext = createContext<BossRecordContextType | undefined>(undefined);
const RECORD_STORAGE_KEY = '@boss_clear_persistent_records';

export function BossRecordProvider({ children }: { children: ReactNode }){
    const [tempRecords, setTempRecords] = useState<BossRecord[]>([]);
    const [bossRecords, setBossRecords] = useState<BossRecord[]>([]);

    useEffect(()=>{
        const loadInitialBossRecords = async ()=>{
            try{
                // 2. 보스 클리어 기록 로드
                const storedData = await AsyncStorage.getItem(RECORD_STORAGE_KEY);
                if(storedData){
                    const currentBossRecords = JSON.parse(storedData);
                    setBossRecords(currentBossRecords);
                }
            }catch(error){
                console.error("Failed to load boss records from AsyncStorage", error);
            }
        }
        loadInitialBossRecords();
    }, []);

    // 보스 기록 데이터 저장
    const saveBossRecord = async (record: BossRecord): Promise<void>=>{
        try{
            const updated = [record, ...bossRecords];
            setBossRecords(updated);
            await AsyncStorage.setItem(RECORD_STORAGE_KEY, JSON.stringify(updated));
        }catch(error){
            console.error("Failed to save record persistently", error);
        }
    };

    // 영속 데이터 삭제
    const deleteBossRecords = async (characterId: string): Promise<void>=>{
        try{
            // 스톱워치 화면의 임시 보스 클리어 기록 삭제
            setTempRecords(prev=>prev.filter(record=>record.characterId !== characterId));

            // 영구 보스 클리어 기록 삭제
            const updated = bossRecords.filter(r=>r.id !== characterId);
            setBossRecords(updated);
            await AsyncStorage.setItem(RECORD_STORAGE_KEY, JSON.stringify(updated));
        }catch(error){
            console.error("Failed to delete persistent record", error);
        }
    };

    const importBossRecords = async (exportedData: ExportedData): Promise<number> =>{
        // 기존 보스 클리어 기록들을 ID 기반의 Map 구조로 변환
        const map = new Map<string, BossRecord>();

        // 기존 보스 클리어 기록들 추가
        bossRecords.forEach(r=>{
            if(r.id){
                map.set(r.id, r);
            }
        });

        let importedCount = 0;
        // 가져온 데이터들을 순회하며 병합(중복 ID는 덮어쓰고, 새로운 ID는 추가)
        exportedData.bossRecords.forEach(r=>{
            if(r.id){
                map.set(r.id, r);
                importedCount++;
            }
        });

        // Map을 다시 배열로 변환하고 최신 날짜 순(createdAt 내림차순)으로 정렬
        const records = Array.from(map.values())
                                    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        // 상태 업데이트 및 스토리지 영속화
        setBossRecords(records);
        await AsyncStorage.setItem(RECORD_STORAGE_KEY, JSON.stringify(records));
        return importedCount;
    }

    return ( 
        <BossRecordContext.Provider value={{
            tempRecords,
            setTempRecords,
            bossRecords,
            saveBossRecord,
            deleteBossRecords,
            importBossRecords
        }}>
            {children}
        </BossRecordContext.Provider>
    );
}

export function useBossRecord(){
    const context = useContext(BossRecordContext);
    if(!context){
        throw new Error("useBossRecord must be used within a BossRecordProvider");
    }
    return context;
}