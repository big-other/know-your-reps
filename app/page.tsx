import { SearchBar } from "@/components/SearchBar";

export default function Home() {
  return (
    <div className="max-w-3xl mx-auto px-4 pt-20 pb-16">
      <div className="text-center mb-10">
        <h1 className="text-4xl md:text-5xl font-bold text-nearblack mb-4 tracking-tight">
          Who Represents You?
        </h1>
        <p className="text-lg text-muted max-w-xl mx-auto leading-relaxed">
          Look up your elected officials. See who&apos;s up for election in
          2026. Find out who&apos;s taking money from AI corporations.
        </p>
      </div>

      <SearchBar />

      <div className="mt-16 max-w-lg mx-auto text-center">
        <p className="text-sm text-muted leading-relaxed">
          <strong className="text-nearblack">Humans First</strong> is a
          nonpartisan movement focused on AI accountability. We track how AI
          companies spend money to influence elections and policy — so you can
          make informed decisions at the ballot box.
        </p>
        <a
          href="https://humansfirst.org"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-block mt-4 text-sm text-saffron-dark hover:text-saffron font-medium transition-colors"
        >
          Learn more at humansfirst.org
        </a>
      </div>
    </div>
  );
}
