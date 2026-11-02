"use client";

import { PRAYER_LABELS, PRAYER_NAMES, timeToDate, type PrayerTimings } from "@/lib/aladhan-api";
import { formatCountdown, useCountdown } from "@/hooks/useCountdown";
import { ProgressRing } from "@/components/progress-ring";

// يحسب الصلاة القادمة وبداية الصلاة الحالية لعرض التقدم
export function getNextPrayer(timings: PrayerTimings, now: Date) {
  const times = PRAYER_NAMES.map((name) => ({ name, at: timeToDate(timings[name], now) }));
  const next = times.find((t) => t.at > now);
  if (next) {
    const idx = times.indexOf(next);
    const prev = idx === 0 ? times[times.length - 1] : times[idx - 1];
    return { name: next.name, at: next.at, prevAt: prev.at };
  }
  // بعد العشاء: الفجر في اليوم التالي
  const fajrTomorrow = timeToDate(timings.Fajr, new Date(now.getTime() + 86_400_000));
  return { name: "Fajr" as const, at: fajrTomorrow, prevAt: times[times.length - 1].at };
}

export function NextPrayerCard({ timings }: { timings: PrayerTimings }) {
  // العدّاد يعيد الرسم كل ثانية، فيُعاد حساب الصلاة القادمة معه وتنتقل عند حلول وقتها
  const next = getNextPrayer(timings, new Date());
  const seconds = useCountdown(next.at);
  const total = (next.at.getTime() - next.prevAt.getTime()) / 1000;
  const progress = total > 0 ? 1 - seconds / total : 0;

  return (
    <section aria-labelledby="next-prayer-title" className="rounded-2xl bg-primary p-6 text-white shadow-lg">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-sm opacity-80">الصلاة القادمة</p>
          <h2 id="next-prayer-title" className="mt-1 text-3xl font-bold">
            {PRAYER_LABELS[next.name]}
          </h2>
          <p dir="ltr" className="mt-3 font-mono text-2xl tabular-nums" aria-live="off">
            {formatCountdown(seconds)}
          </p>
        </div>
        <ProgressRing
          value={progress}
          size={72}
          stroke={7}
          color="var(--secondary)"
          trackColor="rgb(255 255 255 / 0.25)"
          label={`تقدم الوقت حتى ${PRAYER_LABELS[next.name]}`}
        />
      </div>
    </section>
  );
}
