"use client";

import type { Race } from "@/lib/types";
import { CandidateList } from "./CandidateList";

export function ElectionSection({ races }: { races: Race[] }) {
  if (races.length === 0) return null;

  return (
    <section className="animate-fade-in" style={{ animationDelay: "200ms" }}>
      <h2 className="text-2xl text-dark-warm mb-4">
        2026 Elections in Your Area
      </h2>
      <div className="space-y-4 stagger-children">
        {races.map((race, i) => (
          <div
            key={i}
            className="bg-white rounded-xl border border-stone/50 p-5 hover:border-stone transition-colors duration-200"
          >
            <h3 className="font-display text-lg text-dark-warm mb-1">{race.name}</h3>
            <p className="text-xs text-muted mb-3">
              Candidate list updates automatically from FEC filings
            </p>
            <CandidateList candidates={race.candidates} />
          </div>
        ))}
      </div>
    </section>
  );
}
