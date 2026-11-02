import { isoDay } from "@/lib/adhkar";
import { db, type TaskRow } from "@/lib/dexie-db";

export type TaskView = "today" | "week" | "all" | "archived";
export type Priority = TaskRow["priority"];
export type Repeat = TaskRow["repeat"];

export const PRIORITY_LABELS: Record<Priority, string> = { high: "عالية", medium: "متوسطة", low: "منخفضة" };
export const REPEAT_LABELS: Record<Repeat, string> = {
  none: "بدون تكرار",
  daily: "يوميًا",
  weekly: "أسبوعيًا",
  monthly: "شهريًا",
};
export const VIEW_LABELS: Record<TaskView, string> = {
  today: "اليوم",
  week: "الأسبوع",
  all: "الكل",
  archived: "المؤرشفة",
};

const PRIORITY_ORDER: Record<Priority, number> = { high: 0, medium: 1, low: 2 };

export function hasTime(dueAt: string) {
  return dueAt.length > 10;
}

// التاريخ بلا وقت يُعامل كبداية اليوم
export function parseDue(dueAt: string) {
  return new Date(hasTime(dueAt) ? dueAt : `${dueAt}T00:00`);
}

function formatDue(date: Date, withTime: boolean) {
  const day = isoDay(date);
  if (!withTime) return day;
  const hh = String(date.getHours()).padStart(2, "0");
  const mm = String(date.getMinutes()).padStart(2, "0");
  return `${day}T${hh}:${mm}`;
}

// يضيف شهرًا مع تثبيت اليوم عند آخر الشهر: 31 يناير ← 28/29 فبراير، لا 3 مارس
function addMonth(date: Date) {
  const next = new Date(date);
  const day = next.getDate();
  next.setDate(1);
  next.setMonth(next.getMonth() + 1);
  const lastDay = new Date(next.getFullYear(), next.getMonth() + 1, 0).getDate();
  next.setDate(Math.min(day, lastDay));
  return next;
}

function step(date: Date, repeat: Repeat) {
  const next = new Date(date);
  if (repeat === "daily") next.setDate(next.getDate() + 1);
  else if (repeat === "weekly") next.setDate(next.getDate() + 7);
  else if (repeat === "monthly") return addMonth(date);
  return next;
}

// الموعد التالي بعد الآن؛ إن فاتت عدة دورات نتجاوزها كلها
export function nextOccurrence(dueAt: string, repeat: Repeat, now = new Date()) {
  const withTime = hasTime(dueAt);
  let date = step(parseDue(dueAt), repeat);
  const threshold = withTime ? now : new Date(`${isoDay(now)}T00:00`);
  while (date <= threshold) date = step(date, repeat);
  return formatDue(date, withTime);
}

// آخر دورة حلّ موعدها: المتكررة التي لم تُنجز تبقى تنبّه في دوراتها الجديدة
export function currentOccurrence(dueAt: string, repeat: Repeat, now = new Date()) {
  let date = parseDue(dueAt);
  if (repeat === "none" || date > now) return dueAt;
  for (let next = step(date, repeat); next <= now; next = step(next, repeat)) date = next;
  return formatDue(date, hasTime(dueAt));
}

// الموعد المعروض: للمتكررة غير المنجزة هو دورتها الحالية لا أول موعد فاتها
export function displayDue(task: TaskRow, now = new Date()) {
  if (!task.dueAt) return undefined;
  return task.completed ? task.dueAt : currentOccurrence(task.dueAt, task.repeat, now);
}

// ذات الوقت تتأخر بعد وقتها، وذات التاريخ فقط بعد انتهاء يومها
export function isOverdue(task: TaskRow, now = new Date()) {
  const dueAt = displayDue(task, now);
  if (!dueAt || task.completed) return false;
  const limit = hasTime(dueAt) ? now : new Date(`${isoDay(now)}T00:00`);
  return parseDue(dueAt) < limit;
}

export function matchesView(task: TaskRow, view: TaskView, now = new Date()) {
  if (view === "archived") return task.archived;
  if (task.archived) return false;
  if (view === "all") return true;
  if (!task.dueAt) return false;

  const due = parseDue(task.dueAt);
  const startOfToday = new Date(`${isoDay(now)}T00:00`);
  const days = view === "today" ? 1 : 7;
  const end = new Date(startOfToday);
  end.setDate(end.getDate() + days);

  // المتأخرة غير المنجزة تظهر في اليوم والأسبوع حتى تُنجز
  const overdue = !task.completed && due < startOfToday;
  return overdue || (due >= startOfToday && due < end);
}

