"use client";

import Link from "next/link";
import { MapPin, RefreshCw, Settings } from "lucide-react";
import { NextPrayerCard, getNextPrayer } from "@/components/next-prayer-card";
import { PrayerSchedule } from "@/components/prayer-schedule";
import { useNow } from "@/hooks/useNow";
import { usePrayerTimes } from "@/hooks/usePrayerTimes";
import { useAppStore } from "@/store/app-store";

export default function PrayerPage() {
  const { data, error, loading, retryLocation } = usePrayerTimes();
  const manual = useAppStore((s) => s.manualLocation);
  // تحديث كل دقيقة لينتقل تمييز الصلاة القادمة والصلوات الفائتة والصفحة مفتوحة
  const now = useNow();

  return (
    <div className="flex flex-col gap-6">
      <header className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">الصلوات</h1>
          {data && (
            <p className="mt-1 text-sm text-muted">
              {data.date} · {data.hijri}
            </p>
          )}
        </div>
        <div className="flex items-center gap-2">
          <Link
            href="/settings"
            aria-label="الإعدادات والتنبيهات"
            className="flex items-center rounded-2xl border border-border p-2 text-sm hover:bg-border/40"
          >
            <Settings aria-hidden className="size-4" />
          </Link>
          <button
            type="button"
            onClick={retryLocation}
            aria-label="تحديث الموقع"
            className="flex items-center gap-2 rounded-2xl border border-border px-3 py-2 text-sm hover:bg-border/40"
          >
            <MapPin aria-hidden className="size-4" />
            {manual ? manual.city : "موقعي"}
            <RefreshCw aria-hidden className="size-3.5 text-muted" />
          </button>
        </div>
      </header>

      {error && (
        <p role="alert" className="rounded-2xl bg-secondary/15 p-4 text-sm">
          {error}
        </p>
      )}

      {loading && !data && <p className="text-muted">جارٍ تحميل المواقيت…</p>}

      {data && (
        <>
          <NextPrayerCard timings={data.timings} />
          <h2 className="text-lg font-semibold">مواقيت اليوم</h2>
          <PrayerSchedule timings={data.timings} now={now} nextPrayer={getNextPrayer(data.timings, now).name} />
        </>
      )}
    </div>
  );
}
