import { useEffect, useRef, useState } from "react";

export const useStopwatch = ()=>{
    const [time, setTime] = useState<number>(0); // 초단위
    const [isRunning, setIsRunning] = useState<boolean>(false);
    const timeRef = useRef<ReturnType<typeof setInterval> | null>(null);
    const startTimeRef = useRef<number>(0);
    const accumulatedTimeRef = useRef<number>(0);

    // 시작 기능
    const start = ()=>{
        if(isRunning){
            return;
        }
        setIsRunning(true);
        // startTimeRef에 현재 시간 기록
        startTimeRef.current = Date.now() - accumulatedTimeRef.current;

        timeRef.current = setInterval(()=>{
            // (현재시간 - 시작시간)을 통해서 경과 시간을 계산함
            const elapsedMs = Date.now() - startTimeRef.current;

            // 누적 시간에 현재 경과 상태를 실시간 업데이트
            setTime(Math.floor(elapsedMs / 1000));
        }, 100); // 100ms 주기로 현재 시간 체크
    };

    // 일시정지 기능
    const pause = ()=>{
        if(!isRunning){
            return;
        }
        setIsRunning(false);

        if(timeRef.current){
            clearInterval(timeRef.current);
            timeRef.current = null;
        }
        // 일시 정지 시점까지의 밀리초를 누적 저장
        accumulatedTimeRef.current = Date.now() - startTimeRef.current;
    };

    // 초기화 기능
    const reset = ()=>{
        setIsRunning(false);
        if(timeRef.current){
            clearInterval(timeRef.current);
            timeRef.current = null;
        }
        startTimeRef.current = 0;
        accumulatedTimeRef.current = 0;
        setTime(0);
    };

    // 완료 기능
    const complete = ()=>{
        const finalTime = isRunning ?
            Math.floor((Date.now() - startTimeRef.current) / 1000) : time;
        reset();
        return finalTime;
    };

    useEffect(()=>{
        return ()=>{
            if(timeRef.current){
                clearInterval(timeRef.current);
            }
        }
    }, []);

    return {time, isRunning, start, pause, reset, complete};
};