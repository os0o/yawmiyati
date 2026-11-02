"use client";

import { useEffect } from "react";
import Link from "next/link";
import { X } from "lucide-react";
import { useToastStore } from "@/store/toast-store";

const SNOOZE_OPTIONS = [5, 10, 15] as const;

// إشعارات داخل التطبيق، مع تأجيل 5/10/15 دقيقة للتنبيهات القابلة للتأجيل
export function ToastViewport() {
  const toasts = useToastStore((s) => s.toasts);
  const dismiss = useToastStore((s) => s.dismiss);
  const snooze = useToastStore((s) => s.snooze);
  const restoreSnoozed = useToastStore((s) => s.restoreSnoozed);

  useEffect(() => {
    void restoreSnoozed();
  }, [restoreSnoozed]);

  return (
    <div
      aria-live="polite"
      className="pointer-events-none fixed inset-x-0 top-4 z-[60] flex flex-col items-center gap-3 px-4"
    >
      {toasts.map((t) => (
        <div
          key={t.id}
          role="status"
          className="pointer-events-auto w-full max-w-md rounded-2xl border border-border bg-card p-4 shadow-lg"
        >
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="font-semibold">{t.title}</p>
              {t.body && <p className="mt-1 text-sm text-muted">{t.body}</p>}
            </div>
            <button
              type="button"
              onClick={() => dismiss(t.id)}
              aria-label="إغلاق التنبيه"
              className="rounded-xl p-1 text-muted hover:bg-border/40"
            >
              <X aria-hidden className="size-4" />
            </button>
          </div>
          {(t.snoozable || t.href) && (
            <div className="mt-3 flex flex-wrap gap-2">
              {t.href && (
                <Link
                  href={t.href}
                  onClick={() => dismiss(t.id)}
                  className="rounded-xl bg-primary px-3 py-1.5 text-sm font-medium text-white hover:opacity-90"
                >
                  افتح
                </Link>
              )}
              {t.snoozable &&
                SNOOZE_OPTIONS.map((m) => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => snooze(t.id, m)}
                    className="rounded-xl border border-border px-3 py-1.5 text-sm hover:bg-border/40"
                  >
                    تأجيل {m} د
                  </button>
                ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
