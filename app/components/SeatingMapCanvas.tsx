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

// Green (#00AA6C) → Amber (#F5A623) heatmap in HSL. Hue space isn't perceptually
// even — ~158°→80° is all green and only ~60°→39° reads warm — so a linear ramp
// leaves the map green-dominant. We ease t (t^0.6) so it moves through the green
// range quickly and spends most of the scale in yellow/gold/amber: cheap sections
// stay green, mid-priced read gold, premium read amber.
function heatColor(t: number, lift = 0): string {
  const te = Math.pow(clamp(t, 0, 1), 0.6);
  const h = 158 - 119 * te;
  const s = 100 - 9 * te;
  const l = 33 + 22 * te + lift;
  return `hsl(${h.toFixed(0)} ${s.toFixed(0)}% ${l.toFixed(0)}%)`;
}

// Legend gradient sampled from heatColor so the bar always matches the map.
const LEGEND_GRADIENT = `linear-gradient(90deg, ${[0, 0.2, 0.4, 0.6, 0.8, 1]
  .map((t) => heatColor(t))
  .join(", ")})`;

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

        {/* Price tooltip — HTML in a foreignObject so it sizes to content, wraps
            long names, and stays within the map bounds. */}
        {active &&
          (() => {
            const boxW = 178;
            const boxH = 78;
            const x = clamp(active.centroid.x, boxW / 2 + 4, viewW - boxW / 2 - 4);
            const y = clamp(active.centroid.y, boxH / 2 + 4, viewH - boxH / 2 - 4);
            return (
              <foreignObject
                x={x - boxW / 2}
                y={y - boxH / 2}
                width={boxW}
                height={boxH}
                pointerEvents="none"
                style={{ overflow: "visible" }}
              >
                <div className="flex h-full w-full items-center justify-center">
                  <div className="max-w-[158px] rounded-[10px] border border-gray-200 bg-white px-3 py-1.5 text-center shadow-[0_2px_8px_rgba(15,23,42,0.18)]">
                    <div className="text-xs font-semibold leading-tight text-gray-500">
                      {active.section.name}
                    </div>
                    <div className="mt-0.5 text-[15px] font-extrabold leading-tight text-midnight">
                      from ${active.section.price}
                    </div>
                  </div>
                </div>
              </foreignObject>
            );
          })()}
      </svg>

      {/* Legend */}
      <div className="mt-4 flex flex-wrap items-center justify-center gap-x-3 gap-y-1">
        <span className="text-xs font-semibold text-gray-500">$ Cheaper</span>
        <div className="h-2.5 w-36 rounded-full sm:w-44" style={{ background: LEGEND_GRADIENT }} />
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
