import { Navbar } from "../components/Navbar";
import { SiteFooter } from "../components/SiteFooter";
import { SearchBar } from "../components/SearchBar";
import { EventCard } from "../components/EventCard";
import { mockEvents } from "../data/mockEvents";

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  const query = q?.trim() || "Taylor Swift";

  // Mock: real filtering happens once the API is wired up.
  const results = mockEvents;

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />

      {/* Search header */}
      <section className="border-b border-gray-100 bg-gray-50/60 px-6 py-8">
        <div className="mx-auto flex max-w-3xl flex-col items-center gap-5">
          <SearchBar defaultValue={query} />
        </div>
      </section>

      {/* Results */}
      <main className="mx-auto w-full max-w-3xl flex-1 px-6 py-10">
        <div className="mb-6 flex items-baseline justify-between">
          <h1 className="text-2xl font-extrabold tracking-tight text-midnight">
            Results for{" "}
            <span className="text-seat-green">&ldquo;{query}&rdquo;</span>
          </h1>
          <span className="text-sm text-gray-400">
            {results.length} events
          </span>
        </div>

        <div className="flex flex-col gap-4">
          {results.map((event) => (
            <EventCard key={event.id} event={event} />
          ))}
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}
