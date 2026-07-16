"use client";

import { useMemo } from "react";
import type { Section, SectionLevel } from "../data/mockEvents";
import { SeatingMapCanvas, type LaidOutSection, type ZoneLabel } from "./SeatingMapCanvas";

// --- Canvas (very wide — a football field is ~3.2:1) ---
const VIEW_W = 850;
const VIEW_H = 560;
const CX = 425;
const CY = 280;

// --- Field: large elongated rectangle at ~3.2:1 (360ft × 160ft w/ end zones) ---
const HW_F = 224; // half-width
const HH_F = 70; //  half-height (448 × 140 = 3.2:1)
const FIELD = { x: CX - HW_F, y: CY - HH_F, w: HW_F * 2, h: HH_F * 2 };

interface Ring {
  innerR: number;
  outerR: number;
}
const RINGS: Record<Exclude<SectionLevel, "Floor">, Ring> = {
  Lower: { innerR: 16, outerR: 68 },
  Club: { innerR: 76, outerR: 128 },
  Upper: { innerR: 136, outerR: 188 },
};

// The two long sidelines split into thirds (Left / Center=50-yard / Right).
const xL = CX - HW_F / 3;
const xR = CX + HW_F / 3;

const CORNER_SWEEP = 40;
const ABS = (90 - CORNER_SWEEP) / 2; // curve absorbed by adjacent straight per end
const H = CORNER_SWEEP / 2;
const GA = 1.5; // half the angular gap between adjacent arc sections
const G = 3; // half the linear gap between adjacent straight sub-sections

const CORNER: Record<string, { x: number; y: number; diag: number }> = {
  TL: { x: CX - HW_F, y: CY - HH_F, diag: 225 },
  TR: { x: CX + HW_F, y: CY - HH_F, diag: 315 },
  BR: { x: CX + HW_F, y: CY + HH_F, diag: 45 },
  BL: { x: CX - HW_F, y: CY + HH_F, diag: 135 },
};

type Node =
  | { kind: "arc"; corner: string; a0: number; a1: number }
  | { kind: "pt"; edge: "top" | "bottom" | "left" | "right"; along: number };

const arc = (corner: string, a0: number, a1: number): Node => ({ kind: "arc", corner, a0, a1 });
const pt = (edge: "top" | "bottom" | "left" | "right", along: number): Node => ({ kind: "pt", edge, along });

// 12 sections per tier: 2 sidelines × 3 (L / Center / R) + 2 end zones + 4 corners.
const SECTIONS: Record<string, Node[]> = {
  "sideline-far-left": [arc("TL", 270 - ABS + GA, 270), pt("top", xL - G)],
  "sideline-far-center": [pt("top", xL + G), pt("top", xR - G)],
  "sideline-far-right": [pt("top", xR + G), arc("TR", 270, 270 + ABS - GA)],
  "corner-far-right": [arc("TR", 315 - H + GA, 315 + H - GA)],
  "endzone-right": [arc("TR", 360 - ABS + GA, 360), arc("BR", 0, ABS - GA)],
  "corner-near-right": [arc("BR", 45 - H + GA, 45 + H - GA)],
  "sideline-near-right": [arc("BR", 90 - ABS + GA, 90), pt("bottom", xR + G)],
  "sideline-near-center": [pt("bottom", xL + G), pt("bottom", xR - G)],
  "sideline-near-left": [pt("bottom", xL - G), arc("BL", 90, 90 + ABS - GA)],
  "corner-near-left": [arc("BL", 135 - H + GA, 135 + H - GA)],
  "endzone-left": [arc("BL", 180 - ABS + GA, 180), arc("TL", 180, 180 + ABS - GA)],
  "corner-far-left": [arc("TL", 225 - H + GA, 225 + H - GA)],
};

const rad = (deg: number) => (deg * Math.PI) / 180;

