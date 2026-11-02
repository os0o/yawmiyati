"use client";

import Link from "next/link";
import { NextPrayerCard } from "@/components/next-prayer-card";
import { usePrayerTimes } from "@/hooks/usePrayerTimes";

// بطاقة الصلاة القادمة في الرئيسية، أو حالة التحميل/الخطأ مع رابط لصفحة الصلوات
export function NextPrayerSlot() {
  const { data, error } = usePrayerTimes();

  if (data) {
    return (
      <Link href="/prayer" aria-label="عرض مواقيت اليوم" className="block rounded-2xl">
        <NextPrayerCard timings={data.timings} />
      </Link>
    );
  }

  // عند تعذر الموقع نوجّه إلى الإعدادات لاختيار المدينة
  return (
    <Link href={error ? "/settings" : "/prayer"} className="block rounded-2xl bg-card p-5 shadow-sm hover:bg-border/40">
      <p className="text-sm text-muted">الصلاة القادمة</p>
      <p className="mt-1 font-medium">{error ?? "جارٍ تحميل المواقيت…"}</p>
      {error && <p className="mt-2 text-sm text-primary">اختر مدينتك من الإعدادات ←</p>}
    </Link>
  );
}
