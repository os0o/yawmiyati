import Dexie, { type Table } from "dexie";

export interface SettingRow {
  key: string;
  value: unknown;
}

export interface TaskRow {
  id?: number;
  title: string;
  description?: string;
  // تاريخ محلي "YYYY-MM-DD" أو تاريخ ووقت "YYYY-MM-DDTHH:mm"، بلا منطقة زمنية
  dueAt?: string;
  priority: "low" | "medium" | "high";
  category?: string;
  repeat: "none" | "daily" | "weekly" | "monthly";
  completed: boolean;
  archived: boolean;
  remind: boolean;
  remindSound: boolean;
  createdAt: string;
}

export interface AdhkarProgressRow {
  id?: number;
  date: string;
  category: number;
  completedItems: number[];
  // عدد التكرارات الحالي لكل ذكر لم يكتمل بعد
  counts: Record<number, number>;
}

export interface QuranProgressRow {
  date: string;
  // رقم الجزء الذي بدأ منه ورد اليوم (للفهرسة)، والوحدة الفعلية في unit
  juz: number;
  completed: boolean;
  unit: "juz" | "hizb" | "page";
  start: number;
  count: number;
}

export interface NotificationLogRow {
  id?: number;
  at: string;
  type: "prayer" | "adhkar" | "quran" | "task";
  message: string;
}

export interface PrayerSettingRow {
  prayer: "Fajr" | "Dhuhr" | "Asr" | "Maghrib" | "Isha";
  enabled: boolean;
  minutesBefore: number;
  sound: boolean;
}

class YawmiyatiDB extends Dexie {
  settings!: Table<SettingRow, string>;
  tasks!: Table<TaskRow, number>;
  adhkar_progress!: Table<AdhkarProgressRow, number>;
  quran_progress!: Table<QuranProgressRow, string>;
  notifications_log!: Table<NotificationLogRow, number>;
  prayer_settings!: Table<PrayerSettingRow, string>;

  constructor() {
    super("yawmiyati");
    this.version(1).stores({
      settings: "key",
      tasks: "++id, dueAt, archived",
      adhkar_progress: "++id, [date+category]",
      quran_progress: "date, juz",
      notifications_log: "++id, at, type",
      prayer_settings: "prayer",
    });
  }
}

export const db = new YawmiyatiDB();
