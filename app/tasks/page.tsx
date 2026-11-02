"use client";

import { useState } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import { Plus } from "lucide-react";
import { TaskFormDialog } from "@/components/tasks/task-form-dialog";
import { Button } from "@/components/ui/button";
import { TaskItem } from "@/components/tasks/task-item";
import { TaskToolbar, type TaskFilters } from "@/components/tasks/task-toolbar";
import { db, type TaskRow } from "@/lib/dexie-db";
import { useNow } from "@/hooks/useNow";
import { categoriesOf, filterTasks, VIEW_LABELS } from "@/lib/tasks";

export default function TasksPage() {
  const tasks = useLiveQuery(() => db.tasks.toArray(), [], undefined);
  const [filters, setFilters] = useState<TaskFilters>({ view: "today", search: "", priority: "all", category: "" });
  const [editing, setEditing] = useState<TaskRow | null>(null);
  const [formOpen, setFormOpen] = useState(false);

  const all = tasks ?? [];
  const categories = categoriesOf(all);
  const now = useNow();
  const visible = filterTasks(all, filters, now);

  const openForm = (task: TaskRow | null) => {
    setEditing(task);
    setFormOpen(true);
  };

  return (
    <div className="flex flex-col gap-6">
      <header className="flex items-center justify-between gap-4">
        <h1 className="text-2xl font-bold">المهام</h1>
        <Button onClick={() => openForm(null)} className="rounded-2xl">
          <Plus aria-hidden />
          مهمة جديدة
        </Button>
      </header>

      <TaskToolbar filters={filters} categories={categories} onChange={setFilters} />

      {tasks === undefined ? (
        <p className="text-muted">جارٍ التحميل…</p>
      ) : visible.length === 0 ? (
        <p className="rounded-2xl bg-card p-6 text-center text-muted">
          لا توجد مهام في «{VIEW_LABELS[filters.view]}»
          {filters.search || filters.priority !== "all" || filters.category ? " تطابق البحث" : ""}
        </p>
      ) : (
        <ul aria-label={`المهام: ${VIEW_LABELS[filters.view]}`} className="flex flex-col gap-3">
          {visible.map((t) => (
            <TaskItem key={t.id} task={t} now={now} onEdit={openForm} />
          ))}
        </ul>
      )}

      <TaskFormDialog open={formOpen} task={editing} categories={categories} onClose={() => setFormOpen(false)} />
    </div>
  );
}
