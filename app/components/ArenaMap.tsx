"use client";

import { useMemo } from "react";
import type { Section, SectionLevel } from "../data/mockEvents";
import { SeatingMapCanvas, type LaidOutSection, type ZoneLabel } from "./SeatingMapCanvas";

// --- Canvas ---
const VIEW_W = 800;
const VIEW_H = 680;
const CX = 400;
const CY = 335;

// --- Court / rink (horizontal rectangle in the center) ---
const COURT = { x: 300, y: 285, w: 200, h: 100 };

// --- Concentric elliptical tiers wrapping fully around the court ---
interface Ellip {
  iRx: number;
  iRy: number;
  oRx: number;
  oRy: number;
}
const RINGS: Record<Exclude<SectionLevel, "Floor">, Ellip> = {
  Lower: { iRx: 145, iRy: 90, oRx: 220, oRy: 150 },
  Club: { iRx: 233, iRy: 163, oRx: 308, oRy: 223 },
  Upper: { iRx: 321, iRy: 236, oRx: 385, oRy: 296 },
};

// Center angle (deg, SVG y-down) for each section position around the bowl.
// Court is horizontal, so top/bottom arcs are the long sidelines, left/right the
// short baselines, and the diagonals are corners.
const SLUG_ANGLE: Record<string, number> = {
  "sideline-near": 90, // bottom (long side, near viewer)
  "sideline-far": 270, // top (long side, far)
  "baseline-right": 0, // right end
  "baseline-left": 180, // left end
  "corner-near-right": 45,
  "corner-near-left": 135,
  "corner-far-left": 225,
  "corner-far-right": 315,
};
const SECTOR_HALF = 22.5; // 8 sections × 45°
const GAP_DEG = 2;

// Tier labels sit at the bottom (near sideline) of each ring.
const ZONE_LABELS: ZoneLabel[] = [
  { text: "LOWER", x: CX, y: CY + (RINGS.Lower.iRy + RINGS.Lower.oRy) / 2 },
  { text: "CLUB", x: CX, y: CY + (RINGS.Club.iRy + RINGS.Club.oRy) / 2 },
  { text: "UPPER", x: CX, y: CY + (RINGS.Upper.iRy + RINGS.Upper.oRy) / 2 },
];

const rad = (deg: number) => (deg * Math.PI) / 180;

// Elliptical annular-sector path between two angles (degrees).
function ellipticalSectorPath(iRx: number, iRy: number, oRx: number, oRy: number, a0deg: number, a1deg: number): string {
  const a0 = rad(a0deg);
  const a1 = rad(a1deg);
  const pt = (rx: number, ry: number, a: number) => [CX + rx * Math.cos(a), CY + ry * Math.sin(a)];
  const [x0o, y0o] = pt(oRx, oRy, a0);
  const [x1o, y1o] = pt(oRx, oRy, a1);
  const [x1i, y1i] = pt(iRx, iRy, a1);
  const [x0i, y0i] = pt(iRx, iRy, a0);
  const large = a1deg - a0deg > 180 ? 1 : 0;
  return [
    `M${x0o.toFixed(2)},${y0o.toFixed(2)}`,
    `A${oRx},${oRy} 0 ${large} 1 ${x1o.toFixed(2)},${y1o.toFixed(2)}`,
    `L${x1i.toFixed(2)},${y1i.toFixed(2)}`,
    `A${iRx},${iRy} 0 ${large} 0 ${x0i.toFixed(2)},${y0i.toFixed(2)}`,
    "Z",
  ].join(" ");
}

function slugOf(id: string): string {
  return id.split("-").slice(1).join("-");
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
          const angle = SLUG_ANGLE[slugOf(section.id)];
          if (angle === undefined) return;
          const a0 = angle - SECTOR_HALF + GAP_DEG / 2;
          const a1 = angle + SECTOR_HALF - GAP_DEG / 2;
          const midRx = (ring.iRx + ring.oRx) / 2;
          const midRy = (ring.iRy + ring.oRy) / 2;
          out.push({
            section,
            shape: { kind: "path", d: ellipticalSectorPath(ring.iRx, ring.iRy, ring.oRx, ring.oRy, a0, a1) },
            centroid: { x: CX + midRx * Math.cos(rad(angle)), y: CY + midRy * Math.sin(rad(angle)) },
          });
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
        style={{ fontSize: 20, fontWeight: 800, letterSpacing: 6 }}
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