export function filterTasks(
  tasks: TaskRow[],
  opts: { view: TaskView; search: string; priority: Priority | "all"; category: string },
  now = new Date()
) {
  const q = opts.search.trim().toLowerCase();
  return tasks
    .filter((t) => matchesView(t, opts.view, now))
    .filter((t) => opts.priority === "all" || t.priority === opts.priority)
    .filter((t) => !opts.category || t.category === opts.category)
    .filter(
      (t) => !q || t.title.toLowerCase().includes(q) || (t.description ?? "").toLowerCase().includes(q)
    )
    .sort(compareTasks);
}

// غير المنجزة أولًا، ثم الأقرب موعدًا (بلا موعد في الآخر)، ثم الأعلى أولوية
function compareTasks(a: TaskRow, b: TaskRow) {
  if (a.completed !== b.completed) return a.completed ? 1 : -1;
  const da = a.dueAt ? parseDue(a.dueAt).getTime() : Infinity;
  const dbt = b.dueAt ? parseDue(b.dueAt).getTime() : Infinity;
  if (da !== dbt) return da - dbt;
  return PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority];
}

export function categoriesOf(tasks: TaskRow[]) {
  return [...new Set(tasks.map((t) => t.category).filter((c): c is string => !!c))].sort();
}

export type TaskInput = Omit<TaskRow, "id" | "createdAt" | "completed" | "archived">;

export async function saveTask(input: TaskInput, id?: number) {
  if (id === undefined) {
    return db.tasks.add({ ...input, completed: false, archived: false, createdAt: new Date().toISOString() });
  }
  await db.tasks.update(id, input);
  return id;
}

// إنجاز المهمة المتكررة ينقل موعدها للدورة التالية بدل إغلاقها، ويُرجع الموعد الجديد
export async function toggleComplete(task: TaskRow): Promise<string | null> {
  if (task.id === undefined) return null;
  if (!task.completed && task.repeat !== "none" && task.dueAt) {
    const dueAt = nextOccurrence(task.dueAt, task.repeat);
    await db.tasks.update(task.id, { dueAt });
    return dueAt;
  }
  await db.tasks.update(task.id, { completed: !task.completed });
  return null;
}

// نافذة إطلاق تنبيه المهمة: إن فُتح التطبيق بعد الموعد بأكثر منها لا يُطلق التنبيه
const TASK_ALERT_WINDOW_MS = 30 * 60 * 1000;

export interface TaskAlert {
  key: string;
  title: string;
  body: string;
  sound: boolean;
}

const taskAlertKey = (id: number | undefined, dueAt: string) => `task|${id}|${dueAt}`;

// المفتاح يشمل موعد الدورة، فالمهمة المتكررة تنبّه في كل دورة حتى لو لم تُنجز السابقة
export function getDueTaskAlerts(tasks: TaskRow[], now: Date, fired: Set<string>): TaskAlert[] {
  const alerts: TaskAlert[] = [];
  for (const t of tasks) {
    if (!t.remind || t.completed || t.archived || !t.dueAt || !hasTime(t.dueAt)) continue;
    const occurrence = currentOccurrence(t.dueAt, t.repeat, now);
    const diff = now.getTime() - parseDue(occurrence).getTime();
    const key = taskAlertKey(t.id, occurrence);
    if (diff < 0 || diff >= TASK_ALERT_WINDOW_MS || fired.has(key)) continue;
    alerts.push({ key, title: `مهمة: ${t.title}`, body: t.description ?? "حان موعد المهمة", sound: t.remindSound });
  }
  return alerts;
}

// عند تغيّر اليوم تُمسح المفاتيح، إلا مفاتيح المهام التي ما زالت في نافذة التنبيه
// كي لا تتكرر مهمة الساعة 23:50 بعد منتصف الليل
export function carryOverTaskKeys(keys: Iterable<string>, now: Date) {
  return [...keys].filter((key) => {
    if (!key.startsWith("task|")) return false;
    const dueAt = key.split("|")[2];
    return !!dueAt && now.getTime() - parseDue(dueAt).getTime() < TASK_ALERT_WINDOW_MS;
  });
}

export async function setArchived(id: number, archived: boolean) {
  await db.tasks.update(id, { archived });
}

export async function deleteTask(id: number) {
  await db.tasks.delete(id);
}
