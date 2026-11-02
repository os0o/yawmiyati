"use client";

import { Fragment, useEffect, useState } from "react";
import { fetchUnitText, QURAN_UNITS, type Ayah, type QuranUnit } from "@/lib/quran";

// يعرض نص الورد متصلًا، مع عنوان السورة عند بدايتها
export function QuranReader({ units, unit }: { units: number[]; unit: QuranUnit }) {
  const [ayahs, setAyahs] = useState<Ayah[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const key = units.join(",");

  useEffect(() => {
    const controller = new AbortController();
    setAyahs(null);
    setError(null);

    Promise.all(units.map((n) => fetchUnitText(unit, n, controller.signal)))
      .then((parts) => setAyahs(parts.flat()))
      .catch(() => {
        if (!controller.signal.aborted) setError("تعذر تحميل النص، تحقق من الاتصال بالإنترنت");
      });

    return () => controller.abort();
    // key يمثل units، فلا حاجة لإعادة الجلب عند تغيّر هوية المصفوفة فقط
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key, unit]);

  if (error) {
    return (
      <p role="alert" className="rounded-2xl bg-secondary/15 p-4 text-sm">
        {error}
      </p>
    );
  }

  if (!ayahs) return <p className="text-muted">جارٍ تحميل {QURAN_UNITS[unit].label}…</p>;

  return (
    <article lang="ar" className="rounded-2xl bg-card p-5 text-justify text-xl leading-[2.4] shadow-sm">
      {ayahs.map((a, i) => (
        <Fragment key={a.number}>
          {(i === 0 || a.numberInSurah === 1) && (
            <h3 className="my-4 rounded-xl bg-primary/10 py-2 text-center text-base font-bold text-primary">
              {a.surahName}
            </h3>
          )}
          <span>{a.text} </span>
          <span className="text-base text-secondary" aria-label={`آية ${a.numberInSurah}`}>
            ﴿{a.numberInSurah.toLocaleString("ar-EG")}﴾{" "}
          </span>
        </Fragment>
      ))}
    </article>
  );
}
