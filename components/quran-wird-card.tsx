"use client";

import { useState } from "react";
import { BookOpen, Check } from "lucide-react";
import { QuranReader } from "@/components/quran-reader";
import { recordWird, wirdLabel, wirdUnits, QURAN_UNITS } from "@/lib/quran";
import { useQuranProgress } from "@/hooks/useQuranProgress";
import { useQuranStore } from "@/store/quran-store";
import { useToastStore } from "@/store/toast-store";

export function QuranWirdCard() {
  const { unit, perDay, pointer, advance } = useQuranStore();
  const { today, rows, doneToday } = useQuranProgress();
  const push = useToastStore((s) => s.push);
  const [reading, setReading] = useState(false);

  // بعد الإنجاز نعرض ورد اليوم كما سُجّل، لا الورد التالي
  const todayRow = rows.find((r) => r.date === today && r.completed);
  const units = todayRow
    ? Array.from({ length: todayRow.count }, (_, i) => ((todayRow.start - 1 + i) % QURAN_UNITS[todayRow.unit].total) + 1)
    : wirdUnits(pointer, perDay, unit);
  const shownUnit = todayRow?.unit ?? unit;

  const complete = async () => {
    const recorded = await recordWird(today, units, unit);
    if (!recorded) return;
    advance(today);
    setReading(false);
    push({ title: "تقبّل الله", body: `أنجزت ورد اليوم: ${wirdLabel(units, unit)}`, snoozable: false });
  };

  return (
    <section aria-labelledby="wird-title" className="flex flex-col gap-4">
      <div className="rounded-2xl bg-primary p-6 text-white shadow-lg">
        <p className="text-sm opacity-80">ورد اليوم</p>
        <h2 id="wird-title" className="mt-1 text-3xl font-bold">
          {wirdLabel(units, shownUnit)}
        </h2>

        <div className="mt-5 flex flex-wrap gap-3">
          <button
            type="button"
            onClick={() => setReading((r) => !r)}
            aria-expanded={reading}
            className="flex items-center gap-2 rounded-xl bg-white/15 px-4 py-2 font-medium hover:bg-white/25"
          >
            <BookOpen aria-hidden className="size-4" />
            {reading ? "إخفاء النص" : "ابدأ القراءة"}
          </button>

          {doneToday ? (
            <p role="status" className="flex items-center gap-2 rounded-xl bg-secondary px-4 py-2 font-medium text-stone-900">
              <Check aria-hidden className="size-4" />
              تم إنجاز ورد اليوم
            </p>
          ) : (
            <button
              type="button"
              onClick={complete}
              className="flex items-center gap-2 rounded-xl bg-secondary px-4 py-2 font-medium text-stone-900 hover:opacity-90"
            >
              <Check aria-hidden className="size-4" />
              أنجزت الورد
            </button>
          )}
        </div>
      </div>

      {reading && <QuranReader units={units} unit={shownUnit} />}
    </section>
  );
}
