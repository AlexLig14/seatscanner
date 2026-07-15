import Link from "next/link";
import { notFound } from "next/navigation";
import { Navbar } from "../../components/Navbar";
import { SiteFooter } from "../../components/SiteFooter";
import { PricePrediction } from "../../components/PricePrediction";
import { SeatingSection } from "../../components/SeatingSection";
import { getEventById } from "../../data/mockEvents";
import type { SeatEvent } from "../../data/mockEvents";

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

// Label for the center of the map. Arenas show COURT for basketball, RINK for
// hockey. stadium/baseball use the concert map for now (FIELD).
function centerLabelFor(event: SeatEvent): string {
  switch (event.venueType) {
    case "concert":
      return "STAGE";
    case "arena":
      return event.sport === "hockey" ? "RINK" : "COURT";
    default:
      return "FIELD";
  }
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

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />

      <main className="mx-auto w-full max-w-7xl flex-1 px-6 py-10 lg:px-8">
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

        {/* Stadium map (left) + section-aware price comparison (right) */}
        <SeatingSection event={event} centerLabel={centerLabelFor(event)} />

        {/* Buy now vs. wait — price prediction (full width, below) */}
        <PricePrediction prediction={event.prediction} />
      </main>

      <SiteFooter />
    </div>
  );
}
