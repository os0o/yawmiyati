"use client";

import { useLiveQuery } from "dexie-react-hooks";
import { adhkarDoneDays, isoDay } from "@/lib/adhkar";
import { db } from "@/lib/dexie-db";
import { currentStreak } from "@/lib/streaks";
import { useToday } from "@/hooks/useToday";

// تقدم اليوم لكل التصنيفات، وعداد Streak المحسوب من السجل كله
export function useAdhkarProgress() {
  // يعيد الرسم عند تغيّر اليوم، والتاريخ هنا بصيغة YYYY-MM-DD كما في التخزين
  useToday();
  const today = isoDay(new Date());
  const rows = useLiveQuery(() => db.adhkar_progress.toArray(), [], []);
  const todayRows = rows.filter((r) => r.date === today);
  const doneDays = adhkarDoneDays(rows);
  const streak = currentStreak(doneDays, today);

  return { today, todayRows, doneDays, streak };
}
