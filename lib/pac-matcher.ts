import { PacContribution } from "./types";
import pacRecipientsData from "@/data/pac-recipients-cache.json";

interface PacRecipientsCache {
  last_updated: string | null;
  recipients: Record<
    string,
    {
      contributions: {
        pac_name: string;
        parent_company: string;
        amount: number;
        fec_id: string;
      }[];
      total_amount: number;
    }
  >;
}

const pacCache = pacRecipientsData as PacRecipientsCache;

function normalizeForLookup(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z\s]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

export function checkPacMoney(
  candidateName: string,
  state?: string
): { contributions: PacContribution[]; totalAmount: number } | null {
  const recipients = pacCache.recipients;
  if (!recipients || Object.keys(recipients).length === 0) {
    return null;
  }

  const normalizedName = normalizeForLookup(candidateName);

  // Try exact key match first
  for (const [key, value] of Object.entries(recipients)) {
    const normalizedKey = normalizeForLookup(key);
    if (normalizedKey === normalizedName) {
      return {
        contributions: value.contributions,
        totalAmount: value.total_amount,
      };
    }

    // Try last name match with state
    const lastName = normalizedName.split(" ").pop() || "";
    const keyLastName = normalizedKey.split(" ").pop() || "";
    if (lastName && keyLastName === lastName && state) {
      const keyState = key.match(/\(([A-Z]{2})\)/)?.[1];
      if (keyState && keyState === state.toUpperCase()) {
        return {
          contributions: value.contributions,
          totalAmount: value.total_amount,
        };
      }
    }
  }

  return null;
}
