import { create } from "zustand";

export interface Coords {
  latitude: number;
  longitude: number;
}

interface LocationState {
  coords: Coords | null;
  error: string | null;
  loading: boolean;
  request: () => void;
}

// موقع GPS مشترك بين كل المكونات، فلا يُطلب الإذن أكثر من مرة
export const useLocationStore = create<LocationState>()((set) => ({
  coords: null,
  error: null,
  loading: false,
  request: () => {
    if (typeof navigator === "undefined" || !("geolocation" in navigator)) {
      set({ error: "المتصفح لا يدعم تحديد الموقع" });
      return;
    }
    set({ loading: true });
    navigator.geolocation.getCurrentPosition(
      (pos) =>
        set({
          coords: { latitude: pos.coords.latitude, longitude: pos.coords.longitude },
          error: null,
          loading: false,
        }),
      () => set({ error: "تعذر تحديد الموقع، يمكنك إدخال مدينتك يدويًا", loading: false }),
      { enableHighAccuracy: false, timeout: 10000, maximumAge: 60 * 60 * 1000 }
    );
  },
}));
