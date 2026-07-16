"use client";

import { useMemo } from "react";
import type { Section, SectionLevel } from "../data/mockEvents";
import { SeatingMapCanvas, type LaidOutSection, type ZoneLabel } from "./SeatingMapCanvas";

// --- Canvas ---
const VIEW_W = 800;
const VIEW_H = 720;

// --- Stage (wide rectangle at the top) ---
const STAGE = { x: 175, y: 46, w: 450, h: 54 };

// --- Floor: three wide bands stacked front → back, in front of the stage ---
const FLOOR = { x: 305, y: 128, w: 190, h: 170, gap: 6 };

// --- Bowl arc tiers (horseshoe fanning out below/around the floor) ---
const ARC_CX = 400;
const ARC_CY = 320;
const ARC_A0 = -32; // leading edge (upper-right), degrees
const ARC_A1 = 212; // trailing edge (upper-left) — opening (~116°) centered at the top
const ARC_GAP_DEG = 1.8;

interface TierRing {
  inner: number;
  outer: number;
}
const TIER_RINGS: Record<Exclude<SectionLevel, "Floor">, TierRing> = {
  Lower: { inner: 180, outer: 238 },
  Club: { inner: 251, outer: 309 },
  Upper: { inner: 322, outer: 380 },
};

const ZONE_LABELS: ZoneLabel[] = [
  { text: "GA FLOOR", x: 400, y: 213 },
  { text: "LOWER", x: 400, y: 529 },
  { text: "CLUB", x: 400, y: 600 },
  { text: "UPPER", x: 400, y: 671 },
];

const rad = (deg: number) => (deg * Math.PI) / 180;

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

export function ConcertMap({
  sections,
  centerLabel = "STAGE",
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

    // Floor bands (stacked front → back)
    const floor = sections.filter((s) => s.level === "Floor");
    const bandH = (FLOOR.h - FLOOR.gap * (floor.length - 1)) / floor.length;
    floor.forEach((section, i) => {
      const y = FLOOR.y + i * (bandH + FLOOR.gap);
      out.push({
        section,
        shape: { kind: "rect", x: FLOOR.x, y, w: FLOOR.w, h: bandH, rx: 6 },
        centroid: { x: FLOOR.x + FLOOR.w / 2, y: y + bandH / 2 },
      });
    });

    // Arc tiers (4 sections each; index 0 = Left/west → Right/east)
    (Object.keys(TIER_RINGS) as (keyof typeof TIER_RINGS)[]).forEach((level) => {
      const ring = TIER_RINGS[level];
      const group = sections.filter((s) => s.level === level);
      const step = (ARC_A1 - ARC_A0) / group.length;
      group.forEach((section, i) => {
        const a0 = ARC_A1 - (i + 1) * step + ARC_GAP_DEG / 2;
        const a1 = ARC_A1 - i * step - ARC_GAP_DEG / 2;
        const mid = rad((a0 + a1) / 2);
        const midR = (ring.inner + ring.outer) / 2;
        out.push({
          section,
          shape: { kind: "path", d: arcSectorPath(ring.inner, ring.outer, a0, a1) },
          centroid: { x: ARC_CX + midR * Math.cos(mid), y: ARC_CY + midR * Math.sin(mid) },
        });
      });
    });

    return out;
  }, [sections]);

  const centerContent = (
    <>
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
