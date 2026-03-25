import { GeocodioResult } from "./types";

const GEOCODIO_BASE = "https://api.geocod.io/v1.7/geocode";

export async function geocodeLookup(query: string): Promise<{
  results: GeocodioResult[];
  multipleDistricts: boolean;
}> {
  const apiKey = process.env.GEOCODIO_API_KEY;
  if (!apiKey || apiKey === "your_geocodio_key_here") {
    throw new Error("GEOCODIO_API_KEY is not configured");
  }

  const url = new URL(GEOCODIO_BASE);
  url.searchParams.set("q", query);
  url.searchParams.set("fields", "cd,stateleg");
  url.searchParams.set("api_key", apiKey);

  const response = await fetch(url.toString());

  if (!response.ok) {
    const body = await response.text().catch(() => "");
    console.error(`Geocod.io error: status=${response.status} body=${body}`);
    if (response.status === 422) {
      throw new Error("ADDRESS_NOT_FOUND");
    }
    if (response.status === 403) {
      throw new Error("GEOCODIO_AUTH_ERROR");
    }
    if (response.status === 429) {
      throw new Error("RATE_LIMITED");
    }
    throw new Error(`Geocod.io API error: ${response.status}`);
  }

  const data = await response.json();

  if (!data.results || data.results.length === 0) {
    throw new Error("ADDRESS_NOT_FOUND");
  }

  const result = data.results[0];
  const fields = result.fields;

  if (!fields?.congressional_districts || fields.congressional_districts.length === 0) {
    throw new Error("NO_DISTRICTS_FOUND");
  }

  const multipleDistricts = fields.congressional_districts.length > 1;

  return {
    results: [result as GeocodioResult],
    multipleDistricts,
  };
}

export function getStateFromResult(result: GeocodioResult): string {
  return result.address_components?.state || "";
}
