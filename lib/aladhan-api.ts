export const PRAYER_NAMES = ["Fajr", "Dhuhr", "Asr", "Maghrib", "Isha"] as const;
export type PrayerName = (typeof PRAYER_NAMES)[number];

export const PRAYER_LABELS: Record<PrayerName, string> = {
  Fajr: "الفجر",
  Dhuhr: "الظهر",
  Asr: "العصر",
  Maghrib: "المغرب",
  Isha: "العشاء",
};

// طرق الحساب في Aladhan، أشهرها 4 = أم القرى
export const CALC_METHODS = [
  { id: 4, label: "أم القرى (السعودية)" },
  { id: 5, label: "الهيئة المصرية العامة للمساحة" },
  { id: 3, label: "رابطة العالم الإسلامي" },
  { id: 2, label: "الجمعية الإسلامية لأمريكا الشمالية" },
  { id: 1, label: "جامعة كراتشي" },
] as const;

export const SCHOOLS = [
  { id: 0, label: "شافعي / مالكي / حنبلي" },
  { id: 1, label: "حنفي" },
] as const;

export interface PrayerTimings {
  Fajr: string;
  Sunrise: string;
  Dhuhr: string;
  Asr: string;
  Maghrib: string;
  Isha: string;
}

export interface PrayerTimesResult {
  timings: PrayerTimings;
  date: string;
  hijri: string;
}

export interface PrayerQuery {
  latitude: number;
  longitude: number;
  method: number;
  school: number;
  date: Date;
}

function formatAladhanDate(date: Date) {
  const dd = String(date.getDate()).padStart(2, "0");
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  return `${dd}-${mm}-${date.getFullYear()}`;
}

// Aladhan يضيف أحيانًا اللاحقة "(+03)" بعد الوقت، نحذفها
function cleanTime(raw: string) {
  return raw.split(" ")[0];
}

export async function fetchPrayerTimes(query: PrayerQuery, signal?: AbortSignal): Promise<PrayerTimesResult> {
  const url = new URL(`https://api.aladhan.com/v1/timings/${formatAladhanDate(query.date)}`);
  url.searchParams.set("latitude", String(query.latitude));
  url.searchParams.set("longitude", String(query.longitude));
  url.searchParams.set("method", String(query.method));
  url.searchParams.set("school", String(query.school));

  const res = await fetch(url, { signal });
  if (!res.ok) throw new Error(`Aladhan request failed: ${res.status}`);

  const json = await res.json();
  const t = json.data.timings as Record<string, string>;
  const hijriDate = json.data.date.hijri;

  return {
    timings: {
      Fajr: cleanTime(t.Fajr),
      Sunrise: cleanTime(t.Sunrise),
      Dhuhr: cleanTime(t.Dhuhr),
      Asr: cleanTime(t.Asr),
      Maghrib: cleanTime(t.Maghrib),
      Isha: cleanTime(t.Isha),
    },
    date: json.data.date.readable,
    hijri: `${hijriDate.day} ${hijriDate.month.ar} ${hijriDate.year}هـ`,
  };
}

// يحوّل "HH:mm" إلى Date لليوم المحدد
export function timeToDate(hhmm: string, base: Date) {
  const [h, m] = hhmm.split(":").map(Number);
  const d = new Date(base);
  d.setHours(h, m, 0, 0);
  return d;
}
