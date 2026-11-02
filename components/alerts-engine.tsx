"use client";

import { useEffect, useRef } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import { usePrayerTimes } from "@/hooks/usePrayerTimes";
import { usePrayerSettings, type PrayerSettingsMap } from "@/hooks/usePrayerSettings";
import { db, type TaskRow } from "@/lib/dexie-db";
import { dayKey, getDueAlerts } from "@/lib/prayer-alerts";
import { getDueAdhkarAlerts } from "@/lib/adhkar-alerts";
import { carryOverTaskKeys, getDueTaskAlerts } from "@/lib/tasks";
import { adhanErrorToast, chimeBlockedToast, playAdhan, playChime, setMasterVolume } from "@/lib/audio";
import { logNotification, showSystemNotification } from "@/lib/notifications";
import { useAppStore } from "@/store/app-store";
import { useToastStore } from "@/store/toast-store";
import { useQuranStore } from "@/store/quran-store";
import { useQuranProgress } from "@/hooks/useQuranProgress";
import { timeToDate, type PrayerTimesResult } from "@/lib/aladhan-api";

const FIRED_SETTING_KEY = "alerts.fired";
const CHECK_INTERVAL_MS = 15_000;

// لا يعمل إلا والتطبيق مفتوح: المتصفح لا يسمح بجدولة تنبيهات دقيقة في الخلفية بدون خادم
export function AlertsEngine() {
  const { data } = usePrayerTimes();
  const alertsEnabled = useAppStore((s) => s.alertsEnabled);
  const soundMuted = useAppStore((s) => s.soundMuted);
  const adhkarAlertsEnabled = useAppStore((s) => s.adhkarAlertsEnabled);
  const adhkarMorningOffset = useAppStore((s) => s.adhkarMorningOffset);
  const adhkarEveningOffset = useAppStore((s) => s.adhkarEveningOffset);
  const quranReminderEnabled = useQuranStore((s) => s.reminderEnabled);
  const quranReminderTime = useQuranStore((s) => s.reminderTime);
  const quranReminderSound = useQuranStore((s) => s.reminderSound);
  const adhkarSound = useAppStore((s) => s.adhkarSound);
  const { doneToday: quranDoneToday } = useQuranProgress();
  const settings = usePrayerSettings();
  const push = useToastStore((s) => s.push);
  const tasks = useLiveQuery(() => db.tasks.toArray(), [], []);
  const tasksRef = useRef<TaskRow[]>([]);
  tasksRef.current = tasks;

  const latest = useRef<{
    data: PrayerTimesResult | null;
    alertsEnabled: boolean;
    soundMuted: boolean;
    settings: PrayerSettingsMap;
    adhkarAlertsEnabled: boolean;
    adhkarMorningOffset: number;
    adhkarEveningOffset: number;
    quranReminderEnabled: boolean;
    quranReminderTime: string;
    quranReminderSound: boolean;
    adhkarSound: boolean;
    quranDoneToday: boolean;
  }>({
    data: null,
    alertsEnabled,
    soundMuted,
    settings,
    adhkarAlertsEnabled,
    adhkarMorningOffset,
    adhkarEveningOffset,
    quranReminderEnabled,
    quranReminderTime,
    quranReminderSound,
    adhkarSound,
    quranDoneToday,
  });
  latest.current = {
    data,
    alertsEnabled,
    soundMuted,
    settings,
    adhkarAlertsEnabled,
    adhkarMorningOffset,
    adhkarEveningOffset,
    quranReminderEnabled,
    quranReminderTime,
    quranReminderSound,
    adhkarSound,
    quranDoneToday,
  };

  const volume = useAppStore((s) => s.volume);
  useEffect(() => setMasterVolume(volume), [volume]);

  const fired = useRef<Set<string> | null>(null);
  const firedDay = useRef("");

  // تحميل التنبيهات المُطلقة اليوم كي لا تتكرر بعد إعادة تحميل الصفحة
  useEffect(() => {
    let cancelled = false;
    db.settings.get(FIRED_SETTING_KEY).then((row) => {
      if (cancelled) return;
      const now = new Date();
      const today = dayKey(now);
      const saved = row?.value as { day: string; keys: string[] } | undefined;
      firedDay.current = today;
      fired.current = new Set(
        saved?.day === today ? saved.keys : carryOverTaskKeys(saved?.keys ?? [], now)
      );
    });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    const markFired = (key: string) => {
      const set = fired.current;
      if (!set) return;
      set.add(key);
      void db.settings.put({
        key: FIRED_SETTING_KEY,
        value: { day: firedDay.current, keys: [...set] },
      });
    };

    const check = () => {
      const current = latest.current;
      if (!fired.current) return;

      const now = new Date();
      // التطبيق بقي مفتوحًا بعد منتصف الليل: نبدأ قائمة يوم جديد
      if (dayKey(now) !== firedDay.current) {
        firedDay.current = dayKey(now);
        fired.current = new Set(carryOverTaskKeys(fired.current, now));
      }
      const timings = current.data?.timings ?? null;

      // تنبيهات الصلاة والأذكار تحتاج المواقيت، وتذكير الورد لا يحتاجها
      const due =
        timings && current.alertsEnabled
          ? getDueAlerts({ timings, now, settings: current.settings, fired: fired.current })
          : [];

      for (const alert of due) {
        markFired(alert.key);
        push({ title: alert.title, body: alert.body, snoozable: alert.kind === "pre" });
        showSystemNotification(alert.title, alert.body);
        void logNotification("prayer", alert.title);
        if (alert.sound && !latest.current.soundMuted) {
          playAdhan((reason) => push(adhanErrorToast(reason)));
        }
      }

      if (timings && current.adhkarAlertsEnabled) {
        const dueAdhkar = getDueAdhkarAlerts({
          timings,
          now,
          morningOffset: current.adhkarMorningOffset,
          eveningOffset: current.adhkarEveningOffset,
          fired: fired.current,
        });

        for (const alert of dueAdhkar) {
          markFired(alert.key);
          push({ title: alert.title, body: alert.body, href: alert.href, snoozable: true });
          showSystemNotification(alert.title, alert.body, alert.href);
          void logNotification("adhkar", alert.title);
          if (current.adhkarSound && !current.soundMuted) playChime(() => push(chimeBlockedToast));
        }
      }

      // تذكير الورد مرة يوميًا بعد الوقت المحدد، فقط إن لم يُنجز بعد
      if (current.quranReminderEnabled && !current.quranDoneToday) {
        const key = `${dayKey(now)}|quran`;
        if (now >= timeToDate(current.quranReminderTime, now) && !fired.current.has(key)) {
          markFired(key);
          const title = "ورد القرآن";
          const body = "لم تُنجز ورد اليوم بعد";
          push({ title, body, href: "/quran", snoozable: true });
          showSystemNotification(title, body, "/quran");
          void logNotification("quran", title);
          if (current.quranReminderSound && !current.soundMuted) playChime(() => push(chimeBlockedToast));
        }
      }

      for (const alert of getDueTaskAlerts(tasksRef.current, now, fired.current)) {
        markFired(alert.key);
        push({ title: alert.title, body: alert.body, href: "/tasks", snoozable: true });
        showSystemNotification(alert.title, alert.body, "/tasks");
        void logNotification("task", alert.title);
        if (alert.sound && !current.soundMuted) playChime(() => push(chimeBlockedToast));
      }
    };

    check();
    const id = setInterval(check, CHECK_INTERVAL_MS);
    return () => clearInterval(id);
  }, [push]);

  return null;
}
