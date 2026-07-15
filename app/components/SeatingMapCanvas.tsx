"use client";

import { useMemo, useState } from "react";
import type { Section } from "../data/mockEvents";

export type MapShape =
  | { kind: "rect"; x: number; y: number; w: number; h: number; rx?: number }
  | { kind: "path"; d: string };

export interface LaidOutSection {
  section: Section;
  shape: MapShape;
  centroid: { x: number; y: number };
}

export interface ZoneLabel {
  text: string;
  x: number;
  y: number;
}

const clamp = (n: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, n));

// Green (#00AA6C) → Amber (#F5A623) heatmap in HSL (vivid yellow-green midpoint).
function heatColor(t: number, lift = 0): string {
  const h = 158 - 119 * t;
  const s = 100 - 9 * t;
  const l = 33 + 22 * t + lift;
  return `hsl(${h.toFixed(0)} ${s.toFixed(0)}% ${l.toFixed(0)}%)`;
}

/**
 * Shared renderer for every stadium-map type (concert, arena, …). Each map
 * computes its own geometry (laidOut shapes, zone-label positions, and the
 * centerContent element) and hands it here; this component owns all the shared
 * behavior: rank-based heatmap coloring, hover/tap tooltips, selection wiring,
 * tier-label pills, legend, and disclaimer.
 */
