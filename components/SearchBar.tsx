"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";

export function SearchBar({ initialQuery = "" }: { initialQuery?: string }) {
  const [query, setQuery] = useState(initialQuery);
  const [focused, setFocused] = useState(false);
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
      <div
        className={`flex gap-2 p-1.5 rounded-xl border transition-all duration-200 ${
          focused
            ? "border-accent/60 shadow-[0_0_0_3px_rgba(107,63,160,0.1)]"
            : "border-stone bg-white/80"
        }`}
      >
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          placeholder="Enter your zip code or full address"
          className="flex-1 px-3.5 py-2.5 rounded-lg bg-transparent text-dark-warm placeholder:text-stone focus:outline-none"
          aria-label="Enter your zip code or address"
        />
        <button
          type="submit"
          className="px-6 py-2.5 bg-dark-warm hover:bg-dark-mid text-paper font-medium rounded-lg transition-all duration-200 hover:shadow-md active:scale-[0.98]"
        >
          Search
        </button>
      </div>
    </form>
  );
}
