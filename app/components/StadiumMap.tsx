"use client";

import { useMemo, useState } from "react";
import type { Section, SectionLevel } from "../data/mockEvents";

// --- Bowl geometry (viewBox units) ---
const VIEW_W = 820;
const VIEW_H = 580;
const CX = 410;
const CY = 285;
const GAP_DEG = 2.2; // gap between adjacent sections

interface Ring {
  innerRx: number;
  innerRy: number;
  outerRx: number;
  outerRy: number;
  count: number;
  startDeg: number; // angle of the first section's leading edge
}

// Concentric rings, inner (Floor) → outer (Upper). Section counts sum to 24.
const RINGS: Record<SectionLevel, Ring> = {
  Floor: { innerRx: 130, innerRy: 82, outerRx: 190, outerRy: 120, count: 4, startDeg: -45 },
  Lower: { innerRx: 190, innerRy: 120, outerRx: 265, outerRy: 165, count: 8, startDeg: 0 },
  Club: { innerRx: 265, innerRy: 165, outerRx: 340, outerRy: 210, count: 6, startDeg: 0 },
  Upper: { innerRx: 340, innerRy: 210, outerRx: 395, outerRy: 250, count: 6, startDeg: 0 },
};

const LEVEL_ORDER: SectionLevel[] = ["Floor", "Lower", "Club", "Upper"];

const rad = (deg: number) => (deg * Math.PI) / 180;
const clamp = (n: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, n));

// Elliptical annular-sector path between two angles.
function sectorPath(
  innerRx: number,
  innerRy: number,
  outerRx: number,
  outerRy: number,
  a0: number,
  a1: number
): string {
  const pt = (rx: number, ry: number, a: number) => [
    CX + rx * Math.cos(a),
    CY + ry * Math.sin(a),
  ];
  const [x0o, y0o] = pt(outerRx, outerRy, a0);
  const [x1o, y1o] = pt(outerRx, outerRy, a1);
  const [x1i, y1i] = pt(innerRx, innerRy, a1);
  const [x0i, y0i] = pt(innerRx, innerRy, a0);
  const largeArc = a1 - a0 > Math.PI ? 1 : 0;
  return [
    `M${x0o.toFixed(2)},${y0o.toFixed(2)}`,
    `A${outerRx},${outerRy} 0 ${largeArc} 1 ${x1o.toFixed(2)},${y1o.toFixed(2)}`,
    `L${x1i.toFixed(2)},${y1i.toFixed(2)}`,
    `A${innerRx},${innerRy} 0 ${largeArc} 0 ${x0i.toFixed(2)},${y0i.toFixed(2)}`,
    "Z",
  ].join(" ");
}

// Green (#00AA6C) → Amber (#F5A623) heatmap, interpolated in HSL so the midpoint
// passes through a vivid yellow-green rather than a muddy brown. t: 0 = cheapest.
function heatColor(t: number, lift = 0): string {
  const h = 158 - 119 * t;
  const s = 100 - 9 * t;
  const l = 33 + 22 * t + lift;
  return `hsl(${h.toFixed(0)} ${s.toFixed(0)}% ${l.toFixed(0)}%)`;
}

interface LaidOutSection {
  section: Section;
  path: string;
  centroid: { x: number; y: number };
  color: string;
  activeColor: string;
}

