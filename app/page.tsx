import { SearchBar } from "@/components/SearchBar";

export default function Home() {
  return (
    <div className="max-w-3xl mx-auto px-4 pt-20 pb-16">
      <div className="text-center mb-10 animate-fade-in">
        <h1 className="text-5xl md:text-6xl text-dark-warm mb-5 leading-tight">
          Who Represents You?
        </h1>
        <p className="text-lg text-muted max-w-xl mx-auto leading-relaxed">
          Look up your elected officials. See who&apos;s up for election in
          2026. Find out who&apos;s taking money from AI corporations.
        </p>
      </div>

      <div className="animate-fade-in" style={{ animationDelay: "150ms" }}>
        <SearchBar />
      </div>

      <div className="mt-20 max-w-lg mx-auto text-center animate-fade-in" style={{ animationDelay: "300ms" }}>
        <div className="w-12 h-px bg-stone mx-auto mb-6" />
        <p className="text-sm text-muted leading-relaxed">
          <strong className="text-dark-warm font-semibold">Humans First</strong> is a
          nonpartisan movement focused on AI accountability. We track how AI
          companies spend money to influence elections and policy — so you can
          make informed decisions at the ballot box.
        </p>
        <a
          href="https://humansfirst.com"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-block mt-4 text-sm text-dark-mid hover:text-dark-warm font-medium transition-colors duration-200 underline underline-offset-2 decoration-stone hover:decoration-dark-warm"
        >
          Learn more at humansfirst.com
        </a>
      </div>
    </div>
  );
}