function coord(n: Node, r: number, end: boolean): string {
  let x = 0;
  let y = 0;
  if (n.kind === "arc") {
    const a = rad(end ? n.a1 : n.a0);
    const c = CORNER[n.corner];
    x = c.x + r * Math.cos(a);
    y = c.y + r * Math.sin(a);
  } else if (n.edge === "top") {
    x = n.along;
    y = CY - HH_F - r;
  } else if (n.edge === "bottom") {
    x = n.along;
    y = CY + HH_F + r;
  } else if (n.edge === "left") {
    x = CX - HW_F - r;
    y = n.along;
  } else {
    x = CX + HW_F + r;
    y = n.along;
  }
  return `${x.toFixed(2)},${y.toFixed(2)}`;
}

// Rounded-rect band section: trace the outer edge forward, the inner edge back.
function bandPath(nodes: Node[], ri: number, ro: number): string {
  let d = `M ${coord(nodes[0], ro, false)}`;
  for (let i = 0; i < nodes.length; i++) {
    if (nodes[i].kind === "arc") d += ` A ${ro} ${ro} 0 0 1 ${coord(nodes[i], ro, true)}`;
    if (i < nodes.length - 1) d += ` L ${coord(nodes[i + 1], ro, false)}`;
  }
  d += ` L ${coord(nodes[nodes.length - 1], ri, true)}`;
  for (let i = nodes.length - 1; i >= 0; i--) {
    if (nodes[i].kind === "arc") d += ` A ${ri} ${ri} 0 0 0 ${coord(nodes[i], ri, false)}`;
    if (i > 0) d += ` L ${coord(nodes[i - 1], ri, true)}`;
  }
  return d + " Z";
}

function slugOf(id: string): string {
  return id.split("-").slice(1).join("-");
}

function centroidFor(slug: string, midR: number): { x: number; y: number } {
  switch (slug) {
    case "sideline-far-center":
      return { x: CX, y: CY - HH_F - midR };
    case "sideline-far-left":
      return { x: (CX - HW_F + xL) / 2, y: CY - HH_F - midR };
    case "sideline-far-right":
      return { x: (xR + CX + HW_F) / 2, y: CY - HH_F - midR };
    case "sideline-near-center":
      return { x: CX, y: CY + HH_F + midR };
    case "sideline-near-left":
      return { x: (CX - HW_F + xL) / 2, y: CY + HH_F + midR };
    case "sideline-near-right":
      return { x: (xR + CX + HW_F) / 2, y: CY + HH_F + midR };
    case "endzone-left":
      return { x: CX - HW_F - midR, y: CY };
    case "endzone-right":
      return { x: CX + HW_F + midR, y: CY };
    default: {
      const node = SECTIONS[slug][0];
      const c = CORNER[node.kind === "arc" ? node.corner : "TL"];
      const a = rad(c.diag);
      return { x: c.x + midR * Math.cos(a), y: c.y + midR * Math.sin(a) };
    }
  }
}

export function StadiumMap({
  sections,
  centerLabel = "FIELD",
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
          const nodes = SECTIONS[slug];
          if (!nodes) return;
          out.push({
            section,
            shape: { kind: "path", d: bandPath(nodes, innerR, outerR) },
            centroid: centroidFor(slug, midR),
          });
        });
    });
    return out;
  }, [sections]);

  const centerContent = (
    <>
      <rect x={FIELD.x} y={FIELD.y} width={FIELD.w} height={FIELD.h} rx={10} fill="#0F172A" />
      <text
        x={CX}
        y={CY}
        textAnchor="middle"
        dominantBaseline="central"
        className="fill-white"
        style={{ fontSize: 22, fontWeight: 800, letterSpacing: 8 }}
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

// Tier labels sit on the near (bottom) sideline center of each ring.
const ZONE_LABELS: ZoneLabel[] = (["Lower", "Club", "Upper"] as const).map((lvl) => ({
  text: lvl.toUpperCase(),
  x: CX,
  y: CY + HH_F + (RINGS[lvl].innerR + RINGS[lvl].outerR) / 2,
}));
