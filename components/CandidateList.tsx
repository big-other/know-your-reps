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
    <ul className="space-y-2">
      {candidates.map((c, i) => (
        <li
          key={i}
          className="flex flex-wrap items-center gap-2 py-2 border-b border-border last:border-0"
        >
          <span className="font-medium text-nearblack text-sm">{c.name}</span>
          <span className="text-xs px-2 py-0.5 bg-surface rounded text-muted">
            {c.party}
          </span>
          {c.incumbentChallenge && (
            <span className="text-xs text-muted">
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
              className="text-xs text-muted hover:text-nearblack underline ml-auto"
            >
              FEC Profile
            </a>
          )}
        </li>
      ))}
    </ul>
  );
}
