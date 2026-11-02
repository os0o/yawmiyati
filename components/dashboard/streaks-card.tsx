"use client";

import { Flame } from "lucide-react";
import { currentStreak, intersectDays, longestStreak } from "@/lib/streaks";

const daysLabel = (n: number) => (n === 0 ? "لا أيام" : n === 1 ? "يوم واحد" : n === 2 ? "يومان" : n <= 10 ? `${n} أيام` : `${n} يومًا`);

// متتاليات الأذكار والورد، و«الاثنان معًا» للأيام التي أُنجز فيها كلاهما
export function StreaksCard({
  today,
  adhkarDays,
  quranDays,
}: {
  today: string;
  adhkarDays: Set<string>;
  quranDays: Set<string>;
}) {
  const rows = [
    { key: "adhkar", label: "الأذكار", days: adhkarDays },
    { key: "quran", label: "ورد القرآن", days: quranDays },
    { key: "both", label: "الاثنان معًا", days: intersectDays(adhkarDays, quranDays) },
  ].map((r) => ({ ...r, current: currentStreak(r.days, today), best: longestStreak(r.days) }));

  return (
    <section aria-labelledby="streaks-title" className="rounded-2xl bg-card p-5 shadow-sm">
      <h2 id="streaks-title" className="mb-3 flex items-center gap-2 text-lg font-semibold">
        <Flame aria-hidden className="size-5 text-secondary" />
        المتتاليات
      </h2>
      <ul className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        {rows.map((r) => (
          <li key={r.key} className="rounded-xl bg-background p-3">
            <p className="text-sm text-muted">{r.label}</p>
            <p className="mt-1 text-xl font-bold">{daysLabel(r.current)}</p>
            <p className="mt-1 text-xs text-muted">الأطول: {daysLabel(r.best)}</p>
          </li>
        ))}
      </ul>
    </section>
  );
}
