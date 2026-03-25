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

function formatCompact(amount: number): string {
  if (amount >= 1000000) {
    return `$${(amount / 1000000).toFixed(1)}M`;
  }
  if (amount >= 1000) {
    return `$${Math.round(amount / 1000)}K`;
  }
  return `$${amount}`;
}

function getBadgeInfo(contributions: PacContribution[]): {
  label: string;
  allOppose: boolean;
} {
  const hasOppose = contributions.some((c) => c.supportOppose === "oppose");
  const hasSupport = contributions.some((c) => c.supportOppose === "support");

  if (hasOppose && !hasSupport) {
    return { label: "AI PAC OPPOSITION", allOppose: true };
  }
  if (hasOppose && hasSupport) {
    return { label: "AI PAC SPENDING", allOppose: false };
  }
  return { label: "AI PAC SUPPORT", allOppose: false };
}

export function PacBadge({
  contributions,
  totalAmount,
}: {
  contributions: PacContribution[];
  totalAmount: number;
}) {
  const [expanded, setExpanded] = useState(false);
  const { label, allOppose } = getBadgeInfo(contributions);

  return (
    <div className="relative inline-block">
      <button
        onClick={() => setExpanded(!expanded)}
        className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-white text-xs font-semibold rounded-full transition-all duration-200 cursor-pointer hover:shadow-sm active:scale-95 ${
          allOppose
            ? "bg-dark-mid hover:bg-dark-warm"
            : "bg-danger hover:bg-danger/90"
        }`}
        aria-expanded={expanded}
        aria-label={`${formatCompact(totalAmount)} in AI PAC spending. Click for details.`}
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
        {formatCompact(totalAmount)} {label}
      </button>

      {expanded && (
        <div className="absolute z-10 mt-2 left-0 w-80 bg-paper border border-stone rounded-xl shadow-lg p-4 animate-scale-in">
          <h4 className="font-display text-base text-dark-warm mb-1">
            AI Industry Spending
          </h4>
          <p className="text-xs text-muted mb-3">
            Independent expenditures — Total: {formatMoney(totalAmount)}
          </p>
          <ul className="space-y-2">
            {contributions.map((c, i) => (
              <li key={i} className="flex justify-between items-start gap-2 text-xs">
                <div className="min-w-0">
                  <span className="text-dark-warm font-medium block">
                    {c.pac_name}
                  </span>
                  <span
                    className={`text-xs ${
                      c.supportOppose === "oppose"
                        ? "text-dark-mid"
                        : "text-saffron"
                    }`}
                  >
                    {c.supportOppose === "oppose" ? "opposing" : "supporting"}
                    {c.parent_company !== c.pac_name && (
                      <> &middot; {c.parent_company}</>
                    )}
                  </span>
                </div>
                <span
                  className={`font-semibold shrink-0 ${
                    c.supportOppose === "oppose" ? "text-dark-mid" : "text-danger"
                  }`}
                >
                  {formatMoney(c.amount)}
                </span>
              </li>
            ))}
          </ul>
          <p className="mt-3 text-xs text-muted">
            Source:{" "}
            <a
              href="https://www.humansfirst.com/ai-spending"
              target="_blank"
              rel="noopener noreferrer"
              className="underline hover:text-dark-warm transition-colors duration-200"
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
    <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-saffron text-white text-xs font-semibold rounded-full font-[family-name:var(--font-body)]">
      UP FOR ELECTION 2026
    </span>
  );
}
