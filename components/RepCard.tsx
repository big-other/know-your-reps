"use client";

import { useState } from "react";
import type { RepresentativeCard } from "@/lib/types";
import { PacBadge, ElectionBadge } from "./PacBadge";

function PhoneIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 0 0 2.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 0 1-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 0 0-1.091-.852H4.5A2.25 2.25 0 0 0 2.25 4.5v2.25Z" />
    </svg>
  );
}

function GlobeIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 0 0 8.716-6.747M12 21a9.004 9.004 0 0 1-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 0 1 7.843 4.582M12 3a8.997 8.997 0 0 0-7.843 4.582m15.686 0A11.953 11.953 0 0 1 12 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0 1 21 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0 1 12 16.5a17.92 17.92 0 0 1-8.716-2.247m0 0A9.015 9.015 0 0 1 3 12c0-1.605.42-3.113 1.157-4.418" />
    </svg>
  );
}

function EnvelopeIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75" />
    </svg>
  );
}

function MapPinIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z" />
    </svg>
  );
}

export function RepCard({ rep }: { rep: RepresentativeCard }) {
  const [imgError, setImgError] = useState(false);
  const [showContact, setShowContact] = useState(false);

  const hasContactInfo = rep.phone || rep.website || rep.contactForm || rep.address || rep.email || rep.social?.twitter;

  return (
    <div className="bg-white rounded-lg border border-border overflow-hidden">
      <div className="p-4 flex gap-4">
        {/* Photo */}
        <div className="shrink-0">
          {rep.photoUrl && !imgError ? (
            <img
              src={rep.photoUrl}
              alt={`Photo of ${rep.name}`}
              className="w-20 h-24 object-cover rounded bg-surface"
              onError={() => setImgError(true)}
              referrerPolicy="no-referrer"
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

          <p className="text-sm text-muted mb-2">
            {rep.title}
            {rep.district ? ` — ${rep.district}` : ""}
          </p>

          {/* Badges */}
          <div className="flex flex-wrap gap-2 mb-2">
            {rep.upForElection2026 && <ElectionBadge />}
            {rep.pacMoney && rep.pacMoney.length > 0 && rep.totalPacMoney && (
              <PacBadge
                contributions={rep.pacMoney}
                totalAmount={rep.totalPacMoney}
              />
            )}
          </div>

          {/* Contact toggle */}
          {hasContactInfo && (
            <button
              onClick={() => setShowContact(!showContact)}
              className="inline-flex items-center gap-1.5 text-xs font-medium text-saffron-dark hover:text-saffron transition-colors cursor-pointer"
              aria-expanded={showContact}
            >
              <svg
                className={`w-3.5 h-3.5 transition-transform ${showContact ? "rotate-90" : ""}`}
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2}
                stroke="currentColor"
                aria-hidden="true"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
              </svg>
              {showContact ? "Hide contact info" : "View contact info"}
            </button>
          )}
        </div>
      </div>

      {/* Contact details panel */}
      {showContact && hasContactInfo && (
        <div className="border-t border-border bg-offwhite px-4 py-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {rep.phone && (
              <a
                href={`tel:${rep.phone}`}
                className="flex items-center gap-2 text-sm text-dark hover:text-nearblack transition-colors"
              >
                <PhoneIcon className="w-4 h-4 text-muted shrink-0" />
                {rep.phone}
              </a>
            )}

            {rep.email && (
              <a
                href={`mailto:${rep.email}`}
                className="flex items-center gap-2 text-sm text-dark hover:text-nearblack transition-colors"
              >
                <EnvelopeIcon className="w-4 h-4 text-muted shrink-0" />
                {rep.email}
              </a>
            )}

            {rep.website && (
              <a
                href={rep.website}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-sm text-dark hover:text-nearblack transition-colors"
              >
                <GlobeIcon className="w-4 h-4 text-muted shrink-0" />
                Website
              </a>
            )}

            {rep.contactForm && (
              <a
                href={rep.contactForm}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-sm text-dark hover:text-nearblack transition-colors"
              >
                <EnvelopeIcon className="w-4 h-4 text-muted shrink-0" />
                Contact Form
              </a>
            )}

            {rep.social?.twitter && (
              <a
                href={`https://twitter.com/${rep.social.twitter}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-sm text-dark hover:text-nearblack transition-colors"
              >
                <svg className="w-4 h-4 text-muted shrink-0" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
                @{rep.social.twitter}
              </a>
            )}

            {rep.social?.facebook && (
              <a
                href={`https://facebook.com/${rep.social.facebook}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-sm text-dark hover:text-nearblack transition-colors"
              >
                <svg className="w-4 h-4 text-muted shrink-0" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" />
                </svg>
                Facebook
              </a>
            )}
          </div>

          {rep.address && (
            <div className="flex items-start gap-2 text-sm text-muted mt-2.5 pt-2.5 border-t border-border">
              <MapPinIcon className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{rep.address}</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
