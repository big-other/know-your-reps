"use client";

import { useState } from "react";
import type { PacContribution } from "@/lib/types";

function formatMoney(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function PacBadge({
  contributions,
  totalAmount,
}: {
  contributions: PacContribution[];
  totalAmount: number;
}) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="relative inline-block">
      <button
        onClick={() => setExpanded(!expanded)}
        className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-danger text-white text-xs font-semibold rounded-full hover:bg-danger/90 transition-colors cursor-pointer"
        aria-expanded={expanded}
        aria-label={`Took ${formatMoney(totalAmount)} from AI PACs. Click for details.`}
      >
        <svg
          className="w-3 h-3"
          fill="currentColor"
          viewBox="0 0 20 20"
          aria-hidden="true"
        >
          <path
            fillRule="evenodd"
            d="M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.168 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 2.495zM10 5a.75.75 0 01.75.75v3.5a.75.75 0 01-1.5 0v-3.5A.75.75 0 0110 5zm0 9a1 1 0 100-2 1 1 0 000 2z"
            clipRule="evenodd"
          />
        </svg>
        TOOK AI PAC MONEY
      </button>

      {expanded && (
        <div className="absolute z-10 mt-2 left-0 w-72 bg-white border border-border rounded-lg shadow-lg p-4">
          <h4 className="font-semibold text-sm text-nearblack mb-2">
            AI Industry PAC Contributions
          </h4>
          <p className="text-xs text-muted mb-3">
            Total: {formatMoney(totalAmount)}
          </p>
          <ul className="space-y-2">
            {contributions.map((c, i) => (
              <li
                key={i}
                className="flex justify-between items-center text-xs"
              >
                <span className="text-dark">{c.parent_company}</span>
                <span className="font-medium text-danger">
                  {formatMoney(c.amount)}
                </span>
              </li>
            ))}
          </ul>
          <p className="mt-3 text-xs text-muted">
            Source:{" "}
            <a
              href="https://www.humansfirst.org/ai-spending"
              target="_blank"
              rel="noopener noreferrer"
              className="underline hover:text-nearblack"
            >
              Humans First AI Spending Tracker
            </a>
          </p>
        </div>
      )}
    </div>
  );
}

export function ElectionBadge() {
  return (
    <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-saffron text-white text-xs font-semibold rounded-full">
      UP FOR ELECTION 2026
    </span>
  );
}
