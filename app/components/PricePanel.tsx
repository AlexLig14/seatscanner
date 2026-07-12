"use client";

import type { PlatformPrice } from "../data/mockEvents";

function PlatformRow({ entry, isBest }: { entry: PlatformPrice; isBest: boolean }) {
  return (
    <div
      className={`flex items-center justify-between gap-3 rounded-2xl border px-4 py-4 transition-all sm:px-5 ${
        isBest
          ? "border-seat-green bg-seat-green/5 shadow-[0_4px_20px_rgba(0,170,108,0.12)]"
          : "border-gray-200 bg-white"
      }`}
    >
      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-base font-bold tracking-tight text-midnight sm:text-lg">
            {entry.platform}
          </span>
          {isBest && (
            <span className="inline-flex items-center rounded-full bg-seat-green px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wide text-white">
              Best Price
            </span>
          )}
        </div>
        <div className={`mt-0.5 text-xl font-extrabold ${isBest ? "text-seat-green" : "text-midnight"}`}>
          ${entry.price}
        </div>
      </div>
      <a
        href="#"
        className={`shrink-0 rounded-xl px-4 py-2.5 text-sm font-semibold transition-all hover:brightness-105 ${
          isBest ? "bg-seat-green text-white" : "bg-scanner-amber text-midnight"
        }`}
      >
        Go to {entry.platform}
      </a>
    </div>
  );
}

export function PricePanel({
  title,
  platforms,
  onBack,
}: {
  title: string;
  platforms: PlatformPrice[];
  onBack?: () => void;
}) {
  const sorted = [...platforms].sort((a, b) => a.price - b.price);
  const best = sorted[0]?.price;

  return (
    <div>
      {onBack && (
        <button
          type="button"
          onClick={onBack}
          className="mb-3 inline-flex items-center gap-1.5 text-sm font-medium text-gray-500 transition-colors hover:text-midnight"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
            <path d="M10 12L6 8l4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          All sections
        </button>
      )}
      <div className="mb-4 flex items-baseline justify-between gap-3">
        <h2 className="truncate text-xl font-extrabold tracking-tight text-midnight">{title}</h2>
        <span className="shrink-0 text-sm text-gray-400">{sorted.length} platforms</span>
      </div>
      <div className="flex flex-col gap-3">
        {sorted.map((entry) => (
          <PlatformRow key={entry.platform} entry={entry} isBest={entry.price === best} />
        ))}
      </div>
    </div>
  );
}
