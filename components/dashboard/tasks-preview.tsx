"use client";

import Link from "next/link";
import { TaskItem } from "@/components/tasks/task-item";
import type { TaskRow } from "@/lib/dexie-db";

const PREVIEW_LIMIT = 4;

// أقرب مهام اليوم غير المنجزة، مع إنجاز سريع دون مغادرة الرئيسية
export function TasksPreview({
  tasks,
  now,
  onEdit,
}: {
  tasks: TaskRow[];
  now: Date;
  onEdit: (task: TaskRow) => void;
}) {
  const pending = tasks.filter((t) => !t.completed);

  return (
    <section aria-labelledby="tasks-preview-title" className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <h2 id="tasks-preview-title" className="text-lg font-semibold">
          مهام اليوم
        </h2>
        <Link href="/tasks" className="text-sm text-primary hover:underline">
          كل المهام ←
        </Link>
      </div>

      {pending.length === 0 ? (
        <p className="rounded-2xl bg-card p-5 text-center text-sm text-muted">لا مهام متبقية اليوم</p>
      ) : (
        <ul aria-label="مهام اليوم المتبقية" className="flex flex-col gap-3">
          {pending.slice(0, PREVIEW_LIMIT).map((t) => (
            <TaskItem key={t.id} task={t} now={now} onEdit={onEdit} />
          ))}
        </ul>
      )}
      {pending.length > PREVIEW_LIMIT && (
        <p className="text-center text-sm text-muted">
          {pending.length - PREVIEW_LIMIT === 1 ? "ومهمة أخرى" : `و${pending.length - PREVIEW_LIMIT} مهام أخرى`}
        </p>
      )}
    </section>
  );
}
