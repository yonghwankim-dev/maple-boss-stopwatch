import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, ReactNode, useContext, useEffect, useState } from "react";
import { BossRecord, Character } from "../types/boss";


interface CharacterContextType{
    characters: Character[];
    selectedCharacter: Character | null;
    setSelectedCharacter: React.Dispatch<React.SetStateAction<Character | null>>;
    tempRecords: BossRecord[]; // 스톱워치 화면 전용 임시 데이터
    setTempRecords: React.Dispatch<React.SetStateAction<BossRecord[]>>;
    persistentRecords: BossRecord[]; // 통계 및 히스토리 전용 영속적 데이터
    addCharacter: (name: string) => { success: boolean; error?: string };
    deleteCharacter: (id: string, name: string) => void;
    updateChracter: (id: string, name: string, newName: string) => {success: boolean; error?: string};
    saveToPersistent: (record: BossRecord) => Promise<void>;
    deleteFromPersistent: (id: string) => Promise<void>;
}

const CharacterContext = createContext<CharacterContextType | undefined>(undefined);

const STORAGE_KEY = '@boss_clear_persistent_records';

export function CharacterProvider({ children }: { children: ReactNode }){
    const [characters, setCharacters] = useState<Character[]>([
        {id: '1', name: '캐릭터1'}
    ]);
    const [selectedCharacter, setSelectedCharacter] = useState<Character | null>(characters[0] || null);
    const [tempRecords, setTempRecords] = useState<BossRecord[]>([]);
    const [persistentRecords, setPersistentRecords] = useState<BossRecord[]>([]);

    // 앱 구동시 로컬 저장소에서 영속 데이터 로드
    useEffect(()=>{
        const loadPersistentRecords = async ()=>{
            try{
                const storedData = await AsyncStorage.getItem(STORAGE_KEY);
                if(storedData){
                    setPersistentRecords(JSON.parse(storedData));
                }
            }catch(error){
                console.error("Failed to load records from AsyncStorage", error);
            }
        };
        loadPersistentRecords();
    }, []);

    // 영속 데이터 추가
    const saveToPersistent = async (record: BossRecord)=>{
        try{
            const updated = [record, ...persistentRecords];
            setPersistentRecords(updated);
            await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated));

            // TODO: 추후 Firebase Firestore 연동시 여기에 추가
        }catch(error){
            console.error("Failed to save record persistently", error);
        }
    };

    // 영속 데이터 삭제
    const deleteFromPersistent = async (id: string)=>{
        try{
            const updated = persistentRecords.filter(r=>r.id !== id);
            setPersistentRecords(updated);
            await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
        }catch(error){
            console.error("Failed to delete persistent record", error);
        }
    };
    

    // 캐릭터 추가 공통 로직
    const addCharacter = (name: string)=>{
        const trimmedName = name.trim();
        if(!trimmedName){
            return {
                success: false,
                error: "캐릭터 이름을 입력해주세요."
            };
        }
        if(characters.some(char => char.name === trimmedName)){
            return {
                success: false,
                error: "이미 등록된 캐릭터 이름입니다."
            };
        }

        const newChar: Character = {
            id: Math.random().toString(32).substring(2, 9),
            name: trimmedName
        };
        setCharacters(prev=>[...prev, newChar]);
        if(!selectedCharacter){
            setSelectedCharacter(newChar);
        }
        return {
            success: true
        };
    }

    // 캐릭터 삭제 공통 로직
    const deleteCharacter = (id: string, name: string) => {
        const filteredChracters = characters.filter(char => char.id !== id);
        setCharacters(filteredChracters);

        // 연관 보스 클리어 기록 삭제
        setTempRecords(prev=>prev.filter(record=>record.characterName !== name));

        // 선택된 캐릭터 예외 처리
        if(selectedCharacter?.id === id){
            setSelectedCharacter(filteredChracters[0] || null);
        }
    };

    // 캐릭터 정보 수정
    const updateChracter = (id: string, oldName: string, newName: string) =>{
        const trimmedName = newName.trim();

        // 유효성 검사
        if(!trimmedName){
            return {
                success: false,
                error: "캐릭터 이름을 입력해주세요"
            };
        }

        // 본인 이름이 아닌데 다른 캐릭터와 중복되는 경우 검사
        if(characters.some(char => char.id !== id && char.name === trimmedName)){
            return {
                success: false,
                error: "이미 등록된 캐릭터 이름입니다."
            };
        }

        // 캐릭터 목록 이름 업데이트
        setCharacters(prev => prev.map(char => char.id === id ? {...char, name: trimmedName} : char));

        // 연관된 보스 클리어 기록의 캐릭터 이름도 함께 동기화 업데이트
        setTempRecords(prev => prev.map(record => record.characterName === oldName ? {...record, characterName: trimmedName} : record));

        // 현재 선택된 캐리겉의 이름이 바뀐 경우 상태 동기화
        if(selectedCharacter?.id === id){
            setSelectedCharacter({id, name: trimmedName});
        }
        
        return {
            success: true
        }
    }

    return (
        <CharacterContext.Provider value={{
            characters,
            selectedCharacter,
            setSelectedCharacter,
            tempRecords,
            setTempRecords,
            persistentRecords,
            addCharacter,
            deleteCharacter,
            updateChracter,
            saveToPersistent,
            deleteFromPersistent
        }}>
            {children}
        </CharacterContext.Provider>
    )
    
    
}

export function useCharacter(){
    const context = useContext(CharacterContext);
    if(!context){
        throw new Error("useCharacter must be used within a CharacterProvider");
    }
    return context;
}