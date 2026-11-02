"use client";

import Link from "next/link";
import { Settings } from "lucide-react";
import { QuranTracker } from "@/components/quran-tracker";
import { QuranWirdCard } from "@/components/quran-wird-card";
import { useMounted } from "@/hooks/useMounted";

export default function QuranPage() {
  const mounted = useMounted();

  return (
    <div className="flex flex-col gap-6">
      <header className="flex items-center justify-between gap-4">
        <h1 className="text-2xl font-bold">القرآن</h1>
        <Link
          href="/settings#quran"
          aria-label="إعدادات الورد"
          className="flex items-center rounded-2xl border border-border p-2 text-sm hover:bg-border/40"
        >
          <Settings aria-hidden className="size-4" />
        </Link>
      </header>
      {mounted ? (
        <>
          <QuranWirdCard />
          <QuranTracker />
        </>
      ) : (
        <p className="text-muted">جارٍ التحميل…</p>
      )}
      <p className="text-xs text-muted">النص من api.alquran.cloud بالرسم العثماني.</p>
    </div>
  );
}
