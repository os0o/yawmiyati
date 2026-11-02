"use client";

import { useMemo } from "react";
import { useAppStore } from "@/store/app-store";
import { useLocationStore, type Coords } from "@/store/location-store";

export type { Coords };

export function useGeolocation() {
  const manual = useAppStore((s) => s.manualLocation);
  const gpsCoords = useLocationStore((s) => s.coords);
  const gpsError = useLocationStore((s) => s.error);
  const loading = useLocationStore((s) => s.loading);
  const request = useLocationStore((s) => s.request);

  // الموقع اليدوي له الأولوية على GPS، ولا يظهر خطأ GPS عند وجوده
  // memo لأن الكائن يتغير الهوية في كل render، وهذا يعيد الجلب بلا داع
  const coords = useMemo<Coords | null>(
    () => (manual ? { latitude: manual.latitude, longitude: manual.longitude } : gpsCoords),
    [manual, gpsCoords]
  );

  return { coords, error: manual ? null : gpsError, loading, retry: request };
}
