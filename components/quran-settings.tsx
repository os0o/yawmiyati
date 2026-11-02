"use client";

import { QURAN_UNITS, type QuranUnit } from "@/lib/quran";
import { useQuranStore } from "@/store/quran-store";

const UNIT_OPTIONS: { value: QuranUnit; label: string }[] = [
  { value: "juz", label: "جزء" },
  { value: "hizb", label: "حزب (نصف جزء)" },
  { value: "page", label: "صفحة" },
];

const PER_DAY_OPTIONS: Record<QuranUnit, number[]> = {
  juz: [1, 2, 3],
  hizb: [1, 2, 3, 4],
  page: [1, 2, 5, 10, 15, 20, 30, 40],
};

// إعدادات الورد: الوحدة، المقدار اليومي، التذكير، وإعادة ضبط الختمة
export function QuranSettings() {
  const q = useQuranStore();
  const days = Math.ceil(QURAN_UNITS[q.unit].total / q.perDay);

  return (
    <section id="quran" aria-labelledby="quran-title" className="scroll-mt-6 rounded-2xl bg-card p-5 shadow-sm">
      <h2 id="quran-title" className="mb-3 text-lg font-semibold">
        الورد القرآني
      </h2>
      <div className="flex flex-col gap-3 text-sm">
        <label className="flex items-center justify-between gap-4">
          وحدة الورد
          <select
            value={q.unit}
            onChange={(e) => q.setUnit(e.target.value as QuranUnit)}
            className="rounded-lg border border-border bg-card px-2 py-1"
          >
            {UNIT_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </label>
        <label className="flex items-center justify-between gap-4">
          المقدار اليومي
          <select
            value={q.perDay}
            onChange={(e) => q.setPerDay(Number(e.target.value))}
            className="rounded-lg border border-border bg-card px-2 py-1"
          >
            {PER_DAY_OPTIONS[q.unit].map((n) => (
              <option key={n} value={n}>
                {n} {n === 1 ? UNIT_OPTIONS.find((o) => o.value === q.unit)?.label : QURAN_UNITS[q.unit].plural}
              </option>
            ))}
          </select>
        </label>
        <p className="text-muted">الختمة تكتمل في {days} يومًا تقريبًا.</p>

        <label className="flex cursor-pointer items-center justify-between gap-4 border-t border-border pt-3">
          تذكير يومي بالورد
          <input
            type="checkbox"
            role="switch"
            checked={q.reminderEnabled}
            onChange={(e) => q.setReminderEnabled(e.target.checked)}
            className="size-5 accent-primary"
          />
        </label>
        <label className="flex cursor-pointer items-center justify-between gap-4">
          صوت مع التذكير
          <input
            type="checkbox"
            role="switch"
            checked={q.reminderSound}
            disabled={!q.reminderEnabled}
            onChange={(e) => q.setReminderSound(e.target.checked)}
            className="size-5 accent-primary disabled:opacity-40"
          />
        </label>
        <label className="flex items-center justify-between gap-4">
          وقت التذكير
          <input
            type="time"
            value={q.reminderTime}
            onChange={(e) => e.target.value && q.setReminderTime(e.target.value)}
            className="rounded-lg border border-border bg-card px-2 py-1"
          />
        </label>

        <div className="border-t border-border pt-3">
          <button
            type="button"
            onClick={() => {
              if (window.confirm("إعادة الختمة الحالية إلى البداية؟ يبقى سجل أيام القراءة كما هو.")) q.resetKhatma();
            }}
            className="rounded-xl border border-border px-4 py-2 text-sm hover:bg-border/40"
          >
            إعادة ضبط الختمة
          </button>
        </div>
      </div>
    </section>
  );
}
