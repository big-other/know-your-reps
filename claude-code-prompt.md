# Claude Code Prompt: Build the Humans First "Know Your Reps" Web App

## Overview

Build a Next.js web app (deployable to Vercel) that lets users enter their zip code or street address and instantly see:

1. **Their current elected officials** (federal, state) with photos, party, contact info
2. **Which of those seats are up for election in 2026**
3. **All major candidates running** in those 2026 races
4. **Which candidates/incumbents have taken money from AI industry PACs** (flagged with a badge)

The app should be branded for **Humans First** (humansfirst.org) — a nonpartisan movement focused on AI accountability.

---

## Tech Stack

- **Framework:** Next.js 14+ (App Router)
- **Styling:** Tailwind CSS
- **Database:** SQLite via better-sqlite3 (for local dev) OR Vercel KV/Postgres for production — start with a JSON file data store for MVP simplicity
- **Deployment target:** Vercel
- **Language:** TypeScript

---

## Data Sources & API Integrations

### 1. Geocod.io — Address/Zip → Representatives + Districts
**This is the primary data source for the "who represents me" lookup.**

- API docs: https://www.geocod.io/docs/
- Free tier: 2,500 lookups/day (no credit card required)
- Endpoint: `GET https://api.geocod.io/v1.11/geocode?q={address_or_zip}&fields=cd,stateleg&api_key={KEY}`
- The `fields=cd,stateleg` parameter returns:
  - Congressional district number + current Congress info
  - **Current legislators** (Representative + 2 Senators) with: name, party, phone, URL, contact form, social media, photo URL
  - State legislative districts (upper + lower) with current state legislators and contact info
- For zip codes: returns multiple possible districts ranked by `proportion` — use the highest-ranked result
- **Environment variable:** `GEOCODIO_API_KEY`

### 2. FEC API — Campaign Finance / Candidates / PAC Money
**Free, no API key required (but one is recommended for higher rate limits).**

- API docs: https://api.open.fec.gov/developers/
- Base URL: `https://api.open.fec.gov/v2/`
- Key endpoints:
  - `GET /candidates/search/?state={ST}&election_year=2026&office={H|S}&api_key={KEY}` — Find all 2026 candidates by state/district
  - `GET /schedules/schedule_b/?committee_id={PAC_ID}&api_key={KEY}` — Get PAC disbursements (money given to candidates)
  - `GET /committee/{committee_id}/disbursements/?api_key={KEY}` — Specific committee spending
