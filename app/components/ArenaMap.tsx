"use client";

import { useMemo } from "react";
import type { Section, SectionLevel } from "../data/mockEvents";
import { SeatingMapCanvas, type LaidOutSection, type ZoneLabel } from "./SeatingMapCanvas";

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
// and the Lower ring. Corner arcs are centered on the court's corners.
interface Ring {
  innerR: number;
  outerR: number;
}
const RINGS: Record<Exclude<SectionLevel, "Floor">, Ring> = {
  Lower: { innerR: 16, outerR: 68 },
  Club: { innerR: 76, outerR: 128 },
  Upper: { innerR: 136, outerR: 188 },
};

// Corner sections occupy only a narrow wedge at each turn; the straight sideline
// and baseline sections absorb the rest of the curve, so the sides dominate.
const CORNER_SWEEP = 40; // degrees of arc the corner section spans (was ~90)
const ABS = (90 - CORNER_SWEEP) / 2; // curve each straight section absorbs per end
const H = CORNER_SWEEP / 2;
const GAP_A = 3; // angular gap between adjacent sections

// Corner arc centers (the court's four corners) + the diagonal each faces.
const CORNER: Record<string, { x: number; y: number; diag: number }> = {
  TL: { x: CX - HW_C, y: CY - HH_C, diag: 225 },
  TR: { x: CX + HW_C, y: CY - HH_C, diag: 315 },
  BR: { x: CX + HW_C, y: CY + HH_C, diag: 45 },
  BL: { x: CX - HW_C, y: CY + HH_C, diag: 135 },
};

// Each section as an ordered list of corner arcs (a0→a1, increasing = clockwise).
// Straight sections list two arcs (the small curved ends) joined by a straight run.
const SECTIONS: Record<string, { c: string; a0: number; a1: number }[]> = {
  "sideline-far": [{ c: "TL", a0: 270 - ABS, a1: 270 }, { c: "TR", a0: 270, a1: 270 + ABS }],
  "corner-far-right": [{ c: "TR", a0: 315 - H, a1: 315 + H }],
  "baseline-right": [{ c: "TR", a0: 360 - ABS, a1: 360 }, { c: "BR", a0: 0, a1: ABS }],
  "corner-near-right": [{ c: "BR", a0: 45 - H, a1: 45 + H }],
  "sideline-near": [{ c: "BR", a0: 90 - ABS, a1: 90 }, { c: "BL", a0: 90, a1: 90 + ABS }],
  "corner-near-left": [{ c: "BL", a0: 135 - H, a1: 135 + H }],
  "baseline-left": [{ c: "BL", a0: 180 - ABS, a1: 180 }, { c: "TL", a0: 180, a1: 180 + ABS }],
  "corner-far-left": [{ c: "TL", a0: 225 - H, a1: 225 + H }],
};

const rad = (deg: number) => (deg * Math.PI) / 180;

function P(corner: string, r: number, aDeg: number): string {
  const c = CORNER[corner];
  const a = rad(aDeg);
  return `${(c.x + r * Math.cos(a)).toFixed(2)},${(c.y + r * Math.sin(a)).toFixed(2)}`;
}

// Build a rounded-rect band section from its corner-arc list (outer edge forward,
// inner edge back). Straight runs between arcs are drawn as straight lines.
function bandPath(arcsIn: { c: string; a0: number; a1: number }[], ri: number, ro: number): string {
  const a = arcsIn.map((x) => ({ ...x }));
  a[0].a0 += GAP_A / 2;
  a[a.length - 1].a1 -= GAP_A / 2;

  let d = `M ${P(a[0].c, ro, a[0].a0)}`;
  for (let i = 0; i < a.length; i++) {
    d += ` A ${ro} ${ro} 0 0 1 ${P(a[i].c, ro, a[i].a1)}`;
    if (i < a.length - 1) d += ` L ${P(a[i + 1].c, ro, a[i + 1].a0)}`;
  }
  d += ` L ${P(a[a.length - 1].c, ri, a[a.length - 1].a1)}`;
  for (let i = a.length - 1; i >= 0; i--) {
    d += ` A ${ri} ${ri} 0 0 0 ${P(a[i].c, ri, a[i].a0)}`;
    if (i > 0) d += ` L ${P(a[i - 1].c, ri, a[i - 1].a1)}`;
  }
  return d + " Z";
}

function slugOf(id: string): string {
  return id.split("-").slice(1).join("-");
}

function centroidFor(slug: string, midR: number): { x: number; y: number } {
  switch (slug) {
    case "sideline-far":
      return { x: CX, y: CY - HH_C - midR };
    case "sideline-near":
      return { x: CX, y: CY + HH_C + midR };
    case "baseline-left":
      return { x: CX - HW_C - midR, y: CY };
    case "baseline-right":
      return { x: CX + HW_C + midR, y: CY };
    default: {
      const c = CORNER[SECTIONS[slug][0].c];
      const a = rad(c.diag);
      return { x: c.x + midR * Math.cos(a), y: c.y + midR * Math.sin(a) };
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
      const { innerR, outerR } = RINGS[level];
      const midR = (innerR + outerR) / 2;
      sections
        .filter((s) => s.level === level)
        .forEach((section) => {
          const slug = slugOf(section.id);
          const arcs = SECTIONS[slug];
          if (!arcs) return;
          out.push({
            section,
            shape: { kind: "path", d: bandPath(arcs, innerR, outerR) },
            centroid: centroidFor(slug, midR),
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

// Tier labels sit on the near (bottom) sideline of each ring.
const ZONE_LABELS: ZoneLabel[] = (["Lower", "Club", "Upper"] as const).map((lvl) => ({
  text: lvl.toUpperCase(),
  x: CX,
  y: CY + HH_C + (RINGS[lvl].innerR + RINGS[lvl].outerR) / 2,
}));
