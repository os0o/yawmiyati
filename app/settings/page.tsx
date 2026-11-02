"use client";

import { useState } from "react";
import { CALC_METHODS, PRAYER_LABELS, PRAYER_NAMES, SCHOOLS, type PrayerName } from "@/lib/aladhan-api";
import { usePrayerSettings, updatePrayerSetting } from "@/hooks/usePrayerSettings";
import { adhanErrorToast, chimeBlockedToast, playAdhan, playChime, stopAdhan } from "@/lib/audio";
import { DataSettings } from "@/components/settings/data-settings";
import { LocationSettings } from "@/components/settings/location-settings";
import { NotificationsLog } from "@/components/settings/notifications-log";
import { ThemeToggle } from "@/components/theme-toggle";
import type { PermissionState } from "@/lib/notifications";
import { useNotifications } from "@/hooks/useNotifications";
import { Button } from "@/components/ui/button";
import { QuranSettings } from "@/components/quran-settings";
import { useMounted } from "@/hooks/useMounted";
import { useAppStore } from "@/store/app-store";
import { useToastStore } from "@/store/toast-store";

const MINUTE_OPTIONS = [0, 5, 10, 15, 20, 30];
const ADHKAR_OFFSETS = [0, 15, 30, 45, 60, 90, 120];

const PERMISSION_LABELS: Record<PermissionState, string> = {
  granted: "مسموح",
  denied: "مرفوض من المتصفح",
  default: "لم يُطلب بعد",
  unsupported: "غير مدعوم في هذا المتصفح",
};

function Toggle({ id, label, checked, onChange }: { id: string; label: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <label htmlFor={id} className="flex cursor-pointer items-center justify-between gap-4 py-2">
      <span>{label}</span>
      <input
        id={id}
        type="checkbox"
        role="switch"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="size-5 accent-primary"
      />
    </label>
  );
}

