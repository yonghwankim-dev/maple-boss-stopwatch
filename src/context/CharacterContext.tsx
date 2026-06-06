import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, ReactNode, useContext, useEffect, useState } from "react";
import { BossRecord, Character } from "../types/boss";


interface CharacterContextType{
    /* 캐릭터 데이터 */
    characters: Character[];
    selectedCharacter: Character | null;
    setSelectedCharacter: React.Dispatch<React.SetStateAction<Character | null>>;
    
    /* 보스 클리어 기록 데이터 */
    tempRecords: BossRecord[]; // 스톱워치 화면 전용 임시 데이터
    setTempRecords: React.Dispatch<React.SetStateAction<BossRecord[]>>;
    /* 보스 클리어 기록 데이터 관리 기능 */
    persistentRecords: BossRecord[]; // 통계 및 히스토리 전용 영속적 데이터
    saveToPersistent: (record: BossRecord) => Promise<void>;
    deleteFromPersistent: (id: string) => Promise<void>;

    /* 캐릭터 관리 기능 */
    addCharacter: (name: string) => Promise<{ success: boolean; error?: string }>;
    deleteCharacter: (id: string, name: string) => Promise<void>;
    updateChracter: (id: string, name: string, newName: string) => Promise<{success: boolean; error?: string}>;
}

const CharacterContext = createContext<CharacterContextType | undefined>(undefined);

const CHARACTERS_STORAGE_KEY = '@boss_clear_characters_list';
const RECORD_STORAGE_KEY = '@boss_clear_persistent_records';

export function CharacterProvider({ children }: { children: ReactNode }){
    const [characters, setCharacters] = useState<Character[]>([
        {id: '1', name: '캐릭터1'}
    ]);
    const [selectedCharacter, setSelectedCharacter] = useState<Character | null>(characters[0] || null);
    const [tempRecords, setTempRecords] = useState<BossRecord[]>([]);
    const [persistentRecords, setPersistentRecords] = useState<BossRecord[]>([]);

    // 앱 구동시 로컬 저장소에서 영속 데이터 로드
    useEffect(()=>{
        const loadInitialStorageData = async ()=>{
            try{
                // 1. 캐릭터 로드
                const storedChars = await AsyncStorage.getItem(CHARACTERS_STORAGE_KEY);
                let currentChars: Character[] = [];

                if(storedChars){
                    currentChars = JSON.parse(storedChars);
                    setCharacters(currentChars);
                }else{
                    // 최초 실행시 기본 캐릭터 세팅 및 저장
                    const defaultChars: Character[] = [{id: '1', name: '캐릭터1'}];
                    currentChars = defaultChars;
                    setCharacters(defaultChars);
                    await AsyncStorage.setItem(CHARACTERS_STORAGE_KEY, JSON.stringify(defaultChars));
                }

                // 앱 로드시 첫번째 캐릭터 자동선택
                if(currentChars.length > 0){
                    setSelectedCharacter(currentChars[0]);
                }

                // 2. 보스 클리어 기록 로드
                const storedData = await AsyncStorage.getItem(RECORD_STORAGE_KEY);
                if(storedData){
                    setPersistentRecords(JSON.parse(storedData));
                }
            }catch(error){
                console.error("Failed to load records from AsyncStorage", error);
            }
        };
        loadInitialStorageData();
    }, []);

    // 영속 데이터 추가
    const saveToPersistent = async (record: BossRecord)=>{
        try{
            const updated = [record, ...persistentRecords];
            setPersistentRecords(updated);
            await AsyncStorage.setItem(RECORD_STORAGE_KEY, JSON.stringify(updated));

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
            await AsyncStorage.setItem(RECORD_STORAGE_KEY, JSON.stringify(updated));
        }catch(error){
            console.error("Failed to delete persistent record", error);
        }
    };
    

    // 캐릭터 추가 공통 로직
    const addCharacter = async (name: string)=>{
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

        const updatedChars = [...characters, newChar];
        setCharacters(updatedChars);
        await AsyncStorage.setItem(CHARACTERS_STORAGE_KEY, JSON.stringify(updatedChars))

        if(!selectedCharacter){
            setSelectedCharacter(newChar);
        }
        return {
            success: true
        };
    }

    // 캐릭터 삭제 공통 로직
    const deleteCharacter = async (id: string, name: string) => {
        const filteredChracters = characters.filter(char => char.id !== id);
        setCharacters(filteredChracters);

        // 로컬 스토리지 실시간 동기화
        await AsyncStorage.setItem(CHARACTERS_STORAGE_KEY, JSON.stringify(filteredChracters));

        // 연관 보스 클리어 기록 삭제
        setTempRecords(prev=>prev.filter(record=>record.characterName !== name));
        // 히스토리/통계에 사용되는 영속성 데이터 내에서도 해당 캐릭터 기록 일괄 삭제
        const filteredPersistentRecords = persistentRecords.filter(record=>record.characterName !== name);
        setPersistentRecords(filteredPersistentRecords);
        await AsyncStorage.setItem(RECORD_STORAGE_KEY, JSON.stringify(filteredPersistentRecords));

        // 선택된 캐릭터 예외 처리
        if(selectedCharacter?.id === id){
            setSelectedCharacter(filteredChracters[0] || null);
        }
    };

    // 캐릭터 정보 수정
    const updateChracter = async (id: string, oldName: string, newName: string) =>{
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
        const updatedChars = characters.map(char => char.id === id ? {...char, name: trimmedName} : char);
        setCharacters(updatedChars);
        await AsyncStorage.setItem(CHARACTERS_STORAGE_KEY, JSON.stringify(updatedChars));

        // 연관된 보스 클리어 기록의 캐릭터 이름도 함께 동기화 업데이트
        setTempRecords(prev => prev.map(record => record.characterName === oldName ? {...record, characterName: trimmedName} : record));

        // 통계/히스토리용 영속성 기록 내 캐릭터 이름도 일괄 동기화 및 스토리지 업데이트
        const updatedPersistentRecords = persistentRecords.map(record => record.characterName === oldName ? {...record, characterName: trimmedName} : record);
        setPersistentRecords(updatedPersistentRecords);
        await AsyncStorage.setItem(RECORD_STORAGE_KEY, JSON.stringify(updatedPersistentRecords));

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