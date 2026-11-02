// دائرة تقدم SVG بسيطة، القيمة بين 0 و 1
export function ProgressRing({
  value,
  size = 56,
  stroke = 6,
  label,
  color = "var(--primary)",
  trackColor = "var(--border)",
}: {
  value: number;
  size?: number;
  stroke?: number;
  label?: string;
  // على خلفية ملونة (مثل بطاقة الصلاة) يجب تغيير اللون كي يظهر التقدم
  color?: string;
  trackColor?: string;
}) {
  const r = (size - stroke) / 2;
  const circumference = 2 * Math.PI * r;
  const clamped = Math.min(1, Math.max(0, value));

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} role="img" aria-label={label}>
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={trackColor} strokeWidth={stroke} />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        fill="none"
        stroke={color}
        strokeWidth={stroke}
        strokeLinecap="round"
        strokeDasharray={circumference}
        strokeDashoffset={circumference * (1 - clamped)}
        transform={`rotate(-90 ${size / 2} ${size / 2})`}
        className="transition-[stroke-dashoffset] duration-300"
      />
    </svg>
  );
}
