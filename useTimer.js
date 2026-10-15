import { useState, useEffect, useRef, useCallback } from 'react';

export const useTimer = (initialSeconds = 600, autoStart = false, onExpire = null) => {
  const [timeLeft, setTimeLeft] = useState(initialSeconds);
  const [isActive, setIsActive] = useState(autoStart);
  const onExpireRef = useRef(onExpire);

  useEffect(() => {
    onExpireRef.current = onExpire;
  }, [onExpire]);

  useEffect(() => {
    let timer = null;

    if (isActive && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0 && isActive) {
      setIsActive(false);
      if (onExpireRef.current) {
        onExpireRef.current();
      }
    }

    return () => {
      if (timer) clearInterval(timer);
    };
  }, [isActive, timeLeft]);

  const start = useCallback(() => setIsActive(true), []);
  const pause = useCallback(() => setIsActive(false), []);
  const reset = useCallback((newSeconds) => {
    setIsActive(false);
    setTimeLeft(newSeconds !== undefined ? newSeconds : initialSeconds);
  }, [initialSeconds]);

  const formatTime = () => {
    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  return {
    timeLeft,
    isActive,
    formattedTime: formatTime(),
    start,
    pause,
    reset,
  };
};

export default useTimer;
