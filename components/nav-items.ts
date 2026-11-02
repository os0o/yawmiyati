import { BookOpen, CheckSquare, Clock, Home, Moon, Settings, type LucideIcon } from "lucide-react";

export interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
}

export const NAV_ITEMS: NavItem[] = [
  { href: "/", label: "الرئيسية", icon: Home },
  { href: "/prayer", label: "الصلوات", icon: Clock },
  { href: "/adhkar", label: "الأذكار", icon: Moon },
  { href: "/quran", label: "القرآن", icon: BookOpen },
  { href: "/tasks", label: "المهام", icon: CheckSquare },
];

export const SETTINGS_ITEM: NavItem = { href: "/settings", label: "الإعدادات", icon: Settings };

// الصفحات الفرعية (مثل /adhkar/12) تُبرز تبويبها الأب
export function isActive(pathname: string, href: string) {
  // التصدير الثابت يضيف شرطة في آخر المسار (/prayer/)، فنزيلها قبل المقارنة
  const path = pathname.length > 1 ? pathname.replace(/\/$/, "") : pathname;
  return href === "/" ? path === "/" : path === href || path.startsWith(`${href}/`);
}
