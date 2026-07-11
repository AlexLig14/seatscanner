import Link from "next/link";
import { notFound } from "next/navigation";
import { Navbar } from "../../components/Navbar";
import { SiteFooter } from "../../components/SiteFooter";
import { PricePrediction } from "../../components/PricePrediction";
import { StadiumMap } from "../../components/StadiumMap";
import { getEventById } from "../../data/mockEvents";
import type { SeatEvent, PlatformPrice } from "../../data/mockEvents";

function formatDate(iso: string): string {
  const d = new Date(iso + "T00:00:00");
  return d.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

function CategoryBadge({ category }: { category: SeatEvent["category"] }) {
  const label = category === "concert" ? "Concert" : "Sports";
  return (
    <span className="inline-flex items-center rounded-full bg-seat-green/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-seat-green">
      {label}
    </span>
  );
}

function PlatformRow({
  entry,
  isBest,
}: {
  entry: PlatformPrice;
  isBest: boolean;
}) {
  return (
    <div
      className={`flex items-center justify-between gap-6 rounded-2xl border px-6 py-5 transition-all ${
        isBest
          ? "border-seat-green bg-seat-green/5 shadow-[0_4px_20px_rgba(0,170,108,0.12)]"
          : "border-gray-200 bg-white"
      }`}
    >
      {/* Left: platform name + best-price badge */}
      <div className="flex min-w-0 items-center gap-3">
        <span className="text-lg font-bold tracking-tight text-midnight">
          {entry.platform}
        </span>
        {isBest && (
          <span className="inline-flex items-center rounded-full bg-seat-green px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wide text-white">
            Best Price
          </span>
        )}
      </div>

      {/* Right: price + action */}
      <div className="flex shrink-0 items-center gap-6">
        <div
          className={`text-2xl font-extrabold ${
            isBest ? "text-seat-green" : "text-midnight"
          }`}
        >
          ${entry.price}
        </div>
        <a
          href="#"
          className="inline-flex items-center rounded-xl bg-scanner-amber px-5 py-2.5 text-sm font-semibold text-midnight transition-all hover:brightness-105"
        >
          Go to {entry.platform}
        </a>
      </div>
    </div>
  );
}

export default async function EventDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const event = getEventById(id);

  if (!event) {
    notFound();
  }

  // Sort platforms cheapest → most expensive; the first is the best price.
  const sorted = [...event.platforms].sort((a, b) => a.price - b.price);
  const bestPrice = sorted[0]?.price;

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />

      <main className="mx-auto w-full max-w-3xl flex-1 px-6 py-10">
        {/* Back link */}
        <Link
          href="/search"
          className="mb-6 inline-flex items-center gap-1.5 text-sm font-medium text-gray-500 transition-colors hover:text-midnight"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
            <path d="M10 12L6 8l4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          Back to results
        </Link>

        {/* Event header */}
        <section className="rounded-3xl border border-gray-200 bg-white px-8 py-8 shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
          <CategoryBadge category={event.category} />
          <h1 className="mt-3 text-4xl font-extrabold tracking-tight text-midnight">
            {event.name}
          </h1>
          <div className="mt-4 flex flex-wrap items-center gap-x-2 gap-y-1 text-base text-gray-600">
            <span>{formatDate(event.date)}</span>
            <span className="text-gray-300">·</span>
            <span>{event.time}</span>
          </div>
          <div className="mt-1 text-base text-gray-600">
            <span className="font-semibold text-midnight">{event.venue}</span>
            <span className="text-gray-300"> · </span>
            <span>{event.city}</span>
          </div>
        </section>

        {/* Stadium map — pick your section (visual only for now) */}
        <section className="mt-10">
          <h2 className="mb-4 text-xl font-extrabold tracking-tight text-midnight">
            Pick your section
          </h2>
          <div className="rounded-3xl border border-gray-200 bg-white px-4 py-6 shadow-[0_1px_3px_rgba(0,0,0,0.04)] sm:px-8">
            <StadiumMap
              sections={event.sections}
              centerLabel={event.category === "concert" ? "STAGE" : "FIELD"}
            />
          </div>
        </section>

        {/* Platform price comparison */}
        <section className="mt-10">
          <div className="mb-4 flex items-baseline justify-between">
            <h2 className="text-xl font-extrabold tracking-tight text-midnight">
              Compare prices
            </h2>
            <span className="text-sm text-gray-400">
              {sorted.length} platforms
            </span>
          </div>
          <div className="flex flex-col gap-3">
            {sorted.map((entry) => (
              <PlatformRow
                key={entry.platform}
                entry={entry}
                isBest={entry.price === bestPrice}
              />
            ))}
          </div>
        </section>

        {/* Buy now vs. wait — price prediction */}
        <PricePrediction prediction={event.prediction} />
      </main>

      <SiteFooter />
    </div>
  );
}
