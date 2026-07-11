"use client";

import { useState } from "react";

export function SearchBar() {
  const [query, setQuery] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    // search logic will go here
  }

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-2xl">
      <div className="flex items-center bg-white border border-gray-200 rounded-2xl shadow-[0_4px_32px_rgba(0,0,0,0.08)] overflow-hidden transition-shadow hover:shadow-[0_4px_40px_rgba(0,0,0,0.12)]">
        <svg
          className="ml-5 shrink-0 text-gray-400"
          width="20"
          height="20"
          viewBox="0 0 20 20"
          fill="none"
          aria-hidden="true"
        >
          <circle cx="8.5" cy="8.5" r="5.75" stroke="currentColor" strokeWidth="1.5" />
          <path d="M13 13l3.5 3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search for an artist, team, or event..."
          className="flex-1 px-4 py-5 text-base text-midnight placeholder-gray-400 bg-transparent outline-none font-sans"
          aria-label="Search for an artist, team, or event"
        />
        <button
          type="submit"
          className="m-2 px-6 py-3 bg-seat-green text-white font-semibold rounded-xl hover:brightness-105 active:brightness-95 transition-all cursor-pointer"
        >
          Search
        </button>
      </div>
    </form>
  );
}
