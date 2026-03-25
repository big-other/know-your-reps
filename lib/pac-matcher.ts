import type { PacContribution } from "./types";
import trackerDataRaw from "@/data/pac-tracker.json";

// Types for the tracker data.json
interface TrackerNode {
  id: string;
  label: string;
  type: string;
  amt_raw?: number;
  so?: string; // "S" = support, "O" = oppose
  network: string;
  state?: string;
  district?: string;
  committee_id?: string;
}

interface TrackerEdge {
  from: string;
  to: string;
  label_raw?: number;
}

interface TrackerNetwork {
  id: string;
  label: string;
}

interface TrackerData {
  networks: TrackerNetwork[];
  nodes: TrackerNode[];
  edges: TrackerEdge[];
}

interface PacMatch {
  contributions: PacContribution[];
  totalAmount: number;
}

export type PacLookup = Map<string, PacMatch> | null;

let cachedLookup: Map<string, PacMatch> | null = null;

function normalizeName(name: string): string {
  return name
    .toLowerCase()
    .replace(/\bjr\.?\b/gi, "")
    .replace(/\bsr\.?\b/gi, "")
    .replace(/\biii?\b/gi, "")
    .replace(/[^a-z\s]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function buildLookup(data: TrackerData): Map<string, PacMatch> {
  const nodeMap = new Map(data.nodes.map((n) => [n.id, n]));
  const networkMap = new Map(data.networks.map((n) => [n.id, n]));

  // Build reverse edge map: toNodeId -> edges with amounts
  const edgesByTarget = new Map<string, TrackerEdge[]>();
  for (const edge of data.edges) {
    if (!edge.label_raw) continue;
    const list = edgesByTarget.get(edge.to) || [];
    list.push(edge);
    edgesByTarget.set(edge.to, list);
  }

  // Group candidate spending by state:lastName
  const grouped = new Map<string, PacContribution[]>();

  const candidateNodes = data.nodes.filter(
    (n) => n.type === "cand" && n.state && n.amt_raw
  );

  for (const cand of candidateNodes) {
    const normalizedLabel = normalizeName(cand.label);
    const key = `${cand.state!.toLowerCase()}:${normalizedLabel}`;
    const network = networkMap.get(cand.network);
    const edges = edgesByTarget.get(cand.id) || [];
    const existing = grouped.get(key) || [];

    if (edges.length > 0) {
      for (const edge of edges) {
        const sourceNode = nodeMap.get(edge.from);
        if (!sourceNode) continue;
        existing.push({
          pac_name: sourceNode.label,
          parent_company: network?.label || cand.network,
          amount: edge.label_raw!,
          fec_id: sourceNode.committee_id || "",
          supportOppose: cand.so === "O" ? "oppose" : "support",
        });
      }
    } else {
      // Fallback: use node amount when no direct edge data
      existing.push({
        pac_name: network?.label || cand.network,
        parent_company: network?.label || cand.network,
        amount: cand.amt_raw!,
        fec_id: "",
        supportOppose: cand.so === "O" ? "oppose" : "support",
      });
    }

    grouped.set(key, existing);
  }

  // Build final lookup with totals
  const lookup = new Map<string, PacMatch>();
  for (const [key, contributions] of grouped) {
    const totalAmount = contributions.reduce((sum, c) => sum + c.amount, 0);
    lookup.set(key, { contributions, totalAmount });
  }

  return lookup;
}

export async function loadPacTrackerData(): Promise<PacLookup> {
  if (cachedLookup) return cachedLookup;

  try {
    cachedLookup = buildLookup(trackerDataRaw as unknown as TrackerData);
    return cachedLookup;
  } catch (err) {
    console.error("PAC tracker parse error:", err);
    return null;
  }
}

export function checkPacMoney(
  lookup: PacLookup,
  candidateName: string,
  state?: string
): { contributions: PacContribution[]; totalAmount: number } | null {
  if (!lookup || !state) return null;

  const normalizedState = state.toLowerCase();
  const parts = candidateName.trim().split(/\s+/);

  // Try matching from longest suffix to shortest
  // Handles multi-part last names like "De La Cruz"
  for (let i = 1; i <= parts.length; i++) {
    const suffix = normalizeName(parts.slice(-i).join(" "));
    if (!suffix) continue;
    const key = `${normalizedState}:${suffix}`;
    const match = lookup.get(key);
    if (match) return match;
  }

  return null;
}
