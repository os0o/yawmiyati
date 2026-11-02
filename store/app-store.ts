import { create } from "zustand";
import { persist } from "zustand/middleware";

export type ThemeMode = "light" | "dark" | "system";

export interface ManualLocation {
  city: string;
  latitude: number;
  longitude: number;
}

interface AppState {
  theme: ThemeMode;
  calcMethod: number;
  school: number;
  manualLocation: ManualLocation | null;
  soundMuted: boolean;
  // مستوى صوت الأذان ونغمة المهام، بين 0 و 1
  volume: number;
  alertsEnabled: boolean;
  // تنبيهات الأذكار: الصباح بعد الفجر، والمساء بعد العصر، بعدد الدقائق المحدد
  adhkarAlertsEnabled: boolean;
  adhkarMorningOffset: number;
  adhkarEveningOffset: number;
  adhkarSound: boolean;
  setTheme: (theme: ThemeMode) => void;
  setCalcMethod: (method: number) => void;
  setSchool: (school: number) => void;
  setManualLocation: (loc: ManualLocation | null) => void;
  setSoundMuted: (muted: boolean) => void;
  setVolume: (volume: number) => void;
  setAlertsEnabled: (enabled: boolean) => void;
  setAdhkarAlertsEnabled: (enabled: boolean) => void;
  setAdhkarMorningOffset: (minutes: number) => void;
  setAdhkarEveningOffset: (minutes: number) => void;
  setAdhkarSound: (sound: boolean) => void;
}

// الافتراضي: أم القرى (4) لأن البلد السعودية
export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      theme: "system",
      calcMethod: 4,
      school: 0,
      manualLocation: null,
      soundMuted: false,
      volume: 0.8,
      alertsEnabled: true,
      adhkarAlertsEnabled: true,
      adhkarMorningOffset: 60,
      adhkarEveningOffset: 0,
      adhkarSound: true,
      setTheme: (theme) => set({ theme }),
      setCalcMethod: (calcMethod) => set({ calcMethod }),
      setSchool: (school) => set({ school }),
      setManualLocation: (manualLocation) => set({ manualLocation }),
      setSoundMuted: (soundMuted) => set({ soundMuted }),
      setVolume: (volume) => set({ volume: Math.min(1, Math.max(0, volume)) }),
      setAlertsEnabled: (alertsEnabled) => set({ alertsEnabled }),
      setAdhkarAlertsEnabled: (adhkarAlertsEnabled) => set({ adhkarAlertsEnabled }),
      setAdhkarMorningOffset: (adhkarMorningOffset) => set({ adhkarMorningOffset }),
      setAdhkarEveningOffset: (adhkarEveningOffset) => set({ adhkarEveningOffset }),
      setAdhkarSound: (adhkarSound) => set({ adhkarSound }),
    }),
    { name: "yawmiyati-settings" }
  )
);