- To find AI PAC money: query disbursements from known AI industry PAC committee IDs (see section below)
- **Environment variable:** `FEC_API_KEY` (get free key at https://api.open.fec.gov/developers/)

### 3. Static Data: AI Industry PAC List
Create a JSON config file `data/ai-pacs.json` that maps known AI industry PACs to their FEC committee IDs. This is the data that would come from humansfirst.com/ai-spending. Start with these known entities and their PACs:

```json
{
  "pacs": [
    {
      "name": "Google NetPAC (Alphabet)",
      "fec_id": "C00428623",
      "parent_company": "Alphabet/Google"
    },
    {
      "name": "Microsoft Corporation PAC (MSPAC)",
      "fec_id": "C00227546",
      "parent_company": "Microsoft"
    },
    {
      "name": "Amazon.com Inc PAC",
      "fec_id": "C00360354",
      "parent_company": "Amazon"
    },
    {
      "name": "Meta Platforms Inc PAC",
      "fec_id": "C00502906",
      "parent_company": "Meta"
    },
    {
      "name": "Apple Inc. PAC (APPLEPAC)",
      "fec_id": "C00435099",
      "parent_company": "Apple"
    },
    {
      "name": "OpenAI Inc PAC",
      "fec_id": null,
      "parent_company": "OpenAI",
      "note": "Check FEC for new filings — OpenAI may register a PAC for 2026 cycle"
    },
    {
      "name": "NVIDIA Corporation PAC",
      "fec_id": "C00476036",
      "parent_company": "NVIDIA"
    },
    {
      "name": "Palantir Technologies PAC",
      "fec_id": "C00770941",
      "parent_company": "Palantir"
    },
    {
      "name": "Oracle Corporation PAC",
      "fec_id": "C00300707",
      "parent_company": "Oracle"
    },
    {
      "name": "Salesforce.com PAC",
      "fec_id": "C00508507",
      "parent_company": "Salesforce"
    },
    {
      "name": "IBM Corporation PAC",
      "fec_id": "C00104299",
      "parent_company": "IBM"
    }
  ],
  "last_updated": "2026-03-24",
  "source_url": "https://www.humansfirst.com/ai-spending"
}
```

**Important:** This list should be easy to update. The app admin should be able to add new PAC IDs without redeploying — consider loading this from a Vercel Edge Config, environment variable, or a simple admin endpoint protected by a secret key.

### 4. Static Data: 2026 Election Calendar
Create `data/election-calendar-2026.json`:
- All 435 House seats are up in 2026
- ~33-34 Senate seats are up (Class II senators)
- Governor races in several states
- All state legislative seats vary by state

For the Senate specifically, hardcode the Class II senator list (seats up in 2026). For state legislatures, most states have all lower chamber seats up every 2 years. The Geocod.io response includes the current legislators — cross-reference with the election calendar to determine which are up.

Create a `data/senate-class-2.json` file listing the states with Senate seats up in 2026:
```json
{
  "class_2_states": ["AL","AK","AR","CO","DE","GA","ID","IL","IA","KS","KY","LA","ME","MA","MI","MN","MS","MT","NE","NH","NJ","NM","NC","OK","OR","RI","SC","SD","TN","TX","VA","WV","WY"]
}
```

---

## App Architecture

### Pages / Routes

```
/                     → Landing page with zip/address search
/lookup?q={zip}       → Results page showing reps, elections, candidates
/about                → About Humans First + methodology
/api/lookup           → API route: Geocod.io lookup + data assembly  
/api/candidates       → API route: FEC candidate search
/api/pac-check        → API route: Check if candidate received AI PAC money
/api/refresh-cache    → API route (protected): Trigger cache refresh
```

### Data Flow for a Lookup

1. User enters zip code or address on landing page
2. Frontend calls `/api/lookup?q={user_input}`
3. API route:
   a. Calls Geocod.io with `fields=cd,stateleg` to get districts + current legislators
   b. From the response, extracts: congressional district, state, legislators
   c. Calls FEC API `/candidates/search/` with state + district + `election_year=2026` to get candidates
   d. For each candidate/incumbent, checks a cached mapping of "AI PAC recipients" (built from FEC disbursement data)
   e. Returns assembled JSON to frontend
4. Frontend renders results in organized sections

### Caching Strategy

**Critical for staying within free API tiers and for performance:**

- **Geocod.io results:** Cache in a simple in-memory LRU cache or Vercel KV, keyed by normalized zip code. TTL: 24 hours. This prevents repeat lookups from burning API quota.
- **FEC candidate data:** Cache by state+district+cycle. TTL: 12 hours. Candidate filings don't change minute-to-minute.
- **AI PAC disbursement data:** Build a lookup table via a scheduled job (Vercel Cron) that runs daily. Queries FEC for disbursements from each AI PAC committee ID, builds a `Set<candidate_id>` of recipients, stores in a JSON file or KV store.

### Cron Job: Daily PAC Data Refresh

Create a Vercel Cron job at `/api/cron/refresh-pac-data` that:
1. Iterates through all committee IDs in `ai-pacs.json`
2. For each, calls FEC API: `GET /schedules/schedule_b/?committee_id={id}&two_year_transaction_period=2026&per_page=100`
3. Extracts recipient candidate names and IDs
4. Builds a mapping: `{ candidate_fec_id: [list of PACs that gave them money, with amounts] }`
5. Stores this as `data/pac-recipients-cache.json` or in Vercel KV

Add to `vercel.json`:
```json
{
  "crons": [
    {
      "path": "/api/cron/refresh-pac-data",
      "schedule": "0 6 * * *"
    }
  ]
}
```

---

## UI Design

### Brand Guidelines
- **Primary color:** Saffron `#D4A020` (campaign accent)
- **Background:** Off-white `#F5F2EB`
- **Text:** Near-black `#1A1A1A`
- **Secondary neutrals:** `#2C2C2C`, `#6B6B6B`, `#D4D0C8`, `#E8E4DC`
- **Alert/danger red** for AI PAC money flags: `#C23B22`
- **Font:** Use system fonts or Inter from Google Fonts
- **Tone:** Serious, editorial, nonpartisan. NOT flashy tech startup. Think investigative journalism meets civic tool.

### Landing Page (`/`)
- Large headline: **"Who Represents You?"**  
- Subline: "Look up your elected officials. See who's up for election in 2026. Find out who's taking money from AI corporations."
- Prominent search input: "Enter your zip code or full address"
- Search button with saffron accent
- Below: Brief explainer text about Humans First (2-3 sentences)
- Footer with link to humansfirst.org

### Results Page (`/lookup?q=...`)

Organized into clear sections:

#### Section 1: "Your Representatives"
Cards for each current official (federal first, then state):
- Photo (from Geocod.io response or fallback silhouette)
- Name, party, title (e.g., "U.S. Senator", "State Representative")
- District info
- Contact: phone, website, contact form link
- **Badge: "UP FOR ELECTION 2026"** (saffron background) if their seat is up
- **Badge: "TOOK AI PAC MONEY"** (red background) if they received AI industry PAC contributions, with hover/click to see amount and which PACs

#### Section 2: "2026 Elections in Your Area"
For each race that's happening in 2026 for this user's area:
- Race name (e.g., "U.S. Senate — Texas", "U.S. House — CA-12", "State House — District 42")
- List of declared candidates from FEC filings:
  - Name, party
  - **AI PAC money badge** if applicable
  - Link to FEC page
- Note: "Candidate list updates automatically from FEC filings"

#### Section 3: "AI Industry Spending in Your Races"
Summary box:
- Total AI PAC money flowing into races in the user's area
- Which PACs are spending (Alphabet, Microsoft, etc.)
- Link to humansfirst.com/ai-spending for full details

### Mobile Responsive
The app must work perfectly on mobile. Use Tailwind responsive classes. Cards should stack vertically on mobile.

---

## Key Implementation Details

### Geocod.io Response Handling

The Geocod.io response for `fields=cd,stateleg` returns data nested under `results[0].fields`. Example structure:

```
results[0].fields.congressional_districts[0] → {
  name: "Congressional District 12",
  district_number: 12,
  congress_number: 119,
  current_legislators: [
    {
      type: "representative",
      bio: { last_name, first_name, birthday, gender, party },
      contact: { url, address, phone, contact_form },
      social: { twitter, facebook, youtube },
      references: { bioguide_id, govtrack_id, opensecrets_id },
      source: "..."
    },
    { type: "senator", ... },
    { type: "senator", ... }
  ]
}

results[0].fields.state_legislative_districts → {
  house: { name, district_number, current_legislators: [...] },
  senate: { name, district_number, current_legislators: [...] }
}
```

### FEC API Candidate Search

To find 2026 candidates for a district:
```
GET https://api.open.fec.gov/v2/candidates/search/
  ?state=CA
  &district=12
  &election_year=2026
  &office=H
  &sort=name
  &api_key={KEY}
```

For Senate:
```
GET https://api.open.fec.gov/v2/candidates/search/
  ?state=CA
  &election_year=2026
  &office=S
  &api_key={KEY}
```

### FEC API PAC Disbursement Check

To check if a specific AI PAC gave to a candidate:
```
GET https://api.open.fec.gov/v2/schedules/schedule_b/
  ?committee_id=C00428623
  &two_year_transaction_period=2026
  &disbursement_purpose_category=TRANSFER_TO_CANDIDATE
  &per_page=100
  &api_key={KEY}
```

Note: The FEC categorizes disbursements in various ways. You may also need to check `schedule_e` (independent expenditures) for Super PAC spending. Start with `schedule_b` for direct PAC-to-candidate contributions.

### Matching Candidates Across APIs

This is the trickiest part. Geocod.io returns legislator names; FEC returns candidate names. They won't always match perfectly. Use this strategy:
1. **FEC ID matching:** Geocod.io returns `references.opensecrets_id` (CRP ID) for legislators. FEC has its own candidate IDs. Use name + state + party as a fuzzy match.
2. **Normalized name matching:** Strip suffixes (Jr., III), lowercase, compare `last_name, first_name` across sources.
3. **Bioguide ID:** Geocod.io returns `bioguide_id` which can be cross-referenced with the @unitedstates project's legislator data that includes FEC IDs.

For the MVP, fuzzy name + state + party matching is sufficient. Build a utility function:
```typescript
function candidatesMatch(a: {name: string, state: string, party: string}, b: {name: string, state: string, party: string}): boolean
```

### Error Handling
- If Geocod.io returns no results: Show "We couldn't find that address. Please try a full street address for best results."
- If zip code maps to multiple districts: Show the top result but note "Your zip code spans multiple districts. Enter your full address for a precise match."
- If FEC returns no candidates for a race: Show "No candidates have filed with the FEC yet for this race. Check back as filing deadlines approach."
- Rate limit errors: Show a friendly "We're experiencing high traffic. Please try again in a moment."

---

## File Structure

```
/app
  /page.tsx                    → Landing page
  /lookup/page.tsx             → Results page
  /about/page.tsx              → About page
  /api
    /lookup/route.ts           → Main lookup API
    /candidates/route.ts       → FEC candidate search
    /pac-check/route.ts        → PAC money check
    /cron
      /refresh-pac-data/route.ts → Daily PAC refresh cron
/components
  /SearchBar.tsx               → Zip/address input
  /RepCard.tsx                 → Representative card
  /CandidateList.tsx           → List of candidates for a race
  /PacBadge.tsx                → "Took AI PAC Money" badge
  /ElectionSection.tsx         → 2026 election races section  
  /Header.tsx                  → Site header with HF branding
  /Footer.tsx                  → Footer with links
/lib
  /geocodio.ts                 → Geocod.io API client
  /fec.ts                      → FEC API client  
  /pac-matcher.ts              → PAC money matching logic
  /cache.ts                    → Simple caching layer
  /name-matcher.ts             → Fuzzy name matching utility
/data
  /ai-pacs.json                → AI industry PAC list
  /senate-class-2.json         → Senate seats up in 2026
  /pac-recipients-cache.json   → Auto-generated PAC recipient cache
/public
  /humans-first-logo.svg       → Logo placeholder
```

---

## Environment Variables (.env.local)

```
GEOCODIO_API_KEY=your_geocodio_key_here
FEC_API_KEY=your_fec_api_key_here
CRON_SECRET=a_random_secret_for_protecting_cron_endpoint
```

---

## Vercel Config (vercel.json)

```json
{
  "crons": [
    {
      "path": "/api/cron/refresh-pac-data",
      "schedule": "0 6 * * *"
    }
  ]
}
```

---

## What to Build First (Priority Order)

1. **Landing page with search bar** — get the UI skeleton up
2. **Geocod.io integration** — `/api/lookup` returning real legislator data
3. **Results page rendering** — display the rep cards with real data
4. **FEC candidate search** — show 2026 candidates per race
5. **2026 election flagging** — badge which seats are up
6. **AI PAC money check** — cross-reference PAC disbursements
7. **Caching layer** — prevent API quota burnout
8. **Cron job** — daily PAC data refresh
9. **Polish** — mobile responsive, loading states, error states

---

## Important Notes

- **Nonpartisan presentation:** Do NOT color-code by party (no red/blue). Use neutral styling for all candidates. The only visual callout should be the AI PAC money badge.
- **Data attribution:** Include a small footer note: "Representative data from Geocod.io. Campaign finance data from the Federal Election Commission. AI PAC tracking by Humans First."
- **Privacy:** Do NOT store user addresses or zip codes server-side beyond the ephemeral cache. No analytics tracking of lookups.
- **Accessibility:** Ensure proper heading hierarchy, alt text on images, keyboard navigation.
- Do NOT use any deprecated Google Civic Representatives API — it was shut down in March 2025.
- Geocod.io free tier is 2,500 lookups/day. Each lookup with `cd,stateleg` fields counts as 3 lookups (1 geocode + 1 cd + 1 stateleg). So effective free limit is ~833 unique address lookups per day. Cache aggressively.
- The FEC API has a rate limit of 1,000 requests per hour. Cache candidate data.
