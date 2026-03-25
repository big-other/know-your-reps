export default function AboutPage() {
  return (
    <div className="max-w-2xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold text-nearblack mb-6">
        About This Tool
      </h1>

      <div className="prose prose-neutral max-w-none space-y-6 text-dark leading-relaxed">
        <section>
          <h2 className="text-xl font-semibold text-nearblack mb-3">
            What is &ldquo;Know Your Reps&rdquo;?
          </h2>
          <p className="text-sm">
            Know Your Reps is a free, nonpartisan civic tool built by{" "}
            <a
              href="https://humansfirst.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-saffron-dark underline hover:no-underline"
            >
              Humans First
            </a>
            . It helps you quickly find your elected officials at the federal and
            state level, see which seats are up for election in 2026, and — most
            importantly — track which candidates and incumbents have received
            contributions from AI industry political action committees (PACs).
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-nearblack mb-3">
            Why Track AI PAC Money?
          </h2>
          <p className="text-sm">
            The AI industry is spending unprecedented amounts to influence
            legislation and regulation. Major technology companies including
            Alphabet/Google, Microsoft, Amazon, Meta, Apple, NVIDIA, and others
            operate political action committees that contribute directly to
            candidates for Congress and state legislatures. Understanding these
            financial ties is essential for voters who want to know how AI policy
            decisions might be influenced.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-nearblack mb-3">
            Our Data Sources
          </h2>
          <ul className="text-sm space-y-2 list-disc list-inside">
            <li>
              <strong>Representative Data:</strong> Powered by{" "}
              <a
                href="https://geocod.io"
                target="_blank"
                rel="noopener noreferrer"
                className="text-saffron-dark underline hover:no-underline"
              >
                Geocod.io
              </a>
              , which provides accurate district-level legislator information
              based on your address.
            </li>
            <li>
              <strong>Campaign Finance:</strong> All candidate and PAC
              contribution data comes directly from the{" "}
              <a
                href="https://www.fec.gov"
                target="_blank"
                rel="noopener noreferrer"
                className="text-saffron-dark underline hover:no-underline"
              >
                Federal Election Commission (FEC)
              </a>
              , the official source for federal campaign finance information.
            </li>
            <li>
              <strong>AI PAC Identification:</strong> Our list of AI industry
              PACs is maintained by the Humans First research team based on
              public FEC filings and corporate disclosures. See the full list at{" "}
              <a
                href="https://www.humansfirst.com/ai-spending"
                target="_blank"
                rel="noopener noreferrer"
                className="text-saffron-dark underline hover:no-underline"
              >
                humansfirst.com/ai-spending
              </a>
              .
            </li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-nearblack mb-3">
            Methodology
          </h2>
          <p className="text-sm">
            We track direct PAC-to-candidate contributions (FEC Schedule B
            disbursements) from identified AI industry PACs. Our PAC recipient
            data is updated daily from FEC records. Candidate matching between
            data sources uses a combination of name normalization, state, and
            party affiliation.
          </p>
          <p className="text-sm mt-2">
            This tool is nonpartisan. We do not endorse or oppose any candidate
            or party. We present factual data about campaign contributions to
            help voters make informed decisions.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-nearblack mb-3">
            Privacy
          </h2>
          <p className="text-sm">
            We do not store your address or zip code. Lookup queries are cached
            temporarily for performance but contain no personally identifiable
            information. We do not track individual user lookups or use analytics
            on search behavior.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-nearblack mb-3">
            About Humans First
          </h2>
          <p className="text-sm">
            Humans First is a nonpartisan movement focused on AI accountability.
            We believe that as artificial intelligence reshapes our economy,
            workplaces, and public institutions, citizens deserve transparency
            about how AI companies influence democratic processes. Learn more at{" "}
            <a
              href="https://humansfirst.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-saffron-dark underline hover:no-underline"
            >
              humansfirst.com
            </a>
            .
          </p>
        </section>
      </div>
    </div>
  );
}
