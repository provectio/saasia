import { CGU_TOC } from "@/components/CguContent";

interface CguTocNavProps {
  /** Si fourni, navigation par scroll dans le conteneur parent (modale). */
  onSectionClick?: (sectionId: string) => void;
  activeId?: string;
  compact?: boolean;
}

export function CguTocNav({
  onSectionClick,
  activeId,
  compact = false,
}: CguTocNavProps) {
  return (
    <nav
      className={
        compact
          ? "rounded-2xl border border-gray-200 bg-gray-50/80 p-3"
          : "rounded-2xl border border-gray-200 bg-white p-4 shadow-sm"
      }
      aria-label="Sommaire des CGU"
    >
      <p className="text-xs font-semibold uppercase tracking-wider text-primary">
        Sommaire
      </p>
      <ol className={`mt-3 space-y-0.5 ${compact ? "text-xs" : "text-sm"}`}>
        {CGU_TOC.map((item, i) => {
          const isActive = activeId === item.id;
          const className = `block rounded-lg px-2 py-1.5 transition ${
            isActive
              ? "bg-primary/10 font-medium text-primary"
              : "text-gray-600 hover:bg-primary/5 hover:text-primary"
          }`;

          if (onSectionClick) {
            return (
              <li key={item.id}>
                <button type="button" onClick={() => onSectionClick(item.id)} className={`w-full text-left ${className}`}>
                  <span className="font-medium text-gray-400">{i + 1}.</span> {item.label}
                </button>
              </li>
            );
          }

          return (
            <li key={item.id}>
              <a href={`#${item.id}`} className={className}>
                <span className="font-medium text-gray-400">{i + 1}.</span> {item.label}
              </a>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
