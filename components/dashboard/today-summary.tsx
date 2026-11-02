"use client";

import Link from "next/link";
import { BookOpen, CheckSquare, Moon, type LucideIcon } from "lucide-react";
import { ProgressRing } from "@/components/progress-ring";

export interface SummaryMetric {
  key: string;
  href: string;
  label: string;
  icon: LucideIcon;
  // بين 0 و 1، وnull إن لم يكن هناك ما يُقاس اليوم (مثل يوم بلا مهام)
  value: number | null;
  detail: string;
}

export const METRIC_ICONS = { adhkar: Moon, quran: BookOpen, tasks: CheckSquare } as const;

const percent = (v: number) => `${Math.round(v * 100)}%`;

// إنجاز اليوم: متوسط المقاييس المتاحة، وبطاقة لكل قسم تنقل إليه
export function TodaySummary({ metrics }: { metrics: SummaryMetric[] }) {
  const measured = metrics.filter((m) => m.value !== null);
  const overall = measured.length ? measured.reduce((sum, m) => sum + (m.value ?? 0), 0) / measured.length : 0;

  return (
    <section aria-labelledby="today-title" className="rounded-2xl bg-card p-5 shadow-sm">
      <div className="flex items-center gap-4">
        <div className="relative grid place-items-center">
          <ProgressRing value={overall} size={84} stroke={8} label={`إنجاز اليوم ${percent(overall)}`} />
          <span aria-hidden className="absolute text-lg font-bold tabular-nums">
            {percent(overall)}
          </span>
        </div>
        <div>
          <h2 id="today-title" className="text-lg font-semibold">
            إنجاز اليوم
          </h2>
          <p className="text-sm text-muted">
            {overall >= 1 ? "أتممت كل شيء اليوم، بارك الله فيك" : "الأذكار والورد والمهام"}
          </p>
        </div>
      </div>

      <ul className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-3">
        {metrics.map(({ key, href, label, icon: Icon, value, detail }) => (
          <li key={key}>
            <Link
              href={href}
              className="flex items-center gap-3 rounded-xl bg-background p-3 transition-colors hover:bg-border/40"
            >
              <ProgressRing value={value ?? 0} size={44} stroke={5} label={`${label}: ${detail}`} />
              <div className="min-w-0">
                <p className="flex items-center gap-1.5 font-medium">
                  <Icon aria-hidden className="size-4 text-primary" />
                  {label}
                </p>
                <p className="truncate text-xs text-muted">{detail}</p>
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
