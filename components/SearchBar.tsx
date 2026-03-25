"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";

export function SearchBar({ initialQuery = "" }: { initialQuery?: string }) {
  const [query, setQuery] = useState(initialQuery);
  const router = useRouter();

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const trimmed = query.trim();
    if (trimmed) {
      router.push(`/lookup?q=${encodeURIComponent(trimmed)}`);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-xl mx-auto">
      <div className="flex gap-2">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Enter your zip code or full address"
          className="flex-1 px-4 py-3 rounded-lg border border-border bg-white text-nearblack placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-saffron/50 focus:border-saffron transition-colors"
          aria-label="Enter your zip code or address"
        />
        <button
          type="submit"
          className="px-6 py-3 bg-saffron hover:bg-saffron-dark text-white font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-saffron/50"
        >
          Search
        </button>
      </div>
    </form>
  );
}
