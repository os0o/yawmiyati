"use client";

import { useState } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { NextPrayerSlot } from "@/components/dashboard/next-prayer-slot";
import { StreaksCard } from "@/components/dashboard/streaks-card";
import { TasksPreview } from "@/components/dashboard/tasks-preview";
import { METRIC_ICONS, TodaySummary, type SummaryMetric } from "@/components/dashboard/today-summary";
import { TaskFormDialog } from "@/components/tasks/task-form-dialog";
import { useAdhkarProgress } from "@/hooks/useAdhkarProgress";
import { useMounted } from "@/hooks/useMounted";
import { useNow } from "@/hooks/useNow";
import { useQuranProgress } from "@/hooks/useQuranProgress";
import { EVENING_CATEGORY, MORNING_CATEGORY, categoryHref } from "@/lib/adhkar";
import { db, type TaskRow } from "@/lib/dexie-db";
import { categoriesOf, filterTasks } from "@/lib/tasks";

export default function HomePage() {
  const mounted = useMounted();
  const now = useNow();
  const { today, todayRows, doneDays: adhkarDays } = useAdhkarProgress();
  const { doneDates: quranDays, doneToday: quranDone } = useQuranProgress();
  const tasks = useLiveQuery(() => db.tasks.toArray(), [], []);
  const [editing, setEditing] = useState<TaskRow | null>(null);

  // تاريخ اليوم والتقدم المحفوظ لا يتوفران أثناء البناء المسبق
  if (!mounted) return <p className="text-muted">جارٍ التحميل…</p>;

  const todayTasks = filterTasks(tasks, { view: "today", search: "", priority: "all", category: "" }, now);
  const tasksDone = todayTasks.filter((t) => t.completed).length;

  // مقياس الأذكار: الصباح والمساء معًا، والرابط إلى الأنسب لوقت اليوم
  const pair = [MORNING_CATEGORY, EVENING_CATEGORY].filter((c) => c !== null);
  const adhkarDone = pair.reduce(
    (sum, c) => sum + (todayRows.find((r) => r.category === c.id)?.completedItems.length ?? 0),
    0
  );
  const adhkarTotal = pair.reduce((sum, c) => sum + c.items.length, 0);

  const metrics: SummaryMetric[] = [
    {
      key: "adhkar",
      href: categoryHref(now.getHours() < 12 ? MORNING_CATEGORY : EVENING_CATEGORY),
      label: "أذكار الصباح والمساء",
      icon: METRIC_ICONS.adhkar,
      value: adhkarTotal ? adhkarDone / adhkarTotal : null,
      detail: `${adhkarDone} من ${adhkarTotal}`,
    },
    {
      key: "quran",
      href: "/quran",
      label: "ورد القرآن",
      icon: METRIC_ICONS.quran,
      value: quranDone ? 1 : 0,
      detail: quranDone ? "تم الإنجاز" : "لم يُنجز بعد",
    },
    {
      key: "tasks",
      href: "/tasks",
      label: "المهام",
      icon: METRIC_ICONS.tasks,
      value: todayTasks.length ? tasksDone / todayTasks.length : null,
      detail: todayTasks.length ? `${tasksDone} من ${todayTasks.length}` : "لا مهام اليوم",
    },
  ];

  return (
    <div className="flex flex-col gap-6">
      <DashboardHeader now={now} />
      <NextPrayerSlot />
      <TodaySummary metrics={metrics} />
      <StreaksCard today={today} adhkarDays={adhkarDays} quranDays={quranDays} />
      <TasksPreview tasks={todayTasks} now={now} onEdit={setEditing} />
      <TaskFormDialog
        open={editing !== null}
        task={editing}
        categories={categoriesOf(tasks)}
        onClose={() => setEditing(null)}
      />
    </div>
  );
}
