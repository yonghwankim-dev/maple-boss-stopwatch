
/**
 * 초 단위를 'MM분 SS초' 형식으로 변환
 * - 예를 들어 seconds=60 => '01분 00초'
 * @param seconds 시간초
 * @returns 'MM분 SS초' 형식의 문자열
 */
export const formatTime = (seconds: number) =>{
    const mins = Math.floor(seconds / 60).toString().padStart(2, '0');
    const secs = (seconds % 60).toString().padStart(2, '0');
    return `${mins}분 ${secs}초`;
}

/**
 * 현재 일자 반환
 * @returns YYYY-MM-DD 형식의 문자열
 */
export const getTodayDate = (): string => {
    return new Date().toISOString().split('T')[0];
}