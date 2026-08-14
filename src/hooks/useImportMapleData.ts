import { useBossRecord } from "../context/BossRecordContext";
import { useCharacter } from "../context/CharacterContext";
import { ExportedData } from "../types/types";

export const useImportMapleData = ()=>{
    const { importCharacters } = useCharacter();
    const { importBossRecords } = useBossRecord();

    // 보스 기록 가져오기
    const importMapleData = async (exportedData: ExportedData): Promise<{success: boolean; importedCharacterCount: number, importedBossCount: number; error?: string}>=>{
        try{
            const importedCharacterCount = await importCharacters(exportedData);
            const importedBossCount = await importBossRecords(exportedData);
            // success, count json 데이터 리턴
            return {
                success: true,
                importedCharacterCount: importedCharacterCount,
                importedBossCount: importedBossCount
            };
        }catch(error){
            console.error("Failed to import persistent records", error);
            return {
                success: false,
                importedCharacterCount: 0,
                importedBossCount : 0,
                error : "데이터 동기화 중 오류가 발생했습니다."
            };
        }   
    };

    return {importMapleData};
}