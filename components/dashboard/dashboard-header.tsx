"use client";

import Link from "next/link";
import { Settings } from "lucide-react";
import { usePrayerTimes } from "@/hooks/usePrayerTimes";

const dateFormat = new Intl.DateTimeFormat("ar", { weekday: "long", day: "numeric", month: "long" });

function greeting(now: Date) {
  return now.getHours() < 12 ? "صباح الخير" : "مساء الخير";
}

export function DashboardHeader({ now }: { now: Date }) {
  const { data } = usePrayerTimes();

  return (
    <header className="flex items-start justify-between gap-4">
      <div>
        <h1 className="text-2xl font-bold">{greeting(now)}</h1>
        <p className="mt-1 text-sm text-muted">
          {dateFormat.format(now)}
          {data && ` · ${data.hijri}`}
        </p>
      </div>
      <Link
        href="/settings"
        aria-label="الإعدادات"
        className="rounded-2xl border border-border p-2 text-muted hover:bg-border/40 hover:text-foreground md:hidden"
      >
        <Settings aria-hidden className="size-5" />
      </Link>
    </header>
  );
}
