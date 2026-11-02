"use client";

import { useState } from "react";
import { MapPin } from "lucide-react";
import { SAUDI_CITIES } from "@/lib/cities";
import { useGeolocation } from "@/hooks/useGeolocation";
import { useAppStore, type ManualLocation } from "@/store/app-store";

const GPS = "gps";
const CUSTOM = "custom";
const inputClass = "w-full rounded-xl border border-border bg-card px-3 py-2";

function modeOf(manual: ManualLocation | null) {
  if (!manual) return GPS;
  return SAUDI_CITIES.some((c) => c.city === manual.city) ? manual.city : CUSTOM;
}

// الموقع: GPS تلقائيًا، أو مدينة من القائمة، أو إحداثيات يدوية
export function LocationSettings() {
  const manual = useAppStore((s) => s.manualLocation);
  const setManual = useAppStore((s) => s.setManualLocation);
  const { coords, error, loading } = useGeolocation();
  const [mode, setMode] = useState(() => modeOf(manual));
  const [custom, setCustom] = useState({
    city: modeOf(manual) === CUSTOM ? (manual?.city ?? "") : "",
    latitude: modeOf(manual) === CUSTOM ? String(manual?.latitude ?? "") : "",
    longitude: modeOf(manual) === CUSTOM ? String(manual?.longitude ?? "") : "",
  });
  const [customError, setCustomError] = useState<string | null>(null);

  const choose = (value: string) => {
    setMode(value);
    setCustomError(null);
    // عند العودة إلى GPS يطلب PrayerTimesSync الموقع تلقائيًا
    if (value === GPS) {
      setManual(null);
    } else if (value !== CUSTOM) {
      setManual(SAUDI_CITIES.find((c) => c.city === value) ?? null);
    }
  };

  const saveCustom = () => {
    const latitude = Number(custom.latitude);
    const longitude = Number(custom.longitude);
    if (!custom.latitude || !Number.isFinite(latitude) || Math.abs(latitude) > 90) {
      return setCustomError("خط العرض يجب أن يكون بين -90 و 90");
    }
    if (!custom.longitude || !Number.isFinite(longitude) || Math.abs(longitude) > 180) {
      return setCustomError("خط الطول يجب أن يكون بين -180 و 180");
    }
    setCustomError(null);
    setManual({ city: custom.city.trim() || "موقع مخصص", latitude, longitude });
  };

  return (
    <section aria-labelledby="location-title" className="rounded-2xl bg-card p-5 shadow-sm">
      <h2 id="location-title" className="mb-3 flex items-center gap-2 text-lg font-semibold">
        <MapPin aria-hidden className="size-5 text-primary" />
        الموقع
      </h2>

      <label className="flex flex-col gap-1 text-sm">
        مصدر الموقع لحساب المواقيت
        <select value={mode} onChange={(e) => choose(e.target.value)} className={inputClass}>
          <option value={GPS}>تلقائي (GPS)</option>
          <optgroup label="مدن السعودية">
            {SAUDI_CITIES.map((c) => (
              <option key={c.city} value={c.city}>
                {c.city}
              </option>
            ))}
          </optgroup>
          <option value={CUSTOM}>إحداثيات مخصصة</option>
        </select>
      </label>

      {mode === GPS && (
        <p role="status" className="mt-3 text-sm text-muted">
          {loading
            ? "جارٍ تحديد الموقع…"
            : error
              ? error
              : coords
                ? `الموقع الحالي: ${coords.latitude.toFixed(3)}، ${coords.longitude.toFixed(3)}`
                : "لم يُحدد الموقع بعد"}
        </p>
      )}

      {mode === CUSTOM && (
        <div className="mt-3 flex flex-col gap-3 text-sm">
          <label className="flex flex-col gap-1">
            اسم المكان (اختياري)
            <input value={custom.city} onChange={(e) => setCustom({ ...custom, city: e.target.value })} className={inputClass} />
          </label>
          <div className="grid grid-cols-2 gap-3">
            <label className="flex flex-col gap-1">
              خط العرض
              <input
                dir="ltr"
                inputMode="decimal"
                value={custom.latitude}
                onChange={(e) => setCustom({ ...custom, latitude: e.target.value })}
                placeholder="21.4225"
                className={inputClass}
              />
            </label>
            <label className="flex flex-col gap-1">
              خط الطول
              <input
                dir="ltr"
                inputMode="decimal"
                value={custom.longitude}
                onChange={(e) => setCustom({ ...custom, longitude: e.target.value })}
                placeholder="39.8262"
                className={inputClass}
              />
            </label>
          </div>
          {customError && (
            <p role="alert" className="text-red-600 dark:text-red-400">
              {customError}
            </p>
          )}
          <div className="flex items-center gap-3">
            <button type="button" onClick={saveCustom} className="rounded-xl bg-primary px-4 py-2 text-white">
              حفظ الموقع
            </button>
            {manual && modeOf(manual) === CUSTOM && <span className="text-muted">المحفوظ: {manual.city}</span>}
          </div>
        </div>
      )}
    </section>
  );
}
