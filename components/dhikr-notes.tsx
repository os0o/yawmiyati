import type { Dhikr } from "@/lib/adhkar";

// الفضل والمصدر تحت الذكر، مطويان افتراضيًا كي لا يزاحما النص
export function DhikrNotes({ dhikr }: { dhikr: Dhikr }) {
  if (!dhikr.fadl && !dhikr.source) return null;

  return (
    <details className="w-full rounded-xl bg-background p-3 text-sm">
      <summary className="cursor-pointer font-medium text-primary">
        {dhikr.fadl ? "الفضل والمصدر" : "المصدر"}
      </summary>
      <dl className="mt-2 flex flex-col gap-2 leading-relaxed">
        {dhikr.fadl && (
          <div>
            <dt className="text-xs font-semibold text-muted">الفضل</dt>
            <dd>{dhikr.fadl}</dd>
          </div>
        )}
        {dhikr.source && (
          <div>
            <dt className="text-xs font-semibold text-muted">المصدر</dt>
            <dd className="text-muted">{dhikr.source}</dd>
          </div>
        )}
      </dl>
    </details>
  );
}
