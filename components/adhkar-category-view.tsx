"use client";

import Link from "next/link";
import { ArrowRight, RotateCcw } from "lucide-react";
import { useLiveQuery } from "dexie-react-hooks";
import { findCategory, isoDay, resetCategory, tapDhikr, type Dhikr } from "@/lib/adhkar";
import { db } from "@/lib/dexie-db";
import { useAdhkarProgress } from "@/hooks/useAdhkarProgress";
import { DhikrNotes } from "@/components/dhikr-notes";
import { ProgressRing } from "@/components/progress-ring";
import { cn } from "@/lib/utils";

// عرض تصنيف واحد: الذكر الحالي بعدّاد كبير، والمكتملة في الأسفل
export function CategoryView({ categoryId }: { categoryId: number }) {
  const { today } = useAdhkarProgress();
  const category = findCategory(categoryId);
  const row = useLiveQuery(
    () => db.adhkar_progress.filter((r) => r.date === today && r.category === categoryId).first(),
    [today, categoryId]
  );

  if (!category) return null;

  const completed = new Set(row?.completedItems ?? []);
  const counts = row?.counts ?? {};
  const current = category.items.find((i) => !completed.has(i.id));
  const doneCount = completed.size;
  const allDone = doneCount >= category.items.length;

  const onTap = (dhikr: Dhikr) => {
    void tapDhikr(isoDay(new Date()), category, dhikr);
  };

  return (
    <div className="flex flex-col gap-6">
      <header className="flex items-center justify-between gap-4">
        <Link href="/adhkar" className="flex items-center gap-2 text-sm text-muted hover:text-foreground">
          <ArrowRight aria-hidden className="size-4" />
          الأذكار
        </Link>
        <div className="flex items-center gap-3">
          <ProgressRing
            value={doneCount / category.items.length}
            size={40}
            stroke={5}
            label={`${doneCount} من ${category.items.length} مكتمل`}
          />
          <button
            type="button"
            onClick={() => void resetCategory(isoDay(new Date()), categoryId)}
            aria-label="إعادة هذا التصنيف لليوم"
            className="rounded-xl border border-border p-2 text-muted hover:bg-border/40"
          >
            <RotateCcw aria-hidden className="size-4" />
          </button>
        </div>
      </header>

      <h1 className="text-xl font-bold">{category.category}</h1>

      {allDone && (
        <p role="status" className="rounded-2xl bg-primary/10 p-4 text-center font-semibold text-primary">
          تقبّل الله، أتممت هذا التصنيف لليوم
        </p>
      )}

      {current && (
        <section aria-label="الذكر الحالي" className="flex flex-col items-center gap-5 rounded-2xl bg-card p-6 shadow-sm">
          <p className="text-center text-lg leading-loose">{current.text}</p>
          <button
            type="button"
            onClick={() => onTap(current)}
            aria-label={`عدّ: ${counts[current.id] ?? 0} من ${current.count}`}
            className="flex size-40 flex-col items-center justify-center rounded-full bg-primary text-white shadow-lg transition-transform active:scale-95 focus-visible:outline-4 focus-visible:outline-secondary"
          >
            <span className="text-4xl font-bold tabular-nums">{counts[current.id] ?? 0}</span>
            <span className="text-sm opacity-80">من {current.count}</span>
          </button>
          <p className="text-sm text-muted">اضغط الدائرة للعدّ</p>
          <DhikrNotes key={current.id} dhikr={current} />
        </section>
      )}

      {category.items.some((i) => completed.has(i.id)) && (
        <section aria-label="أذكار مكتملة" className="flex flex-col gap-2">
          <h2 className="text-sm font-semibold text-muted">المكتملة</h2>
          <ul className="flex flex-col gap-2">
            {category.items
              .filter((i) => completed.has(i.id))
              .map((i) => (
                <li key={i.id} className={cn("rounded-2xl bg-card p-4 text-sm text-muted line-through")}>
                  {i.text}
                </li>
              ))}
          </ul>
        </section>
      )}
    </div>
  );
}
