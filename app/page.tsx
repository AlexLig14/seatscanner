import { SearchBar } from "./components/SearchBar";
import { Navbar } from "./components/Navbar";
import { SiteFooter } from "./components/SiteFooter";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />

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

      <SiteFooter />
    </div>
  );
}
