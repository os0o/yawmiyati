import { timeToDate, type PrayerTimings } from "@/lib/aladhan-api";
import { dayKey } from "@/lib/prayer-alerts";
import { EVENING_CATEGORY, MORNING_CATEGORY, categoryHref } from "@/lib/adhkar";

export interface AdhkarAlert {
  key: string;
  title: string;
  body: string;
  href: string;
}

// نافذة الإطلاق بعد الوقت المحدد، كما في تنبيهات الصلاة
const WINDOW_MS = 5 * 60 * 1000;

// تنبيه أذكار الصباح بعد الفجر، والمساء بعد العصر، بعدد الدقائق المحدد في الإعدادات
export function getDueAdhkarAlerts(params: {
  timings: PrayerTimings;
  now: Date;
  morningOffset: number;
  eveningOffset: number;
  fired: Set<string>;
}): AdhkarAlert[] {
  const { timings, now, morningOffset, eveningOffset, fired } = params;
  const day = dayKey(now);

  const slots = [
    {
      key: `${day}|adhkar-morning`,
      at: new Date(timeToDate(timings.Fajr, now).getTime() + morningOffset * 60_000),
      title: "أذكار الصباح",
      body: "حان وقت أذكار الصباح",
      href: categoryHref(MORNING_CATEGORY),
    },
    {
      key: `${day}|adhkar-evening`,
      at: new Date(timeToDate(timings.Asr, now).getTime() + eveningOffset * 60_000),
      title: "أذكار المساء",
      body: "حان وقت أذكار المساء",
      href: categoryHref(EVENING_CATEGORY),
    },
  ];

  return slots
    .filter((s) => now >= s.at && now.getTime() - s.at.getTime() < WINDOW_MS && !fired.has(s.key))
    .map(({ key, title, body, href }) => ({ key, title, body, href }));
}
