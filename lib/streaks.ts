// تواريخ الأيام بصيغة YYYY-MM-DD، والحساب بالتقويم المحلي
function shiftDay(day: string, delta: number) {
  const date = new Date(`${day}T00:00:00`);
  date.setDate(date.getDate() + delta);
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

// المتتالية الحالية: تبدأ من اليوم، أو من الأمس إن لم يُنجز اليوم بعد فلا تنقطع قبل نهايته
export function currentStreak(doneDays: Set<string>, today: string) {
  let cursor = doneDays.has(today) ? today : shiftDay(today, -1);
  let streak = 0;
  while (doneDays.has(cursor)) {
    streak++;
    cursor = shiftDay(cursor, -1);
  }
  return streak;
}

// أطول متتالية في السجل كله
export function longestStreak(doneDays: Set<string>) {
  let best = 0;
  for (const day of doneDays) {
    // نبدأ العدّ من أول يوم في كل سلسلة فقط
    if (doneDays.has(shiftDay(day, -1))) continue;
    let length = 0;
    let cursor = day;
    while (doneDays.has(cursor)) {
      length++;
      cursor = shiftDay(cursor, 1);
    }
    best = Math.max(best, length);
  }
  return best;
}

export function intersectDays(a: Set<string>, b: Set<string>) {
  return new Set([...a].filter((day) => b.has(day)));
}
