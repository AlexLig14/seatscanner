"use client";

import { useState } from "react";
import { ConcertMap } from "./ConcertMap";
import { ArenaMap } from "./ArenaMap";
import { StadiumMap } from "./StadiumMap";
import { PricePanel } from "./PricePanel";
import type { SeatEvent } from "../data/mockEvents";

// Map each venue type to its seating-map component. "baseball" falls back to the
// concert map until its own map is built.
const MAP_BY_VENUE = {
  concert: ConcertMap,
  arena: ArenaMap,
  stadium: StadiumMap,
  baseball: ConcertMap,
} as const;

export function SeatingSection({
  event,
  centerLabel,
}: {
  event: SeatEvent;
  centerLabel: string;
}) {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const selected = selectedId
    ? event.sections.find((s) => s.id === selectedId) ?? null
    : null;

  const SeatMap = MAP_BY_VENUE[event.venueType] ?? ConcertMap;

  return (
    <section className="mt-10 grid gap-8 lg:grid-cols-2 lg:items-start lg:gap-12">
      {/* Left: stadium map (component chosen by venue type) */}
      <div>
        <h2 className="mb-4 text-xl font-extrabold tracking-tight text-midnight">
          Pick your section
        </h2>
        <div className="rounded-3xl border border-gray-200 bg-white px-4 py-6 shadow-[0_1px_3px_rgba(0,0,0,0.04)] sm:px-6">
          <SeatMap
            sections={event.sections}
            centerLabel={centerLabel}
            selectedId={selectedId}
            onSelect={setSelectedId}
          />
        </div>
      </div>

      {/* Right: price panel — overall by default, per-section when one is selected */}
      <div>
        <PricePanel
          title={selected ? selected.name : "Best prices — all sections"}
          platforms={selected ? selected.platforms : event.platforms}
          onBack={selected ? () => setSelectedId(null) : undefined}
        />
      </div>
    </section>
  );
}
