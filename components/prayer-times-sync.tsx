"use client";

import { useEffect } from "react";
import { fetchPrayerTimes } from "@/lib/aladhan-api";
import { useGeolocation } from "@/hooks/useGeolocation";
import { useToday } from "@/hooks/useToday";
import { useAppStore } from "@/store/app-store";
import { usePrayerTimesStore } from "@/store/prayer-times-store";
import { useLocationStore } from "@/store/location-store";

// المكون الوحيد الذي يطلب الموقع ويجلب المواقيت، ويعمل في AppShell دائمًا
export function PrayerTimesSync() {
  const manual = useAppStore((s) => s.manualLocation);
  const calcMethod = useAppStore((s) => s.calcMethod);
  const school = useAppStore((s) => s.school);
  const request = useLocationStore((s) => s.request);
  const { coords } = useGeolocation();
  const today = useToday();

  useEffect(() => {
    if (!manual) request();
  }, [manual, request]);

  // يعاد الجلب عند تغيّر الموقع أو الطريقة أو اليوم
  useEffect(() => {
    if (!coords) return;
    const controller = new AbortController();
    usePrayerTimesStore.setState({ loading: true });

    fetchPrayerTimes({ ...coords, method: calcMethod, school, date: new Date() }, controller.signal)
      .then((result) => usePrayerTimesStore.setState({ data: result, error: null }))
      .catch(() => {
        if (controller.signal.aborted) return;
        usePrayerTimesStore.setState({ error: "تعذر جلب المواقيت، تحقق من الاتصال بالإنترنت" });
      })
      .finally(() => {
        if (!controller.signal.aborted) usePrayerTimesStore.setState({ loading: false });
      });

    return () => controller.abort();
  }, [coords, calcMethod, school, today]);

  return null;
}
