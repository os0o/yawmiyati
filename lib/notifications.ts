import { withBasePath } from "@/lib/base-path";
import { db, type NotificationLogRow } from "@/lib/dexie-db";

export type PermissionState = NotificationPermission | "unsupported";

export function getNotificationPermission(): PermissionState {
  if (typeof window === "undefined" || !("Notification" in window)) return "unsupported";
  return Notification.permission;
}

export async function requestNotificationPermission(): Promise<PermissionState> {
  if (getNotificationPermission() === "unsupported") return "unsupported";
  return Notification.requestPermission();
}

// إشعار نظام التشغيل، يعمل فقط والتبويب مفتوح أو متصفح يعمل في الخلفية
// الضغط على الإشعار يعيد التطبيق للواجهة، ويفتح href إن وُجد
export function showSystemNotification(title: string, body: string, href?: string) {
  if (getNotificationPermission() !== "granted") return;
  try {
    const icon = withBasePath("/icons/icon-192.png");
    const notification = new Notification(title, { body, icon, lang: "ar", dir: "rtl" });
    notification.onclick = () => {
      window.focus();
      if (href) window.location.assign(withBasePath(href));
      notification.close();
    };
  } catch {
    // بعض المتصفحات تمنع إنشاء Notification خارج Service Worker، نكتفي بالتنبيه داخل التطبيق
  }
}

export async function logNotification(type: NotificationLogRow["type"], message: string) {
  await db.notifications_log.add({ at: new Date().toISOString(), type, message });
}
