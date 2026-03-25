# Know Your Reps

A nonpartisan civic tool by [Humans First](https://humansfirst.com) that helps voters find their elected officials, see who's up for election in 2026, and track AI industry PAC spending in their races.

**Live site:** https://know-your-reps.vercel.app

## Overview

Enter a zip code or street address to see:
- Your **federal and state representatives** with photos and contact info
- **2026 election races** in your area with full candidate lists from FEC filings
- **AI industry PAC spending** — which candidates are being supported or opposed by AI company money

Part of the Humans First **No Big AI Money Campaign**.

## Tech Stack

- **Framework:** Next.js 16 (App Router) with TypeScript
- **Styling:** Tailwind CSS v4
- **Fonts:** Instrument Serif (headlines), DM Sans (body/UI)
- **Hosting:** Vercel (auto-deploys from GitHub on push to `main`)
- **APIs:** Geocodio (representative lookup), FEC API (candidate search)
- **PAC Data:** Bundled from the [AI Political Spending Tracker](https://github.com/Mihonarium/AI-political-spending-tracker)

## Project Structure

```
app/
  page.tsx              # Landing page with search bar
  lookup/page.tsx       # Results page (reps, races, PAC spending)
  about/page.tsx        # About / methodology / privacy
  api/
    lookup/route.ts     # Main API: Geocodio + FEC + PAC matching
    candidates/route.ts # FEC candidate search endpoint
    pac-check/route.ts  # Check PAC money for a specific candidate
    cron/               # (Legacy) FEC disbursement cron — replaced by tracker data

components/
  SearchBar.tsx         # Zip/address input
  RepCard.tsx           # Representative card with photo, contact info, badges
  PacBadge.tsx          # "AI PAC MONEY" badge with expandable spending details
  ElectionSection.tsx   # 2026 election races section
  CandidateList.tsx     # Candidate list with party badges and PAC info
  Header.tsx            # Sticky header with nav
  Footer.tsx            # Footer with attribution

lib/
  pac-matcher.ts        # Parses tracker data, matches candidates by name+state
  geocodio.ts           # Geocodio API client
  fec.ts                # FEC API client
  types.ts              # TypeScript interfaces
  cache.ts              # In-memory LRU cache with TTLs
  name-matcher.ts       # FEC name parsing ("LASTNAME, FIRSTNAME" format)

data/
  pac-tracker.json      # AI PAC spending data (from tracker repo, auto-updated)
  ai-pacs.json          # Static list of AI industry PAC committee IDs
  senate-class-2.json   # States with Senate seats up in 2026
  pac-recipients-cache.json  # (Legacy) empty — replaced by pac-tracker.json

scripts/
  update-pac-data.sh    # Manual script to pull latest tracker data

.github/workflows/
  update-pac-data.yml   # Daily GitHub Action to auto-update PAC data
```

## Environment Variables

Set these in `.env.local` for local development and in Vercel project settings for production:

| Variable | Description |
|---|---|
| `GEOCODIO_API_KEY` | [Geocodio](https://www.geocod.io/) API key (v1.7) |
| `FEC_API_KEY` | [FEC API](https://api.open.fec.gov/) key |
| `CRON_SECRET` | Secret for the legacy cron endpoint (optional) |

## Local Development

```bash
npm install
npm run dev
```

Open http://localhost:3000.

## PAC Data Pipeline

The AI PAC spending data comes from a separate private repository ([AI Political Spending Tracker](https://github.com/Mihonarium/AI-political-spending-tracker)) that scrapes FEC filings and state election commission data. The tracker's `data.json` is copied into this project as `data/pac-tracker.json`.

### How PAC matching works

1. On each API request, `lib/pac-matcher.ts` parses the tracker data into a lookup table keyed by `state:lastName`
2. Candidate nodes (type `"cand"`) provide state, district, amount, and support/oppose direction
3. Edge data maps which PAC (e.g., "Think Big", "Jobs & Democracy") spent how much on each candidate
4. Matching uses suffix-based name comparison to handle multi-part last names (e.g., "De La Cruz")
5. Candidates appearing in multiple networks (e.g., Bores in both LTF and PF) are combined into a single result
6. The result is cached in-memory for the lifetime of the serverless function

### Tracker data coverage (as of March 2026)

- **$14.9M** tracked across 28 candidates in 5 states (NY, IL, FL, TX, NC)
- **3 networks:** Leading the Future (a16z/OpenAI), Public First (Anthropic), Meta
- Covers both federal and state races, including independent expenditures (support and oppose)

### Updating PAC data

There are three ways to update the PAC data:

#### 1. Automatic (GitHub Action)

A GitHub Action (`.github/workflows/update-pac-data.yml`) runs **daily at 8am UTC**. It:
- Clones the private tracker repo using the `TRACKER_PAT` secret
- Compares `data.json` with the current `data/pac-tracker.json`
- If changed, commits and pushes to `main`, triggering a Vercel deploy

You can also trigger it manually from the **Actions** tab on GitHub.

**Required secret:** The repo needs a GitHub secret called `TRACKER_PAT` containing a **classic** Personal Access Token with `repo` scope. It must be a classic token (not fine-grained) because the tracker repo is owned by a different GitHub user (`Mihonarium`), and fine-grained tokens only work for repos you own. Create one at https://github.com/settings/tokens.

#### 2. Local script

```bash
./scripts/update-pac-data.sh
```

This clones the tracker repo, copies `data.json`, and tells you whether anything changed. You then commit and push manually.

#### 3. Manual copy

```bash
git clone https://github.com/Mihonarium/AI-political-spending-tracker.git /tmp/tracker
cp /tmp/tracker/data.json data/pac-tracker.json
git add data/pac-tracker.json
git commit -m "Update PAC tracker data"
git push
```

## Deployment

The site auto-deploys on Vercel when you push to `main` on GitHub.

- **GitHub repo:** https://github.com/big-other/know-your-reps
- **Vercel project:** https://know-your-reps.vercel.app
- **Vercel project ID:** `prj_eKSaBxaIRZFxkDXml0yYojpXgOXh`

Vercel environment variables (Geocodio key, FEC key) are set via the Vercel dashboard or CLI.

## Design System

- **Color palette:** Dark Warm `#2C231C`, Dark Mid `#3D3328`, Stone `#C9BFB0`, Linen `#EDE6DA`, Paper `#F6F2EB`, Saffron (election badge), Danger (PAC badge)
- **Fonts:** Instrument Serif (display/headlines), DM Sans (body/UI)
- **Animations:** Fade-in, slide-down, scale-in, stagger-children (defined in `app/globals.css`)

## TODO

- **Pledge tracking:** Integrate the Humans First "No Big AI Money" pledge into search results. When a candidate or incumbent has signed the pledge to not accept AI industry PAC money, display a badge or indicator on their RepCard. No one has signed the pledge yet, so this is future work — will need a data source (likely a simple JSON list or CMS) of pledge signers that gets checked during the lookup flow alongside PAC spending data.

## Legal

This is a nonpartisan informational tool. It does not endorse or oppose any candidate or party. All data comes from public sources (FEC filings, state election commissions, Geocodio). No user data (addresses, zip codes) is stored.
