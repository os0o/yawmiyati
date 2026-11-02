import { create } from "zustand";
import { db } from "@/lib/dexie-db";

export interface Toast {
  id: string;
  title: string;
  body?: string;
  snoozable: boolean;
  // صفحة يفتحها زر «افتح» في التنبيه، مثل تصنيف أذكار الصباح
  href?: string;
}

interface SnoozedToast {
  id: string;
  title: string;
  body?: string;
  href?: string;
  at: number;
}

interface ToastState {
  toasts: Toast[];
  push: (toast: Omit<Toast, "id">) => void;
  dismiss: (id: string) => void;
  snooze: (id: string, minutes: number) => void;
  restoreSnoozed: () => Promise<void>;
}

const SNOOZE_KEY = "toasts.snoozed";
let restored = false;

// المؤجّلات محفوظة في Dexie كي لا تضيع عند إغلاق التطبيق
async function readSnoozed(): Promise<SnoozedToast[]> {
  const row = await db.settings.get(SNOOZE_KEY);
  return (row?.value as SnoozedToast[] | undefined) ?? [];
}

async function writeSnoozed(list: SnoozedToast[]) {
  await db.settings.put({ key: SNOOZE_KEY, value: list });
}

function scheduleSnoozed(item: SnoozedToast) {
  const delay = Math.max(0, item.at - Date.now());
  setTimeout(async () => {
    await writeSnoozed((await readSnoozed()).filter((s) => s.id !== item.id));
    useToastStore.getState().push({ title: item.title, body: item.body, href: item.href, snoozable: false });
  }, delay);
}

export const useToastStore = create<ToastState>()((set, get) => ({
  toasts: [],
  push: (toast) =>
    set((s) => ({ toasts: [...s.toasts, { ...toast, id: crypto.randomUUID() }].slice(-4) })),
  dismiss: (id) => set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })),
  snooze: (id, minutes) => {
    const toast = get().toasts.find((t) => t.id === id);
    get().dismiss(id);
    if (!toast) return;
    const item: SnoozedToast = {
      id: crypto.randomUUID(),
      title: toast.title,
      body: toast.body,
      href: toast.href,
      at: Date.now() + minutes * 60_000,
    };
    void readSnoozed().then((list) => writeSnoozed([...list, item]));
    scheduleSnoozed(item);
  },
  // يُستدعى مرة واحدة عند بدء التطبيق لإعادة جدولة التأجيلات المحفوظة
  restoreSnoozed: async () => {
    if (restored) return;
    restored = true;
    (await readSnoozed()).forEach(scheduleSnoozed);
  },
}));
