"use client";

import { useLiveQuery } from "dexie-react-hooks";
import { PRAYER_NAMES, type PrayerName } from "@/lib/aladhan-api";
import { db, type PrayerSettingRow } from "@/lib/dexie-db";
import { defaultPrayerSettings } from "@/lib/prayer-alerts";

export type PrayerSettingsMap = Record<PrayerName, Omit<PrayerSettingRow, "prayer">>;

// إعدادات كل صلاة من Dexie، مع القيم الافتراضية للصلوات التي لم تُحفظ بعد
export function usePrayerSettings(): PrayerSettingsMap {
  const rows = useLiveQuery(() => db.prayer_settings.toArray(), []);
  const map = defaultPrayerSettings();

  for (const row of rows ?? []) {
    if (PRAYER_NAMES.includes(row.prayer)) {
      map[row.prayer] = { enabled: row.enabled, minutesBefore: row.minutesBefore, sound: row.sound };
    }
  }
  return map;
}

export async function updatePrayerSetting(
  prayer: PrayerName,
  patch: Partial<Omit<PrayerSettingRow, "prayer">>
) {
  const current = await db.prayer_settings.get(prayer);
  const base = current ?? { prayer, ...defaultPrayerSettings()[prayer] };
  await db.prayer_settings.put({ ...base, ...patch, prayer });
}
