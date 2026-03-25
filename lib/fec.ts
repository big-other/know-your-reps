import { FECCandidate } from "./types";

const FEC_BASE = "https://api.open.fec.gov/v1";

function getApiKey(): string {
  return process.env.FEC_API_KEY || "DEMO_KEY";
}

export async function searchCandidates(
  state: string,
  office: "H" | "S",
  district?: string
): Promise<FECCandidate[]> {
  const url = new URL(`${FEC_BASE}/candidates/search/`);
  url.searchParams.set("state", state);
  url.searchParams.set("election_year", "2026");
  url.searchParams.set("office", office);
  url.searchParams.set("sort", "name");
  url.searchParams.set("per_page", "100");
  url.searchParams.set("api_key", getApiKey());

  if (office === "H" && district) {
    url.searchParams.set("district", district);
  }

  const response = await fetch(url.toString());

  if (!response.ok) {
    if (response.status === 429) {
      throw new Error("FEC_RATE_LIMITED");
    }
    console.error(`FEC API error: ${response.status}`);
    return [];
  }

  const data = await response.json();
  return (data.results || []) as FECCandidate[];
}

export async function getPacDisbursements(
  committeeId: string,
  cycle: number = 2026
): Promise<
  {
    recipient_name: string;
    recipient_id?: string;
    amount: number;
    disbursement_description?: string;
  }[]
> {
  const url = new URL(`${FEC_BASE}/schedules/schedule_b/`);
  url.searchParams.set("committee_id", committeeId);
  url.searchParams.set("two_year_transaction_period", cycle.toString());
  url.searchParams.set("per_page", "100");
  url.searchParams.set("api_key", getApiKey());

  const allResults: {
    recipient_name: string;
    recipient_id?: string;
    amount: number;
    disbursement_description?: string;
  }[] = [];

  let pageUrl: string | null = url.toString();

  // Paginate through results (max 5 pages to avoid excessive API calls)
  let pages = 0;
  while (pageUrl && pages < 5) {
    const res: Response = await fetch(pageUrl);
    if (!res.ok) {
      console.error(`FEC disbursements error: ${res.status}`);
      break;
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const data: any = await res.json();
    const results = data.results || [];

    for (const r of results) {
      allResults.push({
        recipient_name: r.recipient_name || "",
        recipient_id: r.recipient_committee_id || undefined,
        amount: r.disbursement_amount || 0,
        disbursement_description: r.disbursement_description || "",
      });
    }

    if (data.pagination?.pages && data.pagination.page < data.pagination.pages) {
      const nextUrl = new URL(url.toString());
      nextUrl.searchParams.set("last_index", data.pagination.last_indexes?.last_index || "");
      nextUrl.searchParams.set("last_disbursement_date", data.pagination.last_indexes?.last_disbursement_date || "");
      pageUrl = nextUrl.toString();
    } else {
      pageUrl = null;
    }

    pages++;
  }

  return allResults;
}
