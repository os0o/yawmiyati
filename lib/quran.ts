import { db } from "@/lib/dexie-db";

export type QuranUnit = "juz" | "hizb" | "page";

// الحزب = نصف جزء، والصفحات حسب مصحف المدينة (604 صفحة)
export const QURAN_UNITS: Record<QuranUnit, { total: number; label: string; plural: string; defaultPerDay: number }> = {
  juz: { total: 30, label: "الجزء", plural: "أجزاء", defaultPerDay: 1 },
  hizb: { total: 60, label: "الحزب", plural: "أحزاب", defaultPerDay: 1 },
  page: { total: 604, label: "الصفحة", plural: "صفحات", defaultPerDay: 20 },
};

// أرقام الوحدات (تبدأ من 1) لورد يبدأ من pointer، مع الالتفاف إلى أول المصحف بعد الختم
export function wirdUnits(pointer: number, perDay: number, unit: QuranUnit) {
  const total = QURAN_UNITS[unit].total;
  return Array.from({ length: Math.min(perDay, total) }, (_, i) => ((pointer + i) % total) + 1);
}

// عند تجاوز نهاية المصحف ينقسم الورد إلى مقطعين، مثل "الجزء 30 والجزء 1"
export function wirdLabel(units: number[], unit: QuranUnit) {
  const { label } = QURAN_UNITS[unit];
  const runs: number[][] = [];
  for (const n of units) {
    const last = runs[runs.length - 1];
    if (last && n === last[last.length - 1] + 1) last.push(n);
    else runs.push([n]);
  }
  return runs
    .map((r) => (r.length === 1 ? `${label} ${r[0]}` : `${label} ${r[0]} – ${r[r.length - 1]}`))
    .join(" و");
}

// الجزء التقريبي الذي يقع فيه موضع الوحدة، يُستخدم للفهرسة فقط
export function juzOf(unitNumber: number, unit: QuranUnit) {
  if (unit === "juz") return unitNumber;
  if (unit === "hizb") return Math.ceil(unitNumber / 2);
  return Math.min(30, Math.ceil((unitNumber / 604) * 30));
}

export function remainingDays(pointer: number, perDay: number, unit: QuranUnit) {
  return Math.ceil((QURAN_UNITS[unit].total - pointer) / perDay);
}

export interface Ayah {
  number: number;
  text: string;
  numberInSurah: number;
  surahNumber: number;
  surahName: string;
}

// يجلب نص الوحدة بالرسم العثماني من alquran.cloud، والـ Service Worker يخزنه للعمل دون اتصال.
// لا يوجد مسار للحزب في الـ API، فالحزب n = أرباع الأحزاب من 4n-3 إلى 4n
export async function fetchUnitText(unit: QuranUnit, n: number, signal?: AbortSignal): Promise<Ayah[]> {
  if (unit === "hizb") {
    const quarters = [3, 2, 1, 0].map((k) => 4 * n - k);
    const parts = await Promise.all(quarters.map((q) => fetchPath(`hizbQuarter/${q}`, signal)));
    return parts.flat();
  }
  return fetchPath(`${unit}/${n}`, signal);
}

async function fetchPath(path: string, signal?: AbortSignal): Promise<Ayah[]> {
  const res = await fetch(`https://api.alquran.cloud/v1/${path}/quran-uthmani`, { signal });
  if (!res.ok) throw new Error(`alquran.cloud request failed: ${res.status}`);
  const json = await res.json();
  return (json.data.ayahs as Array<Record<string, unknown>>).map((a) => {
    const surah = a.surah as { number: number; name: string };
    return {
      number: a.number as number,
      text: a.text as string,
      numberInSurah: a.numberInSurah as number,
      surahNumber: surah.number,
      surahName: surah.name,
    };
  });
}

// يسجل إنجاز ورد اليوم مرة واحدة فقط، ويعيد false إن كان مسجلًا من قبل
export async function recordWird(date: string, units: number[], unit: QuranUnit) {
  return db.transaction("rw", db.quran_progress, async () => {
    const existing = await db.quran_progress.get(date);
    if (existing?.completed) return false;
    await db.quran_progress.put({
      date,
      juz: juzOf(units[0], unit),
      completed: true,
      unit,
      start: units[0],
      count: units.length,
    });
    return true;
  });
}
