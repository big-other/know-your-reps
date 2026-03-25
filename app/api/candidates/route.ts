import { NextRequest, NextResponse } from "next/server";
import { searchCandidates } from "@/lib/fec";
import { getCached, setCache } from "@/lib/cache";
import { parseFecName } from "@/lib/name-matcher";
import { checkPacMoney } from "@/lib/pac-matcher";
import type { CandidateInfo } from "@/lib/types";

export async function GET(request: NextRequest) {
  const state = request.nextUrl.searchParams.get("state");
  const office = request.nextUrl.searchParams.get("office") as "H" | "S" | null;
  const district = request.nextUrl.searchParams.get("district");

  if (!state || !office) {
    return NextResponse.json(
      { error: "state and office parameters are required" },
      { status: 400 }
    );
  }

  const cacheKey = `fec:${office}:${state}:${district || ""}`;
  const cached = getCached<CandidateInfo[]>(cacheKey);
  if (cached) {
    return NextResponse.json({ candidates: cached });
  }

  try {
    const fecResults = await searchCandidates(
      state,
      office,
      district || undefined
    );

    const candidates: CandidateInfo[] = fecResults.map((c) => {
      const { firstName, lastName } = parseFecName(c.name);
      const pacResult = checkPacMoney(`${firstName} ${lastName}`, state);
      return {
        name: `${firstName} ${lastName}`,
        party: c.party_full || c.party,
        incumbentChallenge: c.incumbent_challenge_full,
        fecId: c.candidate_id,
        pacMoney: pacResult?.contributions,
        totalPacMoney: pacResult?.totalAmount,
      };
    });

    setCache(cacheKey, candidates, "fec");
    return NextResponse.json({ candidates });
  } catch {
    return NextResponse.json(
      { error: "Failed to fetch candidates" },
      { status: 500 }
    );
  }
}
