import Link from "next/link";
import type { SeatEvent } from "../data/mockEvents";

function formatDate(iso: string): string {
  const d = new Date(iso + "T00:00:00");
  return d.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function CategoryBadge({ category }: { category: SeatEvent["category"] }) {
  const label = category === "concert" ? "Concert" : "Sports";
  return (
    <span className="inline-flex items-center rounded-full bg-seat-green/10 px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wide text-seat-green">
      {label}
    </span>
  );
}

export function EventCard({ event }: { event: SeatEvent }) {
  return (
    <Link
      href={`/event/${event.id}`}
      className="group flex flex-col gap-4 rounded-2xl border border-gray-200 bg-white px-6 py-5 shadow-[0_1px_3px_rgba(0,0,0,0.04)] transition-all hover:-translate-y-0.5 hover:border-gray-300 hover:shadow-[0_8px_28px_rgba(0,0,0,0.10)] sm:flex-row sm:items-center sm:justify-between sm:gap-6"
    >
      {/* Left: event details */}
      <div className="flex min-w-0 flex-col gap-2">
        <div className="flex items-center gap-3">
          <CategoryBadge category={event.category} />
        </div>
        <h3 className="text-xl font-extrabold tracking-tight text-midnight sm:truncate">
          {event.name}
        </h3>
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-gray-500">
          <span>{formatDate(event.date)}</span>
          <span className="text-gray-300">·</span>
          <span>{event.time}</span>
        </div>
        <div className="text-sm text-gray-500">
          <span className="font-medium text-gray-700">{event.venue}</span>
          <span className="text-gray-300"> · </span>
          <span>{event.city}</span>
        </div>
      </div>

      {/* Right: price + action — full-width row on mobile, stacked column on desktop */}
      <div className="flex items-center justify-between gap-4 sm:shrink-0 sm:flex-col sm:items-end sm:gap-3">
        <div className="text-left leading-none sm:text-right">
          <div className="text-xs font-medium uppercase tracking-wide text-gray-400">
            from
          </div>
          <div className="text-2xl font-extrabold text-seat-green">
            ${event.fromPrice}
          </div>
        </div>
        <span className="inline-flex items-center rounded-xl bg-scanner-amber px-5 py-2.5 text-sm font-semibold text-midnight transition-all group-hover:brightness-105">
          View Tickets
        </span>
      </div>
    </Link>
  );
}
