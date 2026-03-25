"use client";

import Link from "next/link";

export function Header() {
  return (
    <header className="border-b border-border bg-white/80 backdrop-blur-sm sticky top-0 z-50">
      <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-8 h-8 bg-saffron rounded-sm flex items-center justify-center">
            <span className="text-white font-bold text-sm">HF</span>
          </div>
          <span className="font-semibold text-nearblack text-lg">
            Humans First
          </span>
        </Link>
        <nav className="flex items-center gap-6 text-sm">
          <Link
            href="/"
            className="text-muted hover:text-nearblack transition-colors"
          >
            Lookup
          </Link>
          <Link
            href="/about"
            className="text-muted hover:text-nearblack transition-colors"
          >
            About
          </Link>
          <a
            href="https://humansfirst.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-muted hover:text-nearblack transition-colors"
          >
            humansfirst.com
          </a>
        </nav>
      </div>
    </header>
  );
}
