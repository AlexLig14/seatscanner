"use client";

import { useMemo, useState } from "react";
import type { Section, SectionLevel } from "../data/mockEvents";

// --- Canvas ---
const VIEW_W = 800;
const VIEW_H = 720;

// --- Stage (wide rectangle at the top) ---
const STAGE = { x: 175, y: 46, w: 450, h: 54 };

// --- Floor grid (nearest the stage) ---
const FLOOR = { x: 312, y: 138, w: 176, h: 156, cols: 2, rows: 3, gap: 6 };

// --- Bowl arc tiers (horseshoe fanning out below/around the floor) ---
const ARC_CX = 400;
const ARC_CY = 320;
const ARC_A0 = -32; // leading edge (upper-right), degrees
const ARC_A1 = 212; // trailing edge (upper-left) — opening (~116°) centered at the top
const ARC_GAP_DEG = 1.6;

interface TierRing {
  inner: number;
  outer: number;
}
const TIER_RINGS: Record<Exclude<SectionLevel, "Floor">, TierRing> = {
  Lower: { inner: 180, outer: 238 },
  Club: { inner: 251, outer: 309 },
  Upper: { inner: 322, outer: 380 },
};

const rad = (deg: number) => (deg * Math.PI) / 180;
const clamp = (n: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, n));

// Circular annular-sector path between two angles (degrees).
function arcSectorPath(inner: number, outer: number, a0deg: number, a1deg: number): string {
  const a0 = rad(a0deg);
  const a1 = rad(a1deg);
  const pt = (r: number, a: number) => [ARC_CX + r * Math.cos(a), ARC_CY + r * Math.sin(a)];
  const [x0o, y0o] = pt(outer, a0);
  const [x1o, y1o] = pt(outer, a1);
  const [x1i, y1i] = pt(inner, a1);
  const [x0i, y0i] = pt(inner, a0);
  const largeArc = a1deg - a0deg > 180 ? 1 : 0;
  return [
    `M${x0o.toFixed(2)},${y0o.toFixed(2)}`,
    `A${outer},${outer} 0 ${largeArc} 1 ${x1o.toFixed(2)},${y1o.toFixed(2)}`,
    `L${x1i.toFixed(2)},${y1i.toFixed(2)}`,
    `A${inner},${inner} 0 ${largeArc} 0 ${x0i.toFixed(2)},${y0i.toFixed(2)}`,
    "Z",
  ].join(" ");
}

// Green (#00AA6C) → Amber (#F5A623) heatmap in HSL (vivid yellow-green midpoint).
function heatColor(t: number, lift = 0): string {
  const h = 158 - 119 * t;
  const s = 100 - 9 * t;
  const l = 33 + 22 * t + lift;
  return `hsl(${h.toFixed(0)} ${s.toFixed(0)}% ${l.toFixed(0)}%)`;
}

interface LaidOutSection {
  section: Section;
  shape:
    | { kind: "rect"; x: number; y: number; w: number; h: number }
    | { kind: "path"; d: string };
  centroid: { x: number; y: number };
  color: string;
  activeColor: string;
}

export function StadiumMap({
  sections,
  centerLabel = "STAGE",
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
    const withColor = (section: Section, shape: LaidOutSection["shape"], centroid: { x: number; y: number }) => {
      const t = norm(section.price);
      return { section, shape, centroid, color: heatColor(t), activeColor: heatColor(t, 9) };
    };

    const out: LaidOutSection[] = [];

    // Floor grid (row-major)
    const floor = sections.filter((s) => s.level === "Floor");
    const cellW = (FLOOR.w - FLOOR.gap * (FLOOR.cols - 1)) / FLOOR.cols;
    const cellH = (FLOOR.h - FLOOR.gap * (FLOOR.rows - 1)) / FLOOR.rows;
    floor.forEach((section, i) => {
      const r = Math.floor(i / FLOOR.cols);
      const c = i % FLOOR.cols;
      const x = FLOOR.x + c * (cellW + FLOOR.gap);
      const y = FLOOR.y + r * (cellH + FLOOR.gap);
      out.push(
        withColor(section, { kind: "rect", x, y, w: cellW, h: cellH }, { x: x + cellW / 2, y: y + cellH / 2 })
      );
    });

    // Arc tiers
    (Object.keys(TIER_RINGS) as (keyof typeof TIER_RINGS)[]).forEach((level) => {
      const ring = TIER_RINGS[level];
      const group = sections.filter((s) => s.level === level);
      const step = (ARC_A1 - ARC_A0) / group.length;
      group.forEach((section, i) => {
        const a0 = ARC_A0 + i * step + ARC_GAP_DEG / 2;
        const a1 = ARC_A0 + (i + 1) * step - ARC_GAP_DEG / 2;
        const mid = rad((a0 + a1) / 2);
        const midR = (ring.inner + ring.outer) / 2;
        out.push(
          withColor(
            section,
            { kind: "path", d: arcSectorPath(ring.inner, ring.outer, a0, a1) },
            { x: ARC_CX + midR * Math.cos(mid), y: ARC_CY + midR * Math.sin(mid) }
          )
        );
      });
    });

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
        aria-label="Concert venue seating map, color-coded by price"
      >
        <defs>
          <filter id="tooltipShadow" x="-30%" y="-30%" width="160%" height="160%">
            <feDropShadow dx="0" dy="2" stdDeviation="4" floodColor="#0F172A" floodOpacity="0.16" />
          </filter>
        </defs>

        {/* Backdrop — tapping empty space dismisses a pinned section */}
        <rect x="0" y="0" width={VIEW_W} height={VIEW_H} fill="transparent" onClick={() => setPinnedId(null)} />

        {/* Stage */}
        <rect x={STAGE.x} y={STAGE.y} width={STAGE.w} height={STAGE.h} rx={8} fill="#0F172A" />
        <text
          x={STAGE.x + STAGE.w / 2}
          y={STAGE.y + STAGE.h / 2}
          textAnchor="middle"
          dominantBaseline="central"
          className="fill-white"
          style={{ fontSize: 20, fontWeight: 800, letterSpacing: 6 }}
        >
          {centerLabel}
        </text>

        {/* Sections */}
        {laidOut.map(({ section, shape, color, activeColor }) => {
          const isActive = section.id === activeId;
          const common = {
            fill: isActive ? activeColor : color,
            stroke: isActive ? "#0F172A" : "#FFFFFF",
            strokeWidth: isActive ? 2.5 : 2,
            strokeLinejoin: "round" as const,
            className: "cursor-pointer transition-[stroke,fill] duration-150",
            onMouseEnter: () => setHoverId(section.id),
            onMouseLeave: () => setHoverId(null),
            onClick: (e: React.MouseEvent) => {
              e.stopPropagation();
              setPinnedId((prev) => (prev === section.id ? null : section.id));
            },
          };
          const title = <title>{`${section.name} — from $${section.price}`}</title>;
          return shape.kind === "rect" ? (
            <rect key={section.id} x={shape.x} y={shape.y} width={shape.w} height={shape.h} rx={4} {...common}>
              {title}
            </rect>
          ) : (
            <path key={section.id} d={shape.d} {...common}>
              {title}
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
      <div className="mt-4 flex flex-wrap items-center justify-center gap-x-3 gap-y-1">
        <span className="text-xs font-semibold text-gray-500">$ Cheaper</span>
        <div
          className="h-2.5 w-36 rounded-full sm:w-44"
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