export default function SettingsPage() {
  const store = useAppStore();
  const prayerSettings = usePrayerSettings();
  const push = useToastStore((s) => s.push);
  const { permission, request: askPermission } = useNotifications();
  const [previewing, setPreviewing] = useState(false);

  const preview = () => {
    setPreviewing(true);
    playAdhan((reason) => {
      setPreviewing(false);
      push(adhanErrorToast(reason));
    });
  };

  // القيم المحفوظة في localStorage لا تتوفر أثناء البناء المسبق
  const mounted = useMounted();
  if (!mounted) return <p className="text-muted">جارٍ التحميل…</p>;

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-bold">الإعدادات</h1>

      {/* على الجوال لا يظهر الشريط الجانبي، فمكان تغيير المظهر هنا */}
      <section aria-labelledby="theme-title" className="rounded-2xl bg-card p-5 shadow-sm md:hidden">
        <h2 id="theme-title" className="mb-3 text-lg font-semibold">
          المظهر
        </h2>
        <ThemeToggle />
      </section>

      <LocationSettings />

      <section aria-labelledby="alerts-title" className="rounded-2xl bg-card p-5 shadow-sm">
        <h2 id="alerts-title" className="mb-2 text-lg font-semibold">التنبيهات</h2>
        <Toggle
          id="alerts-enabled"
          label="تفعيل تنبيهات الصلاة"
          checked={store.alertsEnabled}
          onChange={store.setAlertsEnabled}
        />
        <Toggle id="sound-muted" label="كتم الأصوات" checked={store.soundMuted} onChange={store.setSoundMuted} />
        <label className="flex items-center justify-between gap-4 py-2">
          <span>مستوى الصوت</span>
          <span className="flex items-center gap-3">
            <input
              type="range"
              min={0}
              max={100}
              step={5}
              value={Math.round(store.volume * 100)}
              onChange={(e) => store.setVolume(Number(e.target.value) / 100)}
              disabled={store.soundMuted}
              aria-valuetext={`${Math.round(store.volume * 100)}%`}
              className="w-32 accent-primary disabled:opacity-40"
            />
            <span className="w-10 text-sm tabular-nums text-muted">{Math.round(store.volume * 100)}%</span>
          </span>
        </label>

        <div className="mt-3 flex items-center justify-between gap-4 border-t border-border pt-3">
          <div>
            <p>إشعارات سطح المكتب</p>
            <p className="text-sm text-muted">الحالة: {PERMISSION_LABELS[permission]}</p>
          </div>
          {permission === "default" && (
            <Button onClick={askPermission}>السماح</Button>
          )}
        </div>

        <div className="mt-3 flex flex-wrap items-center gap-3 border-t border-border pt-3">
          <Button variant="outline" onClick={preview}>
            معاينة الأذان
          </Button>
          <Button
            variant="outline"
            onClick={() => {
              stopAdhan();
              setPreviewing(false);
            }}
            disabled={!previewing}
          >
            إيقاف
          </Button>
          <Button variant="outline" onClick={() => playChime(() => push(chimeBlockedToast))}>
            نغمة التذكير
          </Button>
        </div>
      </section>

      <section aria-labelledby="adhkar-title" className="rounded-2xl bg-card p-5 shadow-sm">
        <h2 id="adhkar-title" className="mb-2 text-lg font-semibold">تنبيهات الأذكار</h2>
        <Toggle
          id="adhkar-alerts"
          label="تذكير بأذكار الصباح والمساء"
          checked={store.adhkarAlertsEnabled}
          onChange={store.setAdhkarAlertsEnabled}
        />
        <Toggle id="adhkar-sound" label="صوت مع التذكير" checked={store.adhkarSound} onChange={store.setAdhkarSound} />
        <div className="mt-3 flex flex-col gap-3 border-t border-border pt-3 text-sm">
          <label className="flex items-center justify-between gap-4">
            أذكار الصباح بعد الفجر
            <select
              value={store.adhkarMorningOffset}
              onChange={(e) => store.setAdhkarMorningOffset(Number(e.target.value))}
              className="rounded-lg border border-border bg-card px-2 py-1"
            >
              {ADHKAR_OFFSETS.map((m) => (
                <option key={m} value={m}>
                  {m === 0 ? "عند الفجر" : `بعد ${m} دقيقة`}
                </option>
              ))}
            </select>
          </label>
          <label className="flex items-center justify-between gap-4">
            أذكار المساء بعد العصر
            <select
              value={store.adhkarEveningOffset}
              onChange={(e) => store.setAdhkarEveningOffset(Number(e.target.value))}
              className="rounded-lg border border-border bg-card px-2 py-1"
            >
              {ADHKAR_OFFSETS.map((m) => (
                <option key={m} value={m}>
                  {m === 0 ? "عند العصر" : `بعد ${m} دقيقة`}
                </option>
              ))}
            </select>
          </label>
        </div>
      </section>

      <QuranSettings />

      <section aria-labelledby="per-prayer-title" className="rounded-2xl bg-card p-5 shadow-sm">
        <h2 id="per-prayer-title" className="mb-3 text-lg font-semibold">تنبيهات كل صلاة</h2>
        <ul className="flex flex-col divide-y divide-border">
          {PRAYER_NAMES.map((name: PrayerName) => {
            const s = prayerSettings[name];
            return (
              <li key={name} className="flex flex-col gap-2 py-3 sm:flex-row sm:items-center sm:justify-between">
                <span className="font-medium">{PRAYER_LABELS[name]}</span>
                <div className="flex flex-wrap items-center gap-4 text-sm">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={s.enabled}
                      onChange={(e) => updatePrayerSetting(name, { enabled: e.target.checked })}
                      className="size-4 accent-primary"
                    />
                    تفعيل
                  </label>
                  <label className="flex items-center gap-2">
                    تنبيه قبل
                    <select
                      value={s.minutesBefore}
                      onChange={(e) => updatePrayerSetting(name, { minutesBefore: Number(e.target.value) })}
                      className="rounded-lg border border-border bg-card px-2 py-1"
                    >
                      {MINUTE_OPTIONS.map((m) => (
                        <option key={m} value={m}>
                          {m === 0 ? "بدون" : `${m} دقيقة`}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={s.sound}
                      onChange={(e) => updatePrayerSetting(name, { sound: e.target.checked })}
                      className="size-4 accent-primary"
                    />
                    صوت الأذان
                  </label>
                </div>
              </li>
            );
          })}
        </ul>
      </section>

      <section aria-labelledby="calc-title" className="rounded-2xl bg-card p-5 shadow-sm">
        <h2 id="calc-title" className="mb-3 text-lg font-semibold">حساب المواقيت</h2>
        <div className="flex flex-col gap-3">
          <label className="flex flex-col gap-1 text-sm">
            طريقة الحساب
            <select
              value={store.calcMethod}
              onChange={(e) => store.setCalcMethod(Number(e.target.value))}
              className="rounded-xl border border-border bg-card px-3 py-2"
            >
              {CALC_METHODS.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.label}
                </option>
              ))}
            </select>
          </label>
          <label className="flex flex-col gap-1 text-sm">
            المذهب (العصر)
            <select
              value={store.school}
              onChange={(e) => store.setSchool(Number(e.target.value))}
              className="rounded-xl border border-border bg-card px-3 py-2"
            >
              {SCHOOLS.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.label}
                </option>
              ))}
            </select>
          </label>
        </div>
      </section>

      <NotificationsLog />
      <DataSettings />
    </div>
  );
}
