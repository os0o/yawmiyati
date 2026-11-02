"use client";

import { useEffect, useState } from "react";
import {
  getNotificationPermission,
  requestNotificationPermission,
  type PermissionState,
} from "@/lib/notifications";

// حالة إذن إشعارات النظام، تُقرأ في المتصفح فقط وتتحدث بعد الطلب
export function useNotifications() {
  const [permission, setPermission] = useState<PermissionState>("unsupported");

  useEffect(() => {
    setPermission(getNotificationPermission());
  }, []);

  const request = async () => {
    setPermission(await requestNotificationPermission());
  };

  return { permission, request };
}
