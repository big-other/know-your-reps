"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState, Suspense } from "react";
import { SearchBar } from "@/components/SearchBar";
import { RepCard } from "@/components/RepCard";
import { ElectionSection } from "@/components/ElectionSection";
import type { LookupResponse } from "@/lib/types";

function formatMoney(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

function LookupResults() {
  const searchParams = useSearchParams();
  const query = searchParams.get("q") || "";
  const [data, setData] = useState<LookupResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!query) return;

    setLoading(true);
    setError(null);
    setData(null);

    fetch(`/api/lookup?q=${encodeURIComponent(query)}`)
      .then(async (res) => {
        const json = await res.json();
        if (!res.ok) {
          setError(json.error || "Something went wrong");
        } else {
          setData(json);
        }
      })
      .catch(() => {
        setError("Failed to connect. Please check your connection and try again.");
      })
      .finally(() => {
        setLoading(false);
      });
  }, [query]);

  if (!query) {
    return (
      <div className="text-center py-12">
        <p className="text-muted">Enter a zip code or address to get started.</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="inline-block w-8 h-8 border-2 border-saffron border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-muted">Looking up your representatives...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="bg-danger-light border border-danger/20 rounded-lg p-6 max-w-md mx-auto">
          <p className="text-danger font-medium">{error}</p>
        </div>
      </div>
    );
  }

  if (!data) return null;

  const federalReps = data.representatives.filter((r) => r.level === "federal");
  const stateReps = data.representatives.filter((r) => r.level === "state");

  return (
    <div className="space-y-10">
      {/* Multiple districts warning */}
      {data.multipleDistricts && (
        <div className="bg-saffron/10 border border-saffron/30 rounded-lg p-4 text-sm text-dark">
          Your zip code spans multiple congressional districts. We&apos;re
          showing the most likely match. For a precise result, enter your full
          street address.
        </div>
      )}

      {/* Section 1: Representatives */}
      <section>
        <h2 className="text-xl font-semibold text-nearblack mb-4">
          Your Representatives
        </h2>

        {federalReps.length > 0 && (
          <div className="mb-6">
            <h3 className="text-sm font-medium text-muted uppercase tracking-wide mb-3">
              Federal
            </h3>
            <div className="grid gap-3">
              {federalReps.map((rep, i) => (
                <RepCard key={i} rep={rep} />
              ))}
            </div>
          </div>
        )}

        {stateReps.length > 0 && (
          <div>
            <h3 className="text-sm font-medium text-muted uppercase tracking-wide mb-3">
              State
            </h3>
            <div className="grid gap-3">
              {stateReps.map((rep, i) => (
                <RepCard key={i} rep={rep} />
              ))}
            </div>
          </div>
        )}
      </section>

      {/* Section 2: 2026 Elections */}
      <ElectionSection races={data.races} />

      {/* Section 3: AI Spending Summary */}
      {data.aiSpendingSummary.totalAmount > 0 && (
        <section>
          <h2 className="text-xl font-semibold text-nearblack mb-4">
            AI Industry Spending in Your Races
          </h2>
          <div className="bg-danger-light border border-danger/20 rounded-lg p-6">
            <p className="text-lg font-semibold text-danger mb-2">
              {formatMoney(data.aiSpendingSummary.totalAmount)} from AI industry
              PACs
            </p>
            <p className="text-sm text-dark mb-3">
              flowing into races that affect your representation
            </p>
            {data.aiSpendingSummary.pacs.length > 0 && (
              <ul className="space-y-1 mb-4">
                {data.aiSpendingSummary.pacs.map((p, i) => (
                  <li
                    key={i}
                    className="flex justify-between text-sm text-dark"
                  >
                    <span>{p.name}</span>
                    <span className="font-medium">{formatMoney(p.amount)}</span>
                  </li>
                ))}
              </ul>
            )}
            <a
              href="https://www.humansfirst.com/ai-spending"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-danger font-medium underline hover:no-underline"
            >
              See full AI spending data at humansfirst.com
            </a>
          </div>
        </section>
      )}
    </div>
  );
}

export default function LookupPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <div className="mb-8">
        <Suspense>
          <LookupSearchBar />
        </Suspense>
      </div>
      <Suspense
        fallback={
          <div className="text-center py-12">
            <p className="text-muted">Loading...</p>
          </div>
        }
      >
        <LookupResults />
      </Suspense>
    </div>
  );
}

function LookupSearchBar() {
  const searchParams = useSearchParams();
  const query = searchParams.get("q") || "";
  return <SearchBar initialQuery={query} />;
}
