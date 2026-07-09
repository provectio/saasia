interface ScoreGaugeProps {
  label: string;
  percent: number;
  profileLabel: string;
  color: string;
  accentColor: string;
  variant?: "screen" | "print";
}

export function ScoreGauge({
  label,
  percent,
  profileLabel,
  color,
  accentColor,
  variant = "screen",
}: ScoreGaugeProps) {
  const isPrint = variant === "print";
  const radius = isPrint ? 52 : 72;
  const stroke = isPrint ? 9 : 12;
  const normalizedRadius = radius - stroke / 2;
  const circumference = normalizedRadius * 2 * Math.PI;
  const offset = circumference - (percent / 100) * circumference;

  return (
    <div
      className={
        isPrint
          ? "flex flex-col items-center rounded-2xl border border-gray-200 bg-white p-4"
          : "flex flex-col items-center rounded-3xl border border-primary/15 bg-white p-6 shadow-lg"
      }
    >
      <p
        className={
          isPrint
            ? "text-xs font-semibold uppercase tracking-wide text-gray-500"
            : "text-sm font-semibold uppercase tracking-wide text-gray-500"
        }
      >
        {label}
      </p>
      <div className={`relative ${isPrint ? "mt-2" : "mt-4"}`}>
        <svg width={radius * 2} height={radius * 2} className="-rotate-90">
          <circle
            cx={radius}
            cy={radius}
            r={normalizedRadius}
            fill="transparent"
            stroke="currentColor"
            strokeWidth={stroke}
            className="text-gray-100"
          />
          <circle
            cx={radius}
            cy={radius}
            r={normalizedRadius}
            fill="transparent"
            stroke={accentColor}
            strokeWidth={stroke}
            strokeLinecap="round"
            strokeDasharray={`${circumference} ${circumference}`}
            strokeDashoffset={offset}
            className="transition-all duration-700"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className={isPrint ? "text-2xl font-bold text-gray-900" : "text-3xl font-bold text-gray-900"}>
            {percent}
          </span>
          <span className="text-xs text-gray-500">/ 100</span>
        </div>
      </div>
      <p className={`${isPrint ? "mt-2 text-sm" : "mt-4 text-lg"} font-bold`} style={{ color }}>
        {profileLabel}
      </p>
    </div>
  );
}
