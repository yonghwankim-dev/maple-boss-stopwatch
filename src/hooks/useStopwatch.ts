import { useRef, useState } from "react";

export const useStopwatch = ()=>{
    const [time, setTime] = useState<number>(0); // 초단위
    const [isRunning, setIsRunning] = useState<boolean>(false);
    const timeRef = useRef<ReturnType<typeof setInterval> | null>(null);
    
    // 시작 기능
    const start = ()=>{
        if(isRunning){
            return;
        }
        setIsRunning(true);
        timeRef.current = setInterval(()=>{
            setTime((prev)=> prev + 1);
        }, 1000);
    };

    const pause = ()=>{
        if(!isRunning){
            return;
        }
        setIsRunning(false);

        if(timeRef.current){
            clearInterval(timeRef.current);
            timeRef.current = null;
        }
    }

    return {time, isRunning, start, pause};
};