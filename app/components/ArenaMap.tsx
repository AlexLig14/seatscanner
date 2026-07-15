"use client";

import { useMemo } from "react";
import type { Section, SectionLevel } from "../data/mockEvents";
import { SeatingMapCanvas, type LaidOutSection, type MapShape, type ZoneLabel } from "./SeatingMapCanvas";

// --- Canvas (noticeably wider than tall, like a real arena footprint) ---
const VIEW_W = 780;
const VIEW_H = 600;
const CX = 390;
const CY = 300;

// --- Court / rink: a large central rectangle at ~1.9:1 (94ft × 50ft) ---
const HW_C = 180; // court half-width
const HH_C = 95; //  court half-height (360 × 190 ≈ 1.9:1)
const COURT = { x: CX - HW_C, y: CY - HH_C, w: HW_C * 2, h: HH_C * 2 };

// The seating bowl is a rounded rectangle hugging the court. Each tier ring is a
// band offset outward from the court edge; a small apron sits between the court
// and the Lower ring. Corner arcs are centered exactly on the court's corners.
interface Ring {
  innerR: number; // distance from the court edge to the ring's inner face
  outerR: number;
}
const RINGS: Record<Exclude<SectionLevel, "Floor">, Ring> = {
  Lower: { innerR: 16, outerR: 68 }, // 16px apron, ~52px thick
  Club: { innerR: 76, outerR: 128 },
  Upper: { innerR: 136, outerR: 188 },
};

const G = 6; // linear gap between adjacent straight sections

// Corner arc centers (the court's four corners) and their 90° sweep.
const CORNERS: Record<string, { cx: number; cy: number; a0: number; a1: number }> = {
  "corner-far-right": { cx: CX + HW_C, cy: CY - HH_C, a0: 270, a1: 360 }, // top-right
  "corner-far-left": { cx: CX - HW_C, cy: CY - HH_C, a0: 180, a1: 270 }, // top-left
  "corner-near-right": { cx: CX + HW_C, cy: CY + HH_C, a0: 0, a1: 90 }, // bottom-right
  "corner-near-left": { cx: CX - HW_C, cy: CY + HH_C, a0: 90, a1: 180 }, // bottom-left
};

// Tier labels sit on the near (bottom) sideline of each ring.
const ZONE_LABELS: ZoneLabel[] = (["Lower", "Club", "Upper"] as const).map((lvl) => ({
  text: lvl.toUpperCase(),
  x: CX,
  y: CY + HH_C + (RINGS[lvl].innerR + RINGS[lvl].outerR) / 2,
}));

const rad = (deg: number) => (deg * Math.PI) / 180;
const clamp = (n: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, n));

// Circular annular-sector path centered at an arbitrary point (used for corners).
function annSector(ccx: number, ccy: number, ri: number, ro: number, a0deg: number, a1deg: number): string {
  const a0 = rad(a0deg);
  const a1 = rad(a1deg);
  const pt = (r: number, a: number) => [ccx + r * Math.cos(a), ccy + r * Math.sin(a)];
  const [x0o, y0o] = pt(ro, a0);
  const [x1o, y1o] = pt(ro, a1);
  const [x1i, y1i] = pt(ri, a1);
  const [x0i, y0i] = pt(ri, a0);
  const large = a1deg - a0deg > 180 ? 1 : 0;
  return [
    `M${x0o.toFixed(2)},${y0o.toFixed(2)}`,
    `A${ro},${ro} 0 ${large} 1 ${x1o.toFixed(2)},${y1o.toFixed(2)}`,
    `L${x1i.toFixed(2)},${y1i.toFixed(2)}`,
    `A${ri},${ri} 0 ${large} 0 ${x0i.toFixed(2)},${y0i.toFixed(2)}`,
    "Z",
  ].join(" ");
}

function slugOf(id: string): string {
  return id.split("-").slice(1).join("-");
}

// Geometry for one section (identified by slug) within a tier ring.
function shapeFor(slug: string, ring: Ring): { shape: MapShape; centroid: { x: number; y: number } } {
  const { innerR, outerR } = ring;
  const midR = (innerR + outerR) / 2;

  switch (slug) {
    case "sideline-far": // straight band above the court (top)
      return {
        shape: { kind: "rect", x: CX - HW_C + G, y: CY - HH_C - outerR, w: 2 * HW_C - 2 * G, h: outerR - innerR, rx: 3 },
        centroid: { x: CX, y: CY - HH_C - midR },
      };
    case "sideline-near": // straight band below the court (bottom)
      return {
        shape: { kind: "rect", x: CX - HW_C + G, y: CY + HH_C + innerR, w: 2 * HW_C - 2 * G, h: outerR - innerR, rx: 3 },
        centroid: { x: CX, y: CY + HH_C + midR },
      };
    case "baseline-left": // straight band left of the court
      return {
        shape: { kind: "rect", x: CX - HW_C - outerR, y: CY - HH_C + G, w: outerR - innerR, h: 2 * HH_C - 2 * G, rx: 3 },
        centroid: { x: CX - HW_C - midR, y: CY },
      };
    case "baseline-right": // straight band right of the court
      return {
        shape: { kind: "rect", x: CX + HW_C + innerR, y: CY - HH_C + G, w: outerR - innerR, h: 2 * HH_C - 2 * G, rx: 3 },
        centroid: { x: CX + HW_C + midR, y: CY },
      };
    default: {
      // Curved corner arc centered on the court's corner.
      const c = CORNERS[slug];
      const deltaDeg = clamp((G / midR) * (180 / Math.PI), 2.5, 6);
      const a0 = c.a0 + deltaDeg;
      const a1 = c.a1 - deltaDeg;
      const midA = rad((a0 + a1) / 2);
      return {
        shape: { kind: "path", d: annSector(c.cx, c.cy, innerR, outerR, a0, a1) },
        centroid: { x: c.cx + midR * Math.cos(midA), y: c.cy + midR * Math.sin(midA) },
      };
    }
  }
}

export function ArenaMap({
  sections,
  centerLabel = "COURT",
  selectedId = null,
  onSelect,
}: {
  sections: Section[];
  centerLabel?: string;
  selectedId?: string | null;
  onSelect?: (id: string | null) => void;
}) {
  const laidOut = useMemo<LaidOutSection[]>(() => {
    const out: LaidOutSection[] = [];
    (Object.keys(RINGS) as (keyof typeof RINGS)[]).forEach((level) => {
      const ring = RINGS[level];
      sections
        .filter((s) => s.level === level)
        .forEach((section) => {
          const slug = slugOf(section.id);
          if (slug !== "sideline-far" && slug !== "sideline-near" && slug !== "baseline-left" && slug !== "baseline-right" && !CORNERS[slug]) {
            return;
          }
          const { shape, centroid } = shapeFor(slug, ring);
          out.push({ section, shape, centroid });
        });
    });
    return out;
  }, [sections]);

  const centerContent = (
    <>
      <rect x={COURT.x} y={COURT.y} width={COURT.w} height={COURT.h} rx={10} fill="#0F172A" />
      <text
        x={CX}
        y={CY}
        textAnchor="middle"
        dominantBaseline="central"
        className="fill-white"
        style={{ fontSize: 22, fontWeight: 800, letterSpacing: 7 }}
      >
        {centerLabel}
      </text>
    </>
  );

  return (
    <SeatingMapCanvas
      viewW={VIEW_W}
      viewH={VIEW_H}
      sections={sections}
      laidOut={laidOut}
      zoneLabels={ZONE_LABELS}
      centerContent={centerContent}
      selectedId={selectedId}
      onSelect={onSelect}
    />
  );
}
