function normalizeName(name: string): string {
  return name
    .toLowerCase()
    .replace(/\b(jr|sr|ii|iii|iv|esq|ph\.?d)\.?\b/gi, "")
    .replace(/[^a-z\s]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function normalizeParty(party: string): string {
  const p = party.toLowerCase().trim();
  if (p.startsWith("dem") || p === "d") return "democrat";
  if (p.startsWith("rep") || p === "r") return "republican";
  if (p.startsWith("ind") || p === "i") return "independent";
  if (p.startsWith("lib") || p === "l") return "libertarian";
  if (p.startsWith("gre") || p === "g") return "green";
  return p;
}

export function candidatesMatch(
  a: { name: string; state: string; party: string },
  b: { name: string; state: string; party: string }
): boolean {
  if (a.state.toUpperCase() !== b.state.toUpperCase()) return false;

  const partyA = normalizeParty(a.party);
  const partyB = normalizeParty(b.party);
  if (partyA !== partyB) return false;

  const nameA = normalizeName(a.name);
  const nameB = normalizeName(b.name);

  // Direct match
  if (nameA === nameB) return true;

  // Check if last names match and first names start the same
  const partsA = nameA.split(" ");
  const partsB = nameB.split(" ");

  const lastA = partsA[partsA.length - 1];
  const lastB = partsB[partsB.length - 1];

  if (lastA !== lastB) return false;

  // FEC format is "LASTNAME, FIRSTNAME" — handle both orderings
  const firstA = partsA[0];
  const firstB = partsB[0];

  if (firstA && firstB) {
    if (firstA.startsWith(firstB) || firstB.startsWith(firstA)) return true;
  }

  return false;
}

export function parseFecName(fecName: string): { firstName: string; lastName: string } {
  // FEC names are typically "LASTNAME, FIRSTNAME MIDDLE"
  const parts = fecName.split(",").map((p) => p.trim());
  if (parts.length >= 2) {
    const firstName = parts[1].split(" ")[0];
    return { firstName, lastName: parts[0] };
  }
  // Fallback: assume "FIRST LAST"
  const words = fecName.split(" ");
  return {
    firstName: words[0] || "",
    lastName: words[words.length - 1] || "",
  };
}
