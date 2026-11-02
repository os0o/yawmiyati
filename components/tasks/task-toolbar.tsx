"use client";

import { Search } from "lucide-react";
import { PRIORITY_LABELS, VIEW_LABELS, type Priority, type TaskView } from "@/lib/tasks";
import { cn } from "@/lib/utils";

export interface TaskFilters {
  view: TaskView;
  search: string;
  priority: Priority | "all";
  // نص فارغ = كل التصنيفات؛ لا يتعارض مع أي تصنيف لأن التصنيفات تُحفظ بلا فراغات
  category: string;
}

const selectClass = "rounded-xl border border-border bg-card px-3 py-2 text-sm";

// تبويبات العرض + البحث + فلترة الأولوية والتصنيف
export function TaskToolbar({
  filters,
  categories,
  onChange,
}: {
  filters: TaskFilters;
  categories: string[];
  onChange: (next: TaskFilters) => void;
}) {
  const update = (patch: Partial<TaskFilters>) => onChange({ ...filters, ...patch });

  return (
    <div className="flex flex-col gap-3">
      <div role="tablist" aria-label="عرض المهام" className="flex gap-1 rounded-2xl bg-border/40 p-1">
        {(Object.keys(VIEW_LABELS) as TaskView[]).map((v) => (
          <button
            key={v}
            type="button"
            role="tab"
            aria-selected={filters.view === v}
            onClick={() => update({ view: v })}
            className={cn(
              "flex-1 rounded-xl px-2 py-2 text-sm transition-colors",
              filters.view === v ? "bg-card font-semibold text-primary shadow-sm" : "text-muted"
            )}
          >
            {VIEW_LABELS[v]}
          </button>
        ))}
      </div>

      <div className="flex flex-wrap gap-2">
        <label className="relative min-w-40 flex-1">
          <span className="sr-only">بحث</span>
          <Search aria-hidden className="pointer-events-none absolute top-1/2 right-3 size-4 -translate-y-1/2 text-muted" />
          <input
            type="search"
            value={filters.search}
            onChange={(e) => update({ search: e.target.value })}
            placeholder="ابحث في المهام"
            className="w-full rounded-xl border border-border bg-card py-2 pr-9 pl-3 text-sm"
          />
        </label>
        <select
          aria-label="الأولوية"
          value={filters.priority}
          onChange={(e) => update({ priority: e.target.value as TaskFilters["priority"] })}
          className={selectClass}
        >
          <option value="all">كل الأولويات</option>
          {(Object.keys(PRIORITY_LABELS) as Priority[]).map((p) => (
            <option key={p} value={p}>
              {PRIORITY_LABELS[p]}
            </option>
          ))}
        </select>
        <select
          aria-label="التصنيف"
          value={filters.category}
          onChange={(e) => update({ category: e.target.value })}
          className={selectClass}
        >
          <option value="">كل التصنيفات</option>
          {categories.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
