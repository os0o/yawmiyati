"use client";

import { motion } from "framer-motion";
import { PRAYER_LABELS, PRAYER_NAMES, type PrayerTimings } from "@/lib/aladhan-api";
import { timeToDate } from "@/lib/aladhan-api";
import { cn } from "@/lib/utils";

// جدول مواقيت اليوم، مع تمييز الصلاة القادمة
export function PrayerSchedule({
  timings,
  now,
  nextPrayer,
}: {
  timings: PrayerTimings;
  now: Date;
  nextPrayer: string | null;
}) {
  return (
    <ul className="divide-y divide-border rounded-2xl bg-card shadow-sm">
      {PRAYER_NAMES.map((name, i) => {
        const passed = timeToDate(timings[name], now) < now;
        const isNext = nextPrayer === name;
        return (
          <motion.li
            key={name}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05, duration: 0.25 }}
            className={cn("flex items-center justify-between px-5 py-4", passed && "text-muted")}
            aria-current={isNext ? "true" : undefined}
          >
            <span className={cn("font-medium", isNext && "text-primary")}>{PRAYER_LABELS[name]}</span>
            <time dir="ltr" className="tabular-nums">
              {timings[name]}
            </time>
          </motion.li>
        );
      })}
    </ul>
  );
}
