"use client";

import { useRef, useState } from "react";
import { Download, RotateCcw, Upload } from "lucide-react";
import { backupSummary, downloadBackup, parseBackup, resetAllData, restoreBackup } from "@/lib/backup";
import { stopAdhan } from "@/lib/audio";
import { Button } from "@/components/ui/button";

const exportedFormat = new Intl.DateTimeFormat("ar", { dateStyle: "medium", timeStyle: "short" });

// بعد الاستيراد أو المسح نعيد تحميل الصفحة، فتقرأ كل المخازن البيانات الجديدة من البداية
function reload() {
  stopAdhan();
  window.location.reload();
}

export function DataSettings() {
  const fileRef = useRef<HTMLInputElement>(null);
  const [status, setStatus] = useState<{ kind: "error" | "info"; text: string } | null>(null);
  const [busy, setBusy] = useState(false);

  const exportData = async () => {
    setBusy(true);
    try {
      await downloadBackup();
      setStatus({ kind: "info", text: "تم تنزيل النسخة الاحتياطية" });
    } catch {
      setStatus({ kind: "error", text: "تعذر إنشاء النسخة الاحتياطية" });
    } finally {
      setBusy(false);
    }
  };

  const importData = async (file: File) => {
    setStatus(null);
    try {
      const backup = parseBackup(await file.text());
      const { tasks, quranDays, adhkarDays } = backupSummary(backup);
      const when = backup.exportedAt ? ` (${exportedFormat.format(new Date(backup.exportedAt))})` : "";
      const ok = window.confirm(
        `استيراد النسخة${when}؟\n${tasks} مهمة، ${quranDays} يوم ورد، ${adhkarDays} يوم أذكار.\nستُستبدل كل بياناتك الحالية.`
      );
      if (!ok) return;
      setBusy(true);
      await restoreBackup(backup);
      reload();
    } catch (e) {
      setBusy(false);
      setStatus({ kind: "error", text: e instanceof Error ? e.message : "تعذر استيراد الملف" });
    }
  };

  const reset = async () => {
    if (!window.confirm("مسح كل البيانات؟ المهام والتقدم والإعدادات ستُحذف من هذا الجهاز ولا يمكن استرجاعها.")) return;
    if (!window.confirm("تأكيد أخير: هل نزّلت نسخة احتياطية؟ اضغط «موافق» للمسح.")) return;
    setBusy(true);
    await resetAllData();
    reload();
  };

  return (
    <section aria-labelledby="data-title" className="rounded-2xl bg-card p-5 shadow-sm">
      <h2 id="data-title" className="mb-1 text-lg font-semibold">
        البيانات والنسخ الاحتياطي
      </h2>
      <p className="mb-4 text-sm text-muted">
        بياناتك محفوظة على هذا الجهاز فقط. نزّل نسخة احتياطية لنقلها إلى جهاز آخر أو لحفظها.
      </p>

      <div className="flex flex-wrap gap-3">
        <Button variant="outline" onClick={exportData} disabled={busy}>
          <Download aria-hidden />
          تصدير (JSON)
        </Button>
        <Button variant="outline" onClick={() => fileRef.current?.click()} disabled={busy}>
          <Upload aria-hidden />
          استيراد
        </Button>
        <input
          ref={fileRef}
          type="file"
          accept="application/json,.json"
          className="hidden"
          aria-hidden
          tabIndex={-1}
          onChange={(e) => {
            const file = e.target.files?.[0];
            e.target.value = "";
            if (file) void importData(file);
          }}
        />
        <Button variant="destructive" onClick={reset} disabled={busy}>
          <RotateCcw aria-hidden />
          مسح كل البيانات
        </Button>
      </div>

      {status && (
        <p
          role={status.kind === "error" ? "alert" : "status"}
          className={status.kind === "error" ? "mt-3 text-sm text-red-600 dark:text-red-400" : "mt-3 text-sm text-muted"}
        >
          {status.text}
        </p>
      )}
    </section>
  );
}
