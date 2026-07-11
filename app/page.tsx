import { SearchBar } from "./components/SearchBar";

function TicketIcon({ width, height }: { width: number; height: number }) {
  return (
    <svg width={width} height={height} viewBox="0 0 80 48" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <path d="M7 0 L73 0 A7 7 0 0 0 80 7 L80 41 A7 7 0 0 0 73 48 L7 48 A7 7 0 0 0 0 41 L0 7 A7 7 0 0 0 7 0 Z" fill="#F5A623"/>
      <path d="M23 6 L57 6 A4 4 0 0 0 61 10 L61 38 A4 4 0 0 0 57 42 L23 42 A4 4 0 0 0 19 38 L19 10 A4 4 0 0 0 23 6 Z" fill="white"/>
      <line x1="13" y1="0" x2="13" y2="48" stroke="white" strokeWidth="1.5" strokeDasharray="3 2"/>
      <line x1="67" y1="0" x2="67" y2="48" stroke="white" strokeWidth="1.5" strokeDasharray="3 2"/>
    </svg>
  );
}

function Wordmark({ size = "lg" }: { size?: "sm" | "lg" }) {
  const isLg = size === "lg";
  return (
    <span className="flex items-center gap-2">
      <TicketIcon width={isLg ? 40 : 40} height={isLg ? 24 : 24} />
      <span className="text-2xl font-extrabold tracking-tight">
        <span className="text-midnight">Seat</span>
        <span className="text-seat-green">Scanner</span>
      </span>
    </span>
  );
}

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Navbar */}
      <nav className="flex items-center justify-between px-8 py-5 border-b border-gray-100">
        <a href="/" aria-label="SeatScanner home">
          <Wordmark size="lg" />
        </a>
      </nav>

      {/* Hero */}
      <main className="flex-1 flex flex-col items-center justify-center px-6 py-24 text-center">
        <h1 className="text-6xl font-extrabold text-midnight leading-tight tracking-tight mb-5 max-w-3xl">
          Any ticket.{" "}
          <span className="text-seat-green">Best price.</span>
        </h1>
        <p className="text-xl text-gray-500 mb-14 max-w-lg leading-relaxed">
          Search and compare tickets across every major platform in one place.
        </p>
        <SearchBar />
        <p className="mt-6 text-sm text-gray-400">
          Concerts · Sports · Theater · Comedy · More
        </p>
      </main>

      {/* Footer */}
      <footer className="px-8 py-8 border-t border-gray-100">
        <div className="flex flex-col items-center gap-2">
          <Wordmark size="sm" />
          <p className="text-sm font-light text-gray-400 tracking-wide">
            Any ticket. Best price.
          </p>
        </div>
      </footer>
    </div>
  );
}
