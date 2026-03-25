import { NextRequest, NextResponse } from "next/server";
import { geocodeLookup, getStateFromResult } from "@/lib/geocodio";
import { searchCandidates } from "@/lib/fec";
import { checkPacMoney } from "@/lib/pac-matcher";
import { getCached, setCache, normalizeZip } from "@/lib/cache";
import { parseFecName } from "@/lib/name-matcher";
import senateClass2 from "@/data/senate-class-2.json";
import type {
  LookupResponse,
  RepresentativeCard,
  Race,
  CandidateInfo,
  Legislator,
  PacContribution,
} from "@/lib/types";

function legislatorToCard(
  leg: Legislator,
  state: string,
  districtInfo: string,
  level: "federal" | "state",
  chamber: string
): RepresentativeCard {
  const name = `${leg.bio.first_name} ${leg.bio.last_name}`;
  const pacResult = checkPacMoney(name, state);

  let title = "";
  if (level === "state" && chamber === "upper") title = "State Senator";
  else if (level === "state" && chamber === "lower") title = "State Representative";
  else if (leg.type === "senator") title = "U.S. Senator";
  else if (leg.type === "representative") title = "U.S. Representative";

  // Determine if up for election in 2026
  let upForElection = false;
  if (leg.type === "representative") {
    // All House seats are up every 2 years
    upForElection = true;
  } else if (leg.type === "senator") {
    // Only Class II senators are up in 2026
    const class2States = senateClass2.class_2_states;
    upForElection = class2States.includes(state.toUpperCase());
  } else if (level === "state") {
    // Most state lower chambers are up every 2 years
    if (chamber === "lower") upForElection = true;
    // State senate varies — mark as potentially up
    if (chamber === "upper") upForElection = true;
  }

  const photoUrl = leg.type === "representative" || leg.type === "senator"
    ? `https://theunitedstates.io/images/congress/225x275/${leg.references?.bioguide_id}.jpg`
    : undefined;

  return {
    name,
    firstName: leg.bio.first_name,
    lastName: leg.bio.last_name,
    party: leg.bio.party,
    title,
    level,
    chamber,
    district: districtInfo,
    state,
    photoUrl: leg.references?.bioguide_id ? photoUrl : undefined,
    phone: leg.contact.phone || undefined,
    website: leg.contact.url || undefined,
    contactForm: leg.contact.contact_form || undefined,
    social: leg.social
      ? { twitter: leg.social.twitter, facebook: leg.social.facebook }
      : undefined,
    upForElection2026: upForElection,
    pacMoney: pacResult?.contributions,
    totalPacMoney: pacResult?.totalAmount,
  };
}

