"use client";

import { useEffect, useState } from "react";

// الصفحات المبنية مسبقًا تُرسم بالقيم الافتراضية، فننتظر التحميل في المتصفح
// قبل عرض ما يعتمد على localStorage أو تاريخ اليوم، تجنبًا لاختلاف الـ hydration
export function useMounted() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  return mounted;
}
