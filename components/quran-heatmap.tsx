"use client";

import { isoDay } from "@/lib/adhkar";
import { cn } from "@/lib/utils";

const WEEKS = 12;

// شبكة آخر 12 أسبوعًا: كل عمود أسبوع، وكل خلية يوم
export function QuranHeatmap({ doneDates }: { doneDates: Set<string> }) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // نبدأ من بداية الأسبوع (السبت) قبل 11 أسبوعًا، حتى تصطف الأيام في صفوفها
  const start = new Date(today);
  const daysSinceSaturday = (today.getDay() + 1) % 7;
  start.setDate(today.getDate() - daysSinceSaturday - (WEEKS - 1) * 7);

  const cells: { date: string; done: boolean; future: boolean }[] = [];
  for (let i = 0; i < WEEKS * 7; i++) {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    const key = isoDay(d);
    cells.push({ date: key, done: doneDates.has(key), future: d > today });
  }

  const doneCount = cells.filter((c) => c.done).length;

  return (
    <figure className="flex flex-col gap-3">
      <div
        role="img"
        aria-label={`أيام القراءة: ${doneCount} يومًا في آخر ${WEEKS} أسبوعًا`}
        className="grid grid-flow-col grid-rows-7 gap-1"
      >
        {cells.map((c) => (
          <span
            key={c.date}
            title={c.date}
            className={cn(
              "aspect-square rounded-[4px]",
              c.future ? "bg-transparent" : c.done ? "bg-primary" : "bg-border"
            )}
          />
        ))}
      </div>
      <figcaption className="flex items-center gap-2 text-xs text-muted">
        <span className="inline-block size-3 rounded-[3px] bg-border" /> لم يُقرأ
        <span className="inline-block size-3 rounded-[3px] bg-primary" /> قُرئ الورد
      </figcaption>
    </figure>
  );
}
