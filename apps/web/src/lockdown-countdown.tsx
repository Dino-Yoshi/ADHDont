import { useEffect, useState } from "react";

const MS_PER_SECOND = 1000;

function formatCountdown(remainingMs: number) {
  const totalSeconds = Math.max(0, Math.ceil(remainingMs / MS_PER_SECOND));
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = String(Math.floor((totalSeconds % 3600) / 60)).padStart(2, "0");
  const seconds = String(totalSeconds % 60).padStart(2, "0");
  return `${hours}:${minutes}:${seconds}`;
}

export function LockdownCountdown({
  endsAt,
  onElapsed,
}: {
  endsAt: string;
  onElapsed: () => void;
}) {
  const [now, setNow] = useState(Date.now());
  const endsAtMs = Date.parse(endsAt);

  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), MS_PER_SECOND);
    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    if (now >= endsAtMs) onElapsed();
  }, [now, endsAtMs, onElapsed]);

  return <p className="lockdown-countdown">{formatCountdown(endsAtMs - now)}</p>;
}
