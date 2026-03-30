import localData from "@/data/local-officials.json";
import { checkPacMoney, type PacLookup } from "./pac-matcher";
import type { RepresentativeCard } from "./types";

interface LocalOfficial {
  name: string;
  firstName: string;
  lastName: string;
  title: string;
  city: string;
  state: string;
  party: string;
  phone: string;
  email: string;
  website: string;
  address: string;
}

// Build lookup keyed by "STATE:city" (lowercase city for matching)
const lookup = new Map<string, LocalOfficial[]>();

for (const official of localData.officials as LocalOfficial[]) {
  const key = `${official.state}:${official.city.toLowerCase()}`;
  const existing = lookup.get(key);
  if (existing) {
    existing.push(official);
  } else {
    lookup.set(key, [official]);
  }
}

export function findLocalOfficials(
  city: string,
  state: string,
  pacLookup: PacLookup
): RepresentativeCard[] {
  const key = `${state.toUpperCase()}:${city.toLowerCase()}`;
  const officials = lookup.get(key);
  if (!officials) return [];

  return officials.map((o) => {
    const pacResult = checkPacMoney(pacLookup, o.name, state);
    return {
      name: o.name,
      firstName: o.firstName,
      lastName: o.lastName.replace(/,?\s*Jr\.?|,?\s*Sr\.?/gi, "").trim(),
      party: o.party || "Nonpartisan",
      title: o.title,
      level: "local" as const,
      chamber: "local",
      city: o.city,
      state: o.state,
      phone: o.phone || undefined,
      website: o.website || undefined,
      email: o.email || undefined,
      address: o.address || undefined,
      upForElection2026: false,
      pacMoney: pacResult?.contributions,
      totalPacMoney: pacResult?.totalAmount,
    };
  });
}
