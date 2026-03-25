"use client";

import type { Race } from "@/lib/types";
import { CandidateList } from "./CandidateList";

export function ElectionSection({ races }: { races: Race[] }) {
  if (races.length === 0) return null;

  return (
    <section>
      <h2 className="text-xl font-semibold text-nearblack mb-4">
        2026 Elections in Your Area
      </h2>
      <div className="space-y-4">
        {races.map((race, i) => (
          <div
            key={i}
            className="bg-white rounded-lg border border-border p-4"
          >
            <h3 className="font-semibold text-nearblack mb-1">{race.name}</h3>
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
