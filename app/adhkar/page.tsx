"use client";

import Link from "next/link";
import { ADHKAR_GROUPS, categoriesOf, ADHKAR_SOURCE } from "@/lib/adhkar";
import { ProgressRing } from "@/components/progress-ring";
import { useAdhkarProgress } from "@/hooks/useAdhkarProgress";

export default function AdhkarPage() {
  const { todayRows, streak } = useAdhkarProgress();

  return (
    <div className="flex flex-col gap-6">
      <header className="flex items-center justify-between gap-4">
        <h1 className="text-2xl font-bold">الأذكار</h1>
        <p className="rounded-2xl bg-secondary/15 px-3 py-2 text-sm font-semibold">
          <span aria-hidden>🔥 </span>
          المتتالية: {streak} يومًا
        </p>
      </header>

      {ADHKAR_GROUPS.map((group) => {
        const categories = categoriesOf(group.key);
        if (categories.length === 0) return null;

        const doneCount = categories.filter((c) => {
          const row = todayRows.find((r) => r.category === c.id);
          return row && row.completedItems.length >= c.items.length;
        }).length;

        return (
          <section key={group.key} aria-labelledby={`group-${group.key}`} className="rounded-2xl bg-card p-5 shadow-sm">
            <div className="mb-3 flex items-center justify-between gap-4">
              <h2 id={`group-${group.key}`} className="text-lg font-semibold">
                {group.label}
              </h2>
              <ProgressRing
                value={doneCount / categories.length}
                size={40}
                stroke={5}
                label={`${doneCount} من ${categories.length} مكتمل اليوم`}
              />
            </div>
            <ul className="flex flex-col divide-y divide-border">
              {categories.map((c) => {
                const row = todayRows.find((r) => r.category === c.id);
                const done = row?.completedItems.length ?? 0;
                const complete = done >= c.items.length;
                return (
                  <li key={c.id}>
                    <Link
                      href={`/adhkar/${c.id}`}
                      className="flex items-center justify-between gap-4 py-3 transition-colors hover:text-primary"
                    >
                      <span className={complete ? "text-muted line-through" : ""}>{c.category}</span>
                      <span className="shrink-0 text-sm text-muted tabular-nums">
                        {done}/{c.items.length}
                      </span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </section>
        );
      })}

      <p className="text-xs leading-relaxed text-muted">
        المصدر: {ADHKAR_SOURCE.title} — {ADHKAR_SOURCE.author}. البيانات من{" "}
        {ADHKAR_SOURCE.sources.map((s, i) => (
          <span key={s.url}>
            {i > 0 && " و"}
            <a href={s.url} target="_blank" rel="noreferrer" className="underline" dir="ltr">
              {s.name}
            </a>
          </span>
        ))}{" "}
        (ترخيص MIT). الفضل والمصدر متوفران لأذكار الصباح والمساء.
      </p>
    </div>
  );
}
