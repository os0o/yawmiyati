"use client";

import { useEffect, useState } from "react";

// يعيد الثواني المتبقية حتى التاريخ المحدد، ويتحدث كل ثانية
export function useCountdown(target: Date | null) {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  if (!target) return 0;
  return Math.max(0, Math.floor((target.getTime() - now) / 1000));
}

export function formatCountdown(totalSeconds: number) {
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = totalSeconds % 60;
  return [h, m, s].map((n) => String(n).padStart(2, "0")).join(":");
}
