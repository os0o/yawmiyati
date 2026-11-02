import { create } from "zustand";
import { persist } from "zustand/middleware";
import { isoDay } from "@/lib/adhkar";
import { QURAN_UNITS, type QuranUnit } from "@/lib/quran";

interface QuranState {
  unit: QuranUnit;
  perDay: number;
  // عدد الوحدات المقروءة في الختمة الحالية، دائمًا أقل من مجموع الوحدات
  pointer: number;
  startDate: string | null;
  khatmas: number;
  reminderEnabled: boolean;
  reminderTime: string;
  reminderSound: boolean;
  setUnit: (unit: QuranUnit) => void;
  setPerDay: (perDay: number) => void;
  advance: (today: string) => void;
  resetKhatma: () => void;
  setReminderEnabled: (enabled: boolean) => void;
  setReminderTime: (time: string) => void;
  setReminderSound: (sound: boolean) => void;
}

// الافتراضي: جزء يوميًا = ختمة شهرية
export const useQuranStore = create<QuranState>()(
  persist(
    (set, get) => ({
      unit: "juz",
      perDay: 1,
      pointer: 0,
      startDate: null,
      khatmas: 0,
      reminderEnabled: true,
      reminderTime: "21:00",
      reminderSound: true,
      // يحوّل الموضع إلى الوحدة الجديدة بالنسبة، حتى لا يضيع التقدم
      setUnit: (unit) => {
        const { unit: old, pointer } = get();
        if (unit === old) return;
        const converted = Math.floor((pointer * QURAN_UNITS[unit].total) / QURAN_UNITS[old].total);
        set({ unit, pointer: converted, perDay: QURAN_UNITS[unit].defaultPerDay });
      },
      setPerDay: (perDay) => set({ perDay: Math.max(1, perDay) }),
      advance: (today) => {
        const { pointer, perDay, unit, startDate, khatmas } = get();
        const total = QURAN_UNITS[unit].total;
        const next = pointer + perDay;
        if (next >= total) {
          // اكتملت ختمة اليوم: تبدأ الختمة التالية من الغد
          const tomorrow = new Date(`${today}T00:00:00`);
          tomorrow.setDate(tomorrow.getDate() + 1);
          set({ pointer: next % total, khatmas: khatmas + 1, startDate: isoDay(tomorrow) });
        } else {
          set({ pointer: next, startDate: startDate ?? today });
        }
      },
      resetKhatma: () => set({ pointer: 0, startDate: null }),
      setReminderEnabled: (reminderEnabled) => set({ reminderEnabled }),
      setReminderTime: (reminderTime) => set({ reminderTime }),
      setReminderSound: (reminderSound) => set({ reminderSound }),
    }),
    { name: "yawmiyati-quran" }
  )
);
