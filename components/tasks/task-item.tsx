"use client";

import { Archive, ArchiveRestore, Bell, Pencil, Repeat2, Trash2 } from "lucide-react";
import type { TaskRow } from "@/lib/dexie-db";
import {
  PRIORITY_LABELS,
  REPEAT_LABELS,
  deleteTask,
  displayDue,
  hasTime,
  isOverdue,
  parseDue,
  setArchived,
  toggleComplete,
} from "@/lib/tasks";
import { cn } from "@/lib/utils";
import { useToastStore } from "@/store/toast-store";

const PRIORITY_STYLES = {
  high: "bg-red-500/15 text-red-700 dark:text-red-300",
  medium: "bg-secondary/20 text-amber-800 dark:text-amber-200",
  low: "bg-border text-muted",
} as const;

const dueFormat = new Intl.DateTimeFormat("ar", { weekday: "short", day: "numeric", month: "short" });
const timeFormat = new Intl.DateTimeFormat("ar", { hour: "numeric", minute: "2-digit" });

function formatDueText(dueAt: string) {
  const due = parseDue(dueAt);
  return hasTime(dueAt) ? `${dueFormat.format(due)} · ${timeFormat.format(due)}` : dueFormat.format(due);
}

function DueLabel({ task, now }: { task: TaskRow; now: Date }) {
  const dueAt = displayDue(task, now);
  if (!dueAt) return null;
  const overdue = isOverdue(task, now);
  return (
    <time dateTime={dueAt} className={cn("text-xs", overdue ? "font-semibold text-red-600 dark:text-red-400" : "text-muted")}>
      {formatDueText(dueAt)}
      {overdue && " · متأخرة"}
    </time>
  );
}

export function TaskItem({ task, now, onEdit }: { task: TaskRow; now: Date; onEdit: (task: TaskRow) => void }) {
  const id = task.id!;
  const iconButton = "rounded-xl p-2 text-muted hover:bg-border/40 hover:text-foreground";
  const push = useToastStore((s) => s.push);

  // الخانة تبقى فارغة للمتكررة، فنؤكد النقل برسالة
  const complete = async () => {
    const next = await toggleComplete(task);
    if (next) push({ title: `أُنجزت «${task.title}»`, body: `الموعد التالي: ${formatDueText(next)}`, snoozable: false });
  };

  return (
    <li className="flex items-start gap-3 rounded-2xl bg-card p-4 shadow-sm">
      <input
        type="checkbox"
        checked={task.completed}
        onChange={() => void complete()}
        aria-label={task.repeat !== "none" ? `إنجاز ${task.title} ونقلها للموعد التالي` : `إنجاز ${task.title}`}
        className="mt-1 size-5 shrink-0 accent-primary"
      />

      <div className="min-w-0 flex-1">
        <p className={cn("font-medium break-words", task.completed && "text-muted line-through")}>{task.title}</p>
        {task.description && <p className="mt-1 whitespace-pre-line text-sm text-muted">{task.description}</p>}
        <div className="mt-2 flex flex-wrap items-center gap-2">
          <DueLabel task={task} now={now} />
          <span className={cn("rounded-full px-2 py-0.5 text-xs", PRIORITY_STYLES[task.priority])}>
            {PRIORITY_LABELS[task.priority]}
          </span>
          {task.category && <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs text-primary">{task.category}</span>}
          {task.repeat !== "none" && (
            <span className="flex items-center gap-1 text-xs text-muted">
              <Repeat2 aria-hidden className="size-3.5" />
              {REPEAT_LABELS[task.repeat]}
            </span>
          )}
          {task.remind && <Bell aria-label="بتنبيه" className="size-3.5 text-muted" />}
        </div>
      </div>

      <div className="flex shrink-0 items-center">
        <button type="button" onClick={() => onEdit(task)} aria-label={`تعديل ${task.title}`} className={iconButton}>
          <Pencil aria-hidden className="size-4" />
        </button>
        <button
          type="button"
          onClick={() => void setArchived(id, !task.archived)}
          aria-label={task.archived ? `إلغاء أرشفة ${task.title}` : `أرشفة ${task.title}`}
          className={iconButton}
        >
          {task.archived ? <ArchiveRestore aria-hidden className="size-4" /> : <Archive aria-hidden className="size-4" />}
        </button>
        <button
          type="button"
          onClick={() => {
            if (window.confirm(`حذف «${task.title}» نهائيًا؟`)) void deleteTask(id);
          }}
          aria-label={`حذف ${task.title}`}
          className={cn(iconButton, "hover:text-red-600")}
        >
          <Trash2 aria-hidden className="size-4" />
        </button>
      </div>
    </li>
  );
}
