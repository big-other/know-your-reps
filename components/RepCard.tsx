"use client";

import { useState } from "react";
import type { RepresentativeCard } from "@/lib/types";
import { PacBadge, ElectionBadge } from "./PacBadge";

export function RepCard({ rep }: { rep: RepresentativeCard }) {
  const [imgError, setImgError] = useState(false);

  return (
    <div className="bg-white rounded-lg border border-border p-4 flex gap-4">
      {/* Photo */}
      <div className="shrink-0">
        {rep.photoUrl && !imgError ? (
          <img
            src={rep.photoUrl}
            alt={`Photo of ${rep.name}`}
            className="w-20 h-24 object-cover rounded bg-surface"
            onError={() => setImgError(true)}
          />
        ) : (
          <div className="w-20 h-24 bg-surface rounded flex items-center justify-center">
            <svg
              className="w-10 h-10 text-muted"
              fill="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
            </svg>
          </div>
        )}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex flex-wrap items-start gap-2 mb-1">
          <h3 className="font-semibold text-nearblack">{rep.name}</h3>
          <span className="text-xs px-2 py-0.5 bg-surface rounded text-muted">
            {rep.party}
          </span>
        </div>

        <p className="text-sm text-muted mb-1">
          {rep.title}
          {rep.district ? ` — ${rep.district}` : ""}
        </p>

        {/* Contact */}
        <div className="flex flex-wrap gap-3 text-xs text-muted mb-2">
          {rep.phone && (
            <a href={`tel:${rep.phone}`} className="hover:text-nearblack">
              {rep.phone}
            </a>
          )}
          {rep.website && (
            <a
              href={rep.website}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-nearblack underline"
            >
              Website
            </a>
          )}
          {rep.contactForm && (
            <a
              href={rep.contactForm}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-nearblack underline"
            >
              Contact Form
            </a>
          )}
        </div>

        {/* Badges */}
        <div className="flex flex-wrap gap-2">
          {rep.upForElection2026 && <ElectionBadge />}
          {rep.pacMoney && rep.pacMoney.length > 0 && rep.totalPacMoney && (
            <PacBadge
              contributions={rep.pacMoney}
              totalAmount={rep.totalPacMoney}
            />
          )}
        </div>
      </div>
    </div>
  );
}
