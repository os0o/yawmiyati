"use client";

import { useEffect, useRef, useState } from "react";
import { X } from "lucide-react";
import type { TaskRow } from "@/lib/dexie-db";
import { PRIORITY_LABELS, REPEAT_LABELS, saveTask, type Priority, type Repeat } from "@/lib/tasks";
import { cn } from "@/lib/utils";

interface FormState {
  title: string;
  description: string;
  date: string;
  time: string;
  priority: Priority;
  category: string;
  repeat: Repeat;
  remind: boolean;
  remindSound: boolean;
}

function toForm(task: TaskRow | null): FormState {
  const [date = "", time = ""] = task?.dueAt?.split("T") ?? [];
  return {
    title: task?.title ?? "",
    description: task?.description ?? "",
    date,
    time,
    priority: task?.priority ?? "medium",
    category: task?.category ?? "",
    repeat: task?.repeat ?? "none",
    remind: task?.remind ?? true,
    remindSound: task?.remindSound ?? true,
  };
}

const inputClass = "w-full rounded-xl border border-border bg-card px-3 py-2";

// نموذج إنشاء/تعديل مهمة داخل <dialog> أصلي: يحبس التركيز ويُغلق بـ Esc
export function TaskFormDialog({
  open,
  task,
  categories,
  onClose,
}: {
  open: boolean;
  task: TaskRow | null;
  categories: string[];
  onClose: () => void;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  const [form, setForm] = useState<FormState>(() => toForm(task));
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open) {
      setForm(toForm(task));
      setError(null);
      if (!dialog.open) dialog.showModal();
    } else if (dialog.open) {
      dialog.close();
    }
  }, [open, task]);

  // التنبيه يحتاج تاريخًا ووقتًا معًا
  const canRemind = !!form.date && !!form.time;

  const set = <K extends keyof FormState>(key: K, value: FormState[K]) => setForm((f) => ({ ...f, [key]: value }));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const title = form.title.trim();
    if (!title) return setError("العنوان مطلوب");
    if (form.repeat !== "none" && !form.date) return setError("المهمة المتكررة تحتاج تاريخًا");
    if (form.time && !form.date) return setError("حدد التاريخ مع الوقت");

    await saveTask(
      {
        title,
        description: form.description.trim() || undefined,
        dueAt: form.date ? (form.time ? `${form.date}T${form.time}` : form.date) : undefined,
        priority: form.priority,
        category: form.category.trim() || undefined,
        repeat: form.repeat,
        remind: canRemind && form.remind,
        remindSound: form.remindSound,
      },
      task?.id
    );
    onClose();
  };

  return (
    <dialog
      ref={ref}
      onClose={onClose}
      aria-labelledby="task-form-title"
      className="m-auto w-[calc(100%-2rem)] max-w-lg rounded-2xl bg-card p-0 text-foreground shadow-2xl backdrop:bg-black/40"
    >
      <form onSubmit={submit} className="flex flex-col gap-4 p-5" noValidate>
        <div className="flex items-center justify-between">
          <h2 id="task-form-title" className="text-lg font-bold">
            {task ? "تعديل المهمة" : "مهمة جديدة"}
          </h2>
          <button type="button" onClick={onClose} aria-label="إغلاق" className="rounded-xl p-1 text-muted hover:bg-border/40">
            <X aria-hidden className="size-5" />
          </button>
        </div>

        <label className="flex flex-col gap-1 text-sm">
          العنوان
          <input
            value={form.title}
            onChange={(e) => set("title", e.target.value)}
            required
            autoFocus
            className={inputClass}
          />
        </label>

        <label className="flex flex-col gap-1 text-sm">
          الوصف / ملاحظات
          <textarea
            value={form.description}
            onChange={(e) => set("description", e.target.value)}
            rows={3}
            className={inputClass}
          />
        </label>

        <div className="grid grid-cols-2 gap-3">
          <label className="flex flex-col gap-1 text-sm">
            التاريخ
            <input type="date" value={form.date} onChange={(e) => set("date", e.target.value)} className={inputClass} />
          </label>
          <label className="flex flex-col gap-1 text-sm">
            الوقت
            <input type="time" value={form.time} onChange={(e) => set("time", e.target.value)} className={inputClass} />
          </label>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <label className="flex flex-col gap-1 text-sm">
            الأولوية
            <select value={form.priority} onChange={(e) => set("priority", e.target.value as Priority)} className={inputClass}>
              {(Object.keys(PRIORITY_LABELS) as Priority[]).map((p) => (
                <option key={p} value={p}>
                  {PRIORITY_LABELS[p]}
                </option>
              ))}
            </select>
          </label>
          <label className="flex flex-col gap-1 text-sm">
            التكرار
            <select value={form.repeat} onChange={(e) => set("repeat", e.target.value as Repeat)} className={inputClass}>
              {(Object.keys(REPEAT_LABELS) as Repeat[]).map((r) => (
                <option key={r} value={r}>
                  {REPEAT_LABELS[r]}
                </option>
              ))}
            </select>
          </label>
        </div>

        <label className="flex flex-col gap-1 text-sm">
          التصنيف
          <input
            value={form.category}
            onChange={(e) => set("category", e.target.value)}
            list="task-categories"
            placeholder="مثل: عمل، منزل، دراسة"
            className={inputClass}
          />
          <datalist id="task-categories">
            {categories.map((c) => (
              <option key={c} value={c} />
            ))}
          </datalist>
        </label>

        <div className="flex flex-wrap items-center gap-5 text-sm">
          <label className={cn("flex items-center gap-2", !canRemind && "text-muted")}>
            <input
              type="checkbox"
              checked={canRemind && form.remind}
              disabled={!canRemind}
              onChange={(e) => set("remind", e.target.checked)}
              aria-describedby={canRemind ? undefined : "task-remind-hint"}
              className="size-4 accent-primary"
            />
            تنبيه في الموعد
          </label>
          <label className={cn("flex items-center gap-2", !(canRemind && form.remind) && "text-muted")}>
            <input
              type="checkbox"
              checked={form.remindSound}
              disabled={!canRemind || !form.remind}
              onChange={(e) => set("remindSound", e.target.checked)}
              className="size-4 accent-primary"
            />
            مع صوت
          </label>
          {!canRemind && (
            <span id="task-remind-hint" className="text-xs text-muted">
              حدد التاريخ والوقت لتفعيل التنبيه
            </span>
          )}
        </div>

        {error && (
          <p role="alert" className="text-sm text-red-600 dark:text-red-400">
            {error}
          </p>
        )}

        <div className="flex justify-end gap-2">
          <button type="button" onClick={onClose} className="rounded-xl border border-border px-4 py-2 text-sm">
            إلغاء
          </button>
          <button type="submit" className="rounded-xl bg-primary px-5 py-2 text-sm font-medium text-white">
            حفظ
          </button>
        </div>
      </form>
    </dialog>
  );
}