export function SeatingMapCanvas({
  viewW,
  viewH,
  sections,
  laidOut,
  zoneLabels,
  centerContent,
  selectedId = null,
  onSelect,
}: {
  viewW: number;
  viewH: number;
  sections: Section[];
  laidOut: LaidOutSection[];
  zoneLabels: ZoneLabel[];
  centerContent: React.ReactNode;
  selectedId?: string | null;
  onSelect?: (id: string | null) => void;
}) {
  const [hoverId, setHoverId] = useState<string | null>(null);
  const tooltipId = hoverId ?? selectedId;

  // Rank-based color: spread the gradient evenly across all sections (tie-aware)
  // so the priciest sections read warm/amber, not squished into green.
  const colorFor = useMemo(() => {
    const prices = sections.map((s) => s.price);
    const sorted = [...prices].sort((a, b) => a - b);
    const n = prices.length;
    const rankT = (p: number) =>
      n <= 1 ? 0 : (sorted.indexOf(p) + sorted.lastIndexOf(p)) / 2 / (n - 1);
    const map = new Map<string, { color: string; active: string }>();
    for (const s of sections) {
      const t = rankT(s.price);
      map.set(s.id, { color: heatColor(t), active: heatColor(t, 9) });
    }
    return map;
  }, [sections]);

  const active = laidOut.find((s) => s.section.id === tooltipId) ?? null;
  const handleClick = (id: string) => onSelect?.(selectedId === id ? null : id);

  return (
    <div className="w-full">
      <svg
        viewBox={`0 0 ${viewW} ${viewH}`}
        className="h-auto w-full select-none"
        style={{ touchAction: "manipulation" }}
        role="img"
        aria-label="Seating map, color-coded by price"
      >
        <defs>
          <filter id="tooltipShadow" x="-30%" y="-30%" width="160%" height="160%">
            <feDropShadow dx="0" dy="2" stdDeviation="4" floodColor="#0F172A" floodOpacity="0.16" />
          </filter>
          <filter id="bowlShadow" x="-10%" y="-10%" width="120%" height="120%">
            <feDropShadow dx="0" dy="1.5" stdDeviation="2" floodColor="#0F172A" floodOpacity="0.12" />
          </filter>
        </defs>

        {/* Backdrop — tapping empty space clears the selection */}
        <rect x="0" y="0" width={viewW} height={viewH} fill="transparent" onClick={() => onSelect?.(null)} />

        {/* Center element (stage / court / rink) */}
        {centerContent}

        {/* Sections (with a soft group shadow for subtle depth) */}
        <g filter="url(#bowlShadow)">
          {laidOut.map(({ section, shape }) => {
            const c = colorFor.get(section.id) ?? { color: "#e5e7eb", active: "#d1d5db" };
            const isSelected = section.id === selectedId;
            const isHover = section.id === hoverId;
            const isActive = isSelected || isHover;
            const common = {
              fill: isActive ? c.active : c.color,
              stroke: isActive ? "#0F172A" : "#FFFFFF",
              strokeWidth: isSelected ? 3 : isHover ? 2.25 : 2,
              strokeLinejoin: "round" as const,
              className: "cursor-pointer transition-[stroke,fill] duration-150",
              onMouseEnter: () => setHoverId(section.id),
              onMouseLeave: () => setHoverId(null),
              onClick: (e: React.MouseEvent) => {
                e.stopPropagation();
                handleClick(section.id);
              },
            };
            const title = <title>{`${section.name} — from $${section.price}`}</title>;
            return shape.kind === "rect" ? (
              <rect key={section.id} x={shape.x} y={shape.y} width={shape.w} height={shape.h} rx={shape.rx ?? 4} {...common}>
                {title}
              </rect>
            ) : (
              <path key={section.id} d={shape.d} {...common}>
                {title}
              </path>
            );
          })}
        </g>

        {/* Zone labels on soft white pills for clear legibility */}
        <g pointerEvents="none">
          {zoneLabels.map((z) => {
            const w = z.text.length * 8.4 + 20;
            const h = 21;
            return (
              <g key={z.text}>
                <rect x={z.x - w / 2} y={z.y - h / 2} width={w} height={h} rx={h / 2} fill="#FFFFFF" fillOpacity={0.9} stroke="#E5E9EE" strokeOpacity={0.9} />
                <text x={z.x} y={z.y} textAnchor="middle" dominantBaseline="central" style={{ fontSize: 12.5, fontWeight: 800, letterSpacing: 1.2, fill: "#0F172A" }}>
                  {z.text}
                </text>
              </g>
            );
          })}
        </g>

        {/* Price tooltip for the hovered/selected section */}
        {active && (
          <g pointerEvents="none">
            {(() => {
              const w = 118;
              const h = 46;
              const x = clamp(active.centroid.x, w / 2 + 6, viewW - w / 2 - 6);
              const y = clamp(active.centroid.y, h / 2 + 6, viewH - h / 2 - 6);
              return (
                <>
                  <rect x={x - w / 2} y={y - h / 2} width={w} height={h} rx={10} fill="#FFFFFF" stroke="#E5E9EE" filter="url(#tooltipShadow)" />
                  <text x={x} y={y - 7} textAnchor="middle" className="fill-gray-500" style={{ fontSize: 12, fontWeight: 600 }}>
                    {active.section.name}
                  </text>
                  <text x={x} y={y + 13} textAnchor="middle" className="fill-midnight" style={{ fontSize: 16, fontWeight: 800 }}>
                    from ${active.section.price}
                  </text>
                </>
              );
            })()}
          </g>
        )}
      </svg>

      {/* Legend */}
      <div className="mt-4 flex flex-wrap items-center justify-center gap-x-3 gap-y-1">
        <span className="text-xs font-semibold text-gray-500">$ Cheaper</span>
        <div
          className="h-2.5 w-36 rounded-full sm:w-44"
          style={{ background: "linear-gradient(90deg, hsl(158 100% 33%), hsl(98 96% 44%), hsl(39 91% 55%))" }}
        />
        <span className="text-xs font-semibold text-gray-500">Pricier $$$</span>
      </div>
      <p className="mt-2 text-center text-xs text-gray-400">
        Hover or tap a section to see its starting price
      </p>
      <p className="mt-1 text-center text-[11px] text-gray-400">
        Generalized seating layout — actual section names and positions may vary by venue.
      </p>
    </div>
  );
}
