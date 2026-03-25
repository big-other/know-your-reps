export function Footer() {
  return (
    <footer className="border-t border-border bg-white/50 mt-12">
      <div className="max-w-5xl mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <div className="w-6 h-6 bg-saffron rounded-sm flex items-center justify-center">
                <span className="text-white font-bold text-xs">HF</span>
              </div>
              <span className="font-semibold text-nearblack">
                Humans First
              </span>
            </div>
            <p className="text-muted text-sm max-w-md">
              A nonpartisan movement focused on AI accountability. We believe in
              transparency about how AI companies influence our democracy.
            </p>
          </div>
          <div className="flex gap-8 text-sm">
            <div>
              <h4 className="font-medium text-nearblack mb-2">Links</h4>
              <ul className="space-y-1 text-muted">
                <li>
                  <a
                    href="https://humansfirst.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-nearblack transition-colors"
                  >
                    humansfirst.com
                  </a>
                </li>
                <li>
                  <a
                    href="https://www.humansfirst.com/ai-spending"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-nearblack transition-colors"
                  >
                    AI Spending Data
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </div>
        <div className="mt-8 pt-4 border-t border-border text-xs text-muted">
          <p>
            Representative data from Geocod.io. Campaign finance data from the
            Federal Election Commission. AI PAC tracking by Humans First.
          </p>
        </div>
      </div>
    </footer>
  );
}
