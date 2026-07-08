interface ScoreGaugeProps {
  label: string;
  percent: number;
  profileLabel: string;
  color: string;
  accentColor: string;
}

export function ScoreGauge({
  label,
  percent,
  profileLabel,
  color,
  accentColor,
}: ScoreGaugeProps) {
  const radius = 72;
  const stroke = 12;
  const normalizedRadius = radius - stroke / 2;
  const circumference = normalizedRadius * 2 * Math.PI;
  const offset = circumference - (percent / 100) * circumference;

  return (
    <div className="flex flex-col items-center rounded-3xl border border-primary/15 bg-white p-6 shadow-lg">
      <p className="text-sm font-semibold uppercase tracking-wide text-gray-500">
        {label}
      </p>
      <div className="relative mt-4">
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
          <span className="text-3xl font-bold text-gray-900">{percent}</span>
          <span className="text-xs text-gray-500">/ 100</span>
        </div>
      </div>
      <p className="mt-4 text-lg font-bold" style={{ color }}>
        {profileLabel}
      </p>
    </div>
  );
}
