"use client";

import { AlertsEngine } from "@/components/alerts-engine";
import { BottomNav } from "@/components/bottom-nav";
import { PrayerTimesSync } from "@/components/prayer-times-sync";
import { Sidebar } from "@/components/sidebar";
import { ToastViewport } from "@/components/toast-viewport";

// Bottom Nav على الجوال، وSidebar على الشاشات الكبيرة
export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-dvh md:flex">
      <PrayerTimesSync />
      <Sidebar />
      <main className="mx-auto w-full max-w-3xl px-4 pt-6 pb-28 md:px-8 md:pb-10">{children}</main>
      <BottomNav />
      <AlertsEngine />
      <ToastViewport />
    </div>
  );
}
