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

    /* 보스 난이도 메모라이즈 기능 */
    bossDifficultyMap: Record<string, string>; // 예: {"스우": "Hard", "루시드": "Hard"}
    updateBossDifficulty: (bossName: string, difficulty: string)=> Promise<void>;

    /* JSON 데이터 기반 보스 클리어 기록 가져오기 */
    importPersistentRecords: (records: BossRecord[]) => Promise<{success: boolean; count: number; error?: string}>;
}

const CharacterContext = createContext<CharacterContextType | undefined>(undefined);

const CHARACTERS_STORAGE_KEY = '@boss_clear_characters_list';
const RECORD_STORAGE_KEY = '@boss_clear_persistent_records';
const BOSS_DIFF_MAP_KEY = '@boss_difficulty_memorize_map';

export function CharacterProvider({ children }: { children: ReactNode }){
    const [characters, setCharacters] = useState<Character[]>([
        {id: '1', name: '캐릭터1'}
    ]);
    const [selectedCharacter, setSelectedCharacter] = useState<Character | null>(characters[0] || null);
    const [tempRecords, setTempRecords] = useState<BossRecord[]>([]);
    const [persistentRecords, setPersistentRecords] = useState<BossRecord[]>([]);
    const [bossDifficultyMap, setBossDifficultyMap] = useState<Record<string, string>>({});
    
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

                // 3. 보스별 최근 난이도 선택 맵 로드
                const storedMap = await AsyncStorage.getItem(BOSS_DIFF_MAP_KEY);
                if(storedMap){
                    setBossDifficultyMap(JSON.parse(storedMap));
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

    // 보스 난이도 선택 메모라이즈 업데이트 기능
    const updateBossDifficulty = async (bossName: string, difficulty: string)=>{
        try{
            const updatedBossDifficultyMap = {
            ...bossDifficultyMap,
            [bossName]: difficulty
            };
            setBossDifficultyMap(updatedBossDifficultyMap);
            await AsyncStorage.setItem(BOSS_DIFF_MAP_KEY, JSON.stringify(updatedBossDifficultyMap));
        }catch(error){
            console.error("Failed to save boss difficulty map", error);
        }
    };

    const importPersistentRecords = async (incomingRecords: BossRecord[])=>{
        try{
            // 데이터 무결성 검증 (배열 형태 확인)
            if(!Array.isArray(incomingRecords)){
                return {
                    success: false,
                    count: 0,
                    error: "올바른 JSON 데이터 형식이 아닙니다. (배열이 아님)"
                };
            }
            
            // 기존 보스 클리어 기록들을 ID 기반의 Map 구조로 변환
            const recordMap = new Map<string, BossRecord>();
            persistentRecords.forEach(r=>{
                if(r.id){
                    recordMap.set(r.id, r);
                }
            });

            let importedCount = 0;
            // 가져온 데이터들을 순회하며 병합(중복 ID는 덮어쓰고, 새로운 ID는 추가)
            incomingRecords.forEach(incoming=>{
                if(incoming.id && incoming.bossName && incoming.characterName){
                    recordMap.set(incoming.id, incoming);
                    importedCount++;
                }
            });

            // Map을 다시 배열로 변환하고 최신 날짜 순(createdAt 내림차순)으로 정렬
            const mergedRecords = Array.from(recordMap.values())
                                        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
            // 상태 업데이트 및 스토리지 영속화
            setPersistentRecords(mergedRecords);
            await AsyncStorage.setItem(RECORD_STORAGE_KEY, JSON.stringify(mergedRecords));
            // success, count json 데이터 리턴
            return {
                success: true,
                content: importedCount
            };
        }catch(error){
            console.error("Failed to import persistent records", error);
            return {
                success: false,
                count : 0,
                error : "데이터 동기화 중 오류가 발생했습니다."
            };
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
            deleteFromPersistent,
            bossDifficultyMap,
            updateBossDifficulty,
            importPersistentRecords
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