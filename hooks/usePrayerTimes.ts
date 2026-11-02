"use client";

import { useGeolocation } from "@/hooks/useGeolocation";
import { usePrayerTimesStore } from "@/store/prayer-times-store";

// يقرأ المواقيت المشتركة فقط، والجلب يتم في PrayerTimesSync
export function usePrayerTimes() {
  const data = usePrayerTimesStore((s) => s.data);
  const error = usePrayerTimesStore((s) => s.error);
  const loading = usePrayerTimesStore((s) => s.loading);
  const { error: geoError, retry } = useGeolocation();

  return { data, error: error ?? geoError, loading, retryLocation: retry };
}
