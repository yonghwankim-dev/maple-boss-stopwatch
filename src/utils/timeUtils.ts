import { formatDate } from "./timeFormatter";


/**
 * 특정 날짜가 속한 '목요일~수요일' 주차 기준 범위를 구합니다.
 * @param date 기준 날짜 (기본값: 오늘)
 */
export const getThursdayWeekRange = (targetDate: Date = new Date())=>{
    const date = new Date(targetDate);
    date.setHours(0, 0, 0, 0); // 시간 초기화

    const day = date.getDay(); // 0(일), 1(월), 2(화), 3(수), 4(목), 5(금), 6(토)

    // 입력된 날짜 기준 '가장 최근 목요일'과의 차이 계산
    // 목(4), 금(5), 토(6) -> 이번 주 목요일
    // 일(0), 월(1), 화(2), 수(3) -> 지난주 목요일
    const diffToThursday = day >= 4 ? day - 4 : day + 3;

    // 이번 주차의 시작일 (목요일)
    const thisWeekStart = new Date(date);
    thisWeekStart.setDate(date.getDate() - diffToThursday);

    // 이번 주차의 종료일 (수요일)
    const thisWeekEnd = new Date(date);
    thisWeekEnd.setDate(thisWeekStart.getDate() + 6);
    
    // 지난 주차의 시작일 (지난주 목요일)
    const lastWeekStart = new Date(thisWeekStart);
    lastWeekStart.setDate(thisWeekStart.getDate() - 7);

    // 지난 주차의 종료일 (이번주 목요일 - 1일 = 지난주 수요일)
    const lastWeekEnd = new Date(thisWeekStart);
    lastWeekEnd.setDate(thisWeekStart.getDate() - 1);

    return {
        thisWeek: {
        start: formatDate(thisWeekStart), // YYYY-MM-DD
        end: formatDate(thisWeekEnd),
        startDateObj: thisWeekStart,
        endDateObj: thisWeekEnd,
        },
        lastWeek: {
        start: formatDate(lastWeekStart),
        end: formatDate(lastWeekEnd),
        startDateObj: lastWeekStart,
        endDateObj: lastWeekEnd,
        },
    };

};

export const isLastWeekBossRecord = (
    clearDate: string,
    referenceDate: Date = new Date()
): boolean => {
    if(!clearDate){
        return false;
    }
    // 1. 기준 날짜에 대한 목요일 주차 범위 계산
    const {lastWeek} = getThursdayWeekRange(referenceDate);

    // 2. 지난주 시작일(목 00:00:00)과 종료일(수 23:59:59)의 타임스탬프 구하기
    const startTime = lastWeek.startDateObj.getTime();
    const endTime = new Date(lastWeek.endDateObj).setHours(23, 59, 59, 59);

    // 3. 검사 대상 clearDate를 타임스탬프로 변환
    const targetTime = new Date(clearDate).getTime();

    // 4. 범위 내에 포함되는지 여부 반환
    return targetTime >= startTime && targetTime <= endTime;
}