import { createContext, ReactNode, useContext, useState } from "react";
import { BossRecord, Character } from "../types/boss";


interface CharacterContextType{
    characters: Character[];
    selectedCharacter: Character | null;
    setSelectedCharacter: React.Dispatch<React.SetStateAction<Character | null>>;
    records: BossRecord[];
    setRecords: React.Dispatch<React.SetStateAction<BossRecord[]>>;
    addCharacter: (name: string) => { success: boolean; error?: string };
    deleteCharacter: (id: string, name: string) => void;
    updateChracter: (id: string, name: string, newName: string) => {success: boolean; error?: string};
}

const CharacterContext = createContext<CharacterContextType | undefined>(undefined);

export function CharacterProvider({ children }: { children: ReactNode }){
    const [characters, setCharacters] = useState<Character[]>([
        {id: '1', name: '제빛제로'},
        {id: '2', name: '제빛보마'}
    ]);
    const [selectedCharacter, setSelectedCharacter] = useState<Character | null>(characters[0] || null);
    const [records, setRecords] = useState<BossRecord[]>([]);

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
        setRecords(prev=>prev.filter(record=>record.characterName !== name));

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
        setRecords(prev => prev.map(record => record.characterName === oldName ? {...record, characterName: trimmedName} : record));

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
            records,
            setRecords,
            addCharacter,
            deleteCharacter,
            updateChracter
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