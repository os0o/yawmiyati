import adhkarData from "@/data/adhkar.json";
import { db, type AdhkarProgressRow } from "@/lib/dexie-db";

export interface Dhikr {
  id: number;
  text: string;
  count: number;
  // متوفران في أذكار الصباح والمساء فقط
  fadl?: string;
  source?: string;
}

export interface AdhkarCategory {
  id: number;
  category: string;
  items: Dhikr[];
}

export const ADHKAR_CATEGORIES: AdhkarCategory[] = adhkarData.categories;
export const ADHKAR_SOURCE = adhkarData.meta;

export type GroupKey = "morning" | "sleep" | "waking" | "afterPrayer" | "misc";

interface AdhkarGroup {
  key: GroupKey;
  label: string;
  names: readonly string[];
}

// تصنيفات الشاشة الرئيسية، وما لم يُذكر هنا يذهب إلى "متفرقات"
export const ADHKAR_GROUPS: readonly AdhkarGroup[] = [
  { key: "morning", label: "الصباح والمساء", names: ["أذكار الصباح", "أذكار المساء"] },
  {
    key: "sleep",
    label: "النوم",
    names: [
      "أذكار النوم",
      "الدعاء إذا تقلب ليلا",
      "دعاء الفزع في النوم و من بُلِيَ بالوحشة",
      "ما يفعل من رأى الرؤيا أو الحلم",
    ],
  },
  { key: "waking", label: "الاستيقاظ", names: ["أذكار الاستيقاظ من النوم"] },
  { key: "afterPrayer", label: "بعد الصلاة", names: ["الأذكار بعد السلام من الصلاة", "الذكر عقب السلام من الوتر"] },
  { key: "misc", label: "متفرقات", names: [] },
];

export function groupKeyOf(category: AdhkarCategory): GroupKey {
  const match = ADHKAR_GROUPS.find((g) => g.names.includes(category.category));
  return match?.key ?? "misc";
}

export function categoriesOf(key: GroupKey) {
  return ADHKAR_CATEGORIES.filter((c) => groupKeyOf(c) === key);
}

export function findCategory(id: number) {
  return ADHKAR_CATEGORIES.find((c) => c.id === id) ?? null;
}

// تاريخ بصيغة ثابتة YYYY-MM-DD لتخزين التقدم اليومي
export function isoDay(date: Date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export async function getProgress(date: string, category: number) {
  const rows = await db.adhkar_progress.filter((r) => r.date === date && r.category === category).toArray();
  return rows[0] ?? null;
}

// يحفظ عدّ الذكر الحالي، ويُكمل الذكر عند بلوغ عدده المطلوب.
// القراءة والكتابة داخل معاملة واحدة، فالضغطات السريعة لا تتداخل ولا تضيع
export async function tapDhikr(date: string, category: AdhkarCategory, dhikr: Dhikr) {
  await db.transaction("rw", db.adhkar_progress, async () => {
    const existing = (await getProgress(date, category.id)) ?? {
      date,
      category: category.id,
      completedItems: [],
      counts: {},
    };
    if (existing.completedItems.includes(dhikr.id)) return;

    const next = (existing.counts[dhikr.id] ?? 0) + 1;
    const row: AdhkarProgressRow = {
      ...existing,
      counts: { ...existing.counts, [dhikr.id]: next },
      completedItems:
        next >= dhikr.count ? [...existing.completedItems, dhikr.id] : existing.completedItems,
    };
    await db.adhkar_progress.put(row);
  });
}

export async function resetCategory(date: string, categoryId: number) {
  const row = await getProgress(date, categoryId);
  if (row?.id !== undefined) await db.adhkar_progress.delete(row.id);
}

// الأيام التي أكمل فيها المستخدم تصنيفًا كاملًا واحدًا على الأقل
export function adhkarDoneDays(rows: AdhkarProgressRow[]) {
  const doneDays = new Set<string>();
  for (const row of rows) {
    const category = findCategory(row.category);
    if (category && row.completedItems.length >= category.items.length) doneDays.add(row.date);
  }
  return doneDays;
}

// تصنيفا الصباح والمساء: مقياس الأذكار في الرئيسية، ووجهة تنبيهيهما
export const MORNING_CATEGORY = ADHKAR_CATEGORIES.find((c) => c.category === "أذكار الصباح") ?? null;
export const EVENING_CATEGORY = ADHKAR_CATEGORIES.find((c) => c.category === "أذكار المساء") ?? null;

export const categoryHref = (category: AdhkarCategory | null) => (category ? `/adhkar/${category.id}` : "/adhkar");
