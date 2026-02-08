import { useState, useEffect, useCallback } from "react";

interface CountdownValues {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  isUrgent: boolean;
  isVeryUrgent: boolean;
  isExpired: boolean;
}

export function useCountdown(targetDate: Date): CountdownValues {
  const calculate = useCallback(() => {
    const now = new Date().getTime();
    const distance = targetDate.getTime() - now;

    if (distance < 0) {
      return { days: 0, hours: 0, minutes: 0, seconds: 0, isUrgent: false, isVeryUrgent: false, isExpired: true };
    }

    return {
      days: Math.floor(distance / (1000 * 60 * 60 * 24)),
      hours: Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
      minutes: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
      seconds: Math.floor((distance % (1000 * 60)) / 1000),
      isUrgent: distance < 24 * 60 * 60 * 1000,
      isVeryUrgent: distance < 60 * 60 * 1000,
      isExpired: false,
    };
  }, [targetDate]);

  const [countdown, setCountdown] = useState<CountdownValues>(calculate);

  useEffect(() => {
    const timer = setInterval(() => setCountdown(calculate()), 1000);
    return () => clearInterval(timer);
  }, [calculate]);

  return countdown;
}