export function StadiumMap({
  sections,
  centerLabel = "FIELD",
}: {
  sections: Section[];
  centerLabel?: string;
}) {
  const [hoverId, setHoverId] = useState<string | null>(null);
  const [pinnedId, setPinnedId] = useState<string | null>(null);
  const activeId = hoverId ?? pinnedId;

  const laidOut = useMemo<LaidOutSection[]>(() => {
    const prices = sections.map((s) => s.price);
    const min = Math.min(...prices);
    const max = Math.max(...prices);
    const norm = (p: number) => (max === min ? 0 : (p - min) / (max - min));

    const out: LaidOutSection[] = [];
    for (const level of LEVEL_ORDER) {
      const ring = RINGS[level];
      const group = sections.filter((s) => s.level === level);
      const step = 360 / ring.count;
      group.slice(0, ring.count).forEach((section, i) => {
        const a0 = rad(ring.startDeg + i * step + GAP_DEG / 2);
        const a1 = rad(ring.startDeg + (i + 1) * step - GAP_DEG / 2);
        const mid = (a0 + a1) / 2;
        const midRx = (ring.innerRx + ring.outerRx) / 2;
        const midRy = (ring.innerRy + ring.outerRy) / 2;
        const t = norm(section.price);
        out.push({
          section,
          path: sectorPath(ring.innerRx, ring.innerRy, ring.outerRx, ring.outerRy, a0, a1),
          centroid: { x: CX + midRx * Math.cos(mid), y: CY + midRy * Math.sin(mid) },
          color: heatColor(t),
          activeColor: heatColor(t, 9),
        });
      });
    }
    return out;
  }, [sections]);

  const active = laidOut.find((s) => s.section.id === activeId) ?? null;

  return (
    <div className="w-full">
      <svg
        viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
        className="h-auto w-full select-none"
        style={{ touchAction: "manipulation" }}
        role="img"
        aria-label="Stadium seating map, color-coded by price"
      >
        <defs>
          <filter id="tooltipShadow" x="-30%" y="-30%" width="160%" height="160%">
            <feDropShadow dx="0" dy="2" stdDeviation="4" floodColor="#0F172A" floodOpacity="0.16" />
          </filter>
        </defs>

        {/* Backdrop — tapping empty space dismisses a pinned section */}
        <rect
          x="0"
          y="0"
          width={VIEW_W}
          height={VIEW_H}
          fill="transparent"
          onClick={() => setPinnedId(null)}
        />

        {/* Center field / stage */}
        <rect
          x={CX - 90}
          y={CY - 40}
          width={180}
          height={80}
          rx={10}
          fill="#0F172A"
        />
        <text
          x={CX}
          y={CY}
          textAnchor="middle"
          dominantBaseline="central"
          className="fill-white"
          style={{ fontSize: 20, fontWeight: 800, letterSpacing: 4 }}
        >
          {centerLabel}
        </text>

        {/* Sections */}
        {laidOut.map(({ section, path, color, activeColor }) => {
          const isActive = section.id === activeId;
          return (
            <path
              key={section.id}
              d={path}
              fill={isActive ? activeColor : color}
              stroke={isActive ? "#0F172A" : "#FFFFFF"}
              strokeWidth={isActive ? 2.5 : 2}
              strokeLinejoin="round"
              className="cursor-pointer transition-[stroke,fill] duration-150"
              onMouseEnter={() => setHoverId(section.id)}
              onMouseLeave={() => setHoverId(null)}
              onClick={(e) => {
                e.stopPropagation();
                setPinnedId((prev) => (prev === section.id ? null : section.id));
              }}
            >
              <title>{`${section.name} — from $${section.price}`}</title>
            </path>
          );
        })}

        {/* Price tooltip for the active section */}
        {active && (
          <g pointerEvents="none">
            {(() => {
              const w = 118;
              const h = 46;
              const x = clamp(active.centroid.x, w / 2 + 6, VIEW_W - w / 2 - 6);
              const y = clamp(active.centroid.y, h / 2 + 6, VIEW_H - h / 2 - 6);
              return (
                <>
                  <rect
                    x={x - w / 2}
                    y={y - h / 2}
                    width={w}
                    height={h}
                    rx={10}
                    fill="#FFFFFF"
                    stroke="#E5E9EE"
                    filter="url(#tooltipShadow)"
                  />
                  <text
                    x={x}
                    y={y - 7}
                    textAnchor="middle"
                    className="fill-gray-500"
                    style={{ fontSize: 12, fontWeight: 600 }}
                  >
                    {active.section.name}
                  </text>
                  <text
                    x={x}
                    y={y + 13}
                    textAnchor="middle"
                    className="fill-midnight"
                    style={{ fontSize: 16, fontWeight: 800 }}
                  >
                    from ${active.section.price}
                  </text>
                </>
              );
            })()}
          </g>
        )}
      </svg>

      {/* Legend */}
      <div className="mt-4 flex items-center justify-center gap-3">
        <span className="text-xs font-semibold text-gray-500">$ Cheaper</span>
        <div
          className="h-2.5 w-40 rounded-full"
          style={{
            background:
              "linear-gradient(90deg, hsl(158 100% 33%), hsl(98 96% 44%), hsl(39 91% 55%))",
          }}
        />
        <span className="text-xs font-semibold text-gray-500">Pricier $$$</span>
      </div>
      <p className="mt-2 text-center text-xs text-gray-400">
        Hover or tap a section to see its starting price
      </p>
    </div>
  );
}
