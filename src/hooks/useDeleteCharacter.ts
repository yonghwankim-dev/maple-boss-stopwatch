import { useBossRecord } from "../context/BossRecordContext";
import { useCharacter } from "../context/CharacterContext";

export const useDeleteCharacter = ()=>{
    const {deleteCharacterOnly} = useCharacter();
    const {deleteBossRecords} = useBossRecord();

    const deleteCharacter = async(characterId: string, name: string)=>{
        try{
            // 보스 기록 삭제
            await deleteBossRecords(characterId);
            // 캐릭터 삭제
            await deleteCharacterOnly(characterId, name);
        }catch(error){
            console.error(`Failed to completely delete character ${name}`, error)
        }
    }
    return {deleteCharacter}

};