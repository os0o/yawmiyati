import { create } from "zustand";
import type { PrayerTimesResult } from "@/lib/aladhan-api";

interface PrayerTimesState {
  data: PrayerTimesResult | null;
  error: string | null;
  loading: boolean;
}

// مواقيت اليوم مشتركة بين صفحة الصلوات ومحرك التنبيهات، تُجلب مرة واحدة من PrayerTimesSync
export const usePrayerTimesStore = create<PrayerTimesState>()(() => ({
  data: null,
  error: null,
  loading: false,
}));
