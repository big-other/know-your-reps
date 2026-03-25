"use client";

import Link from "next/link";

export function Header() {
  return (
    <header className="border-b border-stone/60 bg-paper/90 backdrop-blur-md sticky top-0 z-50">
      <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="w-8 h-8 bg-dark-warm rounded-sm flex items-center justify-center group-hover:bg-navy transition-colors duration-200">
            <span className="text-paper font-bold text-sm font-[family-name:var(--font-body)]">HF</span>
          </div>
          <span className="font-display text-dark-warm text-xl">
            Humans First
          </span>
        </Link>
        <nav className="flex items-center gap-6 text-sm">
          <Link
            href="/"
            className="text-muted hover:text-dark-warm transition-colors duration-200"
          >
            Lookup
          </Link>
          <Link
            href="/about"
            className="text-muted hover:text-dark-warm transition-colors duration-200"
          >
            About
          </Link>
          <a
            href="https://humansfirst.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-muted hover:text-dark-warm transition-colors duration-200"
          >
            humansfirst.com
          </a>
        </nav>
      </div>
    </header>
  );
}
