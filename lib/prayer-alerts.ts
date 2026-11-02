import { PRAYER_LABELS, PRAYER_NAMES, timeToDate, type PrayerName, type PrayerTimings } from "@/lib/aladhan-api";
import type { PrayerSettingRow } from "@/lib/dexie-db";

export type AlertKind = "pre" | "at";

export interface DueAlert {
  key: string;
  kind: AlertKind;
  prayer: PrayerName;
  title: string;
  body: string;
  sound: boolean;
}

// نافذة الإطلاق عند دخول الوقت: إذا تأخر فتح التطبيق أكثر من ذلك لا يُطلق التنبيه
const AT_WINDOW_MS = 5 * 60 * 1000;

export const DEFAULT_PRAYER_SETTING = {
  enabled: true,
  minutesBefore: 10,
  sound: true,
} as const;

export function defaultPrayerSettings(): Record<PrayerName, Omit<PrayerSettingRow, "prayer">> {
  return Object.fromEntries(
    PRAYER_NAMES.map((name) => [name, { ...DEFAULT_PRAYER_SETTING }])
  ) as Record<PrayerName, Omit<PrayerSettingRow, "prayer">>;
}

export function dayKey(date: Date) {
  return `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;
}

// يحسب التنبيهات المستحقة الآن، ويتجاهل ما أُطلق سابقًا اليوم عبر مفاتيح fired
export function getDueAlerts(params: {
  timings: PrayerTimings;
  now: Date;
  settings: Record<PrayerName, Omit<PrayerSettingRow, "prayer">>;
  fired: Set<string>;
}): DueAlert[] {
  const { timings, now, settings, fired } = params;
  const day = dayKey(now);
  const due: DueAlert[] = [];

  for (const prayer of PRAYER_NAMES) {
    const s = settings[prayer];
    if (!s.enabled) continue;

    const at = timeToDate(timings[prayer], now);
    const label = PRAYER_LABELS[prayer];

    if (s.minutesBefore > 0) {
      const preAt = new Date(at.getTime() - s.minutesBefore * 60_000);
      const key = `${day}|pre|${prayer}`;
      if (now >= preAt && now < at && !fired.has(key)) {
        due.push({
          key,
          kind: "pre",
          prayer,
          title: `بعد ${s.minutesBefore} دقيقة: ${label}`,
          body: `يبدأ وقت ${label} الساعة ${timings[prayer]}`,
          sound: false,
        });
      }
    }

    const atKey = `${day}|at|${prayer}`;
    if (now >= at && now.getTime() - at.getTime() < AT_WINDOW_MS && !fired.has(atKey)) {
      due.push({
        key: atKey,
        kind: "at",
        prayer,
        title: `حان وقت ${label}`,
        body: `الله أكبر، حان الآن وقت صلاة ${label}`,
        sound: s.sound,
      });
    }
  }

  return due;
}
