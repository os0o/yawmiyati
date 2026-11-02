"use client";

import { ProgressRing } from "@/components/progress-ring";
import { QuranHeatmap } from "@/components/quran-heatmap";
import { QURAN_UNITS, remainingDays } from "@/lib/quran";
import { useQuranProgress } from "@/hooks/useQuranProgress";
import { useQuranStore } from "@/store/quran-store";

const dateFormat = new Intl.DateTimeFormat("ar", { day: "numeric", month: "long", year: "numeric" });

// تتبع الختمة الحالية: الموضع، النسبة، تاريخ البدء، والتاريخ المتوقع للختم
export function QuranTracker() {
  const { unit, perDay, pointer, startDate, khatmas } = useQuranStore();
  const { doneDates, doneToday } = useQuranProgress();

  const { total, label } = QURAN_UNITS[unit];
  const percent = pointer / total;
  // إن لم يُنجز ورد اليوم فاليوم أول أيام القراءة المتبقية، فيُطرح يوم
  const days = remainingDays(pointer, perDay, unit) - (doneToday ? 0 : 1);
  const finish = new Date();
  finish.setDate(finish.getDate() + days);

  const stats = [
    { label: "الموضع الحالي", value: `${label} ${pointer + 1} من ${total}` },
    { label: "تاريخ البدء", value: startDate ? dateFormat.format(new Date(`${startDate}T00:00:00`)) : "لم تبدأ بعد" },
    {
      label: "الختم المتوقع",
      value: days === 0 ? `اليوم (${dateFormat.format(finish)})` : `${dateFormat.format(finish)} (بعد ${days} يومًا)`,
    },
    { label: "ختمات مكتملة", value: String(khatmas) },
  ];

  return (
    <section aria-labelledby="tracker-title" className="flex flex-col gap-5 rounded-2xl bg-card p-5 shadow-sm">
      <div className="flex items-center justify-between gap-4">
        <h2 id="tracker-title" className="text-lg font-semibold">
          تتبع الختمة
        </h2>
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold tabular-nums">{Math.round(percent * 100)}%</span>
          <ProgressRing value={percent} size={48} stroke={6} label={`نسبة الختمة ${Math.round(percent * 100)}%`} />
        </div>
      </div>

      <dl className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {stats.map((s) => (
          <div key={s.label} className="rounded-xl bg-background p-3">
            <dt className="text-xs text-muted">{s.label}</dt>
            <dd className="mt-1 font-medium">{s.value}</dd>
          </div>
        ))}
      </dl>

      <div>
        <h3 className="mb-2 text-sm font-semibold text-muted">أيام القراءة</h3>
        <QuranHeatmap doneDates={doneDates} />
      </div>
    </section>
  );
}
