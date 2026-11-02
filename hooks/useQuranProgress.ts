"use client";

import { useLiveQuery } from "dexie-react-hooks";
import { isoDay } from "@/lib/adhkar";
import { db } from "@/lib/dexie-db";
import { useToday } from "@/hooks/useToday";

// سجل أيام القراءة كله، وحالة ورد اليوم
export function useQuranProgress() {
  // يعيد الرسم عند تغيّر اليوم
  useToday();
  const today = isoDay(new Date());
  const rows = useLiveQuery(() => db.quran_progress.toArray(), [], []);
  const doneDates = new Set(rows.filter((r) => r.completed).map((r) => r.date));

  return { today, rows, doneDates, doneToday: doneDates.has(today) };
}
