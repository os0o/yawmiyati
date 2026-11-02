import { db } from "@/lib/dexie-db";
import { isoDay } from "@/lib/adhkar";

const APP_ID = "yawmiyati";
const BACKUP_VERSION = 1;

// مفاتيح localStorage التي تحفظها مخازن Zustand
const STORAGE_KEYS = ["yawmiyati-settings", "yawmiyati-quran"] as const;

const TABLES = ["settings", "tasks", "adhkar_progress", "quran_progress", "notifications_log", "prayer_settings"] as const;
type TableName = (typeof TABLES)[number];

// حالة مؤقتة مرتبطة بلحظتها (الإشعارات المؤجلة والتنبيهات المُطلقة اليوم):
// استرجاعها لاحقًا يُظهر إشعارات قديمة فورًا، فلا تُصدَّر ولا تُستورد
const TRANSIENT_SETTINGS = new Set(["toasts.snoozed", "alerts.fired"]);

type Row = Record<string, unknown>;
const isString = (v: unknown) => typeof v === "string";
const isNumber = (v: unknown) => typeof v === "number" && Number.isFinite(v);

// الحقول التي تعتمد عليها الصفحات مباشرة، فالصف الناقص يُرفض بدل أن يكسر الواجهة
const ROW_CHECKS: Record<TableName, (row: Row) => boolean> = {
  settings: (r) => isString(r.key),
  tasks: (r) => isString(r.title) && isString(r.priority) && isString(r.repeat) && (r.dueAt === undefined || isString(r.dueAt)),
  adhkar_progress: (r) => isString(r.date) && isNumber(r.category) && Array.isArray(r.completedItems),
  quran_progress: (r) => isString(r.date) && isString(r.unit) && isNumber(r.start) && isNumber(r.count),
  notifications_log: (r) => isString(r.at) && isString(r.type) && isString(r.message),
  prayer_settings: (r) => isString(r.prayer) && isNumber(r.minutesBefore),
};

const TABLE_LABELS: Record<TableName, string> = {
  settings: "الإعدادات",
  tasks: "المهام",
  adhkar_progress: "تقدم الأذكار",
  quran_progress: "سجل الورد",
  notifications_log: "سجل التنبيهات",
  prayer_settings: "إعدادات الصلوات",
};

const withoutTransient = (rows: Row[]) => rows.filter((r) => !TRANSIENT_SETTINGS.has(String(r.key)));

export interface Backup {
  app: typeof APP_ID;
  version: number;
  exportedAt: string;
  storage: Partial<Record<(typeof STORAGE_KEYS)[number], string>>;
  tables: Record<TableName, Row[]>;
}

export async function createBackup(): Promise<Backup> {
  const tables = {} as Backup["tables"];
  for (const name of TABLES) {
    tables[name] = (await db.table(name).toArray()) as Row[];
  }
  tables.settings = withoutTransient(tables.settings);

  const storage: Backup["storage"] = {};
  for (const key of STORAGE_KEYS) {
    const value = localStorage.getItem(key);
    if (value !== null) storage[key] = value;
  }

  return { app: APP_ID, version: BACKUP_VERSION, exportedAt: new Date().toISOString(), storage, tables };
}

export async function downloadBackup() {
  const backup = await createBackup();
  const blob = new Blob([JSON.stringify(backup, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `yawmiyati-backup-${isoDay(new Date())}.json`;
  link.click();
  // بعض المتصفحات تبدأ التنزيل بعد انتهاء النقر، فنؤجل تحرير الرابط
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

const isRecord = (v: unknown): v is Record<string, unknown> => typeof v === "object" && v !== null && !Array.isArray(v);

// يتحقق من بنية الملف قبل أي كتابة، فالملف التالف لا يمسح البيانات الحالية
export function parseBackup(text: string): Backup {
  let data: unknown;
  try {
    data = JSON.parse(text);
  } catch {
    throw new Error("الملف ليس JSON صالحًا");
  }

  if (!isRecord(data) || data.app !== APP_ID) throw new Error("الملف ليس نسخة احتياطية من يومياتي");
  if (typeof data.version !== "number" || data.version > BACKUP_VERSION) {
    throw new Error("النسخة الاحتياطية من إصدار أحدث من التطبيق");
  }
  if (!isRecord(data.tables)) throw new Error("الملف لا يحتوي على بيانات");

  const tables = {} as Backup["tables"];
  for (const name of TABLES) {
    const rows = data.tables[name] ?? [];
    if (!Array.isArray(rows) || !rows.every((r) => isRecord(r) && ROW_CHECKS[name](r))) {
      throw new Error(`بيانات «${TABLE_LABELS[name]}» في الملف غير صالحة`);
    }
    tables[name] = rows;
  }
  tables.settings = withoutTransient(tables.settings);

  const storage: Backup["storage"] = {};
  if (isRecord(data.storage)) {
    for (const key of STORAGE_KEYS) {
      const value = data.storage[key];
      if (typeof value === "string") storage[key] = value;
    }
  }

  return {
    app: APP_ID,
    version: data.version,
    exportedAt: typeof data.exportedAt === "string" ? data.exportedAt : "",
    storage,
    tables,
  };
}

// يستبدل كل البيانات الحالية بالنسخة داخل معاملة واحدة: إما تنجح كلها أو لا يتغير شيء
export async function restoreBackup(backup: Backup) {
  await db.transaction("rw", TABLES.map((name) => db.table(name)), async () => {
    for (const name of TABLES) {
      // نُبقي الحالة المؤقتة الحالية، كي لا تتكرر تنبيهات اليوم التي أُطلقت قبل الاستيراد
      if (name === "settings") await db.settings.filter((r) => !TRANSIENT_SETTINGS.has(r.key)).delete();
      else await db.table(name).clear();
      await db.table(name).bulkPut(backup.tables[name]);
    }
  });
  for (const key of STORAGE_KEYS) {
    const value = backup.storage[key];
    if (value === undefined) localStorage.removeItem(key);
    else localStorage.setItem(key, value);
  }
}

// يمسح كل بيانات التطبيق على هذا الجهاز
export async function resetAllData() {
  await db.transaction("rw", TABLES.map((name) => db.table(name)), async () => {
    for (const name of TABLES) await db.table(name).clear();
  });
  for (const key of STORAGE_KEYS) localStorage.removeItem(key);
}

export function backupSummary(backup: Backup) {
  return {
    tasks: backup.tables.tasks.length,
    quranDays: backup.tables.quran_progress.length,
    adhkarDays: new Set(backup.tables.adhkar_progress.map((r) => r.date)).size,
  };
}
