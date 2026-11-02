"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { NAV_ITEMS, SETTINGS_ITEM, isActive } from "@/components/nav-items";
import { ThemeToggle } from "@/components/theme-toggle";

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="sticky top-0 hidden h-dvh w-64 shrink-0 flex-col gap-6 border-s border-border bg-card p-6 md:flex">
      <h1 className="text-2xl font-bold text-primary">يومياتي</h1>
      <nav aria-label="التنقل الرئيسي">
        <ul className="flex flex-col gap-1">
          {[...NAV_ITEMS, SETTINGS_ITEM].map(({ href, label, icon: Icon }) => {
            const active = isActive(pathname, href);
            return (
              <li key={href}>
                <Link
                  href={href}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "flex items-center gap-3 rounded-2xl px-4 py-3 transition-colors",
                    active ? "bg-primary/10 text-primary" : "text-muted hover:bg-border/40 hover:text-foreground"
                  )}
                >
                  <Icon aria-hidden className="size-5" />
                  {label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
      <div className="mt-auto">
        <ThemeToggle />
      </div>
    </aside>
  );
}
