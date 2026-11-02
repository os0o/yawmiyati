"use client";

import { useEffect, useState } from "react";
import { dayKey } from "@/lib/prayer-alerts";

// يتغير مفتاح اليوم عند منتصف الليل تقريبًا، فتُعاد جلب المواقيت
export function useToday() {
  const [today, setToday] = useState(() => dayKey(new Date()));

  useEffect(() => {
    const id = setInterval(() => {
      const next = dayKey(new Date());
      setToday((prev) => (prev === next ? prev : next));
    }, 60_000);
    return () => clearInterval(id);
  }, []);

  return today;
}
