"use client";

import { useEffect, useState } from "react";

// الوقت الحالي محدَّثًا كل دقيقة، لما يتغير مع مرور الوقت مثل علامة «متأخرة»
export function useNow(intervalMs = 60_000) {
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), intervalMs);
    return () => clearInterval(id);
  }, [intervalMs]);

  return now;
}
