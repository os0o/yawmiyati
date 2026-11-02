"use client";

import { useLiveQuery } from "dexie-react-hooks";
import { BookOpen, CheckSquare, Clock, Moon } from "lucide-react";
import { db, type NotificationLogRow } from "@/lib/dexie-db";

const LOG_LIMIT = 30;

const TYPE_META: Record<NotificationLogRow["type"], { label: string; icon: typeof Clock }> = {
  prayer: { label: "صلاة", icon: Clock },
  adhkar: { label: "أذكار", icon: Moon },
  quran: { label: "قرآن", icon: BookOpen },
  task: { label: "مهمة", icon: CheckSquare },
};

const timeFormat = new Intl.DateTimeFormat("ar", { weekday: "short", day: "numeric", month: "short", hour: "numeric", minute: "2-digit" });

// آخر التنبيهات التي أطلقها التطبيق، للتحقق من أنها تعمل في مواعيدها
export function NotificationsLog() {
  const rows = useLiveQuery(() => db.notifications_log.orderBy("at").reverse().limit(LOG_LIMIT).toArray(), [], []);

  const clear = () => {
    if (window.confirm("مسح سجل التنبيهات؟")) void db.notifications_log.clear();
  };

  return (
    <section aria-labelledby="log-title" className="rounded-2xl bg-card p-5 shadow-sm">
      <div className="mb-3 flex items-center justify-between gap-4">
        <h2 id="log-title" className="text-lg font-semibold">
          سجل التنبيهات
        </h2>
        {rows.length > 0 && (
          <button type="button" onClick={clear} className="text-sm text-muted hover:text-red-600">
            مسح السجل
          </button>
        )}
      </div>

      {rows.length === 0 ? (
        <p className="text-sm text-muted">لم يُطلق أي تنبيه بعد</p>
      ) : (
        <ul className="flex max-h-80 flex-col divide-y divide-border overflow-y-auto">
          {rows.map((row) => {
            const { label, icon: Icon } = TYPE_META[row.type];
            return (
              <li key={row.id} className="flex items-center gap-3 py-2 text-sm">
                <Icon aria-label={label} className="size-4 shrink-0 text-primary" />
                <span className="min-w-0 flex-1 truncate">{row.message}</span>
                <time dateTime={row.at} className="shrink-0 text-xs text-muted">
                  {timeFormat.format(new Date(row.at))}
                </time>
              </li>
            );
          })}
        </ul>
      )}
      <p className="mt-3 text-xs text-muted">يُعرض آخر {LOG_LIMIT} تنبيهًا.</p>
    </section>
  );
}
