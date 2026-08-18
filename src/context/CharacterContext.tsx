import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, ReactNode, useContext, useEffect, useMemo, useState } from "react";
import uuid from 'react-native-uuid';
import { Character, ExportedData } from "../types/types";


interface CharacterContextType{
    /* 캐릭터 데이터 */
    characters: Character[];
    characterMap: Map<string, Character>; // key: Character.id, value: Character
    selectedCharacter: Character | null;
    setSelectedCharacter: React.Dispatch<React.SetStateAction<Character | null>>;
    
    /* 캐릭터 관리 기능 */
    addCharacter: (name: string) => Promise<{ success: boolean; error?: string }>;
    deleteCharacterOnly: (id: string, name: string) => Promise<void>;
    updateChracter: (id: string, name: string, newName: string) => Promise<{success: boolean; error?: string}>;

    /* JSON 데이터 기반 캐릭터 및 보스 클리어 기록 가져오기 */
    importCharacters: (exportedData: ExportedData) => Promise<number>;
}

const CharacterContext = createContext<CharacterContextType | undefined>(undefined);

const CHARACTERS_STORAGE_KEY = '@boss_clear_characters_list';

export function CharacterProvider({ children }: { children: ReactNode }){
    const [characters, setCharacters] = useState<Character[]>([]);
    const [selectedCharacter, setSelectedCharacter] = useState<Character | null>(characters[0] || null);
    
    // 앱 구동시 로컬 저장소에서 영속 데이터 로드
    useEffect(()=>{
        const loadInitialCharacters = async ()=>{
            try{
                // 1. 캐릭터 로드
                const storedChars = await AsyncStorage.getItem(CHARACTERS_STORAGE_KEY);
                let currentChars: Character[] = [];

                if(storedChars){
                    currentChars = JSON.parse(storedChars);
                    setCharacters(currentChars);
                }else{
                    // 최초 실행시 기본 캐릭터 세팅 및 저장
                    const defaultCharacter = createCharacter("캐릭터1");
                    const defaultChars: Character[] = [defaultCharacter];
                    currentChars = defaultChars;
                    setCharacters(defaultChars);
                    await AsyncStorage.setItem(CHARACTERS_STORAGE_KEY, JSON.stringify(defaultChars));
                }

                // 앱 로드시 첫번째 캐릭터 자동선택
                if(currentChars.length > 0){
                    setSelectedCharacter(currentChars[0]);
                }
            }catch(error){
                console.error("Failed to load records from AsyncStorage", error);
            }
        };
        loadInitialCharacters();
    }, []);

    const characterMap = useMemo(()=>{
        return new Map<string, Character>(
            characters.map((c)=>[c.id, c])
        );
    }, [characters]);

    const createCharacter = (chracterName: string): Character=>{
        return {
            id: uuid.v4(),
            name: chracterName,
            createdAt: new Date()
        };
    }

    // 캐릭터 추가 공통 로직
    const addCharacter = async (name: string)=>{
        const trimmedName = name.trim();
        if(!trimmedName){
            return {
                success: false,
                error: "캐릭터 이름을 입력해주세요."
            };
        }

        const newChar: Character = createCharacter(trimmedName);

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
    const deleteCharacterOnly = async (id: string, name: string) => {
        const filteredChracters = characters.filter(char => char.id !== id);
        setCharacters(filteredChracters);

        // 로컬 스토리지 실시간 동기화
        await AsyncStorage.setItem(CHARACTERS_STORAGE_KEY, JSON.stringify(filteredChracters));

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

        // 캐릭터 목록 이름 업데이트
        const updatedChars = characters.map(char => char.id === id ? {...char, name: trimmedName} : char);
        setCharacters(updatedChars);
        await AsyncStorage.setItem(CHARACTERS_STORAGE_KEY, JSON.stringify(updatedChars));

        // 현재 선택된 캐릭터의 이름이 바뀐 경우 상태 동기화
        if(selectedCharacter?.id === id){
            setSelectedCharacter({
                ...selectedCharacter,
                name: trimmedName
            });
        }
        
        return {
            success: true
        }
    }

    const importCharacters = async (exportedData: ExportedData): Promise<number> => {
        const map = new Map<string, Character>();

        // 기존 캐릭터 맵에 추가하기
        characters.forEach((c)=>{
            if(c.id){
               map.set(c.id, c); 
            }
        });

        // 가져오는 캐릭터를 맵에 추가하기
        exportedData.characters.forEach((c)=>{
            if(c.id){
                map.set(c.id, c);
            }
        });


        // 병하된 결과를 배열로 변환
        const totalCharacters = Array.from(map.values());
        setCharacters(totalCharacters);

        // 기존에 선택된 캐릭터가 덮어씌워졌다면, 최신 객체로 업데이트하고
        // 선택된 캐릭터가 없거나 삭제되었다면 0번째 캐릭터로 설정
        if(selectedCharacter && map.has(selectedCharacter.id)){
            setSelectedCharacter(map.get(selectedCharacter.id)!);
        }else if(totalCharacters.length > 0){
            setSelectedCharacter(totalCharacters[0]);
        }

        // 로컬 스토리지에 저장
        await AsyncStorage.setItem(CHARACTERS_STORAGE_KEY, JSON.stringify(totalCharacters));
        return exportedData.characters.filter((c)=>!!c.id).length;
    }

    return (
        <CharacterContext.Provider value={{
            characters,
            characterMap,
            selectedCharacter,
            setSelectedCharacter,
            addCharacter,
            deleteCharacterOnly,
            updateChracter,
            importCharacters
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