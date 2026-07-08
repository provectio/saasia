import type { BlockId } from "@/data/questions";
import type { AxisScore } from "@/lib/scoring";

const RADAR_LABELS: Record<BlockId, string> = {
  infra: "Infrastructure",
  identites: "Identités",
  gouvernance: "Gouvernance",
  conformite: "Conformité",
  competences: "Compétences",
  pilotage: "Pilotage",
};

interface DualRadarChartProps {
  axes: AxisScore[];
}

export function DualRadarChart({ axes }: DualRadarChartProps) {
  const padding = 64;
  const size = 300;
  const center = padding + size / 2;
  const radius = 96;
  const labelRadius = radius + 42;
  const levels = 4;
  const viewSize = size + padding * 2;
  const angleStep = (2 * Math.PI) / axes.length;

  const point = (index: number, r: number) => {
    const angle = angleStep * index - Math.PI / 2;
    return {
      x: center + r * Math.cos(angle),
      y: center + r * Math.sin(angle),
    };
  };

  const gridPolygons = Array.from({ length: levels }, (_, level) => {
    const r = (radius * (level + 1)) / levels;
    return axes
      .map((_, i) => {
        const p = point(i, r);
        return `${p.x},${p.y}`;
      })
      .join(" ");
  });

  const buildPolygon = (key: "saasPercent" | "iaPercent") =>
    axes
      .map((axis, i) => {
        const r = (radius * axis[key]) / 100;
        const p = point(i, r);
        return `${p.x},${p.y}`;
      })
      .join(" ");

  return (
    <div className="w-full">
      <svg
        viewBox={`0 0 ${viewSize} ${viewSize}`}
        className="mx-auto w-full max-w-[400px]"
        role="img"
        aria-label="Radar des 6 axes — SaaS et IA"
        overflow="visible"
      >
        {gridPolygons.map((pts, i) => (
          <polygon
            key={i}
            points={pts}
            fill="none"
            stroke="currentColor"
            strokeOpacity={0.12}
            className="text-primary"
          />
        ))}

        {axes.map((_, i) => {
          const p = point(i, radius);
          return (
            <line
              key={i}
              x1={center}
              y1={center}
              x2={p.x}
              y2={p.y}
              stroke="currentColor"
              strokeOpacity={0.15}
              className="text-primary"
            />
          );
        })}

        <polygon
          points={buildPolygon("saasPercent")}
          fill="#2563eb"
          fillOpacity={0.18}
          stroke="#2563eb"
          strokeWidth={2}
        />
        <polygon
          points={buildPolygon("iaPercent")}
          fill="#7c3aed"
          fillOpacity={0.18}
          stroke="#7c3aed"
          strokeWidth={2}
        />

        {axes.map((axis, i) => {
          const p = point(i, labelRadius);
          const shortLabel = RADAR_LABELS[axis.id] ?? axis.label;
          return (
            <text
              key={axis.id}
              x={p.x}
              y={p.y}
              textAnchor="middle"
              dominantBaseline="middle"
              className="fill-gray-700 text-[10px] font-medium"
            >
              {shortLabel}
            </text>
          );
        })}
      </svg>

      <div className="mt-4 flex justify-center gap-6 text-sm">
        <span className="inline-flex items-center gap-2">
          <span className="size-3 rounded-full bg-[#2563eb]" />
          SaaS Readiness
        </span>
        <span className="inline-flex items-center gap-2">
          <span className="size-3 rounded-full bg-[#7c3aed]" />
          IA Readiness
        </span>
      </div>
    </div>
  );
}
