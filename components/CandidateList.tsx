"use client";

import type { CandidateInfo } from "@/lib/types";
import { PacBadge } from "./PacBadge";

export function CandidateList({ candidates }: { candidates: CandidateInfo[] }) {
  if (candidates.length === 0) {
    return (
      <p className="text-sm text-muted italic">
        No candidates have filed with the FEC yet for this race. Check back as
        filing deadlines approach.
      </p>
    );
  }

  return (
    <ul className="space-y-0">
      {candidates.map((c, i) => (
        <li
          key={i}
          className="flex flex-wrap items-center gap-2 py-2.5 border-b border-stone/30 last:border-0 transition-colors duration-150 hover:bg-linen/30 -mx-2 px-2 rounded"
        >
          <span className="font-medium text-dark-warm text-sm">{c.name}</span>
          <span className="text-xs px-2 py-0.5 bg-linen rounded-full text-muted">
            {c.party}
          </span>
          {c.incumbentChallenge && (
            <span className="text-xs text-stone">
              ({c.incumbentChallenge})
            </span>
          )}
          {c.pacMoney && c.pacMoney.length > 0 && c.totalPacMoney && (
            <PacBadge
              contributions={c.pacMoney}
              totalAmount={c.totalPacMoney}
            />
          )}
          {c.fecId && (
            <a
              href={`https://www.fec.gov/data/candidate/${c.fecId}/`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-muted hover:text-dark-warm underline ml-auto transition-colors duration-200"
            >
              FEC Profile
            </a>
          )}
        </li>
      ))}
    </ul>
  );
}
