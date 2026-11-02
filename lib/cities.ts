import type { ManualLocation } from "@/store/app-store";

// مدن سعودية رئيسية لإدخال الموقع دون GPS
export const SAUDI_CITIES: ManualLocation[] = [
  { city: "مكة المكرمة", latitude: 21.4225, longitude: 39.8262 },
  { city: "المدينة المنورة", latitude: 24.4672, longitude: 39.6111 },
  { city: "الرياض", latitude: 24.7136, longitude: 46.6753 },
  { city: "جدة", latitude: 21.4858, longitude: 39.1925 },
  { city: "الدمام", latitude: 26.4207, longitude: 50.0888 },
  { city: "الطائف", latitude: 21.2703, longitude: 40.4158 },
  { city: "تبوك", latitude: 28.3835, longitude: 36.5662 },
  { city: "أبها", latitude: 18.2164, longitude: 42.5053 },
  { city: "بريدة", latitude: 26.326, longitude: 43.975 },
  { city: "حائل", latitude: 27.5114, longitude: 41.7208 },
  { city: "جازان", latitude: 16.8892, longitude: 42.5511 },
  { city: "نجران", latitude: 17.4924, longitude: 44.1277 },
];
