# Claude Context for Know Your Reps

## Quick Reference

- **Live site:** https://know-your-reps.vercel.app
- **GitHub:** https://github.com/big-other/know-your-reps (auto-deploys to Vercel on push to main)
- **PAC tracker repo:** https://github.com/Mihonarium/AI-political-spending-tracker (private, user is a collaborator)
- **Organization:** Humans First (humansfirst.com) — "No Big AI Money Campaign"
- **Stack:** Next.js 16 App Router, TypeScript, Tailwind CSS v4, Vercel

## Key Architecture Decisions

### PAC data is bundled, not fetched at runtime
The tracker repo is private, so `data/pac-tracker.json` is committed directly into this repo. A GitHub Action updates it daily. Do NOT try to fetch from GitHub raw URLs — it will 404.

### PAC matching uses last name + state
`lib/pac-matcher.ts` matches candidates by normalized last name suffix + state abbreviation. It handles multi-part names ("De La Cruz") via suffix matching and strips "Jr."/"Sr." suffixes. Candidates appearing in multiple PAC networks are combined.

### Geocodio quirks
- `state_legislative_districts.house` and `.senate` can be arrays or single objects — always normalize to arrays
- `bio.photo_url` is the correct photo source (not theunitedstates.io which returns 410)
- The API returns 403 with "Invalid API key" if env vars have trailing whitespace/newlines

### Vercel deployment
- Environment variables are set in Vercel dashboard (GEOCODIO_API_KEY, FEC_API_KEY)
- When setting env vars via CLI, use `echo -n` to avoid trailing newlines
- Deployment protection was disabled for public access

## PAC Data Pipeline

### How it works
1. The [AI Political Spending Tracker](https://github.com/Mihonarium/AI-political-spending-tracker) scrapes FEC and state election commission data
2. Its `data.json` contains nodes (candidates, PACs, donors) and edges (money flows)
3. A GitHub Action (`.github/workflows/update-pac-data.yml`) runs daily at 8am UTC
4. It clones the tracker repo, compares data.json, and if changed commits + pushes to trigger Vercel deploy
5. The Action uses a `TRACKER_PAT` GitHub secret (classic PAT with `repo` scope, needed because tracker is under a different owner `Mihonarium`)

### Manual update
```bash
./scripts/update-pac-data.sh
```

### Tracker data structure (data/pac-tracker.json)
- `nodes` with `type: "cand"` are candidates — have `state`, `district`, `amt_raw`, `so` (S=support, O=oppose), `network`
- `edges` with `label_raw` show money flows from PAC → candidate
- `networks`: "ltf" (Leading the Future / a16z+OpenAI), "pf" (Public First / Anthropic), "ftf" (Meta)
- Some candidates appear in multiple networks (e.g., Bores in both ltf and pf with different node IDs but same state+district)

## Files That Matter

| File | What it does |
|---|---|
| `app/api/lookup/route.ts` | Main API — orchestrates Geocodio, FEC, and PAC matching |
| `lib/pac-matcher.ts` | Parses tracker JSON, builds lookup, matches by name+state |
| `lib/types.ts` | All TypeScript interfaces |
| `data/pac-tracker.json` | Bundled PAC spending data (auto-updated daily) |
| `components/PacBadge.tsx` | Expandable badge showing PAC contributions per candidate |
| `components/RepCard.tsx` | Representative card with photo, contact info, badges |
| `.github/workflows/update-pac-data.yml` | Daily PAC data update Action |
| `scripts/update-pac-data.sh` | Manual PAC data update script |

## Common Tasks

### Updating PAC data manually
```bash
./scripts/update-pac-data.sh
git add data/pac-tracker.json
git commit -m "Update PAC tracker data"
git push
```

### Adding new PAC networks or candidates
Update the tracker repo — the data flows automatically via the GitHub Action.

### Debugging PAC matching
The PAC check API can be tested directly:
```
/api/pac-check?name=Alex+Bores&state=NY
```

### Legacy code (can be removed)
- `app/api/cron/refresh-pac-data/route.ts` — old FEC disbursement cron job, replaced by tracker data
- `data/pac-recipients-cache.json` — always empty, no longer used
- `data/ai-pacs.json` — static PAC list, not used by current matching logic
- `vercel.json` — cron config for the old approach