export async function GET(request: NextRequest) {
  const query = request.nextUrl.searchParams.get("q");

  if (!query || query.trim().length === 0) {
    return NextResponse.json(
      { error: "Please provide a zip code or address" },
      { status: 400 }
    );
  }

  const cacheKey = `lookup:${normalizeZip(query)}`;
  const cached = getCached<LookupResponse>(cacheKey);
  if (cached) {
    return NextResponse.json(cached);
  }

  try {
    // 1. Geocodio lookup
    const { results, multipleDistricts } = await geocodeLookup(query);
    const result = results[0];
    const state = getStateFromResult(result);
    const cd = result.fields.congressional_districts[0];
    const stateLeg = result.fields.state_legislative_districts;

    // 2. Build representative cards
    const representatives: RepresentativeCard[] = [];

    // Federal legislators from congressional district
    if (cd?.current_legislators) {
      for (const leg of cd.current_legislators) {
        const districtInfo =
          leg.type === "representative"
            ? `${state}-${cd.district_number}`
            : state;
        representatives.push(
          legislatorToCard(leg, state, districtInfo, "federal", leg.type === "senator" ? "upper" : "lower")
        );
      }
    }

    // State legislators — Geocodio returns arrays or single objects
    const senateDistricts = stateLeg?.senate
      ? Array.isArray(stateLeg.senate) ? stateLeg.senate : [stateLeg.senate]
      : [];
    const houseDistricts = stateLeg?.house
      ? Array.isArray(stateLeg.house) ? stateLeg.house : [stateLeg.house]
      : [];

    for (const dist of senateDistricts) {
      if (dist?.current_legislators) {
        for (const leg of dist.current_legislators) {
          representatives.push(
            legislatorToCard(
              { ...leg, type: "senator" as const },
              state,
              `State Senate District ${dist.district_number}`,
              "state",
              "upper"
            )
          );
        }
      }
    }
    for (const dist of houseDistricts) {
      if (dist?.current_legislators) {
        for (const leg of dist.current_legislators) {
          representatives.push(
            legislatorToCard(
              { ...leg, type: "representative" as const },
              state,
              `State House District ${dist.district_number}`,
              "state",
              "lower"
            )
          );
        }
      }
    }

    // 3. Fetch 2026 candidates from FEC
    const races: Race[] = [];

    // House race
    const houseCacheKey = `fec:H:${state}:${cd.district_number}`;
    let houseCandidates = getCached<CandidateInfo[]>(houseCacheKey);
    if (!houseCandidates) {
      try {
        const fecHouse = await searchCandidates(state, "H", cd.district_number.toString());
        houseCandidates = fecHouse.map((c) => {
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
        setCache(houseCacheKey, houseCandidates, "fec");
      } catch {
        houseCandidates = [];
      }
    }

    races.push({
      name: `U.S. House — ${state}-${cd.district_number}`,
      level: "federal",
      chamber: "lower",
      state,
      district: cd.district_number.toString(),
      candidates: houseCandidates,
    });

    // Senate race (only if Class II state)
    const class2States = senateClass2.class_2_states;
    if (class2States.includes(state.toUpperCase())) {
      const senateCacheKey = `fec:S:${state}`;
      let senateCandidates = getCached<CandidateInfo[]>(senateCacheKey);
      if (!senateCandidates) {
        try {
          const fecSenate = await searchCandidates(state, "S");
          senateCandidates = fecSenate.map((c) => {
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
          setCache(senateCacheKey, senateCandidates, "fec");
        } catch {
          senateCandidates = [];
        }
      }

      races.push({
        name: `U.S. Senate — ${state}`,
        level: "federal",
        chamber: "upper",
        state,
        candidates: senateCandidates,
      });
    }

    // 4. AI spending summary
    let totalAmount = 0;
    const pacTotals: Record<string, number> = {};

    for (const rep of representatives) {
      if (rep.pacMoney) {
        for (const p of rep.pacMoney) {
          totalAmount += p.amount;
          pacTotals[p.parent_company] = (pacTotals[p.parent_company] || 0) + p.amount;
        }
      }
    }
    for (const race of races) {
      for (const c of race.candidates) {
        if (c.pacMoney) {
          for (const p of c.pacMoney) {
            totalAmount += p.amount;
            pacTotals[p.parent_company] = (pacTotals[p.parent_company] || 0) + p.amount;
          }
        }
      }
    }

    const response: LookupResponse = {
      representatives,
      races,
      aiSpendingSummary: {
        totalAmount,
        pacs: Object.entries(pacTotals).map(([name, amount]) => ({ name, amount })),
      },
      multipleDistricts,
      state,
    };

    setCache(cacheKey, response, "geocodio");
    return NextResponse.json(response);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unknown error";

    if (message === "ADDRESS_NOT_FOUND" || message === "NO_DISTRICTS_FOUND") {
      return NextResponse.json(
        {
          error:
            "We couldn't find that address. Please try a full street address for best results.",
        },
        { status: 404 }
      );
    }

    if (message === "RATE_LIMITED" || message === "FEC_RATE_LIMITED") {
      return NextResponse.json(
        {
          error:
            "We're experiencing high traffic. Please try again in a moment.",
        },
        { status: 429 }
      );
    }

    if (message === "GEOCODIO_AUTH_ERROR") {
      return NextResponse.json(
        { error: "Service configuration error. Please try again later." },
        { status: 500 }
      );
    }

    console.error("Lookup error:", message);
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}
