import { useEffect, useState } from 'react';

/**
 * A clock that ticks inside the component that needs it. Keeping it here rather than in a
 * parent screen matters: a `now` state on MineScreen re-rendered the whole mine several
 * times a second just to count down a boost timer.
 */
export function useNow(intervalMs: number): number {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), intervalMs);
    return () => clearInterval(id);
  }, [intervalMs]);
  return now;
}
